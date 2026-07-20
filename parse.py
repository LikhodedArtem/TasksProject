import asyncio
import hashlib
import xml.etree.ElementTree as ET
from collections import defaultdict
from copy import deepcopy
from dataclasses import dataclass
from enum import Enum, auto
from pprint import pprint
from threading import Thread
from typing import Optional, Callable, Awaitable, Literal
from uuid import UUID

from crud import *
from core.models.db_helper import db_helper


class UpdateType(Enum):
    CREATE = auto()
    UPDATE = auto()
    DELETE = auto()


async def parse_zn(xml_string: str):
    root = ET.fromstring(xml_string)

    zn = root.find('zn')

    zn_number = zn.find("zn_number").text

    async with db_helper.session_factory() as session:
        new_stage = await get_current_zn_stage(session, zn_number) + 1

    zn_lst = [
        ZN(
            number=zn_number,
            date=zn.find("zn_date").text.replace("\xa0", ""),
            reason=zn.find("reason_for_contacting").text,
            recommendation=zn.find("recommendation").text if zn.find("recommendation") is not None else "",
            assistant=zn.find("assistant_m").text,
            manager=zn.find("manager").text,
            stage=new_stage,
        )
    ]

    car = zn.find("car")
    car_lst = [
        Car(
            zn_number=zn_number,
            win=car.find("win").text,
            reg=car.find("reg").text if car.find("reg") is not None else None,
            model=car.find("model").text,
            year=int(car.find("year").text),
            millage=int(car.find("millage").text.replace("\xa0", "")),
            stage=new_stage,
        )
    ]

    post_repair = zn.find("post_repair")
    post_lst = []
    relation_lst = []
    for post in post_repair.findall('post'):
        post_uuid = post.find("uuid").text

        post_obj = Post(
            uuid=post.find("uuid").text,
            main_post_name=post.find("post_name").text,
            date1=post.find("date1").text.replace("\xa0", ""),
            date2=post.find("date2").text.replace("\xa0", ""),
            stage=new_stage
        )

        relation_obj = ZN_mtm_Post(
            post_uuid=post_uuid,
            zn_number=zn_number,
            stage=new_stage,
        )

        post_lst.append(post_obj)
        relation_lst.append(relation_obj)

    working = zn.find("working")
    job_lst = []
    for job in working.findall('job'):
        job_obj = Job(
            uuid=job.find("uuid").text,
            zn_number=zn_number,
            number=int(job.find("count_job").text),
            name=job.find("job_name").text,
            normal_time=float(job.find("normal_time").text.replace(",", ".")),
            stage=new_stage,
        )

        job_lst.append(job_obj)

    repair_parts = zn.find("repair_parts")
    parts_lst = []
    for part in repair_parts.findall('parts'):
        part_obj = Part(
            uuid=part.find("uuid").text,
            zn_number=zn_number,
            name=part.find("parts_name").text,
            manufacturer_code=part.find("manufacturer_code").text,
            manufacturer=part.find("manufacturer").text,
            quantity=float(part.find("quantity").text.replace(",", ".")),
            units=part.find("units").text,
            stage=new_stage,
        )

        parts_lst.append(part_obj)

    operations_lst: list[Operation] = []

    operations_lst += await refresh_objects(
        zn_lst,
        ZN,
        False
    )
    operations_lst += await refresh_objects(
        car_lst,
        Car,
        False
    )
    operations_lst += await refresh_objects(
        post_lst,
        Post,
        False
    )
    operations_lst += await refresh_objects(
        job_lst,
        Job,
        True,
        zn_number
    )
    operations_lst += await refresh_objects(
        parts_lst,
        Part,
        True,
        zn_number
    )
    operations_lst += await refresh_objects(
        relation_lst,
        ZN_mtm_Post,
        True,
        zn_number
    )

    return operations_lst

async def parse_mechanics(xml_string: str):
    root = ET.fromstring(xml_string)

    mechanics = root.find('mechanics')

    async with db_helper.session_factory() as session:
        new_stage = await get_current_mechanics_stage(session) + 1

    mechanic_lst = []
    for mechanic in mechanics.findall('mechanic'):
        mechanic_obj = Mechanic(
            key=mechanic.find('key').text,
            name=mechanic.find('name').text,
            stage=new_stage,
        )
        mechanic_lst.append(mechanic_obj)

    operations_lst: list[Operation] = []

    operations_lst += await refresh_objects(
        mechanic_lst,
        Mechanic,
        True
    )

    return operations_lst

async def parse_main_posts(xml_string: str):
    root = ET.fromstring(xml_string)

    async with db_helper.session_factory() as session:
        new_stage = await get_current_main_posts_stage(session) + 1

    post_lst = []
    for post in root.findall('post'):
        post_obj = MainPost(
            name=post.find("post_name").text,
            territory=post.find("territory").text,
            stage=new_stage,
        )

        post_lst.append(post_obj)

    operations_lst: list[Operation] = []

    operations_lst = await refresh_objects(
        data=post_lst,
        model=MainPost,
        delete_old=True,
    )

    return operations_lst


def as_dict(obj) -> dict[str, Any]:
    keys = obj.for_find() + obj.for_value()
    if hasattr(obj, 'done'):
        keys.append("done")

    return {key: getattr(obj, key) for key in keys}


@dataclass
class Operation:
    model_name: str
    operation: Literal["create", "update", "delete"]
    data: dict[str, Any]


class OperationConstructor:
    @classmethod
    def create(cls, obj) -> Operation:
        data = {key: getattr(obj, key) for key in as_dict(obj)}

        operation = Operation(
            model_name=type(obj).__name__.lower(),
            operation="create",
            data=data,
        )

        return operation

    @classmethod
    def update(cls, obj, data: dict) -> Operation:
        primary_keys = obj.for_find()
        got_keys = list(data.keys())

        for key in primary_keys:
            if key not in got_keys:
                data[key] = getattr(obj, key)

        operation = Operation(
            model_name=type(obj).__name__.lower(),
            operation="update",
            data=data,
        )

        return operation

    @classmethod
    def delete(cls, model, data: dict[str, Any]) -> Operation:
        operation = Operation(
            model_name=model.__name__.lower(),
            operation="delete",
            data=data,
        )

        return operation


def compare_objects(obj_new, obj_old) -> dict[str, Any]:
    value_keys = obj_old.for_value()
    dif: dict[str, Any] = dict()

    for key in value_keys:
        value_new = getattr(obj_new, key)
        value_old = getattr(obj_old, key)

        if value_new != value_old:
            dif[key] = value_new

    return dif


async def refresh_objects(
        data: list,
        model,
        delete_old: bool = True,
        area_value: Optional[str] = None,
) -> list[Operation]:
    if not data:
        return []

    operation_list: list[Operation] = []

    primary_keys = model.for_find()
    value_keys = model.for_value()
    new_stage = data[0].stage


    for object in data:
        primary_kwargs = {key: getattr(object, key) for key in primary_keys}

        async with db_helper.session_factory() as session:
            old_object = await find_object(session, model, **primary_kwargs)

            if isinstance(old_object, list):
                raise ValueError("Expected one old_object, got two or more")

            if old_object is None:
                await add_object(session, object)

                operation_list.append(OperationConstructor.create(object))
            else:
                for_update = dict()

                if old_object.is_alive:
                    difference = compare_objects(object, old_object)

                    if difference:
                        for_update = deepcopy(difference)

                        operation_list.append(OperationConstructor.update(object, difference))
                else:
                    for key in value_keys:
                        for_update[key] = getattr(object, key)
                    for_update["is_alive"] = True
                    for_update["death_time"] = None

                    operation_list.append(OperationConstructor.create(object))

                for_update["stage"] = new_stage

                await update_object(
                    session,
                    model,
                    primary_kwargs,
                    for_update
                )

    if delete_old:
        async with db_helper.session_factory() as session:
            deleted_lst = await kill_old_in_model(
                session=session,
                model=model,
                alive_stage=new_stage,
                primary_keys=primary_keys,
                area_value=area_value,
            )

        for deleted in deleted_lst:
            primary_keys_delete = {key: value for key, value in zip(primary_keys, deleted)}

            operation_list.append(OperationConstructor.delete(model, primary_keys_delete))

    return operation_list


def create_update(
        type: Literal["zn", "mechanics", "posts"],
        data: list[Operation]
) -> dict[str, Any]:
    answer = dict()
    answer["code"] = 200
    answer["message"] = "success"
    answer["type"] = type
    answer["data"]: dict[str, dict[str, list[dict[str, Any]]]] = dict()

    for op in data:
        current = answer["data"]

        if op.operation not in current:
            current[op.operation] = dict()

        current = current[op.operation]

        if op.model_name not in current:
            current[op.model_name] = []

        current = current[op.model_name]

        current.append(op.data)

    return answer


async def create_answer(
        model: Literal["zns", "zn", "jobs", "parts", "posts", "main_posts", "mechanics"],
        **for_find
) -> dict[str, Any]:
    answer = dict()
    answer["data"] = []

    def not_found():
        answer["code"] = 404
        answer["message"] = "Such object(s) not found"

    def found():
        answer["code"] = 200
        answer["message"] = "Success"

    def check(func):
        def wrapper(lst):

            if lst is None:
                not_found()
            else:
                if not isinstance(lst, list):
                    final_lst = [lst]
                else:
                    final_lst = lst

                func(final_lst)

                found()

        return wrapper

    async def for_base(model, **kwargs):
        current_for_find = {"is_alive": True}
        for key in kwargs:
            current_for_find[key] = kwargs[key]

        async with db_helper.session_factory() as session:
            objects = await find_object(
                session=session,
                model=model,
                **current_for_find
            )

        @check
        def add(objects):
            for object in objects:
                dict_object = as_dict(object)
                answer["data"].append(dict_object)

        add(objects)
    try:
        # Пост
        if model == "zns":
            async with db_helper.session_factory() as session:
                zns = await get_zns_by_post_name(
                    session=session,
                    post_name=for_find["post_name"],
                )

            @check
            def add(zns):
                for zn, date1, date2 in zns:
                    dict_zn = as_dict(zn)
                    dict_zn["car"] = as_dict(zn.car)
                    dict_zn["date1"] = date1
                    dict_zn["date2"] = date2
                    answer["data"].append(dict_zn)

            add(zns)

        # Номер заказ наряда
        elif model == "zn":
            async with db_helper.session_factory() as session:
                zn = await find_object(
                    session=session,
                    model=ZN,
                    joinedload_lst=[ZN.car],
                    is_alive=True,
                    number=for_find["zn_number"],
                )

            if zn is None:
                not_found()
            elif isinstance(zn, list):
                raise ValueError("Expected one zn, got two or more")
            else:
                zn: ZN
                dict_zn = as_dict(zn)
                dict_zn["car"] = as_dict(zn.car)
                answer["data"] = dict_zn

                found()

        # Номер заказ наряда
        elif model == "jobs":
            await for_base(Job, zn_number=for_find["zn_number"])

        # Номер заказ наряда
        elif model == "parts":
            await for_base(Part, zn_number=for_find["zn_number"])

        # Ничего
        elif model == "posts":
            await for_base(MainPost)

        # Ничего
        elif model == "mechanics":
            await for_base(Mechanic)

        else:
            raise NotImplementedError("Unknown model")

    except Exception as e:
        print(e)
        answer["code"] = 500
        answer["message"] = "Something went wrong"

    finally:
        return answer


async def parse_done(body: dict[str, Any]) -> None:
    async with db_helper.session_factory() as session:
        await change_done(
            session=session,
            by_mechanic=body["by_mechanic"],
            on_post=body["on_post"],
            zn_number=body["zn_number"],
            uuid=body["uuid"],
            type=body["type"],
            new_value=body["new_value"],
        )


async def parse_done_all(body: dict[str, Any]) -> None:
    async with db_helper.session_factory() as session:
        for obj_uuid in body["uuid"]:
            await change_done(
                session=session,
                by_mechanic=body["by_mechanic"],
                on_post=body["on_post"],
                zn_number=body["zn_number"],
                uuid=obj_uuid,
                type=body["type"],
                new_value=body["new_value"],
            )


async def parse_rec(body: dict[str, Any]) -> None:
    async with db_helper.session_factory() as session:
        await update_object(
            session=session,
            model=ZN,
            for_find={"number": body["zn_number"]},
            for_update={"recommendation": body["rec"]},
        )


async def main():
    pprint(await create_answer("zn", zn_number="АМКДС20552"))


if __name__ == '__main__':
    asyncio.run(main())