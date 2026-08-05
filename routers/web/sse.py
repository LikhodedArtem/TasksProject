"""Подписка на различные обновления данных на каждой странице."""
import json
from enum import Enum
from typing import Awaitable, Callable, Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException, Depends, Body

from help_functions import get_client_id
from sse.managers import *
from sse.manager import SSEManager

from recover import Recover


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

recover_data = {
    ManagerType.FIRST_PAGE: Recover.first,
    ManagerType.SECOND_PAGE: Recover.second,
    ManagerType.THIRD_PAGE: Recover.third,
}


def get_manager(uuid: UUID) -> SSEManager:
    manager = subscriptions.get(uuid, None)

    if manager is None:
        raise HTTPException(status_code=404, detail="Unexpected UUID")

    return manager


def get_recover(type: ManagerType):
    recover = recover_data.get(type, None)

    if recover is None:
        raise HTTPException(status_code=404, detail="Unexpected type")

    return recover


@sse_router.post("/subscribe")
async def subscribe(
        request: Request,
        type: Annotated[str, Body()],
        client_id: UUID = Depends(get_client_id),
        add_data: Annotated[dict[str, Any] | None, Body()] = None,
):
    manager = managers.get(type, None)

    if manager is None:
        raise HTTPException(status_code=404, detail="This type of manager does not exist")

    manager.subscribe(client_id)

    subscriptions[client_id] = manager

    last_event_id = request.headers.get("Last-Event-IDs")
    last_change_uuids = json.loads(last_event_id) if last_event_id != "null" and last_event_id is not None else None

    recover = get_recover(ManagerType(type))

    return await recover(last_change_uuids, client_id, add_data)


@sse_router.get("/connect")
async def get_sse_events(
        request: Request,
        client_id: UUID = Depends(get_client_id)
):
    manager = get_manager(client_id)

    return manager.streaming_response(request, client_id)


@sse_router.post("/unsubscribe")
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