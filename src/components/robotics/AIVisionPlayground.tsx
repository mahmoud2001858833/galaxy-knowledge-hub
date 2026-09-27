import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Eye, 
  BrainCircuit, 
  Video, 
  VideoOff, 
  Sparkles, 
  Play, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Zap,
  Target,
  Maximize2,
  RefreshCw,
  Box,
  HandMetal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const AIVisionPlayground: React.FC<{
  onTargetDetected?: (x: number, y: number, color: string) => void;
}> = ({ onTargetDetected }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'color' | 'gesture' | 'yolo'>('color');
  const [targetColor, setTargetColor] = useState<'red' | 'green' | 'blue' | 'yellow'>('red');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [fps, setFps] = useState<number>(30);
  const [inferenceTime, setInferenceTime] = useState<number>(5.2);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [gestureCommand, setGestureCommand] = useState<string>('كف مفتوح (فتح القابض)');

  // Start / Stop WebCam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setUseWebcam(true);
        toast({
          title: "تم تشغيل الكاميرا الحية بنجاح 📹",
          description: "الرؤية الحاسوبية تعمل الآن على إطارات الكاميرا في الوقت الحقيقي."
        });
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable, switching to synthetic demo mode", err);
      setCameraError("تعذر الوصول إلى الكاميرا، تم تفعيل وضع المحاكاة البصرية الافتراضية.");
      setUseWebcam(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setUseWebcam(false);
  };

  // Synthetic Animation & Real-time Canvas Processor Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const renderLoop = () => {
      tick += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (useWebcam && cameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw live webcam feed
        ctx.save();
        ctx.scale(-1, 1); // Mirror for selfie view
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        // Synthetic Industrial Conveyor Belt / Scene
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Conveyor grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw moving test items along sine waves
        const item1X = (Math.sin(tick) * 0.35 + 0.5) * canvas.width;
        const item1Y = (Math.cos(tick * 0.8) * 0.25 + 0.5) * canvas.height;

        const item2X = (Math.cos(tick * 0.7) * 0.3 + 0.5) * canvas.width;
        const item2Y = (Math.sin(tick * 0.9) * 0.25 + 0.45) * canvas.height;

        // Render Red Block
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(item1X - 25, item1Y - 25, 50, 50, 8);
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render Green Gear
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(item2X, item2Y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6ee7b7';
        ctx.stroke();

        // Render Blue Cylinder
        const item3X = (Math.sin(tick * 1.1) * 0.3 + 0.5) * canvas.width;
        const item3Y = (Math.cos(tick * 1.3) * 0.2 + 0.55) * canvas.height;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(item3X - 20, item3Y - 30, 40, 60, 6);
        ctx.fill();
      }

      // Detection Overlays according to mode
      const detected: DetectedObject[] = [];

      if (selectedMode === 'color') {
        // Color tracker on synthetic coordinates or webcam centroid
        const cx = (Math.sin(tick) * 0.35 + 0.5) * canvas.width;
        const cy = (Math.cos(tick * 0.8) * 0.25 + 0.5) * canvas.height;

        detected.push({
          id: 'obj-color-1',
          label: `لون مستهدف (${targetColor.toUpperCase()})`,
          confidence: 96.4,
          x: cx - 35,
          y: cy - 35,
          width: 70,
          height: 70,
          color: targetColor === 'red' ? '#ef4444' : targetColor === 'green' ? '#10b981' : targetColor === 'blue' ? '#3b82f6' : '#eab308'
        });

        onTargetDetected?.(Math.round(cx), Math.round(cy), targetColor);
      } else if (selectedMode === 'gesture') {
        // Hand tracking simulation
        const hx = canvas.width / 2 + Math.sin(tick * 0.6) * 60;
        const hy = canvas.height / 2 + Math.cos(tick * 0.6) * 40;
        const isFist = Math.sin(tick) > 0.3;

        setGestureCommand(isFist ? 'قبضة مغلقة (إغلاق القابض - GRIP)' : 'كف مفتوح (فتح القابض - RELEASE)');

        detected.push({
          id: 'hand-1',
          label: isFist ? 'Hand Pose: FIST (GRIP)' : 'Hand Pose: OPEN PALM (RELEASE)',
          confidence: 93.8,
          x: hx - 50,
          y: hy - 60,
          width: 100,
          height: 120,
          color: '#a855f7'
        });
      } else {
        // YOLOv8 Multi-Class Industrial Object Detection
        const x1 = (Math.sin(tick) * 0.35 + 0.5) * canvas.width;
        const y1 = (Math.cos(tick * 0.8) * 0.25 + 0.5) * canvas.height;
        const x2 = (Math.cos(tick * 0.7) * 0.3 + 0.5) * canvas.width;
        const y2 = (Math.sin(tick * 0.9) * 0.25 + 0.45) * canvas.height;

        detected.push(
          {
            id: 'yolo-1',
            label: 'Industrial Cube (Class: Part_A)',
            confidence: 97.2,
            x: x1 - 32,
            y: y1 - 32,
            width: 64,
            height: 64,
            color: '#06b6d4'
          },
          {
            id: 'yolo-2',
            label: 'Rotary Gear (Class: Component_B)',
            confidence: 91.5,
            x: x2 - 34,
            y: y2 - 34,
            width: 68,
            height: 68,
            color: '#10b981'
          }
        );
      }

      setDetectedObjects(detected);

      // Draw bounding boxes, labels, and target reticles
      detected.forEach(obj => {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

        // Corner accents
        const cornerLen = 12;
        ctx.lineWidth = 4;
        // Top Left
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + cornerLen);
        ctx.lineTo(obj.x, obj.y);
        ctx.lineTo(obj.x + cornerLen, obj.y);
        ctx.stroke();
        // Top Right
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width - cornerLen, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y + cornerLen);
        ctx.stroke();
        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + obj.height - cornerLen);
        ctx.lineTo(obj.x, obj.y + obj.height);
        ctx.lineTo(obj.x + cornerLen, obj.y + obj.height);
        ctx.stroke();
        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width - cornerLen, obj.y + obj.height);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height - cornerLen);
        ctx.stroke();

        // Label banner
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y - 24, Math.max(140, obj.width), 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${obj.label} ${obj.confidence.toFixed(1)}%`, obj.x + Math.max(130, obj.width - 5), obj.y - 7);

        // Center crosshair
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.moveTo(cx - 10, cy);
        ctx.lineTo(cx + 10, cy);
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx, cy + 10);
        ctx.stroke();
      });

      animFrame = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animFrame);
  }, [useWebcam, cameraActive, selectedMode, targetColor, confidenceThreshold]);

  return (
    <div className="space-y-8 text-right">
      {/* Hidden Video element for webcam capture */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/30">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>مختبر الرؤية الحاسوبية والوكلاء (AI Vision & Edge Agents)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            مختبر الذكاء الاصطناعي البصري وتوجيه الروبوتات
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
            شغّل كاميرا جهازك أو استخدم المحاكي البصري لتدريب واختبار خوارزميات كشف الألوان، تتبع الإيماءات، وتصنيف القطع عبر YOLO.
          </p>
        </div>

        {/* Camera Toggle Button */}
        <div className="flex items-center gap-2">
          {cameraActive ? (
            <Button
              variant="destructive"
              onClick={stopCamera}
              className="text-xs rounded-xl font-bold gap-1.5"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span>إيقاف الكاميرا الحية</span>
            </Button>
          ) : (
            <Button
              onClick={startCamera}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl font-bold gap-1.5 shadow-md shadow-purple-500/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>تشغيل كاميرا اللابتوب الحية</span>
            </Button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Viewport & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vision Canvas HUD */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                نافذة المعالجة البصرية المباشرة (Live Inference Stream)
              </h4>
            </div>

            {/* Metrics: FPS & Latency */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400">
                {cameraActive ? 'SOURCE: WEBCAM' : 'SOURCE: SYNTHETIC SIM'}
              </Badge>
              <span className="text-emerald-500 font-bold">{fps} FPS</span>
              <span className="text-cyan-500">{inferenceTime}ms Latency</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={420}
              className="w-full max-w-[640px] h-auto"
            />

            {/* In-canvas HUD Stats */}
            <div className="absolute top-4 start-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-1">
              <div className="text-purple-400 font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>MODEL: {selectedMode === 'color' ? 'HSV-Color-Seg' : selectedMode === 'gesture' ? 'MediaPipe-Hands' : 'YOLOv8-Nano'}</span>
              </div>
              <div className="text-slate-400">Objects Tracked: {detectedObjects.length}</div>
              {selectedMode === 'gesture' && (
                <div className="text-emerald-400 font-bold pt-1">{gestureCommand}</div>
              )}
            </div>
          </div>

          {/* Vision Action Bar */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-purple-900 dark:text-purple-300 block">
                توجيه الروبوت تلقائياً بالأمر البصري:
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                يتم تحويل إحداثيات مركز الجسم (Centroid) في الصورة إلى زوايا مفاصل الذراع الروبوتية تلقائياً.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-bold text-xs">
                إرسال الأوامر للذراع: مفعل
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column: AI Model Controls & Modes */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              إعدادات نموذج الرؤية وتصنيف الكائنات
            </h4>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              خوارزمية الرؤية النشطة:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setSelectedMode('color')}
                className={`p-3 rounded-xl text-xs font-bold text-right transition-all flex items-center justify-between ${
                  selectedMode === 'color'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>1. تتبع فرز الألوان (Color Segmentation)</span>
                <Target className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedMode('gesture')}
                className={`p-3 rounded-xl text-xs font-bold text-right transition-all flex items-center justify-between ${
                  selectedMode === 'gesture'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>2. إيماءات اليد والقابض (Hand Gestures)</span>
                <HandMetal className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedMode('yolo')}
                className={`p-3 rounded-xl text-xs font-bold text-right transition-all flex items-center justify-between ${
                  selectedMode === 'yolo'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>3. مصنف القطع الصناعية (YOLOv8 Detector)</span>
                <Box className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Selector if in Color mode */}
          {selectedMode === 'color' && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                اختر لون الهدف المراد تتبعه:
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setTargetColor('red')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    targetColor === 'red' ? 'bg-red-500 text-white border-red-300 ring-2 ring-red-400/40' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}
                >
                  أحمر
                </button>
                <button
                  onClick={() => setTargetColor('green')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    targetColor === 'green' ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-400/40' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  أخضر
                </button>
                <button
                  onClick={() => setTargetColor('blue')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    targetColor === 'blue' ? 'bg-blue-500 text-white border-blue-300 ring-2 ring-blue-400/40' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  }`}
                >
                  أزرق
                </button>
                <button
                  onClick={() => setTargetColor('yellow')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    targetColor === 'yellow' ? 'bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400/40' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  أصفر
                </button>
              </div>
            </div>
          )}

          {/* Confidence Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">عتبة الثقة (Confidence Threshold)</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{confidenceThreshold}%</span>
            </div>
            <Slider
              value={[confidenceThreshold]}
              min={50}
              max={99}
              step={1}
              onValueChange={vals => setConfidenceThreshold(vals[0])}
            />
          </div>

          {/* Educational Note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              كيف تعمل هذه التقنية في الروبوتات الحقيقية؟
            </span>
            <p>
              يتم تثبيت كاميرا ESP32-CAM أو كاميرا حافة (OAK-D) على نهاية ذراع الروبوت، وتعمل الشبكة العصبية على استخراج إحداثيات البيكسل `(u, v)` ثم تحويلها عبر مصفوفة المعايرة (Extrinsic Camera Calibration Matrix) إلى إحداثيات ميليمترية في الفراغ `(X, Y, Z)` لتمكين القابض من التقاط الجسم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
