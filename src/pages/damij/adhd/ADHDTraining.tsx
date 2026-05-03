import React from 'react';
import { Timer, Target, Brain, Layers } from 'lucide-react';

const drills = [
  { icon: Timer, title: 'تمرين التركيز الزمني', desc: 'مهام قصيرة بزمن تصاعدي' },
  { icon: Target, title: 'إصابة الهدف', desc: 'تركيز بصري مستمر' },
  { icon: Brain, title: 'الذاكرة العاملة', desc: 'تذكر تسلسلات قصيرة' },
  { icon: Layers, title: 'ترتيب المهام', desc: 'تنظيم خطوات الحل' },
];

const ADHDTraining: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">تمارين علاجية</h1>
    <p className="text-[hsl(var(--damij-text))]/70 mb-8">تدريبات تفاعلية متدرجة لبناء التركيز والتنظيم.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {drills.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:shadow-lg transition cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-warm))]/20 text-[hsl(var(--damij-warm))] flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-1">{title}</h3>
          <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-3">{desc}</p>
          <span className="text-xs font-semibold text-[hsl(var(--damij-warm))]">قريباً</span>
        </div>
      ))}
    </div>
  </div>
);

export default ADHDTraining;
