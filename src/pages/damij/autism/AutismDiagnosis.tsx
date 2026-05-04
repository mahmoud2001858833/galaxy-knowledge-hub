import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, ClipboardList, Gamepad2, Sparkles, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AgeTrack,
  getItemsForTrack,
  ANSWER_LABELS_YESNO,
  ANSWER_LABELS_4PT,
} from '@/features/autism/screeningItems';
import {
  AnswerValue,
  GameResult,
  scoreQuestionnaire,
  summarizeGames,
} from '@/features/autism/scoringEngine';
import { GAMES } from '@/features/autism/playGames';
import { AUTISM_SOURCES, SCREENING_DISCLAIMER_AR } from '@/features/autism/sources';
import ReportView, { AIReport } from '@/features/autism/ReportView';

import ResponseToName from '@/features/autism/games/ResponseToName';
import JointAttention from '@/features/autism/games/JointAttention';
import PatternVsSocial from '@/features/autism/games/PatternVsSocial';
import RepetitiveMatch from '@/features/autism/games/RepetitiveMatch';
import EmotionRecognition from '@/features/autism/games/EmotionRecognition';
import SensoryTolerance from '@/features/autism/games/SensoryTolerance';

type Step = 'intro' | 'path' | 'questionnaire' | 'games' | 'analyzing' | 'report';
type Path = 'questionnaire' | 'games' | 'both';

const GAME_COMPONENTS: Record<string, React.FC<any>> = {
  response_to_name: ResponseToName,
  joint_attention: JointAttention,
  pattern_vs_social: PatternVsSocial,
  repetitive_match: RepetitiveMatch,
  emotion_recognition: EmotionRecognition,
  sensory_tolerance: SensoryTolerance,
};

const inferTrack = (ageMonths: number): AgeTrack => {
  if (ageMonths < 36) return 'toddler';
  if (ageMonths < 144) return 'child';
  return 'adolescent';
};

const AutismDiagnosis: React.FC = () => {
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [ageMonths, setAgeMonths] = useState(36);
  const [respondent, setRespondent] = useState<'caregiver' | 'self'>('caregiver');
  const [path, setPath] = useState<Path>('both');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [qIndex, setQIndex] = useState(0);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [report, setReport] = useState<AIReport | null>(null);

  const track = useMemo(() => inferTrack(ageMonths), [ageMonths]);
  const items = useMemo(() => getItemsForTrack(track), [track]);
  const currentItem = items[qIndex];

  const reset = () => {
    setStep('intro'); setAnswers({}); setQIndex(0); setGameIndex(0); setGameResults([]); setReport(null);
  };

  const startAnalysis = async (finalGames: GameResult[]) => {
    setStep('analyzing');
    const questionnaireResult =
      path !== 'games' ? scoreQuestionnaire(track, answers) : null;
    const gameInsights = path !== 'questionnaire' ? summarizeGames(finalGames) : [];

    try {
      const { data, error } = await supabase.functions.invoke('autism-screen-analyze', {
        body: {
          ageTrack: track,
          demographics: { ageMonths, respondent, name: name || undefined },
          questionnaireResult,
          gameInsights,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReport(data.report);
      setStep('report');
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? '';
      if (msg.includes('429')) toast.error('الخدمة مشغولة الآن، حاول بعد قليل.');
      else if (msg.includes('402')) toast.error('انتهى الرصيد. يرجى إعادة شحن AI.');
      else toast.error('تعذّر إنتاج التقرير: ' + msg);
      setStep(path === 'games' ? 'games' : 'questionnaire');
    }
  };

  const onQuestionnaireDone = () => {
    if (path === 'questionnaire') startAnalysis([]);
    else { setStep('games'); setGameIndex(0); }
  };

  const handleGameComplete = (metrics: Record<string, number>, durationMs: number, skipped = false) => {
    const game = GAMES[gameIndex];
    const next: GameResult = { gameId: game.id, metrics, durationMs, skipped };
    const all = [...gameResults, next];
    setGameResults(all);
    if (gameIndex + 1 >= GAMES.length) startAnalysis(all);
    else setGameIndex((i) => i + 1);
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-4xl mx-auto" dir="rtl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--damij-primary))] mb-2">
          تشخيص نوع التوحد
        </h1>
        <p className="text-sm text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          أداة فحص أولي مبنية على إرشادات CDC و AAP و NICE و WHO، مع تقييم باللعب وتقرير ذكي.
        </p>
      </header>

      {step === 'intro' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <p className="text-sm text-amber-900 leading-relaxed">{SCREENING_DISCLAIMER_AR}</p>
          </div>

          <div className="bg-[hsl(var(--damij-surface))] rounded-2xl p-6 border border-[hsl(var(--damij-primary))]/10 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">من يجيب على الأسئلة؟</label>
              <div className="flex gap-3">
                {(['caregiver', 'self'] as const).map((r) => (
                  <button key={r} onClick={() => setRespondent(r)}
                    className={`px-5 py-2 rounded-xl border-2 font-semibold transition ${
                      respondent === r ? 'bg-[hsl(var(--damij-accent-2))] text-white border-[hsl(var(--damij-accent-2))]' : 'bg-white border-[hsl(var(--damij-primary))]/20'
                    }`}>
                    {r === 'caregiver' ? 'ولي أمر / مقدم رعاية' : 'تقييم ذاتي'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم (اختياري)</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">العمر (بالأشهر)</label>
              <input type="number" min={12} max={600} value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value || '0', 10))}
                className="w-32 px-4 py-2 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white" />
              <p className="text-xs text-[hsl(var(--damij-text))]/60 mt-2">
                المسار المختار: <strong>
                  {track === 'toddler' ? 'صغار (16–36 شهر)' : track === 'child' ? 'أطفال (3–11 سنة)' : 'مراهقون / بالغون'}
                </strong>
              </p>
            </div>
          </div>

          <button onClick={() => setStep('path')}
            className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg">
            البدء بالتقييم <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'path' && (
        <div className="space-y-4">
          <p className="text-center text-[hsl(var(--damij-text))]/70 mb-4">اختر طريقة التقييم:</p>
          {([
            { id: 'questionnaire', icon: ClipboardList, title: 'تقييم بالأسئلة', desc: `استبيان ${items.length} سؤال — حوالي 5 دقائق.` },
            { id: 'games', icon: Gamepad2, title: 'تقييم باللعب', desc: '6 ألعاب تفاعلية تقيس الانتباه والتواصل والحس.' },
            { id: 'both', icon: Sparkles, title: 'تقييم شامل (موصى به)', desc: 'الأسئلة + الألعاب لأدق نتيجة.' },
          ] as const).map((p) => (
            <button key={p.id} onClick={() => setPath(p.id)}
              className={`w-full p-5 rounded-2xl border-2 transition flex items-center gap-4 text-right ${
                path === p.id ? 'border-[hsl(var(--damij-accent-2))] bg-[hsl(var(--damij-accent-2))]/5' : 'border-[hsl(var(--damij-primary))]/15 bg-white'
              }`}>
              <p.icon className="w-8 h-8 text-[hsl(var(--damij-accent-2))]" />
              <div className="flex-1">
                <div className="font-bold text-[hsl(var(--damij-primary))]">{p.title}</div>
                <div className="text-sm text-[hsl(var(--damij-text))]/70">{p.desc}</div>
              </div>
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('intro')}
              className="px-5 py-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 font-semibold flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={() => setStep(path === 'games' ? 'games' : 'questionnaire')}
              className="flex-1 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold">
              متابعة
            </button>
          </div>
        </div>
      )}

      {step === 'questionnaire' && currentItem && (
        <div className="space-y-5">
          <div className="flex justify-between text-sm text-[hsl(var(--damij-text))]/60">
            <span>السؤال {qIndex + 1} من {items.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--damij-primary))]/10">
              {currentItem.domain === 'social_communication' ? 'تواصل اجتماعي'
                : currentItem.domain === 'restricted_repetitive' ? 'سلوك مقيّد'
                : currentItem.domain === 'sensory' ? 'حسي'
                : currentItem.domain === 'language' ? 'لغة' : 'لعب'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--damij-primary))]/10 overflow-hidden">
            <div className="h-full bg-[hsl(var(--damij-accent-2))] transition-all"
              style={{ width: `${((qIndex + 1) / items.length) * 100}%` }} />
          </div>
          <div className="bg-[hsl(var(--damij-surface))] rounded-2xl p-6 border border-[hsl(var(--damij-primary))]/10">
            <p className="text-lg font-semibold text-[hsl(var(--damij-primary))] mb-5 leading-relaxed">
              {currentItem.text}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentItem.scale === 'yesno'
                ? (Object.entries(ANSWER_LABELS_YESNO) as [AnswerValue, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => {
                    const newAns = { ...answers, [currentItem.id]: v };
                    setAnswers(newAns);
                    if (qIndex + 1 < items.length) setQIndex(qIndex + 1);
                    else onQuestionnaireDone();
                  }}
                    className={`px-4 py-3 rounded-xl font-semibold border-2 transition ${
                      answers[currentItem.id] === v
                        ? 'bg-[hsl(var(--damij-accent-2))] text-white border-[hsl(var(--damij-accent-2))]'
                        : 'bg-white border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/5'
                    }`}>{l}</button>
                ))
                : (Object.entries(ANSWER_LABELS_4PT) as [AnswerValue, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => {
                    const newAns = { ...answers, [currentItem.id]: v };
                    setAnswers(newAns);
                    if (qIndex + 1 < items.length) setQIndex(qIndex + 1);
                    else onQuestionnaireDone();
                  }}
                    className={`px-4 py-3 rounded-xl font-semibold border-2 transition ${
                      answers[currentItem.id] === v
                        ? 'bg-[hsl(var(--damij-accent-2))] text-white border-[hsl(var(--damij-accent-2))]'
                        : 'bg-white border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/5'
                    }`}>{l}</button>
                ))
              }
            </div>
          </div>
          <div className="flex justify-between">
            <button disabled={qIndex === 0} onClick={() => setQIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-lg border border-[hsl(var(--damij-primary))]/20 disabled:opacity-30">
              السؤال السابق
            </button>
            <button onClick={onQuestionnaireDone}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white font-semibold">
              {path === 'questionnaire' ? 'إنهاء وتحليل' : 'الانتقال للألعاب'}
            </button>
          </div>
        </div>
      )}

      {step === 'games' && (() => {
        const game = GAMES[gameIndex];
        const Cmp = GAME_COMPONENTS[game.id];
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[hsl(var(--damij-text))]/60">
                لعبة {gameIndex + 1} من {GAMES.length} — {game.title}
              </span>
              <div className="h-2 w-32 rounded-full bg-[hsl(var(--damij-primary))]/10 overflow-hidden">
                <div className="h-full bg-[hsl(var(--damij-accent-2))]"
                  style={{ width: `${((gameIndex + 1) / GAMES.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-[hsl(var(--damij-surface))] rounded-3xl p-4 border border-[hsl(var(--damij-primary))]/10">
              <Cmp
                key={game.id}
                onComplete={(m: Record<string, number>, d: number) => handleGameComplete(m, d, false)}
                onSkip={() => handleGameComplete({}, 0, true)}
              />
            </div>
          </div>
        );
      })()}

      {step === 'analyzing' && (
        <div className="text-center py-20 space-y-5">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-[hsl(var(--damij-accent-2))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">جاري تحليل النتائج...</h2>
          <p className="text-[hsl(var(--damij-text))]/70 max-w-md mx-auto">
            يقوم الذكاء الاصطناعي بمراجعة الإجابات والملاحظات السلوكية وفق إرشادات CDC و AAP و NICE و WHO.
          </p>
          <ul className="text-xs text-[hsl(var(--damij-text))]/60 space-y-1 max-w-md mx-auto">
            {AUTISM_SOURCES.slice(0, 4).map((s) => (
              <li key={s.url}>• [{s.org}] {s.title}</li>
            ))}
          </ul>
        </div>
      )}

      {step === 'report' && report && <ReportView report={report} onReset={reset} />}
    </div>
  );
};

export default AutismDiagnosis;
