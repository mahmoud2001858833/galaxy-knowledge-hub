import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Type, Mic, Hand, Volume2, Square, Play, Copy, RefreshCw,
  Languages, Eye, Ear, Accessibility, Search, BookOpen, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { textToBraille, brailleToText } from './braille';
import { logToolUse } from './interactionLog';
import {
  SIGN_DICT, SIGN_CATEGORIES, tokenizeSigns, lookupSign,
  type SignToken,
} from './signDictionary';

type Modality = 'text' | 'voice' | 'braille' | 'sign';

// Sign-language dictionary lives in ./signDictionary (hundreds of entries +
// fingerspelling fallback). All gesture tokens come from there.

const SensoryUnifiedComm: React.FC = () => {
  const [text, setText] = useState('');
  const [activeInput, setActiveInput] = useState<Modality>('text');
  const [listening, setListening] = useState(false);
  const [signIdx, setSignIdx] = useState<number>(-1);
  const [autoTTS, setAutoTTS] = useState(false);
  const recRef = useRef<any>(null);
  const signTimerRef = useRef<number | null>(null);

  // ===== Voice input (Web Speech API) =====
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'ar-SA';
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e: any) => {
      let finalT = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalT += e.results[i][0].transcript;
      }
      if (finalT) setText(prev => (prev + ' ' + finalT).trim());
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, []);

  const toggleListen = () => {
    if (!recRef.current) { toast.error('التعرّف على الصوت غير مدعوم في هذا المتصفح'); return; }
    if (listening) { recRef.current.stop(); setListening(false); }
    else {
      try { recRef.current.start(); setListening(true); setActiveInput('voice'); logToolUse('stt'); }
      catch { /* already started */ }
    }
  };

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
    window.speechSynthesis.cancel();
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.95;
    window.speechSynthesis.speak(u);
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
          <div className="text-center py-4">
            <button onClick={toggleListen}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow ${listening ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {listening ? <><Square className="w-5 h-5"/> إيقاف التسجيل</> : <><Mic className="w-5 h-5"/> ابدأ التحدّث</>}
            </button>
            <p className="text-xs text-gray-500 mt-2">يحوّل المتصفح صوتك إلى نص ويترجمه فوراً للصيغ الأخرى.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
              className="w-full mt-3 p-3 rounded-xl border border-gray-200 text-sm" placeholder="النص المُسجَّل..."/>
          </div>
        )}
        {activeInput === 'braille' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">ألصق رموز بريل (Unicode ⠁⠃⠉…) هنا، وستُحوَّل تلقائيًا إلى نص.</p>
            <textarea defaultValue={textToBraille(text)} onChange={(e) => onBrailleInput(e.target.value)} rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 font-mono text-2xl leading-relaxed" placeholder="⠁⠇⠎⠇⠁⠍ ⠷⠇⠽⠅⠍"/>
          </div>
        )}
        {activeInput === 'sign' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">اكتب جملة بكلمات كاملة (مثلاً: «مرحبا أنا أحب المدرسة») وستظهر كل كلمة كحركة/إشارة بصرية مع شرح للحركة.</p>
            <textarea value={text} onChange={(e) => onSignGloss(e.target.value)} rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 text-base" placeholder="مثال: مرحبا أنا أحب المدرسة"/>
            <p className="text-[11px] text-gray-400 mt-1">القاموس يدعم: التحيات، الأسرة، الأفعال، المشاعر، الأسئلة، الزمن. للترجمة بالكاميرا استخدم صفحة نظام لغة الإشارة.</p>
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
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={playSign} disabled={!text}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
              <Play className="w-3 h-3" /> تشغيل الإشارات
            </button>
            <button onClick={stopSign} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 inline-flex items-center gap-1">
              <Square className="w-3 h-3" /> إيقاف
            </button>
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
    </div>
  );
};

export default SensoryUnifiedComm;
