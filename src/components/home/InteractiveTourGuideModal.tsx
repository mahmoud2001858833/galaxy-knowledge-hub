import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, X, Play, Pause, Square, ChevronRight, ChevronLeft, 
  Volume2, VolumeX, Atom, Cpu, HeartHandshake, ShieldCheck, 
  Presentation, GraduationCap, BookOpen, Music, Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const openInteractiveTourModal = () => {
  window.dispatchEvent(new CustomEvent('galaxy_open_tour_welcome'));
};

interface TourMilestone {
  id: number;
  targetId: string;
  badge: string;
  title: string;
  description: string;
  voiceText: string;
  icon: React.ElementType;
  accentColor: string;
}

// Ordered purely downwards from top to bottom (هبوط متسلسل انسيابي)
const TOUR_MILESTONES: TourMilestone[] = [
  {
    id: 1,
    targetId: 'tour-stage-hero',
    badge: 'المحطة 1 • البوابة الرقمية والعدادات الحية المتصاعدة',
    title: 'مرحباً بك في منصة ذروة العلم 2.0',
    description: 'المنظومة الوطنية الأردنية للتعليم التفاعلي ثلاثي الأبعاد، مع العدادات الرقمية الحية المتصاعدة: 49+ مختبراً تفاعلياً، 99.8% دقة القياس، 100% شمولية دامج، و25+ أداة ذكاء اصطناعي.',
    voiceText: 'مرحباً بكم في منصة ذروة العلم، المنظومة الوطنية للتعليم التفاعلي والمختبرات الذكية، مع عدادات إحصائية رقمية حية.',
    icon: Sparkles,
    accentColor: 'from-cyan-500 to-blue-600'
  },
  {
    id: 2,
    targetId: 'tour-stage-ecosystem',
    badge: 'المحطة 2 • مسارات بتك BTEC والتعليم الشامل',
    title: 'مسارات Pearson BTEC وبوابة التعليم الشامل',
    description: 'مسارات التعليم المهني الدولي المعتمد: تكنولوجيا المعلومات، الهندسة، الفن والتصميم، وإدارة الأعمال مع المساعد البرمجي، ومصحح الأكواد، وبوابة التعليم الشامل بـ 14 منصة متخصصة.',
    voiceText: 'مسارات بتك المهنية الدولية وبوابة التعليم الشامل بأربعة عشر مساراً متكاملاً تشمل تكنولوجيا المعلومات والهندسة والأعمال.',
    icon: GraduationCap,
    accentColor: 'from-blue-600 to-indigo-600'
  },
  {
    id: 3,
    targetId: 'tour-stage-capabilities',
    badge: 'المحطة 3 • شبكة المختبرات 3D والروبوتات 2.0',
    title: 'المختبرات التفاعلية 3D واستوديو الروبوتات والـ ROS2',
    description: '49 مختبراً تفاعلياً فائق الدقة (الكم، النسبية، الدوائر الكهربائية) مع استوديو الروبوتات المطور بنظام العرض الأفقي لمحاكاة الأذرع 6-DOF، والـ LiDAR 360° وبرمجة ROS2 بلغة Python.',
    voiceText: 'شبكة المختبرات التفاعلية ثلاثية الأبعاد بدقة تسعة وتسعين بالمئة، واستوديو الروبوتات والذكاء الاصطناعي بنظام العرض الأفقي.',
    icon: Atom,
    accentColor: 'from-cyan-600 to-purple-600'
  },
  {
    id: 4,
    targetId: 'tour-stage-future',
    badge: 'المحطة 4 • منظومة دامج والرعاية الطبية المدرسية',
    title: 'مشروع دامج الوطني والمساعد الطبي المدرسي',
    description: 'مترجم لغة الإشارة الفوري بالكاميرا، مترجم برايل اللمسي والصوتي، أدوات تقييم التوحد وADHD، مع المساعد الطبي المدرسي للطوارئ والإسعافات الأولية الذكية.',
    voiceText: 'مشروع دامج الوطني للتربية الخاصة والشمولية التامة مع مترجم لغة الإشارة وبرايل والمساعد الطبي المدرسي للطوارئ.',
    icon: ShieldCheck,
    accentColor: 'from-emerald-600 to-teal-500'
  },
  {
    id: 5,
    targetId: 'tour-stage-resources',
    badge: 'المحطة 5 • استراتيجيات التعلم والمكتبة البصرية',
    title: 'نظام المراجعة الذكي SM-2 والمكتبة والمجلة العلمية',
    description: 'خوارزمية مكافحة النسيان SM-2 لجدولة الاستذكار الذكية، المكتبة البصرية ثلاثية الأبعاد 4K، والمجلة العلمية المحكمة لنشر المقالات والأبحاث المعتمدة.',
    voiceText: 'نظام المراجعة الذكي المعتمد على خوارزمية التكرار المتباعد والمكتبة البصرية ثلاثية الأبعاد والمجلة العلمية المحكمة.',
    icon: BookOpen,
    accentColor: 'from-amber-500 to-orange-500'
  },
  {
    id: 6,
    targetId: 'tour-stage-presentation-deck',
    badge: 'المحطة 6 • العرض التقديمي الشامل ودرع الحماية A+',
    title: 'العرض التقديمي التفاعلي وحصن الحماية والتحمل',
    description: 'استعراض 360° شامل لأركان المنظومة مع درع الحماية السيبراني A+ ومحرك التخزين المؤقت المصمم لتحمل أكثر من 120,000 مستخدم متزامن بكفاءة قصوى.',
    voiceText: 'وأخيراً العرض التقديمي التفاعلي الشامل مع درع الحماية والتحمل لأكثر من مائة وعشرين ألف مستخدم متزامن.',
    icon: Presentation,
    accentColor: 'from-cyan-500 to-indigo-600'
  }
];

export const InteractiveTourGuideModal: React.FC = () => {
  // Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  // Active Guided Tour State (Smooth Auto-Descent, NO MOUSE)
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Audio State (Nasheed without music + Optional Voiceover)
  const [isNasheedMuted, setIsNasheedMuted] = useState(false);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check on mount if user on this device already completed or dismissed the tour
  useEffect(() => {
    const handleOpenTrigger = () => {
      stopTour(false);
      setIsDecisionModalOpen(true);
    };

    window.addEventListener('galaxy_open_tour_welcome', handleOpenTrigger);

    // Strict Device Persistence: Only show once ever per device unless triggered manually
    const decisionTaken = localStorage.getItem('galaxy_tour_decision_taken');
    if (!decisionTaken) {
      const timer = setTimeout(() => {
        setIsDecisionModalOpen(true);
      }, 900);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('galaxy_open_tour_welcome', handleOpenTrigger);
    };
  }, []);

  // Cleanup highlights and timers on unmount
  useEffect(() => {
    return () => {
      clearAllHighlights();
      stopSpeech();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Clear spotlight glowing classes from page
  const clearAllHighlights = () => {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.galaxy-tour-spotlight-active').forEach(node => {
        node.classList.remove('galaxy-tour-spotlight-active');
      });
    }
  };

  // Play Nasheed (Audio without music)
  const playNasheed = () => {
    if (!audioRef.current || isNasheedMuted) return;
    audioRef.current.volume = 0.45;
    audioRef.current.play().catch(() => {
      console.log('Audio autoplay blocked or waiting for user interaction');
    });
  };

  // Pause Nasheed
  const pauseNasheed = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Speak Arabic voiceover without music (Optional voice narration)
  const speakText = (text: string) => {
    if (!isVoiceoverEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang && (v.lang.startsWith('ar') || v.lang.includes('Arabic')));
      if (arVoice) {
        utterance.voice = arVoice;
      }

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech synthesis inactive or blocked');
    }
  };

  // Stop any active speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Start Tour (Triggered by user click - audio is immediately permitted)
  const handleStartGuidedTour = () => {
    localStorage.setItem('galaxy_tour_decision_taken', 'true');
    setIsDecisionModalOpen(false);
    setIsTourActive(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    
    // Play soothing vocal nasheed without music immediately
    playNasheed();
    toast.success('بدأت الجولة الانسيابية مع نشيد بدون موسيقى 🎵', {
      description: 'الصفحة ستنزل تلقائياً وبشكل أنيق بدون أي مؤشر ماوس'
    });

    executeStep(0);
  };

  // Handle Self Exploration (Closes cleanly)
  const handleSelfExploration = () => {
    localStorage.setItem('galaxy_tour_decision_taken', 'true');
    setIsDecisionModalOpen(false);
    toast.success('مرحباً بك! تصفح المنصة بحرية تامة 🧭');
  };

  // Stop / Exit Tour and smoothly glide back to the top of the page
  const stopTour = (scrollBackToTop = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    clearAllHighlights();
    stopSpeech();
    pauseNasheed();

    setIsTourActive(false);
    setIsPaused(false);

    if (scrollBackToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Toggle Pause / Resume
  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      playNasheed();
      if (isVoiceoverEnabled) {
        speakText(TOUR_MILESTONES[currentStepIndex].voiceText);
      }
      startCountdown(secondsRemaining, () => {
        executeStep(currentStepIndex + 1);
      });
      toast.info('تم استئناف الهبوط التلقائي للجولة');
    } else {
      // Pause
      setIsPaused(true);
      pauseNasheed();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopSpeech();
      toast.info('تم إيقاف الجولة مؤقتاً');
    }
  };

  // Countdown Helper
  const startCountdown = (startSec: number, onFinish: () => void) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setSecondsRemaining(startSec);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      onFinish();
    }, startSec * 1000);
  };

  // Execute a specific tour milestone (Smooth, downward glide without mouse)
  const executeStep = (stepIdx: number) => {
    if (stepIdx >= TOUR_MILESTONES.length) {
      toast.success('اكتملت الجولة التعريفية بنجاح! جاري العودة لقمة المنصة 🎉');
      stopTour(true);
      return;
    }

    const milestone = TOUR_MILESTONES[stepIdx];
    setCurrentStepIndex(stepIdx);
    setIsPaused(false);

    // 1. Clear previous highlights
    clearAllHighlights();

    // 2. Smooth downward gliding of the page ("الصفحة لحالها بتصير تنزل بشكل انيق")
    if (stepIdx === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(milestone.targetId);
      if (el) {
        // Add elegant spotlight glow
        el.classList.add('galaxy-tour-spotlight-active');

        const isMobile = window.innerWidth < 768;
        const yOffset = isMobile ? -65 : -95;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }

    // 3. Audio management: Keep nasheed playing smoothly
    if (!isNasheedMuted && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }

    // 4. Voice narration if toggled
    if (isVoiceoverEnabled) {
      speakText(milestone.voiceText);
    }

    // 5. Auto-advance to next station after 8 seconds
    startCountdown(8, () => {
      executeStep(stepIdx + 1);
    });
  };

  const handleNextStep = () => {
    executeStep(currentStepIndex + 1);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      executeStep(currentStepIndex - 1);
    }
  };

  const currentMilestone = TOUR_MILESTONES[currentStepIndex];

  return (
    <>
      {/* Hidden Audio Player for Soothing Vocal Nasheed (Without Music) */}
      <audio
        ref={audioRef}
        src="/sounds/tour-vocal-nasheed.mp3"
        loop
        preload="auto"
      />

      {/* 1. Initial Elegant Welcome Decision Modal ("مربع انيق وجميل فيه خيارين") */}
      <AnimatePresence>
        {isDecisionModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-slate-100 overflow-hidden"
            >
              {/* Ambient Glow Orbs */}
              <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

              {/* Close Button (Executes Self-Exploration) */}
              <button
                onClick={handleSelfExploration}
                className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="إغلاق وتصفح بحرية"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-2.5 mb-6">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center p-2.5">
                    <img src="/logo.png" alt="ذروة العلم" className="w-full h-full object-contain" />
                  </div>
                </div>

                <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 text-xs font-bold px-3 py-1">
                  المنظومة الوطنية للتعليم التفاعلي 2.0
                </Badge>

                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200">
                  أهلاً بك في منصة ذروة العلم
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  يسرنا انضمامك! اختر الطريقة التي تفضلها للبدء: جولة انسيابية تنزل بالصفحة تلقائياً مع نشيد عذب بدون موسيقى، أو الاستكشاف الذاتي المباشر.
                </p>
              </div>

              {/* Two Distinct Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                
                {/* Option 1: Start Guided Tour (Smooth Auto-Descent with Nasheed) */}
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGuidedTour}
                  className="group relative p-5 rounded-2xl cursor-pointer border-2 border-cyan-500/60 hover:border-cyan-400 bg-gradient-to-b from-cyan-500/15 via-slate-900/90 to-slate-950 transition-all shadow-lg shadow-cyan-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
                      <Music className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      بدء الجولة الانسيابية
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      هبوط تلقائي أنيق ينزل بالصفحة خطوة بخطوة بدون ماوس، مع نشيد هادئ بدون موسيقى يوضح لك كافة الأقسام والمختبرات.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>انطلاق الجولة والنشيد 🎵</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </motion.div>

                {/* Option 2: Self-Exploration */}
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSelfExploration}
                  className="group relative p-5 rounded-2xl cursor-pointer border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-slate-200">
                      الاستكشاف الذاتي
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تصفح المنصة بمفردك وحرية تامة دون أي إرشادات موجهة أو هبوط تلقائي بالصفحة.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-slate-200">
                    <span>تصفح بحرية 🧭</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Notice */}
              <div className="text-center text-[10px] text-slate-400">
                لن تظهر هذه النافذة مجدداً، ويمكنك تشغيل الجولة في أي وقت من زر المنصة العلوي.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Active Guided Tour Engine (Pure Auto-Descent, NO MOUSE) */}
      <AnimatePresence>
        {isTourActive && currentMilestone && (
          <div className="fixed inset-0 pointer-events-none z-[9990] font-sans" dir="rtl">
            
            {/* Top Auto-Cruise Status & Progress Ribbon */}
            <div className="absolute top-3 inset-x-3 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 max-w-lg w-full z-[9999] pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-xl backdrop-blur-xl flex items-center justify-between text-xs text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-bold text-cyan-300">
                    هبوط تلقائي سلس بالصفحة
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    (بدون ماوس)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3 text-cyan-400" />
                    نشيد صوتي بدون موسيقى
                  </span>
                  <span className="text-slate-500">•</span>
                  <span>{currentStepIndex + 1}/{TOUR_MILESTONES.length}</span>
                </div>
              </motion.div>
            </div>

            {/* Floating Tour Card Docked Elegantly at the Bottom */}
            <div className="absolute bottom-4 inset-x-3 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 max-w-2xl w-full z-[9998] pointer-events-auto">
              <motion.div
                key={currentMilestone.id}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] backdrop-blur-2xl text-slate-100 space-y-3.5"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-400/40">
                      {React.createElement(currentMilestone.icon, { className: 'w-5 h-5' })}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                          {currentMilestone.badge}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ⏱️ {secondsRemaining} ث
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                        {currentMilestone.title}
                      </h4>
                    </div>
                  </div>

                  {/* Audio Controls & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    
                    {/* Nasheed (Without Music) Toggle */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newMuted = !isNasheedMuted;
                        setIsNasheedMuted(newMuted);
                        if (audioRef.current) {
                          if (newMuted) {
                            audioRef.current.pause();
                            toast.info('تم كتم النشيد');
                          } else {
                            audioRef.current.play().catch(() => {});
                            toast.info('تم تشغيل النشيد بدون موسيقى 🎵');
                          }
                        }
                      }}
                      className={`h-8 px-2 rounded-xl border text-xs gap-1 ${
                        isNasheedMuted 
                          ? 'border-slate-800 text-slate-400 bg-slate-950' 
                          : 'border-cyan-500/50 text-cyan-300 bg-cyan-950/40 shadow-sm shadow-cyan-500/20'
                      }`}
                      title={isNasheedMuted ? 'تشغيل النشيد (بدون موسيقى)' : 'كتم النشيد'}
                    >
                      {isNasheedMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                      <span className="hidden md:inline">{isNasheedMuted ? 'نشيد مكتوم' : 'نشيد نقي'}</span>
                    </Button>

                    {/* Voiceover Narration Toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const nextVoice = !isVoiceoverEnabled;
                        setIsVoiceoverEnabled(nextVoice);
                        if (nextVoice) {
                          speakText(currentMilestone.voiceText);
                          toast.info('تم تفعيل التعليق الصوتي 🎙️');
                        } else {
                          stopSpeech();
                          toast.info('تم كتم التعليق الصوتي');
                        }
                      }}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-white"
                      title={isVoiceoverEnabled ? 'كتم التعليق الصوتي' : 'تفعيل التعليق الصوتي الإرشادي'}
                    >
                      {isVoiceoverEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
                    </Button>

                    {/* Pause / Resume Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={togglePause}
                      className="h-8 px-2.5 rounded-xl border-slate-700 text-slate-200 text-xs gap-1"
                      title={isPaused ? 'استئناف الهبوط التلقائي' : 'إيقاف مؤقت'}
                    >
                      {isPaused ? <Play className="w-3 h-3 fill-current text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                      <span className="hidden sm:inline">{isPaused ? 'استئناف' : 'مؤقت'}</span>
                    </Button>

                    {/* Stop and return to top button */}
                    <Button
                      size="sm"
                      onClick={() => stopTour(true)}
                      className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold gap-1 shadow-md shadow-rose-600/25"
                      title="إيقاف الجولة والعودة لبداية الصفحة"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>إيقاف</span>
                    </Button>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {currentMilestone.description}
                </p>

                {/* Progress bar & navigation controls */}
                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-3">
                  
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {TOUR_MILESTONES.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === currentStepIndex
                            ? 'w-7 bg-gradient-to-r from-cyan-400 to-blue-500'
                            : idx < currentStepIndex
                            ? 'w-2.5 bg-cyan-400/80'
                            : 'w-2 bg-slate-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 mr-2 font-mono">
                      {currentStepIndex + 1} / {TOUR_MILESTONES.length}
                    </span>
                  </div>

                  {/* Prev / Next buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentStepIndex === 0}
                      onClick={handlePrevStep}
                      className="h-8 px-2.5 rounded-xl text-xs font-bold border-slate-800 text-slate-300 hover:text-white"
                    >
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      السابق
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleNextStep}
                      className="h-8 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20"
                    >
                      <span>{currentStepIndex === TOUR_MILESTONES.length - 1 ? 'إنهاء والأعلى' : 'التالي'}</span>
                      <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractiveTourGuideModal;
