import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Palette, Camera, ChevronDown, ArrowRight,
  Cpu, Image, Code, MessageSquare, Target,
  Lightbulb, Layers, Box, ExternalLink, Play,
  ChevronUp, Star, Atom, Waves, Beaker, Activity,
  Sun, Dna, TreeDeciduous, FlaskConical, Battery,
  Microscope, Heart, Mountain, Flame, Droplets,
  Circle, Clock, Aperture, Orbit, TestTubes,
  Hexagon, Snowflake, FlaskRound, Radiation,
  Scissors, Wind, Shield, Bug, Shapes, Dice1,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────── Track 1: AI & Machine Learning ─────────────── */
const aiTools = [
  { title: 'مساعد ذروة العلم الذكي', description: 'مساعد تعليمي ذكي متعدد المهام يجيب على أسئلتك في جميع المواد', icon: Brain, gradient: 'from-violet-500 to-purple-600', link: '/falak-knowledge-ai' },
  { title: 'توليد الصور بالذكاء الاصطناعي', description: 'أنشئ صوراً تعليمية احترافية باستخدام وصف نصي بسيط', icon: Image, gradient: 'from-pink-500 to-rose-600', link: '/ai-image-generator' },
  { title: 'تقييم الرسومات بالذكاء الاصطناعي', description: 'ارسم وتحدّى أصدقاءك! الذكاء الاصطناعي يختار الفائز', icon: Target, gradient: 'from-amber-500 to-orange-600', link: '/drawing-challenge' },
  { title: 'مساعد البرمجة الذكي', description: 'ولّد أكواداً برمجية بأي لغة مع شرح مفصّل', icon: Code, gradient: 'from-emerald-500 to-teal-600', link: '/btec' },
  { title: 'تحليل الصور التعليمية', description: 'حلّل صور الكتب والمسائل والتجارب بالذكاء الاصطناعي', icon: Eye, gradient: 'from-cyan-500 to-blue-600', link: '/jordanian-assistant' },
];

/* ─────────────── Track 2: Robotics & Construction ─────────────── */
const roboticsTools = [
  { title: 'التصميم المعماري الذكي', description: 'تحليل موقع البناء واقتراح تصميمات مستدامة بالذكاء الاصطناعي', icon: Building2, gradient: 'from-cyan-500 to-blue-600', link: '/smart-city/architectural-design' },
  { title: 'روبوت البناء التفاعلي', description: 'تقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد', icon: Bot, gradient: 'from-blue-500 to-indigo-600', link: '/smart-city/robotic-construction' },
  { title: 'التصميم الداخلي التفاعلي', description: 'توصيات ذكية للألوان والإضاءة والأثاث', icon: Palette, gradient: 'from-indigo-500 to-purple-600', link: '/smart-city/interior-design' },
];

/* ─────────────── المحاكيات التفاعلية ─────────────── */
const simulationTools = [
  { title: 'إشعاع الجسم الأسود', description: 'محاكاة تفاعلية لإشعاع الجسم الأسود مع الطيف المرئي', icon: Atom, gradient: 'from-purple-600 to-blue-600', link: '/simulation/blackbody-radiation' },
  { title: 'بناء الذرة', description: 'بناء الذرات من خلال سحب وإفلات الجسيمات الذرية', icon: Zap, gradient: 'from-orange-600 to-red-600', link: '/simulation/build-atom' },
  { title: 'مصادم الهدرونات الكبير', description: 'محاكاة متقدمة لمصادم الهدرونات مع تصادمات البروتونات', icon: Sparkles, gradient: 'from-cyan-500 to-purple-600', link: '/lhc-simulation' },
  { title: 'الموجات الكهرومغناطيسية', description: 'استكشاف الطيف الكهرومغناطيسي من الراديو إلى غاما', icon: Waves, gradient: 'from-red-500 to-purple-600', link: '/electromagnetic-waves' },
  { title: 'التفاعلات النووية', description: 'محاكاة الانشطار والاندماج النووي', icon: Atom, gradient: 'from-green-500 to-blue-500', link: '/nuclear-reactions' },
  { title: 'التفاعلات الكيميائية 3D', description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات الكيميائية', icon: Beaker, gradient: 'from-purple-500 to-blue-500', link: '/chemical-reactions' },
  { title: 'سلسلة فورييه', description: 'حساب وتمثيل سلسلة فورييه مع كشف ظاهرة غيبس', icon: Activity, gradient: 'from-indigo-500 to-pink-600', link: '/fourier-series' },
  { title: 'الدوال ثلاثية الأبعاد', description: 'عرض الدوال الرياضية في الفضاء ثلاثي الأبعاد', icon: Box, gradient: 'from-emerald-500 to-cyan-600', link: '/3d-function-visualizer' },
  { title: 'مختبر البصريات', description: 'محاكاة للأشعة الضوئية مع العدسات والمرايا', icon: Sun, gradient: 'from-yellow-500 to-red-500', link: '/simulation/optics-lab' },
  { title: 'بناء الدوائر الكهربائية', description: 'مختبر افتراضي لبناء الدوائر مع نظام أسلاك حقيقي', icon: Cpu, gradient: 'from-blue-500 to-teal-500', link: '/simulation/circuit-builder-advanced' },
  { title: 'حركة المقذوفات', description: 'محاكاة شاملة لحركة المقذوفات والبندول', icon: Target, gradient: 'from-green-500 to-teal-500', link: '/simulation/projectile-motion' },
  { title: 'النظام الشمسي 3D', description: 'محاكاة 3D كاملة مع تحكم كاميرا 360°', icon: Globe, gradient: 'from-indigo-500 to-pink-500', link: '/simulation/solar-system-3d' },
  { title: 'مختبر الوراثة', description: 'محاكاة لمربع بونيت وتضاعف DNA والطفرات', icon: Dna, gradient: 'from-pink-500 to-red-500', link: '/simulation/genetics-lab' },
  { title: 'النظام البيئي', description: 'نظام بيئي حي مع كائنات متحركة وتوازن السكان', icon: TreeDeciduous, gradient: 'from-green-600 to-lime-500', link: '/simulation/ecosystem' },
  { title: 'الكهرومغناطيسية', description: 'محاكاة المجال المغناطيسي والحث الكهرومغناطيسي', icon: Zap, gradient: 'from-purple-600 to-cyan-500', link: '/simulation/electromagnetism' },
  { title: 'الموجات والصوت', description: 'محاكاة الموجات الصوتية وتأثير دوبلر', icon: Waves, gradient: 'from-green-600 to-blue-500', link: '/simulation/waves-sound' },
  { title: 'الكهرباء الساكنة', description: 'قانون كولوم والمجال الكهربائي ومولد فان دي غراف', icon: Sparkles, gradient: 'from-yellow-600 to-red-500', link: '/simulation/static-electricity' },
  { title: 'الفلك المتقدم', description: 'محاكاة الكسوف والخسوف وأطوار القمر', icon: Globe, gradient: 'from-indigo-600 to-pink-500', link: '/simulation/advanced-astronomy' },
  { title: 'ميكانيكا الكم', description: 'تجربة الشق المزدوج والنفق الكمي والتراكب', icon: Atom, gradient: 'from-pink-600 to-indigo-500', link: '/simulation/quantum-mechanics' },
  { title: 'الكيمياء التحليلية', description: 'محاكاة المعايرة وقياس pH والكروماتوغرافيا', icon: FlaskConical, gradient: 'from-emerald-600 to-teal-500', link: '/simulation/analytical-chemistry' },
  { title: 'الكيمياء الكهربائية', description: 'الخلايا الجلفانية والتحليل الكهربائي', icon: Battery, gradient: 'from-amber-600 to-yellow-500', link: '/simulation/electrochemistry' },
  { title: 'البيولوجيا الجزيئية', description: 'تضاعف DNA والنسخ والترجمة وتفاعل PCR', icon: Microscope, gradient: 'from-violet-600 to-fuchsia-500', link: '/simulation/molecular-biology' },
  { title: 'جسم الإنسان', description: 'استكشاف أجهزة الجسم: الدوران والتنفس والعصبي', icon: Heart, gradient: 'from-red-600 to-pink-500', link: '/simulation/human-body' },
  { title: 'الفيزياء النووية المتقدمة', description: 'الاضمحلال الإشعاعي والانشطار وعمر النصف', icon: Atom, gradient: 'from-lime-600 to-emerald-500', link: '/simulation/advanced-nuclear' },
  { title: 'الإلكترونيات الرقمية', description: 'بوابات المنطق والجامعات والعدادات', icon: Cpu, gradient: 'from-slate-600 to-zinc-500', link: '/simulation/digital-electronics' },
  { title: 'علوم الأرض', description: 'محاكاة الزلازل والبراكين والصفائح التكتونية', icon: Mountain, gradient: 'from-amber-700 to-red-600', link: '/simulation/earth-sciences' },
  { title: 'علوم الصواريخ والفضاء', description: 'إطلاق الصواريخ والمدارات الفضائية', icon: Rocket, gradient: 'from-sky-600 to-indigo-500', link: '/simulation/rocket-science' },
  { title: 'البصريات المتقدمة', description: 'تشتت المنشور والعدسات والتداخل والاستقطاب', icon: Eye, gradient: 'from-cyan-600 to-emerald-500', link: '/simulation/advanced-optics' },
  { title: 'علوم المواد', description: 'البنية البلورية والسبائك واختبارات الإجهاد', icon: Layers, gradient: 'from-stone-600 to-zinc-500', link: '/simulation/materials-science' },
  { title: 'الديناميكا الحرارية', description: 'الغاز المثالي ومحرك كارنو وانتقال الحرارة', icon: Flame, gradient: 'from-orange-600 to-red-600', link: '/simulation/thermodynamics' },
  { title: 'الموائع وقوى الطفو', description: 'قانون أرخميدس وباسكال وبرنولي', icon: Droplets, gradient: 'from-blue-500 to-cyan-500', link: '/simulation/fluid-mechanics' },
  { title: 'الحركة الدائرية والجاذبية', description: 'حركة دائرية ومدارات الأقمار الصناعية', icon: Circle, gradient: 'from-violet-500 to-purple-600', link: '/simulation/circular-motion' },
  { title: 'النسبية الخاصة', description: 'تمدد الزمن وتقلص الطول و E=mc²', icon: Clock, gradient: 'from-yellow-500 to-orange-500', link: '/simulation/special-relativity' },
  { title: 'التداخل والحيود', description: 'تجربة يونج وحيود الشق الواحد وحلقات نيوتن', icon: Aperture, gradient: 'from-indigo-500 to-pink-500', link: '/simulation/interference-diffraction' },
  { title: 'فيزياء البلازما', description: 'الحالة الرابعة للمادة والحصر المغناطيسي', icon: Sparkles, gradient: 'from-purple-500 to-pink-500', link: '/simulation/plasma-physics' },
  { title: 'حركية التفاعلات', description: 'سرعة التفاعل وطاقة التنشيط والعوامل المؤثرة', icon: FlaskConical, gradient: 'from-blue-500 to-cyan-500', link: '/simulation/chemical-kinetics' },
  { title: 'الكيمياء العضوية', description: 'بناء الجزيئات العضوية والمجموعات الوظيفية', icon: Hexagon, gradient: 'from-green-500 to-emerald-500', link: '/simulation/organic-chemistry' },
  { title: 'حالات المادة والتحولات', description: 'صلب/سائل/غاز والتحولات ومخطط الطور', icon: Snowflake, gradient: 'from-cyan-500 to-blue-500', link: '/simulation/states-of-matter' },
  { title: 'الأحماض والقواعد', description: 'مقياس pH والمعايرة والمحاليل المنظمة', icon: FlaskRound, gradient: 'from-yellow-500 to-red-500', link: '/simulation/acids-bases' },
  { title: 'الكيمياء النووية التطبيقية', description: 'التأريخ بالكربون-14 والطب النووي', icon: Radiation, gradient: 'from-lime-500 to-green-600', link: '/simulation/nuclear-applications' },
  { title: 'الخلية الحية', description: 'تركيب الخلية الحيوانية والنباتية والبكتيرية', icon: Microscope, gradient: 'from-emerald-500 to-teal-500', link: '/simulation/living-cell' },
  { title: 'الانقسام الخلوي', description: 'الانقسام المتساوي والمنصف بالمراحل', icon: Scissors, gradient: 'from-violet-500 to-fuchsia-500', link: '/simulation/cell-division' },
  { title: 'التمثيل الضوئي والتنفس', description: 'البناء الضوئي والتنفس الخلوي', icon: Wind, gradient: 'from-green-500 to-lime-500', link: '/simulation/photosynthesis-respiration' },
  { title: 'الجهاز المناعي', description: 'المناعة الفطرية والمكتسبة واللقاحات', icon: Shield, gradient: 'from-blue-500 to-indigo-500', link: '/simulation/immune-system' },
  { title: 'التطور والانتخاب الطبيعي', description: 'محاكاة الانتخاب الطبيعي والتكيف', icon: Bug, gradient: 'from-amber-500 to-orange-500', link: '/simulation/evolution' },
  { title: 'الهندسة الفراغية', description: 'أشكال ثلاثية الأبعاد وحساب المساحات والحجوم', icon: Shapes, gradient: 'from-indigo-500 to-purple-600', link: '/simulation/spatial-geometry' },
  { title: 'نظرية الاحتمالات', description: 'رمي النرد والعملات والتوزيع الطبيعي', icon: Dice1, gradient: 'from-green-500 to-cyan-500', link: '/simulation/probability' },
  { title: 'الروبوتات والتحكم', description: 'برمجة روبوت افتراضي لتنفيذ مهام', icon: Bot, gradient: 'from-cyan-500 to-blue-500', link: '/simulation/robotics' },
  { title: 'الهندسة الميكانيكية', description: 'التروس والرافعات والبكرات والآلات البسيطة', icon: Wrench, gradient: 'from-amber-500 to-orange-600', link: '/simulation/mechanical-engineering' },
];

/* ─────────────── Track 3: Sustainability ─────────────── */
const sustainabilityTools = [
  { title: 'حاسبة البصمة الكربونية', description: 'احسب بصمتك الكربونية وتعرّف على طرق تقليلها', icon: Calculator, gradient: 'from-blue-500 to-cyan-600', link: '/environmental/carbon-calculator' },
  { title: 'مشاريع مدرسية بيئية', description: 'أفكار مشاريع بيئية مبتكرة مع خطط تنفيذ عملية', icon: School, gradient: 'from-green-500 to-emerald-600', link: '/environmental/school-projects' },
  { title: 'مشاريع منزلية بيئية', description: 'حوّل منزلك إلى بيئة مستدامة', icon: Home, gradient: 'from-purple-500 to-pink-600', link: '/environmental/home-projects' },
  { title: 'مؤشر الاستدامة الشخصي', description: 'قيّم مستوى استدامتك واحصل على توصيات مخصصة', icon: BarChart, gradient: 'from-teal-500 to-blue-600', link: '/environmental/personal-sustainability-index' },
  { title: 'خبير إعادة التدوير الذكي', description: 'حوّل نفاياتك إلى مشاريع إبداعية مع AI', icon: Recycle, gradient: 'from-cyan-500 to-teal-600', link: '/environmental/recycling-advisor' },
  { title: 'التنبؤ البيئي الذكي', description: 'تحليل بياناتك البيئية وتوقع البصمة الكربونية', icon: Brain, gradient: 'from-indigo-500 to-purple-600', link: '/environmental/eco-predict' },
];

/* ─────────────── Track 4: Inclusive Education ─────────────── */
const inclusiveTools = [
  { title: 'قاموس لغة الإشارة', description: 'تعلّم لغة الإشارة العربية مع كاميرا تفاعلية', icon: Hand, gradient: 'from-pink-500 to-rose-600', link: '/sign-language' },
  { title: 'تحويل النص إلى كلام', description: 'قراءة النصوص بصوت عربي لدعم ذوي الإعاقة البصرية', icon: Volume2, gradient: 'from-blue-500 to-indigo-600', link: '/sign-language' },
  { title: 'الإدخال الصوتي الشامل', description: 'تحويل الكلام إلى نص في جميع المساعدين الذكيين', icon: Mic, gradient: 'from-emerald-500 to-green-600', link: '/falak-knowledge-ai' },
  { title: 'أوضاع تعلّم مخصصة', description: 'واجهات مخصصة لذوي الإعاقات المختلفة', icon: Accessibility, gradient: 'from-amber-500 to-orange-600', link: '/sign-language' },
];

const tracks = [
  { id: 'ai', title: 'الذكاء الاصطناعي', subtitle: 'AI & Machine Learning', icon: Brain, color: 'from-violet-500 to-purple-600', accent: 'violet', tools: aiTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'robotics', title: 'الروبوتات والبناء الذكي', subtitle: 'Robotics & Construction', icon: Bot, color: 'from-cyan-500 to-blue-600', accent: 'cyan', tools: roboticsTools, extraTools: simulationTools, extraTitle: 'المحاكيات التفاعلية' },
  { id: 'sustainability', title: 'التقنيات المستدامة', subtitle: 'Sustainable Tech', icon: Leaf, color: 'from-emerald-500 to-green-600', accent: 'emerald', tools: sustainabilityTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'inclusive', title: 'التعلّم الدامج', subtitle: 'Inclusive Education', icon: Accessibility, color: 'from-pink-500 to-rose-600', accent: 'pink', tools: inclusiveTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
];

const stats = [
  { label: 'أداة تعليمية', value: '50+', icon: BookOpen },
  { label: 'محاكاة تفاعلية', value: '49', icon: Zap },
  { label: 'أداة ذكاء اصطناعي', value: '15+', icon: Brain },
  { label: 'مادة دراسية', value: '8+', icon: GraduationCap },
];

const techStack = [
  { name: 'React + TypeScript', icon: '⚛️' },
  { name: 'Supabase', icon: '🗄️' },
  { name: 'Google Gemini AI', icon: '🤖' },
  { name: 'Framer Motion', icon: '✨' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Lovable AI', icon: '💜' },
];

/* ─────────────── Animated Counter ─────────────── */
const AnimatedCounter = ({ value }: { value: string }) => {
  const num = parseInt(value);
  const suffix = value.replace(/[0-9]/g, '');
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (isNaN(num)) return;
    let start = 0;
    const duration = 2000;
    const step = duration / num;
    const timer = setInterval(() => {
      start++;
      setCount(start);
      if (start >= num) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [num]);

  return <span>{isNaN(num) ? value : `${count}${suffix}`}</span>;
};

/* ─────────────── Tool Card ─────────────── */
const ToolCard = ({ tool, index }: { tool: typeof aiTools[0]; index: number }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate(tool.link)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${tool.gradient} rounded-full blur-3xl opacity-20`} />
      </div>

      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <tool.icon className="w-7 h-7 text-white" />
        </div>
        <h4 className="text-white font-bold text-lg mb-2 group-hover:text-white transition-colors">{tool.title}</h4>
        <p className="text-white/35 text-sm leading-relaxed mb-4">{tool.description}</p>
        <div className="flex items-center gap-2 text-white/25 group-hover:text-white/60 transition-all duration-300">
          <span className="text-xs font-medium">استكشف</span>
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────── Track Section ─────────────── */
const TrackSection = ({ track, index }: { track: typeof tracks[0]; index: number }) => {
  const [showAllSimulations, setShowAllSimulations] = useState(false);
  const accentGlows: Record<string, string> = {
    violet: 'rgba(139,92,246,0.08)',
    cyan: 'rgba(6,182,212,0.08)',
    emerald: 'rgba(16,185,129,0.08)',
    pink: 'rgba(236,72,153,0.08)',
  };

  return (
    <section id={track.id} className="py-20 md:py-28 relative scroll-mt-20">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 50% at ${index % 2 === 0 ? '20%' : '80%'} 50%, ${accentGlows[track.accent]}, transparent)`
      }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-xl`}>
              <track.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">{track.title}</h2>
              <span className="text-white/25 text-xs font-mono tracking-wider uppercase">{track.subtitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className={`h-1 w-16 rounded-full bg-gradient-to-l ${track.color}`} />
            <span className="text-white/30 text-sm">{track.tools.length + (track.extraTools?.length || 0)} أدوات متاحة</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {track.tools.map((tool, i) => (
            <ToolCard key={i} tool={tool} index={i} />
          ))}
        </div>

        {/* Simulations Preview */}
        {track.extraTools && track.extraTitle && (
          <div className="mt-16">
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-lg`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{track.extraTitle}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-0.5 w-12 rounded-full bg-gradient-to-l ${track.color}`} />
                <span className="text-white/30 text-sm">{track.extraTools.length} محاكاة تفاعلية</span>
              </div>
            </motion.div>

            {/* Show only 2 preview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {track.extraTools.slice(0, 2).map((tool, i) => (
                <ToolCard key={`preview-${i}`} tool={tool} index={i} />
              ))}
            </div>

            {/* Expand button */}
            {!showAllSimulations && (
              <motion.div
                className="flex justify-center mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setShowAllSimulations(true)}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                >
                  <span className="text-white/70 group-hover:text-white font-semibold text-lg transition-colors">اكتشف المزيد</span>
                  <span className="text-white/30 text-sm">({track.extraTools.length - 2} محاكاة أخرى)</span>
                  <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-y-1 transition-all" />
                </button>
              </motion.div>
            )}

            {/* All simulations expanded */}
            <AnimatePresence>
              {showAllSimulations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
                    {track.extraTools.slice(2).map((tool, i) => (
                      <ToolCard key={`extra-${i}`} tool={tool} index={i} />
                    ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowAllSimulations(false)}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300"
                    >
                      <span className="text-white/50 group-hover:text-white/80 text-sm">إخفاء</span>
                      <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:-translate-y-1 transition-all" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─────────────── Main Page ─────────────── */
const GJUCompetition = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  React.useEffect(() => {
    sessionStorage.setItem('gju_mode', 'true');
  }, []);

  const handleBackToMain = () => {
    sessionStorage.removeItem('gju_mode');
    navigate('/');
  };

  const scrollToTrack = (id: string) => {
    setActiveTrack(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060612]" dir={dir}>
      <SEO
        title="مستقبل التكنولوجيا - مسابقة GJU 3030"
        description="منصة مستقبل التكنولوجيا - مسابقة التقدّم التكنولوجي GJU 3030"
        keywords="GJU 3030, مسابقة, تكنولوجيا, مستقبل التكنولوجيا"
      />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-violet-900/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-900/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-emerald-900/6 to-transparent rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <main className="flex-1 relative z-10">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 pt-8 pb-20">
          {/* Back button */}
          <motion.button
            onClick={handleBackToMain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-6 right-6 flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm z-20 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>العودة لذروة العلم</span>
          </motion.button>

          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-8 backdrop-blur-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300/90 text-sm font-semibold tracking-wide">مسابقة التقدّم التكنولوجي GJU 3030</span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tight"
            >
              <span className="bg-gradient-to-l from-violet-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                مستقبل
              </span>
              <br />
              <span className="text-white/90">
                التكنولوجيا
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-6 leading-relaxed"
            >
              منصة تعليمية تفاعلية شاملة تدمج الذكاء الاصطناعي والروبوتات 
              والتقنيات المستدامة والتعلّم الدامج
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/20 text-sm mb-14"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>الجامعة الألمانية الأردنية</span>
              <span className="text-white/10">•</span>
              <span>German Jordanian University</span>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="relative group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <stat.icon className="w-5 h-5 text-white/20 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-[11px] text-white/30 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-white/15 text-xs">استكشف المسارات</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="w-5 h-5 text-white/15" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ STICKY TRACK NAV ═══════════════ */}
        <div className="sticky top-0 z-50 bg-[#060612]/80 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => scrollToTrack(track.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTrack === track.id
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <track.icon className="w-4 h-4" />
                  <span>{track.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ TRACK SECTIONS ═══════════════ */}
        {tracks.map((track, index) => (
          <React.Fragment key={track.id}>
            <TrackSection track={track} index={index} />
          </React.Fragment>
        ))}

        {/* ═══════════════ TECH STACK ═══════════════ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-white/20 text-xs font-mono tracking-widest uppercase mb-3 block">BUILT WITH</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">التقنيات المُستخدمة</h2>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {techStack.map((tech, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-white/60 font-medium text-sm">{tech.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default GJUCompetition;
