from enum import Enum


class ChecklistValue(str, Enum):
    ZN = "zn"
    REC = "rec"
    JOBS = "jobs"
    PARTS = "parts"