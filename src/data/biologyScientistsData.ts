export interface BiologyScientistItem {
  id: string;
  name: string;
  nameArabic: string;
  period: string;
  field: 'genetics' | 'microbiology_immunology' | 'evolution_ecology' | 'physiology_anatomy' | 'molecular_biotech';
  fieldArabic: string;
  country: string;
  nobelPrize: boolean;
  nobelYear?: string;
  achievements: string[];
  description: string;
  famousFor: string;
  avatarEmoji: string;
  keyConcept?: string;
  historicalQuote?: string;
}

export const BIOLOGY_FIELDS = [
  { id: 'all', name: 'جميع فروع علم الأحياء' },
  { id: 'genetics', name: 'علم الوراثة والجينات' },
  { id: 'microbiology_immunology', name: 'الأحياء الدقيقة والمناعة' },
  { id: 'evolution_ecology', name: 'التطور وعلم البيئة' },
  { id: 'physiology_anatomy', name: 'علم وظائف الأعضاء والتشريح' },
  { id: 'molecular_biotech', name: 'البيولوجيا الجزيئية والهندسة الوراثية' }
];

export const BIOLOGY_SCIENTISTS_LIST: BiologyScientistItem[] = [
  {
    id: 'mendel',
    name: 'Gregor Mendel',
    nameArabic: 'جريجور مندل',
    period: '1822 - 1884 م',
    field: 'genetics',
    fieldArabic: 'علم الوراثة والجينات',
    country: 'النمسا (جمهورية التشيك حالياً)',
    nobelPrize: false,
    achievements: [
      'يُلقّب بـ "أبو علم الوراثة الحديث" (Father of Modern Genetics)',
      'إجراء تجارب تهجين نبات البازلاء الشهيرة لثماني سنوات واكتشاف قوانين الوراثة الأساسية',
      'قانون انعزال الصفات (Law of Segregation) وقانون التوزيع الحر المستقل',
      'اكتشاف مبدأ السيادة والتنحي للصفات الوراثية وتأسيس مفهوم الجينات الرياضي'
    ],
    description: 'الراهب والعالم العبقري الذي زرع ألوف نباتات البازلاء ليكتشف القوانين الرياضية والإحصائية الدقيقة التي تتحكم في وراثة الصفات في الكائنات الحية.',
    famousFor: 'أبو علم الوراثة، قوانين مندل، وتجارب نبات البازلاء',
    avatarEmoji: '🌱',
    keyConcept: '3:1 \\text{ Phenotypic Ratio in } F_2',
    historicalQuote: 'إن وقتي سيأتي يوماً ما، وستعترف الأجيال القادمة بقيمة هذا العمل.'
  },
  {
    id: 'darwin',
    name: 'Charles Darwin',
    nameArabic: 'تشارلز داروين',
    period: '1809 - 1882 م',
    field: 'evolution_ecology',
    fieldArabic: 'التطور وعلم البيئة',
    country: 'المملكة المتحدة',
    nobelPrize: false,
    achievements: [
      'صياغة نظرية التطور عبر آلية الانتقاء الطبيعي (Natural Selection)',
      'تأليف كتاب "أصل الأنواع" (On the Origin of Species) عام 1859',
      'رحلة سفينة البيجل الاستكشافية لمدة خمس سنوات ودراسة عصافير جزر غالاباغوس',
      'مفهوم السلف المشترك وشجرة الحياة البيولوجية وتكيف الكائنات مع بيئاتها'
    ],
    description: 'العالم الطبيعي الذي وحّد علوم الأحياء تحت مظلة واحدة عبر تفسير تنوع الكائنات الحية وتكيفاتها المذهلة مع بيئاتها المتغيرة.',
    famousFor: 'نظرية التطور بالانتقاء الطبيعي وكتاب أصل الأنواع',
    avatarEmoji: '🐢',
    keyConcept: '\\text{Variation} + \\text{Selection} + \\text{Inheritance} = \\text{Adaptation}',
    historicalQuote: 'ليست الأقوى من الأنواع هي التي تبقى، ولا الأكثر ذكاءً، بل الأكثر قدرة واستجابة للتكيف مع التغيير.'
  },
  {
    id: 'watson-crick',
    name: 'James Watson & Francis Crick',
    nameArabic: 'جيمس واتسون وفرانسيس كريك',
    period: '1953 م (تاريخ الاكتشاف)',
    field: 'molecular_biotech',
    fieldArabic: 'البيولوجيا الجزيئية والهندسة الوراثية',
    country: 'الولايات المتحدة / بريطانيا',
    nobelPrize: true,
    nobelYear: '1962 (بالاشتراك مع موريس ويلكنز)',
    achievements: [
      'اكتشاف النموذج البنائي ثلاثي الأبعاد للحلزون المزدوج للحمض النووي DNA',
      'تفسير آلية تضاعف الشفرة الوراثية اعتماداً على تكامل القواعد النيتروجينية (A-T و G-C)',
      'تأسيس علم البيولوجيا الجزيئية الحديث (Molecular Biology)',
      'العقيدة المركزية للبيولوجيا الجزيئية (DNA -> RNA -> Protein)'
    ],
    description: 'فككا أعظم سر حيوي في القرن العشرين باكتشاف النموذج الحلزوني للحمض النووي الذي يحمل الشفرة الجينية لكل كائن حي على وجه البسيطة.',
    famousFor: 'اكتشاف الحلزون المزدوج للحمض النووي وتكامل القواعد النيتروجينية',
    avatarEmoji: '🧬',
    keyConcept: '\\text{Adenine} \\leftrightarrow \\text{Thymine}, \\quad \\text{Guanine} \\leftrightarrow \\text{Cytosine}',
    historicalQuote: 'لقد اكتشفنا سر الحياة في حانة الإيجل بكامبريدج في ظهيرة 28 فبراير 1953.'
  },
  {
    id: 'fleming',
    name: 'Alexander Fleming',
    nameArabic: 'ألكسندر فليمنغ',
    period: '1881 - 1955 م',
    field: 'microbiology_immunology',
    fieldArabic: 'الأحياء الدقيقة والمناعة',
    country: 'إسكتلندا / المملكة المتحدة',
    nobelPrize: true,
    nobelYear: '1945',
    achievements: [
      'اكتشاف أول مضاد حيوي في التاريخ: "البنسلين" (Penicillin) من فطر Penicillium notatum عام 1928',
      'إنقاذ مئات الملايين من البشر من الموت بالأمراض البكتيرية والالتهابات',
      'اكتشاف إنزيم الليزوزيم (Lysozyme) المضاد للبكتيريا في سوائل الجسم',
      'التحذير المبكر جداً من ظاهرة مقاومة البكتيريا للمضادات الحيوية في حال إساءة استخدامها'
    ],
    description: 'مكتشف البنسلين الذي غيّر تاريخ الطب البشري، حوّل الأمراض القاتلة إلى أمراض قابلة للشفاء التام وأنقذ أجيالاً بأكملها.',
    famousFor: 'اكتشاف البنسلين والمضادات الحيوية والليزوزيم',
    avatarEmoji: '🧫',
    historicalQuote: 'أحياناً يجد المرء ما لا يبحث عنه؛ فعندما استيقظت لم أكن أخطط لإحداث ثورة في الطب، لكن الطبيعة قامت بذلك.'
  },
  {
    id: 'leeuwenhoek',
    name: 'Antonie van Leeuwenhoek',
    nameArabic: 'أنطوني فان ليفينهوك',
    period: '1632 - 1723 م',
    field: 'microbiology_immunology',
    fieldArabic: 'الأحياء الدقيقة والمناعة',
    country: 'هولندا',
    nobelPrize: false,
    achievements: [
      'أبو علم الأحياء الدقيقة (Father of Microbiology)',
      'صناعة مجاهر ضوئية يدوية بعدسات دقيقة قادرة على التكبير حتى 300 ضعف',
      'أول إنسان في التاريخ يشاهد ويصف البكتيريا، الأوليات الحرة، خلايا الدم الحمراء، والحيوانات المنوية',
      'فتح الباب أمام عالم الكائنات المجهرية الدقيقة الخفية عن العين المجردة'
    ],
    description: 'صانع العدسات الهولندي الذي فتح للبشرية نافذة على عالم الكائنات المجهرية الدقيقة، وأول من رأى البكتيريا تسبح في قطرة ماء.',
    famousFor: 'أبو الأحياء الدقيقة واكتشاف البكتيريا بالمجهر لأول مرة',
    avatarEmoji: '🔬'
  },
  {
    id: 'hooke',
    name: 'Robert Hooke',
    nameArabic: 'روبرت هوك',
    period: '1635 - 1703 م',
    field: 'physiology_anatomy',
    fieldArabic: 'علم وظائف الأعضاء والتشريح',
    country: 'إنجلترا',
    nobelPrize: false,
    achievements: [
      'صياغة مصطلح "الخلية" (Cell) لأول مرة في التاريخ في كتابه "Micrographia" عام 1665',
      'فحص نسيج الفلين بالمجهر وملاحظة الحجرات الصغيرة المتراصة الشبيهة بخلايا الرهبان',
      'تطوير الميكروسكوب المركب وإضاءته وتوثيق رسومات حيوية فائقة الدقة للحشرات والنباتات',
      'قانون هوك للمرونة في الفيزياء'
    ],
    description: 'الموسوعي الذي أهدى البيولوجيا أهم مصطلح فيها: "الخلية"، الوحدة البنائية والوظيفية الأساسية لجميع أشكال الحياة.',
    famousFor: 'اكتشاف وتسمية الخلية وكتاب ميكروغرافيا',
    avatarEmoji: '🧱'
  },
  {
    id: 'ibn-al-nafis',
    name: 'Ibn al-Nafis',
    nameArabic: 'علاء الدين ابن النفيس',
    period: '1213 - 1288 م',
    field: 'physiology_anatomy',
    fieldArabic: 'علم وظائف الأعضاء والتشريح',
    country: 'دمشق / القاهرة',
    nobelPrize: false,
    achievements: [
      'مكتشف الدورة الدموية الصغرى (الدورة الدموية الرئوية) قبل ويليام هارفي وسيرفيتوس بثلاثة قرون',
      'إثبات عدم وجود مسامات بين بطيني القلب ودحض نظريات جالينوس الخاطئة',
      'تفسير آلية تنقية الدم بالأكسجين في الرئتين عبر الأوعية الشعرية الرئوية',
      'تأليف "الشامل في الصناعة الطبية" أضخم موسوعة طبية كتبها شخص واحد'
    ],
    description: 'رائد علم وظائف الأعضاء، كشف مسار الدم بين القلب والرئتين مقدماً أول نموذج علمي صحيح للدورة الدموية الرئوية في التاريخ.',
    famousFor: 'اكتشاف الدورة الدموية الرئوية الصغرى ودحض نظريات جالينوس',
    avatarEmoji: '❤️',
    historicalQuote: 'إذا لم أكن أعلم أن تصانيفي تبقى بعدي لما أتعبت فيها نفسي.'
  },
  {
    id: 'linnaeus',
    name: 'Carl Linnaeus',
    nameArabic: 'كارل لينيوس',
    period: '1707 - 1778 م',
    field: 'evolution_ecology',
    fieldArabic: 'التطور وعلم البيئة',
    country: 'السويد',
    nobelPrize: false,
    achievements: [
      'أبو التصنيف العلمي الحديث (Father of Modern Taxonomy)',
      'ابتكار نظام "التسمية الثنائية" (Binomial Nomenclature) باللاتينية (الجنس والنوع مثل Homo sapiens)',
      'تأليف كتاب "نظام الطبيعة" (Systema Naturae) لتصنيف الممالك الثلاث: نباتات، حيوانات، ومعادن',
      'وضع المراتب التصنيفية الهرمية: المملكة، الشعبة، الطائفة، الرتبة، الفصيلة، الجنس، والنوع'
    ],
    description: 'منظّم شجرة الحياة، وضع اللغة التصنيفية العالمية التي يتحدث بها جميع علماء الأحياء لتسمية وتصنيف ملايين الكائنات الحية.',
    famousFor: 'أبو التصنيف الحيوي ونظام التسمية الثنائية اللاتينية',
    avatarEmoji: '🌿',
    keyConcept: '\\text{Genus} + \\text{species} \\rightarrow \\text{Homo sapiens}'
  },
  {
    id: 'jenner',
    name: 'Edward Jenner',
    nameArabic: 'إدوارد جينر',
    period: '1749 - 1823 م',
    field: 'microbiology_immunology',
    fieldArabic: 'الأحياء الدقيقة والمناعة',
    country: 'إنجلترا',
    nobelPrize: false,
    achievements: [
      'أبو علم المناعة (Father of Immunology)',
      'تطوير أول لقاح ناجح في التاريخ عام 1796 للوقاية من مرض الجدري القاتل باستخدام جدري البقر',
      'ابتكار مصطلح "اللقاح" (Vaccine) المشتق من الكلمة اللاتينية Vacca وتعني بقرة',
      'القضاء على مرض الجدري كأول وباء بشري يتم استئصاله تماماً من كوكب الأرض'
    ],
    description: 'مؤسس علم اللقاحات والمناعة، أنقذ عمله الرائد أرواح بشر تفوق أي اكتشاف طبي آخر في التاريخ الإنساني.',
    famousFor: 'أبو علم المناعة وابتكار أول لقاح في التاريخ ضد الجدري',
    avatarEmoji: '💉'
  },
  {
    id: 'doudna-charpentier',
    name: 'Jennifer Doudna & Emmanuelle Charpentier',
    nameArabic: 'جينيفر دودنا وإيمانويل شاربنتييه',
    period: 'معاصرة',
    field: 'molecular_biotech',
    fieldArabic: 'البيولوجيا الجزيئية والهندسة الوراثية',
    country: 'الولايات المتحدة / فرنسا',
    nobelPrize: true,
    nobelYear: '2020',
    achievements: [
      'تطوير تقنية كريسبر (CRISPR-Cas9) كأدق مقص جيني ثوري لتعديل الحمض النووي في التاريخ',
      'إتاحة إعادة كتابة الشفرة الوراثية للكائنات الحية لعلاج الأمراض المستعصية والسرطانات',
      'أول امرأتين تقتسمان معاً جائزة نوبل في الكيمياء في التاريخ',
      'إطلاق العصر الذهبي للهندسة الوراثية والطب الدقيق والزراعة المتقدمة'
    ],
    description: 'رائدتا تحرير الجينوم، منحتا البشرية أدق أداة جزيئية لإعادة كتابة شفرة الحياة وتعديل الجينات بدقة مذهلة وسهولة غير مسبوقة.',
    famousFor: 'تطوير مقص كريسبر-كاس9 لتعديل الجينوم ونوبل 2020',
    avatarEmoji: '✂️'
  },
  {
    id: 'mcclintock',
    name: 'Barbara McClintock',
    nameArabic: 'باربرا مكلنتوك',
    period: '1902 - 1992 م',
    field: 'genetics',
    fieldArabic: 'علم الوراثة والجينات',
    country: 'الولايات المتحدة',
    nobelPrize: true,
    nobelYear: '1983',
    achievements: [
      'اكتشاف "الجينات القافزة" أو العناصر الوراثية القابلة للانتقال (Transposons)',
      'إثبات أن الجينوم ليس ثابتاً جامداً بل ديناميكي وقابل لإعادة الترتيب الذاتي',
      'دراسات رائدة على وراثة ألوان حبوب الذرة والتبادل الكروموسومي أثناء الانقسام المنصف',
      'المرأة الوحيدة التي فازت بجائزة نوبل غير مشتركة في علم وظائف الأعضاء أو الطب'
    ],
    description: 'عالمة الوراثة الفذة التي حطمت فكرة ثبات الجينوم، وصبرت لعقود حتى أقر المجتمع العلمي بعبقرية اكتشافها للجينات القافزة.',
    famousFor: 'اكتشاف الجينات القافزة والترانسبوزونات وديناميكية الجينوم',
    avatarEmoji: '🌽'
  }
];
