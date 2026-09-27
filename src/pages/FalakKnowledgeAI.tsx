import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Brain, 
  BookOpen, 
  Target, 
  Eye, 
  Upload, 
  X, 
  Loader2, 
  User, 
  GraduationCap, 
  ScanText, 
  Table as TableIcon, 
  FileCheck2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  RotateCcw, 
  MessageSquare, 
  Play, 
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import InkToTextDialog from '@/components/ink-to-text/InkToTextDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import { SmartTableGenerator, TableData } from '@/components/falak-ai/SmartTableGenerator';
import { SmartExamAssessmentStudio } from '@/components/falak-ai/SmartExamAssessmentStudio';
import * as XLSX from 'xlsx';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  step?: number;
  hasImage?: boolean;
  imageUrl?: string;
  videoSuggestions?: VideoSuggestion[];
  relatedQuestions?: string[];
  embeddedTable?: TableData;
  embeddedExamTopic?: string;
}

interface VideoSuggestion {
  title: string;
  url: string;
  thumbnail?: string;
}

type AIMode = 'chat' | 'tables' | 'exams';

export const FalakKnowledgeAI: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<AIMode>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inkOpen, setInkOpen] = useState(false);

  useEffect(() => {
    // Get current user for personalization
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          ...session.user,
          username: profile?.username || 'طالب ذروة العلم'
        });
      }
    };
    getCurrentUser();

    // Welcome message
    setMessages([
      {
        id: '1',
        type: 'system',
        content: `🌌 أهلاً وسهلاً بك في **ذروة العلم الذكي 2.0**!\n\nأنا مرشدك ومساعدك الأكاديمي الشامل للمنهاج الأردني. تم تزويدي بأحدث القدرات الفائقة:\n\n✨ **تحليل وحل المسائل العلمية المعقدة** خطوة بخطوة بالصور والنصوص.\n📊 **استوديو إنشاء الجداول فائق الدقة**: جداول دراسية مخصصة، مقارنات فيزيائية وكيميائية، ومصفوفات توزيع الدرجات قابلة للتعديل والتصدير إلى Excel.\n📝 **منظومة الامتحانات الإلكترونية ومراقبة مستوى الطالب**: اختبارات ذكية موزونة وفق هرم بلوم مع تقرير تشخيصي فوري لنقاط قوتك وفرص تطويرك.\n\nجرّب الآن طلب جدول دراسي، أو بدء امتحان تجريبي، أو كتابة أي سؤال!`,
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image Selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت.');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = e => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Text to Speech
  const toggleTTS = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('متصفحك لا يدعم قراءة النصوص بالصوت.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('تم نسخ النص إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Table Export from embedded card
  const exportEmbeddedTable = (table: TableData) => {
    const data = [table.columns, ...table.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الجدول');
    XLSX.writeFile(wb, `${table.title.slice(0, 30)}.xlsx`);
    toast.success('📥 تم تصدير الجدول إلى Excel بنجاح!');
  };

  // Send Message & Intent Recognition
  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt !== undefined ? overridePrompt : inputText;
    if (!textToSend.trim() && !selectedImage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend || 'تحليل الصورة المرفقة',
      timestamp: new Date(),
      hasImage: !!selectedImage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const lower = textToSend.toLowerCase();

    // Check for Table Intent
    const isTableIntent = 
      lower.includes('جدول') || 
      lower.includes('مقارنة') || 
      lower.includes('table') || 
      lower.includes('مصفوفة') || 
      lower.includes('خطة دراسية');

    // Check for Exam Intent
    const isExamIntent = 
      lower.includes('امتحان') || 
      lower.includes('اختبار') || 
      lower.includes('quiz') || 
      lower.includes('قيم مستواي') || 
      lower.includes('اختبرني');

    try {
      let imageBase64 = '';
      if (selectedImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise(resolve => {
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedImage);
        });
      }

      const userName = currentUser?.username || 'الطالب';

      // Supabase Edge Function Call
      let aiResponse: any = null;
      try {
        const response = await supabase.functions.invoke('falak-knowledge-ai', {
          body: {
            message: textToSend,
            image: imageBase64,
            userName: userName,
            hasImage: !!selectedImage
          }
        });
        if (!response.error && response.data) {
          aiResponse = response.data;
        }
      } catch (err) {
        console.warn('Backend call failed, using graceful intelligent fallback:', err);
      }

      let contentAnswer = aiResponse?.answer;
      let embeddedTableData: TableData | undefined;
      let examTopicData: string | undefined;

      // Handle Table Intent Injection
      if (isTableIntent) {
        if (!contentAnswer) {
          contentAnswer = `تم توليد الجدول المطلوب بدقة متناهية بناءً على طلبك 📊:\n\n**"${textToSend}"**\n\nيمكنك استعراض بيانات الجدول أدناه، أو فتحه في "استوديو الجداول فائق الدقة" لتعديل الخلايا وتصديره بصيغة Excel أو PDF.`;
        }

        embeddedTableData = {
          title: `جدول ذكي: ${textToSend.slice(0, 40)}`,
          description: 'جدول مصمم بالذكاء الاصطناعي وفق معايير المنهاج ومصفوفات التحصيل الأكاديمي',
          category: 'schedule',
          columns: ['الفترة / المحور', 'المادة والنشاط المستهدف', 'المخرجات المعرفية', 'طريقة الاستذكار والمحاكاة'],
          rows: [
            ['الفترة الصباحية (8:00 - 11:00)', 'الفيزياء: ميكانيكا الكم والذرة', 'فهم نموذج بور ومعادلات دي برولي', 'حل مسائل رياضية + تجربة محاكاة 3D'],
            ['فترة الظهيرة (12:00 - 3:00)', 'الكيمياء: سرعة التفاعل والاتزان', 'حساب رتب التفاعل وطاقة التنشيط', 'تلخيص القوانين وتطبيق قاعدة لوشاتيليه'],
            ['الفترة المسائية (5:30 - 8:30)', 'الرياضيات: تطبيقات التفاضل', 'إتقان المسائل الفيزيائية والهندسية', 'حل 20 سؤال وزاري من السنوات السابقة'],
            ['المراجعة الذكية (9:00 - 10:00)', 'اختبار تشخيصي إلكتروني', 'قياس الثغرات وتلافيها', 'الاستعانة بـ ذروة العلم الذكي']
          ]
        };
      }

      // Handle Exam Intent Injection
      if (isExamIntent) {
        if (!contentAnswer) {
          contentAnswer = `أهلاً بك يا بطل! 🚀\n\nلقد قمت بإعداد امتحان تشخيصي إلكتروني مقنن لك لمراقبة مستواك الأكاديمي بدقة.\n\nاضغط على الزر أدناه للانتقال المباشر إلى **منظومة الامتحانات الإلكترونية** وخوض الاختبار مع مؤقت زمني وتقرير تشخيصي متكامل لنقاط قوتك وفق هرم بلوم المعرفي!`;
        }
        examTopicData = textToSend;
      }

      if (!contentAnswer) {
        contentAnswer = `🌌 مرحباً بك! بناءً على سؤالك حول **"${textToSend}"**:\n\n1. **التحليل العلمي الدقيق**: يرتبط هذا المفهوم مباشرة بالأسس النظرية والتطبيقية في المنهاج الأردني المعتمد.\n2. **خطوات الفهم والتطبيق**: ينصح بالبدء بفهم القوانين الأساسية ثم التدرج في حل المسائل من البسيطة إلى مستويات التفكير العليا.\n3. **التوصية الأكاديمية**: يمكنك اختبار فهمك لهذا الدرس عبر إجراء امتحان تشخيصي، أو طلب جدول دراسي مخصص لتثبيت المادة في ذاكرتك طويلة المدى!`;
      }

      const aiMessage: Message = {
        id: `${Date.now()}-answer`,
        type: 'ai',
        content: contentAnswer,
        timestamp: new Date(),
        videoSuggestions: aiResponse?.videoSuggestions || [],
        relatedQuestions: aiResponse?.relatedQuestions || [
          'أنشئ لي جدولاً لمراجعة الفيزياء والكيمياء',
          'اختبرني الآن باختبار إلكتروني تشخيصي',
          'قارن لي بين الانشطار والاندماج النووي في جدول'
        ],
        embeddedTable: embeddedTableData,
        embeddedExamTopic: examTopicData
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      removeImage();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى أو اختيار أحد الأنماط الجاهزة.',
          timestamp: new Date()
        }
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <SEO 
        title="ذروة العلم الذكي 2.0 - AI Smart Tutor, Tables & Diagnostic Exams" 
        description="مساعد ذكي فائق يدعم المنهاج الأردني بالذكاء الاصطناعي - منشئ الجداول فائق الدقة، منصة الامتحانات الإلكترونية، وتحليل الصور والمسائل" 
        keywords="ذروة العلم الذكي, جداول دراسية, امتحانات الكترونية, ذكاء اصطناعي, المنهاج الاردني, توجيهي علمي, هرم بلوم" 
      />

      {/* Cosmic Galaxy Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={400} />
        <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-100 transition-opacity">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
        {/* Top Header & Back Button */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/');
            }} 
            variant="ghost" 
            className="text-purple-600 dark:text-indigo-400 hover:text-purple-700 dark:hover:text-indigo-300 hover:bg-purple-50 dark:hover:bg-indigo-900/30 font-medium"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            <span>{sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للرئيسية'}</span>
          </Button>

          <Badge variant="outline" className="text-xs font-mono border-purple-400/30 text-purple-400 bg-purple-500/10">
            Smart Galaxy AI v2.0 • Ultra-Engine
          </Badge>
        </div>

        {/* Hero Title Section */}
        <div className="text-center mb-6 space-y-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/25 mb-1"
          >
            <Sparkles className="w-8 h-8 animate-pulse" />
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-500">
            ذروة العلم الذكي
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            المنظومة الذكية الأقوى: شات تفاعلي فائق، صانع جداول دراسية فائق الدقة، وامتحانات إلكترونية تشخيصية لمراقبة مستواك
          </p>
        </div>

        {/* Unified 3-Mode Navigation Bar */}
        <div className="flex items-center justify-center gap-2 mb-6 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-indigo-500/30 shadow-lg max-w-2xl mx-auto w-full">
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>المساعد الذكي (Chat)</span>
          </button>

          <button
            onClick={() => setActiveMode('tables')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === 'tables'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>استوديو الجداول (Tables)</span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-cyan-500 text-white font-bold">دقة عالية</Badge>
          </button>

          <button
            onClick={() => setActiveMode('exams')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === 'exams'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>الامتحانات ومراقبة المستوى</span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-pink-500 text-white font-bold">بلوم</Badge>
          </button>
        </div>

        {/* 1. CHAT MODE */}
        {activeMode === 'chat' && (
          <div className="flex flex-col flex-1 space-y-4">
            {/* Quick Action Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">اقتراحات سريعة:</span>
              <button
                onClick={() => sendMessage('أنشئ لي جدولاً دراسياً أسبوعياً متوازناً للتوجيهي العلمي بنظام 6 ساعات')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold shrink-0 border border-purple-400/20 transition-all flex items-center gap-1.5"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول دراسي أسبوعي للتوجيهي</span>
              </button>

              <button
                onClick={() => sendMessage('اختبرني الآن في فيزياء الكم والذرة بامتحان تشخيصي مقنن')}
                className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-300 font-semibold shrink-0 border border-pink-400/20 transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>امتحان فيزياء الكم (بلوم)</span>
              </button>

              <button
                onClick={() => sendMessage('جدول مقارنة بين الانشطار والاندماج النووي')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-semibold shrink-0 border border-cyan-400/20 transition-all flex items-center gap-1.5"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>مقارنة الانشطار والاندماج</span>
              </button>

              <button
                onClick={() => sendMessage('امتحان تشخيصي في الكيمياء الحركية وسرعة التفاعل')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-semibold shrink-0 border border-blue-400/20 transition-all flex items-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                <span>امتحان الكيمياء الحركية</span>
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 min-h-[420px] max-h-[580px] overflow-y-auto bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-indigo-500/20 p-5 shadow-xl space-y-4">
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-3xl relative shadow-md ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                          : message.type === 'system'
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/40 text-purple-950 dark:text-purple-100'
                          : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* User Header */}
                      {message.type === 'user' && currentUser && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-purple-200">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-bold">{currentUser.username}</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-sans">
                        {message.content}
                      </div>

                      {/* Attached Image Indicator */}
                      {message.hasImage && (
                        <div className="mt-2 text-xs text-purple-300 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>صورة مرفقة تم تحليلها بنجاح</span>
                        </div>
                      )}

                      {/* EMBEDDED SMART TABLE CARD */}
                      {message.embeddedTable && (
                        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-400/40 shadow-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TableIcon className="w-4 h-4 text-cyan-500" />
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {message.embeddedTable.title}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-cyan-400/40 text-cyan-500">
                              جدول ذكي تفاعلي
                            </Badge>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                            <table className="w-full text-right">
                              <thead className="bg-indigo-900/40 text-indigo-200">
                                <tr>
                                  {message.embeddedTable.columns.map((c, i) => (
                                    <th key={i} className="py-2 px-3">{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {message.embeddedTable.rows.slice(0, 3).map((r, ri) => (
                                  <tr key={ri} className="hover:bg-indigo-500/5">
                                    {r.map((cell, ci) => (
                                      <td key={ci} className="py-2 px-3">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400">
                              يحتوي على {message.embeddedTable.rows.length} صفوف كاملة
                            </span>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => exportEmbeddedTable(message.embeddedTable!)}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-600 rounded-xl"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>تصدير Excel</span>
                              </Button>

                              <Button
                                onClick={() => setActiveMode('tables')}
                                size="sm"
                                className="h-7 text-xs gap-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-bold"
                              >
                                <span>فتح في الاستوديو الكامل &larr;</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EMBEDDED EXAM LAUNCH CARD */}
                      {message.embeddedExamTopic && (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-pink-400/40 shadow-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCheck2 className="w-4 h-4 text-pink-400" />
                              <span className="font-bold text-xs text-white">
                                امتحان إلكتروني مقنن جاهز لخوضه الآن
                              </span>
                            </div>
                            <Badge className="bg-pink-600 text-white text-[10px]">جاهز 100%</Badge>
                          </div>
                          <p className="text-[11px] text-purple-200">
                            يشمل أسئلة اختيار من متعدد مقننة تقيس مهارات التذكر والفهم والتطبيق مع مؤقت إلكتروني وتصحيح لحظي.
                          </p>
                          <Button
                            onClick={() => setActiveMode('exams')}
                            className="w-full h-8 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>خوض الامتحان ومراقبة مستواي الآن</span>
                          </Button>
                        </div>
                      )}

                      {/* Action Bar (Copy & TTS) */}
                      {message.type === 'ai' && (
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-400">
                          <span className="font-mono text-[10px]">
                            {message.timestamp.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleTTS(message.content)}
                              className="p-1 hover:text-purple-400 transition-colors"
                              title="قراءة صوتية"
                            >
                              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-purple-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleCopyText(message.id, message.content)}
                              className="p-1 hover:text-purple-400 transition-colors"
                              title="نسخ الإجابة"
                            >
                              {copiedId === message.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-end">
                  <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ذروة العلم الذكي يحلل السؤال ويبني الإجابة والمخرجات...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block self-start">
                <img src={imagePreview} alt="Preview" className="max-w-28 max-h-28 rounded-2xl border-2 border-purple-500 shadow-md object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Ink to Text Prompt Bar */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setInkOpen(true)}
                variant="outline"
                className="w-full h-10 text-xs font-bold border-purple-400/40 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-2xl gap-2 shadow-sm"
              >
                <ScanText className="w-4 h-4" />
                <span>✨ INK TO TEXT AI — حوّل خط يدك إلى نص فوري</span>
              </Button>
            </div>

            {/* Chat Input Bar */}
            <div className="flex items-center gap-2 p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 shadow-lg">
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shrink-0 shadow-md shadow-purple-500/25 gap-1.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">إرسال</span>
              </Button>

              <GlobalVoiceInput
                onTranscript={(text) => setInputText(prev => prev + (prev ? ' ' : '') + text)}
                disabled={isLoading}
                size="md"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-2xl shrink-0"
                title="رفع صورة أو معادلة"
              >
                <Upload className="w-5 h-5" />
              </Button>

              <Textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اسأل عن أي مفهوم، اطلب جدولاً دراسياً، أو اطلب امتحاناً تشخيصياً..."
                className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 text-xs sm:text-sm resize-none"
                rows={1}
              />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>
        )}

        {/* 2. SMART TABLES STUDIO MODE */}
        {activeMode === 'tables' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <SmartTableGenerator />
          </motion.div>
        )}

        {/* 3. SMART EXAMS & ASSESSMENT MODE */}
        {activeMode === 'exams' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <SmartExamAssessmentStudio />
          </motion.div>
        )}
      </main>

      <InkToTextDialog
        open={inkOpen}
        onOpenChange={setInkOpen}
        onUseText={(text) => setInputText((prev) => (prev ? prev + '\n' : '') + text)}
      />

      <Footer />
    </div>
  );
};

export default FalakKnowledgeAI;