import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Atom, 
  GraduationCap, 
  Sparkles, 
  Building2, 
  HeartHandshake, 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Layers,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Bot
} from 'lucide-react';

// Bespoke 16:9 high-resolution images for each platform section
import simulationsBg from '@/assets/simulations-3d-section.jpg';
import damijBg from '@/assets/damij-section.jpg';
import educationBg from '@/assets/education-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';
import smartCityBg from '@/assets/smart-city-section.jpg';
import sourcesLibraryBg from '@/assets/sources-library-section.jpg';
import roboticsBg from '@/assets/robotics-ai-section.jpg';

const clickSound = '/message-notification.mp3';

const PlatformCategories: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const categories = [
    {
      id: 'experiments',
      title: 'قسم التجارب والمحاكاة 3D',
      subtitle: 'مختبرات افتراضية ثلاثية الأبعاد فائقة الدقة',
      icon: Atom,
      description: 'أكثر من 45 محاكاة تفاعلية ثلاثية الأبعاد تغطي ميكانيكا الكم، الفيزياء النووية، كريسبر، الثقوب السوداء والكيمياء الحركية مع تحكم فيزيائي فوري وتصدير قياسات.',
      image: simulationsBg,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      accentColor: 'from-cyan-400 via-blue-400 to-indigo-400',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-cyan-500/20',
      glowColor: 'hover:shadow-cyan-500/20',
      badge: '49 محاكاة تفاعلية',
      badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
      highlights: ['ميكانيكا الكم والنسبية', 'كريسبر والجينات', 'الثقوب السوداء والدوائر'],
      link: '/experiments-section'
    },
    {
      id: 'damij',
      title: 'منصة دامج — التعليم الخاص والدمج الذكي',
      subtitle: 'التقنيات المساعدة وحلول الشمولية الذكية',
      icon: HeartHandshake,
      description: 'منظومة رائدة تدمج مترجم لغة الإشارة الذكي بالكاميرا، مترجم برايل اللمسي والصوتي، التشخيص التفريقي لاضطراب فرط الحركة ADHD، وأدوات دعم طيف التوحد.',
      image: damijBg,
      gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      accentColor: 'from-teal-400 via-emerald-400 to-cyan-400',
      borderColor: 'border-teal-500/30 hover:border-teal-400',
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40 shadow-teal-500/20',
      glowColor: 'hover:shadow-teal-500/20',
      badge: 'شامل ومستقل',
      badgeColor: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
      highlights: ['مترجم برايل التفاعلي', 'كاشف لغة الإشارة بالذكاء الاصطناعي', 'فحص التوحد وADHD'],
      link: '/damij'
    },
    {
      id: 'education',
      title: 'قسم التعليم الشامل',
      subtitle: 'المناهج العلمية والأدبية والتطبيقية',
      icon: GraduationCap,
      description: 'منصات ومسارات تعليمية متكاملة تشمل العلوم العامة، الرياضيات والفيزياء، الأدب واللغات، الاستدامة البيئية، وبرامج BTEC الدولية لتكنولوجيا المعلومات.',
      image: educationBg,
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      accentColor: 'from-blue-400 via-indigo-400 to-purple-400',
      borderColor: 'border-blue-500/30 hover:border-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-blue-500/20',
      glowColor: 'hover:shadow-blue-500/20',
      badge: '4 مسارات تعليمية',
      badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      highlights: ['العلوم الطبيعية والأدب', 'مناهج BTEC التقنية', 'الاستدامة والطاقة النظيفة'],
      link: '/education-section'
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      subtitle: 'دعم أكاديمي ونفسي مدعوم بالذكاء الاصطناعي',
      icon: Sparkles,
      description: 'مساعدون أذكياء فوريون (فالك المعرفة والمرشد النفسي) لشرح المفاهيم المعقدة خطوة بخطوة وإدارة التوتر وتوجيه مسار تعلمك بدعم من نماذج Gemini المتطورة.',
      image: aiAssistantBg,
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      accentColor: 'from-purple-400 via-pink-400 to-rose-400',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-purple-500/20',
      glowColor: 'hover:shadow-purple-500/20',
      badge: 'مدعوم بـ Gemini AI',
      badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      highlights: ['فالك المعرفة الأكاديمي', 'المرشد التفاعلي الصوتي 2.0', 'الموجه النفسي للطلاب'],
      link: '/ai-assistant-section'
    },
    {
      id: 'smart-city',
      title: 'قسم المدينة الذكية والابتكار',
      subtitle: 'المستقبل المعماري والأنظمة الروبوتية',
      icon: Building2,
      description: 'أدوات استشراف المستقبل والتصميم المعماري والديكور الداخلي بالذكاء الاصطناعي ومحاكاة الإنشاءات الروبوتية وأنظمة الطاقة المتجددة الموزعة.',
      image: smartCityBg,
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      accentColor: 'from-amber-400 via-orange-400 to-yellow-400',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-amber-500/20',
      glowColor: 'hover:shadow-amber-500/20',
      badge: 'ابتكار وهندسة',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      highlights: ['التصميم المعماري التوليدي', 'الإنشاءات الروبوتية', 'أنظمة المدن المستدامة'],
      link: '/smart-city'
    },
    {
      id: 'sources-library',
      title: 'المكتبة العلمية والمصادر الموثقة',
      subtitle: 'مراجع أكاديمية وأدلة دولية معتمدة',
      icon: BookOpen,
      description: 'أكثر من 200 مرجع علمي ودولي معتمد يشمل أبحاث APA، أدلة منظمة الصحة العالمية WHO، ومعايير W3C/WCAG مع ميزة النسخ الفوري للاقتباسات وتنزيل التقارير.',
      image: sourcesLibraryBg,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      accentColor: 'from-emerald-400 via-teal-400 to-cyan-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/20',
      glowColor: 'hover:shadow-emerald-500/20',
      badge: '200+ مرجع معتمد',
      badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      highlights: ['أبحاث محكّمة ودولية', 'اقتباس فوري بنظام APA', 'إرشادات WHO & APA'],
      link: '/damij/sources'
    },
    {
      id: 'robotics-ai',
      title: 'قسم الروبوتات والذكاء الاصطناعي',
      subtitle: 'حركيات الأذرع الروبوتية، أنظمة ROS2 والشبكات العصبية',
      icon: Cpu,
      description: 'بيئة هندسية متطورة تحاكي حركيات الأذرع الروبوتية المتقدمة (Inverse Kinematics)، وتتبع أجهزة استشعار LiDAR، وبرمجة متحكمات ROS2 بلغة Python، مع مصنفات الذكاء الاصطناعي.',
      image: roboticsBg,
      gradient: 'from-blue-600/25 via-indigo-600/15 to-transparent',
      accentColor: 'from-blue-500 via-cyan-400 to-indigo-400',
      borderColor: 'border-blue-500/30 hover:border-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-400/40 shadow-blue-500/20',
      glowColor: 'hover:shadow-blue-500/20',
      badge: 'هندسة & AI 2.0',
      badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      highlights: ['حركيات الأذرع 3D (Kinematics)', 'برمجة متحكمات ROS2 & Python', 'رؤية حاسوبية وشبكات عصبية'],
      link: '/robotics-section'
    }
  ];

  return (
    <section
      id="platform-sections"
      className="py-20 sm:py-28 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir={dir}
    >
      <audio ref={audioRef} src={clickSound} preload="none" />
      
      {/* Section Header */}
      <div className="mb-16 text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-semibold shadow-md dark:shadow-lg shadow-cyan-500/10 backdrop-blur-md"
        >
          <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <span>منظومة متكاملة للمعرفة والتقنية المتقدمة</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-slate-900 to-blue-600 dark:from-cyan-300 dark:via-white dark:to-blue-300 tracking-tight"
        >
          أقسام منصة ذروة العلم
        </motion.h2>

        <div className="h-1.5 w-28 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mx-auto rounded-full shadow-lg shadow-cyan-500/40" />

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed pt-2"
        >
          استكشف مجالات المنصة المترابطة، حيث تلتقي المختبرات الافتراضية ثلاثية الأبعاد، وهندسة الروبوتات والذكاء الاصطناعي، وحلول التربية الخاصة الشاملة، مع المراجع العلمية الموثقة.
        </motion.p>
      </div>

      {/* Modern Multi-Card Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {categories.map((category, index) => {
          const IconComponent = category.icon;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => {
                playSound();
                navigate(category.link);
              }}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer border bg-white/95 dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl shadow-sm flex flex-col justify-between ${category.borderColor} ${category.glowColor}`}
            >
              {/* Bespoke Section Image Header with Zoom Effect */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Gradient Overlay for seamless blend into card body */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent dark:from-slate-900 dark:via-slate-900/50" />
                <div className={`absolute inset-0 bg-gradient-to-b ${category.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />

                {/* Floating Badge on Top Corner */}
                <div className="absolute top-4 start-4 z-10">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md shadow-md ${category.badgeColor}`}>
                    {category.badge}
                  </span>
                </div>

                {/* Floating Icon with Glow */}
                <div className="absolute bottom-3 end-4 z-10">
                  <div className={`w-13 h-13 p-3 rounded-2xl flex items-center justify-center border shadow-xl ${category.iconBg} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-3 flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${category.accentColor}`}>
                    {category.subtitle}
                  </span>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-snug">
                    {category.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300/85 text-xs sm:text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Highlights Mini Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {category.highlights.map((highlight, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center gap-1 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-cyan-500" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-5 mt-5 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white/80 group-hover:text-cyan-700 dark:group-hover:text-white transition-colors flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    استكشف المحتوى الآن
                  </span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/20 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:text-slate-950 transition-all duration-300 text-slate-700 dark:text-white shadow-sm">
                    <ArrowIcon className="w-4 h-4 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PlatformCategories;