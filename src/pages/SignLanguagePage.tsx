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
import LearnSignsTab from '@/features/sign-language/LearnSignsTab';
import TextToSignTab from '@/features/sign-language/TextToSignTab';
import { filterGesture, cleanGestureText, buildSentence, type DetectedToken } from '@/features/sign-language/gestureFilter';
import { GraduationCap, Type } from 'lucide-react';

// Extended sign language dictionary with more words and detailed descriptions
const signDictionary = [
  // تحيات
  { word: 'مرحبا', gesture: '👋', category: 'تحيات', description: 'لوّح بيدك المفتوحة' },
  { word: 'أهلاً', gesture: '🤗', category: 'تحيات', description: 'افتح ذراعيك للترحيب' },
  { word: 'السلام عليكم', gesture: '🙏', category: 'تحيات', description: 'ضع كفيك معاً' },
  { word: 'صباح الخير', gesture: '☀️', category: 'تحيات', description: 'ارفع يدك نحو الشمس' },
  { word: 'مساء الخير', gesture: '🌙', category: 'تحيات', description: 'حرك يدك نحو الأسفل' },
  { word: 'شكراً', gesture: '🙏', category: 'تحيات', description: 'المس ذقنك ثم حرك يدك للأمام' },
  { word: 'عفواً', gesture: '😊', category: 'تحيات', description: 'حرك يدك في دائرة على صدرك' },
  { word: 'وداعاً', gesture: '👋', category: 'تحيات', description: 'لوّح بيدك يميناً ويساراً' },
  { word: 'تصبح على خير', gesture: '🌙', category: 'تحيات', description: 'ضع يدك على خدك' },
  // أساسيات
  { word: 'نعم', gesture: '👍', category: 'أساسيات', description: 'ارفع إبهامك للأعلى' },
  { word: 'لا', gesture: '👎', category: 'أساسيات', description: 'اخفض إبهامك للأسفل' },
  { word: 'من فضلك', gesture: '🤲', category: 'أساسيات', description: 'افتح كفيك للأعلى' },
  { word: 'لماذا', gesture: '❓', category: 'أساسيات', description: 'ارفع سبابتك مع حركة دائرية' },
  { word: 'كيف', gesture: '🤔', category: 'أساسيات', description: 'ضع يدك على ذقنك' },
  { word: 'أين', gesture: '📍', category: 'أساسيات', description: 'أشر بسبابتك يميناً ويساراً' },
  { word: 'متى', gesture: '⏰', category: 'أساسيات', description: 'أشر لمعصمك' },
  { word: 'ماذا', gesture: '🤷', category: 'أساسيات', description: 'افتح كفيك مع رفع الكتفين' },
  { word: 'كم', gesture: '🔢', category: 'أساسيات', description: 'حرك أصابعك بشكل متتالي' },
  // ضمائر
  { word: 'أنا', gesture: '👆', category: 'ضمائر', description: 'أشر لنفسك بسبابتك' },
  { word: 'أنت', gesture: '👉', category: 'ضمائر', description: 'أشر للشخص أمامك' },
  { word: 'نحن', gesture: '👐', category: 'ضمائر', description: 'حرك يدك بشكل دائري بينك وبين الآخرين' },
  { word: 'هو', gesture: '👉', category: 'ضمائر', description: 'أشر للشخص بعيداً عنك' },
  { word: 'هي', gesture: '👉', category: 'ضمائر', description: 'أشر برفق نحو الشخص' },
  { word: 'هم', gesture: '👐', category: 'ضمائر', description: 'أشر بيدك نحو مجموعة' },
  // أفعال
  { word: 'يأكل', gesture: '🍽️', category: 'أفعال', description: 'حرك يدك نحو فمك' },
  { word: 'يشرب', gesture: '🥤', category: 'أفعال', description: 'ارفع كفك المغلق لفمك' },
  { word: 'يقرأ', gesture: '📖', category: 'أفعال', description: 'افتح كفيك كأنك تقرأ كتاباً' },
  { word: 'يكتب', gesture: '✍️', category: 'أفعال', description: 'حرك يدك كأنك تكتب بقلم' },
  { word: 'يتكلم', gesture: '🗣️', category: 'أفعال', description: 'افتح وأغلق أصابعك أمام فمك' },
  { word: 'يسمع', gesture: '👂', category: 'أفعال', description: 'ضع يدك خلف أذنك' },
  { word: 'يرى', gesture: '👀', category: 'أفعال', description: 'أشر بإصبعين نحو عينيك' },
  { word: 'يحب', gesture: '❤️', category: 'أفعال', description: 'ضع يدك على قلبك' },
  { word: 'يدرس', gesture: '📚', category: 'أفعال', description: 'حرك يديك كأنك تقلب صفحات' },
  { word: 'يساعد', gesture: '🤝', category: 'أفعال', description: 'ضع يداً فوق الأخرى وارفعهما' },
  { word: 'يمشي', gesture: '🚶', category: 'أفعال', description: 'حرك إصبعيك كأنهما يمشيان' },
  { word: 'ينام', gesture: '😴', category: 'أفعال', description: 'ضع يديك تحت خدك' },
  { word: 'يلعب', gesture: '🎮', category: 'أفعال', description: 'حرك يديك بشكل متبادل' },
  // عائلة
  { word: 'أب', gesture: '👨', category: 'عائلة', description: 'المس جبهتك بإبهامك' },
  { word: 'أم', gesture: '👩', category: 'عائلة', description: 'المس ذقنك بإبهامك' },
  { word: 'أخ', gesture: '👦', category: 'عائلة', description: 'اقبض يديك وحركهما للأسفل' },
  { word: 'أخت', gesture: '👧', category: 'عائلة', description: 'حرك إبهامك على خدك' },
  { word: 'عائلة', gesture: '👨‍👩‍👧‍👦', category: 'عائلة', description: 'ارسم دائرة بيديك' },
  { word: 'طفل', gesture: '👶', category: 'عائلة', description: 'هز ذراعيك كأنك تحمل طفلاً' },
  { word: 'جد', gesture: '👴', category: 'عائلة', description: 'المس جبهتك ثم حرك يدك للأمام' },
  { word: 'جدة', gesture: '👵', category: 'عائلة', description: 'المس ذقنك ثم حرك يدك للأمام' },
  // مدرسة
  { word: 'مدرسة', gesture: '🏫', category: 'مدرسة', description: 'صفق بيديك مرتين' },
  { word: 'معلم', gesture: '👨‍🏫', category: 'مدرسة', description: 'حرك يديك من جبهتك للأمام' },
  { word: 'طالب', gesture: '👨‍🎓', category: 'مدرسة', description: 'ارفع يدك كأنك تجيب' },
  { word: 'كتاب', gesture: '📕', category: 'مدرسة', description: 'افتح كفيك كالكتاب' },
  { word: 'قلم', gesture: '✏️', category: 'مدرسة', description: 'حرك يدك كأنك تكتب' },
  { word: 'واجب', gesture: '📝', category: 'مدرسة', description: 'أشر للورقة ثم اكتب' },
  { word: 'امتحان', gesture: '📋', category: 'مدرسة', description: 'حرك يدك كأنك تكتب بسرعة' },
  // مشاعر
  { word: 'سعيد', gesture: '😊', category: 'مشاعر', description: 'ارفع زوايا فمك بأصابعك' },
  { word: 'حزين', gesture: '😢', category: 'مشاعر', description: 'حرك إصبعك من عينك للأسفل' },
  { word: 'غاضب', gesture: '😠', category: 'مشاعر', description: 'اقبض يديك وارفعهما' },
  { word: 'خائف', gesture: '😨', category: 'مشاعر', description: 'ارتجف بيديك أمام صدرك' },
  { word: 'متحمس', gesture: '🤩', category: 'مشاعر', description: 'حرك يديك بسرعة للأعلى' },
  { word: 'حب', gesture: '❤️', category: 'مشاعر', description: 'ضع يديك على قلبك' },
  { word: 'متفاجئ', gesture: '😲', category: 'مشاعر', description: 'افتح فمك وارفع يديك' },
  // أماكن
  { word: 'بيت', gesture: '🏠', category: 'أماكن', description: 'اصنع شكل سقف بيديك' },
  { word: 'مستشفى', gesture: '🏥', category: 'أماكن', description: 'ارسم صليباً على ذراعك' },
  { word: 'مسجد', gesture: '🕌', category: 'أماكن', description: 'اصنع شكل القبة بيديك' },
  { word: 'حديقة', gesture: '🌳', category: 'أماكن', description: 'افتح يدك كالشجرة' },
  { word: 'سوق', gesture: '🛒', category: 'أماكن', description: 'حرك يديك كأنك تدفع عربة' },
  // أرقام
  { word: 'واحد', gesture: '1️⃣', category: 'أرقام', description: 'ارفع سبابتك فقط' },
  { word: 'اثنان', gesture: '2️⃣', category: 'أرقام', description: 'ارفع سبابتك والوسطى' },
  { word: 'ثلاثة', gesture: '3️⃣', category: 'أرقام', description: 'ارفع ثلاثة أصابع' },
  { word: 'أربعة', gesture: '4️⃣', category: 'أرقام', description: 'ارفع أربعة أصابع بدون إبهام' },
  { word: 'خمسة', gesture: '5️⃣', category: 'أرقام', description: 'افتح كفك بالكامل' },
  // ألوان
  { word: 'أحمر', gesture: '🔴', category: 'ألوان', description: 'المس شفتك السفلى وحرك للأسفل' },
  { word: 'أزرق', gesture: '🔵', category: 'ألوان', description: 'حرك يدك كالموجة' },
  { word: 'أخضر', gesture: '🟢', category: 'ألوان', description: 'حرك يدك كنبتة تنمو' },
  { word: 'أصفر', gesture: '🟡', category: 'ألوان', description: 'هز يدك مع إشارة Y' },
];

// Extended gesture mapping with more gestures and improved descriptions
const gestureToArabic: Record<string, { text: string; emoji: string; description: string; context: string }> = {
  'open_palm': { text: 'مرحبا', emoji: '✋', description: 'كف مفتوح - جميع الأصابع ممدودة', context: 'تحية أو طلب التوقف' },
  'thumbs_up': { text: 'نعم / موافق', emoji: '👍', description: 'إبهام للأعلى', context: 'موافقة أو تأكيد' },
  'thumbs_down': { text: 'لا / رفض', emoji: '👎', description: 'إبهام للأسفل', context: 'رفض أو عدم موافقة' },
  'pointing_up': { text: 'واحد / انتبه', emoji: '☝️', description: 'إصبع السبابة للأعلى', context: 'الرقم 1 أو طلب الانتباه' },
  'victory': { text: 'اثنان / سلام', emoji: '✌️', description: 'إصبعان مرفوعان', context: 'الرقم 2 أو علامة السلام' },
  'fist': { text: 'قوة / توقف', emoji: '✊', description: 'قبضة مغلقة', context: 'القوة أو التحدي أو التوقف' },
  'rock': { text: 'حماس / روك', emoji: '🤘', description: 'السبابة والخنصر مرفوعان', context: 'الحماس أو الإثارة' },
  'ok_sign': { text: 'ممتاز / تمام', emoji: '👌', description: 'الإبهام والسبابة يشكلان دائرة', context: 'موافقة ممتازة أو جودة عالية' },
  'three_fingers': { text: 'ثلاثة', emoji: '3️⃣', description: 'ثلاثة أصابع مرفوعة', context: 'الرقم 3' },
  'four_fingers': { text: 'أربعة', emoji: '4️⃣', description: 'أربعة أصابع بدون إبهام', context: 'الرقم 4' },
  'call_me': { text: 'اتصل بي', emoji: '🤙', description: 'الإبهام والخنصر ممدودان', context: 'طلب الاتصال أو التواصل' },
  'pinch': { text: 'قليل / صغير', emoji: '🤏', description: 'الإبهام والسبابة متقاربان', context: 'كمية صغيرة أو حجم صغير' },
  'love': { text: 'أحبك', emoji: '🤟', description: 'الإبهام والسبابة والخنصر ممدودة', context: 'التعبير عن الحب بلغة الإشارة' },
  'pointing_right': { text: 'هناك / يمين', emoji: '👉', description: 'السبابة ممدودة جانبياً', context: 'الإشارة لاتجاه أو شيء معين' },
  'open_palms_both': { text: 'توقف / كفى', emoji: '🙌', description: 'كفان مفتوحان مرفوعان', context: 'طلب التوقف أو الاحتفال' },
  'prayer': { text: 'شكراً / دعاء', emoji: '🙏', description: 'كفان متلاصقان', context: 'الشكر أو الدعاء أو الطلب' },
  'wave': { text: 'وداعاً', emoji: '👋', description: 'تلويح اليد يميناً ويساراً', context: 'تحية الوداع' },
  'flat_hand_down': { text: 'اجلس / اهدأ', emoji: '🫳', description: 'كف مسطح متجه للأسفل', context: 'طلب الجلوس أو الهدوء' },
  'crossed_fingers': { text: 'إن شاء الله / حظ', emoji: '🤞', description: 'السبابة والوسطى متشابكتان', context: 'الأمل أو التمني' },
  'pinky_promise': { text: 'وعد', emoji: '🤙', description: 'الخنصر ممدود فقط', context: 'وعد أو عهد' },
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
  const lastFiredGestureRef = useRef<string | null>(null);
  const confidenceRef = useRef<number>(0);
  const acceptedTokensRef = useRef<DetectedToken[]>([]);

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

  // Advanced gesture classification with angle-based detection for much higher accuracy
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

    // Distance helper
    const dist = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2);
    
    // Angle between three points (returns degrees)
    const angle = (a: any, b: any, c: any) => {
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
      const dot = ab.x * cb.x + ab.y * cb.y;
      const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
      const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
      if (magAB === 0 || magCB === 0) return 0;
      const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
      return Math.acos(cosAngle) * (180 / Math.PI);
    };

    // Finger extension using multiple checks for high accuracy:
    // 1. Angle at PIP joint (straight finger ≈ 170-180°, bent < 140°)
    // 2. Angle at DIP joint
    // 3. Tip must be significantly farther from wrist than PIP
    // 4. Tip must be above PIP (in y-axis, accounting for hand orientation)
    const isFingerExtended = (tip: any, dip: any, pip: any, mcp: any): boolean => {
      const pipAngle = angle(mcp, pip, tip);
      const dipAngle = angle(pip, dip, tip);
      
      // Primary: PIP angle must be > 155° (finger mostly straight)
      // This is the key threshold - 155° is strict enough to reject partially curled fingers
      if (pipAngle < 155) return false;
      
      // Secondary: tip must be farther from wrist than PIP (finger pointing outward)
      const tipToWrist = dist(tip, wrist);
      const pipToWrist = dist(pip, wrist);
      if (tipToWrist < pipToWrist * 1.05) return false;
      
      // Tertiary: DIP should also be relatively straight (> 140°)
      if (dipAngle < 135) return false;
      
      return true;
    };

    const indexUp = isFingerExtended(indexTip, indexDip, indexPip, indexMcp);
    const middleUp = isFingerExtended(middleTip, middleDip, middlePip, middleMcp);
    const ringUp = isFingerExtended(ringTip, ringDip, ringPip, ringMcp);
    const pinkyUp = isFingerExtended(pinkyTip, pinkyDip, pinkyPip, pinkyMcp);

    // Thumb detection - more permissive: extended if it's clearly away from the index MCP
    // OR has a straight angle. This fixes "open palm" being misread as "four fingers".
    const isLeftHand = thumbCmc.x < pinkyMcp.x;
    const thumbAngle = angle(thumbCmc, thumbMcp, thumbTip);
    const thumbToIndexMcp = dist(thumbTip, indexMcp);
    const palmWidth = dist(indexMcp, pinkyMcp) || 0.0001;
    const thumbAwayFromPalm = thumbToIndexMcp / palmWidth > 0.85; // thumb tip clearly outside palm
    const thumbStraight = thumbAngle > 150;
    const thumbSideOut = isLeftHand
      ? (thumbTip.x > thumbIp.x + 0.005)
      : (thumbTip.x < thumbIp.x - 0.005);
    const thumbExtended = (thumbStraight && thumbSideOut) || thumbAwayFromPalm;

    const thumbUp = thumbExtended && thumbTip.y < thumbIp.y - 0.03 && thumbTip.y < wrist.y - 0.05;
    const thumbDown = thumbExtended && thumbTip.y > thumbIp.y + 0.03 && thumbTip.y > wrist.y + 0.04;

    // Count extended fingers for validation
    const extendedCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

    // ─── Gesture Recognition (ordered by specificity) ───

    // Love sign: thumb + index + pinky (NOT middle, NOT ring)
    if (thumbExtended && indexUp && !middleUp && !ringUp && pinkyUp) {
      return { gesture: 'love', confidence: 0.93 };
    }

    // OK sign: thumb and index tips very close, other fingers extended
    const thumbIndexDist = dist(thumbTip, indexTip);
    if (thumbIndexDist < 0.055 && middleUp && ringUp && pinkyUp) {
      return { gesture: 'ok_sign', confidence: 0.90 };
    }

    // Pinch: thumb and index close, others closed
    if (thumbIndexDist < 0.055 && !middleUp && !ringUp && !pinkyUp) {
      return { gesture: 'pinch', confidence: 0.85 };
    }

    // Rock sign: index + pinky up, middle + ring down, thumb NOT extended
    if (indexUp && !middleUp && !ringUp && pinkyUp && !thumbExtended) {
      return { gesture: 'rock', confidence: 0.91 };
    }

    // Call me: thumb + pinky out, others closed
    if (thumbExtended && !indexUp && !middleUp && !ringUp && pinkyUp) {
      return { gesture: 'call_me', confidence: 0.88 };
    }

    // Open palm: ALL 4 fingers extended AND fingers are spread apart (typical wave/hello)
    // Spread check distinguishes open palm from "four fingers together"
    const fingersSpread =
      dist(indexTip, middleTip) > 0.045 ||
      dist(middleTip, ringTip) > 0.045 ||
      dist(ringTip, pinkyTip) > 0.045;

    if (indexUp && middleUp && ringUp && pinkyUp && (thumbExtended || fingersSpread)) {
      const palmFacingDown = wrist.y < indexMcp.y && (indexMcp.y - wrist.y) > 0.06;
      if (palmFacingDown && thumbExtended) {
        return { gesture: 'flat_hand_down', confidence: 0.83 };
      }
      return { gesture: 'open_palm', confidence: 0.94 };
    }

    // Four fingers (number 4): all 4 fingers up, thumb tucked, fingers held together
    if (indexUp && middleUp && ringUp && pinkyUp && !thumbExtended && !fingersSpread && extendedCount === 4) {
      return { gesture: 'four_fingers', confidence: 0.85 };
    }

    // Three fingers: index + middle + ring (NOT pinky)
    if (indexUp && middleUp && ringUp && !pinkyUp && extendedCount === 3) {
      return { gesture: 'three_fingers', confidence: 0.88 };
    }

    // Crossed fingers: index + middle close together and both up
    const indexMiddleDist = dist(indexTip, middleTip);
    if (indexUp && middleUp && !ringUp && !pinkyUp && indexMiddleDist < 0.035) {
      return { gesture: 'crossed_fingers', confidence: 0.82 };
    }

    // Victory/Peace: index + middle up, ring + pinky down
    if (indexUp && middleUp && !ringUp && !pinkyUp && extendedCount === 2) {
      return { gesture: 'victory', confidence: 0.91 };
    }

    // Pointing up: ONLY index finger up
    if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbExtended && extendedCount === 1) {
      return { gesture: 'pointing_up', confidence: 0.93 };
    }

    // Pointing with thumb out: index + thumb
    if (indexUp && !middleUp && !ringUp && !pinkyUp && thumbExtended) {
      const indexHorizontal = Math.abs(indexTip.y - indexMcp.y) < 0.07;
      if (indexHorizontal) {
        return { gesture: 'pointing_right', confidence: 0.82 };
      }
      return { gesture: 'pointing_up', confidence: 0.89 };
    }

    // Thumbs up: ONLY thumb extended upward
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp && extendedCount === 0) {
      return { gesture: 'thumbs_up', confidence: 0.93 };
    }

    // Thumbs down: ONLY thumb extended downward  
    if (thumbDown && !indexUp && !middleUp && !ringUp && !pinkyUp && extendedCount === 0) {
      return { gesture: 'thumbs_down', confidence: 0.89 };
    }

    // Fist: ALL fingers closed
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbExtended && extendedCount === 0) {
      return { gesture: 'fist', confidence: 0.88 };
    }

    // Prayer: all 4 fingers up and very close together (no thumb)
    const allFingersTogether = dist(indexTip, middleTip) < 0.035 && dist(middleTip, ringTip) < 0.035 && dist(ringTip, pinkyTip) < 0.035;
    if (allFingersTogether && extendedCount === 4 && !thumbExtended) {
      return { gesture: 'prayer', confidence: 0.80 };
    }

    return null;
  }, []);

  const handleGestureDetected = useCallback((gesture: string, gestureConfidence: number) => {
    const info = gestureToArabic[gesture];
    if (!info) return;

    // ── Linguistic correction filter ──
    const incoming: DetectedToken = {
      gesture,
      text: info.text,
      confidence: gestureConfidence,
      timestamp: Date.now(),
    };
    const decision = filterGesture(incoming, acceptedTokensRef.current);
    if (decision.action === 'ignore') return;

    if (decision.action === 'replace') {
      // Replace the last accepted token (correct a confused detection)
      acceptedTokensRef.current = [...acceptedTokensRef.current.slice(0, -1), incoming];
      setGestureHistory(prev => [
        { gesture, text: decision.text, emoji: info.emoji, time: new Date().toLocaleTimeString('ar-SA') },
        ...prev.slice(1),
      ].slice(0, 100));
    } else {
      acceptedTokensRef.current = [...acceptedTokensRef.current, incoming].slice(-200);
      setGestureHistory(prev => [
        { gesture, text: decision.text, emoji: info.emoji, time: new Date().toLocaleTimeString('ar-SA') },
        ...prev,
      ].slice(0, 100));
    }

    setCurrentGesture(gesture);
    setConfidence(Math.round(gestureConfidence * 100));
    setDetectedText(buildSentence(acceptedTokensRef.current));

    // Speak only the cleaned word
    try {
      window.speechSynthesis.cancel();
      const cleanText = decision.text;
      if (cleanText) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ar-SA';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}

    setTimeout(() => setCurrentGesture(null), 1000);
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
        minHandDetectionConfidence: 0.25,
        minHandPresenceConfidence: 0.25,
        minTrackingConfidence: 0.25,
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
          
          // Stability filter + de-duplication: don't repeat the same gesture
          // unless the user releases (no detection) or shows a different gesture.
          if (result) {
            if (stableGestureRef.current.gesture === result.gesture) {
              stableGestureRef.current.count++;
            } else {
              stableGestureRef.current = { gesture: result.gesture, count: 1 };
            }

            confidenceRef.current = result.confidence;
            setConfidence(Math.round(result.confidence * 100));

            const currentTime = Date.now();
            const isDifferentFromLast = lastFiredGestureRef.current !== result.gesture;
            const longCooldownPassed = currentTime - lastGestureTimeRef.current > 1800;

            // Fire when stable for 5 frames AND (gesture changed OR long cooldown for repeats)
            if (
              stableGestureRef.current.count >= 5 &&
              (isDifferentFromLast || longCooldownPassed)
            ) {
              handleGestureDetected(result.gesture, result.confidence);
              lastGestureTimeRef.current = currentTime;
              lastFiredGestureRef.current = result.gesture;
              stableGestureRef.current = { gesture: result.gesture, count: 0 };
            }
          } else {
            stableGestureRef.current = { gesture: null, count: 0 };
            // Hand released → allow same gesture to fire again next time
            lastFiredGestureRef.current = null;
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

      const init = await initializeHandDetection();
      setLoadingProgress(100);
      setIsLoading(false);

      if (init.handLandmarker) {
        startDetectionLoop(init.handLandmarker);
        toast.success('✅ الكاميرا جاهزة! أظهر يدك للبدء بالتعرف');
      } else {
        setError(init.error ?? 'فشل تحميل نموذج التعرف. حاول تحديث الصفحة.');
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
          <Button variant="outline" onClick={() => {
            const isGJU = sessionStorage.getItem('gju_mode') === 'true';
            navigate(isGJU ? '/gju-competition' : '/');
          }} className="border-indigo-500/30 text-slate-300">
            <ArrowRight className="ml-2 h-4 w-4" />
            {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'رجوع'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || 'camera'} className="w-full">
          <TabsList className="w-full max-w-3xl mx-auto bg-slate-800/60 border border-indigo-500/20 mb-8 grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
            <TabsTrigger value="camera" className="data-[state=active]:bg-indigo-600 py-2.5">
              <Camera className="ml-2 h-4 w-4" />
              الكاميرا
            </TabsTrigger>
            <TabsTrigger value="learn" className="data-[state=active]:bg-indigo-600 py-2.5">
              <GraduationCap className="ml-2 h-4 w-4" />
              تعلّم
            </TabsTrigger>
            <TabsTrigger value="text-to-sign" className="data-[state=active]:bg-indigo-600 py-2.5">
              <Type className="ml-2 h-4 w-4" />
              نص → إشارة
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="data-[state=active]:bg-indigo-600 py-2.5">
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
                      <Button variant="outline" onClick={() => { setDetectedText(''); acceptedTokensRef.current = []; setGestureHistory([]); }} className="border-slate-600">
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

          {/* Learn Tab */}
          <TabsContent value="learn">
            <LearnSignsTab dictionary={signDictionary} categories={categories} speak={speakText} />
          </TabsContent>

          {/* Text-to-Sign Tab */}
          <TabsContent value="text-to-sign">
            <TextToSignTab dictionary={signDictionary} speak={speakText} />
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
                      key={`${item.word}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(index * 0.015, 0.5) }}
                      onClick={() => speakText(item.word)}
                      className="group flex flex-col items-center gap-2 p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-indigo-500/50 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer transition-all duration-200"
                    >
                      <span className="text-3xl group-hover:scale-125 transition-transform duration-200">{item.gesture}</span>
                      <span className="text-sm font-bold text-white">{item.word}</span>
                      {item.description && (
                        <p className="text-[10px] text-slate-400 text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{item.description}</p>
                      )}
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
