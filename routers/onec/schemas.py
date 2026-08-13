from uuid6 import UUID

from pydantic import BaseModel, ConfigDict


class OnecResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    last_change_uuid: UUID