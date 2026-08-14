from datetime import datetime
from typing import Annotated, Any
from uuid import UUID

from pydantic import Field, model_validator
from sqlalchemy import UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, declared_attr

from ..base import Base


class ChangeBase(Base):
    __abstract__ = True

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return f"{cls.__name__.lower().replace("change", "")}_changes"

    class BaseSchema(Base.BaseSchema):
        change_uuid: Annotated[UUID, Field(..., serialization_alias="changeUUID")]
        sse_uuid: Annotated[UUID, Field(..., serialization_alias="sseUUID")]

    change_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True,
    )

    sse_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        unique=False,
        nullable=False,
    )


__all__ = ['ChangeBase']