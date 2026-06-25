import face_recognition
import numpy as np

from app.models.schemas import DetectedFace, RecognizedStudent
from app.services import student_service
from app.services.face_detection import detect_faces

# Distância máxima para considerar uma correspondência válida.
MATCH_THRESHOLD = 0.6


def encode_face(image_rgb: np.ndarray) -> list[float] | None:
    """Gera o encoding facial da primeira face encontrada na imagem."""
    encodings = face_recognition.face_encodings(image_rgb)
    if not encodings:
        return None
    return encodings[0].tolist()


def analyze_frame(
    image_bgr: np.ndarray,
) -> tuple[list[RecognizedStudent], list[DetectedFace]]:
    """Detecta rostos com Haarcascade e identifica alunos cadastrados.

    Retorna os alunos reconhecidos (para a chamada) e todas as faces
    detectadas com sua caixa, para que o frontend possa marcá-las no vídeo.
    """
    boxes = detect_faces(image_bgr)
    if not boxes:
        return [], []

    known = student_service.get_known_encodings()
    image_rgb = image_bgr[:, :, ::-1].copy()
    # face_recognition usa (top, right, bottom, left)
    locations = [(y, x + w, y + h, x) for (x, y, w, h) in boxes]
    encodings = face_recognition.face_encodings(image_rgb, locations)

    known_ids = [student_id for student_id, _ in known]
    known_encodings = np.array([encoding for _, encoding in known]) if known else None

    faces: list[DetectedFace] = []
    recognized: dict[int, RecognizedStudent] = {}
    for (x, y, w, h), encoding in zip(boxes, encodings):
        name: str | None = None
        confidence: float | None = None

        if known_encodings is not None and len(known_encodings):
            distances = face_recognition.face_distance(known_encodings, encoding)
            best_index = int(np.argmin(distances))
            best_distance = float(distances[best_index])
            if best_distance <= MATCH_THRESHOLD:
                student = student_service.get_student(known_ids[best_index])
                if student is not None:
                    name = student.name
                    confidence = round((1.0 - best_distance) * 100, 1)
                    current = recognized.get(student.id)
                    if current is None or confidence > current.confidence:
                        recognized[student.id] = RecognizedStudent(
                            id=student.id, name=student.name, confidence=confidence
                        )

        faces.append(DetectedFace(x=x, y=y, w=w, h=h, name=name, confidence=confidence))

    return list(recognized.values()), faces
