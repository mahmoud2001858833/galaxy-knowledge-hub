import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, TrendingUp, Activity, Brain, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Legend,
} from 'recharts';

type DayCell = {
  date: string;          // YYYY-MM-DD
  day: number;           // 1..31
  inMonth: boolean;
  games: number;
  tests: number;
  assessments: number;
  reports: number;
  avgScore: number | null;
  intensity: number;     // 0..4 for heatmap
};

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const WEEK_DAYS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

// ============================================================
// Score normalization
// ------------------------------------------------------------
// Different sources (games, neuro tests, training) emit scores
// on different scales. To compare days fairly we:
//  1. Group records by source "type" (game_key / test_type / training).
//  2. For each type, derive a robust scale (p10..p90) within the
//     user's monthly data (fallback to assumed bounds when too few).
//  3. Map each raw score to 0..100 using that scale.
//  4. For tests where lower is better (rt, omission/commission),
//     invert before normalization.
// Daily "avg performance" = mean of per-type daily means → fair
// comparison even when the day mixes a quick game with a long test.
// ============================================================

type NormRecord = { day: string; type: string; norm: number; raw: number };

const percentile = (sorted: number[], p: number) => {
  if (!sorted.length) return 0;
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
};

const normalize = (raw: number, lo: number, hi: number) => {
  if (hi - lo < 1e-6) return 50;
  const v = ((raw - lo) / (hi - lo)) * 100;
  return Math.max(0, Math.min(100, v));
};

// Per-type domain knowledge: assumed [min,max] when sample is small,
// and whether higher raw is better.
const TYPE_PROFILE: Record<string, { lo: number; hi: number; higherBetter: boolean }> = {
  // Games: engine score is bounded ~[-50,150] but typically 0..100
  'game:default':       { lo: 0,   hi: 100, higherBetter: true },
  // Training sessions
  'training:default':   { lo: 0,   hi: 100, higherBetter: true },
  // Neuro tests — metric chosen per type
  'test:cpt':           { lo: 0,   hi: 1,   higherBetter: true },  // accuracy
  'test:nback':         { lo: 0,   hi: 100, higherBetter: true },  // accuracy %
  'test:stroop':        { lo: 0,   hi: 600, higherBetter: false }, // ms effect (invert)
  'test:gonogo':        { lo: 0,   hi: 100, higherBetter: true },  // noGoAccuracy %
};

const extractTestRaw = (t: any): { value: number; profile: string } | null => {
  const m = t.metrics || {};
  switch (t.test_type) {
    case 'cpt':    return m.accuracy != null ? { value: Number(m.accuracy), profile: 'test:cpt' } : null;
    case 'nback':  return m.accuracy != null ? { value: Number(m.accuracy), profile: 'test:nback' } : null;
    case 'stroop': return m.stroopEffect != null ? { value: Number(m.stroopEffect), profile: 'test:stroop' } : null;
    case 'gonogo': return m.noGoAccuracy != null ? { value: Number(m.noGoAccuracy), profile: 'test:gonogo' } : null;
    default: return null;
  }
};

const buildNormalizedRecords = (
  games: any[], tests: any[], trainings: any[]
): NormRecord[] => {
  // Bucket raw values per "type-key" so each game_key gets its own scale.
  const buckets = new Map<string, { raws: number[]; profile: string; higherBetter: boolean }>();

  const addRaw = (key: string, raw: number, profile: string, higherBetter: boolean) => {
    if (!buckets.has(key)) buckets.set(key, { raws: [], profile, higherBetter });
    buckets.get(key)!.raws.push(raw);
  };

  games.forEach((g) => {
    const s = Number(g.score);
    if (!isNaN(s)) addRaw(`game:${g.game_key || 'default'}`, s, 'game:default', true);
  });
  trainings.forEach((t) => {
    const s = Number(t.score);
    if (!isNaN(s)) addRaw(`training:${t.activity_type || 'default'}`, s, 'training:default', true);
  });
  tests.forEach((t) => {
    const ex = extractTestRaw(t);
    if (ex) {
      const prof = TYPE_PROFILE[ex.profile];
      addRaw(`${ex.profile}`, ex.value, ex.profile, prof.higherBetter);
    }
  });

  // Compute scale per bucket (robust: p10..p90 if ≥4 samples, else profile defaults).
  const scales = new Map<string, { lo: number; hi: number; higherBetter: boolean }>();
  buckets.forEach((b, key) => {
    const sorted = [...b.raws].sort((a, b) => a - b);
    const fallback = TYPE_PROFILE[b.profile] || TYPE_PROFILE['game:default'];
    let lo = fallback.lo, hi = fallback.hi;
    if (sorted.length >= 4) {
      lo = Math.min(lo, percentile(sorted, 0.10));
      hi = Math.max(hi, percentile(sorted, 0.90));
    }
    scales.set(key, { lo, hi, higherBetter: b.higherBetter });
  });

  const out: NormRecord[] = [];
  const pushNorm = (date: string, key: string, raw: number) => {
    const sc = scales.get(key);
    if (!sc) return;
    let n = normalize(raw, sc.lo, sc.hi);
    if (!sc.higherBetter) n = 100 - n;
    out.push({ day: date, type: key, norm: n, raw });
  };

  games.forEach((g) => {
    const s = Number(g.score);
    if (!isNaN(s)) pushNorm(g.created_at.slice(0, 10), `game:${g.game_key || 'default'}`, s);
  });
  trainings.forEach((t) => {
    const s = Number(t.score);
    if (!isNaN(s)) pushNorm(t.created_at.slice(0, 10), `training:${t.activity_type || 'default'}`, s);
  });
  tests.forEach((t) => {
    const ex = extractTestRaw(t);
    if (ex) pushNorm(t.created_at.slice(0, 10), ex.profile, ex.value);
  });

  return out;
};

const dailyAverage = (records: NormRecord[], date: string): number | null => {
  const today = records.filter((r) => r.day === date);
  if (!today.length) return null;
  // Mean of per-type means → balanced (1 long test won't outweigh many quick games)
  const byType = new Map<string, number[]>();
  today.forEach((r) => {
    if (!byType.has(r.type)) byType.set(r.type, []);
    byType.get(r.type)!.push(r.norm);
  });
  const typeMeans: number[] = [];
  byType.forEach((arr) => typeMeans.push(arr.reduce((a, b) => a + b, 0) / arr.length));
  return Math.round(typeMeans.reduce((a, b) => a + b, 0) / typeMeans.length);
};

const ADHDMonthlyTracker: React.FC = () => {
  const nav = useNavigate();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [dayReports, setDayReports] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);

  const monthStart = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor]);
  const monthEnd = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1), [cursor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setLoading(false); return; }
      const startISO = monthStart.toISOString();
      const endISO = monthEnd.toISOString();
      const [g, n, a, dr, tr] = await Promise.all([
        supabase.from('adhd_game_sessions').select('*').eq('user_id', u.user.id).gte('created_at', startISO).lt('created_at', endISO),
        supabase.from('adhd_neuro_tests').select('*').eq('user_id', u.user.id).gte('created_at', startISO).lt('created_at', endISO),
        supabase.from('adhd_assessments').select('*').eq('user_id', u.user.id).gte('created_at', startISO).lt('created_at', endISO),
        supabase.from('adhd_day_reports').select('*').eq('user_id', u.user.id).gte('created_at', startISO).lt('created_at', endISO),
        supabase.from('adhd_training_sessions').select('*').eq('user_id', u.user.id).gte('created_at', startISO).lt('created_at', endISO),
      ]);
      setGames(g.data || []);
      setTests(n.data || []);
      setAssessments(a.data || []);
      setDayReports(dr.data || []);
      setTrainings(tr.data || []);
      setLoading(false);
    })();
  }, [monthStart.getTime(), monthEnd.getTime()]);

  // Build normalized records once for the month
  const normRecords = useMemo(
    () => buildNormalizedRecords(games, tests, trainings),
    [games, tests, trainings]
  );

  // Build calendar grid
  const cells: DayCell[] = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const arr: DayCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const offset = i - firstWeekday;
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), offset + 1);
      const inMonth = d.getMonth() === monthStart.getMonth();
      const key = fmtDate(d);
      const dayGames = games.filter((x) => x.created_at?.slice(0, 10) === key);
      const dayTests = tests.filter((x) => x.created_at?.slice(0, 10) === key);
      const dayAssess = assessments.filter((x) => x.created_at?.slice(0, 10) === key);
      const dayReps = dayReports.filter((x) => x.created_at?.slice(0, 10) === key);
      const dayTrain = trainings.filter((x) => x.created_at?.slice(0, 10) === key);
      const avgScore = dailyAverage(normRecords, key);
      const total = dayGames.length + dayTests.length + dayAssess.length + dayTrain.length;
      const intensity = total === 0 ? 0 : total < 2 ? 1 : total < 4 ? 2 : total < 6 ? 3 : 4;
      arr.push({
        date: key,
        day: d.getDate(),
        inMonth,
        games: dayGames.length,
        tests: dayTests.length + dayAssess.length,
        assessments: dayAssess.length,
        reports: dayReps.length,
        avgScore,
        intensity,
      });
    }
    return arr;
  }, [monthStart, games, tests, assessments, dayReports, trainings, normRecords]);

  // Daily performance line (avg score per day in month)
  const performanceSeries = useMemo(() => {
    return cells
      .filter((c) => c.inMonth)
      .map((c) => ({
        day: c.day,
        score: c.avgScore ?? null,
        activities: c.games + c.tests + c.reports,
      }));
  }, [cells]);

  // Test type breakdown
  const testBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    tests.forEach((t) => { map[t.test_type] = (map[t.test_type] || 0) + 1; });
    const labels: Record<string, string> = { cpt: 'CPT', nback: 'N-Back', stroop: 'Stroop', gonogo: 'Go/No-Go' };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, count: v }));
  }, [tests]);

  // Improvement: compare first half vs second half of month avg score
  const improvement = useMemo(() => {
    const valid = performanceSeries.filter((p) => p.score !== null) as { day: number; score: number }[];
    if (valid.length < 2) return null;
    const mid = Math.floor(valid.length / 2);
    const first = valid.slice(0, mid);
    const second = valid.slice(mid);
    const avg = (arr: { score: number }[]) => arr.reduce((a, b) => a + b.score, 0) / arr.length;
    const a = avg(first), b = avg(second);
    return { first: Math.round(a), second: Math.round(b), delta: Math.round(b - a) };
  }, [performanceSeries]);

  const stats = useMemo(() => {
    const activeDays = cells.filter((c) => c.inMonth && (c.games + c.tests + c.reports) > 0).length;
    const totalActivities = games.length + tests.length + assessments.length + trainings.length;
    // Use normalized daily averages (already weighted per type) for fair monthly mean
    const dailyAvgs = cells.filter((c) => c.inMonth && c.avgScore !== null).map((c) => c.avgScore as number);
    const avgScore = dailyAvgs.length ? Math.round(dailyAvgs.reduce((a, b) => a + b, 0) / dailyAvgs.length) : 0;
    const bestScore = dailyAvgs.length ? Math.max(...dailyAvgs) : 0;
    return { activeDays, totalActivities, avgScore, bestScore };
  }, [cells, games, tests, assessments, trainings]);

  const intensityClass = (i: number) => {
    if (i === 0) return 'bg-slate-100';
    if (i === 1) return 'bg-emerald-200';
    if (i === 2) return 'bg-emerald-400';
    if (i === 3) return 'bg-emerald-600';
    return 'bg-emerald-700';
  };

  const monthLabel = `${MONTH_NAMES_AR[monthStart.getMonth()]} ${monthStart.getFullYear()}`;

  return (
    <div className="px-4 sm:px-6 pt-12 pb-28 max-w-6xl mx-auto" dir="rtl">
      <button onClick={() => nav('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">لوحة المتابعة الشهرية</h1>
            <p className="text-[hsl(var(--damij-text))]/70 text-sm">تقدّمك اليومي، اختباراتك، وتحسّن أدائك خلال الشهر.</p>
          </div>
        </div>
      </motion.header>

      {/* Month switcher */}
      <div className="flex items-center justify-between mb-6 p-3 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 shadow-sm">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-xl hover:bg-[hsl(var(--damij-surface))]"
          aria-label="الشهر السابق"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="font-bold text-lg text-[hsl(var(--damij-primary))]">{monthLabel}</div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-xl hover:bg-[hsl(var(--damij-surface))]"
          aria-label="الشهر التالي"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI icon={Calendar} label="أيام نشطة" value={`${stats.activeDays}`} accent="from-blue-500 to-indigo-500" />
        <KPI icon={Activity} label="إجمالي الأنشطة" value={`${stats.totalActivities}`} accent="from-violet-500 to-fuchsia-500" />
        <KPI icon={Target} label="متوسط الأداء" value={`${stats.avgScore}`} accent="from-emerald-500 to-teal-500" />
        <KPI icon={Award} label="أفضل نتيجة" value={`${stats.bestScore}`} accent="from-amber-500 to-orange-500" />
      </div>

      {/* Improvement banner */}
      {improvement && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
          improvement.delta >= 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <TrendingUp className={`w-6 h-6 ${improvement.delta >= 0 ? '' : 'rotate-180'}`} />
          <div className="flex-1">
            <div className="font-bold">
              {improvement.delta >= 0 ? 'تحسّن في الأداء' : 'تراجع في الأداء'}: {improvement.delta > 0 ? '+' : ''}{improvement.delta} نقطة
            </div>
            <div className="text-sm opacity-80">
              النصف الأول من الشهر: {improvement.first} • النصف الثاني: {improvement.second}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Heatmap */}
      <Section title="خريطة النشاط اليومية" icon={Calendar}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEK_DAYS_AR.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-[hsl(var(--damij-text))]/60">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c, i) => (
            <div
              key={i}
              title={c.inMonth ? `${c.date} • ألعاب: ${c.games} • اختبارات: ${c.tests} • تقارير: ${c.reports}${c.avgScore !== null ? ` • أداء: ${c.avgScore}` : ''}` : ''}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium relative transition ${
                c.inMonth ? `${intensityClass(c.intensity)} ${c.intensity >= 3 ? 'text-white' : 'text-slate-700'} hover:ring-2 hover:ring-[hsl(var(--damij-warm))]` : 'bg-transparent text-slate-300'
              }`}
            >
              {c.day}
              {c.inMonth && c.reports > 0 && (
                <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-[11px] text-[hsl(var(--damij-text))]/60">
          <span>أقل</span>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`w-3 h-3 rounded ${intensityClass(i)}`} />)}
          <span>أكثر</span>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Section title="منحنى الأداء عبر الشهر" icon={TrendingUp} empty={!performanceSeries.some((p) => p.score !== null)}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={performanceSeries}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#perfGrad)" name="متوسط الأداء" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="نشاط الأنشطة اليومية" icon={Activity} empty={!performanceSeries.some((p) => p.activities > 0)}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="activities" fill="#6366f1" radius={[6, 6, 0, 0]} name="عدد الأنشطة" />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="توزيع الاختبارات" icon={Brain} empty={!testBreakdown.length}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={testBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={12} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]} name="عدد الاختبارات" />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="الألعاب التشخيصية والعلاجية" icon={Target} empty={!games.length}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={games.map((g, i) => ({ i: i + 1, score: Number(g.score) || 0, key: g.game_key }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="i" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} name="نتيجة الجلسة" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Daily reports list */}
      <Section title="تقارير الأيام المكتملة" icon={Calendar} empty={!dayReports.length} className="mt-5">
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {dayReports
            .slice()
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            .map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-[hsl(var(--damij-primary))]/10 bg-[hsl(var(--damij-surface))]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[hsl(var(--damij-primary))]">
                    {new Date(r.created_at).toLocaleDateString('ar')}
                  </span>
                  {r.metrics?.score !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {r.metrics.score} نقطة
                    </span>
                  )}
                </div>
                {r.ai_report && <p className="text-xs text-[hsl(var(--damij-text))]/75 line-clamp-2">{r.ai_report}</p>}
              </div>
          ))}
        </div>
      </Section>

      {loading && (
        <div className="text-center text-sm text-[hsl(var(--damij-text))]/60 mt-6">جاري تحميل بيانات الشهر...</div>
      )}
    </div>
  );
};

const KPI: React.FC<{ icon: React.ComponentType<any>; label: string; value: string; accent: string }> = ({ icon: Icon, label, value, accent }) => (
  <div className="p-4 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 shadow-sm">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} text-white flex items-center justify-center mb-2`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{value}</div>
    <div className="text-xs text-[hsl(var(--damij-text))]/60">{label}</div>
  </div>
);

const Section: React.FC<{ title: string; icon: React.ComponentType<any>; empty?: boolean; children: React.ReactNode; className?: string }> = ({ title, icon: Icon, empty, children, className }) => (
  <div className={`p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 shadow-sm ${className || ''}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-[hsl(var(--damij-warm))]" />
      <h3 className="font-bold text-[hsl(var(--damij-primary))]">{title}</h3>
    </div>
    {empty ? (
      <p className="text-sm text-[hsl(var(--damij-text))]/50 py-12 text-center">لا توجد بيانات لهذا الشهر بعد</p>
    ) : children}
  </div>
);

export default ADHDMonthlyTracker;
