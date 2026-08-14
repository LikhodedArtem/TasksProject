from typing import Annotated, Optional

from pydantic import Field
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase


class DoneChange(ChangeBase):
    identical_str: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    value: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        unique=False,
    )

    mechanic: Mapped[str] = mapped_column(
        String,
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

    class DoneChangeSchema(ChangeBase.BaseSchema):
        identical_str: Annotated[str, Field(..., serialization_alias="identicalStr")]
        value: Annotated[bool, Field(...)]

    as_dict_model = DoneChangeSchema