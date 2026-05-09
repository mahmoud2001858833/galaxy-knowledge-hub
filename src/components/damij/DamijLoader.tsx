import React from 'react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijLoader: React.FC<{ message?: string; size?: number }> = ({ message, size = 96 }) => {
  const { t } = useDamijLang();
  const label = message ?? t.loader.preparing;
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full border-4 border-[hsl(var(--damij-primary))]/15" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[hsl(var(--damij-primary))] border-r-[hsl(var(--damij-accent-2))] animate-spin"
          style={{ animationDuration: '1.1s' }}
        />
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-[hsl(var(--damij-warm))] border-l-[hsl(var(--damij-primary))] animate-spin"
          style={{ animationDuration: '1.7s', animationDirection: 'reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] animate-pulse shadow-lg shadow-[hsl(var(--damij-primary))]/40" />
        </div>
      </div>
      <p className="text-sm font-semibold text-[hsl(var(--damij-primary))]/80 animate-pulse">{label}</p>
    </div>
  );
};

export default DamijLoader;
