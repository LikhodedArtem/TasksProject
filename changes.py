from typing import Optional, Literal
from uuid import UUID

from pydantic_core.core_schema import uuid_schema

from core.models.changes import *
from core.models import db_helper
from crud import add_object
from core.models.changes.help_classes import ChangeType


class CreateChange:
    @staticmethod
    async def _make_change(
            change_model,
            **kwargs
    ) -> UUID:
        if "change_uuid" in kwargs:
            print(kwargs["change_uuid"])

        change = change_model(**kwargs)

        async with db_helper.session_factory() as session:
            await add_object(session, change)

        return change.change_uuid

    @classmethod
    async def zn(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
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
            change_model=ZNChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
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
            change_uuid: UUID,
            sse_uuid: UUID,
            vin: str,
            type: ChangeType,
            reg: Optional[str] = None,
            model: Optional[str] = None,
            year: Optional[int] = None,
            millage: Optional[int] = None,
    ):
        return await cls._make_change(
            change_model=CarChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
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
            change_uuid: UUID,
            sse_uuid: UUID,
            type: ChangeType,
            uuid: str,
            mechanic: str,
            post: str,
    ):
        return await cls._make_change(
            change_model=FileChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            type=type,
            uuid=uuid,
            mechanic=mechanic,
            post=post,
        )

    @classmethod
    async def job(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
            type: ChangeType,
            uuid: str,
            zn_number: str,
            number: Optional[str] = None,
            name: Optional[str] = None,
            normal_time: Optional[str] = None,
    ):
        return await cls._make_change(
            change_model=JobChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
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
            change_uuid: UUID,
            sse_uuid: UUID,
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
            change_model=PartChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
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
            change_uuid: UUID,
            sse_uuid: UUID,
            type: ChangeType,
            name: str,
            territory: Optional[str] = None,
    ):
        return await cls._make_change(
            change_model=MainPostChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            type=type,
            name=name,
            territory=territory,
        )

    @classmethod
    async def post(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
            type: ChangeType,
            uuid: str,
            main_post_name: str,
            date1: Optional[str] = None,
            date2: Optional[str] = None,
    ):
        return await cls._make_change(
            change_model=PostChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            type=type,
            uuid=uuid,
            main_post_name=main_post_name,
            date1=date1,
            date2=date2,
        )

    @classmethod
    async def mechanic(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
            type: ChangeType,
            key: str,
            name: Optional[str] = None,
    ):
        return await cls._make_change(
            change_model=MechanicChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            type=type,
            name=name,
            key=key,
        )

    @classmethod
    async def done(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
            identical_str: str,
            value: bool,
            mechanic: str,
            post: str,
    ) -> UUID:
        return await cls._make_change(
            change_model=DoneChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            identical_str=identical_str,
            value=value,
            mechanic=mechanic,
            post=post,
        )

    @classmethod
    async def status(
            cls,
            change_uuid: UUID,
            sse_uuid: UUID,
            zn_number: str,
            post: str,
            mechanic: str,
            status: str,
    ) -> UUID:
        return await cls._make_change(
            change_model=StatusChange,
            change_uuid=change_uuid,
            sse_uuid=sse_uuid,
            zn_number=zn_number,
            post=post,
            mechanic=mechanic,
            status=status,
        )