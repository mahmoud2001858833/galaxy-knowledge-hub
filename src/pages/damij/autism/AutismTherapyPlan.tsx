import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AutismTherapyPlan: React.FC = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('يتم فتح برنامجك المحفوظ…');

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { navigate('/damij/autism/diagnosis', { replace: true }); return; }
    const prof = JSON.parse(raw);
    if (!prof?.profile_id) { navigate('/damij/autism/diagnosis', { replace: true }); return; }

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
      setMsg('لا يوجد برنامج بعد. توجّه لإنشاء البرنامج لأول مرة.');
      setTimeout(() => navigate('/damij/autism/program/setup', { replace: true }), 800);
    }
  })(); }, [navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" dir="rtl">
      <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--damij-accent-2))]" />
      <p className="text-[hsl(var(--damij-text))]/70">{msg}</p>
    </div>
  );
};

export default AutismTherapyPlan;
