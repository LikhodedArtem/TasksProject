"""Обработка XML со стороны 1C"""
from fastapi import APIRouter, BackgroundTasks
from core import Names
from sse import first_page_manager, third_page_manager

from dependencies import GetSession

from .service import OnecService
from .dependencies import GetXMLString
from .schemas import OnecResponse


onec_router = APIRouter(prefix="/onec", tags=["onec"])

__all__ = ["onec_router"]

@onec_router.post("/zn")
async def zn(
        xml_string: GetXMLString,
        session: GetSession,
        background_tasks: BackgroundTasks,

):
    """Обработка заказ наряда"""
    service = OnecService(session)

    response, zn_number = await service.parse_zn(xml_string)

    async def broadcast_zn():
        for event, info in response.items():
            last_uuid, data = info

            if not data: continue

            await third_page_manager.broadcast(
                data=data,
                event=event,
                broadcast_event="zn",
                add_info=zn_number,
                id_=last_uuid if last_uuid != Names.MIN_UUID7 else "skip",
            )

    background_tasks.add_task(broadcast_zn)

    return OnecResponse(
        change_uuid=max(*{change_uuid for change_uuid, _ in response.values()}),
    ).model_dump_json()


@onec_router.post("/mechanics")
async def mechanics(
        xml_string: GetXMLString,
        session: GetSession,
        background_tasks: BackgroundTasks,

):
    """Обработка списка всех механиков"""
    service = OnecService(session)

    change_uuid, data = await service.parse_mechanics(xml_string)

    background_tasks.add_task(
        first_page_manager.broadcast,
        data=data,
        event="mechanics",
        broadcast_event=None,
        add_info=None,
        id_=change_uuid,
        broadcast_all=True,
    )

    return OnecResponse(
        change_uuid=change_uuid,
    )


@onec_router.post("/posts")
async def posts(
        xml_string: GetXMLString,
        session: GetSession,
        background_tasks: BackgroundTasks,
):
    """Обработка списка всех названий постов"""
    service = OnecService(session)

    change_uuid, data = await service.parse_mechanics(xml_string)

    background_tasks.add_task(
        first_page_manager.broadcast,
        data=data,
        event="posts",
        broadcast_event=None,
        add_info=None,
        id_=change_uuid,
        broadcast_all=True,
    )

    return OnecResponse(
        change_uuid=change_uuid,
    ).model_dump_json()