from uuid import UUID, uuid4

from core.models.real_info import Task
from core.services import BaseService
from crud import add_objects
from crud.real_info import get_tasks


class TasksService(BaseService):
    async def get(
            self,
            to_name: str,
    ):
        return {
            "data": await get_tasks(
                session=self.session,
                to_name=to_name,
            ),
            "change_uuid": None,
        }

    async def create(
            self,
            to_name: str,
            value: str,
            post: str,
            mechanic: str,
            zn_number: str,
            vin: str,
            change_uuid: UUID,
            client_id: UUID,
    ):
        task = Task(
            uuid=uuid4(),
            to_name=to_name,
            value=value,
            post=post,
            mechanic=mechanic,
            zn_number=zn_number,
            vin=vin,
        )

        await add_objects(
            session=self.session,
            objects=task,
        )


__all__ = ['TasksService']