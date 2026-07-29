import asyncio
from collections import defaultdict
from typing import Any, Optional

from fastapi import Request
from starlette.responses import StreamingResponse

from .help_functions import make_sse

class SSEManager:
    def __init__(self):
        self._clients: list[asyncio.Queue] = []

    def streaming_response(self, request: Request) -> StreamingResponse:
        return StreamingResponse(
            self.connect(request),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )


    async def connect(self, request: Request):
        queue: asyncio.Queue[str] = asyncio.Queue()
        self._clients.append(queue)

        # Пока что не реализованно
        last_stage = request.headers.get("Last-Event-ID")

        try:
            while True:
                if await request.is_disconnected():
                    break

                try:
                    message = await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    message = make_sse(event="heartbeat")

                yield message
        finally:
            if queue in self._clients:
                self._clients.remove(queue)


    async def broadcast(
            self,
            data: dict[str, Any],
            event: Optional[str] = None,
            id_: Optional[int] = None,
    ):
        if not self._clients: return

        message = make_sse(
            data=data,
            event=event,
            id_=id_
        )

        await asyncio.gather(*(client.put(message) for client in self._clients))