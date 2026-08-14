from typing import Annotated

from pydantic import Field
from sqlalchemy import String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.common import PostZNStatusEnum


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

    class StatusChangeSchema(ChangeBase.BaseSchema):
        # zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        # post: Annotated[str, Field(...)]
        status: Annotated[PostZNStatusEnum, Field(...)]

    as_dict_model = StatusChangeSchema