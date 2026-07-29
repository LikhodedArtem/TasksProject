import json
from typing import Any


def make_sse(
        data: dict[str, Any] | None = None,
        event: str | None = None,
        id_: int | None = None,
) -> str:
    parts = []

    if event is not None:
        parts.append(f"event: {event}")

    if data:
        parts.append(f"data: {json.dumps(data, ensure_ascii=False)}")
    else:
        parts.append("data: {}")

    if id_ is not None:
        parts.append(f"id: {id_}")

    return "\n".join(parts) + "\n\n"