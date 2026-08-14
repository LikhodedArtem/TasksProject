from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core import Names
from core.models import db_helper
from crud.real_info import (
    get_zn_jobs_changes,
    get_zn_parts_changes,
    get_zn_changes,
    get_zn_status_changes,
    get_posts_changes,
    get_mechanics_changes,
    get_zns_changes_by_post,
)


class Recover:
    @classmethod
    async def first(
            cls,
            session: AsyncSession,
            last_uuids: dict[str, UUID | None],
            client_id: UUID,
            add_data: dict[str, Any],
    ):
        if last_uuids is None: return {}

        posts = last_uuids.get("posts", None)
        mechanics = last_uuids.get("mechanics", None)

        answer = {}

        if posts is None: posts = Names.MIN_UUID7
        if mechanics is None: mechanics = Names.MIN_UUID7

        answer["posts"] = await get_posts_changes(
            session=session,
            last_uuid=posts,
            client_id=client_id,
        )

        answer["mechanics"] = await get_mechanics_changes(
            session=session,
            last_uuid=mechanics,
            client_id=client_id,
        )

        return answer



    @classmethod
    async def second(
            cls,
            session: AsyncSession,
            last_uuids: dict[str, UUID | None],
            client_id: UUID,
            add_data: dict[str, Any],
    ):
        post = add_data["post"]
        zns = last_uuids.get("zns", None)

        answer = {}

        if zns is None: zns = Names.MIN_UUID7

        answer["zns"] = await get_zns_changes_by_post(
            session=session,
            post=post,
            last_uuid=zns,
            client_id=client_id,
        )

        return answer


    @classmethod
    async def third(
            cls,
            session: AsyncSession,
            last_uuids: dict[str, UUID | None],
            client_id: UUID,
            add_data: dict[str, Any],
    ):
        zn_number = add_data['zn_number']
        post = add_data['post']

        if last_uuids is None: return {}

        zn = last_uuids.get("zn", None)
        jobs = last_uuids.get("jobs", None)
        parts = last_uuids.get("parts", None)
        status = last_uuids.get("status", None)

        answer = {}

        if zn is None: zn = Names.MIN_UUID7
        if jobs is None: jobs = Names.MIN_UUID7
        if parts is None: parts = Names.MIN_UUID7
        if status is None: status = Names.MIN_UUID7

        answer["zn"] = await get_zn_changes(
            session=session,
            zn_number=zn_number,
            last_uuid=zn,
            client_id=client_id,
        )

        answer["jobs"] = await get_zn_jobs_changes(
            session=session,
            zn_number=zn_number,
            last_uuid=jobs,
            client_id=client_id,
        )

        answer["parts"] = await get_zn_parts_changes(
            session=session,
            zn_number=zn_number,
            last_uuid=parts,
            client_id=client_id,
        )

        answer["status"] = await get_zn_status_changes(
            session=session,
            zn_number=zn_number,
            post=post,
            last_uuid=status,
            client_id=client_id,
        )

        return answer