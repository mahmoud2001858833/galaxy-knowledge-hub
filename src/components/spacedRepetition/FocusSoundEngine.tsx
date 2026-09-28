import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Waves, Sparkles, Brain, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type FrequencyMode = 'alpha' | 'gamma' | 'theta';

interface FrequencyConfig {
  id: FrequencyMode;
  name: string;
  sub: string;
  carrier: number;
  beat: number;
  description: string;
  color: string;
}

const MODES: FrequencyConfig[] = [
  {
    id: 'alpha',
    name: 'موجات ألفا (10 Hz)',
    sub: 'الاسترجاع والتثبيت العميق',
    carrier: 200,
    beat: 10,
    description: 'تردد عصبي نقي يعزز حالة الاسترخاء المتيقظ (Relaxed Alertness) المناسبة جداً لمراجعة البطاقات بدون أي تشتيت أو موسيقى.',
    color: 'text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'gamma',
    name: 'موجات غاما (40 Hz)',
    sub: 'التركيز الرياضي الخارق',
    carrier: 240,
    beat: 40,
    description: 'تحفيز التوافق العصبي عبر الفصوص الدماغية لمعالجة القوانين الفيزيائية والمسائل المعقدة بدقة متناهية.',
    color: 'text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'theta',
    name: 'موجات ثيتا (6 Hz)',
    sub: 'الذاكرة طويلة الأجل',
    carrier: 180,
    beat: 6,
    description: 'تردد استرخائي هادئ يُنشط الحُصين (Hippocampus) لتسريع أرشفة المعلومات في قشرة المخ الدائمة.',
    color: 'text-teal-400 border-teal-500/30'
  }
];

export const FocusSoundEngine: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<FrequencyMode>('alpha');
  const [volume, setVolume] = useState(0.25);

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isSetupRef = useRef(false);

  const currentConfig = MODES.find(m => m.id === mode) || MODES[0];

  const stopAudio = () => {
    try {
      if (leftOscRef.current) {
        leftOscRef.current.stop();
        leftOscRef.current.disconnect();
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        rightOscRef.current.stop();
        rightOscRef.current.disconnect();
        rightOscRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      isSetupRef.current = false;
    } catch {}
  };

  const startAudio = async (selectedMode: FrequencyMode, currentVol: number) => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const conf = MODES.find(m => m.id === selectedMode) || MODES[0];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Stereo merger for binaural beat: Left ear = carrier, Right ear = carrier + beat
      const merger = ctx.createChannelMerger(2);
      merger.connect(masterGain);

      // Left Oscillator
      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(conf.carrier, ctx.currentTime);
      leftOsc.connect(merger, 0, 0); // route to left channel

      // Right Oscillator
      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(conf.carrier + conf.beat, ctx.currentTime);
      rightOsc.connect(merger, 0, 1); // route to right channel

      leftOsc.start();
      rightOsc.start();

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      isSetupRef.current = true;
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      toast.error('تعذر تشغيل مولد التردد الصوتي.');
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(mode, volume);
      toast.success(`تم تشغيل ${currentConfig.name} - تردد نقي للتركيز بدون موسيقى`);
    }
  };

  const handleModeChange = (newMode: FrequencyMode) => {
    setMode(newMode);
    if (isPlaying) {
      startAudio(newMode, volume);
    }
  };

  const handleVolumeChange = (newVal: number[]) => {
    const val = newVal[0];
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-xl" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                محرك الترددات الذهنية النقية (Neural Focus Waves)
              </h3>
              <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-300">
                بدون موسيقى • تردد حيوي صافٍ
              </Badge>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              توليد ذبذبات ثنائية النغمة (Binaural Beats) لتهيئة الدماغ للاستذكار الفوري
            </p>
          </div>
        </div>

        {/* Play/Pause Button */}
        <Button
          onClick={togglePlay}
          className={`rounded-2xl text-xs font-bold px-5 gap-2 shadow-lg transition-all ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/25'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>إيقاف التردد</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>تشغيل موجة التركيز</span>
            </>
          )}
        </Button>
      </div>

      {/* Modes Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            className={`p-3 rounded-2xl text-right border transition-all text-xs ${
              mode === m.id
                ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/60 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">{m.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${m.color}`}>
                {m.beat}Hz
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">{m.sub}</p>
          </button>
        ))}
      </div>

      {/* Volume and Wave Visualizer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-64">
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
          <span className="text-[11px] text-slate-400 font-mono w-8 text-left">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {isPlaying ? (
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>التردد يعمل الآن في أذنيك (يُفضل استخدام سماعات الرأس)</span>
          </div>
        ) : (
          <span className="text-slate-500 text-xs">
            ارتدِ سماعات الرأس لتحقيق أقصى استفادة من التردد الثنائي
          </span>
        )}
      </div>
    </div>
  );
};

export default FocusSoundEngine;
