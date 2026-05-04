import React from 'react';
import { Brain, ClipboardList, Gamepad2, UserCircle } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';

const AutismHome: React.FC = () => (
  <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
    <header className="text-center mb-12">
      <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mx-auto mb-5">
        <Brain className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-[hsl(var(--damij-primary))] mb-3">نظام التوحد</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto">
        تحديد نوع التوحد بدقة وتقديم خطة علاجية تفاعلية مبنية على ألعاب تعليمية ومتابعة دورية.
      </p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SystemCard to="/damij/autism/diagnosis" icon={ClipboardList} title="تشخيص نوع التوحد" description="فحص أولي شامل: استبيان معتمد + ألعاب تفاعلية + تقرير AI مبني على CDC و AAP و NICE و WHO." accent="hsl(var(--damij-accent-2))" />
      <SystemCard to="/damij/autism/therapy" icon={Gamepad2} title="العلاج التفاعلي" description="مكتبة ألعاب علاجية مخصصة لكل حالة." accent="hsl(var(--damij-accent-2))" />
      <SystemCard to="/damij/autism/profile" icon={UserCircle} title="ملف الطفل" description="سجل التقدم والملاحظات والتقارير." accent="hsl(var(--damij-accent-2))" />
    </div>
  </div>
);

export default AutismHome;
