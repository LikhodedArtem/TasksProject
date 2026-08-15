"""Подписка на различные обновления данных на каждой странице."""
import json
from enum import Enum
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException, Body

from dependencies import GetClientID, GetSession
from sse import *
from sse.manager import SSEManager

from recover import Recover


sse_router = APIRouter(prefix="/sse", tags=["sse"])


__all__ = ["sse_router"]

class ManagerType(str, Enum):
    FIRST_PAGE = "first_page"
    SECOND_PAGE = "second_page"
    THIRD_PAGE = "third_page"

data_dict: dict[str, tuple[SSEManager, Any]] = {
    ManagerType.FIRST_PAGE: (first_page_manager, Recover.first),
    ManagerType.SECOND_PAGE: (second_page_manager, Recover.second),
    ManagerType.THIRD_PAGE: (third_page_manager, Recover.third),
}

subscriptions: dict[UUID, tuple[SSEManager, Any]] = {}


def get_data(type: ManagerType) -> tuple[SSEManager, Any]:
    data = data_dict.get(type, None)

    if data is None:
        raise HTTPException(status_code=404, detail="Unexpected type")

    return data


def get_manager(uuid: UUID) -> Any:
    data = subscriptions.get(uuid, None)

    if data is None:
        raise HTTPException(status_code=404, detail="Unexpected uuid")

    return data[0]


def get_recover(uuid: UUID) -> Any:
    data = subscriptions.get(uuid, None)

    if data is None:
        raise HTTPException(status_code=404, detail="Unexpected uuid")

    return data[1]


@sse_router.post("/recover")
async def recover(
        client_id: GetClientID,
        session: GetSession,

        request: Request,
        add_data: Annotated[dict[str, Any] | None, Body(embed=True)] = None,
):
    recover = get_recover(client_id)

    last_event_id = request.headers.get("Last-Event-IDs")
    change_uuids = json.loads(last_event_id) if last_event_id != "null" and last_event_id is not None else None

    return await recover(session, change_uuids, client_id, add_data)


@sse_router.post("/connect")
async def connect(
        client_id: GetClientID,

        request: Request,
        type: Annotated[str, Body(embed=True)],
):
    data = get_data(ManagerType(type))

    subscriptions[client_id] = data
    manager = data[0]

    manager.subscribe(client_id)

    return manager.streaming_response(request, client_id)


@sse_router.post("/unsubscribe")
async def unsubscribe(client_id: GetClientID):
    manager = get_manager(client_id)

    manager.unsubscribe(client_id)


@sse_router.post("/subscribe/events")
async def subscribe_events(
        client_id: GetClientID,

        request: Request,
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
        client_id: GetClientID,

        request: Request,
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