from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase
from .help_classes import ChangeType


class FileChange(ChangeBase, ChangeType):
    uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('files.uuid'),
        primary_key=True,
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False,
    )