from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from ._base import RealInfoBase


class Done(RealInfoBase):
    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.key'),
        primary_key=True,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        nullable=False,
        unique=False
    )

    identical_str: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    type: Mapped[str] = mapped_column(
        String,
        nullable = False,
        unique = False
    )

    value: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        unique=False
    )