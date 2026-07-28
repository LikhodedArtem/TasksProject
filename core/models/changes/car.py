from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase
from .help_classes import ChangeType


class CarChange(ChangeRealInfoBase, ChangeType):
    vin: Mapped[str] = mapped_column(
        String,
        ForeignKey('cars.vin'),
        primary_key=True,
    )

    reg: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    model: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    year: Mapped[int] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    millage: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
        unique=False
    )