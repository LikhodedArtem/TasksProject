from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Integer, String, Enum as SQLEnum, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase

if TYPE_CHECKING:
    from .field import ChecklistField


class ChecklistGroup(str, Enum):
    POSITION_1 = "pos1"
    POSITION_2 = "pos2"
    POSITION_3 = "pos3"


class ChecklistRow(RealInfoBase):
    __tablename__ = "checklist_rows"


    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True
    )

    group: Mapped[ChecklistGroup] = mapped_column(
        SQLEnum(
            ChecklistGroup,
            name="checklist_row_group"
        ),
        unique=False,
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String,
        unique=False,
        nullable=False,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        unique=False,
        nullable=False,
    )

    fields: Mapped[list[ChecklistField]] = relationship(
        'ChecklistField',
        back_populates="row",
    )


__all__ = ['ChecklistRow']