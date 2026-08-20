
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, Thermometer, FlaskConical, Battery, Microscope, Heart, Rocket, Eye, Layers, Mountain, Wind, Magnet, Scissors, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScientificSimulations = () => {
  const navigate = useNavigate();

  const simulations = [
    {
      id: 'blackbody-radiation',
      title: 'محاكاة إشعاع الجسم الأسود المتطورة',
      description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي وأدوات حسابية ومساعد ذكي',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-purple-600 via-blue-600 to-cyan-600',
      route: '/simulation/blackbody-radiation',
      features: [
        'التمثيل البياني مع الطيف المرئي',
        'أدوات التكبير والتصغير المتطورة',
        'حاسبات الطول الموجي والتردد والطاقة',
        'مساعد ذكي للفيزياء المتخصص',
        'واجهة تفاعلية بثلاث تبويبات'
      ]
    },
    {
      id: 'build-atom',
      title: 'تجربة بناء الذرة التفاعلية',
      description: 'تجربة شاملة لبناء الذرات من خلال سحب وإفلات الجسيمات الذرية واكتشاف خصائص العناصر',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-orange-600 via-red-600 to-pink-600',
      route: '/simulation/build-atom',
      features: [
        'سحب وإفلات البروتونات والنيوترونات والإلكترونات',
        'تحديد العنصر والأيون تلقائياً',
        'بناء سريع للعناصر الشائعة',
        'معلومات تفصيلية عن الذرة المبنية',
        'واجهة ثلاثية الأبعاد جذابة'
      ]
    },
    {
      id: 'lhc-simulation',
      title: 'مصادم الهدرونات الكبير (LHC)',
      description: 'محاكاة متقدمة تفاعلية لمصادم الهدرونات الكبير مع تصادمات البروتونات والكشف عن الجسيمات',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'from-cyan-500 via-blue-600 to-purple-600',
      route: '/lhc-simulation',
      features: [
        'تسريع الجسيمات إلى سرعة الضوء',
        'تصادمات عالية الطاقة (13 TeV)',
        'كشف الجسيمات الناتجة والبوزونات',
        'مغناطيسات فائقة التوصيل',
        'سيناريوهات جاهزة واختبارات تفاعلية'
      ]
    },
    {
      id: 'electromagnetic-waves',
      title: 'الموجات الكهرومغناطيسية',
      description: 'استكشاف الطيف الكهرومغناطيسي الكامل من موجات الراديو إلى أشعة غاما مع تفاعلات حية',
      icon: <Waves className="w-12 h-12" />,
      color: 'from-red-500 via-green-500 to-purple-600',
      route: '/electromagnetic-waves',
      features: [
        'عرض الطيف الكامل بالألوان الحقيقية',
        'التحكم في التردد والطول الموجي',
        'تطبيقات عملية لكل نوع موجة',
        'رسوم متحركة للمجالات الكهربائية والمغناطيسية',
        'اختبارات تفاعلية وحقائق علمية'
      ]
    },
    {
      id: 'nuclear-reactions',
      title: 'التفاعلات النووية',
      description: 'محاكاة خرافية للانشطار والاندماج النووي مع تأثيرات بصرية مذهلة وطاقة هائلة',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-green-500 via-purple-500 to-blue-500',
      route: '/nuclear-reactions',
      features: [
        'محاكاة انشطار اليورانيوم-235 بتفاصيل دقيقة',
        'اندماج الديوتيريوم-تريتيوم كما في الشمس',
        'رسوم متحركة خرافية للجسيمات النووية',
        'مقارنة الطاقة المنطلقة مع التفاعلات الكيميائية',
        'اختبارات تعليمية شاملة'
      ]
    },
    {
      id: 'chemical-reactions',
      title: 'التفاعلات الكيميائية ثلاثية الأبعاد',
      description: 'استكشف عالم الكيمياء من خلال محاكاة تفاعلية ثلاثية الأبعاد تُظهر تكوين الجزيئات والروابط الكيميائية بشكل مرئي',
      icon: <Beaker className="w-12 h-12" />,
      color: 'from-chemistry-primary via-purple-500 to-blue-500',
      route: '/chemical-reactions',
      features: [
        '30+ تفاعل كيميائي من البسيط للمعقد',
        'رسوم متحركة ثلاثية الأبعاد متقدمة',
        'تصور تكوين وكسر الروابط الكيميائية',
        'من تكوين الماء إلى جزيئات الجسم المعقدة',
        'اختبارات تفاعلية شاملة'
      ]
    },
    {
      id: 'fourier-series',
      title: 'سلسلة فورييه التفاعلية',
      description: 'حساب وتمثيل سلسلة فورييه مع كشف ظاهرة غيبس وتحليل الدوال القطعية',
      icon: <Activity className="w-12 h-12" />,
      color: 'from-indigo-500 via-purple-500 to-pink-600',
      route: '/fourier-series',
      features: [
        'إدخال دوال عادية أو قطعية (piecewise)',
        'لوحة رموز رياضية متقدمة',
        '10+ أمثلة جاهزة (موجة مربعة، مثلثية، منشارية)',
        'رسم بياني مقارن: الدالة الأصلية vs التقريب',
        'حساب تلقائي لمعاملات a₀, aₙ, bₙ',
        'كشف تلقائي لنقاط عدم الاستمرار',
        'كشف ظاهرة غيبس مع نسبة التجاوز',
        'عرض رمزي للصيغة الرياضية',
        'تحكم بعدد الحدود N (1-100)',
        'أنيميشن تطور التقريب',
        'دليل تعليمي شامل'
      ]
    },
    {
      id: '3d-function-visualizer',
      title: 'تمثيل الدوال ثلاثي الأبعاد',
      description: 'تجربة تفاعلية لعرض الدوال الرياضية في الفضاء ثلاثي الأبعاد مع إمكانيات تفاعلية متقدمة',
      icon: <Box className="w-12 h-12" />,
      color: 'from-emerald-500 via-teal-500 to-cyan-600',
      route: '/3d-function-visualizer',
      features: [
        'عرض 1D (نقطة)، 2D (منحنى)، 3D (سطح)',
        'تدوير وتكبير تفاعلي بالماوس',
        '15+ مثال جاهز متنوع',
        'مقارنة حتى 5 دوال في نفس المشهد',
        'ألوان وتدرجات قابلة للتخصيص'
      ]
    },
    {
      id: 'optics-lab',
      title: 'مختبر البصريات ثلاثي الأبعاد',
      description: 'محاكاة تفاعلية للأشعة الضوئية مع العدسات والمرايا والمناشير',
      icon: <Sun className="w-12 h-12" />,
      color: 'from-yellow-500 via-orange-500 to-red-500',
      route: '/simulation/optics-lab',
      features: [
        'عدسات محدبة ومقعرة',
        'مرايا مستوية ومقعرة ومحدبة',
        'تشتت الضوء عبر المناشير',
        'قوانين الانعكاس والانكسار',
        'حساب البعد البؤري والتكبير'
      ]
    },
    {
      id: 'circuit-builder',
      title: 'بناء الدوائر الكهربائية المتقدم',
      description: 'مختبر افتراضي متقدم لبناء الدوائر مع نظام أسلاك حقيقي وسحب وإفلات',
      icon: <Cpu className="w-12 h-12" />,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      route: '/simulation/circuit-builder-advanced',
      features: [
        'نظام أسلاك حقيقي للربط بين المكونات',
        'سحب وإفلات حر للمكونات',
        '9+ مكونات (بطارية، مقاومة، LED، محرك...)',
        '5 دوائر جاهزة متدرجة الصعوبة',
        'تحليل حي للتيار والجهد والقدرة'
      ]
    },
    {
      id: 'projectile-motion',
      title: 'حركة المقذوفات ثلاثية الأبعاد',
      description: 'مختبر 3D تفاعلي: متجهات السرعة، مقاومة الهواء، جاذبية الكواكب، تحدٍّ ودفتر تجربة',

      icon: <Target className="w-12 h-12" />,
      color: 'from-green-500 via-emerald-500 to-teal-500',
      route: '/simulation/projectile-motion',
      features: [
        'حركة المقذوفات بزوايا مختلفة',
        'محاكاة البندول البسيط',
        'تأثير مقاومة الهواء',
        'رسوم بيانية للموقع والسرعة',
        'معادلات الحركة الكاملة'
      ]
    },
    {
      id: 'solar-system',
      title: 'النظام الشمسي ثلاثي الأبعاد',
      description: 'محاكاة 3D كاملة مع React Three Fiber وتحكم كاميرا 360°',
      icon: <Globe className="w-12 h-12" />,
      color: 'from-indigo-500 via-purple-500 to-pink-500',
      route: '/simulation/solar-system-3d',
      features: [
        'نظام شمسي 3D تفاعلي بالكامل',
        'تحكم كاميرا 360° مع تقريب وتدوير',
        'شمس متوهجة مع تأثير الكورونا',
        'حلقات زحل والأقمار وحزام الكويكبات',
        'معلومات تفصيلية عن كل كوكب'
      ]
    },
    {
      id: 'genetics-lab',
      title: 'مختبر الوراثة والجينات',
      description: 'محاكاة تفاعلية لمربع بونيت وتضاعف DNA والطفرات الجينية',
      icon: <Dna className="w-12 h-12" />,
      color: 'from-pink-500 via-rose-500 to-red-500',
      route: '/simulation/genetics-lab',
      features: [
        'مربع بونيت التفاعلي',
        'تضاعف الحمض النووي',
        'أنواع الطفرات الجينية',
        'الصفات السائدة والمتنحية',
        'نسب التوارث المتوقعة'
      ]
    },
    {
      id: 'ecosystem',
      title: 'محاكاة النظام البيئي',
      description: 'نظام بيئي حي مع كائنات متحركة وتوازن السكان والسلسلة الغذائية',
      icon: <TreeDeciduous className="w-12 h-12" />,
      color: 'from-green-600 via-lime-500 to-yellow-500',
      route: '/simulation/ecosystem',
      features: [
        'منتجون ومستهلكون ومحللون',
        'السلسلة الغذائية الكاملة',
        'رسوم بيانية للتعداد السكاني',
        'تأثير العوامل البيئية',
        'محاكاة الكوارث الطبيعية'
      ]
    },
    {
      id: 'electromagnetism',
      title: 'مختبر الكهرومغناطيسية',
      description: 'محاكاة المجال المغناطيسي والحث الكهرومغناطيسي والمحركات',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-purple-600 via-blue-500 to-cyan-500',
      route: '/simulation/electromagnetism',
      features: ['المجال حول الأسلاك', 'الملفات والسولينويد', 'قاعدة اليد اليمنى', 'البوصلات التفاعلية']
    },
    {
      id: 'waves-sound',
      title: 'مختبر الموجات والصوت',
      description: 'محاكاة الموجات الصوتية وتأثير دوبلر والتداخل',
      icon: <Waves className="w-12 h-12" />,
      color: 'from-green-600 via-teal-500 to-blue-500',
      route: '/simulation/waves-sound',
      features: ['أنواع الموجات', 'تأثير دوبلر', 'تداخل الموجات', 'تشغيل الصوت الحقيقي']
    },
    {
      id: 'static-electricity',
      title: 'محاكاة الكهرباء الساكنة',
      description: 'قانون كولوم والمجال الكهربائي ومولد فان دي غراف',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'from-yellow-600 via-orange-500 to-red-500',
      route: '/simulation/static-electricity',
      features: ['قانون كولوم', 'خطوط المجال', 'الكاشف الكهربائي', 'مولد فان دي غراف']
    },
    {
      id: 'advanced-astronomy',
      title: 'مختبر الفلك المتقدم',
      description: 'محاكاة الكسوف والخسوف وأطوار القمر والمدارات',
      icon: <Globe className="w-12 h-12" />,
      color: 'from-indigo-600 via-purple-500 to-pink-500',
      route: '/simulation/advanced-astronomy',
      features: ['كسوف الشمس', 'خسوف القمر', 'أطوار القمر', 'قوانين كبلر']
    },
    {
      id: 'quantum-mechanics',
      title: 'مختبر ميكانيكا الكم',
      description: 'تجربة الشق المزدوج والنفق الكمي والتراكب',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-pink-600 via-purple-500 to-indigo-500',
      route: '/simulation/quantum-mechanics',
      features: ['الشق المزدوج', 'النفق الكمي', 'التراكب الكمي', 'تأثير المراقب']
    },
    {
      id: 'analytical-chemistry',
      title: 'مختبر الكيمياء التحليلية',
      description: 'محاكاة متقدمة للمعايرة وقياس pH والكروماتوغرافيا والتحليل الطيفي',
      icon: <FlaskConical className="w-12 h-12" />,
      color: 'from-emerald-600 via-green-500 to-teal-500',
      route: '/simulation/analytical-chemistry',
      features: ['معايرة حمض-قاعدة', 'قياس الأس الهيدروجيني', 'كروماتوغرافيا الفصل', 'التحليل الطيفي UV-Vis']
    },
    {
      id: 'electrochemistry',
      title: 'مختبر الكيمياء الكهربائية',
      description: 'استكشاف الخلايا الجلفانية والتحليل الكهربائي والتآكل وخلايا الوقود',
      icon: <Battery className="w-12 h-12" />,
      color: 'from-amber-600 via-orange-500 to-yellow-500',
      route: '/simulation/electrochemistry',
      features: ['الخلايا الجلفانية', 'التحليل الكهربائي', 'عملية التآكل', 'خلايا الوقود الهيدروجينية']
    },
    {
      id: 'molecular-biology',
      title: 'مختبر البيولوجيا الجزيئية',
      description: 'محاكاة تضاعف DNA والنسخ والترجمة وتفاعل PCR',
      icon: <Microscope className="w-12 h-12" />,
      color: 'from-violet-600 via-purple-500 to-fuchsia-500',
      route: '/simulation/molecular-biology',
      features: ['تضاعف الحمض النووي', 'عملية النسخ', 'الترجمة وتصنيع البروتين', 'تفاعل البلمرة المتسلسل PCR']
    },
    {
      id: 'human-body',
      title: 'محاكاة جسم الإنسان',
      description: 'استكشاف أجهزة الجسم: الدوران، التنفس، العصبي، الهضمي',
      icon: <Heart className="w-12 h-12" />,
      color: 'from-red-600 via-rose-500 to-pink-500',
      route: '/simulation/human-body',
      features: ['الجهاز الدوري والقلب', 'الجهاز التنفسي', 'الجهاز العصبي', 'الجهاز الهضمي']
    },
    {
      id: 'advanced-nuclear',
      title: 'الفيزياء النووية المتقدمة',
      description: 'محاكاة الاضمحلال الإشعاعي والانشطار والاندماج وعمر النصف',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-lime-600 via-green-500 to-emerald-500',
      route: '/simulation/advanced-nuclear',
      features: ['اضمحلال ألفا وبيتا وغاما', 'الانشطار النووي', 'الاندماج النووي', 'حساب عمر النصف']
    },
    {
      id: 'digital-electronics',
      title: 'مختبر الإلكترونيات الرقمية',
      description: 'بوابات المنطق والجامعات والعدادات وخلايا الذاكرة',
      icon: <Cpu className="w-12 h-12" />,
      color: 'from-slate-600 via-gray-500 to-zinc-500',
      route: '/simulation/digital-electronics',
      features: ['بوابات AND, OR, NOT, XOR', 'الجامع النصفي', 'عداد 8-بت', 'خلية ذاكرة 8-بت']
    },
    {
      id: 'earth-sciences',
      title: 'مختبر علوم الأرض',
      description: 'محاكاة الزلازل والبراكين والصفائح التكتونية ودورة الصخور',
      icon: <Mountain className="w-12 h-12" />,
      color: 'from-amber-700 via-orange-600 to-red-600',
      route: '/simulation/earth-sciences',
      features: ['محاكاة الزلازل', 'ثوران البراكين', 'حركة الصفائح التكتونية', 'دورة الصخور']
    },
    {
      id: 'rocket-science',
      title: 'علوم الصواريخ والفضاء',
      description: 'محاكاة إطلاق الصواريخ والمدارات الفضائية وهبوط المركبات',
      icon: <Rocket className="w-12 h-12" />,
      color: 'from-sky-600 via-blue-500 to-indigo-500',
      route: '/simulation/rocket-science',
      features: ['إطلاق الصاروخ متعدد المراحل', 'المدارات الفضائية', 'هبوط المركبة الفضائية', 'فيزياء الدفع الصاروخي']
    },
    {
      id: 'advanced-optics',
      title: 'مختبر البصريات المتقدمة',
      description: 'تشتت المنشور والعدسات والتداخل والاستقطاب',
      icon: <Eye className="w-12 h-12" />,
      color: 'from-cyan-600 via-teal-500 to-emerald-500',
      route: '/simulation/advanced-optics',
      features: ['تشتت الضوء بالمنشور', 'بؤرة العدسات', 'تداخل الشقين', 'استقطاب الضوء']
    },
    {
      id: 'materials-science',
      title: 'علوم المواد والسبائك',
      description: 'البنية البلورية والسبائك واختبارات الإجهاد ومخططات الأطوار',
      icon: <Layers className="w-12 h-12" />,
      color: 'from-stone-600 via-neutral-500 to-zinc-500',
      route: '/simulation/materials-science',
      features: ['البنية البلورية', 'تكوين السبائك', 'اختبار الإجهاد-الانفعال', 'مخطط أطوار الحديد-كربون']
    },
    {
      id: 'photoelectric-effect',
      title: 'الظاهرة الكهروضوئية وثابت بلانك',
      description: 'تحرير الإلكترونات بالضوء، قياس جهد الإيقاف واستنتاج ثابت بلانك بدقة تجريبية',
      icon: <Sun className="w-12 h-12" />,
      color: 'from-amber-500 via-orange-600 to-indigo-600',
      route: '/simulation/photoelectric-effect',
      features: ['اختيار معادن مختلفة', 'منحنى الخصائص I-V', 'حساب ثابت بلانك h', 'أنبوبة تفريغ حية']
    },
    {
      id: 'millikan-oil-drop',
      title: 'تجربة قطرة الزيت لميليكان',
      description: 'موازنة قطرات الزيت المشحونة في المجال الكهربائي واستنتاج شحنة الإلكترون e',
      icon: <Droplets className="w-12 h-12" />,
      color: 'from-amber-600 via-yellow-600 to-orange-600',
      route: '/simulation/millikan-oil-drop',
      features: ['مجهر إلكتروني دقيق', 'ومضات تأيين X-Ray', 'جدول تكميم الشحنات', 'حساب شحنة e']
    },
    {
      id: 'black-hole-relativity',
      title: 'الثقوب السوداء وتمدد الزمن الثقالي',
      description: 'استكشاف أفق الحدث، قرص التراكم، وتبلد الزمن وساعات المسبار النسبية',
      icon: <Globe className="w-12 h-12" />,
      color: 'from-purple-600 via-pink-600 to-black',
      route: '/simulation/black-hole-relativity',
      features: ['نصف قطر شفارتزشيلد', 'ساعتان نسبيتان متزامنتان', 'عدسات الجاذبية', 'إزاحة حمراء تثاقلية']
    },
    {
      id: 'rutherford-scattering',
      title: 'تشتت رذرفورد واكتشاف النواة',
      description: 'إطلاق جسيمات ألفا نحو رقائق المعادن وكشف النواة الذرية الصلبة',
      icon: <Target className="w-12 h-12" />,
      color: 'from-yellow-500 via-amber-600 to-red-600',
      route: '/simulation/rutherford-scattering',
      features: ['مقارنة مع نموذج طومسون', 'مدرج إحصائي لزوايا التشتت', 'ارتداد خلفي نادر', 'حساب أقرب مسافة dmin']
    },
    {
      id: 'chemical-equilibrium',
      title: 'الاتزان الكيميائي ومبدأ لوشاتيليه',
      description: 'محاكاة ديناميكية لاستجابة التفاعلات لتغيرات الحرارة والضغط والتركيز',
      icon: <Beaker className="w-12 h-12" />,
      color: 'from-emerald-500 via-teal-600 to-cyan-600',
      route: '/simulation/chemical-equilibrium',
      features: ['تخليق الأمونيا Haber-Bosch', 'تفاعل NO2/N2O4 الملون', 'منحنيات التراكيز الحية', 'حساب حاصل التفاعل Q']
    },
    {
      id: 'crispr-gene-editing',
      title: 'مختبر كريسبر وتعديل الجينات',
      description: 'المقص الجيني Cas9 لتصميم مرشد RNA وقص وإصلاح الطفرات الوراثية',
      icon: <Scissors className="w-12 h-12" />,
      color: 'from-pink-500 via-rose-600 to-indigo-600',
      route: '/simulation/crispr-gene-editing',
      features: ['تصميم gRNA مكمل', 'علاج الأنيميا المنجلية والتليف الكيسي', 'مسارات NHEJ و HDR', 'ترحيل كهربائي هلامي']
    },
    {
      id: 'xray-diffraction',
      title: 'حيود الأشعة السينية وقانون براغ',
      description: 'تداخل الأشعة السينية على المستويات الذرية وقياس أبعاد الشبكة البلورية',
      icon: <Layers className="w-12 h-12" />,
      color: 'from-cyan-500 via-sky-600 to-blue-600',
      route: '/simulation/xray-diffraction',
      features: ['قانون براغ nλ=2dsinθ', 'مخطط الحيود XRD', 'بلورات NaCl والسيليكون', 'مقياس زوايا تفاعلي']
    },
    {
      id: 'aerodynamics-wind-tunnel',
      title: 'نفق الرياح والديناميكا الهوائية',
      description: 'محاكاة قوى الرفع والسحب ومبدأ برنولي وظاهرة الانهيار الهوائي (Stall)',
      icon: <Wind className="w-12 h-12" />,
      color: 'from-sky-500 via-cyan-600 to-indigo-600',
      route: '/simulation/aerodynamics-wind-tunnel',
      features: ['خطوط دخان انسيابية حية', 'زاوية الهجوم α', 'منحنى الرفع والسحب', 'كشف نقطة الانهيار Stall']
    },
    {
      id: 'superconductivity',
      title: 'الموصلية الفائقة وتأثير مايسنر',
      description: 'انعدام المقاومة تماماً R=0 وطرد المجال المغناطيسي والطفو الكمي',
      icon: <Magnet className="w-12 h-12" />,
      color: 'from-cyan-500 via-teal-600 to-blue-700',
      route: '/simulation/superconductivity',
      features: ['تبريد نيتروجين سائل 77K', 'طرد المجال B=0', 'طفو مغناطيسي ثابت', 'منحنى R-T']
    },
    {
      id: 'orbital-mechanics',
      title: 'ميكانيكا المدارات ومناورة هوهمان',
      description: 'تخطيط مناورات الدفع الصاروخي والانتقال الإهليلجي بين الكواكب والمدارات',
      icon: <Rocket className="w-12 h-12" />,
      color: 'from-sky-500 via-amber-500 to-indigo-600',
      route: '/simulation/orbital-mechanics',
      features: ['مناورة هوهمان Δv', 'معادلة فيس-فيفا', 'مدارات LEO إلى GEO', 'حساب زمن الرحلة']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/'); }}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للرئيسية'}
            </Button>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ذروة العلم - محاكاة التجارب العلمية
              </h1>
              <p className="text-blue-200 mt-2">استكشف عالم الفيزياء من خلال المحاكاة التفاعلية المتطورة</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-300">
              تجارب علمية تفاعلية متطورة
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              مجموعة متكاملة من المحاكيات العلمية التفاعلية لفهم المفاهيم الفيزيائية بصورة عملية وممتعة
            </p>
          </div>
        </motion.div>

        {/* Simulations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {simulations.map((simulation, index) => (
            <motion.div
              key={simulation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card 
                className={`bg-gradient-to-br ${simulation.color} border-0 shadow-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 h-full`}
                onClick={() => navigate(simulation.route)}
              >
                <CardContent className="p-8 relative h-full flex flex-col">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center flex-1 flex flex-col">
                    <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm mx-auto">
                      {simulation.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {simulation.title}
                    </h3>
                    
                    <p className="text-white/90 text-base leading-relaxed mb-6 flex-1">
                      {simulation.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {simulation.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <span className="text-white/90 font-medium text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300 px-6 py-3 text-base mt-auto"
                    >
                      ابدأ التجربة التفاعلية
                    </Button>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Educational Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-blue-300">مميزات المحاكاة المتطورة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'تفاعلية كاملة', desc: 'تحكم كامل في جميع المعاملات والمتغيرات' },
              { title: 'رسوم بيانية متطورة', desc: 'تمثيل بصري دقيق للمفاهيم العلمية' },
              { title: 'حاسبات فيزيائية', desc: 'أدوات حسابية متقدمة للقوانين الفيزيائية' },
              { title: 'مساعد ذكي', desc: 'دعم تعليمي متخصص لكل تجربة' }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScientificSimulations;
