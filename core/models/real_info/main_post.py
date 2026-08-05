from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .base import RealInfoBase
from .help_classes import Life, Stage, CanCreateChange


class MainPost(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "main_post"


    name: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    territory: Mapped[str] = mapped_column(
        String,
        unique=False,
        nullable=False,
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["name"]

    @staticmethod
    def for_value() -> list[str]:
        return ["territory"]