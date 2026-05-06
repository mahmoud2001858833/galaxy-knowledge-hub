import React, { useState } from 'react';
import { Zap, Play, Pause, AlertTriangle } from 'lucide-react';

interface Props {
  onShock: () => void;
  rhythm?: 'shockable' | 'non_shockable' | 'unknown';
}

const InteractiveAED: React.FC<Props> = ({ onShock, rhythm = 'unknown' }) => {
  const [phase, setPhase] = useState<'idle'|'analyzing'|'advised'|'no_shock'|'charged'|'cpr'>('idle');
  const [cprCount, setCprCount] = useState(0);

  const analyze = () => {
    setPhase('analyzing');
    setTimeout(() => {
      const isShockable = rhythm === 'shockable' || (rhythm === 'unknown' && Math.random() > 0.5);
      setPhase(isShockable ? 'advised' : 'no_shock');
    }, 1500);
  };
  const charge = () => setPhase('charged');
  const shock = () => {
    onShock();
    setPhase('cpr');
    setCprCount(0);
    const id = setInterval(() => setCprCount((c) => {
      if (c >= 30) { clearInterval(id); setPhase('idle'); return c; }
      return c + 1;
    }), 200);
  };

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-yellow-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm">
        <Zap className="w-4 h-4" /> AED — مزيل الرجفان
      </div>
      <div className="text-center py-3 rounded-lg bg-slate-900 text-white text-sm font-mono">
        {phase === 'idle' && '⏳ جاهز — اضغط Analyze'}
        {phase === 'analyzing' && '🔍 يحلل الإيقاع...'}
        {phase === 'advised' && '⚡ Shock advised! Stand clear'}
        {phase === 'no_shock' && '🚫 No shock advised — تابع CPR'}
        {phase === 'charged' && '🔋 مشحون — اضغط Shock'}
        {phase === 'cpr' && `❤️ تابع CPR — ضغطة ${cprCount}/30`}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={analyze} disabled={phase === 'analyzing'}
          className="py-2 rounded-lg bg-sky-600 text-white text-xs font-bold disabled:opacity-50">Analyze</button>
        <button onClick={charge} disabled={phase !== 'advised'}
          className="py-2 rounded-lg bg-orange-500 text-white text-xs font-bold disabled:opacity-50">Charge</button>
        <button onClick={shock} disabled={phase !== 'charged'}
          className="py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1">
          <Zap className="w-3.5 h-3.5" /> Shock
        </button>
      </div>
      {phase === 'advised' && (
        <div className="text-[11px] text-rose-700 bg-rose-50 rounded p-1.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> ابتعد عن المريض قبل الصدمة
        </div>
      )}
    </div>
  );
};
export default InteractiveAED;
