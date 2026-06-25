export interface Student {
  id: number;
  name: string;
  photo: string;
}

export interface RecognizedStudent {
  id: number;
  name: string;
  confidence: number;
}

export interface DetectedFace {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string | null;
  confidence: number | null;
}

export interface RecognizeResponse {
  recognized: RecognizedStudent[];
  faces: DetectedFace[];
  frame_width: number;
  frame_height: number;
}

export interface AttendanceRecord {
  student_id: number;
  name: string;
  confidence: number;
  timestamp: string;
}
