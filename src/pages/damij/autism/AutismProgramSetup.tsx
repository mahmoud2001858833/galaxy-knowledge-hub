import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DURATIONS = [
  { days: 14, label: 'أسبوعان' },
  { days: 30, label: 'شهر' },
  { days: 60, label: 'شهران' },
  { days: 90, label: '3 أشهر' },
];

const AutismProgramSetup: React.FC = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { toast.error('أكمل التشخيص أولاً'); navigate('/damij/autism/diagnosis'); return; }
    const profile = JSON.parse(raw);
    if (!profile.profile_id) { toast.error('ملف الطفل غير مكتمل'); return; }

    setLoading(true);
    try {
      // Check existing
      const { data: existing } = await supabase
        .from('autism_programs')
        .select('id, share_token')
        .eq('child_profile_id', profile.profile_id)
        .eq('status', 'active')
        .maybeSingle();
      if (existing) {
        toast.success('برنامج هذا الطفل موجود مسبقاً');
        navigate(`/damij/autism/program/${existing.id}`);
        return;
      }
      const { data, error } = await supabase.functions.invoke('autism-generate-program', {
        body: { profile, totalDays: days, childProfileId: profile.profile_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('تم إنشاء البرنامج بنجاح');
      navigate(`/damij/autism/program/${data.programId}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'تعذّر إنشاء البرنامج');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-20" dir="rtl">
      <header className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">إنشاء برنامج علاجي يومي</h1>
        <p className="text-slate-600">يولّد الذكاء الاصطناعي جدولاً يومياً كاملاً لمدة محددة، ويُحفظ بشكل دائم بدون إعادة توليد.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {DURATIONS.map(d => (
          <button key={d.days} onClick={() => setDays(d.days)}
            className={`p-4 rounded-2xl border-2 transition font-bold ${days === d.days ? 'border-[hsl(var(--damij-accent-2))] bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))]' : 'border-slate-200 bg-white text-slate-700'}`}>
            <div className="text-2xl">{d.days}</div>
            <div className="text-xs">{d.label}</div>
          </button>
        ))}
      </div>

      <button onClick={start} disabled={loading}
        className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> يولّد البرنامج…</> : <><Sparkles className="w-5 h-5" /> ابدأ التوليد</>}
      </button>
      <p className="text-center text-xs text-slate-500 mt-3">قد يستغرق التوليد دقيقة لكل أسبوعين تقريباً</p>
    </div>
  );
};

export default AutismProgramSetup;
