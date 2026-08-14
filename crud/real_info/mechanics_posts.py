from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core import Names
from core.models.changes import MechanicChange, MainPostChange
from core.models.real_info import Mechanic, MainPost
from crud.common import format_change_type_rows


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
        data["data"].append(row[0].as_dict())
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


__all__ = [
    "get_posts",
    "get_mechanics",

    "get_mechanics_changes",
    "get_posts_changes",

    "get_current_mechanics_stage",
    "get_current_main_posts_stage",
]