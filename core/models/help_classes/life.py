from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column


class Life:
    is_alive: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.true(),
        default=True,
    )

    death_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
    )