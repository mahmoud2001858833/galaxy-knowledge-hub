import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Volume2 } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const SensoryUpload: React.FC = () => {
  const [mode, setMode] = useState('deaf');
  return (
    <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">رفع المحتوى للتحويل الحسّي</h1>

      <label className="block w-full p-12 rounded-3xl border-2 border-dashed border-[hsl(var(--damij-primary))]/40 bg-white text-center cursor-pointer hover:bg-[hsl(var(--damij-primary))]/5 mb-6">
        <Upload className="w-14 h-14 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
        <span className="text-xl font-bold text-[hsl(var(--damij-primary))]">ارفع ملفك هنا</span>
        <div className="flex justify-center gap-6 mt-4 text-sm text-[hsl(var(--damij-text))]/60">
          <span><FileText className="inline w-4 h-4" /> نص/PDF</span>
          <span><Image className="inline w-4 h-4" /> صورة</span>
          <span><Video className="inline w-4 h-4" /> فيديو</span>
          <span><Volume2 className="inline w-4 h-4" /> صوت</span>
        </div>
        <input type="file" className="hidden" />
      </label>

      <div className="mb-6">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">اختر الإخراج المستهدف:</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { v: 'deaf', t: 'للأصم' },
            { v: 'blind', t: 'للكفيف' },
            { v: 'deafblind', t: 'للأصم-الكفيف' },
            { v: 'autism', t: 'للتوحّد' },
            { v: 'adhd', t: 'لـ ADHD' },
          ].map(o => (
            <button key={o.v} onClick={() => setMode(o.v)} className={`px-5 py-2 rounded-xl font-semibold transition-all ${mode === o.v ? 'bg-[hsl(var(--damij-primary))] text-white' : 'bg-[hsl(var(--damij-surface))] text-[hsl(var(--damij-primary))]'}`}>{o.t}</button>
          ))}
        </div>
      </div>

      <PlaceholderPanel description="محرّك التحويل الحسّي العكسي (Vision + TTS + Sign Avatar + Braille) سيُربط بمرحلة لاحقة عبر Lovable AI Gateway." />
    </div>
  );
};
export default SensoryUpload;
