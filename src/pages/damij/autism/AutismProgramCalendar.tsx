import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, CheckCircle2, Lock, Play, Copy, ExternalLink, BarChart3,
  Sparkles, Trophy, CalendarDays, Target, Download, FileText, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface Day { id: string; day_index: number; theme_ar: string; focus_skill_ar: string; }
interface Program { id: string; title_ar: string; summary_ar: string; total_days: number; start_date: string; share_token: string; }

const PHASE_COLORS = [
  'from-sky-400/20 to-sky-500/5 border-sky-300/40',
  'from-violet-400/20 to-violet-500/5 border-violet-300/40',
  'from-amber-400/20 to-amber-500/5 border-amber-300/40',
  'from-emerald-400/20 to-emerald-500/5 border-emerald-300/40',
  'from-rose-400/20 to-rose-500/5 border-rose-300/40',
  'from-indigo-400/20 to-indigo-500/5 border-indigo-300/40',
];

const phaseFor = (idx: number) => {
  if (idx <= 14) return 0;
  if (idx <= 28) return 1;
  if (idx <= 45) return 2;
  if (idx <= 60) return 3;
  if (idx <= 75) return 4;
  return 5;
};

const AutismProgramCalendar: React.FC = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [reports, setReports] = useState<Record<string, { score: number }>>({});
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => { (async () => {
    if (!programId) return;
    const { data: prog } = await supabase.from('autism_programs').select('*').eq('id', programId).maybeSingle();
    if (!prog) { setLoading(false); return; }
    setProgram(prog as any);
    const { data: ds } = await supabase.from('autism_program_days').select('*').eq('program_id', programId).order('day_index');
    const dayList = (ds as any[]) || [];
    setDays(dayList);
    const { data: reps } = await supabase.from('autism_day_reports').select('day_id,score').in('day_id', dayList.map(d => d.id));
    const map: Record<string, { score: number }> = {};
    (reps || []).forEach((r: any) => { map[r.day_id] = { score: r.score ?? 0 }; });
    setReports(map);
    setLoading(false);
  })(); }, [programId]);

  const today = useMemo(() => {
    if (!program) return 1;
    const start = new Date(program.start_date);
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
    return Math.max(1, Math.min(program.total_days, diff));
  }, [program]);

  // Snap activeWeek to current day on first load
  useEffect(() => {
    if (program) setActiveWeek(Math.floor((today - 1) / 7));
  }, [program, today]);

  const stats = useMemo(() => {
    const repArr = Object.values(reports);
    const completed = repArr.length;
    const total = days.length || 1;
    const avg = completed ? Math.round(repArr.reduce((a, r) => a + r.score, 0) / completed) : 0;
    const best = completed ? Math.max(...repArr.map(r => Math.round(r.score))) : 0;
    return { completed, total, percent: Math.round((completed / total) * 100), avg, best, remaining: total - completed };
  }, [reports, days]);

  const weeks = useMemo(() => {
    const out: Day[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  const shareUrl = program ? `${window.location.origin}/autism/c/${program.share_token}` : '';

  const copyShare = async () => {
    if (!program) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ رابط متابعة الطفل');
    } catch {
      toast.error('تعذّر النسخ، الرابط: ' + shareUrl);
    }
  };

  const downloadCsv = () => {
    if (!program) return;
    const rows = [['اليوم', 'الموضوع', 'المهارة', 'الحالة', 'الدرجة']];
    days.forEach(d => {
      const r = reports[d.id];
      rows.push([
        String(d.day_index),
        d.theme_ar,
        d.focus_skill_ar,
        r ? 'مكتمل' : (d.day_index <= today ? 'متاح' : 'مقفل'),
        r ? String(Math.round(r.score)) : '—',
      ]);
    });
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${program.title_ar}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل ملف CSV');
  };

  const downloadPdf = () => {
    if (!program) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Autism Therapy Program Report', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Program: ${program.title_ar}`, 14, 32);
    doc.text(`Total days: ${program.total_days}`, 14, 39);
    doc.text(`Completed: ${stats.completed} / ${stats.total} (${stats.percent}%)`, 14, 46);
    doc.text(`Average score: ${stats.avg} / 100`, 14, 53);
    doc.text(`Best day score: ${stats.best} / 100`, 14, 60);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 67);

    doc.setFont('helvetica', 'bold');
    doc.text('Day-by-day summary', 14, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let y = 88;
    days.forEach(d => {
      const r = reports[d.id];
      const line = `Day ${d.day_index} | ${d.focus_skill_ar} | ${r ? 'Completed (' + Math.round(r.score) + '/100)' : (d.day_index <= today ? 'Available' : 'Locked')}`;
      doc.text(line, 14, y);
      y += 5;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save(`${program.title_ar}.pdf`);
    toast.success('تم تنزيل تقرير PDF');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--autism-primary))]" />
    </div>
  );
  if (!program) return <div className="text-center pt-20 text-[hsl(var(--autism-text))]">لم يُعثر على البرنامج</div>;

  const week = weeks[activeWeek] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20" dir="rtl">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 border border-[hsl(var(--autism-primary)/0.2)]"
        style={{ background: 'linear-gradient(135deg, hsl(var(--autism-primary)/0.15), hsl(var(--autism-accent)/0.1))' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--autism-primary)), hsl(var(--autism-accent)))' }}>
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--autism-text))]">{program.title_ar}</h1>
              <p className="text-sm text-[hsl(var(--autism-text))]/70 mt-1 line-clamp-2">{program.summary_ar}</p>
            </div>
          </div>
          {/* Circular progress */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="hsl(var(--autism-primary)/0.15)" strokeWidth="8" fill="none" />
              <circle cx="48" cy="48" r="40" stroke="hsl(var(--autism-accent))" strokeWidth="8" fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - stats.percent / 100)}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-[hsl(var(--autism-primary))]">{stats.percent}%</span>
              <span className="text-[10px] text-[hsl(var(--autism-text))]/60">إنجاز</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          <button onClick={copyShare} className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur border border-[hsl(var(--autism-primary)/0.2)] text-sm flex items-center gap-1 text-[hsl(var(--autism-text))] hover:bg-white">
            <Copy className="w-4 h-4" /> رابط متابعة
          </button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur border border-[hsl(var(--autism-primary)/0.2)] text-sm flex items-center gap-1 text-[hsl(var(--autism-text))] hover:bg-white">
            <ExternalLink className="w-4 h-4" /> الصفحة العامة
          </a>
          <button onClick={() => navigate(`/damij/autism/program/${programId}/dashboard`)}
            className="px-3 py-1.5 rounded-xl text-white text-sm font-bold flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, hsl(var(--autism-primary)), hsl(var(--autism-accent)))' }}>
            <BarChart3 className="w-4 h-4" /> لوحة التقدم
          </button>
          <button onClick={downloadPdf}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center gap-1 hover:bg-emerald-700">
            <Download className="w-4 h-4" /> تحميل PDF
          </button>
          <button onClick={downloadCsv}
            className="px-3 py-1.5 rounded-xl bg-white/80 border border-[hsl(var(--autism-primary)/0.2)] text-[hsl(var(--autism-text))] text-sm font-bold flex items-center gap-1 hover:bg-white">
            <FileText className="w-4 h-4" /> CSV
          </button>
        </div>
      </motion.header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="مكتمل" value={`${stats.completed}/${stats.total}`} color="emerald" />
        <StatCard icon={<Target className="w-5 h-5" />} label="متوسط الأداء" value={stats.completed ? `${stats.avg}/100` : '—'} color="sky" />
        <StatCard icon={<Trophy className="w-5 h-5" />} label="أفضل يوم" value={stats.completed ? `${stats.best}` : '—'} color="amber" />
        <StatCard icon={<CalendarDays className="w-5 h-5" />} label="اليوم الحالي" value={`${today} / ${program.total_days}`} color="violet" />
      </div>

      {/* Week tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveWeek(w => Math.max(0, w - 1))}
            disabled={activeWeek === 0}
            className="w-9 h-9 rounded-xl bg-white border border-[hsl(var(--autism-primary)/0.2)] flex items-center justify-center disabled:opacity-40">
            <ChevronRight className="w-4 h-4 text-[hsl(var(--autism-text))]" />
          </button>
          <h2 className="text-lg font-bold text-[hsl(var(--autism-text))]">
            الأسبوع {activeWeek + 1} <span className="text-sm font-normal text-[hsl(var(--autism-text))]/60">من {weeks.length}</span>
          </h2>
          <button onClick={() => setActiveWeek(w => Math.min(weeks.length - 1, w + 1))}
            disabled={activeWeek >= weeks.length - 1}
            className="w-9 h-9 rounded-xl bg-white border border-[hsl(var(--autism-primary)/0.2)] flex items-center justify-center disabled:opacity-40">
            <ChevronLeft className="w-4 h-4 text-[hsl(var(--autism-text))]" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
          {weeks.map((_, i) => (
            <button key={i} onClick={() => setActiveWeek(i)}
              className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold transition ${
                activeWeek === i ? 'bg-[hsl(var(--autism-primary))] text-white' : 'bg-white border border-[hsl(var(--autism-primary)/0.15)] text-[hsl(var(--autism-text))]/60 hover:text-[hsl(var(--autism-text))]'
              }`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* Week days grid */}
      <motion.div
        key={activeWeek}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        {week.map(d => {
          const r = reports[d.id];
          const done = !!r;
          const locked = d.day_index > today;
          const isToday = d.day_index === today;
          const phase = phaseFor(d.day_index);
          return (
            <motion.button
              key={d.id}
              whileHover={!locked ? { y: -3, scale: 1.01 } : undefined}
              whileTap={!locked ? { scale: 0.98 } : undefined}
              disabled={locked}
              onClick={() => navigate(`/damij/autism/program/${programId}/day/${d.id}`)}
              className={`text-right p-4 rounded-2xl border-2 transition relative overflow-hidden bg-gradient-to-br ${
                locked ? 'opacity-60 cursor-not-allowed grayscale ' + PHASE_COLORS[phase]
                : done ? 'bg-emerald-50 border-emerald-300'
                : isToday ? PHASE_COLORS[phase] + ' ring-4 ring-[hsl(var(--autism-accent)/0.3)] animate-pulse-subtle'
                : PHASE_COLORS[phase] + ' hover:border-[hsl(var(--autism-accent)/0.6)]'
              }`}
            >
              {isToday && !done && (
                <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--autism-accent))] text-white">اليوم</span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(var(--autism-text))]/60">يوم</span>
                <span className="text-3xl font-bold text-[hsl(var(--autism-primary))]">{d.day_index}</span>
              </div>
              <div className="font-bold text-sm text-[hsl(var(--autism-text))] line-clamp-2 min-h-[2.5rem]">{d.theme_ar}</div>
              <div className="text-xs text-[hsl(var(--autism-text))]/70 mt-1 line-clamp-1">🎯 {d.focus_skill_ar}</div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs flex items-center gap-1 font-bold">
                  {locked ? <><Lock className="w-3 h-3" /> مقفل</>
                  : done ? <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> مكتمل</>
                  : <><Play className="w-3 h-3 text-[hsl(var(--autism-accent))]" /> ابدأ</>}
                </span>
                {done && (
                  <span className="text-xs font-bold text-emerald-700 bg-white/70 px-2 py-0.5 rounded-full">
                    {Math.round(r!.score)}/100
                  </span>
                )}
                <span className="text-[10px] text-[hsl(var(--autism-text))]/50">5 ألعاب</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--autism-accent)/0.4); }
          50% { box-shadow: 0 0 0 8px hsl(var(--autism-accent)/0); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const map: Record<string, string> = {
    emerald: 'from-emerald-100 to-white border-emerald-200 text-emerald-700',
    sky: 'from-sky-100 to-white border-sky-200 text-sky-700',
    violet: 'from-violet-100 to-white border-violet-200 text-violet-700',
    amber: 'from-amber-100 to-white border-amber-200 text-amber-700',
  };
  return (
    <div className={`p-4 rounded-2xl border-2 bg-gradient-to-br ${map[color]}`}>
      <div className="flex items-center gap-2 mb-1 text-xs font-bold opacity-90">{icon}{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
};

export default AutismProgramCalendar;
