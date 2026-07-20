from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_classes import Life, Stage


if TYPE_CHECKING:
    from car import Car
    from post import Post
    from job import Job
    from part import Part


class ZN(Base, Life, Stage):
    number: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    date: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    reason: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    recommendation: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    assistant: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    manager: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    car: Mapped[Car] = relationship(
        "Car",
        back_populates="zns"
    )

    posts: Mapped[list[Post]] = relationship(
        secondary="zn_mtm_post",
        back_populates="zns",
    )

    jobs: Mapped[list[Job]] = relationship(
        back_populates="zn",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    parts: Mapped[list[Part]] = relationship(
        back_populates="zn",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["number"]

    @staticmethod
    def for_value() -> list[str]:
        return ["date", "reason", "recommendation", "assistant", "manager"]
