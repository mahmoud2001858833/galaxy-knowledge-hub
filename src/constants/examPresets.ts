import { BloomLevel } from '@/services/aiExamService';

export interface BloomLevelInfo {
  id: BloomLevel;
  label: string;
  desc: string;
  color: string;
}

export const BLOOM_LEVELS: BloomLevelInfo[] = [
  { id: 'remember', label: 'تذكّر (Remember)', desc: 'استرجاع الحقائق والقوانين والمفاهيم الأساسية', color: 'from-blue-500 to-indigo-600' },
  { id: 'understand', label: 'فهم (Understand)', desc: 'تفسير الظواهر والمقارنة بين المفاهيم', color: 'from-cyan-500 to-blue-600' },
  { id: 'apply', label: 'تطبيق (Apply)', desc: 'استخدام القوانين في سياقات ومسائل جديدة', color: 'from-emerald-500 to-teal-600' },
  { id: 'analyze', label: 'تحليل (Analyze)', desc: 'تفكيك المسألة واستنتاج العلاقات والرسوم البيانية', color: 'from-amber-500 to-orange-600' },
  { id: 'evaluate', label: 'تقييم (Evaluate)', desc: 'إصدار أحكام ونقد الفرضيات والنتائج التجريبية', color: 'from-purple-500 to-pink-600' },
  { id: 'create', label: 'ابتكار (Create)', desc: 'تصميم تجربة أو ابتكار حل علمي غير تقليدي', color: 'from-rose-500 to-red-600' }
];

export interface CurriculumPreset {
  id: string;
  badge: string;
  title: string;
  subject: string;
  targetLevel: string;
  topic: string;
  durationMinutes: number;
  totalMarks: number;
  icon: string;
  notes: string;
  color: string;
}

export const CURRICULUM_PRESETS: CurriculumPreset[] = [
  {
    id: 'physics_tawjihi',
    badge: 'توجيهي علمي',
    title: 'فيزياء: الكهرومغناطيسية والكم',
    subject: 'الفيزياء الحديثة والكلاسيكية',
    targetLevel: 'الثانوية العامة (التوجيهي الأردني)',
    topic: 'الحث الكهرومغناطيسي، الحث الذاتي والمتبادل، والظاهرة الكهروضوئية',
    durationMinutes: 90,
    totalMarks: 100,
    icon: '⚛️',
    notes: 'مخططات دوائر وتبرير كامل لجميع البدائل وتطبيق قوانين فاراداي ولنز وآينشتاين',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'chemistry_tawjihi',
    badge: 'توجيهي علمي',
    title: 'كيمياء: الحموض والقواعد والاتزان',
    subject: 'الكيمياء (الثانوية العامة - التوجيهي الأردني)',
    targetLevel: 'الثانوية العامة (التوجيهي الأردني)',
    topic: 'الاتزان في محاليل الحموض والقواعد وتأثير الأيون المشترك والمحلول المنظم pH والكيمياء الكهربائية',
    durationMinutes: 90,
    totalMarks: 100,
    icon: '🧪',
    notes: 'حسابات Ka و pH والمحلول المنظم وتحديد الأزواج المترافقة وخلايا دانيال الجلفانية',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'math_scientific',
    badge: 'توجيهي علمي',
    title: 'رياضيات: التفاضل وتطبيقات القيم القصوى',
    subject: 'الرياضيات والتفاضل والتكامل (التوجيهي الأردني)',
    targetLevel: 'الثانوية العامة (التوجيهي الأردني)',
    topic: 'قواعد الاشتقاق، المعدلات المرتبطة بالزمن، وتطبيقات القيم القصوى الهندسية',
    durationMinutes: 120,
    totalMarks: 100,
    icon: '📐',
    notes: 'خطوات إيجاد المشتقات والمعدلات وتحديد إشارات المشتقة الأولى والثانية',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'biology_tawjihi',
    badge: 'توجيهي علمي',
    title: 'علوم حياتية: الوراثة وتضاعف DNA',
    subject: 'العلوم الحياتية والوراثة (التوجيهي الأردني)',
    targetLevel: 'الثانوية العامة (التوجيهي الأردني)',
    topic: 'الوراثة المندلية وسجل النسب، وتضاعف DNA وبناء البروتين والسيال العصبي',
    durationMinutes: 90,
    totalMarks: 100,
    icon: '🧬',
    notes: 'مربعات بانيت وحساب الروابط الهيدروجينية وترجمة كودونات mRNA',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'btec_robotics',
    badge: 'BTEC دولي',
    title: 'تكنولوجيا وBTEC: الروبوتات والمتحكمات',
    subject: 'تكنولوجيا المعلومات BTEC',
    targetLevel: 'مسار Pearson BTEC الدولي',
    topic: 'المتحكمات الدقيقة، برمجة أردوينو، والحساسات الرقمية والتناظرية والتحكم PWM',
    durationMinutes: 90,
    totalMarks: 100,
    icon: '🤖',
    notes: 'حسابات التردد وزوايا المحركات الخطوية ومخطط الدوائر المتكاملة',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'english_tawjihi',
    badge: 'توجيهي أردني',
    title: 'اللغة الإنجليزية: القراءة والقواعد',
    subject: 'اللغة الإنجليزية (English Language)',
    targetLevel: 'الثانوية العامة (التوجيهي الأردني)',
    topic: 'Reading Comprehension, Conditionals, Passive Voice and Academic Collocations',
    durationMinutes: 90,
    totalMarks: 100,
    icon: '🇬🇧',
    notes: 'Grammar transformation, inferences, and contextual vocabulary analysis',
    color: 'from-blue-600 to-sky-700'
  }
];
