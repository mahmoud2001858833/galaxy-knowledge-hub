/**
 * Official 49 Scientific Simulations Catalog & Semantic Matcher
 * Maps educational concepts to exact verified platform simulation routes.
 */

export interface SimulationRecord {
  id: string;
  title: string;
  englishSlug: string;
  link: string;
  discipline: 'فيزياء' | 'كيمياء' | 'أحياء' | 'فلك' | 'رياضيات' | 'روبوتات' | 'تربية خاصة';
  engine: 'Three.js 3D' | 'WebGL 3D' | 'Canvas 2D' | 'Ray Tracing' | 'Interactive Engine';
  status: 'جاهز 100%' | 'معتمد علمياً';
  keywords: string[];
  description: string;
}

export const ALL_49_SIMULATIONS: SimulationRecord[] = [
  { 
    id: 'sim-1', 
    title: 'ميكانيكا الكم والدالة الموجية', 
    englishSlug: 'quantum-mechanics', 
    link: '/simulation/quantum-mechanics', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['كم', 'دالة موجية', 'شرودنجر', 'احتمالية', 'تراكب', 'كمومية', 'quantum'],
    description: 'استكشاف الدالة الموجية واحتمالية تواجد الجسيمات ومبدأ الشك لهايزنبرغ.'
  },
  { 
    id: 'sim-2', 
    title: 'مسرع الهادرونات الكبير (LHC)', 
    englishSlug: 'lhc-simulation', 
    link: '/lhc-simulation', 
    discipline: 'فيزياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['هادرونات', 'تصادم', 'بوزون هيجز', 'جسيمات أولية', 'سرعة الضوء', 'lhc'],
    description: 'محاكاة تسريع البروتونات إلى سرعات تقارب الضوء ورصد حطام التصادم الجسيمي.'
  },
  { 
    id: 'sim-3', 
    title: 'تعديل الجينات كريسبر (CRISPR)', 
    englishSlug: 'crispr-gene-editing', 
    link: '/simulation/crispr-gene-editing', 
    discipline: 'أحياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['جينات', 'كريسبر', 'تعديل جيني', 'dna', 'حمض نووي', 'قطع محدد', 'crispr'],
    description: 'تطبيق هندسة الجينات وقص وتعديل تسلسلات الحمض النووي بدقة جزيئية.'
  },
  { 
    id: 'sim-4', 
    title: 'محاكاة الثقوب السوداء وأفق الحدث', 
    englishSlug: 'black-hole', 
    link: '/black-hole', 
    discipline: 'فلك', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['ثقب أسود', 'أفق الحدث', 'نسبية عامة', 'زمكان', 'انحناء الضوء', 'جاذبية عظمى', 'black hole'],
    description: 'رصد تشوه الزمكان وانحناء الضوء حول أفق الحدث لثقب أسود دوار.'
  },
  { 
    id: 'sim-5', 
    title: 'الكيمياء الحركية وسرعة التفاعل', 
    englishSlug: 'chemical-kinetics', 
    link: '/simulation/chemical-kinetics', 
    discipline: 'كيمياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['سرعة التفاعل', 'طاقة التنشيط', 'تصادم', 'عوامل مساعدة', 'تركيز', 'kinetics'],
    description: 'دراسة أثر درجة الحرارة وتركيز المواد المتفاعلة والعوامل الحفازة على سرعة التفاعل.'
  },
  { 
    id: 'sim-6', 
    title: 'بناء الذرة والجسيمات دون الذرية', 
    englishSlug: 'build-atom', 
    link: '/simulation/build-atom', 
    discipline: 'كيمياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['ذرة', 'بروتون', 'نيوترون', 'إلكترون', 'عدد ذري', 'كتلي', 'نظائر', 'atom'],
    description: 'تركيب عناصر الجدول الدوري بإضافة البروتونات والنيوترونات والإلكترونات ومراقبة الشحنة.'
  },
  { 
    id: 'sim-7', 
    title: 'مختبر الدوائر الكهربائية الرقمية', 
    englishSlug: 'circuit-builder', 
    link: '/simulation/circuit-builder', 
    discipline: 'فيزياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['دارة', 'دائرة', 'تيار', 'مقاومة', 'أوم', 'بطارية', 'فولتميتر', 'أمبير'],
    description: 'بناء دوائر التوالي والتوازي وقياس فرق الجهد وشدة التيار ومقاومة الموصلات.'
  },
  { 
    id: 'sim-8', 
    title: 'مختبر الدوائر المستمرة DC المتقدم', 
    englishSlug: 'circuit-construction-kit-dc', 
    link: '/simulation/circuit-construction-kit-dc', 
    discipline: 'فيزياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['كيرشوف', 'تيار مستمر', 'قدرة كهربائية', 'مكثف', 'محث', 'dc circuit'],
    description: 'تطبيق قاعدتي كيرشوف للجهد والتيار في الدوائر الكهربائية المعقدة.'
  },
  { 
    id: 'sim-9', 
    title: 'مشروع دامج: مترجم برايل ولغة الإشارة', 
    englishSlug: 'damij', 
    link: '/damij', 
    discipline: 'تربية خاصة', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['دامج', 'إشارة', 'برايل', 'تربية خاصة', 'صم', 'مكفوفين'],
    description: 'أدوات الوصول الشامل وترجمة لغة الإشارة والنصوص إلى برايل للمكفوفين.'
  },
  { 
    id: 'sim-10', 
    title: 'نفق الرياح والديناميكا الهوائية', 
    englishSlug: 'aerodynamics-wind-tunnel', 
    link: '/simulation/aerodynamics-wind-tunnel', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['رياح', 'ديناميكا هوائية', 'رفع', 'إعاقة', 'برنولي', 'طيران'],
    description: 'اختبار قوى الرفع والسحب على أجنحة الطائرات والأشكال الانسيابية.'
  },
  { 
    id: 'sim-11', 
    title: 'حركة المقذوفات الكلاسيكية والنسبية', 
    englishSlug: 'projectile-motion', 
    link: '/simulation/projectile-motion', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['مقذوفات', 'زاوية', 'مدى أفقي', 'أقصى ارتفاع', 'سرعة ابتدائية', 'سقوط حر', 'projectile'],
    description: 'إطلاق المقذوفات بزوايا وسرعات مختلفة ودراسة المركبتين الأفقية والعمودية.'
  },
  { 
    id: 'sim-12', 
    title: 'النظام الشمسي والمدارات ثلاثية الأبعاد', 
    englishSlug: 'solar-system-3d', 
    link: '/simulation/solar-system-3d', 
    discipline: 'فلك', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['نظام شمسي', 'كواكب', 'مدارات', 'كبلر', 'جاذبية', 'شمس', 'solar system'],
    description: 'محاكاة مدارات الكواكب حول الشمس وتطبيق قوانين كبلر في الجاذبية الكونية.'
  },
  { 
    id: 'sim-13', 
    title: 'إشعاع الجسم الأسود وتوزيع بلانك', 
    englishSlug: 'blackbody-radiation', 
    link: '/simulation/blackbody-radiation', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['جسم أسود', 'بلانك', 'فين', 'طيف', 'حرارة', 'إشعاع', 'blackbody'],
    description: 'تفسير منحنى توزيع الطاقة الإشعاعية كدالة في الطول الموجي ودرجة الحرارة.'
  },
  { 
    id: 'sim-14', 
    title: 'مختبر البصريات وانكسار الضوء', 
    englishSlug: 'optics-lab', 
    link: '/simulation/optics-lab', 
    discipline: 'فيزياء', 
    engine: 'Ray Tracing', 
    status: 'جاهز 100%',
    keywords: ['بصريات', 'عدسات', 'مرايا', 'بؤرة', 'تكبير', 'خيال', 'optics'],
    description: 'تكون الأخيلة في العدسات المحدبة والمقعرة والمرايا وحساب البعد البؤري.'
  },
  { 
    id: 'sim-15', 
    title: 'انحناء الضوء وقانون سنيل', 
    englishSlug: 'bending-light', 
    link: '/simulation/bending-light', 
    discipline: 'فيزياء', 
    engine: 'Ray Tracing', 
    status: 'جاهز 100%',
    keywords: ['انكسار', 'سنيل', 'معامل انكسار', 'انعكاس كلي', 'زاوية حرجة', 'ضوء', 'snell'],
    description: 'انتقال حزمة الضوء بين أوساط مادية مختلفة وحساب زاوية الانكسار والانعكاس الكلي الداخلي.'
  },
  { 
    id: 'sim-16', 
    title: 'تجربة فاراداي والمحث الكهرومغناطيسي', 
    englishSlug: 'faradays-electromagnetic-lab', 
    link: '/simulation/faradays-electromagnetic-lab', 
    discipline: 'فيزياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['فاراداي', 'حث', 'لينز', 'مغناطيس', 'ملف', 'تدفق', 'قوة دافعة حثية', 'faraday'],
    description: 'توليد التيار الكهربائي الحثي بتحريك المغناطيس داخل الملف وتطبيق قانون لينز.'
  },
  { 
    id: 'sim-17', 
    title: 'مختبر البندول البسيط والتوافقي', 
    englishSlug: 'pendulum-lab', 
    link: '/simulation/pendulum-lab', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['بندول', 'حركة توافقية', 'زمن دوري', 'تردد', 'طاقة وضع', 'pendulum'],
    description: 'علاقة طول الخيط وتسارع الجاذبية بالزمن الدوري للبندول البسيط وحفظ الطاقة الميكانيكية.'
  },
  { 
    id: 'sim-18', 
    title: 'تداخل وحيود الموجات الصوتية والضوئية', 
    englishSlug: 'wave-interference', 
    link: '/simulation/wave-interference', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['تداخل', 'حيود', 'موجات', 'شق مزدوج', 'تراكب', 'يونغ', 'wave interference'],
    description: 'هدب التداخل البناء والهدام لشق يونغ المزدوج وحيود موجات الماء والصوت والضوء.'
  },
  { 
    id: 'sim-19', 
    title: 'الانتخاب الطبيعي والتطور الوراثي', 
    englishSlug: 'natural-selection', 
    link: '/simulation/natural-selection', 
    discipline: 'أحياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['انتخاب طبيعي', 'تطور', 'طفرات', 'بقاء', 'تكيف', 'وراثة'],
    description: 'محاكاة أثر الحيوانات المفترسة والمناخ والغذاء على السيادة الوراثية وتكاثر الكائنات.'
  },
  { 
    id: 'sim-20', 
    title: 'قانون هوك والمرونة الديناميكية', 
    englishSlug: 'hookes-law', 
    link: '/simulation/hookes-law', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['هوك', 'نابض', 'مرونة', 'ثابت النابض', 'استطالة', 'قوة الإرجاع', 'hooke'],
    description: 'العلاقة الخطية بين القوة المؤثرة واستطالة النابض وحساب ثابت الصلابة k.'
  },
  { 
    id: 'sim-21', 
    title: 'مقياس الرقم الهيدروجيني والأحماض (pH)', 
    englishSlug: 'ph-scale', 
    link: '/simulation/ph-scale', 
    discipline: 'كيمياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['حمض', 'قاعدة', 'رقم هيدروجيني', 'ph', 'تأين', 'تخفيف', 'هيدرونيوم', 'هيدروكسيد'],
    description: 'قياس الـ pH لمحاليل متنوعة وملاحظة أثر التخفيف بالماء وتراكيز أيونات H3O+ و OH-.'
  },
  { 
    id: 'sim-22', 
    title: 'الكهرباء الساكنة والشحنات النقطية', 
    englishSlug: 'balloons-and-static-electricity', 
    link: '/simulation/balloons-and-static-electricity', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['كهرباء ساكنة', 'كولوم', 'شحنات', 'تجاذب', 'تنافر', 'دلك', 'تأثير'],
    description: 'انتقال الإلكترونات بالدلك وشحن الأجسام والتجاذب والتنافر الكهروستاتيكي.'
  },
  { 
    id: 'sim-23', 
    title: 'حديقة طاقة التزلج وحفظ الطاقة', 
    englishSlug: 'energy-skate-park', 
    link: '/simulation/energy-skate-park', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['طاقة حركية', 'طاقة وضع', 'حفظ الطاقة', 'احتكاك', 'تزلج', 'مسار'],
    description: 'التحول المستمر بين طاقة الحركة وطاقة الوضع في مسارات التزلج مع الاحتكاك أو بدونه.'
  },
  { 
    id: 'sim-24', 
    title: 'نماذج ذرة الهيدروجين وبور الكمي', 
    englishSlug: 'models-of-the-hydrogen-atom', 
    link: '/simulation/models-of-the-hydrogen-atom', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['بور', 'هيدروجين', 'مستويات طاقة', 'فوتون', 'طيف انبعاث', 'امتصاص'],
    description: 'مقارنة نماذج طومسون ورذرفورد وبور ودي برولي في تفسير طيف انبعاث الهيدروجين.'
  },
  { 
    id: 'sim-25', 
    title: 'بناء النواة والاستقرار الإشعاعي', 
    englishSlug: 'build-a-nucleus', 
    link: '/simulation/build-a-nucleus', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['نواة', 'استقرار نووي', 'طاقة ربط', 'اضمحلال', 'ألفا', 'بيتا', 'جاما'],
    description: 'تجميع البروتونات والنيوترونات في النواة واكتشاف حزام الاستقرار وظواهر النشاط الإشعاعي.'
  },
  { 
    id: 'sim-26', 
    title: 'النقل عبر الغشاء البلازمي والخاصية الأسموزية', 
    englishSlug: 'membrane-transport', 
    link: '/simulation/membrane-transport', 
    discipline: 'أحياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['غشاء بلازمي', 'أسموزية', 'انتشار', 'نقل نشط', 'قنوات بروتينية'],
    description: 'مرور الجزيئات والأيونات عبر الغشاء الخلوي بالانتشار البسيط والميسر والنقل النشط.'
  },
  { 
    id: 'sim-27', 
    title: 'الخلية الحية وعضياتها المجهرية', 
    englishSlug: 'living-cell', 
    link: '/simulation/living-cell', 
    discipline: 'أحياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['خلية', 'ميتوكندريا', 'نواة', 'ريبوسوم', 'عضيات', 'خلية نباتية', 'حيوانية'],
    description: 'جولة ثلاثية الأبعاد تفاعلية داخل الخلية الحيوانية والنباتية وفحص وظيفة كل عضية.'
  },
  { 
    id: 'sim-28', 
    title: 'انقسام الخلية المتساوي والمنصف', 
    englishSlug: 'cell-division', 
    link: '/simulation/cell-division', 
    discipline: 'أحياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['انقسام متساوي', 'انقسام منصف', 'كروموسومات', 'عبور وراثي', 'أطوار'],
    description: 'أطوار الانقسام الخلوي (تمهيدي، استوائي، انفصالي، نهائي) وحدوث العبور الجيني.'
  },
  { 
    id: 'sim-29', 
    title: 'البناء الضوئي والتنفس الخلوي', 
    englishSlug: 'photosynthesis-respiration', 
    link: '/simulation/photosynthesis-respiration', 
    discipline: 'أحياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['بناء ضوئي', 'تنفس خلوي', 'atp', 'كلوروفيل', 'كالفن', 'غلوكوز'],
    description: 'تفاعلات الضوء والظلام في البلاستيدات وإنتاج الطاقة ATP في الميتوكندريا.'
  },
  { 
    id: 'sim-30', 
    title: 'جهاز المناعة وخطوط الدفاع البيولوجية', 
    englishSlug: 'immune-system', 
    link: '/simulation/immune-system', 
    discipline: 'أحياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['مناعة', 'أجسام مضادة', 'بلعمة', 'خلايا تائية', 'بائية', 'فيروس', 'لقاح'],
    description: 'استجابة خلايا الدم البيضاء ومقاومة مسببات الأمراض وإنتاج الأجسام المضادة النوعية.'
  },
  { 
    id: 'sim-31', 
    title: 'الكيمياء الكهربائية وخلايا غلفاني', 
    englishSlug: 'electrochemistry', 
    link: '/simulation/electrochemistry', 
    discipline: 'كيمياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['كيمياء كهربائية', 'غلفانية', 'تأكسد', 'اختزال', 'مصعد', 'مهبط', 'جهد الخلية'],
    description: 'توليد التيار من تفاعلات التأكسد والاختزال التلقائية وحساب جهد الخلية المعياري E°.'
  },
  { 
    id: 'sim-32', 
    title: 'الكيمياء التحليلية والمعايرة الحجمية', 
    englishSlug: 'analytical-chemistry', 
    link: '/simulation/analytical-chemistry', 
    discipline: 'كيمياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['معايرة', 'نقطة التكافؤ', 'دليل', 'سحاحة', 'تركيز مجهول', 'تحليل حجمي'],
    description: 'تنفيذ تجربة المعايرة قطرة بقطرة وتحديد نقطة انتهاء التفاعل وحساب المولارية.'
  },
  { 
    id: 'sim-33', 
    title: 'الكيمياء العضوية والروابط ثلاثية الأبعاد', 
    englishSlug: 'organic-chemistry', 
    link: '/simulation/organic-chemistry', 
    discipline: 'كيمياء', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['كيمياء عضوية', 'ألكان', 'ألكين', 'كحول', 'هاليدات', 'متزامرات', 'تهجين'],
    description: 'بناء وتدوير المركبات الهيدروكربونية والمجموعات الوظيفية بالنماذج المجسمة 3D.'
  },
  { 
    id: 'sim-34', 
    title: 'حالات المادة والتحولات الطورية', 
    englishSlug: 'states-of-matter', 
    link: '/simulation/states-of-matter', 
    discipline: 'كيمياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['حالات المادة', 'غاز', 'سائل', 'صلب', 'ضغط', 'حرارة', 'انصهار', 'تبخر'],
    description: 'حركة الجزيئات والترابط بينها عند التسخين والتبريد وتغير الحجم والضغط.'
  },
  { 
    id: 'sim-35', 
    title: 'الديناميكا الحرارية ودورة كارنو', 
    englishSlug: 'thermodynamics', 
    link: '/simulation/thermodynamics', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['ديناميكا حرارية', 'كارنو', 'كفاءة حرارية', 'إنتروبي', 'شغل', 'حرارة'],
    description: 'محركات الاحتراق والدورات الحرارية ونظرية كارنو في الكفاءة القصوى.'
  },
  { 
    id: 'sim-36', 
    title: 'ميكانيكا الموائع ومعادلة برنولي', 
    englishSlug: 'fluid-mechanics', 
    link: '/simulation/fluid-mechanics', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['موائع', 'برنولي', 'معادلة الاستمرارية', 'ضغط السائل', 'تدفق', 'فينتوري'],
    description: 'انخفاض ضغط المائع عند زيادة سرعته وتطبيقات أنبوب فينتوري ومقاييس التدفق.'
  },
  { 
    id: 'sim-37', 
    title: 'الحركة الدائرية وقوة الجذب المركزي', 
    englishSlug: 'circular-motion', 
    link: '/simulation/circular-motion', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['حركة دائرية', 'تسارع مركزي', 'قوة مركزية', 'سرعة مماسية', 'احتكاك منعطفات'],
    description: 'العوامل المحددة للقوة المركزية وسرعة الأجسام على المسارات الدائرية والمنعطفات المائلة.'
  },
  { 
    id: 'sim-38', 
    title: 'النسبية الخاصة وتمدد الزمن', 
    englishSlug: 'special-relativity', 
    link: '/simulation/special-relativity', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['نسبية', 'تمدد الزمن', 'انكماش الطول', 'آينشتاين', 'لورنتز', 'تكافؤ الكتلة'],
    description: 'تغير إدراك الزمن والمسافة والكتلة للمراقبين في أطر الإسناد القصورية المختلفة.'
  },
  { 
    id: 'sim-39', 
    title: 'التأثير الكهروضوئي وآينشتاين', 
    englishSlug: 'photoelectric-effect', 
    link: '/simulation/photoelectric-effect', 
    discipline: 'فيزياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['كهروضوئي', 'فوتون', 'تردد العتبة', 'دالة الشغل', 'جهد القطع', 'إلكترونات ضوئية'],
    description: 'تحرير الإلكترونات من سطوح الفلزات عند سقوط فوتونات بتردد يفوق تردد العتبة.'
  },
  { 
    id: 'sim-40', 
    title: 'تجربة قطرة زيت ميليكان والشحنة', 
    englishSlug: 'millikan-oil-drop', 
    link: '/simulation/millikan-oil-drop', 
    discipline: 'فيزياء', 
    engine: 'Interactive Engine', 
    status: 'جاهز 100%',
    keywords: ['ميليكان', 'شحنة الإلكترون', 'قطرة زيت', 'تكميم الشحنة', 'مجال كهربائي متجانس'],
    description: 'موازنة قوة الجاذبية مع القوة الكهربائية لقطرة زيت مشحونة وقياس شحنة الإلكترون e.'
  },
  { 
    id: 'sim-41', 
    title: 'تجربة رذرفورد وتشتت ألفا', 
    englishSlug: 'rutherford-scattering', 
    link: '/simulation/rutherford-scattering', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['رذرفورد', 'صفيحة الذهب', 'جسيمات ألفا', 'تشتت', 'اكتشاف النواة'],
    description: 'إطلاق جسيمات ألفا نحو صفيحة ذهب رقيقة وملاحظة ارتداد بعضها مما يثبت وجود نواة مركزية كثيفة.'
  },
  { 
    id: 'sim-42', 
    title: 'الاتزان الكيميائي ومبدأ لوشاتيليه', 
    englishSlug: 'chemical-equilibrium', 
    link: '/simulation/chemical-equilibrium', 
    discipline: 'كيمياء', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['اتزان', 'لوشاتيليه', 'ثابت الاتزان', 'kc', 'إزاحة', 'تفاعل عكوس'],
    description: 'اختبار تغير الضغط والتركيز والحرارة على توازن التفاعلات الكيميائية وثابت الاتزان.'
  },
  { 
    id: 'sim-43', 
    title: 'حيود الأشعة السينية وبنية البلورات', 
    englishSlug: 'xray-diffraction', 
    link: '/simulation/xray-diffraction', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['أشعة سينية', 'حيود براغ', 'بلورات', 'شبيكة بلورية', 'طول موجي'],
    description: 'تطبيق قانون براغ لحيود الأشعة السينية في استنتاج المسافات بين المستويات الذرية.'
  },
  { 
    id: 'sim-44', 
    title: 'الموصلية الفائقة وظاهرة مايسنر', 
    englishSlug: 'superconductivity', 
    link: '/simulation/superconductivity', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['موصلية فائقة', 'مايسنر', 'طفو مغناطيسي', 'مقاومة صفرية', 'حرارة حرجة'],
    description: 'انعدام المقاومة الكهربائية وطرد خطوط المجال المغناطيسي تماماً عند تبريد الموصل الفائق.'
  },
  { 
    id: 'sim-45', 
    title: 'الميكانيكا المدارية ومناورات الفضاء', 
    englishSlug: 'orbital-mechanics', 
    link: '/simulation/orbital-mechanics', 
    discipline: 'فلك', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['ميكانيكا مدارية', 'مناورة هومان', 'سرعة إفلات', 'قمر صناعي', 'جاذبية مركزية'],
    description: 'تخطيط مسارات الرحلات الفضائية ومناورات الانتقال بين المدارات وسرعة الهروب.'
  },
  { 
    id: 'sim-46', 
    title: 'القياس والتراكب في فيزياء الكم', 
    englishSlug: 'quantum-measurement', 
    link: '/simulation/quantum-measurement', 
    discipline: 'فيزياء', 
    engine: 'WebGL 3D', 
    status: 'جاهز 100%',
    keywords: ['تراكب', 'كيوبت', 'قياس كمي', 'انهيار الدالة', 'قطة شرودنجر'],
    description: 'تجربة الاستقطاب الضوئي وانهيار حالة التراكب الكمي عند إجراء عملية القياس.'
  },
  { 
    id: 'sim-47', 
    title: 'الروبوتات والذكاء الاصطناعي المستقل', 
    englishSlug: 'robotics', 
    link: '/simulation/robotics', 
    discipline: 'روبوتات', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['روبوت', 'أردوينو', 'حساسات', 'متحكم', 'محركات', 'ذكاء اصطناعي'],
    description: 'برمجة ذراع روبوتية وحساسات الموجات فوق الصوتية لتفادي العقبات ومسارات BTEC.'
  },
  { 
    id: 'sim-48', 
    title: 'الهندسة الفراغية والمجسمات 3D', 
    englishSlug: 'spatial-geometry', 
    link: '/simulation/spatial-geometry', 
    discipline: 'رياضيات', 
    engine: 'Three.js 3D', 
    status: 'جاهز 100%',
    keywords: ['هندسة فراغية', 'مجسمات', 'أحجام', 'مساحات', 'متجهات فراغية', 'مستوى'],
    description: 'استكشاف الأشكال الهندسية ثلاثية الأبعاد والمقاطع المستوية وحساب الحجوم.'
  },
  { 
    id: 'sim-49', 
    title: 'الاحتمالات والتوزيعات الإحصائية', 
    englishSlug: 'probability', 
    link: '/simulation/probability', 
    discipline: 'رياضيات', 
    engine: 'Canvas 2D', 
    status: 'جاهز 100%',
    keywords: ['احتمالات', 'توزيع طبيعي', 'غاوس', 'عينات', 'إحصاء', 'لوحة غالتون'],
    description: 'توزيع غالتون وإثبات نظرية النهاية المركزية والتوزيع الاحتمالي الطبيعي.'
  }
];

class SimulationCatalogService {
  private simulations: SimulationRecord[] = ALL_49_SIMULATIONS;

  public getAll(): SimulationRecord[] {
    return this.simulations;
  }

  public getBySlug(slug: string): SimulationRecord | undefined {
    return this.simulations.find(s => s.englishSlug === slug || s.link.endsWith(slug) || s.id === slug);
  }

  /**
   * Find the most semantically relevant simulation for any lesson topic or keyword
   */
  public findBestMatch(topic: string, discipline?: string): SimulationRecord {
    const cleanTopic = topic.toLowerCase();
    let bestScore = -1;
    let bestMatch = this.simulations[0];

    for (const sim of this.simulations) {
      let score = 0;

      // Exact title contains topic or vice versa
      if (cleanTopic.includes(sim.title.toLowerCase()) || sim.title.toLowerCase().includes(cleanTopic)) {
        score += 50;
      }

      // Keyword matches
      for (const kw of sim.keywords) {
        if (cleanTopic.includes(kw.toLowerCase())) {
          score += 15;
        }
      }

      // Discipline match
      if (discipline && sim.discipline === discipline) {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = sim;
      }
    }

    return bestMatch;
  }
}

export const simulationCatalogService = new SimulationCatalogService();
