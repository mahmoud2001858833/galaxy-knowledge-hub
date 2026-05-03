import React, { useState } from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const TextToBraille: React.FC = () => {
  const [text, setText] = useState('');
  return (
    <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">من النص إلى بريل</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="اكتب النص هنا..."
        className="w-full p-4 rounded-2xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white focus:border-[hsl(var(--damij-primary))] outline-none mb-4 text-lg"
      />
      <button className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold hover:opacity-90 mb-8">
        تحويل إلى بريل
      </button>
      <PlaceholderPanel description="محرّك التحويل سيتم ربطه لاحقاً. الواجهة جاهزة لاستقبال النص وعرض الناتج." />
    </div>
  );
};

export default TextToBraille;
