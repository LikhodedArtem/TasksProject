from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ._base import RealInfoBase
from .help_classes import Life, Stage


class Mechanic(RealInfoBase, Life, Stage):
    key: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["key"]

    @staticmethod
    def for_value() -> list[str]:
        return ["name"]

    def as_dict(self):
        return {
            "key": self.key,
            "name": self.name,
            "is_alive": self.is_alive,
        }