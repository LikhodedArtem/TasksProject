from uuid import UUID

from core.models.real_info import *
from core.services import BaseService

from changes import CreateChange
from crud import update_objects
from crud.real_info import get_zns_by_post, get_zn, get_zn_jobs, get_zn_parts, get_posts, get_mechanics
from sse import third_page_manager


class InfoService(BaseService):
    async def zns(self, post: str):
        return await get_zns_by_post(
            session=self.session,
            post=post,
        )

    async def zn(self, zn_number: str):
        return await get_zn(
            session=self.session,
            zn_number=zn_number,
        )

    async def jobs(self, zn_number: str):
        return await get_zn_jobs(
            session=self.session,
            zn_number=zn_number,
        )

    async def parts(self, zn_number: str):
        return await get_zn_parts(
            session=self.session,
            zn_number=zn_number,
        )

    async def posts(self):
        return await get_posts(
            session=self.session,
        )

    async def mechanics(self):
        return await get_mechanics(
            session=self.session,
        )


    async def rec_set(
            self,
            zn_number: str,
            rec: str,
            change_uuid: UUID,
            sse_uuid: UUID,
    ):
        change = CreateChange.rec(
            zn_number=zn_number,
            recommendation=rec,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
        )

        await update_objects(
            session=self.session,
            model=ZN,
            for_find={"number": zn_number},
            for_update={"recommendation": rec},
            for_add=[change]
        )

        self.background_tasks.add_task(
            third_page_manager.broadcast,
            data={"rec": rec},
            event="rec",
            broadcast_event="zn",
            add_info=zn_number,
            id_=change_uuid,
            author=sse_uuid,
        )



__all__ = ['InfoService']