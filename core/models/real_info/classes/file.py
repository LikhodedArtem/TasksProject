from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any, Optional
from uuid import UUID

from pydantic import Field, field_validator
from pydantic_core import PydanticUndefined
from sqlalchemy import String, ForeignKey, DateTime, func, Enum as SQLEnum, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life
from core.models.common import FileType


class File(RealInfoBase, Life):
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
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

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey("zns.number"),
        nullable=False,
        unique=False
    )

    type: Mapped[str] = mapped_column(
        SQLEnum(FileType, name="type"),
        nullable=False,
        unique=False
    )

    identical_str: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False
    )

    time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
        server_default=func.now()
    )

    class FileSchema(RealInfoBase.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        user_name: Annotated[str, Field(..., serialization_alias="userName")]
        type: Annotated[FileType, Field(...)]
        identical_str: Annotated[Optional[str], Field(default=None, serialization_alias="identicalStr")]

        # @field_validator("identical_str", mode="before")
        # @classmethod
        # def ignore_none(cls, value: Any) -> Any:
        #     if value is None:
        #         return PydanticUndefined
        #     return value

    as_dict_model = FileSchema