from uuid import UUID

from sqlalchemy import select, func, update, exists
from sqlalchemy.orm import aliased
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.real_info import File
from core.models.changes import FileChange
from crud.common import build_conditions


async def get_files(
    session: AsyncSession,
    zn_number: str | None,
    to_name: str | None,
    type: str | None,
    identical_str: str | None,
):
    kwargs = {
        "is_alive": True,
    }

    if zn_number: kwargs["zn_number"] = zn_number
    if to_name: kwargs["to_name"] = to_name
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

    last_change_uuid = (await session.execute(last_change_uuid_stmt)).scalar()
    files = (await session.execute(files_stmt)).scalars().all()

    await session.commit()

    data = [file.as_dict() for file in files]

    return {
        "last_change_uuid": last_change_uuid,
        "data": data,
    }


async def kill_file(
    session: AsyncSession,
    uuid: UUID,
    client_id: UUID,
    change_uuid: UUID,
    mechanic: str,
    post: str,
):
    file_alias = aliased(File)

    stmt = (
        update(File)
        .where(File.uuid == uuid)
        .values(is_alive=False)
        .returning(
            File.zn_number,
            File.identical_str,
            File.type,
            exists(File)
            .where(
                file_alias.is_alive == True,
                file_alias.zn_number == File.zn_number,
                file_alias.identical_str == File.identical_str,
                file_alias.type == File.type,
            ),
        )
    )

    result = await session.execute(stmt)
    session.add(
        FileChange(
            uuid=uuid,
            mechanic=mechanic,
            post=post,
            change_uuid=change_uuid,
            sse_uuid=client_id,
            type="delete",
        )
    )
    await session.commit()
    info = result.tuples().first()

    return info


__all__ = [
    "get_files",
    "kill_file",
]