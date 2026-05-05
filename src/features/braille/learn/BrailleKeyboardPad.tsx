import React from 'react';
import { KEY_LABELS } from './useBrailleKeyboard';

interface Props {
  pressed: Set<number>;
  onToggle: (dot: number) => void;
  onSubmit: () => void;
}

export const BrailleKeyboardPad: React.FC<Props> = ({ pressed, onToggle, onSubmit }) => {
  const renderKey = (dot: number) => {
    const active = pressed.has(dot);
    return (
      <button
        key={dot}
        type="button"
        onClick={() => onToggle(dot)}
        aria-label={`النقطة ${dot} - مفتاح ${KEY_LABELS[dot]}`}
        aria-pressed={active}
        className={`flex-1 h-20 rounded-2xl font-bold text-lg transition-all border-2 select-none ${
          active
            ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))] shadow-xl scale-95'
            : 'bg-[hsl(var(--damij-surface))] text-[hsl(var(--damij-text))] border-[hsl(var(--damij-primary))]/20 hover:border-[hsl(var(--damij-primary))]/50'
        }`}
      >
        <div className="text-2xl">{KEY_LABELS[dot]}</div>
        <div className="text-xs opacity-80">نقطة {dot}</div>
      </button>
    );
  };

  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="text-center text-sm font-semibold text-[hsl(var(--damij-text))]/70" dir="rtl">
            اليد اليسرى
          </div>
          <div className="flex gap-2">{[3, 2, 1].map(renderKey)}</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-center text-sm font-semibold text-[hsl(var(--damij-text))]/70" dir="rtl">
            اليد اليمنى
          </div>
          <div className="flex gap-2">{[4, 5, 6].map(renderKey)}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        dir="rtl"
        className="w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-semibold hover:opacity-90 transition"
      >
        تأكيد التشكيل (مسطرة المسافة على لوحة المفاتيح أيضاً تعمل عند رفع الأصابع)
      </button>
    </div>
  );
};
