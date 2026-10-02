import { PlatformResourceMention } from '@/data/platformMentionsData';

export interface CommunityMessage {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentRole: 'طالب متميز' | 'طالب توجيهي' | 'مهندس BTEC' | 'مشرف أكاديمي' | 'سفير العلوم';
  studentGrade: string;
  channelId: 'general' | 'physics' | 'chemistry' | 'robotics' | 'tawjihi' | 'btec';
  content: string;
  imageUrl?: string;
  platformMention?: PlatformResourceMention;
  timestamp: string;
  createdAt: number;
  reactions: {
    thumbsUp: number;
    inspiring: number;
    question: number;
    brilliant: number;
    userReacted?: string;
  };
  isPinned?: boolean;
  status: 'approved' | 'flagged' | 'blocked';
  flagReason?: string;
  safetyScore: number;
  replyTo?: {
    id: string;
    studentName: string;
    snippet: string;
  };
}

export interface CommunityChannel {
  id: CommunityMessage['channelId'];
  name: string;
  iconName: string;
  icon?: string;
  color: string;
  description: string;
  badge: string;
}

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    id: 'general',
    name: 'الميدان العام لجميع الطلبة',
    iconName: 'Globe',
    color: 'blue',
    description: 'ملتقى عام لتبادل الخبرات العلمية، الترحيب بالزملاء، والنقاشات المدرسية المفتوحة.',
    badge: 'عام'
  },
  {
    id: 'physics',
    name: 'مختبرات ونقاشات الفيزياء والمحاكاة',
    iconName: 'Atom',
    color: 'cyan',
    description: 'طرح الأسئلة حول ميكانيكا المقذوفات، مصادم LHC، كهرومغناطيسية ماكسويل، وتجارب 3D.',
    badge: 'فيزياء'
  },
  {
    id: 'chemistry',
    name: 'مختبر الكيمياء والهندسة الوراثية',
    iconName: 'FlaskConical',
    color: 'emerald',
    description: 'نقاشات تفاعلات الاتزان، الحموض والقواعد، ومحاكي تعديل الجينات CRISPR-Cas9.',
    badge: 'كيمياء'
  },
  {
    id: 'robotics',
    name: 'نادي الروبوتات والذكاء الاصطناعي',
    iconName: 'Bot',
    color: 'purple',
    description: 'مشاركة أكواد ROS 2، حركيات الأذرع الروبوتية، مشاريع Wokwi، والتعرف البصري YOLOv8.',
    badge: 'روبوتات و AI'
  },
  {
    id: 'tawjihi',
    name: 'ملتقى طلبة التوجيهي الأردني 2026',
    iconName: 'GraduationCap',
    color: 'teal',
    description: 'مراجعة بنوك الأسئلة الوزارية، حلول الامتحانات المقترحة، واستراتيجيات التفوق المدرسي.',
    badge: 'توجيهي'
  },
  {
    id: 'btec',
    name: 'ملتقى برامج Pearson BTEC والمشاريع',
    iconName: 'Briefcase',
    color: 'amber',
    description: 'عرض نماذج التوأم الرقمي، استشارات مشاريع التخرج، ومواصفات الاعتماد المهني الدولي.',
    badge: 'BTEC'
  }
];

export const INITIAL_COMMUNITY_MESSAGES: CommunityMessage[] = [
  {
    id: 'msg-100',
    studentName: 'م. أحمد الخوالدة',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    studentRole: 'مشرف أكاديمي',
    studentGrade: 'إدارة التعليم الرقمي والمناهج',
    channelId: 'general',
    content: 'أهلاً وسهلاً بجميع طلبة ذروة العلم في الميدان العام! 🌌 هذا المنتدى مفتوح لجميع النقاشات العلمية، الأسئلة التفاعلية، ومشاركة تجاربكم في المختبرات ثلاثية الأبعاد والذكاء الاصطناعي. يمكنكم رفع الصور ووضع إشارة لأي محاكاة أو صفحة بالمنصة بالضغط على زر (@) ليتمكن زملاؤكم من الانتقال إليها بنقرة واحدة!',
    platformMention: {
      id: 'sim-lhc',
      title: 'مصادم الهادرونات الكبير 3D (LHC Cern)',
      category: 'محاكاة علمية',
      categoryKey: 'simulations',
      route: '/lhc-simulation',
      iconName: 'Atom',
      badge: 'جسيمات أولية',
      summary: 'محاكاة تسريع البروتونات واصطدامها مع بوزون هيغز وحسابات الطاقة النسبية.'
    },
    timestamp: 'منذ 5 دقائق',
    createdAt: Date.now() - 5 * 60 * 1000,
    reactions: { thumbsUp: 35, inspiring: 22, question: 1, brilliant: 19 },
    isPinned: true,
    status: 'approved',
    safetyScore: 100.0
  },
  {
    id: 'msg-100b',
    studentName: 'رند المجالي',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    studentRole: 'سفير العلوم',
    studentGrade: 'الصف الثاني عشر - علمي',
    channelId: 'general',
    content: 'مرحباً بالجميع! أود تذكيركم بميزة رائعة في قسم الذكاء الاصطناعي "صانع الجداول الذكي". قام بتوليد جدول مذاكرة دقيق لمادتي الفيزياء والكيمياء قبل امتحانات الشهر الثاني وأنصح الجميع بتجربته:',
    platformMention: {
      id: 'tool-study-schedule',
      title: 'مخطط ومنظم جدول المذاكرة الذكي',
      category: 'أداة ذكاء اصطناعي',
      categoryKey: 'ai',
      route: '/study-schedule',
      iconName: 'Sparkles',
      badge: 'جدولة ذكية',
      summary: 'توليد جداول دراسية مخصصة أسبوعية وتوزيع أوقات الراحة وفق منحنى النسيان.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    timestamp: 'منذ 10 دقائق',
    createdAt: Date.now() - 10 * 60 * 1000,
    reactions: { thumbsUp: 28, inspiring: 17, question: 2, brilliant: 14 },
    isPinned: false,
    status: 'approved',
    safetyScore: 99.7
  },
  {
    id: 'msg-101',
    studentName: 'عمر القواسمي',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    studentRole: 'طالب متميز',
    studentGrade: 'الصف الثاني عشر - علمي (توجيهي)',
    channelId: 'physics',
    content: 'مرحباً زملائي! كنت أجرب محاكاة قطرة الزيت لميليكان بالمنصة، ولاحظت أنه عند ضبط الجهد الكهربائي على 285V يحصل اتزان دقيق بين قوة الجاذبية والقوة الكهربائية. شاركت رابط المحاكاة أدناه لمن يريد اختبارها معاي!',
    platformMention: {
      id: 'millikan-simulation',
      title: 'محاكي قطرة الزيت لميليكان (Millikan)',
      category: 'محاكاة علمية',
      categoryKey: 'simulations',
      route: '/simulations/millikan',
      iconName: 'Atom',
      badge: 'كهرومغناطيسية',
      summary: 'موازنة قوى الجاذبية والمجال الكهربائي لحساب الشحنة الأساسية للإلكترون.'
    },
    timestamp: 'منذ 15 دقيقة',
    createdAt: Date.now() - 15 * 60 * 1000,
    reactions: { thumbsUp: 18, inspiring: 9, question: 2, brilliant: 7 },
    isPinned: true,
    status: 'approved',
    safetyScore: 99.9
  },
  {
    id: 'msg-102',
    studentName: 'سارة المهيرات',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    studentRole: 'مهندس BTEC',
    studentGrade: 'دبلوم BTEC Level 3 الهندسي',
    channelId: 'robotics',
    content: 'مساء الخير يا مبدعين! جربت كود حل الحركيات العكسية (IK) في قسم الروبوتات اليوم للوصول لنقطة X=140 و Y=90، وحسب لي زوايا المفاصل بدقة مذهلة ودار السيرفو فوراً. التغذية الراجعة من المعلم الذكي فادتني جداً في مشروعي! أنصحكم بتجربتها:',
    platformMention: {
      id: 'robotics-arm',
      title: 'حركيات الذراع الروبوتية والمفاصل (Kinematics)',
      category: 'مختبر روبوتات',
      categoryKey: 'robotics',
      route: '/robotics-section?tab=arm',
      iconName: 'Bot',
      badge: 'Forward & Inverse IK',
      summary: 'حساب زوايا المفاصل وإحداثيات نقطة العمل (TCP) والمحركات المؤازرة 3D.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    timestamp: 'منذ 35 دقيقة',
    createdAt: Date.now() - 35 * 60 * 1000,
    reactions: { thumbsUp: 24, inspiring: 14, question: 3, brilliant: 12 },
    isPinned: false,
    status: 'approved',
    safetyScore: 99.8
  },
  {
    id: 'msg-103',
    studentName: 'زيد الطراونة',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    studentRole: 'طالب توجيهي',
    studentGrade: 'الثانوية العامة - الفرع العلمي',
    channelId: 'tawjihi',
    content: 'سؤال يا جماعة بخصوص منهاج الكيمياء الجديد: في درس الاتزان الكيميائي ومبدأ لوشاتيليه، لما نزيد الضغط على تفاعل غازي فيه 3 مولات متفاعلات ومولين نواتج، كيف بيكون الانزياح؟ هل هو نحو النواتج؟ دخلت على محاكي الاتزان وتأكدت بنفسي وطلع الجواب نعم!',
    platformMention: {
      id: 'curriculum-chemistry',
      title: 'منهاج الكيمياء - الثانوية العامة (التوجيهي)',
      category: 'منهاج ومادة',
      categoryKey: 'curriculum',
      route: '/chemistry',
      iconName: 'FlaskConical',
      badge: 'توجيهي علمي 2026',
      summary: 'الحموض والقواعد، سرعة التفاعلات والاتزان، وتفاعلات التأكسد والاختزال.'
    },
    timestamp: 'منذ ساعة',
    createdAt: Date.now() - 60 * 60 * 1000,
    reactions: { thumbsUp: 12, inspiring: 5, question: 6, brilliant: 8 },
    isPinned: false,
    status: 'approved',
    safetyScore: 99.6
  }
];

// Inappropriate / Offensive word list for strict moderation
const PROHIBITED_WORDS = [
  'كلب', 'حمار', 'غبي', 'تافه', 'حقير', 'سافل', 'فاشل', 'منحط', 'وسخ', 
  'قذر', 'سب', 'شتم', 'انتحار', 'قتل', 'موت', 'تهديد', 'اختراق', 'تهكير', 
  'تسريب', 'امتحان مسرب', 'بيع حسابات', 'شتيمة', 'لعنة', 'سخيف',
  'stupid', 'idiot', 'hate', 'kill', 'leak', 'cheat', 'hack', 'bitch', 'ass'
];

export interface ModerationAuditResult {
  isSafe: boolean;
  score: number;
  severity: 'none' | 'low' | 'medium' | 'high';
  reason: string;
  flagReason?: string;
}

export function auditMessageSafety(content: string, hasImage?: boolean): ModerationAuditResult {
  const normalized = content.toLowerCase();
  
  for (const word of PROHIBITED_WORDS) {
    if (normalized.includes(word)) {
      return {
        isSafe: false,
        score: 18.5,
        severity: 'high',
        reason: `رصد محتوى مخالف لسياسة السلوك المدرسي والنزاهة (الكلمة المكتشفة: "${word}")`
      };
    }
  }

  // Link spam check
  if ((content.match(/http/g) || []).length > 3) {
    return {
      isSafe: false,
      score: 35.0,
      severity: 'medium',
      reason: 'رصد روابط متعددة مشبوهة قد تخالف سياسة منع الإعلانات والروابط الخارجية'
    };
  }

  return {
    isSafe: true,
    score: hasImage ? 99.4 : 99.9,
    severity: 'none',
    reason: 'المحتوى آمن وملتزم بآداب النقاش العلمي'
  };
}
