import asyncio
from datetime import datetime
from sqlite3 import IntegrityError
from typing import Any
from uuid import UUID

from sqlalchemy import select, update, delete, func, exists, not_
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import *
from core.models.mechanic import Mechanic


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


async def get_objects_with_has_files(
        session: AsyncSession,
        model,
        for_files: Any,
        selectinload_lst: list | None = None,
        joinedload_lst: list | None = None,
        for_find: dict[str, Any] | None = None,
) -> list[tuple[Any, bool]] | tuple[Any, bool] | None:
    has_files = exists().where(
        File.is_alive.is_(True),
        File.identical_str == for_files
    )

    stmt = (
        select(model, has_files.label("has_files"))
    )

    if for_find:
        stmt = stmt.where(*build_conditions(model, for_find))

    if selectinload_lst or joinedload_lst:
        options = []

        if selectinload_lst:
            for selectin in selectinload_lst:
                options.append(selectinload(selectin))

        if joinedload_lst:
            for joined in joinedload_lst:
                options.append(joinedload(joined))

        stmt = stmt.options(*options)

    result = await session.execute(stmt)

    answer = result.all()

    if not answer:
        return None

    if len(answer) == 1:
        return answer[0]

    return answer


async def check_can_stop(
        session: AsyncSession,
        mechanic: str,
        zn_number: str,
):
    start_time_stmt = select(MechanicZNStatus.at_time).where(
        MechanicZNStatus.mechanic == mechanic,
        MechanicZNStatus.zn_number == zn_number,
        MechanicZNStatus.status == "start",
    ).order_by(
        MechanicZNStatus.at_time.desc()
    ).limit(1)


    result = await session.execute(start_time_stmt)
    start_time = result.scalar_one_or_none()

    did_smth_stmt = select(
        exists().where(
            DoneLog.zn_number == zn_number,
            DoneLog.mechanic == mechanic,
            DoneLog.time > start_time,
        )
    )

    result = await session.execute(did_smth_stmt)
    did_smth = result.scalar()

    if not did_smth:
        return True, "did-nothing"

    everything_done_stmt = select(
        not_(
            exists().where(
                Part.zn_number == zn_number,
                Part.is_alive.is_(True),
                Part.done.is_(False),
            )
        ) & not_ (
            exists().where(
                Job.zn_number == zn_number,
                Job.is_alive.is_(True),
                Job.done.is_(False),
            )
        )
    )

    result = await session.execute(everything_done_stmt)
    everything_done = result.scalar()

    if everything_done:
        return True, "everything-done"

    return False, "not-everything-done"

async def get_zns_by_post_name(
    session: AsyncSession,
    post_name: str
):
    stmt = (
        select(ZN, Post.date1, Post.date2)
        .join(ZN_mtm_Post, ZN_mtm_Post.zn_number == ZN.number)
        .join(Post, ZN_mtm_Post.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(MainPost.name == post_name)
        .options(joinedload(ZN.car))
        .order_by(Post.date1.asc())
    )

    result = await session.execute(stmt)
    answer = result.unique().all()

    return answer


async def delete_object(
        session: AsyncSession,
        model,
        **kwargs,
) -> None:
    conditions = build_conditions(model, kwargs)
    if not conditions: return

    stmt = delete(model).where(*conditions)

    await session.execute(stmt)
    await session.commit()


async def update_object(
        session: AsyncSession,
        model,
        for_find: dict,
        for_update: dict,
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


async def change_done(
        session: AsyncSession,
        mechanic: str,
        post: str,
        zn_number: str,
        uuid: str,
        type: str,
        new_value: bool,
):
    type = type.lower()

    model = Job if type == "jobs" else Part

    if not hasattr(model, "done"):
        return

    await update_object(
        session,
        model,
        { "uuid": uuid },
        { "done": new_value }
    )

    done_log = DoneLog(
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
    )

    await add_object(session, done_log)



# if __name__ == '__main__':
#     asyncio.run(main())