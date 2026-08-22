from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import String, ForeignKey, UUID as SQLUUID, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase

if TYPE_CHECKING:
    from ..zn import ZN
    from .row_value import ChecklistRowValue


class Checklist(RealInfoBase):
    __tablename__ = "checklists"

    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        unique=True,
    )

    is_closed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        unique=False,
    )

    close_post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=True,
        unique=False,
    )

    close_mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=True,
        unique=False,
    )

    zn: Mapped[ZN] = relationship(
        'ZN',
        back_populates='checklist',
    )

    values: Mapped[list[ChecklistRowValue]] = relationship(
        'ChecklistRowValue',
        cascade="all, delete-orphan",
        back_populates='checklist',
    )


__all__ = ["Checklist"]