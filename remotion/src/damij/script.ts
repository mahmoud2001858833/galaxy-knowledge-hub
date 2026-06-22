import { D } from "./theme";

export type SlideLayout =
  | "cover"
  | "section" // section feature with image + title + 2-3 bullets
  | "sectionsGrid" // 8 systems
  | "innovation" // why innovative
  | "qHeader" // question header
  | "bigNumber" // huge number + caption
  | "endorse" // royal/ministerial endorsement
  | "closing";

export type Slide = {
  n: number;
  layout: SlideLayout;
  kicker: string;
  accent: string;
  title?: string;
  subtitle?: string;
  big?: string; // big english number
  bigCaption?: string;
  bullets?: { ar: string; en?: string }[];
  image?: string;
  icon?: string; // emoji
  sfx?: ("whoosh" | "chime" | "tick")[];
};

const G = D.gold;
const N = D.primary;
const T = D.teal;
const GR = D.green;
const W = D.warm;
const B = D.primary2;

export const SLIDES: Slide[] = [
  // ===== A — INTRO (10) =====
  {
    n: 1, layout: "cover", kicker: "DAMIJ  ·  2026",
    accent: G,
    title: "دامِج",
    subtitle: "جسر العدالة الرقمية لكل الفئات المهمشة",
    image: "images/damij-jordan.jpg",
    sfx: ["whoosh"],
  },
  {
    n: 2, layout: "section", kicker: "01  ·  VISION", accent: B, icon: "👁",
    title: "العين الإعمى",
    subtitle: "Blind Eye  ·  بصرٌ بالذكاء الاصطناعي",
    bullets: [
      { ar: "وصف فوري للمشهد بالعربية", en: "Real-time scene captioning" },
      { ar: "قراءة النصوص للمكفوفين", en: "OCR + voice output" },
    ],
    image: "images/damij-coding.jpg",
    sfx: ["whoosh"],
  },
  {
    n: 3, layout: "bigNumber", kicker: "02  ·  CLINICAL LAB", accent: W,
    title: "المختبر السريري الافتراضي",
    big: "1,200",
    bigCaption: "Verified Clinical Cases  ·  حالة سريرية موثّقة",
    bullets: [
      { ar: "تدريب الطلاب على التشخيص" },
      { ar: "بحوث جامعية معتمدة" },
    ],
    sfx: ["chime"],
  },
  {
    n: 4, layout: "bigNumber", kicker: "03  ·  SIGN LANGUAGE", accent: T,
    title: "مترجم لغة الإشارة",
    big: "120",
    bigCaption: "Sign Languages  ·  لغة إشارة عبر MediaPipe",
    bullets: [
      { ar: "تتبّع مفاصل اليد بدقة" },
      { ar: "ترجمة فورية ثنائية الاتجاه" },
    ],
    image: "images/damij-sign.jpg",
    sfx: ["chime"],
  },
  {
    n: 5, layout: "section", kicker: "04  ·  BRAILLE", accent: G, icon: "⠃",
    title: "تعليم برايل التفاعلي",
    subtitle: "Tactile Learning  ·  منهج كامل للمكفوفين",
    bullets: [
      { ar: "لوحة مفاتيح برايل افتراضية" },
      { ar: "اختبارات سرعة ودقة" },
    ],
    image: "images/damij-braille.jpg",
    sfx: ["tick"],
  },
  {
    n: 6, layout: "section", kicker: "05  ·  AUTISM", accent: GR, icon: "🧩",
    title: "أطفال طيف التوحد",
    subtitle: "Autism Screening  ·  ألعاب تشخيصية ذكية",
    bullets: [
      { ar: "تقييم اللعب والانتباه" },
      { ar: "خطة علاج فردية بالـ AI" },
    ],
    image: "images/damij-students.jpg",
    sfx: ["tick"],
  },
  {
    n: 7, layout: "section", kicker: "06  ·  ADHD", accent: W, icon: "⚡",
    title: "اضطراب فرط الحركة",
    subtitle: "ADHD Engine  ·  ألعاب تركيز معيارية",
    bullets: [
      { ar: "أدوات قياس مستندة للأبحاث" },
      { ar: "تقارير قابلة للطباعة للأهل" },
    ],
    sfx: ["tick"],
  },
  {
    n: 8, layout: "section", kicker: "07  ·  SENSORY", accent: B, icon: "🎯",
    title: "النظام الحسّي التكيّفي",
    subtitle: "Adaptive UI + Haptic",
    bullets: [
      { ar: "واجهة تتكيف مع كل طفل" },
      { ar: "اهتزاز ولمس وتنبيهات" },
    ],
    sfx: ["tick"],
  },
  {
    n: 9, layout: "section", kicker: "08  ·  LIBRARY", accent: T, icon: "📚",
    title: "مكتبة المصادر العلمية",
    subtitle: "Verified Knowledge Base",
    bullets: [
      { ar: "مرجعيات طبية وأكاديمية" },
      { ar: "محرّك بحث ذكي بالعربية" },
    ],
    image: "images/damij-legacy.jpg",
    sfx: ["tick"],
  },
  {
    n: 10, layout: "sectionsGrid", kicker: "ALL  ·  IN  ·  ONE", accent: G,
    title: "ثمانية أنظمة موحّدة في منصة واحدة",
    bullets: [
      { ar: "العين الإعمى", en: "Blind Eye" },
      { ar: "المختبر السريري", en: "Clinical Lab" },
      { ar: "لغة الإشارة", en: "Sign Language" },
      { ar: "تعليم برايل", en: "Braille" },
      { ar: "طيف التوحد", en: "Autism" },
      { ar: "فرط الحركة", en: "ADHD" },
      { ar: "النظام الحسي", en: "Sensory" },
      { ar: "مكتبة المصادر", en: "Library" },
    ],
    sfx: ["whoosh"],
  },

  // ===== B — WHY INNOVATIVE (4) =====
  {
    n: 11, layout: "innovation", kicker: "WHY  ·  INNOVATIVE", accent: G,
    title: "منصة موحّدة بدلاً من أدوات متفرقة",
    subtitle: "Unified Platform  vs  Fragmented Tools",
    bullets: [
      { ar: "حساب واحد · لغة واحدة · بيانات موحّدة" },
    ],
    sfx: ["whoosh"],
  },
  {
    n: 12, layout: "innovation", kicker: "MULTIMODAL  ·  AI", accent: T,
    title: "ذكاء اصطناعي متعدد الوسائط",
    subtitle: "Vision · Speech · Text · Gestures",
    bullets: [
      { ar: "نموذج واحد يفهم الصوت والصورة والإشارة" },
    ],
    sfx: ["chime"],
  },
  {
    n: 13, layout: "innovation", kicker: "BY  ·  STUDENTS", accent: GR,
    title: "مصمّمة بالكامل بأيدي الطلاب",
    subtitle: "Built by Students  ·  Free for Families",
    bullets: [
      { ar: "مجانية للأسر · مبنية بالنفقة الشخصية" },
    ],
    sfx: ["tick"],
  },
  {
    n: 14, layout: "bigNumber", kicker: "8  ·  IN  ·  1", accent: G,
    title: "ثمانية أنظمة بسعر صفر للأسرة",
    big: "$200",
    bigCaption: "Monthly Cost Replaced  ·  بديل عن أدوات بـ $200 شهرياً",
    sfx: ["chime"],
  },

  // ===== C — Q2: INSPIRE STUDENTS (5) =====
  {
    n: 15, layout: "qHeader", kicker: "QUESTION  ·  02", accent: B,
    title: "كيف يُلهم المشروع الطلاب؟",
    subtitle: "How does Damij inspire future innovators?",
    sfx: ["whoosh"],
  },
  {
    n: 16, layout: "bigNumber", kicker: "STUDENT  ·  ENGINEERS", accent: N,
    title: "طلاب مبرمجون يقودون كود دامج",
    big: "15",
    bigCaption: "Professional Student Developers",
    bullets: [
      { ar: "يتقنون لغات الحوسبة وقواعد البيانات" },
    ],
    sfx: ["chime"],
  },
  {
    n: 17, layout: "bigNumber", kicker: "GRANT  ·  IMPACT", accent: GR,
    title: "تأهيل دفعة جديدة من الكوادر",
    big: "+30",
    bigCaption: "New Trainees per Year  ·  بحصص الأنشطة المدرسية",
    sfx: ["chime"],
  },
  {
    n: 18, layout: "section", kicker: "LEAD  ·  STUDENT", accent: G, icon: "🎓",
    title: "محمود جوارنة  ·  القدوة الرقمية",
    subtitle: "11 Languages  ·  10 Certificates  ·  AI Masters",
    bullets: [
      { ar: "تأييد البروفيسور عرفات نيابةً عن الأميرة سمية بنت الحسن" },
      { ar: "اختبار أكواد دامج رسمياً داخل المدرسة" },
    ],
    image: "images/damij-students.jpg",
    sfx: ["tick"],
  },
  {
    n: 19, layout: "bigNumber", kicker: "RESEARCH  ·  CATALYST", accent: W,
    title: "محرّك بحوث للجامعات",
    big: "1,200",
    bigCaption: "Clinical Cases for Academic Research",
    bullets: [
      { ar: "تجارب سريرية افتراضية للدكاترة والبروفيسورات" },
    ],
    sfx: ["chime"],
  },

  // ===== D — Q3: SUSTAINABILITY (5) =====
  {
    n: 20, layout: "qHeader", kicker: "QUESTION  ·  03", accent: GR,
    title: "كيف يستمر المشروع طويل الأمد؟",
    subtitle: "Long-term sustainability & impact",
    sfx: ["whoosh"],
  },
  {
    n: 21, layout: "bigNumber", kicker: "PRIZE  ·  GRANT", accent: G,
    title: "منحة الجائزة تُشغّل المنصة 5 سنوات كاملة",
    big: "$150,000",
    bigCaption: "Covers  5  Years of Full Operations",
    sfx: ["chime"],
  },
  {
    n: 22, layout: "bigNumber", kicker: "OPERATING  ·  COST", accent: T,
    title: "كلفة الصيانة المستقبلية",
    big: "$550",
    bigCaption: "Per Month Only  ·  فقط شهرياً",
    sfx: ["chime"],
  },
  {
    n: 23, layout: "section", kicker: "B2B  ·  SAAS", accent: B, icon: "💼",
    title: "تمويل ذاتي تبادلي",
    subtitle: "Self-Sustaining Revenue Model",
    bullets: [
      { ar: "اشتراكات المدارس الخاصة والجامعات" },
      { ar: "بيع تراخيص خوارزميات الـ AI لشركات التقنية" },
    ],
    image: "images/damij-economy.jpg",
    sfx: ["tick"],
  },
  {
    n: 24, layout: "section", kicker: "GOV  ·  ADOPTION", accent: N, icon: "🏛",
    title: "التبني والتعميم الحكومي",
    subtitle: "Ministry of Education  ·  Jordan",
    bullets: [
      { ar: "اجتماع رسمي مع معالي وزير التربية والتعليم" },
      { ar: "إرث “ذروة العلم” المدمج في منصة “أجيال” السيادية" },
    ],
    image: "images/damij-architecture.jpg",
    sfx: ["whoosh"],
  },

  // ===== E — Q4: WHY DESERVE (5) =====
  {
    n: 25, layout: "qHeader", kicker: "QUESTION  ·  04", accent: G,
    title: "لماذا نستحق جائزة زايد للاستدامة؟",
    subtitle: "Why Anaba School deserves the Zayed Prize",
    sfx: ["whoosh"],
  },
  {
    n: 26, layout: "section", kicker: "TRACK  ·  RECORD", accent: B, icon: "🏆",
    title: "سجلّ نجاح حكومي مثبت",
    subtitle: "Proven Government-Adopted Project",
    bullets: [
      { ar: "“ذروة العلم” تبنّته الدولة وأُدمج في منصة “أجيال”" },
      { ar: "كفاءة إدارية ومالية موثّقة" },
    ],
    image: "images/damij-legacy.jpg",
    sfx: ["tick"],
  },
  {
    n: 27, layout: "bigNumber", kicker: "SELF  ·  FUNDED", accent: W,
    title: "بُنينا قبل أن يأتي التمويل",
    big: "15%",
    bigCaption: "of MVP Self-Funded by Students",
    bullets: [
      { ar: "المركز الأول في البحث العلمي بالمملكة 2026" },
    ],
    sfx: ["chime"],
  },
  {
    n: 28, layout: "bigNumber", kicker: "MEDICAL  ·  CERTIFIED", accent: T,
    title: "موثوقية علمية وطبية شاملة",
    big: "500",
    bigCaption: "Specialists Surveyed  ·  Ministry of Health Approved",
    bullets: [
      { ar: "اعتماد مستشفى الملك المؤسس الجامعي" },
    ],
    sfx: ["chime"],
  },
  {
    n: 29, layout: "bigNumber", kicker: "HUMAN  ·  CAPITAL", accent: GR,
    title: "ترسانة بشرية جاهزة لقيادة التغيير",
    big: "45",
    bigCaption: "Student Developers Ready to Scale",
    sfx: ["chime"],
  },

  // ===== F — ENDORSEMENTS & CLOSING (7) =====
  {
    n: 30, layout: "endorse", kicker: "ROYAL  ·  ENDORSEMENT", accent: G,
    title: "إشادة سامية من سمو الأمير الحسن بن طلال",
    subtitle: "HRH Prince El Hassan bin Talal",
    image: "images/damij-royal.jpg",
    sfx: ["chime"],
  },
  {
    n: 31, layout: "endorse", kicker: "ROYAL  ·  SUPPORT", accent: G,
    title: "تأييد سمو الأميرة سمية بنت الحسن",
    subtitle: "via Prof. Arafat  ·  بعد اختبار أكواد دامج",
    image: "images/damij-royal.jpg",
    sfx: ["chime"],
  },
  {
    n: 32, layout: "endorse", kicker: "MINISTERIAL", accent: B,
    title: "دعم وزير التربية والتعليم الأردني",
    subtitle: "Full Support for National Rollout",
    image: "images/damij-architecture.jpg",
    sfx: ["chime"],
  },
  {
    n: 33, layout: "endorse", kicker: "FIELD  ·  PARTNERS", accent: T,
    title: "مديريات الإعاقة + مدارس الملكة علياء للصم",
    subtitle: "Disability Directorates  ·  Queen Alia Schools",
    image: "images/damij-village.jpg",
    sfx: ["tick"],
  },
  {
    n: 34, layout: "bigNumber", kicker: "TARGET  ·  IMPACT", accent: G,
    title: "أثر يخدم خُمس المجتمع",
    big: "50,000",
    bigCaption: "Active Users  ·  Targeting 20% of Society",
    sfx: ["chime"],
  },
  {
    n: 35, layout: "qHeader", kicker: "OUR  ·  PROMISE", accent: N,
    title: "جسور العدالة والدمج الإنساني الرقمي",
    subtitle: "Bridges of Justice for Every Marginalized Group",
    sfx: ["whoosh"],
  },
  {
    n: 36, layout: "closing", kicker: "DAMIJ  ·  2026", accent: G,
    title: "دامِج",
    subtitle: "damij-jo.life",
    sfx: ["chime"],
  },
];
