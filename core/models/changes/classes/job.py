from typing import Annotated, Optional
from uuid import UUID

from pydantic import Field
from sqlalchemy import String, ForeignKey, Float, UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.models.changes.base import ChangeBase
from core.models.changes.help_classes import ChangeType


class JobChange(ChangeBase, ChangeType):
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        ForeignKey('jobs.uuid'),
        primary_key=True,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True,
    )

    number: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=True,
        unique=False
    )

    normal_time: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        unique=False
    )

    class JobChangeSchema(ChangeBase.BaseSchema, ChangeType.BaseSchema):
        uuid: Annotated[UUID, Field(...)]
        # zn_number: Annotated[str, Field(..., serialization_alias="znNumber")]
        number: Annotated[Optional[float], Field(default=None)]
        name: Annotated[Optional[str], Field(default=None)]
        normal_time: Annotated[Optional[float], Field(default=None)]

    as_dict_model = JobChangeSchema