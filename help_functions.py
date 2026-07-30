from typing import Any
from uuid import UUID

from fastapi import Header


def as_dict(obj) -> dict[str, Any]:
    keys = obj.for_find() + obj.for_value()
    if hasattr(obj, 'done'):
        keys.append("done")

    return {key: getattr(obj, key) for key in keys}


def get_client_id(x_client_id: UUID | None = Header(default=None)) -> UUID | None:
    return x_client_id


# def create_update(
#         data: list[Operation]
# ) -> dict[str, Any]:
#     answer = dict()
#     answer["code"] = 200
#     answer["message"] = "success"
#     answer["data"]: dict[str, dict[str, list[dict[str, Any]]]] = dict()
#
#     for op in data:
#         current = answer["data"]
#
#         if op.operation not in current:
#             current[op.operation] = dict()
#
#         current = current[op.operation]
#
#         if op.model_name not in current:
#             current[op.model_name] = []
#
#         current = current[op.model_name]
#
#         current.append(op.data)
#
#     return answer


__all__ = ["as_dict"]