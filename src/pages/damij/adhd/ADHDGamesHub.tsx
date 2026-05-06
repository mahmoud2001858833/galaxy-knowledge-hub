import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle2, Sparkles, Loader2, ListOrdered, Brain, Heart } from 'lucide-react';
import { GAMES, SCREENING_BATTERY, THERAPY_SEQUENCE, getGame } from '@/features/adhd/games/registry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADHDGamesHub: React.FC = () => {
  const navigate = useNavigate();
  const [batteryProgress, setBatteryProgress] = useState<string[]>([]);
  const [therapyProgress, setTherapyProgress] = useState<string[]>([]);
  const [sp] = useSearchParams();
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState(sp.get('tab') === 'therapy' ? 'therapy' : 'diagnostic');

  useEffect(() => {
    try {
      const b = localStorage.getItem('adhd_battery_progress'); if (b) setBatteryProgress(JSON.parse(b));
      const t = localStorage.getItem('adhd_therapy_progress'); if (t) setTherapyProgress(JSON.parse(t));
    } catch {}
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
  const startTherapySeq = () => {
    localStorage.setItem('adhd_therapy_progress', JSON.stringify([]));
    setTherapyProgress([]);
    navigate(`/damij/adhd/games/play/${THERAPY_SEQUENCE[0]}?seq=therapy`);
  };
  const continueTherapy = () => {
    const next = THERAPY_SEQUENCE.find(k => !therapyProgress.includes(k));
    if (!next) { toast.success('أكملت كل ألعاب العلاج 🎉'); return; }
    navigate(`/damij/adhd/games/play/${next}?seq=therapy`);
  };

  const finishBattery = async () => {
    setGenerating(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { toast.error('سجّل الدخول أولاً'); return; }
      const { data: sessions } = await supabase.from('adhd_game_sessions')
        .select('*').eq('user_id', userRes.user.id).eq('mode', 'screening')
        .order('created_at', { ascending: false }).limit(SCREENING_BATTERY.length);
      const { data: report, error } = await supabase.functions.invoke('adhd-combined-report', { body: { sessions: sessions ?? [] } });
      if (error) throw error;
      const { data: saved } = await supabase.from('adhd_diagnostic_reports').insert({
        user_id: userRes.user.id,
        battery_session_ids: (sessions ?? []).map((s:any)=>s.id),
        metrics: report.metrics, ai_report: report.ai_report,
        recommendations: report.recommendations, dsm_category: report.dsm_category,
      }).select('id').single();
      localStorage.removeItem('adhd_battery_progress');
      if (saved) navigate(`/damij/adhd/games/report/${saved.id}`);
    } catch (e: any) { toast.error(e.message || 'تعذّر إنشاء التقرير'); }
    finally { setGenerating(false); }
  };

  const diagnosticGames = GAMES.filter(g => g.kind === 'both' || g.kind === 'screening');
  const therapyGames = GAMES.filter(g => g.kind === 'therapy' || g.kind === 'both');
  const completed = batteryProgress.length;
  const total = SCREENING_BATTERY.length;
  const tCompleted = therapyProgress.length;
  const tTotal = THERAPY_SEQUENCE.length;

  const renderOrderedCard = (key: string, idx: number, doneSet: string[], queryParam: string) => {
    const g = getGame(key); if (!g) return null;
    const done = doneSet.includes(key);
    return (
      <motion.div key={key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:idx*0.03}}>
        <Link to={`/damij/adhd/games/play/${key}?${queryParam}`} className={`block rounded-3xl p-5 bg-gradient-to-br ${g.color} text-white shadow-lg hover:shadow-2xl transition-all relative`}>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center font-bold text-sm">{idx+1}</div>
          {done && <div className="absolute top-3 left-3"><CheckCircle2 className="w-6 h-6" /></div>}
          <g.icon className="w-9 h-9 mb-3 mt-6" />
          <h4 className="text-lg font-bold mb-1">{g.title}</h4>
          <p className="text-xs opacity-90 leading-relaxed">{g.description}</p>
          <div className="text-xs mt-3 bg-black/20 inline-block px-2 py-0.5 rounded-full">⏱ {g.durationSec}ث</div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-6xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">مركز ألعاب فرط الحركة</h1>
        <p className="text-[hsl(var(--damij-text))]/70">شخّص نفسك بالألعاب، ثم تدرّب بألعاب علاجية متسلسلة. اضغط "العب" لتشغيل الألعاب بالترتيب.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="diagnostic" className="gap-2"><Brain className="w-4 h-4" /> تشخيص</TabsTrigger>
          <TabsTrigger value="therapy" className="gap-2"><Heart className="w-4 h-4" /> علاج</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic" className="space-y-6">
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Sparkles className="w-4 h-4" /> بطارية التشخيص الكاملة</div>
                <h2 className="text-2xl font-bold">قيّم نفسك في 10 دقائق</h2>
              </div>
              {completed > 0 && completed < total ? (
                <button onClick={continueBattery} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Play className="w-4 h-4" /> أكمل ({completed}/{total})</button>
              ) : completed === total ? (
                <button onClick={finishBattery} disabled={generating} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} عرض التقرير
                </button>
              ) : (
                <button onClick={startBattery} className="bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><ListOrdered className="w-4 h-4" /> العب بالترتيب</button>
              )}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${(completed/total)*100}%` }} />
            </div>
          </motion.div>

          <div>
            <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4">ألعاب التشخيص ({diagnosticGames.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diagnosticGames.map((g, i) => {
                const done = batteryProgress.includes(g.key);
                return (
                  <motion.div key={g.key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                    <Link to={`/damij/adhd/games/play/${g.key}`} className={`block rounded-3xl p-5 bg-gradient-to-br ${g.color} text-white shadow-lg hover:shadow-2xl transition-all relative`}>
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
        </TabsContent>

        <TabsContent value="therapy" className="space-y-6">
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Heart className="w-4 h-4" /> برنامج العلاج بالألعاب</div>
                <h2 className="text-2xl font-bold">{tTotal} لعبة علاجية بترتيب علمي</h2>
              </div>
              {tCompleted > 0 && tCompleted < tTotal ? (
                <button onClick={continueTherapy} className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Play className="w-4 h-4" /> أكمل ({tCompleted}/{tTotal})</button>
              ) : (
                <button onClick={startTherapySeq} className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><ListOrdered className="w-4 h-4" /> العب بالترتيب</button>
              )}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${(tCompleted/tTotal)*100}%` }} />
            </div>
          </motion.div>

          <div>
            <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4">المسار العلاجي المرتّب ({tTotal})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {THERAPY_SEQUENCE.map((k, i) => renderOrderedCard(k, i, therapyProgress, 'seq=therapy'))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-4 mt-6">مكتبة الألعاب العلاجية الكاملة ({therapyGames.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {therapyGames.map((g, i) => (
                <motion.div key={g.key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}>
                  <Link to={`/damij/adhd/games/play/${g.key}`} className={`block rounded-3xl p-5 bg-gradient-to-br ${g.color} text-white shadow-lg hover:shadow-2xl transition-all`}>
                    <g.icon className="w-9 h-9 mb-3" />
                    <h4 className="text-lg font-bold mb-1">{g.title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{g.description}</p>
                    <div className="text-xs mt-3 bg-black/20 inline-block px-2 py-0.5 rounded-full">⏱ {g.durationSec}ث</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ADHDGamesHub;
