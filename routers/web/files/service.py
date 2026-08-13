import json
import shutil
import traceback
from datetime import datetime
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import UploadFile
from fastapi.responses import StreamingResponse

from core.services import BaseService
from uuid import uuid4, UUID

from core.models.real_info import *
from crud import *
from sse import *


UPLOAD_DIR = Path("files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class FileService(BaseService):
    async def _create_file(
            self,
            zn_number: str,
            type: str,
            identical_str: str | None,
            post: str,
            mechanic: str,
            destination: Path,
            file: UploadFile
    ) -> str:
        file_id = str(uuid4())

        destination = destination / file_id
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        await file.close()

        file_obj = File(
            uuid=file_id,
            path=str(destination),
            user_name=file.filename,
            type=type,
            zn_number=zn_number,
            identical_str=identical_str,
            mechanic=mechanic,
            post=post,
        )

        await add_objects(self.session, file_obj)

        return file_id


    async def _create_all_zn(
            self,
            zn_number: str,
            type: str,
            files: list[UploadFile],
            post: str,
            mechanic: str,
            destination: Path,
            identical_str: str | None = None,
    ):
        data = []

        try:
            for file in files:
                file_id = await self._create_file(
                    zn_number=zn_number,
                    type=type,
                    identical_str=identical_str,
                    post=post,
                    mechanic=mechanic,
                    file=file,
                    destination=destination,
                )

                data.append(file_id)
        except Exception:
            traceback.print_exc()

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
        kwargs = {
            "is_alive": True,
            "zn_number": zn_number,
        }

        if identical_str is not None:
            kwargs["identical_str"] = identical_str

        if type is not None:
            kwargs["type"] = type

        files = await find_objects(
            session=self.session,
            model=File,
            **kwargs
        )

        if files is None:
            return []
        if not isinstance(files, list):
            files = [files]

        archive_buffer = BytesIO()

        uuids = []
        if type is None:
            types = []

        with ZipFile(
                archive_buffer,
                mode="w",
                compression=ZIP_DEFLATED,
        ) as archive:
            for file in files:
                path = Path(file.path)

                if type is None:
                    types.append(file.type)

                if not path.is_file():
                    continue

                archive.write(path, arcname=file.user_name)
                uuids.append(file.uuid)

            archive.writestr(
                "uuids.json",
                json.dumps({"uuids": uuids}, ensure_ascii=False)
            )

            if type is None:
                archive.writestr(
                    "types.json",
                    json.dumps({"types": types}, ensure_ascii=False)
                )

        archive_buffer.seek(0)

        return StreamingResponse(
            archive_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="files.zip"',
            },
        )

    async def kill(
            self,
            post: str,
            mechanic: str,
            uuids: list[str],
            client_id: UUID,
            change_uuid: UUID,
    ):
        for uuid in uuids:
            await update_objects(
                session=self.session,
                model=File,
                for_find={"uuid": uuid},
                for_update={
                    "is_alive": False,
                    "death_time": datetime.now(),
                    "delete_mechanic": mechanic,
                    "delete_post": post,
                }
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