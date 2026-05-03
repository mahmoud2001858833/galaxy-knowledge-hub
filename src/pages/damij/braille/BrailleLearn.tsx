import React from 'react';

const letters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

const BrailleCell: React.FC<{ pattern: number[] }> = ({ pattern }) => (
  <div className="grid grid-cols-2 gap-1 w-10 h-14">
    {[1, 2, 3, 4, 5, 6].map((d) => (
      <div
        key={d}
        className={`w-4 h-4 rounded-full ${
          pattern.includes(d) ? 'bg-[hsl(var(--damij-primary))]' : 'bg-[hsl(var(--damij-primary))]/15'
        }`}
      />
    ))}
  </div>
);

const BrailleLearn: React.FC = () => (
  <div className="px-6 pt-12 pb-12 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">تعلّم بريل</h1>
    <p className="text-[hsl(var(--damij-text))]/70 mb-8">جدول حروف الهجاء العربية وما يقابلها برمز بريل (تمثيل توضيحي).</p>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {letters.map((ch, i) => (
        <div key={ch} className="p-4 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 flex flex-col items-center gap-3">
          <div className="text-3xl font-bold text-[hsl(var(--damij-primary))]">{ch}</div>
          <BrailleCell pattern={[(i % 6) + 1, ((i + 2) % 6) + 1]} />
        </div>
      ))}
    </div>
  </div>
);

export default BrailleLearn;
