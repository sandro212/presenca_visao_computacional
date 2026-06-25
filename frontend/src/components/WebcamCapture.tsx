import { useCallback, useEffect, useRef, useState } from "react";
import type { DetectedFace } from "../types";

interface WebcamCaptureProps {
  capturing: boolean;
  intervalMs: number;
  onFrame: (frame: Blob) => void;
  faces?: DetectedFace[];
  frameSize?: { width: number; height: number } | null;
}

export function WebcamCapture({
  capturing,
  intervalMs,
  onFrame,
  faces = [],
  frameSize = null,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const onFrameRef = useRef(onFrame);
  const [error, setError] = useState<string | null>(null);

  onFrameRef.current = onFrame;

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera(): Promise<void> {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Não foi possível acessar a webcam.");
      }
    }

    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onFrameRef.current(blob);
      },
      "image/jpeg",
      0.8
    );
  }, []);

  useEffect(() => {
    if (!capturing) return;
    const timer = setInterval(captureFrame, intervalMs);
    return () => clearInterval(timer);
  }, [capturing, intervalMs, captureFrame]);

  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;

    const width = video.clientWidth;
    const height = video.clientHeight;
    overlay.width = width;
    overlay.height = height;

    const context = overlay.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, width, height);

    if (!capturing || !frameSize || frameSize.width === 0) return;
    const scaleX = width / frameSize.width;
    const scaleY = height / frameSize.height;

    context.lineWidth = 2;
    context.font = "14px system-ui, sans-serif";
    context.textBaseline = "bottom";

    for (const face of faces) {
      const color = face.name ? "#16a34a" : "#dc2626";
      const x = face.x * scaleX;
      const y = face.y * scaleY;
      const w = face.w * scaleX;
      const h = face.h * scaleY;

      context.strokeStyle = color;
      context.strokeRect(x, y, w, h);

      const label = face.name
        ? `${face.name} ${(face.confidence ?? 0).toFixed(0)}%`
        : "Desconhecido";
      const textWidth = context.measureText(label).width;
      context.fillStyle = color;
      context.fillRect(x, y - 18, textWidth + 8, 18);
      context.fillStyle = "#fff";
      context.fillText(label, x + 4, y - 2);
    }
  }, [faces, frameSize, capturing]);

  return (
    <div className="webcam-capture">
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="webcam-frame">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas ref={overlayRef} className="webcam-overlay" />
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
