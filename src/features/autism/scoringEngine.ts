// Local pre-AI scoring. Cutoffs are conservative defaults derived from
// open instrumentation (M-CHAT-R) and DSM-5 domain rollups.
// All numeric thresholds are screening heuristics, NOT diagnostic.

import {
  AgeTrack,
  Domain,
  ScreeningItem,
  getItemsForTrack,
} from './screeningItems';

export type AnswerValue = 'yes' | 'no' | 'rarely' | 'sometimes' | 'often' | 'always';

export interface QuestionnaireResult {
  ageTrack: AgeTrack;
  totalScore: number;
  maxScore: number;
  criticalFails: number;
  domainScores: Record<Domain, { score: number; max: number; pct: number }>;
  riskBand: 'low' | 'monitor' | 'refer';
  answers: { itemId: string; answer: AnswerValue; isRisk: boolean; critical: boolean }[];
}

const DOMAINS: Domain[] = [
  'social_communication',
  'restricted_repetitive',
  'sensory',
  'language',
  'play',
];

function isRiskAnswer(item: ScreeningItem, answer: AnswerValue): boolean {
  if (item.scale === 'yesno') {
    return answer === item.riskAnswer;
  }
  // 4pt scale: risk if answer matches direction
  if (item.riskAnswer === 'often') return answer === 'often' || answer === 'always';
  if (item.riskAnswer === 'rarely') return answer === 'rarely' || answer === 'sometimes';
  return false;
}

export function scoreQuestionnaire(
  ageTrack: AgeTrack,
  rawAnswers: Record<string, AnswerValue>,
): QuestionnaireResult {
  const items = getItemsForTrack(ageTrack);
  const answers: QuestionnaireResult['answers'] = [];
  const domainScores = Object.fromEntries(
    DOMAINS.map((d) => [d, { score: 0, max: 0, pct: 0 }]),
  ) as QuestionnaireResult['domainScores'];

  let total = 0;
  let max = 0;
  let criticalFails = 0;

  for (const item of items) {
    const ans = rawAnswers[item.id];
    const weight = item.critical ? 2 : 1;
    max += weight;
    domainScores[item.domain].max += weight;
    if (!ans) {
      answers.push({ itemId: item.id, answer: 'sometimes' as AnswerValue, isRisk: false, critical: !!item.critical });
      continue;
    }
    const risk = isRiskAnswer(item, ans);
    if (risk) {
      total += weight;
      domainScores[item.domain].score += weight;
      if (item.critical) criticalFails += 1;
    }
    answers.push({ itemId: item.id, answer: ans, isRisk: risk, critical: !!item.critical });
  }

  for (const d of DOMAINS) {
    const ds = domainScores[d];
    ds.pct = ds.max > 0 ? Math.round((ds.score / ds.max) * 100) : 0;
  }

  const pct = max > 0 ? total / max : 0;
  let riskBand: QuestionnaireResult['riskBand'] = 'low';
  if (ageTrack === 'toddler') {
    // M-CHAT-R style: ≥3 = monitor, ≥8 OR ≥2 critical = refer
    if (total >= 8 || criticalFails >= 2) riskBand = 'refer';
    else if (total >= 3 || criticalFails >= 1) riskBand = 'monitor';
  } else {
    if (pct >= 0.55 || criticalFails >= 2) riskBand = 'refer';
    else if (pct >= 0.3) riskBand = 'monitor';
  }

  return { ageTrack, totalScore: total, maxScore: max, criticalFails, domainScores, riskBand, answers };
}

// ---- Game metric normalization ----

export interface GameResult {
  gameId: string;
  metrics: Record<string, number>;
  durationMs: number;
  skipped?: boolean;
}

export interface GameInsight {
  gameId: string;
  label: string;
  metricSummary: string;
  concernLevel: 'low' | 'medium' | 'high' | 'na';
  notes: string;
}

const GAME_LABELS: Record<string, string> = {
  response_to_name: 'الاستجابة للاسم',
  joint_attention: 'الانتباه المشترك',
  pattern_vs_social: 'تفضيل الأنماط مقابل الوجوه',
  repetitive_match: 'الميل للتكرار',
  emotion_recognition: 'تمييز المشاعر',
  sensory_tolerance: 'الاحتمال الحسي',
};

export function summarizeGames(results: GameResult[]): GameInsight[] {
  return results.map((r) => {
    const label = GAME_LABELS[r.gameId] ?? r.gameId;
    if (r.skipped) {
      return { gameId: r.gameId, label, metricSummary: 'تم تخطيها', concernLevel: 'na', notes: '' };
    }
    switch (r.gameId) {
      case 'response_to_name': {
        const missRate = r.metrics.missRate ?? 0;
        const avgRt = r.metrics.avgResponseMs ?? 0;
        const concern = missRate > 0.5 ? 'high' : missRate > 0.25 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `نسبة عدم الاستجابة: ${Math.round(missRate * 100)}% — متوسط زمن الرد: ${Math.round(avgRt)} مللي ثانية`,
          concernLevel: concern,
          notes: 'انخفاض الاستجابة للاسم من العلامات المبكرة المعروفة وفق CDC.',
        };
      }
      case 'joint_attention': {
        const acc = r.metrics.accuracy ?? 0;
        const concern = acc < 0.5 ? 'high' : acc < 0.75 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `دقة متابعة النظر: ${Math.round(acc * 100)}%`,
          concernLevel: concern,
          notes: 'متابعة نظر الآخرين علامة جوهرية للتواصل الاجتماعي.',
        };
      }
      case 'pattern_vs_social': {
        const ratio = r.metrics.patternDwellRatio ?? 0.5;
        const concern = ratio > 0.7 ? 'high' : ratio > 0.55 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `نسبة تفضيل الأنماط: ${Math.round(ratio * 100)}%`,
          concernLevel: concern,
          notes: 'التفضيل الواضح للأنماط الهندسية على الوجوه يستحق المتابعة.',
        };
      }
      case 'repetitive_match': {
        const persistence = r.metrics.repetitionPersistence ?? 0;
        const concern = persistence > 0.6 ? 'high' : persistence > 0.35 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `الإصرار على التكرار بعد تغيير القاعدة: ${Math.round(persistence * 100)}%`,
          concernLevel: concern,
          notes: 'قد يعكس صعوبة في المرونة المعرفية والروتين.',
        };
      }
      case 'emotion_recognition': {
        const acc = r.metrics.accuracy ?? 0;
        const concern = acc < 0.4 ? 'high' : acc < 0.65 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `دقة تمييز المشاعر: ${Math.round(acc * 100)}%`,
          concernLevel: concern,
          notes: 'صعوبة قراءة الانفعالات شائعة في طيف التوحد.',
        };
      }
      case 'sensory_tolerance': {
        const threshold = r.metrics.thresholdLevel ?? 5;
        const concern = threshold <= 2 ? 'high' : threshold <= 4 ? 'medium' : 'low';
        return {
          gameId: r.gameId,
          label,
          metricSummary: `مستوى الاحتمال الحسي: ${threshold}/10`,
          concernLevel: concern,
          notes: 'حساسية حسية مرتفعة قد تستدعي تقييماً متخصصاً.',
        };
      }
      default:
        return { gameId: r.gameId, label, metricSummary: '', concernLevel: 'na', notes: '' };
    }
  });
}
