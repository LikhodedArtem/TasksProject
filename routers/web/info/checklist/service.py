from core.services import BaseService
from crud.real_info import get_checklist


class ChecklistService(BaseService):
    async def get(self, zn_number: str):
        return await get_checklist(session=self.session, zn_number=zn_number)