from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import ChangeBase
from .help_classes import ChangeType


class PostChange(ChangeBase, ChangeType):
    uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('posts.uuid'),
        primary_key=True
    )

    main_post_name: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        primary_key=True
    )

    date1: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    date2: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )