""" Работа с информацией на web части """


import asyncio
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Body, Depends

from codes import safe_route
from core.models import db_helper
from core.models.real_info import *
from crud import *
from help_functions import get_client_id, get_change_uuid
from sse.managers import *

from changes import CreateChange
from uuid7_generator import uuid7_generator

info_router = APIRouter(prefix="/info", tags=["info"])


__all__ = ["info_router"]


"""Получить все действующие заказ наряды на посту по названию поста"""

@info_router.post("/zns")
@safe_route("Get zns")
async def zns(
        post: Annotated[str, Body(embed=True)],
):
    return await CreateAnswer.zns(post)


"""Получить заказ наряд по его номеру"""

@info_router.post("/zn")
@safe_route("Get zn")
async def zn(
        zn_number: Annotated[str, Body(embed=True)],
):
    return await CreateAnswer.zn(zn_number)


"""Получить все действующие работы заказ наряда, зная его номер"""

@info_router.post("/jobs")
@safe_route("Get jobs")
async def jobs(
        zn_number: Annotated[str, Body(embed=True)],
):
    return await CreateAnswer.jobs(zn_number)


"""Получить все действующие запчасти заказ наряда, зная его номер"""

@info_router.post("/parts")
@safe_route("Get parts")
async def parts(
        zn_number: Annotated[str, Body(embed=True)],
):
    return await CreateAnswer.parts(zn_number)


"""Получить названия всех постов"""

@info_router.get("/posts")
@safe_route("Get posts")
async def posts():
    return await CreateAnswer.posts()


"""Получить всех механиков"""

@info_router.get("/mechanics")
@safe_route("Get mechanics")
async def mechanics():
    return await CreateAnswer.mechanics()


"""Установить сделано или не сделано на запчасть или работу заказ наряда"""

@info_router.post("/done")
@safe_route("Set done")
async def done(
        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuid: Annotated[str, Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[bool, Body()],
        client_id: UUID = Depends(get_client_id),
        change_uuid: UUID = Depends(get_change_uuid),
):
    return await Done.done(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
        change_uuid=change_uuid,
    )

"""Установить сделано или не сделано на все запчасти или все работы заказ наряда"""

@info_router.post("/done/all")
@safe_route("Set done all")
async def done_all(
        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuid: Annotated[list[str], Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[bool, Body()],
        client_id: UUID = Depends(get_client_id),
        change_uuid: UUID = Depends(get_change_uuid),
):
    return await Done.done_all(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
        change_uuid=change_uuid,
    )


"""
Установить статус у поста к заказ наряду.
Установка по номеру заказ наряда, механику и посту.
"""

@info_router.post("/status/get")
async def status_get(
        zn_number: Annotated[str, Body()],
        post: Annotated[str, Body()],
):
    return await Status.get(
        zn_number=zn_number,
        post=post,
    )


"""
Получить текущее состояние работы у определённого поста к заказ наряду.
Если пост ни разу не устанавливал статус, то будет возращено 'never'.
"""

@info_router.post("/status/set")
async def status_set(
        zn_number: Annotated[str, Body()],
        post: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
        status: Annotated[str, Body()],
        client_id: UUID = Depends(get_client_id),
        change_uuid: UUID = Depends(get_change_uuid),
):
    return await Status.set(
        zn_number=zn_number,
        post=post,
        mechanic=mechanic,
        status=status,
        client_id=client_id,
        change_uuid=change_uuid,
    )


"""Изменить рекомендацию к заказ наряду"""

@info_router.post("/rec")
async def rec(
        zn_number: Annotated[str, Body()],
        rec: Annotated[str, Body()],
        client_id: UUID = Depends(get_client_id),
        change_uuid: UUID = Depends(get_change_uuid),
):
    return await Rec.set(
        rec=rec,
        sse_uuid=client_id,
        zn_number=zn_number,
        change_uuid=change_uuid,
    )


@info_router.post("/tasks/create")
async def create_task(
        to_name: Annotated[str, Body()],
        value: Annotated[str, Body()],
        post: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        vin: Annotated[str, Body()],
        client_id: UUID = Depends(get_client_id),
        change_uuid: UUID = Depends(get_change_uuid),
):
    await Tasks.create(
        to_name=to_name,
        value=value,
        post=post,
        mechanic=mechanic,
        zn_number=zn_number,
        vin=vin,
    )


@info_router.post("/tasks/get")
async def tasks_get(
        to_name: Annotated[str, Body(embed=True)],
):
    return await Tasks.get(
        to_name=to_name,
    )


class CreateAnswer:
    @classmethod
    async def zns(cls, post: str):
        async with db_helper.session_factory() as session:
            return await get_zns_by_post(
                session=session,
                post=post,
            )

    @classmethod
    async def zn(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            return await get_zn(
                session=session,
                zn_number=zn_number,
            )

    @classmethod
    async def jobs(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            return await get_zn_jobs(
                session=session,
                zn_number=zn_number,
            )

    @classmethod
    async def parts(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            return await get_zn_parts(
                session=session,
                zn_number=zn_number,
            )

    @classmethod
    async def posts(cls):
        async with db_helper.session_factory() as session:
            return await get_posts(
                session=session,
            )

    @classmethod
    async def mechanics(cls):
        async with db_helper.session_factory() as session:
            return await get_mechanics(
                session=session,
            )


class Done:
    @staticmethod
    async def done(
            mechanic: str,
            post: str,
            zn_number: str,
            uuid: str,
            type: str,
            new_value: bool,
            client_id: UUID,
            change_uuid: UUID,
    ):
        async with db_helper.session_factory() as session:
            await change_done(
                session=session,
                mechanic=mechanic,
                post=post,
                uuid=uuid,
                type=type,
                new_value=new_value,
                client_id=client_id,
                change_uuid=change_uuid,
            )

        await third_page_manager.broadcast(
            data={"type": type, "uuid": uuid, "new_value": new_value},
            event="done",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )

    @staticmethod
    async def done_all(
            uuid: list[str],
            mechanic: str,
            post: str,
            type: str,
            zn_number: str,
            new_value: bool,
            client_id: UUID,
            change_uuid: UUID,
    ):
        change_uuid_gen = uuid7_generator(change_uuid)

        async def fetch_one(obj_uuid):
            nonlocal change_uuid_gen

            async with db_helper.session_factory() as session:
                await change_done(
                    session=session,
                    mechanic=mechanic,
                    post=post,
                    uuid=obj_uuid,
                    type=type,
                    new_value=new_value,
                    client_id=client_id,
                    change_uuid=next(change_uuid_gen),
                )

        await asyncio.gather(*(fetch_one(obj_uuid) for obj_uuid in uuid))

        await third_page_manager.broadcast(
            data={"type": type, "new_value": new_value, "uuids": uuid},
            event="done_all",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )


class Status:
    @staticmethod
    async def get(
            zn_number: str,
            post: str,
    ):
        async with db_helper.session_factory() as session:
            return await get_zn_status(
                session=session,
                zn_number=zn_number,
                post=post,
            )

    @staticmethod
    async def set(
            zn_number: str,
            post: str,
            mechanic: str,
            status: str,
            change_uuid: UUID,
            client_id: UUID,
    ):
        async with db_helper.session_factory() as session:
            find_status = await find_objects(
                session=session,
                model=PostZNStatus,
                zn_number=zn_number,
                post=post,
            )
            
        change = CreateChange.status(
            change_uuid=change_uuid,
            sse_uuid=client_id,
            zn_number=zn_number,
            post=post,
            mechanic=mechanic,
            status=status,
        )

        if find_status is None:
            new_status = PostZNStatus(
                zn_number=zn_number,
                post=post,
                mechanic=mechanic,
                status=status,
            )

            async with db_helper.session_factory() as session:
                async with session.begin():
                    session.add(new_status)
                    session.add(change)
                await session.commit()

        else:
            async with db_helper.session_factory() as session:
                await update_objects(
                    session=session,
                    model=PostZNStatus,
                    for_find={"post": post, "zn_number": zn_number},
                    for_update={"status": status, "mechanic": mechanic},
                    for_add=[change],
                )

        await third_page_manager.broadcast(
            data={"status": status, "post_name": post},
            event="status",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )


class Rec:
    @staticmethod
    async def set(
            zn_number: str,
            rec: str,
            change_uuid: UUID,
            sse_uuid: UUID,
    ):
        async with db_helper.session_factory() as session:
            current_zn: ZN = await find_objects(
                session=session,
                model=ZN,
            )

        if (current_zn.recommendation is not None
            and len(current_zn.recommendation) >= len(rec)): return

        change = CreateChange.rec(
            zn_number=zn_number,
            recommendation=rec,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
        )
        
        async with db_helper.session_factory() as session:
            await update_objects(
                session=session,
                model=ZN,
                for_find={"number": zn_number},
                for_update={"recommendation": rec},
                for_add=[change]
            )

        await third_page_manager.broadcast(
            data={"rec": rec},
            event="rec",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=sse_uuid,
        )


class Tasks:
    @staticmethod
    async def create(
            to_name: str,
            value: str,
            post: str,
            mechanic: str,
            zn_number: str,
            vin: str,
    ):
        task = Task(
            uuid=uuid4(),
            to_name=to_name,
            value=value,
            post=post,
            mechanic=mechanic,
            zn_number=zn_number,
            vin=vin,
        )

        async with db_helper.session_factory() as session:
            await add_objects(
                session=session,
                objects=task,
            )


    @staticmethod
    async def get(
            to_name: str,
    ):
        async with db_helper.session_factory() as session:
            return {
                "data": await get_tasks(
                    session=session,
                    to_name=to_name,
                ),
                "change_uuid": None,
            }
