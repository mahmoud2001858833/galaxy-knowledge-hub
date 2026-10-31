import type { LucideIcon } from 'lucide-react';
import {
  Atom,
  BookOpen,
  BookMarked,
  Brain,
  Building2,
  CalendarDays,
  Calculator,
  ClipboardCheck,
  Code2,
  Cpu,
  FileScan,
  FlaskConical,
  Globe2,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartPulse,
  Image,
  Languages,
  Leaf,
  LineChart,
  Map,
  MessageSquare,
  MessagesSquare,
  Microscope,
  Moon,
  Newspaper,
  Palette,
  PenTool,
  Puzzle,
  Repeat,
  Rocket,
  ScanFace,
  School,
  Sigma,
  Sparkles,
  Store,
  Trophy,
  Users,
  Video,
} from 'lucide-react';

/**
 * Single source of truth for the platform's information architecture.
 * Navbar, section hub pages and the future-projects page all read from here,
 * so adding/moving a page means editing this file only.
 * See docs/PLATFORM_IDENTITY.md for the reasoning behind the grouping.
 */

export interface PlatformPage {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  /** Requires a signed-in user (mirrors the AuthGuard in App.tsx) */
  requiresAuth?: boolean;
}

export interface PlatformSection {
  id: string;
  title: string;
  /** Short label for the navbar */
  navLabel: string;
  tagline: string;
  path: string;
  icon: LucideIcon;
  pages: PlatformPage[];
}

export const CORE_SECTIONS: PlatformSection[] = [
  {
    id: 'learn',
    title: 'التعلّم والمنهاج',
    navLabel: 'التعلّم',
    tagline: 'المواد الدراسية للمنهاج الأردني مع مساعد ذكي يشرح من الكتاب المدرسي نفسه',
    path: '/learn',
    icon: GraduationCap,
    pages: [
      { title: 'المساعد الأردني', description: 'اسأل عن أي درس وتحصل على شرح من كتاب وزارة التربية', path: '/jordanian-assistant', icon: Sparkles, requiresAuth: true },
      { title: 'الفيزياء', description: 'دروس ومحاكاة وأسئلة الفيزياء', path: '/physics', icon: Atom },
      { title: 'الكيمياء', description: 'التفاعلات والعناصر والتجارب', path: '/chemistry', icon: FlaskConical },
      { title: 'الرياضيات', description: 'الدروس والآلة الحاسبة والرسوم البيانية', path: '/mathematics', icon: Sigma },
      { title: 'الأحياء', description: 'الخلية والوراثة وجسم الإنسان', path: '/biology', icon: Microscope, requiresAuth: true },
      { title: 'اللغة الإنجليزية', description: 'القواعد والكتابة وبنك الأسئلة', path: '/english-language', icon: Languages },
      { title: 'التربية الإسلامية', description: 'الأحداث الهجرية والعصور التاريخية', path: '/islamic-education', icon: Moon },
      { title: 'BTEC', description: 'مسارات BTEC وتقنية المعلومات والبرمجة', path: '/btec', icon: Code2 },
      { title: 'المنصات العلمية', description: 'مصادر الفروع العلمية', path: '/scientific-platforms', icon: Globe2 },
      { title: 'المنصات الأدبية', description: 'مصادر الفروع الأدبية', path: '/literary-platforms', icon: BookMarked },
      { title: 'الفيديوهات التعليمية', description: 'دروس مرئية مصنفة حسب المادة', path: '/educational-videos', icon: Video, requiresAuth: true },
      { title: 'المكتبة المرئية', description: 'صور ورسوم تعليمية لكل مادة', path: '/visual-library', icon: Image },
      { title: 'المجلة العلمية', description: 'أبحاث ومقالات علمية', path: '/scientific-journal', icon: BookOpen },
    ],
  },
  {
    id: 'exams',
    title: 'الامتحانات والتقييم',
    navLabel: 'الامتحانات',
    tagline: 'أنشئ امتحاناً من كتابك في دقائق، شاركه برابط، وصحّحه تلقائياً',
    path: '/exams',
    icon: ClipboardCheck,
    pages: [
      { title: 'منشئ الامتحانات', description: 'امتحانات بنمط الوزارة من ملفاتك أو من المنهاج', path: '/exam-creator', icon: ClipboardCheck, requiresAuth: true },
      { title: 'ماسح الامتحانات', description: 'صحّح أوراق الامتحان بالكاميرا', path: '/exam-scanner', icon: FileScan },
      { title: 'بنك أسئلة الرياضيات', description: 'أسئلة مصنفة حسب الوحدة والصعوبة', path: '/mathematics/question-bank', icon: Calculator },
      { title: 'تحديات المواد', description: 'ألغاز ونقاط ولوحة صدارة لكل مادة', path: '/subject-puzzles', icon: Puzzle, requiresAuth: true },
      { title: 'ألغاز الرياضيات', description: 'تحديات رياضية يومية', path: '/math-puzzles', icon: Trophy, requiresAuth: true },
      { title: 'المراجعة المتباعدة', description: 'جدول مراجعة يثبّت المعلومة في الذاكرة', path: '/spaced-repetition', icon: Repeat },
    ],
  },
  {
    id: 'labs',
    title: 'المختبرات والمحاكاة',
    navLabel: 'المختبرات',
    tagline: 'أكثر من 90 تجربة تفاعلية في الفيزياء والكيمياء والأحياء والرياضيات',
    path: '/labs',
    icon: Atom,
    pages: [
      { title: 'المختبرات ثلاثية الأبعاد', description: 'كل المحاكاة مصنفة حسب المادة', path: '/experiments-section', icon: Atom },
      { title: 'مركز المحاكاة العلمية', description: 'ابحث في المحاكاة وشغّلها مع مساعد ذكي', path: '/scientific-simulations-hub', icon: FlaskConical },
      { title: 'الدوال ثلاثية الأبعاد', description: 'ارسم وحرّك الدوال في الفضاء', path: '/3d-function-visualizer', icon: LineChart },
      { title: 'رسم الدوال', description: 'رسم بياني تفاعلي للدوال', path: '/mathematics/graph-visualizer', icon: Sigma },
    ],
  },
  {
    id: 'tools',
    title: 'أدوات الطالب الذكية',
    navLabel: 'أدواتي',
    tagline: 'نظّم دراستك، تابع تقدمك، واستعن بمساعدين أذكياء',
    path: '/tools',
    icon: Brain,
    pages: [
      { title: 'المرشد الذكي', description: 'مساعدون أذكياء لكل مادة', path: '/ai-assistant-section', icon: Sparkles },
      { title: 'فلك المعرفة', description: 'محرك معرفة بالذكاء الاصطناعي', path: '/falak-knowledge-ai', icon: Brain, requiresAuth: true },
      { title: 'تنظيم الدراسة', description: 'خطط ومهام وتقويم دراسي', path: '/study-organization', icon: CalendarDays },
      { title: 'منشئ الجدول الدراسي', description: 'جدول أسبوعي يناسب وقتك', path: '/study-schedule', icon: CalendarDays },
      { title: 'تقدّمي', description: 'إحصاءات تقدمك في كل مادة', path: '/student-progress', icon: LineChart },
      { title: 'الخرائط الذهنية', description: 'حوّل الدرس إلى خريطة ذهنية تفاعلية', path: '/lesson-mindmap-studio', icon: Map },
      { title: 'مولّد الصور', description: 'صور تعليمية بالذكاء الاصطناعي', path: '/ai-image-generator', icon: Image },
      { title: 'المرشد النفسي', description: 'دعم نفسي وإرشاد دراسي', path: '/psychological-guide', icon: HandHeart },
    ],
  },
  {
    id: 'school',
    title: 'المجتمع المدرسي',
    navLabel: 'المجتمع',
    tagline: 'تواصل بين الطالب والمعلم وولي الأمر، ومشاريع وأنشطة المدرسة',
    path: '/school',
    icon: School,
    pages: [
      { title: 'مجتمع الطلبة', description: 'منتدى نقاش مفتوح بين الطلبة', path: '/community', icon: MessagesSquare },
      { title: 'المجلة المدرسية', description: 'أخبار المدرسة وإعلاناتها', path: '/school-magazine', icon: Newspaper },
      { title: 'جسر التواصل', description: 'المعلم وولي الأمر: الواجبات والملاحظات والمحادثة', path: '/communication-bridge', icon: Users },
      { title: 'غرف المحادثة', description: 'محادثات جماعية وخاصة', path: '/chat-rooms', icon: MessageSquare, requiresAuth: true },
      { title: 'الإدارة والمعلمون', description: 'مشاريع المعلمين ومتابعة المشرفين', path: '/administrators-teachers', icon: Building2, requiresAuth: true },
      { title: 'إنجازات المعلمين', description: 'قصص نجاح وإنجازات الكادر', path: '/teacher-achievements', icon: Trophy },
      { title: 'الفن والتصميم', description: 'معرض أعمال وتحديات رسم', path: '/art-design', icon: Palette },
      { title: 'الاستدامة البيئية', description: 'حاسبة الكربون ومشاريع إعادة التدوير', path: '/environmental-sustainability', icon: Leaf },
      { title: 'الشراكات المؤسسية', description: 'انضم كمدرسة أو مؤسسة شريكة', path: '/institutional-partnerships', icon: Handshake },
    ],
  },
];

/**
 * Projects that are parked: kept reachable, not actively developed.
 * They are excluded from the main navigation and listed on /future-projects.
 */
export const FUTURE_PROJECTS: PlatformPage[] = [
  { title: 'دامج: منصة أصحاب الهمم', description: 'التوحد وفرط الحركة والبرايل ولغة الإشارة وعين الكفيف والمحاكاة السريرية', path: '/damij', icon: HandHeart },
  { title: 'لغة الإشارة', description: 'قاموس ومترجم لغة الإشارة', path: '/sign-language', icon: HandHeart },
  { title: 'مستقبل التكنولوجيا', description: 'معرض مشاريع الذكاء الاصطناعي والتقنيات الناشئة', path: '/gju-competition', icon: Rocket },
  { title: 'المدينة الذكية', description: 'التصميم المعماري والداخلي وروبوت البناء', path: '/smart-city', icon: Building2 },
  { title: 'الروبوتات والذكاء الاصطناعي', description: 'محاكاة ومولّد روبوتات', path: '/robotics-section', icon: Cpu },
  { title: 'التوأم الرقمي للأردن', description: 'نموذج رقمي تفاعلي للمملكة', path: '/gju/jordan-digital-twin', icon: Globe2 },
  { title: 'الدفع بالوجه', description: 'نموذج تجريبي للدفع ببصمة الوجه', path: '/face-pay', icon: ScanFace },
  { title: 'متجر المستقبل', description: 'متجر تجريبي بالذكاء الاصطناعي', path: '/ai-future-store', icon: Store },
  { title: 'الكشف المبكر عن السرطان', description: 'نموذج بحثي، ليس أداة تشخيص', path: '/cancer-detection', icon: HeartPulse },
  { title: 'المساعد الطبي', description: 'نموذج بحثي، ليس بديلاً عن الطبيب', path: '/medical-assistant', icon: HeartPulse },
  { title: 'باني المنصات بالذكاء الاصطناعي', description: 'أنشئ موقعاً كاملاً بوصف نصي', path: '/ai-platform-builder', icon: PenTool },
];

export const FUTURE_PROJECTS_PATH = '/future-projects';

export const findSectionByPath = (pathname: string): PlatformSection | undefined =>
  CORE_SECTIONS.find(
    (s) => s.path === pathname || s.pages.some((p) => pathname === p.path || pathname.startsWith(`${p.path}/`)),
  );
