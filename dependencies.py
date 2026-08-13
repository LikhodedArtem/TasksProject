from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.db_helper import db_helper


async def get_session() -> AsyncSession:
    async with db_helper.session_factory() as session:
        yield session


def get_client_id(x_client_id: UUID = Header(default=None)) -> UUID | None:
    return x_client_id


def get_change_uuid(x_change_uuid: UUID = Header(default=None)) -> UUID | None:
    return x_change_uuid


GetSession = Annotated[AsyncSession, Depends(get_session)]
GetClientID = Annotated[UUID, Depends(get_client_id)]
GetChangeUUID = Annotated[UUID, Depends(get_client_id)]


5
__all__ = [
    "GetSession",
    "GetClientID",
    "GetChangeUUID"
]