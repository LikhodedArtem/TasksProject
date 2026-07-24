from crud import add_object, find_objects, check_can_stop
from core.models import *
from core.models.db_helper import db_helper



async def set_status(
        zn_number: str,
        mechanic: str,
        on_post: str,
        status: str,
):
    try:
        reason = "success"

        if status == "stopped":
            async with db_helper.session_factory() as session:
                result = await check_can_stop(
                    session=session,
                    zn_number=zn_number,
                    mechanic=mechanic,
                )

            if not result[0]:
                return {"data": result[0], "reason": result[1]}
            reason = result[1]

        m_status = MechanicZNStatus(
            zn_number=zn_number,
            mechanic=mechanic,
            on_post=on_post,
            status=status,
        )

        async with db_helper.session_factory() as session:
            await add_object(session, m_status)

        return {"data": True, "reason": reason}

    except Exception as e:
        print(f"Setting status Error: {e}")
        return {"data": False, "reason": "error"}


async def get_status(
        zn_number: str,
        mechanic: str,
):
    try:
        async with db_helper.session_factory() as session:
            status = await find_objects(
                session=session,
                model=MechanicZNStatus,
                order_by=[MechanicZNStatus.at_time.desc()],
                limit=1,
                zn_number=zn_number,
                mechanic=mechanic,
            )

            if status is None:
                return "never"
            if isinstance(status, list):
                return False
            return status.status

    except Exception as e:
        print(f"Setting status Error: {e}")
        return False