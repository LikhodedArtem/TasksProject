"""Подписка на различные обновления данных на каждой странице."""
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException, Depends

from help_functions import get_client_id
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


@sse_router.get("/connect/{type}")
async def get_sse_events(
        request: Request,
        type: ManagerType,
        client_id: UUID | None = Depends(get_client_id)
):
    manager = managers.get(type, None)

    if manager is None:
        raise HTTPException(status_code=404, detail="This type of manager does not exist")

    manager.subscribe(client_id)

    subscriptions[client_id] = manager

    return manager.streaming_response(request, client_id)


@sse_router.put("/unsubscribe")
async def unsubscribe(client_id: UUID | None = Depends(get_client_id)):
    manager = get_manager(client_id)

    manager.unsubscribe(client_id)


@sse_router.post("/subscribe/events")
async def subscribe_events(
        request: Request,
        client_id: UUID | None = Depends(get_client_id),
):
    manager = get_manager(client_id)

    params: dict[str, None | str | list[str]] = await request.json()

    if params:
        for event, add_info in params.items():
            if isinstance(add_info, list):
                for item in add_info:
                    manager.subscribe_event(client_id, event, item)
                continue

            manager.subscribe_event(client_id, event, add_info)


@sse_router.post("/unsubscribe/events")
async def unsubscribe_events(
        request: Request,
        client_id: UUID | None = Depends(get_client_id),
):
    manager = get_manager(client_id)

    params: dict[str, None | str | list[str]] = await request.json()

    if params:
        for event, add_info in params.items():
            if isinstance(add_info, list):
                for item in add_info:
                    manager.unsubscribe_event(client_id, event, item)
                continue

            manager.unsubscribe_event(client_id, event, add_info)