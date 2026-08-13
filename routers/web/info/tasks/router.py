from typing import Annotated

from fastapi import APIRouter, Body, BackgroundTasks

from dependencies import GetSession, GetClientID, GetChangeUUID

from .service import TasksService


tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])

__all__ = ["tasks_router"]


@tasks_router.post("/get")
async def get_tasks(
        session: GetSession,

        to_name: Annotated[str, Body(embed=True)],
):
    """Получить все задачи, которые записаны на определённое имя"""
    service = TasksService(session)

    return await service.get(
        to_name=to_name,
    )


@tasks_router.post("/create")
async def create_task(
        session: GetSession,
        client_id: GetClientID,
        change_uuid: GetChangeUUID,
        background_tasks: BackgroundTasks,

        to_name: Annotated[str, Body()],
        value: Annotated[str, Body()],
        post: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        vin: Annotated[str, Body()],
):
    """Создать новую задачу на определённое имя"""
    service = TasksService(session, background_tasks)

    await service.create(
        to_name=to_name,
        value=value,
        post=post,
        mechanic=mechanic,
        zn_number=zn_number,
        vin=vin,
        client_id=client_id,
        change_uuid=change_uuid,
    )