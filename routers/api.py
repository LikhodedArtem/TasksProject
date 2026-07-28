from fastapi import APIRouter

from .onec import onec_router
from .web import web_router

api_router = APIRouter(prefix="/api", tags=["api"])

api_router.include_router(onec_router)
api_router.include_router(web_router)


__all__ = ["api_router"]