from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Integer, String, ForeignKey, Boolean, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase

if TYPE_CHECKING:
    from .row import ChecklistRow


class ChecklistField(RealInfoBase):
    __tablename__ = "checklist_fields"


    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True
    )

    row_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey("checklist_rows.uuid"),
        unique=False,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        unique=False,
        nullable=False,
    )

    is_required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    unit: Mapped[str | None] = mapped_column(
        String,
        unique=False,
        nullable=True,
    )

    row: Mapped[ChecklistRow] = relationship(
        "ChecklistRow",
        back_populates="fields",
    )


__all__ = ['ChecklistField']