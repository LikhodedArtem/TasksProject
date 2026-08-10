from datetime import datetime
from uuid import UUID

from sqlalchemy import UUID as SQLUUID, ForeignKey, DateTime, func, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import RealInfoBase

class Task(RealInfoBase):
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
        nullable=False,
        unique=False,
    )

    post: Mapped[str] = mapped_column(
        String,
        ForeignKey("mainposts.name"),
        nullable=False,
        unique=False,
    )

    mechanic: Mapped[str] = mapped_column(
        String,
        ForeignKey("mechanics.name"),
        nullable=False,
        unique=False,
    )

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey("zns.number"),
        nullable=False,
        unique=False,
    )

    vin: Mapped[str] = mapped_column(
        String,
        ForeignKey("cars.vin"),
        nullable=False,
        unique=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        server_default=func.now(),
        nullable=False,
        unique=False,
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return [
            "to_name",
            "value",
            "post",
            "mechanic",
            "zn_number",
            "vin",
            "created_at",
        ]