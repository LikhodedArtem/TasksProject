from typing import Any
from uuid import UUID

from fastapi import Header
from core.models.changes.base import ChangeBase


FORBIDDEN_KEYS = {
    "change_uuid",
    "sse_uuid",
    "post",
    "mechanic"
}


def as_dict(obj) -> dict[str, Any]:
    if isinstance(obj, ChangeBase):
        return {key: getattr(obj, key) for key in obj.__table__.columns.keys() if key not in FORBIDDEN_KEYS}

    keys = obj.for_find() + obj.for_value()
    if hasattr(obj, "done"):
        keys.append("done")

    return {key: getattr(obj, key) for key in keys}


__all__ = ["as_dict"]