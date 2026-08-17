from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Enum as SQLEnum, UUID as SQLUUID, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase

if TYPE_CHECKING:
    from .checklist import Checklist
    from .row import ChecklistRow
    from .field_value import ChecklistFieldValue


class ChecklistRowValueEnum(str, Enum):
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    UNSTATED = "unstated"


class ChecklistRowValue(RealInfoBase):
    __tablename__ = "checklist_row_values"
    __table_args__ = (
        UniqueConstraint(
            "checklist_uuid",
            "row_uuid",
        ),
    )


    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True
    )

    checklist_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey(
            "checklists.uuid",
            ondelete="CASCADE",
        ),
        unique=False,
        nullable=False,
    )

    row_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey("checklist_rows.uuid"),
        unique=False,
        nullable=False,
    )

    value: Mapped[ChecklistRowValueEnum] = mapped_column(
        SQLEnum(
            ChecklistRowValueEnum,
            name="value"
        ),
        default=ChecklistRowValueEnum.UNSTATED,
        unique=False,
        nullable=False,
    )

    checklist: Mapped[Checklist] = relationship(
        "Checklist",
        back_populates="values",
    )

    row: Mapped[ChecklistRow] = relationship(
        'ChecklistRow',
        viewonly=True,
    )

    fields_values: Mapped[list[ChecklistFieldValue]] = relationship(
        'ChecklistFieldValue',
        lazy="selectin",
        cascade="all, delete-orphan",
        back_populates="row_value",
    )


__all__ = ['ChecklistRowValue']