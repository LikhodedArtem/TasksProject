from typing import Any, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, update, exists, Row

from core import Names
from core.models.changes.help_classes.change_type import ChangeTypeEnum
from core.models.real_info import File, ZNmtmPost, Part, Job, ZN


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


async def add_objects(
        session: AsyncSession,
        objects: Any | list[Any],
) -> None:
    try:
        if isinstance(objects, list):
            for obj in objects:
                session.add(obj)
        else:
            session.add(objects)

        await session.commit()
    except Exception as e:
        print("add_object error:", e)
        await session.rollback()
        raise e


async def find_objects(
        session: AsyncSession,
        model,
        order_by: list | None = None,
        limit: int | None = None,
        selectinload_lst: list | None = None,
        joinedload_lst: list | None = None,
        in_: dict[str, Sequence[Any]] | None = None,
        **kwargs,
) -> list[Any] | Any | None:
    stmt = select(model)

    conditions = build_conditions(model, kwargs)
    if conditions:
        stmt = stmt.where(*conditions)

    if in_:
        for key, value in in_.items():
            if value:
                stmt = stmt.where(getattr(model, key).in_(value))
            else:
                return None

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
    await session.commit()

    if not answer:
        return None

    if len(answer) == 1:
        return answer[0]

    return answer


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
    await session.commit()

    return answer


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
    elif model == ZNmtmPost:
        conditions.append(ZNmtmPost.zn_number == area_value)

    stmt = (
        select(model)
        .where(*conditions)
    )

    result = await session.execute(stmt)
    answer = result.all()
    await session.commit()

    return answer


__all__ = [
    "build_conditions",
    "add_objects",
    "find_objects",
    "update_objects",
    "kill_old_in_model",
    "has_files",
    "format_change_type_rows",
]