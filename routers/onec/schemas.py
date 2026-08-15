from uuid import UUID

from pydantic import BaseModel


class OnecResponse(BaseModel):
    change_uuid: UUID