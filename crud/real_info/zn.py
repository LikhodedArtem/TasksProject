from uuid import UUID

from sqlalchemy import select, func, exists, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from core import Names
from core.models.real_info import ZN, Car, Post, ZNmtmPost, MainPost, File
from core.models.changes import ZNChange, CarChange, PostChange
from crud.common import format_change_type_rows


async def get_zns_by_post(
        session: AsyncSession,
        post: str,
):
    zn_last_uuid_stmt = (
        select(func.max(ZNChange.change_uuid))
        .where(
            ZN.number == ZNChange.number,
        )
        .correlate(ZN)
        .scalar_subquery()
    )

    car_last_uuid_stmt = (
        select(func.max(CarChange.change_uuid))
        .where(
            ZN.car_vin == CarChange.vin,
        )
        .correlate(ZN)
        .scalar_subquery()
    )

    posts_last_uuid_stmt = (
        select(func.max(PostChange.change_uuid))
        .where(
            PostChange.main_post_name == post,
        )
        .scalar_subquery()
    )

    stmt = (
        select(
            ZN,
            Post.uuid,
            Post.date1,
            Post.date2,
            zn_last_uuid_stmt,
            car_last_uuid_stmt,
            posts_last_uuid_stmt
        )
        .join(ZNmtmPost, ZNmtmPost.zn_number == ZN.number)
        .join(Post, ZNmtmPost.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(MainPost.name == post)
        .options(joinedload(ZN.car))
        .order_by(Post.date1.asc())
    )

    result = await session.execute(stmt)
    rows = result.all()

    data = {"data": [], "change_uuid": Names.MIN_UUID7}

    for row in rows:
        (
            zn,
            post_uuid,
            date1,
            date2,
            zn_last_uuid,
            car_last_uuid,
            posts_last_uuid
        ) = row

        uuids = [zn_last_uuid, car_last_uuid, posts_last_uuid]
        for i in range(len(uuids)):
            if uuids[i] is None:
                uuids[i] = Names.MIN_UUID7

        dict_zn = zn.as_dict()
        dict_zn["post_uuid"] = post_uuid
        dict_zn["car"] = zn.car.as_dict()
        dict_zn["date1"] = date1
        dict_zn["date2"] = date2

        data["data"].append(dict_zn)
        data["change_uuid"] = max(
            *uuids,
            data["change_uuid"],
        )

    return data


async def get_zns_changes_by_post(
        session: AsyncSession,
        post: str,
        client_id: UUID | str,
        last_uuid: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    posts_changes_stmt = (
        select(PostChange)
        .where(
            PostChange.main_post_name == post,
            PostChange.change_uuid > last_uuid,
            PostChange.sse_uuid != client_id,
        )
    )

    car_changes_stmt = (
        select(CarChange)
        .join(ZN, ZN.car_vin == CarChange.vin)
        .join(ZNmtmPost, ZNmtmPost.zn_number == ZN.number)
        .join(Post, ZNmtmPost.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(
            MainPost.name == post,
            CarChange.change_uuid > last_uuid,
            CarChange.sse_uuid != client_id,
        )
    )

    zn_changes_stmt = (
        select(ZNChange, Post.uuid.label("post_uuid"))
        .join(ZN, ZN.number == ZNChange.number)
        .join(ZNmtmPost, ZNmtmPost.zn_number == ZN.number)
        .join(Post, ZNmtmPost.post_uuid == Post.uuid)
        .join(MainPost, MainPost.name == Post.main_post_name)
        .where(
            MainPost.name == post,
            ZNChange.change_uuid > last_uuid,
            ZNChange.sse_uuid != client_id,
        )
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        car_changes_raw = (await session.execute(car_changes_stmt)).all()
        zn_changes_raw = (await session.execute(zn_changes_stmt)).all()
        posts_changes_raw = (await session.execute(posts_changes_stmt)).all()

    suggest_uuid1, car_changes = format_change_type_rows(car_changes_raw, "vin")
    suggest_uuid2, zn_changes = format_change_type_rows(zn_changes_raw, "number")
    suggest_uuid3, posts_changes = format_change_type_rows(posts_changes_raw, "uuid")

    change_uuid = max(last_uuid, suggest_uuid1, suggest_uuid2, suggest_uuid3)

    result = {
        "data": {
            "car_changes": car_changes,
            "zn_changes": zn_changes,
            "posts_changes": posts_changes
        },
        "change_uuid": change_uuid,
    }

    return result


async def get_zn(
        session: AsyncSession,
        zn_number: str,
):
    zn_has_files = exists().where(
        File.is_alive.is_(True),
        File.zn_number == zn_number,
        File.type == "zn",
    ).label("zn_has_files")

    rec_has_files = exists().where(
        File.is_alive.is_(True),
        File.zn_number == zn_number,
        File.type == "rec",
    ).label("rec_has_files")

    zn_last_change_uuid = (
        select(func.max(ZNChange.change_uuid))
        .where(ZNChange.number == zn_number)
        .scalar_subquery()
    )

    car_last_change_uuid = (
        select(func.max(CarChange.change_uuid))
        .where(CarChange.vin == ZN.car_vin)
        .correlate(ZN)
        .scalar_subquery()
    )

    last_change_uuid_stmt = case(
        (car_last_change_uuid.is_(None), zn_last_change_uuid),
        (zn_last_change_uuid.is_(None), car_last_change_uuid),
        (zn_last_change_uuid >= car_last_change_uuid, zn_last_change_uuid),
        else_=car_last_change_uuid,
    ).label("change_uuid")

    stmt = (
        select(
            ZN,
            zn_has_files,
            rec_has_files,
            last_change_uuid_stmt
        )
        .where(ZN.number == zn_number)
        .options(joinedload(ZN.car))
        .limit(1)
    )

    result = await session.execute(stmt)
    data = result.first()

    if data is None or data.ZN.is_alive is False:
        return None

    zn, zn_has_files, rec_has_files, last_change_uuid = data

    dict_zn = zn.as_dict()
    dict_zn["car"] = zn.car.as_dict()
    dict_zn["zn_has_files"] = zn_has_files
    dict_zn["rec_has_files"] = rec_has_files

    return {"data": dict_zn, "last_change_uuid": last_change_uuid}


async def get_zn_changes(
        session: AsyncSession,
        zn_number: str,
        last_uuid: UUID | str,
        client_id: UUID | str,
):
    if type(last_uuid) is str:
        last_uuid = UUID(last_uuid)
    if type(client_id) is str:
        client_id = UUID(client_id)

    car_changes_stmt = (
        select(CarChange)
        .join(ZN, CarChange.vin == ZN.number)
        .where(
            ZN.number == zn_number,
            CarChange.change_uuid > last_uuid,
            CarChange.sse_uuid != client_id,
        )
    )

    zn_changes_stmt = (
        select(ZNChange)
        .join(ZN, ZNChange.number == ZN.number)
        .where(
            ZNChange.number == zn_number,
            ZNChange.change_uuid > last_uuid,
            ZNChange.sse_uuid != client_id,
        )
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        car_changes_raw = (await session.execute(car_changes_stmt)).all()
        zn_changes_raw = (await session.execute(zn_changes_stmt)).all()

    suggest_uuid1, car_changes = format_change_type_rows(car_changes_raw, "vin")
    suggest_uuid2, zn_changes = format_change_type_rows(zn_changes_raw, "number")

    last_change_uuid = max(last_uuid, suggest_uuid1, suggest_uuid2)

    result = {
        "car_changes": car_changes,
        "zn_changes": zn_changes,
        "last_change_uuid": last_change_uuid,
    }

    return result


async def get_current_zn_stage(
        session: AsyncSession,
        number: str,
) -> int:
    stmt = select(ZN.stage).where(ZN.number == number)

    result = await session.execute(stmt)
    stage = result.scalar_one_or_none()

    return stage if stage is not None else 0


__all__ = [
    "get_zns_by_post",
    "get_zns_changes_by_post",

    "get_zn",
    "get_zn_changes",

    "get_current_zn_stage",
]