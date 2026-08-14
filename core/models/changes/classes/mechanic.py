from typing import Annotated, Optional

from pydantic import Field
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class MechanicChange(ChangeBase, ChangeType):
    key: Mapped[str] = mapped_column(
        String,
        ForeignKey('mechanics.name'),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    class MechanicChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        key: Annotated[str, Field(...)]
        name: Annotated[Optional[str], Field(default=None)]

    as_dict_model = MechanicChangeSchema