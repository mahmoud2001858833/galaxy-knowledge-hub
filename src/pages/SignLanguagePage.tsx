import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Hand, Volume2, Trash2, BookOpen, Search, ArrowRight, AlertCircle, Loader2, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCameraStream, getCameraSupport, mapCameraError, type CameraSupport } from '@/features/sign-language/camera';

// Extended sign language dictionary
const signDictionary = [
  { word: 'مرحبا', gesture: '👋', category: 'تحيات' },
  { word: 'أهلاً', gesture: '🤗', category: 'تحيات' },
  { word: 'السلام عليكم', gesture: '🙏', category: 'تحيات' },
  { word: 'صباح الخير', gesture: '☀️', category: 'تحيات' },
  { word: 'مساء الخير', gesture: '🌙', category: 'تحيات' },
  { word: 'شكراً', gesture: '🙏', category: 'تحيات' },
  { word: 'عفواً', gesture: '😊', category: 'تحيات' },
  { word: 'وداعاً', gesture: '👋', category: 'تحيات' },
  { word: 'نعم', gesture: '👍', category: 'أساسيات' },
  { word: 'لا', gesture: '👎', category: 'أساسيات' },
  { word: 'من فضلك', gesture: '🤲', category: 'أساسيات' },
  { word: 'لماذا', gesture: '❓', category: 'أساسيات' },
  { word: 'كيف', gesture: '🤔', category: 'أساسيات' },
  { word: 'أين', gesture: '📍', category: 'أساسيات' },
  { word: 'متى', gesture: '⏰', category: 'أساسيات' },
  { word: 'أنا', gesture: '👆', category: 'ضمائر' },
  { word: 'أنت', gesture: '👉', category: 'ضمائر' },
  { word: 'نحن', gesture: '👐', category: 'ضمائر' },
  { word: 'هو', gesture: '👉', category: 'ضمائر' },
  { word: 'هي', gesture: '👉', category: 'ضمائر' },
  { word: 'يأكل', gesture: '🍽️', category: 'أفعال' },
  { word: 'يشرب', gesture: '🥤', category: 'أفعال' },
  { word: 'يقرأ', gesture: '📖', category: 'أفعال' },
  { word: 'يكتب', gesture: '✍️', category: 'أفعال' },
  { word: 'يتكلم', gesture: '🗣️', category: 'أفعال' },
  { word: 'يسمع', gesture: '👂', category: 'أفعال' },
  { word: 'يرى', gesture: '👀', category: 'أفعال' },
  { word: 'يحب', gesture: '❤️', category: 'أفعال' },
  { word: 'يدرس', gesture: '📚', category: 'أفعال' },
  { word: 'يساعد', gesture: '🤝', category: 'أفعال' },
  { word: 'أب', gesture: '👨', category: 'عائلة' },
  { word: 'أم', gesture: '👩', category: 'عائلة' },
  { word: 'أخ', gesture: '👦', category: 'عائلة' },
  { word: 'أخت', gesture: '👧', category: 'عائلة' },
  { word: 'عائلة', gesture: '👨‍👩‍👧‍👦', category: 'عائلة' },
  { word: 'طفل', gesture: '👶', category: 'عائلة' },
  { word: 'مدرسة', gesture: '🏫', category: 'مدرسة' },
  { word: 'معلم', gesture: '👨‍🏫', category: 'مدرسة' },
  { word: 'طالب', gesture: '👨‍🎓', category: 'مدرسة' },
  { word: 'كتاب', gesture: '📕', category: 'مدرسة' },
  { word: 'قلم', gesture: '✏️', category: 'مدرسة' },
  { word: 'سعيد', gesture: '😊', category: 'مشاعر' },
  { word: 'حزين', gesture: '😢', category: 'مشاعر' },
  { word: 'غاضب', gesture: '😠', category: 'مشاعر' },
  { word: 'خائف', gesture: '😨', category: 'مشاعر' },
  { word: 'متحمس', gesture: '🤩', category: 'مشاعر' },
  { word: 'حب', gesture: '❤️', category: 'مشاعر' },
  { word: 'بيت', gesture: '🏠', category: 'أماكن' },
  { word: 'مستشفى', gesture: '🏥', category: 'أماكن' },
  { word: 'مسجد', gesture: '🕌', category: 'أماكن' },
  { word: 'حديقة', gesture: '🌳', category: 'أماكن' },
];

// Extended gesture mapping with more detail
const gestureToArabic: Record<string, { text: string; emoji: string; description: string }> = {
  'open_palm': { text: 'مرحبا', emoji: '✋', description: 'كف مفتوح - جميع الأصابع ممدودة' },
  'thumbs_up': { text: 'نعم / موافق', emoji: '👍', description: 'إبهام للأعلى' },
  'thumbs_down': { text: 'لا / رفض', emoji: '👎', description: 'إبهام للأسفل' },
  'pointing_up': { text: 'إشارة / انتبه', emoji: '☝️', description: 'إصبع السبابة للأعلى' },
  'victory': { text: 'سلام / نصر', emoji: '✌️', description: 'إصبعان مرفوعان' },
  'fist': { text: 'قوة / توقف', emoji: '✊', description: 'قبضة مغلقة' },
  'rock': { text: 'روك / حماس', emoji: '🤘', description: 'إشارة الروك' },
  'ok_sign': { text: 'ممتاز / تمام', emoji: '👌', description: 'إشارة أوكي' },
  'three_fingers': { text: 'ثلاثة', emoji: '3️⃣', description: 'ثلاثة أصابع' },
  'four_fingers': { text: 'أربعة', emoji: '4️⃣', description: 'أربعة أصابع بدون إبهام' },
  'call_me': { text: 'اتصل بي', emoji: '🤙', description: 'إشارة الاتصال' },
  'pinch': { text: 'قليل / صغير', emoji: '🤏', description: 'قرصة بالأصابع' },
};

// Hand landmark connections for drawing skeleton
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

const categories = [...new Set(signDictionary.map(item => item.category))];

const SignLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const stableGestureRef = useRef<{ gesture: string | null; count: number }>({ gesture: null, count: 0 });
  const confidenceRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [gestureHistory, setGestureHistory] = useState<{ gesture: string; text: string; emoji: string; time: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [handsCount, setHandsCount] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [cameraSupport, setCameraSupport] = useState<CameraSupport | null>(null);
  const [noCamera, setNoCamera] = useState(false);

  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  useEffect(() => {
    getCameraSupport().then(setCameraSupport).catch(() => {});
  }, []);

  const filteredDictionary = signDictionary.filter(item => {
    const matchesSearch = item.word.includes(searchQuery);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Advanced gesture classification with more gestures and better accuracy
  const classifyGesture = useCallback((landmarks: any[]): { gesture: string; confidence: number } | null => {
    if (!landmarks || landmarks.length === 0) return null;
    const hand = landmarks[0];
    if (!hand || hand.length < 21) return null;

    const thumbTip = hand[4], thumbIp = hand[3], thumbMcp = hand[2], thumbCmc = hand[1];
    const indexTip = hand[8], indexDip = hand[7], indexPip = hand[6], indexMcp = hand[5];
    const middleTip = hand[12], middleDip = hand[11], middlePip = hand[10], middleMcp = hand[9];
    const ringTip = hand[16], ringDip = hand[15], ringPip = hand[14], ringMcp = hand[13];
    const pinkyTip = hand[20], pinkyDip = hand[19], pinkyPip = hand[18], pinkyMcp = hand[17];
    const wrist = hand[0];

    // Finger extension detection (more precise)
    const isFingerExtended = (tip: any, dip: any, pip: any, mcp: any): boolean => {
      return tip.y < pip.y && dip.y < pip.y;
    };

    const indexUp = isFingerExtended(indexTip, indexDip, indexPip, indexMcp);
    const middleUp = isFingerExtended(middleTip, middleDip, middlePip, middleMcp);
    const ringUp = isFingerExtended(ringTip, ringDip, ringPip, ringMcp);
    const pinkyUp = isFingerExtended(pinkyTip, pinkyDip, pinkyPip, pinkyMcp);

    // Thumb detection (uses x-axis primarily)
    const isLeftHand = thumbCmc.x < pinkyMcp.x;
    const thumbExtended = isLeftHand 
      ? thumbTip.x > thumbIp.x && thumbTip.x > thumbMcp.x
      : thumbTip.x < thumbIp.x && thumbTip.x < thumbMcp.x;
    const thumbUp = thumbTip.y < thumbIp.y && thumbTip.y < wrist.y - 0.06;
    const thumbDown = thumbTip.y > thumbIp.y && thumbTip.y > wrist.y + 0.04;

    // Distance helper
    const dist = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    // OK sign: thumb and index tips close together, other fingers extended
    const thumbIndexDist = dist(thumbTip, indexTip);
    if (thumbIndexDist < 0.06 && middleUp && ringUp && pinkyUp) {
      return { gesture: 'ok_sign', confidence: 0.85 };
    }

    // Pinch: thumb and index close, others closed
    if (thumbIndexDist < 0.06 && !middleUp && !ringUp && !pinkyUp) {
      return { gesture: 'pinch', confidence: 0.8 };
    }

    // Rock sign: index and pinky up, middle and ring down
    if (indexUp && !middleUp && !ringUp && pinkyUp) {
      return { gesture: 'rock', confidence: 0.9 };
    }

    // Call me: thumb and pinky out, others closed
    if (thumbExtended && !indexUp && !middleUp && !ringUp && pinkyUp) {
      return { gesture: 'call_me', confidence: 0.85 };
    }

    // Open palm: all fingers extended
    if (indexUp && middleUp && ringUp && pinkyUp && thumbExtended) {
      return { gesture: 'open_palm', confidence: 0.95 };
    }

    // Four fingers: all except thumb
    if (indexUp && middleUp && ringUp && pinkyUp && !thumbExtended) {
      return { gesture: 'four_fingers', confidence: 0.85 };
    }

    // Three fingers: index, middle, ring up
    if (indexUp && middleUp && ringUp && !pinkyUp) {
      return { gesture: 'three_fingers', confidence: 0.85 };
    }

    // Victory/Peace: index + middle up
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      return { gesture: 'victory', confidence: 0.9 };
    }

    // Pointing up: only index
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return { gesture: 'pointing_up', confidence: 0.9 };
    }

    // Thumbs up/down
    if (thumbExtended && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      if (thumbUp) return { gesture: 'thumbs_up', confidence: 0.9 };
      if (thumbDown) return { gesture: 'thumbs_down', confidence: 0.85 };
    }

    // Fist: all closed
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbExtended) {
      return { gesture: 'fist', confidence: 0.85 };
    }

    return null;
  }, []);

  const handleGestureDetected = useCallback((gesture: string, gestureConfidence: number) => {
    const info = gestureToArabic[gesture];
    if (!info) return;

    setCurrentGesture(gesture);
    setConfidence(Math.round(gestureConfidence * 100));
    setDetectedText(prev => (prev ? prev + ' ' : '') + info.text);
    setGestureHistory(prev => [
      { gesture, text: info.text, emoji: info.emoji, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev,
    ].slice(0, 100));

    try {
      const cleanText = info.text.replace(/[^\u0600-\u06FF\s\/]/g, '').trim();
      if (cleanText) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}

    setTimeout(() => setCurrentGesture(null), 1200);
  }, []);

  const initializeHandDetection = useCallback(async (): Promise<{ handLandmarker: any | null; error?: string }> => {
    try {
      setLoadingStep('جاري تحميل مكتبة التعرف على اليد...');
      setLoadingProgress(20);

      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      setLoadingStep('جاري تهيئة نظام الرؤية...');
      setLoadingProgress(40);

      // IMPORTANT: The WASM files must match the installed @mediapipe/tasks-vision version.
      const wasmCandidates = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm',
      ];

      let vision: any = null;
      let lastErr: any = null;
      for (const wasmBase of wasmCandidates) {
        try {
          vision = await FilesetResolver.forVisionTasks(wasmBase);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!vision) {
        throw lastErr ?? new Error('Failed to load MediaPipe WASM files');
      }

      setLoadingStep('جاري تحميل نموذج الذكاء الاصطناعي...');
      setLoadingProgress(60);

      const options = {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU' as const,
        },
        runningMode: 'VIDEO' as const,
        numHands: 2,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35,
      };

      let handLandmarker;
      try {
        handLandmarker = await HandLandmarker.createFromOptions(vision, options);
      } catch (gpuErr) {
        console.warn('GPU failed, falling back to CPU:', gpuErr);
        setLoadingStep('جاري التبديل لمعالج CPU...');
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          ...options,
          baseOptions: { ...options.baseOptions, delegate: 'CPU' as const },
        });
      }

      setLoadingProgress(90);
      setLoadingStep('جاهز للتعرف!');
      handLandmarkerRef.current = handLandmarker;
      setMediapipeReady(true);
      return { handLandmarker };
    } catch (err: any) {
      console.error('Failed to initialize MediaPipe:', err);
      setMediapipeReady(false);
      return {
        handLandmarker: null,
        error:
          'تعذر تحميل MediaPipe (ملفات WASM). جرّب تعطيل مانع الإعلانات/الجدار الناري أو افتح من متصفح آخر.',
      };
    }
  }, []);

  const drawHandLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number, isDetected: boolean) => {
    const color = isDetected ? '#22c55e' : '#6366f1';
    const tipColor = isDetected ? '#16a34a' : '#818cf8';

    // Draw connections
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [start, end] of HAND_CONNECTIONS) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        // Gradient line
        const gradient = ctx.createLinearGradient(
          p1.x * width, p1.y * height, p2.x * width, p2.y * height
        );
        gradient.addColorStop(0, color + 'cc');
        gradient.addColorStop(1, color + '88');
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }
    // Draw points with glow
    for (let i = 0; i < landmarks.length; i++) {
      const point = landmarks[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      const radius = isTip ? 8 : 4;

      // Glow effect for tips
      if (isTip) {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = tipColor + '30';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? tipColor : color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff50';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, []);

  const startDetectionLoop = useCallback((handLandmarker: any) => {
    let lastTimestamp = -1;
    
    const detect = () => {
      if (!videoRef.current || !handLandmarker || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      
      const now = performance.now();
      if (now <= lastTimestamp) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTimestamp = now;

      // FPS counter
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current = { frames: 0, lastTime: now };
      }

      try {
        const results = handLandmarker.detectForVideo(videoRef.current, Math.round(now));

        if (results.landmarks && results.landmarks.length > 0) {
          setHandDetected(true);
          setHandsCount(results.landmarks.length);
          const result = classifyGesture(results.landmarks);
          
          // Stability filter
          if (result) {
            if (stableGestureRef.current.gesture === result.gesture) {
              stableGestureRef.current.count++;
            } else {
              stableGestureRef.current = { gesture: result.gesture, count: 1 };
            }
            
            confidenceRef.current = result.confidence;
            setConfidence(Math.round(result.confidence * 100));

            const currentTime = Date.now();
            // Trigger after 3 stable frames, with 600ms cooldown
            if (stableGestureRef.current.count >= 3 && currentTime - lastGestureTimeRef.current > 600) {
              handleGestureDetected(result.gesture, result.confidence);
              lastGestureTimeRef.current = currentTime;
              stableGestureRef.current = { gesture: null, count: 0 };
            }
          } else {
            stableGestureRef.current = { gesture: null, count: 0 };
          }

          // Draw landmarks
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              for (const hand of results.landmarks) {
                drawHandLandmarks(ctx, hand, canvasRef.current.width, canvasRef.current.height, !!result);
              }
            }
          }
        } else {
          setHandDetected(false);
          setHandsCount(0);
          setConfidence(0);
          stableGestureRef.current = { gesture: null, count: 0 };
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      } catch (err) {
        console.warn('Detection frame error:', err);
      }
      
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    animationFrameRef.current = requestAnimationFrame(detect);
  }, [classifyGesture, handleGestureDetected, drawHandLandmarks]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setNoCamera(false);
      setDemoMode(false);
      setIsLoading(true);
      setLoadingStep('جاري طلب إذن الكاميرا...');
      setLoadingProgress(10);

      const stream = await getCameraStream();
      streamRef.current = stream;

      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error('Video element not available');
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);

      const handLandmarker = await initializeHandDetection();
      setLoadingProgress(100);
      setIsLoading(false);

      if (handLandmarker) {
        startDetectionLoop(handLandmarker);
        toast.success('✅ الكاميرا جاهزة! أظهر يدك للبدء بالتعرف');
      } else {
        toast.error('فشل تحميل نموذج التعرف. حاول تحديث الصفحة.');
        setError('فشل تحميل نموذج الذكاء الاصطناعي.');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      const support = cameraSupport ?? (await getCameraSupport().catch(() => null));
      if (!cameraSupport && support) setCameraSupport(support);
      setNoCamera(err?.name === 'NotFoundError' || (support?.videoInputs ?? 1) === 0);
      setError(mapCameraError(err, support));
      setIsLoading(false);
    }
  }, [initializeHandDetection, startDetectionLoop, cameraSupport]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => { track.stop(); track.enabled = false; });
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (handLandmarkerRef.current) {
      try { handLandmarkerRef.current.close(); } catch (e) {}
      handLandmarkerRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setHandDetected(false);
    setMediapipeReady(false);
    setLoadingProgress(0);
    setConfidence(0);
    setFps(0);
    setHandsCount(0);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const speakText = (text: string) => {
    if (!text.trim()) return;
    const clean = text.replace(/[^\u0600-\u06FF\s\/]/g, '').trim();
    if (!clean) return;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Pending gesture name for live display
  const pendingGestureName = stableGestureRef.current.gesture 
    ? gestureToArabic[stableGestureRef.current.gesture]?.text 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950" dir="rtl">
      {/* Header */}
      <div className="border-b border-indigo-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Hand className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">مترجم لغة الإشارة</h1>
              <p className="text-sm text-slate-400">تحويل إشارات اليد إلى نص وكلام بالذكاء الاصطناعي</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="border-indigo-500/30 text-slate-300">
            <ArrowRight className="ml-2 h-4 w-4" />
            رجوع
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="w-full max-w-md mx-auto bg-slate-800/60 border border-indigo-500/20 mb-8">
            <TabsTrigger value="camera" className="flex-1 data-[state=active]:bg-indigo-600">
              <Camera className="ml-2 h-4 w-4" />
              الكاميرا
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="flex-1 data-[state=active]:bg-indigo-600">
              <BookOpen className="ml-2 h-4 w-4" />
              القاموس
            </TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="camera">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Camera Section */}
              <div className="space-y-4">
                <Card className="bg-slate-900/60 border-indigo-500/20 overflow-hidden">
                  <div className="relative aspect-video bg-slate-800">
                    {!cameraActive && !isLoading && !error && !demoMode && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="relative mx-auto mb-6">
                            <Camera className="h-20 w-20 text-indigo-400/40 mx-auto" />
                            <motion.div 
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                            >
                              <Zap className="h-3 w-3 text-white" />
                            </motion.div>
                          </div>
                          <p className="text-slate-300 text-lg mb-2 font-medium">مترجم لغة الإشارة بالذكاء الاصطناعي</p>
                          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">يدعم 12 إشارة مختلفة مع تعرف فوري ونطق تلقائي</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button onClick={startCamera} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8">
                              <Camera className="ml-2 h-5 w-5" />
                              تشغيل الكاميرا
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-indigo-500/30 text-slate-200"
                              onClick={() => {
                                setError(null);
                                setNoCamera(false);
                                setDemoMode(true);
                              }}
                            >
                              جرّب بدون كاميرا
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {demoMode && !cameraActive && !isLoading && !error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-6">
                          <p className="text-slate-200 text-lg mb-2 font-medium">الوضع التجريبي</p>
                          <p className="text-slate-500 text-sm mb-6">اختر إشارات من الأسفل لتجربة التحويل بدون كاميرا</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button onClick={startCamera} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8">
                              <Camera className="ml-2 h-5 w-5" />
                              تشغيل الكاميرا
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-slate-600 text-slate-200"
                              onClick={() => setDemoMode(false)}
                            >
                              إيقاف الوضع التجريبي
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-800/90">
                        <div className="text-center w-72">
                          <Loader2 className="h-14 w-14 text-indigo-400 animate-spin mx-auto mb-4" />
                          <p className="text-slate-300 font-medium mb-3 text-lg">{loadingStep}</p>
                          <Progress value={loadingProgress} className="h-2.5 mb-2" />
                          <p className="text-slate-500 text-sm">{loadingProgress}%</p>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <AlertCircle className="h-14 w-14 text-red-400 mx-auto mb-3" />
                          <p className="text-red-400 mb-4">{error}</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <Button onClick={startCamera} size="lg">إعادة المحاولة</Button>
                            {(noCamera || (cameraSupport?.videoInputs ?? 1) === 0) && (
                              <Button
                                variant="outline"
                                size="lg"
                                className="border-slate-600 text-slate-200"
                                onClick={() => {
                                  setError(null);
                                  setNoCamera(false);
                                  setDemoMode(true);
                                }}
                              >
                                وضع تجريبي
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <video ref={videoRef} className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} playsInline muted style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${!cameraActive ? 'hidden' : ''}`} style={{ transform: 'scaleX(-1)' }} />
                    
                    <AnimatePresence>
                      {currentGesture && gestureToArabic[currentGesture] && (
                        <motion.div
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-2xl shadow-green-500/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{gestureToArabic[currentGesture].emoji}</span>
                            <div>
                              <p className="font-bold text-lg">{gestureToArabic[currentGesture].text}</p>
                              <p className="text-green-200 text-xs">{gestureToArabic[currentGesture].description}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {cameraActive && (
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400 text-sm font-medium">مباشر</span>
                        </div>
                        {mediapipeReady && (
                          <>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${
                              handDetected 
                                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400' 
                                : 'bg-slate-700/50 border border-slate-600/40 text-slate-400'
                            }`}>
                              <Hand className="h-3.5 w-3.5" />
                              {handDetected ? `${handsCount} يد مكتشفة` : 'أظهر يدك'}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-600/30 px-3 py-1.5 rounded-full text-xs text-slate-400 backdrop-blur-sm">
                              <Activity className="h-3 w-3" />
                              {fps} FPS
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Confidence bar at bottom */}
                    {cameraActive && handDetected && confidence > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm px-4 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 whitespace-nowrap">الثقة</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full rounded-full ${confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              animate={{ width: `${confidence}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-slate-300 font-mono w-10 text-left">{confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {cameraActive && (
                  <Button variant="destructive" className="w-full" onClick={stopCamera}>
                    <CameraOff className="ml-2 h-4 w-4" />
                    إيقاف الكاميرا
                  </Button>
                )}

                {!cameraActive && demoMode && (
                  <Card className="bg-slate-900/60 border-indigo-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">جرّب الإشارات (بدون كاميرا)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(gestureToArabic).map(([key, info]) => (
                          <Button
                            key={key}
                            variant="outline"
                            className="justify-start border-slate-700/40 bg-slate-800/30"
                            onClick={() => handleGestureDetected(key, 0.99)}
                          >
                            <span className="ml-2">{info.emoji}</span>
                            <span className="truncate">{info.text}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                {/* Detected Text */}
                <Card className="bg-slate-900/60 border-indigo-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-indigo-400" />
                      النص المكتشف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[120px] bg-slate-800/60 rounded-xl p-4 text-white text-xl leading-relaxed border border-slate-700/50 mb-4">
                      {detectedText || <span className="text-slate-500">سيظهر النص المترجم هنا عند اكتشاف إشارات اليد...</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => speakText(detectedText)} disabled={!detectedText.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        <Volume2 className="ml-2 h-4 w-4" />
                        نطق النص
                      </Button>
                      <Button variant="outline" onClick={() => setDetectedText('')} className="border-slate-600">
                        <Trash2 className="ml-2 h-4 w-4" />
                        مسح
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Gesture History */}
                <Card className="bg-slate-900/60 border-indigo-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">سجل الإشارات</CardTitle>
                      {gestureHistory.length > 0 && (
                        <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300">
                          {gestureHistory.length} إشارة
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {gestureHistory.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">لم يتم اكتشاف إشارات بعد</p>
                      ) : (
                        <div className="space-y-2">
                          {gestureHistory.map((item, index) => (
                            <motion.div
                              key={`${item.time}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-base font-bold text-indigo-300">{item.text}</span>
                              </div>
                              <span className="text-xs text-slate-500">{item.time}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Supported Gestures */}
                <Card className="bg-slate-900/60 border-indigo-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      الإشارات المدعومة ({Object.keys(gestureToArabic).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(gestureToArabic).map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
                            currentGesture === key 
                              ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/10' 
                              : 'bg-slate-800/40 border-slate-700/30 hover:border-indigo-500/30'
                          }`}
                        >
                          <span className="text-xl">{value.emoji}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{value.text}</p>
                            <p className="text-[10px] text-slate-500">{value.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary">
            <Card className="bg-slate-900/60 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  قاموس لغة الإشارة العربية
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="ابحث عن كلمة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 bg-slate-800/60 border-slate-700"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(null)}
                    >
                      الكل
                    </Badge>
                    {categories.map(cat => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredDictionary.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => speakText(item.word)}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-indigo-500/50 hover:bg-slate-800/60 cursor-pointer transition-all"
                    >
                      <span className="text-3xl">{item.gesture}</span>
                      <span className="text-sm font-medium text-white">{item.word}</span>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </motion.div>
                  ))}
                </div>
                {filteredDictionary.length === 0 && (
                  <p className="text-center text-slate-500 py-12">لا توجد نتائج</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SignLanguagePage;
