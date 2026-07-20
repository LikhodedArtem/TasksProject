from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, Boolean, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_classes import Life, Stage, CanDone


if TYPE_CHECKING:
    from .zn import ZN


class Job(Base, Life, Stage, CanDone):
    uuid: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        unique=False,
    )

    number: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        unique=False
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    normal_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        unique=False
    )

    zn: Mapped[ZN] = relationship(
        "ZN",
        back_populates="jobs"
    )

    done: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.false(),
        default=False
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return ["number", "name", "normal_time"]

    def as_dict(self):
        return {
            "number": self.number,
            "name": self.name,
            "normal_time": self.normal_time,
            "done": self.done,
        }