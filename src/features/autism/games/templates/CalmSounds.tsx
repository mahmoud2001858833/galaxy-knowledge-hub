import React, { useEffect, useRef, useState } from 'react';
import { GameTemplateProps } from './types';

const SOUNDS = [
  { name: 'موجة بحر', freq: 200, type: 'sine' as OscillatorType },
  { name: 'مطر هادئ', freq: 350, type: 'triangle' as OscillatorType },
  { name: 'هواء', freq: 150, type: 'sine' as OscillatorType },
];

const CalmSounds: React.FC<GameTemplateProps> = ({ durationSec = 60, onComplete, onSkip, instructions }) => {
  const [playing, setPlaying] = useState<number | null>(null);
  const [tolerance, setTolerance] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [start] = useState(Date.now());

  const stop = () => {
    try { oscRef.current?.stop(); } catch {}
    oscRef.current = null;
    setPlaying(null);
  };

  const play = (i: number) => {
    stop();
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = SOUNDS[i].type;
    osc.frequency.value = SOUNDS[i].freq;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    setPlaying(i);
    setTolerance(t => t + 1);
  };

  useEffect(() => () => stop(), []);
  useEffect(() => {
    const t = setTimeout(() => {
      stop();
      onComplete({ accuracy: Math.min(1, tolerance / 3), raw: { tolerance } }, Date.now() - start);
    }, durationSec * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8 text-center" dir="rtl">
      <h3 className="text-lg font-bold mb-2 text-slate-800">🔊 عالم الأصوات الهادئة</h3>
      {instructions && <p className="text-xs text-slate-500 mb-4">{instructions}</p>}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
        {SOUNDS.map((s, i) => (
          <button
            key={i}
            onClick={() => playing === i ? stop() : play(i)}
            className={`py-4 rounded-xl font-semibold border-2 transition ${playing === i ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200'}`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <button onClick={() => { stop(); onComplete({ accuracy: Math.min(1, tolerance / 3), raw: { tolerance } }, Date.now() - start); }}
        className="px-6 py-2 rounded-xl bg-slate-800 text-white font-semibold">انتهيت</button>
      <div><button onClick={onSkip} className="mt-3 text-sm text-slate-500">تخطّي</button></div>
    </div>
  );
};
export default CalmSounds;
