import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, X, Play, Square, ChevronRight, ChevronLeft, 
  Volume2, VolumeX, Atom, Cpu, HeartHandshake, Eye, ShieldCheck, 
  CheckCircle2, ArrowUpRight, MousePointer2, Building2
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
    accentColor: 'from-blue-600 to-cyan-500',
    mouseTarget: { xPercent: 50, yPercent: 45 }
  },
  {
    id: 2,
    targetId: 'tour-stage-ecosystem',
    badge: 'المحطة الثانية • شبكة المختبرات',
    title: 'المختبرات الافتراضية التفاعلية 3D',
    description: 'أكثر من 49 محاكاة ومختبراً علمياً عالي الدقة في الفيزياء والكيمياء والأحياء، بمعايرة رياضية دقيقة 99.8% ورؤية 360 درجة.',
    voiceText: 'هنا تجدون أكثر من 49 مختبراً ومحاكاة علمية تفاعلية تغطي كافة المناهج العلمية بدقة فائقة.',
    icon: Atom,
    accentColor: 'from-cyan-500 to-blue-600',
    mouseTarget: { xPercent: 35, yPercent: 50 }
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
    mouseTarget: { xPercent: 65, yPercent: 48 }
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
    mouseTarget: { xPercent: 45, yPercent: 52 }
  },
  {
    id: 5,
    targetId: 'tour-stage-resources',
    badge: 'المحطة الخامسة • مجتمع المعرفة والألغاز',
    title: 'الألغاز التفاعلية ومساعد المنصة الذكي',
    description: 'دوري أسبوعي لحل الألغاز العلمية، لوحة متصدرين حية، ومرشد صوتي ذكي يرافق الطالب والمعلم في كل مسار تعليمي.',
    voiceText: 'دوري الألغاز العلمية والمرشد الذكي، رحلتكم التعليمية تبدأ الآن، نتمنى لكم تجربة ملهمة.',
    icon: ShieldCheck,
    accentColor: 'from-amber-500 to-yellow-500',
    mouseTarget: { xPercent: 50, yPercent: 50 }
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
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });
  const [isClicking, setIsClicking] = useState(false);

  // Auto-progress timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initial check on mount
  useEffect(() => {
    const handleOpenTrigger = () => {
      stopTour(false);
      setIsDecisionModalOpen(true);
    };

    window.addEventListener('galaxy_open_tour_welcome', handleOpenTrigger);

    // Show on first visit if not dismissed this session
    const seen = sessionStorage.getItem('galaxy_tour_decision_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setIsDecisionModalOpen(true);
      }, 1200);
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
    sessionStorage.setItem('galaxy_tour_decision_seen', 'true');
    setIsDecisionModalOpen(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);
    toast.info('بدأت الجولة التعريفية التفاعلية 🚀 يمكنك إيقافها في أي وقت');
    executeStep(0);
  };

  // Handle Choice 2: Self Exploration (Does NOTHING, closes smoothly)
  const handleSelfExploration = () => {
    sessionStorage.setItem('galaxy_tour_decision_seen', 'true');
    setIsDecisionModalOpen(false);
    toast.success('مرحباً بك! تصفح المنصة بحرية تامة 🧭');
  };

  // Stop / Exit Tour
  const stopTour = (scrollBackToTop = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stopSpeech();
    setIsTourActive(false);

    if (scrollBackToTop) {
      // Smoothly return platform back to the very top as requested
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Execute a specific tour milestone
  const executeStep = (stepIdx: number) => {
    if (stepIdx >= TOUR_MILESTONES.length) {
      // Finished all milestones!
      toast.success('اكتملت الجولة التعريفية بنجاح! نتمنى لك تجربة ممتعة في ذروة العلم 🎉');
      stopTour(true);
      return;
    }

    const milestone = TOUR_MILESTONES[stepIdx];
    setCurrentStepIndex(stepIdx);

    // 1. Scroll smoothly to target element
    if (stepIdx === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(milestone.targetId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    // 2. Animate Virtual Mouse to the section
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetX = Math.min(Math.max((viewportWidth * milestone.mouseTarget.xPercent) / 100, 80), viewportWidth - 100);
    const targetY = Math.min(Math.max((viewportHeight * milestone.mouseTarget.yPercent) / 100, 100), viewportHeight - 160);

    setMousePosition({ x: targetX, y: targetY });

    // Simulate clicking aura after mouse arrives
    setTimeout(() => {
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 500);
    }, 900);

    // 3. Audio narration (voiceover without music)
    speakText(milestone.voiceText);

    // 4. Auto-advance after 8 seconds (total tour ~40 seconds)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      executeStep(stepIdx + 1);
    }, 8500);
  };

  // Next / Previous manual controls
  const handleNextStep = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    executeStep(currentStepIndex + 1);
  };

  const handlePrevStep = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md font-sans" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Ambient Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleSelfExploration}
                className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="إغلاق وتصفح بحرية"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-950 flex items-center justify-center p-2.5">
                    <img src="/logo.png" alt="ذروة العلم" className="w-full h-full object-contain" />
                  </div>
                </div>

                <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold px-3 py-1">
                  المنظومة الوطنية للتعليم التفاعلي 2.0
                </Badge>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  أهلاً بك في ذروة العلم
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  اختر الطريقة التي تفضلها للبدء: جولة ذكية موجهة وسريعة بصحبة مؤشر تفاعلي، أو الاستكشاف الذاتي المباشر.
                </p>
              </div>

              {/* Two Distinct Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {/* Option 1: Start Guided Tour */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGuidedTour}
                  className="group relative p-5 rounded-2xl cursor-pointer border-2 border-cyan-500/40 hover:border-cyan-500 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent dark:from-cyan-950/30 dark:hover:bg-cyan-950/50 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      بدء الجولة التعريفية
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      جولة مرئية سلسة (40 ثانية) مع مؤشر ذكي يوضح لك أهم الأقسام والمختبرات ثلاثية الأبعاد خطوة بخطوة.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    <span>انطلاق الجولة 🚀</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </motion.div>

                {/* Option 2: Self-Exploration */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSelfExploration}
                  className="group relative p-5 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      الاستكشاف الذاتي
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      تصفح المنصة بمفردك وحرية تامة دون أي إرشادات موجهة أو تنقلات تلقائية.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>تصفح بحرية 🧭</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Micro Notice */}
              <div className="text-center text-[10px] text-slate-400">
                يمكنك إعادة تشغيل الجولة التعريفية في أي وقت من زر المنصة العلوي
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Active Guided Tour Engine with Virtual Mouse & Floating Explanation */}
      <AnimatePresence>
        {isTourActive && currentMilestone && (
          <div className="fixed inset-0 pointer-events-none z-[9990] font-sans" dir="rtl">
            {/* Darkened subtle backdrop highlight */}
            <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />

            {/* Virtual Mouse Pointer ("ماوس هيك بيشار على اشي وبيشرح") */}
            <motion.div
              animate={{ 
                x: mousePosition.x, 
                y: mousePosition.y 
              }}
              transition={{ 
                type: 'spring', 
                damping: 26, 
                stiffness: 140 
              }}
              className="absolute top-0 left-0 -translate-x-3 -translate-y-3 z-[9995] pointer-events-none flex flex-col items-center"
            >
              {/* Virtual Cursor Icon */}
              <div className="relative">
                <svg
                  className="w-10 h-10 drop-shadow-[0_4px_12px_rgba(6,182,212,0.6)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 3.5L18.5 13.5L12 14.5L15 20.5L12.5 21.5L9.5 15.5L5.5 18.5V3.5Z"
                    fill="#06B6D4"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Pulsing Target Halo */}
                <motion.div
                  animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute -top-2 -left-2 w-14 h-14 rounded-full border-2 border-cyan-400 pointer-events-none"
                />

                {/* Click Ripple wave */}
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
                className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 text-[10px] font-bold border border-cyan-400/40 shadow-lg backdrop-blur-md whitespace-nowrap"
              >
                المؤشر الذكي • {currentMilestone.title.slice(0, 22)}...
              </motion.div>
            </motion.div>

            {/* Floating Tour Explanation Card (Bottom-centered / Responsive) */}
            <div className="absolute bottom-5 inset-x-4 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 max-w-xl w-full z-[9998] pointer-events-auto">
              <motion.div
                key={currentMilestone.id}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl backdrop-blur-xl space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20">
                      {React.createElement(currentMilestone.icon, { className: 'w-4 h-4' })}
                    </span>
                    <div>
                      <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-none text-[10px] font-bold">
                        {currentMilestone.badge}
                      </Badge>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {currentMilestone.title}
                      </h4>
                    </div>
                  </div>

                  {/* Audio Mute & Stop Button */}
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
                      className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title={isAudioMuted ? 'تشغيل التعليق الصوتي' : 'كتم الصوت'}
                    >
                      {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-500" />}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => stopTour(true)}
                      className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1 shadow-md shadow-rose-600/20"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>إيقاف الجولة</span>
                    </Button>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentMilestone.description}
                </p>

                {/* Progress bar & navigation controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {TOUR_MILESTONES.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentStepIndex
                            ? 'w-6 bg-gradient-to-r from-cyan-500 to-blue-600'
                            : idx < currentStepIndex
                            ? 'w-2 bg-cyan-400'
                            : 'w-2 bg-slate-200 dark:bg-slate-700'
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
                      className="h-8 px-2.5 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
                    >
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      السابق
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleNextStep}
                      className="h-8 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    >
                      <span>{currentStepIndex === TOUR_MILESTONES.length - 1 ? 'إنهاء والعودة للأعلى' : 'التالي'}</span>
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
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
