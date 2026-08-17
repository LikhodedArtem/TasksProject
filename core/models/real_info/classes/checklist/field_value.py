from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (ForeignKey, UUID as SQLUUID,
                        String, Integer, Numeric, Boolean,
                        UniqueConstraint, CheckConstraint,
                        Enum as SQLEnum)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase

if TYPE_CHECKING:
    from .field import ChecklistField
    from .row_value import ChecklistRowValue


class ChecklistFieldValueEnum(str, Enum):
    INTEGER = 'integer'
    NUMERIC = 'numeric'
    BOOLEAN = 'boolean'
    STRING = 'string'


class ChecklistFieldValue(RealInfoBase):
    __tablename__ = "checklist_field_values"
    __table_args__ = (
        UniqueConstraint(
            "row_value_uuid",
            "field_uuid",
        ),
        CheckConstraint(
            """
            (
                value_type = 'INTEGER'
                AND numeric_value IS NULL
                AND boolean_value IS NULL
                AND string_value IS NULL
            )
            OR
            (
                value_type = 'NUMERIC'
                AND integer_value IS NULL
                AND boolean_value IS NULL
                AND string_value IS NULL
            )
            OR
            (
                value_type = 'BOOLEAN'
                AND integer_value IS NULL
                AND numeric_value IS NULL
                AND string_value IS NULL
            )
            OR
            (
                value_type = 'STRING'
                AND integer_value IS NULL
                AND numeric_value IS NULL
                AND boolean_value IS NULL
            )
            """,
            name="ck_checklist_field_type_eq_value"
        )
    )

    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True
    )

    row_value_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey(
            "checklist_row_values.uuid",
            ondelete="CASCADE",
        ),
        unique=False,
        nullable=False,
    )

    field_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey("checklist_fields.uuid"),
        unique=False,
        nullable=False,
    )

    value_type: Mapped[ChecklistFieldValueEnum] = mapped_column(
        SQLEnum(
            ChecklistFieldValueEnum,
            name="value_type",
        ),
        unique=False,
        nullable=False,
    )

    integer_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    float_value: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    boolean_value: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    string_value: Mapped[str | None] = mapped_column(String, nullable=True)

    row_value: Mapped[ChecklistRowValue] = relationship(
        "ChecklistRowValue",
        back_populates="fields_values",
    )

    field: Mapped[ChecklistField] = relationship(
        'ChecklistField',
        viewonly=True,
    )


__all__ = ['ChecklistFieldValue']