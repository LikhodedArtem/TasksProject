from typing import Annotated

from fastapi import Request, Depends


async def get_xml_string(request: Request) -> bytes:
    return await request.body()


GetXMLString = Annotated[bytes, Depends(get_xml_string)]


__all__ = ["GetXMLString"]