from enum import Enum

from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column


class ChangeTypeEnum(str, Enum):
    UPDATE = "update"
    CREATE = "create"
    DELETE = "delete"

    def __str__(self):
        return self.value


class ChangeType:
    type: Mapped[str] = mapped_column(
        SQLEnum(ChangeTypeEnum, name="type"),
        nullable=False,
        unique=False
    )


__all__ = ["ChangeType"]