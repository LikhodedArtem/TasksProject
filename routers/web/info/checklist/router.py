from typing import Annotated

from fastapi import APIRouter, Body, BackgroundTasks

from dependencies import GetSession, GetClientID, GetChangeUUID

from .service import ChecklistService


checklist_router = APIRouter(prefix="/checklist", tags=["checklist"])

__all__ = ["checklist_router"]


@checklist_router.post("/get")
async def checklist(
        session: GetSession,

        zn_number: Annotated[str, Body(embed=True)],
):
    """Получить первоначальные данные для загрузки страницы с задачами"""
    service = ChecklistService(session)

    return await service.get(
        zn_number=zn_number,
    )