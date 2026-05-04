import React from 'react';
import { User, Activity, Brain, Ear, Eye } from 'lucide-react';

const cases = [
  { icon: Brain, name: 'حالة #1 — طفل، 5 سنوات', tag: 'يُشتبه بطيف توحّد', source: 'M-CHAT-R/F' },
  { icon: Activity, name: 'حالة #2 — طالب، 9 سنوات', tag: 'يُشتبه بـ ADHD مختلط', source: 'Vanderbilt' },
  { icon: Ear, name: 'حالة #3 — مراهق، 14 سنة', tag: 'إعاقة سمعية متوسطة', source: 'WHO ICF-CY' },
  { icon: Eye, name: 'حالة #4 — طفل، 7 سنوات', tag: 'كفّ بصر كلّي', source: 'WHO ICF-CY' },
  { icon: Brain, name: 'حالة #5 — طفل، 4 سنوات', tag: 'تأخر لغوي', source: 'DSM-5-TR' },
  { icon: Activity, name: 'حالة #6 — طالبة، 11 سنة', tag: 'ADHD نوع غافل', source: 'Conners-3' },
];

const ClinicalCases: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-8">مكتبة الحالات الافتراضية</h1>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cases.map((c, i) => (
        <div key={i} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center">
              <c.icon className="w-6 h-6" />
            </div>
            <User className="w-5 h-5 text-[hsl(var(--damij-text))]/40" />
          </div>
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2">{c.name}</h3>
          <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-3">{c.tag}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] font-semibold">{c.source}</span>
            <button className="text-sm font-bold text-[hsl(var(--damij-accent-2))]">افتح الحالة ←</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default ClinicalCases;
