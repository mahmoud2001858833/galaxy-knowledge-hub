export type PublicationType = 'research-paper' | 'magazine-article' | 'special-report';
export type ResearchSubject = 'physics' | 'chemistry' | 'biology' | 'mathematics' | 'robotics' | 'arabic' | 'space' | 'energy';

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  author: string;
  authorRole: string;
  institution: string;
  subject: ResearchSubject;
  subjectLabel: string;
  category: string;
  coverImage: string;
  pdfUrl?: string;
  doi: string;
  readTimeMinutes: number;
  viewsCount: number;
  downloadsCount: number;
  citationsCount: number;
  publishedDate: string;
  isPeerReviewed: boolean;
  publicationType: PublicationType;
  publicationTypeLabel: string;
  magazineIssue?: string;
  editorPick?: boolean;
  citationAPA: string;
  citationMLA?: string;
  citationBibTeX?: string;
  keyFindings: string[];
  methodology?: string;
  simulationUrl?: string;
  simulationName?: string;
}

export const CURATED_RESEARCH_PAPERS: ResearchPaper[] = [
  // --- الأبحاث الأكاديمية المحكمة (Peer-Reviewed Academic Research Papers) ---
  {
    id: 'paper-phys-1',
    title: 'تطبيقات التراكب الكمي في حوسبة الكيوبت ونمذجة دالة شرودنغر الموجية',
    abstract: 'تبحث هذه الورقة في الخصائص الديناميكية لتراكب الحالات الكمية في الأنظمة ثنائية المستوى، مع تحليل رياضي لمعادلة شرودنغر المعتمدة على الزمن، وتطبيقاتها في خوارزميات التشفير الكمي ومحاكاة المادة المكثفة في الحواسيب الفائقة.',
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
    viewsCount: 2420,
    downloadsCount: 820,
    citationsCount: 28,
    publishedDate: '2026-09-15',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    editorPick: true,
    methodology: 'نمذجة عددية وحسابية باستخدام بايثون ومكتبات Qiskit ومحاكاة هاملتونيان الأنظمة المفتوحة.',
    citationAPA: 'بني عيسى، ي. (2026). تطبيقات التراكب الكمي في حوسبة الكيوبت. مجلة ذروة العلم للأبحاث الفيزيائية، 14(2)، 45-68.',
    citationMLA: 'بني عيسى، يوسف. "تطبيقات التراكب الكمي في حوسبة الكيوبت." مجلة ذروة العلم، المجلد 14، العدد 2، 2026، ص 45-68.',
    citationBibTeX: '@article{baniyaseen2026quantum,\n  title={Quantum Superposition in Qubit Computing},\n  author={Bani Issa, Yousef},\n  journal={Zarwat Science Journal},\n  year={2026}\n}',
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
    viewsCount: 2890,
    downloadsCount: 1140,
    citationsCount: 34,
    publishedDate: '2026-08-28',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    methodology: 'تحليل بيانات الكواشف ATLAS و CMS ونمذجة تفكك الجسيمات بواسطة حزم البرمجيات المعيارية لـ CERN.',
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
    viewsCount: 1950,
    downloadsCount: 760,
    citationsCount: 19,
    publishedDate: '2026-09-02',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    methodology: 'تحليل طيفي بالأشعة فوق البنفسجية UV-Vis وتطبيق معادلة أرهينيوس الحركية لدراسة سرعات التفاعل.',
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
    viewsCount: 3100,
    downloadsCount: 1290,
    citationsCount: 42,
    publishedDate: '2026-09-10',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    editorPick: true,
    methodology: 'تحليل تسلسل الجينوم الكامل (NGS) ومطابقة الخوارزميات الحيوية للكشف عن الطفرات العشوائية.',
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
    viewsCount: 2950,
    downloadsCount: 1340,
    citationsCount: 31,
    publishedDate: '2026-09-20',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    methodology: 'برمجة C++ على نظام ROS 2 مع محاكاة Gazebo واختبار حقلي على مسار عقبات ديناميكي 50 متراً.',
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
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    pdfUrl: 'https://arxiv.org/pdf/math/0401018.pdf',
    doi: '10.1007/s00145.zarwat.math.2026.11',
    readTimeMinutes: 11,
    viewsCount: 1680,
    downloadsCount: 590,
    citationsCount: 14,
    publishedDate: '2026-08-15',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    methodology: 'تحليل جبري هندسي لمشكلة أقصر متجه (SVP) واختبارات مقاومة الاختراق الكمي بحزم Mathematica.',
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
    viewsCount: 2150,
    downloadsCount: 810,
    citationsCount: 22,
    publishedDate: '2026-07-20',
    isPeerReviewed: true,
    publicationType: 'research-paper',
    publicationTypeLabel: 'ورقة بحثية محكمة',
    citationAPA: 'بني عيسى، م.، والرواشدة، أ. (2026). الدلالات الفيزيائية والفلكية في الإعجاز العلمي. مجلة البحوث اللغوية، 16(2)، 140-168.',
    keyFindings: [
      'توثيق أكثر من 40 مصطلحاً فلكياً لغوياً يتطابق بدقة مع النظريات الكونية الحديثة',
      'تبيان الدقة البلاغية في وصف انحناء الفضاء والزمكان',
      'إعداد معجم رقمي موحد للمصطلحات الفيزيائية باللغة العربية'
    ]
  },

  // --- مقالات المجلة العلمية الاستكشافية (Scientific Magazine Articles & Features) ---
  {
    id: 'mag-jwst-1',
    title: 'تلسكوب جيمس ويب وفجر الكون: كيف تعيد الصور الفضائية الأولى كتابة تاريخ المجرات؟',
    abstract: 'مقال استكشافي شامل يستعرض كيف استطاعت مرايا جيمس ويب بالأشعة تحت الحمراء اختراق الغبار الكوني، ورصد أقدم المجرات التي تشكلت بعد 300 مليون سنة فقط من الانفجار العظيم، وما يعنيه ذلك لنموذج Lambda-CDM القياسي.',
    author: 'هيئة تحرير المجلة العلمية',
    authorRole: 'محرر الشؤون الفلكية والفضائية',
    institution: 'المجلة العلمية لمنصة ذروة العلم',
    subject: 'space',
    subjectLabel: 'الفلك والكون',
    category: 'استكشاف الفضاء العميق',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1088/mag.zarwat.2026.issue14.01',
    readTimeMinutes: 8,
    viewsCount: 4210,
    downloadsCount: 1650,
    citationsCount: 18,
    publishedDate: '2026-09-22',
    isPeerReviewed: false,
    publicationType: 'magazine-article',
    publicationTypeLabel: 'مقال استكشافي بالمجلة',
    magazineIssue: 'العدد 14 - خريف 2026',
    editorPick: true,
    citationAPA: 'هيئة تحرير المجلة. (2026). تلسكوب جيمس ويب وفجر الكون. المجلة العلمية، 14(1)، 12-25.',
    keyFindings: [
      'اكتشاف مجرات ضخمة ناضجة في وقت مبكر جداً لم تكن النماذج الكونية تتوقعه',
      'تحليل الغلاف الجوي للكواكب الخارجية بحثاً عن مؤشرات حيوية (Biosignatures)',
      'توفير بيانات رصدية عالية النقاء مفتوحة لجميع الطلبة والباحثين حول العالم'
    ],
    simulationUrl: '/my-solar-system',
    simulationName: 'محاكي الجاذبية والنظام الشمسي 3D'
  },
  {
    id: 'mag-ai-protein-2',
    title: 'الذكاء الاصطناعي وتصميم البروتينات: ما بعد ثورة ألفافولد وعصر الطب الجزيئي',
    abstract: 'تحقيق علمي حول كيف غيرت خوارزميات التعلم العميق ونماذج الانتشار (Diffusion Models) قواعد الكيمياء الحيوية، بتمكين العلماء من تصميم بروتينات علاجية وإنزيمات هاضمة للبلاستيك من الصفر بدقة ذرية.',
    author: 'د. ليلى عبد الحق',
    authorRole: 'مستشارة التقنيات الحيوية والذكاء الاصطناعي',
    institution: 'المجلة العلمية - قسم الابتكار المعاصر',
    subject: 'biology',
    subjectLabel: 'الذكاء الاصطناعي الحيوي',
    category: 'الطب الجزيئي والبيوتك',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1088/mag.zarwat.2026.issue14.02',
    readTimeMinutes: 7,
    viewsCount: 3670,
    downloadsCount: 1420,
    citationsCount: 15,
    publishedDate: '2026-09-18',
    isPeerReviewed: false,
    publicationType: 'magazine-article',
    publicationTypeLabel: 'مقال استكشافي بالمجلة',
    magazineIssue: 'العدد 14 - خريف 2026',
    editorPick: true,
    citationAPA: 'عبد الحق، ل. (2026). الذكاء الاصطناعي وتصميم البروتينات. المجلة العلمية، 14(1)، 26-38.',
    keyFindings: [
      'توقع التراكيب ثلاثية الأبعاد لأكثر من 200 مليون بروتين في دقائق معدودة',
      'تصميم أجسام مضادة نوعية لمكافحة الفيروسات التاجية المتحورة',
      'تسريع مراحل اكتشاف الأدوية السريرية من 5 سنوات إلى عدة أشهر'
    ],
    simulationUrl: '/crispr-gene-editing',
    simulationName: 'المختبر ثلاثي الأبعاد لتعديل الجينات كريسبر'
  },
  {
    id: 'mag-fusion-3',
    title: 'مفاعلات الاندماج النووي (Tokamak): الشمس الاصطناعية على وشك الإضاءة الكاملة',
    abstract: 'تقرير علمي مطول يستكشف سباق الطاقة النظيفة العالمي لترويض حرارة تعادل 100 مليون درجة مئوية باستخدام الحبس المغناطيسي فائق التوصيل، والاقتراب من تحقيق طاقة صافية موجبة مستدامة (Net Energy Gain).',
    author: 'م. فراس المصري',
    authorRole: 'محرر الطاقة والفيزياء التطبيقية',
    institution: 'المجلة العلمية لمنصة ذروة العلم',
    subject: 'energy',
    subjectLabel: 'طاقة المستقبل',
    category: 'الاندماج النووي والطاقة الخضراء',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1088/mag.zarwat.2026.issue13.04',
    readTimeMinutes: 9,
    viewsCount: 3890,
    downloadsCount: 1510,
    citationsCount: 12,
    publishedDate: '2026-08-30',
    isPeerReviewed: false,
    publicationType: 'magazine-article',
    publicationTypeLabel: 'مقال استكشافي بالمجلة',
    magazineIssue: 'العدد 13 - صيف 2026',
    citationAPA: 'المصري، ف. (2026). مفاعلات الاندماج النووي وطاقة المستقبل. المجلة العلمية، 13(3)، 40-55.',
    keyFindings: [
      'تحقيق معامل تضخيم طاقة Q > 1.5 في التجارب المعملية الحديثة',
      'استخدام مغناطيسات REBCO فائقة التوصيل في درجات حرارة أعلى لتصغير حجم المفاعلات',
      'انعدام النفايات المشعة طويلة الأمد مقارنة بالانشطار النووي التقليدي'
    ],
    simulationUrl: '/nuclear-physics',
    simulationName: 'محاكي الفيزياء النووية والتفاعلات 3D'
  },
  {
    id: 'mag-dark-matter-4',
    title: 'لغز المادة المظلمة والطاقة المظلمة: ما الذي يملأ 95% من فراغ هذا الكون؟',
    abstract: 'جولة فكرية ممتعة تبسط أعظم ألغاز الفيزياء الفلكية المعاصرة: لماذا تدور حواف المجرات بسرعة غير منطقية؟ وما هي طبيعة الجسيمات الضعيفة التفاعل (WIMPs) والمحاولات الحالية لاصطيادها في أعماق المناجم الأرضية.',
    author: 'د. يوسف بني عيسى',
    authorRole: 'أستاذ الفيزياء الفلكية',
    institution: 'المجلة العلمية لمنصة ذروة العلم',
    subject: 'physics',
    subjectLabel: 'الفيزياء الفلكية',
    category: 'ألغاز الكون المعاصر',
    coverImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1088/mag.zarwat.2026.issue13.06',
    readTimeMinutes: 10,
    viewsCount: 4500,
    downloadsCount: 1890,
    citationsCount: 20,
    publishedDate: '2026-08-14',
    isPeerReviewed: false,
    publicationType: 'magazine-article',
    publicationTypeLabel: 'مقال استكشافي بالمجلة',
    magazineIssue: 'العدد 13 - صيف 2026',
    editorPick: true,
    citationAPA: 'بني عيسى، ي. (2026). لغز المادة المظلمة والطاقة المظلمة. المجلة العلمية، 13(3)، 56-72.',
    keyFindings: [
      'تفسير منحنيات دوران المجرات وتأثير عدسات الجاذبية القوية',
      'مقارنة نظرية MOND لتعديل الجاذبية النيوتونية مع نموذج المادة المظلمة الباردة',
      'استعراض تجارب كواشف الزينون السائل (XENONnT) في مختبر غران ساسو'
    ],
    simulationUrl: '/black-hole',
    simulationName: 'محاكي الثقوب السوداء وانحناء الضوء 3D'
  },
  {
    id: 'mag-neuro-chips-5',
    title: 'الحوسبة العصبية والرقائق النيورومورفية: محاكاة نقاط تشابك الدماغ في السيليكون',
    abstract: 'استعراض معماري وهندسي للأجيال الجديدة من المعالجات التي تقتبس طريقة عمل الخلايا العصبية البيولوجية، لمعالجة خوارزميات الذكاء الاصطناعي باستهلاك طاقة يقل بـ 1000 مرة عن بطاقات الرسوميات التقليدية.',
    author: 'م. حسام القاسم',
    authorRole: 'خبير الروبوتات والأنظمة العصبية',
    institution: 'أكاديمية الروبوتات والأنظمة الذكية',
    subject: 'robotics',
    subjectLabel: 'الأنظمة الذكية',
    category: 'المعالجات والذكاء الحسابي',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    doi: '10.1088/mag.zarwat.2026.issue12.02',
    readTimeMinutes: 8,
    viewsCount: 3120,
    downloadsCount: 1180,
    citationsCount: 11,
    publishedDate: '2026-07-28',
    isPeerReviewed: false,
    publicationType: 'magazine-article',
    publicationTypeLabel: 'مقال استكشافي بالمجلة',
    magazineIssue: 'العدد 12 - ربيع 2026',
    citationAPA: 'القاسم، ح. (2026). الحوسبة العصبية والرقائق النيورومورفية. المجلة العلمية، 12(2)، 15-32.',
    keyFindings: [
      'الاعتماد على إشارات النبضات العصبية (Spiking Neural Networks) بدل الحوسبة الثنائية',
      'تطوير ذاكرات الممرستور (Memristors) التي تخزن وتعالج البيانات في آن واحد',
      'تطبيقات رائدة في الروبوتات الطبية والأطراف الصناعية الذكية'
    ],
    simulationUrl: '/robotics',
    simulationName: 'معمل Wokwi الافتراضي للروبوتات'
  }
];
