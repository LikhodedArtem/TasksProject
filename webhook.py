from pprint import pprint
import traceback
from fastapi import File, Form, UploadFile

import uvicorn
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from parse import (parse_mechanics, parse_zn, parse_main_posts,
                   create_update, create_answer, parse_done,
                   parse_done_all, parse_rec)


from info import set_status, get_status


async def parse_xml(request: Request, type: str, parce_func) -> JSONResponse:
    body = await request.body()
    body = body.decode("utf-8")

    try:
        result = await parce_func(body)
        if result:
            pprint(f"UPDATE: {create_update(type.lower(), result)}")
        else:
            pprint("UPDATE: Нет изменений")
    except Exception as e:
        traceback.print_exc()
        print(f"Parse {type.capitalize()} Error: {e}")

    return JSONResponse(status_code=200, content={"status": "ok"})


async def try_smth(body, func):
    try:
        await func(body)

        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception as e:
        print(f"Done change Error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


"""=== Обработка xml со стороны 1C ==="""


"""Обработка заказ наряда"""
@app.post("/api/zns")
async def zns(request: Request):
    await parse_xml(request, "Zn", parse_zn)


"""Обработка списка всех механиков"""

@app.post("/api/mechanics")
async def mechanics(request: Request):
    await parse_xml(request, "Mechanics", parse_mechanics)

"""Обработка списка всех названий постов"""
@app.post("/api/posts")
async def posts(request: Request):
    await parse_xml(request, "Posts", parse_main_posts)


"""=== Работа с информацией на web части ==="""

"""Получить все действующие заказ наряды зная название поста"""
@app.get("/info/zns/{post_name}")
async def zns(post_name):
    return await create_answer("zns", post_name=post_name)

"""Получить заказ наряд по его номеру"""
@app.get("/info/zn/{zn_number}")
async def zn(zn_number):
    return await create_answer("zn", zn_number=zn_number)

"""Получить все действующие работы заказ наряда, зная его номер"""

@app.get("/info/jobs/{zn_number}")
async def jobs(zn_number: str):
    return await create_answer("jobs", zn_number=zn_number)

"""Получить все действующие запчасти заказ наряда, зная его номер"""

@app.get("/info/parts/{zn_number}")
async def parts(zn_number: str):
    return await create_answer("parts", zn_number=zn_number)

"""Получить названия всех постов"""
@app.get("/info/posts")
async def posts():
    return await create_answer("posts")

"""Получить всех механиков"""

@app.get("/info/mechanics")
async def mechanics():
    return await create_answer("mechanics")

"""Получить рекомендацию по заказ наряду"""

@app.post("/info/rec")
async def rec(request: Request):
    body = await request.json()

    return await try_smth(body, parse_rec)

"""Установить сделано или не сделано на запчасть или работу"""

@app.post("/info/done")
async def done(request: Request):
    body = await request.json()

    return await try_smth(body, parse_done)


"""Установить сделано или не сделано на много запчастей или работ"""

@app.post("/info/done/all")
async def done(request: Request):
    body = await request.json()

    return await try_smth(body, parse_done_all)


"""
На текущий момент не активно.

Подписка на различные обновления данных.
"""

@app.get("/info/events")
async def events(request: Request):
    return StreamingResponse(
        base_manager.connect(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


"""
Установить статус у механика к заказ наряду.
Установка по номеру заказ наряда, механику и посту.

Для Stopped.
Механик может остановить если:
    а) Выполнены все запчасти и работы.
    б) С того момента, как он нажал начать заказ наряд им не было выбрано ничего.
"""

@app.post("/info/zn_status/set")
async def zn_status_set(request: Request):
    body = await request.json()

    zn_number = body["zn_number"]
    on_post = body["on_post"]
    mechanic = body["mechanic"]
    status = body["status"]

    return await set_status(
        zn_number=zn_number,
        on_post=on_post,
        mechanic=mechanic,
        status=status,
    )

"""
Получить текущее состояние работы у определённого работника к заказ наряду.
Если работник ни разу не устанавливал статус, то будет возращено 'never'.
"""

@app.post("/info/zn_status/get")
async def zn_status_get(request: Request):
    body = await request.json()

    zn_number = body["zn_number"]
    mechanic = body["mechanic"]

    return await get_status(
        zn_number=zn_number,
        mechanic=mechanic,
    )

@app.post("/info/can_stop")
async def zn_status_get(request: Request):
    body = await request.json()

    zn_number = body["zn_number"]
    mechanic = body["mechanic"]

    return await can_stop(
        zn_number=zn_number,
        mechanic=mechanic,
    )


"""=== Работа с файлами ==="""


from files import create_zn_items_files, delete_zn_items_files, get_files, create_zn_files

"""
Сохранить файлы для элементов заказ наряда.
Нужно указать post и mechanic для сохранения авторства;
Тип элемента заказ наряда (type), uuid этого элемента и zn_number.
Возвращает uuid'ы под которыми были сохранены файлы.
"""

@app.post("/files/zn_items/create")
async def files_create(
    zn_number: str = Form(...),
    type: str = Form(...),
    uuid: str = Form(...),
    files: list[UploadFile] = File(...),
    mechanic: str = Form(...),
    on_post: str = Form(...),
) -> list[str]:
    return await create_zn_items_files(
        zn_number=zn_number,
        type=type,
        uuid=uuid,
        files=files,
        mechanic=mechanic,
        on_post=on_post,
    )


"""
Сохранить файлы для заказ наряда.
Нужно указать post и mechanic для сохранения авторства.
Возвращает uuid'ы под которыми были сохранены файлы.
"""

@app.post("/files/zn/create")
async def files_create(
    zn_number: str = Form(...),
    files: list[UploadFile] = File(...),
    mechanic: str = Form(...),
    on_post: str = Form(...),
) -> list[str]:
    return await create_zn_files(
        zn_number=zn_number,
        files=files,
        mechanic=mechanic,
        on_post=on_post,
    )

"""
Получить файлы по отличающей строке для хранения.
"""

@app.post("/files/get")
async def files_get(request: Request):
    body = await request.json()
    identical_str = body["identical_str"]

    return await get_files(
        identical_str=identical_str,
    )

"""
Установить любые файлы в неактивное состояние по uuid.
Необходимы post и mechanic для log'ов
"""

@app.post("/files/delete")
async def files_delete(request: Request):
    body = await request.json()
    uuids = body["uuids"]
    mechanic = body["mechanic"]
    on_post = body["on_post"]

    return await delete_zn_items_files(
        uuids=uuids,
        mechanic=mechanic,
        on_post=on_post,
    )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        # ssl_certfile="ssl/likhoded.ru.crt",
        # ssl_keyfile="ssl/likhoded.ru.key"
    )