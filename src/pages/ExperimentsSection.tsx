import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Play, Info, Search, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, Battery, Microscope, Heart, Rocket, Eye, Layers, Mountain, Flame, Droplets, Circle, Clock, Aperture, Hexagon, Snowflake, FlaskRound, Radiation, Leaf, Scissors, Shield, Bug, Shapes, Dice1, Bot, Wrench, Wind, Magnet, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const clickSound = '/message-notification.mp3';

type Category = 'physics' | 'chemistry' | 'biology' | 'earth-space' | 'math' | 'engineering';

interface Simulation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  features: string[];
  category: Category;
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

const ExperimentsSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const simulations: Simulation[] = [
    { id: 'blackbody-radiation', title: 'إشعاع الجسم الأسود', description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي وأدوات حسابية ومساعد ذكي', icon: <Atom className="w-7 h-7" />, color: 'from-purple-600 to-blue-600', route: '/simulation/blackbody-radiation', features: ['التمثيل البياني مع الطيف المرئي', 'حاسبات الطول الموجي والتردد والطاقة', 'مساعد ذكي للفيزياء'], category: 'physics' },
    { id: 'build-atom', title: 'بناء الذرة', description: 'بناء الذرات من خلال سحب وإفلات الجسيمات الذرية واكتشاف خصائص العناصر', icon: <Zap className="w-7 h-7" />, color: 'from-orange-600 to-red-600', route: '/simulation/build-atom', features: ['سحب وإفلات البروتونات والنيوترونات', 'تحديد العنصر تلقائياً', 'واجهة ثلاثية الأبعاد'], category: 'physics' },
    { id: 'lhc-simulation', title: 'مصادم الهدرونات الكبير', description: 'محاكاة متقدمة تفاعلية لمصادم الهدرونات الكبير مع تصادمات البروتونات', icon: <Sparkles className="w-7 h-7" />, color: 'from-cyan-500 to-purple-600', route: '/lhc-simulation', features: ['تسريع الجسيمات', 'تصادمات 13 TeV', 'كشف البوزونات'], category: 'physics' },
    { id: 'electromagnetic-waves', title: 'الموجات الكهرومغناطيسية', description: 'استكشاف الطيف الكهرومغناطيسي الكامل من موجات الراديو إلى أشعة غاما', icon: <Waves className="w-7 h-7" />, color: 'from-red-500 to-purple-600', route: '/electromagnetic-waves', features: ['الطيف الكامل بالألوان الحقيقية', 'التحكم بالتردد والطول الموجي', 'تطبيقات عملية'], category: 'physics' },
    { id: 'nuclear-reactions', title: 'التفاعلات النووية', description: 'محاكاة الانشطار والاندماج النووي مع تأثيرات بصرية مذهلة', icon: <Atom className="w-7 h-7" />, color: 'from-green-500 to-blue-500', route: '/nuclear-reactions', features: ['انشطار اليورانيوم-235', 'اندماج الديوتيريوم-تريتيوم', 'مقارنة الطاقة'], category: 'physics' },
    { id: 'chemical-reactions', title: 'التفاعلات الكيميائية 3D', description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات الكيميائية', icon: <Beaker className="w-7 h-7" />, color: 'from-purple-500 to-blue-500', route: '/chemical-reactions', features: ['30+ تفاعل كيميائي', 'رسوم 3D متقدمة', 'تصور الروابط الكيميائية'], category: 'chemistry' },
    { id: 'fourier-series', title: 'سلسلة فورييه', description: 'حساب وتمثيل سلسلة فورييه مع كشف ظاهرة غيبس', icon: <Activity className="w-7 h-7" />, color: 'from-indigo-500 to-pink-600', route: '/fourier-series', features: ['دوال عادية وقطعية', '10+ أمثلة جاهزة', 'أنيميشن تطور التقريب'], category: 'math' },
    { id: '3d-function-visualizer', title: 'الدوال ثلاثية الأبعاد', description: 'عرض الدوال الرياضية في الفضاء ثلاثي الأبعاد', icon: <Box className="w-7 h-7" />, color: 'from-emerald-500 to-cyan-600', route: '/3d-function-visualizer', features: ['عرض 1D, 2D, 3D', 'تدوير تفاعلي', '15+ مثال جاهز'], category: 'math' },
    { id: 'optics-lab', title: 'مختبر البصريات', description: 'محاكاة تفاعلية للأشعة الضوئية مع العدسات والمرايا والمناشير', icon: <Sun className="w-7 h-7" />, color: 'from-yellow-500 to-red-500', route: '/simulation/optics-lab', features: ['عدسات محدبة ومقعرة', 'المرايا والمناشير', 'قوانين الانكسار'], category: 'physics' },
    { id: 'circuit-builder', title: 'بناء الدوائر الكهربائية', description: 'مختبر افتراضي متقدم لبناء الدوائر مع نظام أسلاك حقيقي', icon: <Cpu className="w-7 h-7" />, color: 'from-blue-500 to-teal-500', route: '/simulation/circuit-builder-advanced', features: ['نظام أسلاك حقيقي', '9+ مكونات', 'تحليل حي للتيار'], category: 'engineering' },
    { id: 'projectile-motion', title: 'حركة المقذوفات', description: 'مختبر ثلاثي الأبعاد للمقذوفات مع متجهات وقياسات حيّة وتحدٍّ تفاعلي', icon: <Target className="w-7 h-7" />, color: 'from-green-500 to-teal-500', route: '/simulation/projectile-motion', features: ['مشهد ثلاثي الأبعاد', 'متجهات السرعة', 'مقاومة الهواء'], category: 'physics' },
    { id: 'solar-system', title: 'النظام الشمسي 3D', description: 'محاكاة 3D كاملة مع React Three Fiber وتحكم كاميرا 360°', icon: <Globe className="w-7 h-7" />, color: 'from-indigo-500 to-pink-500', route: '/simulation/solar-system-3d', features: ['تحكم كاميرا 360°', 'شمس متوهجة', 'حلقات زحل'], category: 'earth-space' },
    { id: 'genetics-lab', title: 'مختبر الوراثة', description: 'محاكاة تفاعلية لمربع بونيت وتضاعف DNA والطفرات الجينية', icon: <Dna className="w-7 h-7" />, color: 'from-pink-500 to-red-500', route: '/simulation/genetics-lab', features: ['مربع بونيت', 'تضاعف DNA', 'الطفرات الجينية'], category: 'biology' },
    { id: 'ecosystem', title: 'النظام البيئي', description: 'نظام بيئي حي مع كائنات متحركة وتوازن السكان', icon: <TreeDeciduous className="w-7 h-7" />, color: 'from-green-600 to-lime-500', route: '/simulation/ecosystem', features: ['السلسلة الغذائية', 'التعداد السكاني', 'الكوارث الطبيعية'], category: 'biology' },
    { id: 'electromagnetism', title: 'الكهرومغناطيسية', description: 'محاكاة المجال المغناطيسي والحث الكهرومغناطيسي', icon: <Zap className="w-7 h-7" />, color: 'from-purple-600 to-cyan-500', route: '/simulation/electromagnetism', features: ['المجال حول الأسلاك', 'الملفات', 'قاعدة اليد اليمنى'], category: 'physics' },
    { id: 'waves-sound', title: 'الموجات والصوت', description: 'محاكاة الموجات الصوتية وتأثير دوبلر والتداخل', icon: <Waves className="w-7 h-7" />, color: 'from-green-600 to-blue-500', route: '/simulation/waves-sound', features: ['أنواع الموجات', 'تأثير دوبلر', 'تداخل الموجات'], category: 'physics' },
    { id: 'static-electricity', title: 'الكهرباء الساكنة', description: 'قانون كولوم والمجال الكهربائي ومولد فان دي غراف', icon: <Sparkles className="w-7 h-7" />, color: 'from-yellow-600 to-red-500', route: '/simulation/static-electricity', features: ['قانون كولوم', 'خطوط المجال', 'مولد فان دي غراف'], category: 'physics' },
    { id: 'advanced-astronomy', title: 'الفلك المتقدم', description: 'محاكاة الكسوف والخسوف وأطوار القمر والمدارات', icon: <Globe className="w-7 h-7" />, color: 'from-indigo-600 to-pink-500', route: '/simulation/advanced-astronomy', features: ['كسوف الشمس', 'خسوف القمر', 'قوانين كبلر'], category: 'earth-space' },
    { id: 'quantum-mechanics', title: 'ميكانيكا الكم', description: 'تجربة الشق المزدوج والنفق الكمي والتراكب', icon: <Atom className="w-7 h-7" />, color: 'from-pink-600 to-indigo-500', route: '/simulation/quantum-mechanics', features: ['الشق المزدوج', 'النفق الكمي', 'التراكب الكمي'], category: 'physics' },
    { id: 'analytical-chemistry', title: 'الكيمياء التحليلية', description: 'محاكاة المعايرة وقياس pH والكروماتوغرافيا', icon: <FlaskConical className="w-7 h-7" />, color: 'from-emerald-600 to-teal-500', route: '/simulation/analytical-chemistry', features: ['معايرة حمض-قاعدة', 'قياس pH', 'التحليل الطيفي'], category: 'chemistry' },
    { id: 'electrochemistry', title: 'الكيمياء الكهربائية', description: 'الخلايا الجلفانية والتحليل الكهربائي والتآكل', icon: <Battery className="w-7 h-7" />, color: 'from-amber-600 to-yellow-500', route: '/simulation/electrochemistry', features: ['الخلايا الجلفانية', 'التحليل الكهربائي', 'خلايا الوقود'], category: 'chemistry' },
    { id: 'molecular-biology', title: 'البيولوجيا الجزيئية', description: 'تضاعف DNA والنسخ والترجمة وتفاعل PCR', icon: <Microscope className="w-7 h-7" />, color: 'from-violet-600 to-fuchsia-500', route: '/simulation/molecular-biology', features: ['تضاعف DNA', 'النسخ والترجمة', 'تفاعل PCR'], category: 'biology' },
    { id: 'human-body', title: 'جسم الإنسان', description: 'استكشاف أجهزة الجسم: الدوران، التنفس، العصبي، الهضمي', icon: <Heart className="w-7 h-7" />, color: 'from-red-600 to-pink-500', route: '/simulation/human-body', features: ['الجهاز الدوري', 'الجهاز التنفسي', 'الجهاز العصبي'], category: 'biology' },
    { id: 'advanced-nuclear', title: 'الفيزياء النووية المتقدمة', description: 'الاضمحلال الإشعاعي والانشطار والاندماج وعمر النصف', icon: <Atom className="w-7 h-7" />, color: 'from-lime-600 to-emerald-500', route: '/simulation/advanced-nuclear', features: ['اضمحلال ألفا وبيتا', 'الانشطار النووي', 'عمر النصف'], category: 'physics' },
    { id: 'digital-electronics', title: 'الإلكترونيات الرقمية', description: 'بوابات المنطق والجامعات والعدادات وخلايا الذاكرة', icon: <Cpu className="w-7 h-7" />, color: 'from-slate-600 to-zinc-500', route: '/simulation/digital-electronics', features: ['بوابات AND, OR, NOT', 'الجامع النصفي', 'عداد 8-بت'], category: 'engineering' },
    { id: 'earth-sciences', title: 'علوم الأرض', description: 'محاكاة الزلازل والبراكين والصفائح التكتونية', icon: <Mountain className="w-7 h-7" />, color: 'from-amber-700 to-red-600', route: '/simulation/earth-sciences', features: ['محاكاة الزلازل', 'ثوران البراكين', 'دورة الصخور'], category: 'earth-space' },
    { id: 'rocket-science', title: 'علوم الصواريخ والفضاء ثلاثية الأبعاد', description: 'مختبر 3D: إقلاع بمسار محسوب فيزيائياً، مدارات إهليلجية حول الأرض، وهبوط مُوجَّه بحرق توقف', icon: <Rocket className="w-7 h-7" />, color: 'from-sky-600 to-indigo-500', route: '/simulation/rocket-science', features: ['مشهد ثلاثي الأبعاد', 'Δv وMax-Q', 'مدارات وهبوط مُوجَّه'], category: 'earth-space' },
    { id: 'advanced-optics', title: 'البصريات المتقدمة', description: 'تشتت المنشور والعدسات والتداخل والاستقطاب', icon: <Eye className="w-7 h-7" />, color: 'from-cyan-600 to-emerald-500', route: '/simulation/advanced-optics', features: ['تشتت الضوء', 'تداخل الشقين', 'الاستقطاب'], category: 'physics' },
    { id: 'materials-science', title: 'علوم المواد', description: 'البنية البلورية والسبائك واختبارات الإجهاد', icon: <Layers className="w-7 h-7" />, color: 'from-stone-600 to-zinc-500', route: '/simulation/materials-science', features: ['البنية البلورية', 'تكوين السبائك', 'اختبار الإجهاد'], category: 'engineering' },
    { id: 'thermodynamics', title: 'الديناميكا الحرارية ثلاثية الأبعاد', description: 'مختبر 3D: مكبس بجزيئات متحرّكة، محرك كارنو دوّار، وجدار انتقال الحرارة', icon: <Flame className="w-7 h-7" />, color: 'from-orange-600 to-red-600', route: '/simulation/thermodynamics', features: ['مشهد ثلاثي الأبعاد', 'منحنى P–V وماكسويل', 'توصيل وحمل وإشعاع'], category: 'physics' },
    { id: 'fluid-mechanics', title: 'ميكانيكا الموائع ثلاثية الأبعاد', description: 'مختبر 3D: الطفو وأرخميدس، الضغط مع العمق، وأنبوب فنتوري وبرنولي', icon: <Droplets className="w-7 h-7" />, color: 'from-blue-500 to-cyan-500', route: '/simulation/fluid-mechanics', features: ['مشهد ثلاثي الأبعاد', 'متجهات الوزن والطفو', 'فنتوري ورقم رينولدز'], category: 'physics' },
    { id: 'circular-motion', title: 'الحركة الدائرية ثلاثية الأبعاد', description: 'مختبر 3D: حركة منتظمة، بندول مخروطي، مدارات أقمار صناعية، وتجربة قطع الخيط', icon: <Circle className="w-7 h-7" />, color: 'from-violet-500 to-purple-600', route: '/simulation/circular-motion', features: ['مشهد ثلاثي الأبعاد', 'متجهات v و a_c', 'المدار الجغرافي الثابت'], category: 'physics' },
    { id: 'special-relativity', title: 'النسبية الخاصة', description: 'تمدد الزمن وتقلص الطول وتكافؤ الكتلة والطاقة E=mc²', icon: <Clock className="w-7 h-7" />, color: 'from-yellow-500 to-orange-500', route: '/simulation/special-relativity', features: ['تمدد الزمن', 'تقلص الطول', 'E = mc²'], category: 'physics' },
    { id: 'interference-diffraction', title: 'التداخل والحيود', description: 'تجربة يونج وحيود الشق الواحد وحلقات نيوتن', icon: <Aperture className="w-7 h-7" />, color: 'from-indigo-500 to-pink-500', route: '/simulation/interference-diffraction', features: ['الشق المزدوج', 'الشق الواحد', 'حلقات نيوتن'], category: 'physics' },
    { id: 'plasma-physics', title: 'فيزياء البلازما', description: 'الحالة الرابعة للمادة: التأين والحصر المغناطيسي والتطبيقات', icon: <Sparkles className="w-7 h-7" />, color: 'from-purple-500 to-pink-500', route: '/simulation/plasma-physics', features: ['تأين الغازات', 'الحصر المغناطيسي', 'تطبيقات البلازما'], category: 'physics' },
    { id: 'chemical-kinetics', title: 'حركية التفاعلات', description: 'سرعة التفاعل وطاقة التنشيط والعوامل المؤثرة', icon: <FlaskConical className="w-7 h-7" />, color: 'from-blue-500 to-cyan-500', route: '/simulation/chemical-kinetics', features: ['سرعة التفاعل', 'طاقة التنشيط', 'العوامل المساعدة'], category: 'chemistry' },
    { id: 'organic-chemistry', title: 'الكيمياء العضوية', description: 'بناء الجزيئات العضوية والمجموعات الوظيفية والتفاعلات', icon: <Hexagon className="w-7 h-7" />, color: 'from-green-500 to-emerald-500', route: '/simulation/organic-chemistry', features: ['بناء الجزيئات', 'المجموعات الوظيفية', 'التفاعلات العضوية'], category: 'chemistry' },
    { id: 'states-of-matter', title: 'حالات المادة والتحولات', description: 'صلب/سائل/غاز والتحولات ومخطط الطور', icon: <Snowflake className="w-7 h-7" />, color: 'from-cyan-500 to-blue-500', route: '/simulation/states-of-matter', features: ['حالات المادة', 'مخطط الطور', 'التحولات'], category: 'chemistry' },
    { id: 'acids-bases', title: 'الأحماض والقواعد', description: 'مقياس pH والمعايرة والمحاليل المنظمة', icon: <FlaskRound className="w-7 h-7" />, color: 'from-yellow-500 to-red-500', route: '/simulation/acids-bases', features: ['مقياس pH', 'المعايرة', 'المحاليل المنظمة'], category: 'chemistry' },
    { id: 'nuclear-applications', title: 'الكيمياء النووية التطبيقية', description: 'التأريخ بالكربون-14 والطب النووي ومحطات الطاقة', icon: <Radiation className="w-7 h-7" />, color: 'from-lime-500 to-green-600', route: '/simulation/nuclear-applications', features: ['التأريخ بالكربون-14', 'الطب النووي', 'مفاعل نووي'], category: 'chemistry' },
    { id: 'living-cell', title: 'الخلية الحية', description: 'تركيب الخلية الحيوانية والنباتية والبكتيرية', icon: <Microscope className="w-7 h-7" />, color: 'from-emerald-500 to-teal-500', route: '/simulation/living-cell', features: ['العضيات', 'مقارنة الخلايا', 'الغشاء الخلوي'], category: 'biology' },
    { id: 'cell-division', title: 'الانقسام الخلوي', description: 'الانقسام المتساوي والمنصف بالمراحل', icon: <Scissors className="w-7 h-7" />, color: 'from-violet-500 to-fuchsia-500', route: '/simulation/cell-division', features: ['الانقسام المتساوي', 'الانقسام المنصف', 'الكروموسومات'], category: 'biology' },
    { id: 'photosynthesis-respiration', title: 'التمثيل الضوئي والتنفس', description: 'البناء الضوئي والتنفس الخلوي', icon: <Leaf className="w-7 h-7" />, color: 'from-green-500 to-lime-500', route: '/simulation/photosynthesis-respiration', features: ['دورة كالفن', 'نقل الإلكترون', 'ATP'], category: 'biology' },
    { id: 'immune-system', title: 'الجهاز المناعي', description: 'المناعة الفطرية والمكتسبة واللقاحات', icon: <Shield className="w-7 h-7" />, color: 'from-blue-500 to-indigo-500', route: '/simulation/immune-system', features: ['الأجسام المضادة', 'اللقاحات', 'الذاكرة المناعية'], category: 'biology' },
    { id: 'evolution', title: 'التطور والانتخاب الطبيعي', description: 'محاكاة الانتخاب الطبيعي والتكيف', icon: <Bug className="w-7 h-7" />, color: 'from-amber-500 to-orange-500', route: '/simulation/evolution', features: ['أجيال متعاقبة', 'الطفرات', 'بقاء الأصلح'], category: 'biology' },
    { id: 'spatial-geometry', title: 'الهندسة الفراغية', description: 'أشكال ثلاثية الأبعاد وحساب المساحات والحجوم', icon: <Shapes className="w-7 h-7" />, color: 'from-indigo-500 to-purple-600', route: '/simulation/spatial-geometry', features: ['تدوير الأشكال', 'حساب الحجوم', 'المقاطع'], category: 'math' },
    { id: 'probability', title: 'نظرية الاحتمالات', description: 'رمي النرد والعملات والتوزيع الطبيعي', icon: <Dice1 className="w-7 h-7" />, color: 'from-green-500 to-cyan-500', route: '/simulation/probability', features: ['رمي النرد', 'التوزيع الطبيعي', 'الأعداد الكبيرة'], category: 'math' },
    { id: 'robotics', title: 'الروبوتات والتحكم', description: 'برمجة روبوت افتراضي لتنفيذ مهام', icon: <Bot className="w-7 h-7" />, color: 'from-cyan-500 to-blue-500', route: '/simulation/robotics', features: ['تحكم يدوي', 'برمجة أوامر', 'خوارزميات'], category: 'engineering' },
    { id: 'mechanical-engineering', title: 'الهندسة الميكانيكية', description: 'التروس والرافعات والبكرات والآلات البسيطة', icon: <Wrench className="w-7 h-7" />, color: 'from-amber-500 to-orange-600', route: '/simulation/mechanical-engineering', features: ['الرافعات', 'البكرات', 'التروس'], category: 'engineering' },
    { id: 'photoelectric-effect', title: 'الظاهرة الكهروضوئية وثابت بلانك', description: 'تحرير الإلكترونات بالضوء وقياس جهد الإيقاف واستنتاج ثابت بلانك', icon: <Sun className="w-7 h-7" />, color: 'from-amber-500 to-indigo-600', route: '/simulation/photoelectric-effect', features: ['تغيير المعادن', 'منحنى I-V', 'حساب ثابت بلانك h'], category: 'physics' },
    { id: 'millikan-oil-drop', title: 'تجربة قطرة الزيت لميليكان', description: 'موازنة قطرات الزيت المشحونة واكتشاف تكميم الشحنة الكهربائية', icon: <Droplets className="w-7 h-7" />, color: 'from-amber-600 to-orange-600', route: '/simulation/millikan-oil-drop', features: ['مجهر افتراضي', 'ومضات أشعة سينية', 'استنتاج شحنة الإلكترون e'], category: 'physics' },
    { id: 'black-hole-relativity', title: 'الثقوب السوداء وتمدد الزمن الثقالي', description: 'استكشاف أفق الحدث وقرص التراكم وتبلد الزمن وساعات المسبار النسبية', icon: <Globe className="w-7 h-7" />, color: 'from-purple-600 to-pink-600', route: '/simulation/black-hole-relativity', features: ['نصف قطر شفارتزشيلد', 'ساعتان نسبيتان', 'انحناء الزمكان'], category: 'earth-space' },
    { id: 'rutherford-scattering', title: 'تشتت رذرفورد واكتشاف النواة', description: 'إطلاق جسيمات ألفا نحو رقائق المعادن وكشف النواة الذرية الصلبة', icon: <Target className="w-7 h-7" />, color: 'from-yellow-500 to-red-600', route: '/simulation/rutherford-scattering', features: ['مقارنة مع طومسون', 'مدرج زوايا التشتت', 'ارتداد خلفي نادر'], category: 'physics' },
    { id: 'chemical-equilibrium', title: 'الاتزان الكيميائي ومبدأ لوشاتيليه', description: 'محاكاة ديناميكية لاستجابة التفاعلات للحرارة والضغط والتركيز', icon: <Beaker className="w-7 h-7" />, color: 'from-emerald-500 to-teal-600', route: '/simulation/chemical-equilibrium', features: ['تخليق الأمونيا', 'تفاعل NO2 الملون', 'منحنيات التراكيز الحية'], category: 'chemistry' },
    { id: 'crispr-gene-editing', title: 'مختبر كريسبر وتعديل الجينات', description: 'المقص الجيني Cas9 لتصميم مرشد RNA وقص وإصلاح الطفرات الوراثية', icon: <Scissors className="w-7 h-7" />, color: 'from-pink-500 to-rose-600', route: '/simulation/crispr-gene-editing', features: ['تصميم gRNA', 'علاج الأنيميا المنجلية', 'الترحيل الكهربائي'], category: 'biology' },
    { id: 'xray-diffraction', title: 'حيود الأشعة السينية وقانون براغ', description: 'تداخل الأشعة السينية على المستويات الذرية وقياس أبعاد الشبكة البلورية', icon: <Layers className="w-7 h-7" />, color: 'from-cyan-500 to-blue-600', route: '/simulation/xray-diffraction', features: ['قانون براغ nλ=2dsinθ', 'مخطط الحيود XRD', 'بلورات NaCl والسيليكون'], category: 'chemistry' },
    { id: 'aerodynamics-wind-tunnel', title: 'نفق الرياح والديناميكا الهوائية', description: 'محاكاة قوى الرفع والسحب ومبدأ برنولي وظاهرة الانهيار الهوائي', icon: <Wind className="w-7 h-7" />, color: 'from-sky-500 to-indigo-600', route: '/simulation/aerodynamics-wind-tunnel', features: ['خطوط دخان انسيابية', 'زاوية الهجوم α', 'منحنى الرفع والسحب'], category: 'physics' },
    { id: 'superconductivity', title: 'الموصلية الفائقة وتأثير مايسنر', description: 'انعدام المقاومة تماماً R=0 وطرد المجال المغناطيسي والطفو الكمي', icon: <Magnet className="w-7 h-7" />, color: 'from-cyan-500 to-blue-700', route: '/simulation/superconductivity', features: ['تبريد نيتروجين سائل 77K', 'طرد المجال B=0', 'طفو مغناطيسي ثابت'], category: 'physics' },
    { id: 'orbital-mechanics', title: 'ميكانيكا المدارات ومناورة هوهمان', description: 'تخطيط مناورات الدفع الصاروخي والانتقال الإهليلجي بين الكواكب والمدارات', icon: <Rocket className="w-7 h-7" />, color: 'from-sky-500 to-amber-500', route: '/simulation/orbital-mechanics', features: ['مناورة هوهمان Δv', 'معادلة فيس-فيفا', 'مدارات LEO إلى GEO'], category: 'earth-space' },
    { id: 'quantum-wave-interference', title: 'تداخل الموجات الكمية وازدواجية المادة', description: 'إثبات الطبيعة الموجية للجسيمات (إلكترونات، فوتونات، نيوترونات، وهيليوم) وانهيار الدالة الموجية بالرصد', icon: <Atom className="w-7 h-7" />, color: 'from-cyan-500 to-indigo-600', route: '/simulation/quantum-wave-interference', features: ['موجات دي برولي λ=h/p', 'طلقات الجسيمات المفردة', 'كاشف المسار وانهيار الدالة الموجية'], category: 'physics' },
  ];

  const filteredSimulations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return simulations.filter(s => {
      const catMatch = activeCategory === 'all' || s.category === activeCategory;
      const searchMatch = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [simulations, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: simulations.length };
    simulations.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, [simulations]);

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300 font-sans" dir="rtl">
      {/* Subtle StarField in Dark Mode Only */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block opacity-40">
        <StarField starCount={120} />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      <main className="flex-1 relative z-10 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 shadow-sm transition-all"
            >
              <ArrowRight size={14} className="rtl:rotate-0 rotate-180" />
              <span>العودة للرئيسية</span>
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Atom className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              مختبر التجارب العلمية التفاعلية 3D
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              منظومة تضم <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{simulations.length}</span> مختبراً ومحاكاة رقمية تفاعلية — اختر مجالك وابدأ الاستكشاف والقياس المباشر
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن تجربة أو قانون فيزيائي (مثل: المقذوفات، براغ، كريسبر)..."
                className="w-full pr-11 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as Category | 'all')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-2 ${
                    active
                      ? `bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm font-bold`
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Result Count Status */}
          <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            عرض {filteredSimulations.length} تجربة علمية
          </div>

          {/* Experiments Grid - Mobile 1-col, Tablet 2-col, Laptop 3-col, Desktop 4-col */}
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد تجارب مطابقة لبحثك
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                إعادة ضبط عوامل التصفية
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredSimulations.map((sim, index) => (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.25) }}
                  whileHover={{ y: -3 }}
                  className="group"
                >
                  <div className="relative h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all duration-200 overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-xl">
                    {/* Color accent strip */}
                    <div className={`h-1 bg-gradient-to-r ${sim.color}`} />
                    
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      {/* Icon + Title row */}
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${sim.color} text-white shadow-sm`}>
                          {sim.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {sim.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">
                            {CATEGORIES.find(c => c.id === sim.category)?.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {sim.description}
                      </p>

                      {/* Features bullets */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        {sim.features.slice(0, 2).map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 mt-auto">
                        <button
                          onClick={() => { playSound(); navigate(sim.route); }}
                          className={`flex-1 py-2 bg-gradient-to-r ${sim.color} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-105 transition-all shadow-sm`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>ابدأ التجربة</span>
                        </button>
                        <button
                          onClick={() => { playSound(); setSelectedSimulation(sim); }}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs"
                          aria-label="معلومات"
                          title="تفاصيل التجربة"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal for Simulation Info */}
      <AnimatePresence>
        {selectedSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSimulation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-right font-sans"
            >
              <button
                onClick={() => setSelectedSimulation(null)}
                className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${selectedSimulation.color} text-white shadow-md mx-auto`}>
                  {selectedSimulation.icon}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedSimulation.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {CATEGORIES.find(c => c.id === selectedSimulation.category)?.label}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedSimulation.description}
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {selectedSimulation.features.map((feature, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2.5 justify-center pt-2">
                  <button
                    onClick={() => { playSound(); navigate(selectedSimulation.route); }}
                    className={`flex-1 py-2.5 bg-gradient-to-r ${selectedSimulation.color} text-white rounded-xl text-xs font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-sm`}
                  >
                    <Play className="w-4 h-4" />
                    <span>تشغيل المحاكاة الآن</span>
                  </button>
                  <button
                    onClick={() => setSelectedSimulation(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
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
};

export default ExperimentsSection;

