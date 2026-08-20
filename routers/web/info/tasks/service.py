from datetime import datetime
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile

from core.models.real_info import Task
from core.models.changes import TaskChange
from core.services import BaseService
from crud import add_objects
from crud.real_info import get_tasks
from routers.web.files.service import FileService
from sse import fourth_page_manager
from utils import uuid7_generator

UPLOAD_DIR = Path("files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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
            uuid: UUID,
            files: list[UploadFile] | None,
            to_name: str,
            value: str,
            post: str,
            mechanic: str,
            zn_number: str,
            vin: str,
            change_uuid: UUID,
            client_id: UUID,
    ):
        created_at = datetime.now()

        has = files is not None and len(files) != 0

        task = Task(
            uuid=uuid,
            to_name=to_name,
            value=value,
            post=post,
            mechanic=mechanic,
            zn_number=zn_number,
            vin=vin,
            created_at=created_at,
            has_files=has,
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

        if has:
            file_service = FileService(self.session)

            destination = UPLOAD_DIR / to_name / post / mechanic / zn_number / vin
            destination.parent.mkdir(parents=True, exist_ok=True)

            change_uuid_gen = uuid7_generator(change_uuid)

            for file in files:
                await file_service._create_file(
                    identical_str=str(uuid),
                    to_name=to_name,
                    post=post,
                    mechanic=mechanic,
                    type_="tasks",
                    destination=destination,
                    file=file,
                    change_uuid=next(change_uuid_gen),
                    client_id=client_id,
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