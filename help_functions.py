from typing import Any
from uuid import UUID

from fastapi import Header
from core.models.changes.base import ChangeBase


FORBIDDEN_KEYS = {
    "change_uuid",
    "sse_uuid",
}


def as_dict(obj) -> dict[str, Any]:

    if isinstance(obj, ChangeBase):
        return {key: getattr(obj, key) for key in obj.__table__.columns.keys() if key not in FORBIDDEN_KEYS}

    keys = obj.for_find() + obj.for_value()
    if hasattr(obj, "done"):
        keys.append("done")

    return {key: getattr(obj, key) for key in keys}


def get_client_id(x_client_id: UUID | None = Header(default=None)) -> UUID | None:
    return x_client_id


def get_change_uuid(x_change_uuid: UUID | None = Header(default=None)) -> UUID | None:
    return x_change_uuid


__all__ = ["as_dict", "get_client_id", "get_change_uuid"]