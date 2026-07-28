from __future__ import annotations

from enum import Enum

from sqlalchemy import Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from ._base import RealInfoBase


class ChangeType(str, Enum):
    UPDATE = "update"
    CREATE = "create"
    DELETE = "delete"


class ChangeDataType(str, Enum):
    ZN_INFO = "zn_info"
    CAR = "car"
    MECHANIC = "mechanic"
    POST = "post"
    DONE = "done"
    FILE = "file"


class Change(RealInfoBase):
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