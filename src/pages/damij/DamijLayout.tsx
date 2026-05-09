import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DamijFloatingNav from '@/components/damij/DamijFloatingNav';
import DamijSmartGuide from '@/components/damij/DamijSmartGuide';
import DamijLanguageSwitcher from '@/components/damij/DamijLanguageSwitcher';
import DamijAutoTranslator from '@/components/damij/DamijAutoTranslator';
import DamijSpeechAutowire from '@/components/damij/DamijSpeechAutowire';
import { DamijLanguageProvider, useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijLayoutInner: React.FC = () => {
  const { dir, t } = useDamijLang();
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
      <div data-damij-no-translate className="absolute top-3 end-3 z-40">
        <DamijLanguageSwitcher />
      </div>
      <main className="pb-32">
        <Outlet />
      </main>
      <DamijFloatingNav />
      <DamijSmartGuide />
      <DamijAutoTranslator />
      <DamijSpeechAutowire />
      <footer data-damij-no-translate className="text-center py-6 text-sm text-[hsl(var(--damij-text))]/60 border-t border-[hsl(var(--damij-border))] bg-white/60">
        {t.footer}
      </footer>
    </div>
  );
};

const DamijLayout: React.FC = () => (
  <DamijLanguageProvider>
    <DamijLayoutInner />
  </DamijLanguageProvider>
);

export default DamijLayout;
