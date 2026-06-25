import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
STUDENTS_DIR = DATA_DIR / "alunos"
STUDENTS_FILE = DATA_DIR / "alunos.json"
ATTENDANCE_FILE = DATA_DIR / "presencas.json"


def ensure_data_dirs() -> None:
    STUDENTS_DIR.mkdir(parents=True, exist_ok=True)


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
