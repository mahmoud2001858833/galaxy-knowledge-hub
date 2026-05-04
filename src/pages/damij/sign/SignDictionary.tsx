import React, { useState } from 'react';
import { Search, Hand } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const sample = ['مرحباً', 'شكراً', 'ماء', 'بيت', 'مدرسة', 'صديق', 'كتاب', 'أم', 'أب', 'حب', 'سلام', 'علم'];

const SignDictionary: React.FC = () => {
  const [q, setQ] = useState('');
  const filtered = sample.filter(w => w.includes(q));
  return (
    <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">قاموس الإشارة العالمي</h1>
      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--damij-primary))]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن كلمة..." className="w-full p-4 pr-12 rounded-2xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white text-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {filtered.map(w => (
          <div key={w} className="aspect-square rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 flex flex-col items-center justify-center hover:shadow-xl transition-all cursor-pointer">
            <Hand className="w-10 h-10 text-[hsl(var(--damij-primary))] mb-2" />
            <span className="font-bold text-[hsl(var(--damij-primary))]">{w}</span>
          </div>
        ))}
      </div>
      <PlaceholderPanel description="مكتبة فيديوهات الإشارة لكل كلمة سيتم ربطها لاحقاً." />
    </div>
  );
};
export default SignDictionary;
