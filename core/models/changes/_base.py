from datetime import datetime
from uuid import UUID

from sqlalchemy import UUID as SQLUUID, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, declared_attr

from ..base import Base


class ChangeBase(Base):
    __abstract__ = True

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return f"{cls.__name__.lower().replace("change", "")}_changes"

    change_uuid: Mapped[UUID] = mapped_column(
        SQLUUID,
        primary_key=True,
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        default=datetime.now,
        nullable=False,
        unique=False,
    )


__all__ = ['ChangeBase']