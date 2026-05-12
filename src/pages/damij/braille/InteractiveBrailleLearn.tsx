import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Keyboard, Eye, Trophy, Sparkles, Loader2, RotateCcw, Play, ChevronDown, ChevronUp, Volume2, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LESSONS, LEVELS, Level, Lesson } from '@/features/braille/learn/lessons';
import { ARABIC_BRAILLE, findLetterByChar, dotsEqual, describeDots } from '@/features/braille/learn/brailleAlphabet';
import { useBrailleKeyboard } from '@/features/braille/learn/useBrailleKeyboard';
import { BrailleCellDisplay } from '@/features/braille/learn/BrailleCellDisplay';
import { BrailleKeyboardPad } from '@/features/braille/learn/BrailleKeyboardPad';
import { ReadingPanel } from '@/features/braille/learn/ReadingPanel';
import { SpeedAccuracyMeter } from '@/features/braille/learn/SpeedAccuracyMeter';
import { pickRandomWords } from '@/features/braille/learn/testWords';

type Tab = 'lessons' | 'write' | 'read' | 'test';

const playTone = (freq: number, duration = 0.15) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
};

const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

const InteractiveBrailleLearn: React.FC = () => {
  const [tab, setTab] = useState<Tab>('lessons');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // ===== Write practice =====
  const [practiceLetter, setPracticeLetter] = useState(ARABIC_BRAILLE[0]);
  const [writeStats, setWriteStats] = useState({ attempts: 0, correct: 0 });
  const [showDict, setShowDict] = useState(true);
  const startTimeRef = useRef<number>(Date.now());

  // ===== Test mode =====
  const [testWords, setTestWords] = useState<string[]>([]);
  const [testActive, setTestActive] = useState(false);
  const [testIndex, setTestIndex] = useState(0); // word index
  const [testCharIndex, setTestCharIndex] = useState(0); // char in current word
  const [testStats, setTestStats] = useState({ correct: 0, errors: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [testStart, setTestStart] = useState<number>(0);
  const [testFeedback, setTestFeedback] = useState('');

  // ===== Read panel =====
  const [readText, setReadText] = useState('باب');

  // ===== Chord handler — varies by tab =====
  const handleChord = useCallback(
    (dots: number[]) => {
      if (tab === 'write') {
        setWriteStats((s) => ({ attempts: s.attempts + 1, correct: s.correct + (dotsEqual(dots, practiceLetter.dots) ? 1 : 0) }));
        if (dotsEqual(dots, practiceLetter.dots)) {
          playTone(880);
          toast.success(`أحسنت! كتبت حرف (${practiceLetter.char}) ${practiceLetter.name}`);
          // pick next random
          setTimeout(() => {
            const next = ARABIC_BRAILLE[Math.floor(Math.random() * ARABIC_BRAILLE.length)];
            setPracticeLetter(next);
          }, 600);
        } else {
          playTone(220, 0.25);
          (navigator as any).vibrate?.(120);
          toast.error(`خطأ — التشكيل الصحيح للحرف (${practiceLetter.char}): ${describeDots(practiceLetter.dots)}`);
        }
      } else if (tab === 'test' && testActive) {
        const word = testWords[testIndex];
        if (!word) return;
        const targetChar = word[testCharIndex];
        const target = findLetterByChar(targetChar);
        setTestStats((s) => ({ ...s, total: s.total + 1 }));
        if (target && dotsEqual(dots, target.dots)) {
          playTone(880);
          setTestStats((s) => ({ ...s, correct: s.correct + 1 }));
          const nextChar = testCharIndex + 1;
          if (nextChar >= word.length) {
            const nextWord = testIndex + 1;
            if (nextWord >= testWords.length) {
              endTest();
              return;
            }
            setTestIndex(nextWord);
            setTestCharIndex(0);
            toast.success(`أنهيت كلمة "${word}"`);
          } else {
            setTestCharIndex(nextChar);
          }
        } else {
          playTone(220, 0.25);
          (navigator as any).vibrate?.(120);
          setTestStats((s) => ({ ...s, errors: s.errors + 1 }));
          toast.error(`الحرف الصحيح: ${targetChar}`);
        }
      }
    },
    [tab, practiceLetter, testActive, testWords, testIndex, testCharIndex]
  );

  const { pressed, toggleVirtualDot, submitVirtual } = useBrailleKeyboard({
    enabled: tab === 'write' || (tab === 'test' && testActive),
    onChord: handleChord,
  });

  // ===== Test timer =====
  useEffect(() => {
    if (!testActive) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { endTest(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testActive]);

  const startTest = () => {
    const words = pickRandomWords(5);
    setTestWords(words);
    setTestIndex(0);
    setTestCharIndex(0);
    setTestStats({ correct: 0, errors: 0, total: 0 });
    setTimeLeft(30);
    setTestStart(Date.now());
    setTestFeedback('');
    setTestActive(true);
    toast('بدأ الاختبار! اكتب الحروف بالتسلسل', { icon: '🎯' });
  };

  const endTest = async () => {
    setTestActive(false);
    const elapsed = Math.max(1, (Date.now() - testStart) / 1000);
    const cpm = (testStats.correct / elapsed) * 60;
    const accuracy = testStats.total ? (testStats.correct / testStats.total) * 100 : 0;
    toast.success(`انتهى الاختبار: ${Math.round(cpm)} حرف/د بدقة ${Math.round(accuracy)}%`);
    // get AI feedback
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke('braille-tutor-ai', {
        body: { mode: 'test_feedback', context: { cpm: Math.round(cpm), accuracy: Math.round(accuracy), errors: testStats.errors } },
      });
      setTestFeedback((data as any)?.text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // ===== Live metrics =====
  const writeMetrics = useMemo(() => {
    const elapsed = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
    const cpm = (writeStats.correct / elapsed) * 60;
    const accuracy = writeStats.attempts ? (writeStats.correct / writeStats.attempts) * 100 : 100;
    return { cpm, accuracy, errors: writeStats.attempts - writeStats.correct };
  }, [writeStats]);

  const testMetrics = useMemo(() => {
    const elapsed = testActive ? Math.max(1, (Date.now() - testStart) / 1000) : 1;
    const cpm = (testStats.correct / elapsed) * 60;
    const accuracy = testStats.total ? (testStats.correct / testStats.total) * 100 : 100;
    return { cpm, accuracy, errors: testStats.errors };
  }, [testStats, testStart, testActive, timeLeft]);

  const explainLesson = async (lesson: Lesson) => {
    setAiLoading(true);
    setAiText('');
    try {
      const { data } = await supabase.functions.invoke('braille-tutor-ai', {
        body: { mode: 'explain_lesson', context: `${lesson.title}\n${lesson.objective}\n${lesson.theory || ''}` },
      });
      setAiText((data as any)?.text || '');
    } catch (e) {
      toast.error('تعذر تحميل الشرح الذكي');
    } finally {
      setAiLoading(false);
    }
  };

  // Scope by level
  const lessonsByLevel = (lvl: Level) => LESSONS.filter((l) => l.level === lvl);

  return (
    <div className="px-4 sm:px-6 pt-8 pb-12 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/damij/braille" className="p-2 rounded-lg hover:bg-[hsl(var(--damij-primary))]/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">تعلّم بريل التفاعلي 🎓</h1>
          <p className="text-sm text-[hsl(var(--damij-text))]/70">دروس متدرّجة، لوحة مفاتيح بريل افتراضية، ومحاكاة شاشة قراءة</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'lessons', label: 'الدروس', icon: BookOpen },
          { id: 'write', label: 'الكتابة', icon: Keyboard },
          { id: 'read', label: 'القراءة', icon: Eye },
          { id: 'test', label: 'الاختبار', icon: Trophy },
        ].map((t) => {
          const I = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                active
                  ? 'bg-[hsl(var(--damij-primary))] text-white shadow'
                  : 'bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40'
              }`}
            >
              <I className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* === LESSONS === */}
      {tab === 'lessons' && (
        <div className="space-y-6">
          {(['beginner', 'intermediate', 'advanced'] as Level[]).map((lvl) => {
            const meta = LEVELS[lvl];
            return (
              <section key={lvl}>
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="text-xl font-bold" style={{ color: meta.color }}>المستوى {meta.label}</h2>
                  <span className="text-sm text-[hsl(var(--damij-text))]/60">{meta.description}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lessonsByLevel(lvl).map((l) => (
                    <motion.button
                      key={l.id}
                      whileHover={{ y: -2 }}
                      onClick={() => { setActiveLesson(l); setAiText(''); }}
                      className={`text-right p-4 rounded-2xl border-2 transition bg-[hsl(var(--damij-surface))] ${
                        activeLesson?.id === l.id
                          ? 'border-[hsl(var(--damij-primary))] shadow-lg'
                          : 'border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40'
                      }`}
                    >
                      <div className="font-bold text-[hsl(var(--damij-primary))] mb-1">{l.title}</div>
                      <div className="text-xs text-[hsl(var(--damij-text))]/70">{l.objective}</div>
                    </motion.button>
                  ))}
                </div>
              </section>
            );
          })}

          {activeLesson && (
            <div className="mt-6 p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{activeLesson.title}</h3>
                  <p className="text-sm text-[hsl(var(--damij-text))]/70">{activeLesson.objective}</p>
                </div>
                <button
                  onClick={() => explainLesson(activeLesson)}
                  disabled={aiLoading}
                  className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  شرح ذكي
                </button>
              </div>

              {activeLesson.theory && (
                <p className="text-[hsl(var(--damij-text))]/85 leading-loose">{activeLesson.theory}</p>
              )}

              {activeLesson.letters && (
                <div className="flex flex-wrap gap-3" dir="ltr">
                  {activeLesson.letters.map((l) => (
                    <div key={l.char} className="flex flex-col items-center gap-1">
                      <BrailleCellDisplay dots={l.dots} label={l.name} />
                      <div className="text-sm font-bold text-[hsl(var(--damij-primary))]" dir="rtl">{l.char}</div>
                      <div className="text-xs text-[hsl(var(--damij-text))]/60" dir="rtl">{l.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeLesson.words && (
                <div className="space-y-2">
                  {activeLesson.words.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[hsl(var(--damij-primary))]/5">
                      <div className="font-bold text-lg">{w.text}</div>
                      {w.hint && <div className="text-xs text-[hsl(var(--damij-text))]/60">{w.hint}</div>}
                    </div>
                  ))}
                </div>
              )}

              {aiText && (
                <div className="p-4 rounded-xl bg-[hsl(var(--damij-primary))]/10 border border-[hsl(var(--damij-primary))]/20">
                  <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--damij-primary))] mb-2">
                    <Sparkles className="w-4 h-4" /> شرح المساعد الذكي
                  </div>
                  <p className="text-sm leading-loose whitespace-pre-wrap">{aiText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* === WRITE === */}
      {tab === 'write' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[hsl(var(--damij-primary))]/5 border border-[hsl(var(--damij-primary))]/15 text-sm text-[hsl(var(--damij-text))]/80 leading-loose">
            استخدم مفاتيح <b>F D S</b> (يد يسرى = نقاط 1،2،3) و <b>J K L</b> (يد يمنى = نقاط 4،5،6). اضغط المفاتيح المطلوبة معاً ثم ارفع أصابعك لإرسال التشكيل. يمكنك أيضاً النقر على المفاتيح بالأسفل من شاشة اللمس.
          </div>

          <div className="text-center space-y-2">
            <div className="text-[hsl(var(--damij-text))]/70 text-sm">اكتب الحرف:</div>
            <div className="text-6xl font-bold text-[hsl(var(--damij-primary))]">{practiceLetter.char}</div>
            <div className="text-sm text-[hsl(var(--damij-text))]/60">{practiceLetter.name}</div>
            <button
              onClick={() => speak(`اكتب حرف ${practiceLetter.name}`)}
              className="text-xs px-3 py-1 rounded-md bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/15"
            >
              🔊 نطق الحرف
            </button>
          </div>

          <div className="flex justify-center" dir="ltr">
            <BrailleCellDisplay dots={[...pressed]} size="lg" highlighted />
          </div>

          <BrailleKeyboardPad pressed={pressed} onToggle={toggleVirtualDot} onSubmit={submitVirtual} />

          <SpeedAccuracyMeter cpm={writeMetrics.cpm} accuracy={writeMetrics.accuracy} errors={writeMetrics.errors} />

          <button
            onClick={() => { setWriteStats({ attempts: 0, correct: 0 }); startTimeRef.current = Date.now(); }}
            className="text-sm px-3 py-1.5 rounded-md bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/15 flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" /> إعادة تعيين الإحصائيات
          </button>

          {/* === Arabic Alphabet → Braille Reference Dictionary === */}
          <div className="rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 overflow-hidden">
            <button
              onClick={() => setShowDict((s) => !s)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[hsl(var(--damij-primary))]/5 hover:bg-[hsl(var(--damij-primary))]/10 transition"
            >
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-[hsl(var(--damij-primary))]" />
                <span className="font-bold text-[hsl(var(--damij-primary))]">قاموس الحروف العربية بلغة بريل</span>
                <span className="text-xs text-[hsl(var(--damij-text))]/60">({ARABIC_BRAILLE.length} حرفاً)</span>
              </div>
              {showDict ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showDict && (
              <div className="p-4">
                <p className="text-xs text-[hsl(var(--damij-text))]/70 mb-3 leading-relaxed">
                  مرجع كامل لكل حرف عربي ومقابله بنقاط بريل. اضغط على أي حرف لتدريب يدك عليه مباشرة، أو استمع إلى نطقه ووصف نقاطه.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" dir="ltr">
                  {ARABIC_BRAILLE.map((l) => {
                    const isActive = practiceLetter.char === l.char;
                    return (
                      <div
                        key={l.char}
                        className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition cursor-pointer ${
                          isActive
                            ? 'border-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 shadow-md'
                            : 'border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40 bg-[hsl(var(--damij-bg))]'
                        }`}
                        onClick={() => { setPracticeLetter(l); speak(`حرف ${l.name}`); }}
                        title={`${l.name} — ${describeDots(l.dots)}`}
                      >
                        <BrailleCellDisplay dots={l.dots} size="sm" highlighted={isActive} label={l.name} />
                        <div className="text-2xl font-bold text-[hsl(var(--damij-primary))] leading-none mt-1" dir="rtl">{l.char}</div>
                        <div className="text-[10px] text-[hsl(var(--damij-text))]/60" dir="rtl">{l.name}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); speak(`حرف ${l.name}: ${describeDots(l.dots)}`); }}
                          className="absolute top-1 right-1 p-1 rounded-md bg-[hsl(var(--damij-surface))]/80 border border-[hsl(var(--damij-primary))]/15 opacity-0 group-hover:opacity-100 transition"
                          aria-label={`نطق ${l.name}`}
                        >
                          <Volume2 className="w-3 h-3 text-[hsl(var(--damij-primary))]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === READ === */}
      {tab === 'read' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[hsl(var(--damij-primary))]/5 border border-[hsl(var(--damij-primary))]/15 text-sm leading-loose">
            تظهر هنا محاكاة لشاشة بريل: للمبصرين تشاهد النقاط بصرياً، ولمستخدمي قارئ الشاشة كل خلية تحمل وصفاً صوتياً لتشكيل النقاط (مثلاً "النقطة 1 و2 و4 بارزة").
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">اكتب نصاً للقراءة:</label>
            <input
              value={readText}
              onChange={(e) => setReadText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-[hsl(var(--damij-surface))]"
              placeholder="مثال: مدرسة"
            />
          </div>
          <ReadingPanel text={readText} />
        </div>
      )}

      {/* === TEST === */}
      {tab === 'test' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[hsl(var(--damij-primary))]/5 border border-[hsl(var(--damij-primary))]/15 text-sm leading-loose">
            خمس كلمات عربية عشوائية، 30 ثانية. اكتب كل حرف بلوحة مفاتيح بريل. التصحيح فوري بالصوت والاهتزاز.
          </div>

          {!testActive && testWords.length === 0 && (
            <button
              onClick={startTest}
              className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold hover:opacity-90"
            >
              <Play className="w-5 h-5" /> ابدأ الاختبار
            </button>
          )}

          {testWords.length > 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-[hsl(var(--damij-text))]/70">الكلمة {testIndex + 1} من {testWords.length}</div>
                <div className="text-4xl font-bold mt-1" dir="rtl">
                  {testWords[testIndex]?.split('').map((ch, i) => (
                    <span
                      key={i}
                      className={
                        i < testCharIndex
                          ? 'text-green-600'
                          : i === testCharIndex
                          ? 'text-[hsl(var(--damij-primary))] underline'
                          : 'text-[hsl(var(--damij-text))]/50'
                      }
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                {testActive && testWords[testIndex] && (
                  <div className="mt-2 flex justify-center" dir="ltr">
                    {(() => {
                      const ch = testWords[testIndex][testCharIndex];
                      const l = ch ? findLetterByChar(ch) : null;
                      return l ? <BrailleCellDisplay dots={l.dots} highlighted label={l.name} /> : null;
                    })()}
                  </div>
                )}
              </div>

              <SpeedAccuracyMeter
                cpm={testMetrics.cpm}
                accuracy={testMetrics.accuracy}
                errors={testMetrics.errors}
                timeLeft={testActive ? timeLeft : undefined}
              />

              {testActive && (
                <>
                  <div className="flex justify-center" dir="ltr">
                    <BrailleCellDisplay dots={[...pressed]} size="lg" highlighted />
                  </div>
                  <BrailleKeyboardPad pressed={pressed} onToggle={toggleVirtualDot} onSubmit={submitVirtual} />
                </>
              )}

              {!testActive && (
                <div className="space-y-3">
                  {aiLoading && <div className="text-center text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جاري تحليل أدائك…</div>}
                  {testFeedback && (
                    <div className="p-4 rounded-xl bg-[hsl(var(--damij-primary))]/10 border border-[hsl(var(--damij-primary))]/20">
                      <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--damij-primary))] mb-2">
                        <Sparkles className="w-4 h-4" /> تقييم المساعد الذكي
                      </div>
                      <p className="text-sm leading-loose whitespace-pre-wrap">{testFeedback}</p>
                    </div>
                  )}
                  <button
                    onClick={startTest}
                    className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold"
                  >
                    <RotateCcw className="w-4 h-4" /> اختبار جديد
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveBrailleLearn;
