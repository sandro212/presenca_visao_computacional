import re
import unicodedata
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

from app.models.schemas import Student
from app.utils.storage import STUDENTS_DIR, STUDENTS_FILE, read_json, write_json


def _slugify(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_name.lower()).strip("_")


def _load_records() -> list[dict]:
    return read_json(STUDENTS_FILE, [])


def list_students() -> list[Student]:
    return [Student(**record) for record in _load_records()]


def get_student(student_id: int) -> Student | None:
    for record in _load_records():
        if record["id"] == student_id:
            return Student(**record)
    return None


def get_known_encodings() -> list[tuple[int, list[float]]]:
    return [
        (record["id"], record["encoding"])
        for record in _load_records()
        if record.get("encoding")
    ]


def load_image_rgb(photo_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(photo_bytes)).convert("RGB")
    return np.array(image)


def create_student(name: str, photo_bytes: bytes, encoding: list[float]) -> Student:
    records = _load_records()
    next_id = max((record["id"] for record in records), default=0) + 1

    filename = f"{_slugify(name) or 'aluno'}_{next_id}.jpg"
    photo_path: Path = STUDENTS_DIR / filename
    image = Image.open(BytesIO(photo_bytes)).convert("RGB")
    image.save(photo_path, "JPEG")

    record = {
        "id": next_id,
        "name": name,
        "photo": filename,
        "encoding": encoding,
    }
    records.append(record)
    write_json(STUDENTS_FILE, records)

    return Student(id=next_id, name=name, photo=filename)
