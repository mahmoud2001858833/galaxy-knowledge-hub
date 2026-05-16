import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Power, Volume2, Mic, Activity, ArrowUp, ArrowLeft as ArrowL, ArrowRight as ArrowR, Zap, Eye, EyeOff, Scan } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocalVision, type LocalFrameStats } from './localVision';
import HudOverlay, { type DetectedPoint } from './HudOverlay';
import {
  pickArabicVoice, enqueueSpeech, speakDedup, cancelAllSpeech,
  earcons, vibrate, isSpeaking,
} from './speechQueue';

type Phase = 'starting' | 'calibrating' | 'guiding' | 'stopped';

type AIObject = {
  x: number; y: number; w: number; h: number;
  label: string; hazard: 'low'|'medium'|'high'; proximity: number;
};

type Guide = {
  objects?: AIObject[];
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

const BlindEyeNavigator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const localVisionRef = useRef<LocalVision | null>(null);
  const phaseRef = useRef<Phase>('starting');
  const inflightRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const calibAttemptsRef = useRef<number>(0);
  const lastAITickRef = useRef<number>(0);
  const lastLocalTickRef = useRef<number>(0);
  const lastGuideRef = useRef<Guide | null>(null);
  const lastStatsRef = useRef<LocalFrameStats | null>(null);
  const chatHistoryRef = useRef<Array<{ role: 'user'|'assistant'; text: string }>>([]);
  const userSpeakingRef = useRef<boolean>(false);
  const lastHazardSoundRef = useRef<number>(0);
  const lastApproachSoundRef = useRef<number>(0);
  const lastDirSoundRef = useRef<number>(0);
  const prevProximityRef = useRef<number>(0);
  const sceneChangePendingRef = useRef<boolean>(false);
  const MAX_CALIB_ATTEMPTS = 3;

  const [phase, setPhase] = useState<Phase>('starting');
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [lastCalib, setLastCalib] = useState<Calib | null>(null);
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [aiFps, setAiFps] = useState<number>(0);
  const [points, setPoints] = useState<DetectedPoint[]>([]);
  const [companionMode, setCompanionMode] = useState<boolean>(true);
  const [eyesOff, setEyesOff] = useState<boolean>(false);

  const setPhaseBoth = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  // ---- Camera ----
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
      enqueueSpeech({ text: 'مرحباً، ساعدني في توجيه الكاميرا. ثلاث محاولات.', priority: 'critical' });
    } catch (e) {
      console.error(e);
      toast.error('تعذّر فتح الكاميرا');
      enqueueSpeech({ text: 'تعذّر فتح الكاميرا. الرجاء السماح بالوصول.', priority: 'critical' });
    }
  }, []);

  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setPhaseBoth('stopped');
    cancelAllSpeech();
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    enqueueSpeech({ text: 'تم الإيقاف', priority: 'critical' });
  }, []);

  // ---- Frame capture for AI ----
  const captureFrame = useCallback((mode: 'calibration'|'fast'|'detailed'|'points'): string | null => {
    const v = videoRef.current;
    const c = captureCanvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    const w = mode === 'calibration' ? 320 : mode === 'detailed' ? 480 : 384;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || Math.round(w * 0.75);
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    const q = mode === 'calibration' ? 0.55 : mode === 'detailed' ? 0.65 : 0.55;
    return c.toDataURL('image/jpeg', q);
  }, []);

  // ---- AI tick ----
  const runAI = useCallback(async (mode: 'calibration'|'fast'|'detailed'|'points') => {
    if (Date.now() < cooldownUntilRef.current) return;
    if (inflightRef.current >= 3) return;
    const img = captureFrame(mode);
    if (!img) return;
    inflightRef.current += 1;
    const t0 = performance.now();
    try {
      const g = lastGuideRef.current;
      const ctx = g ? `أهم: ${g.obstacles_summary?.slice(0, 50)}. مسار: ${g.best_path}.` : undefined;
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode, context: ctx },
      });
      const dt = Math.round(performance.now() - t0);
      setLatencyMs(dt);
      setAiFps(Math.round(1000 / Math.max(dt, 200)));

      if (error) {
        const status = (error as any)?.context?.response?.status ?? (error as any)?.status;
        if (status === 429 || status === 402) {
          cooldownUntilRef.current = Date.now() + 6000;
          setErrMsg(status === 402 ? 'نفذت الأرصدة' : 'النظام مزدحم');
          enqueueSpeech({ text: 'النظام مشغول قليلاً', priority: 'descriptive' });
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
        enqueueSpeech({ text: c.spoken, priority: 'directional', rate: 1.05 });
        if (c.position_ok) {
          setTimeout(() => setPhaseBoth('guiding'), 700);
        } else if (calibAttemptsRef.current >= MAX_CALIB_ATTEMPTS) {
          setTimeout(() => {
            enqueueSpeech({ text: 'سأبدأ الآن', priority: 'critical' });
            setPhaseBoth('guiding');
          }, 800);
        }
      } else {
        const g = data as Guide;
        lastGuideRef.current = g;
        setLastGuide(g);
        // Update points from AI objects
        if (Array.isArray(g.objects)) {
          setPoints(g.objects.map(o => ({
            x: Math.max(0, Math.min(1, o.x)),
            y: Math.max(0, Math.min(1, o.y)),
            w: o.w, h: o.h,
            label: o.label,
            hazard: o.hazard,
            proximity: o.proximity,
            source: 'ai' as const,
          })));
        }
        // Speak with dedupe + priority
        const score = g.global_proximity ?? 0;
        const bucket = score >= 75 ? 'H' : score >= 40 ? 'M' : 'L';
        const key = `${g.best_path}|${bucket}|${g.obstacles_summary?.slice(0, 25)}`;
        const pri = score >= 75 ? 'critical' : score >= 40 ? 'directional' : 'descriptive';
        if (!(userSpeakingRef.current && score < 75)) {
          speakDedup(g.spoken, key, pri, 2500, {
            rate: score >= 75 ? 1.25 : score >= 40 ? 1.15 : 1.05,
            pitch: score >= 75 ? 1.2 : 1,
          });
        }
        // Earcons + vibration
        const prev = prevProximityRef.current;
        if (score >= 75 && Date.now() - lastHazardSoundRef.current > 700) {
          lastHazardSoundRef.current = Date.now();
          const pan = g.best_path === 'left' ? 0.9 : g.best_path === 'right' ? -0.9 : 0;
          earcons.hazard(pan);
          vibrate([180, 70, 180]);
        } else if (score - prev > 12 && Date.now() - lastApproachSoundRef.current > 900) {
          lastApproachSoundRef.current = Date.now();
          earcons.approach();
          if (score >= 40) vibrate(60);
        } else if (prev - score > 15 && Date.now() - lastApproachSoundRef.current > 1200) {
          lastApproachSoundRef.current = Date.now();
          earcons.away();
        }
        prevProximityRef.current = score;
        // Directional earcon every ~2s
        if (Date.now() - lastDirSoundRef.current > 2000) {
          lastDirSoundRef.current = Date.now();
          if (g.best_path === 'left') earcons.pointLeft();
          else if (g.best_path === 'right') earcons.pointRight();
          else earcons.pointAhead();
        }
      }
    } catch (e) {
      console.warn('AI tick error', e);
    } finally {
      inflightRef.current = Math.max(0, inflightRef.current - 1);
    }
  }, [captureFrame]);

  // ---- Main loop: local vision @ ~12Hz + AI streaming ----
  useEffect(() => {
    if (phase === 'stopped' || phase === 'starting') return;
    if (!localVisionRef.current) localVisionRef.current = new LocalVision();

    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const now = Date.now();
      const v = videoRef.current;

      // Local vision tick (~70ms)
      if (v && now - lastLocalTickRef.current >= 70) {
        lastLocalTickRef.current = now;
        const stats = localVisionRef.current!.analyze(v);
        if (stats) {
          lastStatsRef.current = stats;
          // Instant hazard alert from bottom motion + edges
          const bottomDanger = stats.bottomMotion > 0.18 && (stats.cells[7].edge > 0.35 || stats.cells[6].edge > 0.35 || stats.cells[8].edge > 0.35);
          if (bottomDanger && now - lastHazardSoundRef.current > 600) {
            lastHazardSoundRef.current = now;
            earcons.hazard(0);
            vibrate(50);
          }
          // Scene change → schedule priority AI tick
          if (stats.sceneChange > 0.45) sceneChangePendingRef.current = true;

          // Build local "interest" points from cells (fade alongside AI points)
          if (companionMode) {
            const localPts: DetectedPoint[] = [];
            stats.cells.forEach((cell, idx) => {
              const cx = (idx % 3 + 0.5) / 3;
              const cy = (Math.floor(idx / 3) + 0.5) / 3;
              const activity = Math.max(cell.motion, cell.edge * 0.7);
              if (activity > 0.25) {
                localPts.push({
                  x: cx, y: cy,
                  label: '',
                  hazard: activity > 0.5 && cy > 0.5 ? 'high' : activity > 0.4 ? 'medium' : 'low',
                  proximity: Math.round(activity * 100),
                  source: 'local',
                });
              }
            });
            // Merge: keep AI points + supplementary local points (limit)
            setPoints(prev => {
              const aiOnly = prev.filter(p => p.source === 'ai');
              return [...aiOnly, ...localPts.slice(0, 6)];
            });
          }
        }
      }

      // AI tick (adaptive)
      const score = lastGuideRef.current?.global_proximity ?? 0;
      const stats = lastStatsRef.current;
      const sceneChanged = sceneChangePendingRef.current;
      const stagnant = stats && stats.globalMotion < 0.012;
      let minGap = phase === 'calibrating' ? 1400 : score >= 75 ? 350 : score >= 40 ? 700 : 1400;
      if (sceneChanged) minGap = 250;
      if (stagnant && phase === 'guiding') minGap = Math.max(minGap, 3000);

      if (now - lastAITickRef.current >= minGap) {
        lastAITickRef.current = now;
        if (sceneChanged) sceneChangePendingRef.current = false;
        const mode = phase === 'calibrating' ? 'calibration' : 'points';
        runAI(mode);
        if (phase === 'guiding') earcons.scanTick();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, companionMode, runAI]);

  useEffect(() => {
    if (phase === 'guiding') {
      const t = setTimeout(() => {
        enqueueSpeech({ text: 'بدأنا. تستطيع التحدث معي في أي وقت.', priority: 'critical' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ---- Voice chat ----
  const handleVoiceInput = useCallback(async (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    if (/^(توقف|أوقف|اوقف|قف الآن)$/.test(t)) { stopAll(); return; }
    if (/(أكمل|اكمل|تابع|كمل|ابدأ|ابدا)/.test(t)) {
      if (phaseRef.current === 'stopped') startCamera();
      return;
    }
    if (/(أعد|اعد|كرر)/.test(t) && lastGuideRef.current?.spoken) {
      enqueueSpeech({ text: lastGuideRef.current.spoken, priority: 'critical' });
      return;
    }
    if (/(امسح|إمسح|مسح المنطقه|مسح المنطقة|ماذا حولي|صف)/.test(t)) {
      runAI('detailed');
      enqueueSpeech({ text: 'لحظة، أمسح المنطقة الآن', priority: 'directional' });
      return;
    }

    userSpeakingRef.current = true;
    const g = lastGuideRef.current;
    const visualContext = g
      ? `أهم عقبة: ${g.obstacles_summary}. أفضل اتجاه: ${g.best_path}. القرب: ${g.global_proximity}/100.`
      : undefined;
    chatHistoryRef.current = [...chatHistoryRef.current, { role: 'user' as const, text: t }].slice(-6);
    try {
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
        enqueueSpeech({
          text: data.spoken,
          priority: 'directional',
          rate: 1.15,
          onEnd: () => { userSpeakingRef.current = false; },
        });
      } else {
        userSpeakingRef.current = false;
      }
    } catch (e) {
      console.warn('chat err', e);
      userSpeakingRef.current = false;
    }
  }, [startCamera, stopAll, runAI]);

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
      if (isSpeaking()) return;
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

  const PathArrow = lastGuide?.best_path === 'left' ? ArrowL : lastGuide?.best_path === 'right' ? ArrowR : ArrowUp;

  return (
    <div className="fixed inset-0 bg-black text-white" dir="rtl">
      {!eyesOff && <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
      {eyesOff && <video ref={videoRef} playsInline muted className="absolute inset-0 w-0 h-0 opacity-0" />}
      <canvas ref={captureCanvasRef} className="hidden" />

      {!eyesOff && phase === 'guiding' && (
        <HudOverlay
          points={points}
          bestPath={lastGuide?.best_path}
          showLabels={companionMode}
          showGrid={companionMode}
        />
      )}

      <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent z-10">
        <Link
          to="/damij/blind-eye"
          onClick={stopAll}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> رجوع
        </Link>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {phase === 'guiding' && (
            <>
              <div className="text-[11px] bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3" /> {latencyMs}ms
              </div>
              <div className="text-[11px] bg-white/15 backdrop-blur px-2 py-1 rounded-full font-mono">
                {aiFps}fps
              </div>
              <button
                onClick={() => setCompanionMode(m => !m)}
                aria-label="وضع المرافق"
                className={`text-[11px] px-2 py-1 rounded-full backdrop-blur ${companionMode ? 'bg-emerald-600/80' : 'bg-white/15'}`}
              >
                {companionMode ? 'مرافق' : 'كفيف'}
              </button>
              <button
                onClick={() => setEyesOff(o => !o)}
                aria-label="إيقاف الشاشة"
                className="text-[11px] px-2 py-1 rounded-full bg-white/15 backdrop-blur flex items-center gap-1"
              >
                {eyesOff ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </>
          )}
          <div className={`text-xs px-2 py-1 rounded-full backdrop-blur flex items-center gap-1 ${listening ? 'bg-blue-600/80' : 'bg-white/15'}`}>
            <Mic className="w-3 h-3" />
            {listening ? 'يستمع' : 'صامت'}
          </div>
          <div className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {phase === 'calibrating' ? 'معايرة' : phase === 'guiding' ? 'إرشاد' : phase === 'stopped' ? 'متوقف' : 'يبدأ'}
          </div>
        </div>
      </div>

      {phase === 'guiding' && lastGuide && !eyesOff && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur rounded-full p-3 border-2 border-white/40 shadow-2xl">
            <PathArrow className="w-10 h-10" />
          </div>
        </div>
      )}

      {phase === 'calibrating' && lastCalib && (
        <div className="absolute top-20 inset-x-4 p-5 rounded-2xl bg-indigo-700/90 backdrop-blur shadow-2xl z-10">
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
        <div className="absolute top-20 inset-x-4 p-3 rounded-xl bg-red-600/90 backdrop-blur z-10 text-center font-bold">
          {errMsg}
        </div>
      )}

      {phase === 'guiding' && lastGuide && !eyesOff && (
        <div className={`absolute bottom-32 inset-x-4 p-4 rounded-2xl ${urgencyColor} shadow-2xl z-10`}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 shrink-0" />
            <div className="text-xl font-extrabold leading-tight">{lastGuide.spoken}</div>
          </div>
          {lastGuide.obstacles_summary && (
            <div className="mt-2 text-white/90 text-sm">{lastGuide.obstacles_summary}</div>
          )}
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>
      )}

      {eyesOff && phase === 'guiding' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="text-6xl font-extrabold mb-4">👁</div>
          <div className="text-xl opacity-80">الشاشة مطفأة لتوفير البطارية</div>
          <div className="text-sm opacity-60 mt-2">الإرشاد الصوتي يعمل</div>
          {lastGuide && (
            <div className="mt-6 text-2xl font-bold">{lastGuide.spoken}</div>
          )}
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/85 to-transparent z-10">
        {phase === 'guiding' && (
          <button
            onClick={() => { runAI('detailed'); enqueueSpeech({ text: 'أمسح المنطقة', priority: 'directional' }); }}
            aria-label="مسح المنطقة"
            className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600 shadow-2xl active:scale-95"
          >
            <Scan className="w-7 h-7" />
          </button>
        )}
        <button
          onClick={phase === 'stopped' ? startCamera : stopAll}
          aria-label={phase === 'stopped' ? 'تشغيل الإرشاد' : 'إيقاف الإرشاد'}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-extrabold shadow-2xl active:scale-95 transition-all ${phase === 'stopped' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          <Power className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default BlindEyeNavigator;
