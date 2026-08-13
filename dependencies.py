from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.db_helper import db_helper


async def get_session() -> AsyncSession:
    async with db_helper.session_factory() as session:
        yield session


GetSession = Annotated[AsyncSession, Depends(get_session)]


__all__ = ['GetSession']