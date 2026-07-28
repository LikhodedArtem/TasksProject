from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from ._base import ChangeBase


class DoneChange(ChangeBase):
    identical_str: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=False,
    )

    value: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        unique=False,
    )