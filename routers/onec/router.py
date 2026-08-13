"""Обработка XML со стороны 1C"""
from fastapi import APIRouter, Request, BackgroundTasks
from codes import safe_route
from core import Names
from sse.managers import first_page_manager, third_page_manager

from dependencies import GetSession

from .service import OnecService
from .dependencies import GetXMLString
from .schemas import OnecResponse


onec_router = APIRouter(prefix="/onec", tags=["onec"])

__all__ = ["onec_router"]

@onec_router.post("/zn", response_model=OnecResponse)
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
        last_change_uuid=max(*{last_change_uuid for last_change_uuid, _ in response.values()}),
    ).model_dump_json()


async def broadcast_posts_mechanics(type: str, last_change_uuid, data):
    await first_page_manager.broadcast(
        data=data,
        event=type,
        broadcast_event=None,
        add_info=None,
        id_=last_change_uuid,
        broadcast_all=True,
    )


@onec_router.post("/mechanics", response_model=OnecResponse)
async def mechanics(
        xml_string: GetXMLString,
        session: GetSession,
        background_tasks: BackgroundTasks,

):
    """Обработка списка всех механиков"""
    service = OnecService(session)

    last_change_uuid, data = await service.parse_mechanics(xml_string)

    background_tasks.add_task(broadcast_posts_mechanics, "mechanics", last_change_uuid, data)

    return OnecResponse(
        last_change_uuid=last_change_uuid,
    )


@onec_router.post("/posts", response_model=OnecResponse)
async def posts(
        xml_string: GetXMLString,
        session: GetSession,
        background_tasks: BackgroundTasks,
):
    """Обработка списка всех названий постов"""
    service = OnecService(session)

    last_change_uuid, data = await service.parse_mechanics(xml_string)

    background_tasks.add_task(broadcast_posts_mechanics, "posts", last_change_uuid, data)

    return OnecResponse(
        last_change_uuid=last_change_uuid,
    ).model_dump_json()