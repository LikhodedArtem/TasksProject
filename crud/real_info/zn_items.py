from uuid import UUID

from sqlalchemy import select, func, exists, case
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.changes import PartChange, JobChange, DoneChange
from core.models.real_info import Part, Job, File
from crud.common import format_change_type_rows


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
        done_changes.append(c.as_dict())

        last_change_uuid = max(last_change_uuid, c.change_uuid)

    suggest_uuid, main_changes = format_change_type_rows(main_changes_raw, "uuid")

    last_change_uuid = max(last_change_uuid, suggest_uuid)

    result = {
        "done_changes": done_changes,
        "main_changes": main_changes,
        "last_change_uuid": last_change_uuid,
    }

    return result


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
        obj = row[0].as_dict()
        obj["hasFiles"] = row.has_files

        items.append(obj)

    overall_last_change_uuid = max(
        (row.last_change_uuid for row in rows if row.last_change_uuid is not None),
        default=None,
    )

    return {"data": items, "last_change_uuid": overall_last_change_uuid}


__all__ = [
    "get_zn_jobs",
    "get_zn_parts",

    "get_zn_jobs_changes",
    "get_zn_parts_changes",
]