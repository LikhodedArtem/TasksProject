from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import ChangeBase
from .help_classes import ChangeType


class ZNChange(ChangeBase, ChangeType):
    number: Mapped[str] = mapped_column(
        String,
        ForeignKey("zns.number"),
        primary_key=True,
    )

    car_vin: Mapped[str] = mapped_column(
        String,
        ForeignKey('cars.vin'),
        nullable=True,
        unique=False,
    )

    date: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    reason: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    recommendation: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    assistant: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    manager: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )