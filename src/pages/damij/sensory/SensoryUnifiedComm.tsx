import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Type, Mic, Hand, Volume2, Square, Play, Copy, RefreshCw,
  Languages, Eye, Ear, Accessibility,
} from 'lucide-react';
import { toast } from 'sonner';
import { textToBraille, brailleToText } from './braille';
import { logToolUse } from './interactionLog';

type Modality = 'text' | 'voice' | 'braille' | 'sign';

// ===== Sign-language dictionary: WORDS & GESTURES (not letters) =====
// Each entry maps an Arabic word/phrase to a visual gesture description with
// an emoji/icon, motion hint, and a short Arabic explanation of the hand sign.
type SignGesture = {
  emoji: string;        // pictographic representation of the gesture
  motion: string;       // animation class: wave, tap, point, circle, none
  desc: string;         // short Arabic description of the hand movement
};

const SIGN_DICT: Record<string, SignGesture> = {
  // التحيات
  'مرحبا':   { emoji: '👋', motion: 'wave',   desc: 'لوّح بيدك المفتوحة قرب الرأس' },
  'أهلا':    { emoji: '👋', motion: 'wave',   desc: 'لوّح بيدك ترحيبًا' },
  'السلام':  { emoji: '🤲', motion: 'rise',   desc: 'يدان مفتوحتان للأعلى' },
  'سلام':    { emoji: '✌️', motion: 'rise',   desc: 'إصبعان للأعلى ثم تحية' },
  'وداعا':   { emoji: '👋', motion: 'wave',   desc: 'لوّح بيدك للوداع' },
  'شكرا':    { emoji: '🙏', motion: 'bow',    desc: 'يد على الذقن ثم للأمام' },
  'عفوا':    { emoji: '🤝', motion: 'tap',    desc: 'يد على الصدر ثم انفتاح' },
  'آسف':     { emoji: '😔', motion: 'circle', desc: 'قبضة تدور على الصدر' },
  'نعم':     { emoji: '👍', motion: 'nod',    desc: 'قبضة تومئ للأعلى والأسفل' },
  'لا':      { emoji: '👎', motion: 'shake',  desc: 'إصبعان يتحركان جانبيًا' },
  'من فضلك': { emoji: '🙏', motion: 'circle', desc: 'كف مفتوح يدور على الصدر' },

  // الأشخاص والأسرة
  'أنا':     { emoji: '👤', motion: 'point',  desc: 'الإشارة بالإصبع نحو الصدر' },
  'أنت':     { emoji: '👉', motion: 'point',  desc: 'الإشارة بالإصبع نحو المخاطب' },
  'نحن':     { emoji: '👥', motion: 'circle', desc: 'دائرة تشمل الجميع' },
  'هو':      { emoji: '🧑', motion: 'point',  desc: 'إشارة جانبية' },
  'هي':      { emoji: '🧑‍🦰', motion: 'point', desc: 'إشارة جانبية' },
  'أم':      { emoji: '👩', motion: 'tap',    desc: 'الإبهام يلمس الذقن' },
  'أب':      { emoji: '👨', motion: 'tap',    desc: 'الإبهام يلمس الجبهة' },
  'أخ':      { emoji: '🧑', motion: 'tap',    desc: 'قبضتان تتلامسان' },
  'أخت':     { emoji: '👧', motion: 'tap',    desc: 'إبهام يلمس الخد' },
  'صديق':    { emoji: '🤝', motion: 'tap',    desc: 'يدان متشابكتان' },
  'معلم':    { emoji: '👨‍🏫', motion: 'rise',  desc: 'يدان من الرأس للأمام' },
  'طالب':    { emoji: '🧑‍🎓', motion: 'tap',  desc: 'يد على الرأس ثم للأمام' },

  // الأماكن والأشياء
  'مدرسة':   { emoji: '🏫', motion: 'tap',    desc: 'كفّان يصفّقان مرتين' },
  'بيت':     { emoji: '🏠', motion: 'rise',   desc: 'يدان تكوّنان سقف منزل' },
  'كتاب':    { emoji: '📖', motion: 'open',   desc: 'يدان تنفتحان كصفحتين' },
  'قلم':     { emoji: '✏️', motion: 'circle', desc: 'حركة كتابة في الهواء' },
  'ماء':     { emoji: '💧', motion: 'tap',    desc: 'ثلاث أصابع على الفم' },
  'طعام':    { emoji: '🍽️', motion: 'tap',    desc: 'يد تتحرك نحو الفم' },
  'سيارة':   { emoji: '🚗', motion: 'circle', desc: 'يدان كأنّها تمسكان مقودًا' },

  // الأفعال
  'أحب':     { emoji: '❤️', motion: 'tap',    desc: 'يدان متقاطعتان على الصدر' },
  'أريد':    { emoji: '🤲', motion: 'rise',   desc: 'يدان للأمام تجذبان' },
  'أفهم':    { emoji: '💡', motion: 'tap',    desc: 'إصبع يلمس الجبهة' },
  'أعرف':    { emoji: '🧠', motion: 'tap',    desc: 'أصابع تلمس الجبين' },
  'أتعلم':   { emoji: '📚', motion: 'rise',   desc: 'يد تجمع من الراحة للجبهة' },
  'ادرس':    { emoji: '🎓', motion: 'rise',   desc: 'أصابع متجهة للعينين' },
  'أكتب':    { emoji: '✍️', motion: 'circle', desc: 'حركة كتابة على الكف' },
  'أقرأ':    { emoji: '👀', motion: 'tap',    desc: 'إصبعان يتحركان فوق الكف' },
  'انظر':    { emoji: '👁️', motion: 'point',  desc: 'إصبعان من العين للأمام' },
  'استمع':   { emoji: '👂', motion: 'tap',    desc: 'يد قرب الأذن' },
  'تكلم':    { emoji: '🗣️', motion: 'wave',   desc: 'أصابع تنفتح أمام الفم' },
  'ساعد':    { emoji: '🤝', motion: 'rise',   desc: 'يد ترفع الأخرى للأعلى' },
  'العب':    { emoji: '🎮', motion: 'shake',  desc: 'يدان مفتوحتان تهتزان' },
  'اجلس':    { emoji: '🪑', motion: 'tap',    desc: 'إصبعان يستقران على الآخرين' },
  'قم':      { emoji: '🧍', motion: 'rise',   desc: 'إصبعان يقفان على الكف' },

  // الزمن والمشاعر
  'اليوم':   { emoji: '📅', motion: 'tap',    desc: 'إبهامان للأسفل مرتين' },
  'غدا':     { emoji: '➡️', motion: 'point',  desc: 'إبهام يتحرك للأمام' },
  'أمس':     { emoji: '⬅️', motion: 'point',  desc: 'إبهام يتحرك للخلف' },
  'الآن':    { emoji: '⏱️', motion: 'tap',    desc: 'يدان تنزلان معًا' },
  'سعيد':    { emoji: '😊', motion: 'rise',   desc: 'يدان ترتفعان من الصدر' },
  'حزين':    { emoji: '😢', motion: 'wave',   desc: 'أصابع تنزل من العينين' },
  'تعبان':   { emoji: '😴', motion: 'tap',    desc: 'يدان على الصدر تنزلان' },
  'جيد':     { emoji: '👌', motion: 'tap',    desc: 'إبهام للأعلى' },
  'سيء':     { emoji: '👎', motion: 'tap',    desc: 'إبهام للأسفل' },

  // أسئلة
  'ما':      { emoji: '❓', motion: 'shake',  desc: 'كفّان مفتوحان يهتزّان' },
  'ماذا':    { emoji: '❓', motion: 'shake',  desc: 'كفّان مفتوحان يهتزّان' },
  'من':      { emoji: '🤔', motion: 'circle', desc: 'إصبع يدور أمام الفم' },
  'متى':     { emoji: '⏰', motion: 'circle', desc: 'إصبع يدور حول الآخر' },
  'أين':     { emoji: '📍', motion: 'shake',  desc: 'سبابة تهتز يمينًا وشمالًا' },
  'كيف':     { emoji: '🤷', motion: 'rise',   desc: 'كفّان يدوران للأعلى' },
  'لماذا':   { emoji: '💭', motion: 'tap',    desc: 'سبابة تنقر الجبهة' },
};

// Synonym normalization (handle hamza variants & common alternatives)
const SIGN_SYNONYMS: Record<string, string> = {
  'إنا': 'أنا', 'انا': 'أنا', 'انت': 'أنت', 'إنت': 'أنت',
  'احب': 'أحب', 'اريد': 'أريد', 'افهم': 'أفهم', 'اعرف': 'أعرف',
  'اخت': 'أخت', 'اخ': 'أخ', 'ام': 'أم', 'اب': 'أب', 'ابي': 'أب', 'امي': 'أم',
  'مدرسه': 'مدرسة', 'سياره': 'سيارة', 'اليم': 'اليوم', 'الان': 'الآن',
  'اسف': 'آسف', 'اهلا': 'أهلا', 'وداعاً': 'وداعا', 'شكراً': 'شكرا',
  'مرحباً': 'مرحبا', 'هلا': 'مرحبا',
};

const stripDiacritics = (s: string) => s.replace(/[\u064B-\u0652\u0670]/g, '');
const normalizeWord = (w: string) => {
  const cleaned = stripDiacritics(w).replace(/[^\u0600-\u06FF]/g, '');
  return SIGN_SYNONYMS[cleaned] || cleaned;
};

// Tokenize text into sign tokens; check 2-word phrases first (e.g. "من فضلك")
type SignToken = { word: string; gesture: SignGesture | null };
const tokenizeSigns = (text: string): SignToken[] => {
  const raw = text.split(/\s+/).filter(Boolean);
  const out: SignToken[] = [];
  let i = 0;
  while (i < raw.length) {
    if (i + 1 < raw.length) {
      const pair = `${normalizeWord(raw[i])} ${normalizeWord(raw[i + 1])}`;
      if (SIGN_DICT[pair]) {
        out.push({ word: `${raw[i]} ${raw[i + 1]}`, gesture: SIGN_DICT[pair] });
        i += 2;
        continue;
      }
    }
    const w = normalizeWord(raw[i]);
    out.push({ word: raw[i], gesture: SIGN_DICT[w] || null });
    i++;
  }
  return out;
};

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

  // Sign-language playback: step through letters
  const playSign = () => {
    stopSign();
    const letters = Array.from(text).filter(c => SIGN_LABELS[c] || c === ' ');
    if (!letters.length) return;
    let i = 0;
    setSignIdx(0);
    signTimerRef.current = window.setInterval(() => {
      i++;
      if (i >= letters.length) { stopSign(); return; }
      setSignIdx(i);
    }, 700);
    logToolUse('sign');
  };
  const stopSign = () => {
    if (signTimerRef.current) { clearInterval(signTimerRef.current); signTimerRef.current = null; }
    setSignIdx(-1);
  };
  useEffect(() => () => { stopSign(); window.speechSynthesis?.cancel(); }, []);

  const signLetters = Array.from(text);

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
            <p className="text-xs text-gray-500 mb-1">اكتب الجملة بصياغة لغة الإشارة (Gloss) — حروف عربية تُمثَّل بالتهجئة الإصبعية للمتعلم.</p>
            <textarea value={text} onChange={(e) => onSignGloss(e.target.value)} rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 text-base" placeholder="مثال: مرحبا الصف"/>
            <p className="text-[11px] text-gray-400 mt-1">للترجمة الإشارية بكاميرا، استخدم صفحة نظام لغة الإشارة المخصّص.</p>
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

        {/* Sign Language */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold mb-2 inline-flex items-center gap-2"><Hand className="w-5 h-5 text-emerald-600"/> لغة الإشارة</h3>
          <div className="min-h-[80px] p-3 rounded-xl bg-emerald-50">
            {text ? (
              <div className="flex flex-wrap gap-2">
                {signLetters.map((c, i) => {
                  const label = SIGN_LABELS[c];
                  const active = i === signIdx;
                  if (c === ' ') return <div key={i} className="w-3" />;
                  return (
                    <div key={i}
                      className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center transition ${active ? 'bg-emerald-600 text-white scale-110 shadow-lg' : 'bg-white border-emerald-200 text-emerald-800'}`}>
                      <span className="text-lg font-bold">{c}</span>
                      {label && <span className="text-[8px] opacity-70">{label}</span>}
                    </div>
                  );
                })}
              </div>
            ) : <span className="text-emerald-300 text-sm">ستظهر بطاقات الإشارة هنا...</span>}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={playSign} disabled={!text}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50 inline-flex items-center gap-1">
              <Play className="w-3 h-3" /> تشغيل تتابعي
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
