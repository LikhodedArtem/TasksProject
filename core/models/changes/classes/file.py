from typing import Annotated
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class FileChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        String,
        ForeignKey('files.uuid'),
        primary_key=True,
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

    as_dict_model = FileChangeSchema