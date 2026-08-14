from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from changes import CreateChange
from core.models.real_info import Job, Part
from crud.common import update_objects


async def change_done(
        session: AsyncSession,
        mechanic: str,
        post: str,
        uuid: str,
        type: str,
        new_value: bool,
        client_id: UUID,
        change_uuid: UUID,
):
    type = type.lower()

    model = Job if type == "jobs" else Part

    if not hasattr(model, "done"):
        return

    change = CreateChange.done(
        change_uuid=change_uuid,
        sse_uuid=client_id,
        identical_str=uuid,
        value=new_value,
        mechanic=mechanic,
        post=post,
    )

    await update_objects(
        session,
        model,
        { "uuid": uuid },
        { "done": new_value },
        for_add=[change]
    )


__all__ = [
    "change_done"
]