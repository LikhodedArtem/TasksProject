from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.changes import StatusChange
from core.models.real_info import PostZNStatus


async def get_zn_status(
        session: AsyncSession,
        zn_number: str,
        post: str,
):
    last_change_uuid_stmt = (
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
            last_change_uuid_stmt,
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
        return {"data": "never", "last_change_uuid": None}

    return {"data": data[0].status, "last_change_uuid": data[1]}


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
    await session.commit()

    if data is None or data[0] is None:
        return {"status": None, "last_change_uuid": last_uuid}

    status = data[0]

    result = {
        "status": status.status,
        "last_change_uuid": status.change_uuid,
    }

    return result


__all__ = [
    "get_zn_status",
    "get_zn_status_changes",
]