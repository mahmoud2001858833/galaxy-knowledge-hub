import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Image as ImageIcon, Volume2, Hand, Printer, Smartphone, Vibrate, ArrowRight, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [hapticEnabled, setHapticEnabled] = useState(false);
  const [speakingMerged, setSpeakingMerged] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mobile = isMobile();
  const vibrate = hasVibration();

  const onFile = (f: File) => {
    setFile(f); setResult(null);
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
  };

  const triggerHaptic = (intensity: number, duration: number, pattern: string) => {
    if (!hapticEnabled || !vibrate) return;
    const i = Math.max(1, Math.min(10, intensity));
    const d = Math.max(30, Math.min(800, duration));
    if (pattern === 'pulse') navigator.vibrate([d, 80, d]);
    else if (pattern === 'rhythm') navigator.vibrate([d, 60, d/2, 60, d]);
    else navigator.vibrate(d * (i / 5));
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
    if (!canvasRef.current || !result) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (!w) return;
    const legend = (result.tactileRegions || []).map((r, i) =>
      `<li><b>${i+1}. ${r.label}</b> — ملمس: ${r.texture} / ارتفاع: ${r.elevation}/5 — ${r.description}</li>`
    ).join('');
    w.document.write(`<html dir="rtl"><head><title>نموذج لمسي قابل للطباعة</title>
      <style>body{font-family:sans-serif;padding:20px}img{max-width:100%;border:2px solid #000}
      h1{font-size:20px}ul{line-height:1.8}</style></head><body>
      <h1>${result.title || 'نموذج لمسي'}</h1>
      <img src="${dataUrl}"/>
      <h2>دليل المناطق اللمسية</h2><ul>${legend}</ul>
      <p><b>إرشادات الطباعة:</b> ${result.printingNotes || 'استخدم طابعة بريل أو طابعة 3D لإبراز المناطق المحدّدة'}</p>
      </body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
  };

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <Link to="/damij/sensory" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:underline">
        <ArrowRight className="w-4 h-4" /> رجوع
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-3">
          <ImageIcon className="w-4 h-4" /><span className="text-sm font-bold">أداة جديدة في الجسر الحسّي الذكي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">صورة → وصف صوتي + لمسي</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          ارفع صورة تعليمية، وسيقوم الذكاء الاصطناعي بتحليلها وتحويلها إلى وصف صوتي مفصّل ونموذج لمسي قابل للطباعة، مع دعم الاهتزاز التفاعلي على الهاتف.
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
            {/* Haptic toggle */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="font-bold">الاهتزاز التفاعلي (Haptic Feedback)</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Smartphone className="w-3 h-3"/> {mobile && vibrate ? 'متاح على هذا الجهاز' : 'متاح فقط على الهواتف الداعمة'}
                    </p>
                  </div>
                </div>
                <button
                  disabled={!mobile || !vibrate}
                  onClick={() => { setHapticEnabled(v => !v); if (!hapticEnabled && vibrate) navigator.vibrate(150); }}
                  className={`relative w-14 h-8 rounded-full transition disabled:opacity-40 ${hapticEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${hapticEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

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
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-xl border touch-none"
                    onPointerMove={(e) => {
                      if (!hapticEnabled || !result.tactileRegions || !canvasRef.current) return;
                      const rect = canvasRef.current.getBoundingClientRect();
                      const px = ((e.clientX - rect.left) / rect.width) * 100;
                      const py = ((e.clientY - rect.top) / rect.height) * 100;
                      const region = result.tactileRegions.find(r =>
                        px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
                      );
                      if (region) triggerHaptic(region.elevation * 2, 80, 'continuous');
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
                  {result.tactileRegions && (
                    <ul className="mt-3 text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.tactileRegions.map((r, i) => (
                        <li key={i}><b>{i+1}. {r.label}</b> — {r.texture} / ارتفاع {r.elevation}</li>
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
