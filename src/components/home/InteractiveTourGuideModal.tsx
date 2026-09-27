import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, X, Play, Pause, Square, ChevronRight, ChevronLeft, 
  Volume2, VolumeX, Atom, Cpu, HeartHandshake, Eye, ShieldCheck, 
  CheckCircle2, ArrowUpRight, MousePointer2, Building2, RotateCcw
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
  mouseTarget: { xPercent: number; yPercent: number };
}

const TOUR_MILESTONES: TourMilestone[] = [
  {
    id: 1,
    targetId: 'tour-stage-hero',
    badge: 'المحطة الأولى • البوابة الرقمية',
    title: 'مرحباً بك في منصة ذروة العلم 2.0',
    description: 'المنظومة الوطنية الأردنية للتعليم التفاعلي ثلاثي الأبعاد، تربط أحدث تقنيات المحاكاة بمناهج وزارة التربية والتعليم وجامعات المملكة.',
    voiceText: 'مرحباً بكم في منصة ذروة العلم، المنظومة الوطنية للتعليم التفاعلي والمختبرات الذكية ثلاثية الأبعاد.',
    icon: Sparkles,
    accentColor: 'from-cyan-500 to-blue-600',
    mouseTarget: { xPercent: 50, yPercent: 42 }
  },
  {
    id: 2,
    targetId: 'tour-stage-ecosystem',
    badge: 'المحطة الثانية • شبكة المختبرات',
    title: 'المختبرات الافتراضية التفاعلية 3D',
    description: 'أكثر من 49 محاكاة ومختبراً علمياً عالي الدقة في الفيزياء والكيمياء والأحياء، بمعايرة رياضية دقيقة 99.8% ورؤية 360 درجة.',
    voiceText: 'هنا تجدون أكثر من تسعة وأربعين مختبراً ومحاكاة علمية تفاعلية تغطي كافة المناهج العلمية بدقة فائقة.',
    icon: Atom,
    accentColor: 'from-blue-600 to-cyan-500',
    mouseTarget: { xPercent: 38, yPercent: 46 }
  },
  {
    id: 3,
    targetId: 'tour-stage-capabilities',
    badge: 'المحطة الثالثة • الهندسة المتقدمة',
    title: 'استوديو الروبوتات والذكاء الاصطناعي',
    description: 'بيئة هندسية تحاكي الأذرع الميكانيكية، ومستشعرات الرادار LiDAR، مع طرفية تفاعلية لتنفيذ أكواد بايثون والذكاء الاصطناعي.',
    voiceText: 'قسم الروبوتات والذكاء الاصطناعي لمحاكاة الأذرع الهندسية وأجهزة الاستشعار وتنفيذ الأكواد البرمجية.',
    icon: Cpu,
    accentColor: 'from-purple-600 to-pink-500',
    mouseTarget: { xPercent: 62, yPercent: 46 }
  },
  {
    id: 4,
    targetId: 'tour-stage-future',
    badge: 'المحطة الرابعة • المستقبل والشمولية',
    title: 'منظومة دامج للتربية الخاصة والمنصات المستقبلية',
    description: 'مشروع دامج الوطني يدعم مترجم لغة الإشارة الفوري بالرؤية الحاسوبية، ونظام برايل اللمسي، بجانب خطط المختبر الكمي واستوديو المعلم التوليدي.',
    voiceText: 'مشروع دامج للتربية الخاصة والمنصات المستقبلية، لتمكين ذوي الإعاقة وربط المدارس بتقنيات الغد.',
    icon: HeartHandshake,
    accentColor: 'from-emerald-600 to-teal-500',
    mouseTarget: { xPercent: 45, yPercent: 48 }
  },
  {
    id: 5,
    targetId: 'tour-stage-resources',
    badge: 'المحطة الخامسة • الموارد والمراجعة الذكية',
    title: 'الأدوات التعليمية ونظام المراجعة الذكي',
    description: 'المكتبة البصرية 4K، دوري الألغاز العلمية، ونظام المراجعة الذكي القائم على منحنى إبنجهاوس لترسيخ المعرفة في الذاكرة الدائمة.',
    voiceText: 'المكتبة البصرية ودوري الألغاز ونظام المراجعة الذكي لترسيخ المعلومات في الذاكرة الدائمة.',
    icon: ShieldCheck,
    accentColor: 'from-amber-500 to-orange-500',
    mouseTarget: { xPercent: 50, yPercent: 46 }
  },
  {
    id: 6,
    targetId: 'tour-stage-partnerships',
    badge: 'المحطة السادسة • الشراكة المؤسسية',
    title: 'الشراكة المؤسسية والاعتماد الأكاديمي',
    description: 'تمكين المدارس والجامعات والوزارات من خفض تكاليف المعامل 85% عبر 49 مختبراً 3D، مسارات BTEC المهنية، وحلول دامج للتربية الخاصة.',
    voiceText: 'بوابة الشراكة المؤسسية تتيح للمدارس والجامعات والوزارات الاستفادة الكاملة من بنية المنصة ومختبراتها المعتمدة.',
    icon: Building2,
    accentColor: 'from-blue-600 to-indigo-600',
    mouseTarget: { xPercent: 50, yPercent: 48 }
  }
];

export const InteractiveTourGuideModal: React.FC = () => {
  // Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  // Active Guided Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });
  const [isClicking, setIsClicking] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(7);

  // Auto-progress timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check on mount if user on this device already completed or dismissed the tour
  useEffect(() => {
    const handleOpenTrigger = () => {
      stopTour(false);
      setIsDecisionModalOpen(true);
    };

    window.addEventListener('galaxy_open_tour_welcome', handleOpenTrigger);

    // Strict Device Persistence: Only show once ever per device unless clicked manually
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

  // Speak Arabic voiceover without music
  const speakText = (text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

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

  // Handle Choice 1: Start Guided Tour
  const handleStartGuidedTour = () => {
    // Save decision permanently so it never shows automatically again on this device
    localStorage.setItem('galaxy_tour_decision_taken', 'true');
    setIsDecisionModalOpen(false);
    setIsTourActive(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    toast.info('بدأت الجولة التعريفية التفاعلية 🚀 يمكنك إيقافها في أي وقت');
    executeStep(0);
  };

  // Handle Choice 2: Self Exploration (Does NOTHING, closes smoothly)
  const handleSelfExploration = () => {
    // Save decision permanently so it never shows automatically again on this device
    localStorage.setItem('galaxy_tour_decision_taken', 'true');
    setIsDecisionModalOpen(false);
    toast.success('مرحباً بك! تصفح المنصة بحرية تامة 🧭');
  };

  // Stop / Exit Tour and smoothly scroll back to top of the page
  const stopTour = (scrollBackToTop = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    stopSpeech();
    setIsTourActive(false);
    setIsPaused(false);

    if (scrollBackToTop) {
      // Smoothly return platform back to the very top as requested
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Toggle Pause / Resume
  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      speakText(TOUR_MILESTONES[currentStepIndex].voiceText);
      startCountdown(secondsRemaining, () => {
        executeStep(currentStepIndex + 1);
      });
      toast.info('تم استئناف الجولة التعريفية');
    } else {
      // Pause
      setIsPaused(true);
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

  // Execute a specific tour milestone
  const executeStep = (stepIdx: number) => {
    if (stepIdx >= TOUR_MILESTONES.length) {
      // Finished all milestones!
      toast.success('اكتملت الجولة التعريفية بنجاح! جاري العودة لبداية المنصة 🎉');
      stopTour(true);
      return;
    }

    const milestone = TOUR_MILESTONES[stepIdx];
    setCurrentStepIndex(stepIdx);
    setIsPaused(false);

    // 1. Smooth gradual scrolling ("شوي شوي")
    if (stepIdx === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(milestone.targetId);
      if (el) {
        const isMobile = window.innerWidth < 768;
        const yOffset = isMobile ? -75 : -110;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }

    // 2. Animate Virtual Mouse to the section with safe viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 640;

    const rawTargetX = (viewportWidth * milestone.mouseTarget.xPercent) / 100;
    const rawTargetY = (viewportHeight * milestone.mouseTarget.yPercent) / 100;

    // Keep mouse safely on screen
    const clampedX = Math.min(Math.max(rawTargetX, isMobile ? 35 : 70), isMobile ? viewportWidth - 55 : viewportWidth - 110);
    const clampedY = Math.min(Math.max(rawTargetY, isMobile ? 90 : 120), isMobile ? viewportHeight - 210 : viewportHeight - 160);

    setMousePosition({ x: clampedX, y: clampedY });

    // Simulate clicking aura after mouse arrives
    setTimeout(() => {
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 500);
    }, 800);

    // 3. Audio narration (voiceover without music)
    speakText(milestone.voiceText);

    // 4. Auto-advance after 7.5 seconds (Total ~45 seconds for 6 steps)
    startCountdown(7, () => {
      executeStep(stepIdx + 1);
    });
  };

  // Next / Previous manual controls
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
      {/* 1. Initial Elegant Welcome Decision Modal ("مربع انيق وجميل فيه خيارين") */}
      <AnimatePresence>
        {isDecisionModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md font-sans" dir="rtl">
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
                  يسرنا انضمامك! اختر الطريقة التي تفضلها للبدء: جولة ذكية وسلسة توضح لك ميزات المنصة، أو الاستكشاف الذاتي المباشر.
                </p>
              </div>

              {/* Two Distinct Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                
                {/* Option 1: Start Guided Tour */}
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGuidedTour}
                  className="group relative p-5 rounded-2xl cursor-pointer border-2 border-cyan-500/60 hover:border-cyan-400 bg-gradient-to-b from-cyan-500/15 via-slate-900/90 to-slate-950 transition-all shadow-lg shadow-cyan-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      بدء الجولة التعريفية
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      جولة مرئية هادئة (45 ثانية) مع مؤشر تفاعلي وصوت نقي يشرح لك أهم الأقسام والمختبرات 3D خطوة بخطوة.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>انطلاق الجولة 🚀</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </motion.div>

                {/* Option 2: Self-Exploration (Nothing happens, closes cleanly) */}
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
                      تصفح المنصة بمفردك وحرية تامة دون أي إرشادات موجهة أو تنقلات تلقائية بالصفحة.
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

      {/* 2. Active Guided Tour Engine with Virtual Mouse & Floating Explanation */}
      <AnimatePresence>
        {isTourActive && currentMilestone && (
          <div className="fixed inset-0 pointer-events-none z-[9990] font-sans" dir="rtl">
            
            {/* Subtle dimming backdrop overlay */}
            <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

            {/* Virtual Animated Mouse Pointer ("ماوس هيك بيشار على اشي وبيشرح") */}
            <motion.div
              animate={{ 
                x: mousePosition.x, 
                y: mousePosition.y 
              }}
              transition={{ 
                type: 'spring', 
                damping: 24, 
                stiffness: 120 
              }}
              className="absolute top-0 left-0 -translate-x-3 -translate-y-3 z-[9995] pointer-events-none flex flex-col items-center"
            >
              {/* Virtual Cursor Icon */}
              <div className="relative">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_4px_16px_rgba(6,182,212,0.7)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 3.5L18.5 13.5L12 14.5L15 20.5L12.5 21.5L9.5 15.5L5.5 18.5V3.5Z"
                    fill="#06B6D4"
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Pulsing Target Halo */}
                <motion.div
                  animate={{ scale: [1, 2.2, 1], opacity: [0.85, 0, 0.85] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="absolute -top-2 -left-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-cyan-400 pointer-events-none"
                />

                {/* Click Ripple Wave */}
                {isClicking && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-cyan-400"
                  />
                )}
              </div>

              {/* Cursor Label Badge */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 text-cyan-300 text-[10px] font-bold border border-cyan-400/40 shadow-xl backdrop-blur-md whitespace-nowrap"
              >
                {currentMilestone.title.slice(0, 22)}...
              </motion.div>
            </motion.div>

            {/* Floating Tour Explanation Card (Responsive: Bottom-docked on mobile, centered on desktop) */}
            <div className="absolute bottom-4 inset-x-3 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 max-w-xl w-full z-[9998] pointer-events-auto">
              <motion.div
                key={currentMilestone.id}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-2xl text-slate-100 space-y-3.5"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-400/30">
                      {React.createElement(currentMilestone.icon, { className: 'w-4 h-4' })}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/15 text-cyan-300 border-none text-[10px] font-bold">
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

                  {/* Audio Mute & Stop & Pause Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const newMuted = !isAudioMuted;
                        setIsAudioMuted(newMuted);
                        if (newMuted) stopSpeech();
                        else speakText(currentMilestone.voiceText);
                      }}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-white"
                      title={isAudioMuted ? 'تشغيل الصوت النقي' : 'كتم الصوت'}
                    >
                      {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </Button>

                    {/* Pause / Resume Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={togglePause}
                      className="h-8 px-2.5 rounded-xl border-slate-700 text-slate-200 text-xs gap-1"
                      title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
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
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentStepIndex
                            ? 'w-6 bg-gradient-to-r from-cyan-400 to-blue-500'
                            : idx < currentStepIndex
                            ? 'w-2 bg-cyan-400/80'
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
