import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import GJUFooter from '@/components/gju/GJUFooter';
import Hero3DScene from '@/components/gju/Hero3DScene';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/i18n/LanguageContext';
import { toolTranslationsEn, trackTranslationsEn, uiTranslationsEn, uiTranslationsAr } from './gju/translations';
import SimulationsShowcase from '@/components/gju/SimulationsShowcase';
import { Languages } from 'lucide-react';
import { 
  Brain, Bot, Leaf, Building2, Accessibility, 
  Sparkles, Users, BookOpen, Zap, ArrowLeft,
  Eye, Ear, Hand, Monitor, Mic, Volume2,
  GraduationCap, Trophy, Rocket, Globe,
  Calculator, School, Home, BarChart, Recycle,
  Palette, Camera, ChevronDown, ArrowRight,
  Cpu, Image, Code, MessageSquare, Target, Stethoscope,
  Lightbulb, Layers, Box, ExternalLink, Play,
  ChevronUp, Star, Atom, Waves, Beaker, Activity,
  Sun, Dna, TreeDeciduous, FlaskConical, Battery,
  Microscope, Heart, Mountain, Flame, Droplets,
  Circle, Clock, Aperture, Orbit, TestTubes,
  Hexagon, Snowflake, FlaskRound, Radiation,
  Scissors, Wind, Shield, Bug, Shapes, Dice1,
  Wrench, ScanFace, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────── Track 1: AI & Machine Learning ─────────────── */
const aiTools = [
  { title: 'المساعد التعليمي الذكي', description: 'مساعد تعليمي ذكي متعدد المهام يجيب على أسئلتك في جميع المواد', icon: Brain, gradient: 'from-violet-500 to-purple-600', link: '/falak-knowledge-ai' },
  { title: 'كشف السرطان بالذكاء الاصطناعي', description: 'فحص أوّلي تعليمي يحلّل الصور الطبية والأعراض ويعطي تقييم خطر مع تقرير PDF', icon: Microscope, gradient: 'from-cyan-500 via-fuchsia-500 to-violet-600', link: '/cancer-detection' },
  { title: 'توليد الصور بالذكاء الاصطناعي', description: 'أنشئ صوراً تعليمية احترافية باستخدام وصف نصي بسيط', icon: Image, gradient: 'from-pink-500 to-rose-600', link: '/ai-image-generator' },
  { title: 'مساعد البرمجة الذكي', description: 'ولّد أكواداً برمجية بأي لغة مع شرح مفصّل', icon: Code, gradient: 'from-emerald-500 to-teal-600', link: '/btec/it/programming?tab=ai-assistant' },
  { title: '🚀 باني المنصات بالـ AI', description: 'صف فكرتك ليبني الذكاء الاصطناعي منصة كاملة بقاعدة بيانات وتسجيل دخول ومساعد ذكي على 5 مراحل واضحة', icon: Sparkles, gradient: 'from-violet-500 via-cyan-500 to-emerald-500', link: '/ai-platform-builder' },
  { title: 'المساعد الطبي الذكي', description: 'مساعد طبي ذكي للإسعافات الأولية والتحليل التشخيصي', icon: Stethoscope, gradient: 'from-rose-500 to-red-600', link: '/medical-assistant' },
  { title: '💳 الدفع بالوجه - FacePay AI', description: 'تجربة بنكية متكاملة مع متجر مدمج: أنشئ حساباً، سجّل وجهك، تسوّق وادفع بمسح وجهك فقط', icon: ScanFace, gradient: 'from-emerald-500 via-cyan-500 to-violet-600', link: '/face-pay' },
  // Standalone AI Store removed — now integrated inside FacePay AI's Store tab.
  { title: '🌙 الذكاء الاصطناعي بلغة العربية - Lumina', description: 'منصة ذكاء اصطناعي عربية متقدمة بتصميم أنيق تدعم المحادثات والاستفسارات بلغة الضاد', icon: Languages, gradient: 'from-amber-500 via-orange-500 to-rose-600', link: 'https://lumina-arabic.lovable.app/', external: true },
];

/* ─────────────── Track 2: Robotics & Construction ─────────────── */
const roboticsTools = [
  { title: 'مولّد الروبوتات بالذكاء الاصطناعي', description: 'صف فكرتك واحصل على مخططات + كود Arduino + قائمة مكونات بأسعار حقيقية', icon: Wrench, gradient: 'from-violet-500 to-cyan-600', link: '/gju/robotics-generator' },
  { title: 'التوأم الرقمي للأردن', description: 'مراقبة حية لمؤشرات المدن الأردنية مع تحليل ذكي وتوصيات', icon: Globe, gradient: 'from-emerald-500 to-cyan-600', link: '/gju/jordan-digital-twin' },
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
  { title: 'مترجم لغة الإشارة الذكي', description: 'ترجمة فورية لإشارات اليد إلى نص وكلام باستخدام الذكاء الاصطناعي مع دعم 26+ إشارة', icon: Hand, gradient: 'from-pink-500 to-rose-600', link: '/sign-language' },
  { title: 'قاموس لغة الإشارة التفاعلي', description: 'قاموس شامل مصنّف يضم 68+ كلمة وعبارة مع نطق صوتي ورسوم توضيحية', icon: BookOpen, gradient: 'from-blue-500 to-indigo-600', link: '/sign-language?tab=dictionary' },
];

const trackDescriptions: Record<string, string> = {
  ai: 'أدوات ذكاء اصطناعي متقدمة تساعدك في التعلم والإبداع والبرمجة',
  simulations: 'مختبر علمي رقمي يضم 49 محاكاة تفاعلية بدقة احترافية لجميع فروع العلوم',
  inclusive: 'تقنيات مساعدة تجعل التعلّم متاحاً للجميع بلا استثناء',
  robotics: 'استكشف عالم الروبوتات والبناء الذكي والتصميم المعماري',
  sustainability: 'أدوات تفاعلية لفهم الاستدامة البيئية وتطبيقها عملياً',
};

const tracks = [
  { id: 'ai', title: 'الذكاء الاصطناعي', subtitle: 'AI & Machine Learning', icon: Brain, color: 'from-violet-500 to-purple-600', accent: 'violet', tools: aiTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'inclusive', title: 'التعلّم الدامج', subtitle: 'Inclusive Education', icon: Accessibility, color: 'from-pink-500 to-rose-600', accent: 'pink', tools: inclusiveTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'simulations', title: 'المحاكيات التفاعلية', subtitle: 'Interactive Simulations Lab', icon: FlaskConical, color: 'from-fuchsia-500 via-cyan-500 to-emerald-500', accent: 'cyan', tools: simulationTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'robotics', title: 'الروبوتات والبناء الذكي', subtitle: 'Robotics & Construction', icon: Bot, color: 'from-cyan-500 to-blue-600', accent: 'cyan', tools: roboticsTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
  { id: 'sustainability', title: 'التقنيات المستدامة', subtitle: 'Sustainable Tech', icon: Leaf, color: 'from-emerald-500 to-green-600', accent: 'emerald', tools: sustainabilityTools, extraTools: undefined as typeof simulationTools | undefined, extraTitle: undefined as string | undefined },
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

/* ─────────────── Floating Particles ─────────────── */
const FloatingParticles = () => {
  const particles = React.useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.05,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(139,92,246,${p.opacity}), rgba(6,182,212,${p.opacity * 0.5}))`,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────── Typewriter Effect ─────────────── */
const TypewriterText = ({ text, className }: { text: string; className?: string }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-cyan-400">|</span>}
    </span>
  );
};

/* ─────────────── Animated Counter ─────────────── */
const AnimatedCounter = ({ value }: { value: string }) => {
  const num = parseInt(value);
  const suffix = value.replace(/[0-9]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
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

/* ─────────────── 3D Tilt Card ─────────────── */
const ToolCard = ({ tool, index, lang }: { tool: typeof aiTools[0]; index: number; lang: 'ar' | 'en' }) => {
  const tr = lang === 'en' ? toolTranslationsEn[tool.title] : null;
  const displayTitle = tr?.title ?? tool.title;
  const displayDesc = tr?.description ?? tool.description;
  const ctaLabel = lang === 'en' ? 'Try it' : 'جرّب الآن';
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={() => {
        if ((tool as any).external) {
          window.open(tool.link, '_blank', 'noopener,noreferrer');
        } else {
          navigate(tool.link);
        }
      }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/20"
    >
      {/* Top gradient bar */}
      <div className={`h-1 w-full bg-gradient-to-l ${tool.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Background serial number */}
      <div className="absolute -bottom-4 -left-2 text-[80px] font-black text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-500 select-none leading-none">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${tool.gradient} rounded-full blur-3xl opacity-20`} />
      </div>

      <div className="relative z-10 p-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <tool.icon className="w-7 h-7 text-white" />
        </div>
        <h4 className="text-white font-bold text-lg mb-2 group-hover:text-white transition-colors">{displayTitle}</h4>
        <p className="text-white/35 text-sm leading-relaxed mb-5">{displayDesc}</p>
        <div className="flex items-center gap-2 text-white/25 group-hover:text-white/70 transition-all duration-300">
          <span className="text-xs font-semibold bg-gradient-to-l from-white/60 to-white/40 bg-clip-text text-transparent group-hover:from-white group-hover:to-white/80">{ctaLabel}</span>
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────── Section Divider ─────────────── */
const SectionDivider = ({ color }: { color: string }) => (
  <div className="relative h-px w-full overflow-hidden">
    <motion.div
      className={`absolute inset-0 bg-gradient-to-l ${color} opacity-30`}
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
  </div>
);

/* ─────────────── Track Section ─────────────── */
const TrackSection = ({ track, index, lang }: { track: typeof tracks[0]; index: number; lang: 'ar' | 'en' }) => {
  const [showAllSimulations, setShowAllSimulations] = useState(false);
  const accentGlows: Record<string, string> = {
    violet: 'rgba(139,92,246,0.1)',
    cyan: 'rgba(6,182,212,0.1)',
    emerald: 'rgba(16,185,129,0.1)',
    pink: 'rgba(236,72,153,0.1)',
  };

  // Special cinematic showcase for the Simulations track
  if (track.id === 'simulations') {
    return <SimulationsShowcase tools={track.tools} lang={lang} toolTranslations={toolTranslationsEn} />;
  }

  return (
    <section id={track.id} className="py-24 md:py-32 relative scroll-mt-28">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 50% at ${index % 2 === 0 ? '20%' : '80%'} 50%, ${accentGlows[track.accent]}, transparent)`
      }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Track badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-gradient-to-l ${track.color} bg-opacity-10 mb-6`}
            style={{ background: `linear-gradient(135deg, ${accentGlows[track.accent]}, transparent)` }}
          >
            <track.icon className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white/60 text-xs font-mono tracking-wider uppercase">{track.subtitle}</span>
          </motion.div>

          <div className="flex items-center gap-4 mb-3">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-xl shadow-black/20`}>
              <track.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white">{lang === 'en' ? trackTranslationsEn[track.id]?.title ?? track.title : track.title}</h2>
            </div>
          </div>
          <p className="text-white/40 text-base mt-4 max-w-2xl">{lang === 'en' ? trackTranslationsEn[track.id]?.description ?? trackDescriptions[track.id] : trackDescriptions[track.id]}</p>
          <div className="flex items-center gap-3 mt-5">
            <div className={`h-1.5 w-20 rounded-full bg-gradient-to-l ${track.color}`} />
            <span className="text-white/30 text-sm font-medium">{track.tools.length + (track.extraTools?.length || 0)} {lang === 'en' ? 'tools available' : 'أداة متاحة'}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {track.tools.map((tool, i) => (
            <ToolCard key={i} tool={tool} index={i} lang={lang} />
          ))}
        </div>

        {/* Simulations Preview */}
        {track.extraTools && track.extraTitle && (
          <div className="mt-20">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-lg`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{lang === 'en' ? 'Interactive Simulations' : track.extraTitle}</h3>
                  <span className="text-white/30 text-sm">{track.extraTools.length} {lang === 'en' ? 'interactive scientific simulations' : 'محاكاة علمية تفاعلية'}</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {track.extraTools.slice(0, 2).map((tool, i) => (
                <ToolCard key={`preview-${i}`} tool={tool} index={i} lang={lang} />
              ))}
            </div>

            {/* Shimmer Explore button */}
            {!showAllSimulations && (
              <motion.div
                className="flex justify-center mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setShowAllSimulations(true)}
                  className="group relative flex items-center gap-4 px-10 py-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <Sparkles className="w-5 h-5 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-white/70 group-hover:text-white font-bold text-lg transition-colors">{lang === 'en' ? 'Discover more' : 'اكتشف المزيد'}</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-sm font-medium">{track.extraTools.length - 2}+</span>
                  <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-y-1 transition-all" />
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {showAllSimulations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
                    {track.extraTools.slice(2).map((tool, i) => (
                      <ToolCard key={`extra-${i}`} tool={tool} index={i} lang={lang} />
                    ))}
                  </div>
                  <div className="flex justify-center mt-10">
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
  const { dir, language, toggleLanguage } = useLanguage();
  const lang: 'ar' | 'en' = language === 'en' ? 'en' : 'ar';
  const ui = lang === 'en' ? uiTranslationsEn : uiTranslationsAr;
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem('gju_mode', 'true');
  }, []);

  const handleBackToMain = () => {
    sessionStorage.removeItem('gju_mode');
    navigate('/');
  };

  const scrollToTrack = (id: string) => {
    setActiveTrack(id);
    const el = document.getElementById(id);
    if (!el) return;
    // Compensate for sticky header height (measured live, fallback 72px)
    const stickyEl = document.querySelector<HTMLElement>('[data-sticky-tracknav]');
    const offset = (stickyEl?.offsetHeight ?? 72) + 16;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#04040e]" dir={dir} data-no-tts>
      {/* Cancel any in-flight TTS the moment this page mounts */}
      {(() => { try { window.speechSynthesis?.cancel(); } catch {} return null; })()}
      <Helmet>
        <html lang={lang === 'en' ? 'en' : 'ar'} dir={dir} />
        <title>{lang === 'en' ? 'Future of Technology — GJU 3030 Innovation Challenge' : 'مستقبل التكنولوجيا — مسابقة GJU 3030 للابتكار'}</title>
        <meta name="description" content={lang === 'en' ? 'Future of Technology — GJU 3030 Innovation Challenge. AI, robotics, sustainable tech and inclusive learning showcase.' : 'مستقبل التكنولوجيا — مسابقة GJU 3030 للابتكار. منصة عرض للذكاء الاصطناعي والروبوتات والتقنيات المستدامة والتعلم الدامج.'} />
        <meta name="keywords" content="GJU 3030, German Jordanian University, Future of Technology, Innovation Challenge, AI, Robotics, Sustainability, مستقبل التكنولوجيا, الجامعة الألمانية الأردنية, الذكاء الاصطناعي, الروبوتات, الاستدامة" />
        <meta name="author" content={lang === 'en' ? 'GJU 3030' : 'GJU 3030'} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={lang === 'en' ? 'Future of Technology — GJU 3030' : 'مستقبل التكنولوجيا — GJU 3030'} />
        <meta property="og:description" content={lang === 'en' ? 'GJU 3030 Innovation Challenge — AI, robotics, sustainable tech & inclusive learning.' : 'مسابقة GJU 3030 للابتكار — ذكاء اصطناعي وروبوتات وتقنيات مستدامة وتعلّم دامج.'} />
        <meta property="og:site_name" content="GJU 3030 — Future of Technology" />
        <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'ar_JO'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={lang === 'en' ? 'Future of Technology — GJU 3030' : 'مستقبل التكنولوجيا — GJU 3030'} />
        <meta name="twitter:description" content={lang === 'en' ? 'GJU 3030 Innovation Challenge.' : 'مسابقة GJU 3030 للابتكار.'} />
        <meta name="application-name" content="GJU 3030" />
        <meta name="apple-mobile-web-app-title" content="GJU 3030" />
      </Helmet>

      <FloatingParticles />

      {/* Floating Language Toggle */}
      <button
        onClick={toggleLanguage}
        aria-label="Toggle language"
        className="fixed top-5 left-5 z-[60] group flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#04040e]/80 backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/[0.06] transition-all duration-300 shadow-lg shadow-black/40"
      >
        <Languages className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
        <span className="text-white/70 group-hover:text-white text-xs font-bold tracking-wider">
          {lang === 'en' ? 'AR' : 'EN'}
        </span>
      </button>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-gradient-to-b from-violet-900/15 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-900/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-emerald-900/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>

      <main className="flex-1 relative z-10">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-8 pb-20 overflow-hidden">
          {/* 3D Scene Background */}
          <div className="absolute inset-0 z-0">
            <Hero3DScene />
          </div>

          {/* Foreground Content */}
          <div className="relative z-10 text-center max-w-5xl mx-auto pointer-events-none">
            {/* Animated Glowing Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full mb-10 pointer-events-auto"
            >
              <div className="absolute inset-0 rounded-full p-[1px] overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-300/60 to-amber-500/40 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-[1px] rounded-full bg-[#04040e]/80 backdrop-blur-md" />
              </div>
              <Trophy className="w-4 h-4 text-amber-400 relative z-10" />
              <span className="text-amber-300/90 text-sm font-semibold tracking-wide relative z-10">{ui.badge}</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse relative z-10" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[8.5rem] font-black mb-6 leading-[0.85] tracking-tight"
              style={{ textShadow: '0 0 80px rgba(124,58,237,0.3)' }}
            >
              <span className="block bg-gradient-to-l from-violet-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Future
              </span>
              <span className="block text-white/95 text-5xl md:text-7xl lg:text-8xl mt-2">
                of Technology
              </span>
            </motion.h1>

            {/* Arabic accent line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-400/50" />
              <span className="text-white/70 text-xl md:text-2xl font-semibold tracking-wide">{lang === 'en' ? 'Future of Technology' : 'مستقبل التكنولوجيا'}</span>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400/50" />
            </motion.div>

            {/* Typewriter Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-base md:text-lg text-white/45 max-w-2xl mx-auto mb-8 leading-relaxed h-14 px-4"
            >
              <TypewriterText key={lang} text={ui.subtitle} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs mb-12 pointer-events-auto"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'German Jordanian University' : 'الجامعة الألمانية الأردنية'}</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-16 pointer-events-auto"
            >
              <button
                onClick={() => scrollToTrack('ai')}
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-l from-violet-600 to-cyan-600 text-white font-bold text-base overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  {ui.exploreTracks}
                </span>
              </button>
              <button
                onClick={() => scrollToTrack('robotics')}
                className="group px-8 py-4 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/80 font-bold text-base hover:bg-white/[0.10] hover:border-white/25 hover:text-white transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {ui.interactiveSims}
                </span>
              </button>
            </motion.div>

            {/* Stats with gradient borders */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 max-w-4xl mx-auto mb-16 pointer-events-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              {stats.map((stat, i) => {
                const labels = lang === 'en'
                  ? [ui.statTools, ui.statSims, ui.statAI, ui.statSubjects]
                  : [ui.statTools, ui.statSims, ui.statAI, ui.statSubjects];
                const gradients = [
                  'from-violet-500/40 to-purple-500/40',
                  'from-cyan-500/40 to-blue-500/40',
                  'from-emerald-500/40 to-teal-500/40',
                  'from-amber-500/40 to-orange-500/40',
                ];
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="relative group overflow-hidden rounded-2xl"
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[i]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]`}>
                      <div className="w-full h-full rounded-2xl bg-[#04040e]" />
                    </div>
                    <div className="relative bg-[#04040e]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-center group-hover:border-transparent transition-colors">
                      <stat.icon className="w-6 h-6 text-white/30 mx-auto mb-3 group-hover:text-white/60 transition-colors" />
                      <div className="text-4xl md:text-5xl font-black text-white mb-1.5">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-xs text-white/40 font-medium">{labels[i] ?? stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-white/25 text-xs font-mono tracking-widest uppercase">{ui.scroll}</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="w-5 h-5 text-white/25" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ MISSION CONTROL · TRACK NAVIGATOR ═══════════════ */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 90%)',
          }} />
          {/* Glow orbs */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14 md:mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/50 text-[11px] font-mono tracking-[0.25em] uppercase">{ui.missionControl}</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {ui.chooseTrack} <span className="bg-gradient-to-l from-violet-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">{ui.chooseTrackHighlight}</span>
              </h2>
              <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto">
                {ui.chooseTrackSub}
              </p>
            </motion.div>

            {/* Track cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 max-w-7xl mx-auto">
              {tracks.map((track, i) => {
                const toolCount = track.tools.length + (track.extraTools?.length || 0);
                const isActive = activeTrack === track.id;
                return (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => scrollToTrack(track.id)}
                    className="group relative text-right"
                  >
                    {/* Animated gradient border */}
                    <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-60 ${isActive ? 'opacity-80' : ''} blur-sm transition-opacity duration-500`} />
                    <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''} transition-opacity duration-500`} />

                    {/* Card body */}
                    <div className="relative bg-[#04040e]/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/[0.06] group-hover:border-transparent transition-all duration-500 overflow-hidden h-full">
                      {/* Inner glow */}
                      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-20 ${isActive ? 'opacity-25' : ''} blur-2xl transition-opacity duration-500`} />

                      {/* Icon orb */}
                      <div className="relative mb-4 flex items-center justify-between">
                        <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${track.color} p-[1.5px] shadow-lg`}>
                          <div className="w-full h-full rounded-xl bg-[#04040e] flex items-center justify-center">
                            <track.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                        </div>
                        {/* Count chip */}
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/40 group-hover:text-white/70 group-hover:border-white/20'
                        }`}>
                          {toolCount}+
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-white font-bold text-base md:text-lg mb-1.5 leading-tight">
                        {lang === 'en' ? trackTranslationsEn[track.id]?.title ?? track.title : track.title}
                      </h3>
                      <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-4 group-hover:text-white/55 transition-colors">
                        {track.subtitle || (lang === 'en' ? 'Explore tools and simulations' : 'استكشف الأدوات والمحاكيات')}
                      </p>

                      {/* CTA bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] group-hover:border-white/[0.12] transition-colors">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-white/30 group-hover:text-white/60 transition-colors">
                          {ui.explore}
                        </span>
                        <ArrowLeft className="w-3.5 h-3.5 text-white/30 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="trackActiveIndicator"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-l ${track.color}`}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ COMPACT STICKY NAV (after scroll) ═══════════════ */}
        <div data-sticky-tracknav className="sticky top-0 z-50 bg-[#04040e]/85 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              {tracks.map((track) => {
                const toolCount = track.tools.length + (track.extraTools?.length || 0);
                return (
                  <button
                    key={track.id}
                    onClick={() => scrollToTrack(track.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTrack === track.id
                        ? 'bg-white/10 text-white border border-white/15'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <track.icon className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? trackTranslationsEn[track.id]?.title ?? track.title : track.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTrack === track.id ? 'bg-white/15 text-white/70' : 'bg-white/5 text-white/25'
                    }`}>{toolCount}</span>
                    {activeTrack === track.id && (
                      <motion.div
                        layoutId="activeGlow"
                        className={`absolute -bottom-3 left-2 right-2 h-0.5 rounded-full bg-gradient-to-l ${track.color}`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════ TRACK SECTIONS ═══════════════ */}
        {tracks.map((track, index) => (
          <React.Fragment key={track.id}>
            {index > 0 && <SectionDivider color={track.color} />}
            <TrackSection track={track} index={index} lang={lang} />
          </React.Fragment>
        ))}

        {/* ═══════════════ TECH STACK - Marquee ═══════════════ */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-white/20 text-xs font-mono tracking-widest uppercase mb-3 block">{ui.builtWith}</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">{ui.techStackTitle}</h2>
            </motion.div>

            {/* Marquee */}
            <div className="relative overflow-hidden py-6">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-l from-transparent to-[#04040e] z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-[#04040e] z-10" />
              <motion.div
                className="flex gap-6 w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {[...techStack, ...techStack, ...techStack].map((tech, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-7 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors shrink-0"
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <span className="text-white/60 font-semibold text-sm">{tech.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <GJUFooter />
    </div>
  );
};

export default GJUCompetition;
