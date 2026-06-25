import { useCallback, useEffect, useRef, useState } from "react";
import { listAttendance, recognizeFrame } from "../services/api";
import { WebcamCapture } from "../components/WebcamCapture";
import { AttendanceList } from "../components/AttendanceList";
import type {
  AttendanceRecord,
  DetectedFace,
  RecognizedStudent,
} from "../types";

const FRAME_INTERVAL_MS = 2000;

export function AttendancePage() {
  const [capturing, setCapturing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [lastRecognized, setLastRecognized] = useState<RecognizedStudent[]>([]);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [frameSize, setFrameSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const processingRef = useRef(false);

  const refreshAttendance = useCallback(async () => {
    try {
      setRecords(await listAttendance());
    } catch {
      // mantém a lista atual se a atualização falhar
    }
  }, []);

  useEffect(() => {
    refreshAttendance();
  }, [refreshAttendance]);

  const handleFrame = useCallback(
    async (frame: Blob) => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        const response = await recognizeFrame(frame);
        setLastRecognized(response.recognized);
        setFaces(response.faces);
        setFrameSize({
          width: response.frame_width,
          height: response.frame_height,
        });
        if (response.recognized.length > 0) {
          await refreshAttendance();
        }
      } catch {
        // ignora falhas pontuais de frame
      } finally {
        processingRef.current = false;
      }
    },
    [refreshAttendance]
  );

  return (
    <section>
      <h2>Chamada Automática</h2>
      <WebcamCapture
        capturing={capturing}
        intervalMs={FRAME_INTERVAL_MS}
        onFrame={handleFrame}
        faces={faces}
        frameSize={frameSize}
      />
      <button
        onClick={() =>
          setCapturing((current) => {
            const next = !current;
            if (!next) {
              setFaces([]);
              setLastRecognized([]);
            }
            return next;
          })
        }
      >
        {capturing ? "Pausar chamada" : "Iniciar chamada"}
      </button>

      {capturing && (
        <p className="status">
          {lastRecognized.length > 0
            ? `Reconhecido: ${lastRecognized
                .map(
                  (student) =>
                    `${student.name} (${student.confidence.toFixed(1)}%)`
                )
                .join(", ")}`
            : "Nenhum aluno reconhecido no momento."}
        </p>
      )}

      <h3>Lista de Presença</h3>
      <AttendanceList records={records} />
    </section>
  );
}
