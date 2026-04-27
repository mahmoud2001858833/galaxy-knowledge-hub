import { useState, useRef, useEffect } from 'react';
import { useFaceLandmarker, type LandmarkPoint } from './useFaceLandmarker';
import { extractEmbedding, faceMatchScore } from '@/lib/facepay/faceUtils';
import { Button } from '@/components/ui/button';
import { ScanFace, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface FaceScannerProps {
  mode: 'enroll' | 'verify';
  expectedEmbedding?: number[];
  onComplete: (embedding: number[]) => void;
  onReject?: () => void;
  onCancel?: () => void;
  ctaLabel?: string;
}

// Strict identity threshold — only the registered face should pass.
const MATCH_THRESHOLD = 0.92;
// Number of consecutive matching frames required to accept identity (anti-glitch).
const REQUIRED_MATCHES = 9;
// Time window for verify before auto-rejecting (ms)
const VERIFY_TIMEOUT_MS = 18000;
// Number of clearly-low-score frames in a row that triggers an immediate reject
const REJECT_STREAK = 45;
// Maximum allowed distance of face center from frame center (normalized 0..1)
const CENTER_TOLERANCE = 0.18;

/**
 * Reusable face scanner. In `enroll` mode it samples ~25 stable landmark
 * frames, averages them into an embedding and returns it. In `verify` mode
 * it streams an identity score vs expectedEmbedding and only accepts after
 * REQUIRED_MATCHES consecutive high-score frames; otherwise rejects.
 */
export const FaceScanner = ({ mode, expectedEmbedding, onComplete, onReject, onCancel }: FaceScannerProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'success' | 'mismatch'>('scanning');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const samplesRef = useRef<number[][]>([]);
  const matchStreakRef = useRef(0);
  const lowStreakRef = useRef(0);
  const finishedRef = useRef(false);

  // Verify-mode timeout -> reject
  useEffect(() => {
    if (mode !== 'verify') return;
    const t = setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus('mismatch');
      setTimeout(() => onReject?.(), 1200);
    }, VERIFY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mode, onReject]);

  const handleLandmarks = (landmarks: LandmarkPoint[]) => {
    if (finishedRef.current) return;
    const emb = extractEmbedding(landmarks);
    if (!emb.length) return;

    // Compute face center in normalized coords (0..1) — reject if not centered.
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const p of landmarks) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const offCenter = Math.hypot(cx - 0.5, cy - 0.5);
    const isCentered = offCenter <= CENTER_TOLERANCE;

    if (mode === 'enroll') {
      if (!isCentered) return; // require user to center their face during enrollment too
      samplesRef.current.push(emb);
      const target = 25;
      const p = Math.min(100, (samplesRef.current.length / target) * 100);
      setProgress(p);
      if (samplesRef.current.length >= target) {
        finishedRef.current = true;
        const dim = emb.length;
        const avg = new Array(dim).fill(0);
        for (const s of samplesRef.current) {
          for (let i = 0; i < dim; i++) avg[i] += s[i];
        }
        for (let i = 0; i < dim; i++) avg[i] /= samplesRef.current.length;
        setStatus('success');
        setTimeout(() => onComplete(avg), 700);
      }
    } else if (expectedEmbedding && expectedEmbedding.length) {
      // Only the face that is well-centered in the frame is considered.
      const s = isCentered ? faceMatchScore(emb, expectedEmbedding) : 0;
      setScore(s);

      if (isCentered && s >= MATCH_THRESHOLD) {
        matchStreakRef.current += 1;
        lowStreakRef.current = 0;
      } else if (isCentered && s >= MATCH_THRESHOLD - 0.025) {
        matchStreakRef.current = Math.max(0, matchStreakRef.current - 1);
        lowStreakRef.current = 0;
      } else {
        matchStreakRef.current = 0;
        if (!isCentered || s < MATCH_THRESHOLD - 0.10) lowStreakRef.current += 1;
      }
      setStreak(matchStreakRef.current);
      setProgress(Math.min(100, (matchStreakRef.current / REQUIRED_MATCHES) * 100));

      if (matchStreakRef.current >= REQUIRED_MATCHES) {
        finishedRef.current = true;
        setStatus('success');
        setTimeout(() => onComplete(emb), 600);
      } else if (lowStreakRef.current >= REJECT_STREAK) {
        finishedRef.current = true;
        setStatus('mismatch');
        setTimeout(() => onReject?.(), 1200);
      }
    }
  };

  const { videoRef, canvasRef, ready, error } = useFaceLandmarker({
    onLandmarks: handleLandmarks,
    enabled: true,
  });

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-400/30 bg-slate-950 shadow-[0_0_60px_-12px_rgba(56,232,255,0.4)]">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cyan-200">
            <ScanFace className="w-12 h-12 animate-pulse" />
            <p className="text-sm">جاري تشغيل الكاميرا والذكاء الاصطناعي…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-rose-300 p-4 text-center">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm">{error}</p>
            <p className="text-xs opacity-70">تأكد من السماح بالوصول للكاميرا.</p>
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
          <span className="px-2 py-1 rounded bg-black/50 text-cyan-300 border border-cyan-400/30">
            FACE-AI · v3.1
          </span>
          <span className="px-2 py-1 rounded bg-black/50 text-violet-300 border border-violet-400/30">
            {mode === 'enroll' ? 'ENROLL' : 'VERIFY'}
          </span>
        </div>

        {mode === 'verify' && ready && status === 'scanning' && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
            <span className={`px-2 py-1 rounded border ${
              score >= MATCH_THRESHOLD
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                : score > MATCH_THRESHOLD - 0.05
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                  : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
            }`}>
              تطابق: {(score * 100).toFixed(1)}%
            </span>
            <span className="px-2 py-1 rounded bg-black/50 text-cyan-200 border border-cyan-400/30">
              {streak}/{REQUIRED_MATCHES} إطار
            </span>
          </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm animate-in fade-in">
            <CheckCircle2 className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]" />
          </div>
        )}
        {status === 'mismatch' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-500/15 backdrop-blur-sm animate-in fade-in p-4 text-center">
            <XCircle className="w-20 h-20 text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
            <p className="text-rose-100 font-bold">الوجه غير مطابق لصاحب الحساب</p>
            <p className="text-xs text-rose-200/80">رُفِضت العملية لحماية حسابك.</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-cyan-200/80 mb-2 font-mono">
          <span>{mode === 'enroll' ? 'جاري بناء بصمة الوجه…' : 'جاري التحقق من الهوية…'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {onCancel && (
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            إلغاء
          </Button>
        </div>
      )}
    </div>
  );
};
