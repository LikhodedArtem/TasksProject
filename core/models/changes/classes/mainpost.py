from typing import Annotated, Optional

from pydantic import Field
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class MainPostChange(ChangeBase, ChangeType):
    name: Mapped[str] = mapped_column(
        String,
        ForeignKey("mainposts.name"),
        primary_key=True,
    )

    territory: Mapped[str] = mapped_column(
        String,
        unique=False,
        nullable=True,
    )

    class MainPostChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        name: Annotated[str, Field(...)]
        territory: Annotated[Optional[str], Field(default=None)]

    as_dict_model = MainPostChangeSchema