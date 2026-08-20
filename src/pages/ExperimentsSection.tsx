import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Play, Info, Search, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, Battery, Microscope, Heart, Rocket, Eye, Layers, Mountain, Flame, Droplets, Circle, Clock, Aperture, Hexagon, Snowflake, FlaskRound, Radiation, Leaf, Scissors, Shield, Bug, Shapes, Dice1, Bot, Wrench } from 'lucide-react';
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
    { id: 'optics-lab', title: 'مختبر البصريات ثلاثي الأبعاد', description: 'مختبر 3D: تتبّع الأشعة عبر العدسات والمرايا، الانكسار والانعكاس الكلي، وتشتت المنشور', icon: <Sun className="w-7 h-7" />, color: 'from-yellow-500 to-red-500', route: '/simulation/optics-lab', features: ['مشهد ثلاثي الأبعاد', 'معادلة العدسة والتكبير', 'قانون سنيل والزاوية الحرجة'], category: 'physics' },
    { id: 'circuit-builder', title: 'بناء الدوائر الكهربائية', description: 'مختبر افتراضي متقدم لبناء الدوائر مع نظام أسلاك حقيقي', icon: <Cpu className="w-7 h-7" />, color: 'from-blue-500 to-teal-500', route: '/simulation/circuit-builder-advanced', features: ['نظام أسلاك حقيقي', '9+ مكونات', 'تحليل حي للتيار'], category: 'engineering' },
    { id: 'projectile-motion', title: 'حركة المقذوفات', description: 'مختبر ثلاثي الأبعاد للمقذوفات مع متجهات وقياسات حيّة وتحدٍّ تفاعلي', icon: <Target className="w-7 h-7" />, color: 'from-green-500 to-teal-500', route: '/simulation/projectile-motion', features: ['مشهد ثلاثي الأبعاد', 'متجهات السرعة', 'مقاومة الهواء'], category: 'physics' },
    { id: 'solar-system', title: 'النظام الشمسي 3D', description: 'محاكاة 3D كاملة مع React Three Fiber وتحكم كاميرا 360°', icon: <Globe className="w-7 h-7" />, color: 'from-indigo-500 to-pink-500', route: '/simulation/solar-system-3d', features: ['تحكم كاميرا 360°', 'شمس متوهجة', 'حلقات زحل'], category: 'earth-space' },
    { id: 'genetics-lab', title: 'مختبر الوراثة', description: 'محاكاة تفاعلية لمربع بونيت وتضاعف DNA والطفرات الجينية', icon: <Dna className="w-7 h-7" />, color: 'from-pink-500 to-red-500', route: '/simulation/genetics-lab', features: ['مربع بونيت', 'تضاعف DNA', 'الطفرات الجينية'], category: 'biology' },
    { id: 'ecosystem', title: 'النظام البيئي', description: 'نظام بيئي حي مع كائنات متحركة وتوازن السكان', icon: <TreeDeciduous className="w-7 h-7" />, color: 'from-green-600 to-lime-500', route: '/simulation/ecosystem', features: ['السلسلة الغذائية', 'التعداد السكاني', 'الكوارث الطبيعية'], category: 'biology' },
    { id: 'electromagnetism', title: 'الكهرومغناطيسية ثلاثية الأبعاد', description: 'مختبر 3D: حلقات المجال حول سلك، ملف لولبي بقلب حديدي، ومولّد حثّي دوّار', icon: <Zap className="w-7 h-7" />, color: 'from-purple-600 to-cyan-500', route: '/simulation/electromagnetism', features: ['مشهد ثلاثي الأبعاد', 'قاعدة اليد اليمنى', 'قانون فاراداي ولنز'], category: 'physics' },
    { id: 'waves-sound', title: 'الموجات والصوت ثلاثية الأبعاد', description: 'مختبر 3D: موجة منتقلة متوهّنة، جبهات دوبلر ومخروط ماخ، وسطح تداخل مائي بمصدرين', icon: <Waves className="w-7 h-7" />, color: 'from-green-600 to-blue-500', route: '/simulation/waves-sound', features: ['مشهد ثلاثي الأبعاد', 'تأثير دوبلر ورقم ماخ', 'التداخل والنبضات'], category: 'physics' },
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
    { id: 'mechanical-engineering', title: 'الهندسة الميكانيكية ثلاثية الأبعاد', description: 'مختبر 3D: روافع بأنواعها الثلاثة، أنظمة بكرات مركّبة، وقطار تروس متعاشق بنسب حقيقية', icon: <Wrench className="w-7 h-7" />, color: 'from-amber-500 to-orange-600', route: '/simulation/mechanical-engineering', features: ['مشهد ثلاثي الأبعاد', 'الفائدة الآلية والعزوم', 'نِسب التروس والكفاءة'], category: 'engineering' },
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
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-slate-950 via-blue-950/60 to-slate-950" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={150} />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      <main className="flex-1 relative z-10 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 mx-auto"
            >
              <ArrowRight size={18} />
              العودة للرئيسية
            </button>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-cyan-500/30">
              <Atom className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-purple-300 bg-clip-text text-transparent">
                مختبر التجارب العلمية التفاعلية
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
              {simulations.length} تجربة تفاعلية — اختر المجال وابدأ الاستكشاف
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن تجربة..."
                className="w-full pr-12 pl-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as Category | 'all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    active
                      ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10'
                  }`}
                >
                  {cat.label}
                  <span className={`mr-2 inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] ${active ? 'bg-white/25' : 'bg-white/10'}`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Result count */}
          <div className="text-center text-white/50 text-sm mb-6">
            عرض {filteredSimulations.length} تجربة
          </div>

          {/* Experiments Grid - Clear & Spacious */}
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-20 text-white/60">
              لا توجد تجارب مطابقة لبحثك
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSimulations.map((sim, index) => (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <div className="relative h-full rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10">
                    {/* Color accent strip */}
                    <div className={`h-1.5 bg-gradient-to-r ${sim.color}`} />
                    
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Icon + Title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`shrink-0 p-3 rounded-xl bg-gradient-to-br ${sim.color} text-white shadow-md ring-1 ring-white/10`}>
                          {sim.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white leading-tight mb-1">
                            {sim.title}
                          </h3>
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">
                            {CATEGORIES.find(c => c.id === sim.category)?.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-2 flex-1">
                        {sim.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => { playSound(); navigate(sim.route); }}
                          className={`flex-1 py-2.5 bg-gradient-to-r ${sim.color} text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md`}
                        >
                          <Play className="w-4 h-4" />
                          ابدأ التجربة
                        </button>
                        <button
                          onClick={() => { playSound(); setSelectedSimulation(sim); }}
                          className="px-3 py-2.5 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-xl border border-white/10 hover:border-white/25 transition-all"
                          aria-label="معلومات"
                        >
                          <Info className="w-4 h-4" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSimulation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br ${selectedSimulation.color} p-[2px]`}
            >
              <div className="bg-slate-900 rounded-3xl p-6">
                <button
                  onClick={() => setSelectedSimulation(null)}
                  className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${selectedSimulation.color} text-white mb-4 shadow-lg`}>
                    {selectedSimulation.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedSimulation.title}
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {selectedSimulation.description}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {selectedSimulation.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/85 border border-white/10">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { playSound(); navigate(selectedSimulation.route); }}
                      className={`px-6 py-3 bg-gradient-to-r ${selectedSimulation.color} text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg`}
                    >
                      <Play className="w-5 h-5" />
                      ابدأ الآن
                    </button>
                    <button
                      onClick={() => setSelectedSimulation(null)}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                    >
                      إغلاق
                    </button>
                  </div>
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
