import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Image as ImageIcon, Volume2, Hand, Printer, Smartphone, Vibrate, ArrowRight, Loader2, Download, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logToolUse } from './interactionLog';
import { loadHapticSettings, patternFor, intensityScale } from './hapticSettings';
import { hapticPlay, hapticStop, isHapticLocked } from './hapticBus';

interface TactileRegion {
  label: string;
  shape: 'circle' | 'rect' | 'polygon';
  x: number; y: number; w: number; h: number;
  texture: string; elevation: number; description: string;
}
interface HapticStep { region: string; intensity: number; duration: number; pattern: string; }
interface AnalysisResult {
  title?: string;
  audioDescription?: string;
  shortDescription?: string;
  tactileRegions?: TactileRegion[];
  hapticPattern?: HapticStep[];
  printingNotes?: string;
}

const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const hasVibration = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;

const SensoryImageTactile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [speakingMerged, setSpeakingMerged] = useState(false);
  const [geoMapping, setGeoMapping] = useState(true);
  const [visualMapping, setVisualMapping] = useState(true);
  const [textureMapping, setTextureMapping] = useState(true);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [connectTarget, setConnectTarget] = useState<number | null>(null);
  const [connectStatus, setConnectStatus] = useState<'idle' | 'wrong' | 'success'>('idle');
  // Training mode state
  const [trainingMode, setTrainingMode] = useState(false);
  const [trainingTotal, setTrainingTotal] = useState(5);
  const [trainingRound, setTrainingRound] = useState(0); // completed rounds
  const [trainingErrors, setTrainingErrors] = useState(0);
  const [trainingScore, setTrainingScore] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [roundStartedAt, setRoundStartedAt] = useState<number>(0);
  const [trainingTimes, setTrainingTimes] = useState<number[]>([]);
  const [trainingSummary, setTrainingSummary] = useState<null | { score: number; errors: number; total: number; avgTime: number; perfectRounds: number }>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const currentRegionRef = useRef<number | null>(null);
  const hummingRef = useRef<number | null>(null);
  const focusPulseRef = useRef<number | null>(null);
  const lastVisualRef = useRef<number>(0);
  const lastIntensityRef = useRef<number>(0);
  const lastErrorRef = useRef<number>(0);
  const mobile = isMobile();
  const settingsRef = useRef(loadHapticSettings());
  // Refresh settings each time component focuses (in case user updated them)
  useEffect(() => {
    const refresh = () => { settingsRef.current = loadHapticSettings(); };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const vibrate = hasVibration();

  // Classify a texture string into a haptic family
  type TextureKind = 'rough' | 'smooth' | 'dotted' | 'default';
  const classifyTexture = (t?: string): TextureKind => {
    const s = (t || '').toLowerCase();
    if (/خشن|صخر|جبل|حجر|خشب|قاسي|rough|rock|mountain|stone|wood|bark|coarse/.test(s)) return 'rough';
    if (/ناعم|حرير|ماء|سائل|زجاج|smooth|silk|water|liquid|glass|soft/.test(s)) return 'smooth';
    if (/منقط|نقاط|بريل|حبيبات|رمل|dot|braille|sand|grain|bumpy|stipple/.test(s)) return 'dotted';
    return 'default';
  };

  const stopHumming = () => {
    if (hummingRef.current) { clearInterval(hummingRef.current); hummingRef.current = null; }
    if (vibrate) hapticStop();
  };
  const startHumming = (ms = 25, gap = 80) => {
    stopHumming();
    if (!vibrate) return;
    const k = intensityScale(settingsRef.current.textureHum);
    hummingRef.current = window.setInterval(() => hapticPlay('hum', Math.max(6, Math.round(ms * k))), gap);
  };
  // Texture-aware humming: rough = irregular ticks, smooth = continuous low,
  // dotted = very fast short pulses (like Braille paper).
  const startTextureHumming = (kind: TextureKind) => {
    stopHumming();
    if (!vibrate) return;
    const k = intensityScale(settingsRef.current.textureHum);
    const sc = (n: number) => Math.max(4, Math.round(n * k));
    if (kind === 'smooth') {
      hummingRef.current = window.setInterval(() => hapticPlay('hum', sc(18)), 60);
    } else if (kind === 'dotted') {
      hummingRef.current = window.setInterval(() => hapticPlay('hum', sc(8)), 35);
    } else if (kind === 'rough') {
      hummingRef.current = window.setInterval(() => {
        const burst = [
          12 + Math.random() * 18, 25 + Math.random() * 30,
          10 + Math.random() * 15, 35 + Math.random() * 40,
          15 + Math.random() * 20,
        ].map(n => sc(n));
        hapticPlay('hum', burst);
      }, 220);
    } else {
      hummingRef.current = window.setInterval(() => hapticPlay('hum', sc(25)), 80);
    }
  };
  useEffect(() => () => { stopHumming(); stopFocusPulse(); }, []);

  // === Instructional cues (Section 4) ===
  const cueError = () => {
    if (!vibrate) return;
    const now = performance.now();
    if (now - lastErrorRef.current < 400) return;
    lastErrorRef.current = now;
    // Disturbed/jittery pattern (like wrong password)
    hapticPlay('cue', patternFor('errorPattern', settingsRef.current.errorPattern), { lockMs: 250 });
    logToolUse('haptic');
  };
  const cueSuccess = () => {
    if (!vibrate) return;
    hapticPlay('cue', patternFor('successPattern', settingsRef.current.successPattern), { lockMs: 300 });
    logToolUse('haptic');
  };
  const focusEngagedRef = useRef<{ id: number | null; gap: number; over: boolean }>({ id: null, gap: 500, over: false });
  const stopFocusPulse = () => {
    if (focusPulseRef.current) { clearInterval(focusPulseRef.current); focusPulseRef.current = null; }
    stopFocusEngaged();
  };
  const stopFocusEngaged = () => {
    if (focusEngagedRef.current.id) { clearInterval(focusEngagedRef.current.id); }
    focusEngagedRef.current = { id: null, gap: 500, over: false };
  };
  const startFocusPulse = (idx: number) => {
    stopFocusPulse();
    setFocusIdx(idx);
    if (!vibrate) return;
    // Ambient gentle pulse (attracts attention from anywhere on the canvas)
    focusPulseRef.current = window.setInterval(() => hapticPlay('pulse', patternFor('focusPulse', settingsRef.current.focusPulse)), 700);
  };
  // While finger is over the focus region, accelerate the pulse rate
  const tickFocusEngaged = () => {
    if (!vibrate) return;
    hapticPlay('pulse', 70);
    // Accelerate: shrink gap toward 80ms minimum
    focusEngagedRef.current.gap = Math.max(80, focusEngagedRef.current.gap - 35);
    if (focusEngagedRef.current.id) clearInterval(focusEngagedRef.current.id);
    focusEngagedRef.current.id = window.setInterval(tickFocusEngaged, focusEngagedRef.current.gap);
  };
  const enterFocus = () => {
    if (focusEngagedRef.current.over) return;
    focusEngagedRef.current.over = true;
    // Pause ambient pulse so the engaged one is clearly perceptible
    if (focusPulseRef.current) { clearInterval(focusPulseRef.current); focusPulseRef.current = null; }
    focusEngagedRef.current.gap = 500;
    if (focusEngagedRef.current.id) clearInterval(focusEngagedRef.current.id);
    focusEngagedRef.current.id = window.setInterval(tickFocusEngaged, focusEngagedRef.current.gap);
  };
  const leaveFocus = () => {
    if (!focusEngagedRef.current.over) return;
    stopFocusEngaged();
    // Restore ambient pulse if focus is still active
    if (focusIdx !== null && vibrate) {
      focusPulseRef.current = window.setInterval(() => hapticPlay('pulse', patternFor('focusPulse', settingsRef.current.focusPulse)), 700);
    }
  };
  // Pick a connect-exercise target (random region) and clear status
  const pickRandomTarget = (excludeIdx: number | null = null) => {
    if (!result?.tactileRegions?.length) return null;
    const n = result.tactileRegions.length;
    if (n === 1) return 0;
    let t = Math.floor(Math.random() * n);
    if (excludeIdx !== null) while (t === excludeIdx) t = Math.floor(Math.random() * n);
    return t;
  };
  const startConnectExercise = () => {
    const t = pickRandomTarget();
    if (t === null) return;
    setConnectTarget(t); setConnectStatus('idle'); setRoundErrors(0); setRoundStartedAt(performance.now());
    toast.info(`وصّل إصبعك إلى: ${result!.tactileRegions![t].label}`);
  };
  const startTraining = () => {
    if (!result?.tactileRegions?.length) { toast.error('حلّل صورة أولاً'); return; }
    setTrainingMode(true); setTrainingRound(0); setTrainingErrors(0); setTrainingScore(0);
    setTrainingTimes([]); setTrainingSummary(null);
    const t = pickRandomTarget();
    if (t === null) return;
    setConnectTarget(t); setConnectStatus('idle'); setRoundErrors(0); setRoundStartedAt(performance.now());
    toast.info(`جولة 1/${trainingTotal} — وصّل إصبعك إلى: ${result.tactileRegions[t].label}`);
  };
  const finishTraining = (totals: { score: number; errors: number; total: number; times: number[] }) => {
    const avgTime = totals.times.length ? Math.round(totals.times.reduce((a, b) => a + b, 0) / totals.times.length) : 0;
    const perfectRounds = totals.times.length; // counted in onSuccess only when 0 errors
    setTrainingSummary({ score: totals.score, errors: totals.errors, total: totals.total, avgTime, perfectRounds });
    setTrainingMode(false); setConnectTarget(null); setConnectStatus('idle');
    if (vibrate) hapticPlay('cue', [80, 100, 80, 100, 200, 100, 300], { lockMs: 400 });
  };
  const onTrainingRoundSuccess = () => {
    const elapsed = Math.max(0, performance.now() - roundStartedAt);
    const points = roundErrors === 0 ? 10 : Math.max(2, 10 - roundErrors * 2);
    const isPerfect = roundErrors === 0;
    const nextScore = trainingScore + points;
    const nextErrors = trainingErrors + roundErrors;
    const nextRound = trainingRound + 1;
    const nextTimes = isPerfect ? [...trainingTimes, elapsed] : trainingTimes;
    setTrainingScore(nextScore); setTrainingErrors(nextErrors); setTrainingRound(nextRound); setTrainingTimes(nextTimes);
    if (nextRound >= trainingTotal) {
      finishTraining({ score: nextScore, errors: nextErrors, total: trainingTotal, times: nextTimes });
    } else {
      const t = pickRandomTarget(connectTarget);
      if (t === null) return;
      setRoundErrors(0); setRoundStartedAt(performance.now()); setConnectStatus('idle'); setConnectTarget(t);
      toast.info(`جولة ${nextRound + 1}/${trainingTotal} — ${result!.tactileRegions![t].label}`);
    }
  };
  const cancelTraining = () => {
    setTrainingMode(false); setConnectTarget(null); setConnectStatus('idle');
  };

  // Sample color at canvas-relative percentage. Returns { lum 0-1, rgb }
  const sampleColor = (px: number, py: number) => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;
    if (!pixelCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      pixelCanvasRef.current = c;
    }
    const c = pixelCanvasRef.current;
    const x = Math.max(0, Math.min(c.width - 1, Math.round((px / 100) * c.width)));
    const y = Math.max(0, Math.min(c.height - 1, Math.round((py / 100) * c.height)));
    try {
      const d = c.getContext('2d')!.getImageData(x, y, 1, 1).data;
      const lum = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
      return { lum, r: d[0], g: d[1], b: d[2] };
    } catch { return null; }
  };

  // Visual mapping: dark = strong/long, light = soft/quick. Throttled.
  const applyVisualHaptic = (px: number, py: number) => {
    if (!hapticEnabled || !vibrate) return;
    const now = performance.now();
    if (now - lastVisualRef.current < 90) return;
    const s = sampleColor(px, py);
    if (!s) return;
    // darkness 0..1 → intensity
    const darkness = 1 - s.lum;
    const ms = Math.round(8 + darkness * 90); // 8ms (light) → ~98ms (dark)
    // Only re-vibrate if intensity changed enough → smooth gradient feel
    if (Math.abs(ms - lastIntensityRef.current) < 6) return;
    lastIntensityRef.current = ms;
    lastVisualRef.current = now;
    if (!isHapticLocked()) navigator.vibrate(ms);
  };

  const onFile = (f: File) => {
    setFile(f); setResult(null);
    pixelCanvasRef.current = null;
    setImgUrl(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke('sensory-image-tactile', {
        body: { imageBase64: b64, mimeType: file.type },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as AnalysisResult);
      logToolUse('image_analyze');
      toast.success('تم التحليل بنجاح');
    } catch (e: any) {
      toast.error(e?.message || 'فشل التحليل');
    } finally { setLoading(false); }
  };

  // Draw tactile model on canvas
  useEffect(() => {
    if (!result?.tactileRegions || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const W = 600, H = 600 * (img.naturalHeight / img.naturalWidth || 0.75);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    ctx.globalAlpha = 0.55;
    result.tactileRegions.forEach((r, i) => {
      const x = (r.x / 100) * W, y = (r.y / 100) * H, w = (r.w / 100) * W, h = (r.h / 100) * H;
      const colors = ['#7c3aed','#0891b2','#16a34a','#ea580c','#db2777','#ca8a04','#0d9488','#9333ea'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      if (r.shape === 'circle') {
        ctx.beginPath(); ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      } else { ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000'; ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${i+1}`, x + 6, y + 18);
      ctx.globalAlpha = 0.55;
    });
    ctx.globalAlpha = 1;
  }, [result, imgUrl]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return toast.error('النطق غير مدعوم');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.95;
    window.speechSynthesis.speak(u);
    logToolUse('tts');
  };

  const triggerHaptic = (intensity: number, duration: number, pattern: string) => {
    if (!hapticEnabled || !vibrate) return;
    const i = Math.max(1, Math.min(10, intensity));
    const d = Math.max(30, Math.min(800, duration));
    if (pattern === 'pulse') navigator.vibrate([d, 80, d]);
    else if (pattern === 'rhythm') navigator.vibrate([d, 60, d/2, 60, d]);
    else navigator.vibrate(d * (i / 5));
    logToolUse('haptic');
  };

  const playMergedExperience = async () => {
    if (!result) return;
    setSpeakingMerged(true);
    const intro = `${result.title || ''}. ${result.audioDescription || ''}`;
    speak(intro);
    if (hapticEnabled && vibrate && result.hapticPattern) {
      for (const step of result.hapticPattern) {
        triggerHaptic(step.intensity, step.duration, step.pattern);
        await new Promise(r => setTimeout(r, (step.duration || 200) + 250));
      }
    }
    setSpeakingMerged(false);
  };

  const downloadModel = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tactile-model-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const printModel = () => {
    logToolUse('tactile_print');
    if (!canvasRef.current || !result) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (!w) return;
    const legend = (result.tactileRegions || []).map((r, i) =>
      `<li><b>${i+1}. ${r.label}</b> — ملمس: ${r.texture} / ارتفاع: ${r.elevation}/5 — ${r.description}</li>`
    ).join('');
    w.document.write(`<html dir="rtl"><head><title>نموذج تعليمي قابل للطباعة</title>
      <style>body{font-family:sans-serif;padding:20px}img{max-width:100%;border:2px solid #000}
      h1{font-size:20px}ul{line-height:1.8}</style></head><body>
      <h1>${result.title || 'نموذج تعليمي'}</h1>
      <img src="${dataUrl}"/>
      <h2>دليل المناطق</h2><ul>${legend}</ul>
      <p><b>إرشادات الطباعة:</b> ${result.printingNotes || 'استخدم طابعة بريل أو طابعة 3D لإبراز المناطق المحدّدة'}</p>
      </body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
  };

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <Link to="/damij/sensory" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] hover:underline">
          <ArrowRight className="w-4 h-4" /> رجوع
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-3">
          <ImageIcon className="w-4 h-4" /><span className="text-sm font-bold">أداة جديدة في الجسر الحسّي الذكي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">صورة → وصف صوتي تفاعلي</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          ارفع صورة تعليمية، وسيقوم الذكاء الاصطناعي بتحليلها وتحويلها إلى وصف صوتي مفصّل ونموذج تعليمي تفاعلي قابل للطباعة.
        </p>
      </div>


      {!file && (
        <label className="block max-w-xl mx-auto cursor-pointer">
          <div className="border-2 border-dashed border-[hsl(var(--damij-primary))]/40 rounded-3xl p-10 text-center bg-white hover:bg-purple-50 transition">
            <Upload className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
            <p className="font-bold text-lg mb-1">اضغط لرفع صورة</p>
            <p className="text-sm text-gray-500">JPG / PNG حتى 10MB</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      )}

      {file && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5"/> الصورة الأصلية</h3>
            <img ref={imgRef} src={imgUrl} alt="رفع" className="w-full rounded-xl mb-3" crossOrigin="anonymous" />
            <div className="flex gap-2">
              <button onClick={analyze} disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold disabled:opacity-50">
                {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> جاري التحليل...</span> : 'حلّل الصورة'}
              </button>
              <button onClick={() => { setFile(null); setResult(null); }} className="px-4 py-3 rounded-xl bg-gray-200">إلغاء</button>
            </div>
          </div>

          <div className="space-y-4">


            {result && (
              <>
                {/* Audio description */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Volume2 className="w-5 h-5 text-blue-600"/> الوصف الصوتي</h3>
                  {result.title && <p className="font-bold text-[hsl(var(--damij-primary))] mb-2">{result.title}</p>}
                  <p className="text-sm leading-relaxed mb-3 max-h-48 overflow-y-auto">{result.audioDescription}</p>
                  <button onClick={() => speak(result.audioDescription || '')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold">
                    🔊 استمع للوصف
                  </button>
                </div>

                {/* Tactile model */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Hand className="w-5 h-5 text-purple-600"/> النموذج اللمسي</h3>
                  <div className="flex flex-col gap-1 mb-2 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={geoMapping} onChange={(e) => setGeoMapping(e.target.checked)} />
                      <span>تضاريس الشكل (نبضة عند الحواف + همهمة داخل الشكل)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={visualMapping} onChange={(e) => setVisualMapping(e.target.checked)} />
                      <span>بصمة اللون (غامق = اهتزاز قوي، فاتح = خفيف، تدرّج متناسب)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={textureMapping} onChange={(e) => setTextureMapping(e.target.checked)} />
                      <span>الملمس الافتراضي (خشن=تكتكة، ناعم=تردد منخفض، منقط=نبضات بريل سريعة)</span>
                    </label>
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-xl border touch-none"
                    onPointerLeave={() => { stopHumming(); leaveFocus(); currentRegionRef.current = null; lastIntensityRef.current = 0; }}
                    onPointerUp={() => { stopHumming(); leaveFocus(); currentRegionRef.current = null; lastIntensityRef.current = 0; }}
                    onPointerMove={(e) => {
                      if (!hapticEnabled || !canvasRef.current) return;
                      const rect = canvasRef.current.getBoundingClientRect();
                      const px = ((e.clientX - rect.left) / rect.width) * 100;
                      const py = ((e.clientY - rect.top) / rect.height) * 100;
                      // Visual color mapping (independent layer)
                      if (visualMapping) applyVisualHaptic(px, py);
                      if (!result.tactileRegions) return;
                      const idx = result.tactileRegions.findIndex(r =>
                        px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
                      );
                      const region = idx >= 0 ? result.tactileRegions[idx] : null;
                      if (!geoMapping) {
                        // No geo mode: still allow texture-only continuous feedback inside a region
                        if (textureMapping && region && idx !== currentRegionRef.current) {
                          currentRegionRef.current = idx;
                          startTextureHumming(classifyTexture(region.texture));
                        } else if (!region && currentRegionRef.current !== null) {
                          currentRegionRef.current = null; stopHumming();
                        } else if (!textureMapping && !visualMapping && region) {
                          triggerHaptic(region.elevation * 2, 80, 'continuous');
                        }
                        return;
                      }
                      // Geometric mapping mode
                      if (idx !== currentRegionRef.current) {
                        if (vibrate) hapticPlay('edge', patternFor('edgeClick', settingsRef.current.edgeClick)); // edge click
                        currentRegionRef.current = idx;
                        if (region) {
                          if (textureMapping) startTextureHumming(classifyTexture(region.texture));
                          else if (!visualMapping) startHumming();
                        } else {
                          stopHumming();
                        }
                      }
                      // Connect-exercise instructional cues
                      if (connectTarget !== null) {
                        if (idx === connectTarget && connectStatus !== 'success') {
                          cueSuccess(); setConnectStatus('success');
                          if (trainingMode) onTrainingRoundSuccess();
                          else toast.success('أحسنت! وصلت للمكان الصحيح');
                        } else if (region && idx !== connectTarget && connectStatus !== 'success') {
                          if (connectStatus !== 'wrong') setConnectStatus('wrong');
                          if (trainingMode) setRoundErrors(v => v + 1);
                          cueError();
                        }
                      }
                      // Focus-point engagement: accelerate pulse while finger is over it
                      if (focusIdx !== null) {
                        if (idx === focusIdx) enterFocus(); else leaveFocus();
                      }
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button onClick={downloadModel} className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-bold inline-flex items-center justify-center gap-2">
                      <Download className="w-4 h-4"/> تنزيل
                    </button>
                    <button onClick={printModel} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4"/> طباعة لمسية
                    </button>
                    </div>

                    {/* Training mode */}
                    <div className="mb-3 p-2 rounded-lg bg-white border border-amber-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-bold text-amber-800">وضع التدريب — درجات وعدّ أخطاء</p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs">عدد الجولات:</label>
                          <select
                            disabled={trainingMode}
                            value={trainingTotal}
                            onChange={(e) => setTrainingTotal(Number(e.target.value))}
                            className="text-xs border rounded px-1 py-0.5"
                          >
                            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!trainingMode ? (
                          <button onClick={startTraining} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold">
                            ابدأ وضع التدريب
                          </button>
                        ) : (
                          <button onClick={cancelTraining} className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs">إنهاء التدريب</button>
                        )}
                      </div>
                      {trainingMode && (
                        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-amber-50 rounded p-1"><div className="font-bold">{trainingRound + 1}/{trainingTotal}</div><div>الجولة</div></div>
                          <div className="bg-green-50 rounded p-1"><div className="font-bold text-green-700">{trainingScore}</div><div>النقاط</div></div>
                          <div className="bg-red-50 rounded p-1"><div className="font-bold text-red-700">{trainingErrors + roundErrors}</div><div>الأخطاء</div></div>
                          <div className="bg-blue-50 rounded p-1"><div className="font-bold text-blue-700">{roundErrors}</div><div>هذه الجولة</div></div>
                        </div>
                      )}
                      {trainingSummary && (
                        <div className="mt-2 p-2 rounded-lg bg-gradient-to-l from-purple-50 to-amber-50 border border-purple-200 text-xs">
                          <p className="font-bold text-purple-800 mb-1">📊 ملخص التدريب</p>
                          <ul className="space-y-0.5">
                            <li>الدرجة النهائية: <b className="text-green-700">{trainingSummary.score}/{trainingSummary.total * 10}</b></li>
                            <li>إجمالي الأخطاء: <b className="text-red-700">{trainingSummary.errors}</b></li>
                            <li>جولات بدون أخطاء: <b className="text-purple-700">{trainingSummary.perfectRounds}/{trainingSummary.total}</b></li>
                            <li>متوسط زمن الجولة المثالية: <b>{(trainingSummary.avgTime / 1000).toFixed(1)}ث</b></li>
                            <li>التقدير: <b>{trainingSummary.score >= trainingSummary.total * 9 ? 'ممتاز ⭐' : trainingSummary.score >= trainingSummary.total * 7 ? 'جيد جداً 👏' : trainingSummary.score >= trainingSummary.total * 5 ? 'جيد' : 'يحتاج تدريباً إضافياً'}</b></li>
                          </ul>
                          <button onClick={() => setTrainingSummary(null)} className="mt-2 text-xs text-purple-600 underline">إغلاق</button>
                        </div>
                      )}
                    </div>

                  {/* Instructional cues controls */}
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-bold text-amber-800 mb-2">تنبيهات تعليمية (Instructional cues)</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button onClick={startConnectExercise} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold">
                        ابدأ تمرين توصيل
                      </button>
                      {connectTarget !== null && (
                        <button onClick={() => { setConnectTarget(null); setConnectStatus('idle'); }} className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs">إلغاء التمرين</button>
                      )}
                      <button onClick={cueSuccess} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold">تجربة نجاح</button>
                      <button onClick={cueError} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">تجربة خطأ</button>
                    </div>
                    {result.tactileRegions && result.tactileRegions.length > 0 && (
                      <div>
                        <p className="text-xs text-amber-800 mb-1">نقطة تركيز نابضة (Pulse):</p>
                        <div className="flex flex-wrap gap-1">
                          {result.tactileRegions.map((r, i) => (
                            <button key={i}
                              onClick={() => focusIdx === i ? (stopFocusPulse(), setFocusIdx(null)) : startFocusPulse(i)}
                              className={`px-2 py-1 rounded text-xs ${focusIdx === i ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300'}`}>
                              {focusIdx === i ? '⏸' : '★'} {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {result.tactileRegions && (
                    <ul className="mt-3 text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.tactileRegions.map((r, i) => (
                        <li key={i} className={focusIdx === i ? 'text-amber-700 font-bold' : ''}>
                          <b>{i+1}. {r.label}</b> — {r.texture} / ارتفاع {r.elevation}
                          {connectTarget === i && <span className="text-amber-600"> ← الهدف</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Merged experience */}
                <button
                  onClick={playMergedExperience}
                  disabled={speakingMerged}
                  className="w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg disabled:opacity-50"
                >
                  {speakingMerged ? '...جاري التشغيل' : '✨ تشغيل التجربة الكاملة (صوت + لمس + اهتزاز)'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensoryImageTactile;
