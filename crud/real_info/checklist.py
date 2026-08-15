from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.real_info import ZN
from core.models.changes import ZNChange


async def get_checklist(
        session: AsyncSession,
        zn_number: str,
):
    last_change_stmt = (
        select(func.max(ZNChange.change_uuid))
        .where(ZNChange.number == zn_number)
    )

    main_stmt = (
        select(ZN)
        .where(ZN.number == zn_number)
        .options(
            joinedload(ZN.car),
        )
        .limit(1)
    )

    async with session.begin():
        await session.connection(execution_options={"isolation_level": "SERIALIZABLE"})

        last_change_uuid = await session.execute(last_change_stmt)
        zn_info = (await session.execute(main_stmt)).first()[0]

    return {
        "last_change_uuid": None,
        "data": {
            "date": zn_info.date,
            "car_reg": zn_info.car.reg,
        }
    }


__all__ = [
    "get_checklist"
]