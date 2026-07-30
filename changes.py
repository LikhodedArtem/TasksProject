from typing import Optional, Literal
from uuid import UUID

from pydantic_core.core_schema import uuid_schema

from core.models.changes import *
from core.models import db_helper
from crud import add_object


ChangeType: Literal["create", "update", "delete"]


class CreateChange:
    @staticmethod
    async def _make_change(
            model,
            **kwargs
    ) -> UUID:
        change = model(**kwargs)

        async with db_helper.session_factory() as session:
            await add_object(session, change)

        return change.change_uuid

    @classmethod
    async def zn(
            cls,
            type: ChangeType,
            number: str,
            car_vin: str,
            date: Optional[str] = None,
            reason: Optional[str] = None,
            recommendation: Optional[str] = None,
            assistant: Optional[str] = None,
            manager: Optional[str] = None,
    ):
        return await cls._make_change(
            model=ZNChange,
            type=type,
            number=number,
            car_vin=car_vin,
            date=date,
            reason=reason,
            recommendation=recommendation,
            assistant=assistant,
            manager=manager,
        )

    @classmethod
    async def car(
            cls,
            vin: str,
            type: ChangeType,
            reg: Optional[str] = None,
            model: Optional[str] = None,
            year: Optional[int] = None,
            millage: Optional[int] = None,
    ):
        return await cls._make_change(
            vin=vin,
            type=type,
            reg=reg,
            model=model,
            year=year,
            millage=millage,
        )

    @classmethod
    async def file(
            cls,
            type: ChangeType,
            uuid: str,
            mechanic: str,
            post: str,
    ):
        return await cls._make_change(
            model=FileChange,
            type=type,
            uuid=uuid,
            mechanic=mechanic,
            post=post,
        )

    @classmethod
    async def job(
            cls,
            type: ChangeType,
            uuid: str,
            zn_number: str,
            number: Optional[str] = None,
            name: Optional[str] = None,
            normal_time: Optional[str] = None,
    ):
        return await cls._make_change(
            model=JobChange,
            type=type,
            uuid=uuid,
            zn_number=zn_number,
            number=number,
            name=name,
            normal_time=normal_time,
        )

    @classmethod
    async def part(
            cls,
            type: ChangeType,
            uuid: str,
            zn_number: str,
            name: Optional[str] = None,
            manufacturer_code: Optional[str] = None,
            manufacturer: Optional[str] = None,
            quantity: Optional[int] = None,
            units: Optional[str] = None,
    ):
        return await cls._make_change(
            model=PartChange,
            type=type,
            uuid=uuid,
            zn_number=zn_number,
            name=name,
            manufacturer_code=manufacturer_code,
            manufacturer=manufacturer,
            quantity=quantity,
            units=units,
        )

    @classmethod
    async def main_post(
            cls,
            type: ChangeType,
            name: str,
            territory: Optional[str] = None,
    ):
        return await cls._make_change(
            model=MainPostChange,
            type=type,
            name=name,
            territory=territory,
        )

    @classmethod
    async def post(
            cls,
            type: ChangeType,
            uuid: str,
            main_post_name: str,
            date1: Optional[str] = None,
            date2: Optional[str] = None,
    ):
        return await cls._make_change(
            model=PostChange,
            type=type,
            uuid=uuid,
            main_post_name=main_post_name,
            date1=date1,
            date2=date2,
        )

    @classmethod
    async def mechanic(
            cls,
            type: ChangeType,
            key: str,
            name: Optional[str] = None,
    ):
        return await cls._make_change(
            model=MechanicChange,
            type=type,
            name=name,
            key=key,
        )

    @classmethod
    async def done(
            cls,
            identical_str: str,
            value: bool,
            mechanic: str,
            post: str,
    ) -> UUID:
        return await cls._make_change(
            model=DoneChange,
            identical_str=identical_str,
            value=value,
            mechanic=mechanic,
            post=post,
        )

    @classmethod
    async def status(
            cls,
            zn_number: str,
            post: str,
            mechanic: str,
            status: str,
    ) -> UUID:
        return await cls._make_change(
            model=StatusChange,
            zn_number=zn_number,
            post=post,
            mechanic=mechanic,
            status=status,
        )