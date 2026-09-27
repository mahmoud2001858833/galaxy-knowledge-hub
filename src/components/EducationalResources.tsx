import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  BookIcon, 
  CalendarDays, 
  Puzzle, 
  Video, 
  FileText, 
  Brain, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Wand2,
  Flame,
  Stethoscope,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EducationalResourceItem {
  id: string;
  title: string;
  category: 'ai' | 'study' | 'knowledge' | 'health-skills';
  categoryLabel: string;
  icon: React.ElementType;
  description: string;
  link: string;
  accent: string;
  badge: string;
  features: string[];
}

const EducationalResources: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  let dir = 'rtl';
  try {
    const lang = useLanguage();
    if (lang && lang.dir) dir = lang.dir;
  } catch {
    dir = 'rtl';
  }
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const resources: EducationalResourceItem[] = [
    // 1. الذكاء الاصطناعي والتوليد
    {
      id: 'ai-image',
      title: 'إنشاء الصور والرسوم بالذكاء الاصطناعي',
      category: 'ai',
      categoryLabel: 'توليد ذكي ومخططات',
      icon: Sparkles,
      description: 'أنشئ رسومات علمية ومخططات توضيحية فائقة الدقة بلمسة واحدة باستخدام نماذج الذكاء الاصطناعي التوليدية.',
      link: '/ai-image-generator',
      accent: 'from-pink-500 to-rose-600',
      badge: 'توليد AI',
      features: ['توليد مخططات دقيقة للمناهج', 'تصدير بجودة فائقة بدقة 4K']
    },
    // 2. إدارة الوقت والاستذكار
    {
      id: 'spaced-rep',
      title: 'نظام المراجعة الذكي (Spaced Repetition)',
      category: 'study',
      categoryLabel: 'تثبيت الحفظ والاستذكار',
      icon: Brain,
      description: 'خوارزمية علمية مثبتة (SM-2) تجدول مراجعاتك في الأوقات المثالية لترسيخ المعلومات ومكافحة منحنى النسيان.',
      link: '/spaced-repetition',
      accent: 'from-indigo-500 to-violet-600',
      badge: 'مكافحة النسيان',
      features: ['جدولة آلية حسب صعوبة المعلومة', 'بطاقات استذكار Flashcards تفاعلية']
    },
    {
      id: 'study-org',
      title: 'منظم ومخطط الدراسة التفاعلي',
      category: 'study',
      categoryLabel: 'إدارة الوقت والتفوق',
      icon: CalendarDays,
      description: 'أداة مرنة لبناء جدول مذاكرة متوازن، تتبع إنجاز الحصص والواجبات اليومية، ومؤقت بومودورو للتركيز الأقصى.',
      link: '/study-organization',
      accent: 'from-purple-500 to-pink-600',
      badge: 'تنظيم الحصص',
      features: ['صانع جداول المذاكرة الذكية', 'مؤقت بومودورو وتتبع المهام']
    },
    // 3. المكتبات والأبحاث
    {
      id: 'visual-lib',
      title: 'المكتبة البصرية العلمية 3D',
      category: 'knowledge',
      categoryLabel: 'مكتبات ومراجع مرئية',
      icon: BookOpen,
      description: 'مجسمات تفاعلية ثلاثية الأبعاد ومخططات تشريحية عالية الدقة لتبسيط أعتى النظريات الفيزيائية والكيميائية والبيولوجية.',
      link: '/visual-library',
      accent: 'from-emerald-500 to-teal-600',
      badge: 'مكتبة مرئية 3D',
      features: ['تشريح الأعضاء والخلايا 3D', 'مخططات التركيب الذري والجزيئي']
    },
    {
      id: 'sci-journal',
      title: 'المجلة العلمية والأبحاث المحكمة',
      category: 'knowledge',
      categoryLabel: 'أبحاث ودراسات معاصرة',
      icon: BookIcon,
      description: 'مقالات وأبحاث علمية منتقاة بعناية لتعميق الفهم وتوسيع المدارك ومتابعة آخر اكتشافات الفلك والتقنيات الحديثة.',
      link: '/scientific-journal',
      accent: 'from-blue-500 to-cyan-600',
      badge: 'أبحاث ومقالات',
      features: ['أحدث اكتشافات الفلك والفيزياء', 'مقالات بقلم أساتذة ومختصين']
    },
    // 4. الرعاية والتحديات الفكرية
    {
      id: 'puzzles',
      title: 'بنك ودوري الألغاز والتحديات الفكرية',
      category: 'health-skills',
      categoryLabel: 'تفكير نقدي وتنافس',
      icon: Puzzle,
      description: 'تحديات فكرية وألغاز تفاعلية مشوقة في الرياضيات والفيزياء والمنطق مع نظام نقاط وأوسمة لتعزيز التنافس الإيجابي.',
      link: '/subject-puzzles',
      accent: 'from-amber-500 to-orange-600',
      badge: 'تفكير نقدي',
      features: ['ألغاز رياضية ومنطقية متدرجة', 'لوحة صدارة الأبطال وأوسمة التميز']
    },
    {
      id: 'medical-asst',
      title: 'المساعد الطبي المدرسي وطوارئ المدارس',
      category: 'health-skills',
      categoryLabel: 'صحة مدرسية ورعاية',
      icon: Stethoscope,
      description: 'دليل تفاعلي شامل لإسعاف الحالات المدرسية الطارئة، فحص فوري بالكاميرا، وإرشادات سريعة ليعرف الطالب والمعلم كيفية التصرف.',
      link: '/medical-assistant',
      accent: 'from-rose-500 to-red-600',
      badge: 'إسعافات وطوارئ',
      features: ['كاشف الحالات عبر الكاميرا', 'بروتوكولات الإسعاف الفوري المعتمدة']
    },
    {
      id: 'platform-docs',
      title: 'دليل وتوثيق المنصة الشامل',
      category: 'health-skills',
      categoryLabel: 'دليل المستخدم والتقنية',
      icon: FileText,
      description: 'دليل مفصل وتوثيق تقني شامل لجميع الميزات والأدوات ومصادر التعلم لتسهيل الاستفادة القصوى من المنظومة.',
      link: '/platform-documentation',
      accent: 'from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600',
      badge: 'دليل الاستخدام',
      features: ['شرح تفصيلي لكافة الأقسام', 'إرشادات المعلمين والطلاب الفنية']
    },
  ];

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'all') return resources;
    return resources.filter(r => r.category === selectedCategory);
  }, [selectedCategory, resources]);

  return (
    <section
      className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir={dir}
    >
      {/* Header with Luxury SaaS Alignment */}
      <div className="mb-12 text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>حقيبة الأدوات والإنتاجية الأكاديمية المتطورة</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          الموارد والأدوات التعليمية الذكية
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
          منظومة أدوات رقمية مساندة صُممت لرفع كفاءة الاستذكار، تنظيم الجداول الدراسية، وتنمية مهارات التفكير العلمي بأعلى درجات السهولة.
        </p>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            جميع الأدوات ({resources.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'ai'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            ✨ الذكاء الاصطناعي والتوليد
          </button>
          <button
            onClick={() => setSelectedCategory('study')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'study'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            🧠 إدارة الوقت والاستذكار
          </button>
          <button
            onClick={() => setSelectedCategory('knowledge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'knowledge'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            📚 المكتبات والأبحاث
          </button>
          <button
            onClick={() => setSelectedCategory('health-skills')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'health-skills'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            🩺 الرعاية والتحديات
          </button>
        </div>
      </div>

      {/* Luxury Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {filteredResources.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                onClick={() => navigate(item.link)}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Bar: Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-13 h-13 p-3 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.accent} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Highlights Checklist */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-2">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  <span>فتح الأداة</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-[-1px] rtl:group-hover:translate-x-[1px] transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EducationalResources;
