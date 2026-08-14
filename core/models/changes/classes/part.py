from typing import Annotated, Optional
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, Float, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class PartChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey('parts.uuid'),
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    manufacturer_code: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    manufacturer: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    quantity: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )

    units: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    class JobChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        # zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        name: Annotated[Optional[str], Field(default=None)]
        manufacturer_code: Annotated[Optional[str], Field(default=None, serialization_alias="manufacturerCode")]
        manufacturer: Annotated[Optional[str], Field(default=None)]
        quantity: Annotated[Optional[float], Field(default=None)]
        units: Annotated[Optional[str], Field(default=None)]

    as_dict_model = JobChangeSchema