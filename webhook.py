from pprint import pprint
import traceback
from typing import Annotated

from fastapi import File, Form, UploadFile, Body

import uvicorn
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware
from routers import api_router

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

app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        # ssl_certfile="ssl/likhoded.ru.crt",
        # ssl_keyfile="ssl/likhoded.ru.key"
    )