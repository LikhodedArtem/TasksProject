from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .help_classes import Life


class File(Base, Life):
    uuid: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    user_name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    path: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    identical_str: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    author: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False
    )

    on_post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
        server_default=func.now()
    )

    delete_author: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=True,
        unique=False
    )

    delete_on_post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=True,
        unique=False
    )

