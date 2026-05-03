import React from 'react';
import { Activity, ListChecks, Target } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';

const ADHDHome: React.FC = () => (
  <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
    <header className="text-center mb-12">
      <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--damij-warm))]/20 text-[hsl(var(--damij-warm))] flex items-center justify-center mx-auto mb-5">
        <Activity className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-[hsl(var(--damij-primary))] mb-3">نظام فرط الحركة وتشتت الانتباه</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto">
        تشخيص تفريقي دقيق لاضطراب ADHD وتمارين علاجية مصممة لتحسين التركيز والتنظيم.
      </p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SystemCard to="/damij/adhd/screening" icon={ListChecks} title="التشخيص التفريقي" description="استبيان لتحديد نوع الاضطراب: تشتت، فرط حركة، أو مختلط." accent="hsl(var(--damij-warm))" />
      <SystemCard to="/damij/adhd/training" icon={Target} title="تمارين علاجية" description="تدريبات تركيز ومهام منظمة لتحسين الأداء." accent="hsl(var(--damij-warm))" />
    </div>
  </div>
);

export default ADHDHome;
