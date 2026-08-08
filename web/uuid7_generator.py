import os
import uuid


def uuid7_timestamp_ms(u: uuid.UUID) -> int:
    """Извлекает временную метку (мс с эпохи Unix) из UUIDv7."""
    if u.version != 7:
        raise ValueError(f"Ожидался UUID версии 7, получен version={u.version}")
    return u.int >> 80  # старшие 48 бит


def _build_uuid7(timestamp_ms: int) -> uuid.UUID:
    """Собирает новый UUIDv7 с заданной временной меткой и случайными битами."""
    rand_a = int.from_bytes(os.urandom(2), "big") & 0x0FFF                 # 12 бит
    rand_b = int.from_bytes(os.urandom(8), "big") & 0x3FFF_FFFF_FFFF_FFFF  # 62 бита

    value = (timestamp_ms & 0xFFFF_FFFF_FFFF) << 80    # 48 бит: unix_ts_ms
    value |= 0x7 << 76                                  # 4 бита: версия (0111)
    value |= rand_a << 64                               # 12 бит: rand_a
    value |= 0b10 << 62                                 # 2 бита: вариант RFC 4122
    value |= rand_b                                     # 62 бита: rand_b

    return uuid.UUID(int=value)


def uuid7_generator(seed: uuid.UUID):
    """
    Генераторная функция.

    На вход подаётся уже готовый объект UUID в формате UUIDv7 (seed).
    Из него извлекается время генерации (мс с эпохи Unix). При каждом
    обращении к генератору (next()) возвращается новый UUIDv7, время
    которого строится на основе времени seed'а и монотонно увеличивается
    на 1 мс за вызов — это гарантирует упорядоченность и уникальность
    всех сгенерированных значений.
    """
    base_ms = uuid7_timestamp_ms(seed)
    step = 0
    while True:
        yield _build_uuid7(base_ms + step)
        step += 1


__all__ = ["uuid7_generator", "uuid7_timestamp_ms"]