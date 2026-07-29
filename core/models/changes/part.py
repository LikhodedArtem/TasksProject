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