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
  // Behavioural feature breakdown surfaced to the AI for finer DSM-5 alignment.
  features?: Record<string, number>;
  // Mapping into DSM-5 sub-dimensions: A.social_communication, B.restricted_repetitive, sensory.
  dsm_contributions?: { social: number; rrb: number; sensory: number };
}

const GAME_LABELS: Record<string, string> = {
  response_to_name: 'الاستجابة للاسم',
  joint_attention: 'الانتباه المشترك',
  pattern_vs_social: 'تفضيل الأنماط مقابل الوجوه',
  repetitive_match: 'الميل للتكرار',
  emotion_recognition: 'تمييز المشاعر',
  sensory_tolerance: 'الاحتمال الحسي',
};

function level(x: number, mid: number, high: number): 'low' | 'medium' | 'high' {
  if (x >= high) return 'high';
  if (x >= mid) return 'medium';
  return 'low';
}

export function summarizeGames(results: GameResult[]): GameInsight[] {
  return results.map((r) => {
    const label = GAME_LABELS[r.gameId] ?? r.gameId;
    if (r.skipped) {
      return { gameId: r.gameId, label, metricSummary: 'تم تخطيها', concernLevel: 'na', notes: '' };
    }
    const m = r.metrics || {};
    switch (r.gameId) {
      case 'response_to_name': {
        const missRate = m.missRate ?? 0;
        const avgRt = m.avgResponseMs ?? 0;
        const concern = level(missRate, 0.25, 0.5);
        return {
          gameId: r.gameId, label,
          metricSummary: `نسبة عدم الاستجابة: ${Math.round(missRate * 100)}% — متوسط زمن الرد: ${Math.round(avgRt)}ms`,
          concernLevel: concern,
          notes: 'انخفاض الاستجابة للاسم من العلامات المبكرة المعروفة وفق CDC.',
          features: { missRate, avgResponseMs: avgRt, rtVariance: m.rtVariance ?? 0 },
          dsm_contributions: { social: missRate * 0.9, rrb: 0, sensory: 0 },
        };
      }
      case 'joint_attention': {
        const acc = m.accuracy ?? 0;
        const concern = level(1 - acc, 0.25, 0.5);
        return {
          gameId: r.gameId, label,
          metricSummary: `دقة متابعة النظر: ${Math.round(acc * 100)}%`,
          concernLevel: concern,
          notes: 'متابعة نظر الآخرين علامة جوهرية للتواصل الاجتماعي.',
          features: { accuracy: acc, latencyMs: m.avgLatencyMs ?? 0 },
          dsm_contributions: { social: (1 - acc) * 0.9, rrb: 0, sensory: 0 },
        };
      }
      case 'pattern_vs_social': {
        const ratio = m.patternDwellRatio ?? 0.5;
        const concern = level(ratio - 0.5, 0.05, 0.2);
        return {
          gameId: r.gameId, label,
          metricSummary: `تفضيل الأنماط على الوجوه: ${Math.round(ratio * 100)}%`,
          concernLevel: concern,
          notes: 'التفضيل الواضح للأنماط الهندسية على الوجوه يستحق المتابعة.',
          features: { patternDwellRatio: ratio },
          dsm_contributions: { social: Math.max(0, ratio - 0.5), rrb: Math.max(0, ratio - 0.6) * 0.5, sensory: 0 },
        };
      }
      case 'repetitive_match': {
        const persistence = m.repetitionPersistence ?? 0;
        const switches = m.ruleSwitchAccuracy ?? 1;
        const concern = level(persistence, 0.35, 0.6);
        return {
          gameId: r.gameId, label,
          metricSummary: `الإصرار على القاعدة القديمة: ${Math.round(persistence * 100)}% — دقة التبديل: ${Math.round(switches * 100)}%`,
          concernLevel: concern,
          notes: 'قد يعكس صعوبة في المرونة المعرفية والروتين (السلوك المتكرر).',
          features: { repetitionPersistence: persistence, ruleSwitchAccuracy: switches },
          dsm_contributions: { social: 0, rrb: persistence, sensory: 0 },
        };
      }
      case 'emotion_recognition': {
        const acc = m.accuracy ?? 0;
        const concern = level(1 - acc, 0.35, 0.6);
        return {
          gameId: r.gameId, label,
          metricSummary: `دقة تمييز المشاعر: ${Math.round(acc * 100)}%`,
          concernLevel: concern,
          notes: 'صعوبة قراءة الانفعالات شائعة في طيف التوحد.',
          features: { accuracy: acc },
          dsm_contributions: { social: (1 - acc) * 0.85, rrb: 0, sensory: 0 },
        };
      }
      case 'sensory_tolerance': {
        const threshold = m.thresholdLevel ?? 5;
        const concern = level(10 - threshold, 6, 8);
        return {
          gameId: r.gameId, label,
          metricSummary: `مستوى الاحتمال الحسي: ${threshold}/10`,
          concernLevel: concern,
          notes: 'حساسية حسية مرتفعة قد تستدعي تقييماً متخصصاً.',
          features: { thresholdLevel: threshold },
          dsm_contributions: { social: 0, rrb: 0, sensory: (10 - threshold) / 10 },
        };
      }
      default:
        return { gameId: r.gameId, label, metricSummary: '', concernLevel: 'na', notes: '' };
    }
  });
}

// Aggregates DSM-5 dimension scores from questionnaire + games into one struct.
export interface DsmRollup {
  social_communication: { score: number; confidence: number; evidence: string[] };
  restricted_repetitive: { score: number; confidence: number; evidence: string[] };
  sensory: { score: number; confidence: number; evidence: string[] };
  overall_severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  estimated_support_level: 1 | 2 | 3;
}

export function rollupDsm(qr: QuestionnaireResult | null, insights: GameInsight[]): DsmRollup {
  const ds = qr?.domainScores;
  // Questionnaire contributions (0-1 scale)
  const qSocial = (ds?.social_communication?.pct ?? 0) / 100;
  const qLang = (ds?.language?.pct ?? 0) / 100;
  const qPlay = (ds?.play?.pct ?? 0) / 100;
  const qRrb = (ds?.restricted_repetitive?.pct ?? 0) / 100;
  const qSensory = (ds?.sensory?.pct ?? 0) / 100;

  // Game contributions
  const gSocial = avg(insights.map(i => i.dsm_contributions?.social).filter(isFinite) as number[]);
  const gRrb = avg(insights.map(i => i.dsm_contributions?.rrb).filter(isFinite) as number[]);
  const gSensory = avg(insights.map(i => i.dsm_contributions?.sensory).filter(isFinite) as number[]);

  const social = clamp01((qSocial * 0.5 + qLang * 0.2 + qPlay * 0.1 + gSocial * 0.2));
  const rrb = clamp01((qRrb * 0.65 + gRrb * 0.35));
  const sensory = clamp01((qSensory * 0.7 + gSensory * 0.3));

  const evSocial: string[] = [];
  if (qSocial > 0.4) evSocial.push(`الاستبيان يُظهر ${Math.round(qSocial * 100)}% مؤشرات في التواصل الاجتماعي.`);
  if (gSocial > 0.3) evSocial.push('الألعاب الاجتماعية أظهرت ضعفاً في الاستجابة/الانتباه المشترك/تمييز المشاعر.');

  const evRrb: string[] = [];
  if (qRrb > 0.4) evRrb.push(`الاستبيان يُظهر ${Math.round(qRrb * 100)}% مؤشرات للسلوك المقيّد والمتكرر.`);
  if (gRrb > 0.3) evRrb.push('لعبة المرونة كشفت إصراراً على القاعدة القديمة بعد التغيير.');

  const evSensory: string[] = [];
  if (qSensory > 0.4) evSensory.push(`الاستبيان يُظهر ${Math.round(qSensory * 100)}% مؤشرات حسية.`);
  if (gSensory > 0.3) evSensory.push('لعبة التحمّل الحسي أظهرت عتبة تحمّل منخفضة.');

  const max = Math.max(social, rrb, sensory);
  const overall_severity: DsmRollup['overall_severity'] =
    max >= 0.7 ? 'severe' : max >= 0.5 ? 'moderate' : max >= 0.3 ? 'mild' : 'minimal';
  const estimated_support_level: 1 | 2 | 3 = max >= 0.7 ? 3 : max >= 0.45 ? 2 : 1;

  // Confidence: more evidence (questionnaire + games) → higher confidence.
  const conf = (q: number, g: number) => clamp01(0.4 + (q > 0 ? 0.3 : 0) + (g > 0 ? 0.3 : 0));

  return {
    social_communication: {
      score: Math.round(social * 100),
      confidence: Math.round(conf(qSocial, gSocial) * 100),
      evidence: evSocial,
    },
    restricted_repetitive: {
      score: Math.round(rrb * 100),
      confidence: Math.round(conf(qRrb, gRrb) * 100),
      evidence: evRrb,
    },
    sensory: {
      score: Math.round(sensory * 100),
      confidence: Math.round(conf(qSensory, gSensory) * 100),
      evidence: evSensory,
    },
    overall_severity,
    estimated_support_level,
  };
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function isFinite(x: any): x is number { return typeof x === 'number' && Number.isFinite(x); }

