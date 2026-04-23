import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera, Languages, Loader2, Copy, RefreshCw, ArrowRight,
  Check, ScanText, Upload, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Tesseract from 'tesseract.js';

type Lang = 'ara' | 'eng';
type Step = 'language' | 'capture' | 'result';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseText: (text: string) => void;
}

const InkToTextDialog: React.FC<Props> = ({ open, onOpenChange, onUseText }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('language');
  const [lang, setLang] = useState<Lang>('ara');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast({
        title: 'تعذر الوصول للكاميرا',
        description: 'يمكنك رفع صورة من جهازك بدلاً من ذلك.',
        variant: 'destructive',
      });
    }
  };

  // Reset / lifecycle
  useEffect(() => {
    if (!open) {
      stopCamera();
      setStep('language');
      setPreviewUrl(null);
      setExtracted('');
      setIsProcessing(false);
      setProgress(0);
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (step === 'capture' && open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, open]);

  const handleSelectLanguage = (l: Lang) => {
    setLang(l);
    setStep('capture');
  };

  const runOCR = async (dataUrl: string) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const { data } = await Tesseract.recognize(dataUrl, lang, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const text = (data.text || '').trim();
      setExtracted(text);
      setStep('result');
      if (!text) {
        toast({
          title: 'لم يتم العثور على نص',
          description: 'حاول التقاط صورة أوضح وبإضاءة أفضل.',
        });
      }
    } catch (err) {
      console.error('OCR error:', err);
      toast({
        title: 'فشل استخراج النص',
        description: 'حاول مرة أخرى بصورة أوضح.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
    stopCamera();
    await runOCR(dataUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewUrl(dataUrl);
      stopCamera();
      await runOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    if (!extracted) return;
    await navigator.clipboard.writeText(extracted);
    setCopied(true);
    toast({ title: 'تم النسخ', description: 'تم نسخ النص إلى الحافظة.' });
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUseInChat = () => {
    onUseText(extracted);
    onOpenChange(false);
  };

  const handleRetake = () => {
    setExtracted('');
    setPreviewUrl(null);
    setStep('capture');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-black border-indigo-500/40 text-white"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            <ScanText className="w-6 h-6 text-indigo-300" />
            INK TO TEXT AI — تحويل الكتابة إلى نص
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6"
            >
              <p className="text-white/80 text-center mb-6 flex items-center justify-center gap-2">
                <Languages className="w-5 h-5 text-indigo-300" />
                اختر لغة النص الذي ستقوم بتصويره:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectLanguage('ara')}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 hover:border-indigo-300 hover:scale-[1.02] transition-all"
                >
                  <div className="text-5xl mb-3">🇯🇴</div>
                  <h3 className="text-2xl font-bold mb-2">العربية</h3>
                  <p className="text-sm text-white/70">Arabic OCR</p>
                </button>
                <button
                  onClick={() => handleSelectLanguage('eng')}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-indigo-600/30 border border-cyan-400/40 hover:border-cyan-300 hover:scale-[1.02] transition-all"
                >
                  <div className="text-5xl mb-3">🇬🇧</div>
                  <h3 className="text-2xl font-bold mb-2">English</h3>
                  <p className="text-sm text-white/70">English OCR</p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-300">
                  اللغة المختارة: <strong>{lang === 'ara' ? 'العربية' : 'English'}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('language')}
                  className="text-white/70 hover:text-white"
                >
                  تغيير اللغة
                </Button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-indigo-500/40 bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <div className="absolute inset-6 border-2 border-dashed border-indigo-300/60 rounded-lg pointer-events-none" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-300 animate-spin mb-3" />
                    <p className="text-white">جاري استخراج النص... {progress}%</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleCapture}
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  size="lg"
                >
                  <Camera className="w-5 h-5" />
                  التقط صورة
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-900/40 gap-2"
                  size="lg"
                >
                  <Upload className="w-5 h-5" />
                  رفع صورة
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-center text-xs text-white/60">
                💡 لأفضل النتائج: ضع النص داخل الإطار، استخدم إضاءة جيدة، وتجنّب الانعكاسات.
              </p>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4 space-y-4"
            >
              {previewUrl && (
                <div className="relative w-full max-h-48 overflow-hidden rounded-lg border border-indigo-500/30">
                  <img src={previewUrl} alt="Captured" className="w-full h-full object-contain bg-black" />
                </div>
              )}

              <div>
                <label className="block text-sm text-indigo-300 mb-2">
                  النص المستخرج (يمكنك تعديله قبل الاستخدام):
                </label>
                <Textarea
                  value={extracted}
                  onChange={(e) => setExtracted(e.target.value)}
                  className="min-h-[180px] bg-black/40 border-indigo-500/40 text-white"
                  dir={lang === 'ara' ? 'rtl' : 'ltr'}
                  placeholder="لم يتم استخراج أي نص..."
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-900/40 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة التصوير
                </Button>
                <Button
                  onClick={handleCopy}
                  disabled={!extracted}
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-200 hover:bg-cyan-900/40 gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ' : 'نسخ النص'}
                </Button>
                <Button
                  onClick={handleUseInChat}
                  disabled={!extracted}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
                >
                  استخدمه في المحادثة
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default InkToTextDialog;
