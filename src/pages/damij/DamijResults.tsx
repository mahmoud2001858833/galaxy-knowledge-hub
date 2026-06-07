import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Lock,
  BarChart3,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  Download,
  PieChart as PieIcon,
  TrendingUp,
  Calendar,
  Briefcase,
  Quote,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QUESTIONS } from './DamijDoctorSurvey';

const RESULTS_PASSWORD = '200400200';

type Survey = {
  id: string;
  doctor_name: string;
  specialty: string | null;
  workplace: string | null;
  email: string | null;
  answers: Record<string, string | string[] | null>;
  created_at: string;
};

const PALETTE = [
  'hsl(215 55% 35%)',
  'hsl(200 65% 45%)',
  'hsl(38 78% 52%)',
  'hsl(14 55% 55%)',
  'hsl(184 60% 40%)',
  'hsl(152 55% 45%)',
];

const truncate = (s: string, n = 32) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// ============================================================
// CSV export
// ============================================================
function downloadCsv(surveys: Survey[]) {
  const headers = [
    'name', 'specialty', 'workplace', 'email', 'date', 'feedback',
    ...QUESTIONS.map((q) => q.id),
  ];
  const rows = surveys.map((s) => {
    const row: (string | number)[] = [
      s.doctor_name,
      s.specialty || '',
      s.workplace || '',
      s.email || '',
      new Date(s.created_at).toISOString(),
      (s.answers?.feedback as string) || '',
      ...QUESTIONS.map((q) => {
        const v = s.answers?.[q.id];
        if (Array.isArray(v)) return v.join('|');
        return v ? String(v) : '';
      }),
    ];
    return row.map((cell) => {
      const str = String(cell ?? '').replace(/"/g, '""');
      return /[,"\n]/.test(str) ? `"${str}"` : str;
    }).join(',');
  });
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `damij-survey-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// Stat card
// ============================================================
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; tint: string }> = ({
  icon, label, value, tint,
}) => (
  <div
    className="rounded-2xl p-5 shadow-md flex items-center gap-4"
    style={{ background: 'hsl(var(--damij-surface))' }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: tint }}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-extrabold" style={{ color: 'hsl(var(--damij-primary))' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'hsl(var(--damij-muted))' }}>
        {label}
      </div>
    </div>
  </div>
);

// ============================================================
// Per-question chart
// ============================================================
const QuestionChart: React.FC<{
  question: typeof QUESTIONS[number];
  surveys: Survey[];
  index: number;
}> = ({ question, surveys, index }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    question.choices.forEach((c) => { counts[c.value] = 0; });
    surveys.forEach((s) => {
      const v = s.answers?.[question.id];
      if (Array.isArray(v)) v.forEach((x) => { if (counts[x] != null) counts[x]++; });
      else if (typeof v === 'string' && counts[v] != null) counts[v]++;
    });
    const total = Math.max(1, surveys.length);
    return question.choices.map((c) => ({
      label: truncate(c.label, 38),
      fullLabel: c.label,
      value: counts[c.value],
      pct: Math.round((counts[c.value] / total) * 100),
    }));
  }, [question, surveys]);

  const usePie = !question.multi && data.length <= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 sm:p-6 shadow-md"
      style={{ background: 'hsl(var(--damij-surface))' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
          style={{ background: 'hsl(var(--damij-primary))' }}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base sm:text-lg leading-snug" style={{ color: 'hsl(var(--damij-text))' }}>
            {question.text}
          </h3>
          {question.multi && (
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'hsl(var(--damij-accent) / 0.15)', color: 'hsl(var(--damij-accent))' }}>
              اختيار متعدد
            </span>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: usePie ? 260 : Math.max(180, data.length * 56) }}>
        <ResponsiveContainer>
          {usePie ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ pct }) => `${pct}%`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any, _n, p: any) => [`${v} (${p.payload.pct}%)`, p.payload.fullLabel]}
                contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 12 }}
              />
              <Legend wrapperStyle={{ direction: 'rtl', fontSize: 12 }} />
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--damij-border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--damij-muted))" fontSize={11} />
              <YAxis
                type="category"
                dataKey="label"
                stroke="hsl(var(--damij-text))"
                fontSize={11}
                width={170}
                tick={{ textAnchor: 'end' }}
              />
              <Tooltip
                formatter={(v: any, _n, p: any) => [`${v} صوت (${p.payload.pct}%)`, p.payload.fullLabel]}
                contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 12 }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ============================================================
// Main page
// ============================================================
const DamijResults: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [tab, setTab] = useState<'overview' | 'charts' | 'feedback' | 'responses'>('overview');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<null | { kind: 'all' } | { kind: 'one'; id: string; name: string }>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('damij_doctor_surveys')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setSurveys((data as Survey[]) || []);
    setLoading(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== RESULTS_PASSWORD) {
      toast.error('كلمة مرور غير صحيحة');
      return;
    }
    setUnlocked(true);
    await loadSurveys();
  };

  const deleteOne = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from('damij_doctor_surveys').delete().eq('id', id);
    setDeleting(false);
    setConfirmDelete(null);
    if (error) { toast.error(error.message); return; }
    setSurveys((s) => s.filter((x) => x.id !== id));
    toast.success('تم حذف الرد');
  };

  const deleteAll = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from('damij_doctor_surveys')
      .delete()
      .not('id', 'is', null);
    setDeleting(false);
    setConfirmDelete(null);
    if (error) { toast.error(error.message); return; }
    setSurveys([]);
    toast.success('تم حذف جميع الردود — بدأنا من جديد');
  };

  // ---------- Aggregations ----------
  const feedbackList = useMemo(
    () => surveys
      .map((s) => ({ id: s.id, name: s.doctor_name, specialty: s.specialty, date: s.created_at, text: (s.answers?.feedback as string) || '' }))
      .filter((f) => f.text && f.text.trim().length > 0),
    [surveys]
  );

  const specialtyData = useMemo(() => {
    const counts: Record<string, number> = {};
    surveys.forEach((s) => {
      const k = (s.specialty || 'غير محدد').trim() || 'غير محدد';
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [surveys]);

  const last7Days = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 3600 * 1000;
    return surveys.filter((s) => now - new Date(s.created_at).getTime() < week).length;
  }, [surveys]);

  // ============================================================
  // Locked screen
  // ============================================================
  if (!unlocked) {
    return (
      <div
        className="damij-root min-h-screen flex items-center justify-center px-6"
        dir="rtl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}
      >
        <motion.form
          onSubmit={handleUnlock}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl shadow-2xl p-8"
          style={{ background: 'hsl(var(--damij-surface))' }}
        >
          <Link
            to="/damij"
            className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70"
            style={{ color: 'hsl(var(--damij-primary))' }}
          >
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--damij-primary) / 0.1)' }}
          >
            <Lock className="w-8 h-8" style={{ color: 'hsl(var(--damij-primary))' }} />
          </div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--damij-primary))' }}>
            نتائج استبيان الأطباء
          </h1>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--damij-muted))' }}>
            هذه الصفحة محمية. أدخل كلمة المرور للوصول إلى النتائج التفصيلية والرسوم البيانية.
          </p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-xl border-2 outline-none focus:border-[hsl(var(--damij-primary))] mb-4"
            style={{
              background: 'hsl(var(--damij-bg))',
              borderColor: 'hsl(var(--damij-border))',
              color: 'hsl(var(--damij-text))',
            }}
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition"
            style={{ background: 'hsl(var(--damij-primary))' }}
          >
            دخول
          </button>
        </motion.form>
      </div>
    );
  }

  // ============================================================
  // Unlocked dashboard
  // ============================================================
  const tabs: { key: typeof tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'charts', label: 'الرسوم البيانية', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'feedback', label: `الملاحظات (${feedbackList.length})`, icon: <MessageSquareText className="w-4 h-4" /> },
    { key: 'responses', label: 'الردود الفردية', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div
      className="damij-root min-h-screen"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/damij"
            className="inline-flex items-center gap-2 text-sm hover:opacity-70"
            style={{ color: 'hsl(var(--damij-primary))' }}
          >
            <ArrowRight className="w-4 h-4" /> العودة للمنصة
          </Link>
          {surveys.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadSurveys}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow"
                style={{ background: 'hsl(var(--damij-surface))', color: 'hsl(var(--damij-primary))', border: '1px solid hsl(var(--damij-border))' }}
                title="تحديث"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadCsv(surveys)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow"
                style={{ background: 'hsl(var(--damij-accent))', color: 'white' }}
              >
                <Download className="w-4 h-4" /> تصدير CSV
              </button>
              <button
                onClick={() => setConfirmDelete({ kind: 'all' })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow text-white"
                style={{ background: 'hsl(0 70% 50%)' }}
              >
                <Trash2 className="w-4 h-4" /> حذف الكل والبدء من جديد
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div
          className="rounded-3xl shadow-xl p-6 sm:p-8 mb-6"
          style={{ background: 'linear-gradient(135deg, hsl(var(--damij-primary)), hsl(var(--damij-primary-2)))' }}
        >
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">لوحة نتائج استبيان دامج</h1>
              <p className="text-white/80 text-sm">تحليل شامل لأفكار الأطباء حول رؤية المنصة</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(var(--damij-primary))' }} />
          </div>
        ) : surveys.length === 0 ? (
          <div
            className="rounded-3xl p-10 text-center shadow"
            style={{ background: 'hsl(var(--damij-surface))', color: 'hsl(var(--damij-muted))' }}
          >
            لا توجد إجابات بعد.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                icon={<Users className="w-6 h-6" style={{ color: 'hsl(var(--damij-primary))' }} />}
                label="إجمالي الردود" value={surveys.length}
                tint="hsl(var(--damij-primary) / 0.12)"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" style={{ color: 'hsl(var(--damij-accent))' }} />}
                label="آخر 7 أيام" value={last7Days}
                tint="hsl(var(--damij-accent) / 0.15)"
              />
              <StatCard
                icon={<MessageSquareText className="w-6 h-6" style={{ color: 'hsl(var(--damij-warm))' }} />}
                label="ملاحظات مكتوبة" value={feedbackList.length}
                tint="hsl(var(--damij-warm) / 0.15)"
              />
              <StatCard
                icon={<Briefcase className="w-6 h-6" style={{ color: 'hsl(var(--damij-success))' }} />}
                label="تخصصات مختلفة" value={specialtyData.length}
                tint="hsl(var(--damij-success) / 0.15)"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition whitespace-nowrap"
                  style={{
                    background: tab === t.key ? 'hsl(var(--damij-primary))' : 'hsl(var(--damij-surface))',
                    color: tab === t.key ? 'white' : 'hsl(var(--damij-text))',
                    boxShadow: tab === t.key ? '0 4px 12px hsl(var(--damij-primary) / 0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {tab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 shadow-md" style={{ background: 'hsl(var(--damij-surface))' }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--damij-primary))' }}>
                    <PieIcon className="w-5 h-5" /> توزيع التخصصات
                  </h3>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={specialtyData} dataKey="value" nameKey="label" outerRadius={100} label={({ label }) => label}>
                          {specialtyData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ direction: 'rtl', borderRadius: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl p-5 shadow-md" style={{ background: 'hsl(var(--damij-surface))' }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--damij-primary))' }}>
                    <Quote className="w-5 h-5" /> أحدث ملاحظة
                  </h3>
                  {feedbackList[0] ? (
                    <div>
                      <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap"
                        style={{ color: 'hsl(var(--damij-text))' }}>
                        "{feedbackList[0].text.length > 280 ? feedbackList[0].text.slice(0, 280) + '…' : feedbackList[0].text}"
                      </p>
                      <div className="text-xs" style={{ color: 'hsl(var(--damij-muted))' }}>
                        — {feedbackList[0].name}
                        {feedbackList[0].specialty ? ` • ${feedbackList[0].specialty}` : ''}
                      </div>
                      <button
                        onClick={() => setTab('feedback')}
                        className="mt-4 text-sm font-bold hover:underline"
                        style={{ color: 'hsl(var(--damij-accent))' }}
                      >
                        عرض كل الملاحظات ({feedbackList.length}) ←
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'hsl(var(--damij-muted))' }}>
                      لا توجد ملاحظات مكتوبة بعد.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ===== CHARTS TAB ===== */}
            {tab === 'charts' && (
              <div className="grid gap-4">
                {QUESTIONS.map((q, i) => (
                  <QuestionChart key={q.id} question={q} surveys={surveys} index={i} />
                ))}
              </div>
            )}

            {/* ===== FEEDBACK TAB ===== */}
            {tab === 'feedback' && (
              <div className="space-y-3">
                {feedbackList.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center shadow"
                    style={{ background: 'hsl(var(--damij-surface))', color: 'hsl(var(--damij-muted))' }}>
                    لا توجد ملاحظات مكتوبة بعد.
                  </div>
                ) : (
                  feedbackList.map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-2xl p-5 shadow-md"
                      style={{ background: 'hsl(var(--damij-surface))', borderRight: '4px solid hsl(var(--damij-accent))' }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                          style={{ background: 'hsl(var(--damij-accent))' }}>
                          {f.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold" style={{ color: 'hsl(var(--damij-text))' }}>{f.name}</div>
                          <div className="text-xs" style={{ color: 'hsl(var(--damij-muted))' }}>
                            {[f.specialty, new Date(f.date).toLocaleDateString('ar-EG')].filter(Boolean).join(' • ')}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'hsl(var(--damij-text))' }}>
                        {f.text}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* ===== RESPONSES TAB ===== */}
            {tab === 'responses' && (
              <div className="space-y-3">
                {surveys.map((s) => {
                  const isOpen = expanded === s.id;
                  const feedbackText = (s.answers?.feedback as string) || '';
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl shadow-md overflow-hidden"
                      style={{ background: 'hsl(var(--damij-surface))' }}
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : s.id)}
                        className="w-full p-5 flex items-center gap-4 text-right hover:bg-[hsl(var(--damij-bg))] transition"
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                          style={{ background: 'hsl(var(--damij-primary))' }}
                        >
                          {(s.doctor_name || '?').charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold" style={{ color: 'hsl(var(--damij-text))' }}>
                            {s.doctor_name}
                          </div>
                          <div className="text-xs" style={{ color: 'hsl(var(--damij-muted))' }}>
                            {[s.specialty, s.workplace, new Date(s.created_at).toLocaleDateString('ar-EG')]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        </div>
                        {feedbackText && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                            style={{ background: 'hsl(var(--damij-accent) / 0.15)', color: 'hsl(var(--damij-accent))' }}>
                            <MessageSquareText className="w-3 h-3 inline -mt-0.5" /> ملاحظة
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 space-y-2 border-t" style={{ borderColor: 'hsl(var(--damij-border))' }}>
                          {s.email && (
                            <div className="text-xs pt-3" style={{ color: 'hsl(var(--damij-muted))' }}>
                              البريد: {s.email}
                            </div>
                          )}
                          {QUESTIONS.map((q) => {
                            const v = s.answers?.[q.id];
                            if (v == null || (Array.isArray(v) && v.length === 0)) return null;
                            const labels = Array.isArray(v)
                              ? v.map((x) => q.choices.find((c) => c.value === x)?.label || x).join('، ')
                              : q.choices.find((c) => c.value === v)?.label || String(v);
                            return (
                              <div key={q.id} className="p-3 rounded-xl text-sm"
                                style={{ background: 'hsl(var(--damij-bg))' }}>
                                <div className="font-bold mb-1 text-xs" style={{ color: 'hsl(var(--damij-primary))' }}>
                                  {q.text}
                                </div>
                                <div style={{ color: 'hsl(var(--damij-text))' }}>{labels}</div>
                              </div>
                            );
                          })}
                          {feedbackText && (
                            <div className="p-3 rounded-xl text-sm"
                              style={{ background: 'hsl(var(--damij-accent) / 0.08)', border: '1px solid hsl(var(--damij-accent) / 0.3)' }}>
                              <div className="font-bold mb-1 text-xs flex items-center gap-1"
                                style={{ color: 'hsl(var(--damij-accent))' }}>
                                <MessageSquareText className="w-3.5 h-3.5" /> ملاحظة الطبيب
                              </div>
                              <div className="whitespace-pre-wrap leading-relaxed"
                                style={{ color: 'hsl(var(--damij-text))' }}>
                                {feedbackText}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DamijResults;
