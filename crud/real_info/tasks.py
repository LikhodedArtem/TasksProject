from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.real_info import Task


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
        answer.append(task.as_dict())

    return answer


__all__ = [
    "get_tasks",
]