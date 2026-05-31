import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Settings2, Gauge, Music2, Play } from 'lucide-react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { useDamijSpeech } from '@/features/damij/i18n/useDamijSpeech';

const STORAGE_KEY = 'damij_hover_speak';
const RATE_KEY = 'damij_speak_rate';
const PITCH_KEY = 'damij_speak_pitch';

const READABLE_TAGS = new Set([
  'BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'SPAN', 'LABEL', 'LI', 'TD', 'TH', 'STRONG', 'EM', 'SMALL',
  'FIGCAPTION', 'SUMMARY', 'DT', 'DD', 'BLOCKQUOTE', 'CODE',
]);
const SKIP_INSIDE = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

const fallback = {
  label: 'Smart Pronunciation',
  on: 'Enable speech',
  off: 'Disable speech',
  hint: 'Hover any element to hear it spoken',
};

const DamijHoverSpeak: React.FC = () => {
  const { t, lang } = useDamijLang();
  const { speak, stop, isSpeaking, voices, currentBcp47 } = useDamijSpeech();
  const labels = t.hoverSpeak ?? fallback;

  const [enabled, setEnabled] = useState<boolean>(() => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1');
  const [showHint, setShowHint] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState<number>(() => {
    const v = typeof window !== 'undefined' ? parseFloat(localStorage.getItem(RATE_KEY) || '1') : 1;
    return isNaN(v) ? 1 : v;
  });
  const [pitch, setPitch] = useState<number>(() => {
    const v = typeof window !== 'undefined' ? parseFloat(localStorage.getItem(PITCH_KEY) || '1') : 1;
    return isNaN(v) ? 1 : v;
  });

  const lastSpokenRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);
  const highlightedRef = useRef<HTMLElement | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); }, [enabled]);
  useEffect(() => { localStorage.setItem(RATE_KEY, String(rate)); }, [rate]);
  useEffect(() => { localStorage.setItem(PITCH_KEY, String(pitch)); }, [pitch]);

  useEffect(() => {
    if (!enabled) {
      stop();
      if (highlightedRef.current) {
        highlightedRef.current.style.outline = '';
        highlightedRef.current.style.outlineOffset = '';
        highlightedRef.current = null;
      }
    }
  }, [enabled, stop]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.querySelector('.damij-root');
    if (!root) return;

    const findReadable = (start: HTMLElement | null): HTMLElement | null => {
      let el: HTMLElement | null = start;
      while (el && el !== root) {
        if (el.dataset?.damijNoSpeak !== undefined) return null;
        if (SKIP_INSIDE.has(el.tagName)) return null;
        if (READABLE_TAGS.has(el.tagName)) return el;
        el = el.parentElement;
      }
      return null;
    };

    const highlight = (el: HTMLElement | null) => {
      if (highlightedRef.current && highlightedRef.current !== el) {
        highlightedRef.current.style.outline = '';
        highlightedRef.current.style.outlineOffset = '';
      }
      if (el) {
        el.style.outline = '2px dashed hsl(var(--damij-primary, 200 80% 50%))';
        el.style.outlineOffset = '3px';
      }
      highlightedRef.current = el;
    };

    const handle = (target: EventTarget | null) => {
      const el = findReadable(target as HTMLElement | null);
      if (!el) return;
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (!text || text.length > 240) return;
      const now = Date.now();
      if (text === lastSpokenRef.current && now - lastTimeRef.current < 1500) return;
      lastSpokenRef.current = text;
      lastTimeRef.current = now;
      highlight(el);
      speak(text, { rate, pitch });
    };

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; handle(e.target); });
    };
    const onTouch = (e: TouchEvent) => handle(e.target);
    const onLeave = () => highlight(null);

    root.addEventListener('mouseover', onMove as EventListener, { passive: true });
    root.addEventListener('touchstart', onTouch as EventListener, { passive: true });
    root.addEventListener('mouseleave', onLeave);

    return () => {
      root.removeEventListener('mouseover', onMove as EventListener);
      root.removeEventListener('touchstart', onTouch as EventListener);
      root.removeEventListener('mouseleave', onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      if (highlightedRef.current) {
        highlightedRef.current.style.outline = '';
        highlightedRef.current.style.outlineOffset = '';
        highlightedRef.current = null;
      }
    };
  }, [enabled, speak, rate, pitch]);

  const sampleText = lang === 'ar'
    ? 'مرحباً، هذا اختبار لصوت النطق الذكي في منصة دامج.'
    : 'Hello, this is a test of the smart pronunciation voice.';

  const matchingVoiceCount = voices.filter((v) => v.lang.toLowerCase().startsWith((currentBcp47 || '').split('-')[0].toLowerCase())).length;

  return (
    <div data-damij-no-speak data-damij-no-translate className="relative pointer-events-auto">
      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.95 }}
            className="absolute end-full me-3 bottom-0 w-72 p-4 rounded-2xl bg-white shadow-2xl border border-[hsl(var(--damij-primary))]/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[hsl(var(--damij-primary))]">
                <Settings2 className="w-4 h-4" /> إعدادات النطق
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold">
                {currentBcp47} · {matchingVoiceCount} صوت
              </span>
            </div>

            <div className="space-y-3.5">
              <SliderRow
                icon={<Gauge className="w-3.5 h-3.5" />}
                label="السرعة" value={rate} min={0.5} max={1.8} step={0.05}
                onChange={setRate} display={`${rate.toFixed(2)}×`}
              />
              <SliderRow
                icon={<Music2 className="w-3.5 h-3.5" />}
                label="حدّة الصوت" value={pitch} min={0.6} max={1.6} step={0.05}
                onChange={setPitch} display={pitch.toFixed(2)}
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => isSpeaking ? stop() : speak(sampleText, { rate, pitch })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white text-xs font-bold shadow hover:shadow-md transition"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isSpeaking ? 'إيقاف' : 'تجربة'}
                </button>
                <button
                  onClick={() => { setRate(1); setPitch(1); }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  إعادة
                </button>
              </div>

              <p className="text-[10px] text-slate-500 leading-snug pt-1 border-t border-slate-100">
                مرّر الماوس فوق أي عنصر لسماع نصّه باللغة المختارة. تتغيّر الأصوات تلقائياً مع تغيير اللغة.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && !showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            className="absolute end-full me-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-slate-900/95 text-white text-[11px] leading-snug shadow-2xl whitespace-nowrap"
          >
            {labels.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings cog (top-end of the button) */}
      <button
        onClick={() => setShowSettings((v) => !v)}
        aria-label="إعدادات النطق"
        className="absolute -top-1 -end-1 z-10 w-6 h-6 rounded-full bg-white border border-[hsl(var(--damij-primary))]/20 shadow flex items-center justify-center text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-primary))] hover:text-white transition"
      >
        <Settings2 className="w-3 h-3" />
      </button>

      <motion.button
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.35 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setEnabled((v) => !v)}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        aria-label={enabled ? labels.off : labels.on}
        title={labels.label}
        aria-pressed={enabled}
        className="relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl ring-1 ring-white/50 transition-colors"
        style={{
          background: enabled
            ? 'linear-gradient(135deg, hsl(var(--damij-accent-2)) 0%, hsl(var(--damij-primary)) 100%)'
            : 'linear-gradient(135deg, hsl(var(--damij-muted) / 0.85) 0%, hsl(var(--damij-text) / 0.9) 100%)',
          boxShadow: enabled
            ? '0 14px 36px -10px hsl(var(--damij-accent-2) / 0.6), 0 0 0 4px rgba(255,255,255,0.55)'
            : '0 12px 30px -10px rgba(15,23,42,0.5), 0 0 0 4px rgba(255,255,255,0.55)',
        }}
      >
        {enabled
          ? <Volume2 className="w-6 h-6 drop-shadow-md" strokeWidth={2.4} />
          : <VolumeX className="w-6 h-6 drop-shadow-md" strokeWidth={2.4} />}
        {enabled && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-white/70 pointer-events-none"
            animate={{ scale: [1, 1.35, 1], opacity: [0.85, 0, 0.85] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </div>
  );
};

const SliderRow: React.FC<{
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}> = ({ icon, label, value, min, max, step, onChange, display }) => (
  <div>
    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
      <span className="inline-flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-[hsl(var(--damij-primary))]">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-[hsl(var(--damij-primary))]"
    />
  </div>
);

export default DamijHoverSpeak;
