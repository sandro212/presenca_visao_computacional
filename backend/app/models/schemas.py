from pydantic import BaseModel


class Student(BaseModel):
    id: int
    name: str
    photo: str


class RecognizedStudent(BaseModel):
    id: int
    name: str
    confidence: float


class DetectedFace(BaseModel):
    x: int
    y: int
    w: int
    h: int
    name: str | None = None
    confidence: float | None = None


class RecognizeResponse(BaseModel):
    recognized: list[RecognizedStudent]
    faces: list[DetectedFace]
    frame_width: int
    frame_height: int


class AttendanceRecord(BaseModel):
    student_id: int
    name: str
    confidence: float
    timestamp: str
