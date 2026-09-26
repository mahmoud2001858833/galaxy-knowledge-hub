import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  BookIcon, 
  CalendarDays, 
  Puzzle, 
  Video, 
  Atom, 
  FileText, 
  Brain, 
  Sparkles, 
  Award,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const EducationalResources = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const resources = [
    {
      title: 'إنشاء الصور التعليمية بالذكاء الاصطناعي',
      icon: Sparkles,
      description: 'أنشئ رسومات ومخططات تعليمية عالية الدقة باستخدام الذكاء الاصطناعي',
      link: '/ai-image-generator',
      accent: 'from-pink-500 to-rose-500',
      badge: 'توليد ذكي'
    },
    {
      title: 'نظام المراجعة الذكي (Spaced Repetition)',
      icon: Brain,
      description: 'جدول وخوارزمية مراجعة علمية مثبتة لترسيخ المعلومات ومكافحة النسيان',
      link: '/spaced-repetition',
      accent: 'from-indigo-500 to-violet-500',
      badge: 'تثبيت الحفظ'
    },
    {
      title: 'منظم ومخطط الدراسة التفاعلي',
      icon: CalendarDays,
      description: 'أدوات ذكية لتخطيط المذاكرة وجدولة الحصص بكفاءة عالية',
      link: '/study-organization',
      accent: 'from-purple-500 to-pink-500',
      badge: 'إدارة الوقت'
    },
    {
      title: 'المجلة العلمية والأبحاث',
      icon: BookIcon,
      description: 'مقالات وأبحاث علمية منتقاة بعناية لتعميق الفهم وتوسيع المدارك',
      link: '/scientific-journal',
      accent: 'from-blue-500 to-cyan-500',
      badge: 'أبحاث ومقالات'
    },
    {
      title: 'المكتبة البصرية التعليمية',
      icon: BookOpen,
      description: 'رسومات ثلاثية الأبعاد ومخططات توضيحية لتبسيط أعتى النظريات',
      link: '/visual-library',
      accent: 'from-emerald-500 to-teal-500',
      badge: 'مكتبة مرئية'
    },
    {
      title: 'بنك الألغاز والتحديات العلمية',
      icon: Puzzle,
      description: 'تحديات فكرية وألغاز تفاعلية ممتعة في الرياضيات والعلوم والمنطق',
      link: '/subject-puzzles',
      accent: 'from-amber-500 to-orange-500',
      badge: 'تفكير نقدي'
    },
    {
      title: 'المحاكاة والتجارب العلمية التفاعلية',
      icon: Atom,
      description: 'مختبر رقمي كامل لإجراء التجارب المعملية بدون مخاطر',
      link: '/scientific-simulations',
      accent: 'from-teal-500 to-cyan-500',
      badge: 'مختبر رقمي'
    },
    {
      title: 'المساعد الطبي المدرسي',
      icon: Video,
      description: 'دليل شامل وبروتوكولات تفاعلية للتعامل مع الإسعافات والحالات الطارئة',
      link: '/medical-assistant',
      accent: 'from-rose-500 to-red-600',
      badge: 'صحة ورعاية'
    },
    {
      title: 'إنجازات المعلمين والمنصة',
      icon: Award,
      description: 'لوحة شرف تبرز إسهامات المعلمين والمبدعين في تطوير المنصة',
      link: '/teacher-achievements',
      accent: 'from-amber-500 to-yellow-500',
      badge: 'لوحة الشرف'
    },
    {
      title: 'توثيق المنصة الشامل',
      icon: FileText,
      description: 'دليل مفصل وتوثيق تقني لجميع الميزات والأدوات ومصادر التعلم',
      link: '/platform-documentation',
      accent: 'from-slate-400 to-slate-600',
      badge: 'دليل المستخدم'
    },
  ];

  return (
    <section
      className="py-20 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir={dir}
    >
      <div className="mb-14 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-slate-900 to-cyan-700 dark:from-blue-300 dark:via-white dark:to-cyan-300 mb-4 tracking-tight">
          الموارد والأدوات التعليمية الذكية
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full shadow-lg shadow-cyan-500/50 mb-4" />
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base sm:text-lg">
          أدوات مبتكرة ومساعدة ترافقك لتعزيز الفهم والاستيعاب ورفع كفاءتك الدراسية
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {resources.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              onClick={() => navigate(item.link)}
              className="group relative p-6 rounded-2xl bg-white/90 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.accent} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300/80 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                <span>انتقال سريع</span>
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default EducationalResources;
