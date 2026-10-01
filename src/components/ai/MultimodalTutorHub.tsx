import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  FileText, 
  Trash2, 
  Maximize2, 
  PenTool, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  BookOpen,
  Atom,
  Settings,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { geminiMultimodalService } from '@/services/geminiMultimodalService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  image?: string;
  timestamp: string;
  discipline?: string;
}

export const MultimodalTutorHub: React.FC = () => {
  // Mode & Discipline State
  const [activeTab, setActiveTab] = useState<'vision' | 'voice'>('vision');
  const [pedagogicalMode, setPedagogicalMode] = useState<'socratic' | 'full_solution'>('full_solution');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('فيزياء توجيهي');

  // Vision Solver State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [visionPrompt, setVisionPrompt] = useState<string>('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Drawing Canvas (Sketchpad) State
  const [isSketchpadOpen, setIsSketchpadOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Voice Interaction State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);
  const [voiceMessages, setVoiceMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'tutor',
      text: 'مرحباً بك يا بطل! أنا معلمك الذكي الناطق. يمكنك الضغط على المايكروفون والتحدث معي مباشرة عن أي مفهوم فيزيائي أو كيميائي أو رياضي، أو تصوير مسألتك من الدفتر وسأرشدك لحلها فوراً.',
      timestamp: 'الآن',
      discipline: 'المرشد العام'
    }
  ]);
  const [voiceInputText, setVoiceInputText] = useState<string>('');
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);

  // Recognition Ref
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Connection & API key state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => geminiMultimodalService.getApiKey());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'error'>('checking');

  // Verify connection on mount
  useEffect(() => {
    let isMounted = true;
    geminiMultimodalService.testConnection().then(res => {
      if (isMounted) {
        setConnectionStatus(res.ok ? 'connected' : 'error');
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-JO';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('تعذر التقاط الصوت، يمكنك الكتابة نصياً');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech synthesizer
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.info('محرك الصوت غير مدعوم في هذا المتصفح');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean markdown asterisks & tags for cleaner speech
    const cleanText = text
      .replace(/[*#_`$]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 800); // Speak first 800 chars

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = speechSpeed;

    // Try finding Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speechSpeed]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('التعرف على الصوت غير مدعوم في متصفحك، استخدم متصفح Chrome أو Edge');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        setVoiceInputText('');
        recognitionRef.current.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Submit Voice/Text Query to Tutor
  const handleSendVoiceQuestion = async (textToSend?: string) => {
    const query = (textToSend || voiceInputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      discipline: selectedDiscipline
    };

    setVoiceMessages(prev => [...prev, userMsg]);
    setVoiceInputText('');
    setIsProcessingVoice(true);

    try {
      const historyContext = voiceMessages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));

      const reply = await geminiMultimodalService.askVoiceTutor(query, selectedDiscipline, historyContext);

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        discipline: selectedDiscipline
      };

      setVoiceMessages(prev => [...prev, tutorMsg]);
      speakText(reply);
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ أثناء التواصل مع المعلم الذكي');
    } finally {
      setIsProcessingVoice(false);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // File Upload Handler (Image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP)');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setImageAnalysisResult(null);
      toast.success('تم تحميل الصورة بنجاح! انقر على "تحليل وحل المسألة"');
    };
    reader.readAsDataURL(file);
  };

  // Paste from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'vision') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setImageMimeType(file.type);
            const reader = new FileReader();
            reader.onload = (event) => {
              setSelectedImage(event.target?.result as string);
              setImageAnalysisResult(null);
              toast.success('تم لصق الصورة من الحافظة مباشرة!');
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  // Sketchpad Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSelectedImage(dataUrl);
    setImageMimeType('image/png');
    setIsSketchpadOpen(false);
    toast.success('تم اعتماد رسمك ومعادلتك اليدوية!');
  };

  // Submit Vision Problem
  const handleSolveImageProblem = async () => {
    if (!selectedImage) {
      toast.error('يرجى التقاط أو رفع صورة المسألة أولاً');
      return;
    }

    setIsAnalyzingImage(true);
    setImageAnalysisResult(null);

    try {
      const solution = await geminiMultimodalService.solveProblemWithImage(
        selectedImage,
        imageMimeType,
        visionPrompt,
        pedagogicalMode,
        selectedDiscipline
      );

      setImageAnalysisResult(solution);
      toast.success('تم تحليل المسألة بنجاح!');
    } catch (err: any) {
      toast.error(err?.message || 'تعذر حل المسألة، يرجى المحاولة بصورة أوضح');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleCopyResult = () => {
    if (!imageAnalysisResult) return;
    navigator.clipboard.writeText(imageAnalysisResult);
    setIsCopied(true);
    toast.success('تم نسخ الحل كاملاً إلى الحافظة');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 font-sans" dir="rtl">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold">
                المعلم الذكي متعدد الأنماط 2.0 (Multimodal AI)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {connectionStatus === 'connected' ? 'Gemini 2.5 Flash متصل' : 'فحص الجاهزية...'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              المعلم الصوتي والبصري الذكي للعلوم والرياضيات
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              صور مسألتك من الدفتر أو ارسم معادلتك بخط اليد لقراءتها وحلها فوراً، أو تحدث صوتياً مع المرشد الأكاديمي المباشر للمنهاج الأردني ومسارات BTEC.
            </p>
          </div>

          {/* Quick Settings & Mode Controls */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApiKeyModalOpen(true)}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1.5"
              title="إعدادات مفتاح الذكاء الاصطناعي"
            >
              <Settings className="w-4 h-4" />
              <span>مفتاح الذكاء</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vision'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>حل المسائل بالصورة والكاميرا (Vision OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>الحوار الصوتي المباشر (Voice-to-Voice)</span>
          </button>
        </div>

        {/* Discipline Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">التخصص:</span>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="فيزياء توجيهي">فيزياء توجيهي (ميكانيكا، كهرومغناطيسية، حث)</option>
            <option value="كيمياء توجيهي">كيمياء توجيهي (حموض وقواعد، سرعة، عضوية)</option>
            <option value="رياضيات علمي">رياضيات علمي (تفاضل، تكامل، متجهات)</option>
            <option value="أحياء توجيهي">أحياء توجيهي (وراثة، بيولوجيا جزيئية)</option>
            <option value="BTEC هندسة">مسار BTEC هندسة وتكنولوجيا</option>
            <option value="BTEC تكنولوجيا معلومات">مسار BTEC تكنولوجيا المعلومات</option>
            <option value="علوم الصف العاشر">علوم الصف العاشر الأساسي</option>
          </select>
        </div>
      </div>

      {/* TAB 1: VISUAL PROBLEM SOLVER (VISION OCR) */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Input & Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-500" />
                  <span>التقاط أو رفع صورة المسألة</span>
                </h3>

                {selectedImage && (
                  <button
                    onClick={() => { setSelectedImage(null); setImageAnalysisResult(null); }}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء الصورة</span>
                  </button>
                )}
              </div>

              {/* Drop / Preview Area */}
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 group space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      انقر لاختيار صورة المسألة أو اسحبها هنا
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      يدعم صور الهاتف، الكاميرا، ولقطات الشاشة (PNG, JPG, WebP)
                    </p>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono mt-1 font-bold">
                      💡 يمكنك الضغط على Ctrl+V للصق أي صورة مباشرة!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 max-h-[320px] flex items-center justify-center">
                    <img 
                      src={selectedImage} 
                      alt="Uploaded problem" 
                      className="max-h-[320px] w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />

              {/* Action Buttons: Camera & Sketchpad */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl text-xs gap-1.5 h-10 border-slate-200 dark:border-slate-700"
                >
                  <Camera className="w-4 h-4 text-blue-500" />
                  <span>فتح الكاميرا / الملفات</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSketchpadOpen(true)}
                  className="rounded-2xl text-xs gap-1.5 h-10 border-slate-200 dark:border-slate-700"
                >
                  <PenTool className="w-4 h-4 text-purple-500" />
                  <span>لوحة الرسم والخط اليدوي</span>
                </Button>
              </div>

              {/* Pedagogical Strategy Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  أسلوب الإرشاد الأكاديمي المطلوب:
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPedagogicalMode('full_solution')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      pedagogicalMode === 'full_solution'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>📝 حل نموذجي كامل</span>
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">معطيات وقوانين وخطوات</span>
                  </button>

                  <button
                    onClick={() => setPedagogicalMode('socratic')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      pedagogicalMode === 'socratic'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>💡 توجيه سقراطي</span>
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">إرشادات وأسئلة ذكية للحل الذاتي</span>
                  </button>
                </div>
              </div>

              {/* Optional Prompt Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  ملاحظة إضافية للمعلم الذكي (اختياري):
                </label>
                <Input
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="مثال: ركز لي على المطلوب الثاني، أو اشرح لي القانون المستخدم..."
                  className="text-xs h-10 rounded-2xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Submit Solve Button */}
              <Button
                onClick={handleSolveImageProblem}
                disabled={!selectedImage || isAnalyzingImage}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 gap-2"
              >
                {isAnalyzingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري قراءة خط اليد وتحليل المسألة بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تحليل المسألة بالرؤية الحاسوبية 🚀</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Solution Output */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[500px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        تقرير التحليل والحل الأكاديمي
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {pedagogicalMode === 'full_solution' ? 'حل منهجي تفصيلي متوافق مع معايير الوزارة' : 'إرشاد سقراطي ذكي'}
                      </span>
                    </div>
                  </div>

                  {imageAnalysisResult && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => speakText(imageAnalysisResult)}
                        className="rounded-xl text-xs gap-1 h-8"
                        title="الاستماع الصوتي للحل"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                        <span>استمع</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyResult}
                        className="rounded-xl text-xs gap-1 h-8"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content Box */}
                {isAnalyzingImage ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-500 animate-spin">
                      <Atom className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        الذكاء الاصطناعي يقرأ المعادلة والرموز الآن...
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        استخراج المعطيات، مطابقة القوانين، وتجهيز التعويض الرياضي
                      </p>
                    </div>
                  </div>
                ) : imageAnalysisResult ? (
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 space-y-3 bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 font-sans">
                    {imageAnalysisResult}
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-3 text-slate-400">
                    <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="font-bold text-slate-600 dark:text-slate-400">
                      لم يتم تحليل أي مسألة حتى الآن
                    </p>
                    <p className="text-xs max-w-sm mx-auto">
                      قم برفع أو تصوير مسألة من كتاب التوجيهي أو دفترك، وسيقوم المعلم الذكي بحلها وتوضيح خطواتها بالكامل.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Tips */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>💡 نصيحة: تأكد من وضوح الأرقام والوحدات الفيزيائية في الصورة لأفضل دقة.</span>
                <span className="font-mono text-[10px]">Gemini Vision Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME VOICE-TO-VOICE TUTOR */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chat Display */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[560px]">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      جلسة الحوار الصوتي المباشر
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      يتحدث باللغة العربية الفصحى بصوت ناطق فوري
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopSpeaking}
                      className="rounded-xl text-xs gap-1 text-rose-500 border-rose-200 dark:border-rose-900/40"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>إيقاف الصوت</span>
                    </Button>
                  )}

                  <select
                    value={speechSpeed}
                    onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                    className="h-8 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold border-none"
                    title="سرعة النطق"
                  >
                    <option value={0.85}>سرعة 0.85x</option>
                    <option value={1}>سرعة 1x (عادي)</option>
                    <option value={1.2}>سرعة 1.2x</option>
                  </select>
                </div>
              </div>

              {/* Message Bubbles Container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 pl-1">
                {voiceMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-white/20 dark:border-slate-700/40 text-[10px] opacity-75">
                        <span>{msg.discipline || 'علمي'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {msg.sender === 'tutor' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 mr-2 hover:underline flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>إعادة الاستماع</span>
                      </button>
                    )}
                  </div>
                ))}

                {isProcessingVoice && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-2xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>المعلم يفكر ويجهز الشرح الصوتي...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Real-time Listening Wave & Mic Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                
                {isListening && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-between text-xs animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-bold">جارٍ الاستماع إليك الآن... تحدث بصوت واضح</span>
                    </div>
                    <span className="font-mono text-[10px]">استمع...</span>
                  </div>
                )}

                {/* Input Bar */}
                <div className="flex items-center gap-2">
                  <Input
                    value={voiceInputText}
                    onChange={(e) => setVoiceInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendVoiceQuestion(); }}
                    placeholder="تحدث بالمايكروفون أو اكتب سؤالك هنا..."
                    className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs px-4"
                  />

                  {/* Mic Toggle Button */}
                  <Button
                    onClick={toggleListening}
                    variant="outline"
                    className={`h-12 w-12 rounded-2xl shrink-0 transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white border-rose-500 animate-pulse hover:bg-rose-600'
                        : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20'
                    }`}
                    title={isListening ? 'إيقاف التسجيل' : 'تحدث بالصوت'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>

                  {/* Send Button */}
                  <Button
                    onClick={() => handleSendVoiceQuestion()}
                    disabled={!voiceInputText.trim() || isProcessingVoice}
                    className="h-12 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-md"
                  >
                    <Send className="w-4 h-4 ml-1" />
                    <span>إرسال</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fast Science Prompts & Flashcards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>أسئلة ومفاهيم سريعة مقترحة</span>
              </h3>
              <p className="text-xs text-slate-400">
                انقر على أي سؤال لتشغيل الحوار والاستماع للشرح فوراً:
              </p>

              <div className="space-y-2">
                {[
                  'ما الفرق بين القوة الدافعة الكهربائية الحثية وقانون لينز؟',
                  'كيف أتعامل مع مسائل التصادم المرن وغير المرن في التوجيهي؟',
                  'ما هو مبدأ لوشاتيليه وكيف يؤثر تغير الضغط على الاتزان؟',
                  'اشرح لي قاعدة السلسلة في التفاضل بمثال بسيط وممتع.',
                  'ما هي وظيفة إنزيمات القطع المحددة في الهندسة الوراثية؟'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendVoiceQuestion(prompt)}
                    className="w-full text-right p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-2">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                <span className="font-bold block">🎯 نصيحة للمتفوقين:</span>
                <p>
                  اسأل المعلم الذكي عن "الخدع الرياضية الشائعة" في أي درس ليحذرك من الأخطاء التي تضيع علامات التوجيهي.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKETCHPAD DRAWING DIALOG MODAL */}
      <AnimatePresence>
        {isSketchpadOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-sm">لوحة الرسم وكتابة المعادلات بخط اليد</h3>
                    <p className="text-[11px] text-slate-400">ارسم معادلتك أو دائرتك الكهربائية بإصبعك أو الماوس</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsSketchpadOpen(false)}
                  className="rounded-xl text-slate-400 hover:text-white"
                >
                  إلغاء
                </Button>
              </div>

              {/* Canvas Area */}
              <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-950 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={320}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none w-full max-w-[600px] h-[320px]"
                />
              </div>

              {/* Canvas Actions */}
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCanvas}
                  className="rounded-xl text-xs border-slate-700 text-slate-300 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح اللوحة</span>
                </Button>

                <Button
                  size="sm"
                  onClick={saveCanvasAsImage}
                  className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد الرسم وإرساله للمحلل</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API KEY SETTINGS MODAL */}
      <AnimatePresence>
        {apiKeyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-500" />
                  <span>إعدادات مفتاح الذكاء الاصطناعي (Gemini Key)</span>
                </h3>
                <button onClick={() => setApiKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  مفتاح Google Gemini API الحالي:
                </label>
                <Input
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="أدخل مفتاح Google Gemini API هنا..."
                  className="font-mono text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-[11px] text-slate-400">
                  يتم حفظ المفتاح محلياً في متصفحك ويوفر وصولاً سريعاً لكافة نماذج الرؤية والصوت.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setApiKeyModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    geminiMultimodalService.setApiKey(apiKeyInput);
                    toast.info('جاري التحقق من المفتاح...');
                    const check = await geminiMultimodalService.testConnection();
                    if (check.ok) {
                      toast.success('تم تفعيل وحفظ المفتاح بنجاح! متصل بـ Gemini 2.5');
                      setConnectionStatus('connected');
                      setApiKeyModalOpen(false);
                    } else {
                      toast.error(`فشل الاتصال: ${check.message}`);
                    }
                  }}
                  className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  حفظ واختبار الاتصال
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MultimodalTutorHub;
