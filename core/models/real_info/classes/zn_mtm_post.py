from typing import Annotated

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from pydantic import Field
from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage


class ZN_mtm_Post(RealInfoBase, Life, Stage):
    __tablename__ = 'zn_mtm_post'

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True
    )

    post_uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('posts.uuid'),
        primary_key=True
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["zn_number", "post_uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return ["post_uuid",]

    class ZNmtmPostSchema(RealInfoBase.BaseSchema):
        zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        post_uuid: Annotated[str, Field(..., serialization_alias="postUUID")]