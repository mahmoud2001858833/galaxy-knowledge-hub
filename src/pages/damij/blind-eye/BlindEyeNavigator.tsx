import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Power, Volume2, Mic, Activity, ArrowUp, ArrowLeft as ArrowL, ArrowRight as ArrowR, Zap } from 'lucide-react';
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

type Hazard = { id: Cell['id']; label: string; hazard: 'low'|'medium'|'high' };

type Guide = {
  cells?: Cell[];
  top_hazards?: Hazard[];
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
let sharedAudioCtx: AudioContext | null = null;

function pickArabicVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  arabicVoice = voices.find(v => /^ar/i.test(v.lang)) || null;
}

function speak(text: string, opts: { urgent?: boolean; pitch?: number; rate?: number; onEnd?: () => void } = {}) {
  if (!('speechSynthesis' in window)) return;
  const { urgent = false, pitch = 1, rate = 1.1, onEnd } = opts;
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

function shortBeep(freq = 880, dur = 0.18) {
  try {
    if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = sharedAudioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  } catch {}
}

const CELL_ORDER: Cell['id'][] = ['TL','TC','TR','ML','MC','MR','BL','BC','BR'];

const BlindEyeNavigator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const inflightRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const lastSpokenHashRef = useRef<{ key: string; t: number }>({ key: '', t: 0 });
  const phaseRef = useRef<Phase>('starting');
  const calibAttemptsRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const lastDetailedRef = useRef<number>(0);
  const lastGuideRef = useRef<Guide | null>(null);
  const chatHistoryRef = useRef<Array<{ role: 'user'|'assistant'; text: string }>>([]);
  const userSpeakingRef = useRef<boolean>(false);
  const prevMotionRef = useRef<Uint8ClampedArray | null>(null);
  const lastMotionAlertRef = useRef<number>(0);
  const latencyRef = useRef<number>(0);
  const MAX_CALIB_ATTEMPTS = 3;

  const [phase, setPhase] = useState<Phase>('starting');
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [lastCalib, setLastCalib] = useState<Calib | null>(null);
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

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
      calibAttemptsRef.current = 0;
      setPhaseBoth('calibrating');
      speak('مرحباً، ساعدني في توجيه الكاميرا. ٣ محاولات فقط.', { urgent: true });
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

  const captureFrame = useCallback((mode: 'calibration'|'fast'|'detailed'): string | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    const w = mode === 'calibration' ? 320 : mode === 'detailed' ? 560 : 480;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || Math.round(w * 0.75);
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    const q = mode === 'calibration' ? 0.55 : mode === 'detailed' ? 0.7 : 0.6;
    return c.toDataURL('image/jpeg', q);
  }, []);

  // Local motion detection on bottom rows for instant hazard alert
  const detectSuddenChange = useCallback((): boolean => {
    const v = videoRef.current;
    let mc = motionCanvasRef.current;
    if (!v || v.readyState < 2) return false;
    if (!mc) return false;
    const W = 64, H = 48;
    mc.width = W; mc.height = H;
    const ctx = mc.getContext('2d', { willReadFrequently: true } as any);
    if (!ctx) return false;
    ctx.drawImage(v, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;
    const prev = prevMotionRef.current;
    let changed = false;
    if (prev && prev.length === data.length) {
      // Focus on bottom third (rows H*2/3 .. H)
      let diffSum = 0;
      const startY = Math.floor(H * 2 / 3);
      for (let y = startY; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const dr = Math.abs(data[i] - prev[i]);
          const dg = Math.abs(data[i+1] - prev[i+1]);
          const db = Math.abs(data[i+2] - prev[i+2]);
          diffSum += dr + dg + db;
        }
      }
      const pixels = (H - startY) * W;
      const avgDiff = diffSum / (pixels * 3);
      // Threshold tuned: avg pixel channel diff > 35 = sudden change
      if (avgDiff > 35) changed = true;
    }
    prevMotionRef.current = new Uint8ClampedArray(data);
    return changed;
  }, []);

  const speakGuide = useCallback((g: Guide) => {
    const now = Date.now();
    const score = g.global_proximity ?? 0;
    const bucket = score >= 75 ? 'H' : score >= 40 ? 'M' : 'L';
    const key = `${g.best_path}|${bucket}|${g.obstacles_summary?.slice(0, 30)}`;
    if (key === lastSpokenHashRef.current.key && now - lastSpokenHashRef.current.t < 3000) return;

    if (userSpeakingRef.current && score < 75) return;

    lastSpokenHashRef.current = { key, t: now };
    let urgent = false, rate = 1.1, pitch = 1;
    if (score >= 75) { urgent = true; rate = 1.3; pitch = 1.25; shortBeep(990); }
    else if (score >= 40) { urgent = false; rate = 1.15; pitch = 1.1; shortBeep(660); }
    else { urgent = false; rate = 1.05; pitch = 1; }

    speak(g.spoken, { urgent, rate, pitch });
    if (score >= 75 && 'vibrate' in navigator) navigator.vibrate([200, 80, 200]);
    else if (score >= 40 && 'vibrate' in navigator) navigator.vibrate(80);
  }, []);

  const tick = useCallback(async () => {
    if (Date.now() < cooldownUntilRef.current) return;
    // Allow up to 2 inflight requests for pipelining
    if (inflightRef.current >= 2) return;

    const isCalib = phaseRef.current === 'calibrating';
    // Decide fast vs detailed for guidance
    let mode: 'calibration'|'fast'|'detailed' = 'fast';
    if (isCalib) mode = 'calibration';
    else if (Date.now() - lastDetailedRef.current > 5000) {
      mode = 'detailed';
      lastDetailedRef.current = Date.now();
    }

    // Motion-based instant alert (only in guidance mode)
    if (!isCalib) {
      const sudden = detectSuddenChange();
      const now = Date.now();
      if (sudden && now - lastMotionAlertRef.current > 1500) {
        lastMotionAlertRef.current = now;
        shortBeep(1100, 0.12);
        if ('vibrate' in navigator) navigator.vibrate(60);
      }
    }

    const img = captureFrame(mode);
    if (!img) return;
    inflightRef.current += 1;
    const t0 = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode },
      });
      const dt = Math.round(performance.now() - t0);
      latencyRef.current = dt;
      setLatencyMs(dt);

      if (error) {
        const status = (error as any)?.context?.response?.status ?? (error as any)?.status;
        if (status === 429 || status === 402) {
          cooldownUntilRef.current = Date.now() + 6000;
          setErrMsg(status === 402 ? 'نفذت الأرصدة' : 'النظام مزدحم');
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
        calibAttemptsRef.current += 1;
        speak(c.spoken, { urgent: false, rate: 1.1 });
        if (c.position_ok) {
          setTimeout(() => setPhaseBoth('guiding'), 800);
        } else if (calibAttemptsRef.current >= MAX_CALIB_ATTEMPTS) {
          setTimeout(() => {
            speak('سأبدأ المساعدة الآن.', { urgent: true });
            setPhaseBoth('guiding');
          }, 1000);
        }
      } else {
        const g = data as Guide;
        // Merge: keep cells from previous detailed if this was fast
        if (mode === 'fast' && lastGuideRef.current?.cells) {
          g.cells = lastGuideRef.current.cells;
        }
        lastGuideRef.current = g;
        setLastGuide(g);
        speakGuide(g);
      }
    } catch (e) {
      console.warn('tick error', e);
    } finally {
      inflightRef.current = Math.max(0, inflightRef.current - 1);
    }
  }, [captureFrame, detectSuddenChange, speakGuide]);

  // Adaptive loop - faster gaps
  useEffect(() => {
    if (phase === 'stopped' || phase === 'starting') return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    const loop = () => {
      const now = Date.now();
      const score = lastGuideRef.current?.global_proximity ?? 0;
      const minGap = phase === 'calibrating' ? 1500 : score >= 75 ? 400 : score >= 40 ? 900 : 1800;
      if (now - lastTickRef.current >= minGap) {
        lastTickRef.current = now;
        tick();
      }
    };

    intervalRef.current = window.setInterval(loop, 200);
    const t = window.setTimeout(loop, 600);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.clearTimeout(t);
    };
  }, [phase, tick]);

  useEffect(() => {
    if (phase === 'guiding') {
      const t = setTimeout(() => {
        speak('ممتاز، بدأنا. تستطيع التحدث معي في أي وقت.', { urgent: true });
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

    userSpeakingRef.current = true;
    const g = lastGuideRef.current;
    const visualContext = g
      ? `أهم عقبة: ${g.obstacles_summary}. أفضل اتجاه: ${g.best_path}. القرب: ${g.global_proximity}/100.`
      : undefined;
    chatHistoryRef.current = [...chatHistoryRef.current, { role: 'user' as const, text: t }].slice(-6);
    try {
      // Skip image for chat to make it faster - rely on visual context
      const { data, error } = await supabase.functions.invoke('blind-eye-chat', {
        body: {
          text: t,
          history: chatHistoryRef.current.slice(0, -1),
          visualContext,
        },
      });
      if (error) throw error;
      if (data?.spoken) {
        chatHistoryRef.current = [...chatHistoryRef.current, { role: 'assistant' as const, text: data.spoken }].slice(-6);
        speak(data.spoken, { urgent: true, rate: 1.15, onEnd: () => { userSpeakingRef.current = false; } });
      } else {
        userSpeakingRef.current = false;
      }
    } catch (e) {
      console.warn('chat err', e);
      userSpeakingRef.current = false;
    }
  }, [startCamera, stopAll]);

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
  // Also overlay top_hazards if no detailed cells available
  if (!lastGuide?.cells && lastGuide?.top_hazards) {
    lastGuide.top_hazards.forEach(h => {
      cellsById[h.id] = { id: h.id, label: h.label, object: h.label, proximity: 80, hazard: h.hazard };
    });
  }

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
      <canvas ref={motionCanvasRef} className="hidden" />

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

      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent z-10">
        <Link
          to="/damij/blind-eye"
          onClick={stopAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-base"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع
        </Link>

        <div className="flex items-center gap-2">
          {latencyMs > 0 && phase === 'guiding' && (
            <div className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3" />
              {latencyMs}ms
            </div>
          )}
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

      {phase === 'guiding' && lastGuide && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur rounded-full p-3 border-2 border-white/40 shadow-2xl">
            <PathArrow className="w-10 h-10" />
          </div>
        </div>
      )}

      {phase === 'calibrating' && lastCalib && (
        <div className="absolute top-24 inset-x-4 p-5 rounded-2xl bg-indigo-700/90 backdrop-blur shadow-2xl z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
              محاولة {Math.min(calibAttemptsRef.current, MAX_CALIB_ATTEMPTS)} / {MAX_CALIB_ATTEMPTS}
            </div>
          </div>
          <div className="text-2xl font-extrabold leading-tight">{lastCalib.spoken}</div>
          {lastCalib.adjustment && (
            <div className="mt-2 text-white/90 text-sm">{lastCalib.adjustment}</div>
          )}
        </div>
      )}

      {errMsg && (
        <div className="absolute top-24 inset-x-4 p-3 rounded-xl bg-red-600/90 backdrop-blur z-10 text-center font-bold">
          {errMsg}
        </div>
      )}

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
