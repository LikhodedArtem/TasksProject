from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.changes import TaskChange
from core.models.real_info import Task
from ..common import format_change_type_rows


async def get_tasks(
        session: AsyncSession,
        to_name: str,
):
    last_change_uuid_stmt = (
        select(func.max(TaskChange.change_uuid))
        .where(
            TaskChange.to_name == to_name
        )
    )

    stmt = (
        select(Task)
        .where(Task.to_name == to_name)
        .order_by(Task.created_at.desc())
    )

    tasks = (await session.execute(stmt)).scalars().all()
    last_change_uuid = (await session.execute(last_change_uuid_stmt)).scalars().first()
    await session.commit()

    answer = [task.as_dict() for task in tasks]

    return {
        "data": answer,
        "last_change_uuid": last_change_uuid,
    }


async def get_tasks_changes(
        session: AsyncSession,
        to_name: str,
        client_id: UUID | str,
        last_uuid: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    stmt = (
        select(TaskChange)
        .where(
            TaskChange.to_name == to_name,
            TaskChange.change_uuid > last_uuid,
            TaskChange.sse_uuid != client_id,
        )
    )

    result = await session.execute(stmt)
    info = result.scalars().all()
    await session.commit()

    last_change_uuid, data = format_change_type_rows(info, "uuid")

    return {
        "data": data,
        "last_change_uuid": last_change_uuid,
    }


__all__ = [
    "get_tasks",
    "get_tasks_changes"
]