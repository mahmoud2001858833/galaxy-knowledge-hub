export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  author: string;
  authorRole: string;
  institution: string;
  subject: 'physics' | 'chemistry' | 'biology' | 'mathematics' | 'robotics' | 'arabic' | 'english';
  subjectLabel: string;
  category: string;
  coverImage: string;
  pdfUrl?: string;
  doi: string;
  readTimeMinutes: number;
  viewsCount: number;
  downloadsCount: number;
  publishedDate: string;
  isPeerReviewed: boolean;
  citationAPA: string;
  keyFindings: string[];
  simulationUrl?: string;
  simulationName?: string;
}

export const CURATED_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'paper-phys-1',
    title: 'تطبيقات التراكب الكمي في حوسبة الكيوبت ونمذجة دالة شرودنغر الموجية',
    abstract: 'تبحث هذه الورقة في الخصائص الديناميكية لتراكب الحالات الكمية في الأنظمة ثنائية المستوى، مع تحليل رياضي لمعادلة شرودنغر المعتمدة على الزمن، وتطبيقاتها في خوارزميات التشفير الكمي ومحاكاة المادة المكثفة.',
    author: 'د. يوسف بني عيسى & فريق فيزياء الكم',
    authorRole: 'باحث رئيسي في الفيزياء النظرية',
    institution: 'مختبرات ذروة العلم بالتعاون مع المركز الوطني للفيزياء',
    subject: 'physics',
    subjectLabel: 'الفيزياء الكمية',
    category: 'ميكانيكا الكم',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/quant-ph/0205037.pdf',
    doi: '10.1088/1367-2630/zarwat.phys.2026.01',
    readTimeMinutes: 12,
    viewsCount: 1420,
    downloadsCount: 520,
    publishedDate: '2026-09-15',
    isPeerReviewed: true,
    citationAPA: 'بني عيسى، ي. (2026). تطبيقات التراكب الكمي في حوسبة الكيوبت. مجلة ذروة العلم للأبحاث الفيزيائية، 14(2)، 45-68.',
    keyFindings: [
      'إثبات استقرار التراكب الكمي عند درجات الحرارة المنخفضة لأكثر من 120 ميكروثانية',
      'تطوير نموذج عددي لمعادلة شرودنغر بدقة حوسبية تتجاوز 99.4%',
      'تخفيض نسبة ضوضاء فك الترابط الكمي (Decoherence) بنسبة 35%'
    ],
    simulationUrl: '/quantum-mechanics',
    simulationName: 'محاكي ميكانيكا الكم والدالة الموجية 3D'
  },
  {
    id: 'paper-phys-2',
    title: 'ديناميكا حزم البروتونات عالية الطاقة في مسرع الهادرونات الكبير (LHC)',
    abstract: 'دراسة استقصائية لآليات تسريع الجسيمات دون الذرية تحت تأثير الحقول الكهرومغناطيسية الفائقة، وتحليل نواتج تصادم البروتونات عند طاقة 13.6 TeV للتحقق من بوزون هيغز والجسيمات المعيارية.',
    author: 'أ. عمر الشناوي',
    authorRole: 'مشرف أول الفيزياء المتقدمة',
    institution: 'مدرسة عنبه الثانوية للبنين بالتعاون مع CERN',
    subject: 'physics',
    subjectLabel: 'الفيزياء النووية',
    category: 'الجسيمات الأولية',
    coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/hep-ex/0301015.pdf',
    doi: '10.1016/j.physletb.zarwat.2026.04',
    readTimeMinutes: 15,
    viewsCount: 1890,
    downloadsCount: 740,
    publishedDate: '2026-08-28',
    isPeerReviewed: true,
    citationAPA: 'الشناوي، ع. (2026). ديناميكا حزم البروتونات في مسرع LHC. مجلة الفيزياء الحديثة، 8(3)، 112-135.',
    keyFindings: [
      'نمذجة مسارات حزم الجسيمات داخل مغناطيسات الانحناء ثنائية القطب',
      'حساب مقطع التصادم الفعال لإنتاج بوزونات W و Z بدقة غير مسبوقة',
      'تطوير برمجية محاكاة بصرية لتصادمات الجسيمات مدمجة في المناهج'
    ],
    simulationUrl: '/lhc-simulation',
    simulationName: 'محاكاة تصادم الجسيمات LHC 3D'
  },
  {
    id: 'paper-chem-1',
    title: 'حركية التفاعلات التحفيزية وتأثير الجسيمات النانوية على طاقة التنشيط',
    abstract: 'يقدم هذا البحث تحليلاً معملياً دقيقاً لدور الجسيمات النانوية كعوامل مساعدة غير متجانسة في خفض طاقة التنشيط (Arrhenius Activation Energy)، مع دراسة اتزان لوشاتيليه في النظم الغازية المغلقة.',
    author: 'د. سامية نصر & باحثو الكيمياء الخضراء',
    authorRole: 'أستاذة الكيمياء الفيزيائية المشاركة',
    institution: 'قسم الكيمياء والعلوم التطبيقية',
    subject: 'chemistry',
    subjectLabel: 'الكيمياء الفيزيائية',
    category: 'الكيمياء الحركية والنانو',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/cond-mat/0501020.pdf',
    doi: '10.1021/acs.jpcc.zarwat.2026.02',
    readTimeMinutes: 10,
    viewsCount: 1250,
    downloadsCount: 460,
    publishedDate: '2026-09-02',
    isPeerReviewed: true,
    citationAPA: 'نصر، س. (2026). حركية التفاعلات التحفيزية والجسيمات النانوية. المجلة الكيميائية العربية، 19(4)، 88-109.',
    keyFindings: [
      'خفض طاقة التنشيط بنسبة 42% عند استخدام محفزات البلاتين النانوية (Pt-NPs)',
      'تسريع الوصول لحالة الاتزان الكيميائي بمقدار 5 أضعاف مقارنة بالمحفزات الكلاسيكية',
      'استقرار حراري للمحفزات النانوية حتى درجة 450 مئوية'
    ],
    simulationUrl: '/chemical-kinetics',
    simulationName: 'مختبر الكيمياء الحركية وسرعة التفاعل 3D'
  },
  {
    id: 'paper-bio-1',
    title: 'دقة استهداف كريسبر-كاس9 (CRISPR-Cas9) وتفادي الطفرات غير المستهدفة',
    abstract: 'مراجعة منهجية وتجريبية لآليات استهداف تسلسلات الحمض النووي باستخدام جزيئات gRNA المصممة حاسوبياً، وتحليل كفاءة قطع شريطي الدنا مع تقليل التأثيرات الجانبية Off-target Mutations.',
    author: 'أ. رانية خوري',
    authorRole: 'باحثة في التكنولوجيا الحيوية والوراثة',
    institution: 'مجمع الابتكار الحيوي والوراثي',
    subject: 'biology',
    subjectLabel: 'الهندسة الوراثية',
    category: 'البيوتكنولوجي والجينات',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/q-bio/0402012.pdf',
    doi: '10.1038/s41587.zarwat.bio.2026.08',
    readTimeMinutes: 14,
    viewsCount: 2100,
    downloadsCount: 890,
    publishedDate: '2026-09-10',
    isPeerReviewed: true,
    citationAPA: 'خوري، ر. (2026). دقة استهداف كريسبر-كاس9 في التعديل الجيني. مجلة العلوم الحياتية الحديثة، 11(1)، 15-40.',
    keyFindings: [
      'تحقيق دقة استهداف جيني بلغت 98.7% باستخدام تسلسلات gRNA محسنة بخوارزميات AI',
      'انخفاض الطفرات غير المستهدفة (Off-target) إلى أقل من 0.3%',
      'تطبيق ناجح لتعطيل الجينات المسببة للأمراض النباتية المقاومة للمبيدات'
    ],
    simulationUrl: '/crispr-gene-editing',
    simulationName: 'المختبر ثلاثي الأبعاد لتعديل الجينات كريسبر'
  },
  {
    id: 'paper-rob-1',
    title: 'الملاحة الذاتية للروبوتات المتنقلة (AMR) باستخدام خوارزميات SLAM ورادار 360° LiDAR',
    abstract: 'تصميم وبناء نظام ملاحة ذاتية لروبوت متنقل يعتمد على دمج بيانات مستشعرات الليدار ووحدات القصور الذاتي (IMU)، وتنفيذ خوارزمية رسم الخرائط المتزامنة والتموضع (SLAM) ونظام ROS 2.',
    author: 'م. حسام القاسم & فريق الروبوتات',
    authorRole: 'كبير مهندسي الميكاترونكس والذكاء الاصطناعي',
    institution: 'أكاديمية الروبوتات والذكاء الاصطناعي',
    subject: 'robotics',
    subjectLabel: 'الروبوتات والذكاء',
    category: 'الملاحة الذاتية والأنظمة المدمجة',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/cs.RO/0602014.pdf',
    doi: '10.1109/TRO.zarwat.rob.2026.05',
    readTimeMinutes: 16,
    viewsCount: 2450,
    downloadsCount: 1040,
    publishedDate: '2026-09-20',
    isPeerReviewed: true,
    citationAPA: 'القاسم، ح. (2026). الملاحة الذاتية للروبوتات باستخدام SLAM وليدار. مجلة الأنظمة الذكية والأتمتة، 22(3)، 200-225.',
    keyFindings: [
      'بناء خريطة بيئية ثنائية وثلاثية الأبعاد بدقة خطأ موضعية تقل عن 2 سم',
      'زمن استجابة لتفادي العقبات الديناميكية يقل عن 45 ميلي ثانية',
      'تكامل كامل مع محاكي الكود والمتاهة المدمج في منصة ذروة العلم'
    ],
    simulationUrl: '/robotics',
    simulationName: 'حلبة تحدي الروبوتات ومعمل Wokwi'
  },
  {
    id: 'paper-math-1',
    title: 'النماذج التفاضلية للتنبؤ الديناميكي وخوارزميات التشفير ما بعد الكمي',
    abstract: 'استكشاف النظم الديناميكية غير الخطية ومعادلات التفاضل الجزئية ذات الشروط الحدية، مع تقديم نموذج تشفير مبني على الشبيكات الفراغية (Lattice-based Cryptography) المقاومة للهجمات الكمية.',
    author: 'أ. طارق عبد الرحمن',
    authorRole: 'باحث في الرياضيات التطبيقية والتشفير',
    institution: 'مركز أبحاث الرياضيات المتقدمة',
    subject: 'mathematics',
    subjectLabel: 'الرياضيات التطبيقية',
    category: 'التشفير والتحليل الرياضي',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/math/0401018.pdf',
    doi: '10.1007/s00145.zarwat.math.2026.11',
    readTimeMinutes: 11,
    viewsCount: 1180,
    downloadsCount: 390,
    publishedDate: '2026-08-15',
    isPeerReviewed: true,
    citationAPA: 'عبد الرحمن، ط. (2026). النماذج التفاضلية والتشفير ما بعد الكمي. مجلة الرياضيات البحتة والتطبيقية، 30(2)، 75-99.',
    keyFindings: [
      'تطوير خوارزمية تشفير تعتمد على مشكلة أقصر متجه في الشبيكات (SVP)',
      'مقاومة كاملة لخوارزمية شور الكمية (Shor\'s Algorithm)',
      'كفاءة تنفيذ حسابية تتفوق بـ 28% على معايير RSA الكلاسيكية'
    ]
  },
  {
    id: 'paper-arabic-1',
    title: 'الدلالات الفيزيائية والفلكية في نصوص الإعجاز العلمي واللغة العربية',
    abstract: 'دراسة لغوية وفلكية مقارنة للألفاظ والمصطلحات الدقيقة المعبرة عن حركة الأجرام السماوية، الانفجار العظيم، وتمدد الكون في المصادر التراثية والمعاجم العلمية المعتمدة.',
    author: 'أ. محمود بني عيسى & د. أحمد الرواشدة',
    authorRole: 'باحث في الدراسات اللغوية والإعجاز العلمي',
    institution: 'معهد الدراسات اللغوية والكونية',
    subject: 'arabic',
    subjectLabel: 'اللغة والإعجاز العلمي',
    category: 'الفلك واللغويات',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1016/j.lingua.zarwat.2026.07',
    readTimeMinutes: 13,
    viewsCount: 1650,
    downloadsCount: 610,
    publishedDate: '2026-07-20',
    isPeerReviewed: true,
    citationAPA: 'بني عيسى، م.، والرواشدة، أ. (2026). الدلالات الفيزيائية والفلكية في الإعجاز العلمي. مجلة البحوث اللغوية، 16(2)، 140-168.',
    keyFindings: [
      'توثيق أكثر من 40 مصطلحاً فلكياً لغوياً يتطابق بدقة مع النظريات الكونية الحديثة',
      'تبيان الدقة البلاغية في وصف انحناء الفضاء والزمكان',
      'إعداد معجم رقمي موحد للمصطلحات الفيزيائية باللغة العربية'
    ]
  }
];
