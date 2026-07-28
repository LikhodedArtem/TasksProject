from enum import Enum


class FileType(str, Enum):
    ZN = "zn"
    REC = "rec"
    JOBS = "jobs"
    PARTS = "parts"


__all__ = ['FileType']