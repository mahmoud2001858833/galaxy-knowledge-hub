import { useEffect, useRef, useState, useCallback } from 'react';

// Standard Perkins-style mapping:
// Left hand: F=dot1, D=dot2, S=dot3
// Right hand: J=dot4, K=dot5, L=dot6
const KEY_TO_DOT: Record<string, number> = {
  f: 1, d: 2, s: 3, j: 4, k: 5, l: 6,
};

export const KEY_LABELS: Record<number, string> = {
  1: 'F', 2: 'D', 3: 'S', 4: 'J', 5: 'K', 6: 'L',
};

export interface UseBrailleKeyboardOpts {
  enabled?: boolean;
  onChord: (dots: number[]) => void;
}

export const useBrailleKeyboard = ({ enabled = true, onChord }: UseBrailleKeyboardOpts) => {
  const [pressed, setPressed] = useState<Set<number>>(new Set());
  const accumulating = useRef<Set<number>>(new Set());
  const heldRef = useRef<Set<number>>(new Set());

  const toggleVirtualDot = useCallback((dot: number) => {
    setPressed((prev) => {
      const next = new Set(prev);
      if (next.has(dot)) next.delete(dot);
      else next.add(dot);
      return next;
    });
  }, []);

  const submitVirtual = useCallback(() => {
    const dots = [...pressed].sort((a, b) => a - b);
    if (dots.length) onChord(dots);
    setPressed(new Set());
  }, [pressed, onChord]);

  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: KeyboardEvent) => {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      e.preventDefault();
      if (heldRef.current.has(dot)) return;
      heldRef.current.add(dot);
      accumulating.current.add(dot);
      setPressed(new Set(accumulating.current));
    };

    const onUp = (e: KeyboardEvent) => {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      e.preventDefault();
      heldRef.current.delete(dot);
      // when all keys released, fire chord
      if (heldRef.current.size === 0 && accumulating.current.size > 0) {
        const dots = [...accumulating.current].sort((a, b) => a - b);
        onChord(dots);
        accumulating.current.clear();
        setPressed(new Set());
      }
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [enabled, onChord]);

  return { pressed, toggleVirtualDot, submitVirtual };
};
