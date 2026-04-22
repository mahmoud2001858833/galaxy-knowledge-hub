import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  GraduationCap, Sparkles, ChevronLeft, ChevronRight, RotateCw,
  CheckCircle2, Volume2, Trophy, Target, Flame, BookOpen, Search, Eye, EyeOff,
} from 'lucide-react';

export type SignItem = { word: string; gesture: string; category: string; description?: string };

interface Props {
  dictionary: SignItem[];
  categories: string[];
  speak: (text: string) => void;
}

type Mode = 'browse' | 'flashcards' | 'quiz';

const PROGRESS_KEY = 'sign_language_learned_v1';
const STREAK_KEY = 'sign_language_streak_v1';

const loadLearned = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
};
const saveLearned = (s: Set<string>) => localStorage.setItem(PROGRESS_KEY, JSON.stringify([...s]));

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const LearnSignsTab: React.FC<Props> = ({ dictionary, categories, speak }) => {
  const [mode, setMode] = useState<Mode>('browse');
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? 'الكل');
  const [search, setSearch] = useState('');
  const [learned, setLearned] = useState<Set<string>>(loadLearned);
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem(STREAK_KEY) || 0));

  // ── Flashcards state ───────────────────────────
  const [deck, setDeck] = useState<SignItem[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // ── Quiz state ──────────────────────────────────
  const [quizDeck, setQuizDeck] = useState<SignItem[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim();
    return dictionary.filter(d =>
      (activeCategory === 'الكل' || d.category === activeCategory) &&
      (q === '' || d.word.includes(q))
    );
  }, [dictionary, activeCategory, search]);

  const progressPct = Math.round((learned.size / dictionary.length) * 100);

  const toggleLearned = useCallback((word: string) => {
    setLearned(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else {
        next.add(word);
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem(STREAK_KEY, String(newStreak));
      }
      saveLearned(next);
      return next;
    });
  }, [streak]);

  // ── Build flashcards deck ──────────────────────
  const startFlashcards = () => {
    const pool = activeCategory === 'الكل' ? dictionary : dictionary.filter(d => d.category === activeCategory);
    setDeck(shuffle(pool));
    setCardIdx(0);
    setRevealed(false);
    setMode('flashcards');
  };

  const nextCard = () => { setRevealed(false); setCardIdx(i => Math.min(i + 1, deck.length - 1)); };
  const prevCard = () => { setRevealed(false); setCardIdx(i => Math.max(i - 1, 0)); };

  // ── Build quiz deck ─────────────────────────────
  const buildQuizQuestion = useCallback((deckArr: SignItem[], idx: number) => {
    const correct = deckArr[idx];
    if (!correct) return;
    const distractors = shuffle(dictionary.filter(d => d.word !== correct.word)).slice(0, 3).map(d => d.word);
    setQuizOptions(shuffle([correct.word, ...distractors]));
    setQuizAnswer(null);
  }, [dictionary]);

  const startQuiz = () => {
    const pool = activeCategory === 'الكل' ? dictionary : dictionary.filter(d => d.category === activeCategory);
    const d = shuffle(pool).slice(0, 10);
    setQuizDeck(d);
    setQuizIdx(0);
    setQuizScore(0);
    buildQuizQuestion(d, 0);
    setMode('quiz');
  };

  const answerQuiz = (choice: string) => {
    if (quizAnswer) return;
    setQuizAnswer(choice);
    if (choice === quizDeck[quizIdx].word) setQuizScore(s => s + 1);
  };

  const nextQuiz = () => {
    const ni = quizIdx + 1;
    if (ni >= quizDeck.length) { setMode('browse'); return; }
    setQuizIdx(ni);
    buildQuizQuestion(quizDeck, ni);
  };

  useEffect(() => { if (mode === 'quiz' && quizDeck.length) buildQuizQuestion(quizDeck, quizIdx); /* re-init when entering */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header / Stats ───────────────────────── */}
      <Card className="bg-gradient-to-br from-indigo-950/60 via-slate-900/60 to-purple-950/60 border-indigo-500/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">أكاديمية لغة الإشارة</CardTitle>
                <p className="text-sm text-slate-400">تعلّم بأسلوب تفاعلي وممتع</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 min-w-[72px]">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-xs">تعلّمت</span>
                </div>
                <div className="text-xl font-black text-white">{learned.size}</div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 min-w-[72px]">
                <div className="flex items-center justify-center gap-1 text-orange-400">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-xs">سلسلة</span>
                </div>
                <div className="text-xl font-black text-white">{streak}</div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 min-w-[72px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">المجموع</span>
                </div>
                <div className="text-xl font-black text-white">{dictionary.length}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>تقدّمك العام</span>
              <span className="font-mono text-indigo-300">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 bg-slate-800" />
          </div>
        </CardHeader>
      </Card>

      {/* ── Mode switcher ─────────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {([
          { id: 'browse' as Mode, label: 'تصفّح وتعلّم', icon: BookOpen },
          { id: 'flashcards' as Mode, label: 'بطاقات تعليمية', icon: Sparkles },
          { id: 'quiz' as Mode, label: 'اختبر نفسك', icon: Target },
        ]).map(m => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <Button
              key={m.id}
              onClick={() => m.id === 'flashcards' ? startFlashcards() : m.id === 'quiz' ? startQuiz() : setMode('browse')}
              variant={isActive ? 'default' : 'outline'}
              className={isActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-indigo-500/30 text-slate-300'}
            >
              <Icon className="ml-2 h-4 w-4" />
              {m.label}
            </Button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────
          Mode: Browse
          ───────────────────────────────────────────── */}
      {mode === 'browse' && (
        <>
          {/* Search + categories */}
          <Card className="bg-slate-900/60 border-indigo-500/20">
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ابحث عن كلمة لتتعلّمها..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10 bg-slate-800/60 border-slate-700"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={activeCategory === 'الكل' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory('الكل')}
                >
                  الكل ({dictionary.length})
                </Badge>
                {categories.map(cat => {
                  const count = dictionary.filter(d => d.category === cat).length;
                  const learnedInCat = dictionary.filter(d => d.category === cat && learned.has(d.word)).length;
                  return (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat} <span className="opacity-60 mr-1">({learnedInCat}/{count})</span>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Grid of cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => {
              const isLearned = learned.has(item.word);
              return (
                <motion.div
                  key={item.word}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <Card className={`group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 ${
                    isLearned
                      ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border-emerald-500/40'
                      : 'bg-slate-900/60 border-indigo-500/20 hover:border-indigo-500/50'
                  }`}>
                    {isLearned && (
                      <div className="absolute top-2 left-2 z-10">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                    )}
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-7xl text-center mb-2 group-hover:scale-110 transition-transform duration-300">
                            {item.gesture}
                          </div>
                          <h3 className="text-2xl font-black text-white text-center mb-1">{item.word}</h3>
                          <Badge variant="outline" className="w-full justify-center text-[10px] mb-2">{item.category}</Badge>
                        </div>
                      </div>
                      {item.description && (
                        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-3">
                          <p className="text-xs text-indigo-200 leading-relaxed text-center">
                            <span className="font-bold text-indigo-400">طريقة الأداء: </span>
                            {item.description}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => speak(item.word)}
                          className="flex-1 border-indigo-500/30"
                        >
                          <Volume2 className="ml-1 h-3.5 w-3.5" />
                          استمع
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => toggleLearned(item.word)}
                          className={isLearned ? 'flex-1 bg-emerald-600 hover:bg-emerald-700' : 'flex-1 bg-indigo-600 hover:bg-indigo-700'}
                        >
                          <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
                          {isLearned ? 'تعلّمتها' : 'حفظتها'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-12">لا توجد نتائج</p>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────
          Mode: Flashcards
          ───────────────────────────────────────────── */}
      {mode === 'flashcards' && deck.length > 0 && (
        <Card className="bg-slate-900/60 border-indigo-500/20 max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">بطاقة {cardIdx + 1} من {deck.length}</CardTitle>
              <Badge variant="outline">{deck[cardIdx].category}</Badge>
            </div>
            <Progress value={((cardIdx + 1) / deck.length) * 100} className="h-1.5 bg-slate-800" />
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${cardIdx}-${revealed}`}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.4 }}
                className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                onClick={() => setRevealed(r => !r)}
              >
                <div className="text-9xl mb-6">{deck[cardIdx].gesture}</div>
                {revealed ? (
                  <>
                    <h2 className="text-5xl font-black text-white mb-4">{deck[cardIdx].word}</h2>
                    {deck[cardIdx].description && (
                      <p className="text-base text-indigo-200 leading-relaxed">{deck[cardIdx].description}</p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    اضغط للكشف عن الإجابة
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between gap-2 mt-6">
              <Button onClick={prevCard} disabled={cardIdx === 0} variant="outline" className="border-indigo-500/30">
                <ChevronRight className="ml-1 h-4 w-4" />
                السابق
              </Button>
              <Button onClick={() => setRevealed(r => !r)} variant="outline" className="border-indigo-500/30">
                {revealed ? <EyeOff className="ml-1 h-4 w-4" /> : <Eye className="ml-1 h-4 w-4" />}
                {revealed ? 'إخفاء' : 'كشف'}
              </Button>
              <Button onClick={() => speak(deck[cardIdx].word)} variant="outline" className="border-indigo-500/30">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button onClick={nextCard} disabled={cardIdx === deck.length - 1} className="bg-indigo-600 hover:bg-indigo-700">
                التالي
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────
          Mode: Quiz
          ───────────────────────────────────────────── */}
      {mode === 'quiz' && quizDeck.length > 0 && (
        <Card className="bg-slate-900/60 border-indigo-500/20 max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">سؤال {quizIdx + 1} من {quizDeck.length}</CardTitle>
              <Badge className="bg-amber-600">النتيجة: {quizScore}</Badge>
            </div>
            <Progress value={((quizIdx + 1) / quizDeck.length) * 100} className="h-1.5 bg-slate-800" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-square max-w-xs mx-auto rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-center">
              <div className="text-[8rem]">{quizDeck[quizIdx].gesture}</div>
            </div>
            <p className="text-center text-slate-300">ما الكلمة التي تعبّر عنها هذه الإشارة؟</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizOptions.map(opt => {
                const isCorrect = opt === quizDeck[quizIdx].word;
                const isPicked = quizAnswer === opt;
                let cls = 'border-indigo-500/30 hover:bg-indigo-950/40';
                if (quizAnswer) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
                  else if (isPicked) cls = 'border-rose-500 bg-rose-950/40 text-rose-300';
                  else cls = 'border-slate-700 opacity-50';
                }
                return (
                  <Button
                    key={opt}
                    onClick={() => answerQuiz(opt)}
                    disabled={!!quizAnswer}
                    variant="outline"
                    className={`h-14 text-lg font-bold ${cls}`}
                  >
                    {opt}
                    {quizAnswer && isCorrect && <CheckCircle2 className="mr-2 h-5 w-5" />}
                  </Button>
                );
              })}
            </div>
            {quizAnswer && (
              <Button onClick={nextQuiz} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {quizIdx + 1 >= quizDeck.length ? 'إنهاء الاختبار' : 'السؤال التالي'}
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearnSignsTab;
