import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Type, Play, Pause, Square, RotateCcw, ChevronLeft, ChevronRight,
  Sparkles, AlertCircle, Volume2, Hand, Video,
} from 'lucide-react';
import { useSignDictionary } from './useSignDictionary';

export type SignItem = { word: string; gesture: string; category: string; description?: string };

interface Props {
  dictionary: SignItem[];
  speak: (text: string) => void;
}

type Token = {
  word: string;
  match: SignItem | null; // null if no sign found
};

// Try to find a sign for a word, with fallbacks: exact → strip Arabic prefixes/suffixes → letter-by-letter for unknown
const ARABIC_LETTER_GESTURES: Record<string, string> = {
  'ا': '🤚', 'أ': '🤚', 'إ': '🤚', 'آ': '🤚',
  'ب': '☝️', 'ت': '✌️', 'ث': '🤟',
  'ج': '👊', 'ح': '✋', 'خ': '🖐️',
  'د': '👆', 'ذ': '👇', 'ر': '👉', 'ز': '👈',
  'س': '🖖', 'ش': '🤘', 'ص': '✊', 'ض': '🤛',
  'ط': '🤜', 'ظ': '👋', 'ع': '🫳', 'غ': '🫴',
  'ف': '🫰', 'ق': '🤌', 'ك': '🤏', 'ل': '👌',
  'م': '🤝', 'ن': '🙏', 'ه': '🫶', 'و': '✌️', 'ي': '☝️',
  'ة': '🤚', 'ى': '☝️', 'ء': '👆',
};

// Common Arabic synonyms / colloquial → dictionary key
const SYNONYMS: Record<string, string> = {
  'كيفك': 'كيف',
  'كيفكم': 'كيف',
  'شكرا': 'شكراً',
  'مرحبًا': 'مرحبا',
  'اهلا': 'أهلاً',
  'اهلاً': 'أهلاً',
  'وداعا': 'وداعاً',
  'باي': 'وداعاً',
  'مع السلامة': 'وداعاً',
  'ابي': 'أب',
  'امي': 'أم',
  'بابا': 'أب',
  'ماما': 'أم',
  'اخي': 'أخ',
  'اختي': 'أخت',
  'بيتي': 'بيت',
  'منزل': 'بيت',
  'مدرستي': 'مدرسة',
};

// Multi-word phrases that should be recognized as a single sign
const PHRASES = ['السلام عليكم', 'صباح الخير', 'مساء الخير', 'تصبح على خير', 'من فضلك', 'إن شاء الله'];

const stripPunct = (s: string) => s.replace(/[.,!?؟،;:"'()[\]{}]/g, '');

// Normalize Arabic text: remove diacritics, unify alef/yaa/taa-marbuta
const normalize = (s: string): string =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // tashkeel + tatweel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه');

const ARABIC_PREFIXES = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك', 'س'];

const findSign = (raw: string, dict: SignItem[]): SignItem | null => {
  const w = stripPunct(raw).trim();
  if (!w) return null;

  // Synonym lookup (raw)
  const synonymTarget = SYNONYMS[w];
  if (synonymTarget) {
    const s = dict.find(d => d.word === synonymTarget);
    if (s) return s;
  }

  // Exact match
  let hit = dict.find(d => d.word === w);
  if (hit) return hit;

  // Normalized exact match
  const nw = normalize(w);
  hit = dict.find(d => normalize(d.word) === nw);
  if (hit) return hit;

  // Strip prefixes and retry (longest first)
  for (const p of ARABIC_PREFIXES) {
    if (nw.startsWith(p) && nw.length > p.length + 1) {
      const stripped = nw.slice(p.length);
      hit = dict.find(d => normalize(d.word) === stripped);
      if (hit) return hit;
    }
  }

  // Substring match (handles attached prefixes/suffixes)
  hit = dict.find(d => {
    const nd = normalize(d.word);
    return nd.length >= 3 && nw.includes(nd);
  });
  if (hit) return hit;

  return null;
};

// Tokenize text but glue together known multi-word phrases first
const tokenize = (text: string, dict: SignItem[]): { word: string; match: SignItem | null }[] => {
  let working = ' ' + text + ' ';
  const placeholders: { id: string; phrase: string; match: SignItem }[] = [];
  PHRASES.forEach((phrase, i) => {
    const m = dict.find(d => d.word === phrase);
    if (!m) return;
    const id = `__PH${i}__`;
    if (working.includes(' ' + phrase + ' ')) {
      working = working.split(' ' + phrase + ' ').join(' ' + id + ' ');
      placeholders.push({ id, phrase, match: m });
    }
  });
  const rawTokens = working.trim().split(/\s+/).filter(Boolean);
  return rawTokens.map(tok => {
    const ph = placeholders.find(p => p.id === tok);
    if (ph) return { word: ph.phrase, match: ph.match };
    return { word: tok, match: findSign(tok, dict) };
  });
};

export const TextToSignTab: React.FC<Props> = ({ dictionary, speak }) => {
  const { find: findRealSign } = useSignDictionary('ArSL');
  const [text, setText] = useState<string>('مرحبا كيف حالك');
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [speed, setSpeed] = useState<number>(1200); // ms per sign
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [spellUnknown, setSpellUnknown] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const tokens: Token[] = useMemo(() => tokenize(text, dictionary), [text, dictionary]);

  // Build the full play sequence: each item is either { kind: 'sign', sign } or { kind: 'letter', letter, gesture, parent }
  type Step = { kind: 'sign'; sign: SignItem; word: string } | { kind: 'letter'; letter: string; gesture: string; word: string };
  const steps: Step[] = useMemo(() => {
    const out: Step[] = [];
    tokens.forEach(t => {
      if (t.match) {
        out.push({ kind: 'sign', sign: t.match, word: t.word });
      } else if (spellUnknown) {
        // Spell letter by letter
        const letters = stripPunct(t.word).split('').filter(c => ARABIC_LETTER_GESTURES[c]);
        if (letters.length > 0) {
          letters.forEach(l => out.push({ kind: 'letter', letter: l, gesture: ARABIC_LETTER_GESTURES[l], word: t.word }));
        }
      }
    });
    return out;
  }, [tokens, spellUnknown]);

  const stop = () => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setPlaying(false);
    setPaused(false);
    setActiveIdx(0);
  };

  const pause = () => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setPaused(true);
  };

  // Playback loop
  useEffect(() => {
    if (!playing || paused) return;
    if (activeIdx >= steps.length) { setPlaying(false); setPaused(false); return; }
    const cur = steps[activeIdx];
    if (autoSpeak && cur.kind === 'sign') {
      try { speak(cur.sign.word); } catch { /* ignore */ }
    }
    timerRef.current = window.setTimeout(() => {
      setActiveIdx(i => i + 1);
    }, speed);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [playing, paused, activeIdx, steps, speed, autoSpeak, speak]);

  const start = () => {
    if (steps.length === 0) return;
    setActiveIdx(0);
    setPaused(false);
    setPlaying(true);
  };
  const resume = () => { setPaused(false); };

  const matched = tokens.filter(t => t.match).length;
  const total = tokens.length;
  const cur = steps[activeIdx];

  return (
    <div className="space-y-6">
      {/* ── Input panel ───────────────────────── */}
      <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Type className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">مترجم النص إلى لغة الإشارة</CardTitle>
              <p className="text-sm text-slate-400">اكتب جملة وشاهدها تتحوّل إلى إشارات متحركة</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب الجملة هنا... مثال: مرحبا كيف حالك اليوم"
            rows={3}
            className="bg-slate-800/60 border-slate-700 text-white text-lg leading-loose resize-none"
            dir="rtl"
          />

          {/* Token preview */}
          {tokens.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
              {tokens.map((t, i) => (
                <Badge
                  key={i}
                  variant={t.match ? 'default' : 'outline'}
                  className={t.match
                    ? 'bg-emerald-600/80 hover:bg-emerald-600'
                    : 'border-amber-500/40 text-amber-300'}
                >
                  {t.match ? (
                    <span className="flex items-center gap-1"><span>{t.match.gesture}</span> {t.word}</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      {spellUnknown && <Hand className="h-3 w-3" />}
                      {t.word}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats + warning */}
          {total > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                <span className="text-emerald-400 font-bold">{matched}</span> من <span className="text-white font-bold">{total}</span> كلمة لها إشارة مباشرة
              </span>
              {matched < total && spellUnknown && (
                <span className="text-amber-300 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  الكلمات غير المعروفة ستُهجّى حرفاً حرفاً
                </span>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center justify-between">
                <span>سرعة العرض</span>
                <span className="font-mono text-indigo-300">{(1500 - speed + 300) / 1000}s/إشارة</span>
              </label>
              <Slider
                min={400}
                max={2400}
                step={100}
                value={[speed]}
                onValueChange={(v) => setSpeed(v[0])}
                dir="ltr"
              />
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <Button
                size="sm"
                variant={autoSpeak ? 'default' : 'outline'}
                onClick={() => setAutoSpeak(s => !s)}
                className={autoSpeak ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-indigo-500/30 text-slate-300'}
              >
                <Volume2 className="ml-1 h-3.5 w-3.5" />
                نطق صوتي
              </Button>
              <Button
                size="sm"
                variant={spellUnknown ? 'default' : 'outline'}
                onClick={() => setSpellUnknown(s => !s)}
                className={spellUnknown ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-indigo-500/30 text-slate-300'}
              >
                <Hand className="ml-1 h-3.5 w-3.5" />
                تهجئة المجهول
              </Button>
            </div>
          </div>

          {/* Play controls */}
          <div className="flex items-center gap-2 pt-2">
            {!playing ? (
              <Button onClick={start} disabled={steps.length === 0} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white">
                <Play className="ml-2 h-4 w-4" />
                تشغيل الترجمة ({steps.length} إشارة)
              </Button>
            ) : paused ? (
              <Button onClick={resume} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Play className="ml-2 h-4 w-4" />
                استئناف
              </Button>
            ) : (
              <Button onClick={pause} variant="outline" className="flex-1 border-amber-500/30 text-amber-300">
                <Pause className="ml-2 h-4 w-4" />
                إيقاف مؤقت
              </Button>
            )}
            <Button onClick={stop} disabled={!playing && activeIdx === 0} variant="outline" className="border-rose-500/30 text-rose-300">
              <Square className="ml-1 h-4 w-4" />
              إيقاف
            </Button>
            <Button onClick={() => { stop(); setActiveIdx(0); }} variant="outline" className="border-slate-600">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Stage / Player ─────────────────────────── */}
      <Card className="bg-slate-900/60 border-indigo-500/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-[16/9] relative bg-gradient-to-br from-slate-950 via-indigo-950/30 to-purple-950/30 flex items-center justify-center overflow-hidden">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }} />
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {cur ? (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.6, rotateY: -45 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotateY: 45 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="relative z-10 flex flex-col items-center text-center px-4"
                >
                  {(() => {
                    const realEntry = cur.kind === 'sign' ? findRealSign(cur.sign.word, 'ArSL') : null;
                    if (realEntry && (realEntry.video_url || realEntry.image_url)) {
                      return (
                        <>
                          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.35)] bg-black">
                            {realEntry.video_url ? (
                              <video src={realEntry.video_url} autoPlay loop muted playsInline
                                className="max-h-[55vh] w-auto object-contain" />
                            ) : (
                              <img src={realEntry.image_url!} alt={realEntry.word}
                                className="max-h-[55vh] w-auto object-contain" />
                            )}
                            <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Video className="w-3 h-3" /> إشارة حقيقية
                            </span>
                          </div>
                          <div className="mt-3">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{realEntry.word}</h2>
                            {realEntry.description && (
                              <p className="text-sm text-emerald-200 max-w-md">{realEntry.description}</p>
                            )}
                          </div>
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="text-[12rem] md:text-[16rem] leading-none drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                          {cur.kind === 'sign' ? cur.sign.gesture : cur.gesture}
                        </div>
                        <div className="mt-2">
                          {cur.kind === 'sign' ? (
                            <>
                              <h2 className="text-4xl md:text-5xl font-black text-white mb-1">{cur.sign.word}</h2>
                              {cur.sign.description && (
                                <p className="text-sm text-indigo-200 max-w-md">{cur.sign.description}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <h2 className="text-4xl md:text-5xl font-black text-white mb-1">حرف «{cur.letter}»</h2>
                              <p className="text-sm text-amber-200">جزء من كلمة: {cur.word}</p>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 text-center px-4"
                >
                  <Sparkles className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">اكتب نصاً واضغط «تشغيل» لمشاهدة الترجمة</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timeline */}
          {steps.length > 0 && (
            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>الخطوة {Math.min(activeIdx + 1, steps.length)} من {steps.length}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-slate-700"
                    onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                    disabled={activeIdx === 0}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-slate-700"
                    onClick={() => setActiveIdx(i => Math.min(steps.length - 1, i + 1))}
                    disabled={activeIdx >= steps.length - 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { stop(); setActiveIdx(i); }}
                    className={`shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center text-2xl transition-all ${
                      i === activeIdx
                        ? 'border-indigo-400 bg-indigo-500/20 scale-110'
                        : i < activeIdx
                          ? 'border-emerald-700/40 bg-emerald-950/20 opacity-60'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                    }`}
                    title={s.kind === 'sign' ? s.sign.word : `حرف ${s.letter}`}
                  >
                    {s.kind === 'sign' ? s.sign.gesture : s.gesture}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSignTab;
