import uvicorn
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from routers import api_router

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
        ssl_certfile="/etc/nginx/ssl/likhoded.ru.crt",
        ssl_keyfile="/etc/nginx/ssl/likhoded.ru.key",
    )