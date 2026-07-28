from datetime import datetime

from sqlalchemy import Boolean, DateTime, func
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
        server_default=func.now(),
        default=datetime.now,
        nullable=False,
        unique=False
    )