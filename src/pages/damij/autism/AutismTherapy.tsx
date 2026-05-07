import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AutismTherapy: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { navigate('/damij/autism/diagnosis', { replace: true }); return; }
    const prof = JSON.parse(raw);
    if (!prof?.profile_id) { navigate('/damij/autism/diagnosis', { replace: true }); return; }

    // Cached active program id?
    const cached = localStorage.getItem(`autism_active_program_${prof.profile_id}`);
    if (cached) { navigate(`/damij/autism/program/${cached}`, { replace: true }); return; }

    const { data } = await supabase
      .from('autism_programs')
      .select('id')
      .eq('child_profile_id', prof.profile_id)
      .eq('status', 'active')
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem(`autism_active_program_${prof.profile_id}`, data.id);
      navigate(`/damij/autism/program/${data.id}`, { replace: true });
    } else {
      navigate('/damij/autism/program/setup', { replace: true });
    }
    setChecking(false);
  })(); }, [navigate]);

  return (
    <div className="px-6 pt-12 pb-16 max-w-3xl mx-auto text-center" dir="rtl">
      <Sparkles className="w-16 h-16 mx-auto text-[hsl(var(--damij-accent-2))] mb-4" />
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-3">العلاج التفاعلي بالذكاء الاصطناعي</h1>
      <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--damij-accent-2))] mx-auto mt-6" />
      <p className="text-slate-500 mt-3">يتم تحضير برنامجك المحفوظ…</p>
    </div>
  );
};

export default AutismTherapy;
