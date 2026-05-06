import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ADHDGameEngine from '@/features/adhd/games/ADHDGameEngine';
import { getGame, SCREENING_BATTERY } from '@/features/adhd/games/registry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ADHDGamePlay: React.FC = () => {
  const { gameKey = '' } = useParams();
  const [params] = useSearchParams();
  const isBattery = params.get('battery') === '1';
  const programGameId = params.get('pg') || undefined;
  const programDayId = params.get('day') || undefined;
  const navigate = useNavigate();
  const game = getGame(gameKey);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!game) return <div className="p-12 text-center" dir="rtl">لعبة غير موجودة</div>;

  const handleComplete = async ({ events, score, durationMs }: any) => {
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { toast.error('سجّل الدخول لحفظ النتيجة'); navigate('/auth'); return; }

      const { data: analysis } = await supabase.functions.invoke('adhd-game-analyze', {
        body: { events, gameKey, durationMs },
      });

      await supabase.from('adhd_game_sessions').insert({
        user_id: userRes.user.id,
        game_key: gameKey,
        mode: programGameId ? 'therapy' : 'screening',
        program_game_id: programGameId,
        events,
        summary: analysis?.summary ?? {},
        metrics: analysis?.metrics ?? {},
        score: analysis?.score ?? score,
        duration_ms: durationMs,
        ended_at: new Date().toISOString(),
      });

      if (programGameId) {
        await supabase.from('adhd_program_games').update({ completed: true, best_score: analysis?.score ?? score }).eq('id', programGameId);
      }

      if (isBattery) {
        const raw = localStorage.getItem('adhd_battery_progress');
        const arr: string[] = raw ? JSON.parse(raw) : [];
        if (!arr.includes(gameKey)) arr.push(gameKey);
        localStorage.setItem('adhd_battery_progress', JSON.stringify(arr));
        const next = SCREENING_BATTERY.find(k => !arr.includes(k));
        setDone(true);
        setTimeout(() => {
          if (next) navigate(`/damij/adhd/games/play/${next}?battery=1`);
          else navigate('/damij/adhd/games');
        }, 1200);
      } else if (programDayId) {
        setDone(true);
        setTimeout(() => navigate(-1), 1000);
      } else {
        setDone(true);
        setTimeout(() => navigate('/damij/adhd/games'), 1500);
      }
    } catch (e: any) {
      toast.error(e.message || 'تعذّر الحفظ');
    } finally { setSaving(false); }
  };

  if (done || saving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--damij-bg))]" dir="rtl">
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center">
          {saving ? <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-warm))] mx-auto" /> : <div className="text-6xl mb-4">🎉</div>}
          <p className="font-bold text-xl mt-3 text-[hsl(var(--damij-primary))]">{saving ? 'جاري التحليل…' : 'أحسنت!'}</p>
        </motion.div>
      </div>
    );
  }

  return <ADHDGameEngine game={game} onComplete={handleComplete} />;
};

export default ADHDGamePlay;
