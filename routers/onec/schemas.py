from uuid import UUID

from pydantic import BaseModel


class OnecResponse(BaseModel):
    last_change_uuid: UUID