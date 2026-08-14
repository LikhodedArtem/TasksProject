from __future__ import annotations

from typing import TYPE_CHECKING, Annotated
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanCreateChange


if TYPE_CHECKING:
    from .zn import ZN


class Post(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "post"


    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True
    )

    main_post_name: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False
    )

    date1: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    date2: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    zns: Mapped[list[ZN]] = relationship(
        secondary="zn_mtm_post",
        back_populates="posts",
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return ["main_post_name", "date1", "date2"]

    class PostSchema(RealInfoBase.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        main_post_name: Annotated[UUID, Field(..., serialization_alias="name")]
        date1: Annotated[str, Field(...)]
        date2: Annotated[str, Field(...)]

    as_dict_model = PostSchema