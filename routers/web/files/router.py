"""Работа с файлами"""


from typing import Annotated

import json
import shutil
import traceback
from datetime import datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4, UUID
from zipfile import ZIP_DEFLATED, ZipFile


from fastapi import APIRouter, Body, Form, UploadFile, File as FastFile, Depends
from fastapi.responses import StreamingResponse
from help_functions import get_client_id

from core.models.db_helper import *
from core.models.real_info import *
from crud import *
from sse.managers import *

files_router = APIRouter(prefix="/files", tags=["files"])


__all__ = ["files_router"]

@files_router.post("/create")
async def create(
    zn_number: str = Form(...),
    type: str = Form(...),
    identical_str: str | None = Form(...),
    files: list[UploadFile] = FastFile(...),
    mechanic: str = Form(...),
    post: str = Form(...),
    client_id: UUID | None = Depends(get_client_id),
) -> list[str]:
    """
    Сохранить файлы для элементов заказ наряда.
    Возвращает uuid'ы под которыми были сохранены файлы.
    """

    return await Files.create(
        zn_number=zn_number,
        type=type,
        identical_str=identical_str,
        files=files,
        mechanic=mechanic,
        post=post,
        client_id=client_id,
    )


"""
Получить файлы по отличающей строке для хранения.
"""

@files_router.post("/get")
async def get(
        zn_number: Annotated[str, Body()],
        type: Annotated[str | None, Body()] = None,
        identical_str: Annotated[str | None, Body()] = None,
):
    return await Files.get(
        zn_number=zn_number,
        type=type,
        identical_str=identical_str,
    )

"""
Установить любые файлы в неактивное состояние по uuid.
Необходимы post и mechanic для log'ов
"""

@files_router.post("/delete")
async def kill(
        uuids: Annotated[list[str], Body()],
        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
        client_id: UUID | None = Depends(get_client_id),
):
    return await Files.kill(
        uuids=uuids,
        mechanic=mechanic,
        post=post,
        client_id=client_id,
    )


UPLOAD_DIR = Path("files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class Files:
    @staticmethod
    async def _create_file(
            zn_number: str,
            type: str,
            identical_str: str | None,
            post: str,
            mechanic: str,
            destination: Path,
            file: UploadFile
    ) -> str:
        file_id = f"{uuid4()}"

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

        async with db_helper.session_factory() as session:
            await add_objects(session, file_obj)

        return file_id

    @classmethod
    async def _create_all_zn(
            cls,
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
                file_id = await cls._create_file(
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

    @classmethod
    async def create(
            cls,
            zn_number: str,
            type: str,
            identical_str: str | None,
            files: list[UploadFile],
            post: str,
            mechanic: str,
            client_id: UUID | None = None,
    ):
        send_sse = False

        async with db_helper.session_factory() as session:
            has = await has_files(
                session=session,
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

        result = await cls._create_all_zn(
            zn_number=zn_number,
            type=type,
            files=files,
            post=post,
            mechanic=mechanic,
            identical_str=identical_str,
            destination=destination,
        )

        if send_sse:
            await third_page_manager.broadcast(
                data=sse_data,
                event="has_files",
                broadcast_event="zn",
                add_info=zn_number,
                id_="test",
                author=client_id,
            )

        return result

    @classmethod
    async def get(
            cls,
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

        async with db_helper.session_factory() as session:
            files = await find_objects(
                session=session,
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

    @classmethod
    async def kill(
            cls,
            post: str,
            mechanic: str,
            uuids: list[str],
            client_id: UUID | None = None,
    ):
        for uuid in uuids:
            async with db_helper.session_factory() as session:
                await update_objects(
                    session=session,
                    model=File,
                    for_find={"uuid": uuid},
                    for_update={
                        "is_alive": False,
                        "death_time": datetime.now(),
                        "delete_mechanic": mechanic,
                        "delete_post": post,
                    }
                )

        async with db_helper.session_factory() as session:
            identical_file = await find_objects(
                session=session,
                model=File,
                uuid=uuids[0],
            )

            identical_str = identical_file.identical_str
            zn_number = identical_file.zn_number
            type = identical_file.type

            has = await has_files(
                session=session,
                identical_str=identical_str,
                zn_number=zn_number,
                type=type,
            )

        if not has:
            await third_page_manager.broadcast(
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