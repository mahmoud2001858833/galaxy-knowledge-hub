import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DamijFloatingNav from '@/components/damij/DamijFloatingNav';

const DamijLayout: React.FC = () => {
  useEffect(() => {
    sessionStorage.setItem('damij_mode', 'true');
    document.documentElement.setAttribute('dir', 'rtl');
    return () => {
      sessionStorage.removeItem('damij_mode');
    };
  }, []);

  return (
    <div
      dir="rtl"
      className="damij-root min-h-screen text-[hsl(var(--damij-text))]"
      style={{
        background:
          'linear-gradient(180deg, hsl(var(--damij-bg)) 0%, hsl(var(--damij-bg-2)) 100%)',
        fontFamily: '"Tajawal","Cairo","Segoe UI",sans-serif',
      }}
    >
      <main className="pb-32">
        <Outlet />
      </main>
      <DamijFloatingNav />
      <footer className="text-center py-6 text-sm text-[hsl(var(--damij-text))]/60">
        تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين
      </footer>
    </div>
  );
};

export default DamijLayout;
