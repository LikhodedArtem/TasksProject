from typing import Annotated

from fastapi import APIRouter, Body, BackgroundTasks

from dependencies import GetSession, GetClientID, GetChangeUUID

from .service import DoneService


done_router = APIRouter(prefix="/done", tags=["done"])

__all__ = ["done_router"]


@done_router.post("")
async def done(
        session: GetSession,
        client_id: GetClientID,
        change_uuid: GetChangeUUID,
        background_tasks: BackgroundTasks,

        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuid: Annotated[str, Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[bool, Body()],
):
    """Установить сделано или не сделано на запчасть или работу заказ наряда"""
    service = DoneService(session, background_tasks)

    return await service.done(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
        change_uuid=change_uuid,
    )


@done_router.post("/all")
async def done_all(
        session: GetSession,
        client_id: GetClientID,
        change_uuid: GetChangeUUID,
        background_tasks: BackgroundTasks,

        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuid: Annotated[list[str], Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[bool, Body()],
):
    """Установить сделано или не сделано на все запчасти или все работы заказ наряда"""
    service = DoneService(session, background_tasks)

    return await service.done_all(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
        change_uuid=change_uuid,
    )