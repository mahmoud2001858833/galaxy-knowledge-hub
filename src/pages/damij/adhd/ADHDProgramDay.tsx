import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getGame } from '@/features/adhd/games/registry';
import { toast } from 'sonner';

const ADHDProgramDay: React.FC = () => {
  const { programId, dayId } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const { data: d } = await supabase.from('adhd_program_days').select('*').eq('id', dayId).maybeSingle();
    setDay(d);
    const { data: g } = await supabase.from('adhd_program_games').select('*').eq('day_id', dayId).order('order_index');
    setGames(g ?? []);
    const { data: r } = await supabase.from('adhd_day_reports').select('*').eq('day_id', dayId).maybeSingle();
    setReport(r);
  };
  useEffect(() => { load(); }, [dayId]);

  const allCompleted = games.length > 0 && games.every(g=>g.completed);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data: prog } = await supabase.from('adhd_programs').select('*').eq('id', programId).maybeSingle();
      const { data: sessions } = await supabase.from('adhd_game_sessions').select('*').in('program_game_id', games.map(g=>g.id));
      const { data, error } = await supabase.functions.invoke('adhd-day-analyze', {
        body: { childName: prog?.child_name, dayIndex: day?.day_index, sessions: sessions ?? [] },
      });
      if (error) throw error;
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from('adhd_day_reports').insert({
        program_id: programId, day_id: dayId, user_id: userRes.user!.id,
        ai_report: data.ai_report, metrics: data.metrics, recommendations: data.recommendations,
      });
      await supabase.from('adhd_program_days').update({ status: 'completed', summary: data.metrics }).eq('id', dayId);
      toast.success('تم إنشاء تقرير اليوم');
      load();
    } catch (e: any) { toast.error(e.message); } finally { setGenerating(false); }
  };

  const completedCount = games.filter(g => g.completed).length;

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-3xl mx-auto" dir="rtl">
      <button onClick={() => navigate(`/damij/adhd/program/${programId}`)} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع للتقويم</button>
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-1">يوم {day?.day_index}</h1>
      <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-3">{completedCount} / {games.length} مكتملة</p>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-6">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completedCount / Math.max(1, games.length)) * 100}%` }} />
      </div>

      <div className="space-y-3 mb-6">
        {games.map(pg => {
          const def = getGame(pg.game_key);
          if (!def) return null;
          const handlePlay = () => {
            if (pg.completed && !confirm('تم لعب هذه اللعبة سابقاً. هل تريد إعادتها؟')) return;
            navigate(`/damij/adhd/games/play/${pg.game_key}?pg=${pg.id}&day=${dayId}`);
          };
          return (
            <div key={pg.id} className={`rounded-2xl p-4 bg-gradient-to-br ${def.color} text-white shadow-md flex items-center gap-3 ${pg.completed ? 'ring-2 ring-emerald-400' : ''}`}>
              <def.icon className="w-9 h-9" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold">{pg.title || def.title}</h4>
                  {pg.completed && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> تم اللعب</span>}
                </div>
                <p className="text-xs opacity-90">{pg.description || def.description}</p>
              </div>
              <button onClick={handlePlay} className="bg-white/25 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                {pg.completed ? <><CheckCircle2 className="w-4 h-4" /> إعادة</> : <><Play className="w-4 h-4" /> ابدأ</>}
              </button>
            </div>
          );
        })}
      </div>

      {allCompleted && !report && (
        <button onClick={generateReport} disabled={generating} className="w-full py-3 rounded-2xl bg-[hsl(var(--damij-warm))] text-white font-bold flex items-center justify-center gap-2">
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} إنشاء تقرير اليوم
        </button>
      )}
      {report && (
        <div className="bg-white rounded-2xl p-5 shadow-md whitespace-pre-wrap text-sm leading-loose">{report.ai_report}</div>
      )}
    </div>
  );
};
export default ADHDProgramDay;
