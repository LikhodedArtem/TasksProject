from typing import Annotated, Optional, Any
from uuid import UUID

from pydantic import Field, field_validator
from pydantic_core import PydanticUndefined
from sqlalchemy import String, ForeignKey, UUID as SQLUUID, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType
from core.models.common import FileType


class FileChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        String,
        ForeignKey('files.uuid'),
        primary_key=True,
    )

    user_name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    type: Mapped[str] = mapped_column(
        SQLEnum(FileType, name="type"),
        nullable=True,
        unique=False
    )

    identical_str: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    mechanic: Mapped[str] = mapped_column(
        SQLUUID,
        ForeignKey('mechanics.name'),
        nullable=False,
        unique=False,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        nullable=False,
        unique=False,
    )

    class FileChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        user_name: Annotated[str, Field(...)]
        type: Annotated[FileType, Field(...)]
        identical_str: Annotated[Optional[str], Field(default=None)]

        @field_validator("identical_str", mode="before")
        @classmethod
        def ignore_none(cls, value: Any) -> Any:
            if value is None:
                return PydanticUndefined
            return value


    as_dict_model = FileChangeSchema