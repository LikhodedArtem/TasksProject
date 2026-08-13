from __future__ import annotations

from typing import Annotated

from pydantic import Field
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from core.models.real_info.base import RealInfoBase
from core.models.real_info.help_classes import Life, Stage, CanCreateChange


class MainPost(RealInfoBase, Life, Stage, CanCreateChange):
    change_func = "main_post"


    name: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    territory: Mapped[str] = mapped_column(
        String,
        unique=False,
        nullable=False,
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["name"]

    @staticmethod
    def for_value() -> list[str]:
        return ["territory"]

    class MainPostSchema(RealInfoBase.BaseSchema):
        name: Annotated[str, Field(...)]
        territory: Annotated[str, Field(...)]

    as_dict_model = MainPostSchema