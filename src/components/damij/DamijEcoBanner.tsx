import React from 'react';
import { Leaf, X } from 'lucide-react';
import { useEcoMode } from '@/features/damij/EcoModeContext';

const DamijEcoBanner: React.FC = () => {
  const { eco, toggle, savedCo2g } = useEcoMode();
  const [dismissed, setDismissed] = React.useState(false);
  if (!eco || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[hsl(var(--damij-success))]/10 border-b border-[hsl(var(--damij-success))]/30 text-[hsl(var(--damij-text))]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 text-xs sm:text-sm">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--damij-success))] text-white">
          <Leaf className="w-3.5 h-3.5" />
        </span>
        <p className="flex-1 leading-snug">
          <strong className="font-bold text-[hsl(var(--damij-success))]">الوضع البيئي مُفعّل.</strong>{' '}
          تم إيقاف الحركات والتدرجات وتحميل الصور والفيديو الكسول لتقليل استهلاك الطاقة.
          <span className="hidden sm:inline">
            {' '}تقدير الانبعاثات المُوفّرة في هذه الجلسة: <strong>{savedCo2g.toFixed(2)} غ CO₂</strong>.
          </span>
        </p>
        <button
          onClick={toggle}
          className="px-2 py-1 rounded-md text-[11px] font-semibold border border-[hsl(var(--damij-success))]/40 text-[hsl(var(--damij-success))] hover:bg-[hsl(var(--damij-success))] hover:text-white transition-colors"
        >
          إيقاف
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="إغلاق الإشعار"
          className="p-1 rounded-md text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-text))]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DamijEcoBanner;
