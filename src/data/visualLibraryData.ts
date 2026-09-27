export interface VisualAsset {
  id: string;
  title: string;
  description: string;
  subject: 'physics' | 'chemistry' | 'biology' | 'robotics' | 'mathematics' | 'space';
  subjectLabel: string;
  category: string;
  imageUrl: string;
  resolution: string;
  tags: string[];
  downloadsCount: number;
  simulationUrl?: string;
  simulationName?: string;
}

export const CURATED_VISUAL_ASSETS: VisualAsset[] = [
  {
    id: 'vis-phys-1',
    title: 'مخطط نموذج بور الذري وانتقال الإلكترونات في طيف الهيدروجين',
    description: 'انفوجرافيك علمي دقيق يوضح المستويات الطاقية المكممة (n=1 إلى n=6) ومتسلسلات لايمان، بالمر، وباشن مع الأطوال الموجية بالنانوميتر.',
    subject: 'physics',
    subjectLabel: 'الفيزياء الذرية',
    category: 'ميكانيكا الكم',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=85',
    resolution: '4K Ultra-HD',
    tags: ['بور', 'طيف الهيدروجين', 'كوانتم', 'فوتونات'],
    downloadsCount: 1240,
    simulationUrl: '/quantum-mechanics',
    simulationName: 'محاكي ميكانيكا الكم 3D'
  },
  {
    id: 'vis-phys-2',
    title: 'مخطط تسريع وتصادم الحزم في مسرع الهادرونات الكبير (LHC)',
    description: 'رسم توضيحي شامل للحلقة الدائرية بطول 27 كم، مع كواشف ATLAS و CMS وخطوات توليد بوزون هيغز عند طاقة 13.6 TeV.',
    subject: 'physics',
    subjectLabel: 'الفيزياء النووية',
    category: 'الجسيمات الأولية',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1400&q=85',
    resolution: '3840 x 2160',
    tags: ['LHC', 'سيرن', 'بروتونات', 'جسيمات أولية'],
    downloadsCount: 1650,
    simulationUrl: '/lhc-simulation',
    simulationName: 'محاكاة تصادم LHC 3D'
  },
  {
    id: 'vis-chem-1',
    title: 'منحنى طاقة التنشيط وتأثير المحفزات في التفاعلات الكيميائية',
    description: 'رسم بياني تفصيلي يقارن بين مسار التفاعل مع وبدون عامل مساعد، موضحاً طاقة المعقد المنشط ودلتا H للتفاعل الطارد والماص.',
    subject: 'chemistry',
    subjectLabel: 'الكيمياء الحركية',
    category: 'سرعة التفاعل',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1400&q=85',
    resolution: 'Vector High-Res',
    tags: ['طاقة التنشيط', 'محفزات', 'معقد منشط', 'أرهينيوس'],
    downloadsCount: 980,
    simulationUrl: '/chemical-kinetics',
    simulationName: 'مختبر الكيمياء الحركية 3D'
  },
  {
    id: 'vis-bio-1',
    title: 'التركيب ثلاثي الأبعاد لجزيء الحمض النووي (DNA Double Helix)',
    description: 'مخطط جزيئي فائق الدقة يوضح الروابط الهيدروجينية بين القواعد النيتروجينية (A-T, G-C)، والعمود الفقري لسكر الديوكسي ريبوز والفوسفات.',
    subject: 'biology',
    subjectLabel: 'العلوم الحياتية',
    category: 'الوراثة الجزيئية',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1400&q=85',
    resolution: '4K Render',
    tags: ['DNA', 'وراثة', 'قواعد نيتروجينية', 'كروموسومات'],
    downloadsCount: 2310,
    simulationUrl: '/crispr-gene-editing',
    simulationName: 'محاكي كريسبر 3D'
  },
  {
    id: 'vis-rob-1',
    title: 'المخطط الهندسي لتوصيلات متحكم ESP32 مع حساسات LiDAR و OLED',
    description: 'رسم بياني إلكتروني دقيق يوضح توزيع منافذ GPIO وبروتوكولات الاتصال I2C (SDA/SCL) وإشارات التغذية 3.3V و 5V لمشاريع الروبوتات.',
    subject: 'robotics',
    subjectLabel: 'الروبوتات والذكاء',
    category: 'الدوائر المدمجة',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=85',
    resolution: 'Ultra-HD Schema',
    tags: ['ESP32', 'LiDAR', 'I2C', 'Pinout', 'أردوينو'],
    downloadsCount: 1420,
    simulationUrl: '/robotics',
    simulationName: 'معمل Wokwi الافتراضي'
  },
  {
    id: 'vis-space-1',
    title: 'تشريح الثقب الأسود الدوار: أفق الحدث وقرص التراكم النجمي',
    description: 'انفوجرافيك فلكي يوضح فيزياء النسبية العامة حول الثقوب السوداء، وتأثير عدسة الجاذبية على مسارات الضوء وفوتونات الأشعة السينية.',
    subject: 'space',
    subjectLabel: 'الفلك والكونيات',
    category: 'النسبية العامة',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    resolution: '4K Astrophotography',
    tags: ['ثقب أسود', 'أفق الحدث', 'نسبية عامة', 'أينشتاين'],
    downloadsCount: 1890,
    simulationUrl: '/black-hole',
    simulationName: 'محاكي الثقوب السوداء 3D'
  },
  {
    id: 'vis-math-1',
    title: 'التمثيل الفراغي ثلاثي الأبعاد لدوال التفاضل والتكامل متعددة المتغيرات',
    description: 'رسم هندسي ملون يوضح السطوح التربيعية، مستويات المماس، وتدرج المتجهات (Gradient Vectors) في الفضاء الديكارتي ثلاثي الأبعاد.',
    subject: 'mathematics',
    subjectLabel: 'الرياضيات المتقدمة',
    category: 'التفاضل الفراغي',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=85',
    resolution: 'Vector Plot',
    tags: ['تفاضل وتكامل', 'سطوح فراغية', 'متجهات', 'Gradient'],
    downloadsCount: 840,
    simulationUrl: '/function-3d',
    simulationName: 'محاكي الدوال الفراغية 3D'
  }
];
