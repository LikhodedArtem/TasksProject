from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .help_classes import Life, Stage


class ZN_mtm_Post(Base, Life, Stage):
    __tablename__ = 'zn_mtm_post'

    zn_number: Mapped[str] = mapped_column(
        String,
        ForeignKey('zns.number'),
        primary_key=True
    )

    post_uuid: Mapped[str] = mapped_column(
        String,
        ForeignKey('posts.uuid'),
        primary_key=True
    )

    @staticmethod
    def for_find() -> list[str]:
        return ["zn_number", "post_uuid"]

    @staticmethod
    def for_value() -> list[str]:
        return ["post_uuid",]