// Lightweight "discovery profile" derived from either the parent questionnaire
// or short discovery games. Fed into autism-generate-diagnostic-games to
// personalize the diagnostic battery (themes, difficulty, durations).

import { AnswerValue, GameResult, scoreQuestionnaire, summarizeGames } from './scoringEngine';

export type DiscoverySource = 'questionnaire' | 'games';

export interface DiscoveryProfile {
  source: DiscoverySource;
  // 0..1 rough estimate of how socially engaged the child appears
  social_score: number;
  // 0..1 average accuracy in any short tasks performed
  accuracy: number;
  // ms — average response time when measurable, else null
  avg_response_ms: number | null;
  // attention proxy in seconds (sustained engagement on any game), null if unknown
  attention_span_sec: number | null;
  // Hints for AI to weave into game themes (e.g. "animals", "vehicles", "shapes")
  preferred_themes: string[];
  // Free-form Arabic notes the AI can use as flavor
  notes_ar: string[];
}

export const profileFromQuestionnaire = (
  track: 'toddler' | 'child' | 'adolescent',
  answers: Record<string, AnswerValue>,
): DiscoveryProfile => {
  const qr = scoreQuestionnaire(track, answers);
  const sc = qr.domainScores?.social_communication?.pct ?? 0.5;
  // Higher domain "pct" generally means MORE concern; invert for "social engagement".
  const social = Math.max(0, Math.min(1, 1 - sc));
  return {
    source: 'questionnaire',
    social_score: social,
    accuracy: 0.5,
    avg_response_ms: null,
    attention_span_sec: null,
    preferred_themes: [],
    notes_ar: [
      qr.riskBand === 'refer' ? 'مؤشرات أولية متعددة من الاستبيان' :
      qr.riskBand === 'monitor' ? 'مؤشرات أولية متوسطة من الاستبيان' :
      'مؤشرات أولية منخفضة من الاستبيان',
    ],
  };
};

export const profileFromDiscoveryGames = (results: GameResult[]): DiscoveryProfile => {
  const valid = results.filter(r => !r.skipped);
  const acc = valid.length
    ? valid.reduce((s, r) => s + (Number(r.metrics?.accuracy) || 0), 0) / valid.length
    : 0;
  const durs = valid.map(r => r.durationMs).filter(d => d > 0);
  const avgMs = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;
  const attention = durs.length ? Math.round(Math.max(...durs) / 1000) : null;
  const insights = summarizeGames(valid);
  const themes = Array.from(new Set(
    insights
      .filter(i => i.concernLevel === 'low')
      .map(i => i.label)
  )).slice(0, 4);
  return {
    source: 'games',
    social_score: Math.max(0, Math.min(1, acc)),
    accuracy: acc,
    avg_response_ms: avgMs,
    attention_span_sec: attention,
    preferred_themes: themes,
    notes_ar: insights.slice(0, 3).map(i => `${i.label}: ${i.metricSummary}`),
  };
};
