export interface PlatformResourceMention {
  id: string;
  title: string;
  category: 'محاكاة علمية' | 'مختبر روبوتات' | 'منهاج ومادة' | 'أداة ذكاء اصطناعي' | 'مجلة ومكتبة' | 'منصة دمج';
  categoryKey: 'simulations' | 'robotics' | 'curriculum' | 'ai' | 'journal' | 'damij';
  route: string;
  iconName: string;
  badge: string;
  summary: string;
}

export const PLATFORM_MENTION_RESOURCES: PlatformResourceMention[] = [
  // 1. Simulations & Labs
  {
    id: 'quantum-wave-interference',
    title: 'تداخل الموجات الكمية وازدواجية المادة',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulation/quantum-wave-interference',
    iconName: 'Atom',
    badge: 'ميكانيكا الكم 2.0',
    summary: 'إثبات الطبيعة الموجية للإلكترونات والفوتونات، وتراكب دالة الموجة وانهيارها بكاشف المسار.'
  },
  {
    id: 'lhc-simulation',
    title: 'محاكي مصادم الهادرونات الكبير (LHC)',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/lhc',
    iconName: 'Atom',
    badge: 'فيزياء الجسيمات 3D',
    summary: 'تسريع البروتونات لسرعة 0.99c ومحاكاة انبعاث وتخليق جسيم بوزون هيغز.'
  },
  {
    id: 'millikan-simulation',
    title: 'محاكي قطرة الزيت لميليكان (Millikan)',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/millikan',
    iconName: 'Atom',
    badge: 'كهرومغناطيسية',
    summary: 'موازنة قوى الجاذبية والمجال الكهربائي لحساب الشحنة الأساسية للإلكترون.'
  },
  {
    id: 'crispr-simulation',
    title: 'مختبر تعديل الجينات CRISPR-Cas9',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/crispr',
    iconName: 'Dna',
    badge: 'هندسة وراثية 3D',
    summary: 'تصميم دليل RNA وقص واستبدال السلاسل الوراثية الطافرة في الخلية الحية.'
  },
  {
    id: 'projectile-3d',
    title: 'مختبر حركة المقذوفات ثلاثي الأبعاد',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/projectile-3d',
    iconName: 'Rocket',
    badge: 'ميكانيكا كلاسيكية',
    summary: 'تعديل زوايا الإطلاق ومقاومة الهواء وارتفاع المنصة وحساب المدى الأفقي.'
  },
  {
    id: 'periodic-table',
    title: 'الجدول الدوري الذكي (118 عنصراً)',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/periodic-table',
    iconName: 'FlaskConical',
    badge: 'كيمياء العناصر',
    summary: 'استعراض التوزيع الإلكتروني ونصف القطر الذري ومجسمات النظائر ثلاثية الأبعاد.'
  },
  {
    id: 'solar-system-3d',
    title: 'محاكي المجموعة الشمسية والمدارات',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/solar-system-3d',
    iconName: 'Telescope',
    badge: 'فلك وميكانيكا مدارية',
    summary: 'حركة كواكب المجموعة الشمسية وفق إحداثيات NASA JPL وسرعات الإفلات الجذبي.'
  },
  {
    id: 'thermodynamics-3d',
    title: 'مختبر الديناميكا الحرارية ثلاثي الأبعاد',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/thermodynamics-3d',
    iconName: 'Flame',
    badge: 'ثرموديناميكا',
    summary: 'دورات كارنو ومحركات الاحتراق ومنحنيات الضغط والحرارة والحجم (P-V).'
  },
  {
    id: 'fourier-series',
    title: 'محاكي متسلسلات فورييه التفاعلي',
    category: 'محاكاة علمية',
    categoryKey: 'simulations',
    route: '/simulations/fourier-series',
    iconName: 'Waves',
    badge: 'تحليل الإشارات',
    summary: 'تفكيك الموجات المربعة والمثلثة إلى ترددات توافقية متسلسلة بالصوت والصورة.'
  },

  // 2. Robotics & Embedded AI
  {
    id: 'robotics-arm',
    title: 'حركيات الذراع الروبوتية والمفاصل (Kinematics)',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=arm',
    iconName: 'Bot',
    badge: 'Forward & Inverse IK',
    summary: 'حساب زوايا المفاصل وإحداثيات نقطة العمل (TCP) والمحركات المؤازرة 3D.'
  },
  {
    id: 'robotics-amr',
    title: 'الملاحة الذاتية ومستشعر LiDAR 360°',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=amr',
    iconName: 'Radar',
    badge: 'LiDAR SLAM',
    summary: 'مسح بيئة المستودعات بالليزر وتفادي العوائق وتطبيق خوارزمية DWA للملاحة.'
  },
  {
    id: 'robotics-wokwi',
    title: 'محاكي العتاد والدوائر المدمجة (Wokwi)',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=wokwi',
    iconName: 'Cpu',
    badge: 'ESP32 & Arduino',
    summary: 'محاكاة إشارات PWM، مستشعرات الموجات فوق الصوتية، وشاشات I2C دون عتاد مادي.'
  },
  {
    id: 'robotics-vision',
    title: 'مختبر الرؤية الحاسوبية والوكلاء (YOLOv8)',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=vision',
    iconName: 'BrainCircuit',
    badge: 'Computer Vision AI',
    summary: 'كشف القطع الصناعية ومطابقة مربعات الإحاطة وتوجيه الملقط الآلي عبر الكاميرا.'
  },
  {
    id: 'robotics-arena',
    title: 'حلبة الأكواد وخوارزميات المتاهة (A* Arena)',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=arena',
    iconName: 'Swords',
    badge: 'خوارزميات البحث',
    summary: 'سباق خوارزمية A* مقابل Dijkstra و BFS لإيجاد أقصر مسار بدون اصطدام.'
  },
  {
    id: 'robotics-digital-twin',
    title: 'التوأم الرقمي ونماذج الطباعة 3D STL',
    category: 'مختبر روبوتات',
    categoryKey: 'robotics',
    route: '/robotics-section?tab=digital-twin',
    iconName: 'Printer',
    badge: 'CAD & 3D Print',
    summary: '5 مشاريع كابستون هندسية بملفات STL قابلة للتنزيل وقوائم مواد BOM.'
  },

  // 3. Curricula & Tracks
  {
    id: 'curriculum-physics',
    title: 'منهاج الفيزياء - الثانوية العامة (التوجيهي)',
    category: 'منهاج ومادة',
    categoryKey: 'curriculum',
    route: '/physics',
    iconName: 'BookOpen',
    badge: 'توجيهي علمي 2026',
    summary: 'الزخم الخطي والتصادمات، الحث الكهرومغناطيسي، وفيزياء الكم والنووية.'
  },
  {
    id: 'curriculum-chemistry',
    title: 'منهاج الكيمياء - الثانوية العامة (التوجيهي)',
    category: 'منهاج ومادة',
    categoryKey: 'curriculum',
    route: '/chemistry',
    iconName: 'FlaskConical',
    badge: 'توجيهي علمي 2026',
    summary: 'الحموض والقواعد، سرعة التفاعلات والاتزان، وتفاعلات التأكسد والاختزال.'
  },
  {
    id: 'curriculum-btec',
    title: 'مسارات Pearson BTEC الدولية في الهندسة',
    category: 'منهاج ومادة',
    categoryKey: 'curriculum',
    route: '/robotics-section?tab=pathways',
    iconName: 'GraduationCap',
    badge: 'تعليم مهني دولي',
    summary: 'مواصفات التعليم الهندسي التطبيقي والمشاريع العملية المعتمدة عالمياً.'
  },

  // 4. Intelligent AI Tools
  {
    id: 'ai-falak',
    title: 'فلك المعرفة الذكي (Falak AI Knowledge)',
    category: 'أداة ذكاء اصطناعي',
    categoryKey: 'ai',
    route: '/ai-assistant-section',
    iconName: 'Sparkles',
    badge: 'مساعد ذكي شامل',
    summary: 'حل المسائل العلمية وتبسيط المفاهيم المعقدة باللغة العربية ونماذج Gemini.'
  },
  {
    id: 'ai-smart-table',
    title: 'مولد الجداول والمقارنات التفاعلية',
    category: 'أداة ذكاء اصطناعي',
    categoryKey: 'ai',
    route: '/ai-assistant-section?tool=table-generator',
    iconName: 'Table',
    badge: 'تحليل ومقارنة',
    summary: 'إنشاء جداول ومصفوفات علمية دقيقة مع تلوين تلقائي وتصدير CSV و Markdown.'
  },
  {
    id: 'ai-exam-studio',
    title: 'استوديو الاختبارات الإلكترونية التشخيصية',
    category: 'أداة ذكاء اصطناعي',
    categoryKey: 'ai',
    route: '/ai-assistant-section?tool=exam-studio',
    iconName: 'FileCheck2',
    badge: 'تصنيف بلوم',
    summary: 'توليد امتحانات إلكترونية معيارية وقياس مستويات المعرفة والتحليل لدى الطالب.'
  },
  {
    id: 'ai-spaced-repetition',
    title: 'نظام المراجعة الذكي والتكرار المتباعد',
    category: 'أداة ذكاء اصطناعي',
    categoryKey: 'ai',
    route: '/spaced-repetition',
    iconName: 'Brain',
    badge: 'منحنى إبنجهاوس',
    summary: 'جدولة مراجعات الذاكرة طويلة المدى وبطاقات الاستذكار النشط يومياً.'
  },

  // 5. Scientific Journals & Visual Library
  {
    id: 'journal-scientific',
    title: 'المجلة العلمية المحكمة وأبحاث الفلك والكم',
    category: 'مجلة ومكتبة',
    categoryKey: 'journal',
    route: '/scientific-journal',
    iconName: 'BookMarked',
    badge: 'أوراق بحثية Q1',
    summary: 'أوراق بحثية متخصصة ومقالات مراجعة في الفيزياء النظرية والذكاء الاصطناعي.'
  },
  {
    id: 'visual-library-4k',
    title: 'المكتبة البصرية والمخططات التعليمية 4K',
    category: 'مجلة ومكتبة',
    categoryKey: 'journal',
    route: '/visual-library',
    iconName: 'Eye',
    badge: 'رسومات عالية الدقة',
    summary: 'مخططات إنفوجرافيك تشريحية وتوضيحية للفيزياء والكيمياء والأحياء بدقة فائقة.'
  },

  // 6. Damij Accessibility Platform
  {
    id: 'damij-autism-survey',
    title: 'استبيان تشخيص وتقييم التوحد (DSM-5)',
    category: 'منصة دمج',
    categoryKey: 'damij',
    route: '/damij/survey',
    iconName: 'HeartPulse',
    badge: 'تشخيص طبي معتمد',
    summary: 'تقييم درجات التوحد والدعم الحسي واللغوي للأطباء والأهالي.'
  },
  {
    id: 'damij-braille-lab',
    title: 'مختبر تعلم برايل التفاعلي والمترجم اللمسي',
    category: 'منصة دمج',
    categoryKey: 'damij',
    route: '/damij/braille',
    iconName: 'Languages',
    badge: 'للمكفوفين وضعاف البصر',
    summary: 'تحويل الحروف والكلمات إلى خلايا برايل السداسية المعتمدة وقراءتها صوتياً.'
  },
  {
    id: 'damij-sign-language',
    title: 'مترجم لغة الإشارة العربية التفاعلي',
    category: 'منصة دمج',
    categoryKey: 'damij',
    route: '/sign-language',
    iconName: 'Activity',
    badge: 'للصم وضعاف السمع',
    summary: 'تدريب مصور على الحروف الإشارية والكلمات العلمية المتداولة في المدارس.'
  }
];
