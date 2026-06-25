from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import attendance, students
from app.utils.storage import STUDENTS_DIR, ensure_data_dirs

ensure_data_dirs()

app = FastAPI(title="Chamada Automática por Reconhecimento Facial")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(attendance.router)

app.mount("/photos", StaticFiles(directory=STUDENTS_DIR), name="photos")
