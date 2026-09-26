import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Atom, 
  Cpu, 
  HeartHandshake, 
  Bot, 
  ShieldCheck, 
  Compass, 
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TourChapter {
  id: number;
  badge: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  description: string;
  keyFeatures: string[];
  ctaText: string;
  ctaRoute: string;
  accent: string;
}

export const openInteractiveTourModal = () => {
  window.dispatchEvent(new CustomEvent('galaxy_open_tour_modal'));
};

export const InteractiveTourGuideModal: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('galaxy_open_tour_modal', handleOpen);
    return () => window.removeEventListener('galaxy_open_tour_modal', handleOpen);
  }, []);

  const chapters: TourChapter[] = [
    {
      id: 1,
      badge: 'الفصل الأول • الركيزة الأساسية',
      title: 'المختبرات والمحاكاة العلمية 3D',
      tagline: 'أكثر من 49 مختبراً افتراضياً عالي الدقة في متناول يدك',
      icon: Atom,
      description: 'استكشف عوالم الفيزياء والكيمياء والأحياء بدقة حسابية 99.8%. من تجربة الشق المزدوج وميكانيكا الكم، إلى بناء الذرة وتفاعلات كريسبر الجينية وميكانيكا الموائع.',
      keyFeatures: [
        'معايرة فيزيائية دقيقة وفق معايير CODATA و IUPAC',
        'مشاهد ثلاثية الأبعاد 360 درجة مع تحكم حر بالمتغيرات',
        'تصدير فوري للبيانات والرسوم البيانية إلى تقارير PDF'
      ],
      ctaText: 'استكشف دليل المختبرات الـ 49',
      ctaRoute: '/experiments-section',
      accent: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900'
    },
    {
      id: 2,
      badge: 'الفصل الثاني • الهندسة المستقبلية',
      title: 'الروبوتات، الأتمتة والذكاء الاصطناعي 2.0',
      tagline: 'ربط الحركيات الهندسية بنظام ROS 2 والـ LiDAR',
      icon: Cpu,
      headline: 'بيئة هندسية وتطبيقية لطلبة الجامعات والـ BTEC',
      description: 'حساب زوايا المفاصل وإحداثيات نقطة العمل للأذرع الروبوتية، محاكاة الملاحة الذاتية 360 درجة بمستشعرات LiDAR، وتشغيل أكواد Python الحقيقية.',
      keyFeatures: [
        'محاكي Kinematics مباشر وعكسي للأذرع الروبوتية',
        'رادار LiDAR ثلاثي الأبعاد لاكتشاف العوائق وتوليد الخرائط',
        'استوديو برمجي تفاعلي مع طرفية تنفيذ أوامر لحظية'
      ],
      ctaText: 'فتح قسم الروبوتات والذكاء الاصطناعي',
      ctaRoute: '/robotics-section',
      accent: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900'
    },
    {
      id: 3,
      badge: 'الفصل الثالث • الشمولية الوطنية',
      title: 'مشروع «دامج» الوطني للتربية الخاصة',
      tagline: 'التقنيات المساعدة المعتمدة عالمياً لذوي الإعاقة',
      icon: HeartHandshake,
      description: 'نظام متكامل يضم أول مترجم لغة إشارة عربي بالرؤية الحاسوبية على الحافة، مترجم برايل اللمسي والصوتي، ومحرك التكيف الحسي للحد من التشتت لطيف التوحد وفرط الحركة.',
      keyFeatures: [
        'مترجم لغة الإشارة الفوري بالكاميرا دون تخزين للفيديو',
        'بروتوكول برايل اللمسي الموحد مع التغذية الراجعة الصوتية',
        'أدوات فحص وتشخيص تكيّفية معتمدة طبياً'
      ],
      ctaText: 'زيارة بوابة دامج للتربية الخاصة',
      ctaRoute: '/damij',
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900'
    },
    {
      id: 4,
      badge: 'الفصل الرابع • الذكاء التوليدي',
      title: 'المرشد الذكي والمساعد المعرفي الشخصي',
      tagline: 'شريك دراسي يرافقك صوتياً ونصياً في كل تجربة',
      icon: Bot,
      description: 'مرشد ذكي مدرب على المناهج والمراجع المعتمدة، يستمع لاستفساراتك الصوتية، يشرح المعادلات والظواهر، ويقدم تغذية راجعة فورية لتصحيح المفاهيم الخاطئة.',
      keyFeatures: [
        'دعم التحدث والاستماع الصوتي باللغة العربية الفصحى',
        'تحليل فوري لقراءات التجارب وحساب طاقة الفوتونات والقوى',
        'كبسولة تفاعلية مدمجة متاحة في جميع صفحات المنصة'
      ],
      ctaText: 'التحدث مع المرشد الذكي',
      ctaRoute: '/ai-assistant-section',
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900'
    },
    {
      id: 5,
      badge: 'الفصل الخامس • الاعتماد الأكاديمي',
      title: 'السيادة المعرفية والمركز الإداري',
      tagline: 'بنية تحتية موثوقة تلائم المدارس والجامعات',
      icon: ShieldCheck,
      description: 'منظومة حائزة على جوائز وطنية بالتعاون مع وزارة التربية والتعليم والجامعة الألمانية الأردنية (GJU)، مع مركز تحكم متطور وسجل تدقيق نشاط فوري لحماية البيانات.',
      keyFeatures: [
        'مستودع بحثي يضم 200+ ورقة علمية ومرجعاً معتمداً',
        'مركز تحكم إداري بمستويات صلاحيات دقيقة للمشرفين',
        'تصميم متجاوب بالكامل وسريع جداً على كافة الأجهزة الذكية'
      ],
      ctaText: 'استكشاف التوثيق والمراجع الأكاديمية',
      ctaRoute: '/damij/sources',
      accent: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900'
    }
  ];

  const chapter = chapters[currentStep];
  const Icon = chapter.icon;

  const handleNext = () => {
    if (currentStep < chapters.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToRoute = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-right font-sans"
          >
            {/* Top Navigation & Progress Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${chapter.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block font-mono">
                    {chapter.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    الخطوة {currentStep + 1} من {chapters.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
              {chapters.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-full flex-1 transition-all duration-300 ${
                    idx <= currentStep ? 'bg-blue-600 dark:bg-blue-500' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Body Content */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[65vh]">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {chapter.title}
                </h3>
                <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                  {chapter.tagline}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {chapter.description}
                </p>
              </div>

              {/* 3 Key Capabilities Pills */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  أهم الإمكانيات والابتكارات في هذا الفصل:
                </span>
                {chapter.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Direct Launch CTA */}
              <div className="pt-2">
                <Button
                  onClick={() => handleGoToRoute(chapter.ctaRoute)}
                  className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <span>{chapter.ctaText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentStep === 0}
                onClick={handlePrev}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                <span>السابق</span>
              </Button>

              <div className="flex gap-1.5">
                {chapters.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep ? 'w-6 bg-blue-600 dark:bg-blue-400' : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleNext}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs px-4"
              >
                <span>{currentStep === chapters.length - 1 ? 'إنهاء الجولة' : 'التالي'}</span>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveTourGuideModal;
