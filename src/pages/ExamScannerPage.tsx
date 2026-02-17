import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, X, Check, Trash2, ChevronDown, RotateCcw, Loader2, ScanLine, SwitchCamera, Video, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useDocumentDetection } from '@/hooks/useDocumentDetection';

interface ExamQuestion {
  question: string;
  answer: string;
  explanation: string;
  options?: string[];
}

type Phase = 'permission' | 'camera' | 'analyzing' | 'results';

const ExamScannerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('permission');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [autoMode, setAutoMode] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzeRetryCount, setAnalyzeRetryCount] = useState(0);

  const handleAutoCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImages(prev => {
      const next = [...prev, dataUrl];
      toast({ title: `📸 تم التقاط الصورة ${next.length} تلقائياً` });
      return next;
    });
  }, []);

  const detection = useDocumentDetection(videoRef, cameraReady && phase === 'camera' && autoMode, handleAutoCapture);

  const pendingStreamRef = useRef<MediaStream | null>(null);

  const openCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      pendingStreamRef.current = stream;
      setPhase('camera');
    } catch (err: any) {
      console.error('Camera error:', err);
      toast({ title: 'خطأ في الكاميرا', description: err.name === 'NotAllowedError' ? 'يرجى السماح بالوصول إلى الكاميرا من إعدادات المتصفح' : 'لا يمكن الوصول إلى الكاميرا', variant: 'destructive' });
    }
  }, []);

  useEffect(() => {
    if (phase === 'camera' && videoRef.current && pendingStreamRef.current) {
      const video = videoRef.current;
      const stream = pendingStreamRef.current;
      pendingStreamRef.current = null;
      video.srcObject = stream;
      video.play().then(() => setCameraReady(true)).catch(console.error);
    }
  }, [phase]);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleStartCamera = () => {
    openCamera(facingMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImages(prev => [...prev, dataUrl]);
    toast({ title: `📸 تم التقاط الصورة ${capturedImages.length + 1}` });
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const flipCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    openCamera(newMode);
  };

  const analyzeExam = async () => {
    if (capturedImages.length === 0) {
      toast({ title: 'تنبيه', description: 'التقط صورة واحدة على الأقل', variant: 'destructive' });
      return;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setPhase('analyzing');
    setAnalysisError(null);

    try {
      const base64Images = capturedImages.map(img => img.split(',')[1]);
      const { data, error } = await supabase.functions.invoke('exam-analyzer', {
        body: { images: base64Images }
      });
      
      if (error) {
        throw new Error(error.message || 'فشل في الاتصال بالخادم');
      }
      
      // Check if response contains an error message
      if (data?.error && (!data.questions || data.questions.length === 0)) {
        throw new Error(data.error);
      }
      
      setQuestions(data?.questions || []);
      setPhase('results');
    } catch (e: any) {
      console.error('Analysis error:', e);
      setAnalysisError(e.message || 'حدث خطأ أثناء التحليل');
      setPhase('results'); // Go to results phase to show error, not back to camera
    }
  };

  const retryAnalysis = () => {
    setAnalyzeRetryCount(prev => prev + 1);
    analyzeExam();
  };

  const resetScanner = () => {
    setCapturedImages([]);
    setQuestions([]);
    setCameraReady(false);
    setAnalysisError(null);
    setAnalyzeRetryCount(0);
    setPhase('permission');
  };

  const retakePhotos = () => {
    setQuestions([]);
    setAnalysisError(null);
    setAnalyzeRetryCount(0);
    openCamera(facingMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white" dir="rtl">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      {phase === 'permission' && (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-28 h-28 rounded-full bg-cyan-600/20 border-2 border-cyan-500/40 flex items-center justify-center">
            <Camera className="h-14 w-14 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-cyan-300">ماسح الامتحانات الذكي</h2>
          <p className="text-white/60 text-center max-w-sm">صوّر ورقة الامتحان وسيقوم الذكاء الاصطناعي باستخراج الأسئلة وتقديم الإجابات مع الشرح</p>
          
          <div className="flex gap-3">
            <Button
              onClick={() => { setFacingMode('environment'); openCamera('environment'); }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-6 text-lg gap-3"
            >
              <Video className="h-6 w-6" />
              الكاميرا الخلفية
            </Button>
            <Button
              onClick={() => { setFacingMode('user'); openCamera('user'); }}
              variant="outline"
              className="px-6 py-6 text-lg gap-3 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/20"
            >
              <SwitchCamera className="h-6 w-6" />
              الأمامية
            </Button>
          </div>
        </div>
      )}

      {phase === 'camera' && (
        <div className="relative h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 relative bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-[85%] max-w-lg aspect-[3/4] border-2 rounded-xl relative transition-colors duration-300 ${
                detection.detected ? 'border-green-400' : 'border-cyan-400/60'
              }`}>
                {([0,1,2,3]).map((idx) => {
                  const positions = [
                    '-top-1 -right-1 border-t-4 border-r-4 rounded-tr-xl',
                    '-top-1 -left-1 border-t-4 border-l-4 rounded-tl-xl',
                    '-bottom-1 -right-1 border-b-4 border-r-4 rounded-br-xl',
                    '-bottom-1 -left-1 border-b-4 border-l-4 rounded-bl-xl',
                  ];
                  return (
                    <div key={idx} className={`absolute w-8 h-8 ${positions[idx]} transition-colors duration-300 ${
                      detection.detected ? 'border-green-400' : 'border-cyan-400'
                    }`} />
                  );
                })}
                <div className={`absolute top-1/2 left-0 right-0 h-0.5 animate-pulse transition-colors duration-300 ${
                  detection.detected ? 'bg-green-400/60' : 'bg-cyan-400/40'
                }`} />
                {autoMode && detection.stability > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full transition-all duration-300"
                        style={{ width: `${detection.stability}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-4 left-0 right-0 text-center">
              <span className={`backdrop-blur-sm px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                detection.detected ? 'bg-green-600/70 text-green-100' : 'bg-black/60'
              }`}>
                <ScanLine className="inline h-4 w-4 ml-1" />
                {autoMode ? detection.message : 'وجّه الكاميرا والتقط يدوياً'}
              </span>
            </div>
          </div>

          {capturedImages.length > 0 && (
            <div className="bg-black/80 backdrop-blur-md p-2 flex gap-2 overflow-x-auto">
              {capturedImages.map((img, i) => (
                <div key={i} className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 border-cyan-500/50">
                  <img src={img} alt={`صفحة ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-red-600 rounded-bl-lg p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center">{i + 1}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-black/90 backdrop-blur-md p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="icon" onClick={flipCamera} className="text-white">
                <SwitchCamera className="h-6 w-6" />
              </Button>

              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition-all disabled:opacity-40"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>

              <Button
                onClick={analyzeExam}
                disabled={capturedImages.length === 0}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 gap-2"
              >
                <Check className="h-5 w-5" />
                تم ({capturedImages.length})
              </Button>
            </div>
            <button
              onClick={() => setAutoMode(prev => !prev)}
              className={`mx-auto px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                autoMode
                  ? 'bg-green-600/80 text-green-100'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {autoMode ? '🤖 التقاط تلقائي: مفعّل' : '✋ التقاط يدوي'}
            </button>
          </div>
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
          </div>
          <p className="text-xl font-bold text-cyan-300">جاري تحليل الامتحان...</p>
          <p className="text-white/60 text-sm text-center max-w-sm">
            الذكاء الاصطناعي يستخرج الأسئلة ويحضّر الإجابات والشرح المفصل
          </p>
          <div className="flex gap-1 mt-4">
            {capturedImages.map((img, i) => (
              <div key={i} className="w-12 h-16 rounded-md overflow-hidden border border-cyan-500/30 opacity-60">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-cyan-300">📝 نتائج التحليل</h1>
            <Button onClick={resetScanner} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              امتحان جديد
            </Button>
          </div>

          {/* Error state */}
          {analysisError && (
            <Card className="bg-red-950/30 border-red-500/30 mb-6">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 font-medium text-lg mb-2">فشل في تحليل الامتحان</p>
                <p className="text-red-400/70 text-sm mb-4">{analysisError}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={retryAnalysis} className="bg-cyan-600 hover:bg-cyan-500 gap-2">
                    <RotateCcw className="h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                  <Button onClick={retakePhotos} variant="outline" className="gap-2 border-cyan-500/30 text-cyan-300">
                    <Camera className="h-4 w-4" />
                    إعادة التصوير
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!analysisError && (
            <p className="text-white/70 mb-6">تم استخراج {questions.length} سؤال من {capturedImages.length} صفحة</p>
          )}

          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-white font-medium leading-relaxed">{q.question}</p>
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="mr-11 mb-3 space-y-1">
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            opt === q.answer
                              ? 'bg-green-600/20 border border-green-500/40 text-green-300'
                              : 'bg-white/5 text-white/70'
                          }`}
                        >
                          {opt}
                          {opt === q.answer && <Check className="inline h-4 w-4 mr-2" />}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mr-11 bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-2 mb-3">
                    <span className="text-green-400 text-sm font-semibold">✅ الإجابة: </span>
                    <span className="text-green-200">{q.answer}</span>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="mr-11 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 gap-2 text-sm">
                        <ChevronDown className="h-4 w-4" />
                        تعرف لماذا؟
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mr-11 mt-2 bg-blue-900/20 border border-blue-700/30 rounded-lg px-4 py-3 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {q.explanation}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>

          {!analysisError && questions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-lg">لم يتم العثور على أسئلة. جرّب تصوير الورقة بشكل أوضح.</p>
              <div className="flex gap-3 justify-center mt-4">
                <Button onClick={retakePhotos} className="bg-cyan-600 hover:bg-cyan-500 gap-2">
                  <Camera className="h-4 w-4" />
                  إعادة التصوير
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamScannerPage;
