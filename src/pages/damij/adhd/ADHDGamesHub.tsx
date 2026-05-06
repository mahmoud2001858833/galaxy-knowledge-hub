import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { GAMES, SCREENING_BATTERY, getGame } from '@/features/adhd/games/registry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ADHDGamesHub: React.FC = () => {
  const navigate = useNavigate();
  const [batteryProgress, setBatteryProgress] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('adhd_battery_progress');
    if (raw) try { setBatteryProgress(JSON.parse(raw)); } catch {}
  }, []);

  const startBattery = () => {
    localStorage.setItem('adhd_battery_progress', JSON.stringify([]));
    setBatteryProgress([]);
    navigate(`/damij/adhd/games/play/${SCREENING_BATTERY[0]}?battery=1`);
  };

  const continueBattery = () => {
    const next = SCREENING_BATTERY.find(k => !batteryProgress.includes(k));
    if (!next) return finishBattery();
    navigate(`/damij/adhd/games/play/${next}?battery=1`);
  };

  const finishBattery = async () => {
    setGenerating(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { toast.error('سجّل الدخول أولاً'); return; }
      const { data: sessions } = await supabase.from('adhd_game_sessions')
        .select('*')
        .eq('user_id', userRes.user.id)
        .eq('mode', 'screening')
        .order('created_at', { ascending: false })
        .limit(SCREENING_BATTERY.length);
      const { data: report, error } = await supabase.functions.invoke('adhd-combined-report', {
        body: { sessions: sessions ?? [] },
      });
      if (error) throw error;
      const { data: saved } = await supabase.from('adhd_diagnostic_reports').insert({
        user_id: userRes.user.id,
        battery_session_ids: (sessions ?? []).map((s:any)=>s.id),
        metrics: report.metrics,
        ai_report: report.ai_report,
        recommendations: report.recommendations,
        dsm_category: report.dsm_category,
      }).select('id').single();
      localStorage.removeItem('adhd_battery_progress');
      if (saved) navigate(`/damij/adhd/games/report/${saved.id}`);
    } catch (e: any) {
      toast.error(e.message || 'تعذّر إنشاء التقرير');
    } finally { setGenerating(false); }
  };

  const completed = batteryProgress.length;
  const total = SCREENING_BATTERY.length;

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-5xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">التشخيص باللعب</h1>
        <p className="text-[hsl(var(--damij-text))]/70">بطارية من 6 ألعاب علمية تقيس فعلياً الانتباه، التحكم، الذاكرة، والمرونة. كل حركة تُسجَّل وتُحلَّل بالذكاء الاصطناعي.</p>
      </header>

      {/* Battery card */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Sparkles className="w-4 h-4" /> بطارية التشخيص الكاملة</div>
            <h2 className="text-2xl font-bold">قيّم نفسك في 10 دقائق</h2>
          </div>
          {completed > 0 && completed < total ? (
            <button onClick={continueBattery} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Play className="w-4 h-4" /> أكمل ({completed}/{total})
            </button>
          ) : completed === total ? (
            <button onClick={finishBattery} disabled={generating} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} عرض التقرير الموحّد
            </button>
          ) : (
            <button onClick={startBattery} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Play className="w-4 h-4" /> ابدأ البطارية
            </button>
          )}
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${(completed/total)*100}%` }} />
        </div>
      </motion.div>

      <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4">ألعاب التشخيص (يمكن لعبها فردياً)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCREENING_BATTERY.map((key, i) => {
          const g = getGame(key)!;
          const done = batteryProgress.includes(key);
          return (
            <motion.div key={key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
              <Link to={`/damij/adhd/games/play/${key}`} className={`block rounded-3xl p-5 bg-gradient-to-br ${g.color} text-white shadow-lg hover:shadow-2xl transition-all relative`}>
                {done && <div className="absolute top-3 left-3"><CheckCircle2 className="w-6 h-6" /></div>}
                <g.icon className="w-9 h-9 mb-3" />
                <h4 className="text-lg font-bold mb-1">{g.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{g.description}</p>
                <div className="text-xs mt-3 bg-black/20 inline-block px-2 py-0.5 rounded-full">⏱ {g.durationSec}ث</div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ADHDGamesHub;
