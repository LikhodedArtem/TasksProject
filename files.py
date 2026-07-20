import json
import shutil
from datetime import datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4
from zipfile import ZipFile

from fastapi import UploadFile


UPLOAD_DIR = Path("files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


from core.models import File
from core.models.db_helper import db_helper
from crud import add_object, update_object, find_object


async def create_zn_items_files(
    zn_number: str,
    type: str,
    uuid: str,
    files: list[UploadFile],
    on_post: str,
    mechanic: str,
) -> list[str]:
    data = []

    for file in files:
        file_id = f"{uuid4()}"

        destination = UPLOAD_DIR / zn_number / type / uuid / file_id
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        await file.close()

        file_obj = File(
            uuid=file_id,
            path=str(destination),
            user_name=file.filename,
            identical_str=uuid,
            author=mechanic,
            on_post=on_post,
        )

        async with db_helper.session_factory() as session:
            await add_object(session, file_obj)

        data.append(file_id)

    return data


async def create_zn_files(
    zn_number: str,
    files: list[UploadFile],
    on_post: str,
    mechanic: str,
) -> list[str]:
    data = []

    for file in files:
        file_id = f"{uuid4()}"

        destination = UPLOAD_DIR / zn_number / "files" / file_id
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        await file.close()

        file_obj = File(
            uuid=file_id,
            path=str(destination),
            user_name=file.filename,
            identical_str=zn_number,
            author=mechanic,
            on_post=on_post,
        )

        async with db_helper.session_factory() as session:
            await add_object(session, file_obj)

        data.append(file_id)

    return data


async def delete_zn_items_files(
        uuids: list[str],
        mechanic: str,
        on_post: str,
) -> bool:
    try:
        for uuid in uuids:
            async with db_helper.session_factory() as session:
                await update_object(
                    session=session,
                    model=File,
                    for_find={"uuid": uuid},
                    for_update={
                        "is_alive": False,
                        "death_time": datetime.now(),
                        "delete_author": mechanic,
                        "delete_on_post": on_post,
                    }
                )
        return True
    except Exception as e:
        print(f"Delete zn_items Files Error: {e}")
        return False


from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

async def get_files(
        identical_str: str,
):
    try:
        async with db_helper.session_factory() as session:
            files = await find_object(
                session=session,
                model=File,
                identical_str=identical_str,
                is_alive=True,
            )
        if files is None:
            return []
        if not isinstance(files, list):
            files = [files]

        archive_buffer = BytesIO()

        uuids = []

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
                uuids.append(file.uuid)

            archive.writestr(
                "uuids.json",
                json.dumps({"uuids": uuids}, ensure_ascii=False)
            )


        archive_buffer.seek(0)

        return StreamingResponse(
            archive_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="files.zip"',
            },
        )

    except Exception as e:
        print(f"Get zn_items Files Error: {e}")
        return False