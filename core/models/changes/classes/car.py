from typing import Annotated, Optional

from pydantic import Field
from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class CarChange(ChangeBase, ChangeType):
    vin: Mapped[str] = mapped_column(
        String,
        ForeignKey('cars.vin'),
        primary_key=True,
    )

    reg: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    model: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    year: Mapped[int] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    millage: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
        unique=False
    )

    class CarChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        vin: Annotated[str, Field(...)]
        reg: Annotated[Optional[str], Field(default=None)]
        model: Annotated[Optional[str], Field(default=None)]
        year: Annotated[Optional[int], Field(default=None)]
        millage: Annotated[Optional[int], Field(default=None)]

    as_dict_model = CarChangeSchema