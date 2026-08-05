from typing import Literal

from uuid6 import uuid7

from changes import CreateChange


class CanCreateChange:
    change_func = None


    def create_change(
            self,
            type_: Literal["create", "update", "delete"],
            changed_strokes: list[str] | None = None,
    ):
        primary_keys = {key: getattr(self, key) for key in self.for_find}

        if type_ == "delete":
            data = {}
        else:
            data = {key: getattr(self, key) for key in self.for_value}

            if type_ == "update":
                for key in data:
                    if key not in changed_strokes:
                        continue
                    del data[key]

        return getattr(CreateChange, "CHANGE_FUNC")(
            change_uuid=uuid7(),
            sse_uuid=uuid7(),
            type=type_,
            **primary_keys,
            **data
        )