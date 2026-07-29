"""Подписка на различные обновления данных на каждой странице."""


from fastapi import APIRouter, Request

from sse.managers import *

sse_router = APIRouter(prefix="/sse", tags=["sse"])


__all__ = ["sse_router"]


@sse_router.get("/first_page")
async def first_page_events(request: Request):
    return first_page_manager.streaming_response(request)

@sse_router.get("/second_page/{post}")
async def second_page_events(request: Request, post: str):
    return second_page_manager.streaming_response(request, post=post)


@sse_router.get("/third_page/{zn_number}")
async def third_page_events(request: Request, zn_number: str):
    return third_page_manager.streaming_response(request, zn_number=zn_number)