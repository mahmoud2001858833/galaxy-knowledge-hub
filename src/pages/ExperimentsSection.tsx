import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, X, Play, Info, Search, Atom, Zap, Sparkles, Waves, Beaker, 
  Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, 
  Battery, Microscope, Heart, Rocket, Eye, Layers, Mountain, Flame, Droplets, 
  Circle, Clock, Aperture, Hexagon, Snowflake, FlaskRound, Radiation, Leaf, 
  Scissors, Shield, Bug, Shapes, Dice1, Bot, Wrench, Wind, Magnet, Compass,
  GraduationCap, BookOpen, SlidersHorizontal, LayoutGrid, Check, ChevronDown,
  ArrowUpDown, Sparkle, Award, CheckCircle2, Bookmark
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const clickSound = '/message-notification.mp3';

type Category = 'physics' | 'chemistry' | 'biology' | 'earth-space' | 'math' | 'engineering';
type GradeLevel = 'all' | 'basic' | 'grade-10' | 'grade-11' | 'grade-12' | 'university';
type Difficulty = 'سهل' | 'متوسط' | 'متقدم';
type SortOption = 'featured' | 'alphabetical' | 'grade-asc' | 'difficulty-asc';
type ViewMode = 'grid' | 'grouped';

interface Simulation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  features: string[];
  category: Category;
  grade: string;
  gradeId: GradeLevel;
  difficulty: Difficulty;
  duration: string;
  concept: string;
  badge?: string;
}

const CATEGORIES: { id: Category | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'الكل', color: 'from-cyan-500 to-purple-500' },
  { id: 'physics', label: 'الفيزياء', color: 'from-blue-500 to-indigo-500' },
  { id: 'chemistry', label: 'الكيمياء', color: 'from-emerald-500 to-teal-500' },
  { id: 'biology', label: 'الأحياء', color: 'from-pink-500 to-red-500' },
  { id: 'earth-space', label: 'الأرض والفضاء', color: 'from-amber-500 to-orange-500' },
  { id: 'math', label: 'الرياضيات', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'engineering', label: 'الهندسة والتقنية', color: 'from-slate-500 to-zinc-500' },
];

const GRADE_LEVELS: { id: GradeLevel; label: string; shortLabel: string; icon: string; desc: string }[] = [
  { id: 'all', label: 'جميع الصفوف الدراسية', shortLabel: 'كل الصفوف', icon: '🏫', desc: 'استعراض كافة المختبرات والمحاكيات' },
  { id: 'basic', label: 'المرحلة الأساسية (الصفوف 7 - 9)', shortLabel: 'الأساسي (7-9)', icon: '🎒', desc: 'مفاهيم العلوم والتجارب التأسيسية' },
  { id: 'grade-10', label: 'الصف العاشر الأساسي', shortLabel: 'الصف العاشر', icon: '📘', desc: 'الميكانيكا، حفظ الطاقة، الضوء، وعلوم المادة' },
  { id: 'grade-11', label: 'الصف الحادي عشر (الأول ثانوي)', shortLabel: 'الأول ثانوي', icon: '🔬', desc: 'الموجات، الموائع، الحرارة، والاتزان الكيميائي' },
  { id: 'grade-12', label: 'الصف الثاني عشر (التوجيهي)', shortLabel: 'التوجيهي (12)', icon: '🎓', desc: 'الكهرومغناطيسية، الكم، النووية، والوراثة' },
  { id: 'university', label: 'المستوى الجامعي والمتقدم', shortLabel: 'جامعي ومتقدم', icon: '🏛️', desc: 'الفيزياء الحديثة، الموصلية، والنسبية الخاصة' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: '⭐ الأكثر تميزاً وشهرة' },
  { id: 'alphabetical', label: '🔤 الترتيب الأبجدي (أ - ي)' },
  { id: 'grade-asc', label: '🎓 حسب التسلسل الدراسي' },
  { id: 'difficulty-asc', label: '⚡ حسب مستوى الصعوبة' },
];

const ExperimentsSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeGrade, setActiveGrade] = useState<GradeLevel>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const simulations: Simulation[] = [
    { 
      id: 'blackbody-radiation', 
      title: 'إشعاع الجسم الأسود وتكميم الطاقة', 
      description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي، حاسبات الطاقة، وفرضية بلانك', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-purple-600 to-blue-600', 
      route: '/simulation/blackbody-radiation', 
      features: ['التمثيل البياني مع الطيف المرئي', 'حاسبات التردد والطاقة', 'مساعد ذكي للفيزياء'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'فرضية بلانك والطيف الكهرومغناطيسي',
      badge: 'مختبر كمي'
    },
    { 
      id: 'build-atom', 
      title: 'بناء الذرة والجدول الدوري', 
      description: 'بناء الذرات بسحب وإفلات البروتونات والنيوترونات والإلكترونات واكتشاف استقرار العناصر والأيونات', 
      icon: <Zap className="w-6 h-6" />, 
      color: 'from-orange-600 to-red-600', 
      route: '/simulation/build-atom', 
      features: ['سحب وإفلات الجسيمات الذرية', 'تحديد العنصر تلقائياً', 'واجهة ثلاثية الأبعاد'], 
      category: 'physics',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'التركيب الذري وشحنة النواة',
      badge: 'تأسيسي'
    },
    { 
      id: 'lhc-simulation', 
      title: 'مصادم الهدرونات الكبير (LHC)', 
      description: 'محاكاة متقدمة لمصادم الهدرونات مع تسريع الجسيمات لسرعة الضوء وتصادمات البروتونات عالية الطاقة', 
      icon: <Sparkles className="w-6 h-6" />, 
      color: 'from-cyan-500 to-purple-600', 
      route: '/lhc-simulation', 
      features: ['تسريع الجسيمات', 'تصادمات 13 TeV', 'كشف البوزونات النادرة'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'فيزياء الجسيمات الأولية',
      badge: 'بحثي متقدم'
    },
    { 
      id: 'electromagnetic-waves', 
      title: 'الموجات الكهرومغناطيسية والطيف الكامل', 
      description: 'استكشاف الطيف الكهرومغناطيسي الكامل من موجات الراديو إلى أشعة غاما مع حسابات التردد والسرعة', 
      icon: <Waves className="w-6 h-6" />, 
      color: 'from-red-500 to-purple-600', 
      route: '/electromagnetic-waves', 
      features: ['الطيف الكامل بالألوان الحقيقية', 'التحكم بالتردد والطول الموجي', 'تطبيقات الرادار والاتصالات'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'معادلة الموجات c = λ·f',
      badge: 'طيف مرئي'
    },
    { 
      id: 'nuclear-reactions', 
      title: 'التفاعلات والانشطار والاندماج النووي', 
      description: 'محاكاة تفاعلات الانشطار لليورانيوم والاندماج النووي للشمس وحساب فرق الكتلة وطاقة أينشتاين', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-green-500 to-blue-500', 
      route: '/nuclear-reactions', 
      features: ['انشطار اليورانيوم-235', 'اندماج النجوم بالهيدروجين', 'مقارنة الطاقة E=mc²'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'طاقة الترابط والانشطار النووي',
      badge: 'طاقة نووية'
    },
    { 
      id: 'chemical-reactions', 
      title: 'التفاعلات الكيميائية والروابط الجزيئية 3D', 
      description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات الكيميائية وموازنة المعادلات وكسر وتكوين الروابط', 
      icon: <Beaker className="w-6 h-6" />, 
      color: 'from-purple-500 to-blue-500', 
      route: '/chemical-reactions', 
      features: ['30+ تفاعل كيميائي', 'رسوم 3D متقدمة', 'تصور الروابط التساهمية والأيونية'], 
      category: 'chemistry',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'حفظ الكتلة وموازنة المعادلات',
      badge: '3D تفاعلي'
    },
    { 
      id: 'fourier-series', 
      title: 'سلسلة فورييه وتحليل الإشارات', 
      description: 'تفكيك الدوال المعقدة والموجات المربعة والمثلثة إلى توافقيات جيبية متتالية وكشف ظاهرة غيبس', 
      icon: <Activity className="w-6 h-6" />, 
      color: 'from-indigo-500 to-pink-600', 
      route: '/fourier-series', 
      features: ['دوال عادية وقطعية', '10+ أمثلة جاهزة', 'أنيميشن تطور التقريب الرياضي'], 
      category: 'math',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'تحليل الإشارات والتوافقيات',
      badge: 'رياضيات متقدمة'
    },
    { 
      id: '3d-function-visualizer', 
      title: 'التمثيل البياني للدوال ثلاثية الأبعاد', 
      description: 'عرض الرسوم البيانية للدوال الرياضية متعددة المتغيرات في الفضاء 3D مع مستويات التقاطع والتدوير', 
      icon: <Box className="w-6 h-6" />, 
      color: 'from-emerald-500 to-cyan-600', 
      route: '/3d-function-visualizer', 
      features: ['عرض 1D, 2D, 3D', 'تدوير تفاعلي 360°', '15+ معادلة فراغية جاهزة'], 
      category: 'math',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الهندسة التحليلية والفراغية',
      badge: 'فضاء 3D'
    },
    { 
      id: 'optics-lab', 
      title: 'مختبر البصريات والعدسات والمرايا', 
      description: 'محاكاة مسارات الأشعة الضوئية خلال العدسات المحدبة والمقعرة والمرايا الكروية والمناشير الزجاجية', 
      icon: <Sun className="w-6 h-6" />, 
      color: 'from-yellow-500 to-red-500', 
      route: '/simulation/optics-lab', 
      features: ['عدسات محدبة ومقعرة', 'مرايا كروية ومستوية', 'قوانين الانكسار وتشتت الضوء'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'معادلة العدسات وقوة التكبير',
      badge: 'بصريات'
    },
    { 
      id: 'circuit-builder', 
      title: 'بناء الدوائر الكهربائية التفاعلي المتقدم', 
      description: 'مختبر افتراضي كامل لبناء الدوائر الإلكترونية مع مقاومات ومكثفات ومفاتيح وقياس حي للتيار والجهد', 
      icon: <Cpu className="w-6 h-6" />, 
      color: 'from-blue-500 to-teal-500', 
      route: '/simulation/circuit-builder-advanced', 
      features: ['نظام أسلاك تفاعلي حقيقي', '9+ مكونات إلكترونية', 'تحليل حي للتيار وقانون أوم'], 
      category: 'engineering',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'قانون أوم وتوصيل المقاومات',
      badge: 'مختبر إلكتروني'
    },
    { 
      id: 'projectile-motion', 
      title: 'حركة المقذوفات في بعدين', 
      description: 'مختبر فيزيائي 3D لدراسة زاوية الإطلاق، المدى الأفقي، أقصى ارتفاع، وتأثير مقاومة الهواء والجاذبية', 
      icon: <Target className="w-6 h-6" />, 
      color: 'from-green-500 to-teal-500', 
      route: '/simulation/projectile-motion', 
      features: ['مشهد ثلاثي الأبعاد تفاعلي', 'تحليل متجهات السرعة v_x و v_y', 'حساب زمن التحليق والمدى'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'معادلات الحركة بتسارع ثابت',
      badge: 'فيزياء ميكانيكية'
    },
    { 
      id: 'solar-system', 
      title: 'النظام الشمسي والأجرام الفضائية 3D', 
      description: 'محاكاة فلكية ثلاثية الأبعاد كاملة لحركة الكواكب والمدارات وسرعات الدوران حول الشمس مع تحكم 360°', 
      icon: <Globe className="w-6 h-6" />, 
      color: 'from-indigo-500 to-pink-500', 
      route: '/simulation/solar-system-3d', 
      features: ['تحكم كامل بالكاميرا 360°', 'كواكب المجموعة الشمسية الحقيقية', 'سرعات مدارية محسوبة فلكياً'], 
      category: 'earth-space',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'النظام الشمسي ومدارات الكواكب',
      badge: 'فلك 3D'
    },
    { 
      id: 'genetics-lab', 
      title: 'مختبر الوراثة ومربع بونيت والصفات', 
      description: 'محاكاة تفاعلية لعلم الوراثة المندلية والسيادة المشتركة وتضاعف سلاسل DNA والطفرات الوراثية', 
      icon: <Dna className="w-6 h-6" />, 
      color: 'from-pink-500 to-red-500', 
      route: '/simulation/genetics-lab', 
      features: ['مربع بونيت الوراثي الحي', 'تضاعف سلاسل DNA', 'حساب احتمالات الطرز الجينية'], 
      category: 'biology',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'قوانين مندل وتوارث الصفات',
      badge: 'وراثة خلوية'
    },
    { 
      id: 'ecosystem', 
      title: 'النظام البيئي والتوازن الطبيعي', 
      description: 'محاكاة النظام البيئي الحي، السلاسل والشبكات الغذائية، توازن المنتجات والمستهلكات، وتأثير التدخل البشري', 
      icon: <TreeDeciduous className="w-6 h-6" />, 
      color: 'from-green-600 to-lime-500', 
      route: '/simulation/ecosystem', 
      features: ['السلسلة والشبكة الغذائية', 'مخططات التعداد السكاني', 'تأثير التغيرات المناخية'], 
      category: 'biology',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'انتقال الطاقة والتوازن الحيوي',
      badge: 'بيئة'
    },
    { 
      id: 'electromagnetism', 
      title: 'المجال المغناطيسي وقاعدة اليد اليمنى', 
      description: 'تخطيط خطوط المجال المغناطيسي حول الأسلاك المستقيمة والملفات اللولبية وقوة لورنتز على الشحنات', 
      icon: <Zap className="w-6 h-6" />, 
      color: 'from-purple-600 to-cyan-500', 
      route: '/simulation/electromagnetism', 
      features: ['المجال حول السلك والملف', 'قاعدة اليد اليمنى التفاعلية', 'قوة لورنتز المغناطيسية'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'المجال المغناطيسي للتيار الكهربائي',
      badge: 'كهرومغناطيسية'
    },
    { 
      id: 'waves-sound', 
      title: 'الموجات الميكانيكية وتأثير دوبلر', 
      description: 'محاكاة حركة الموجات المستعرضة والطولية وسرعة الصوت في الأوساط وظاهرة دوبلر عند حركة المصدر', 
      icon: <Waves className="w-6 h-6" />, 
      color: 'from-green-600 to-blue-500', 
      route: '/simulation/waves-sound', 
      features: ['موجات طولية ومستعرضة', 'محاكاة تأثير دوبلر بالصوت', 'تراكب وتداخل الموجات'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'خصائص الموجات وتأثير دوبلر',
      badge: 'صوت وموجات'
    },
    { 
      id: 'static-electricity', 
      title: 'الكهرباء الساكنة وقانون كولوم', 
      description: 'استكشاف الشحن بالدلك واللمس والحث، خطوط المجال الكهربائي بين الشحنات، ومولد فان دي غراف', 
      icon: <Sparkles className="w-6 h-6" />, 
      color: 'from-yellow-600 to-red-500', 
      route: '/simulation/static-electricity', 
      features: ['قانون كولوم للقوة الكهربائية', 'خطوط المجال بين الشحنات', 'محاكاة مولد فان دي غراف'], 
      category: 'physics',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'الشحنات الكهربائية وقانون كولوم',
      badge: 'كهرباء ساكنة'
    },
    { 
      id: 'advanced-astronomy', 
      title: 'الفلك المتقدم وقوانين كبلر والكسوف', 
      description: 'محاكاة كسوف الشمس وخسوف القمر وأطوار القمر وقوانين كبلر الثلاثة لحركة الأجرام المدارية', 
      icon: <Globe className="w-6 h-6" />, 
      color: 'from-indigo-600 to-pink-500', 
      route: '/simulation/advanced-astronomy', 
      features: ['محاكاة الكسوف والخسوف', 'أطوار القمر الشهرية', 'قوانين كبلر وحساب المساحات المدارية'], 
      category: 'earth-space',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'قوانين كبلر والظواهر الفلكية',
      badge: 'فلك متقدم'
    },
    { 
      id: 'quantum-mechanics', 
      title: 'ميكانيكا الكم والشق المزدوج', 
      description: 'تجربة الشق المزدوج التأسيسية، النفق الكمي عبر الحواجز، والتراكب الخطي للحالات الكمية', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-pink-600 to-indigo-500', 
      route: '/simulation/quantum-mechanics', 
      features: ['تجربة الشق المزدوج التداخلية', 'النفق الكمي واختراق الحاجز', 'الدالة الموجية لشرودنغر'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'الازدواجية الموجية والكمية',
      badge: 'فيزياء الكم'
    },
    { 
      id: 'analytical-chemistry', 
      title: 'الكيمياء التحليلية والمعايرة الحجمية', 
      description: 'محاكاة معايرة حمض-قاعدة مع كواشف لونية دقيقة، رسم منحنى المعايرة، وتحديد نقطة التكافؤ', 
      icon: <FlaskConical className="w-6 h-6" />, 
      color: 'from-emerald-600 to-teal-500', 
      route: '/simulation/analytical-chemistry', 
      features: ['معايرة حمض وقاعدة بسحاحة', 'منحنى المعايرة ونقطة التكافؤ', 'كواشف الفينولفثالين والميثيل'], 
      category: 'chemistry',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'التحليل الحجمي والمحاليل القياسية',
      badge: 'مختبر كيميائي'
    },
    { 
      id: 'electrochemistry', 
      title: 'الكيمياء الكهربائية والخلايا الجلفانية', 
      description: 'بناء الخلايا الجلفانية وخلايا التحليل الكهربائي، قياس جهد الخلية القياسي E°، وحسابات معادلة نيرنست', 
      icon: <Battery className="w-6 h-6" />, 
      color: 'from-amber-600 to-yellow-500', 
      route: '/simulation/electrochemistry', 
      features: ['الخلية الجلفانية والقنطرة الملحية', 'جدول جهود الاختزال القياسية', 'الطلاء بالتحليل الكهربائي'], 
      category: 'chemistry',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'تفاعلات التأكسد والاختزال والجهد',
      badge: 'خلايا كيميائية'
    },
    { 
      id: 'molecular-biology', 
      title: 'البيولوجيا الجزيئية وتضاعف DNA وPCR', 
      description: 'خطوات تضاعف الحمض النووي، النسخ إلى mRNA، الترجمة إلى سلاسل بروتينية، وتفاعل البلمرة PCR', 
      icon: <Microscope className="w-6 h-6" />, 
      color: 'from-violet-600 to-fuchsia-500', 
      route: '/simulation/molecular-biology', 
      features: ['آلية أنزيمات الهيليكيز والبوليميريز', 'الشفرة الوراثية وتكوين البروتين', 'دورات تفاعل البلمرة PCR'], 
      category: 'biology',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'العقيدة المركزية للبيولوجيا الجزيئية',
      badge: 'بيولوجيا جزيئية'
    },
    { 
      id: 'human-body', 
      title: 'أجهزة جسم الإنسان والتنظيم الحيوي', 
      description: 'استكشاف أجهزة الدوران، التنفس، العصبي، والهضمي مع نماذج تفاعلية ونبضات القلب وتبادل الغازات', 
      icon: <Heart className="w-6 h-6" />, 
      color: 'from-red-600 to-pink-500', 
      route: '/simulation/human-body', 
      features: ['الدورة الدموية الصغرى والكبرى', 'آلية الشهيق والزفير وتبادل O2', 'المسارات العصبية المنعكسة'], 
      category: 'biology',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'أجهزة الجسم والتكامل الوظيفي',
      badge: 'تشريح حيوي'
    },
    { 
      id: 'advanced-nuclear', 
      title: 'الفيزياء النووية وعمر النصف الإشعاعي', 
      description: 'محاكاة اضمحلال ألفا وبيتا وجاما، قانون التناقص الإشعاعي، وحسابات عمر النصف والاستقرار النووي', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-lime-600 to-emerald-500', 
      route: '/simulation/advanced-nuclear', 
      features: ['اضمحلال ألفا وبيتا وجاما', 'منحنى عمر النصف والتناقص الأسي', 'طاقة الربط النووية لكل نيوكليون'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'النشاط الإشعاعي وعمر النصف N(t)',
      badge: 'إشعاع نووي'
    },
    { 
      id: 'digital-electronics', 
      title: 'الإلكترونيات الرقمية وبوابات المنطق', 
      description: 'تصميم ومحاكاة بوابات AND, OR, NOT, XOR، الجامع النصفي والكامل، والعدادات الرقمية الثنائية', 
      icon: <Cpu className="w-6 h-6" />, 
      color: 'from-slate-600 to-zinc-500', 
      route: '/simulation/digital-electronics', 
      features: ['بوابات المنطق الأساسية والمشتقة', 'جدول الصواب (Truth Table)', 'تصميم الجامع النصفي 1-bit'], 
      category: 'engineering',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الجبر البولي والدوائر المنطقية',
      badge: 'رقميات ومنطق'
    },
    { 
      id: 'earth-sciences', 
      title: 'علوم الأرض والصفائح التكتونية والزلازل', 
      description: 'محاكاة حدود الصفائح المتباعدة والمتقاربة، تشكل السلاسل الجبلية، بؤر الزلازل، وثوران البراكين', 
      icon: <Mountain className="w-6 h-6" />, 
      color: 'from-amber-700 to-red-600', 
      route: '/simulation/earth-sciences', 
      features: ['حركة الصفائح التكتونية', 'مقياس ريختر والأمواج الزلزالية', 'دورة الصخور وطبقات الأرض'], 
      category: 'earth-space',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'التكتونيات وديناميكية القشرة الأرضية',
      badge: 'جيولوجيا'
    },
    { 
      id: 'rocket-science', 
      title: 'علوم الصواريخ والدفع الفضائي 3D', 
      description: 'مختبر 3D لمحاكاة إطلاق الصواريخ وحساب الدفع الصاروخي معادلة تسيولكوفسكي والوصول للمدار الأرضي', 
      icon: <Rocket className="w-6 h-6" />, 
      color: 'from-sky-600 to-indigo-500', 
      route: '/simulation/rocket-science', 
      features: ['معادلة الصاروخ وتغير الكتلة', 'سرعة الإفلات والمدارات المستقرة', 'مراحل الإطلاق وحساب Δv'], 
      category: 'earth-space',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'الدفع وحفظ كمية الحركة الخطية',
      badge: 'فضاء وصواريخ'
    },
    { 
      id: 'advanced-optics', 
      title: 'البصريات الموجية والاستقطاب والحيود', 
      description: 'محاكاة تشتت الضوء في المناشير، تجربة يونغ، حيود الشق الواحد، واستقطاب الضوء عبر مرشحات بولارويد', 
      icon: <Eye className="w-6 h-6" />, 
      color: 'from-cyan-600 to-emerald-500', 
      route: '/simulation/advanced-optics', 
      features: ['تشتت الضوء الأبيض لألوان الطيف', 'قانون مالوس للاستقطاب', 'حيود الشق الأحادي وأهداب الحيود'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'الطبيعة الموجية واستقطاب الضوء',
      badge: 'بصريات متقدمة'
    },
    { 
      id: 'materials-science', 
      title: 'علوم المواد واختبارات الإجهاد والصلابة', 
      description: 'دراسة الشبكات البلورية للمعادن، منحنى الإجهاد والانفعال، وتشكيل السبائك ومقاومة الكسر', 
      icon: <Layers className="w-6 h-6" />, 
      color: 'from-stone-600 to-zinc-500', 
      route: '/simulation/materials-science', 
      features: ['منحنى الإجهاد والانفعال (Stress-Strain)', 'معامل يونغ والمرونة البلاستيكية', 'الهياكل البلورية FCC و BCC'], 
      category: 'engineering',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'الخواص الميكانيكية للمواد الصلبة',
      badge: 'هندسة المواد'
    },
    { 
      id: 'thermodynamics', 
      title: 'الديناميكا الحرارية ودورة كارنو 3D', 
      description: 'مختبر 3D تفاعلي للغاز المثالي، العمليات الإيزوحرارية والإديباتية، مخطط P-V، وكفاءة محرك كارنو', 
      icon: <Flame className="w-6 h-6" />, 
      color: 'from-orange-600 to-red-600', 
      route: '/simulation/thermodynamics', 
      features: ['القانون الأول والثاني للديناميكا', 'دورة كارنو الحرارية والكفاءة η', 'توزيع ماكسويل-بولتزمان للسرعات'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'قوانين الديناميكا الحرارية والغاز المثالي',
      badge: 'حراريات 3D'
    },
    { 
      id: 'fluid-mechanics', 
      title: 'ميكانيكا الموائع ومبدأ برنولي وأرخميدس 3D', 
      description: 'مختبر 3D: قاعدة أرخميدس والطفو، الضغط الهيدروستاتيكي مع العمق، ومعادلة برنولي وأنبوب فنتوري', 
      icon: <Droplets className="w-6 h-6" />, 
      color: 'from-blue-500 to-cyan-500', 
      route: '/simulation/fluid-mechanics', 
      features: ['قاعدة أرخميدس وقوة الطفو', 'معادلة الاستمرارية A₁v₁ = A₂v₂', 'معادلة برنولي والضغط الحركي'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'ميكانيكا الموائع الساكنة والمتحركة',
      badge: 'سوائل وموائع'
    },
    { 
      id: 'circular-motion', 
      title: 'الحركة الدائرية المنتظمة وقوة الجذب المركزي', 
      description: 'مختبر 3D للحركة الدائرية، متجهات السرعة المماسية والتسارع المركزي ac، وتطبيقات الأقمار الصناعية', 
      icon: <Circle className="w-6 h-6" />, 
      color: 'from-violet-500 to-purple-600', 
      route: '/simulation/circular-motion', 
      features: ['التسارع المركزي a_c = v²/r', 'قوة الشد في البندول المخروطي', 'المدار الجغرافي الثابت للأقمار'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'القوة المركزية والحركة الدورانية',
      badge: 'حركة دائرية'
    },
    { 
      id: 'special-relativity', 
      title: 'النسبية الخاصة وتمدد الزمن وتقلص الطول', 
      description: 'محاكاة مفارقة التوأمين، معامل لورنتز γ، تمدد الزمن عند السرعات النسبية القريبة من الضوء، و E=mc²', 
      icon: <Clock className="w-6 h-6" />, 
      color: 'from-yellow-500 to-orange-500', 
      route: '/simulation/special-relativity', 
      features: ['معامل لورنتز وتمدد الزمن', 'تقلص الطول في اتجاه الحركة', 'تكافؤ الكتلة والطاقة E=mc²'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'النسبية الخاصة والزمكان',
      badge: 'نسبية أينشتاين'
    },
    { 
      id: 'interference-diffraction', 
      title: 'تداخل وحيود الضوء وحلقات نيوتن', 
      description: 'تجربة الشق المزدوج التداخلية، حيود الشق الأحادي، وحساب الطول الموجي للضوء باستخدام حلقات نيوتن', 
      icon: <Aperture className="w-6 h-6" />, 
      color: 'from-indigo-500 to-pink-500', 
      route: '/simulation/interference-diffraction', 
      features: ['أهداب التداخل المضيئة والمظلمة', 'حيود الشق المنفرد وشبكة الحيود', 'حلقات نيوتن والطبقات الرقيقة'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'فرق المسار والتداخل البنّاء والهدام',
      badge: 'تداخل وحيود'
    },
    { 
      id: 'plasma-physics', 
      title: 'فيزياء البلازما والحصر المغناطيسي', 
      description: 'استكشاف الحالة الرابعة للمادة، درجات التأين العالية، حركة الجسيمات المشحونة، وتطبيقات مفاعل التوكاماك', 
      icon: <Sparkles className="w-6 h-6" />, 
      color: 'from-purple-500 to-pink-500', 
      route: '/simulation/plasma-physics', 
      features: ['تأين الغازات بالحرارة والجهد', 'الحصر المغناطيسي في التوكاماك', 'تطبيقات شاشات البلازما والفضاء'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'ديناميكا الموائع المغناطيسية (MHD)',
      badge: 'بلازما متقدمة'
    },
    { 
      id: 'chemical-kinetics', 
      title: 'حركية التفاعلات الكيميائية وسرعة التفاعل', 
      description: 'قياس سرعة استهلاك المتفاعلات ونظرية التصادم وطاقة التنشيط وتأثير درجة الحرارة والعوامل المساعدة', 
      icon: <FlaskConical className="w-6 h-6" />, 
      color: 'from-blue-500 to-cyan-500', 
      route: '/simulation/chemical-kinetics', 
      features: ['قانون سرعة التفاعل ورتبة التفاعل', 'طاقة التنشيط ومنحنى أرينيوس', 'تأثير مساحة السطح والمحفزات'], 
      category: 'chemistry',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'سرعة التفاعل الكيميائي ورتبته',
      badge: 'حركية التفاعلات'
    },
    { 
      id: 'organic-chemistry', 
      title: 'الكيمياء العضوية وبناء الجزيئات الهيدروكربونية', 
      description: 'بناء الألكانات والألكينات والألكاينات، استكشاف المجموعات الوظيفية كالكحول والإستر، وتفاعلات الإضافة', 
      icon: <Hexagon className="w-6 h-6" />, 
      color: 'from-green-500 to-emerald-500', 
      route: '/simulation/organic-chemistry', 
      features: ['بناء الجزيئات ثلاثية الأبعاد', 'المجموعات الوظيفية والتسمية IUPAC', 'تفاعلات الإضافة والاستبدال'], 
      category: 'chemistry',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'الكيمياء العضوية والتصاوغ',
      badge: 'جزيئات عضوية'
    },
    { 
      id: 'states-of-matter', 
      title: 'حالات المادة ومخطط الطور والتحولات', 
      description: 'محاكاة حركة الجسيمات في الحالات الصلبة والسائلة والغازية، درجة الغليان والانصهار، والنقطة الثلاثية', 
      icon: <Snowflake className="w-6 h-6" />, 
      color: 'from-cyan-500 to-blue-500', 
      route: '/simulation/states-of-matter', 
      features: ['الحركة الجزيئية وقوى التجاذب', 'مخطط الطور Phase Diagram', 'النقطة الحرجة والنقطة الثلاثية'], 
      category: 'chemistry',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'النظرية الحركية الجزيئية',
      badge: 'مادة وطاقة'
    },
    { 
      id: 'acids-bases', 
      title: 'الأحماض والقواعد ومقياس pH والمحاليل المنظمة', 
      description: 'استكشاف قوة الأحماض والقواعد، ثابت التأين Ka و Kb، عمل المحلول المنظم، والتميؤ في الأملاح', 
      icon: <FlaskRound className="w-6 h-6" />, 
      color: 'from-yellow-500 to-red-500', 
      route: '/simulation/acids-bases', 
      features: ['مقياس الرقم الهيدروجيني pH و pOH', 'الأحماض والقواعد القوية والضعيفة', 'آلية عمل المحاليل المنظمة Buffer'], 
      category: 'chemistry',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الاتزان الأيوني في المحاليل المائية',
      badge: 'حموض وقواعد'
    },
    { 
      id: 'nuclear-applications', 
      title: 'الكيمياء النووية التطبيقية والتأريخ بالكربون-14', 
      description: 'تطبيقات النظائر المشعة في الطب النووي والتشخيص، محطات الطاقة النووية، والتأريخ الإشعاعي للآثار', 
      icon: <Radiation className="w-6 h-6" />, 
      color: 'from-lime-500 to-green-600', 
      route: '/simulation/nuclear-applications', 
      features: ['التأريخ بالكربون المشع C-14', 'النظائر الطبية مثل التكنيشيوم-99', 'مكونات المفاعل النووي وقضبان التحكم'], 
      category: 'chemistry',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'تطبيقات الإشعاع والنظائر المشعة',
      badge: 'طب ونظائر'
    },
    { 
      id: 'living-cell', 
      title: 'الخلية الحية والعضيات والغشاء البلازمي', 
      description: 'مقارنة تركيب الخلية النباتية والحيوانية والبكتيرية، وظائف الميتوكندريا والبلاستيدات والشبكة الإندوبلازمية', 
      icon: <Microscope className="w-6 h-6" />, 
      color: 'from-emerald-500 to-teal-500', 
      route: '/simulation/living-cell', 
      features: ['تشريح ثلاثي الأبعاد للعضيات', 'مقارنة الخلية النباتية والحيوانية', 'الغشاء الخلوي والفسيفساء السائل'], 
      category: 'biology',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'الخلية كوحدة أساسية للحياة',
      badge: 'خلية حية'
    },
    { 
      id: 'cell-division', 
      title: 'الانقسام الخلوي المتساوي والمنصف', 
      description: 'تتبع مراحل الانقسام المتساوي لنمو الخلايا والانقسام المنصف لتكوين الجاميتات وظاهرة العبور الجيني', 
      icon: <Scissors className="w-6 h-6" />, 
      color: 'from-violet-500 to-fuchsia-500', 
      route: '/simulation/cell-division', 
      features: ['مراحل الانقسام المتساوي الأربعة', 'الانقسام المنصف واختزال الكروموسومات', 'ظاهرة العبور الوراثي والتنوع الجيني'], 
      category: 'biology',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'دورة الخلية ومضاعفة الكروموسومات',
      badge: 'انقسام خلوي'
    },
    { 
      id: 'photosynthesis-respiration', 
      title: 'التمثيل الضوئي والتنفس الخلوي', 
      description: 'محاكاة التفاعلات الضوئية ودورة كالفن في البلاستيدات، وتحلل الجلوكوز ودورة كريبس وتكوين جزيئات ATP', 
      icon: <Leaf className="w-6 h-6" />, 
      color: 'from-green-500 to-lime-500', 
      route: '/simulation/photosynthesis-respiration', 
      features: ['تفاعلات البناء الضوئي ودورة كالفن', 'التنفس الخلوي وسلسلة نقل الإلكترون', 'معادلة إنتاج الطاقة الحيوية ATP'], 
      category: 'biology',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'التحولات الطاقية الحيوية',
      badge: 'طاقة حيوية'
    },
    { 
      id: 'immune-system', 
      title: 'الجهاز المناعي والأجسام المضادة واللقاحات', 
      description: 'آلية الاستجابة المناعية الفطرية والمتخصصة، دور الخلايا البائية والتائية، تكوين الأجسام المضادة والذاكرة', 
      icon: <Shield className="w-6 h-6" />, 
      color: 'from-blue-500 to-indigo-500', 
      route: '/simulation/immune-system', 
      features: ['الخلايا البائية والتائية التائية المساعدة', 'إنتاج الأجسام المضادة المتخصصة', 'آلية عمل اللقاحات وتكوين المناعة'], 
      category: 'biology',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'المناعة المتخصصة والذاكرة المناعية',
      badge: 'مناعة حيوية'
    },
    { 
      id: 'evolution', 
      title: 'التطور والتكيف الوراثي والانتخاب الطبيعي', 
      description: 'محاكاة تغير تردد الأليلات في المجتمعات الحيوية بتأثير الانتخاب الطبيعي والطفرات والانعزال الجغرافي', 
      icon: <Bug className="w-6 h-6" />, 
      color: 'from-amber-500 to-orange-500', 
      route: '/simulation/evolution', 
      features: ['محاكاة الأجيال المتعاقبة والتكيف', 'تأثير الطفرات والضغوط البيئية', 'معادلة هاردي-واينبرغ للاتزان الجيني'], 
      category: 'biology',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الانتخاب الطبيعي والجينات السكانية',
      badge: 'تكيف وانتخاب'
    },
    { 
      id: 'spatial-geometry', 
      title: 'الهندسة الفراغية والمجسمات ثلاثية الأبعاد', 
      description: 'استكشاف الأهرامات والمخاريط والأسطوانات والكرات، حساب المساحات الجانبية والكلية والحجوم الفراغية', 
      icon: <Shapes className="w-6 h-6" />, 
      color: 'from-indigo-500 to-purple-600', 
      route: '/simulation/spatial-geometry', 
      features: ['تدوير وتشريح المجسمات 3D', 'حساب الحجوم والمساحات رياضياً', 'المقاطع المستوية للمجسمات الفضائية'], 
      category: 'math',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الهندسة الفضائية وقوانين الحجوم',
      badge: 'هندسة فراغية'
    },
    { 
      id: 'probability', 
      title: 'نظرية الاحتمالات والتوزيع الطبيعي', 
      description: 'محاكاة رمي النرد والقطع النقدية، قانون الأعداد الكبيرة، التوزيع الطبيعي المعياري، وحساب الاحتمال المشروط', 
      icon: <Dice1 className="w-6 h-6" />, 
      color: 'from-green-500 to-cyan-500', 
      route: '/simulation/probability', 
      features: ['تجربة رمي النرد لآلاف المرات', 'منحنى التوزيع الطبيعي وتطبيقاته', 'قانون الأعداد الكبيرة والاحتمال التجريبي'], 
      category: 'math',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '10 دقائق',
      concept: 'الإحصاء والاحتمالات التوافقية',
      badge: 'إحصاء واحتمال'
    },
    { 
      id: 'robotics', 
      title: 'الروبوتات وبرمجة الحركة والتحكم الآلي', 
      description: 'برمجة ذراع روبوتية وعربة ذاتية القيادة لتفادي العوائق وتتبع المسارات بالخوارزميات والحساسات الذكية', 
      icon: <Bot className="w-6 h-6" />, 
      color: 'from-cyan-500 to-blue-500', 
      route: '/simulation/robotics', 
      features: ['حساسات المسافة والأشعة تحت الحمراء', 'برمجة مسار الحركة بالبلوكات', 'التحكم التناسبي التكاملي PID'], 
      category: 'engineering',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'الميكاترونكس وأنظمة التحكم الآلي',
      badge: 'روبوتات وذكاء'
    },
    { 
      id: 'mechanical-engineering', 
      title: 'الهندسة الميكانيكية والآلات البسيطة والتروس', 
      description: 'محاكاة الروافع بأنواعها الثلاثة، أنظمة البكرات المركبة، نسب التروس وعزم الدوران، والفائدة الميكانيكية', 
      icon: <Wrench className="w-6 h-6" />, 
      color: 'from-amber-500 to-orange-600', 
      route: '/simulation/mechanical-engineering', 
      features: ['الروافع وحساب الفائدة الآلية MA', 'أنظمة البكرات وتخفيض القوة المبذولة', 'عزم الدوران ونسب التروس المسننة'], 
      category: 'engineering',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'الآلات البسيطة وكفاءة الشغل',
      badge: 'ميكانيكا وآلات'
    },
    { 
      id: 'photoelectric-effect', 
      title: 'الظاهرة الكهروضوئية وثابت بلانك', 
      description: 'تحرير الإلكترونات بالضوء، قياس جهد الإيقاف، إثبات الطبيعة الجسيمية للفوتونات، واستنتاج ثابت بلانك h', 
      icon: <Sun className="w-6 h-6" />, 
      color: 'from-amber-500 to-indigo-600', 
      route: '/simulation/photoelectric-effect', 
      features: ['تغيير نوع المهبط ومعدل التردد', 'منحنى التيار وفرق الجهد I-V', 'حساب ثابت بلانك ودالة الشغل Φ'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'معادلة أينشتاين الكهروضوئية',
      badge: 'جائزة نوبل'
    },
    { 
      id: 'millikan-oil-drop', 
      title: 'تجربة قطرة الزيت لميليكان وشحنة الإلكترون', 
      description: 'موازنة قطرات الزيت المشحونة بين لوحين مكثف بالمجال الكهربائي واكتشاف تكميم الشحنة الكهربائية', 
      icon: <Droplets className="w-6 h-6" />, 
      color: 'from-amber-600 to-orange-600', 
      route: '/simulation/millikan-oil-drop', 
      features: ['مجهر بصري افتراضي دقيق', 'موازنة قوة الجاذبية والقوة الكهربائية', 'استنتاج شحنة الإلكترون الأولية e'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'تكميم الشحنة الكهربائية q=ne',
      badge: 'تجربة تاريخية'
    },
    { 
      id: 'black-hole-relativity', 
      title: 'الثقوب السوداء وتمدد الزمن الثقالي', 
      description: 'استكشاف أفق الحدث وقرص التراكم وتبلد الزمن قرب الأجرام فائقة الكتلة وساعات المسبار النسبية', 
      icon: <Globe className="w-6 h-6" />, 
      color: 'from-purple-600 to-pink-600', 
      route: '/simulation/black-hole-relativity', 
      features: ['نصف قطر شفارتزشيلد Rg', 'ساعات نسبية للمراقب والمسبار', 'انحناء نسيج الزمكان الفضائي'], 
      category: 'earth-space',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'النسبية العامة وتمدد الزمن الثقالي',
      badge: 'ثقوب سوداء'
    },
    { 
      id: 'rutherford-scattering', 
      title: 'تشتت رذرفورد واكتشاف النواة الذرية', 
      description: 'إطلاق جسيمات ألفا نحو رقاقة الذهب وكشف ارتداد الجسيمات وإثبات وجود النواة الموجبة الكثيفة', 
      icon: <Target className="w-6 h-6" />, 
      color: 'from-yellow-500 to-red-600', 
      route: '/simulation/rutherford-scattering', 
      features: ['مقارنة نموذج طومسون ورذرفورد', 'مدرج إحصائي لزوايا التشتت', 'الارتداد النادر للشحنات المركزية'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'النموذج النووي وتشتت كولوم',
      badge: 'نواة الذرة'
    },
    { 
      id: 'chemical-equilibrium', 
      title: 'الاتزان الكيميائي ومبدأ لوشاتيليه', 
      description: 'محاكاة ديناميكية لاستجابة التفاعلات المتزنة للتغير في درجات الحرارة والضغط والتركيز وحساب ثابت الاتزان Kc', 
      icon: <Beaker className="w-6 h-6" />, 
      color: 'from-emerald-500 to-teal-600', 
      route: '/simulation/chemical-equilibrium', 
      features: ['تفاعل هابر-بوش لتصنيع الأمونيا', 'استجابة النظام لمبدأ لوشاتيليه', 'منحنيات التراكيز الحية زمنياً'], 
      category: 'chemistry',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'ثابت الاتزان ومبدأ لوشاتيليه',
      badge: 'اتزان كيميائي'
    },
    { 
      id: 'crispr-gene-editing', 
      title: 'مختبر كريسبر وتعديل الجينات (CRISPR-Cas9)', 
      description: 'المقص الجيني Cas9 لتصميم مرشد gRNA واستهداف التسلسل المسبب للمرض وإصلاح الطفرات الوراثية', 
      icon: <Scissors className="w-6 h-6" />, 
      color: 'from-pink-500 to-rose-600', 
      route: '/simulation/crispr-gene-editing', 
      features: ['تصميم شريط المرشد gRNA', 'قص واستبدال الجين المعطوب', 'ترحيل كهربائي للتحقق من النتائج'], 
      category: 'biology',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'الهندسة الوراثية الحديثة وتعديل الجينوم',
      badge: 'تقنية حيوية'
    },
    { 
      id: 'xray-diffraction', 
      title: 'حيود الأشعة السينية وقانون براغ (XRD)', 
      description: 'تداخل الأشعة السينية على المستويات الذرية للبلورات وقياس المسافات البينية وقانون براغ 2d sinθ = nλ', 
      icon: <Layers className="w-6 h-6" />, 
      color: 'from-cyan-500 to-blue-600', 
      route: '/simulation/xray-diffraction', 
      features: ['تطبيق قانون براغ البلوري', 'مخطط الحيود XRD وتحديد الزوايا', 'بلورات كلوريد الصوديوم والسيليكون'], 
      category: 'chemistry',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'البنية البلورية وقانون براغ',
      badge: 'أشعة سينية'
    },
    { 
      id: 'aerodynamics-wind-tunnel', 
      title: 'نفق الرياح وقوى الرفع والديناميكا الهوائية', 
      description: 'محاكاة انسياب الهواء وقوى الرفع والسحب ومبدأ برنولي على أجنحة الطائرات وزاوية الهجوم والانهيار', 
      icon: <Wind className="w-6 h-6" />, 
      color: 'from-sky-500 to-indigo-600', 
      route: '/simulation/aerodynamics-wind-tunnel', 
      features: ['خطوط دخان انسيابية تفاعلية', 'تغيير زاوية الهجوم وسرعة الرياح', 'منحنى قوى الرفع ومبدأ برنولي'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'قوى الرفع وتدفق الموائع الهوائية',
      badge: 'طيران وديناميكا'
    },
    { 
      id: 'superconductivity', 
      title: 'الموصلية الفائقة وتأثير مايسنر والطفو الكمي', 
      description: 'انعدام المقاومة الكهربائية تماماً عند درجات الحرارة المنخفضة، طرد المجال المغناطيسي، والطفو الكمي الثابت', 
      icon: <Magnet className="w-6 h-6" />, 
      color: 'from-cyan-500 to-blue-700', 
      route: '/simulation/superconductivity', 
      features: ['تبريد النيتروجين السائل 77K', 'طرد المجال المغناطيسي B=0', 'ظاهرة الطفو الكمي المستقر'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '25 دقيقة',
      concept: 'الموصلية الفائقة وأزواج كوبر',
      badge: 'طفو كمي'
    },
    { 
      id: 'orbital-mechanics', 
      title: 'ميكانيكا المدارات الفضائية ومناورة هوهمان', 
      description: 'تخطيط مناورات الدفع الصاروخي، الانتقال المداري الإهليلجي بين الكواكب، ومعادلة فيس-فيفا للطاقة المدارية', 
      icon: <Rocket className="w-6 h-6" />, 
      color: 'from-sky-500 to-amber-500', 
      route: '/simulation/orbital-mechanics', 
      features: ['مناورة هوهمان لانتقال المدارات', 'حساب سرعة الإفلات ومعادلة فيس-فيفا', 'المدارات من LEO إلى المدار الجغرافي'], 
      category: 'earth-space',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'الميكانيكا السماوية والمدارات',
      badge: 'مدارات فضائية'
    },
    { 
      id: 'quantum-wave-interference', 
      title: 'تداخل الموجات الكمية وازدواجية المادة', 
      description: 'إثبات الطبيعة الموجية للجسيمات (إلكترونات، فوتونات، نيوترونات)، موجات دي برولي، وانهيار الدالة بالرصد', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-cyan-500 to-indigo-600', 
      route: '/simulation/quantum-wave-interference', 
      features: ['موجات دي برولي λ = h/p', 'طلقات الجسيمات المفردة ونمط التداخل', 'تأثير كاشف المسار على انهيار الدالة'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'ازدواجية الموجة والجسيم لموجات دي برولي',
      badge: 'ازدواجية المادة'
    },
    { 
      id: 'energy-skate-park', 
      title: 'حديقة التزلج وقانون حفظ الطاقة الميكانيكية', 
      description: 'دراسة تحولات طاقة الحركة وطاقة الوضع، تأثير الاحتكاك ومقاومة المسار، والجاذبية في بيئات فضائية مختلفة', 
      icon: <Activity className="w-6 h-6" />, 
      color: 'from-emerald-500 to-teal-600', 
      route: '/simulation/energy-skate-park', 
      features: ['حفظ الطاقة الميكانيكية E = Ek + Ep', 'مقارنة جاذبية الأرض والقمر والمشتري', 'مخططات الأعمدة الحية للطاقة'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'حفظ الطاقة الميكانيكية وتحولاتها',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'circuit-construction-kit-dc', 
      title: 'بناء وتوصيل الدوائر الكهربائية (DC)', 
      description: 'مختبر بناء وتوصيل الدوائر الإلكترونية، قوانين كيرشوف، قانون أوم، وقياس الجهد والتيار وقصر الدارة', 
      icon: <Cpu className="w-6 h-6" />, 
      color: 'from-amber-500 to-orange-600', 
      route: '/simulation/circuit-construction-kit-dc', 
      features: ['قانون أوم وتوصيل التوالي والتوازي', 'أجهزة أميتر وفولتميتر حقيقية', 'قوانين كيرشوف للجهود والتيارات'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متوسط',
      duration: '20 دقيقة',
      concept: 'الدوائر الكهربائية وقوانين كيرشوف',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'membrane-transport', 
      title: 'النقل عبر الغشاء الخلوي والانتشار ومضخة الصوديوم', 
      description: 'آليات العبور الحيوي: الانتشار البسيط والميسر، النقل النشط ومضخة Na⁺/K⁺ بمصدر ATP، وقنوات الأيونات', 
      icon: <Droplets className="w-6 h-6" />, 
      color: 'from-sky-500 to-purple-600', 
      route: '/simulation/membrane-transport', 
      features: ['الانتشار البسيط والميسر بالقنوات', 'مضخة الصوديوم والبوتاسيوم ومصدر ATP', 'قنوات الأيونات المبوبة بالجهد والربائط'], 
      category: 'biology',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'النقل النشط والانتشار الخلوي',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'models-of-the-hydrogen-atom', 
      title: 'نماذج ذرة الهيدروجين من بور إلى شرودنغر', 
      description: 'التطور التاريخي للنماذج الذرية من دالتون ورذرفورد إلى نموذج بور المكمم والميكانيكا الموجية لشرودنغر', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-violet-500 to-fuchsia-600', 
      route: '/simulation/models-of-the-hydrogen-atom', 
      features: ['تكميم مستويات الطاقة الذرية En', 'أطياف الانبعاث والامتصاص الخطية', 'المدارات الاحتمالية ثلاثية الأبعاد'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'نموذج بور ومستويات طاقة الهيدروجين',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'build-a-nucleus', 
      title: 'بناء النواة الذرية والاستقرار النووي', 
      description: 'استكشاف القوة النووية القوية وتوازن البروتونات والنيوترونات وأنماط الاضمحلال الإشعاعي وحزام الاستقرار', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-orange-600 to-rose-600', 
      route: '/simulation/build-a-nucleus', 
      features: ['القوة النووية الشديدة وحزام الاستقرار', 'أنماط اضمحلال ألفا وبيتا وبوزيترون', 'مخطط النويدات الذرية وعمر النصف'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الاستقرار النووي وقوى التماسك',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'bending-light', 
      title: 'انكسار الضوء وقانون سنيل والانعكاس الكلي', 
      description: 'محاكاة انكسار وانعكاس الضوء عبر أوساط مختلفة وحساب الزاوية الحرجة وتشتت الضوء في المناشير', 
      icon: <Eye className="w-6 h-6" />, 
      color: 'from-amber-500 to-cyan-600', 
      route: '/simulation/bending-light', 
      features: ['قانون سنيل n₁·sinθ₁ = n₂·sinθ₂', 'الانعكاس الكلي الداخلي والزاوية الحرجة', 'تشتت الضوء في المناشير الزجاجية'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'انكسار الضوء والألياف الضوئية',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'faradays-electromagnetic-lab', 
      title: 'مختبر فاراداي للحث الكهرومغناطيسي', 
      description: 'استكشاف قانون فاراداي وقانون لينز والمولدات الكهرومغناطيسية والمحولات الكهربائية وخطوط التدفق', 
      icon: <Magnet className="w-6 h-6" />, 
      color: 'from-blue-600 to-indigo-600', 
      route: '/simulation/faradays-electromagnetic-lab', 
      features: ['قانون فاراداي وقوة الدفع الحثية', 'المغناطيس الكهربائي والمحول', 'المولد الكهرومغناطيسي بتدفق الماء'], 
      category: 'physics',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'الحث الكهرومغناطيسي وقانون لينز',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'geometric-optics-basics', 
      title: 'أساسيات البصريات الهندسية وتكوين الأخيلة', 
      description: 'تكوين الأخيلة في العدسات المحدبة والمقعرة والمرايا وتحديد البعد البؤري وصفات الصورة وقوة التكبير', 
      icon: <Aperture className="w-6 h-6" />, 
      color: 'from-cyan-500 to-emerald-600', 
      route: '/simulation/geometric-optics-basics', 
      features: ['معادلة العدسات 1/f = 1/do + 1/di', 'تتبع المسارات الشعاعية الحقيقية', 'صفات الخيال الحقيقي والوهمي'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'تكوين الصور في العدسات والمرايا',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'pendulum-lab', 
      title: 'مختبر البندول البسيط والتوافقي', 
      description: 'الحركة التوافقية البسيطة، قياس الزمن الدوري، تحولات الطاقة، وتأثير الجاذبية الأرضية واحتكاك الهواء', 
      icon: <Clock className="w-6 h-6" />, 
      color: 'from-teal-600 to-blue-600', 
      route: '/simulation/pendulum-lab', 
      features: ['الزمن الدوري T = 2π√(L/g)', 'تحول الطاقة الحركية وطاقة الوضع', 'مقارنة جاذبية الأرض والقمر والمشتري'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'الحركة التوافقية البسيطة والزمن الدوري',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'wave-interference', 
      title: 'تداخل الموجات العامة (ماء، صوت، ضوء)', 
      description: 'التداخل البنّاء والهدام، ظاهرة الحيود عبر الشقوق، وتراكب الموجات ثنائية الأبعاد في مختلف الأوساط', 
      icon: <Waves className="w-6 h-6" />, 
      color: 'from-sky-500 to-blue-600', 
      route: '/simulation/wave-interference', 
      features: ['الموجات المائية والصوتية والضوئية', 'التداخل البنّاء والهدام والحيود', 'مقياس الشدة وتوليد الأهداب الموجية'], 
      category: 'physics',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'تراكب وتداخل الموجات في الأوساط',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'natural-selection', 
      title: 'الانتخاب الطبيعي والتكيف الوراثي', 
      description: 'محاكاة أجيال الأرانب والضغوط البيئية، الطفرات الوراثية للفراء والأسنان، وتأثير المفترسات وتوافر الغذاء', 
      icon: <Bug className="w-6 h-6" />, 
      color: 'from-emerald-600 to-amber-600', 
      route: '/simulation/natural-selection', 
      features: ['طفرات وراثية سائدة ومتنحية', 'الضغط البيئي من المفترسات والغذاء', 'تتبع تردد الأليلات عبر الأجيال'], 
      category: 'biology',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'التكيف الوراثي والانتخاب الطبيعي',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'my-solar-system', 
      title: 'نظامي الشمسي وقوانين الجاذبية الكونية', 
      description: 'محاكاة مدارات الأجرام السماوية وقانون الجذب العام لنيوتن وقوانين كبلر واصطدامات الأجرام في الفضاء', 
      icon: <Globe className="w-6 h-6" />, 
      color: 'from-violet-600 to-indigo-600', 
      route: '/simulation/my-solar-system', 
      features: ['قانون الجذب العام F = G·m₁m₂/r²', 'قوانين كبلر الثلاثة للمدارات', 'مسارات مدارية إهليلجية ومستقرة'], 
      category: 'earth-space',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'قانون الجذب العام والمدارات الفضائية',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'ph-scale', 
      title: 'مقياس الرقم الهيدروجيني (pH) وتوازن المحاليل', 
      description: 'قياس حمضية وقاعدية المحاليل اليومية والكيميائية، التخفيف بالماء، وتحديد تراكيز أيونات [H₃O⁺] و [OH⁻]', 
      icon: <Beaker className="w-6 h-6" />, 
      color: 'from-emerald-600 to-cyan-600', 
      route: '/simulation/ph-scale', 
      features: ['مقياس pH اللوغاريتمي pH = -log[H₃O⁺]', 'فحص محاليل الحياة اليومية (الدم، القهوة، الصابون)', 'محاكاة التخفيف وإضافة الماء النقي'], 
      category: 'chemistry',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'الحمضية والقاعدية ومقياس pH',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'neuron', 
      title: 'العصبون الحيوي ونقل السيال العصبي', 
      description: 'محاكاة انطلاق جهد الفعل العصبي، قنوات الصوديوم والبوتاسيوم المبوبة كهربائياً، واستقطاب غشاء المحور', 
      icon: <Activity className="w-6 h-6" />, 
      color: 'from-purple-600 to-rose-600', 
      route: '/simulation/neuron', 
      features: ['جهد الفعل العصبي (Action Potential)', 'قنوات Na⁺ و K⁺ المبوبة بفرق الجهد', 'مخطط زمني لجهد الغشاء (mV)'], 
      category: 'biology',
      grade: 'التوجيهي (12)',
      gradeId: 'grade-12',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'السيال العصبي وإزالة الاستقطاب',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'quadrilateral', 
      title: 'الأشكال الرباعية وخواص الهندسة الرياضية', 
      description: 'استكشاف متوازي الأضلاع، المعين، المستطيل، المربع، وشبه المنحرف، وخصائص الأضلاع والزوايا والأقطار', 
      icon: <Shapes className="w-6 h-6" />, 
      color: 'from-indigo-600 to-pink-600', 
      route: '/simulation/quadrilateral', 
      features: ['مجموع زوايا الشكل الرباعي 360°', 'خصائص الأقطار وتعامدها وتنصيفها', 'تحويلات تفاعلية للأشكال الرباعية'], 
      category: 'math',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'خواص الأشكال الرباعية والمساحات',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'hookes-law', 
      title: 'قانون هوك ومرونة الزنبرك', 
      description: 'دراسة القوة المرنة واستطالة النوابض وثابت المرونة (k) وتوصيل النوابض على التوالي والتوازي', 
      icon: <Zap className="w-6 h-6" />, 
      color: 'from-cyan-600 to-blue-600', 
      route: '/simulation/hookes-law', 
      features: ['قانون هوك F = -k·Δx', 'طاقة الوضع المرنة Ep = ½ k x²', 'نوابض متصلة على التوالي والتوازي'], 
      category: 'physics',
      grade: 'الصف العاشر',
      gradeId: 'grade-10',
      difficulty: 'سهل',
      duration: '15 دقيقة',
      concept: 'القوة المرنة وثابت الزنبرك k',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'quantum-measurement', 
      title: 'القياس الكمي وتجربة شتيرن-غيرلاخ', 
      description: 'استكشاف مبدأ عدم اليقين والتراكب الخطي، قياس اللف المغزلي للجسيمات (Spin)، وتأثير الرصد على الحالات الكمية', 
      icon: <Atom className="w-6 h-6" />, 
      color: 'from-purple-600 to-cyan-600', 
      route: '/simulation/quantum-measurement', 
      features: ['تجربة شتيرن-غيرلاخ وقياس Spin', 'التراكب الكمي وانهيار الحالات', 'مبدأ عدم اليقين لهايزنبرغ'], 
      category: 'physics',
      grade: 'جامعي ومتقدم',
      gradeId: 'university',
      difficulty: 'متقدم',
      duration: '20 دقيقة',
      concept: 'القياس في ميكانيكا الكم واللف المغزلي',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'balloons-and-static-electricity', 
      title: 'البالونات والكهرباء الساكنة والتأثير الكهروستاتيكي', 
      description: 'دلك البالونات بالصوف، انتقال الشحنات السالبة، الاستقطاب الكهربائي في الجدران، وقوى التجاذب والتنافر', 
      icon: <Sparkles className="w-6 h-6" />, 
      color: 'from-amber-500 to-rose-600', 
      route: '/simulation/balloons-and-static-electricity', 
      features: ['الشحن بالدلك وانتقال الإلكترونات', 'الاستقطاب الحثي في الجدار العازل', 'قوى التجاذب والتنافر الكولومية'], 
      category: 'physics',
      grade: 'الأساسي (7-9)',
      gradeId: 'basic',
      difficulty: 'سهل',
      duration: '10 دقائق',
      concept: 'انتقال الشحنات والاستقطاب الكهربائي',
      badge: 'ذروة العلم المطورة'
    },
    { 
      id: 'projectile-sampling-distributions', 
      title: 'المقذوفات وتوزيعات المعاينة الإحصائية', 
      description: 'دمج الفيزياء الإحصائية بمبرهنة النهاية المركزية، التوزيع الطبيعي لمدى المقذوفات، وفترات الثقة والخطأ المعياري', 
      icon: <Target className="w-6 h-6" />, 
      color: 'from-emerald-600 to-indigo-600', 
      route: '/simulation/projectile-sampling-distributions', 
      features: ['مبرهنة النهاية المركزية (CLT)', 'حساب الخطأ المعياري والانحراف المعياري', 'توزيع العينات وتكون منحنى غاوس'], 
      category: 'math',
      grade: 'الأول ثانوي (11)',
      gradeId: 'grade-11',
      difficulty: 'متوسط',
      duration: '15 دقيقة',
      concept: 'الاحتمالات ومبرهنة النهاية المركزية',
      badge: 'ذروة العلم المطورة'
    },
  ];

  // Filtering & Sorting
  const filteredSimulations = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = simulations.filter(s => {
      const catMatch = activeCategory === 'all' || s.category === activeCategory;
      const gradeMatch = activeGrade === 'all' || s.gradeId === activeGrade;
      const searchMatch = !q || 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.concept.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q);
      return catMatch && gradeMatch && searchMatch;
    });

    // Sorting
    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'grade-asc': {
        const order: Record<GradeLevel, number> = {
          'all': 0,
          'basic': 1,
          'grade-10': 2,
          'grade-11': 3,
          'grade-12': 4,
          'university': 5,
        };
        result.sort((a, b) => order[a.gradeId] - order[b.gradeId]);
        break;
      }
      case 'difficulty-asc': {
        const diffOrder: Record<Difficulty, number> = {
          'سهل': 1,
          'متوسط': 2,
          'متقدم': 3,
        };
        result.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        break;
      }
      case 'featured':
      default:
        // Keep default curated ordering
        break;
    }

    return result;
  }, [simulations, activeCategory, activeGrade, search, sortBy]);

  // Grouped by grade
  const groupedByGrade = useMemo(() => {
    const groups: { gradeInfo: typeof GRADE_LEVELS[0]; items: Simulation[] }[] = [];
    GRADE_LEVELS.filter(g => g.id !== 'all').forEach(gradeInfo => {
      const items = filteredSimulations.filter(s => s.gradeId === gradeInfo.id);
      if (items.length > 0) {
        groups.push({ gradeInfo, items });
      }
    });
    return groups;
  }, [filteredSimulations]);

  // Counts for Badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: simulations.length };
    simulations.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, [simulations]);

  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: simulations.length };
    simulations.forEach(s => { counts[s.gradeId] = (counts[s.gradeId] || 0) + 1; });
    return counts;
  }, [simulations]);

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'سهل':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            مبتدئ
          </span>
        );
      case 'متوسط':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            متوسط
          </span>
        );
      case 'متقدم':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            متقدم
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300 font-sans" dir="rtl">
      {/* StarField for dark mode ambiance */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block opacity-40">
        <StarField starCount={120} />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      <main className="flex-1 relative z-10 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3.5 max-w-4xl mx-auto pt-2"
          >
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 shadow-sm transition-all"
              >
                <ArrowRight size={13} className="rtl:rotate-0 rotate-180" />
                <span>الرئيسية</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                <Sparkle size={13} />
                <span>مختبر ذروة العلم التفاعلي المعرب</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              موسوعة التجارب العلمية والمحاكاة ثلاثية الأبعاد
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              منظومة تضم <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-base">{simulations.length}</span> مختبراً رقمياً متكاملاً، مصنفة ومنظمة بدقة وفق المناهج التعليمية والصفوف الدراسية مع إمكانية القياس والتفاعل المباشر.
            </p>
          </motion.div>

          {/* Unified Control Toolbar (Corner Grade Filter + Search + Sort + View Mode) */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Top Toolbar Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن تجربة، قانون، صف دراسي أو مفهوم (مثل: سنيل، هوك، توجيهي، كريسبر)..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Action Buttons: Corner Grade Division + Sort + View Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 🎓 Corner Grade Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsGradeDropdownOpen(!isGradeDropdownOpen);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm ${
                      activeGrade !== 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>تقسيم حسب الصف:</span>
                    <span className="underline decoration-dotted underline-offset-2">
                      {GRADE_LEVELS.find(g => g.id === activeGrade)?.shortLabel}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isGradeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isGradeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute left-0 sm:right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1"
                      >
                        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span>اختر الصف الدراسي المطلوب:</span>
                          <span className="font-mono text-blue-500">{GRADE_LEVELS.length - 1} مراحل</span>
                        </div>
                        {GRADE_LEVELS.map(g => (
                          <button
                            key={g.id}
                            onClick={() => {
                              setActiveGrade(g.id);
                              setIsGradeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-colors text-xs font-semibold ${
                              activeGrade === g.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{g.icon}</span>
                              <div className="text-right">
                                <span className="block leading-tight">{g.label}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{g.desc}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {gradeCounts[g.id] || 0}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sort Option Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsSortDropdownOpen(!isSortDropdownOpen);
                      setIsGradeDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-all"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">الترتيب:</span>
                    <span className="max-w-[120px] truncate">{SORT_OPTIONS.find(s => s.id === sortBy)?.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isSortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1"
                      >
                        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          ترتيب التجارب وفق:
                        </div>
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortBy(opt.id);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
                              sortBy === opt.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Mode Toggle: Grid vs Grouped */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="عرض شبكي متصل"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">شبكة موحدة</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`p-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'grouped'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="تجميع منظم حسب الصفوف"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden md:inline">تقسيم بالصفوف</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Subject Categories Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">التخصص:</span>
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as Category | 'all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-mono ${
                      active ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {categoryCounts[cat.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Filters Pill Bar (if any filter active) */}
            {(activeGrade !== 'all' || activeCategory !== 'all' || search) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">عوامل التصفية النشطة:</span>
                
                {activeGrade !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                    <span>الصف: {GRADE_LEVELS.find(g => g.id === activeGrade)?.shortLabel}</span>
                    <button onClick={() => setActiveGrade('all')} className="hover:opacity-75">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                    <span>المادة: {CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
                    <button onClick={() => setActiveCategory('all')} className="hover:opacity-75">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                    <span>البحث: "{search}"</span>
                    <button onClick={() => setSearch('')} className="hover:opacity-75">
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setActiveGrade('all');
                    setActiveCategory('all');
                    setSearch('');
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold underline mr-auto"
                >
                  إعادة ضبط الكل
                </button>
              </div>
            )}
          </div>

          {/* Metric Status Bar */}
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              عرض <strong className="text-slate-900 dark:text-white font-mono">{filteredSimulations.length}</strong> من أصل {simulations.length} تجربة علمية
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                جاهزة ومحاكاة مباشرة
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                تعريب وتطوير ذروة العلم
              </span>
            </div>
          </div>

          {/* No Results Fallback */}
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                لم نجد أي تجربة مطابقة لمعايير البحث الحالية
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                جرب تغيير الصف الدراسي أو الفئة أو كلمات البحث.
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); setActiveGrade('all'); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                إظهار كافة التجارب
              </button>
            </div>
          ) : viewMode === 'grouped' ? (
            /* ================= VIEW MODE 1: GROUPED BY GRADE ================= */
            <div className="space-y-10">
              {groupedByGrade.map(({ gradeInfo, items }) => (
                <div key={gradeInfo.id} className="space-y-4">
                  {/* Grade Group Header */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                        {gradeInfo.icon}
                      </span>
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {gradeInfo.label}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {gradeInfo.desc}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {items.length} تجربة
                    </span>
                  </div>

                  {/* Experiments Grid for this Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {items.map((sim, index) => renderExperimentCard(sim, index))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ================= VIEW MODE 2: UNIFIED CONTINUOUS GRID ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredSimulations.map((sim, index) => renderExperimentCard(sim, index))}
            </div>
          )}

        </div>
      </main>

      {/* Modal for In-depth Simulation Info */}
      <AnimatePresence>
        {selectedSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedSimulation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-right font-sans max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedSimulation(null)}
                className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedSimulation.color} text-white shadow-md`}>
                    {selectedSimulation.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {selectedSimulation.grade}
                      </span>
                      {getDifficultyBadge(selectedSimulation.difficulty)}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                      {selectedSimulation.title}
                    </h3>
                  </div>
                </div>

                {/* Concept Banner */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">المفهوم الفيزيائي / العلمي الأساسي:</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedSimulation.concept}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">وصف التجربة والهدف التعليمي:</span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedSimulation.description}
                  </p>
                </div>

                {/* Features & Tools */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1.5">الأدوات والمحاور التفاعلية:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSimulation.features.map((feature, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{feature}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Duration & Category Strip */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    المدة التقديرية: {selectedSimulation.duration}
                  </span>
                  <span className="font-semibold">
                    التصنيف: {CATEGORIES.find(c => c.id === selectedSimulation.category)?.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => { playSound(); navigate(selectedSimulation.route); }}
                    className={`flex-1 py-3 bg-gradient-to-r ${selectedSimulation.color} text-white rounded-2xl text-xs font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md`}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>خوض التجربة والمحاكاة الآن</span>
                  </button>
                  <button
                    onClick={() => setSelectedSimulation(null)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );

  // Helper render for single experiment card with unified luxury aesthetic
  function renderExperimentCard(sim: Simulation, index: number) {
    return (
      <motion.div
        key={sim.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.015, 0.2) }}
        whileHover={{ y: -4 }}
        className="group h-full flex flex-col"
      >
        <div className="relative h-full rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all duration-300 overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-2xl hover:shadow-blue-500/10">
          
          {/* Top subtle gradient highlight bar */}
          <div className={`h-1.5 bg-gradient-to-r ${sim.color}`} />
          
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
            
            {/* Header: Grade & Difficulty + Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <GraduationCap className="w-3 h-3 text-amber-500" />
                  {sim.grade}
                </span>
                {getDifficultyBadge(sim.difficulty)}
              </div>

              {/* Glowing Icon Container */}
              <div className={`shrink-0 p-2 rounded-xl bg-gradient-to-br ${sim.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                {sim.icon}
              </div>
            </div>

            {/* Title & Category Line */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <span>{CATEGORIES.find(c => c.id === sim.category)?.label}</span>
                <span>•</span>
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{sim.concept}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {sim.title}
              </h3>
            </div>

            {/* Unified Description (2 lines clamp) */}
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {sim.description}
            </p>

            {/* Meta Strip: Duration + Key Feature tag */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-amber-500" />
                {sim.duration}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold truncate max-w-[130px]">
                {sim.badge || 'محاكاة تفاعلية'}
              </span>
            </div>

            {/* Features preview (Top 2) */}
            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              {sim.features.slice(0, 2).map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center gap-2 pt-2 mt-auto">
              <button
                onClick={() => { playSound(); navigate(sim.route); }}
                className={`flex-1 py-2.5 bg-gradient-to-r ${sim.color} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-sm`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>ابدأ التجربة</span>
              </button>
              <button
                onClick={() => { playSound(); setSelectedSimulation(sim); }}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs shrink-0"
                aria-label="تفاصيل المحاكاة"
                title="عرض الدليل والأهداف التعليمية"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    );
  }
};

export default ExperimentsSection;
