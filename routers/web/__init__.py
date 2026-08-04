from fastapi import APIRouter

from .files import files_router
from .info import info_router
from .sse import sse_router


web_router = APIRouter(prefix="/web", tags=["web"])

web_router.include_router(files_router)
web_router.include_router(info_router)
web_router.include_router(sse_router)


@web_router.head("/")
async def head():
    pass


__all__ = ["web_router"]