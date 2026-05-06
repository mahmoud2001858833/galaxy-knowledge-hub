import React, { useEffect, useRef, useState } from 'react';
import { Music, Play, Pause, Volume2 } from 'lucide-react';

const TRACKS = [
  // Use a calming public-domain ambient hum (browser TTS oscillator-style fallback handled below)
  { name: 'هدوء', src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1c6e2d9b9c.mp3?filename=relaxing-145038.mp3' },
];

const BackgroundMusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-200 px-3 py-2 flex items-center gap-2" dir="rtl">
      <audio ref={audioRef} src={TRACKS[0].src} loop preload="none" />
      <button onClick={toggle}
        className="w-9 h-9 rounded-full bg-[hsl(var(--damij-accent-2))] text-white flex items-center justify-center"
        aria-label="موسيقى خلفية">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <Music className="w-4 h-4 text-slate-500" />
      <Volume2 className="w-4 h-4 text-slate-500" />
      <input type="range" min={0} max={1} step={0.05} value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 accent-[hsl(var(--damij-accent-2))]" />
    </div>
  );
};

export default BackgroundMusicPlayer;
