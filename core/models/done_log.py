from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class DoneLog(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    by_mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.key'),
        nullable=False,
        unique=False
    )

    on_post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable = False,
        unique = False
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        nullable=False,
        unique=False
    )

    uuid: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    type: Mapped[str] = mapped_column(
        String,
        nullable = False,
        unique = False
    )

    new_value: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        unique=False
    )

    time: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        default=datetime.now,
        nullable=False,
        unique=False
    )

    def as_dict(self):
        return {
            "id": self.id,
            "by_mechanic": self.by_mechanic,
            "on_post": self.on_post,
            "type": self.type,
            "new_value": self.new_value,
            "time": self.time,
        }