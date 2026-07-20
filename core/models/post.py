from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_classes import Life, Stage


if TYPE_CHECKING:
    from .zn import ZN


class Post(Base, Life, Stage):
    uuid: Mapped[str] = mapped_column(
        String,
        primary_key=True
    )

    main_post_name: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False
    )

    date1: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    date2: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    zns: Mapped[list[ZN]] = relationship(
        secondary="zn_mtm_post",
        back_populates="posts",
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return ["main_post_name", "date1", "date2"]