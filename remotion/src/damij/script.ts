import { D } from "./theme";

export type SlideLayout =
  | "cover"
  | "featureBullets"
  | "sectionsGrid"
  | "innovation"
  | "qHeader"
  | "bigNumber"
  | "fundingList"
  | "credibility"
  | "endorseList"
  | "closing";

export type Slide = {
  n: number;
  layout: SlideLayout;
  kicker: string;
  accent: string;
  title?: string;
  subtitle?: string;
  lead?: string;        // creative intro lead (cover)
  tagline?: string;     // upper micro line (cover)
  big?: string;
  bigCaption?: string;
  bigCaptionAr?: string; // Arabic caption beneath big number (RTL)
  bullets?: { ar: string; en?: string }[];
  groups?: { heading: string; items: string[] }[];
  sfx?: ("whoosh" | "chime" | "tick")[];
};

const G = D.gold;
const N = D.primary;
const T = D.teal;
const GR = D.green;
const W = D.warm;
const B = D.primary2;

export const SLIDES: Slide[] = [
  // 1 — Cover (enhanced intro)
  {
    n: 1, layout: "cover", kicker: "DAMIJ  ·  2026", accent: G,
    tagline: "حين تصبح التقنية رحمة",
    title: "دامِج",
    lead: "منصة واحدة · ثمانية أنظمة · مليون قصة دمج",
    subtitle: "جسر العدالة الرقمية لكل الفئات المهمشة",
    sfx: ["whoosh", "chime"],
  },

  // 2 — Blind Eye (multilingual TTS)
  {
    n: 2, layout: "featureBullets", kicker: "01  ·  BLIND EYE", accent: B,
    title: "العين الإعمى",
    subtitle: "Blind Eye  ·  بصرٌ بالذكاء الاصطناعي",
    bullets: [
      { ar: "وصف فوري للمشهد بالعربية", en: "Real-time scene captioning" },
      { ar: "قراءة النصوص المكتوبة بالكاميرا", en: "Live OCR for printed text" },
      { ar: "صوت طبيعي للمكفوفين بالعربية والإنجليزية والفرنسية والإسبانية والألمانية والتركية", en: "Natural TTS · AR · EN · FR · ES · DE · TR" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 3 — Clinical Lab (RTL number + new wording)
  {
    n: 3, layout: "bigNumber", kicker: "02  ·  CLINICAL LAB", accent: W,
    title: "المختبر السريري الافتراضي",
    big: "1,200",
    bigCaptionAr: "حالة سريرية موثّقة",
    bigCaption: "Verified Clinical Cases",
    bullets: [
      { ar: "تدريب الطلاب على التشخيص" },
      { ar: "بروتوكولات وأجهزة طبية معتمدة" },
      { ar: "بيئة آمنة لتجربة القرارات الطبية" },
    ],
    sfx: ["whoosh", "chime"],
  },

  // 4 — Sign Language
  {
    n: 4, layout: "featureBullets", kicker: "03  ·  SIGN LANGUAGE", accent: T,
    title: "مترجم لغة الإشارة",
    subtitle: "120 Sign Languages  ·  MediaPipe Hand Tracking",
    bullets: [
      { ar: "تتبّع مفاصل اليد بدقة عالية", en: "Precise joint tracking" },
      { ar: "ترجمة فورية ثنائية الاتجاه", en: "Two-way live translation" },
      { ar: "قاموس قابل للتوسعة والتحديث", en: "Expandable dictionary" },
      { ar: "دعم اللهجات الإقليمية", en: "Regional dialect support" },
      { ar: "يعمل دون اتصال بالإنترنت", en: "Full offline support" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick"],
  },

  // 5 — Braille (expanded elegant features)
  {
    n: 5, layout: "featureBullets", kicker: "04  ·  BRAILLE", accent: G,
    title: "تعليم برايل التفاعلي",
    subtitle: "Tactile Learning  ·  Speed · Accuracy · Tactile PDF",
    bullets: [
      { ar: "لوحة مفاتيح برايل افتراضية كاملة", en: "Virtual braille keyboard" },
      { ar: "مقاييس فورية للسرعة والدقة", en: "Speed & accuracy meters" },
      { ar: "دروس متدرّجة من الحرف إلى الجملة", en: "Letter-to-sentence curriculum" },
      { ar: "تصدير PDF لمسي قابل للطباعة بارزاً", en: "Tactile PDF export" },
      { ar: "قراءة تشاركية مع المعلّم", en: "Co-reading mode" },
      { ar: "تقارير تقدّم تفصيلية لولي الأمر", en: "Detailed progress reports" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick", "tick"],
  },

  // 6 — Autism (expanded)
  {
    n: 6, layout: "featureBullets", kicker: "05  ·  AUTISM", accent: GR,
    title: "أطفال طيف التوحد",
    subtitle: "Autism Screening · Therapy Games · Reports",
    bullets: [
      { ar: "تقييم اللعب والانتباه المشترك", en: "Joint attention assessment" },
      { ar: "ألعاب علاجية للتعرّف على المشاعر", en: "Emotion recognition games" },
      { ar: "تدريب الاستجابة للاسم والتفاعل", en: "Response-to-name training" },
      { ar: "خطط علاج فردية بالذكاء الاصطناعي", en: "AI individualized plans" },
      { ar: "وضع حسّي قابل للتعديل لكل طفل", en: "Per-child sensory mode" },
      { ar: "تقارير تطوّر للأهل والمختصين", en: "Progress reports" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick", "tick"],
  },

  // 7 — ADHD (expanded)
  {
    n: 7, layout: "featureBullets", kicker: "06  ·  ADHD", accent: W,
    title: "اضطراب فرط الحركة وتشتّت الانتباه",
    subtitle: "ADHD Engine  ·  Research-Based Instruments & Games",
    bullets: [
      { ar: "أدوات قياس مستندة للأبحاث المعيارية", en: "Standardized instruments" },
      { ar: "ألعاب تدريب تركيز تفاعلية", en: "Focus training games" },
      { ar: "تسجيل دقيق لكل حركة داخل اللعبة", en: "Per-move logging" },
      { ar: "محرّك تقييم آلي للنتائج", en: "Auto-scoring engine" },
      { ar: "تقارير قابلة للطباعة للأهل والأطباء", en: "Printable reports" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick"],
  },

  // 8 — Sensory
  {
    n: 8, layout: "featureBullets", kicker: "07  ·  SENSORY", accent: B,
    title: "النظام الحسّي التكيّفي",
    subtitle: "Adaptive UI + Haptic Feedback",
    bullets: [
      { ar: "واجهة تتكيف مع كل طفل تلقائياً", en: "Per-child adaptive UI" },
      { ar: "تنبيهات لمسية واهتزاز ذكي", en: "Smart haptic alerts" },
      { ar: "تسجيل سلوكي مستمر", en: "Continuous interaction log" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 9 — Library
  {
    n: 9, layout: "featureBullets", kicker: "08  ·  LIBRARY", accent: T,
    title: "مكتبة المصادر العلمية",
    subtitle: "Verified Knowledge Base",
    bullets: [
      { ar: "مرجعيات طبية وأكاديمية موثّقة", en: "Verified medical refs" },
      { ar: "محرّك بحث ذكي بالعربية", en: "Smart Arabic search" },
      { ar: "تحديث مستمر بإشراف مختصين", en: "Expert-curated updates" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 10 — 8 systems grid
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

  // 11 — Why innovative
  {
    n: 11, layout: "innovation", kicker: "WHY  ·  INNOVATIVE", accent: G,
    title: "منصة موحّدة بدلاً من أدوات متفرقة",
    subtitle: "Unified Platform  vs  Fragmented Tools",
    bullets: [{ ar: "حساب واحد · لغة واحدة · بيانات موحّدة" }],
    sfx: ["whoosh"],
  },

  // 12 — Multimodal AI
  {
    n: 12, layout: "innovation", kicker: "MULTIMODAL  ·  AI", accent: T,
    title: "ذكاء اصطناعي متعدد الوسائط",
    subtitle: "Vision · Speech · Text · Gestures",
    bullets: [{ ar: "نموذج واحد يفهم الصوت والصورة والإشارة" }],
    sfx: ["whoosh"],
  },

  // 13 — Q2 header
  {
    n: 13, layout: "qHeader", kicker: "QUESTION  ·  02", accent: B,
    title: "كيف يُلهم المشروع الطلاب؟",
    subtitle: "How Damij inspires future innovators",
    sfx: ["whoosh"],
  },

  // 14 — +30 trainees per year × 3 years
  {
    n: 14, layout: "bigNumber", kicker: "STUDENT  ·  TEAM", accent: GR,
    title: "فريق طلابي يقود الكود والتأهيل",
    big: "+30",
    bigCaptionAr: "طالب سنوياً لمدة 3 سنوات بقيادة الطالب محمود جوارنة",
    bigCaption: "Trainees per Year for 3 Years · Led by Mahmoud Jawarneh",
    bullets: [
      { ar: "طلاب من مدرسة عنبة يتقنون البرمجة وقواعد البيانات" },
      { ar: "نقل الخبرة بين الدفعات عبر الأنشطة المدرسية" },
    ],
    sfx: ["whoosh", "chime", "tick", "tick"],
  },

  // 15 — (was 16) Inspiration idea
  {
    n: 15, layout: "featureBullets", kicker: "THE  ·  IDEA", accent: B,
    title: "كيف يُلهم دامِج جيلاً من المبتكرين؟",
    subtitle: "Students Building for Students",
    bullets: [
      { ar: "الكود قبل الشهادة · تعلّم بالممارسة الحقيقية" },
      { ar: "تجربة ميدانية على مستخدمين حقيقيين" },
      { ar: "فرق بحثية طلابية مع جامعات وأطباء" },
      { ar: "نموذج «طلاب يصنعون لطلاب» يكسر الحاجز النفسي" },
      { ar: "انتقال المعرفة بين الدفعات كإرث متراكم" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick"],
  },

  // 16 — (was 17) Impact bullets
  {
    n: 16, layout: "featureBullets", kicker: "THE  ·  IMPACT", accent: GR,
    title: "الأثر الذي نتركه على الطلاب",
    subtitle: "Long-term Generational Impact",
    bullets: [
      { ar: "نشر ثقافة البرمجة في مدارس الأطراف والريف" },
      { ar: "خفض الفجوة الرقمية بين المدارس الحكومية والخاصة" },
      { ar: "تحويل الطالب من مستهلك للتقنية إلى صانع لها" },
      { ar: "بناء سيرة ذاتية حقيقية قبل التخرّج" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick"],
  },

  // 17 — (was 19) Q3 header
  {
    n: 17, layout: "qHeader", kicker: "QUESTION  ·  03", accent: GR,
    title: "كيف يستمر المشروع طويل الأمد؟",
    subtitle: "Long-term sustainability & impact",
    sfx: ["whoosh"],
  },

  // 18 — (was 20) $150,000 grant
  {
    n: 18, layout: "bigNumber", kicker: "PRIZE  ·  GRANT", accent: G,
    title: "منحة الجائزة تُشغّل المنصة 5 سنوات كاملة",
    big: "$150,000",
    bigCaptionAr: "تغطّي خمس سنوات من التشغيل الكامل",
    bigCaption: "Covers 5 Years of Full Operations",
    sfx: ["whoosh", "chime"],
  },

  // 19 — (was 21) $550 monthly
  {
    n: 19, layout: "bigNumber", kicker: "OPERATING  ·  COST", accent: T,
    title: "كلفة الصيانة المستقبلية منخفضة",
    big: "$550",
    bigCaptionAr: "شهرياً فقط لاستمرار المنصة",
    bigCaption: "Per Month Only",
    sfx: ["whoosh", "chime"],
  },

  // 20 — (was 22) Funding methods
  {
    n: 20, layout: "fundingList", kicker: "FUNDING  ·  MODEL", accent: B,
    title: "نموذج تمويل متعدّد المصادر",
    subtitle: "Self-Sustaining Revenue Streams",
    bullets: [
      { ar: "اشتراكات المدارس الخاصة والدولية", en: "Private school subscriptions" },
      { ar: "تراخيص خوارزميات الذكاء الاصطناعي لشركات التقنية", en: "AI algorithm licensing" },
      { ar: "شراكات بحثية مع الجامعات الأردنية والإقليمية", en: "University research partnerships" },
      { ar: "عقود مؤسسية مع وزارة التربية والتعليم", en: "Ministry of Education contracts" },
      { ar: "رعايات المسؤولية المجتمعية للشركات الكبرى", en: "Corporate CSR sponsorships" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick", "tick", "tick"],
  },

  // 21 — (was 23) Government adoption
  {
    n: 21, layout: "featureBullets", kicker: "GOV  ·  ADOPTION", accent: N,
    title: "التبنّي والتعميم الحكومي",
    subtitle: "Ministry of Education  ·  Jordan",
    bullets: [
      { ar: "اجتماع رسمي مع معالي وزير التربية والتعليم" },
      { ar: "إرث «ذروة العلم» نُشر على المدارس الحكومية والخاصة بدعم حكومي" },
      { ar: "خارطة طريق لتعميم دامج على مدارس المملكة" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 22 — (was 24) Q4 header
  {
    n: 22, layout: "qHeader", kicker: "QUESTION  ·  04", accent: G,
    title: "لماذا نستحق جائزة زايد للاستدامة؟",
    subtitle: "Why Anaba School deserves the Zayed Prize",
    sfx: ["whoosh"],
  },

  // 23 — (was 25) Track record
  {
    n: 23, layout: "featureBullets", kicker: "TRACK  ·  RECORD", accent: B,
    title: "سجلّ نجاح حكومي مثبت",
    subtitle: "Proven Government-Adopted Project",
    bullets: [
      { ar: "المركز الأول في جائزة الحسن بن طلال للإبداع العلمي" },
      { ar: "المركز الأول على مستوى المملكة في الذكاء الاصطناعي" },
      { ar: "كفاءة إدارية ومالية موثّقة" },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 24 — (was 26) 15% self-funded (RTL + new wording)
  {
    n: 24, layout: "bigNumber", kicker: "SELF  ·  FUNDED", accent: W,
    title: "بُنينا قبل أن يأتي التمويل",
    big: "15%",
    bigCaptionAr: "من المشروع تم بناؤه حتى الآن بتمويل ذاتي من أعضاء فريق العمل",
    bigCaption: "of the MVP Self-Funded by Team Members",
    sfx: ["whoosh", "chime"],
  },

  // 25 — (was 27) Credibility
  {
    n: 25, layout: "credibility", kicker: "MEDICAL  ·  CREDIBILITY", accent: T,
    title: "موثوقية علمية وطبية شاملة",
    subtitle: "Validated by Surveys, Doctors & Institutions",
    groups: [
      { heading: "استبيان ميداني", items: ["500 مشارك من المتخصصين والمستخدمين"] },
      { heading: "فريق طبي مشارك", items: ["أكثر من 30 طبيباً ضمن فريق العمل"] },
      {
        heading: "مؤسسات مؤيِّدة للفكرة",
        items: [
          "مستشفى الملك عبدالله الجامعي",
          "مستشفى الرحمة",
          "مستشفى بسمة",
          "وزارة الصحة الأردنية",
        ],
      },
    ],
    sfx: ["whoosh", "tick", "tick", "tick"],
  },

  // 26 — (was 28) Endorsements
  {
    n: 26, layout: "endorseList", kicker: "OFFICIAL  ·  ENDORSEMENTS", accent: G,
    title: "تأييدات سامية ومؤسسية",
    subtitle: "Royal · Ministerial · Field Partners",
    bullets: [
      { ar: "إشادة سامية من سمو الأمير الحسن بن طلال", en: "HRH Prince El Hassan bin Talal" },
      { ar: "تأييد نائب سمو الأميرة سمية بنت الحسن", en: "Deputy of HRH Princess Sumaya bint El Hassan" },
      { ar: "دعم معالي وزير التربية والتعليم الأردني", en: "Jordanian Minister of Education" },
      { ar: "مديريات الإعاقة + مدارس الملكة علياء للصم", en: "Disability Directorates & Queen Alia Schools" },
    ],
    sfx: ["whoosh", "chime", "chime", "chime", "chime"],
  },

  // 27 — (was 29) 500,000+ served
  {
    n: 27, layout: "bigNumber", kicker: "TARGET  ·  IMPACT", accent: G,
    title: "أثر يخدم أكثر من نصف مليون شخص",
    big: "500,000+",
    bigCaptionAr: "مستفيد في الأردن والمنطقة",
    bigCaption: "People Served Across Jordan & Region",
    sfx: ["whoosh", "chime"],
  },

  // 28 — Closing
  {
    n: 28, layout: "closing", kicker: "DAMIJ  ·  2026", accent: G,
    title: "دامِج",
    subtitle: "damij-jo.life",
    sfx: ["whoosh", "chime"],
  },
];
