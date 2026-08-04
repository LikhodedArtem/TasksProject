from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import ChangeBase
from .help_classes import ChangeType


class MechanicChange(ChangeBase, ChangeType):
    key: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )