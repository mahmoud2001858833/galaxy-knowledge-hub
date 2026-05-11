import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAutismAdaptive } from './AutismAgeAdaptive';

const SensoryModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { sensoryMode, setSensoryMode } = useAutismAdaptive();
  const calm = sensoryMode === 'calm';
  return (
    <button
      onClick={() => setSensoryMode(calm ? 'default' : 'calm')}
      title={calm ? 'إيقاف وضع الهدوء الحسي' : 'تفعيل وضع الهدوء الحسي'}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition ${
        calm
          ? 'bg-slate-100 border-slate-300 text-slate-700'
          : 'bg-white border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] hover:border-[hsl(var(--damij-accent-2))]/40'
      } ${className}`}
    >
      {calm ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      {calm ? 'وضع الهدوء' : 'هدوء حسي'}
    </button>
  );
};

export default SensoryModeToggle;
