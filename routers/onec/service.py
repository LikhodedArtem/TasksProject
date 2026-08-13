from core.services.base_service import BaseService


import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any, Optional
from copy import deepcopy

from crud import *
from core.models import db_helper
from core.models.real_info import *
from core.models.changes import *
from crud import format_change_type_rows


class OnecService(BaseService):
    def compare_objects(self, obj_new, obj_old) -> dict[str, Any]:
        value_keys = obj_old.for_value()
        dif: dict[str, Any] = dict()

        for key in value_keys:
            value_new = getattr(obj_new, key)
            value_old = getattr(obj_old, key)

            if value_new != value_old:
                dif[key] = value_new

        return dif

    async def refresh_objects(
            self,
            data: list,
            model,
            delete_old: bool = True,
            area_value: Optional[str] = None,
            changes: bool = True,
    ):
        if not data:
            return []

        if changes: change_list: list[ChangeBase] = []

        primary_keys = model.for_find()
        value_keys = model.for_value()
        new_stage = data[0].stage

        for object in data:
            primary_kwargs = {key: getattr(object, key) for key in primary_keys}

            old_object = await find_objects(self.session, model, **primary_kwargs)

            if isinstance(old_object, list):
                raise ValueError("Expected one old_object, got two or more")

            if old_object is None:
                if changes:
                    change = object.create_change("create")
                    change_list.append(change)

                await add_objects(
                    self.session,
                    [object, change] if changes else [object],
                )
            else:
                change = None

                for_update = dict()

                if old_object.is_alive:
                    difference = self.compare_objects(object, old_object)

                    if difference:
                        for_update = deepcopy(difference)

                        change = object.create_change("update", list(difference.keys()))
                        if changes: change_list.append(change)
                else:
                    for key in value_keys:
                        for_update[key] = getattr(object, key)
                    for_update["is_alive"] = True
                    for_update["death_time"] = None

                    change = object.create_change("create")
                    if changes: change_list.append(change)

                for_update["stage"] = new_stage

                await update_objects(
                    session=self.session,
                    model=model,
                    for_find=primary_kwargs,
                    for_update=for_update,
                    for_add=[change] if change is not None else None,
                )

        if delete_old:
            delete_lst = await kill_old_in_model(
                session=self.session,
                model=model,
                alive_stage=new_stage,
                area_value=area_value,
            )

            for delete in delete_lst:
                if changes: change = delete.create_change("delete")
                if changes: change_list.append(change)
                await update_objects(
                    session=self.session,
                    model=model,
                    for_find={key: getattr(delete, key) for key in primary_keys},
                    for_update={"is_alive": False, "death_time": datetime.now()},
                    for_add=[change] if changes else None,
                )

        if changes:
            return format_change_type_rows(change_list, primary_keys)

    async def parse_zn(self, xml_string: bytes):
        root = ET.fromstring(xml_string)

        zn = root.find('zn')

        zn_number = zn.find("zn_number").text

        new_stage = await get_current_zn_stage(self.session, zn_number) + 1

        zn_lst = [
            ZN(
                car_vin=zn.find("car").find("win").text,
                number=zn_number,
                date=zn.find("zn_date").text.replace("\xa0", ""),
                reason=zn.find("reason_for_contacting").text,
                recommendation=zn.find("recommendation").text if zn.find("recommendation") is not None else "",
                assistant=zn.find("assistant_m").text,
                manager=zn.find("manager").text,
                stage=new_stage,
            )
        ]

        car = zn.find("car")
        car_lst = [
            Car(
                vin=car.find("win").text,
                reg=car.find("reg").text if car.find("reg") is not None else None,
                model=car.find("model").text,
                year=car.find("year").text,
                millage=int(car.find("millage").text.replace("\xa0", "")),
                stage=new_stage,
            )
        ]

        post_repair = zn.find("post_repair")
        post_lst = []
        relation_lst = []
        for post in post_repair.findall('post'):
            post_uuid = post.find("uuid").text

            post_obj = Post(
                uuid=post.find("uuid").text,
                main_post_name=post.find("post_name").text,
                date1=post.find("date1").text.replace("\xa0", ""),
                date2=post.find("date2").text.replace("\xa0", ""),
                stage=new_stage
            )

            relation_obj = ZN_mtm_Post(
                post_uuid=post_uuid,
                zn_number=zn_number,
                stage=new_stage,
            )

            post_lst.append(post_obj)
            relation_lst.append(relation_obj)

        working = zn.find("working")
        job_lst = []
        for job in working.findall('job'):
            job_obj = Job(
                uuid=job.find("uuid").text,
                zn_number=zn_number,
                number=int(job.find("count_job").text),
                name=job.find("job_name").text,
                normal_time=float(job.find("normal_time").text.replace(",", ".")),
                stage=new_stage,
            )

            job_lst.append(job_obj)

        repair_parts = zn.find("repair_parts")
        parts_lst = []
        for part in repair_parts.findall('parts'):
            part_obj = Part(
                uuid=part.find("uuid").text,
                zn_number=zn_number,
                name=part.find("parts_name").text,
                manufacturer_code=part.find("manufacturer_code").text,
                manufacturer=part.find("manufacturer").text,
                quantity=float(part.find("quantity").text.replace(",", ".")),
                units=part.find("units").text,
                stage=new_stage,
            )

            parts_lst.append(part_obj)

        changes = {
            "zn": (
                zn_lst,
                ZN,
                False
            ),
            "car": (
                car_lst,
                Car,
                False
            ),
            "posts": (
                post_lst,
                Post,
                False
            ),
            "jobs": (
                job_lst,
                Job,
                True,
                zn_number
            ),
            "parts": (
                parts_lst,
                Part,
                True,
                zn_number
            ),
            "__zn_mtm_post": (
                relation_lst,
                ZN_mtm_Post,
                True,
                zn_number,
                False
            ),
        }

        data = {}

        for change_name, change_data in changes.items():
            response = await self.refresh_objects(*change_data)

            if not change_name.startswith("__"):
                data[change_name] = response

        for relation in relation_lst:
            old_relation = await find_objects(
                self.session,
                ZN_mtm_Post,
                zn_number=relation.zn_number,
                post_uuid=relation.post_uuid,
            )

            if old_relation is None:
                self.session.add(relation)

            await self.session.commit()

        return data, zn_number

    async def parse_mechanics(self, xml_string: bytes):
        root = ET.fromstring(xml_string)

        mechanics = root.find('mechanics')

        new_stage = await get_current_mechanics_stage(self.session) + 1

        mechanic_lst = []
        for mechanic in mechanics.findall('mechanic'):
            mechanic_obj = Mechanic(
                key=mechanic.find('key').text,
                name=mechanic.find('name').text,
                stage=new_stage,
            )
            mechanic_lst.append(mechanic_obj)

        last_change_uuid, data = await self.refresh_objects(
            mechanic_lst,
            Mechanic,
            True
        )

        return last_change_uuid, data

    async def parse_posts(self, xml_string: bytes):
        root = ET.fromstring(xml_string)

        new_stage = await get_current_main_posts_stage(self.session) + 1

        post_lst = []
        for post in root.findall('post'):
            post_obj = MainPost(
                name=post.find("post_name").text,
                territory=post.find("territory").text,
                stage=new_stage,
            )

            post_lst.append(post_obj)

        last_change_uuid, data = await self.refresh_objects(
            data=post_lst,
            model=MainPost,
            delete_old=True,
        )

        return last_change_uuid, data