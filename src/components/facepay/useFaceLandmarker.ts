import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export type LandmarkPoint = { x: number; y: number; z: number };
export type FaceBlendshapes = Record<string, number>;

interface UseFaceLandmarkerOpts {
  onLandmarks?: (landmarks: LandmarkPoint[], blendshapes: FaceBlendshapes) => void;
  enabled: boolean;
}

/**
 * Initializes MediaPipe FaceLandmarker, opens the user camera, draws a
 * futuristic overlay (468-point mesh + scan line + glow rings) and emits
 * landmarks every animation frame.
 */
export const useFaceLandmarker = ({ onLandmarks, enabled }: UseFaceLandmarkerOpts) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onLandmarksRef = useRef(onLandmarks);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanProgress = useRef(0);

  useEffect(() => { onLandmarksRef.current = onLandmarks; }, [onLandmarks]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    let cancelled = false;

    const init = async () => {
      try {
        setError(null);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
        );
        const lm = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        if (cancelled) { lm.close(); return; }
        landmarkerRef.current = lm;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          loop();
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'فشل تشغيل الكاميرا';
        setError(msg);
      }
    };

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const lm = landmarkerRef.current;
      if (!video || !canvas || !lm || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let result: FaceLandmarkerResult | null = null;
      try {
        result = lm.detectForVideo(video, performance.now());
      } catch { /* ignore */ }

      // Mirror draw the video
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Tint overlay
      ctx.fillStyle = 'rgba(8, 12, 30, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const landmarks = result?.faceLandmarks?.[0];
      if (landmarks && landmarks.length) {
        // Draw 468-point mesh (mirrored)
        ctx.fillStyle = 'rgba(56, 232, 255, 0.85)';
        for (let i = 0; i < landmarks.length; i++) {
          const p = landmarks[i];
          const x = (1 - p.x) * canvas.width;
          const y = p.y * canvas.height;
          ctx.fillRect(x, y, 1.6, 1.6);
        }

        // Bounding ring
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const p of landmarks) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        const cx = ((1 - (minX + maxX) / 2)) * canvas.width;
        const cy = ((minY + maxY) / 2) * canvas.height;
        const r = Math.max((maxX - minX), (maxY - minY)) * canvas.width * 0.7;

        // Pulse rings
        const t = performance.now() / 400;
        for (let i = 0; i < 3; i++) {
          const phase = (t + i * 0.4) % 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r * (0.85 + phase * 0.35), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.5 * (1 - phase)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Bracket corners
        ctx.strokeStyle = 'rgba(16, 245, 200, 0.9)';
        ctx.lineWidth = 3;
        const bx = cx - r, by = cy - r, bw = r * 2;
        const c = 22;
        ctx.beginPath();
        ctx.moveTo(bx, by + c); ctx.lineTo(bx, by); ctx.lineTo(bx + c, by);
        ctx.moveTo(bx + bw - c, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + c);
        ctx.moveTo(bx, by + bw - c); ctx.lineTo(bx, by + bw); ctx.lineTo(bx + c, by + bw);
        ctx.moveTo(bx + bw - c, by + bw); ctx.lineTo(bx + bw, by + bw); ctx.lineTo(bx + bw, by + bw - c);
        ctx.stroke();

        // Scan line
        scanProgress.current = (scanProgress.current + 0.012) % 1;
        const lineY = by + scanProgress.current * bw;
        const grad = ctx.createLinearGradient(bx, lineY - 8, bx, lineY + 8);
        grad.addColorStop(0, 'rgba(56,232,255,0)');
        grad.addColorStop(0.5, 'rgba(56,232,255,0.9)');
        grad.addColorStop(1, 'rgba(56,232,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, lineY - 8, bw, 16);

        if (onLandmarksRef.current) {
          const blendshapes: FaceBlendshapes = {};
          for (const category of result?.faceBlendshapes?.[0]?.categories ?? []) {
            if (category.categoryName) blendshapes[category.categoryName] = category.score ?? 0;
          }
          onLandmarksRef.current(landmarks as LandmarkPoint[], blendshapes);
        }
      } else {
        // No face: pulse hint
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    init();
    return () => {
      cancelled = true;
      stop();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      setReady(false);
    };
  }, [enabled, stop]);

  return { videoRef, canvasRef, ready, error };
};
