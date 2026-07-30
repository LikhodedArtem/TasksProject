""" Работа с информацией на web части """
import asyncio
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, HTTPException, status, Request, Depends

from codes import safe_route
from core.models import db_helper
from core.models.changes import *
from core.models.real_info import *
from crud import *
from help_functions import as_dict, get_client_id
from sse.managers import *

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
        client_id: UUID | None = Depends(get_client_id),
):
    return await Done.done(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
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
        client_id: UUID | None = Depends(get_client_id),
):
    return await Done.done_all(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
        client_id=client_id,
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
):
    return await Status.set(
        zn_number=zn_number,
        post=post,
        mechanic=mechanic,
        status=status,
    )


"""Изменить рекомендацию к заказ наряду"""

@info_router.post("/rec")
async def rec(
        zn_number: Annotated[str, Body()],
        rec: Annotated[str, Body()]
):
    return await Rec.set(
        zn_number=zn_number,
        rec=rec,
    )


class CreateAnswer:
    @staticmethod
    def _check(data, if_none: str | None = None) -> list:
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=if_none if if_none is not None else "Объект не найден"
            )
        else:
            if isinstance(data, list):
                return data
            else:
                return [data]

    @classmethod
    def _base_create(cls, data, func, if_none: str | None = None):
        data = cls._check(data, if_none)

        answer = []

        for obj in data:
            answer.append(func(obj))

        return answer

    @classmethod
    async def zns(cls, post: str):
        async with db_helper.session_factory() as session:
            data = await get_zns_by_post(
                session=session,
                post=post,
            )

        def parse(data):
            zn, date1, date2 = data

            dict_zn = as_dict(zn)
            dict_zn["car"] = as_dict(zn.car)
            dict_zn["date1"] = date1
            dict_zn["date2"] = date2

            return dict_zn

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одного заказ наряда по такому посту"
        )

    @classmethod
    async def zn(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            data = await get_zn_with_has_files(
                session=session,
                zn_number=zn_number,
            )

        def parse(data):
            zn, zn_has_files, rec_has_files = data

            dict_zn = as_dict(zn)
            dict_zn["car"] = as_dict(zn.car)
            dict_zn["zn_has_files"] = zn_has_files
            dict_zn["rec_has_files"] = rec_has_files

            return dict_zn

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одного заказ наряда под таким номером"
        )

    @classmethod
    async def jobs(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            data = await get_objects_with_has_files(
                session=session,
                model=Job,
                for_find={"is_alive": True, "zn_number": zn_number},
                for_files={"identical_str": Job.uuid}
            )

        def parse(data):
            job, has_files = data

            dict_job = as_dict(job)
            dict_job["has_files"] = has_files

            return dict_job

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одной работы под таким номером заказ наряда"
        )

    @classmethod
    async def parts(cls, zn_number: str):
        async with db_helper.session_factory() as session:
            data = await get_objects_with_has_files(
                session=session,
                model=Part,
                for_find={"is_alive": True, "zn_number": zn_number},
                for_files={"identical_str": Part.uuid}
            )

        def parse(data):
            part, has_files = data

            dict_part = as_dict(part)
            dict_part["has_files"] = has_files

            return dict_part

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одной запчасти под таким номером заказ наряда"
        )

    @classmethod
    async def posts(cls):
        async with db_helper.session_factory() as session:
            data = await find_objects(
                session=session,
                model=MainPost,
                is_alive=True,
            )

        def parse(post):
            return as_dict(post)

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одного поста"
        )

    @classmethod
    async def mechanics(cls):
        async with db_helper.session_factory() as session:
            data = await find_objects(
                session=session,
                model=Mechanic,
                is_alive=True,
            )

        def parse(mechanic):
            return as_dict(mechanic)

        return cls._base_create(
            data=data,
            func=parse,
            if_none="Не найдено ни одного механика"
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
            client_id: UUID | None = None,
    ):
        async with db_helper.session_factory() as session:
            await change_done(
                session=session,
                mechanic=mechanic,
                post=post,
                zn_number=zn_number,
                uuid=uuid,
                type=type,
                new_value=new_value
            )

        await third_page_manager.broadcast(
            data={"type": type, "uuid": uuid, "new_value": new_value},
            event="done",
            broadcast_event="zn",
            add_info=zn_number,
            id_="test",
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
            client_id: UUID | None = None,
    ):
        async def fetch_one(obj_uuid):
            async with db_helper.session_factory() as session:
                await change_done(
                    session=session,
                    mechanic=mechanic,
                    post=post,
                    zn_number=zn_number,
                    uuid=obj_uuid,
                    type=type,
                    new_value=new_value,
                )
        await asyncio.gather(*(fetch_one(obj_uuid) for obj_uuid in uuid))

        await third_page_manager.broadcast(
            data={"type": type, "new_value": new_value, "uuids": uuid},
            event="done_all",
            broadcast_event="zn",
            add_info=zn_number,
            id_="test",
            author=client_id,
        )


class Status:
    @staticmethod
    async def get(
            zn_number: str,
            post: str,
    ):
        async with db_helper.session_factory() as session:
            status = await find_objects(
                session=session,
                model=PostZNStatus,
                zn_number=zn_number,
                post=post,
            )

            if status is None:
                return "never"
            if isinstance(status, list):
                raise HTTPException(
                    status_code=500,
                    detail="Ошибка в работе кода"
                )
            return status.status

    @staticmethod
    async def set(
            zn_number: str,
            post: str,
            mechanic: str,
            status: str
    ):
        async with db_helper.session_factory() as session:
            find_status = await find_objects(
                session=session,
                model=PostZNStatus,
                zn_number=zn_number,
                post=post,
            )

        if find_status is None:
            new_status = PostZNStatus(
                zn_number=zn_number,
                post=post,
                mechanic=mechanic,
                status=status,
            )

            async with db_helper.session_factory() as session:
                await add_object(session, new_status)

        else:
            async with db_helper.session_factory() as session:
                await update_objects(
                    session=session,
                    model=PostZNStatus,
                    for_find={"post": post, "zn_number": zn_number},
                    for_update={"status": status, "mechanic": mechanic},
                )


class Rec:
    @staticmethod
    async def set(
            zn_number: str,
            rec: str,
    ):
        async with db_helper.session_factory() as session:
            await update_objects(
                session=session,
                model=ZN,
                for_find={"number": zn_number},
                for_update={"recommendation": rec},
            )