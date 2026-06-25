from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import Student
from app.services import face_recognition_service, student_service

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[Student])
def get_students() -> list[Student]:
    return student_service.list_students()


@router.post("", response_model=Student, status_code=201)
async def create_student(
    name: str = Form(...), photo: UploadFile = File(...)
) -> Student:
    if not name.strip():
        raise HTTPException(status_code=422, detail="Nome é obrigatório.")

    photo_bytes = await photo.read()
    try:
        image_rgb = student_service.load_image_rgb(photo_bytes)
    except Exception:
        raise HTTPException(status_code=422, detail="Arquivo de imagem inválido.")

    encoding = face_recognition_service.encode_face(image_rgb)
    if encoding is None:
        raise HTTPException(
            status_code=422, detail="Nenhum rosto encontrado na foto."
        )

    return student_service.create_student(name.strip(), photo_bytes, encoding)
