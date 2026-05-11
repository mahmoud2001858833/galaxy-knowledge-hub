import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ClipboardList, Gamepad2, Sparkles, Loader2, ShieldAlert, Wand2, Brain, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAutismAdaptive } from '@/features/autism/ui/AutismAgeAdaptive';
import SensoryModeToggle from '@/features/autism/ui/SensoryModeToggle';
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
  rollupDsm,
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
import { TEMPLATE_REGISTRY, TEMPLATE_META } from '@/features/autism/games/templates/registry';

type Step = 'intro' | 'path' | 'questionnaire' | 'games' | 'ai_games' | 'analyzing' | 'report';
type Path = 'questionnaire' | 'games' | 'ai_games' | 'both';

interface AIGame {
  template_id: string;
  title_ar: string;
  instructions_ar: string;
  target_skill_ar: string;
  rationale_ar: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_sec: number;
  adaptations_ar?: string[];
}

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
  const navigate = useNavigate();
  const { isYoung, baseTextClass, reduceMotion } = useAutismAdaptive();
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [ageMonths, setAgeMonths] = useState(36);
  const [respondent, setRespondent] = useState<'caregiver' | 'self'>('caregiver');
  const [path, setPath] = useState<Path>('both');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [qIndex, setQIndex] = useState(0);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [aiGames, setAiGames] = useState<AIGame[]>([]);
  const [aiGameIndex, setAiGameIndex] = useState(0);
  const [aiGamesLoading, setAiGamesLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string>('');
  const [report, setReport] = useState<AIReport | null>(null);

  const track = useMemo(() => inferTrack(ageMonths), [ageMonths]);
  const items = useMemo(() => getItemsForTrack(track), [track]);
  const currentItem = items[qIndex];

  const reset = () => {
    setStep('intro'); setAnswers({}); setQIndex(0); setGameIndex(0); setGameResults([]);
    setAiGames([]); setAiGameIndex(0); setAiStrategy(''); setReport(null);
  };

  const startAiGames = async (afterClassicGames: GameResult[]) => {
    setAiGamesLoading(true);
    setStep('ai_games');
    try {
      const qr = path !== 'games' && path !== 'ai_games' ? scoreQuestionnaire(track, answers) : null;
      const { data, error } = await supabase.functions.invoke('autism-generate-diagnostic-games', {
        body: {
          ageMonths, ageTrack: track, respondent, name: name || undefined,
          questionnaireResult: qr,
        },
      });
      if (error) throw error;
      const games: AIGame[] = (data?.games || []).filter((g: any) => TEMPLATE_REGISTRY[g.template_id]);
      if (!games.length) throw new Error('No personalized games returned');
      setAiGames(games);
      setAiStrategy(data?.overall_strategy_ar || '');
      setAiGameIndex(0);
      // Keep classic results for later analysis
      setGameResults(afterClassicGames);
    } catch (e: any) {
      console.warn('AI diagnostic games failed, skipping:', e);
      toast.warning('تعذّر توليد ألعاب التشخيص الذكية — سيتم الانتقال للتحليل.');
      startAnalysis(afterClassicGames);
    } finally {
      setAiGamesLoading(false);
    }
  };

  const handleAiGameComplete = (metrics: { accuracy: number; raw?: any }, durationMs: number, skipped = false) => {
    const g = aiGames[aiGameIndex];
    const next: GameResult = {
      gameId: `ai_${g.template_id}`,
      metrics: { accuracy: metrics.accuracy, ...(metrics.raw || {}) },
      durationMs,
      skipped,
    };
    const all = [...gameResults, next];
    setGameResults(all);
    if (aiGameIndex + 1 >= aiGames.length) startAnalysis(all);
    else setAiGameIndex((i) => i + 1);
  };


  const buildLocalReport = (
    qr: ReturnType<typeof scoreQuestionnaire> | null,
    insights: ReturnType<typeof summarizeGames>,
  ): AIReport => {
    const ds = qr?.domainScores;
    const flags: string[] = [];
    const obs: string[] = [];
    insights.forEach((i) => {
      if (i.concernLevel === 'high') flags.push(`${i.label}: ${i.metricSummary}`);
      else if (i.concernLevel !== 'na') obs.push(`${i.label}: ${i.metricSummary}`);
    });
    const band = qr?.riskBand ?? (flags.length >= 2 ? 'refer' : flags.length >= 1 ? 'monitor' : 'low');
    const summary =
      band === 'refer'
        ? 'النتائج الأولية تُظهر مؤشرات متعددة تستحق تقييماً متخصصاً من فريق نمائي مختص.'
        : band === 'monitor'
        ? 'هناك بعض المؤشرات التي تستدعي المتابعة الدورية وملاحظة التطور.'
        : 'المؤشرات منخفضة بشكل عام؛ يُنصح بمتابعة معالم النمو الطبيعية.';
    return {
      risk_band: band,
      summary_ar: summary + ' (تقرير محلي — تعذّر الاتصال بالذكاء الاصطناعي.)',
      domain_scores: {
        social_communication: ds?.social_communication?.pct ?? 0,
        restricted_repetitive: ds?.restricted_repetitive?.pct ?? 0,
        sensory: ds?.sensory?.pct ?? 0,
        language: ds?.language?.pct ?? 0,
        play: ds?.play?.pct ?? 0,
      },
      observations: obs.length ? obs : ['تم احتساب النتائج محلياً من الاستبيان والألعاب.'],
      red_flags: flags,
      strengths: insights.filter((i) => i.concernLevel === 'low').map((i) => i.label),
      recommendations: [
        'مراجعة طبيب الأطفال لمناقشة النتائج.',
        'متابعة معالم النمو وفق إرشادات CDC.',
        band !== 'low' ? 'طلب تقييم متخصص (نمائي/سلوكي).' : 'إعادة الفحص بعد عدة أشهر إذا ظهرت ملاحظات.',
      ],
      next_steps: [
        'حفظ/طباعة التقرير ومشاركته مع المختص.',
        'تسجيل ملاحظات يومية لمدة أسبوعين.',
      ],
      citations: AUTISM_SOURCES.slice(0, 4).map((s) => ({ title: `[${s.org}] ${s.title}`, url: s.url })),
    };
  };

  const persistProfile = async (rep: AIReport) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileData: any = {
        child_name: name || 'طفل',
        age_years: Math.round(ageMonths / 12),
        age_track: track,
        support_level: (rep as any).support_level ?? null,
        functional_profile: (rep as any).functional_profile ?? null,
        cognitive_profile: (rep as any).cognitive_profile ?? null,
        last_report: rep as any,
      };
      let profileId: string | null = null;
      if (user) {
        const { data } = await supabase.from('autism_child_profiles')
          .insert({ ...profileData, user_id: user.id })
          .select('id').single();
        profileId = data?.id ?? null;
      }
      localStorage.setItem('autism_active_profile', JSON.stringify({
        profile_id: profileId,
        child_name: profileData.child_name,
        age_years: profileData.age_years,
        support_level: profileData.support_level,
        functional_profile: profileData.functional_profile,
        cognitive_profile: profileData.cognitive_profile,
        recommended_game_tracks: (rep as any).recommended_game_tracks ?? [],
        notes_summary: rep.summary_ar,
      }));
    } catch (e) { console.warn('persistProfile failed', e); }
  };

  const startAnalysis = async (finalGames: GameResult[]) => {
    setStep('analyzing');
    const questionnaireResult =
      path !== 'games' ? scoreQuestionnaire(track, answers) : null;
    const gameInsights = path !== 'questionnaire' ? summarizeGames(finalGames) : [];
    const dsmRollup = rollupDsm(questionnaireResult, gameInsights);

    try {
      const { data, error } = await supabase.functions.invoke('autism-screen-analyze', {
        body: {
          ageTrack: track,
          demographics: { ageMonths, respondent, name: name || undefined },
          questionnaireResult,
          gameInsights,
          dsmRollup,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.report) throw new Error('Empty report');
      setReport(data.report);
      await persistProfile(data.report);
      setStep('report');
    } catch (e: any) {
      console.error('AI report failed, using local fallback:', e);
      const msg = e?.message ?? '';
      if (msg.includes('429')) toast.warning('الخدمة مشغولة — تم إنشاء تقرير محلي.');
      else if (msg.includes('402')) toast.warning('انتهى رصيد AI — تم إنشاء تقرير محلي.');
      else toast.warning('تعذّر الاتصال بالذكاء الاصطناعي — تم إنشاء تقرير محلي.');
      const local = buildLocalReport(questionnaireResult, gameInsights);
      setReport(local);
      await persistProfile(local);
      setStep('report');
    }
  };

  const onQuestionnaireDone = () => {
    if (path === 'questionnaire') startAnalysis([]);
    else if (path === 'ai_games') startAiGames([]);
    else { setStep('games'); setGameIndex(0); }
  };

  const handleGameComplete = (metrics: Record<string, number>, durationMs: number, skipped = false) => {
    const game = GAMES[gameIndex];
    const next: GameResult = { gameId: game.id, metrics, durationMs, skipped };
    const all = [...gameResults, next];
    setGameResults(all);
    if (gameIndex + 1 >= GAMES.length) {
      // Chain into AI-personalized games when path is `both`
      if (path === 'both') startAiGames(all);
      else startAnalysis(all);
    } else setGameIndex((i) => i + 1);
  };

  // Stepper definition
  const STEP_LABELS: { id: Step; label: string }[] = [
    { id: 'intro', label: 'البيانات' },
    { id: 'path', label: 'الطريقة' },
    { id: 'questionnaire', label: 'الأسئلة' },
    { id: 'games', label: 'الألعاب' },
    { id: 'ai_games', label: 'AI' },
    { id: 'report', label: 'التقرير' },
  ];
  const stepIndex = STEP_LABELS.findIndex(s => s.id === step);

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-4xl mx-auto" dir="rtl">
      <header className={`mb-6 text-center ${reduceMotion ? '' : 'animate-fade-in'}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/damij/autism')}
            className="text-xs text-[hsl(var(--autism-muted))] hover:text-[hsl(var(--autism-primary))] flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> رجوع
          </button>
          <SensoryModeToggle />
        </div>
        <div
          className={`mx-auto mb-4 w-16 h-16 rounded-3xl flex items-center justify-center ${reduceMotion ? '' : 'autism-float'}`}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--autism-primary)) 0%, hsl(var(--autism-accent)) 100%)',
            boxShadow: 'var(--autism-shadow-soft)',
          }}>
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className={`${isYoung ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-bold text-[hsl(var(--autism-text))] mb-2`}>
          التشخيص الذكي
        </h1>
        <p className={`${baseTextClass} text-[hsl(var(--autism-muted))] max-w-2xl mx-auto`}>
          منهجية DSM-5 + M-CHAT-R/F + تحليل سلوكي بالذكاء الاصطناعي.
        </p>

        {/* Stepper */}
        <div className="mt-5 flex items-center justify-center gap-1 overflow-x-auto pb-1">
          {STEP_LABELS.map((s, i) => {
            const done = stepIndex > i;
            const active = stepIndex === i;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                    done ? 'bg-[hsl(var(--autism-success))] text-white'
                    : active ? 'bg-[hsl(var(--autism-primary))] text-white ring-4 ring-[hsl(var(--autism-primary)/0.2)]'
                    : 'bg-white border border-[hsl(var(--autism-primary)/0.2)] text-[hsl(var(--autism-muted))]'
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] ${active ? 'text-[hsl(var(--autism-primary))] font-bold' : 'text-[hsl(var(--autism-muted))]'}`}>{s.label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 w-4 sm:w-8 rounded-full ${stepIndex > i ? 'bg-[hsl(var(--autism-success))]' : 'bg-[hsl(var(--autism-primary)/0.15)]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {step === 'intro' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <p className="text-sm text-amber-900 leading-relaxed">{SCREENING_DISCLAIMER_AR}</p>
          </div>

          <div className="bg-[hsl(var(--autism-surface))] rounded-2xl p-6 border border-[hsl(var(--autism-primary))]/10 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">من يجيب على الأسئلة؟</label>
              <div className="flex gap-3">
                {(['caregiver', 'self'] as const).map((r) => (
                  <button key={r} onClick={() => setRespondent(r)}
                    className={`px-5 py-2 rounded-xl border-2 font-semibold transition ${
                      respondent === r ? 'bg-[hsl(var(--autism-accent))] text-white border-[hsl(var(--autism-accent))]' : 'bg-white border-[hsl(var(--autism-primary))]/20'
                    }`}>
                    {r === 'caregiver' ? 'ولي أمر / مقدم رعاية' : 'تقييم ذاتي'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم (اختياري)</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--autism-primary))]/20 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">العمر (بالأشهر)</label>
              <input type="number" min={12} max={600} value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value || '0', 10))}
                className="w-32 px-4 py-2 rounded-xl border border-[hsl(var(--autism-primary))]/20 bg-white" />
              <p className="text-xs text-[hsl(var(--autism-text))]/60 mt-2">
                المسار المختار: <strong>
                  {track === 'toddler' ? 'صغار (16–36 شهر)' : track === 'child' ? 'أطفال (3–11 سنة)' : 'مراهقون / بالغون'}
                </strong>
              </p>
            </div>
          </div>

          <button onClick={() => setStep('path')}
            className="w-full py-4 rounded-2xl bg-[hsl(var(--autism-primary))] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg">
            البدء بالتقييم <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'path' && (
        <div className="space-y-4">
          <p className="text-center text-[hsl(var(--autism-text))]/70 mb-4">اختر طريقة التقييم:</p>
          {([
            { id: 'questionnaire', icon: ClipboardList, title: 'تقييم بالأسئلة', desc: `استبيان ${items.length} سؤال — حوالي 5 دقائق.` },
            { id: 'games', icon: Gamepad2, title: 'تقييم باللعب', desc: '6 ألعاب تفاعلية تقيس الانتباه والتواصل والحس.' },
            { id: 'ai_games', icon: Wand2, title: 'ألعاب تشخيصية مخصّصة بالـ AI ✨', desc: 'يولّد الذكاء الاصطناعي بطارية ألعاب فريدة لكل طفل (الطيف يختلف من حالة لأخرى).' },
            { id: 'both', icon: Sparkles, title: 'تقييم شامل (موصى به)', desc: 'الأسئلة + الألعاب الأساسية + الألعاب الذكية المخصّصة.' },
          ] as const).map((p) => (
            <button key={p.id} onClick={() => setPath(p.id)}
              className={`w-full p-5 rounded-2xl border-2 transition flex items-center gap-4 text-right ${
                path === p.id ? 'border-[hsl(var(--autism-accent))] bg-[hsl(var(--autism-accent))]/5' : 'border-[hsl(var(--autism-primary))]/15 bg-white'
              }`}>
              <p.icon className="w-8 h-8 text-[hsl(var(--autism-accent))]" />
              <div className="flex-1">
                <div className="font-bold text-[hsl(var(--autism-primary))]">{p.title}</div>
                <div className="text-sm text-[hsl(var(--autism-text))]/70">{p.desc}</div>
              </div>
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('intro')}
              className="px-5 py-3 rounded-xl border border-[hsl(var(--autism-primary))]/20 font-semibold flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={() => {
              if (path === 'games') setStep('games');
              else if (path === 'ai_games') startAiGames([]);
              else setStep('questionnaire');
            }}
              className="flex-1 py-3 rounded-xl bg-[hsl(var(--autism-primary))] text-white font-bold">
              متابعة
            </button>
          </div>
        </div>
      )}

      {step === 'questionnaire' && currentItem && (
        <div className="space-y-5">
          <div className="flex justify-between text-sm text-[hsl(var(--autism-text))]/60">
            <span>السؤال {qIndex + 1} من {items.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--autism-primary))]/10">
              {currentItem.domain === 'social_communication' ? 'تواصل اجتماعي'
                : currentItem.domain === 'restricted_repetitive' ? 'سلوك مقيّد'
                : currentItem.domain === 'sensory' ? 'حسي'
                : currentItem.domain === 'language' ? 'لغة' : 'لعب'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--autism-primary))]/10 overflow-hidden">
            <div className="h-full bg-[hsl(var(--autism-accent))] transition-all"
              style={{ width: `${((qIndex + 1) / items.length) * 100}%` }} />
          </div>
          <div className="bg-[hsl(var(--autism-surface))] rounded-2xl p-6 border border-[hsl(var(--autism-primary))]/10">
            <p className="text-lg font-semibold text-[hsl(var(--autism-primary))] mb-5 leading-relaxed">
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
                        ? 'bg-[hsl(var(--autism-accent))] text-white border-[hsl(var(--autism-accent))]'
                        : 'bg-white border-[hsl(var(--autism-primary))]/20 hover:bg-[hsl(var(--autism-primary))]/5'
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
                        ? 'bg-[hsl(var(--autism-accent))] text-white border-[hsl(var(--autism-accent))]'
                        : 'bg-white border-[hsl(var(--autism-primary))]/20 hover:bg-[hsl(var(--autism-primary))]/5'
                    }`}>{l}</button>
                ))
              }
            </div>
          </div>
          <div className="flex justify-between">
            <button disabled={qIndex === 0} onClick={() => setQIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-lg border border-[hsl(var(--autism-primary))]/20 disabled:opacity-30">
              السؤال السابق
            </button>
            <button onClick={onQuestionnaireDone}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--autism-primary))] text-white font-semibold">
              {path === 'questionnaire' ? 'إنهاء وتحليل' : path === 'ai_games' ? 'توليد ألعاب AI' : 'الانتقال للألعاب'}
            </button>
          </div>
        </div>
      )}

      {step === 'games' && (() => {
        const game = GAMES[gameIndex];
        if (!game) return null;
        const Cmp = GAME_COMPONENTS[game.id];
        if (!Cmp) {
          // skip unknown game
          setTimeout(() => handleGameComplete({}, 0, true), 0);
          return null;
        }
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[hsl(var(--autism-text))]/60">
                لعبة {gameIndex + 1} من {GAMES.length} — {game.title}
              </span>
              <div className="h-2 w-32 rounded-full bg-[hsl(var(--autism-primary))]/10 overflow-hidden">
                <div className="h-full bg-[hsl(var(--autism-accent))]"
                  style={{ width: `${((gameIndex + 1) / GAMES.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-[hsl(var(--autism-surface))] rounded-3xl p-4 border border-[hsl(var(--autism-primary))]/10">
              <Cmp
                key={game.id}
                onComplete={(m: Record<string, number>, d: number) => handleGameComplete(m, d, false)}
                onSkip={() => handleGameComplete({}, 0, true)}
              />
            </div>
          </div>
        );
      })()}

      {step === 'ai_games' && (() => {
        if (aiGamesLoading || !aiGames.length) {
          return (
            <div className="text-center py-20 space-y-5">
              <Wand2 className="w-14 h-14 mx-auto text-[hsl(var(--autism-accent))] animate-pulse" />
              <h2 className="text-xl font-bold text-[hsl(var(--autism-primary))]">يولّد الذكاء الاصطناعي ألعاب تشخيص مخصّصة لهذا الطفل…</h2>
              <p className="text-sm text-[hsl(var(--autism-text))]/70 max-w-md mx-auto">طيف التوحد يختلف من شخص لآخر، لذلك نُكيّف الألعاب حسب العمر والمؤشرات الأولية.</p>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--autism-accent))]" />
            </div>
          );
        }
        const g = aiGames[aiGameIndex];
        const Cmp = TEMPLATE_REGISTRY[g.template_id];
        const meta = TEMPLATE_META[g.template_id];
        if (!Cmp) {
          setTimeout(() => handleAiGameComplete({ accuracy: 0 }, 0, true), 0);
          return null;
        }
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[hsl(var(--autism-text))]/60">
                لعبة ذكية {aiGameIndex + 1} من {aiGames.length} — {meta?.emoji} {g.title_ar}
              </span>
              <div className="h-2 w-32 rounded-full bg-[hsl(var(--autism-primary))]/10 overflow-hidden">
                <div className="h-full bg-[hsl(var(--autism-accent))]"
                  style={{ width: `${((aiGameIndex + 1) / aiGames.length) * 100}%` }} />
              </div>
            </div>
            {aiStrategy && aiGameIndex === 0 && (
              <div className="text-xs p-3 rounded-xl bg-[hsl(var(--autism-accent))]/10 border border-[hsl(var(--autism-accent))]/30 text-[hsl(var(--autism-primary))]">
                ✨ <b>استراتيجية AI:</b> {aiStrategy}
              </div>
            )}
            <div className="text-xs p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              🎯 <b>الهدف:</b> {g.target_skill_ar} — {g.rationale_ar}
            </div>
            <div className="bg-[hsl(var(--autism-surface))] rounded-3xl p-4 border border-[hsl(var(--autism-primary))]/10">
              <Cmp
                key={`ai_${aiGameIndex}_${g.template_id}`}
                difficulty={g.difficulty}
                durationSec={g.duration_sec}
                instructions={g.instructions_ar}
                onComplete={(m, d) => handleAiGameComplete(m, d, false)}
                onSkip={() => handleAiGameComplete({ accuracy: 0 }, 0, true)}
              />
            </div>
          </div>
        );
      })()}

      {step === 'analyzing' && (
        <div className="text-center py-20 space-y-5">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-[hsl(var(--autism-accent))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--autism-primary))]">جاري تحليل النتائج...</h2>
          <p className="text-[hsl(var(--autism-text))]/70 max-w-md mx-auto">
            يقوم الذكاء الاصطناعي بمراجعة الإجابات والملاحظات السلوكية وفق إرشادات CDC و AAP و NICE و WHO.
          </p>
          <ul className="text-xs text-[hsl(var(--autism-text))]/60 space-y-1 max-w-md mx-auto">
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
