import asyncio
from datetime import datetime
from itertools import chain
from typing import Any
from uuid import UUID

from sqlalchemy import select, update, delete, func, exists, case
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from changes import CreateChange
from core import Names
from core.models import db_helper
from core.models.changes import *
from core.models.real_info import *
from help_functions import as_dict


async def add_object(
        session: AsyncSession,
        object,
) -> None:
    session.add(object)

    await session.commit()
    await session.refresh(object)


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


# async def get_objects_with_has_files(
#         session: AsyncSession,
#         model,
#         for_files: dict,
#         selectinload_lst: list | None = None,
#         joinedload_lst: list | None = None,
#         for_find: dict[str, Any] | None = None,
# ) -> list[tuple[Any, bool]] | tuple[Any, bool] | None:
#     files_conditions = build_conditions(File, for_files)
#
#     has_files = exists().where(
#         File.is_alive.is_(True),
#         *files_conditions
#     )
#
#     stmt = (
#         select(model, has_files.label("has_files"))
#     )
#
#     if for_find:
#         stmt = stmt.where(*build_conditions(model, for_find))
#
#     if selectinload_lst or joinedload_lst:
#         options = []
#
#         if selectinload_lst:
#             for selectin in selectinload_lst:
#                 options.append(selectinload(selectin))
#
#         if joinedload_lst:
#             for joined in joinedload_lst:
#                 options.append(joinedload(joined))
#
#         stmt = stmt.options(*options)
#
#     result = await session.execute(stmt)
#
#     answer = result.all()
#
#     if not answer:
#         return None
#
#     if len(answer) == 1:
#         return answer[0]
#
#     return answer


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

    zn, zn_has_files, rec_has_files = data

    dict_zn = as_dict(zn)
    dict_zn["car"] = as_dict(zn.car)
    dict_zn["zn_has_files"] = zn_has_files
    dict_zn["rec_has_files"] = rec_has_files

    return {"data": dict_zn, "change_uuid": data[-1]}


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

    suggest_uuid1, car_changes = format_change_type_row(car_changes_raw, "vin")
    suggest_uuid2, zn_changes = format_change_type_row(zn_changes_raw, "number")

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
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)

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

    suggest_uuid, main_changes = format_change_type_row(main_changes_raw, "uuid")

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

    return {"data": data[0].status if data[0] is not None else "never", "change_uuid": data[1]}


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
        .order_by(StatusChange.change_uuid)
        .limit(1)
    )

    result = await session.execute(stmt)
    data = result.first()

    status = data[0]

    if status is None:
        return {"data": None, "change_uuid": None}

    result = {
        "status": status.status,
        "last_change_uuid": status.change_uuid,
    }

    return result


from core.models.changes.help_classes.change_type import ChangeTypeEnum

FORBIDDEN_KEYS = {"change_uuid", "sse_uuid"}

def format_change_type_row(
        rows,
        primary_key: str,
):
    data: dict[str, tuple[str, Any]] = {}

    last_change_uuid = Names.MIN_UUID7

    for row in rows:
        obj = row[0]
        primary = getattr(obj, primary_key)
        type = obj.type

        last_change_uuid = max(last_change_uuid, obj.change_uuid)

        if primary not in data:
            if type == ChangeTypeEnum.CREATE or type == ChangeTypeEnum.UPDATE:
                obj_info = {}

                for key in obj.__table__.columns.keys():
                    if key not in FORBIDDEN_KEYS:
                        obj_info[key] = getattr(obj, key)

                data[primary] = (str(type), obj_info)

            else:
                data[primary] = (str(type), {primary_key: primary})

            continue

        current_type, current_value = data[primary]

        if current_type == "delete":
            continue

        if type == ChangeTypeEnum.UPDATE:
            for key in current_value.keys():
                value = getattr(obj, key)
                if key is not None:
                    current_value[key] = value

            data[primary] = (current_type, current_value)

        if type == ChangeTypeEnum.DELETE:
            if current_type == "create":
                del data[primary]
                continue

            data[primary] = (str(type), {primary_key: primary})

    return last_change_uuid, [{"type": item[0], "data": {item[1]}} for item in data.values()]


async def get_zns_by_post(
    session: AsyncSession,
    post: str
):
    stmt = (
        select(ZN, Post.date1, Post.date2)
        .join(ZN_mtm_Post, ZN_mtm_Post.zn_number == ZN.number)
        .join(Post, ZN_mtm_Post.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(MainPost.name == post)
        .options(joinedload(ZN.car))
        .order_by(Post.date1.asc())
    )

    result = await session.execute(stmt)
    answer = result.unique().all()

    return answer


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
        primary_keys: list[str],
        area_value: str | None = None,
) -> list:
    if model == ZN:
        return []

    conditions = [
        model.stage < alive_stage,
        model.is_alive == True,
    ]

    if model == Job:
        conditions.append(Job.zn_number == area_value)
    elif model == Part:
        conditions.append(Part.zn_number == area_value)
    elif model == ZN_mtm_Post:
        conditions.append(ZN_mtm_Post.zn_number == area_value)

    death_time = datetime.now()

    stmt = (
        update(model)
        .where(*conditions)
        .values(
            is_alive=False,
            death_time=death_time,
        )
        .returning(*[getattr(model, primary_key) for primary_key in primary_keys])
    )

    result = await session.execute(stmt)
    await session.commit()

    answer = []
    for value in list(result.scalars().all()):
        if isinstance(value, str):
            answer.append([value])
            continue
        answer.append(value)

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

    change = await CreateChange.done(
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


__all__ = [
    "add_object",
    "find_objects",
    "update_objects",
    "delete_objects",
    "kill_old_in_model",
    "change_done",
    "get_zns_by_post",
    "get_current_mechanics_stage",
    "get_current_zn_stage",
    "get_current_main_posts_stage",
    "has_files",

    "get_zn",
    "get_zn_jobs",
    "get_zn_parts",
    "get_zn_status",

    "get_zn_changes",
    "get_zn_jobs_changes",
    "get_zn_parts_changes",
    "get_zn_status_changes",
]