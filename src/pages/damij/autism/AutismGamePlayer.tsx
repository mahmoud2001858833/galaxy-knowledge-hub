import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATE_REGISTRY, TEMPLATE_META } from '@/features/autism/games/templates/registry';

const AutismGamePlayer: React.FC = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [done, setDone] = useState<{ accuracy: number; durationMs: number; raw?: any } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('autism_active_game');
    if (!raw) { navigate('/damij/autism/therapy'); return; }
    setGame(JSON.parse(raw));
  }, [navigate]);

  const Component = useMemo(() => game ? TEMPLATE_REGISTRY[game.template_id] : null, [game]);

  if (!game) return null;
  const meta = TEMPLATE_META[game.template_id];

  const handleComplete = async (metrics: { accuracy: number; raw?: any }, durationMs: number) => {
    setDone({ accuracy: metrics.accuracy, durationMs, raw: metrics.raw });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profRaw = localStorage.getItem('autism_active_profile');
        const prof = profRaw ? JSON.parse(profRaw) : {};
        await supabase.from('autism_game_sessions').insert({
          user_id: user.id,
          child_profile_id: prof.profile_id ?? null,
          plan_id: game.planId ?? null,
          template_id: game.template_id,
          stage: game.stage ?? null,
          difficulty: game.difficulty,
          accuracy: metrics.accuracy,
          duration_sec: Math.round(durationMs / 1000),
          raw_metrics: metrics.raw ?? {},
        });
      }
    } catch (e) { console.warn('save session failed', e); }
  };

  const handleSkip = () => {
    toast.info('تم تخطّي اللعبة');
    navigate('/damij/autism/therapy');
  };

  if (done) {
    const pct = Math.round(done.accuracy * 100);
    return (
      <div className="max-w-xl mx-auto pt-12 px-6 text-center" dir="rtl">
        <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">أحسنت!</h2>
        <p className="text-slate-600 mb-6">دقة الأداء: <strong>{pct}%</strong> • المدة: {Math.round(done.durationMs / 1000)} ثانية</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setDone(null); }}
            className="px-5 py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> إعادة
          </button>
          <button onClick={() => navigate('/damij/autism/therapy')}
            className="px-5 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold">
            العودة للخطة
          </button>
        </div>
        {game.adaptations_ar?.length > 0 && (
          <div className="mt-6 text-right bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 mb-2 text-sm">💡 إذا واجه الطفل صعوبة:</h4>
            <ul className="text-sm text-amber-900 space-y-1 list-disc pr-5">
              {game.adaptations_ar.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-6 pb-12 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/damij/autism/therapy')}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> الخطة
        </button>
        <div className="text-center">
          <h1 className="font-bold text-[hsl(var(--damij-primary))]">{meta?.emoji} {game.title_ar}</h1>
          <p className="text-xs text-slate-500">{game.target_skill_ar}</p>
        </div>
        <div className="w-20" />
      </div>
      <div className="bg-white rounded-3xl border border-[hsl(var(--damij-primary))]/10 overflow-hidden">
        {Component ? (
          <Component
            key={game.template_id}
            difficulty={game.difficulty}
            durationSec={game.duration_sec}
            instructions={game.instructions_ar}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">قالب اللعبة غير متوفر.</div>
        )}
      </div>
    </div>
  );
};

export default AutismGamePlayer;
