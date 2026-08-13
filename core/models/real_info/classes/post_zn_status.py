from __future__ import annotations

from typing import Annotated

from pydantic import Field
from sqlalchemy import String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from core.models.real_info.base import RealInfoBase
from core.models.common import PostZNStatusEnum


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

    class StatusSchema(RealInfoBase.BaseSchema):
        post: Annotated[str, Field(...)]
        zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        mechanic: Annotated[str, Field(...)]
        status: Annotated[str, Field(...)]