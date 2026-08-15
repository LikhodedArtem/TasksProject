import json
import shutil
import traceback
from datetime import datetime
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import UploadFile
from fastapi.responses import StreamingResponse

from core import Names
from core.models.changes import FileChange
from core.services import BaseService
from uuid import uuid4, UUID

from core.models.real_info import *
from crud import *
from crud.real_info import get_files
from sse import *
from utils import uuid7_generator

UPLOAD_DIR = Path("files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class FileService(BaseService):
    async def _create_file(
            self,
            zn_number: str,
            type_: str,
            identical_str: str | None,
            post: str,
            mechanic: str,
            destination: Path,
            file: UploadFile,
            change_uuid: UUID,
            client_id: UUID,
    ):
        file_uuid = uuid4()

        destination = destination / str(file_uuid)
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        await file.close()

        file_obj = File(
            uuid=file_uuid,
            path=str(destination),
            user_name=file.filename,
            type=type_,
            zn_number=zn_number,
            identical_str=identical_str,
            mechanic=mechanic,
            post=post,
        )

        file_change = FileChange(
            uuid=file_uuid,
            identical_str=identical_str,
            user_name=file.filename,
            file_type=type_,
            mechanic=mechanic,
            post=post,
            change_uuid=change_uuid,
            sse_uuid=client_id,
            type="create",
        )

        await add_objects(self.session, [file_obj, file_change])

        return file_uuid, file_change


    async def _create_all_zn(
            self,
            zn_number: str,
            type: str,
            files: list[UploadFile],
            post: str,
            mechanic: str,
            destination: Path,
            identical_str: str | None,
            change_uuid: UUID,
            client_id: UUID,
    ):
        data = []

        last_change_uuid = Names.MIN_UUID7
        changes = []

        change_uuid_gen = uuid7_generator(change_uuid)

        for file in files:
            file_uuid, file_change = await self._create_file(
                zn_number=zn_number,
                type_=type,
                identical_str=identical_str,
                post=post,
                mechanic=mechanic,
                file=file,
                destination=destination,
                change_uuid=next(change_uuid_gen),
                client_id=client_id,
            )

            data.append(file_uuid)
            changes.append(file_change.as_dict())
            last_change_uuid = file_change.change_uuid

        self.background_tasks.add_task(
            third_page_manager.broadcast,
            data={"changes": changes},
            event="file",
            broadcast_event="file",
            add_info=f"{type}/{identical_str if identical_str is not None else 'None'}",
            id_=last_change_uuid,
            author=client_id,
        )

        return data


    async def create(
            self,
            zn_number: str,
            type: str,
            identical_str: str | None,
            files: list[UploadFile],
            post: str,
            mechanic: str,
            client_id: UUID,
            change_uuid: UUID,
    ):
        send_sse = False

        has = await has_files(
            session=self.session,
            zn_number=zn_number,
            type=type,
            identical_str=identical_str,
        )

        if not has:
            sse_data = {
                "identical_str": identical_str,
                "type": type,
                "has_files": True,
            }

            send_sse = True

        if type == "zn":
            destination = UPLOAD_DIR / zn_number / "files"
        elif type == "rec":
            destination = UPLOAD_DIR / zn_number / "rec"
        else:
            destination = UPLOAD_DIR / zn_number / identical_str

        result = await self._create_all_zn(
            zn_number=zn_number,
            type=type,
            files=files,
            post=post,
            mechanic=mechanic,
            identical_str=identical_str,
            destination=destination,
            change_uuid=change_uuid,
            client_id=client_id,
        )

        if send_sse:
            self.background_tasks.add_task(
                third_page_manager.broadcast,
                data=sse_data,
                event="has_files",
                broadcast_event="zn",
                add_info=zn_number,
                id_="test",
                author=client_id,
            )

        return result


    async def get(
            self,
            zn_number: str,
            type: str | None = None,
            identical_str: str | None = None,
    ):
        return await get_files(
            session=self.session,
            zn_number=zn_number,
            type=type,
            identical_str=identical_str,
        )


    async def download(
            self,
            uuids: list[UUID],
    ):
        files = await find_objects(
            session=self.session,
            model=File,
            in_={"uuid": uuids}
        )

        if files is None:
            return []
        if not isinstance(files, list):
            files = [files]

        archive_buffer = BytesIO()

        with ZipFile(
                archive_buffer,
                mode="w",
                compression=ZIP_DEFLATED,
        ) as archive:
            for file in files:
                path = Path(file.path)

                if not path.is_file():
                    continue

                archive.write(path, arcname=file.user_name)

        archive_buffer.seek(0)

        return StreamingResponse(
            archive_buffer,
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": "attachment; filename=files.zip"}
        )

    async def kill(
            self,
            post: str,
            mechanic: str,
            uuids: list[UUID],
            client_id: UUID,
            change_uuid: UUID,
    ):
        change_uuid_gen = uuid7_generator(change_uuid)

        for uuid in uuids:
            file_change = FileChange(
                uuid=uuid,
                mechanic=mechanic,
                post=post,
                change_uuid=next(change_uuid_gen),
                sse_uuid=client_id,
                type="delete",
            )

            await update_objects(
                session=self.session,
                model=File,
                for_find={"uuid": uuid},
                for_update={
                    "is_alive": False,
                },
                for_add=[file_change],
            )

        identical_file = await find_objects(
            session=self.session,
            model=File,
            uuid=uuids[0],
        )

        identical_str = identical_file.identical_str
        zn_number = identical_file.zn_number
        type = identical_file.type

        has = await has_files(
            session=self.session,
            identical_str=identical_str,
            zn_number=zn_number,
            type=type,
        )

        if not has:
            self.background_tasks.add_task(
                third_page_manager.broadcast,
                data={
                    "identical_str": identical_str,
                    "type": type,
                    "has_files": False,
                },
                event="has_files",
                broadcast_event="zn",
                add_info=zn_number,
                id_="test",
                author=client_id,
            )