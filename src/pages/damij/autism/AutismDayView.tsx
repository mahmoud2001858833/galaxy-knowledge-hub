import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Play, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATE_META } from '@/features/autism/games/templates/registry';

interface Game {
  id: string; order_index: number; template_id: string; title_ar: string;
  instructions_ar: string; target_skill_ar: string; difficulty: string; duration_sec: number;
  adaptations_ar: string[];
}
interface Day { id: string; day_index: number; theme_ar: string; focus_skill_ar: string; rationale_ar: string; program_id: string; }

const AutismDayView: React.FC = () => {
  const { programId, dayId } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState<Day | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [report, setReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!dayId) return;
    setLoading(true);
    const { data: d } = await supabase.from('autism_program_days').select('*').eq('id', dayId).maybeSingle();
    setDay(d as any);
    const { data: gs } = await supabase.from('autism_program_games').select('*').eq('day_id', dayId).order('order_index');
    setGames((gs as any[]) || []);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && gs?.length) {
      const { data: sess } = await supabase
        .from('autism_game_sessions')
        .select('program_game_id')
        .eq('day_id', dayId)
        .eq('user_id', user.id);
      setCompleted(new Set((sess || []).map((s: any) => s.program_game_id).filter(Boolean)));
    }
    const { data: rep } = await supabase.from('autism_day_reports').select('*').eq('day_id', dayId).maybeSingle();
    setReport(rep);
    setLoading(false);
  };

  useEffect(() => { load(); }, [dayId]);

  const playGame = (g: Game, idx: number) => {
    const next = games[idx + 1];
    sessionStorage.setItem('autism_active_game', JSON.stringify({
      template_id: g.template_id,
      title_ar: g.title_ar,
      instructions_ar: g.instructions_ar,
      target_skill_ar: g.target_skill_ar,
      difficulty: g.difficulty,
      duration_sec: g.duration_sec,
      adaptations_ar: g.adaptations_ar,
      program_game_id: g.id,
      day_id: dayId,
      program_id: programId,
      next_game_index: next ? idx + 1 : null,
      day_back: `/damij/autism/program/${programId}/day/${dayId}`,
    }));
    navigate('/damij/autism/play');
  };

  const allDone = games.length > 0 && completed.size >= games.length;

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('autism-analyze-day', { body: { dayId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('تم إنشاء تقرير اليوم');
      await load();
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر التحليل'); }
    finally { setGeneratingReport(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!day) return <div className="text-center pt-20">اليوم غير موجود</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20" dir="rtl">
      <button onClick={() => navigate(`/damij/autism/program/${programId}`)}
        className="px-3 py-1.5 mb-4 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
        <ArrowRight className="w-4 h-4" /> الجدول
      </button>
      <header className="mb-6">
        <div className="text-sm text-slate-500">اليوم {day.day_index}</div>
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{day.theme_ar}</h1>
        <p className="text-slate-600 mt-1">{day.rationale_ar}</p>
        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] font-bold">المهارة: {day.focus_skill_ar}</span>
      </header>

      <div className="space-y-3 mb-8">
        {games.map((g, i) => {
          const meta = TEMPLATE_META[g.template_id];
          const done = completed.has(g.id);
          return (
            <div key={g.id} className={`p-4 rounded-2xl border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{meta?.emoji ?? '🎮'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-[hsl(var(--damij-primary))]">{g.title_ar}</div>
                    <div className="text-xs text-slate-500 mb-1">{g.target_skill_ar} • {g.duration_sec}ث • {g.difficulty}</div>
                    <p className="text-sm text-slate-700">{g.instructions_ar}</p>
                  </div>
                </div>
                <button onClick={() => playGame(g, i)}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white font-bold flex items-center gap-1 self-start">
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {done ? 'إعادة' : 'ابدأ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {allDone && !report && (
        <button onClick={generateReport} disabled={generatingReport}
          className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2">
          {generatingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          توليد تقرير اليوم
        </button>
      )}

      {report && (
        <section className="rounded-3xl p-6 bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200">
          <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-2">تقرير اليوم • {Math.round(report.score)}/100</h2>
          <p className="text-slate-700 mb-4">{report.summary_ar}</p>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-xl p-3"><div className="font-bold text-emerald-700 mb-1">نقاط قوة</div><ul className="list-disc pr-4 space-y-1">{report.strengths_ar?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
            <div className="bg-white rounded-xl p-3"><div className="font-bold text-amber-700 mb-1">نقاط ضعف</div><ul className="list-disc pr-4 space-y-1">{report.weaknesses_ar?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
            <div className="bg-white rounded-xl p-3"><div className="font-bold text-sky-700 mb-1">توصيات للغد</div><ul className="list-disc pr-4 space-y-1">{report.recommendations_ar?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AutismDayView;
