from enum import Enum
from typing import Annotated

from pydantic import BaseModel, Field
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column


class ChangeTypeEnum(str, Enum):
    UPDATE = "update"
    CREATE = "create"
    DELETE = "delete"

    def __str__(self):
        return self.value


class ChangeType:
    class BaseSchema(BaseModel):
        type: Annotated[ChangeTypeEnum, Field(...)]

    type: Mapped[str] = mapped_column(
        SQLEnum(ChangeTypeEnum, name="type"),
        nullable=False,
        unique=False
    )


__all__ = ["ChangeType"]