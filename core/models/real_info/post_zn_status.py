from __future__ import annotations

from enum import Enum
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import RealInfoBase
from ..common import PostZNStatusEnum


class PostZNStatus(RealInfoBase):
    __tablename__ = 'post_zn_statuses'

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        primary_key=True
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False,
    )

    status: Mapped[str] = mapped_column(
        SQLEnum(PostZNStatusEnum, name="status"),
        nullable=False,
        unique=False,
    )