import { useEffect, useRef, useState } from 'react';
import { useFaceLandmarker, type LandmarkPoint } from './useFaceLandmarker';
import { smileScore, getEAR } from '@/lib/facepay/faceUtils';
import { Smile, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PasswordType } from '@/lib/facepay/storage';

interface GestureCaptureProps {
  type: PasswordType;
  onSuccess: () => void;
  label?: string;
}

/**
 * Detects either a sustained smile (~700ms) or 3 consecutive blinks
 * within 5 seconds. Calls onSuccess once when the gesture is confirmed.
 */
export const GestureCapture = ({ type, onSuccess, label }: GestureCaptureProps) => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [smileLive, setSmileLive] = useState(0); // 0..1 live smile score for HUD
  const blinkCountRef = useRef(0);
  const eyeClosedRef = useRef(false);
  const smileHoldRef = useRef(0); // ms accumulated above threshold
  const lastTickRef = useRef<number | null>(null);
  const firstBlinkRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const SMILE_THRESHOLD = 0.62;       // must clear this to count
  const SMILE_HOLD_MS = 1100;         // sustained for ~1.1s
  const SMILE_DECAY_MS = 220;         // grace before progress drops

  const handleLandmarks = (landmarks: LandmarkPoint[]) => {
    if (finishedRef.current) return;
    const now = performance.now();
    const dt = lastTickRef.current == null ? 16 : Math.min(60, now - lastTickRef.current);
    lastTickRef.current = now;

    if (type === 'smile') {
      const score = smileScore(landmarks);
      setSmileLive(score);
      if (score >= SMILE_THRESHOLD) {
        smileHoldRef.current = Math.min(SMILE_HOLD_MS, smileHoldRef.current + dt);
      } else {
        // Decay faster when score is far from threshold
        const decay = score < 0.35 ? dt : dt * 0.4;
        smileHoldRef.current = Math.max(0, smileHoldRef.current - decay);
      }
      setProgress((smileHoldRef.current / SMILE_HOLD_MS) * 100);
      if (smileHoldRef.current >= SMILE_HOLD_MS) finish();
    } else {
      const ear = getEAR(landmarks);
      const CLOSED = 0.18;
      const OPEN = 0.24;
      if (!eyeClosedRef.current && ear < CLOSED) {
        eyeClosedRef.current = true;
      } else if (eyeClosedRef.current && ear > OPEN) {
        eyeClosedRef.current = false;
        blinkCountRef.current += 1;
        if (firstBlinkRef.current === null) firstBlinkRef.current = now;
        // Reset window if too slow
        if (now - (firstBlinkRef.current ?? now) > 5000) {
          blinkCountRef.current = 1;
          firstBlinkRef.current = now;
        }
        setProgress(Math.min(100, (blinkCountRef.current / 3) * 100));
        if (blinkCountRef.current >= 3) finish();
      }
    }
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDone(true);
    setProgress(100);
    setTimeout(onSuccess, 700);
  };

  // Auto-reset blink window every 5s if incomplete
  useEffect(() => {
    if (type !== 'blinks') return;
    const id = setInterval(() => {
      if (finishedRef.current) return;
      if (firstBlinkRef.current && performance.now() - firstBlinkRef.current > 5000) {
        blinkCountRef.current = 0;
        firstBlinkRef.current = null;
        setProgress(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [type]);

  const { videoRef, canvasRef, ready, error } = useFaceLandmarker({
    onLandmarks: handleLandmarks,
    enabled: true,
  });

  const Icon = type === 'smile' ? Smile : Eye;
  const hint = type === 'smile' ? 'ابتسم بوضوح لمدة ثانية' : 'أغمض عينيك ٣ مرات متتالية';

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-violet-400/30 bg-slate-950 shadow-[0_0_60px_-12px_rgba(139,92,246,0.4)]">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-violet-200">
            <Icon className="w-12 h-12 animate-pulse" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300 p-4 text-center gap-2">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 border border-violet-400/40 text-xs text-violet-200 font-mono flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {label || hint}
        </div>

        {type === 'blinks' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 ${
                  i < blinkCountRef.current
                    ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                    : 'border-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm">
            <CheckCircle2 className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-violet-200/80 mb-2 font-mono">
          <span>{type === 'smile' ? 'ابتسامة' : 'رمشات'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-pink-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
