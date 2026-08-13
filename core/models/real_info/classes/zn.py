from __future__ import annotations

from typing import TYPE_CHECKING, Annotated

from pydantic import Field
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanCreateChange


if TYPE_CHECKING:
    from car import Car
    from post import Post
    from job import Job
    from part import Part


class ZN(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "zn"


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

    car_vin: Mapped[str] = mapped_column(
        String,
        ForeignKey('cars.vin'),
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
        return ["number", "car_vin"]

    @staticmethod
    def for_value() -> list[str]:
        return ["date", "reason", "recommendation", "assistant", "manager"]

    class ZNSchema(RealInfoBase.BaseSchema):
        number: Annotated[str, Field(...)]
        date: Annotated[str, Field(...)]
        reason: Annotated[str, Field(...)]
        recommendation: Annotated[str, Field(...)]
        assistant: Annotated[str, Field(...)]
        manager: Annotated[str, Field(...)]
        car_vin: Annotated[str, Field(...)]

    as_dict_model = ZNSchema