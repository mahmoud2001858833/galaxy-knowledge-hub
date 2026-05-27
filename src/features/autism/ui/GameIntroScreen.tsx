import React, { useEffect } from 'react';
import { Volume2, VolumeX, Play, SkipForward } from 'lucide-react';
import { useTTS } from './useTTS';

interface Props {
  title: string;
  instructions: string;
  childName?: string;
  skill?: string;
  emoji?: string;
  onStart: () => void;
  onSkip?: () => void;
  autoSpeak?: boolean;
}

const GameIntroScreen: React.FC<Props> = ({ title, instructions, childName, skill, emoji, onStart, onSkip, autoSpeak = true }) => {
  const tts = useTTS();
  const greeting = childName ? `مرحباً يا ${childName}! ` : '';
  const fullText = `${greeting}سنلعب الآن لعبة ${title}. ${instructions}`;

  useEffect(() => {
    if (autoSpeak && tts.enabled) {
      const id = setTimeout(() => tts.speak(fullText), 250);
      return () => { clearTimeout(id); tts.stop(); };
    }
    return () => tts.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 sm:p-10 text-center max-w-xl mx-auto" dir="rtl">
      <div className="text-6xl mb-3">{emoji || '🎮'}</div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--autism-primary))] mb-2">
        {childName ? `${childName}، ` : ''}{title}
      </h2>
      {skill && <p className="text-sm text-[hsl(var(--autism-muted))] mb-4">🎯 المهارة: {skill}</p>}
      <div className="bg-white/80 rounded-2xl p-5 border border-[hsl(var(--autism-primary)/0.15)] text-right leading-relaxed text-[hsl(var(--autism-text))] mb-5">
        {instructions}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        <button
          onClick={() => tts.speak(fullText, { force: true })}
          className="px-4 py-2 rounded-xl bg-violet-100 text-violet-800 font-semibold flex items-center gap-2 hover:bg-violet-200 transition"
        >
          <Volume2 className="w-4 h-4" /> 🔊 اسمع التعليمات
        </button>
        <button
          onClick={tts.toggle}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm flex items-center gap-1"
          title={tts.enabled ? 'إيقاف النطق التلقائي' : 'تفعيل النطق التلقائي'}
        >
          {tts.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {tts.enabled ? 'النطق مُفعّل' : 'النطق متوقّف'}
        </button>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => { tts.stop(); onStart(); }}
          className="px-8 py-3 rounded-2xl bg-[hsl(var(--autism-primary))] text-white font-bold text-lg flex items-center gap-2 shadow-lg hover:scale-105 transition"
        >
          <Play className="w-5 h-5" /> ابدأ اللعب
        </button>
        {onSkip && (
          <button onClick={() => { tts.stop(); onSkip(); }}
            className="px-5 py-3 rounded-2xl bg-white border-2 border-slate-200 font-semibold flex items-center gap-2">
            <SkipForward className="w-4 h-4" /> تخطّي
          </button>
        )}
      </div>
    </div>
  );
};

export default GameIntroScreen;
