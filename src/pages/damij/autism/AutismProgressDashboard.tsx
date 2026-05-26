import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, TrendingUp, Trophy, Target, CalendarCheck, Printer, Download, Search, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { exportElementToPdf } from '@/lib/pdfExport';
import { toast } from 'sonner';

const AutismProgressDashboard: React.FC = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [perfFilter, setPerfFilter] = useState<'all' | 'high' | 'mid' | 'low' | 'pending'>('all');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { (async () => {
    if (!programId) return;
    const { data: prog } = await supabase.from('autism_programs').select('*').eq('id', programId).maybeSingle();
    setProgram(prog);
    const { data: ds } = await supabase.from('autism_program_days').select('*').eq('program_id', programId).order('day_index');
    setDays(ds || []);
    const dayIds = (ds || []).map((d: any) => d.id);
    if (dayIds.length) {
      const { data: rs } = await supabase.from('autism_day_reports').select('*').in('day_id', dayIds);
      const map: Record<string, any> = {};
      (rs || []).forEach((r: any) => { map[r.day_id] = r; });
      setReports(map);
    }
    setLoading(false);
  })(); }, [programId]);

  const stats = useMemo(() => {
    const reportArr = Object.values(reports);
    const completed = reportArr.length;
    const total = days.length || 1;
    const avg = completed ? Math.round(reportArr.reduce((a: number, r: any) => a + (r.score ?? 0), 0) / completed) : 0;
    const best = completed ? Math.max(...reportArr.map((r: any) => Math.round(r.score ?? 0))) : 0;
    return { completed, total, percent: Math.round((completed / total) * 100), avg, best };
  }, [reports, days]);

  const lineData = useMemo(() =>
    days.map(d => ({
      day: `يوم ${d.day_index}`,
      score: reports[d.id]?.score ? Math.round(reports[d.id].score) : null,
    })).filter(x => x.score !== null),
  [days, reports]);

  const barData = useMemo(() => {
    const buckets: Record<string, { name: string; count: number; total: number }> = {};
    days.forEach(d => {
      const r = reports[d.id];
      if (!r) return;
      const key = d.focus_skill_ar || 'عام';
      buckets[key] = buckets[key] || { name: key, count: 0, total: 0 };
      buckets[key].count++;
      buckets[key].total += Math.round(r.score ?? 0);
    });
    return Object.values(buckets).map(b => ({ name: b.name, متوسط: Math.round(b.total / b.count) }));
  }, [days, reports]);

  // Weekly comparison
  const weeklyData = useMemo(() => {
    const weeks: Record<number, { scores: number[]; skills: Record<string, number[]> }> = {};
    days.forEach(d => {
      const r = reports[d.id];
      if (!r) return;
      const w = Math.ceil(d.day_index / 7);
      weeks[w] = weeks[w] || { scores: [], skills: {} };
      weeks[w].scores.push(Math.round(r.score ?? 0));
      const sk = d.focus_skill_ar || 'عام';
      weeks[w].skills[sk] = weeks[w].skills[sk] || [];
      weeks[w].skills[sk].push(Math.round(r.score ?? 0));
    });
    const arr = Object.entries(weeks).map(([w, v]) => ({
      name: `أسبوع ${w}`,
      weekNum: Number(w),
      متوسط: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
      أيام: v.scores.length,
    })).sort((a, b) => a.weekNum - b.weekNum);
    // delta
    return arr.map((row, i) => ({
      ...row,
      تحسن: i === 0 ? 0 : row.متوسط - arr[i - 1].متوسط,
    }));
  }, [days, reports]);

  const skills = useMemo(() => Array.from(new Set(days.map(d => d.focus_skill_ar).filter(Boolean))), [days]);

  const filteredDays = useMemo(() => {
    return days.filter(d => {
      const r = reports[d.id];
      const score = r ? Math.round(r.score ?? 0) : null;
      if (skillFilter !== 'all' && d.focus_skill_ar !== skillFilter) return false;
      if (perfFilter === 'pending' && r) return false;
      if (perfFilter === 'high' && (score === null || score < 80)) return false;
      if (perfFilter === 'mid' && (score === null || score < 50 || score >= 80)) return false;
      if (perfFilter === 'low' && (score === null || score >= 50)) return false;
      if (search) {
        const q = search.toLowerCase();
        const blob = `${d.theme_ar} ${d.focus_skill_ar} ${r?.summary_ar ?? ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [days, reports, search, skillFilter, perfFilter]);

  const handlePrint = () => window.print();
  const handleExportPdf = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(printRef.current, `dashboard-${program?.title_ar || programId}.pdf`);
      toast.success('تم تنزيل التقرير PDF');
    } catch (e: any) {
      toast.error('تعذّر إنشاء PDF');
    } finally { setExporting(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-accent-2))]" /></div>;
  if (!program) return <div className="text-center pt-20">لم يُعثر على البرنامج</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20" dir="rtl">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; padding: 0 !important; }
          .print-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print flex flex-wrap gap-2 mb-4">
        <button onClick={() => navigate(`/damij/autism/program/${programId}`)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> الجدول
        </button>
        <button onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
          <Printer className="w-4 h-4" /> طباعة
        </button>
        <button onClick={handleExportPdf} disabled={exporting}
          className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-1">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} تصدير PDF
        </button>
      </div>

      <div ref={printRef} className="print-area">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--damij-primary))]">لوحة تقدّم البرنامج</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">{program.title_ar}</p>
          <p className="text-xs text-slate-400 mt-1">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="أيام مكتملة" value={`${stats.completed}/${stats.total}`} color="emerald" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="نسبة الإنجاز" value={`${stats.percent}%`} color="sky" />
          <StatCard icon={<Target className="w-5 h-5" />} label="متوسط الأداء" value={`${stats.avg}`} color="violet" />
          <StatCard icon={<Trophy className="w-5 h-5" />} label="أفضل يوم" value={`${stats.best}`} color="amber" />
        </div>

        <section className="print-card bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 mb-6">
          <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">منحنى الأداء اليومي</h2>
          {lineData.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">ابدأ ألعاب يومٍ ثم وَلِّد التقرير لتظهر النتائج هنا.</div>
          ) : (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--damij-accent-2))" strokeWidth={3} dot={{ r: 4 }} name="الدرجة" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="print-card bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 mb-6">
          <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">متوسط الأداء حسب المهارة</h2>
          {barData.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">لا توجد بيانات بعد.</div>
          ) : (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="متوسط" fill="hsl(var(--damij-primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Weekly comparison */}
        <section className="print-card bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 mb-6">
          <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-1">المقارنة الأسبوعية</h2>
          <p className="text-xs text-slate-500 mb-3">تحسّن المهارات والدرجات أسبوعًا بعد أسبوع</p>
          {weeklyData.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">تحتاج إلى إكمال يومين على الأقل لإظهار المقارنة.</div>
          ) : (
            <>
              <div className="h-56 sm:h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="متوسط" fill="hsl(var(--damij-accent-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {weeklyData.map(w => (
                  <div key={w.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div>
                      <div className="font-bold text-sm">{w.name}</div>
                      <div className="text-xs text-slate-500">{w.أيام} أيام • متوسط {w.متوسط}</div>
                    </div>
                    <div className={`text-sm font-bold ${w.تحسن > 0 ? 'text-emerald-600' : w.تحسن < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {w.تحسن > 0 ? `▲ +${w.تحسن}` : w.تحسن < 0 ? `▼ ${w.تحسن}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="print-card bg-white rounded-3xl p-4 sm:p-5 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-bold text-[hsl(var(--damij-primary))]">تقارير الأيام</h2>
            <span className="text-xs text-slate-500">{filteredDays.length} يوم</span>
          </div>

          <div className="no-print grid sm:grid-cols-3 gap-2 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الموضوع/الملخص"
                className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" />
            </div>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              <option value="all">كل المهارات</option>
              {skills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={perfFilter} onChange={e => setPerfFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              <option value="all">كل مستويات الأداء</option>
              <option value="high">ممتاز (80+)</option>
              <option value="mid">متوسط (50-79)</option>
              <option value="low">يحتاج دعم (&lt;50)</option>
              <option value="pending">بدون تقرير بعد</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredDays.length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">لا توجد نتائج مطابقة.</div>
            )}
            {filteredDays.map(d => {
              const r = reports[d.id];
              return (
                <button key={d.id} onClick={() => navigate(`/damij/autism/program/${programId}/day/${d.id}`)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40 flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] font-bold flex items-center justify-center">{d.day_index}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{d.theme_ar}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{d.focus_skill_ar} • {r ? r.summary_ar : 'لم يُولَّد التقرير بعد'}</div>
                  </div>
                  {r && <div className="text-emerald-700 font-bold shrink-0">{Math.round(r.score)}/100</div>}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const map: Record<string, string> = {
    emerald: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
    sky: 'from-sky-50 to-white border-sky-200 text-sky-700',
    violet: 'from-violet-50 to-white border-violet-200 text-violet-700',
    amber: 'from-amber-50 to-white border-amber-200 text-amber-700',
  };
  return (
    <div className={`print-card p-3 sm:p-4 rounded-2xl border bg-gradient-to-br ${map[color]}`}>
      <div className="flex items-center gap-2 mb-1 text-xs font-bold opacity-80">{icon}{label}</div>
      <div className="text-xl sm:text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
};

export default AutismProgressDashboard;
