import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Hand, Volume2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface GestureCommand {
  gesture: string;
  name: string;
  action: string;
  execute: () => void;
}

interface SignLanguageCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onGestureDetected?: (gesture: string, arabicText: string) => void;
}

const SignLanguageCamera: React.FC<SignLanguageCameraProps> = ({
  isOpen,
  onClose,
  onGestureDetected
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const lastGestureTimeRef = useRef<number>(0);

  const gestureToArabic: Record<string, string> = {
    'open_palm': 'مرحبا',
    'thumbs_up': 'نعم / موافق',
    'thumbs_down': 'لا / رفض',
    'pointing_up': 'أعلى / التالي',
    'victory': 'سلام / نصر',
    'fist': 'قوة / تحديد',
    'index_finger': 'إشارة',
  };

  const gestureCommands: GestureCommand[] = [
    {
      gesture: 'pointing_up',
      name: 'إصبع للأعلى',
      action: 'التمرير للأعلى',
      execute: () => window.scrollBy({ top: -300, behavior: 'smooth' })
    },
    {
      gesture: 'thumbs_up',
      name: 'إبهام للأعلى',
      action: 'تأكيد / نقر',
      execute: () => {
        const activeEl = document.activeElement as HTMLElement;
        if (activeEl) activeEl.click();
      }
    },
    {
      gesture: 'thumbs_down',
      name: 'إبهام للأسفل',
      action: 'رجوع',
      execute: () => window.history.back()
    },
    {
      gesture: 'open_palm',
      name: 'كف مفتوح',
      action: 'إيقاف القراءة',
      execute: () => window.speechSynthesis.cancel()
    },
    {
      gesture: 'fist',
      name: 'قبضة',
      action: 'تحديد العنصر التالي',
      execute: () => {
        const focusable = document.querySelectorAll('button, a, input, [tabindex]');
        const currentIndex = Array.from(focusable).findIndex(el => el === document.activeElement);
        const nextIndex = (currentIndex + 1) % focusable.length;
        (focusable[nextIndex] as HTMLElement)?.focus();
      }
    }
  ];

  // Classify gesture from hand landmarks
  const classifyGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length === 0) return null;

    const hand = landmarks[0];
    if (!hand || hand.length < 21) return null;

    // Finger tip and pip indices
    const thumbTip = hand[4];
    const thumbIp = hand[3];
    const indexTip = hand[8];
    const indexPip = hand[6];
    const middleTip = hand[12];
    const middlePip = hand[10];
    const ringTip = hand[16];
    const ringPip = hand[14];
    const pinkyTip = hand[20];
    const pinkyPip = hand[18];
    const wrist = hand[0];

    const indexUp = indexTip.y < indexPip.y;
    const middleUp = middleTip.y < middlePip.y;
    const ringUp = ringTip.y < ringPip.y;
    const pinkyUp = pinkyTip.y < pinkyPip.y;
    const thumbUp = thumbTip.y < thumbIp.y;

    // All fingers up = open palm
    if (indexUp && middleUp && ringUp && pinkyUp) {
      return 'open_palm';
    }

    // Only index and middle up = victory
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      return 'victory';
    }

    // Only index up = pointing
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return 'pointing_up';
    }

    // Thumb up, others down
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      // Check if thumb is significantly above wrist
      if (thumbTip.y < wrist.y - 0.1) {
        return 'thumbs_up';
      }
      return 'thumbs_down';
    }

    // All fingers closed = fist
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) {
      return 'fist';
    }

    return null;
  };

  // Initialize MediaPipe HandLandmarker
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
      // Fallback: return null, we'll use simulation
      return null;
    }
  }, []);

  const handleGestureDetected = useCallback((gesture: string) => {
    setCurrentGesture(gesture);
    const arabicText = gestureToArabic[gesture] || gesture;
    setDetectedText(prev => prev + ' ' + arabicText);
    
    const command = gestureCommands.find(cmd => cmd.gesture === gesture);
    if (command) {
      command.execute();
      toast.info(`تم تنفيذ: ${command.action}`);
    }
    
    if (onGestureDetected) {
      onGestureDetected(gesture, arabicText);
    }
    
    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
    
    setTimeout(() => setCurrentGesture(null), 1000);
  }, [onGestureDetected]);

  // Start real-time detection loop
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
        
        // Only trigger gesture every 2 seconds to avoid spam
        if (gesture && now - lastGestureTimeRef.current > 2000) {
          handleGestureDetected(gesture);
          lastGestureTimeRef.current = now;
        }

        // Draw landmarks on canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            for (const hand of results.landmarks) {
              // Draw connections
              ctx.strokeStyle = '#6366f1';
              ctx.lineWidth = 2;
              for (const point of hand) {
                ctx.beginPath();
                ctx.arc(point.x * canvasRef.current.width, point.y * canvasRef.current.height, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#818cf8';
                ctx.fill();
              }
            }
          }
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
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setIsLoading(false);
        toast.success('تم تفعيل الكاميرا بنجاح');
        
        // Initialize MediaPipe and start detection
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
      toast.error('فشل في تفعيل الكاميرا');
    }
  }, [initializeHandDetection, startDetectionLoop]);

  const stopCamera = useCallback(() => {
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Close hand landmarker
    if (handLandmarkerRef.current) {
      try {
        handLandmarkerRef.current.close();
      } catch (e) {
        // ignore
      }
      handLandmarkerRef.current = null;
    }
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const speakDetectedText = () => {
    if (detectedText.trim()) {
      const utterance = new SpeechSynthesisUtterance(detectedText.trim());
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearText = () => {
    setDetectedText('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => { stopCamera(); onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-2xl border border-indigo-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-indigo-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Hand className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">التحكم بلغة الإشارة</h2>
                <p className="text-sm text-slate-400">استخدم إيماءات يدك للتحكم بالمنصة</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 p-4">
            {/* Camera View */}
            <div className="relative">
              <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative">
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
                      <p className="text-red-400">{error}</p>
                      <Button onClick={startCamera} className="mt-4">
                        إعادة المحاولة
                      </Button>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {currentGesture && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-full font-bold"
                  >
                    {gestureToArabic[currentGesture] || currentGesture}
                  </motion.div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant={cameraActive ? "destructive" : "default"}
                  className="flex-1"
                  onClick={cameraActive ? () => { stopCamera(); } : startCamera}
                >
                  {cameraActive ? (
                    <>
                      <CameraOff className="ml-2 h-4 w-4" />
                      إيقاف الكاميرا
                    </>
                  ) : (
                    <>
                      <Camera className="ml-2 h-4 w-4" />
                      تشغيل الكاميرا
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Detected Text & Commands */}
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-indigo-500/30 p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-indigo-400" />
                  النص المكتشف
                </h3>
                <div className="min-h-[100px] bg-slate-900 rounded-lg p-3 text-white text-lg leading-relaxed">
                  {detectedText || 'سيظهر النص المترجم هنا...'}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={speakDetectedText} disabled={!detectedText.trim()}>
                    <Volume2 className="ml-2 h-4 w-4" />
                    نطق النص
                  </Button>
                  <Button variant="outline" onClick={clearText}>
                    مسح
                  </Button>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-indigo-500/30 p-4">
                <h3 className="text-lg font-bold text-white mb-3">أوامر التحكم</h3>
                <div className="grid grid-cols-2 gap-2">
                  {gestureCommands.map((cmd) => (
                    <div
                      key={cmd.gesture}
                      className={`p-3 rounded-lg border transition-all ${
                        currentGesture === cmd.gesture
                          ? 'bg-indigo-500/30 border-indigo-500'
                          : 'bg-slate-900/50 border-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {cmd.gesture === 'pointing_up' && '☝️'}
                        {cmd.gesture === 'thumbs_up' && '👍'}
                        {cmd.gesture === 'thumbs_down' && '👎'}
                        {cmd.gesture === 'open_palm' && '✋'}
                        {cmd.gesture === 'fist' && '✊'}
                      </div>
                      <div className="text-sm font-medium text-white">{cmd.name}</div>
                      <div className="text-xs text-slate-400">{cmd.action}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignLanguageCamera;
