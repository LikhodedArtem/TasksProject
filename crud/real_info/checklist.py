import asyncio
from uuid import uuid4

from sqlalchemy import select, func, case
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.real_info import (ZN, Checklist, ChecklistRow, ChecklistField,
                                   ChecklistRowValue, ChecklistFieldValue)
from core.models.changes import ZNChange
from crud import find_objects, add_objects


async def get_checklist_start_info(
        session: AsyncSession,
        zn_number: str,
):
    main_stmt = (
        select(ZN)
        .where(ZN.number == zn_number)
        .options(
            joinedload(ZN.car),
        )
        .limit(1)
    )

    zn_info = (await session.execute(main_stmt)).first()[0]
    await session.commit()

    return {
        "last_change_uuid": None,
        "data": {
            "date": zn_info.date,
            "car_reg": zn_info.car.reg,
        }
    }


async def get_marks_count(
        session: AsyncSession,
        zn_number: str,
):
    stmt = (
        select(
            func.count().filter(ChecklistRowValue.value == "red"),
            func.count().filter(ChecklistRowValue.value == "yellow"),
            func.count().filter(ChecklistRowValue.value == "green"),
            func.count().filter(ChecklistRowValue.value == "unstated"),
        ).join(Checklist, Checklist.uuid == ChecklistRowValue.checklist_uuid)
        .where(Checklist.zn_number == zn_number)
    )

    result = await session.execute(stmt)
    answer = result.one()

    return {
        "red": answer[0],
        "yellow": answer[1],
        "green": answer[2],
        "gray": answer[3],
    }


async def create_checklist(
        session: AsyncSession,
        zn_number: str,
):
    checklist_uuid = uuid4()

    checklist = Checklist(
        uuid=checklist_uuid,
        zn_number=zn_number,
    )

    all_rows_stmt = (
        select(ChecklistRow)
        .options(
            joinedload(ChecklistRow.fields),
        )
    )

    result = await session.execute(all_rows_stmt)
    all_rows = result.scalars().unique().all()

    checklist_row_values = []
    checklist_field_values = []

    for row in all_rows:
        row_value_uuid = uuid4()

        checklist_row_values.append(
            ChecklistRowValue(
                uuid=row_value_uuid,
                checklist_uuid=checklist_uuid,
                row_uuid=row.uuid,
            )
        )

        for row_field in row.fields:
            field_value_uuid = uuid4()

            checklist_field_values.append(
                ChecklistFieldValue(
                    uuid=field_value_uuid,
                    row_value_uuid=row_value_uuid,
                    field_uuid=row_field.uuid,
                    value_type=row_field.value_type,
                )
            )

    await add_objects(session, objects=[
        checklist,
        *checklist_row_values,
        *checklist_field_values,
    ])


__all__ = [
    "get_checklist_start_info",
    "create_checklist",
    "get_marks_count",
]