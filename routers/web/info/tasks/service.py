from datetime import datetime
from uuid import UUID, uuid4

from core.models.real_info import Task
from core.models.changes import TaskChange
from core.services import BaseService
from crud import add_objects
from crud.real_info import get_tasks
from sse import fourth_page_manager


class TasksService(BaseService):
    async def get(
            self,
            to_name: str,
    ):
        return await get_tasks(
            session=self.session,
            to_name=to_name,
        )

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
        uuid = uuid4()

        created_at = datetime.now()

        task = Task(
            uuid=uuid,
            to_name=to_name,
            value=value,
            post=post,
            mechanic=mechanic,
            zn_number=zn_number,
            vin=vin,
            created_at=created_at,
        )

        task_change = TaskChange(
            change_uuid=change_uuid,
            sse_uuid=client_id,
            type="create",
            uuid=uuid,
            to_name=to_name,
            value=value,
            post=post,
            mechanic=mechanic,
            zn_number=zn_number,
            created_at=created_at,
            vin=vin,
        )

        await add_objects(
            session=self.session,
            objects=[task, task_change],
        )

        self.background_tasks.add_task(
            fourth_page_manager.broadcast,
            data=[{
                "type": "create",
                "data": task_change.as_dict()
            }],
            event="tasks",
            broadcast_event="to_name",
            add_info=to_name,
            id_=change_uuid,
            author=client_id,
        )


__all__ = ['TasksService']