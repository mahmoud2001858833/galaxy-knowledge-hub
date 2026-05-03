import React from 'react';
import { Puzzle, Music, Palette, Users, Smile, Image as ImageIcon } from 'lucide-react';

const games = [
  { icon: Puzzle, title: 'لعبة المطابقة', desc: 'تعزيز الإدراك البصري' },
  { icon: Music, title: 'إيقاعات هادئة', desc: 'تنظيم حسي سمعي' },
  { icon: Palette, title: 'ألوان المشاعر', desc: 'التعرف على المشاعر' },
  { icon: Users, title: 'تواصل اجتماعي', desc: 'مهارات التفاعل' },
  { icon: Smile, title: 'تعابير الوجه', desc: 'قراءة الإشارات الاجتماعية' },
  { icon: ImageIcon, title: 'قصص مصورة', desc: 'تسلسل الأحداث' },
];

const AutismTherapy: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">العلاج التفاعلي</h1>
    <p className="text-[hsl(var(--damij-text))]/70 mb-8">مكتبة ألعاب علاجية — كل لعبة تستهدف مهارة محددة.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {games.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:shadow-lg transition cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-1">{title}</h3>
          <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-4">{desc}</p>
          <button className="text-sm font-semibold text-[hsl(var(--damij-accent-2))]">قريباً →</button>
        </div>
      ))}
    </div>
  </div>
);

export default AutismTherapy;
