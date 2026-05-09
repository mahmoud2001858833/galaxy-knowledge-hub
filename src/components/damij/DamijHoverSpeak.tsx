import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { useDamijSpeech } from '@/features/damij/i18n/useDamijSpeech';

const STORAGE_KEY = 'damij_hover_speak';
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
  const { t, dir } = useDamijLang();
  const { speak, stop } = useDamijSpeech();
  const labels = t.hoverSpeak ?? fallback;

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });
  const [showHint, setShowHint] = useState(false);
  const lastSpokenRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);
  const highlightedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
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
      speak(text);
    };

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        handle(e.target);
      });
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
  }, [enabled, speak]);

  return (
    <div
      data-damij-no-speak
      data-damij-no-translate
      className="fixed z-[60] end-4"
      style={{ bottom: '10.5rem' }}
    >
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`absolute bottom-full mb-2 end-0 px-3 py-2 rounded-xl bg-slate-900/90 text-white text-[11px] leading-snug shadow-2xl max-w-[220px]`}
          >
            {labels.hint}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.4 }}
        onClick={() => setEnabled((v) => !v)}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        aria-label={enabled ? labels.off : labels.on}
        title={labels.label}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl ring-4 ring-white/40 transition-transform hover:scale-110"
        style={{
          background: enabled
            ? 'linear-gradient(135deg, hsl(var(--damij-accent-2, 160 70% 45%)), hsl(var(--damij-primary, 200 80% 50%)))'
            : 'linear-gradient(135deg, #64748b, #334155)',
          boxShadow: enabled
            ? '0 18px 40px -10px hsl(var(--damij-primary, 200 80% 50%) / 0.6)'
            : '0 12px 30px -10px rgba(0,0,0,0.4)',
        }}
      >
        {enabled ? <Volume2 className="w-6 h-6 drop-shadow" /> : <VolumeX className="w-6 h-6" />}
        {enabled && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-emerald-300"
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default DamijHoverSpeak;
