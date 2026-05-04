import React from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

const lessons = [
  { t: 'أبجدية الإشارة العربية', d: '28 حرفاً تفاعلياً' },
  { t: 'الأرقام من 1 إلى 100', d: 'مع تمارين تكرار' },
  { t: 'الجمل اليومية', d: 'تحية، طعام، عائلة' },
  { t: 'المفردات المدرسية', d: 'صف، معلم، كتاب، قلم' },
  { t: 'العواطف والمشاعر', d: 'فرح، حزن، خوف' },
  { t: 'مستوى متقدم', d: 'محادثة كاملة' },
];

const SignLearn: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6 flex items-center gap-3">
      <GraduationCap className="w-8 h-8" /> دروس تعلّم لغة الإشارة
    </h1>
    <div className="space-y-4">
      {lessons.map((l, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 flex items-center gap-4 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center font-bold text-xl">{i + 1}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[hsl(var(--damij-primary))]">{l.t}</h3>
            <p className="text-[hsl(var(--damij-text))]/70">{l.d}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-[hsl(var(--damij-primary))]/30" />
        </div>
      ))}
    </div>
  </div>
);
export default SignLearn;
