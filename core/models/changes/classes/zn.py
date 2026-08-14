from typing import Annotated, Optional

from pydantic import Field
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class ZNChange(ChangeBase, ChangeType):
    number: Mapped[str] = mapped_column(
        String,
        ForeignKey("zns.number"),
        primary_key=True,
    )

    car_vin: Mapped[str] = mapped_column(
        String,
        ForeignKey('cars.vin'),
        nullable=True,
        unique=False,
    )

    date: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    reason: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    recommendation: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    assistant: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    manager: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    class ZNChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        number: Annotated[str, Field(...)]
        car_vin: Annotated[str, Field(default=None, serialization_alias="carVin")]
        date: Annotated[str, Field(default=None)]
        reason: Annotated[str, Field(default=None)]
        recommendation: Annotated[str, Field(default=None)]
        assistant: Annotated[str, Field(default=None)]
        manager: Annotated[str, Field(default=None)]

    as_dict_model = ZNChangeSchema