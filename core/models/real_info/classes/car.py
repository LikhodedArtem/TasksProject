from __future__ import annotations

from typing import TYPE_CHECKING, Annotated

from pydantic import BaseModel, Field
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanCreateChange


if TYPE_CHECKING:
    from .zn import ZN


class Car(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "car"


    vin: Mapped[str] = mapped_column(
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

    year: Mapped[str] = mapped_column(
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
        return ["vin"]

    @staticmethod
    def for_value() -> list[str]:
        return ["reg", "model", "year", "millage"]

    class CarSchema(RealInfoBase.BaseSchema):
        vin: Annotated[str, Field(...)]
        reg: Annotated[str, Field(...)]
        model: Annotated[str, Field(...)]
        year: Annotated[str, Field(...)]
        millage: Annotated[int, Field(...)]

    as_dict_model = CarSchema