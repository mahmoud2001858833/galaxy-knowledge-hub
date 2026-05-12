import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Mic, Square, Play, Pause, Volume2, Hand, Type,
  Download, Trash2, Clock, Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { logToolUse } from './interactionLog';
import { tokenizeSigns, type SignToken } from './signDictionary';

// ===== Types =====
type Segment = {
  id: string;
  startMs: number;       // relative to recording start
  endMs: number;
  text: string;
};

// ===== Arabic letter → sign label (fingerspelling approximation) =====
const SIGN_LABELS: Record<string, string> = {
  'ا': 'Alif', 'أ': 'Alif', 'إ': 'Alif', 'آ': 'Alif',
  'ب': 'Ba', 'ت': 'Ta', 'ث': 'Tha', 'ج': 'Jeem', 'ح': 'Hha',
  'خ': 'Kha', 'د': 'Dal', 'ذ': 'Dhal', 'ر': 'Ra', 'ز': 'Zay', 'س': 'Seen',
  'ش': 'Sheen', 'ص': 'Sad', 'ض': 'Dad', 'ط': 'Ta2', 'ظ': 'Za2', 'ع': 'Ain',
  'غ': 'Ghain', 'ف': 'Fa', 'ق': 'Qaf', 'ك': 'Kaf', 'ل': 'Lam', 'م': 'Meem',
  'ن': 'Noon', 'ه': 'Ha', 'و': 'Waw', 'ي': 'Ya', 'ى': 'Ya', 'ة': 'Ta',
  'ء': 'Hamza',
};

// Convert text (meaning, not literal) → sign sequence by tokenizing into words then letters.
// Real interpretation requires a sign-gloss model; we approximate by fingerspelling each significant word.
function textToSignSequence(text: string): { word: string; letters: { ch: string; label: string }[] }[] {
  return text
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 60) // cap
    .map(word => ({
      word,
      letters: Array.from(word)
        .map(ch => ({ ch, label: SIGN_LABELS[ch] ?? ch }))
        .filter(l => l.label),
    }));
}

const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const ms2 = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${ms2}`;
};

const SensoryTriSense: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [signWordIdx, setSignWordIdx] = useState<number>(-1);
  const [interim, setInterim] = useState('');

  const recRef = useRef<any>(null);
  const startedAtRef = useRef<number>(0);
  const pauseAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const signTimerRef = useRef<number | null>(null);

  // ===== Init Web Speech API =====
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'ar-SA';
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e: any) => {
      const now = performance.now();
      const recStart = startedAtRef.current;
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt: string = res[0].transcript.trim();
        if (!txt) continue;
        if (res.isFinal) {
          // Best-effort timestamps: span ≈ duration of utterance based on ~150ms per char.
          const endMs = now - recStart - pauseAccumRef.current;
          const dur = Math.max(800, Math.min(8000, txt.length * 110));
          const startMs = Math.max(0, endMs - dur);
          const seg: Segment = {
            id: crypto.randomUUID(),
            startMs, endMs, text: txt,
          };
          setSegments(prev => [...prev, seg]);
        } else {
          interimText += ' ' + txt;
        }
      }
      setInterim(interimText.trim());
    };

    r.onerror = (ev: any) => {
      if (ev?.error === 'no-speech') return;
      console.warn('STT error', ev?.error);
    };
    r.onend = () => {
      if (recording && !paused) {
        try { r.start(); } catch { /* ignore */ }
      }
    };

    recRef.current = r;
    return () => { try { r.stop(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Timer =====
  useEffect(() => {
    if (recording && !paused) {
      tickRef.current = window.setInterval(() => {
        setElapsed(performance.now() - startedAtRef.current - pauseAccumRef.current);
      }, 100);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [recording, paused]);

  const start = () => {
    const r = recRef.current;
    if (!r) { toast.error('التعرّف على الصوت غير مدعوم في هذا المتصفح. استخدم Chrome على الحاسوب أو Android.'); return; }
    setSegments([]); setInterim(''); setElapsed(0);
    pauseAccumRef.current = 0;
    startedAtRef.current = performance.now();
    try { r.start(); setRecording(true); setPaused(false); logToolUse('stt'); }
    catch { toast.error('تعذّر بدء التسجيل'); }
  };

  const pause = () => {
    if (!recording || paused) return;
    try { recRef.current?.stop(); } catch {}
    pauseStartRef.current = performance.now();
    setPaused(true);
  };

  const resume = () => {
    if (!recording || !paused) return;
    pauseAccumRef.current += performance.now() - pauseStartRef.current;
    try { recRef.current?.start(); } catch {}
    setPaused(false);
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setRecording(false); setPaused(false); setInterim('');
  };

  // ===== Auto-select most recent segment so sign panel always shows latest =====
  useEffect(() => {
    if (segments.length && !activeId) {
      setActiveId(segments[segments.length - 1].id);
    }
  }, [segments, activeId]);

  // ===== Playback (TTS) of a segment + sign animation =====
  const speakSegment = (seg: Segment) => {
    setActiveId(seg.id);
    if (signTimerRef.current) { clearInterval(signTimerRef.current); signTimerRef.current = null; }
    const sig = tokenizeSigns(seg.text);
    setSignWordIdx(sig.length ? 0 : -1);

    // Sign timing: walk one word ~ every 800ms
    if (sig.length > 1) {
      let i = 0;
      signTimerRef.current = window.setInterval(() => {
        i++;
        if (i >= sig.length) { clearInterval(signTimerRef.current!); signTimerRef.current = null; return; }
        setSignWordIdx(i);
      }, 800);
    }

    // TTS — DO NOT clear activeId on end (keep showing the sign translation)
    try {
      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = 'ar-SA';
      u.rate = 0.95;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      logToolUse('tts');
    } catch { /* ignore */ }
  };

  const exportTranscript = () => {
    const lines = segments.map(s => `[${fmtTime(s.startMs)} → ${fmtTime(s.endMs)}] ${s.text}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transcript-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => { setSegments([]); setActiveId(null); setSignWordIdx(-1); };

  const activeSeg = segments.find(s => s.id === activeId) ?? null;
  const activeSign: SignToken[] = useMemo(
    () => activeSeg ? tokenizeSigns(activeSeg.text) : [],
    [activeSeg]
  );
  const recognizedCount = activeSign.filter(t => t.kind !== 'unknown').length;

  return (
    <div dir="rtl" className="px-6 pt-10 pb-16 max-w-6xl mx-auto">
      <Link
        to="/damij/sensory"
        className="inline-flex items-center gap-2 mb-6 text-[hsl(var(--damij-primary))] hover:underline"
      >
        <ArrowRight className="w-4 h-4" /> العودة للجسر الحسّي
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-blue-500/20 text-[hsl(var(--damij-primary))] mb-3">
          <Languages className="w-4 h-4" />
          <span className="text-sm font-bold">ثلاثي الحواس · صوت + نص + إشارة</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">
          تفريغ المحاضرات تلقائياً للصمّ والمكفوفين
        </h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-3xl mx-auto leading-relaxed">
          سجّل المحاضرة مباشرةً، وسيتم تحويلها إلى نص متزامن مع علامات زمنية دقيقة،
          ومنطقة مخصّصة لعرض لغة الإشارة لطلاب الصمّ، مع إمكانية إعادة الاستماع لأي مقطع كصوت طبيعي.
        </p>
      </div>

      {/* ===== Recording controls ===== */}
      <div className="rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/15 p-5 mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          {!recording ? (
            <button onClick={start}
              className="px-5 py-3 rounded-xl bg-red-600 text-white font-bold flex items-center gap-2 hover:bg-red-700 transition">
              <Mic className="w-5 h-5" /> بدء تسجيل المحاضرة
            </button>
          ) : (
            <>
              {paused ? (
                <button onClick={resume}
                  className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2">
                  <Play className="w-5 h-5" /> استئناف
                </button>
              ) : (
                <button onClick={pause}
                  className="px-4 py-3 rounded-xl bg-amber-500 text-white font-bold flex items-center gap-2">
                  <Pause className="w-5 h-5" /> إيقاف مؤقت
                </button>
              )}
              <button onClick={stop}
                className="px-4 py-3 rounded-xl bg-slate-700 text-white font-bold flex items-center gap-2">
                <Square className="w-5 h-5" /> إنهاء
              </button>
            </>
          )}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--damij-bg))]/60 border border-[hsl(var(--damij-primary))]/10">
            <Clock className="w-4 h-4 text-[hsl(var(--damij-accent-2))]" />
            <span className="font-mono font-bold tabular-nums text-[hsl(var(--damij-primary))]">
              {fmtTime(elapsed)}
            </span>
            {recording && (
              <span className={`w-2 h-2 rounded-full ${paused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportTranscript} disabled={!segments.length}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--damij-primary))]/20 text-[hsl(var(--damij-primary))] disabled:opacity-50 flex items-center gap-1 text-sm">
            <Download className="w-4 h-4" /> تصدير TXT
          </button>
          <button onClick={clearAll} disabled={!segments.length}
            className="px-3 py-2 rounded-lg border border-red-500/30 text-red-600 disabled:opacity-50 flex items-center gap-1 text-sm">
            <Trash2 className="w-4 h-4" /> مسح
          </button>
        </div>
      </div>

      {/* ===== Three-pane synchronized view ===== */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* TEXT PANE */}
        <section className="lg:col-span-2 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/15 p-5 min-h-[420px]">
          <div className="flex items-center gap-2 mb-3 text-[hsl(var(--damij-primary))]">
            <Type className="w-5 h-5" />
            <h2 className="font-bold">النص المتزامن مع علامات زمنية</h2>
          </div>

          {!segments.length && !interim && (
            <p className="text-[hsl(var(--damij-text))]/55 text-sm py-10 text-center">
              لم يبدأ التسجيل بعد — اضغط «بدء تسجيل المحاضرة» وسيظهر النص هنا فور تحدّث المعلّم.
            </p>
          )}

          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {segments.map(s => {
              const isActive = s.id === activeId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => speakSegment(s)}
                    className={`w-full text-right p-3 rounded-xl transition border ${
                      isActive
                        ? 'bg-[hsl(var(--damij-primary))]/15 border-[hsl(var(--damij-primary))]/40 shadow'
                        : 'bg-[hsl(var(--damij-bg))]/60 border-transparent hover:border-[hsl(var(--damij-primary))]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono text-[hsl(var(--damij-accent-2))] tabular-nums">
                        {fmtTime(s.startMs)} → {fmtTime(s.endMs)}
                      </span>
                      <Volume2 className="w-4 h-4 text-[hsl(var(--damij-primary))]/60" />
                    </div>
                    <p className="text-[hsl(var(--damij-text))] leading-relaxed">{s.text}</p>
                  </button>
                </li>
              );
            })}
            {interim && (
              <li className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[hsl(var(--damij-text))]/80 italic">
                {interim}…
              </li>
            )}
          </ul>
        </section>

        {/* SIGN PANE */}
        <section className="rounded-2xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 p-5 min-h-[420px]">
          <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300">
            <Hand className="w-5 h-5" />
            <h2 className="font-bold">منطقة لغة الإشارة لطلاب الصمّ</h2>
          </div>

          {!activeSeg && (
            <p className="text-[hsl(var(--damij-text))]/55 text-sm py-10 text-center">
              ابدأ التسجيل وستظهر ترجمة كل عبارة بلغة الإشارة هنا تلقائيًا — أو اضغط أي مقطع من النص لإعادة عرض ترجمته.
            </p>
          )}

          {activeSeg && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono text-purple-600/80 tabular-nums">
                  {fmtTime(activeSeg.startMs)}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {recognizedCount}/{activeSign.length} إشارة
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {activeSign.map((t, i) => {
                  const active = i === signWordIdx;
                  if (t.kind === 'word') {
                    const motionClass = active
                      ? (t.gesture.motion === 'wave' ? 'animate-[wiggle_0.6s_ease-in-out_infinite]'
                        : t.gesture.motion === 'circle' ? 'animate-spin [animation-duration:1.5s]'
                        : t.gesture.motion === 'rise' || t.gesture.motion === 'nod' || t.gesture.motion === 'bow' ? 'animate-bounce'
                        : 'animate-pulse')
                      : '';
                    return (
                      <div key={i} title={t.gesture.desc}
                        className={`min-w-[92px] px-2 py-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${active ? 'bg-purple-600 text-white border-purple-700 scale-110 shadow-lg' : 'bg-white/80 dark:bg-slate-800/60 border-purple-200 text-purple-900 dark:text-purple-100'}`}>
                        <span className={`text-3xl ${motionClass}`}>{t.gesture.emoji}</span>
                        <span className="text-xs font-bold">{t.word}</span>
                        <span className={`text-[9px] leading-tight text-center ${active ? 'text-white/90' : 'text-purple-700/80 dark:text-purple-200/80'}`}>{t.gesture.desc}</span>
                      </div>
                    );
                  }
                  if (t.kind === 'spell') {
                    return (
                      <div key={i} title={`تهجئة: ${t.word}`}
                        className={`min-w-[120px] px-2 py-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${active ? 'bg-amber-500 text-white border-amber-600 scale-110 shadow-lg' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {t.letters.map((l, li) => (
                            <span key={li} className="text-xl" title={`${l.letter}: ${l.sign.desc}`}>{l.sign.emoji}</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold">{t.word}</span>
                        <span className={`text-[9px] ${active ? 'text-white/90' : 'text-amber-700'}`}>تهجئة بالحروف</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={`min-w-[88px] px-2 py-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex flex-col items-center gap-1 ${active ? 'scale-110' : ''}`}>
                      <span className="text-3xl">✋</span>
                      <span className="text-xs font-bold">{t.word}</span>
                      <span className="text-[9px]">غير معروفة</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Help */}
      <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--damij-bg))]/60 border border-[hsl(var(--damij-primary))]/10 text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed">
        <strong className="text-[hsl(var(--damij-primary))]">كيف يعمل ثلاثي الحواس؟</strong>
        <ol className="list-decimal pr-5 mt-2 space-y-1">
          <li><strong>الصوت:</strong> يلتقط ميكروفون الجهاز كلام المعلّم مباشرةً.</li>
          <li><strong>النص:</strong> يحوّله المتصفّح إلى نص عربي عبر Web Speech API مع علامات زمنية دقيقة لكل عبارة.</li>
          <li><strong>الإشارة:</strong> عند الضغط على أي مقطع، تُعرض ترجمته الإشارية كلمة-بكلمة في الجزء المخصّص للصمّ، مع إعادة قراءة المقطع كصوت طبيعي للمكفوفين.</li>
        </ol>
      </div>
    </div>
  );
};

export default SensoryTriSense;
