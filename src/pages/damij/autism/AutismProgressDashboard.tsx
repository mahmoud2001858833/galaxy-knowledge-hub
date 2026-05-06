import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, TrendingUp, Trophy, Target, CalendarCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const AutismProgressDashboard: React.FC = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-accent-2))]" /></div>;
  if (!program) return <div className="text-center pt-20">لم يُعثر على البرنامج</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20" dir="rtl">
      <button onClick={() => navigate(`/damij/autism/program/${programId}`)}
        className="px-3 py-1.5 mb-4 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
        <ArrowRight className="w-4 h-4" /> الجدول
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">لوحة تقدّم البرنامج</h1>
        <p className="text-slate-600 mt-1">{program.title_ar}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="أيام مكتملة" value={`${stats.completed}/${stats.total}`} color="emerald" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="نسبة الإنجاز" value={`${stats.percent}%`} color="sky" />
        <StatCard icon={<Target className="w-5 h-5" />} label="متوسط الأداء" value={`${stats.avg}`} color="violet" />
        <StatCard icon={<Trophy className="w-5 h-5" />} label="أفضل يوم" value={`${stats.best}`} color="amber" />
      </div>

      <section className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
        <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">منحنى الأداء اليومي</h2>
        {lineData.length === 0 ? (
          <div className="text-center text-slate-500 py-10 text-sm">ابدأ ألعاب يومٍ ثم وَلِّد التقرير لتظهر النتائج هنا.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--damij-accent-2))" strokeWidth={3} dot={{ r: 5 }} name="الدرجة" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
        <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">متوسط الأداء حسب المهارة</h2>
        {barData.length === 0 ? (
          <div className="text-center text-slate-500 py-10 text-sm">لا توجد بيانات بعد.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="متوسط" fill="hsl(var(--damij-primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl p-5 border border-slate-200">
        <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">آخر تقارير الأيام</h2>
        <div className="space-y-2">
          {days.map(d => {
            const r = reports[d.id];
            return (
              <button key={d.id} onClick={() => navigate(`/damij/autism/program/${programId}/day/${d.id}`)}
                className="w-full text-right p-3 rounded-xl border border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] font-bold flex items-center justify-center">{d.day_index}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{d.theme_ar}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{r ? r.summary_ar : 'لم يُولَّد التقرير بعد'}</div>
                </div>
                {r && <div className="text-emerald-700 font-bold">{Math.round(r.score)}/100</div>}
              </button>
            );
          })}
        </div>
      </section>
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
    <div className={`p-4 rounded-2xl border bg-gradient-to-br ${map[color]}`}>
      <div className="flex items-center gap-2 mb-1 text-xs font-bold opacity-80">{icon}{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
};

export default AutismProgressDashboard;
