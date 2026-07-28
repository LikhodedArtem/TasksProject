"""Подписка на различные обновления данных на каждой странице."""


from fastapi import APIRouter, Request

from sse.managers import *

sse_router = APIRouter(prefix="/sse", tags=["sse"])


__all__ = ["sse_router"]


@sse_router.get("/info/events/first_page")
async def first_page_events(request: Request):
    return first_page_manager.streaming_response(request)

@sse_router.get("/info/events/second_page")
async def second_page_events(request: Request):
    return second_page_manager.streaming_response(request)


@sse_router.get("/info/events/third_page")
async def third_page_events(request: Request):
    return third_page_manager.streaming_response(request)