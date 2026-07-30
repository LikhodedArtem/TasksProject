"""Подписка на различные обновления данных на каждой странице."""
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException

from sse.managers import *
from sse.manager import SSEManager

sse_router = APIRouter(prefix="/sse", tags=["sse"])


__all__ = ["sse_router"]

class ManagerType(str, Enum):
    FIRST_PAGE = "first_page"
    SECOND_PAGE = "second_page"
    THIRD_PAGE = "third_page"

managers: dict[str, SSEManager] = {
    ManagerType.FIRST_PAGE: first_page_manager,
    ManagerType.SECOND_PAGE: second_page_manager,
    ManagerType.THIRD_PAGE: third_page_manager,
}

subscriptions: dict[UUID, SSEManager] = {}

def get_manager(uuid: UUID) -> SSEManager:
    manager = subscriptions.get(uuid, None)

    if manager is None:
        raise HTTPException(status_code=404, detail="Unexpected UUID")

    return manager


@sse_router.get("/connect/{type}/{uuid}")
async def get_sse_events(request: Request, type: ManagerType, uuid: UUID):
    manager = managers.get(type, None)

    if manager is None:
        raise HTTPException(status_code=404, detail="This type of manager does not exist")

    manager.subscribe(uuid)

    subscriptions[uuid] = manager

    return manager.streaming_response(request, uuid)


# @sse_router.post("/subscribe/{type}/{uuid}")
# async def subscribe(request: Request, type: ManagerType, uuid: UUID):
#     manager = managers.get(type, None)
#
#     if manager is None:
#         raise HTTPException(status_code=404, detail="This type of manager does not exist")
#
#     manager.subscribe(uuid)
#
#     params: dict[str, str] = dict(request.query_params)
#
#     if params:
#         for key, value in params.items():
#             manager.subscribe_event(uuid, key, value if value != "None" else None)
#
#     subscriptions[uuid] = manager
#
#     return uuid


@sse_router.put("/unsubscribe/{uuid}")
async def unsubscribe(uuid: UUID):
    manager = get_manager(uuid)

    manager.unsubscribe(uuid)


@sse_router.put("/subscribe/events/{uuid}")
async def subscribe_event(request: Request, uuid: UUID):
    manager = get_manager(uuid)

    params: dict[str, str] = dict(request.query_params)

    if params:
        for key, value in params.items():
            manager.subscribe_event(uuid, key, value if value != "None" else None)


@sse_router.put("/unsubscribe/events/{uuid}")
async def unsubscribe_event(request: Request, uuid: UUID):
    manager = get_manager(uuid)

    params: dict[str, str] = dict(request.query_params)

    if params:
        for key, value in params.items():
            manager.unsubscribe_event(uuid, key, value if value != "None" else None)