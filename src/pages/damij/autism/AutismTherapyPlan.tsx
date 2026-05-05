import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Play, ChevronRight, BookOpen, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATE_META } from '@/features/autism/games/templates/registry';
import { SCREENING_DISCLAIMER_AR } from '@/features/autism/sources';

interface PlanGame {
  template_id: string;
  title_ar: string;
  instructions_ar: string;
  target_skill_ar: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_sec: number;
  success_criteria_ar: string;
  adaptations_ar: string[];
}
interface PlanStage { stage: number; title_ar: string; rationale_ar: string; games: PlanGame[]; }
interface TherapyPlan { plan_title: string; plan_summary_ar: string; stages: PlanStage[]; caregiver_tips_ar: string[]; }

const STAGE_COLORS = ['from-sky-100 to-sky-50', 'from-emerald-100 to-emerald-50', 'from-violet-100 to-violet-50', 'from-amber-100 to-amber-50'];

const AutismTherapyPlan: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<TherapyPlan | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => {
    try {
      // Load profile from localStorage (set by AutismDiagnosis)
      const raw = localStorage.getItem('autism_active_profile');
      if (!raw) { setError('لا يوجد ملف تشخيصي. أكمل التشخيص أولاً.'); setLoading(false); return; }
      const prof = JSON.parse(raw);
      setProfile(prof);

      // Try existing plan from DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user && prof.profile_id) {
        const { data: existing } = await supabase
          .from('autism_therapy_plans')
          .select('id, plan')
          .eq('child_profile_id', prof.profile_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing?.plan) { setPlan(existing.plan as any); setPlanId(existing.id); setLoading(false); return; }
      }

      // Generate new
      const { data, error: fnErr } = await supabase.functions.invoke('autism-generate-therapy-plan', {
        body: { profile: prof },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      if (!data?.plan) throw new Error('Empty plan');
      setPlan(data.plan);

      // Save
      if (user && prof.profile_id) {
        const { data: saved } = await supabase
          .from('autism_therapy_plans')
          .insert({ user_id: user.id, child_profile_id: prof.profile_id, plan: data.plan })
          .select('id').single();
        if (saved) setPlanId(saved.id);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'تعذّر إنشاء الخطة');
      toast.error('تعذّر إنشاء الخطة');
    } finally { setLoading(false); }
  })(); }, []);

  const openGame = (stage: number, game: PlanGame) => {
    sessionStorage.setItem('autism_active_game', JSON.stringify({ ...game, stage, planId }));
    navigate('/damij/autism/play');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--damij-accent-2))]" />
      <p className="text-[hsl(var(--damij-text))]/70">يُنشئ الذكاء الاصطناعي خطة علاج مخصّصة...</p>
    </div>
  );

  if (error || !plan) return (
    <div className="max-w-xl mx-auto pt-12 px-6 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => navigate('/damij/autism/diagnosis')} className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-semibold">
        ابدأ التشخيص
      </button>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-5xl mx-auto" dir="rtl">
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-accent-2))] text-xs font-semibold mb-3">
          <Sparkles className="w-4 h-4" /> خطة مولّدة بالذكاء الاصطناعي
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--damij-primary))] mb-2">{plan.plan_title}</h1>
        <p className="text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto">{plan.plan_summary_ar}</p>
      </header>

      {profile && (
        <div className="bg-white rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/10 mb-6 grid sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-slate-500">الاسم:</span> <strong>{profile.child_name || '—'}</strong></div>
          <div><span className="text-slate-500">مستوى الدعم:</span> <strong>{profile.support_level ?? '—'}</strong></div>
          <div><span className="text-slate-500">الملف:</span> <strong>{profile.functional_profile ?? '—'}</strong></div>
        </div>
      )}

      <div className="space-y-6">
        {plan.stages.map((stage, idx) => (
          <section key={stage.stage} className={`rounded-3xl p-6 bg-gradient-to-br ${STAGE_COLORS[idx % 4]} border border-white/60`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center font-bold text-[hsl(var(--damij-primary))]">{stage.stage}</div>
              <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))]">{stage.title_ar}</h2>
            </div>
            <p className="text-sm text-slate-700/85 mb-4 leading-relaxed">{stage.rationale_ar}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {stage.games.map((g, gi) => {
                const meta = TEMPLATE_META[g.template_id];
                return (
                  <button key={gi} onClick={() => openGame(stage.stage, g)}
                    className="text-right bg-white rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{meta?.emoji ?? '🎮'}</span>
                        <div>
                          <div className="font-bold text-[hsl(var(--damij-primary))]">{g.title_ar}</div>
                          <div className="text-xs text-slate-500">{g.target_skill_ar}</div>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-[hsl(var(--damij-accent-2))] opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{g.instructions_ar}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100">⏱ {g.duration_sec}ث</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100">{g.difficulty === 'easy' ? 'سهل' : g.difficulty === 'medium' ? 'متوسط' : 'متقدم'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {plan.caregiver_tips_ar?.length > 0 && (
        <section className="mt-8 rounded-2xl bg-[hsl(var(--damij-surface))] p-5 border border-[hsl(var(--damij-primary))]/10">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" /> نصائح لمقدّم الرعاية</h3>
          <ul className="space-y-2 text-sm text-slate-700 list-disc pr-5">
            {plan.caregiver_tips_ar.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      )}

      <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-2 text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p>{SCREENING_DISCLAIMER_AR}</p>
      </div>
    </div>
  );
};

export default AutismTherapyPlan;
