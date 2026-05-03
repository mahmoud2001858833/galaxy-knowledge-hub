import React from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const AutismProfile: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">ملف الطفل</h1>
    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      {['الاسم', 'العمر', 'تاريخ التشخيص', 'المعالج المسؤول'].map((l) => (
        <div key={l} className="p-4 rounded-xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <label className="text-sm text-[hsl(var(--damij-text))]/60">{l}</label>
          <input className="w-full bg-transparent outline-none mt-1 font-semibold" placeholder="—" />
        </div>
      ))}
    </div>
    <PlaceholderPanel title="سجل التقدم" description="سيتم ربط قاعدة بيانات لتسجيل التطور والتقارير." />
  </div>
);

export default AutismProfile;
