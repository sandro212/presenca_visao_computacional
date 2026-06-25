import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import AttendanceRecord, RecognizeResponse
from app.services import attendance_service, face_recognition_service

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceRecord])
def get_attendance() -> list[AttendanceRecord]:
    return attendance_service.list_attendance()


@router.post("/recognize", response_model=RecognizeResponse)
async def recognize(image: UploadFile = File(...)) -> RecognizeResponse:
    image_bytes = await image.read()
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=422, detail="Frame inválido.")

    recognized, faces = face_recognition_service.analyze_frame(frame)
    attendance_service.register_attendance(recognized)

    height, width = frame.shape[:2]
    return RecognizeResponse(
        recognized=recognized,
        faces=faces,
        frame_width=int(width),
        frame_height=int(height),
    )
