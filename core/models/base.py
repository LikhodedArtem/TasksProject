from typing import ClassVar

from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    __abstract__ = True

    class BaseSchema(BaseModel):
        model_config = ConfigDict(from_attributes=True, frozen=True)

    as_dict_model: ClassVar[BaseModel | None] = None

    def as_pydantic_model(self) -> BaseModel:
        return type(self).as_dict_model.model_validate(self, by_alias=True)

    def as_dict(self) -> dict:
        return self.as_pydantic_model().model_dump(by_alias=True)

    def as_json(self) -> str:
        return self.as_pydantic_model().model_dump_json(by_alias=True)
