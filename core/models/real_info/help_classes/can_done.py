from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column


class CanDone:
    done: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.false(),
        default=False,
    )