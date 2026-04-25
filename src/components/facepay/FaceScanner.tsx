import { useState, useRef } from 'react';
import { useFaceLandmarker, type LandmarkPoint } from './useFaceLandmarker';
import { extractEmbedding, cosineSimilarity } from '@/lib/facepay/faceUtils';
import { Button } from '@/components/ui/button';
import { ScanFace, CheckCircle2, AlertCircle } from 'lucide-react';

interface FaceScannerProps {
  mode: 'enroll' | 'verify';
  expectedEmbedding?: number[];
  onComplete: (embedding: number[]) => void;
  onCancel?: () => void;
  ctaLabel?: string;
}

/**
 * Reusable face scanner. In `enroll` mode it samples ~20 stable landmark
 * frames, averages them into an embedding and returns it. In `verify` mode
 * it streams cosine similarity vs expectedEmbedding until threshold passed.
 */
export const FaceScanner = ({ mode, expectedEmbedding, onComplete, onCancel, ctaLabel }: FaceScannerProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'success' | 'mismatch'>('scanning');
  const samplesRef = useRef<number[][]>([]);
  const finishedRef = useRef(false);

  const handleLandmarks = (landmarks: LandmarkPoint[]) => {
    if (finishedRef.current) return;
    const emb = extractEmbedding(landmarks);
    if (!emb.length) return;

    if (mode === 'enroll') {
      samplesRef.current.push(emb);
      const target = 25;
      const p = Math.min(100, (samplesRef.current.length / target) * 100);
      setProgress(p);
      if (samplesRef.current.length >= target) {
        finishedRef.current = true;
        // Average embeddings
        const dim = emb.length;
        const avg = new Array(dim).fill(0);
        for (const s of samplesRef.current) {
          for (let i = 0; i < dim; i++) avg[i] += s[i];
        }
        for (let i = 0; i < dim; i++) avg[i] /= samplesRef.current.length;
        setStatus('success');
        setTimeout(() => onComplete(avg), 700);
      }
    } else if (expectedEmbedding) {
      const sim = cosineSimilarity(emb, expectedEmbedding);
      // Map similarity 0.85..1 -> 0..100
      const p = Math.max(0, Math.min(100, ((sim - 0.85) / 0.13) * 100));
      setProgress(p);
      if (sim > 0.95) {
        finishedRef.current = true;
        setStatus('success');
        setTimeout(() => onComplete(emb), 600);
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

        {/* HUD */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
          <span className="px-2 py-1 rounded bg-black/50 text-cyan-300 border border-cyan-400/30">
            FACE-AI · v3.0
          </span>
          <span className="px-2 py-1 rounded bg-black/50 text-violet-300 border border-violet-400/30">
            {mode === 'enroll' ? 'ENROLL' : 'VERIFY'}
          </span>
        </div>

        {status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm animate-in fade-in">
            <CheckCircle2 className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]" />
          </div>
        )}
      </div>

      {/* Progress bar */}
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

      {(onCancel || ctaLabel) && (
        <div className="flex gap-2 mt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              إلغاء
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
