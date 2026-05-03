import React from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const sample = [
  'هل يستجيب الطفل عند مناداته باسمه؟',
  'هل يحافظ على التواصل البصري؟',
  'هل يكرر كلمات أو حركات بشكل ملحوظ؟',
  'هل يتأقلم مع تغيير الروتين اليومي؟',
];

const AutismDiagnosis: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">تشخيص نوع التوحد</h1>
    <p className="text-[hsl(var(--damij-text))]/70 mb-6">
      نموذج أسئلة توضيحي — يستبدل لاحقاً بمقياس معتمد سريرياً.
    </p>
    <div className="space-y-4 mb-8">
      {sample.map((q, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <p className="font-semibold mb-3 text-[hsl(var(--damij-primary))]">{i + 1}. {q}</p>
          <div className="flex gap-2">
            {['أبداً', 'أحياناً', 'كثيراً', 'دائماً'].map((opt) => (
              <button key={opt} className="px-4 py-2 rounded-lg bg-white border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/5">
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <PlaceholderPanel title="محرك التشخيص" description="سيتم ربط نموذج تقييم معتمد لاحقاً لإصدار النتيجة." />
  </div>
);

export default AutismDiagnosis;
