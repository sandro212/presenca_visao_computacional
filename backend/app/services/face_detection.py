import cv2
import numpy as np

_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def detect_faces(image_bgr: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Detecta rostos com Haarcascade. Retorna lista de (x, y, w, h)."""
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    faces = _cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    return [tuple(int(v) for v in face) for face in faces]
