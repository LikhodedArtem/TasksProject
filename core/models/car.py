from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_classes import Life, Stage


if TYPE_CHECKING:
    from .zn import ZN


class Car(Base, Life, Stage):
    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        nullable=False
    )

    win: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    reg: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    model: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    year: Mapped[int] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    millage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=False
    )

    zns: Mapped[list[ZN]] = relationship(
        "ZN",
        back_populates="car",
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["win"]

    @staticmethod
    def for_value() -> list[str]:
        return ["reg", "model", "year", "millage"]

    def as_dict(self):
        return {
            "win": self.win,
            "reg": self.reg,
            "model": self.model,
            "year": self.year,
            "millage": self.millage,
        }

