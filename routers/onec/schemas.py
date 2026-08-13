from uuid6 import UUID

from pydantic import BaseModel


class OnecResponse(BaseModel):
    last_change_uuid: UUID