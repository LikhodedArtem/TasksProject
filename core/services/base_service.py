from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    def __init__(self, session: AsyncSession, background_tasks: BackgroundTasks | None = None) -> None:
        self.session = session
        self.background_tasks = background_tasks


__all__ = ['BaseService']