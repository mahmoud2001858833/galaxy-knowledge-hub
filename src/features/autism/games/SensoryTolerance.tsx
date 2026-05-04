import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

// Visual + audio intensity ramps over 10 levels (~3s each). User taps "stop"
// at their threshold. Lower threshold = higher sensitivity.
const SensoryTolerance: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [level, setLevel] = useState(1);
  const [start] = useState(() => performance.now());
  const audioRef = useRef<{ ctx?: AudioContext; gain?: GainNode; osc?: OscillatorNode }>({});

  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();
      osc.frequency.value = 400;
      gain.gain.value = 0.02;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, gain, osc };
    } catch { /* noop */ }
    return () => {
      try { audioRef.current.osc?.stop(); audioRef.current.ctx?.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (level > 10) {
      try { audioRef.current.osc?.stop(); } catch {}
      onComplete({ thresholdLevel: 10 }, performance.now() - start);
      return;
    }
    const g = audioRef.current.gain;
    if (g) g.gain.value = 0.02 + level * 0.04;
    const o = audioRef.current.osc;
    if (o) o.frequency.value = 400 + level * 80;
    const t = window.setTimeout(() => setLevel((l) => l + 1), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const stop = () => {
    try { audioRef.current.osc?.stop(); } catch {}
    onComplete({ thresholdLevel: level }, performance.now() - start);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">الاحتمال الحسي</h3>
        <p className="text-[hsl(var(--damij-text))]/70">سيزداد الصوت والحركة تدريجياً. اضغط "إيقاف" عندما يصبح مزعجاً لك.</p>
        <p className="text-sm text-[hsl(var(--damij-text))]/50 mt-1">المستوى: {level} / 10</p>
      </div>
      <div
        className="w-64 h-64 rounded-full"
        style={{
          background: `conic-gradient(hsl(${360 - level * 30}, 80%, 55%), hsl(${level * 30}, 80%, 55%))`,
          animation: `spin ${Math.max(0.5, 4 - level * 0.3)}s linear infinite`,
          filter: `brightness(${1 + level * 0.1})`,
        }}
      />
      <button
        onClick={stop}
        className="px-10 py-4 rounded-2xl bg-[hsl(var(--damij-accent-2))] text-white text-xl font-bold shadow-lg"
      >
        إيقاف
      </button>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي</button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SensoryTolerance;
