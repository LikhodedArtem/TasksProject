import asyncio
from datetime import datetime
from sqlite3 import IntegrityError
from typing import Any
from uuid import UUID

from sqlalchemy import select, update, delete, func
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


async def create_zn(
        session: AsyncSession,
        number: str,
        date: str,
        reason: str,
        assistant: str,
        manager: str,
) -> ZN:
    zn = ZN(
        number=number,
        date=date,
        reason=reason,
        assistant=assistant,
        manager=manager,
    )
    session.add(zn)

    await session.commit()
    await session.refresh(zn)
    return zn


async def create_post(
        session: AsyncSession,
        uuid: str,
        name: str,
        date1: str,
        date2: str,
) -> Post:
    post = Post(
        uuid=uuid,
        name=name,
        date1=date1,
        date2=date2,
    )
    session.add(post)

    await session.commit()
    await session.refresh(post)
    return post


async def create_car(
        session: AsyncSession,
        zn_number: str,
        win: str,
        reg: str,
        model: str,
        year: int,
        millage: int,
) -> Car:
    car = Car(
        zn_number=zn_number,
        win=win,
        reg=reg,
        model=model,
        year=year,
        millage=millage,
    )
    session.add(car)

    await session.commit()
    await session.refresh(car)
    return car


async def create_job(
        session: AsyncSession,
        uuid: str,
        zn_number: str,
        number: int,
        name: str,
        normal_time: int
) -> Job:
    job = Job(
        uuid=uuid,
        zn_number=zn_number,
        number=number,
        name=name,
        normal_time=normal_time,
    )
    session.add(job)

    await session.commit()
    await session.refresh(job)
    return job


async def create_part(
        session: AsyncSession,
        uuid: str,
        zn_number: str,
        number: int,
        name: str,
        manufacturer_code: str,
        manufacturer: str,
        quantity: int,
        units: str,
) -> Part:
    part = Part(
        uuid=uuid,
        zn_number=zn_number,
        number=number,
        name=name,
        manufacturer_code=manufacturer_code,
        manufacturer=manufacturer,
        quantity=quantity,
        units=units,
    )
    session.add(part)

    await session.commit()
    await session.refresh(part)
    return part


async def create_relation(
        session: AsyncSession,
        zn_number: str,
        post_uuid: str,
) -> ZN_mtm_Post | None:
    if await find_object(
            session,
            ZN_mtm_Post,
            post_uuid=post_uuid,
            zn_number=zn_number):
        return

    relation = ZN_mtm_Post(
        zn_number=zn_number,
        post_uuid=post_uuid,
    )
    session.add(relation)

    await session.commit()
    await session.refresh(relation)
    return relation


async def create_mechanic(
        session: AsyncSession,
        key: str,
        name: str,
        stage: int,
) -> Mechanic:
    mechanic = Mechanic(
        key=key,
        name=name,
        stage=stage,
    )

    session.add(mechanic)

    await session.commit()
    await session.refresh(mechanic)

    return mechanic


async def create_done_log(
        session: AsyncSession,
        by_mechanic: str,
        on_post: str,
        zn_number: str,
        uuid: str,
        type: str,
        new_value: bool,
) -> DoneLog:
    done_log = DoneLog(
        by_mechanic=by_mechanic,
        on_post=on_post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
    )

    session.add(done_log)

    await session.commit()
    await session.refresh(done_log)

    return done_log


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


async def find_object(
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
        by_mechanic: str,
        on_post: str,
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
    await create_done_log(
        session=session,
        by_mechanic=by_mechanic,
        on_post=on_post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value
    )


async def main():
    from core.models.db_helper import db_helper

    async with db_helper.session_factory() as session:
        print(await get_zns_by_post_name(session, "Логинов И.А."))


if __name__ == '__main__':
    asyncio.run(main())