from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase
from .help_classes import ChangeType


class PartChange(ChangeBase, ChangeType):
    uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('parts.uuid'),
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    manufacturer_code: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    manufacturer: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    quantity: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )

    units: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )