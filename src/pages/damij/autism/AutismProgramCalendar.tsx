import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Lock, Play, Copy, ExternalLink, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Day { id: string; day_index: number; theme_ar: string; focus_skill_ar: string; }
interface Program { id: string; title_ar: string; summary_ar: string; total_days: number; start_date: string; share_token: string; }

const AutismProgramCalendar: React.FC = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!programId) return;
    const { data: prog } = await supabase.from('autism_programs').select('*').eq('id', programId).maybeSingle();
    if (!prog) { setLoading(false); return; }
    setProgram(prog as any);
    const { data: ds } = await supabase.from('autism_program_days').select('*').eq('program_id', programId).order('day_index');
    setDays((ds as any[]) || []);
    const { data: reps } = await supabase.from('autism_day_reports').select('day_id').in('day_id', (ds || []).map((d: any) => d.id));
    setCompletedDays(new Set((reps || []).map((r: any) => r.day_id)));
    setLoading(false);
  })(); }, [programId]);

  const today = (() => {
    if (!program) return 1;
    const start = new Date(program.start_date);
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
    return Math.max(1, Math.min(program.total_days, diff));
  })();

  const shareUrl = program ? `${window.location.origin}/autism/c/${program.share_token}` : '';

  const copyShare = async () => {
    if (!program) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      toast.success('تم نسخ رابط الطفل', {
        description: shareUrl,
        action: { label: 'فتح', onClick: () => window.open(shareUrl, '_blank', 'noopener,noreferrer') },
      });
    } catch {
      toast.error('تعذّر النسخ، انسخ الرابط يدوياً: ' + shareUrl);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-accent-2))]" /></div>;
  if (!program) return <div className="text-center pt-20">لم يُعثر على البرنامج</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">{program.title_ar}</h1>
        <p className="text-slate-600 mt-2">{program.summary_ar}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={copyShare} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
            <Copy className="w-4 h-4" /> نسخ رابط متابعة الطفل
          </button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
            <ExternalLink className="w-4 h-4" /> فتح الصفحة العامة
          </a>
          <button onClick={() => navigate(`/damij/autism/program/${programId}/dashboard`)}
            className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-1">
            <BarChart3 className="w-4 h-4" /> لوحة التقدم
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] text-sm font-bold">
            اليوم {today} من {program.total_days}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold">
            مكتمل: {completedDays.size}/{program.total_days}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {days.map(d => {
          const done = completedDays.has(d.id);
          const locked = d.day_index > today;
          return (
            <button key={d.id}
              disabled={locked}
              onClick={() => navigate(`/damij/autism/program/${programId}/day/${d.id}`)}
              className={`text-right p-4 rounded-2xl border transition ${
                locked ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                : done ? 'bg-emerald-50 border-emerald-200'
                : d.day_index === today ? 'bg-[hsl(var(--damij-accent-2))]/15 border-[hsl(var(--damij-accent-2))]'
                : 'bg-white border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">يوم</span>
                <span className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{d.day_index}</span>
              </div>
              <div className="font-bold text-sm text-slate-800 line-clamp-2">{d.theme_ar}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-1">{d.focus_skill_ar}</div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {locked ? <><Lock className="w-3 h-3" /> مغلق</>
                : done ? <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> مكتمل</>
                : <><Play className="w-3 h-3 text-[hsl(var(--damij-accent-2))]" /> ابدأ</>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AutismProgramCalendar;
