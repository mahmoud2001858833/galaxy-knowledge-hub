import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, Hand, Volume2, Trash2, AlertCircle, Loader2,
  Activity, Languages, Sparkles, Copy, Wand2, Globe, Zap, Type, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCameraStream, getCameraSupport, mapCameraError, type CameraSupport } from './camera';
import { filterGesture, buildSentence, type DetectedToken } from './gestureFilter';
import { SPOKEN_LANGUAGES, type SpokenLang } from './languages';
import { SIGN_SYSTEMS } from './signSystems';
import { supabase } from '@/integrations/supabase/client';

// ── Gesture vocabulary (Arabic) ──
const gestureToArabic: Record<string, { text: string; emoji: string; description: string }> = {
  open_palm: { text: 'مرحبا', emoji: '✋', description: 'كف مفتوح' },
  thumbs_up: { text: 'نعم', emoji: '👍', description: 'إبهام للأعلى' },
  thumbs_down: { text: 'لا', emoji: '👎', description: 'إبهام للأسفل' },
  pointing_up: { text: 'واحد', emoji: '☝️', description: 'سبابة للأعلى' },
  victory: { text: 'اثنان', emoji: '✌️', description: 'إصبعان مرفوعان' },
  fist: { text: 'توقف', emoji: '✊', description: 'قبضة مغلقة' },
  rock: { text: 'حماس', emoji: '🤘', description: 'سبابة وخنصر' },
  ok_sign: { text: 'ممتاز', emoji: '👌', description: 'إبهام وسبابة دائرة' },
  three_fingers: { text: 'ثلاثة', emoji: '3️⃣', description: 'ثلاثة أصابع' },
  four_fingers: { text: 'أربعة', emoji: '4️⃣', description: 'أربعة أصابع' },
  call_me: { text: 'اتصل بي', emoji: '🤙', description: 'إبهام وخنصر' },
  pinch: { text: 'صغير', emoji: '🤏', description: 'إبهام وسبابة قريبان' },
  love: { text: 'أحبك', emoji: '🤟', description: 'إبهام وسبابة وخنصر' },
  pointing_right: { text: 'هناك', emoji: '👉', description: 'إشارة جانبية' },
  prayer: { text: 'شكراً', emoji: '🙏', description: 'كفان متلاصقان' },
  crossed_fingers: { text: 'إن شاء الله', emoji: '🤞', description: 'سبابة ووسطى متشابكتان' },
  flat_hand_down: { text: 'اهدأ', emoji: '🫳', description: 'كف مسطح للأسفل' },
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const SignTranslatorPro: React.FC = () => {
  // ─ refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const stableGestureRef = useRef<{ gesture: string | null; count: number }>({ gesture: null, count: 0 });
  const lastFiredGestureRef = useRef<string | null>(null);
  const acceptedTokensRef = useRef<DetectedToken[]>([]);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });
  const aiDebounceRef = useRef<number | null>(null);

  // ─ state
  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [handsCount, setHandsCount] = useState(0);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [cameraSupport, setCameraSupport] = useState<CameraSupport | null>(null);

  // ─ language picks
  const [signSystem, setSignSystem] = useState<string>('ArSL');
  const [targetLang, setTargetLang] = useState<SpokenLang>(
    SPOKEN_LANGUAGES.find(l => l.code === 'en-US') || SPOKEN_LANGUAGES[1],
  );

  // ─ text-to-sign mode
  const [t2sInput, setT2sInput] = useState('');
  const [t2sOutput, setT2sOutput] = useState('');
  const [t2sLoading, setT2sLoading] = useState(false);

  // ─ tab
  const [tab, setTab] = useState<'sign2text' | 'text2sign'>('sign2text');

  useEffect(() => {
    getCameraSupport().then(setCameraSupport).catch(() => {});
    // Pre-warm MediaPipe model in the background so detection starts
    // instantly when the user enables the camera.
    if (!handLandmarkerRef.current) {
      // call the lazy initializer; ignore errors here, retry on real start
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      initHand().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Gesture classification (lifted from original page) ───
  const classifyGesture = useCallback((landmarks: any[]): { gesture: string; confidence: number } | null => {
    if (!landmarks?.length) return null;
    const hand = landmarks[0];
    if (!hand || hand.length < 21) return null;
    const tt = hand[4], ti = hand[3], tm = hand[2], tc = hand[1];
    const it = hand[8], id = hand[7], ip = hand[6], im = hand[5];
    const mt = hand[12], md = hand[11], mp = hand[10], mm = hand[9];
    const rt = hand[16], rd = hand[15], rp = hand[14], rm = hand[13];
    const pt = hand[20], pd = hand[19], pp = hand[18], pm = hand[17];
    const w = hand[0];
    const dist = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    const ang = (a: any, b: any, c: any) => {
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
      const d = ab.x * cb.x + ab.y * cb.y;
      const ma = Math.sqrt(ab.x ** 2 + ab.y ** 2), mc = Math.sqrt(cb.x ** 2 + cb.y ** 2);
      if (!ma || !mc) return 0;
      return Math.acos(Math.max(-1, Math.min(1, d / (ma * mc)))) * 180 / Math.PI;
    };
    const ext = (tip: any, dip: any, pip: any, mcp: any) => {
      if (ang(mcp, pip, tip) < 155) return false;
      if (dist(tip, w) < dist(pip, w) * 1.05) return false;
      if (ang(pip, dip, tip) < 135) return false;
      return true;
    };
    const iU = ext(it, id, ip, im), mU = ext(mt, md, mp, mm), rU = ext(rt, rd, rp, rm), pU = ext(pt, pd, pp, pm);
    const isLeft = tc.x < pm.x;
    const tAng = ang(tc, tm, tt);
    const tToIm = dist(tt, im);
    const palmW = dist(im, pm) || 0.0001;
    const tAway = tToIm / palmW > 0.85;
    const tStr = tAng > 150;
    const tSide = isLeft ? tt.x > ti.x + 0.005 : tt.x < ti.x - 0.005;
    const tExt = (tStr && tSide) || tAway;
    const tUp = tExt && tt.y < ti.y - 0.03 && tt.y < w.y - 0.05;
    const tDn = tExt && tt.y > ti.y + 0.03 && tt.y > w.y + 0.04;
    const cnt = [iU, mU, rU, pU].filter(Boolean).length;
    if (tExt && iU && !mU && !rU && pU) return { gesture: 'love', confidence: 0.93 };
    const tiD = dist(tt, it);
    if (tiD < 0.055 && mU && rU && pU) return { gesture: 'ok_sign', confidence: 0.9 };
    if (tiD < 0.055 && !mU && !rU && !pU) return { gesture: 'pinch', confidence: 0.85 };
    if (iU && !mU && !rU && pU && !tExt) return { gesture: 'rock', confidence: 0.91 };
    if (tExt && !iU && !mU && !rU && pU) return { gesture: 'call_me', confidence: 0.88 };
    const spread = dist(it, mt) > 0.045 || dist(mt, rt) > 0.045 || dist(rt, pt) > 0.045;
    if (iU && mU && rU && pU && (tExt || spread)) {
      const palmDown = w.y < im.y && (im.y - w.y) > 0.06;
      if (palmDown && tExt) return { gesture: 'flat_hand_down', confidence: 0.83 };
      return { gesture: 'open_palm', confidence: 0.94 };
    }
    if (iU && mU && rU && pU && !tExt && !spread && cnt === 4) return { gesture: 'four_fingers', confidence: 0.85 };
    if (iU && mU && rU && !pU && cnt === 3) return { gesture: 'three_fingers', confidence: 0.88 };
    const imD = dist(it, mt);
    if (iU && mU && !rU && !pU && imD < 0.035) return { gesture: 'crossed_fingers', confidence: 0.82 };
    if (iU && mU && !rU && !pU && cnt === 2) return { gesture: 'victory', confidence: 0.91 };
    if (iU && !mU && !rU && !pU && !tExt && cnt === 1) return { gesture: 'pointing_up', confidence: 0.93 };
    if (iU && !mU && !rU && !pU && tExt) {
      const horiz = Math.abs(it.y - im.y) < 0.07;
      return horiz ? { gesture: 'pointing_right', confidence: 0.82 } : { gesture: 'pointing_up', confidence: 0.89 };
    }
    if (tUp && !iU && !mU && !rU && !pU && cnt === 0) return { gesture: 'thumbs_up', confidence: 0.93 };
    if (tDn && !iU && !mU && !rU && !pU && cnt === 0) return { gesture: 'thumbs_down', confidence: 0.89 };
    if (!iU && !mU && !rU && !pU && !tExt && cnt === 0) return { gesture: 'fist', confidence: 0.88 };
    const tight = dist(it, mt) < 0.035 && dist(mt, rt) < 0.035 && dist(rt, pt) < 0.035;
    if (tight && cnt === 4 && !tExt) return { gesture: 'prayer', confidence: 0.8 };
    return null;
  }, []);

  // ─── AI calls (debounced) ───
  const callAI = useCallback(async (mode: 'translate' | 'correct' | 'text2sign', text: string, extra?: any) => {
    const { data, error } = await supabase.functions.invoke('damij-sign-translate', {
      body: { text, mode, ...extra },
    });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return (data as any).result as string;
  }, []);

  const refreshAI = useCallback((sentence: string) => {
    if (aiDebounceRef.current) window.clearTimeout(aiDebounceRef.current);
    if (!sentence.trim()) {
      setCorrectedText(''); setTranslatedText(''); return;
    }
    aiDebounceRef.current = window.setTimeout(async () => {
      setIsAILoading(true);
      try {
        const corrected = await callAI('correct', sentence);
        setCorrectedText(corrected);
        const translated = await callAI('translate', corrected, {
          targetLang: targetLang.code,
          targetLangName: targetLang.name,
        });
        setTranslatedText(translated);
      } catch (e: any) {
        toast.error(e?.message || 'فشل الاتصال بالمساعد الذكي');
      } finally {
        setIsAILoading(false);
      }
    }, 900);
  }, [callAI, targetLang]);

  // re-translate when target language changes
  useEffect(() => {
    if (correctedText) {
      (async () => {
        setIsAILoading(true);
        try {
          const translated = await callAI('translate', correctedText, {
            targetLang: targetLang.code,
            targetLangName: targetLang.name,
          });
          setTranslatedText(translated);
        } catch (e: any) {
          toast.error(e?.message || 'فشل الترجمة');
        } finally { setIsAILoading(false); }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLang.code]);

  const handleGestureDetected = useCallback((gesture: string, gc: number) => {
    const info = gestureToArabic[gesture];
    if (!info) return;
    const incoming: DetectedToken = { gesture, text: info.text, confidence: gc, timestamp: Date.now() };
    const decision = filterGesture(incoming, acceptedTokensRef.current);
    if (decision.action === 'ignore') return;
    if (decision.action === 'replace') {
      acceptedTokensRef.current = [...acceptedTokensRef.current.slice(0, -1), incoming];
    } else {
      acceptedTokensRef.current = [...acceptedTokensRef.current, incoming].slice(-200);
    }
    setCurrentGesture(gesture);
    setConfidence(Math.round(gc * 100));
    const sentence = buildSentence(acceptedTokensRef.current);
    setDetectedText(sentence);
    refreshAI(sentence);
    setTimeout(() => setCurrentGesture(null), 1000);
  }, [refreshAI]);

  // ─── MediaPipe init + detection loop (compact) ───
  const initHand = useCallback(async () => {
    setLoadingStep('تحميل نموذج الذكاء الاصطناعي…');
    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const wasmCandidates = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      ];
      let vision: any = null;
      for (const w of wasmCandidates) {
        try { vision = await FilesetResolver.forVisionTasks(w); break; } catch {}
      }
      if (!vision) throw new Error('WASM load failed');
      const opts = {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU' as const,
        },
        runningMode: 'VIDEO' as const,
        numHands: 2,
        minHandDetectionConfidence: 0.25,
        minHandPresenceConfidence: 0.25,
        minTrackingConfidence: 0.25,
      };
      let hl;
      try { hl = await HandLandmarker.createFromOptions(vision, opts); }
      catch { hl = await HandLandmarker.createFromOptions(vision, { ...opts, baseOptions: { ...opts.baseOptions, delegate: 'CPU' as const } }); }
      handLandmarkerRef.current = hl;
      setMediapipeReady(true);
      return hl;
    } catch (e) {
      console.error(e);
      throw new Error('تعذّر تحميل نموذج التعرّف. تحقّق من الإنترنت أو مانع الإعلانات.');
    }
  }, []);

  const drawLandmarks = (ctx: CanvasRenderingContext2D, lm: any[], W: number, H: number, ok: boolean) => {
    const c = ok ? 'hsl(var(--damij-primary))' : '#94a3b8';
    ctx.lineWidth = 3;
    for (const [s, e] of HAND_CONNECTIONS) {
      const a = lm[s], b = lm[e];
      if (a && b) { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke(); }
    }
    for (let i = 0; i < lm.length; i++) {
      const p = lm[i], tip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, tip ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    }
  };

  const startLoop = useCallback((hl: any) => {
    let lastTs = -1;
    const step = () => {
      if (!videoRef.current || !hl || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(step); return;
      }
      const now = performance.now();
      if (now <= lastTs) { animationFrameRef.current = requestAnimationFrame(step); return; }
      lastTs = now;
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current = { frames: 0, lastTime: now };
      }
      try {
        const res = hl.detectForVideo(videoRef.current, Math.round(now));
        if (res.landmarks?.length) {
          setHandDetected(true);
          setHandsCount(res.landmarks.length);
          const r = classifyGesture(res.landmarks);
          if (r) {
            if (stableGestureRef.current.gesture === r.gesture) stableGestureRef.current.count++;
            else stableGestureRef.current = { gesture: r.gesture, count: 1 };
            const t = Date.now();
            const diff = lastFiredGestureRef.current !== r.gesture;
            const cool = t - lastGestureTimeRef.current > 1100;
            // First gesture fires faster (3 stable frames), subsequent need 4
            const need = lastFiredGestureRef.current === null ? 3 : 4;
            if (stableGestureRef.current.count >= need && (diff || cool)) {
              handleGestureDetected(r.gesture, r.confidence);
              lastGestureTimeRef.current = t;
              lastFiredGestureRef.current = r.gesture;
              stableGestureRef.current = { gesture: r.gesture, count: 0 };
            }
          } else {
            stableGestureRef.current = { gesture: null, count: 0 };
            lastFiredGestureRef.current = null;
          }
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              for (const h of res.landmarks) drawLandmarks(ctx, h, canvasRef.current.width, canvasRef.current.height, !!r);
            }
          }
        } else {
          setHandDetected(false); setHandsCount(0); setConfidence(0);
          stableGestureRef.current = { gesture: null, count: 0 };
          if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }
        }
      } catch (e) { console.warn(e); }
      animationFrameRef.current = requestAnimationFrame(step);
    };
    animationFrameRef.current = requestAnimationFrame(step);
  }, [classifyGesture, handleGestureDetected]);

  const startCamera = async () => {
    try {
      setError(null); setDemoMode(false); setIsLoading(true); setLoadingStep('طلب إذن الكاميرا…');
      const stream = await getCameraStream();
      streamRef.current = stream;
      if (!videoRef.current) { stream.getTracks().forEach(t => t.stop()); throw new Error('Video element missing'); }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const hl = handLandmarkerRef.current ?? await initHand();
      setIsLoading(false);
      startLoop(hl);
      toast.success('الكاميرا جاهزة. ابدأ بالإشارة فوراً ✋');
    } catch (e: any) {
      console.error(e);
      setError(mapCameraError(e, cameraSupport) || e?.message || 'حدث خطأ');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    try { handLandmarkerRef.current?.close?.(); } catch {}
    handLandmarkerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false); setHandDetected(false); setMediapipeReady(false);
    setConfidence(0); setFps(0); setHandsCount(0);
  };

  useEffect(() => () => stopCamera(), []);

  const speakText = (text: string, lang = 'ar-SA') => {
    if (!text.trim()) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(x => x.lang === lang) || voices.find(x => x.lang.startsWith(lang.split('-')[0]));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const clearAll = () => {
    acceptedTokensRef.current = [];
    setDetectedText(''); setCorrectedText(''); setTranslatedText('');
  };

  const copyText = (t: string) => { navigator.clipboard.writeText(t); toast.success('تم النسخ'); };

  const runText2Sign = async () => {
    if (!t2sInput.trim()) return;
    setT2sLoading(true);
    try {
      const r = await callAI('text2sign', t2sInput, { signSystem });
      setT2sOutput(r);
    } catch (e: any) { toast.error(e?.message || 'فشل التحويل'); }
    finally { setT2sLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setTab('sign2text')}
          className={`px-5 py-3 rounded-xl font-bold transition-all ${tab === 'sign2text' ? 'bg-[hsl(var(--damij-primary))] text-white shadow-lg' : 'bg-white text-[hsl(var(--damij-primary))] border border-[hsl(var(--damij-primary))]/20'}`}
        >
          <Hand className="inline w-5 h-5 ml-2" /> إشارة ⟶ نص + ترجمة
        </button>
        <button
          onClick={() => setTab('text2sign')}
          className={`px-5 py-3 rounded-xl font-bold transition-all ${tab === 'text2sign' ? 'bg-[hsl(var(--damij-primary))] text-white shadow-lg' : 'bg-white text-[hsl(var(--damij-primary))] border border-[hsl(var(--damij-primary))]/20'}`}
        >
          <Type className="inline w-5 h-5 ml-2" /> نص ⟶ إشارة
        </button>
      </div>

      {/* Language selectors */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
            <Hand className="w-4 h-4" /> نظام الإشارة ({SIGN_SYSTEMS.length})
          </label>
          <select
            value={signSystem}
            onChange={(e) => setSignSystem(e.target.value)}
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white"
          >
            {SIGN_SYSTEMS.map(s => (
              <option key={s.code} value={s.code}>{s.nativeName} — {s.code} · {s.region}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" /> اللغة المستهدفة ({SPOKEN_LANGUAGES.length}+ لغة)
          </label>
          <select
            value={targetLang.code}
            onChange={(e) => setTargetLang(SPOKEN_LANGUAGES.find(l => l.code === e.target.value)!)}
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white"
          >
            {SPOKEN_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.nativeName} — {l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {tab === 'sign2text' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-[hsl(var(--damij-primary))]/20">
              {!cameraActive && !isLoading && !error && !demoMode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <Camera className="w-16 h-16 mb-4 opacity-70" />
                  <p className="text-lg mb-4 font-bold">مترجم لغة الإشارة الذكي</p>
                  <p className="text-sm text-white/70 mb-4">يدعم {SIGN_SYSTEMS.length} نظام إشارة و {SPOKEN_LANGUAGES.length}+ لغة</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button onClick={startCamera} className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center gap-2">
                      <Camera className="w-5 h-5" /> تشغيل الكاميرا
                    </button>
                    <button onClick={() => setDemoMode(true)} className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/30 font-bold">
                      وضع تجريبي
                    </button>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white">
                  <Loader2 className="w-12 h-12 animate-spin mb-3" />
                  <p>{loadingStep}</p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                  <p className="text-red-300 mb-4">{error}</p>
                  <button onClick={startCamera} className="px-5 py-2 rounded-xl bg-[hsl(var(--damij-primary))]">إعادة المحاولة</button>
                </div>
              )}
              <video ref={videoRef} className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} playsInline muted style={{ transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${!cameraActive ? 'hidden' : ''}`} style={{ transform: 'scaleX(-1)' }} />

              {cameraActive && (
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> مباشر
                  </span>
                  {mediapipeReady && (
                    <>
                      <span className="px-3 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-bold flex items-center gap-1">
                        <Hand className="w-3 h-3" /> {handDetected ? `${handsCount} يد` : 'أظهر يدك'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {fps} FPS
                      </span>
                    </>
                  )}
                </div>
              )}

              <AnimatePresence>
                {currentGesture && gestureToArabic[currentGesture] && (
                  <motion.div
                    initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 left-3 bg-[hsl(var(--damij-primary))] text-white px-4 py-2 rounded-2xl shadow-2xl"
                  >
                    <span className="text-xl ml-2">{gestureToArabic[currentGesture].emoji}</span>
                    <span className="font-bold">{gestureToArabic[currentGesture].text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {cameraActive && handDetected && confidence > 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 px-4 py-2 flex items-center gap-2 text-white text-xs">
                  <span>الثقة</span>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${confidence}%` }} className={`h-full ${confidence > 80 ? 'bg-green-400' : confidence > 50 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  </div>
                  <span>{confidence}%</span>
                </div>
              )}
            </div>

            {cameraActive && (
              <button onClick={stopCamera} className="w-full py-3 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2">
                <CameraOff className="w-5 h-5" /> إيقاف الكاميرا
              </button>
            )}

            {demoMode && !cameraActive && (
              <div className="bg-white p-4 rounded-2xl border border-[hsl(var(--damij-primary))]/15">
                <p className="font-bold text-[hsl(var(--damij-primary))] mb-3">جرّب الإشارات بدون كاميرا</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(gestureToArabic).map(([k, v]) => (
                    <button key={k} onClick={() => handleGestureDetected(k, 0.99)}
                      className="p-2 rounded-lg bg-[hsl(var(--damij-surface))] hover:bg-[hsl(var(--damij-primary))]/10 text-sm flex items-center gap-2">
                      <span className="text-lg">{v.emoji}</span><span>{v.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="space-y-4">
            {/* Raw */}
            <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/15">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2"><Hand className="w-4 h-4" /> النص الخام (إشارات)</h3>
                <div className="flex gap-1">
                  <button onClick={() => copyText(detectedText)} className="p-2 rounded-lg hover:bg-slate-100" title="نسخ"><Copy className="w-4 h-4" /></button>
                  <button onClick={clearAll} className="p-2 rounded-lg hover:bg-slate-100" title="مسح"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              <div className="min-h-[60px] p-3 rounded-xl bg-slate-50 text-lg leading-relaxed">
                {detectedText || <span className="text-slate-400">سيظهر تتابع الكلمات هنا…</span>}
              </div>
            </div>

            {/* Corrected */}
            <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-[hsl(var(--damij-accent-2,200_60%_50%))]/5 rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Wand2 className="w-4 h-4" /> الجملة بعد التصحيح اللغوي
                  {isAILoading && <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--damij-primary))]" />}
                </h3>
                <div className="flex gap-1">
                  <button onClick={() => speakText(correctedText, 'ar-SA')} className="p-2 rounded-lg hover:bg-white" title="نطق"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => copyText(correctedText)} className="p-2 rounded-lg hover:bg-white" title="نسخ"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="min-h-[60px] p-3 rounded-xl bg-white text-lg leading-relaxed font-medium">
                {correctedText || <span className="text-slate-400">سيُصاغ النص بفصاحة عربية تلقائياً…</span>}
              </div>
            </div>

            {/* Translated */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-5 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-emerald-700 flex items-center gap-2">
                  <Languages className="w-4 h-4" /> الترجمة إلى {targetLang.flag} {targetLang.nativeName}
                  {isAILoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h3>
                <div className="flex gap-1">
                  <button onClick={() => speakText(translatedText, targetLang.code)} className="p-2 rounded-lg hover:bg-white" title="نطق بلغة الهدف"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => copyText(translatedText)} className="p-2 rounded-lg hover:bg-white" title="نسخ"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="min-h-[60px] p-3 rounded-xl bg-white text-lg leading-relaxed font-medium" dir="auto">
                {translatedText || <span className="text-slate-400">ستظهر الترجمة الفورية هنا…</span>}
              </div>
            </div>

            <div className="text-xs text-[hsl(var(--damij-text))]/60 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" /> مدعوم بـ Lovable AI Gateway · Gemini
            </div>
          </div>
        </div>
      ) : (
        // Text → Sign mode
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/15 space-y-4">
            <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2"><Type className="w-4 h-4" /> اكتب جملة بأي لغة</h3>
            <textarea
              value={t2sInput}
              onChange={(e) => setT2sInput(e.target.value)}
              rows={6}
              placeholder="مثال: مرحباً، كيف حالك اليوم؟"
              className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-lg"
              dir="auto"
            />
            <button
              onClick={runText2Sign}
              disabled={t2sLoading || !t2sInput.trim()}
              className="w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {t2sLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              حوّل إلى تعليمات إشارة بنظام {signSystem}
            </button>
          </div>

          <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2"><Check className="w-4 h-4" /> التعليمات الحركية</h3>
              {t2sOutput && <button onClick={() => copyText(t2sOutput)} className="p-2 rounded-lg hover:bg-white"><Copy className="w-4 h-4" /></button>}
            </div>
            <div className="min-h-[200px] p-3 rounded-xl bg-white text-base leading-loose whitespace-pre-wrap" dir="auto">
              {t2sOutput || <span className="text-slate-400">ستظهر هنا تعليمات أداء الإشارات خطوة بخطوة…</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignTranslatorPro;
