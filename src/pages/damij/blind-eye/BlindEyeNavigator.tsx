import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Power, Volume2, Mic, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Phase = 'starting' | 'calibrating' | 'guiding' | 'stopped';

type Guide = {
  direction: 'forward' | 'left' | 'right' | 'stop' | 'back';
  obstacle?: string | null;
  distance?: 'near' | 'mid' | 'far' | null;
  proximity_score?: number;
  urgency: 'low' | 'medium' | 'high';
  spoken: string;
};

type Calib = {
  position_ok: boolean;
  issue?: string | null;
  adjustment?: string | null;
  spoken: string;
};

const isSpeakingRef = { current: false };

function speak(text: string, opts: { urgent?: boolean; pitch?: number; rate?: number; onEnd?: () => void } = {}) {
  if (!('speechSynthesis' in window)) return;
  const { urgent = false, pitch = 1, rate = 1, onEnd } = opts;
  if (urgent) window.speechSynthesis.cancel();
  else if (window.speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 1;
  isSpeakingRef.current = true;
  u.onend = () => { isSpeakingRef.current = false; onEnd?.(); };
  u.onerror = () => { isSpeakingRef.current = false; };
  window.speechSynthesis.speak(u);
}

function shortBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(); o.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch {}
}

const BlindEyeNavigator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const lastSpokenHashRef = useRef<{ text: string; t: number }>({ text: '', t: 0 });
  const phaseRef = useRef<Phase>('starting');
  const calibSuccessRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const [phase, setPhase] = useState<Phase>('starting');
  const [busy, setBusy] = useState(false);
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [lastCalib, setLastCalib] = useState<Calib | null>(null);
  const [listening, setListening] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);

  const setPhaseBoth = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  // Camera lifecycle
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhaseBoth('calibrating');
      speak('مرحباً، سأساعدك أولاً على وضع الهاتف في أفضل وضعية. أمسك الهاتف والكاميرا الخلفية للأمام.', { urgent: true });
    } catch (e) {
      console.error(e);
      toast.error('تعذّر فتح الكاميرا');
      speak('تعذّر فتح الكاميرا. الرجاء السماح بالوصول.', { urgent: true });
    }
  }, []);

  const stopAll = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setPhaseBoth('stopped');
    window.speechSynthesis.cancel();
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    speak('تم الإيقاف', { urgent: true });
  }, []);

  const captureFrame = useCallback((): string | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    const w = 640;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || 480;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.7);
  }, []);

  const speakGuide = useCallback((g: Guide) => {
    const now = Date.now();
    // dedupe identical text within 4s
    if (g.spoken === lastSpokenHashRef.current.text && now - lastSpokenHashRef.current.t < 4000) return;
    lastSpokenHashRef.current = { text: g.spoken, t: now };

    const score = g.proximity_score ?? (g.distance === 'near' ? 80 : g.distance === 'mid' ? 50 : 20);
    let urgent = false, rate = 1, pitch = 1;
    if (score >= 75) { urgent = true; rate = 1.2; pitch = 1.25; shortBeep(); }
    else if (score >= 40) { urgent = false; rate = 1.05; pitch = 1.1; }
    else { urgent = false; rate = 0.95; pitch = 1; }

    speak(g.spoken, { urgent, rate, pitch });
    if (score >= 75 && 'vibrate' in navigator) navigator.vibrate([200, 80, 200]);
    else if (score >= 40 && 'vibrate' in navigator) navigator.vibrate(80);
  }, []);

  // Single analysis tick (calibration or guidance)
  const tick = useCallback(async () => {
    if (busy || isSpeakingRef.current) return;
    const img = captureFrame();
    if (!img) return;
    setBusy(true);
    try {
      const mode = phaseRef.current === 'calibrating' ? 'calibration' : 'guidance';
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode },
      });
      if (error) throw error;
      if (!data?.spoken) return;

      if (mode === 'calibration') {
        const c = data as Calib;
        setLastCalib(c);
        speak(c.spoken, { urgent: false, rate: 1 });
        if (c.position_ok) {
          calibSuccessRef.current += 1;
          if (calibSuccessRef.current >= 1) {
            // success — switch to guidance after the spoken finishes
            setTimeout(() => setPhaseBoth('guiding'), 1800);
          }
        } else {
          calibSuccessRef.current = 0;
        }
      } else {
        const g = data as Guide;
        setLastGuide(g);
        speakGuide(g);
      }
    } catch (e) {
      console.warn('tick error', e);
    } finally {
      setBusy(false);
    }
  }, [busy, captureFrame, speakGuide]);

  // Adaptive loop
  useEffect(() => {
    if (phase === 'stopped' || phase === 'starting') return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    const loop = () => {
      // dynamic interval: faster when last guide was urgent
      const now = Date.now();
      const score = lastGuide?.proximity_score ?? 0;
      const minGap = phase === 'calibrating' ? 2200 : score >= 75 ? 700 : score >= 40 ? 1500 : 2800;
      if (now - lastTickRef.current >= minGap) {
        lastTickRef.current = now;
        tick();
      }
    };

    intervalRef.current = window.setInterval(loop, 300);
    const t = window.setTimeout(loop, 1200);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.clearTimeout(t);
    };
  }, [phase, tick, lastGuide]);

  // Phase transition: calibrating -> guiding
  useEffect(() => {
    if (phase === 'guiding') {
      // give a clear audible "ممتاز" once
      const t = setTimeout(() => {
        speak('ممتاز! الوضعية مثالية. سأبدأ الآن بمسح ما حولك ومساعدتك على المشي. تستطيع التحدث معي في أي وقت.', { urgent: true });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Always-on speech recognition
  const handleVoiceInput = useCallback(async (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    console.log('voice:', t);

    // Local quick commands
    if (/^(توقف|أوقف|اوقف|قف الآن)$/.test(t)) { stopAll(); return; }
    if (/(أكمل|اكمل|تابع|كمل|ابدأ|ابدا)/.test(t)) {
      if (phaseRef.current === 'stopped') startCamera();
      return;
    }
    if (/(أعد|اعد|كرر)/.test(t) && lastGuide?.spoken) {
      speak(lastGuide.spoken, { urgent: true });
      return;
    }

    // Otherwise, send to chat with current frame
    if (chatBusy || isSpeakingRef.current) return;
    setChatBusy(true);
    const img = captureFrame() ?? undefined;
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-chat', {
        body: { text: t, image: img },
      });
      if (error) throw error;
      if (data?.spoken) speak(data.spoken, { urgent: true });
    } catch (e) {
      console.warn('chat err', e);
    } finally {
      setChatBusy(false);
    }
  }, [captureFrame, lastGuide, startCamera, stopAll, chatBusy]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.warning('متصفحك لا يدعم الأوامر الصوتية الدائمة');
      return;
    }
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      // Ignore while we are speaking (avoid feedback)
      if (isSpeakingRef.current) return;
      const txt = e.results[e.results.length - 1][0].transcript;
      handleVoiceInput(txt);
    };
    rec.onerror = (e: any) => {
      console.warn('rec err', e?.error);
    };
    rec.onend = () => {
      // auto-restart while not stopped
      if (phaseRef.current !== 'stopped') {
        try { rec.start(); } catch {}
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch {}
    return () => { try { rec.stop(); } catch {} };
  }, [handleVoiceInput]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = lastGuide?.proximity_score ?? 0;
  const urgencyColor =
    phase === 'calibrating' ? 'bg-indigo-600' :
    score >= 75 ? 'bg-red-600' :
    score >= 40 ? 'bg-amber-500' : 'bg-emerald-600';

  return (
    <div className="fixed inset-0 bg-black text-white" dir="rtl">
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent">
        <Link
          to="/damij/blind-eye"
          onClick={stopAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-base"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع
        </Link>

        <div className="flex items-center gap-2">
          <div className={`text-sm px-3 py-1.5 rounded-full backdrop-blur flex items-center gap-2 ${listening ? 'bg-blue-600/80' : 'bg-white/15'}`}>
            <Mic className="w-4 h-4" />
            {listening ? 'يستمع' : 'صامت'}
          </div>
          <div className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {phase === 'calibrating' ? 'معايرة' : phase === 'guiding' ? 'إرشاد' : phase === 'stopped' ? 'متوقف' : 'يبدأ'}
            {busy && '…'}
          </div>
        </div>
      </div>

      {/* Calibration overlay */}
      {phase === 'calibrating' && lastCalib && (
        <div className="absolute top-24 inset-x-4 p-5 rounded-2xl bg-indigo-700/90 backdrop-blur shadow-2xl">
          <div className="text-2xl font-extrabold leading-tight">{lastCalib.spoken}</div>
          {lastCalib.adjustment && (
            <div className="mt-2 text-white/90 text-sm">{lastCalib.adjustment}</div>
          )}
        </div>
      )}

      {/* Guidance overlay */}
      {phase === 'guiding' && lastGuide && (
        <div className={`absolute bottom-32 inset-x-4 p-5 rounded-2xl ${urgencyColor} shadow-2xl`}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-7 h-7 shrink-0" />
            <div className="text-2xl font-extrabold leading-tight">{lastGuide.spoken}</div>
          </div>
          {lastGuide.obstacle && (
            <div className="mt-2 text-white/90 text-sm">عقبة: {lastGuide.obstacle}</div>
          )}
          {typeof lastGuide.proximity_score === 'number' && (
            <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${Math.min(100, lastGuide.proximity_score)}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Big emergency stop / start */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-center bg-gradient-to-t from-black/85 to-transparent">
        <button
          onClick={phase === 'stopped' ? startCamera : stopAll}
          aria-label={phase === 'stopped' ? 'تشغيل الإرشاد' : 'إيقاف الإرشاد'}
          className={`w-28 h-28 rounded-full flex items-center justify-center text-lg font-extrabold shadow-2xl active:scale-95 transition-all ${phase === 'stopped' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          <Power className="w-12 h-12" />
        </button>
      </div>
    </div>
  );
};

export default BlindEyeNavigator;
