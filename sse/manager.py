import asyncio
from collections import defaultdict
from typing import Any, Optional, AsyncGenerator

from fastapi import Request, HTTPException
from uuid import uuid4, UUID
from starlette.responses import StreamingResponse

from .help_functions import make_sse

class SSEManager:
    _ALL = object()

    def __init__(self):
        self._clients: dict[UUID, asyncio.Queue] = dict()
        self._events: defaultdict[str, defaultdict[str, set[UUID]]] = defaultdict(lambda: defaultdict(set))
        self._subscriptions: defaultdict[UUID, set[tuple[str, str]]] = defaultdict(set)

    def subscribe(self, uuid: UUID) -> None:
        if uuid not in self._clients:
            self._clients[uuid] = asyncio.Queue()

    def unsubscribe(self, uuid: UUID) -> None:
        self._clients.pop(uuid, None)

        for event, add_info in self._subscriptions.pop(uuid, ()):
            bucket = self._events.get(event, {}).get(add_info)
            if bucket and uuid in bucket:
                bucket.remove(uuid)

    def subscribe_event(
            self,
            uuid: UUID,
            event: str,
            add_info: Optional[str] = None,
    ) -> None:
        if add_info is None:
            add_info = SSEManager._ALL

        self._events[event][add_info].add(uuid)

        self._subscriptions[uuid].add((event, add_info))

    def unsubscribe_event(
            self,
            uuid: UUID,
            event: str,
            add_info: Optional[str] = None,
    ) -> None:
        if add_info is None:
            add_info = SSEManager._ALL

        bucket = self._events.get(event, {}).get(add_info)
        if bucket and uuid in bucket:
            bucket.remove(uuid)

        self._subscriptions[uuid].discard((event, add_info))


    def streaming_response(self, request: Request, client_uuid: UUID) -> StreamingResponse:
        if client_uuid not in self._clients:
            raise HTTPException(status_code=404, detail=f"Client {client_uuid} not found")

        return StreamingResponse(
            self.connect(request, client_uuid),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )


    async def connect(self, request: Request, client_uuid: UUID) -> AsyncGenerator[str, None]:
        # Пока что не реализованно
        # last_stage = request.headers.get("Last-Event-ID")

        try:
            while True:
                if await request.is_disconnected():
                    break

                try:
                    message = await asyncio.wait_for(self._clients[client_uuid].get(), timeout=15)
                except asyncio.TimeoutError:
                    message = make_sse(event="heartbeat")
                except KeyError:
                    break

                yield message
        finally:
            self.unsubscribe(client_uuid)


    async def broadcast(
            self,
            data: dict[str, Any],
            event: str,
            broadcast_event: str,
            add_info: Optional[str] = None,
            id_: Optional[int] = None,
            broadcast_all: bool = False,
            author: str | None = None,
    ):
        print(self._clients)

        if not self._clients: return

        if not broadcast_all:
            if broadcast_event not in self._events:
                return

            if add_info is None:
                add_info = SSEManager._ALL

            if add_info not in self._events[broadcast_event]:
                return

            current_clients = self._events[broadcast_event][add_info]
        else:
            current_clients = self._clients

        message = make_sse(
            data=data,
            event=event,
            id_=id_
        )

        tasks = set()

        for client_uuid in current_clients:
            if (client_uuid not in self._clients) or (client_uuid == author):
                continue

            tasks.add(self._clients[client_uuid].put(message))

        if not tasks:
            return

        await asyncio.gather(*tasks)