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
  ChevronLeft,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ArrowUpDown
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  order: number;
}

const EducationalResources: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'alpha' | 'category'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
      description: 'أنشئ رسومات علمية ومخططات توضيحية فائقة الدقة بلمسة واحدة باستخدام نماذج الذكاء الاصطناعي التوليدية المخصصة للمناهج.',
      link: '/ai-image-generator',
      accent: 'from-blue-600 to-cyan-600',
      badge: 'توليد AI',
      features: ['توليد مخططات دقيقة للمناهج', 'تصدير بجودة فائقة بدقة 4K'],
      order: 1
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
      accent: 'from-blue-700 to-indigo-700',
      badge: 'مكافحة النسيان',
      features: ['جدولة آلية حسب صعوبة المعلومة', 'بطاقات استذكار Flashcards تفاعلية'],
      order: 2
    },
    {
      id: 'study-org',
      title: 'منظم ومخطط الدراسة التفاعلي',
      category: 'study',
      categoryLabel: 'إدارة الوقت والتفوق',
      icon: CalendarDays,
      description: 'أداة مرنة لبناء جدول مذاكرة متوازن، تتبع إنجاز الحصص والواجبات اليومية، ومؤقت بومودورو للتركيز الأقصى.',
      link: '/study-organization',
      accent: 'from-teal-600 to-emerald-600',
      badge: 'تنظيم الحصص',
      features: ['صانع جداول المذاكرة الذكية', 'مؤقت بومودورو وتتبع المهام'],
      order: 3
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
      accent: 'from-emerald-600 to-teal-700',
      badge: 'مكتبة مرئية 3D',
      features: ['تشريح الأعضاء والخلايا 3D', 'مخططات التركيب الذري والجزيئي'],
      order: 4
    },
    {
      id: 'sci-journal',
      title: 'المجلة العلمية والأبحاث المحكمة',
      category: 'knowledge',
      categoryLabel: 'أبحاث ودراسات معاصرة',
      icon: BookIcon,
      description: 'مقالات وأبحاث علمية منتقاة بعناية لتعميق الفهم وتوسيع المدارك ومتابعة آخر اكتشافات الفلك والتقنيات الحديثة.',
      link: '/scientific-journal',
      accent: 'from-blue-600 to-cyan-700',
      badge: 'أبحاث ومقالات',
      features: ['أحدث اكتشافات الفلك والفيزياء', 'مقالات بقلم أساتذة ومختصين'],
      order: 5
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
      accent: 'from-amber-500 to-amber-700',
      badge: 'تفكير نقدي',
      features: ['ألغاز رياضية ومنطقية متدرجة', 'لوحة صدارة الأبطال وأوسمة التميز'],
      order: 6
    },
    {
      id: 'medical-asst',
      title: 'المساعد الطبي المدرسي وطوارئ المدارس',
      category: 'health-skills',
      categoryLabel: 'صحة مدرسية ورعاية',
      icon: Stethoscope,
      description: 'دليل تفاعلي شامل لإسعاف الحالات المدرسية الطارئة، فحص فوري بالكاميرا، وإرشادات سريعة ليعرف الطالب والمعلم كيفية التصرف.',
      link: '/medical-assistant',
      accent: 'from-rose-600 to-red-700',
      badge: 'إسعافات وطوارئ',
      features: ['كاشف الحالات عبر الكاميرا', 'بروتوكولات الإسعاف الفوري المعتمدة'],
      order: 7
    },
    {
      id: 'platform-docs',
      title: 'دليل وتوثيق المنصة الشامل',
      category: 'health-skills',
      categoryLabel: 'دليل المستخدم والتقنية',
      icon: FileText,
      description: 'دليل مفصل وتوثيق تقني شامل لجميع الميزات والأدوات ومصادر التعلم لتسهيل الاستفادة القصوى من المنظومة.',
      link: '/platform-documentation',
      accent: 'from-slate-700 to-slate-900',
      badge: 'دليل الاستخدام',
      features: ['شرح تفصيلي لكافة الأقسام', 'إرشادات المعلمين والطلاب الفنية'],
      order: 8
    },
  ];

  const filteredResources = useMemo(() => {
    return resources
      .filter(r => {
        const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery = !q || 
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q) ||
          r.features.some(f => f.toLowerCase().includes(q));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') return a.title.localeCompare(b.title, 'ar');
        if (sortBy === 'category') return a.categoryLabel.localeCompare(b.categoryLabel, 'ar');
        return a.order - b.order;
      });
  }, [selectedCategory, searchQuery, sortBy, resources]);

  return (
    <section
      className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir={dir}
    >
      {/* Header with Luxury SaaS Alignment */}
      <div className="mb-10 text-center space-y-4 max-w-3xl mx-auto">
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
            ✨ الذكاء الاصطناعي والتوليد ({resources.filter(r => r.category === 'ai').length})
          </button>
          <button
            onClick={() => setSelectedCategory('study')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'study'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            🧠 إدارة الوقت والاستذكار ({resources.filter(r => r.category === 'study').length})
          </button>
          <button
            onClick={() => setSelectedCategory('knowledge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'knowledge'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            📚 المكتبات والأبحاث ({resources.filter(r => r.category === 'knowledge').length})
          </button>
          <button
            onClick={() => setSelectedCategory('health-skills')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'health-skills'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            🩺 الرعاية والتحديات ({resources.filter(r => r.category === 'health-skills').length})
          </button>
        </div>

        {/* Search, Sort & View Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأدوات، الميزات، أو مجالات الاستخدام..."
              className="h-10 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10 pl-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-bold border-none outline-none cursor-pointer text-xs"
              >
                <option value="recommended">الأكثر استخداماً</option>
                <option value="alpha">أبجدياً (أ-ي)</option>
                <option value="category">حسب التصنيف</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="عرض الشبكة"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="عرض القائمة"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards View (Grid Mode) */}
      {viewMode === 'grid' && (
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
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  onClick={() => navigate(item.link)}
                  className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
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
      )}

      {/* Cards View (List Mode) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredResources.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => navigate(item.link)}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.accent} text-white shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
                      {item.features.map((f, i) => (
                        <span key={i} className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1.5 shrink-0">
                      <span>فتح الأداة</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty Search State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">لم يتم العثور على أداة مطابقة للبحث</h4>
          <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر "جميع الأدوات".</p>
          <Button
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="rounded-xl bg-blue-600 text-white text-xs mt-2"
          >
            إعادة تعيين البحث
          </Button>
        </div>
      )}
    </section>
  );
};

export default EducationalResources;
