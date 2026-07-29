from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase
from .help_classes import ChangeType


class MainPostChange(ChangeBase, ChangeType):
    name: Mapped[str] = mapped_column(
        String,
        ForeignKey("mainposts.name"),
        primary_key=True,
    )

    territory: Mapped[str] = mapped_column(
        String,
        unique=False,
        nullable=False,
    )