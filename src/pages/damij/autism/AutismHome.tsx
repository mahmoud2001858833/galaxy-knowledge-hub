import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, Calendar, UserCircle, Baby } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';
import { supabase } from '@/integrations/supabase/client';

const AutismHome: React.FC = () => {
  const navigate = useNavigate();
  const [activeProgram, setActiveProgram] = useState<{ id: string; share_token: string } | null>(null);

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) return;
    const prof = JSON.parse(raw);
    if (!prof.profile_id) return;
    const { data } = await supabase.from('autism_programs')
      .select('id, share_token').eq('child_profile_id', prof.profile_id).eq('status', 'active').maybeSingle();
    if (data) setActiveProgram(data as any);
  })(); }, []);

  return (
    <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto" dir="rtl">
      <header className="text-center mb-12">
        <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mx-auto mb-5">
          <Brain className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-[hsl(var(--damij-primary))] mb-3">نظام التوحد الذكي</h1>
        <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto">
          تشخيص دقيق وبرنامج علاجي يومي مولّد بالذكاء الاصطناعي مع تتبّع كل حركة وتقارير أداء.
        </p>
        {activeProgram && (
          <button
            onClick={() => navigate(`/damij/autism/program/${activeProgram.id}`)}
            className="mt-4 px-5 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold inline-flex items-center gap-2">
            <Baby className="w-5 h-5" /> فتح صفحة الطفل
          </button>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SystemCard to="/damij/autism/diagnosis" icon={ClipboardList} title="التشخيص" description="فحص شامل مبني على CDC و AAP و NICE و WHO." accent="hsl(var(--damij-accent-2))" />
        <SystemCard to="/damij/autism/program/setup" icon={Calendar} title="إنشاء البرنامج" description="جدول علاجي يومي مولّد مرة واحدة لمدة أسابيع/أشهر." accent="hsl(var(--damij-accent-2))" />
        <SystemCard to="/damij/autism/therapy" icon={Brain} title="مكتبة الألعاب" description="ألعاب تفاعلية مفردة (وضع تجريب)." accent="hsl(var(--damij-accent-2))" />
        <SystemCard to="/damij/autism/profile" icon={UserCircle} title="ملف الطفل" description="سجل التقدم والتقارير اليومية." accent="hsl(var(--damij-accent-2))" />
      </div>
    </div>
  );
};

export default AutismHome;
