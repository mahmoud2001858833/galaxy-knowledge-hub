import React from 'react';
import { Outlet } from 'react-router-dom';
import { AutismAdaptiveProvider, useAutismAdaptive } from '@/features/autism/ui/AutismAgeAdaptive';
import SensoryModeToggle from '@/features/autism/ui/SensoryModeToggle';

const FloatingToggle: React.FC = () => {
  const { profile } = useAutismAdaptive();
  if (!profile) return null;
  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      <SensoryModeToggle className="shadow-lg" />
    </div>
  );
};

const AutismLayout: React.FC = () => (
  <AutismAdaptiveProvider>
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, hsl(var(--autism-bg)) 0%, hsl(var(--autism-primary-soft)) 100%)',
      }}
    >
      <Outlet />
      <FloatingToggle />
    </div>
  </AutismAdaptiveProvider>
);

export default AutismLayout;
