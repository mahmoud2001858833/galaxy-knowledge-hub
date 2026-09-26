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
  ArrowLeft,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import educationBg from '@/assets/education-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';

const clickSound = '/message-notification.mp3';

const PlatformCategories = () => {
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
      description: 'أكثر من 45 محاكاة علمية تفاعلية تغطي الفيزياء النووية، ميكانيكا الكم، كريسبر، الثقوب السوداء والكيمياء الحركية مع تصدير القياسات وتحليل مباشر.',
      gradient: 'from-cyan-500/20 via-blue-500/20 to-purple-500/20',
      accentColor: 'from-cyan-400 to-blue-500',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      glowColor: 'shadow-cyan-500/25',
      badge: '49 محاكاة تفاعلية',
      link: '/experiments-section',
      featured: true,
      image: educationBg
    },
    {
      id: 'damij',
      title: 'منصة دامج — التعليم الخاص والدمج الذكي',
      subtitle: 'التقنيات المساعدة وحلول الشمولية الذكية',
      icon: HeartHandshake,
      description: 'منظومة مبتكرة تدمج مترجم برايل اللمسي، تشخيص وتحليل التوحد بالذكاء الاصطناعي، التشخيص التفريقي لـ ADHD، وترجمة لغة الإشارة بالكاميرا.',
      gradient: 'from-teal-500/20 via-emerald-500/20 to-sky-500/20',
      accentColor: 'from-teal-400 to-emerald-400',
      borderColor: 'border-teal-500/40 hover:border-teal-400',
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      glowColor: 'shadow-teal-500/25',
      badge: 'شامل ومستقل',
      link: '/damij',
      featured: true,
      image: educationBg
    },
    {
      id: 'education',
      title: 'قسم التعليم الشامل',
      subtitle: 'المناهج العلمية والأدبية والتطبيقية',
      icon: GraduationCap,
      description: 'منصات تعليمية متكاملة تشمل العلوم العامة، الأدب واللغات، الاستدامة البيئية، وبرامج BTEC لتكنولوجيا المعلومات والبرمجة.',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      accentColor: 'from-blue-400 to-indigo-400',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      glowColor: 'shadow-blue-500/25',
      badge: '4 مسارات تعليمية',
      link: '/education-section',
      featured: false,
      image: educationBg
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      subtitle: 'دعم أكاديمي ونفسي مدعوم بالذكاء الاصطناعي',
      icon: Sparkles,
      description: 'مساعدون أذكياء فوريون (فالك المعرفة والمرشد النفسي) لشرح المفاهيم المعقدة خطوة بخطوة وإدارة التوتر وتوجيه مسار تعلمك.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      accentColor: 'from-purple-400 to-pink-400',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      glowColor: 'shadow-purple-500/25',
      badge: 'مدعوم بـ Gemini AI',
      link: '/ai-assistant-section',
      featured: false,
      image: aiAssistantBg
    },
    {
      id: 'smart-city',
      title: 'قسم المدينة الذكية والابتكار',
      subtitle: 'المستقبل المعماري والأنظمة الروبوتية',
      icon: Building2,
      description: 'أدوات استشراف المستقبل والتصميم المعماري والديكور الداخلي بالذكاء الاصطناعي وتطبيقات الإنشاءات الروبوتية المتقدمة.',
      gradient: 'from-amber-500/20 to-cyan-500/20',
      accentColor: 'from-amber-400 to-cyan-400',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      glowColor: 'shadow-amber-500/25',
      badge: 'ابتكار وهندسة',
      link: '/smart-city',
      featured: false,
      image: educationBg
    }
  ];

  return (
    <section
      id="platform-sections"
      className="py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir={dir}
    >
      <audio ref={audioRef} src={clickSound} preload="none" />
      
      {/* Section Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-4 backdrop-blur-md">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>منظومة متكاملة للمعرفة والتقنية</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-cyan-300 mb-4 tracking-tight">
          أقسام منصة ذروة العلم
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 mx-auto rounded-full shadow-lg shadow-cyan-500/50" />
        <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          اختر مجالك التعليمي المفضل واستكشف تجارب بصرية وأدوات ذكاء اصطناعي تفاعلية مصممة لإثراء شغفك بالمعرفة
        </p>
      </div>

      {/* Modern Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          const isLarge = category.featured;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => {
                playSound();
                navigate(category.link);
              }}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer border bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${category.borderColor} ${category.glowColor} ${
                isLarge ? 'md:col-span-2 lg:col-span-1' : 'col-span-1'
              } flex flex-col justify-between p-7`}
            >
              {/* Top ambient highlight */}
              <div className={`absolute top-0 right-0 left-0 h-32 bg-gradient-to-b ${category.gradient} pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
              
              {/* Header inside card */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${category.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/10 backdrop-blur-md">
                    {category.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${category.accentColor}`}>
                    {category.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {category.title}
                  </h3>
                </div>

                <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed mt-4">
                  {category.description}
                </p>
              </div>

              {/* Action Footer */}
              <div className="relative z-10 pt-8 mt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  جاهز للاستكشاف
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:text-slate-950 transition-all duration-300 text-white">
                  <ArrowIcon className="w-5 h-5 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform" />
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