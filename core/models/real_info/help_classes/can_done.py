from typing import Annotated

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, func
from sqlalchemy.orm import Mapped, mapped_column


class CanDone:
    class BaseSchema(BaseModel):
        done: Annotated[bool, Field(...)]

    done: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.false(),
        default=False,
    )