import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Type, Mic, Hand, Volume2, Square, Play, Copy, RefreshCw,
  Languages, Eye, Ear, Accessibility, Search, BookOpen, X, Loader2, Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { textToBraille, brailleToText } from './braille';
import { logToolUse } from './interactionLog';
import {
  SIGN_DICT, SIGN_CATEGORIES, tokenizeSigns, lookupSign,
  type SignToken,
} from './signDictionary';
import { DAMIJ_LANGS } from '@/features/damij/i18n/types';
import { toBcp47 } from '@/features/damij/i18n/bcp47';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { useSignTranslations } from '@/features/sign-language/dictionary/translations';

type Modality = 'text' | 'voice' | 'braille' | 'sign';


// Sign-language dictionary lives in ./signDictionary (hundreds of entries +
// fingerspelling fallback). All gesture tokens come from there.

const SensoryUnifiedComm: React.FC = () => {
  const [text, setText] = useState('');
  const [activeInput, setActiveInput] = useState<Modality>('text');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [voiceLang, setVoiceLang] = useState<'ar-SA' | 'en-US'>('ar-SA');
  const [audioLevel, setAudioLevel] = useState(0);
  const [signIdx, setSignIdx] = useState<number>(-1);
  const [autoTTS, setAutoTTS] = useState(false);
  const recRef = useRef<any>(null);
  const signTimerRef = useRef<number | null>(null);
  const shouldListenRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // ===== Voice input (Web Speech API) with auto-restart + live interim =====
  const buildRecognizer = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = voiceLang;
    r.interimResults = true;
    r.continuous = true;
    r.maxAlternatives = 1;
    r.onstart = () => { setListening(true); };
    r.onresult = (e: any) => {
      let finalT = '';
      let interimT = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalT += tr + ' ';
        else interimT += tr;
      }
      if (finalT) setText(prev => (prev + ' ' + finalT).replace(/\s+/g, ' ').trim());
      setInterim(interimT);
    };
    r.onerror = (e: any) => {
      const err = e?.error || '';
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        toast.error('تم رفض إذن الميكروفون. فعّله من إعدادات المتصفح.');
        shouldListenRef.current = false;
      } else if (err === 'no-speech') {
        // ignore — auto-restart will fire on onend
      } else if (err === 'audio-capture') {
        toast.error('لا يوجد ميكروفون متاح.');
        shouldListenRef.current = false;
      } else if (err === 'network') {
        toast.error('انقطع الاتصال — سأحاول مجدداً.');
      }
    };
    r.onend = () => {
      setListening(false);
      setInterim('');
      // Auto-restart while user still wants to listen
      if (shouldListenRef.current) {
        try { r.start(); } catch {}
      } else {
        stopAudioMeter();
      }
    };
    return r;
  };

  // Rebuild recognizer when language changes
  useEffect(() => {
    try { recRef.current?.stop(); } catch {}
    recRef.current = buildRecognizer();
    return () => { try { recRef.current?.stop?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceLang]);

  const startAudioMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      analyserRef.current = an;
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        setAudioLevel(Math.min(1, rms * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {/* mic permission denied — recognizer error path handles it */}
  };
  const stopAudioMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setAudioLevel(0);
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    analyserRef.current = null;
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
  };

  const toggleListen = async () => {
    if (!recRef.current) {
      toast.error('التعرّف على الصوت غير مدعوم في هذا المتصفح. جرّب Chrome / Edge.');
      return;
    }
    if (listening || shouldListenRef.current) {
      shouldListenRef.current = false;
      try { recRef.current.stop(); } catch {}
      setListening(false);
      stopAudioMeter();
    } else {
      shouldListenRef.current = true;
      setActiveInput('voice');
      logToolUse('stt');
      await startAudioMeter();
      try { recRef.current.start(); } catch { /* already started */ }
    }
  };

  useEffect(() => () => { shouldListenRef.current = false; stopAudioMeter(); }, []);


  // ===== Braille input → text =====
  const onBrailleInput = (val: string) => {
    setActiveInput('braille');
    setText(brailleToText(val));
  };

  // ===== Sign input: gloss / fingerspelling text =====
  // (Real sign recognition lives in the dedicated Sign Language page.)
  const onSignGloss = (val: string) => {
    setActiveInput('sign'); setText(val);
  };

  // ===== Outputs =====
  const braille = textToBraille(text);
  const speak = () => {
    if (!('speechSynthesis' in window)) return toast.error('النطق غير مدعوم');
    const clean = text
      .replace(/[*_`#>~\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return toast.error('لا يوجد نص للقراءة');
    try { window.speechSynthesis.cancel(); } catch {}
    const start = () => {
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ar-SA';
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang?.toLowerCase().startsWith('ar'));
      if (arVoice) u.voice = arVoice;
      window.speechSynthesis.speak(u);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      const onVoices = () => { window.speechSynthesis.removeEventListener('voiceschanged', onVoices); start(); };
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      setTimeout(start, 200);
    } else {
      start();
    }
    logToolUse('tts');
  };
  const stopSpeak = () => window.speechSynthesis?.cancel();

  // Auto-speak when text changes (if enabled)
  useEffect(() => {
    if (!autoTTS) return;
    const id = setTimeout(speak, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoTTS]);

  // Sign-language playback: step through WORDS/GESTURES (with spelling fallback)
  const signTokens = useMemo(() => tokenizeSigns(text), [text]);
  const recognizedCount = signTokens.filter(t => t.kind !== 'unknown').length;
  const [signSpeed, setSignSpeed] = useState(1300);
  const [showLib, setShowLib] = useState(false);
  const [libQuery, setLibQuery] = useState('');

  const playSign = () => {
    stopSign();
    if (!signTokens.length) return;
    let i = 0;
    setSignIdx(0);
    signTimerRef.current = window.setInterval(() => {
      i++;
      if (i >= signTokens.length) { stopSign(); return; }
      setSignIdx(i);
    }, signSpeed);
    logToolUse('sign');
  };
  const stopSign = () => {
    if (signTimerRef.current) { clearInterval(signTimerRef.current); signTimerRef.current = null; }
    setSignIdx(-1);
  };
  useEffect(() => () => { stopSign(); window.speechSynthesis?.cancel(); }, []);

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <Link to="/damij/sensory" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] hover:underline">
          <ArrowRight className="w-4 h-4" /> رجوع
        </Link>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
          <Accessibility className="w-3 h-3" /> صف شامل · 4 صيغ متزامنة
        </span>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <Languages className="w-4 h-4" /><span className="text-sm font-bold">التواصل والتكامل</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">إدخال موحد · 4 صيغ متزامنة</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto text-sm">
          أدخل المحتوى بأي صيغة (نص / صوت / بريل / لغة إشارة) وسيُترجم تلقائيًا للصيغ الأربع في نفس الوقت — ليتمكّن المعلم من تدريس صفّ واحد يضمّ متعلمين بقدرات حسّية مختلفة.
        </p>
      </div>

      {/* ===== Input section ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {([
            { k: 'text',    label: 'نص',         icon: Type },
            { k: 'voice',   label: 'صوت',        icon: Mic },
            { k: 'braille', label: 'بريل',       icon: Eye },
            { k: 'sign',    label: 'لغة إشارة',  icon: Hand },
          ] as { k: Modality; label: string; icon: any }[]).map(({ k, label, icon: I }) => (
            <button key={k} onClick={() => setActiveInput(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition ${activeInput === k ? 'bg-[hsl(var(--damij-primary))] text-white' : 'bg-gray-100 text-gray-700'}`}>
              <I className="w-4 h-4" /> {label}
            </button>
          ))}
          <div className="ms-auto inline-flex items-center gap-3">
            <label className="text-xs inline-flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={autoTTS} onChange={e => setAutoTTS(e.target.checked)} />
              نطق تلقائي
            </label>
            <button onClick={() => setText('')} className="text-xs px-2 py-1 rounded bg-gray-100 inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> تفريغ
            </button>
          </div>
        </div>

        {activeInput === 'text' && (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="اكتب الجملة هنا..."
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-300 outline-none text-base"/>
        )}
        {activeInput === 'voice' && (
          <div className="py-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs text-gray-500">لغة التعرّف:</span>
              {([
                { v: 'ar-SA' as const, label: 'العربية' },
                { v: 'en-US' as const, label: 'English' },
              ]).map(opt => (
                <button key={opt.v}
                  onClick={() => { if (voiceLang !== opt.v) { shouldListenRef.current = false; try { recRef.current?.stop(); } catch {} stopAudioMeter(); setVoiceLang(opt.v); } }}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition ${voiceLang === opt.v ? 'bg-[hsl(var(--damij-primary))] text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {listening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                    <span
                      className="absolute rounded-full bg-emerald-500/20 transition-transform duration-100"
                      style={{ width: '100%', height: '100%', transform: `scale(${1 + audioLevel * 0.6})` }}
                    />
                  </>
                )}
                <button onClick={toggleListen}
                  aria-label={listening ? 'إيقاف التسجيل' : 'ابدأ التحدّث'}
                  className={`relative z-10 w-28 h-28 rounded-full font-bold text-white shadow-2xl inline-flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95 ${
                    listening ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}>
                  {listening ? <Square className="w-8 h-8 fill-white"/> : <Mic className="w-10 h-10"/>}
                  <span className="text-[11px] leading-none">{listening ? 'إيقاف' : 'ابدأ'}</span>
                </button>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 text-xs">
                {listening ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold">
                    <Radio className="w-3 h-3 animate-pulse" /> يستمع الآن... تكلّم بوضوح
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    <Mic className="w-3 h-3" /> اضغط الزر لبدء التحدّث
                  </span>
                )}
              </div>

              {listening && (
                <div className="mt-3 flex items-end gap-1 h-8" aria-hidden>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const seed = (Math.sin((i + 1) * 0.9) + 1) / 2;
                    const h = Math.max(4, Math.min(32, audioLevel * 32 * (0.5 + seed)));
                    return (
                      <span key={i} className="w-1.5 rounded-full bg-emerald-500 transition-all duration-75"
                        style={{ height: `${h}px`, opacity: 0.3 + Math.min(0.7, audioLevel * 1.5) }} />
                    );
                  })}
                </div>
              )}

              <p className="text-[11px] text-gray-500 mt-3 text-center max-w-md">
                يعمل أفضل في Chrome / Edge على جهاز يحتوي ميكروفون. يُترجم الكلام مباشرة إلى نص ثم إلى بريل ولغة الإشارة.
              </p>
            </div>

            <div className="mt-4 p-3 rounded-xl border border-gray-200 bg-gray-50 min-h-[88px]">
              <p className="text-[11px] text-gray-500 mb-1">النص المُسجَّل (يتم تحديثه أثناء التحدّث):</p>
              <p className="text-base leading-relaxed">
                <span className="text-gray-900">{text}</span>{' '}
                <span className="text-gray-400 italic">{interim}</span>
                {!text && !interim && <span className="text-gray-400">— لا يوجد نص بعد —</span>}
              </p>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
              className="w-full mt-3 p-3 rounded-xl border border-gray-200 text-sm"
              placeholder="يمكنك تعديل النص يدوياً هنا..."/>
          </div>
        )}
        {activeInput === 'braille' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">ألصق رموز بريل (Unicode ⠁⠃⠉…) هنا، وستُحوَّل تلقائيًا إلى نص.</p>
            <textarea defaultValue={textToBraille(text)} onChange={(e) => onBrailleInput(e.target.value)} rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 font-mono text-2xl leading-relaxed" placeholder="⠁⠇⠎⠇⠁⠍ ⠷⠇⠽⠅⠍"/>
          </div>
        )}
        {activeInput === 'sign' && (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                <Hand className="w-3 h-3" /> قاموس الإشارات
              </span>
              <p className="text-[11px] text-gray-500">اضغط على أي إشارة لإضافتها للجملة، وستُترجم تلقائياً إلى نص وصوت وبريل.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute top-2.5 right-3 text-gray-400" />
                <input value={libQuery} onChange={e => setLibQuery(e.target.value)}
                  placeholder="ابحث عن إشارة..."
                  className="w-full pe-9 ps-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <button type="button" onClick={() => setText('')}
                disabled={!text}
                className="text-xs px-3 py-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-50 inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> مسح الجملة
              </button>
            </div>

            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 min-h-[56px] mb-3">
              <p className="text-[10px] text-emerald-700/70 mb-1">الجملة الحالية:</p>
              {text ? (
                <p className="text-base font-bold text-emerald-900 leading-relaxed">{text}</p>
              ) : (
                <p className="text-xs text-emerald-700/50">لم تُختر أي إشارة بعد — انقر على الإشارات أدناه.</p>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto pe-1 space-y-4">
              {libQuery.trim() ? (() => {
                const q = libQuery.trim();
                const hits = Object.keys(SIGN_DICT).filter(k => k.includes(q)).slice(0, 120);
                return hits.length ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {hits.map(k => {
                      const lk = lookupSign(k);
                      const gs = lk.kind === 'word' ? lk.gesture : null;
                      return (
                        <button type="button" key={k}
                          onClick={() => { setActiveInput('sign'); setText(t => (t ? t + ' ' : '') + k); }}
                          title={gs?.desc || k}
                          className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-center transition-transform hover:-translate-y-0.5 hover:shadow-md">
                          <div className="text-2xl">{gs?.emoji || '✋'}</div>
                          <div className="text-xs font-bold text-emerald-800">{k}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-500 text-center py-6">لا نتائج. جرّب كلمة أخرى.</p>;
              })() : SIGN_CATEGORIES.map(cat => (
                <div key={cat.name}>
                  <h4 className="font-bold text-xs text-emerald-700 mb-2 sticky top-0 bg-white py-1">{cat.name}</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {cat.words.map(w => {
                      const lk = lookupSign(w);
                      const gs = lk.kind === 'word' ? lk.gesture : null;
                      return (
                        <button type="button" key={w}
                          onClick={() => { setActiveInput('sign'); setText(t => (t ? t + ' ' : '') + w); }}
                          title={gs?.desc || w}
                          className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-center transition-transform hover:-translate-y-0.5 hover:shadow-md">
                          <div className="text-2xl">{gs?.emoji || '✋'}</div>
                          <div className="text-xs font-bold text-emerald-800">{w}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Synchronized outputs ===== */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Text */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold mb-2 inline-flex items-center gap-2"><Type className="w-5 h-5 text-blue-600"/> نص</h3>
          <div className="min-h-[80px] p-3 rounded-xl bg-blue-50 text-blue-900 text-lg leading-relaxed whitespace-pre-wrap">
            {text || <span className="text-blue-300">سيظهر النص هنا...</span>}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(text); toast.success('تم النسخ'); }}
            disabled={!text}
            className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
            <Copy className="w-3 h-3" /> نسخ
          </button>
        </div>

        {/* Voice */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold mb-2 inline-flex items-center gap-2"><Ear className="w-5 h-5 text-orange-600"/> صوت</h3>
          <div className="min-h-[80px] p-3 rounded-xl bg-orange-50 text-orange-900 text-sm">
            {text ? 'اضغط استمع لتشغيل الجملة بالعربية الفصحى.' : <span className="text-orange-300">سيتم نطق المحتوى هنا...</span>}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={speak} disabled={!text}
              className="text-xs px-3 py-1.5 rounded-lg bg-orange-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> استمع
            </button>
            <button onClick={stopSpeak} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 inline-flex items-center gap-1">
              <Square className="w-3 h-3" /> إيقاف
            </button>
          </div>
        </div>

        {/* Braille */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold mb-2 inline-flex items-center gap-2"><Eye className="w-5 h-5 text-purple-600"/> بريل</h3>
          <div className="min-h-[80px] p-3 rounded-xl bg-purple-50 text-purple-900 font-mono text-3xl leading-relaxed break-words">
            {braille || <span className="text-purple-300 text-base">⠁⠇⠝⠭⠽⠚⠡ ⠇⠇⠚⠝⠁⠨...</span>}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(braille); toast.success('تم نسخ البريل'); }}
            disabled={!braille}
            className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
            <Copy className="w-3 h-3" /> نسخ
          </button>
        </div>

        {/* Sign Language - WORDS & GESTURES */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold inline-flex items-center gap-2"><Hand className="w-5 h-5 text-emerald-600"/> لغة الإشارة <span className="text-[10px] font-normal text-emerald-600">(حركات وإشارات)</span></h3>
            {signTokens.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {recognizedCount}/{signTokens.length} إشارة
              </span>
            )}
          </div>
          <div className="min-h-[110px] p-3 rounded-xl bg-emerald-50">
            {signTokens.length ? (
              <div className="flex flex-wrap gap-2">
                {signTokens.map((t, i) => {
                  const active = i === signIdx;
                  if (t.kind === 'word') {
                    const g = t.gesture;
                    const motionClass = active
                      ? (g.motion === 'wave'   ? 'animate-[wiggle_0.6s_ease-in-out_infinite]' :
                         g.motion === 'circle' ? 'animate-spin [animation-duration:1.5s]' :
                         g.motion === 'rise' || g.motion === 'nod' || g.motion === 'bow' ? 'animate-bounce' :
                         'animate-pulse')
                      : '';
                    return (
                      <div key={i} title={g.desc}
                        className={`min-w-[92px] px-2 py-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${active ? 'bg-emerald-600 text-white border-emerald-700 scale-110 shadow-lg' : 'bg-white border-emerald-200 text-emerald-800'}`}>
                        <span className={`text-3xl ${motionClass}`}>{g.emoji}</span>
                        <span className="text-xs font-bold">{t.word}</span>
                        <span className={`text-[9px] leading-tight text-center ${active ? 'text-white/90' : 'text-emerald-600/80'}`}>{g.desc}</span>
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
                    <div key={i} className="min-w-[88px] px-2 py-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex flex-col items-center gap-1">
                      <span className="text-3xl">✋</span>
                      <span className="text-xs font-bold">{t.word}</span>
                      <span className="text-[9px]">غير معروفة</span>
                    </div>
                  );
                })}
              </div>
            ) : <span className="text-emerald-300 text-sm">ستظهر الحركات والإشارات هنا...</span>}
          </div>
          <div className="mt-2 flex gap-2 flex-wrap items-center">
            <button onClick={playSign} disabled={!text}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
              <Play className="w-3 h-3" /> تشغيل
            </button>
            <button onClick={stopSign} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 inline-flex items-center gap-1">
              <Square className="w-3 h-3" /> إيقاف
            </button>
            <button onClick={() => setShowLib(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> قاموس الإشارات
            </button>
            <label className="text-[11px] inline-flex items-center gap-1 ms-auto">
              السرعة
              <input type="range" min={700} max={2200} step={100}
                value={signSpeed} onChange={e => setSignSpeed(+e.target.value)}
                className="w-24 accent-emerald-600" />
              <span className="tabular-nums">{(signSpeed/1000).toFixed(1)}ث</span>
            </label>
          </div>
        </div>
      </div>

      {/* Master "play all" */}
      <button
        onClick={() => { speak(); playSign(); }}
        disabled={!text}
        className="w-full mt-6 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-emerald-600 to-blue-600 text-white font-bold shadow-lg disabled:opacity-50">
        ✨ بثّ الجلسة بالصيغ الأربع معاً
      </button>

      {/* ===== Sign dictionary library modal ===== */}
      {showLib && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowLib(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold inline-flex items-center gap-2 text-emerald-700">
                <BookOpen className="w-5 h-5" /> قاموس لغة الإشارة ({Object.keys(SIGN_DICT).length}+ كلمة)
              </h3>
              <button onClick={() => setShowLib(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute top-2.5 right-3 text-gray-400" />
                <input value={libQuery} onChange={e => setLibQuery(e.target.value)}
                  placeholder="ابحث عن كلمة..."
                  className="w-full pe-9 ps-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
            </div>
            <div className="overflow-y-auto p-4 space-y-5">
              {libQuery.trim() ? (() => {
                const q = libQuery.trim();
                const hits = Object.keys(SIGN_DICT).filter(k => k.includes(q)).slice(0, 80);
                return hits.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {hits.map(k => {
                      const lk = lookupSign(k);
                      const gs = lk.kind === 'word' ? lk.gesture : null;
                      return (
                        <button key={k} onClick={() => { setText(t => (t ? t + ' ' : '') + k); }}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center">
                          <div className="text-2xl">{gs?.emoji || '✋'}</div>
                          <div className="text-xs font-bold text-emerald-800">{k}</div>
                          {gs && <div className="text-[9px] text-emerald-600/80 leading-tight">{gs.desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-500 text-center py-6">لا نتائج. جرّب كلمة أخرى.</p>;
              })() : SIGN_CATEGORIES.map(cat => (
                <div key={cat.name}>
                  <h4 className="font-bold text-sm text-emerald-700 mb-2">{cat.name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {cat.words.map(w => {
                      const lk = lookupSign(w);
                      const gs = lk.kind === 'word' ? lk.gesture : null;
                      return (
                        <button key={w} onClick={() => { setText(t => (t ? t + ' ' : '') + w); }}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center">
                          <div className="text-2xl">{gs?.emoji || '✋'}</div>
                          <div className="text-xs font-bold text-emerald-800">{w}</div>
                          {gs && <div className="text-[9px] text-emerald-600/80 leading-tight line-clamp-2">{gs.desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t text-[11px] text-gray-500 text-center">
              اضغط على أي كلمة لإضافتها للنص. الكلمات غير الموجودة تُعرض بالتهجئة الحرفية تلقائيًا.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensoryUnifiedComm;
