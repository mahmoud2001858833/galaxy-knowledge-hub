import React from 'react';
import { Upload } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const BrailleToText: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">من بريل إلى نص</h1>
    <label className="block w-full p-10 rounded-2xl border-2 border-dashed border-[hsl(var(--damij-primary))]/40 bg-white text-center cursor-pointer hover:bg-[hsl(var(--damij-primary))]/5 mb-8">
      <Upload className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
      <span className="font-semibold text-[hsl(var(--damij-primary))]">ارفع صورة لرموز بريل</span>
      <input type="file" accept="image/*" className="hidden" />
    </label>
    <PlaceholderPanel description="OCR لقراءة بريل سيتم ربطه لاحقاً." />
  </div>
);

export default BrailleToText;
