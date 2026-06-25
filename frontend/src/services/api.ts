import axios from "axios";
import type {
  AttendanceRecord,
  RecognizeResponse,
  Student,
} from "../types";

export const API_BASE_URL = "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE_URL });

export async function createStudent(
  name: string,
  photo: File
): Promise<Student> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("photo", photo);
  const response = await api.post<Student>("/students", formData);
  return response.data;
}

export async function listStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>("/students");
  return response.data;
}

export async function recognizeFrame(
  frame: Blob
): Promise<RecognizeResponse> {
  const formData = new FormData();
  formData.append("image", frame, "frame.jpg");
  const response = await api.post<RecognizeResponse>(
    "/attendance/recognize",
    formData
  );
  return response.data;
}

export async function listAttendance(): Promise<AttendanceRecord[]> {
  const response = await api.get<AttendanceRecord[]>("/attendance");
  return response.data;
}

export function studentPhotoUrl(photo: string): string {
  return `${API_BASE_URL}/photos/${photo}`;
}
