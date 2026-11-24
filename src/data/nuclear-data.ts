export interface Nucleus {
  id: string;
  element: string;
  symbol: string;
  massNumber: number;
  protons: number;
  neutrons: number;
  color: string;
  glowColor: string;
}

export interface FissionProduct {
  nucleus1: Nucleus;
  nucleus2: Nucleus;
  neutrons: number;
  energyMeV: number;
}

export interface FusionProduct {
  resultNucleus: Nucleus;
  energyMeV: number;
  particles: string[];
}

export const NUCLEAR_ELEMENTS: Record<string, Nucleus> = {
  uranium235: {
    id: 'U-235',
    element: 'يورانيوم',
    symbol: 'U',
    massNumber: 235,
    protons: 92,
    neutrons: 143,
    color: '#10b981',
    glowColor: '#34d399'
  },
  deuterium: {
    id: 'H-2',
    element: 'ديوتيريوم',
    symbol: 'D',
    massNumber: 2,
    protons: 1,
    neutrons: 1,
    color: '#3b82f6',
    glowColor: '#60a5fa'
  },
  tritium: {
    id: 'H-3',
    element: 'تريتيوم',
    symbol: 'T',
    massNumber: 3,
    protons: 1,
    neutrons: 2,
    color: '#8b5cf6',
    glowColor: '#a78bfa'
  },
  helium: {
    id: 'He-4',
    element: 'هيليوم',
    symbol: 'He',
    massNumber: 4,
    protons: 2,
    neutrons: 2,
    color: '#f59e0b',
    glowColor: '#fbbf24'
  },
  barium: {
    id: 'Ba-141',
    element: 'باريوم',
    symbol: 'Ba',
    massNumber: 141,
    protons: 56,
    neutrons: 85,
    color: '#ec4899',
    glowColor: '#f472b6'
  },
  krypton: {
    id: 'Kr-92',
    element: 'كريبتون',
    symbol: 'Kr',
    massNumber: 92,
    protons: 36,
    neutrons: 56,
    color: '#14b8a6',
    glowColor: '#2dd4bf'
  },
  helium3: {
    id: 'He-3',
    element: 'هيليوم-3',
    symbol: 'He',
    massNumber: 3,
    protons: 2,
    neutrons: 1,
    color: '#f97316',
    glowColor: '#fb923c'
  },
  strontium: {
    id: 'Sr-90',
    element: 'سترونتيوم',
    symbol: 'Sr',
    massNumber: 90,
    protons: 38,
    neutrons: 52,
    color: '#06b6d4',
    glowColor: '#22d3ee'
  },
  xenon: {
    id: 'Xe-140',
    element: 'زينون',
    symbol: 'Xe',
    massNumber: 140,
    protons: 54,
    neutrons: 86,
    color: '#8b5cf6',
    glowColor: '#a78bfa'
  },
  rubidium: {
    id: 'Rb-93',
    element: 'روبيديوم',
    symbol: 'Rb',
    massNumber: 93,
    protons: 37,
    neutrons: 56,
    color: '#f43f5e',
    glowColor: '#fb7185'
  },
  cesium: {
    id: 'Cs-137',
    element: 'سيزيوم',
    symbol: 'Cs',
    massNumber: 137,
    protons: 55,
    neutrons: 82,
    color: '#eab308',
    glowColor: '#facc15'
  },
  yttrium: {
    id: 'Y-93',
    element: 'إتريوم',
    symbol: 'Y',
    massNumber: 93,
    protons: 39,
    neutrons: 54,
    color: '#14b8a6',
    glowColor: '#2dd4bf'
  },
  zirconium: {
    id: 'Zr-97',
    element: 'زركونيوم',
    symbol: 'Zr',
    massNumber: 97,
    protons: 40,
    neutrons: 57,
    color: '#84cc16',
    glowColor: '#a3e635'
  },
  tellurium: {
    id: 'Te-134',
    element: 'تيلوريوم',
    symbol: 'Te',
    massNumber: 134,
    protons: 52,
    neutrons: 82,
    color: '#f59e0b',
    glowColor: '#fbbf24'
  },
  lithium: {
    id: 'Li-7',
    element: 'ليثيوم',
    symbol: 'Li',
    massNumber: 7,
    protons: 3,
    neutrons: 4,
    color: '#6366f1',
    glowColor: '#818cf8'
  },
  beryllium: {
    id: 'Be-9',
    element: 'بيريليوم',
    symbol: 'Be',
    massNumber: 9,
    protons: 4,
    neutrons: 5,
    color: '#14b8a6',
    glowColor: '#2dd4bf'
  }
};

export const FISSION_REACTIONS = [
  {
    id: 'u235-fission',
    name: 'انشطار اليورانيوم-235',
    description: 'عند قذف نواة اليورانيوم-235 بنيوترون، تنقسم إلى نواتين أصغر مع إطلاق طاقة هائلة',
    fuel: NUCLEAR_ELEMENTS.uranium235,
    products: {
      nucleus1: NUCLEAR_ELEMENTS.barium,
      nucleus2: NUCLEAR_ELEMENTS.krypton,
      neutrons: 3,
      energyMeV: 200
    }
  }
];

export const FUSION_REACTIONS = [
  {
    id: 'dt-fusion',
    name: 'اندماج الديوتيريوم-تريتيوم',
    description: 'اندماج نواتي الديوتيريوم والتريتيوم لتكوين الهيليوم مع إطلاق طاقة',
    reactants: [NUCLEAR_ELEMENTS.deuterium, NUCLEAR_ELEMENTS.tritium],
    product: {
      resultNucleus: NUCLEAR_ELEMENTS.helium,
      energyMeV: 17.6,
      particles: ['نيوترون']
    }
  },
  {
    id: 'dd-fusion',
    name: 'اندماج الديوتيريوم-ديوتيريوم',
    description: 'اندماج نواتي ديوتيريوم لتكوين الهيليوم-3',
    reactants: [NUCLEAR_ELEMENTS.deuterium, NUCLEAR_ELEMENTS.deuterium],
    product: {
      resultNucleus: NUCLEAR_ELEMENTS.helium3,
      energyMeV: 3.27,
      particles: ['نيوترون']
    }
  },
  {
    id: 'pp-fusion',
    name: 'سلسلة البروتون-البروتون',
    description: 'التفاعل الأساسي في نواة الشمس',
    reactants: [NUCLEAR_ELEMENTS.deuterium, NUCLEAR_ELEMENTS.helium3],
    product: {
      resultNucleus: NUCLEAR_ELEMENTS.helium,
      energyMeV: 12.86,
      particles: ['بروتونان']
    }
  },
  {
    id: 'li-fusion',
    name: 'اندماج الليثيوم',
    description: 'اندماج الليثيوم مع الديوتيريوم',
    reactants: [NUCLEAR_ELEMENTS.lithium, NUCLEAR_ELEMENTS.deuterium],
    product: {
      resultNucleus: NUCLEAR_ELEMENTS.beryllium,
      energyMeV: 22.4,
      particles: ['نيوترون']
    }
  }
];

export const NUCLEAR_QUIZ = [
  {
    id: 1,
    question: 'ما الفرق الرئيسي بين الانشطار والاندماج النووي؟',
    options: [
      'الانشطار يقسم نواة ثقيلة، والاندماج يدمج نوى خفيفة',
      'الانشطار يطلق طاقة أكبر من الاندماج',
      'الاندماج يحدث في المفاعلات النووية فقط',
      'لا يوجد فرق بينهما'
    ],
    correctAnswer: 0,
    explanation: 'الانشطار النووي يقسم نواة ثقيلة (مثل اليورانيوم) إلى نوى أصغر، بينما الاندماج النووي يدمج نوى خفيفة (مثل الهيدروجين) لتكوين نواة أثقل.'
  },
  {
    id: 2,
    question: 'أي التفاعلات التالية يحدث في الشمس؟',
    options: [
      'الانشطار النووي',
      'الاندماج النووي',
      'التحلل الإشعاعي',
      'الانقسام الخلوي'
    ],
    correctAnswer: 1,
    explanation: 'الشمس تنتج الطاقة من خلال الاندماج النووي، حيث تندمج نوى الهيدروجين لتكوين الهيليوم.'
  },
  {
    id: 3,
    question: 'كم تبلغ تقريباً الطاقة المنطلقة من انشطار نواة يورانيوم-235؟',
    options: [
      '20 MeV',
      '200 MeV',
      '2000 MeV',
      '20000 MeV'
    ],
    correctAnswer: 1,
    explanation: 'ينتج عن انشطار نواة واحدة من اليورانيوم-235 حوالي 200 MeV من الطاقة.'
  },
  {
    id: 4,
    question: 'ما هي الوظيفة الأساسية لقضبان التحكم (مثل الكادميوم أو البورون) داخل قلب المفاعل النووي؟',
    options: [
      'إنتاج الكهرباء مباشرة',
      'امتصاص النيوترونات الفائضة للتحكم في معدل التفاعل المتسلسل',
      'رفع درجة حرارة الماء فقط',
      'إطلاق إشعاعات ألفا'
    ],
    correctAnswer: 1,
    explanation: 'تمتص قضبان الكادميوم أو البورون النيوترونات الحرة لضبط معامل الحرجية k عند 1.00 أو إيقاف التفاعل فوراً عند الطوارئ (SCRAM).'
  },
  {
    id: 5,
    question: 'ما هما نظيرا الهيدروجين المستخدمان في تفاعل الاندماج الأشهر داخل مفاعل التوكاماك (D-T)؟',
    options: [
      'الهيليوم والليثيوم',
      'الديوتيريوم (²H) والتريتيوم (³H)',
      'اليورانيوم والبلوتونيوم',
      'الكربون والأكسجين'
    ],
    correctAnswer: 1,
    explanation: 'يندمج الديوتيريوم والتريتيوم لإنتاج نواة هيليوم-4 ونيوترون عالي الطاقة مطلقين 17.6 MeV.'
  },
  {
    id: 6,
    question: 'ماذا يعني وصول معامل التكاثر الفعال (الحرجية k_eff) إلى القيمة 1.00 في المفاعل؟',
    options: [
      'توقف المفاعل تماماً',
      'استقرار التفاعل المتسلسل بقدرة ثابتة وآمنة (حالة حرجة مستقرة)',
      'انفجار فوري للمفاعل',
      'انعدام وجود النيوترونات'
    ],
    correctAnswer: 1,
    explanation: 'عند k_eff = 1.00 يسبب كل انشطار بالمتوسط انشطاراً واحداً جديداً، فتستقر الطاقة الحرارية للمفاعل.'
  },
  {
    id: 7,
    question: 'لماذا يظهر التوهج الأزرق الجميل (إشعاع تشيرينكوف) داخل أحواض المفاعلات النووية المائية؟',
    options: [
      'بسبب إضافة صبغة زرقاء للماء',
      'لأن جسيمات مشحونة تتحرك في الماء بسرعة تفوق سرعة الضوء داخل الماء',
      'بسبب انعكاس السماء فقط',
      'بسبب غليان الماء'
    ],
    correctAnswer: 1,
    explanation: 'يحدث إشعاع تشيرينكوف عندما تتحرك الإلكترونات عالية الطاقة في الماء أسرع من سرعة الضوء في الماء (c/n ≈ 0.75c).'
  },
  {
    id: 8,
    question: 'ما السبب الفيزيائي في إطلاق طاقة هائلة أثناء الانشطار أو الاندماج النووي؟',
    options: [
      'الاحتكاك بين الذرات',
      'تحوّل فرق الكتلة (النقص الكتلي Δm) إلى طاقة وفق معادلة E = Δmc²',
      'تمدد الغازات فقط',
      'تفاعل كيميائي عادي بين الإلكترونات'
    ],
    correctAnswer: 1,
    explanation: 'كتلة النواتج تكون أقل قليلاً من كتلة المتفاعلات، وهذا النقص الضئيل في الكتلة يتحول لطاقة هائلة عبر E = Δmc².'
  },
  {
    id: 9,
    question: 'ما هو الجسيم الذي يُقذف نحو نواة اليورانيوم-235 لبدء تفاعل الانشطار بكفاءة عالية؟',
    options: [
      'بروتون سريع',
      'نيوترون حراري بطيء',
      'إلكترون حر',
      'ذرة هيليوم'
    ],
    correctAnswer: 1,
    explanation: 'لأن النيوترون متعادل كهربائياً فإنه لا يتنافر مع النواة الموجبة، وكونه بطيئاً يزيد احتمال امتصاصه من قِبل U-235.'
  },
  {
    id: 10,
    question: 'لماذا يتطلب الاندماج النووي درجات حرارة تفوق 100 مليون كلفن؟',
    options: [
      'لإذابة الجدران المعدنية',
      'للتغلب على قوة التنافر الكهربائي (حاجز كولوم) بين النوى الموجبة حتى تقترب لمجال القوة النووية القوية',
      'لزيادة وزن الإلكترونات',
      'لتبريد البلازما'
    ],
    correctAnswer: 1,
    explanation: 'تتنافر النوى الموجبة بشدة؛ والحرارة الفائقة تمنحها طاقة حركية تكفي لتجاوز حاجز كولوم والاندماج.'
  },
  {
    id: 11,
    question: 'كيف يُحفظ البلازما فائق الحرارة داخل مفاعل التوكاماك دون أن يذيب جدران المفاعل؟',
    options: [
      'بجدران خشبية سميكة',
      'بالحصر المغناطيسي الحلقي القوي الذي يبقي البلازما معلقة بعيداً عن الجدران',
      'بضخ الثلج داخله',
      'بوضعه داخل بالون مطاطي'
    ],
    correctAnswer: 1,
    explanation: 'تستخدم مفاعلات التوكاماك مجالات مغناطيسية حلقية هائلة لحصر جسيمات البلازما المشحونة بعيداً عن جدران الغرفة.'
  },
  {
    id: 12,
    question: 'ما هو دور المُهدّئ (Moderator) مثل الماء العادي أو الماء الثقيل أو الغرافيت في المفاعل الانشطاري؟',
    options: [
      'تسريع النيوترونات لسرعة الضوء',
      'تبطئة النيوترونات السريعة الناتجة من الانشطار لتصبح نيوترونات حرارية قادرة على شطر أنوية جديدة',
      'امتصاص كل الحرارة لمنع توليد الكهرباء',
      'تحويل اليورانيوم إلى ذهب'
    ],
    correctAnswer: 1,
    explanation: 'النيوترونات الناتجة من الانشطار تكون سريعة جداً، فيقوم المُهدّئ بتقليل طاقتها الحركية لتتمكن من استدامة التفاعل المتسلسل.'
  },
  {
    id: 13,
    question: 'أيٌّ من النواتج التالية يُعد من أبرز مزايا طاقة الاندماج النووي مقارنة بالانشطار التقليدي؟',
    options: [
      'إنتاج كميات ضخمة من ثاني أكسيد الكربون',
      'عدم إنتاج نفايات مشعة طويلة الأمد ووفرة الوقود (الديوتيريوم من مياه البحر)',
      'عمله في درجة حرارة الغرفة بسهولة',
      'اعتماده على الفحم الحجري'
    ],
    correctAnswer: 1,
    explanation: 'الناتج الرئيسي لاندماج D-T هو غاز الهيليوم الخامل وغير المشع، ولا يوجد خطر انصهار متسلسل للمفاعل.'
  },
  {
    id: 14,
    question: 'ما هو نظام SCRAM في المفاعلات النووية؟',
    options: [
      'نظام لرفع الطاقة فوق الحد الأقصى',
      'نظام الإغلاق الطارئ السريع الذي يُسقط جميع قضبان التحكم بالكامل لوقف التفاعل خلال ثوانٍ',
      'نظام لتسريع التوربينات',
      'نظام إضاءة المبنى'
    ],
    correctAnswer: 1,
    explanation: 'يعمل نظام SCRAM كآلية أمان قصوى تُدخل قضبان التحكم بنسبة 100% لإيقاف التفاعل المتسلسل فوراً عند أي خطر.'
  },
  {
    id: 15,
    question: 'كم نيوتروناً يُطلق تقريباً في كل عملية انشطار واحدة لنواة اليورانيوم-235؟',
    options: [
      'صفر نيوترون',
      '2 إلى 3 نيوترونات سريعة',
      '50 نيوتروناً',
      '1000 نيوترون'
    ],
    correctAnswer: 1,
    explanation: 'ينتج عن انشطار نواة U-235 عادةً نواتان وليدتان (مثل الباريوم والكريبتون) بالإضافة إلى 2–3 نيوترونات تُغذّي التفاعل المتسلسل.'
  },
  {
    id: 16,
    question: 'أي قوة أساسية في الطبيعة تُبقي البروتونات الموجبة متماسكة داخل النواة رغم تنافرها الكهربائي؟',
    options: [
      'قوة الجاذبية فقط',
      'القوة النووية القوية (Strong Nuclear Force)',
      'قوة الاحتكاك',
      'القوة المغناطيسية الأرضية'
    ],
    correctAnswer: 1,
    explanation: 'القوة النووية القوية هي أقوى قوة أساسية في الطبيعة وتعمل على مسافات قصيرة جداً داخل النواة لتماسك البروتونات والنيوترونات.'
  }
];

export const EDUCATIONAL_CONTENT = {
  fission: {
    title: 'الانشطار النووي',
    content: [
      'عملية انقسام نواة ثقيلة إلى نواتين أو أكثر من النوى الأخف',
      'يحدث عند قذف نواة ثقيلة (مثل اليورانيوم-235) بنيوترون',
      'ينتج عنه إطلاق طاقة هائلة ونيوترونات إضافية',
      'يستخدم في المفاعلات النووية والأسلحة النووية'
    ],
    facts: [
      'تم اكتشاف الانشطار النووي عام 1938',
      'نواة واحدة من U-235 تطلق ~200 MeV',
      'النيوترونات المنطلقة تسبب تفاعل متسلسل'
    ]
  },
  fusion: {
    title: 'الاندماج النووي',
    content: [
      'عملية دمج نواتين خفيفتين لتكوين نواة أثقل',
      'يتطلب درجات حرارة عالية جداً (ملايين الدرجات)',
      'يحدث بشكل طبيعي في قلب النجوم',
      'يطلق طاقة أكبر بكثير من الانشطار مقارنة بالكتلة'
    ],
    facts: [
      'الشمس تدمج 600 مليون طن من الهيدروجين كل ثانية',
      'اندماج D-T ينتج 17.6 MeV',
      'مستقبل الطاقة النظيفة غير المحدودة'
    ]
  }
};
