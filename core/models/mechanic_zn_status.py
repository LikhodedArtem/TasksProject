from __future__ import annotations

from enum import Enum
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Status(str, Enum):
    START = "start"
    PAUSED = "paused"
    STOPPED = "stopped"


class MechanicZNStatus(Base):
    __tablename__ = 'mechanic_zn_statuses'

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        nullable=False,
        unique=False,
    )

    on_post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False,
    )

    at_time: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        default=datetime.now,
    )

    status: Mapped[str] = mapped_column(
        SQLEnum(Status, name="status"),
        nullable=False,
        unique=False,
    )