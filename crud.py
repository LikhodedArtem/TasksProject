import asyncio
from datetime import datetime
from itertools import chain
from typing import Any
from uuid import UUID

from sqlalchemy import select, update, delete, func, exists, case, Row
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from changes import CreateChange
from core import Names
from core.models import db_helper
from core.models.changes import *
from core.models.real_info import *
from help_functions import as_dict
from routers.web.info import Checklist


async def add_objects(
        session: AsyncSession,
        objects: Any | list[Any],
) -> None:
    try:
        async with session.begin():
            if isinstance(objects, list):
                for obj in objects:
                    session.add(obj)
            else:
                session.add(objects)

        await session.commit()
    except Exception:
        await session.rollback()


async def get_current_zn_stage(
        session: AsyncSession,
        number: str,
) -> int:
    stmt = select(ZN.stage).where(ZN.number == number)

    result = await session.execute(stmt)
    stage = result.scalar_one_or_none()

    return stage if stage is not None else 0


async def get_current_mechanics_stage(
        session: AsyncSession,
) -> int:
    stmt = select(func.max(Mechanic.stage))

    result = await session.execute(stmt)
    stage = result.scalar_one_or_none()

    return stage if stage is not None else 0


async def get_current_main_posts_stage(
        session: AsyncSession,
) -> int:
    stmt = select(func.max(MainPost.stage))

    result = await session.execute(stmt)
    stage = result.scalar_one_or_none()

    return stage if stage is not None else 0


def build_conditions(
        model,
        kwargs: dict[str, Any]
) -> list:
    conditions = []

    for key, value in kwargs.items():
        if value is None:
            continue
        column = getattr(model, key)
        conditions.append(column == value)

    return conditions


async def find_objects(
        session: AsyncSession,
        model,
        order_by: list | None = None,
        limit: int | None = None,
        selectinload_lst: list | None = None,
        joinedload_lst: list | None = None,
        **kwargs,
) -> list[Any] | Any | None:
    conditions = build_conditions(model, kwargs)
    if not conditions: return

    stmt = select(model).where(*conditions)

    if selectinload_lst or joinedload_lst:
        options = []

        if selectinload_lst:
            for selectin in selectinload_lst:
                options.append(selectinload(selectin))

        if joinedload_lst:
            for joined in joinedload_lst:
                options.append(joinedload(joined))

        stmt = stmt.options(*options)

    if order_by:
        stmt = stmt.order_by(*order_by)

    if limit:
        stmt = stmt.limit(limit)

    result = await session.execute(stmt)

    answer = result.scalars().all()

    if not answer:
        return None

    if len(answer) == 1:
        return answer[0]

    return answer


async def get_posts(
        session: AsyncSession,
):
    return await _get_first_page_items(session, False)


async def get_mechanics(
        session: AsyncSession,
):
    return await _get_first_page_items(session, True)


async def _get_first_page_items(
        session: AsyncSession,
        mechanics: bool,
):
    if mechanics:
        main_model = Mechanic
        changes_model = MechanicChange
    else:
        main_model = MainPost
        changes_model = MainPostChange


    last_change_uuid_stmt = (
        select(func.max(changes_model.change_uuid))
        .scalar_subquery()
    )

    stmt = (
        select(
            main_model,
            last_change_uuid_stmt,
        ).where(
            main_model.is_alive.is_(True),
        )
    )

    result = await session.execute(stmt)
    info = result.all()

    data = {
        "data": [],
        "change_uuid": Names.MIN_UUID7
    }

    for row in info:
        data["data"].append(as_dict(row[0]))
        data["change_uuid"] = max(row[1], data["change_uuid"])

    return data


async def get_posts_changes(
        session: AsyncSession,
        last_uuid: UUID,
        client_id: UUID,
):
    return await _get_first_page_items_changes(session, False, last_uuid, client_id)


async def get_mechanics_changes(
        session: AsyncSession,
        last_uuid: UUID,
        client_id: UUID,
):
    return await _get_first_page_items_changes(session, True, last_uuid, client_id)


async def _get_first_page_items_changes(
        session: AsyncSession,
        mechanics: bool,
        last_uuid: UUID,
        client_id: UUID,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    if mechanics:
        change_model = MechanicChange
        primary_key = "key"
    else:
        change_model = MainPostChange
        primary_key = "name"

    stmt = (
        select(change_model)
        .where(
            change_model.change_uuid > last_uuid,
            change_model.sse_uuid != client_id,
        )
    )

    result = await session.execute(stmt)
    rows = result.all()

    last_change_uuid, data = format_change_type_rows(rows, primary_key)
    return {"data": data, "last_change_uuid": last_change_uuid}


async def get_zns_by_post(
        session: AsyncSession,
        post: str,
):
    zn_last_uuid_stmt = (
        select(func.max(ZNChange.change_uuid))
        .where(
            ZN.number == ZNChange.number,
        )
        .correlate(ZN)
        .scalar_subquery()
    )

    car_last_uuid_stmt = (
        select(func.max(CarChange.change_uuid))
        .where(
            ZN.car_vin == CarChange.vin,
        )
        .correlate(ZN)
        .scalar_subquery()
    )

    posts_last_uuid_stmt = (
        select(func.max(PostChange.change_uuid))
        .where(
            PostChange.main_post_name == post,
        )
        .scalar_subquery()
    )

    stmt = (
        select(
            ZN,
            Post.uuid,
            Post.date1,
            Post.date2,
            zn_last_uuid_stmt,
            car_last_uuid_stmt,
            posts_last_uuid_stmt
        )
        .join(ZN_mtm_Post, ZN_mtm_Post.zn_number == ZN.number)
        .join(Post, ZN_mtm_Post.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(MainPost.name == post)
        .options(joinedload(ZN.car))
        .order_by(Post.date1.asc())
    )

    result = await session.execute(stmt)
    rows = result.all()

    data = {"data": [], "change_uuid": Names.MIN_UUID7}

    for row in rows:
        (
            zn,
            post_uuid,
            date1,
            date2,
            zn_last_uuid,
            car_last_uuid,
            posts_last_uuid
        ) = row

        uuids = [zn_last_uuid, car_last_uuid, posts_last_uuid]
        for i in range(len(uuids)):
            if uuids[i] is None:
                uuids[i] = Names.MIN_UUID7

        dict_zn = as_dict(zn)
        dict_zn["post_uuid"] = post_uuid
        dict_zn["car"] = as_dict(zn.car)
        dict_zn["date1"] = date1
        dict_zn["date2"] = date2

        data["data"].append(dict_zn)
        data["change_uuid"] = max(
            *uuids,
            data["change_uuid"],
        )

    return data


async def get_zns_changes_by_post(
        session: AsyncSession,
        post: str,
        client_id: UUID | str,
        last_uuid: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    posts_changes_stmt = (
        select(PostChange)
        .where(
            PostChange.main_post_name == post,
            PostChange.change_uuid > last_uuid,
            PostChange.sse_uuid != client_id,
        )
    )

    car_changes_stmt = (
        select(CarChange)
        .join(ZN, ZN.car_vin == CarChange.vin)
        .join(ZN_mtm_Post, ZN_mtm_Post.zn_number == ZN.number)
        .join(Post, ZN_mtm_Post.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(
            MainPost.name == post,
            CarChange.change_uuid > last_uuid,
            CarChange.sse_uuid != client_id,
        )
    )

    zn_changes_stmt = (
        select(ZNChange, Post.uuid.label("post_uuid"))
        .join(ZN, ZN.number == ZNChange.number)
        .join(ZN_mtm_Post, ZN_mtm_Post.zn_number == ZN.number)
        .join(Post, ZN_mtm_Post.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(
            MainPost.name == post,
            ZNChange.change_uuid > last_uuid,
            ZNChange.sse_uuid != client_id,
        )
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        car_changes_raw = (await session.execute(car_changes_stmt)).all()
        zn_changes_raw = (await session.execute(zn_changes_stmt)).all()
        posts_changes_raw = (await session.execute(posts_changes_stmt)).all()

    suggest_uuid1, car_changes = format_change_type_rows(car_changes_raw, "vin")
    suggest_uuid2, zn_changes = format_change_type_rows(zn_changes_raw, "number")
    suggest_uuid3, posts_changes = format_change_type_rows(posts_changes_raw, "uuid")

    last_change_uuid = max(last_uuid, suggest_uuid1, suggest_uuid2, suggest_uuid3)

    result = {
        "data": {
            "car_changes": car_changes,
            "zn_changes": zn_changes,
            "posts_changes": posts_changes
        },
        "last_change_uuid": last_change_uuid,
    }

    return result


async def get_zn(
        session: AsyncSession,
        zn_number: str,
):
    zn_has_files = exists().where(
        File.is_alive.is_(True),
        File.zn_number == zn_number,
        File.type == "zn",
    ).label("zn_has_files")

    rec_has_files = exists().where(
        File.is_alive.is_(True),
        File.zn_number == zn_number,
        File.type == "rec",
    ).label("rec_has_files")

    zn_last_change_uuid = (
        select(func.max(ZNChange.change_uuid))
        .where(ZNChange.number == zn_number)
        .scalar_subquery()
    )

    car_last_change_uuid = (
        select(func.max(CarChange.change_uuid))
        .where(CarChange.vin == ZN.car_vin)
        .correlate(ZN)
        .scalar_subquery()
    )

    last_change_uuid = case(
        (car_last_change_uuid.is_(None), zn_last_change_uuid),
        (zn_last_change_uuid.is_(None), car_last_change_uuid),
        (zn_last_change_uuid >= car_last_change_uuid, zn_last_change_uuid),
        else_=car_last_change_uuid,
    ).label("last_change_uuid")

    stmt = (
        select(
            ZN,
            zn_has_files,
            rec_has_files,
            last_change_uuid
        )
        .where(ZN.number == zn_number)
        .options(joinedload(ZN.car))
        .limit(1)
    )

    result = await session.execute(stmt)
    data = result.first()

    if data is None or data.ZN.is_alive is False:
        return None

    zn, zn_has_files, rec_has_files, change_uuid = data

    dict_zn = as_dict(zn)
    dict_zn["car"] = as_dict(zn.car)
    dict_zn["zn_has_files"] = zn_has_files
    dict_zn["rec_has_files"] = rec_has_files

    return {"data": dict_zn, "change_uuid": change_uuid}


async def get_zn_changes(
        session: AsyncSession,
        zn_number: str,
        last_uuid: UUID | str,
        client_id: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    car_changes_stmt = (
        select(CarChange)
        .join(ZN, CarChange.vin == ZN.number)
        .where(
            ZN.number == zn_number,
            CarChange.change_uuid > last_uuid,
            CarChange.sse_uuid != client_id,
        )
    )

    zn_changes_stmt = (
        select(ZNChange)
        .join(ZN, ZNChange.number == ZN.number)
        .where(
            ZNChange.number == zn_number,
            ZNChange.change_uuid > last_uuid,
            ZNChange.sse_uuid != client_id,
        )
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        car_changes_raw = (await session.execute(car_changes_stmt)).all()
        zn_changes_raw = (await session.execute(zn_changes_stmt)).all()

    suggest_uuid1, car_changes = format_change_type_rows(car_changes_raw, "vin")
    suggest_uuid2, zn_changes = format_change_type_rows(zn_changes_raw, "number")

    last_change_uuid = max(last_uuid, suggest_uuid1, suggest_uuid2)

    result = {
        "car_changes": car_changes,
        "zn_changes": zn_changes,
        "last_change_uuid": last_change_uuid,
    }

    return result


async def get_zn_jobs(
        session: AsyncSession,
        zn_number: str,
):
    return await _get_zn_items(session, zn_number, True)


async def get_zn_parts(
        session: AsyncSession,
        zn_number: str,
):
    return await _get_zn_items(session, zn_number, False)


async def _get_zn_items(
        session: AsyncSession,
        zn_number: str,
        jobs: bool,
):
    if jobs:
        type = "jobs"
        main_model = Job
        change_model = JobChange
    else:
        type = "parts"
        main_model = Part
        change_model = PartChange

    has_files = exists().where(
        File.is_alive.is_(True),
        File.identical_str == main_model.uuid,
        File.type == type
    ).label("has_files")

    main_last_change_id = (
        select(func.max(change_model.change_uuid))
        .where(change_model.uuid == main_model.uuid)
        .correlate(main_model)
        .scalar_subquery()
    )

    done_last_change_id = (
        select(func.max(DoneChange.change_uuid))
        .where(DoneChange.identical_str == main_model.uuid)
        .correlate(main_model)
        .scalar_subquery()
    )

    last_change_id = case(
        (done_last_change_id.is_(None), main_last_change_id),
        (main_last_change_id.is_(None), done_last_change_id),
        (main_last_change_id >= done_last_change_id, main_last_change_id),
        else_=done_last_change_id,
    ).label("last_change_uuid")


    stmt = (
        select(
            main_model,
            has_files,
            last_change_id,
        )
        .where(
            main_model.zn_number == zn_number,
            main_model.is_alive.is_(True),
        )
    )

    result = await session.execute(stmt)
    rows  = result.all()

    items = []
    for row in rows:
        obj = as_dict(row[0])
        obj["has_files"] = row.has_files

        items.append(obj)

    overall_last_change_uuid = max(
        (row.last_change_uuid for row in rows if row.last_change_uuid is not None),
        default=None,
    )

    return {"data": items, "change_uuid": overall_last_change_uuid}


async def get_zn_jobs_changes(
        session: AsyncSession,
        zn_number: str,
        last_uuid: UUID,
        client_id: UUID,
):
    return await _get_zn_items_changes(
        session=session,
        zn_number=zn_number,
        last_uuid=last_uuid,
        client_id=client_id,
        jobs=True,
    )


async def get_zn_parts_changes(
        session: AsyncSession,
        zn_number: str,
        last_uuid: UUID,
        client_id: UUID,
):
    return await _get_zn_items_changes(
        session=session,
        zn_number=zn_number,
        last_uuid=last_uuid,
        client_id=client_id,
        jobs=False,
    )


async def _get_zn_items_changes(
        session: AsyncSession,
        zn_number: str,
        client_id: UUID | str,
        last_uuid: UUID | str,
        jobs: bool,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    if jobs:
        main_model = Job
        change_model = JobChange
    else:
        main_model = Part
        change_model = PartChange

    latest_per_group = (
        select(
            DoneChange.identical_str,
            func.max(DoneChange.change_uuid).label("max_change_uuid"),
        )
        .join(main_model, DoneChange.identical_str == main_model.uuid)
        .where(
            main_model.zn_number == zn_number,
            DoneChange.change_uuid > last_uuid,
            DoneChange.sse_uuid != client_id,
        )
        .group_by(DoneChange.identical_str)
        .subquery()
    )

    done_changes_stmt = (
        select(DoneChange)
        .join(
            latest_per_group,
            (DoneChange.identical_str == latest_per_group.c.identical_str)
            & (DoneChange.change_uuid == latest_per_group.c.max_change_uuid),
        )
    )

    main_changes_stmt = (
        select(change_model)
        .join(main_model, change_model.uuid == main_model.uuid)
        .where(
            main_model.zn_number == zn_number,
            change_model.change_uuid > last_uuid,
            change_model.sse_uuid != client_id,
        )
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        done_changes_raw = (await session.execute(done_changes_stmt)).all()
        main_changes_raw = (await session.execute(main_changes_stmt)).all()

    done_changes = []

    last_change_uuid = last_uuid

    for c in done_changes_raw:
        c = c[0]
        done_changes.append(as_dict(c))

        last_change_uuid = max(last_change_uuid, c.change_uuid)

    suggest_uuid, main_changes = format_change_type_rows(main_changes_raw, "uuid")

    last_change_uuid = max(last_change_uuid, suggest_uuid)

    result = {
        "done_changes": done_changes,
        "main_changes": main_changes,
        "last_change_uuid": last_change_uuid,
    }

    return result


async def get_zn_status(
        session: AsyncSession,
        zn_number: str,
        post: str,
):
    last_uuid = (
        select(func.max(StatusChange.change_uuid))
        .where(
            StatusChange.zn_number == zn_number,
            StatusChange.post == post,
        )
        .scalar_subquery()
    )

    stmt = (
        select(
            PostZNStatus,
            last_uuid
        )
        .where(
            PostZNStatus.zn_number == zn_number,
            PostZNStatus.post == post,
        )
        .limit(1)
    )

    result = await session.execute(stmt)
    data = result.first()

    if data is None:
        return {"data": "never", "change_uuid": None}

    return {"data": data[0].status, "change_uuid": data[1]}


async def get_zn_status_changes(
        session: AsyncSession,
        zn_number: str,
        post: str,
        client_id: UUID | str,
        last_uuid: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    stmt = (
        select(StatusChange)
        .where(
            StatusChange.zn_number == zn_number,
            StatusChange.post == post,
            StatusChange.change_uuid > last_uuid,
            StatusChange.sse_uuid != client_id,
        )
        .order_by(StatusChange.change_uuid.desc())
        .limit(1)
    )

    result = await session.execute(stmt)
    data = result.first()

    if data is None or data[0] is None:
        return {"status": None, "last_change_uuid": last_uuid}

    status = data[0]

    result = {
        "status": status.status,
        "last_change_uuid": status.change_uuid,
    }

    return result


from core.models.changes.help_classes.change_type import ChangeTypeEnum

FORBIDDEN_KEYS = {
    "change_uuid",
    "sse_uuid",
    "post",
    "mechanic",
    "type",
}

def format_change_type_rows(
        rows,
        primary_key: str | list,
) -> tuple[str, list[dict[str, Any]]]:
    data: dict[str, tuple[str, Any]] = {}

    last_change_uuid = Names.MIN_UUID7

    if type(primary_key) is list:
        primary_key = primary_key[0]

    for obj in rows:
        if isinstance(obj, Row):
            if len(obj) == 1:
                obj = obj[0]

        primary = getattr(obj, primary_key)
        type_ = obj.type

        last_change_uuid = max(last_change_uuid, obj.change_uuid)

        if primary not in data:
            if type_ == ChangeTypeEnum.CREATE or type_ == ChangeTypeEnum.UPDATE:
                obj_info = {}

                for key in obj.__table__.columns.keys():
                    if key not in FORBIDDEN_KEYS:
                        obj_info[key] = getattr(obj, key)

                data[primary] = (str(type_), obj_info)

            else:
                data[primary] = (str(type_), {primary_key: primary})

            continue

        current_type, current_value = data[primary]

        if current_type == "delete":
            continue

        if type_ == ChangeTypeEnum.UPDATE:
            for key in current_value.keys():
                value = getattr(obj, key)
                if key is not None:
                    current_value[key] = value

            data[primary] = (current_type, current_value)

        if type_ == ChangeTypeEnum.DELETE:
            if current_type == "create":
                del data[primary]
                continue

            data[primary] = (str(type_), {primary_key: primary})

    return last_change_uuid, [{"type": item[0], "data": item[1]} for item in data.values()]


async def delete_objects(
        session: AsyncSession,
        model,
        **kwargs,
) -> None:
    conditions = build_conditions(model, kwargs)
    if not conditions: return

    stmt = delete(model).where(*conditions)

    await session.execute(stmt)
    await session.commit()


async def update_objects(
        session: AsyncSession,
        model,
        for_find: dict,
        for_update: dict,
        for_add: list | None = None,
        returning_lst: list | None = None,
) -> Any | None:
    find_conditions = build_conditions(model, for_find)

    if not for_update or not find_conditions: return

    stmt = update(model).where(*find_conditions).values(**for_update)

    if returning_lst:
        stmt = stmt.returning(*returning_lst)

        result = await session.execute(stmt)
        await session.commit()

        return result.unique().all()

    if for_add is not None:
        async with session.begin():
            for el in for_add:
                session.add(el)

            await session.execute(stmt)
        return

    await session.execute(stmt)
    await session.commit()


async def kill_old_in_model(
        session: AsyncSession,
        model,
        alive_stage: int ,
        area_value: str | None = None,
):
    if model == ZN:
        return []

    conditions = [
        model.stage < alive_stage,
        model.is_alive == True,
    ]

    if model == Job or model == Part:
        conditions.append(model.zn_number == area_value)
    elif model == ZN_mtm_Post:
        conditions.append(ZN_mtm_Post.zn_number == area_value)

    stmt = (
        select(model)
        .where(*conditions)
    )

    result = await session.execute(stmt)
    answer = result.all()

    return answer


async def has_files(
        session: AsyncSession,
        **kwargs,
) -> bool:
    conditions = build_conditions(File, kwargs)

    stmt = select(
        exists(File)
        .where(
            File.is_alive.is_(True),
            *conditions
        )
    )

    result = await session.execute(stmt)
    answer = result.scalar()

    return answer



async def change_done(
        session: AsyncSession,
        mechanic: str,
        post: str,
        uuid: str,
        type: str,
        new_value: bool,
        client_id: UUID,
        change_uuid: UUID,
):
    type = type.lower()

    model = Job if type == "jobs" else Part

    if not hasattr(model, "done"):
        return

    change = CreateChange.done(
        change_uuid=change_uuid,
        sse_uuid=client_id,
        identical_str=uuid,
        value=new_value,
        mechanic=mechanic,
        post=post,
    )

    await update_objects(
        session,
        model,
        { "uuid": uuid },
        { "done": new_value },
        for_add=[change]
    )


async def get_tasks(
        session: AsyncSession,
        to_name: str,
):
    stmt = (
        select(Task)
        .where(Task.to_name == to_name)
    )

    result = await session.execute(stmt)
    tasks = result.scalars().all()

    answer = []

    for task in tasks:
        answer.append(as_dict(task))

    return answer


async def get_checklist(
        session: AsyncSession,
        zn_number: str,
):
    last_change_stmt = (
        select(func.max(ZNChange.change_uuid))
        .where(ZNChange.number == zn_number)
    )

    main_stmt = (
        select(ZN.car_vin, ZN.date)
        .where(ZN.number == zn_number)
        .limit(1)
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        last_change = await session.execute(last_change_stmt)
        zn_info = (await session.execute(main_stmt)).first()

    print(last_change, zn_info)



# async def main():
#     async with db_helper.session_factory() as session:
#         result = await get_zn_parts_changes(
#             session,
#             "АМКДС20770",
#             "019fe15fe99e79f397d2683dfd49307c",
#             "019fd336368e7c79bddc3707f1817885",
#         )
#
#         print(result)
#
#
# if __name__ == "__main__":
#     asyncio.run(main())


__all__ = [
    "add_objects",
    "find_objects",
    "update_objects",
    "delete_objects",
    "kill_old_in_model",
    "change_done",
    "get_current_mechanics_stage",
    "get_current_zn_stage",
    "get_current_main_posts_stage",
    "has_files",

    "get_posts",
    "get_mechanics",

    "get_posts_changes",
    "get_mechanics_changes",

    "get_zns_by_post",
    "get_zns_changes_by_post",

    "get_zn",
    "get_zn_jobs",
    "get_zn_parts",
    "get_zn_status",

    "get_zn_changes",
    "get_zn_jobs_changes",
    "get_zn_parts_changes",
    "get_zn_status_changes",

    "get_tasks",
    "get_checklist"
]