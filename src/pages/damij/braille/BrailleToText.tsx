import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, Volume2, Pause, Square, Copy, Download, RotateCcw, Sparkles, AlertCircle, ChevronDown, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SPOKEN_LANGUAGES } from '@/features/sign-language/languages';
import BackToBrailleButton from '@/components/damij/BackToBrailleButton';

interface OCRResult {
  is_braille: boolean;
  language: string;
  grade: 1 | 2;
  confidence: number;
  lines: string[];
  text: string;
  cells: { line: number; index: number; dots: string; char: string }[];
  notes?: string;
}

const compressImage = (file: Blob, maxEdge = 1600, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result as string; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });

const BrailleToText: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [editText, setEditText] = useState('');
  const [language, setLanguage] = useState('ar');
  const [grade, setGrade] = useState<1 | 2>(1);
  const [showCells, setShowCells] = useState(false);

  // TTS
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis?.getVoices?.() ?? []);
    load();
    window.speechSynthesis?.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', load);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.speechSynthesis?.cancel();
  }, []);

  // ── Camera control ──
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (e: any) {
      toast.error('تعذّر الوصول للكاميرا: ' + (e?.message || ''));
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/jpeg', 0.92));
    if (!blob) return;
    const compressed = await compressImage(blob);
    setImageDataUrl(compressed);
    stopCamera();
    toast.success('تم التقاط الصورة');
  };

  // ── Upload ──
  const onFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('الملف ليس صورة'); return; }
    const compressed = await compressImage(file);
    setImageDataUrl(compressed);
    setResult(null);
    setEditText('');
  };

  // ── OCR ──
  const runOCR = async () => {
    if (!imageDataUrl) { toast.error('التقط صورة أو ارفع واحدة أولاً'); return; }
    setLoading(true);
    setResult(null);
    try {
      const lang = SPOKEN_LANGUAGES.find(l => l.code.startsWith(language));
      const { data, error } = await supabase.functions.invoke('braille-ocr', {
        body: {
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg',
          language,
          languageName: lang?.name ?? 'Arabic',
          grade,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const r: OCRResult = (data as any).result;
      setResult(r);
      setEditText(r?.text ?? '');
      if (r?.is_braille === false) toast.warning('الصورة لا تحتوي على نص بريل واضح');
      else toast.success(`تم التحويل بثقة ${r?.confidence ?? '—'}%`);
    } catch (e: any) {
      toast.error(e?.message || 'فشل التحويل');
    } finally {
      setLoading(false);
    }
  };

  // ── TTS ──
  const speak = () => {
    if (!editText.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(editText);
    const v = voices.find(v => v.voiceURI === voiceURI) ||
              voices.find(v => v.lang.toLowerCase().startsWith(language.toLowerCase()));
    if (v) u.voice = v;
    u.lang = v?.lang || language;
    u.rate = rate;
    u.onboundary = (ev) => {
      if (ev.name === 'word' || ev.charIndex != null) setSpeakingIdx(ev.charIndex);
    };
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };
  const pauseSpeak = () => window.speechSynthesis.pause();
  const stopSpeak = () => { window.speechSynthesis.cancel(); setSpeakingIdx(null); };

  const filteredVoices = voices.filter(v => v.lang.toLowerCase().startsWith(language.toLowerCase()));

  const copy = async () => { await navigator.clipboard.writeText(editText); toast.success('نُسخ النص'); };
  const download = () => {
    const blob = new Blob([editText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'braille-ocr.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight current spoken char range in the textarea preview
  const renderHighlighted = () => {
    if (speakingIdx == null) return editText;
    const before = editText.slice(0, speakingIdx);
    const wordEnd = editText.slice(speakingIdx).search(/\s|$/);
    const word = editText.slice(speakingIdx, speakingIdx + (wordEnd === -1 ? 30 : wordEnd));
    const after = editText.slice(speakingIdx + word.length);
    return (<>{before}<mark className="bg-amber-200 rounded px-0.5">{word}</mark>{after}</>);
  };

  return (
    <div className="px-6 pt-12 pb-12 max-w-6xl mx-auto space-y-6" dir="rtl">
      <header>
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">من بريل إلى نص + قراءة صوتية</h1>
        <p className="text-slate-600">صوّر صفحة بريل ورقية بالكاميرا أو ارفع صورة، وسيتم تحويلها لنص رقمي قابل للقراءة الصوتية باستخدام الذكاء الاصطناعي.</p>
      </header>

      {/* Settings */}
      <div className="bg-white rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/15 grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-bold text-[hsl(var(--damij-primary))]">لغة بريل</span>
          <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white">
            {SPOKEN_LANGUAGES.slice(0, 60).map(l => (
              <option key={l.code} value={l.code.split('-')[0]}>{l.flag} {l.nativeName} — {l.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-bold text-[hsl(var(--damij-primary))]">المستوى</span>
          <div className="flex gap-2">
            {[1, 2].map(g => (
              <button key={g} onClick={() => setGrade(g as 1 | 2)}
                className={`flex-1 py-2 rounded-lg font-bold border-2 transition ${grade === g ? 'border-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]' : 'border-slate-200 text-slate-500'}`}>
                المستوى {g === 1 ? 'الأول' : 'الثاني (اختزالي)'}
              </button>
            ))}
          </div>
        </label>
        <button onClick={runOCR} disabled={!imageDataUrl || loading}
          className="self-end py-2.5 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          حلّل الصورة
        </button>
      </div>

      {/* Capture area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: input */}
        <div className="bg-white rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/15 space-y-3">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2"><Camera className="w-4 h-4" /> التقاط أو رفع</h3>

          {!imageDataUrl && !cameraOn && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startCamera}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-[hsl(var(--damij-primary))]/40 hover:bg-[hsl(var(--damij-primary))]/5">
                <Camera className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
                <span className="font-semibold text-[hsl(var(--damij-primary))]">فتح الكاميرا</span>
                <span className="text-xs text-slate-500">صوّر مباشرة</span>
              </button>
              <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-[hsl(var(--damij-primary))]/40 hover:bg-[hsl(var(--damij-primary))]/5 cursor-pointer">
                <Upload className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
                <span className="font-semibold text-[hsl(var(--damij-primary))]">رفع من الجهاز</span>
                <span className="text-xs text-slate-500">JPG / PNG / WEBP</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
              </label>
            </div>
          )}

          {cameraOn && (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-emerald-300/70 rounded-lg pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-center text-xs text-white bg-black/50 rounded px-2 py-1">
                  ضع صفحة بريل داخل الإطار، إضاءة جيدة، بدون انعكاسات
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={capture} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" /> التقاط
                </button>
                <button onClick={stopCamera} className="px-4 rounded-xl bg-slate-200 text-slate-700 font-bold">إلغاء</button>
              </div>
            </div>
          )}

          {imageDataUrl && (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={imageDataUrl} alt="Braille" className="w-full max-h-96 object-contain" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setImageDataUrl(null); setResult(null); setEditText(''); }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> صورة جديدة
                </button>
                <button onClick={startCamera} className="px-3 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4" /> كاميرا
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: result */}
        <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-amber-50 rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
              <Mic className="w-4 h-4" /> النص المستخرج
            </h3>
            {result && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${result.confidence >= 70 ? 'bg-emerald-100 text-emerald-700' : result.confidence >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                ثقة {result.confidence}%
              </span>
            )}
          </div>

          {/* Editable text + highlight preview */}
          <textarea value={editText} onChange={e => setEditText(e.target.value)}
            placeholder="ستظهر هنا الكلمات بعد التحليل…"
            dir="auto"
            className="w-full min-h-[160px] p-3 rounded-xl bg-white border border-slate-200 text-lg leading-relaxed font-medium" />

          {speakingIdx != null && editText && (
            <div className="p-3 rounded-xl bg-white/80 text-lg leading-relaxed border border-amber-200" dir="auto">
              {renderHighlighted()}
            </div>
          )}

          {/* TTS controls */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-slate-700">صوت القارئ:</span>
              <select value={voiceURI} onChange={e => setVoiceURI(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs">
                <option value="">تلقائي ({filteredVoices.length} متاح)</option>
                {filteredVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-slate-700 whitespace-nowrap">السرعة: {rate.toFixed(1)}×</span>
              <input type="range" min={0.6} max={1.6} step={0.1} value={rate}
                onChange={e => setRate(parseFloat(e.target.value))} className="flex-1" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={speak} disabled={!editText.trim()}
                className="py-2 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                <Volume2 className="w-4 h-4" /> تشغيل
              </button>
              <button onClick={pauseSpeak} className="py-2 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center gap-1">
                <Pause className="w-4 h-4" /> إيقاف مؤقت
              </button>
              <button onClick={stopSpeak} className="py-2 rounded-lg bg-slate-600 text-white font-bold flex items-center justify-center gap-1">
                <Square className="w-4 h-4" /> إيقاف
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={copy} disabled={!editText} className="flex-1 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-1 text-sm disabled:opacity-50">
                <Copy className="w-4 h-4" /> نسخ
              </button>
              <button onClick={download} disabled={!editText} className="flex-1 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-1 text-sm disabled:opacity-50">
                <Download className="w-4 h-4" /> تنزيل .txt
              </button>
            </div>
          </div>

          {result?.notes && (
            <div className="text-xs text-slate-600 bg-white/70 p-2 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{result.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cells breakdown */}
      {result?.cells?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <button onClick={() => setShowCells(s => !s)}
            className="w-full flex items-center justify-between p-4 font-bold text-[hsl(var(--damij-primary))]">
            <span>تفصيل الخلايا ({result.cells.length})</span>
            <ChevronDown className={`w-5 h-5 transition ${showCells ? 'rotate-180' : ''}`} />
          </button>
          {showCells && (
            <div className="p-4 pt-0 max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 text-xs">
                  <tr><th className="p-1 text-right">السطر</th><th className="p-1 text-right">#</th><th className="p-1 text-right">النقاط</th><th className="p-1 text-right">الحرف</th></tr>
                </thead>
                <tbody>
                  {result.cells.map((c, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="p-1">{c.line}</td><td className="p-1">{c.index}</td>
                      <td className="p-1 font-mono">{c.dots}</td>
                      <td className="p-1 font-bold text-[hsl(var(--damij-primary))]">{c.char}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default BrailleToText;
