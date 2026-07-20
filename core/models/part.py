from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .help_classes import Life, Stage, CanDone


if TYPE_CHECKING:
    from .zn import ZN


class Part(Base, Life, Stage, CanDone):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    uuid: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        unique=False,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    manufacturer_code: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    manufacturer: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=False
    )

    units: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    zn: Mapped[ZN] = relationship(
        "ZN",
        back_populates="parts"
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
        return [
            "name",
            "manufacturer_code",
            "manufacturer",
            "quantity",
            "units"
        ]

    def as_dict(self):
        return {
            "name": self.name,
            "manufacturer_code": self.manufacturer_code,
            "manufacturer": self.manufacturer,
            "quantity": self.quantity,
            "units": self.units,
            "done": self.done,
        }