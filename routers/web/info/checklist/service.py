from core.services import BaseService
from crud.real_info import get_checklist_start_info


class ChecklistService(BaseService):
    async def get(self, zn_number: str):
        return await get_checklist_start_info(session=self.session, zn_number=zn_number)