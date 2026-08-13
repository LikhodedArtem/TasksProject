from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select


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
        async with session.begin():
            if isinstance(objects, list):
                for obj in objects:
                    session.add(obj)
            else:
                session.add(objects)

        await session.commit()
    except Exception:
        await session.rollback()


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