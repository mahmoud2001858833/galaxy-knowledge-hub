import React from 'react';
import { Outlet } from 'react-router-dom';
import { AutismAdaptiveProvider } from '@/features/autism/ui/AutismAgeAdaptive';

const AutismLayout: React.FC = () => (
  <AutismAdaptiveProvider>
    <Outlet />
  </AutismAdaptiveProvider>
);

export default AutismLayout;
