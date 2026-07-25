from pprint import pprint
import traceback
from typing import Annotated

from fastapi import File, Form, UploadFile, Body

import uvicorn
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware

from sse.managers import *

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
            update = create_update(result)

            match type.lower():
                case "zn":
                    second_page_manager.broadcast(update, "zn")
                    third_page_manager.broadcast(update, "zn")
                case "mechanics":
                    first_page_manager.broadcast(update, "mechanics")
                case "posts":
                    first_page_manager.broadcast(update, "posts")

        else:
            pprint("UPDATE: Нет изменений")
    except Exception as e:
        traceback.print_exc()
        print(f"Parse {type.capitalize()} Error: {e}")

    return JSONResponse(status_code=200, content={"status": "ok"})


async def try_smth(func, **kwargs):
    try:
        await func(**kwargs)

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
async def rec(
        zn_number: Annotated[str, Body()],
        rec: Annotated[str, Body()]
):
    return await try_smth(
        parse_rec,
        zn_number=zn_number,
        rec=rec,
    )

"""Установить сделано или не сделано на запчасть или работу"""

@app.post("/info/done")
async def done(
        mechanic: Annotated[bool, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuid: Annotated[str, Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[str, Body()],
):
    return await try_smth(
        parse_done,
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuid=uuid,
        type=type,
        new_value=new_value,
    )


"""Установить сделано или не сделано на много запчастей или работ"""

@app.post("/info/done/all")
async def done_all(
        mechanic: Annotated[bool, Body()],
        post: Annotated[str, Body()],
        zn_number: Annotated[str, Body()],
        uuids: Annotated[list[str], Body()],
        type: Annotated[str, Body()],
        new_value: Annotated[str, Body()],
):
    return await try_smth(
        parse_done_all,
        mechanic=mechanic,
        post=post,
        zn_number=zn_number,
        uuids=uuids,
        type=type,
        new_value=new_value,
    )

"""
Подписка на различные обновления данных на каждой странице.
"""



@app.get("/info/events/first_page")
async def first_page_events(request: Request):
    return first_page_manager.streaming_response(request)

@app.get("/info/events/second_page")
async def second_page_events(request: Request):
    return second_page_manager.streaming_response(request)


@app.get("/info/events/third_page")
async def third_page_events(request: Request):
    return third_page_manager.streaming_response(request)


"""
Установить статус у механика к заказ наряду.
Установка по номеру заказ наряда, механику и посту.

Для Stopped.
Механик может остановить если:
    а) Выполнены все запчасти и работы.
    б) С того момента, как он нажал начать заказ наряд им не было выбрано ничего.
"""

@app.post("/info/zn_status/set")
async def zn_status_set(
        zn_number: Annotated[str, Body()],
        post: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
        status: Annotated[str, Body()],
):
    return await set_status(
        zn_number=zn_number,
        post=post,
        mechanic=mechanic,
        status=status,
    )

"""
Получить текущее состояние работы у определённого работника к заказ наряду.
Если работник ни разу не устанавливал статус, то будет возращено 'never'.
"""

@app.post("/info/zn_status/get")
async def zn_status_get(
        zn_number: Annotated[str, Body()],
        mechanic: Annotated[str, Body()],
):
    return await get_status(
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

@app.post("/files/create/zn_items")
async def files_create(
    zn_number: str = Form(...),
    type: str = Form(...),
    uuid: str = Form(...),
    files: list[UploadFile] = File(...),
    mechanic: str = Form(...),
    post: str = Form(...),
) -> list[str]:
    return await create_zn_items_files(
        zn_number=zn_number,
        type=type,
        uuid=uuid,
        files=files,
        mechanic=mechanic,
        post=post,
    )


"""
Сохранить файлы для заказ наряда.
Нужно указать post и mechanic для сохранения авторства.
Возвращает uuid'ы под которыми были сохранены файлы.
"""

@app.post("/files/create/zn")
async def files_create(
    zn_number: str = Form(...),
    files: list[UploadFile] = File(...),
    mechanic: str = Form(...),
    post: str = Form(...),
) -> list[str]:
    return await create_zn_files(
        zn_number=zn_number,
        files=files,
        mechanic=mechanic,
        post=post,
    )


"""
Получить файлы по отличающей строке для хранения.
"""

@app.post("/files/get")
async def files_get(
        identical_str: Annotated[str, Body()],
):
    return await get_files(
        identical_str=identical_str,
    )

"""
Установить любые файлы в неактивное состояние по uuid.
Необходимы post и mechanic для log'ов
"""

@app.post("/files/delete")
async def files_delete(
        uuids: Annotated[list[str], Body()],
        mechanic: Annotated[str, Body()],
        post: Annotated[str, Body()],
):
    return await delete_zn_items_files(
        uuids=uuids,
        mechanic=mechanic,
        post=post,
    )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        # ssl_certfile="ssl/likhoded.ru.crt",
        # ssl_keyfile="ssl/likhoded.ru.key"
    )