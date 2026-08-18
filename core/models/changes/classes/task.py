from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import Field, field_serializer
from sqlalchemy import UUID as SQLUUID, ForeignKey, DateTime, func, String
from sqlalchemy.orm import Mapped, mapped_column

from ..base import ChangeBase
from ..help_classes import ChangeType

class TaskChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True,
    )

    to_name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    value: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey("mainposts.name"),
        nullable=True,
        unique=False,
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey("mechanics.name"),
        nullable=True,
        unique=False,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey("zns.number"),
        nullable=True,
        unique=False,
    )

    vin: Mapped[str] = mapped_column(
        String,
        ForeignKey("cars.vin"),
        nullable=True,
        unique=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        unique=False,
    )

    class TaskChangeSchema(ChangeBase.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        value: Annotated[Optional[str], Field(default=None)]
        post: Annotated[Optional[str], Field(default=None)]
        mechanic: Annotated[Optional[str], Field(default=None)]
        zn_number: Annotated[Optional[str], Field(default=None, serialization_alias="znNumber")]
        vin: Annotated[Optional[str], Field(default=None)]
        created_at: Annotated[Optional[datetime], Field(default=None, serialization_alias="createdAt")]

        @field_serializer('uuid')
        def serialize_uuid(self, uuid: UUID, _info) -> str:
            return str(uuid)

        @field_serializer('created_at')
        def serialize_datetime(self, created_at: datetime, _info) -> str:
            return str(created_at)

    as_dict_model = TaskChangeSchema