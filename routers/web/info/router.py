from typing import Annotated

from fastapi import APIRouter, Body, BackgroundTasks

from dependencies import GetClientID, GetSession, GetChangeUUID

from .service import InfoService
from .checklist import checklist_router
from .done import done_router
from .status import status_router
from .tasks import tasks_router


info_router = APIRouter(prefix="/info", tags=["info"])

info_router.include_router(checklist_router)
info_router.include_router(done_router)
info_router.include_router(status_router)
info_router.include_router(tasks_router)

__all__ = ["info_router"]


@info_router.post("/zns")
async def zns(
        session: GetSession,

        post: Annotated[str, Body(embed=True)],
):
    """Получить все действующие заказ наряды на посту по названию поста"""
    service = InfoService(session)
    return await service.zns(post)


@info_router.post("/zn")
async def zn(
        session: GetSession,

        zn_number: Annotated[str, Body(embed=True)],
):
    """Получить заказ наряд по его номеру"""
    service = InfoService(session)
    return await service.zn(zn_number)


@info_router.post("/jobs")
async def jobs(
        session: GetSession,

        zn_number: Annotated[str, Body(embed=True)],
):
    """Получить все действующие работы заказ наряда, зная его номер"""
    service = InfoService(session)
    return await service.jobs(zn_number)


@info_router.post("/parts")
async def parts(
        session: GetSession,

        zn_number: Annotated[str, Body(embed=True)],
):
    """Получить все действующие запчасти заказ наряда, зная его номер"""
    service = InfoService(session)
    return await service.parts(zn_number)


@info_router.get("/posts")
async def posts(session: GetSession):
    """Получить названия всех постов"""
    service = InfoService(session)
    return await service.posts()


@info_router.get("/mechanics")
async def mechanics(session: GetSession):
    """Получить всех механиков"""
    service = InfoService(session)
    return await service.mechanics()


@info_router.post("/rec")
async def rec(
        session: GetSession,
        client_id: GetClientID,
        change_uuid: GetChangeUUID,
        background_tasks: BackgroundTasks,

        zn_number: Annotated[str, Body()],
        rec: Annotated[str, Body()],
):
    """Изменить рекомендацию к заказ-наряду"""
    service = InfoService(session, background_tasks)
    return await service.rec_set(
        rec=rec,
        sse_uuid=client_id,
        zn_number=zn_number,
        change_uuid=change_uuid,
    )