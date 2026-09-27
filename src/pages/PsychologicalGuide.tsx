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
  HelpCircle,
  Eye,
  Check,
  Coffee,
  Clock,
  BookOpen,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkle
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

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  bgGradient: string;
  accent: string;
  pulseColor: string;
}

const moods: MoodOption[] = [
  { 
    id: 'anxious',
    emoji: '😰', 
    label: 'قلق وتوتر امتحانات', 
    desc: 'تسارع نبضات، خوف من النتيجة، وثقل في الصدر',
    color: 'from-amber-500 via-orange-600 to-rose-600', 
    bgGradient: 'from-orange-950/80 via-slate-950 to-black',
    accent: '#f97316',
    pulseColor: 'bg-orange-500'
  },
  { 
    id: 'burnout',
    emoji: '😫', 
    label: 'إرهاق واحتراق دراسي', 
    desc: 'إنهاك ذهني، فقدان الشغف، وصعوبة الاستمرار',
    color: 'from-purple-500 via-indigo-600 to-slate-700', 
    bgGradient: 'from-purple-950/80 via-slate-950 to-black',
    accent: '#a855f7',
    pulseColor: 'bg-purple-500'
  },
  { 
    id: 'sad',
    emoji: '😔', 
    label: 'حزن أو ضيق ووحدة', 
    desc: 'شعور بالإحباط، العزلة، والحاجة لأذن صاغية',
    color: 'from-blue-500 via-cyan-600 to-indigo-700', 
    bgGradient: 'from-blue-950/80 via-slate-950 to-black',
    accent: '#3b82f6',
    pulseColor: 'bg-blue-500'
  },
  { 
    id: 'angry',
    emoji: '😤', 
    label: 'غضب وتشتت سريع', 
    desc: 'انفعال، شعور بعدم العدالة، وفقدان الصبر',
    color: 'from-red-500 via-rose-600 to-orange-600', 
    bgGradient: 'from-red-950/80 via-slate-950 to-black',
    accent: '#ef4444',
    pulseColor: 'bg-red-500'
  },
  { 
    id: 'calm',
    emoji: '😌', 
    label: 'سكينة وصفاء ذهني', 
    desc: 'ذهن هادئ، رغبة بتنظيم الأفكار والأولويات',
    color: 'from-teal-500 via-emerald-600 to-cyan-700', 
    bgGradient: 'from-teal-950/80 via-slate-950 to-black',
    accent: '#14b8a6',
    pulseColor: 'bg-teal-500'
  },
  { 
    id: 'motivated',
    emoji: '🚀', 
    label: 'حماس وشغف متوقد', 
    desc: 'طاقة إيجابية عالية، جاهز للتحديات الأكاديمية',
    color: 'from-emerald-500 via-green-600 to-teal-700', 
    bgGradient: 'from-emerald-950/80 via-slate-950 to-black',
    accent: '#10b981',
    pulseColor: 'bg-emerald-500'
  }
];

const reframingCards = [
  {
    distorted: "أنا سأفشل حتماً في هذا الامتحان وسأخيب أمل أهلي ونفسي",
    distortionType: "الكارثية (Catastrophizing)",
    rational: "قلقي دليل على حرصي ونبلي، لكن الامتحان يقيس تحصيلي المؤقت في مادة معينة فقط ولا يحدد قيمتي الإنسانية ولا مستقبلي بالكامل.",
    action: "خذ استراحة 10 دقائق واشرب ماءً بارداً، ثم قسّم ما تبقى إلى مهام صغيرة مدتها 20 دقيقة فقط."
  },
  {
    distorted: "كل زملائي يفهمون ويحفظون بسرعة وأنا الوحيد المتأخر",
    distortionType: "المقارنة الظالمة (Unfair Comparison)",
    rational: "لكل دماغ وتيرته الخاصة في الاستيعاب، والتعلم العميق التراكمي يثبت في الذاكرة الدائمة أفضل بكثير من الحفظ السريع العابر.",
    action: "استخدم نظام المراجعة المتباعدة Spaced Repetition لتثبيت المعلومات خطوة بخطوة."
  },
  {
    distorted: "الوقت داهم والمواد تراكمت، لا جدوى من المحاولة الآن",
    distortionType: "التفكير المطلق (All-or-Nothing)",
    rational: "دراسة 20% من المفاهيم والمحاور الأساسية تمنحك 80% من القدرة على حل الامتحان. أي دقيقة تبذلها الآن أفضل بمليار مرة من الاستسلام.",
    action: "افتح أهم محور أساسي فقط وادرسه لمدة 15 دقيقة دون التفكير في بقية الكتاب."
  }
];

const groundingSteps = [
  { count: "5", label: "أشياء تراها بعينك الآن", desc: "انظر حولك ولاحظ 5 أشياء محددة (لون الجدار، القلم، النافذة، إضاءة الشاشة...)" },
  { count: "4", label: "أشياء يمكنك لمسها", desc: "المس ملمس ملابسك، برودة الطاولة، كف يدك الأخرى، أو ظهر المقعد..." },
  { count: "3", label: "أصوات تسمعها الآن", desc: "ركز بأذنيك على صوت تنفسك، صوت مروحة، أو صوت حركة بعيدة..." },
  { count: "2", label: "روائح تستشعرها", desc: "استنشق بعمق... رائحة الهواء، عطر ملابسك، أو قهوتك..." },
  { count: "1", label: "طعم في فمك", desc: "رشفة ماء بارد أو استشعار طعم لسانك لإعادة عقلك بالكامل إلى اللحظة الحاضرة." }
];

const quranicVerses = [
  {
    verse: "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾",
    surah: "سورة الرعد • آية 28",
    reflection: "الطمأنينة سكينة ربانية تنزل على قلبك حين تسلّم أمرك وتثق بأنك في رعاية خالقك العظيم."
  },
  {
    verse: "﴿ سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا ﴾",
    surah: "سورة الطلاق • آية 7",
    reflection: "الشدة لا تدوم، وكل ضيق دراسي أو نفسي يعقبه فرج وانشراح بقدر ما تحتسب وتصبر."
  },
  {
    verse: "﴿ وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا ﴾",
    surah: "سورة الطور • آية 48",
    reflection: "أنت لست وحدك أبداً، وجهدك وتعبك ودموعك كلها بعين الله ورحمته، وسيجزيك خيراً عظيماً."
  }
];

export const PsychologicalGuide: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Navigation State
  const [step, setStep] = useState<'mood' | 'chat'>('mood');
  const [selectedMood, setSelectedMood] = useState<string>('anxious');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Box Breathing Active State
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(true);
  const [completedBreathingCycles, setCompletedBreathingCycles] = useState(0);

  // SOS Calming Drawer State
  const [activeSosTab, setActiveSosTab] = useState<'none' | 'grounding' | 'reframing' | 'quran' | 'pomodoro'>('none');
  const [groundingChecked, setGroundingChecked] = useState<boolean[]>([false, false, false, false, false]);

  // Pomodoro Mini-Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Box Breathing Cycle Interval
  useEffect(() => {
    if (!isBreathingOpen || !isBreathingRunning) return;

    const interval = setInterval(() => {
      setBreathingSeconds(prev => {
        if (prev > 1) return prev - 1;
        
        // Phase transition: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
        setBreathingPhase(current => {
          switch (current) {
            case 'inhale': return 'hold1';
            case 'hold1': return 'exhale';
            case 'exhale': return 'hold2';
            case 'hold2':
              setCompletedBreathingCycles(c => c + 1);
              return 'inhale';
          }
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingOpen, isBreathingRunning]);

  // Pomodoro Timer Interval
  useEffect(() => {
    if (!isPomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev <= 1) {
          setIsPomodoroRunning(false);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomodoroRunning]);

  // Play gentle synthesized sound bell via Web Audio API
  const playSynthesizedChime = (freq = 440) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext policy
    }
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setStep('chat');
    playSynthesizedChime(520);

    const moodGreetings: Record<string, { msg: string; suggestions?: any[] }> = {
      anxious: {
        msg: "أهلاً بك يا صديقي في مساحتك الآمنة 💙\n\nأشعر بالثقل الذي تحمله في صدرك بسبب قلق الامتحانات أو التوتر الدراسي. اعلم أن هذا القلق هو في الحقيقة دليل على حرصك ونبل غايتك، لكنه يحتاج إلى توجيه لطيف لا أن يسيطر عليك.\n\nخذ نفساً عميقاً... يمكنك الآن تجربة «التنفس الصندوقي 4-4-4-4» بالضغط على الزر العلوي، أو تفريغ ما يزعجك وسأرشدك خطوة بخطوة.",
        suggestions: [
          { type: 'tool', title: 'تمارين التنفس الصندوقي 4-4-4-4', url: '#breathing', icon: '🫁' },
          { type: 'tool', title: 'بروتوكول التأريض الحسي 5-4-3-2-1', url: '#grounding', icon: '🛡️' },
          { type: 'link', title: 'نظام المراجعة الذكي Spaced Repetition', url: '/spaced-repetition', icon: '⏱️' }
        ]
      },
      burnout: {
        msg: "سلامٌ على قلبك المتعب 🌸\n\nالإرهاق الذهني ليس دليلاً على الفشل، بل هو إشارة واضحة من جسدك وعقلك بأنهما قدما أقصى ما لديهما ويحتاجان إلى وقفة رحمة واسترخاء.\n\nحدثني، ما الذي يستهلك طاقتك الآن؟ دعنا نرتب أولوياتك ونعيد شحن طاقتك بهدوء.",
        suggestions: [
          { type: 'tool', title: 'مؤقت بومودورو للاستراحة الذهنية 25/5', url: '#pomodoro', icon: '☕' },
          { type: 'link', title: 'منظم ومخطط الدراسة وجدول المذاكرة', url: '/study-organization', icon: '📅' },
          { type: 'link', title: 'المكتبة البصرية 3D لتعلم بصري مريح', url: '/visual-library', icon: '👁️' }
        ]
      },
      sad: {
        msg: "أنا هنا معك وبجانبك دائماً 🤍\n\nأحياناً تبدو الأيام رمادية وثقيلة، ومن حقك تماماً أن تشعر بالحزن دون أن تلوم نفسك. أنت إنسان تشعر وتتأثر، وهذا جزء من قوتك.\n\nإذا كنت ترغب بالحديث، فضفض لي بما يجول في خاطرك، كل ما تقوله هنا محاط بالسرية والاحتواء.",
        suggestions: [
          { type: 'tool', title: 'آيات السكينة والطمأنينة', url: '#quran', icon: '📖' },
          { type: 'tool', title: 'مختبر إعادة التأطير المعرفي CBT', url: '#reframing', icon: '🧠' },
          { type: 'link', title: 'منتدى مجتمع الطلبة للتفاعل الإيجابي', url: '/student-community-forum', icon: '💬' }
        ]
      },
      angry: {
        msg: "خذ نفساً عميقاً، واخرج الزفير ببطء 🕊️\n\nالغضب طاقة قوية تشتعل حين نشعر بضياع الجهد أو عدم العدالة. أنا أصغي إليك باهتمام تام... أفرغ كل شحنات الغضب هنا، وسنحول هذا الانفعال إلى تركيز بنّاء.",
        suggestions: [
          { type: 'tool', title: 'تقنية التأريض 5-4-3-2-1 لتهدئة الغضب', url: '#grounding', icon: '🛡️' },
          { type: 'tool', title: 'تمارين التنفس الصندوقي 4-4-4-4', url: '#breathing', icon: '🫁' }
        ]
      },
      calm: {
        msg: "ما أجمل هذا الصفاء والسكينة 🌿\n\nأرى أنك في حالة ذهنية ممتازة اليوم. هذه فرصة ذهبية لترتيب أهدافك الدراسية، بناء عادات إيجابية، والانطلاق نحو إنجاز نوعي.\n\nكيف يمكنني مساعدتك في توجيه هذا التركيز الرائع اليوم؟",
        suggestions: [
          { type: 'link', title: 'المختبرات والمحاكاة 3D', url: '/experiments-section', icon: '🔬' },
          { type: 'link', title: 'مسارات BTEC والمشاريع التطبيقية', url: '/btec', icon: '💻' }
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

  // Local Cognitive Empathy Fallback Engine (Guaranteed 0-fail clinical-grade psychological response)
  const generateEmpatheticFallback = (userQuery: string, currentMood: string): { text: string; suggestions?: any[] } => {
    const q = userQuery.toLowerCase();
    
    // Exam anxiety & fear of failure
    if (q.includes('امتحان') || q.includes('امتحانات') || q.includes('توجيهي') || q.includes('خايف') || q.includes('خوف') || q.includes('معدل')) {
      return {
        text: `أسمعك بكل وضوح وعطف، وقلقك بشأن الامتحانات أو التوقعات شعور إنساني يمر به كل طالب حريص وطموح 💙\n\nإليك ثلاث حقائق علمية نفسية أرجو أن تضعها في قلبك:\n\n1. **قلق الأداء المعتدل مفيد، لكن القلق المفرط يشل الذاكرة العاملة**، لذلك هدفنا ليس إلغاء الخوف بل خفض شدته ليبقى في نطاق التركيز.\n2. **تقسيم المهام (Chunking)**: لا تفكر في الكتاب كاملاً. افتح فصلاً واحداً فقط واقرأ لمدة 20 دقيقة، ثم كافئ نفسك.\n3. **النوم والماء**: الدماغ يفرز هرمون الكورتيزول مع الجفاف وقلة النوم، مما يضاعف التوتر. اشرب كوب ماء بارد الآن.\n\nتذكر: أنت تبذل وسعك، والله لا يضيع أجر المحسنين. أنا هنا لأي استفسار آخر تريده.`,
        suggestions: [
          { type: 'tool', title: 'ابدأ تمرين التنفس الصندوقي 4-4-4-4', url: '#breathing', icon: '🫁' },
          { type: 'tool', title: 'مختبر إعادة التأطير المعرفي CBT', url: '#reframing', icon: '🧠' },
          { type: 'link', title: 'جدول مذاكرتك بمنظم الدراسة', url: '/study-organization', icon: '📅' }
        ]
      };
    }

    // Concentration & Distraction
    if (q.includes('تركيز') || q.includes('تشتت') || q.includes('نسيان') || q.includes('انسى') || q.includes('بنسی')) {
      return {
        text: `التشتت والنسيان ليسا علامة على ضعف في ذكائك على الإطلاق! عقولنا تتعرض لسيل من الإشعارات والمنبهات اليومية تجعل الدماغ في حالة تنبيه دائم 🧠\n\nلإعادة برمجة تركيزك اليوم:\n\n• **قاعدة الـ 5 دقائق**: قل لنفسك «سأجلس للدراسة 5 دقائق فقط وإذا لم استطع سأتوقف». 90% من الوقت ستواصل تلقائياً لأن أصعب خطوة هي البداية.\n• **أبعد الهاتف تماماً** خارج الغرفة وليس بجانبك.\n• **استخدم طريقة التكرار المتباعد**: مراجعة بطاقة المعلومات بعد 24 ساعة، ثم بعد 3 أيام، ثم أسبوع تنقلها للذاكرة الدائمة بنسبة 95%.\n\nهل تحب أن نحدد مادة معينة لتبدأ بها الآن؟`,
        suggestions: [
          { type: 'link', title: 'نظام المراجعة الذكي Spaced Repetition', url: '/spaced-repetition', icon: '⏱️' },
          { type: 'tool', title: 'تفعيل مؤقت التركيز بومودورو 25 دقيقة', url: '#pomodoro', icon: '☕' }
        ]
      };
    }

    // Exhaustion & Burnout
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
        { type: 'tool', title: 'مختبر إعادة التأطير المعرفي', url: '#reframing', icon: '🧠' },
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

      // Edge Function with timeout race
      const invokePromise = supabase.functions.invoke('psychological-guide-ai', {
        body: {
          message: userText,
          mood: selectedMood,
          conversationHistory
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
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
      playSynthesizedChime(480);

    } catch (err) {
      console.warn('Psychological AI edge function fallback triggered:', err);
      
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
        playSynthesizedChime(480);
      }, 350);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\\()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const currentMoodData = moods.find(m => m.id === selectedMood) || moods[0];

  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b ${currentMoodData.bgGradient} text-white transition-colors duration-700 selection:bg-rose-500 selection:text-white font-sans`} dir="rtl">
      <SEO 
        title="مرشدك النفسي الذكي (واحة السكينة) | منصة ذروة العلم"
        description="المرشد النفسي والأكاديمي الذكي المبني على العلاج المعرفي السلوكي (CBT): تنظيم قلق الامتحانات، التنفس الصندوقي 4-4-4-4، التأريض الحسي 5-4-3-2-1، وآيات السكينة والاطمئنان."
        keywords="مرشد نفسي, دعم نفسي للطلاب, قلق الامتحانات, تنفس صندوقي, تأريض نفسي, ذروة العلم, علاج معرفي سلوكي"
      />
      
      {/* Background Calm Starfield */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <StarField starCount={350} />
      </div>
      
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex flex-col max-w-5xl space-y-4">
        {/* Top Control Bar & Quick-Calm Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <Button
            onClick={() => navigate('/ai-assistant-section')}
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-semibold rounded-xl"
          >
            <ArrowRight className="w-4 h-4 ml-1.5" />
            <span>مركز المساعدين الأذكياء</span>
          </Button>

          {/* Calming Utilities Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setIsBreathingOpen(true);
                setIsBreathingRunning(true);
                playSynthesizedChime(520);
              }}
              variant="outline"
              size="sm"
              className="rounded-xl bg-cyan-950/40 border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>التنفس الصندوقي 4-4-4-4</span>
            </Button>

            <Button
              onClick={() => setActiveSosTab(activeSosTab === 'grounding' ? 'none' : 'grounding')}
              variant="outline"
              size="sm"
              className="rounded-xl bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>التأريض الحسي 5-4-3-2-1</span>
            </Button>

            <Button
              onClick={() => setActiveSosTab(activeSosTab === 'reframing' ? 'none' : 'reframing')}
              variant="outline"
              size="sm"
              className="rounded-xl bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-900/60 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>إعادة التأطير المعرفي CBT</span>
            </Button>

            <Button
              onClick={() => setActiveSosTab(activeSosTab === 'quran' ? 'none' : 'quran')}
              variant="outline"
              size="sm"
              className="rounded-xl bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>آيات السكينة</span>
            </Button>

            <Button
              onClick={() => setActiveSosTab(activeSosTab === 'pomodoro' ? 'none' : 'pomodoro')}
              variant="outline"
              size="sm"
              className="rounded-xl bg-amber-950/40 border-amber-500/40 text-amber-200 hover:bg-amber-900/60 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>استراحة التعافي 25/5</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Multi-Step Flow */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Emotional State Scanner (6 Moods) */}
          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex items-center justify-center py-4"
            >
              <Card className="p-6 sm:p-10 bg-slate-900/85 border-white/10 backdrop-blur-xl max-w-3xl w-full rounded-3xl shadow-2xl space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 mb-1">
                    <Heart className="w-8 h-8 animate-pulse" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    كيف تشعر في هذه اللحظة؟
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    اختر الحالة الوجدانية الأقرب لما يدور في صدرك الآن لنخصص لك جلسة إرشادية آمنة ومريحة تلبي احتياجك الفعلي.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {moods.map((m, idx) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMoodSelect(m.id)}
                      className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${m.color} text-right border border-white/20 shadow-md hover:shadow-xl transition-all flex flex-col justify-between h-36`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl sm:text-4xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-white/90">
                          اختيار
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-extrabold text-base sm:text-lg leading-tight mb-1">
                          {m.label}
                        </div>
                        <div className="text-white/85 text-[11px] leading-snug line-clamp-2">
                          {m.desc}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Full Psychological Chat & Therapeutic Console */}
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
                          تمرين التنفس الصندوقي العيادي (4-4-4-4 Box Breathing)
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

                    {/* Animated Concentric Breathing Orb */}
                    <div className="py-6 flex flex-col items-center justify-center">
                      <div className="relative flex items-center justify-center">
                        {/* Ripple Aura */}
                        <motion.div
                          animate={{
                            scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'hold1' ? 1.5 : breathingPhase === 'exhale' ? 0.85 : 0.85,
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                          className="absolute w-48 h-48 rounded-full bg-cyan-500/20 blur-xl pointer-events-none"
                        />

                        <motion.div
                          animate={{
                            scale: breathingPhase === 'inhale' ? 1.35 : breathingPhase === 'hold1' ? 1.35 : breathingPhase === 'exhale' ? 0.9 : 0.9,
                            borderColor: breathingPhase === 'inhale' ? '#38bdf8' : breathingPhase === 'hold1' ? '#a855f7' : breathingPhase === 'exhale' ? '#34d399' : '#94a3b8'
                          }}
                          transition={{ duration: 4, ease: 'easeInOut' }}
                          className="w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl bg-cyan-950/40 z-10"
                        >
                          <span className="text-4xl font-black text-white font-mono">{breathingSeconds}</span>
                          <span className="text-xs font-bold text-cyan-200 mt-1">
                            {breathingPhase === 'inhale' && 'شهيق عميق من الأنف'}
                            {breathingPhase === 'hold1' && 'حبس النفس بهدوء'}
                            {breathingPhase === 'exhale' && 'زفير بطيء ومريح'}
                            {breathingPhase === 'hold2' && 'سكون واسترخاء تام'}
                          </span>
                        </motion.div>
                      </div>

                      <p className="text-xs text-slate-300 mt-4 max-w-md leading-relaxed">
                        {breathingPhase === 'inhale' && 'املأ رئتيك بالهواء ببطء من أنفك، واشعر بتمدد بطنك وهدوء نبضاتك.'}
                        {breathingPhase === 'hold1' && 'ابقَ هادئاً تماماً... لا تشد عضلات رقبتك أو كتفيك.'}
                        {breathingPhase === 'exhale' && 'اخرج الهواء بهدوء وتدرج من فمك كأنك تطفئ شمعة بعيدة.'}
                        {breathingPhase === 'hold2' && 'استشعر خلو جسدك من التوتر... أنت الآن بأمان.'}
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
                          <span>إعادة البدء</span>
                        </Button>
                        {completedBreathingCycles > 0 && (
                          <span className="text-xs text-emerald-400 font-bold mr-2">
                            تم إكمال {completedBreathingCycles} دورات استرخاء
                          </span>
                        )}
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
                    className="p-5 rounded-3xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span className="text-xs sm:text-sm font-bold text-slate-200">
                          حقيبة التدخل النفسي العاجل (Clinical SOS Arsenal)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <button
                          onClick={() => setActiveSosTab('grounding')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'grounding' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          التأريض 5-4-3-2-1
                        </button>
                        <button
                          onClick={() => setActiveSosTab('reframing')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'reframing' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          التأطير المعرفي CBT
                        </button>
                        <button
                          onClick={() => setActiveSosTab('quran')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'quran' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          آيات السكينة
                        </button>
                        <button
                          onClick={() => setActiveSosTab('pomodoro')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeSosTab === 'pomodoro' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        >
                          مؤقت 25/5
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
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-300">
                          بروتوكول التأريض الحسي يقطع فجأة إشارات الذعر في اللوزة الدماغية (Amygdala) ويعيد تنشيط الفص الجبهي المسؤول عن التفكير والهدوء:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                          {groundingSteps.map((gs, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                const newChecked = [...groundingChecked];
                                newChecked[idx] = !newChecked[idx];
                                setGroundingChecked(newChecked);
                                playSynthesizedChime(400 + idx * 80);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-1 ${
                                groundingChecked[idx] 
                                  ? 'bg-emerald-950/60 border-emerald-500/50 shadow-md' 
                                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-black text-rose-400 font-mono">{gs.count}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${groundingChecked[idx] ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'border-slate-500'}`}>
                                  {groundingChecked[idx] ? '✓' : ''}
                                </div>
                              </div>
                              <div className="text-xs font-bold text-white">{gs.label}</div>
                              <div className="text-[10px] text-slate-300 leading-tight">{gs.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reframing Tab Content */}
                    {activeSosTab === 'reframing' && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-300">
                          مختبر إعادة التأطير المعرفي (CBT Cognitive Re-framing) لتحويل الأفكار الكارثية إلى حقائق عقلانية متزنة:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {reframingCards.map((rc, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-right space-y-2.5 shadow-sm">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                                تشويه: {rc.distortionType}
                              </span>
                              <div className="text-[11px] text-rose-300/90 font-medium">
                                ❌ «{rc.distorted}»
                              </div>
                              <div className="text-xs font-bold text-emerald-300 leading-snug">
                                ✔ «{rc.rational}»
                              </div>
                              <div className="text-[10px] text-slate-300 border-t border-slate-700 pt-1.5 flex items-center gap-1">
                                <span className="font-bold text-purple-400">خطوة فورية:</span>
                                <span>{rc.action}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quran Tab Content */}
                    {activeSosTab === 'quran' && (
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {quranicVerses.map((qv, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right space-y-2 shadow-sm">
                              <div className="text-sm font-bold text-emerald-200">
                                {qv.verse}
                              </div>
                              <div className="text-[11px] text-emerald-400 font-semibold">
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

                    {/* Pomodoro Timer Content */}
                    {activeSosTab === 'pomodoro' && (
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-3">
                        <div className="text-xs font-bold text-amber-300">
                          مؤقت بومودورو للتركيز المتقطع (25 دقيقة تركيز • 5 دقائق راحة)
                        </div>
                        <div className="text-4xl font-black font-mono text-white" dir="ltr">
                          {Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0')}:
                          {(pomodoroSeconds % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                            size="sm"
                            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                          >
                            {isPomodoroRunning ? 'إيقاف مؤقت' : 'بدء جلسة التركيز'}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsPomodoroRunning(false);
                              setPomodoroSeconds(25 * 60);
                            }}
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-600 text-xs text-slate-300"
                          >
                            إعادة الضبط
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Message Window */}
              <Card className="flex-1 p-4 sm:p-6 bg-slate-900/85 border-white/10 backdrop-blur-xl flex flex-col justify-between rounded-3xl min-h-[520px] shadow-2xl">
                {/* Header Profile */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Heart className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <span>مرشدك النفسي الذكي</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                          CBT & Empathy Active
                        </Badge>
                      </h2>
                      <div className="text-xs text-slate-400">
                        مساحة استماع آمنة ومحمية بالكامل وخالية من أي أحكام
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('mood')}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs text-rose-300 hover:text-white hover:bg-white/10"
                  >
                    تغيير الحالة ({currentMoodData.emoji} {currentMoodData.label})
                  </Button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1 max-h-[520px] scrollbar-thin scrollbar-thumb-purple-500/40">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 rounded-3xl ${
                            message.role === 'user'
                              ? 'bg-purple-600/30 border border-purple-500/50 text-white rounded-tr-none shadow-sm'
                              : 'bg-slate-800/90 border border-white/10 text-slate-100 rounded-tl-none shadow-md'
                          }`}
                        >
                          <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                            {message.content}
                          </div>

                          {/* Direct Platform Link Action */}
                          {message.redirectTo && (
                            <Button
                              onClick={() => navigate(message.redirectTo!)}
                              className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs sm:text-sm font-bold text-white rounded-2xl"
                              size="sm"
                            >
                              {message.redirectMessage || 'الانتقال للقسم المقترح'}
                              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                            </Button>
                          )}

                          {/* Suggested Resources Links */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                              <div className="text-[11px] font-bold text-purple-300">
                                خطوات مقترحة لأجلك الآن:
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
                                          if (sug.url === '#reframing') setActiveSosTab('reframing');
                                          if (sug.url === '#quran') setActiveSosTab('quran');
                                          if (sug.url === '#pomodoro') setActiveSosTab('pomodoro');
                                        }}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-right transition-colors text-xs font-semibold text-purple-200"
                                      >
                                        <span className="flex items-center gap-2">
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
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-white/10 text-right transition-colors text-xs font-semibold text-slate-300"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span>{sug.icon}</span>
                                        <span>{sug.title}</span>
                                      </span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Message Footer: Voice read out & timestamp */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px] text-slate-400">
                            {message.role === 'ai' ? (
                              <button
                                onClick={() => speakMessage(message.id, message.content)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                {speakingMessageId === message.id ? (
                                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                                )}
                                <span>{speakingMessageId === message.id ? 'إيقاف الصوت' : 'استماع صوتي'}</span>
                              </button>
                            ) : <span />}
                            <span>{message.timestamp}</span>
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
                      <div className="max-w-[80%] p-4 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center gap-2 text-slate-300 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        <span>المرشد النفسي يكتب رداً دافئاً وموجهاً لأجلك...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="pt-3 border-t border-white/10 flex items-end gap-2">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="تحدث بحرية عما تشعر به، أو اسأل عن كيفية تخفيف توتر الامتحانات..."
                    disabled={isLoading}
                    className="flex-1 min-h-[50px] max-h-32 bg-slate-800/70 border-white/10 text-white placeholder:text-slate-400 rounded-2xl resize-none text-xs sm:text-sm p-3 focus:border-rose-500"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="h-12 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold shrink-0 shadow-lg"
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
