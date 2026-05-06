import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Heart } from 'lucide-react';

// Synthesizes basic auscultation sounds via Web Audio (no external assets).
type SoundKind = 'normal_heart' | 'murmur' | 'normal_lung' | 'wheeze' | 'crackle';

const InteractiveStethoscope: React.FC<{ defaultSound?: SoundKind }> = ({ defaultSound = 'normal_heart' }) => {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState<SoundKind>(defaultSound);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(false);
  };

  const play = async () => {
    stop();
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = ctxRef.current || new Ctx();
    ctxRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    const master = ctx.createGain(); master.gain.value = 0.4; master.connect(ctx.destination);

    if (sound === 'normal_heart' || sound === 'murmur') {
      // Lub-dub at 70 bpm
      const interval = 60 / 70;
      let cancelled = false;
      const beat = () => {
        if (cancelled) return;
        const t = ctx.currentTime;
        ['lub', 'dub'].forEach((kind, i) => {
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = kind === 'lub' ? 60 : 80;
          const g = ctx.createGain(); g.gain.value = 0;
          const start = t + i * 0.18;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.7, start + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
          o.connect(g); g.connect(master); o.start(start); o.stop(start + 0.2);
        });
        if (sound === 'murmur') {
          const noise = ctx.createBufferSource();
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
          noise.buffer = buf;
          const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 200; filt.Q.value = 8;
          const ng = ctx.createGain(); ng.gain.value = 0.25;
          noise.connect(filt); filt.connect(ng); ng.connect(master);
          noise.start(t + 0.05); noise.stop(t + 0.18);
        }
      };
      const id = setInterval(beat, interval * 1000);
      beat();
      stopRef.current = () => { cancelled = true; clearInterval(id); };
    } else {
      // Lung sounds — filtered noise
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
      noise.buffer = buf; noise.loop = true;
      const filt = ctx.createBiquadFilter();
      if (sound === 'wheeze') { filt.type = 'bandpass'; filt.frequency.value = 800; filt.Q.value = 12; }
      else if (sound === 'crackle') { filt.type = 'highpass'; filt.frequency.value = 1500; }
      else { filt.type = 'lowpass'; filt.frequency.value = 600; }
      const g = ctx.createGain(); g.gain.value = sound === 'crackle' ? 0.15 : 0.25;
      // Breathing envelope
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.25;
      const lfoG = ctx.createGain(); lfoG.gain.value = sound === 'normal_lung' ? 0.2 : 0.15;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      noise.connect(filt); filt.connect(g); g.connect(master);
      noise.start(); lfo.start();
      stopRef.current = () => { noise.stop(); lfo.stop(); };
    }
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);

  const sounds: { k: SoundKind; ar: string }[] = [
    { k: 'normal_heart', ar: '❤️ قلب طبيعي' },
    { k: 'murmur',       ar: '💔 لغط (Murmur)' },
    { k: 'normal_lung',  ar: '🫁 رئة طبيعية' },
    { k: 'wheeze',       ar: '🌬️ صفير (Wheeze)' },
    { k: 'crackle',      ar: '💥 خراخر (Crackle)' },
  ];

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-emerald-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
        <Heart className="w-4 h-4" /> سمّاعة الطبيب
      </div>
      <div className="flex flex-wrap gap-1">
        {sounds.map(s => (
          <button key={s.k} onClick={() => setSound(s.k)}
            className={`text-[11px] px-2 py-1 rounded-full border ${sound === s.k ? 'bg-emerald-600 text-white border-transparent' : 'bg-white'}`}>
            {s.ar}
          </button>
        ))}
      </div>
      <button onClick={playing ? stop : play}
        className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2">
        {playing ? <><VolumeX className="w-4 h-4" /> إيقاف</> : <><Volume2 className="w-4 h-4" /> استمع</>}
      </button>
    </div>
  );
};
export default InteractiveStethoscope;
