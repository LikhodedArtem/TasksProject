import traceback
from functools import wraps
from typing import Any

from fastapi import HTTPException, status
from starlette.responses import JSONResponse


def safe_route(error_message: str | None = None):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                result = await func(*args, **kwargs)
                if result is not None:
                    return result
                else:
                    return JSONResponse(status_code=200, content={"message": "success"})

            except HTTPException:
                raise

            except Exception as e:
                if error_message:
                    print(error_message)
                traceback.format_exc()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Неизвестная ошибка: {str(e)}"
                )

        return wrapper
    return decorator


__all__ = ["safe_route"]