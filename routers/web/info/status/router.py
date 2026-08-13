from typing import Annotated

from fastapi import APIRouter, Body, BackgroundTasks

from dependencies import GetSession, GetClientID, GetChangeUUID

from .service import StatusService


status_router = APIRouter(prefix="/status", tags=["status"])

__all__ = ["status_router"]


@status_router.post("/get")
async def status_get(
        session: GetSession,

        zn_number: Annotated[str, Body()],
        post: Annotated[str, Body()],
):
    """
    Установить статус у поста к заказ-наряду.
    Установка по номеру заказ наряда, механику и посту.
    """
    service = StatusService(session)

    return await service.get(
        zn_number=zn_number,
        post=post,
    )


@status_router.post("/set")
async def status_set(
        session: GetSession,
        client_id: GetClientID,
        change_uuid: GetChangeUUID,
        background_tasks: BackgroundTasks,

        zn_number: Annotated[str, Body()],
        post: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
        status: Annotated[str, Body()],
):
    """
    Получить текущее состояние работы у определённого поста к заказ-наряду.
    Если пост ни разу не устанавливал статус, то будет возращено 'never'.
    """
    service = StatusService(session, background_tasks)

    return await service.set(
        zn_number=zn_number,
        post=post,
        mechanic=mechanic,
        status=status,
        client_id=client_id,
        change_uuid=change_uuid,
    )