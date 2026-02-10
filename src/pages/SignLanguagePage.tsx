import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Hand, Volume2, Trash2, BookOpen, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// قاموس لغة الإشارة العربية
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

const gestureToArabic: Record<string, string> = {
  'open_palm': 'مرحبا ✋',
  'thumbs_up': 'نعم / موافق 👍',
  'thumbs_down': 'لا / رفض 👎',
  'pointing_up': 'إشارة للأعلى ☝️',
  'victory': 'سلام ✌️',
  'fist': 'قوة ✊',
};

const categories = [...new Set(signDictionary.map(item => item.category))];

const SignLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const lastGestureTimeRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [gestureHistory, setGestureHistory] = useState<{ gesture: string; text: string; time: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredDictionary = signDictionary.filter(item => {
    const matchesSearch = item.word.includes(searchQuery);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const classifyGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length === 0) return null;
    const hand = landmarks[0];
    if (!hand || hand.length < 21) return null;

    const thumbTip = hand[4], thumbIp = hand[3];
    const indexTip = hand[8], indexPip = hand[6];
    const middleTip = hand[12], middlePip = hand[10];
    const ringTip = hand[16], ringPip = hand[14];
    const pinkyTip = hand[20], pinkyPip = hand[18];
    const wrist = hand[0];

    const indexUp = indexTip.y < indexPip.y;
    const middleUp = middleTip.y < middlePip.y;
    const ringUp = ringTip.y < ringPip.y;
    const pinkyUp = pinkyTip.y < pinkyPip.y;
    const thumbUp = thumbTip.y < thumbIp.y;

    if (indexUp && middleUp && ringUp && pinkyUp) return 'open_palm';
    if (indexUp && middleUp && !ringUp && !pinkyUp) return 'victory';
    if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'pointing_up';
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      return thumbTip.y < wrist.y - 0.1 ? 'thumbs_up' : 'thumbs_down';
    }
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return 'fist';
    return null;
  };

  const handleGestureDetected = useCallback((gesture: string) => {
    const arabicText = gestureToArabic[gesture] || gesture;
    setCurrentGesture(gesture);
    setDetectedText(prev => (prev ? prev + ' ' : '') + arabicText);
    setGestureHistory(prev => [
      { gesture, text: arabicText, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev,
    ].slice(0, 50));
    setTimeout(() => setCurrentGesture(null), 1500);
  }, []);

  const initializeHandDetection = useCallback(async () => {
    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      handLandmarkerRef.current = handLandmarker;
      return handLandmarker;
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      return null;
    }
  }, []);

  const startDetectionLoop = useCallback((handLandmarker: any) => {
    const detect = () => {
      if (!videoRef.current || !handLandmarker || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      const now = Date.now();
      const results = handLandmarker.detectForVideo(videoRef.current, now);

      if (results.landmarks && results.landmarks.length > 0) {
        const gesture = classifyGesture(results.landmarks);
        if (gesture && now - lastGestureTimeRef.current > 2000) {
          handleGestureDetected(gesture);
          lastGestureTimeRef.current = now;
        }
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            for (const hand of results.landmarks) {
              for (const point of hand) {
                ctx.beginPath();
                ctx.arc(point.x * canvasRef.current.width, point.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#818cf8';
                ctx.fill();
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            }
          }
        }
      } else {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    animationFrameRef.current = requestAnimationFrame(detect);
  }, [handleGestureDetected]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setIsLoading(false);
        toast.success('تم تفعيل الكاميرا بنجاح');
        const handLandmarker = await initializeHandDetection();
        if (handLandmarker) {
          startDetectionLoop(handLandmarker);
        } else {
          toast.info('يعمل في وضع المحاكاة - MediaPipe غير متوفر');
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('لم نتمكن من الوصول للكاميرا. تأكد من منح الإذن.');
      setIsLoading(false);
    }
  }, [initializeHandDetection, startDetectionLoop]);

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
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const speakText = (text: string) => {
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

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
              <p className="text-sm text-slate-400">تحويل إشارات اليد إلى نص وكلام</p>
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
                    {!cameraActive && !isLoading && !error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-indigo-400/40 mx-auto mb-4" />
                          <p className="text-slate-400 text-lg mb-4">اضغط لتشغيل الكاميرا</p>
                          <Button onClick={startCamera} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                            <Camera className="ml-2 h-5 w-5" />
                            تشغيل الكاميرا
                          </Button>
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-indigo-400 animate-pulse mx-auto mb-2" />
                          <p className="text-slate-400">جاري تفعيل الكاميرا...</p>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 mb-4">{error}</p>
                          <Button onClick={startCamera}>إعادة المحاولة</Button>
                        </div>
                      </div>
                    )}
                    <video ref={videoRef} className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} playsInline muted style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${!cameraActive ? 'hidden' : ''}`} style={{ transform: 'scaleX(-1)' }} />
                    
                    {currentGesture && (
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0 }}
                        className="absolute top-4 left-4 bg-green-500/90 text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-lg"
                      >
                        {gestureToArabic[currentGesture] || currentGesture}
                      </motion.div>
                    )}

                    {cameraActive && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-3 py-1.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm font-medium">مباشر</span>
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
                    <CardTitle className="text-lg text-white">سجل الإشارات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {gestureHistory.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">لم يتم اكتشاف إشارات بعد</p>
                      ) : (
                        <div className="space-y-2">
                          {gestureHistory.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-indigo-400">{item.text}</span>
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
                    <CardTitle className="text-lg text-white">الإشارات المدعومة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(gestureToArabic).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30">
                          <span className="text-sm font-medium text-white">{value}</span>
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
