import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, Hand, Volume2, Trash2, AlertCircle, Loader2,
  Activity, Languages, Sparkles, Copy, Wand2, Globe, Zap, Type, Check,
  Mic, MicOff, Settings2, Play, Pause, SkipForward, SkipBack, RotateCw,
  Star, StarOff, Download, Share2, FlipHorizontal, ArrowLeftRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCameraStream, getCameraSupport, mapCameraError, type CameraSupport } from './camera';
import { filterGesture, buildSentence, type DetectedToken } from './gestureFilter';
import { SPOKEN_LANGUAGES, type SpokenLang } from './languages';
import { SIGN_SYSTEMS, SIGN_SYSTEM_PRIMARY_LANG } from './signSystems';
import { supabase } from '@/integrations/supabase/client';
import HandSignCard from './HandSignCard';
import type { Movement } from './handshapes';
import { getGestureWord, getSystemVocab } from './gestureVocab';
import { useGestureVocab, gestureFromVocab } from './useGestureVocab';
import SignSequencePlayer from './SignSequencePlayer';


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
  five_fingers: { text: 'خمسة', emoji: '5️⃣', description: 'خمسة أصابع مفرودة' },
  finger_gun: { text: 'انتباه', emoji: '👈', description: 'إبهام وسبابة كالمسدس' },
  waving: { text: 'وداعاً', emoji: '👋', description: 'تلويح باليد' },
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

  // ─ language picks (persisted)
  const LS_KEY = 'damij.sign.langPrefs.v2';
  const loadPrefs = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
  };
  const initial = loadPrefs();
  const [signSystem, setSignSystem] = useState<string>(initial?.signSystem || 'ArSL');
  // Both target/source spoken languages are derived from the chosen sign system —
  // there is exactly ONE language per sign system in the unified UI.
  const langForSystem = (sys: string): SpokenLang => {
    const m = SIGN_SYSTEM_PRIMARY_LANG[sys];
    if (m) return m as SpokenLang;
    return SPOKEN_LANGUAGES[0];
  };
  const [targetLang, setTargetLang] = useState<SpokenLang>(langForSystem(initial?.signSystem || 'ArSL'));
  const [t2sLang, setT2sLang] = useState<SpokenLang>(langForSystem(initial?.signSystem || 'ArSL'));
  const [langConfirmed, setLangConfirmed] = useState<boolean>(!!initial?.confirmed);

  // Keep the spoken language locked to the chosen sign system.
  useEffect(() => {
    const next = langForSystem(signSystem);
    setTargetLang(next);
    setT2sLang(next);
  }, [signSystem]);

  // ─ text-to-sign mode
  const [t2sInput, setT2sInput] = useState('');
  const [t2sLoading, setT2sLoading] = useState(false);
  const [t2sLangQuery, setT2sLangQuery] = useState('');
  const [signSysQuery, setSignSysQuery] = useState('');
  const [targetLangQuery, setTargetLangQuery] = useState('');
  const [t2sResult, setT2sResult] = useState<{
    translated_text: string;
    language: string;
    sign_system: string;
    words: {
      word: string;
      sign_emoji: string;
      description: string;
      handshape_id?: string;
      movement?: string;
      two_handed?: boolean;
      fingerspelling: { letter: string; sign: string; handshape_id?: string }[];
    }[];
    alphabet_chart: { letter: string; sign: string; emoji: string; handshape_id?: string }[];
  } | null>(null);
  const [playSpeed, setPlaySpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const playAbortRef = useRef<{ stop: boolean }>({ stop: false });
  const stripRef = React.useRef<HTMLDivElement>(null);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [mirrorHand, setMirrorHand] = useState(false);
  const [signSize, setSignSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('damij.sign.favorites') || '[]'); } catch { return []; }
  });
  const [recording, setRecording] = useState(false);
  const recogRef = useRef<any>(null);


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
      if (tExt && spread) return { gesture: 'five_fingers', confidence: 0.92 };
      return { gesture: 'open_palm', confidence: 0.94 };
    }
    if (iU && mU && rU && pU && !tExt && !spread && cnt === 4) return { gesture: 'four_fingers', confidence: 0.85 };
    if (tExt && iU && !mU && !rU && !pU) return { gesture: 'finger_gun', confidence: 0.84 };
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
        // Source language === sign-system primary language (raw signs are now in this language)
        const sourceLang = langForSystem(signSystem);
        const corrected = await callAI('correct', sentence, {
          lang: sourceLang.code,
          langName: sourceLang.name,
        });
        setCorrectedText(corrected);
        if (targetLang.code === sourceLang.code) {
          // No need to translate — source already matches target.
          setTranslatedText(corrected);
        } else {
          const translated = await callAI('translate', corrected, {
            sourceLang: sourceLang.code,
            sourceLangName: sourceLang.name,
            targetLang: targetLang.code,
            targetLangName: targetLang.name,
          });
          setTranslatedText(translated);
        }
      } catch (e: any) {
        toast.error(e?.message || 'فشل الاتصال بالمساعد الذكي');
      } finally {
        setIsAILoading(false);
      }
    }, 900);
  }, [callAI, targetLang, signSystem]);

  // re-translate when target language changes
  useEffect(() => {
    if (correctedText) {
      (async () => {
        const sourceLang = langForSystem(signSystem);
        if (targetLang.code === sourceLang.code) {
          setTranslatedText(correctedText);
          return;
        }
        setIsAILoading(true);
        try {
          const translated = await callAI('translate', correctedText, {
            sourceLang: sourceLang.code,
            sourceLangName: sourceLang.name,
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
    const info = getGestureWord(signSystem, gesture);
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
  }, [refreshAI, signSystem]);

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
        minHandDetectionConfidence: 0.2,
        minHandPresenceConfidence: 0.2,
        minTrackingConfidence: 0.2,
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
            const cool = t - lastGestureTimeRef.current > 800;
            // First gesture fires almost instantly (2 stable frames), subsequent need 3
            const need = lastFiredGestureRef.current === null ? 2 : 3;
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
      // Get stream synchronously inside the user-gesture handler
      const stream = await getCameraStream();
      streamRef.current = stream;
      if (!videoRef.current) { stream.getTracks().forEach(t => t.stop()); throw new Error('Video element missing'); }
      // Mark camera active FIRST so the <video> is visible (display:none blocks frames in some browsers)
      setCameraActive(true);
      const v = videoRef.current;
      v.srcObject = stream;
      v.muted = true;
      (v as any).playsInline = true;
      // Wait for metadata so we know videoWidth/Height before starting detection
      setLoadingStep('تشغيل الفيديو…');
      await new Promise<void>((resolve, reject) => {
        let done = false;
        const ok = () => { if (done) return; done = true; resolve(); };
        const fail = (err: any) => { if (done) return; done = true; reject(err); };
        v.onloadedmetadata = ok;
        v.oncanplay = ok;
        v.onerror = (e) => fail(e);
        // safety timeout
        setTimeout(ok, 4000);
      });
      try { await v.play(); } catch (err) {
        console.warn('video.play() rejected, retrying after small delay', err);
        await new Promise(r => setTimeout(r, 100));
        await v.play();
      }
      setLoadingStep('تحضير نموذج التعرّف…');
      const hl = handLandmarkerRef.current ?? await initHand();
      // Wait until the video really has frames
      let tries = 0;
      while (v.readyState < 2 && tries < 30) {
        await new Promise(r => setTimeout(r, 100));
        tries++;
      }
      setIsLoading(false);
      startLoop(hl);
      toast.success('الكاميرا جاهزة. ابدأ بالإشارة فوراً ✋');
    } catch (e: any) {
      console.error('startCamera failed', e);
      // cleanup partial stream
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraActive(false);
      setError(mapCameraError(e, cameraSupport) || e?.message || 'حدث خطأ');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    // keep handLandmarkerRef alive for instant restart
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false); setHandDetected(false);
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
    setT2sResult(null);
    setActiveWordIdx(null);
    try {
      const { data, error } = await supabase.functions.invoke('damij-sign-translate', {
        body: {
          text: t2sInput,
          mode: 'text2sign',
          signSystem,
          outputLang: t2sLang.code,
          outputLangName: t2sLang.name,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setT2sResult((data as any).result);
      toast.success('تمت الترجمة إلى الإشارات بنجاح');
    } catch (e: any) { toast.error(e?.message || 'فشل التحويل'); }
    finally { setT2sLoading(false); }
  };

  const playWordSequence = async () => {
    if (!t2sResult) return;
    setIsPlaying(true);
    playAbortRef.current.stop = false;
    const delay = playSpeed === 'slow' ? 1700 : playSpeed === 'fast' ? 650 : 1100;
    for (let i = 0; i < t2sResult.words.length; i++) {
      if (playAbortRef.current.stop) break;
      setActiveWordIdx(i);
      speakText(t2sResult.words[i].word, t2sLang.code);
      requestAnimationFrame(() => {
        const el = stripRef.current?.querySelector(`[data-word-idx="${i}"]`) as HTMLElement | null;
        el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      await new Promise(r => setTimeout(r, delay));
    }
    setIsPlaying(false);
    setActiveWordIdx(null);
  };

  const stopPlayback = () => {
    playAbortRef.current.stop = true;
    try { window.speechSynthesis.cancel(); } catch {}
    setIsPlaying(false);
  };

  const stepWord = (dir: 1 | -1) => {
    if (!t2sResult) return;
    const next = Math.max(0, Math.min(t2sResult.words.length - 1, (activeWordIdx ?? -1) + dir));
    setActiveWordIdx(next);
    speakText(t2sResult.words[next].word, t2sLang.code);
    requestAnimationFrame(() => {
      const el = stripRef.current?.querySelector(`[data-word-idx="${next}"]`) as HTMLElement | null;
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  };

  const startVoiceInput = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('المتصفح لا يدعم الإدخال الصوتي'); return; }
    try {
      const r = new SR();
      r.lang = t2sLang.code;
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (e: any) => {
        let txt = '';
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        setT2sInput(txt);
      };
      r.onend = () => setRecording(false);
      r.onerror = () => { setRecording(false); toast.error('تعذّر تسجيل الصوت'); };
      r.start();
      recogRef.current = r;
      setRecording(true);
    } catch { toast.error('فشل بدء الإدخال الصوتي'); }
  };
  const stopVoiceInput = () => { try { recogRef.current?.stop(); } catch {} setRecording(false); };

  const toggleFavorite = () => {
    if (!t2sInput.trim()) return;
    const next = favorites.includes(t2sInput) ? favorites.filter(f => f !== t2sInput) : [t2sInput, ...favorites].slice(0, 30);
    setFavorites(next);
    localStorage.setItem('damij.sign.favorites', JSON.stringify(next));
  };

  const downloadResult = () => {
    if (!t2sResult) return;
    const blob = new Blob([JSON.stringify(t2sResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-${t2sResult.sign_system}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    if (!t2sResult) return;
    const text = `${t2sResult.translated_text}\n\n${t2sResult.words.map(w => `${w.sign_emoji} ${w.word}`).join(' · ')}`;
    try {
      if ((navigator as any).share) await (navigator as any).share({ title: 'ترجمة لغة الإشارة', text });
      else { navigator.clipboard.writeText(text); toast.success('تم النسخ للحافظة'); }
    } catch {}
  };

  const confirmLanguages = () => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      signSystem, targetLang: targetLang.code, t2sLang: t2sLang.code, confirmed: true,
    }));
    setLangConfirmed(true);
  };

  const filterLangs = (q: string) => q
    ? SPOKEN_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(q.toLowerCase()) ||
        l.code.toLowerCase().includes(q.toLowerCase()),
      )
    : SPOKEN_LANGUAGES;
  const filteredT2sLangs = filterLangs(t2sLangQuery);
  const filteredTargetLangs = filterLangs(targetLangQuery);
  const filteredSignSystems = signSysQuery
    ? SIGN_SYSTEMS.filter(s =>
        s.name.toLowerCase().includes(signSysQuery.toLowerCase()) ||
        s.nativeName.toLowerCase().includes(signSysQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(signSysQuery.toLowerCase()) ||
        s.region.toLowerCase().includes(signSysQuery.toLowerCase()),
      )
    : SIGN_SYSTEMS;

  // ── Language gate screen (single sign-system pick) ──
  if (!langConfirmed) {
    const activeLang = langForSystem(signSystem);
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/10 to-emerald-50 rounded-3xl p-8 border border-[hsl(var(--damij-primary))]/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] flex items-center justify-center">
              <Hand className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">اختر لغة الإشارة</h2>
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] font-bold text-sm cursor-help"
                  title="عند اختيار لغة الإشارة، يقوم الذكاء الاصطناعي بالتعرف على إشاراتها فقط، وعرض الترجمة بلغتها الأم فقط (لا تُخلط لغات أخرى). مثال: ArSL ↔ العربية فقط، ASL ↔ الإنجليزية فقط."
                  aria-label="شرح"
                >
                  ?
                </span>
              </div>
              <p className="text-[hsl(var(--damij-text))]/70">
                النظام سيتعرف على إشارات هذه اللغة فقط، وسيعرض النص بلغتها الأم فقط — بدون خلط مع لغات أخرى.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/15 max-w-xl">
            <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
              <Hand className="w-4 h-4" /> نظام لغة الإشارة
            </label>
            <input
              value={signSysQuery}
              onChange={(e) => setSignSysQuery(e.target.value)}
              placeholder="ابحث (ASL، ArSL، LSF…)"
              className="w-full p-2 mb-2 rounded-lg border border-slate-200 text-sm"
            />
            <select
              value={signSystem}
              onChange={(e) => setSignSystem(e.target.value)}
              size={8}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm"
            >
              {filteredSignSystems.map(s => {
                const lang = SIGN_SYSTEM_PRIMARY_LANG[s.code];
                return (
                  <option key={s.code} value={s.code}>
                    {s.nativeName} — {s.code}{lang ? ` · ${lang.flag} ${lang.nativeName}` : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              اللغة المختارة الآن: <b>{activeLang.flag} {activeLang.nativeName}</b> — جميع المخرجات ستكون بهذه اللغة فقط.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={confirmLanguages}
              className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
            >
              <Check className="w-5 h-5" /> تأكيد والدخول إلى المترجم
            </button>
            <span className="text-sm text-slate-600">
              <b>{signSystem}</b> · {activeLang.flag} {activeLang.nativeName} فقط
            </span>
          </div>
        </div>
      </div>
    );
  }


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

      {/* Compact language summary + change button */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-3 flex flex-wrap items-center gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold text-sm flex items-center gap-1">
          <Hand className="w-4 h-4" /> {SIGN_SYSTEMS.find(s => s.code === signSystem)?.nativeName || signSystem}
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center gap-1">
          <Languages className="w-4 h-4" /> {targetLang.flag} {targetLang.nativeName} فقط
        </span>
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] font-bold text-xs cursor-help"
          title="النظام يتعرف على إشارات هذه اللغة فقط، ويعرض المخرجات بلغتها الأم فقط، بدون خلط مع لغات أخرى."
        >
          ?
        </span>
        <button
          onClick={() => { setLangConfirmed(false); }}
          className="ms-auto px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-1"
        >
          <Settings2 className="w-4 h-4" /> تغيير اللغة
        </button>
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
                {currentGesture && getGestureWord(signSystem, currentGesture) && (
                  <motion.div
                    initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 left-3 bg-[hsl(var(--damij-primary))] text-white px-4 py-2 rounded-2xl shadow-2xl"
                  >
                    <span className="text-xl ml-2">{getGestureWord(signSystem, currentGesture)!.emoji}</span>
                    <span className="font-bold">{getGestureWord(signSystem, currentGesture)!.text}</span>
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
                  {Object.entries(getSystemVocab(signSystem)).map(([k, v]) => (
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
                  <button onClick={() => speakText(correctedText, targetLang.code)} className="p-2 rounded-lg hover:bg-white" title="نطق"><Volume2 className="w-4 h-4" /></button>
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
        // Text → Sign mode (PRO)
        <div className="space-y-6">
          {/* Top controls */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/15 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Type className="w-4 h-4" /> اكتب أو أملِ جملة بـ {t2sLang.flag} {t2sLang.nativeName}
                </h3>
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-lg hover:bg-slate-100"
                  title="حفظ كمفضّلة"
                >
                  {favorites.includes(t2sInput) ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <StarOff className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <textarea
                value={t2sInput}
                onChange={(e) => setT2sInput(e.target.value)}
                rows={4}
                placeholder={`مثال بـ ${t2sLang.nativeName}: ${t2sLang.code.startsWith('ar') ? 'مرحباً، كيف حالك؟' : t2sLang.code.startsWith('en') ? 'Hello, how are you?' : '...'}`}
                className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-lg"
                dir="auto"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={recording ? stopVoiceInput : startVoiceInput}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {recording ? <><MicOff className="w-4 h-4" /> إيقاف التسجيل</> : <><Mic className="w-4 h-4" /> إدخال صوتي</>}
                </button>
                <button
                  onClick={() => setT2sInput('')}
                  disabled={!t2sInput}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> مسح
                </button>
              </div>

              {favorites.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1">مفضّلاتك:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {favorites.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setT2sInput(f)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs hover:bg-amber-100 max-w-[200px] truncate"
                        dir="auto"
                        title={f}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={runText2Sign}
                disabled={t2sLoading || !t2sInput.trim()}
                className="w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {t2sLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                ترجم إلى إشارات {signSystem}
              </button>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Languages className="w-4 h-4" /> الترجمة إلى {t2sLang.flag} {t2sLang.nativeName}
                </h3>
                {t2sResult && (
                  <div className="flex gap-1">
                    <button onClick={() => speakText(t2sResult.translated_text, t2sLang.code)} className="p-2 rounded-lg hover:bg-white" title="نطق"><Volume2 className="w-4 h-4" /></button>
                    <button onClick={() => copyText(t2sResult.translated_text)} className="p-2 rounded-lg hover:bg-white" title="نسخ"><Copy className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div className="min-h-[80px] p-3 rounded-xl bg-white text-xl leading-relaxed font-medium" dir="auto">
                {t2sResult?.translated_text || <span className="text-slate-400">ستظهر الترجمة هنا قبل عرض الإشارات…</span>}
              </div>

              {/* INLINE SIGN STRIP — appears immediately under the translation */}
              {t2sResult && (
                <div className="rounded-xl bg-white/70 border border-[hsl(var(--damij-primary))]/15 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[hsl(var(--damij-primary))] flex items-center gap-1">
                      <Hand className="w-3.5 h-3.5" /> تتابع الإشارات ({t2sResult.words.length})
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">السرعة:</span>
                      {(['slow','normal','fast'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setPlaySpeed(s)}
                          className={`px-2 py-0.5 rounded-md font-bold transition ${
                            playSpeed === s ? 'bg-[hsl(var(--damij-primary))] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s === 'slow' ? 'بطيء' : s === 'fast' ? 'سريع' : 'عادي'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div ref={stripRef} className={`flex gap-2 overflow-x-auto pb-2 scroll-smooth ${mirrorHand ? '[&>div]:scale-x-[-1]' : ''}`} dir="ltr">
                    {t2sResult.words.map((w, i) => (
                      <div key={i} data-word-idx={i}>
                        <HandSignCard
                          word={w.word}
                          handshapeId={w.handshape_id}
                          movement={(w.movement as Movement) || 'none'}
                          twoHanded={w.two_handed}
                          active={activeWordIdx === i}
                          size={signSize === 'sm' ? 64 : signSize === 'lg' ? 110 : 84}
                          onClick={() => { setActiveWordIdx(i); speakText(w.word, t2sLang.code); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {t2sResult && (
                <div className="space-y-2">
                  {/* Player controls */}
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => stepWord(-1)} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200" title="السابق"><SkipBack className="w-4 h-4" /></button>
                    {isPlaying ? (
                      <button onClick={stopPlayback} className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold flex items-center gap-2"><Pause className="w-4 h-4" /> إيقاف</button>
                    ) : (
                      <button onClick={() => setPlayerOpen(true)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2"><Play className="w-4 h-4" /> تشغيل سينمائي</button>
                    )}
                    <button onClick={() => { setActiveWordIdx(0); }} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200" title="إعادة"><RotateCw className="w-4 h-4" /></button>
                    <button onClick={() => stepWord(1)} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200" title="التالي"><SkipForward className="w-4 h-4" /></button>
                  </div>

                  {/* Tools */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <button
                      onClick={() => setMirrorHand(v => !v)}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${mirrorHand ? 'bg-[hsl(var(--damij-primary))] text-white' : 'bg-slate-100 text-slate-700'}`}
                      title="عكس اتجاه اليد"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" /> {mirrorHand ? 'يسرى' : 'يمنى'}
                    </button>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100">
                      <span className="text-slate-500">الحجم:</span>
                      {(['sm','md','lg'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setSignSize(s)}
                          className={`px-2 rounded ${signSize === s ? 'bg-white shadow font-bold' : ''}`}
                        >
                          {s === 'sm' ? 'صغير' : s === 'lg' ? 'كبير' : 'عادي'}
                        </button>
                      ))}
                    </div>
                    <button onClick={downloadResult} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> تنزيل</button>
                    <button onClick={shareResult} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> مشاركة</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {t2sResult && (
            <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/15">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-4">
                <Hand className="w-4 h-4" /> تفاصيل كل كلمة ({t2sResult.words.length}) — نظام {t2sResult.sign_system}
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {t2sResult.words.map((w, i) => (
                  <motion.button
                    key={i}
                    onClick={() => { setActiveWordIdx(i); speakText(w.word, t2sLang.code); }}
                    whileHover={{ scale: 1.03 }}
                    className={`text-right p-4 rounded-2xl border-2 transition-all ${
                      activeWordIdx === i
                        ? 'border-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 shadow-lg'
                        : 'border-slate-200 bg-slate-50 hover:border-[hsl(var(--damij-primary))]/40'
                    }`}
                    dir="auto"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <HandSignCard
                        word={w.word}
                        handshapeId={w.handshape_id}
                        movement={(w.movement as Movement) || 'none'}
                        twoHanded={w.two_handed}
                        active={activeWordIdx === i}
                        size={70}
                      />
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                    </div>
                    <div className="font-bold text-lg text-[hsl(var(--damij-primary))] mb-1">{w.word}</div>
                    <div className="text-xs text-slate-600 leading-snug">{w.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {t2sResult && (
        <SignSequencePlayer
          open={playerOpen}
          words={t2sResult.words.map(w => ({
            word: w.word,
            description: w.description,
            handshape_id: w.handshape_id,
            movement: w.movement,
            two_handed: w.two_handed,
          }))}
          langCode={t2sLang.code}
          langLabel={`${t2sLang.flag} ${t2sLang.nativeName}`}
          signSystemLabel={signSystem}
          mirror={mirrorHand}
          onClose={() => setPlayerOpen(false)}
          speak={(text, lang) => speakText(text, lang)}
        />
      )}
    </div>
  );
};

export default SignTranslatorPro;
