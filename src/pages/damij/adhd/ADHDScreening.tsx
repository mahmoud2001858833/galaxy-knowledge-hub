import React from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const items = [
  'يصعب على الطفل الانتباه للتفاصيل ويرتكب أخطاء ناتجة عن الإهمال.',
  'لا يستطيع الجلوس بهدوء لفترة طويلة.',
  'يقاطع الآخرين أثناء الحديث بشكل متكرر.',
  'يفقد أدواته المدرسية كثيراً.',
  'ينتقل من نشاط لآخر دون إكمال المهمة.',
];

const ADHDScreening: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">التشخيص التفريقي لـ ADHD</h1>
    <div className="space-y-4 mb-8">
      {items.map((q, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <p className="font-semibold mb-3 text-[hsl(var(--damij-primary))]">{i + 1}. {q}</p>
          <div className="flex flex-wrap gap-2">
            {['نادراً', 'أحياناً', 'غالباً', 'دائماً'].map((opt) => (
              <button key={opt} className="px-4 py-2 rounded-lg bg-white border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-warm))]/15">
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <PlaceholderPanel title="نموذج التحليل" description="سيتم تطبيق مقياس Vanderbilt/Conners لاحقاً." />
  </div>
);

export default ADHDScreening;
