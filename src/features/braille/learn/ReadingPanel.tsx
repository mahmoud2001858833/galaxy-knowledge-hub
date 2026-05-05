import React, { useEffect, useState } from 'react';
import { BrailleCellDisplay } from './BrailleCellDisplay';
import { findLetterByChar, describeDots } from './brailleAlphabet';
import { Volume2, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Props {
  text: string;
  speakDescription?: (s: string) => void;
}

export const ReadingPanel: React.FC<Props> = ({ text, speakDescription }) => {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const chars = [...text];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setActive((i) => {
        if (i >= chars.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [playing, chars.length]);

  useEffect(() => {
    setActive(0);
  }, [text]);

  const current = chars[active];
  const currentLetter = current ? findLetterByChar(current) : null;

  const speak = () => {
    if (!currentLetter) return;
    const text = `حرف ${currentLetter.name}: ${describeDots(currentLetter.dots)}`;
    speakDescription?.(text);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-4">
      <div
        dir="ltr"
        className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 min-h-[140px] items-center justify-center"
        role="region"
        aria-label="لوحة محاكاة شاشة بريل"
      >
        {chars.map((ch, i) => {
          const letter = findLetterByChar(ch);
          if (!letter) {
            return (
              <div key={i} className="w-10 h-24 flex items-center justify-center text-[hsl(var(--damij-text))]/30">
                ·
              </div>
            );
          }
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <BrailleCellDisplay dots={letter.dots} highlighted={i === active} label={letter.name} />
              <span className="text-xs text-[hsl(var(--damij-text))]/60" dir="rtl">{ch}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2" dir="ltr">
        <button
          onClick={() => setActive((i) => Math.max(0, i - 1))}
          className="p-2 rounded-lg bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/10"
          aria-label="السابق"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white font-semibold flex items-center gap-2"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? 'إيقاف' : 'تشغيل تلقائي'}
        </button>
        <button
          onClick={speak}
          className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/10 flex items-center gap-2"
          aria-label="نطق التشكيل"
        >
          <Volume2 className="w-4 h-4" />
          نطق التشكيل
        </button>
        <button
          onClick={() => setActive((i) => Math.min(chars.length - 1, i + 1))}
          className="p-2 rounded-lg bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/10"
          aria-label="التالي"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {currentLetter && (
        <div className="text-center text-[hsl(var(--damij-text))]/80" dir="rtl">
          <div className="text-lg font-bold text-[hsl(var(--damij-primary))]">حرف {currentLetter.name}</div>
          <div className="text-sm">{describeDots(currentLetter.dots)}</div>
        </div>
      )}
    </div>
  );
};
