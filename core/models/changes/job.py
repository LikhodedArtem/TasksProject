from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase
from .help_classes import ChangeType


class JobChange(ChangeBase, ChangeType):
    uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('jobs.uuid'),
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True,
    )

    number: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    normal_time: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )