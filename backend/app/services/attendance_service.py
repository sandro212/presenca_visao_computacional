from datetime import datetime

from app.models.schemas import AttendanceRecord, RecognizedStudent
from app.utils.storage import ATTENDANCE_FILE, read_json, write_json


def list_attendance() -> list[AttendanceRecord]:
    return [AttendanceRecord(**record) for record in read_json(ATTENDANCE_FILE, [])]


def register_attendance(students: list[RecognizedStudent]) -> list[AttendanceRecord]:
    """Registra presença dos alunos reconhecidos, sem duplicar."""
    records = read_json(ATTENDANCE_FILE, [])
    present_ids = {record["student_id"] for record in records}

    new_records = []
    for student in students:
        if student.id in present_ids:
            continue
        record = {
            "student_id": student.id,
            "name": student.name,
            "confidence": student.confidence,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        }
        records.append(record)
        new_records.append(AttendanceRecord(**record))

    if new_records:
        write_json(ATTENDANCE_FILE, records)

    return new_records
