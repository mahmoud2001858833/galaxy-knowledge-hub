import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Wand2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATE_REGISTRY } from '@/features/autism/games/templates/registry';

const AutismTherapy: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { navigate('/damij/autism/diagnosis', { replace: true }); return; }
    const prof = JSON.parse(raw);
    if (!prof?.profile_id) { navigate('/damij/autism/diagnosis', { replace: true }); return; }
    setProfile(prof);

    const cached = localStorage.getItem(`autism_active_program_${prof.profile_id}`);
    if (cached) { setProgramId(cached); setChecking(false); return; }

    const { data } = await supabase
      .from('autism_programs')
      .select('id')
      .eq('child_profile_id', prof.profile_id)
      .eq('status', 'active')
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem(`autism_active_program_${prof.profile_id}`, data.id);
      setProgramId(data.id);
    }
    setChecking(false);
  })(); }, [navigate]);

  const launchAIPersonalGame = async () => {
    if (!profile) return;
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('autism-generate-diagnostic-games', {
        body: {
          ageMonths: (profile.age_years || 5) * 12,
          ageTrack: (profile.age_years || 5) < 3 ? 'toddler' : (profile.age_years || 5) < 12 ? 'child' : 'adolescent',
          name: profile.child_name,
          initialConcerns: profile.notes_summary ? [profile.notes_summary] : [],
        },
      });
      if (error) throw error;
      const games = (data?.games || []).filter((g: any) => TEMPLATE_REGISTRY[g.template_id]);
      const first = games[0];
      if (!first) throw new Error('No game generated');
      sessionStorage.setItem('autism_active_game', JSON.stringify({
        template_id: first.template_id,
        title_ar: `🤖 ${first.title_ar}`,
        instructions_ar: first.instructions_ar,
        target_skill_ar: first.target_skill_ar,
        difficulty: first.difficulty,
        duration_sec: first.duration_sec,
        adaptations_ar: first.adaptations_ar || [],
        next_game_index: null,
        day_back: '/damij/autism/therapy',
      }));
      navigate('/damij/autism/game');
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر توليد لعبة AI');
    } finally {
      setGeneratingAI(false);
    }
  };

  if (checking) {
    return (
      <div className="px-6 pt-12 text-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--damij-accent-2))]" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-10 pb-16 max-w-3xl mx-auto" dir="rtl">
      <header className="text-center mb-8">
        <Sparkles className="w-14 h-14 mx-auto text-[hsl(var(--damij-accent-2))] mb-3" />
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">العلاج التفاعلي بالذكاء الاصطناعي</h1>
        <p className="text-sm text-slate-600">
          {profile?.child_name ? `لـ ${profile.child_name} • ` : ''}اختر نوع الجلسة الآن:
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={launchAIPersonalGame}
          disabled={generatingAI}
          className="text-right p-6 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-accent-2))]/10 to-[hsl(var(--damij-primary))]/5 border-2 border-[hsl(var(--damij-accent-2))]/30 hover:border-[hsl(var(--damij-accent-2))] transition disabled:opacity-60"
        >
          <Wand2 className="w-10 h-10 text-[hsl(var(--damij-accent-2))] mb-3" />
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-1">
            {generatingAI ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> يولّد AI لعبة…</span> : '🎮 لعبة علاجية مخصّصة فوراً'}
          </h3>
          <p className="text-xs text-slate-600">يولّد الذكاء الاصطناعي لعبة مفصّلة على ملف طفلك (الطيف يختلف من حالة لأخرى).</p>
        </button>

        <button
          onClick={() => programId ? navigate(`/damij/autism/program/${programId}`) : navigate('/damij/autism/program/setup')}
          className="text-right p-6 rounded-3xl bg-white border-2 border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40 transition"
        >
          <Calendar className="w-10 h-10 text-[hsl(var(--damij-primary))] mb-3" />
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-1">
            {programId ? '📅 برنامجي العلاجي اليومي' : '✨ أنشئ برنامجاً علاجياً'}
          </h3>
          <p className="text-xs text-slate-600">جلسات يومية مهيكلة مع متابعة طويلة المدى وتقارير تقدّم.</p>
        </button>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
        💡 <b>ملاحظة:</b> العلاج باللعب يعمل أفضل في جلسات قصيرة (10–20 دقيقة) متكرّرة يومياً. يمكنك الجمع بين اللعبة المخصّصة والبرنامج اليومي.
      </div>
    </div>
  );
};

export default AutismTherapy;
