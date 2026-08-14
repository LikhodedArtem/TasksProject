from typing import Annotated, Optional
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class PostChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey('posts.uuid'),
        primary_key=True
    )

    main_post_name: Mapped[str] = mapped_column(
        String,
        ForeignKey('mainposts.name'),
        primary_key=True
    )

    date1: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    date2: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    class PostChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        main_post_name: Annotated[UUID, Field(..., serialization_alias="name")]
        date1: Annotated[Optional[str], Field(...)]
        date2: Annotated[Optional[str], Field(...)]

    as_dict_model = PostChangeSchema