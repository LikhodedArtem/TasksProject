from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, Boolean, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._base import RealInfoBase
from .help_classes import Life, Stage, CanDone


if TYPE_CHECKING:
    from .zn import ZN


class Part(RealInfoBase, Life, Stage, CanDone):
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

    quantity: Mapped[float] = mapped_column(
        Float,
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