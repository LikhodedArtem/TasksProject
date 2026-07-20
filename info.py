from crud import add_object, find_object
from core.models import *
from core.models.db_helper import db_helper



async def set_status(
        zn_number: str,
        mechanic: str,
        on_post: str,
        status: str,
) -> bool:
    try:
        m_status = MechanicZNStatus(
            zn_number=zn_number,
            mechanic=mechanic,
            on_post=on_post,
            status=status,
        )

        async with db_helper.session_factory() as session:
            await add_object(session, m_status)

        return True

    except Exception as e:
        print(f"Setting status Error: {e}")
        return False


async def get_status(
        zn_number: str,
        mechanic: str,
):
    try:
        async with db_helper.session_factory() as session:
            status = await find_object(
                session=session,
                model=MechanicZNStatus,
                order_by=[MechanicZNStatus.at_time.desc()],
                limit=1,
                zn_number=zn_number,
                mechanic=mechanic,
            )

            if status is None:
                return "stopped"
            if isinstance(status, list):
                return False
            return status.status

    except Exception as e:
        print(f"Setting status Error: {e}")
        return False