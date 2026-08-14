from __future__ import annotations

from typing import TYPE_CHECKING, Annotated
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, Float, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanDone, CanCreateChange


if TYPE_CHECKING:
    from .zn import ZN


class Job(RealInfoBase, Life, Stage, CanDone, CanCreateChange):
    change_func = "job"


    uuid: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        unique=False,
        nullable=False,
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

    @staticmethod
    def for_find() -> list[str]:
        return ["uuid", "zn_number"]

    @staticmethod
    def for_value() -> list[str]:
        return ["number", "name", "normal_time"]


    class JobSchema(RealInfoBase.BaseSchema, CanDone.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        number: Annotated[float, Field(...)]
        name: Annotated[str, Field(...)]
        normal_time: Annotated[float, Field(..., serialization_alias="normalTime")]

    as_dict_model = JobSchema