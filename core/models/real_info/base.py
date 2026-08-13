from pydantic import BaseModel, ConfigDict

from sqlalchemy.orm import declared_attr

from ..base import Base


class RealInfoBase(Base):
    __abstract__ = True

    class BaseSchema(Base.BaseSchema):
        pass

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return f"{cls.__name__.lower()}s"


__all__ = ['RealInfoBase']