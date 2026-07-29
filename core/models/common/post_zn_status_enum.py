from enum import Enum


class PostZNStatusEnum(str, Enum):
    START = "start"
    PAUSED = "paused"
    STOPPED = "stopped"