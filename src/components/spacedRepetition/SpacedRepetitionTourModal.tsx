import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Calendar, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Lightbulb, 
  Award, 
  RotateCw,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TourStep {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  content: string;
  highlightPoints: string[];
  scientificFact: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'مرحباً بك في نظام المراجعة الذكي والتكرار المتباعد',
    subtitle: 'العلم وراء تحويل المعلومات إلى الذاكرة الدائمة',
    badge: 'الخطوة 1 من 5',
    icon: Brain,
    color: 'from-cyan-500 to-blue-600',
    content: 'يعتمد هذا النظام على اكتشاف العالم الألماني هيرمان إبنجهاوس (منحنى النسيان): ينسى الإنسان ما يقارب 70% من أي معلومة جديدة خلال 24 ساعة إذا لم تتم مراجعتها. باستخدام هذا النظام، ستراجع الدروس في اللحظات الدقيقة قبل نسيانها لتثبيتها بنسبة تصل إلى 95%!',
    highlightPoints: [
      'توفير 60% من وقت وجهد الاستذكار التقليدي العشوائي',
      'بناء ذاكرة حديدية للامتحانات الوزارية والنهائية',
      'الانتقال من الحفظ المؤقت إلى الفهم العميق الراسخ'
    ],
    scientificFact: '💡 دراسات علم الأعصاب تثبت أن 8 مراجعات متباعدة تعادل 50 ساعة من الدراسة المتواصلة ليلة الامتحان.'
  },
  {
    title: 'الفواصل الزمنية العلمية (8 مراجعات استراتيجية)',
    subtitle: 'جدولة آلية محسوبة بالثانية لكل درس',
    badge: 'الخطوة 2 من 5',
    icon: Clock,
    color: 'from-blue-500 to-cyan-600',
    content: 'بمجرد تسجيل أي درس جديد، يتولى المحرك الذكي توليد جدول مراجعات دقيق يمتد عبر 8 فترات زمنية علمية متدرجة:',
    highlightPoints: [
      'المراجعة 1: بعد 24 ساعة (تثبيت الانطباع الأول)',
      'المراجعات 2 و 3: بعد 3 و 6 أيام (تجاوز عنق الزجاجة للنسيان)',
      'المراجعات 4 و 5: بعد 10 و 15 يوماً (تكوين الروابط العصبية)',
      'المراجعات 6 و 7 و 8: بعد 21 و 30 و 45 يوماً (الاستقرار في الذاكرة الدائمة مدى الحياة)'
    ],
    scientificFact: '⚡ تتباعد الفترات لأن الدماغ يحتاج زمناً أطول لنسيان المعلومة في كل مرة تُعاد فيها مراجعتها بنجاح.'
  },
  {
    title: 'مهمات اليوم وبناء سلسلة الالتزام (Daily Streak)',
    subtitle: 'لا تراكم الدروس، أنجز مهماتك اليومية أولاً بأول',
    badge: 'الخطوة 3 من 5',
    icon: Flame,
    color: 'from-orange-500 to-rose-600',
    content: 'في تبويب "مهمات اليوم"، ستجد قائمة واضحة ومحددة بالدروس المستحقة اليوم فقط مع تقدير زمني دقيق لكل مراجعة:',
    highlightPoints: [
      'إكمال المراجعة بضغطة زر وتحديث قوة الذاكرة تلقائياً',
      'حرق شعلة الالتزام اليومي (Streak 🔥) لتحفيز الاستمرارية',
      'تنبيهات فورية للمراجعات المتأخرة لمنع تراكم المواد'
    ],
    scientificFact: '🔥 الطالب الذي يحافظ على Streak لمدة 21 يوماً متتالياً تتضاعف سرعة استرجاعه للمعلومات بنسبة 300%.'
  },
  {
    title: 'بطاقات الاسترجاع النشط الذكية (Active Recall)',
    subtitle: 'اختبر نفسك قبل النظر إلى الحل',
    badge: 'الخطوة 4 من 5',
    icon: Layers,
    color: 'from-blue-600 to-teal-600',
    content: 'أقوى وسيلة للاستذكار عالمياً هي "الاسترجاع النشط". يوفر لك النظام استوديو بطاقات تعليمية فلاشكارد ذكية:',
    highlightPoints: [
      'انقر لقلب البطاقة وقراءة المفاهيم والقوانين والمسائل',
      'قيّم سهولة الاسترجاع: (سهل 🟢 / جيد 🟡 / صعب 🔴)',
      'النظام يكيف موعد المراجعة القادم وفق تقييمك الحقيقي'
    ],
    scientificFact: '🧠 قراءة الملاحظات سلبياً تثبت 10% فقط، بينما اختبار النفس بالبطاقات النشطة يثبت 85% من المحتوى.'
  },
  {
    title: 'التقويم، التحليلات، وتصدير الجداول',
    subtitle: 'رؤية بصرية شاملة لمستقبلك الدراسي',
    badge: 'الخطوة 5 من 5',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-600',
    content: 'راقب تطور قوة ذاكرتك لحظياً، استعرض مواعيد مراجعاتك في تقويم شهري ملون، وقم بتصدير جدولك بضغطة زر:',
    highlightPoints: [
      'منحنى النسيان التفاعلي يرسم مسار حفظ كل درس بدقة',
      'تصدير الخطة إلى Excel، تقويم Google، أو ملف PDF جاهز للطباعة',
      'تحليلات بيانية للأداء حسب المادة ومعدل إكمال المهام'
    ],
    scientificFact: '🌟 أنت الآن جاهز لبدء تجربة دراسية فائقة الذكاء تجعل التفوق حليفك الدائم!'
  }
];

interface SpacedRepetitionTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpacedRepetitionTourModal: React.FC<SpacedRepetitionTourModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('galaxy_spaced_rep_tour_completed', 'true');
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    localStorage.setItem('galaxy_spaced_rep_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Top Header Background Banner */}
        <div className={`p-6 bg-gradient-to-r ${currentStep.color} text-white relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30">
              {currentStep.badge}
            </span>

            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="تخطي الجولة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            {currentStep.content}
          </p>

          {/* Highlight Bullet Points */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            {currentStep.highlightPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{point}</span>
              </div>
            ))}
          </div>

          {/* Scientific Fact Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-[12px] text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
            <span>{currentStep.scientificFact}</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {/* Step Indicators Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-7 bg-indigo-600 dark:bg-indigo-400'
                    : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`الخطوة ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                onClick={handlePrev}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1 border-slate-300 dark:border-slate-700"
              >
                <ArrowRight className="w-4 h-4 ml-1" />
                <span>السابق</span>
              </Button>
            )}

            <Button
              onClick={handleNext}
              size="sm"
              className="rounded-xl text-xs gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/25 px-5"
            >
              <span>{isLast ? 'ابدأ الاستذكار الآن 🚀' : 'التالي'}</span>
              {!isLast && <ArrowLeft className="w-4 h-4 mr-1" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
