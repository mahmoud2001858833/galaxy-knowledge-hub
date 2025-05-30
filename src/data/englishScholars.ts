
export interface EnglishScholar {
  id: string;
  name: string;
  nameAr: string;
  birthYear?: string;
  deathYear?: string;
  era: string;
  eraAr: string;
  category: string;
  categoryAr: string;
  description: string;
  descriptionAr: string;
  achievements: string[];
  achievementsAr: string[];
  majorWorks: string[];
  majorWorksAr: string[];
  imageUrl?: string;
  contribution: string;
  contributionAr: string;
}

export const englishScholars: EnglishScholar[] = [
  // Grammar and Dictionary Developers (1-10)
  {
    id: 'scholar_001',
    name: 'Samuel Johnson',
    nameAr: 'صموئيل جونسون',
    birthYear: '1709',
    deathYear: '1784',
    era: '18th Century',
    eraAr: 'القرن الثامن عشر',
    category: 'Lexicographer',
    categoryAr: 'معجمي',
    description: 'English writer, lexicographer, and critic who created the first comprehensive English dictionary.',
    descriptionAr: 'كاتب ومعجمي وناقد إنجليزي أنشأ أول قاموس إنجليزي شامل.',
    achievements: [
      'Created the first comprehensive English dictionary in 1755',
      'Established spelling and usage standards',
      'Influenced English literature through his writings'
    ],
    achievementsAr: [
      'أنشأ أول قاموس إنجليزي شامل عام 1755',
      'وضع معايير الإملاء والاستخدام',
      'أثر على الأدب الإنجليزي من خلال كتاباته'
    ],
    majorWorks: ['A Dictionary of the English Language', 'The Lives of the English Poets'],
    majorWorksAr: ['قاموس اللغة الإنجليزية', 'حياة الشعراء الإنجليز'],
    contribution: 'Standardized English spelling and usage through his dictionary',
    contributionAr: 'وحد الإملاء والاستخدام الإنجليزي من خلال قاموسه',
    imageUrl: '/scholars/samuel_johnson.jpg'
  },
  {
    id: 'scholar_002',
    name: 'Noah Webster',
    nameAr: 'نوح وبستر',
    birthYear: '1758',
    deathYear: '1843',
    era: '18th-19th Century',
    eraAr: 'القرن الثامن عشر - التاسع عشر',
    category: 'Lexicographer',
    categoryAr: 'معجمي',
    description: 'American lexicographer who created the American English dictionary and established American spelling conventions.',
    descriptionAr: 'معجمي أمريكي أنشأ القاموس الإنجليزي الأمريكي ووضع اتفاقيات الإملاء الأمريكية.',
    achievements: [
      'Created the American Dictionary of the English Language',
      'Established American spelling differences from British English',
      'Promoted American cultural independence through language'
    ],
    achievementsAr: [
      'أنشأ القاموس الأمريكي للغة الإنجليزية',
      'وضع الاختلافات الإملائية الأمريكية عن الإنجليزية البريطانية',
      'روج للاستقلال الثقافي الأمريكي من خلال اللغة'
    ],
    majorWorks: ['American Dictionary of the English Language', 'The Blue-Backed Speller'],
    majorWorksAr: ['القاموس الأمريكي للغة الإنجليزية', 'كتاب الإملاء الأزرق'],
    contribution: 'Differentiated American English from British English',
    contributionAr: 'ميز الإنجليزية الأمريكية عن الإنجليزية البريطانية',
    imageUrl: '/scholars/noah_webster.jpg'
  },
  {
    id: 'scholar_003',
    name: 'Henry Sweet',
    nameAr: 'هنري سويت',
    birthYear: '1845',
    deathYear: '1912',
    era: '19th-20th Century',
    eraAr: 'القرن التاسع عشر - العشرين',
    category: 'Phonetician',
    categoryAr: 'عالم أصوات',
    description: 'English phonetician and grammarian who developed modern phonetic studies of English.',
    descriptionAr: 'عالم أصوات ونحوي إنجليزي طور الدراسات الصوتية الحديثة للإنجليزية.',
    achievements: [
      'Advanced phonetic studies of English',
      'Developed systematic approach to English grammar',
      'Influenced modern linguistic methodology'
    ],
    achievementsAr: [
      'طور الدراسات الصوتية للإنجليزية',
      'وضع منهجاً منظماً لقواعد اللغة الإنجليزية',
      'أثر على المنهجية اللغوية الحديثة'
    ],
    majorWorks: ['A New English Grammar', 'The Practical Study of Languages'],
    majorWorksAr: ['قواعد إنجليزية جديدة', 'الدراسة العملية للغات'],
    contribution: 'Modernized the study of English phonetics and grammar',
    contributionAr: 'حدث دراسة علم الأصوات والقواعد الإنجليزية',
    imageUrl: '/scholars/henry_sweet.jpg'
  },
  {
    id: 'scholar_004',
    name: 'Otto Jespersen',
    nameAr: 'أوتو يسبرسن',
    birthYear: '1860',
    deathYear: '1943',
    era: '19th-20th Century',
    eraAr: 'القرن التاسع عشر - العشرين',
    category: 'Grammarian',
    categoryAr: 'نحوي',
    description: 'Danish linguist who made significant contributions to English grammar and language philosophy.',
    descriptionAr: 'لغوي دنماركي قدم مساهمات مهمة في قواعد اللغة الإنجليزية وفلسفة اللغة.',
    achievements: [
      'Developed progressive grammar theory',
      'Advanced understanding of English syntax',
      'Promoted international language cooperation'
    ],
    achievementsAr: [
      'طور نظرية القواعد التقدمية',
      'طور فهم النحو الإنجليزي',
      'روج للتعاون اللغوي الدولي'
    ],
    majorWorks: ['A Modern English Grammar', 'Language: Its Nature, Development and Origin'],
    majorWorksAr: ['قواعد إنجليزية حديثة', 'اللغة: طبيعتها وتطورها وأصلها'],
    contribution: 'Advanced modern understanding of English grammar',
    contributionAr: 'طور الفهم الحديث لقواعد اللغة الإنجليزية',
    imageUrl: '/scholars/otto_jespersen.jpg'
  },
  {
    id: 'scholar_005',
    name: 'H.W. Fowler',
    nameAr: 'إتش. دبليو. فاولر',
    birthYear: '1858',
    deathYear: '1933',
    era: '19th-20th Century',
    eraAr: 'القرن التاسع عشر - العشرين',
    category: 'Usage Expert',
    categoryAr: 'خبير استخدام',
    description: 'English schoolmaster and lexicographer who wrote authoritative guides on English usage.',
    descriptionAr: 'معلم ومعجمي إنجليزي كتب أدلة معتمدة لاستخدام اللغة الإنجليزية.',
    achievements: [
      'Authored the definitive guide to English usage',
      'Clarified complex grammar rules',
      'Influenced standard English writing practices'
    ],
    achievementsAr: [
      'ألف الدليل النهائي لاستخدام اللغة الإنجليزية',
      'وضح قواعد النحو المعقدة',
      'أثر على ممارسات الكتابة الإنجليزية المعيارية'
    ],
    majorWorks: ['A Dictionary of Modern English Usage', 'The King\'s English'],
    majorWorksAr: ['قاموس الاستخدام الإنجليزي الحديث', 'الإنجليزية الملكية'],
    contribution: 'Established standards for proper English usage',
    contributionAr: 'وضع معايير للاستخدام الصحيح للإنجليزية',
    imageUrl: '/scholars/hw_fowler.jpg'
  },

  // Literary Giants (11-20)
  {
    id: 'scholar_011',
    name: 'William Shakespeare',
    nameAr: 'وليام شكسبير',
    birthYear: '1564',
    deathYear: '1616',
    era: '16th-17th Century',
    eraAr: 'القرن السادس عشر - السابع عشر',
    category: 'Playwright/Poet',
    categoryAr: 'كاتب مسرحي/شاعر',
    description: 'English playwright and poet widely regarded as the greatest writer in the English language.',
    descriptionAr: 'كاتب مسرحي وشاعر إنجليزي يُعتبر على نطاق واسع أعظم كاتب في اللغة الإنجليزية.',
    achievements: [
      'Created over 1,700 new English words',
      'Wrote 39 plays and 154 sonnets',
      'Revolutionized English drama and poetry'
    ],
    achievementsAr: [
      'ابتكر أكثر من 1700 كلمة إنجليزية جديدة',
      'كتب 39 مسرحية و154 سونيتة',
      'ثور المسرح والشعر الإنجليزي'
    ],
    majorWorks: ['Hamlet', 'Romeo and Juliet', 'Macbeth', 'A Midsummer Night\'s Dream'],
    majorWorksAr: ['هاملت', 'روميو وجولييت', 'مكبث', 'حلم ليلة صيف'],
    contribution: 'Expanded English vocabulary and literary expression',
    contributionAr: 'وسع المفردات الإنجليزية والتعبير الأدبي',
    imageUrl: '/scholars/shakespeare.jpg'
  },
  {
    id: 'scholar_012',
    name: 'Geoffrey Chaucer',
    nameAr: 'جيفري تشوسر',
    birthYear: '1343',
    deathYear: '1400',
    era: '14th Century',
    eraAr: 'القرن الرابع عشر',
    category: 'Poet',
    categoryAr: 'شاعر',
    description: 'English poet known as the Father of English Literature who helped establish Middle English.',
    descriptionAr: 'شاعر إنجليزي يُعرف بأبي الأدب الإنجليزي ساعد في تأسيس الإنجليزية الوسطى.',
    achievements: [
      'Established English as a literary language',
      'Created vivid character portrayals',
      'Influenced development of English poetry'
    ],
    achievementsAr: [
      'أسس الإنجليزية كلغة أدبية',
      'أبدع في رسم الشخصيات',
      'أثر على تطور الشعر الإنجليزي'
    ],
    majorWorks: ['The Canterbury Tales', 'Troilus and Criseyde'],
    majorWorksAr: ['حكايات كانتربيري', 'ترويلوس وكريسيدا'],
    contribution: 'Elevated English to a literary language',
    contributionAr: 'رفع الإنجليزية إلى مستوى اللغة الأدبية',
    imageUrl: '/scholars/chaucer.jpg'
  },

  // Linguists and Phoneticians (21-30)
  {
    id: 'scholar_021',
    name: 'Daniel Jones',
    nameAr: 'دانييل جونز',
    birthYear: '1881',
    deathYear: '1967',
    era: '20th Century',
    eraAr: 'القرن العشرين',
    category: 'Phonetician',
    categoryAr: 'عالم أصوات',
    description: 'British phonetician who developed the International Phonetic Alphabet for English.',
    descriptionAr: 'عالم أصوات بريطاني طور الأبجدية الصوتية الدولية للإنجليزية.',
    achievements: [
      'Developed phonetic notation systems',
      'Created pronunciation dictionaries',
      'Standardized English pronunciation teaching'
    ],
    achievementsAr: [
      'طور أنظمة الترميز الصوتي',
      'أنشأ قواميس النطق',
      'وحد تعليم النطق الإنجليزي'
    ],
    majorWorks: ['English Pronunciation Dictionary', 'An Outline of English Phonetics'],
    majorWorksAr: ['قاموس النطق الإنجليزي', 'مخطط علم الأصوات الإنجليزية'],
    contribution: 'Standardized English pronunciation notation',
    contributionAr: 'وحد ترميز النطق الإنجليزي',
    imageUrl: '/scholars/daniel_jones.jpg'
  },
  {
    id: 'scholar_022',
    name: 'Noam Chomsky',
    nameAr: 'نعوم تشومسكي',
    birthYear: '1928',
    deathYear: '',
    era: '20th-21st Century',
    eraAr: 'القرن العشرين - الحادي والعشرين',
    category: 'Linguist',
    categoryAr: 'لغوي',
    description: 'American linguist who revolutionized the study of language with his theory of universal grammar.',
    descriptionAr: 'لغوي أمريكي ثور دراسة اللغة بنظريته عن القواعد الكونية.',
    achievements: [
      'Developed theory of universal grammar',
      'Revolutionized linguistic methodology',
      'Influenced cognitive science and psychology'
    ],
    achievementsAr: [
      'طور نظرية القواعد الكونية',
      'ثور المنهجية اللغوية',
      'أثر على العلوم المعرفية وعلم النفس'
    ],
    majorWorks: ['Syntactic Structures', 'Aspects of the Theory of Syntax'],
    majorWorksAr: ['التراكيب النحوية', 'جوانب نظرية النحو'],
    contribution: 'Transformed understanding of language structure',
    contributionAr: 'حول فهم بنية اللغة',
    imageUrl: '/scholars/chomsky.jpg'
  },

  // ESL Teaching Experts (31-40)
  {
    id: 'scholar_031',
    name: 'Stephen Krashen',
    nameAr: 'ستيفن كراشن',
    birthYear: '1941',
    deathYear: '',
    era: '20th-21st Century',
    eraAr: 'القرن العشرين - الحادي والعشرين',
    category: 'Language Acquisition Expert',
    categoryAr: 'خبير اكتساب اللغة',
    description: 'American linguist known for his theory of second language acquisition.',
    descriptionAr: 'لغوي أمريكي معروف بنظريته في اكتساب اللغة الثانية.',
    achievements: [
      'Developed Input Hypothesis theory',
      'Advanced second language acquisition research',
      'Influenced ESL teaching methods worldwide'
    ],
    achievementsAr: [
      'طور نظرية فرضية المدخل',
      'طور بحوث اكتساب اللغة الثانية',
      'أثر على طرق تدريس الإنجليزية كلغة ثانية عالمياً'
    ],
    majorWorks: ['Second Language Acquisition and Second Language Learning', 'The Input Hypothesis'],
    majorWorksAr: ['اكتساب اللغة الثانية وتعلم اللغة الثانية', 'فرضية المدخل'],
    contribution: 'Revolutionized second language teaching methods',
    contributionAr: 'ثور طرق تدريس اللغة الثانية',
    imageUrl: '/scholars/krashen.jpg'
  },

  // Language Historians (41-50)
  {
    id: 'scholar_041',
    name: 'Bill Bryson',
    nameAr: 'بيل برايسون',
    birthYear: '1951',
    deathYear: '',
    era: '20th-21st Century',
    eraAr: 'القرن العشرين - الحادي والعشرين',
    category: 'Language Historian',
    categoryAr: 'مؤرخ لغة',
    description: 'American-British author who popularized the history and evolution of the English language.',
    descriptionAr: 'مؤلف أمريكي-بريطاني شعب تاريخ وتطور اللغة الإنجليزية.',
    achievements: [
      'Made language history accessible to general readers',
      'Documented quirks and evolution of English',
      'Promoted appreciation for linguistic diversity'
    ],
    achievementsAr: [
      'جعل تاريخ اللغة متاحاً للقراء العامة',
      'وثق خصائص وتطور الإنجليزية',
      'روج للتقدير للتنوع اللغوي'
    ],
    majorWorks: ['The Mother Tongue', 'Made in America'],
    majorWorksAr: ['اللغة الأم', 'صنع في أمريكا'],
    contribution: 'Popularized English language history',
    contributionAr: 'شعب تاريخ اللغة الإنجليزية',
    imageUrl: '/scholars/bryson.jpg'
  }
];

export const getScholarsByCategory = (category: string) => {
  return englishScholars.filter(scholar => scholar.category === category);
};

export const getScholarsByEra = (era: string) => {
  return englishScholars.filter(scholar => scholar.era === era);
};

export const getRandomScholar = () => {
  return englishScholars[Math.floor(Math.random() * englishScholars.length)];
};

export const searchScholars = (query: string, language: 'ar' | 'en' = 'en') => {
  const searchFields = language === 'ar' 
    ? ['nameAr', 'categoryAr', 'descriptionAr', 'contributionAr']
    : ['name', 'category', 'description', 'contribution'];
    
  return englishScholars.filter(scholar => 
    searchFields.some(field => 
      scholar[field as keyof EnglishScholar]?.toString().toLowerCase().includes(query.toLowerCase())
    )
  );
};
