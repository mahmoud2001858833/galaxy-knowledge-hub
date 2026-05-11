import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AUTISM_SOURCES, SCREENING_DISCLAIMER_AR } from './sources';

export interface DsmDimension { score: number; confidence: number; evidence: string[]; clinical_note: string; }
export interface AIReport {
  risk_band: 'low' | 'monitor' | 'refer';
  support_level?: 1 | 2 | 3;
  functional_profile?: string;
  cognitive_profile?: string;
  confidence_score?: number;
  recommended_game_tracks?: string[];
  referral_priority?: 'immediate' | 'within_month' | 'monitor';
  summary_ar: string;
  domain_scores: {
    social_communication: number;
    restricted_repetitive: number;
    sensory: number;
    language: number;
    play: number;
  };
  dsm_dimensions?: {
    social_communication: DsmDimension;
    restricted_repetitive: DsmDimension;
    sensory: DsmDimension;
  };
  observations: string[];
  red_flags: string[];
  strengths: string[];
  recommendations: string[];
  parent_actions?: string[];
  next_steps: string[];
  citations: { title: string; url: string }[];
}

const PROFILE_LABEL: Record<string, string> = {
  social_communication: 'تواصلي–اجتماعي',
  sensory: 'حسي بارز',
  restricted_repetitive: 'سلوكي–تكراري',
  language: 'لغوي بارز',
  mixed: 'مختلط',
  high_functioning: 'عالي الأداء',
  moderate: 'متوسط',
  needs_substantial_support: 'يحتاج دعماً مكثفاً',
};

const BAND: Record<AIReport['risk_band'], { color: string; label: string; bg: string }> = {
  low: { color: '#16A34A', label: 'منخفض — مؤشرات قليلة', bg: 'bg-green-50' },
  monitor: { color: '#D97706', label: 'متوسط — يُنصح بالمتابعة', bg: 'bg-amber-50' },
  refer: { color: '#DC2626', label: 'مرتفع — يُنصح بتقييم متخصص', bg: 'bg-red-50' },
};

const DomainBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-semibold text-[hsl(var(--damij-text))]">{label}</span>
      <span className="text-[hsl(var(--damij-text))]/60">{score}%</span>
    </div>
    <div className="h-3 rounded-full bg-[hsl(var(--damij-primary))]/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${score}%`,
          background: score > 60 ? '#DC2626' : score > 30 ? '#D97706' : '#16A34A',
        }}
      />
    </div>
  </div>
);

const Section: React.FC<{ title: string; items: string[]; emoji?: string }> = ({ title, items, emoji }) => {
  if (!items?.length) return null;
  return (
    <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/10">
      <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">{emoji} {title}</h3>
      <ul className="space-y-2 text-sm text-[hsl(var(--damij-text))]/85 list-disc pr-5">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
};

const ReportView: React.FC<{ report: AIReport; onReset: () => void }> = ({ report, onReset }) => {
  const band = BAND[report.risk_band];
  const navigate = useNavigate();
  return (
    <div className="space-y-6 print:bg-white">
      <div className={`rounded-3xl p-8 ${band.bg} border-2`} style={{ borderColor: band.color }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-[hsl(var(--damij-text))]/60 mb-1">مستوى المؤشرات</p>
            <h2 className="text-3xl font-bold" style={{ color: band.color }}>{band.label}</h2>
          </div>
          <div className="flex gap-2 print:hidden flex-wrap">
            <button onClick={() => navigate('/damij/autism/therapy')}
              className="px-4 py-2 rounded-lg bg-gradient-to-l from-[hsl(var(--damij-accent-2))] to-[hsl(var(--damij-primary))] text-white font-semibold flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> ابدأ خطة العلاج التفاعلية
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-white border border-[hsl(var(--damij-primary))]/30 font-semibold">طباعة</button>
            <button onClick={onReset} className="px-4 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white font-semibold">تقييم جديد</button>
          </div>
        </div>
        <p className="mt-4 text-[hsl(var(--damij-text))]/85 leading-relaxed">{report.summary_ar}</p>

        {(report.support_level || report.functional_profile || report.cognitive_profile) && (
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {report.support_level && (
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">مستوى الدعم (DSM-5)</div>
                <div className="text-xl font-bold text-[hsl(var(--damij-primary))]">المستوى {report.support_level}</div>
              </div>
            )}
            {report.functional_profile && (
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">الملف الوظيفي</div>
                <div className="text-base font-bold text-[hsl(var(--damij-primary))]">{PROFILE_LABEL[report.functional_profile] ?? report.functional_profile}</div>
              </div>
            )}
            {report.cognitive_profile && (
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">الملف المعرفي</div>
                <div className="text-base font-bold text-[hsl(var(--damij-primary))]">{PROFILE_LABEL[report.cognitive_profile] ?? report.cognitive_profile}</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-white/70 text-xs text-[hsl(var(--damij-text))]/70 border border-[hsl(var(--damij-primary))]/10">
          ⚠️ {SCREENING_DISCLAIMER_AR}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[hsl(var(--damij-primary))]/10">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4">المؤشرات حسب المجال</h3>
        <div className="space-y-4">
          <DomainBar label="التواصل الاجتماعي" score={report.domain_scores.social_communication} />
          <DomainBar label="السلوك المقيّد والمتكرر" score={report.domain_scores.restricted_repetitive} />
          <DomainBar label="الحس / الاستجابة الحسية" score={report.domain_scores.sensory} />
          <DomainBar label="اللغة والتواصل اللفظي" score={report.domain_scores.language} />
          <DomainBar label="اللعب والخيال" score={report.domain_scores.play} />
        </div>
      </div>

      {report.dsm_dimensions && (
        <div className="bg-white rounded-2xl p-6 border border-[hsl(var(--damij-primary))]/10">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4">أبعاد DSM-5 مع الأدلة</h3>
          <div className="space-y-4">
            {([
              ['social_communication', 'التواصل الاجتماعي (A)'],
              ['restricted_repetitive', 'السلوك المقيّد والمتكرر (B)'],
              ['sensory', 'الحساسية الحسية'],
            ] as const).map(([k, label]) => {
              const d = report.dsm_dimensions![k];
              if (!d) return null;
              return (
                <div key={k} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[hsl(var(--damij-primary))]">{label}</div>
                    <div className="text-xs text-slate-500">ثقة {d.confidence}%</div>
                  </div>
                  <DomainBar label="الدرجة" score={d.score} />
                  {d.clinical_note && <p className="text-sm text-slate-700 mt-2">{d.clinical_note}</p>}
                  {d.evidence?.length > 0 && (
                    <ul className="list-disc pr-5 mt-2 text-xs text-slate-600 space-y-1">
                      {d.evidence.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="ملاحظات سلوكية" items={report.observations} emoji="🔍" />
        <Section title="مؤشرات تستحق المتابعة" items={report.red_flags} emoji="🚩" />
        <Section title="نقاط القوة" items={report.strengths} emoji="⭐" />
        <Section title="توصيات عملية" items={report.recommendations} emoji="🧩" />
        {report.parent_actions && <Section title="ابدأ هذا الأسبوع (لولي الأمر)" items={report.parent_actions} emoji="👨‍👩‍👧" />}
      </div>

      <Section title="الخطوات التالية المقترحة" items={report.next_steps} emoji="➡️" />

      <div className="bg-[hsl(var(--damij-surface))] rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/10">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">المراجع المعتمدة</h3>
        <ul className="space-y-2 text-sm">
          {AUTISM_SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--damij-accent-2))] hover:underline">
                [{s.org}] {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportView;
