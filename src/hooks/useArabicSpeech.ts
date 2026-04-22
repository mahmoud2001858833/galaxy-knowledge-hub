import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

type SR = any;

export function useArabicSpeech(onText: (text: string, isFinal: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "ar-SA";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (finalText) onTextRef.current(finalText.trim() + " ", true);
      else if (interim) onTextRef.current(interim, false);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") toast.error("يرجى السماح باستخدام الميكروفون");
      else if (e.error !== "no-speech" && e.error !== "aborted") toast.error("خطأ في التعرّف الصوتي");
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
    };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) {
      toast.error("متصفحك لا يدعم التعرّف الصوتي");
      return;
    }
    try {
      recRef.current.start();
      setListening(true);
      toast.success("🎤 تحدث الآن بالعربية...");
    } catch {
      // already started
    }
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}
