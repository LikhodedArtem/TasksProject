from __future__ import annotations

from enum import Enum

from sqlalchemy import Integer, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Change1CType(Enum):
    COMMON = "COMMON"



class ChangeType(Enum):
    UPDATE = "update"
    CREATE = "create"
    DELETE = "delete"


class ChangeDataType(Enum):
    ZN_INFO = "zn_info"
    CAR = "car"
    MECHANIC = "mechanic"
    POST = "post"
    DONE = "done"
    FILE = "file"


class Change(Base):
    type: Mapped[str] = mapped_column(
        SQLEnum(ChangeType, name="type"),
        nullable=False,
        unique=False
    )

    data_type: Mapped[str] = mapped_column(
        SQLEnum(ChangeDataType, name="data_type"),
        nullable=False,
        unique=False
    )

    time: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=False
    )