import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Brain, Bot, Leaf, Building2, Accessibility, 
  Sparkles, Users, BookOpen, Zap, ArrowLeft,
  Eye, Ear, Hand, Monitor, Mic, Volume2,
  GraduationCap, Trophy, Rocket, Globe,
  Calculator, School, Home, BarChart, Recycle,
  Palette, Camera, ChevronLeft, ArrowRight,
  Cpu, Image, Code, MessageSquare, Target,
  Lightbulb, Layers, Box, FileSearch, Languages,
  Code2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────── Track 1: AI & Machine Learning ─────────────── */
const aiTools = [
  {
    title: 'محلل المستندات الذكي',
    description: 'حلّل مستنداتك وصورك واستخرج ملخصات وأسئلة مراجعة وخرائط ذهنية بالذكاء الاصطناعي',
    icon: FileSearch,
    gradient: 'from-violet-500 to-fuchsia-600',
    link: '/ai-document-analyzer',
    isNew: true,
  },
  {
    title: 'المترجم الفوري الذكي',
    description: 'ترجمة فورية متعددة اللغات مع تحليل نحوي ونطق صوتي وتصحيح قواعد',
    icon: Languages,
    gradient: 'from-cyan-500 to-blue-600',
    link: '/ai-smart-translator',
    isNew: true,
  },
  {
    title: 'مولّد الاختبارات الذكي',
    description: 'أدخل أي موضوع واحصل على اختبار كامل مع تصحيح تلقائي وتقييم ذكي',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    link: '/ai-quiz-generator',
    isNew: true,
  },
  {
    title: 'مراجع الأكواد الذكي',
    description: 'تحليل شامل لأكوادك: أخطاء، ثغرات أمنية، تحسينات أداء، وأفضل الممارسات',
    icon: Code2,
    gradient: 'from-amber-500 to-orange-600',
    link: '/ai-code-reviewer',
    isNew: true,
  },
  {
    title: 'الباحث الذكي المتقدم',
    description: 'أدخل موضوعاً بحثياً واحصل على تقرير أكاديمي شامل مع فصول ومراجع',
    icon: Search,
    gradient: 'from-rose-500 to-pink-600',
    link: '/ai-research-assistant',
    isNew: true,
  },
  {
    title: 'مساعد ذروة العلم الذكي',
    description: 'مساعد تعليمي ذكي متعدد المهام يجيب على أسئلتك في جميع المواد',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-600',
    link: '/falak-knowledge-ai',
  },
  {
    title: 'توليد الصور بالذكاء الاصطناعي',
    description: 'أنشئ صوراً تعليمية احترافية باستخدام الذكاء الاصطناعي',
    icon: Image,
    gradient: 'from-pink-500 to-rose-600',
    link: '/ai-image-generator',
  },
  {
    title: 'تقييم الرسومات بالذكاء الاصطناعي',
    description: 'ارسم وتحدّى أصدقاءك! يقيّم الذكاء الاصطناعي رسوماتكم',
    icon: Target,
    gradient: 'from-amber-500 to-orange-600',
    link: '/drawing-challenge',
  },
  {
    title: 'مساعد البرمجة الذكي',
    description: 'ولّد أكواداً برمجية بأي لغة مع توثيق وشرح مفصّل',
    icon: Code,
    gradient: 'from-emerald-500 to-teal-600',
    link: '/btec',
  },
  {
    title: 'تحليل الصور التعليمية',
    description: 'حلّل صور الكتب والمسائل والتجارب بالذكاء الاصطناعي',
    icon: Eye,
    gradient: 'from-cyan-500 to-blue-600',
    link: '/jordanian-assistant',
  },
];

/* ─────────────── Track 2: Robotics & Construction ─────────────── */
const roboticsTools = [
  {
    title: 'منصة التصميم المعماري الذكي',
    description: 'استخدم الذكاء الاصطناعي لتحليل موقع البناء والمناخ واحتياجات السكان واقتراح تصميمات مستدامة',
    icon: Building2,
    gradient: 'from-cyan-500 to-blue-600',
    link: '/smart-city/architectural-design',
  },
  {
    title: 'روبوت البناء التفاعلي',
    description: 'تعرّف على تقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد وكيف تُحدث ثورة في عالم العمارة',
    icon: Bot,
    gradient: 'from-blue-500 to-indigo-600',
    link: '/smart-city/robotic-construction',
  },
  {
    title: 'التصميم الداخلي التفاعلي',
    description: 'أداة ذكية للديكور الداخلي توفّر توصيات للألوان والإضاءة والأثاث بالذكاء الاصطناعي',
    icon: Palette,
    gradient: 'from-indigo-500 to-purple-600',
    link: '/smart-city/interior-design',
  },
];

/* ─────────────── Track 3: Sustainability ─────────────── */
const sustainabilityTools = [
  {
    title: 'حاسبة البصمة الكربونية',
    description: 'احسب بصمتك الكربونية وتعرّف على طرق تقليلها بشكل علمي',
    icon: Calculator,
    gradient: 'from-blue-500 to-cyan-600',
    link: '/environmental/carbon-calculator',
  },
  {
    title: 'مشاريع مدرسية بيئية',
    description: 'أفكار مشاريع بيئية مبتكرة للمدارس مع خطط تنفيذ عملية',
    icon: School,
    gradient: 'from-green-500 to-emerald-600',
    link: '/environmental/school-projects',
  },
  {
    title: 'مشاريع منزلية بيئية',
    description: 'حوّل منزلك إلى بيئة مستدامة مع مشاريع عملية سهلة التطبيق',
    icon: Home,
    gradient: 'from-purple-500 to-pink-600',
    link: '/environmental/home-projects',
  },
  {
    title: 'مؤشر الاستدامة الشخصي',
    description: 'قيّم مستوى استدامتك الشخصي واحصل على توصيات مخصصة للتحسين',
    icon: BarChart,
    gradient: 'from-teal-500 to-blue-600',
    link: '/environmental/personal-sustainability-index',
  },
  {
    title: 'خبير إعادة التدوير الذكي',
    description: 'حوّل نفاياتك إلى مشاريع إبداعية مع توصيات الذكاء الاصطناعي',
    icon: Recycle,
    gradient: 'from-cyan-500 to-teal-600',
    link: '/environmental/recycling-advisor',
  },
  {
    title: 'أداة التنبؤ البيئي الذكية',
    description: 'تحليل بياناتك البيئية وتوقع البصمة الكربونية المستقبلية باستخدام AI',
    icon: Brain,
    gradient: 'from-indigo-500 to-purple-600',
    link: '/environmental/eco-predict',
  },
];

/* ─────────────── Track 4: Inclusive Education ─────────────── */
const inclusiveTools = [
  {
    title: 'قاموس لغة الإشارة',
    description: 'تعلّم لغة الإشارة العربية مع قاموس شامل وكاميرا تفاعلية للتعرف على الإشارات',
    icon: Hand,
    gradient: 'from-pink-500 to-rose-600',
    link: '/sign-language',
  },
  {
    title: 'تحويل النص إلى كلام',
    description: 'تقنية قراءة النصوص بصوت عربي واضح لدعم ذوي الإعاقة البصرية',
    icon: Volume2,
    gradient: 'from-blue-500 to-indigo-600',
    link: '/sign-language',
  },
  {
    title: 'الإدخال الصوتي الشامل',
    description: 'تحويل الكلام إلى نص متوفر في جميع المساعدين الذكيين بالمنصة',
    icon: Mic,
    gradient: 'from-emerald-500 to-green-600',
    link: '/falak-knowledge-ai',
  },
  {
    title: 'أوضاع تعلّم مخصصة',
    description: 'واجهات مخصصة لذوي الإعاقات البصرية والسمعية والحركية والإدراكية',
    icon: Accessibility,
    gradient: 'from-amber-500 to-orange-600',
    link: '/sign-language',
  },
];

/* ─────────────── All Tracks Config ─────────────── */
const tracks = [
  {
    id: 'ai',
    title: 'الذكاء الاصطناعي وتعلّم الآلة',
    subtitle: 'AI & Machine Learning',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500/30',
    bgGlow: 'violet',
    tools: aiTools,
  },
  {
    id: 'robotics',
    title: 'الروبوتات وتقنيات البناء الذكي',
    subtitle: 'Robotics & Smart Construction',
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/30',
    bgGlow: 'cyan',
    tools: roboticsTools,
  },
  {
    id: 'sustainability',
    title: 'التقنيات المستدامة والخضراء',
    subtitle: 'Sustainable & Green Tech',
    icon: Leaf,
    color: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'emerald',
    tools: sustainabilityTools,
  },
  {
    id: 'inclusive',
    title: 'التعلّم الدامج وتقنيات الإعاقة',
    subtitle: 'Inclusive Education & Assistive Tech',
    icon: Accessibility,
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500/30',
    bgGlow: 'pink',
    tools: inclusiveTools,
  },
];

const stats = [
  { label: 'أداة ومنصة تعليمية', value: '50+', icon: BookOpen },
  { label: 'محاكاة علمية تفاعلية', value: '49', icon: Zap },
  { label: 'أداة ذكاء اصطناعي', value: '15+', icon: Brain },
  { label: 'مادة دراسية مدعومة', value: '8+', icon: GraduationCap },
];

const techStack = [
  { name: 'React + TypeScript', desc: 'واجهة أمامية حديثة' },
  { name: 'Supabase', desc: 'قاعدة بيانات وتوثيق' },
  { name: 'Google Gemini AI', desc: 'ذكاء اصطناعي متقدم' },
  { name: 'Framer Motion', desc: 'حركات سلسة' },
  { name: 'Tailwind CSS', desc: 'تصميم متجاوب' },
  { name: 'Lovable AI', desc: 'بناء ذكي' },
];

/* ─────────────── Tool Card Component ─────────────── */
const ToolCard = ({ tool, index }: { tool: typeof aiTools[0]; index: number }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => navigate(tool.link)}
      className="group cursor-pointer relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 hover:bg-white/[0.07] transition-all duration-300 hover:border-white/20 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <tool.icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="text-white font-bold mb-2">{tool.title}</h4>
      <p className="text-white/40 text-sm leading-relaxed">{tool.description}</p>
      <div className="mt-4 flex items-center gap-1 text-white/30 group-hover:text-white/60 transition-colors text-xs">
        <span>جرّب الآن</span>
        <ArrowLeft className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

/* ─────────────── Track Section Component ─────────────── */
const TrackSection = ({ track, index }: { track: typeof tracks[0]; index: number }) => {
  const glowColors: Record<string, string> = {
    violet: 'from-violet-500/5 to-transparent',
    cyan: 'from-cyan-500/5 to-transparent',
    emerald: 'from-emerald-500/5 to-transparent',
    pink: 'from-pink-500/5 to-transparent',
  };

  return (
    <section className="py-16 md:py-20 relative">
      <div className={`absolute inset-0 bg-gradient-to-b ${glowColors[track.bgGlow] || ''} pointer-events-none`} />
      <div className="container mx-auto px-4 relative z-10">
        {/* Track Header */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-xl flex-shrink-0`}>
            <track.icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{track.title}</h2>
            <span className="text-white/30 text-sm font-mono">{track.subtitle}</span>
          </div>
          <div className={`hidden md:block mr-auto px-4 py-1.5 rounded-full border ${track.borderColor} bg-white/5`}>
            <span className="text-white/50 text-sm">{track.tools.length} أدوات</span>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {track.tools.map((tool, i) => (
            <ToolCard key={i} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────── Main Page ─────────────── */
const GJUCompetition = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();

  // Set GJU mode on mount
  React.useEffect(() => {
    sessionStorage.setItem('gju_mode', 'true');
  }, []);

  const handleBackToMain = () => {
    sessionStorage.removeItem('gju_mode');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir={dir}>
      <SEO
        title="مستقبل التكنولوجيا - مسابقة GJU 3030"
        description="منصة مستقبل التكنولوجيا - مسابقة التقدّم التكنولوجي GJU 3030 الجامعة الألمانية الأردنية"
        keywords="GJU 3030, مسابقة, تكنولوجيا, مستقبل التكنولوجيا, الجامعة الألمانية الأردنية"
      />
      <StarField />

      <main className="flex-1">
        {/* Hero Section - No Navbar */}
        <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/3 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Back to main site */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-8"
            >
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لذروة العلم</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Competition Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-semibold">مسابقة التقدّم التكنولوجي GJU 3030</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-l from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  مستقبل التكنولوجيا
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-4 leading-relaxed">
                منصة تعليمية تفاعلية شاملة تدمج الذكاء الاصطناعي والروبوتات والتقنيات المستدامة
                <br className="hidden md:block" />
                والتعلّم الدامج في تجربة تعليمية واحدة متكاملة
              </p>

              <div className="flex items-center justify-center gap-2 text-white/30 text-sm mb-12">
                <Globe className="w-4 h-4" />
                <span>الجامعة الألمانية الأردنية - German Jordanian University</span>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/[0.08] transition-all"
                >
                  <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tracks Navigation */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {tracks.map((track) => (
                <a
                  key={track.id}
                  href={`#${track.id}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border ${track.borderColor} bg-white/5 hover:bg-white/10 transition-all text-white/70 hover:text-white text-sm`}
                >
                  <track.icon className="w-4 h-4" />
                  <span>{track.title}</span>
                </a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Divider */}
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        </div>

        {/* All Track Sections */}
        {tracks.map((track, index) => (
          <div key={track.id} id={track.id}>
            <TrackSection track={track} index={index} />
            {index < tracks.length - 1 && (
              <div className="container mx-auto px-4">
                <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
              </div>
            )}
          </div>
        ))}

        {/* Tech Stack */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                التقنيات المُستخدمة
              </h2>
              <p className="text-white/40 text-sm">البنية التحتية التي تدعم المنصة</p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-center hover:bg-white/[0.06] transition-all"
                >
                  <div className="text-white font-semibold text-sm">{tech.name}</div>
                  <div className="text-white/30 text-xs mt-1">{tech.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/20 via-cyan-900/10 to-emerald-900/20 p-10 md:p-16 text-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <Rocket className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  ابدأ استكشاف المنصة الآن
                </h2>
                <p className="text-white/50 max-w-lg mx-auto mb-8">
                  جرّب جميع أدوات ومنصات مستقبل التكنولوجيا التعليمية واستمتع بتجربة تعلّم فريدة
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-l from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl text-lg font-semibold">
                    الصفحة الرئيسية
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GJUCompetition;
