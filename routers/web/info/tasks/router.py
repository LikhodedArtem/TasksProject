from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Body, BackgroundTasks, Form, UploadFile, File

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

        uuid: Annotated[UUID, Form(...)],
        to_name: Annotated[str, Form(...)],
        value: Annotated[str, Form(...)],
        post: Annotated[str, Form(...)],
        mechanic: Annotated[str, Form(...)],
        zn_number: Annotated[str, Form(...)],
        vin: Annotated[str, Form(...)],
        files: Optional[list[UploadFile]] = File(default=None),
):
    """Создать новую задачу на определённое имя"""
    service = TasksService(session, background_tasks)

    await service.create(
        uuid=uuid,
        files=files,
        to_name=to_name,
        value=value,
        post=post,
        mechanic=mechanic,
        zn_number=zn_number,
        vin=vin,
        client_id=client_id,
        change_uuid=change_uuid,
    )