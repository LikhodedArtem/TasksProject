from uuid import UUID

from changes import CreateChange
from core.services import BaseService
from core.models.real_info import *
from crud import find_objects, get_zn_status, update_objects
from sse import third_page_manager


class StatusService(BaseService):
    async def get(
            self,
            zn_number: str,
            post: str,
    ):
        return await get_zn_status(
            session=self.session,
            zn_number=zn_number,
            post=post,
        )

    async def set(
            self,
            zn_number: str,
            post: str,
            mechanic: str,
            status: str,
            change_uuid: UUID,
            client_id: UUID,
    ):
        find_status = await find_objects(
            session=self.session,
            model=PostZNStatus,
            zn_number=zn_number,
            post=post,
        )

        change = CreateChange.status(
            change_uuid=change_uuid,
            sse_uuid=client_id,
            zn_number=zn_number,
            post=post,
            mechanic=mechanic,
            status=status,
        )

        if find_status is None:
            new_status = PostZNStatus(
                zn_number=zn_number,
                post=post,
                mechanic=mechanic,
                status=status,
            )

            async with self.session.begin():
                self.session.add(new_status)
                self.session.add(change)
            await self.session.commit()

        else:
            await update_objects(
                session=self.session,
                model=PostZNStatus,
                for_find={"post": post, "zn_number": zn_number},
                for_update={"status": status, "mechanic": mechanic},
                for_add=[change],
            )

        self.background_tasks.add_task(
            third_page_manager.broadcast,
            data={"status": status, "post_name": post},
            event="status",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=client_id,
        )