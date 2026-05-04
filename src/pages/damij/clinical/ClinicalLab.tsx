import React from 'react';
import { PlayCircle, FileBarChart, ListChecks, Microscope } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const steps = [
  { icon: ListChecks, t: 'Procedure', d: 'حدّد البروتوكول والأدوات' },
  { icon: PlayCircle, t: 'Run', d: 'شغّل الجلسة على الحالة الافتراضية' },
  { icon: Microscope, t: 'Details', d: 'حلّل الاستجابات لحظة بلحظة' },
  { icon: FileBarChart, t: 'Result', d: 'احصل على تقرير نهائي قابل للتصدير' },
];

const ClinicalLab: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-8">مختبر التجربة السريرية</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 text-center">
          <s.icon className="w-9 h-9 mx-auto mb-2 text-[hsl(var(--damij-primary))]" />
          <h3 className="font-bold text-[hsl(var(--damij-primary))]">{s.t}</h3>
          <p className="text-xs text-[hsl(var(--damij-text))]/70 mt-1">{s.d}</p>
        </div>
      ))}
    </div>
    <PlaceholderPanel description="محرّك المحاكاة سيُربط بمرحلة لاحقة. ستتمكن هنا من تشغيل بروتوكولات DSM-5 و ADOS-2 على حالات افتراضية ومراقبة الاستجابات الزمنية." />
  </div>
);
export default ClinicalLab;
