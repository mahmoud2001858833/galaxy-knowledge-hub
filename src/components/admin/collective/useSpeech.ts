import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typing for the Web Speech API (not in the TS DOM lib).
interface SpeechResultEvent { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }
interface SpeechRec {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null; onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechCtor = new () => SpeechRec;

/** Browser speech-to-text (Web Speech API), Arabic (Jordan). Returns null support when unavailable. */
export function useSpeech(onText: (text: string) => void) {
  const recRef = useRef<SpeechRec | null>(null);
  const [listening, setListening] = useState(false);
  const w = typeof window !== 'undefined' ? (window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }) : null;
  const Ctor = w ? (w.SpeechRecognition || w.webkitSpeechRecognition || null) : null;

  useEffect(() => () => recRef.current?.abort?.(), []);

  const toggle = useCallback(() => {
    if (!Ctor) return;
    if (listening) { recRef.current?.stop(); return; }
    const rec = new Ctor();
    rec.lang = 'ar-JO';
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript;
      if (text.trim()) onText(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [Ctor, listening, onText]);

  return { supported: !!Ctor, listening, toggle };
}
