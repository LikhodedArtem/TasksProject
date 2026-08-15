from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.real_info import File
from core.models.changes import FileChange
from crud.common import build_conditions


async def get_files(
    session: AsyncSession,
    zn_number: str,
    type: str | None = None,
    identical_str: str | None = None,
):
    kwargs = {
        "is_alive": True,
        "zn_number": zn_number,
    }

    if type: kwargs["type"] = type
    if identical_str: kwargs["identical_str"] = identical_str

    conditions = build_conditions(File, kwargs)

    files_stmt = (
        select(File)
        .where(*conditions)
    )

    last_change_uuid_stmt = (
        select(func.max(FileChange.change_uuid))
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        last_change_uuid = (await session.execute(last_change_uuid_stmt)).scalar()
        files = (await session.execute(files_stmt)).scalars().all()

    return {
        "last_change_uuid": last_change_uuid,
        "data": files,
    }


__all__ = [
    "get_files",
    # "get_files_changes",
]