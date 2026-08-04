from datetime import datetime
from uuid import UUID

from sqlalchemy import UUID as SQLUUID
from sqlalchemy.orm import Mapped, mapped_column, declared_attr

from ..base import Base


class ChangeBase(Base):
    __abstract__ = True

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return f"{cls.__name__.lower().replace("change", "")}_changes"

    change_uuid: Mapped[str] = mapped_column(
        SQLUUID,
        primary_key=True,
    )

    sse_uuid: Mapped[str] = mapped_column(
        SQLUUID,
        unique=False,
        nullable=False,
    )


__all__ = ['ChangeBase']