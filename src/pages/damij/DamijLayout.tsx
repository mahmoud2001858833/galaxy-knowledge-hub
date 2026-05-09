import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DamijSmartGuide from '@/components/damij/DamijSmartGuide';
import DamijHeader from '@/components/damij/DamijHeader';
import DamijEcoBanner from '@/components/damij/DamijEcoBanner';
import DamijAutoTranslator from '@/components/damij/DamijAutoTranslator';
import DamijSpeechAutowire from '@/components/damij/DamijSpeechAutowire';
import { DamijLanguageProvider, useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { EcoModeProvider } from '@/features/damij/EcoModeContext';

const DamijLayoutInner: React.FC = () => {
  const { dir } = useDamijLang();
  useEffect(() => {
    sessionStorage.setItem('damij_mode', 'true');
    return () => { sessionStorage.removeItem('damij_mode'); };
  }, []);

  return (
    <div
      dir={dir}
      className="damij-root min-h-screen text-[hsl(var(--damij-text))] relative"
      style={{
        background:
          'radial-gradient(1200px 600px at 10% -10%, hsl(var(--damij-primary) / 0.10), transparent 60%),' +
          'radial-gradient(900px 500px at 110% 30%, hsl(var(--damij-accent-2) / 0.10), transparent 60%),' +
          'linear-gradient(180deg, hsl(var(--damij-bg)) 0%, hsl(var(--damij-bg-2)) 100%)',
        fontFamily: '"Tajawal","Cairo","Inter","Segoe UI",sans-serif',
      }}
    >
      <DamijHeader />
      <DamijEcoBanner />
      <main>
        <Outlet />
      </main>
      <DamijSmartGuide />
      <DamijAutoTranslator />
      <DamijSpeechAutowire />
    </div>
  );
};

const DamijLayout: React.FC = () => (
  <DamijLanguageProvider>
    <EcoModeProvider>
      <DamijLayoutInner />
    </EcoModeProvider>
  </DamijLanguageProvider>
);

export default DamijLayout;
