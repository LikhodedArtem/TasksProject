from __future__ import annotations

from typing import Annotated

from pydantic import Field
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanCreateChange


class Mechanic(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "mechanic"


    key: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["key"]

    @staticmethod
    def for_value() -> list[str]:
        return ["name"]

    class MechanicSchema(RealInfoBase.BaseSchema):
        key: Annotated[str, Field(...)]
        name: Annotated[str, Field(...)]

    as_dict_model = MechanicSchema