from sqlalchemy import String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from .base import ChangeBase
from ..common import PostZNStatusEnum


class StatusChange(ChangeBase):
    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('post_zn_statuses.zn_number'),
        primary_key=True,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('post_zn_statuses.post'),
        primary_key=True,
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