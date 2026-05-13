import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Power, Volume2, Mic, Activity, ArrowUp, ArrowLeft as ArrowL, ArrowRight as ArrowR } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Phase = 'starting' | 'calibrating' | 'guiding' | 'stopped';

type Cell = {
  id: 'TL'|'TC'|'TR'|'ML'|'MC'|'MR'|'BL'|'BC'|'BR';
  label: string;
  object: string;
  proximity: number;
  hazard: 'low'|'medium'|'high';
};

type Guide = {
  cells: Cell[];
  best_path: 'left'|'center'|'right';
  global_proximity: number;
  spoken: string;
  obstacles_summary: string;
};

type Calib = {
  position_ok: boolean;
  issue?: string | null;
  adjustment?: string | null;
  spoken: string;
};

const isSpeakingRef = { current: false };
let arabicVoice: SpeechSynthesisVoice | null = null;

function pickArabicVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  arabicVoice = voices.find(v => /^ar/i.test(v.lang)) || null;
}

function speak(text: string, opts: { urgent?: boolean; pitch?: number; rate?: number; onEnd?: () => void } = {}) {
  if (!('speechSynthesis' in window)) return;
  const { urgent = false, pitch = 1, rate = 1, onEnd } = opts;
  if (urgent) window.speechSynthesis.cancel();
  else if (window.speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  if (arabicVoice) u.voice = arabicVoice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 1;
  isSpeakingRef.current = true;
  u.onend = () => { isSpeakingRef.current = false; onEnd?.(); };
  u.onerror = () => { isSpeakingRef.current = false; };
  window.speechSynthesis.speak(u);
}

function shortBeep(freq = 880) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(); o.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch {}
}

const CELL_ORDER: Cell['id'][] = ['TL','TC','TR','ML','MC','MR','BL','BC','BR'];

const BlindEyeNavigator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const lastSpokenHashRef = useRef<{ key: string; t: number }>({ key: '', t: 0 });
  const phaseRef = useRef<Phase>('starting');
  const calibSuccessRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const lastGuideRef = useRef<Guide | null>(null);

  const [phase, setPhase] = useState<Phase>('starting');
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [lastCalib, setLastCalib] = useState<Calib | null>(null);
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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
      calibSuccessRef.current = 0;
      setPhaseBoth('calibrating');
      speak('مرحباً، سأساعدك أولاً على وضع الهاتف بأفضل وضعية. أمسك الهاتف والكاميرا الخلفية للأمام.', { urgent: true });
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
    const w = 720;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || 540;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.78);
  }, []);

  const speakGuide = useCallback((g: Guide) => {
    const now = Date.now();
    const key = `${g.best_path}|${g.obstacles_summary}`;
    if (key === lastSpokenHashRef.current.key && now - lastSpokenHashRef.current.t < 3500) return;
    lastSpokenHashRef.current = { key, t: now };

    const score = g.global_proximity ?? 0;
    let urgent = false, rate = 1, pitch = 1;
    if (score >= 75) { urgent = true; rate = 1.2; pitch = 1.25; shortBeep(990); }
    else if (score >= 40) { urgent = false; rate = 1.05; pitch = 1.1; shortBeep(660); }
    else { urgent = false; rate = 0.95; pitch = 1; }

    speak(g.spoken, { urgent, rate, pitch });
    if (score >= 75 && 'vibrate' in navigator) navigator.vibrate([200, 80, 200]);
    else if (score >= 40 && 'vibrate' in navigator) navigator.vibrate(80);
  }, []);

  const tick = useCallback(async () => {
    if (busyRef.current || isSpeakingRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return;
    const img = captureFrame();
    if (!img) return;
    busyRef.current = true;
    try {
      const mode = phaseRef.current === 'calibrating' ? 'calibration' : 'guidance';
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode },
      });
      if (error) {
        const status = (error as any)?.context?.response?.status ?? (error as any)?.status;
        if (status === 429 || status === 402) {
          cooldownUntilRef.current = Date.now() + 6000;
          setErrMsg(status === 402 ? 'نفذت الأرصدة' : 'النظام مزدحم، سأحاول بعد قليل');
          speak('النظام مشغول، سأحاول بعد قليل', { urgent: false });
          return;
        }
        throw error;
      }
      setErrMsg(null);
      if (!data?.spoken) return;

      if (mode === 'calibration') {
        const c = data as Calib;
        setLastCalib(c);
        speak(c.spoken, { urgent: false, rate: 1 });
        if (c.position_ok) {
          calibSuccessRef.current += 1;
          if (calibSuccessRef.current >= 1) {
            setTimeout(() => setPhaseBoth('guiding'), 1500);
          }
        } else {
          calibSuccessRef.current = 0;
        }
      } else {
        const g = data as Guide;
        lastGuideRef.current = g;
        setLastGuide(g);
        speakGuide(g);
      }
    } catch (e) {
      console.warn('tick error', e);
    } finally {
      busyRef.current = false;
    }
  }, [captureFrame, speakGuide]);

  // Adaptive loop
  useEffect(() => {
    if (phase === 'stopped' || phase === 'starting') return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    const loop = () => {
      const now = Date.now();
      const score = lastGuideRef.current?.global_proximity ?? 0;
      const minGap = phase === 'calibrating' ? 2200 : score >= 75 ? 800 : score >= 40 ? 1500 : 2600;
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
  }, [phase, tick]);

  useEffect(() => {
    if (phase === 'guiding') {
      const t = setTimeout(() => {
        speak('ممتاز! الوضعية مثالية. سأبدأ الآن بمسح ما حولك ومساعدتك على المشي. تستطيع التحدث معي في أي وقت.', { urgent: true });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Voice chat
  const handleVoiceInput = useCallback(async (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    if (/^(توقف|أوقف|اوقف|قف الآن)$/.test(t)) { stopAll(); return; }
    if (/(أكمل|اكمل|تابع|كمل|ابدأ|ابدا)/.test(t)) {
      if (phaseRef.current === 'stopped') startCamera();
      return;
    }
    if (/(أعد|اعد|كرر)/.test(t) && lastGuideRef.current?.spoken) {
      speak(lastGuideRef.current.spoken, { urgent: true });
      return;
    }

    if (isSpeakingRef.current) return;
    const img = captureFrame() ?? undefined;
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-chat', {
        body: { text: t, image: img },
      });
      if (error) throw error;
      if (data?.spoken) speak(data.spoken, { urgent: true });
    } catch (e) {
      console.warn('chat err', e);
    }
  }, [captureFrame, startCamera, stopAll]);

  useEffect(() => {
    pickArabicVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = pickArabicVoice;
    }
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
      if (isSpeakingRef.current) return;
      const txt = e.results[e.results.length - 1][0].transcript;
      handleVoiceInput(txt);
    };
    rec.onerror = (e: any) => { console.warn('rec err', e?.error); };
    rec.onend = () => {
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

  useEffect(() => {
    startCamera();
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = lastGuide?.global_proximity ?? 0;
  const urgencyColor =
    phase === 'calibrating' ? 'bg-indigo-600' :
    score >= 75 ? 'bg-red-600' :
    score >= 40 ? 'bg-amber-500' : 'bg-emerald-600';

  const cellsById: Record<string, Cell | undefined> = {};
  lastGuide?.cells?.forEach(c => { cellsById[c.id] = c; });

  const hazardBg = (h?: string) =>
    h === 'high' ? 'bg-red-500/30 border-red-400' :
    h === 'medium' ? 'bg-amber-400/25 border-amber-300' :
    h === 'low' ? 'bg-emerald-500/15 border-emerald-300/70' :
    'bg-white/5 border-white/20';

  const PathArrow = lastGuide?.best_path === 'left' ? ArrowL : lastGuide?.best_path === 'right' ? ArrowR : ArrowUp;

  return (
    <div className="fixed inset-0 bg-black text-white" dir="rtl">
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {/* 3x3 spatial grid overlay (guidance only) */}
      {phase === 'guiding' && (
        <div className="absolute inset-0 pointer-events-none p-2 grid grid-cols-3 grid-rows-3 gap-1">
          {CELL_ORDER.map((id) => {
            const c = cellsById[id];
            return (
              <div
                key={id}
                className={`relative rounded-lg border-2 ${hazardBg(c?.hazard)} backdrop-blur-[1px] flex items-end justify-start p-2 transition-colors`}
              >
                <span className="text-[10px] absolute top-1 right-1 opacity-70 font-mono">{id}</span>
                {c && c.object !== 'open' && c.object !== 'unknown' && (
                  <div className="text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {c.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent z-10">
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
          </div>
        </div>
      </div>

      {/* Best path arrow (guidance) */}
      {phase === 'guiding' && lastGuide && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur rounded-full p-3 border-2 border-white/40 shadow-2xl">
            <PathArrow className="w-10 h-10" />
          </div>
        </div>
      )}

      {/* Calibration overlay */}
      {phase === 'calibrating' && lastCalib && (
        <div className="absolute top-24 inset-x-4 p-5 rounded-2xl bg-indigo-700/90 backdrop-blur shadow-2xl z-10">
          <div className="text-2xl font-extrabold leading-tight">{lastCalib.spoken}</div>
          {lastCalib.adjustment && (
            <div className="mt-2 text-white/90 text-sm">{lastCalib.adjustment}</div>
          )}
        </div>
      )}

      {/* Error banner */}
      {errMsg && (
        <div className="absolute top-24 inset-x-4 p-3 rounded-xl bg-red-600/90 backdrop-blur z-10 text-center font-bold">
          {errMsg}
        </div>
      )}

      {/* Guidance speech overlay */}
      {phase === 'guiding' && lastGuide && (
        <div className={`absolute bottom-32 inset-x-4 p-5 rounded-2xl ${urgencyColor} shadow-2xl z-10`}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-7 h-7 shrink-0" />
            <div className="text-2xl font-extrabold leading-tight">{lastGuide.spoken}</div>
          </div>
          {lastGuide.obstacles_summary && (
            <div className="mt-2 text-white/90 text-sm">{lastGuide.obstacles_summary}</div>
          )}
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>
      )}

      {/* Stop / start */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-center bg-gradient-to-t from-black/85 to-transparent z-10">
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
