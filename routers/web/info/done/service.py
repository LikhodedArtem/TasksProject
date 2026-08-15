import asyncio
from uuid import UUID

from core.services import BaseService
from crud.real_info import change_done
from sse import third_page_manager

from utils import uuid7_generator


class DoneService(BaseService):
    async def done(
            self,
            mechanic: str,
            post: str,
            zn_number: str,
            uuid: str,
            type: str,
            new_value: bool,
            client_id: UUID,
            change_uuid: UUID,
    ):
        await change_done(
            session=self.session,
            mechanic=mechanic,
            post=post,
            uuid=uuid,
            type=type,
            new_value=new_value,
            client_id=client_id,
            change_uuid=change_uuid,
        )

        self.background_tasks.add_task(
            third_page_manager.broadcast,
            data={"type": type, "uuid": uuid, "new_value": new_value},
            event="done",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )

    async def done_all(
            self,
            uuid: list[str],
            mechanic: str,
            post: str,
            type: str,
            zn_number: str,
            new_value: bool,
            client_id: UUID,
            change_uuid: UUID,
    ):
        change_uuid_gen = uuid7_generator(change_uuid)

        async def fetch_one(obj_uuid):
            nonlocal change_uuid_gen

            await change_done(
                session=self.session,
                mechanic=mechanic,
                post=post,
                uuid=obj_uuid,
                type=type,
                new_value=new_value,
                client_id=client_id,
                change_uuid=next(change_uuid_gen),
            )

        await asyncio.gather(*(fetch_one(obj_uuid) for obj_uuid in uuid))

        self.background_tasks.add_task(
            third_page_manager.broadcast,
            data={"type": type, "new_value": new_value, "uuids": uuid},
            event="done_all",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )