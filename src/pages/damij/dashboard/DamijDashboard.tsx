import React from 'react';
import { Users, Activity, ClipboardCheck, TrendingUp } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const stats = [
  { icon: Users, label: 'الأطفال المسجلون', value: '—' },
  { icon: ClipboardCheck, label: 'تقييمات مكتملة', value: '—' },
  { icon: Activity, label: 'جلسات علاجية', value: '—' },
  { icon: TrendingUp, label: 'نسبة التحسن', value: '—' },
];

const DamijDashboard: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-8">لوحة المختص وولي الأمر</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <Icon className="w-8 h-8 text-[hsl(var(--damij-primary))] mb-3" />
          <div className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{value}</div>
          <div className="text-sm text-[hsl(var(--damij-text))]/70">{label}</div>
        </div>
      ))}
    </div>
    <PlaceholderPanel title="التقارير الذكية" description="سيتم ربط لوحة بيانات حية وإحصاءات تفصيلية لاحقاً." />
  </div>
);

export default DamijDashboard;
