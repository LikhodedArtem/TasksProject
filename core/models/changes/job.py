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