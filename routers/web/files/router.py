"""Работа с файлами"""


from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Form, UploadFile, File as FastFile, Depends, BackgroundTasks

from dependencies import GetClientID, GetChangeUUID, GetSession

from .service import FileService


files_router = APIRouter(prefix="/files", tags=["files"])


__all__ = ["files_router"]

@files_router.post("/create")
async def create(
    change_uuid: GetChangeUUID,
    client_id: GetClientID,
    session: GetSession,
    background_tasks: BackgroundTasks,

    zn_number: str = Form(...),
    type: str = Form(...),
    identical_str: str | None = Form(...),
    files: list[UploadFile] = FastFile(...),
    mechanic: str = Form(...),
    post: str = Form(...),
):
    """
    Сохранить файлы для элементов заказ наряда.
    Возвращает uuid'ы под которыми были сохранены файлы.
    """
    service = FileService(session, background_tasks)

    return await service.create(
        zn_number=zn_number,
        type=type,
        identical_str=identical_str,
        files=files,
        mechanic=mechanic,
        post=post,
        client_id=client_id,
        change_uuid=change_uuid,
    )

@files_router.post("/get")
async def get(
        session: GetSession,

        zn_number: Annotated[str, Body()],
        type: Annotated[str | None, Body()] = None,
        identical_str: Annotated[str | None, Body()] = None,
):
    """
    Получить файлы по отличающей строке для хранения.
    """
    service = FileService(session)

    return await service.get(
        zn_number=zn_number,
        type=type,
        identical_str=identical_str,
    )


@files_router.post("/download")
async def download(
        session: GetSession,

        uuids: Annotated[list[UUID], Body(embed=True)],
):
    """
    Скачать любые файлы по их uuid'ам
    """
    service = FileService(session)

    return await service.download(
        uuids=uuids
    )


@files_router.post("/delete")
async def kill(
        change_uuid: GetChangeUUID,
        client_id: GetClientID,
        session: GetSession,
        background_tasks: BackgroundTasks,

        uuids: Annotated[list[UUID], Body()],
        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
):
    """
    Установить любые файлы в неактивное состояние по uuid.
    Необходимы post и mechanic для log'ов
    """
    service = FileService(session, background_tasks)

    return await service.kill(
        uuids=uuids,
        mechanic=mechanic,
        post=post,
        client_id=client_id,
        change_uuid=change_uuid,
    )