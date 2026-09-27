import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Send, 
  Loader2, 
  Brain, 
  Heart, 
  ExternalLink, 
  Wind, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw,
  Compass,
  Smile,
  Frown,
  Zap,
  BookmarkCheck,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  redirectTo?: string;
  redirectMessage?: string;
  suggestions?: Array<{
    type: string;
    title: string;
    url: string;
    icon: string;
  }>;
}

const moods = [
  { 
    id: 'anxious',
    emoji: '😰', 
    label: 'قلق وتوتر امتحانات', 
    desc: 'شعور بالضغط، تسارع نبضات، وخوف من النتيجة',
    color: 'from-amber-500 to-orange-600', 
    bgGradient: 'from-orange-950 via-slate-900 to-black',
    accent: '#f97316'
  },
  { 
    id: 'burnout',
    emoji: '😫', 
    label: 'إرهاق واستنزاف طاقة', 
    desc: 'تعب ذهني، صعوبة بالتركيز، وفقدان الشغف',
    color: 'from-purple-500 to-indigo-600', 
    bgGradient: 'from-purple-950 via-slate-900 to-black',
    accent: '#a855f7'
  },
  { 
    id: 'sad',
    emoji: '😔', 
    label: 'حزن أو عزلة', 
    desc: 'ضيق في الصدر، شعور بالوحدة، أو إحباط',
    color: 'from-blue-500 to-cyan-600', 
    bgGradient: 'from-blue-950 via-slate-900 to-black',
    accent: '#3b82f6'
  },
  { 
    id: 'angry',
    emoji: '😤', 
    label: 'غضب وانفعال', 
    desc: 'استفزاز سريع، تشتت، وشعور بعدم العدالة',
    color: 'from-red-500 to-rose-600', 
    bgGradient: 'from-red-950 via-slate-900 to-black',
    accent: '#ef4444'
  },
  { 
    id: 'calm',
    emoji: '😌', 
    label: 'هادئ ومستقر', 
    desc: 'ذهن صافٍ، رغبة بتنظيم الأفكار والأهداف',
    color: 'from-teal-500 to-emerald-600', 
    bgGradient: 'from-teal-950 via-slate-900 to-black',
    accent: '#14b8a6'
  },
  { 
    id: 'motivated',
    emoji: '🚀', 
    label: 'متحمس للإنجاز', 
    desc: 'طاقة عالية، رغبة بالتفوق وتخطي الحواجز',
    color: 'from-emerald-500 to-green-600', 
    bgGradient: 'from-emerald-950 via-slate-900 to-black',
    accent: '#10b981'
  }
];

const reframingCards = [
  {
    distorted: "أنا سأفشل حتماً في هذا الامتحان وسأخيب أمل أهلي",
    rational: "قلقي دليل على حرصي، لكن الامتحان يقيس تحصيلي المؤقت في مادة معينة فقط ولا يحدد قيمتي ولا مستقبلي كإنسان.",
    action: "خذ استراحة 10 دقائق، وقسم ما تبقى لمهام صغيرة مدتها 20 دقيقة."
  },
  {
    distorted: "كل زملائي يفهمون بسرعة وأنا الوحيد المتأخر",
    rational: "لكل عقل وتيرته الخاصة في الاستيعاب، والتعلم العميق البطيء يثبت في الذاكرة طويلة المدى أفضل من الحفظ السريع.",
    action: "استخدم نظام Spaced Repetition لتثبيت المعلومات خطوة بخطوة."
  },
  {
    distorted: "الوقت داهم والمنهاج تراكم، لا فائدة من البدء الآن",
    rational: "دراسة 20% من المفاهيم الأساسية تمنحك 80% من القدرة على الحل. أي جهد تبذله الآن أفضل بكثير من الاستسلام.",
    action: "ابدأ بأهم موضوع أساسي لمدة 15 دقيقة فقط بدون التفكير في بقية الكتاب."
  }
];

const groundingSteps = [
  { count: "5", label: "أشياء تراها بعينك الآن", desc: "انظر حولك ولاحظ 5 أشياء محددة (لون الجدار، القلم، النافذة...)" },
  { count: "4", label: "أشياء يمكنك لمسها", desc: "المس ملمس ملابسك، برودة الطاولة، كف يدك..." },
  { count: "3", label: "أصوات تسمعها الآن", desc: "ركز على صوت مروحة، تنفسك، أو صوت بعيد في الشارع..." },
  { count: "2", label: "روائح تستشعرها", desc: "رائحة الهواء، عطر ملابسك، أو قهوتك..." },
  { count: "1", label: "طعم في فمك", desc: "رشفة ماء بارد أو استشعار طعم لسانك للعودة للحظة الحاضرة." }
];

const quranicVerses = [
  {
    verse: "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾",
    surah: "سورة الرعد - آية 28",
    reflection: "الطمأنينة سكينة ربانية تنزل على قلبك حين تسلّم أمرك وتثق بأنك في رعاية خالقك."
  },
  {
    verse: "﴿ سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا ﴾",
    surah: "سورة الطلاق - آية 7",
    reflection: "الشدة لا تدوم، وكل ضيق دراسي أو نفسي يعقبه فرج وانشراح بقدر ما تحتسب وتصبر."
  },
  {
    verse: "﴿ وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا ﴾",
    surah: "سورة الطور - آية 48",
    reflection: "أنت لست وحدك، وجهدك وتعبك ودموعك كلها بعين الله ورحمته، وسيجزيك خيراً."
  }
];

const PsychologicalGuide: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Navigation steps: salah -> mood -> chat
  const [step, setStep] = useState<'salah' | 'mood' | 'chat'>('salah');
  const [selectedMood, setSelectedMood] = useState<string>('anxious');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Box Breathing Active State
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(true);

  // SOS Calming Drawer State
  const [activeSosTab, setActiveSosTab] = useState<'none' | 'grounding' | 'reframing' | 'quran'>('none');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Pre-screen auto transition after 3.5s if not clicked
  useEffect(() => {
    if (step === 'salah') {
      const timer = setTimeout(() => {
        setStep('mood');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Box Breathing Cycle Interval
  useEffect(() => {
    if (!isBreathingOpen || !isBreathingRunning) return;

    const interval = setInterval(() => {
      setBreathingSeconds(prev => {
        if (prev > 1) return prev - 1;
        
        // Transition phases: inhale (4s) -> hold1 (4s) -> exhale (4s) -> hold2 (4s)
        setBreathingPhase(current => {
          switch (current) {
            case 'inhale': return 'hold1';
            case 'hold1': return 'exhale';
            case 'exhale': return 'hold2';
            case 'hold2': return 'inhale';
          }
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingOpen, isBreathingRunning]);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setStep('chat');

    const moodGreetings: Record<string, { msg: string; suggestions?: any[] }> = {
      anxious: {
        msg: "أهلاً بك يا صديقي في مساحتك الآمنة 💙\n\nأشعر بالثقل الذي تحمله في صدرك بسبب قلق الامتحانات أو التوتر الدراسي. اعلم أن هذا القلق هو في الحقيقة دليل على حرصك ونبل غايتك، لكنه يحتاج إلى توجيه لطيف لا أن يسيطر عليك.\n\nخذ نفساً عميقاً... يمكنك الآن تجربة «التنفس الصندوقي 4-4-4-4» بالضغط على الزر العلوي، أو تفريغ ما يزعجك وسأرشدك خطوة بخطوة.",
        suggestions: [
          { type: 'tool', title: 'تمارين التنفس الصندوقي 4-4-4-4', url: '#breathing', icon: '🫁' },
          { type: 'link', title: 'نظام المراجعة الذكي Spaced Repetition', url: '/spaced-repetition', icon: '⏱️' },
          { type: 'link', title: 'بنك الألغاز الفكرية لتفريغ الذهن', url: '/subject-puzzles', icon: '🧩' }
        ]
      },
      burnout: {
        msg: "سلامٌ على قلبك المتعب 🌸\n\nالإرهاق الذهني ليس دليلاً على الفشل، بل هو إشارة واضحة من جسدك وعقلك بأنهما قدما أقصى ما لديهما ويحتاجان إلى وقفة رحمة واسترخاء.\n\nحدثني، ما الذي يستهلك طاقتك الآن؟ دعنا نرتب أولوياتك ونعيد شحن طاقتك بهدوء.",
        suggestions: [
          { type: 'link', title: 'منظم ومخطط الدراسة وجدول المذاكرة', url: '/study-organization', icon: '📅' },
          { type: 'link', title: 'المكتبة البصرية 3D لتعلم بصري مريح', url: '/visual-library', icon: '👁️' }
        ]
      },
      sad: {
        msg: "أنا هنا معك وبجانبك دائماً 🤍\n\nأحياناً تبدو الأيام رمادية وثقيلة، ومن حقك تماماً أن تشعر بالحزن دون أن تلوم نفسك. أنت إنسان تشعر وتتأثر، وهذا جزء من قوتك.\n\nإذا كنت ترغب بالحديث، فضفض لي بما يجول في خاطرك، كل ما تقوله هنا محاط بالسرية والاحتواء.",
        suggestions: [
          { type: 'tool', title: 'آيات السكينة والطمأنينة', url: '#quran', icon: '📖' },
          { type: 'link', title: 'منتدى مجتمع الطلبة للتفاعل الإيجابي', url: '/student-community-forum', icon: '💬' }
        ]
      },
      angry: {
        msg: "خذ نفساً عميقاً، واخرج الزفير ببطء 🕊️\n\nالغضب طاقة قوية تشتعل حين نشعر بضياع الجهد أو عدم العدالة. أنا أصغي إليك باهتمام تام... أفرغ كل شحنات الغضب هنا، وسنحول هذا الانفعال إلى تركيز بنّاء.",
        suggestions: [
          { type: 'tool', title: 'تقنية التأريض 5-4-3-2-1 لتهدئة الغضب', url: '#grounding', icon: '🛡️' }
        ]
      },
      calm: {
        msg: "ما أجمل هذا الصفاء والسكينة 🌿\n\nأرى أنك في حالة ذهنية ممتازة اليوم. هذه فرصة ذهبية لترتيب أهدافك الدراسية، بناء عادات إيجابية، والانطلاق نحو إنجاز نوعي.\n\nكيف يمكنني مساعدتك في توجيه هذا التركيز الرائع اليوم؟",
        suggestions: [
          { type: 'link', title: 'مسارات BTEC والمشاريع التطبيقية', url: '/btec', icon: '💻' },
          { type: 'link', title: 'المختبرات والمحاكاة 3D', url: '/experiments-section', icon: '🔬' }
        ]
      },
      motivated: {
        msg: "مرحباً بالشغف والطاقة المتوقدة! 🚀✨\n\nيسعدني جداً أن أراك بهذه الروح العالية! الحماس هو الوقود الذي يصنع المعجزات الأكاديمية.\n\nما هو التحدي الكبير الذي سنخوضه معاً اليوم؟ مسألة برمجية؟ محاكاة كمية؟ أم مشروع ريادي؟",
        suggestions: [
          { type: 'link', title: 'بنك ودوري الألغاز والتحديات', url: '/subject-puzzles', icon: '🏆' },
          { type: 'link', title: 'مختبر الروبوتات والذكاء الاصطناعي', url: '/robotics-section', icon: '🤖' }
        ]
      }
    };

    const target = moodGreetings[moodId] || moodGreetings.anxious;

    setMessages([
      {
        id: 'welcome-msg',
        role: 'ai',
        content: target.msg,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        suggestions: target.suggestions
      }
    ]);
  };

  // Local Cognitive Empathy Fallback Engine (Guaranteed 0-fail psychological response)
  const generateEmpatheticFallback = (userQuery: string, currentMood: string): { text: string; suggestions?: any[] } => {
    const q = userQuery.toLowerCase();
    
    // Check keywords
    if (q.includes('امتحان') || q.includes('امتحانات') || q.includes('توجيهي') || q.includes('خايف') || q.includes('خوف') || q.includes('معدل')) {
      return {
        text: `أسمعك بكل وضوح، وقلقك بشأن الامتحانات أو التوقعات شعور إنساني يمر به كل طالب طموح 💙\n\nإليك ثلاث حقائق علمية نفسية أرجو أن تضعها في قلبك:\n\n1. **قلق الأداء المعتدل مفيد، لكن القلق المفرط يشل الذاكرة العاملة**، لذلك هدفنا ليس إلغاء الخوف بل خفض شدته ليبقى في نطاق التركيز.\n2. **تقسيم المهام (Chunking)**: لا تفكر في الكتاب كاملاً. افتح فصلاً واحداً فقط واقرأ لمدة 20 دقيقة، ثم كافئ نفسك.\n3. **النوم والماء**: الدماغ يفرز هرمون الكورتيزول مع الجفاف وقلة النوم، مما يضاعف التوتر. اشرب كوب ماء بارد الآن.\n\nتذكر: أنت تبذل وسعك، والله لا يضيع أجر المحسنين. أنا هنا لأي استفسار آخر تريده.`,
        suggestions: [
          { type: 'tool', title: 'ابدأ تمرين التنفس الصندوقي 4-4-4-4', url: '#breathing', icon: '🫁' },
          { type: 'link', title: 'جدول مذاكرتك بمنظم الدراسة', url: '/study-organization', icon: '📅' }
        ]
      };
    }

    if (q.includes('تركيز') || q.includes('تشتت') || q.includes('نسيان') || q.includes('انسى') || q.includes('بنسی')) {
      return {
        text: `التشتت والنسيان ليسا علامة على ضعف في ذكائك على الإطلاق! عقولنا تتعرض لسيل من الإشعارات والمنبهات اليومية تجعل الدماغ في حالة تنبيه دائم 🧠\n\nلإعادة برمجة تركيزك اليوم:\n\n• **قاعدة الـ 5 دقائق**: قل لنفسك «سأجلس للدراسة 5 دقائق فقط وإذا لم استطع سأتوقف». 90% من الوقت ستواصل تلقائياً لأن أصعب خطوة هي البداية.\n• **أبعد الهاتف تماماً** خارج الغرفة وليس بجانبك.\n• **استخدم طريقة التكرار المتباعد**: مراجعة بطاقة المعلومات بعد 24 ساعة، ثم بعد 3 أيام، ثم أسبوع تنقلها للذاكرة الدائمة بنسبة 95%.\n\nهل تحب أن نحدد مادة معينة لتبدأ بها الآن؟`,
        suggestions: [
          { type: 'link', title: 'نظام المراجعة الذكي Spaced Repetition', url: '/spaced-repetition', icon: '⏱️' }
        ]
      };
    }

    if (q.includes('تعبان') || q.includes('ارهاق') || q.includes('فاشل') || q.includes('يئست') || q.includes('زهقت') || q.includes('مخنوق')) {
      return {
        text: `لا تقسُ على نفسك يا صديقي 🌸\n\nالكلمات التي تخاطب بها نفسك في لحظات الضعف تترك أثراً عميقاً في كيمياء دماغك. الشعور بالاختناق أو الإحباط رسالة مفادها: «توقف مؤقتاً والتقط أنفاسك»، وليس «أنت فاشل».\n\nأطلب منك الآن طلباً صغيراً:\n1. قف وابتعد عن الكتب والشاشات لمدة 15 دقيقة.\n2. اغسل وجهك بماء بارد منعش.\n3. تذكر إنجازاً قديماً ظننت يوماً أنك لن تتجاوزه وتجاوزته بفضل الله.\n\nأنا فخور بك لأنك تحاول رغم التعب، وموجود معك في كل خطوة.`,
        suggestions: [
          { type: 'tool', title: 'افتح حقيبة التأريض 5-4-3-2-1', url: '#grounding', icon: '🛡️' },
          { type: 'tool', title: 'آيات السكينة والاطمئنان', url: '#quran', icon: '📖' }
        ]
      };
    }

    // Default warm reflective response
    return {
      text: `أشكرك من القلب على مشاركتي هذه الكلمات الصادقة 💙\n\nكل فكرة أو شعور عبّرت عنه يستحق التقدير والاهتمام. عندما نتعلم كيف نسمي مشاعرنا بدقة، يفقد التوتر نصف قوته علينا.\n\nأنا معك لأساعدك على تفكيك هذه الأفكار وتحويلها إلى خطوات ملموسة وواقعية تمنحك الراحة والتركيز.\n\nما هي الخطوة الأولى الصغيرة التي تشعر أنك قادر على اتخاذها اليوم؟`,
      suggestions: [
        { type: 'tool', title: 'جلسة تنفس صندوقي هادئة', url: '#breathing', icon: '🫁' },
        { type: 'link', title: 'استكشف منصات التعلم الممتعة', url: '/education-section', icon: '🎓' }
      ]
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Invoke Edge Function with timeout protection
      const invokePromise = supabase.functions.invoke('psychological-guide-ai', {
        body: {
          message: userText,
          mood: selectedMood,
          conversationHistory
        }
      });

      // 6-second timeout race
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 6000)
      );

      const result: any = await Promise.race([invokePromise, timeoutPromise]);

      if (result.error || !result.data?.answer) {
        throw new Error(result.error?.message || 'Empty response');
      }

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        role: 'ai',
        content: result.data.answer,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        redirectTo: result.data.redirectTo,
        redirectMessage: result.data.redirectMessage,
        suggestions: result.data.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

    } catch (err) {
      console.warn('Psychological AI edge function fallback triggered:', err);
      
      // Seamless local empathetic engine response
      setTimeout(() => {
        const fallback = generateEmpatheticFallback(userText, selectedMood);
        const aiMessage: Message = {
          id: `${Date.now()}-ai-fallback`,
          role: 'ai',
          content: fallback.text,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          suggestions: fallback.suggestions
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 400);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentMoodData = moods.find(m => m.id === selectedMood) || moods[0];

  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b ${currentMoodData.bgGradient} text-white transition-colors duration-700 selection:bg-purple-500 selection:text-white`} dir="rtl">
      <SEO 
        title="مرشدك النفسي الذكي | واحة الدعم الوجداني والسكينة"
        description="مرشد نفسي ذكي متقدم يساعد الطلاب في تفريغ التوتر وقلق الامتحانات، ممارسة التنفس الصندوقي 4-4-4-4، وتقنيات التأريض المعرفي والسكينة."
        keywords="مرشد نفسي, دعم نفسي للطلاب, قلق الامتحانات, تنفس صندوقي, تأريض نفسي, ذروة العلم"
      />
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <StarField starCount={400} />
      </div>
      
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-5xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Button
            onClick={() => navigate('/ai-assistant-section')}
            variant="ghost"
            className="text-purple-300 hover:text-white hover:bg-purple-900/30 text-xs sm:text-sm font-semibold rounded-xl"
          >
            <ArrowRight className="w-4 h-4 ml-1.5" />
            مركز المساعدين الأذكياء
          </Button>

          {/* Calming Utilities Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setIsBreathingOpen(true);
                setIsBreathingRunning(true);
              }}
              variant="outline"
              size="sm"
              className="rounded-xl bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-900/60 text-xs font-bold flex items-center gap-1.5"
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>التنفس الصندوقي 4-4-4-4</span>
            </Button>

            <Button
              onClick={() => setActiveSosTab(activeSosTab === 'none' ? 'grounding' : 'none')}
              variant="outline"
              size="sm"
              className="rounded-xl bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>إسعاف الهلع SOS</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Multi-Step Flow */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Pre-screen Spiritual Reflection (صلِّ على النبي ﷺ) */}
          {step === 'salah' && (
            <motion.div
              key="salah"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex items-center justify-center py-10"
            >
              <Card className="p-8 sm:p-14 bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-purple-900/80 border-purple-500/30 backdrop-blur-2xl shadow-2xl max-w-2xl text-center space-y-6 rounded-3xl">
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center text-5xl shadow-xl"
                >
                  🤲
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white">
                    صلِّ على النبي ﷺ
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-300/80">
                    لحظة صفاء وسكون تُلقي بها هموم الدنيا خلف ظهرك
                  </p>
                </div>

                <div className="pt-6 border-t border-purple-400/20 space-y-2">
                  <p className="text-lg sm:text-2xl text-purple-100 font-bold leading-relaxed">
                    ﴿ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا ﴾
                  </p>
                  <p className="text-xs sm:text-sm text-purple-300/70">
                    سورة الكهف · آية 30
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setStep('mood')}
                    className="rounded-2xl px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-sm shadow-lg text-white"
                  >
                    متابعة إلى المرشد النفسي
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Emotional State Scanner (6 Moods) */}
          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center py-6"
            >
              <Card className="p-6 sm:p-10 bg-slate-900/80 border-slate-700/80 backdrop-blur-xl max-w-3xl w-full rounded-3xl shadow-2xl space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 mb-1">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    كيف تشعر في هذه اللحظة؟
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    اختر الحالة الوجدانية الأقرب لما يدور في صدرك الآن لنخصص لك الدعم والتوجيه المناسبين
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {moods.map((m, idx) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMoodSelect(m.id)}
                      className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${m.color} text-right border border-white/20 shadow-md hover:shadow-xl transition-all flex flex-col justify-between h-36`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl sm:text-4xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white/90">
                          اختيار
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-extrabold text-base sm:text-lg leading-tight mb-1">
                          {m.label}
                        </div>
                        <div className="text-white/80 text-[11px] leading-snug line-clamp-2">
                          {m.desc}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Full Psychological Chat Console */}
          {step === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-4"
            >
              {/* Interactive Box Breathing Modal / Overlay */}
              <AnimatePresence>
                {isBreathingOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-3xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-300">
                          تمرين التنفس الصندوقي (4-4-4-4 Box Breathing)
                        </span>
                      </div>
                      <Button
                        onClick={() => setIsBreathingOpen(false)}
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-slate-400 hover:text-white h-7 px-2"
                      >
                        إغلاق
                      </Button>
                    </div>

                    {/* Animated Breathing Orb */}
                    <div className="py-6 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{
                          scale: breathingPhase === 'inhale' ? 1.35 : breathingPhase === 'hold1' ? 1.35 : breathingPhase === 'exhale' ? 0.9 : 0.9,
                          borderColor: breathingPhase === 'inhale' ? '#38bdf8' : breathingPhase === 'hold1' ? '#a855f7' : breathingPhase === 'exhale' ? '#34d399' : '#94a3b8'
                        }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl bg-cyan-950/30"
                      >
                        <span className="text-4xl font-black text-white">{breathingSeconds}</span>
                        <span className="text-xs font-bold text-cyan-200 mt-1">
                          {breathingPhase === 'inhale' && 'شهيق عميق'}
                          {breathingPhase === 'hold1' && 'حبس النفس بهدوء'}
                          {breathingPhase === 'exhale' && 'زفير بطيء ومريح'}
                          {breathingPhase === 'hold2' && 'سكون واسترخاء'}
                        </span>
                      </motion.div>

                      <p className="text-xs text-slate-300 mt-4 max-w-md">
                        {breathingPhase === 'inhale' && 'املأ رئتيك بالهواء ببطء من أنفك مع تمدد البطن'}
                        {breathingPhase === 'hold1' && 'ابقَ هادئاً تماماً ولا تشد عضلات عنقك'}
                        {breathingPhase === 'exhale' && 'اخرج الهواء بهدوء وتدرج من فمك كأنك تطفئ شمعة'}
                        {breathingPhase === 'hold2' && 'استشعر خلو جسدك من التوتر قبل الدورة القادمة'}
                      </p>

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-cyan-500/40 text-xs text-cyan-300"
                        >
                          {isBreathingRunning ? <Pause className="w-3.5 h-3.5 ml-1" /> : <Play className="w-3.5 h-3.5 ml-1" />}
                          {isBreathingRunning ? 'إيقاف مؤقت' : 'استئناف'}
                        </Button>
                        <Button
                          onClick={() => {
                            setBreathingSeconds(4);
                            setBreathingPhase('inhale');
                          }}
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-700 text-xs text-slate-300"
                        >
                          <RotateCcw className="w-3.5 h-3.5 ml-1" />
                          إعادة البدء
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SOS Emergency Drawer Tabs */}
              <AnimatePresence>
                {activeSosTab !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span className="text-xs sm:text-sm font-bold text-rose-200">
                          حقيبة الإسعاف النفسي السريع (SOS Toolkit)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveSosTab('grounding')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'grounding' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          التأريض 5-4-3-2-1
                        </button>
                        <button
                          onClick={() => setActiveSosTab('reframing')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'reframing' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          إعادة التأطير
                        </button>
                        <button
                          onClick={() => setActiveSosTab('quran')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'quran' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          آيات السكينة
                        </button>
                        <Button
                          onClick={() => setActiveSosTab('none')}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-400"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Grounding Tab Content */}
                    {activeSosTab === 'grounding' && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs text-slate-300">
                          تقنية معتمدة لقطع حلقة الهلع وإعادة عقلك للحظة الحاضرة:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          {groundingSteps.map((gs, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right space-y-1">
                              <span className="text-lg font-black text-rose-400">{gs.count}</span>
                              <div className="text-xs font-bold text-white">{gs.label}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{gs.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reframing Tab Content */}
                    {activeSosTab === 'reframing' && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-300">
                          حوّل الأفكار التلقائية السامة إلى حقائق عقلانية متوازنة:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {reframingCards.map((rc, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right space-y-2">
                              <div className="text-[11px] text-red-300 line-through">
                                ❌ «{rc.distorted}»
                              </div>
                              <div className="text-xs font-bold text-emerald-300">
                                ✔ «{rc.rational}»
                              </div>
                              <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1">
                                خطوة فورية: {rc.action}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quran Tab Content (Pure voice recitation without music) */}
                    {activeSosTab === 'quran' && (
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {quranicVerses.map((qv, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-right space-y-2">
                              <div className="text-sm font-bold text-purple-200">
                                {qv.verse}
                              </div>
                              <div className="text-[11px] text-purple-400 font-semibold">
                                {qv.surah}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {qv.reflection}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Message Window */}
              <Card className="flex-1 p-4 sm:p-6 bg-slate-900/80 border-slate-800 backdrop-blur-xl flex flex-col justify-between rounded-3xl min-h-[500px]">
                {/* Header Profile */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        مرشدك النفسي الذكي
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                          نشط ومتصل
                        </Badge>
                      </h2>
                      <div className="text-xs text-slate-400">
                        مساحة آمنة وموجهة لدعمك الدراسي والعاطفي
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('mood')}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs text-purple-300 hover:text-white"
                  >
                    تغيير الحالة ({currentMoodData.emoji} {currentMoodData.label})
                  </Button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1 max-h-[550px] scrollbar-thin scrollbar-thumb-purple-500/40">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-purple-600/30 border border-purple-500/50 text-white rounded-tr-none'
                              : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-md'
                          }`}
                        >
                          <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                            {message.content}
                          </div>

                          {/* Direct Platform Link Action */}
                          {message.redirectTo && (
                            <Button
                              onClick={() => navigate(message.redirectTo!)}
                              className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs sm:text-sm font-bold text-white rounded-xl"
                              size="sm"
                            >
                              {message.redirectMessage || 'الانتقال للقسم المقترح'}
                              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                            </Button>
                          )}

                          {/* Suggested Resources Links */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                              <div className="text-[11px] font-bold text-purple-300">
                                خطوات مقترحة لأجلك:
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {message.suggestions.map((sug, sIdx) => {
                                  if (sug.url.startsWith('#')) {
                                    return (
                                      <button
                                        key={sIdx}
                                        onClick={() => {
                                          if (sug.url === '#breathing') setIsBreathingOpen(true);
                                          if (sug.url === '#grounding') setActiveSosTab('grounding');
                                          if (sug.url === '#quran') setActiveSosTab('quran');
                                        }}
                                        className="flex items-center justify-between p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-right transition-colors text-xs font-semibold text-purple-200"
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <span>{sug.icon}</span>
                                          <span>{sug.title}</span>
                                        </span>
                                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                                      </button>
                                    );
                                  }

                                  return (
                                    <button
                                      key={sIdx}
                                      onClick={() => navigate(sug.url)}
                                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 text-right transition-colors text-xs font-semibold text-slate-300"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <span>{sug.icon}</span>
                                        <span>{sug.title}</span>
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 text-left mt-2">
                            {message.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-xs text-slate-300">المرشد النفسي يكتب رداً دافئاً لأجلك...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-end gap-2">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="تحدث بحرية عما تشعر به، أو اسأل عن كيفية التعامل مع الضغط..."
                    disabled={isLoading}
                    className="flex-1 min-h-[48px] max-h-32 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-400 rounded-2xl resize-none text-xs sm:text-sm p-3 focus:border-purple-500"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="h-12 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0 shadow-lg"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                    <span className="hidden sm:inline">إرسال</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default PsychologicalGuide;
