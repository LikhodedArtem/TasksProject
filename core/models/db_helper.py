from asyncio import current_task
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    async_scoped_session,
)

from core.config import settings


class DatabaseHelper:
    def __init__(self, url: str, echo: bool = False):
        self.engine = create_async_engine(
            url=url,
            echo=echo,
        )
        self.session_factory = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    scoped_session = None

    def get_scoped_session(self):
        if DatabaseHelper.scoped_session is None:
            DatabaseHelper.scoped_session = async_scoped_session(
                session_factory=self.session_factory,
                scopefunc=current_task,
            )
        return DatabaseHelper.scoped_session

    async def session_dependency(self) -> AsyncSession:
        async with self.session_factory() as session:
            yield session

    async def scoped_session_dependency(self) -> AsyncSession:
        session = self.get_scoped_session()
        yield session


db_helper = DatabaseHelper(
    url=settings.db.url,
    echo=settings.db.echo,
)
