from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column


class Stage:
    stage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="1",
        default=1,
    )