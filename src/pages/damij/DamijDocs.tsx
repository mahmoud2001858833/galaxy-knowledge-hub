import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ChevronDown, ExternalLink, Code2, Database, Cpu, Globe2, Sparkles,
  Eye, Hand, Brain, Activity, Layers, FlaskConical, Type, ShieldCheck, Cloud,
  Mic, Camera, MapPin, Vibrate, Languages, FileText, BarChart3, Users,
  Copy, Check, Info, Rocket, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { DamijSEO } from '@/components/damij/DamijSEO';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
type SubFeature = { name: string; desc: string; path?: string };
type Module = {
  id: string;
  title: string;
  icon: React.ElementType;
  accent: string;
  shortDesc: string;
  longDesc: string;
  rootPath: string;
  features: SubFeature[];
  tech: string[];
  apis: string[];
};

// ----------------------------------------------------------------------------
// Module catalog — full Damij platform documentation
// ----------------------------------------------------------------------------
const MODULES: Module[] = [
  {
    id: 'blind-eye',
    title: 'عين الأعمى — مرشد المكفوفين البصري',
    icon: Eye,
    accent: 'from-emerald-500 to-cyan-600',
    rootPath: '/damij/blind-eye',
    shortDesc: 'مساعد بصري صوتي حي يصف ما حول المكفوف ويرشده للمشي بأمان وللوصول إلى وجهات حقيقية على الخريطة.',
    longDesc:
      'يستخدم كاميرا الهاتف لتحليل المشهد في الوقت الفعلي بمزيج من نموذج رؤية محلي (COCO-SSD) ونموذج Gemini السحابي. يعطي المستخدم أوامر مختصرة (يسار/يمين/قف/تراجع) مع وصف للعوائق، يدعم 15 لغة، ويعمل في وضع عدم الاتصال بالاعتماد على الكشف المحلي.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'بوابة دخول مع تنبيه أولي ومعايرة شخصية.', path: '/damij/blind-eye' },
      { name: 'وضع الإرشاد المباشر', desc: 'كاميرا حية + أوامر صوتية + كشف عوائق فوري + توجيه خطوة بخطوة لوجهات GPS عبر OSRM.', path: '/damij/blind-eye/navigate' },
      { name: 'المعايرة الأولية', desc: 'تنبيه قانوني + اختيار سرعة المشي + الأذن المفضلة + مستوى التفاصيل.', path: '/damij/blind-eye/onboarding' },
      { name: 'الإعدادات', desc: 'جهات الطوارئ، الأماكن المحفوظة، الاهتزاز الاتجاهي، كشف السقوط.', path: '/damij/blind-eye/settings' },
    ],
    tech: ['TensorFlow.js', 'COCO-SSD', 'Web Speech API', 'DeviceOrientation', 'Geolocation', 'Web Vibration'],
    apis: ['Gemini 2.5 Flash (vision)', 'OSRM Routing', 'Nominatim Geocoding'],
  },
  {
    id: 'braille',
    title: 'بريل — التعلم والترجمة',
    icon: Type,
    accent: 'from-indigo-500 to-purple-600',
    rootPath: '/damij/braille',
    shortDesc: 'منظومة كاملة لتعلم بريل، الترجمة بين بريل والنص، والرسومات اللمسية للمكفوفين.',
    longDesc:
      'تشمل ترجمة فورية بين بريل والنص العربي/الإنجليزي، نمط تعليمي تفاعلي مع تتبع التقدم، وتحويل الصور إلى رسومات لمسية (Tactile Graphics) قابلة للطباعة على ورق منتفخ أو طابعات بريل.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'فهرس أدوات بريل.', path: '/damij/braille' },
      { name: 'بريل إلى نص', desc: 'كاميرا/صورة → تعرف بصري على نقاط بريل → نص قابل للقراءة والنطق.', path: '/damij/braille/braille-to-text' },
      { name: 'تعلم بريل', desc: 'دروس متدرجة مع مرشد ذكي.', path: '/damij/braille/learn' },
      { name: 'تعلم تفاعلي', desc: 'تمارين متدرجة مع تغذية راجعة فورية بالصوت.', path: '/damij/braille/interactive-learn' },
      { name: 'المحول الشامل', desc: 'تحويل ثنائي الاتجاه بين بريل ولغات متعددة.', path: '/damij/braille/universal' },
      { name: 'الرسومات اللمسية', desc: 'تحويل أي صورة إلى مخطط لمسي للطباعة.', path: '/damij/braille/tactile' },
    ],
    tech: ['Canvas API', 'Web Speech API', 'Unicode Braille Patterns U+2800–U+28FF'],
    apis: ['Gemini Vision (تعرف على بريل)', 'liblouis (قواعد التحويل)'],
  },
  {
    id: 'sign',
    title: 'لغة الإشارة — الترجمة والقاموس',
    icon: Hand,
    accent: 'from-orange-500 to-rose-600',
    rootPath: '/damij/sign',
    shortDesc: 'ترجمة لغة الإشارة بالكاميرا في الوقت الحقيقي، ترجمة فيديوهات يوتيوب، وقاموس قابل للتوسيع.',
    longDesc:
      'يستخدم MediaPipe لاستخراج نقاط مفاصل اليدين والجسم والوجه ثم يحلل التتابع لتمييز الإشارات. يدعم لغة الإشارة العربية، يحوّل الإشارة إلى نص ونطق، ويتيح للمدراء بناء قاموس إشارات مخصص.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'بوابة أدوات لغة الإشارة.', path: '/damij/sign' },
      { name: 'المترجم المباشر', desc: 'كاميرا حية → نقاط مفاصل → تثبيت ذكي → نص + صوت.', path: '/damij/sign/translator' },
      { name: 'مترجم يوتيوب', desc: 'إدراج فيديو يوتيوب وترجمته إشارة-إلى-نص.', path: '/damij/sign/youtube' },
      { name: 'إدارة القاموس', desc: 'إضافة/تعديل إشارات مع تسجيل فيديو مرجعي.', path: '/damij/sign/dictionary' },
      { name: 'تعديلات المفردات', desc: 'لوحة لمراجعة وتصحيح ترجمات المفردات.', path: '/damij/sign/vocab-overrides' },
    ],
    tech: ['MediaPipe Hands/Pose/Face', 'TensorFlow.js', 'Canvas API', 'WebRTC'],
    apis: ['Gemini (ترجمة سياقية)', 'YouTube IFrame API'],
  },
  {
    id: 'autism',
    title: 'التوحد — التشخيص والعلاج',
    icon: Brain,
    accent: 'from-amber-500 to-orange-600',
    rootPath: '/damij/autism',
    shortDesc: 'أدوات فحص مبكر، خطط علاج فردية، ألعاب علاجية، وبرنامج 30 يوماً مع متابعة يومية.',
    longDesc:
      'يقدّم استبيانات مبنية على معايير DSM-5-TR و M-CHAT-R، يحلل النتائج بالذكاء الاصطناعي ويولّد خطة علاجية فردية، يوفر ألعاباً سلوكية تفاعلية، وبرنامجاً ممتداً على 30 يوماً مع تقارير تقدم يومية وتتبع للأهداف.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'مدخل أدوات التوحد.', path: '/damij/autism' },
      { name: 'التشخيص', desc: 'استبيانات مرجعية مع تحليل AI وتقرير شامل.', path: '/damij/autism/diagnosis' },
      { name: 'العلاج', desc: 'جلسات سلوكية مهيكلة (ABA-inspired).', path: '/damij/autism/therapy' },
      { name: 'الخطة العلاجية', desc: 'خطة فردية يولّدها الذكاء الاصطناعي حسب الحاجة.', path: '/damij/autism/plan' },
      { name: 'الألعاب العلاجية', desc: 'مكتبة ألعاب سلوكية وتواصلية.', path: '/damij/autism/play' },
      { name: 'الملف الشخصي', desc: 'سجل الطفل وتطوره عبر الزمن.', path: '/damij/autism/profile' },
      { name: 'إعداد برنامج 30 يوماً', desc: 'تخصيص أهداف وميزانية وقت يومية.', path: '/damij/autism/program/setup' },
    ],
    tech: ['React Query', 'Recharts (تقارير)', 'Framer Motion'],
    apis: ['Gemini 2.5 (تحليل وتوليد خطط)', 'DSM-5-TR criteria', 'M-CHAT-R/F'],
  },
  {
    id: 'adhd',
    title: 'فرط الحركة وتشتت الانتباه (ADHD)',
    icon: Activity,
    accent: 'from-pink-500 to-rose-600',
    rootPath: '/damij/adhd',
    shortDesc: 'تشخيص، مهام معرفية مرجعية (CPT, N-Back, Stroop, Go/No-Go)، تدريب التركيز، وبرامج تأهيلية.',
    longDesc:
      'منظومة شاملة تجمع أدوات الفحص المعرفي القياسية مع تحليل أداء آلي وتوصيات مبنية على معايير AAP. تشمل تدريب التركيز التكيفي، ألعاباً علاجية، وبرنامجاً يومياً ممتداً مع متابعة شهرية.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'مدخل ADHD.', path: '/damij/adhd' },
      { name: 'الفحص الأولي', desc: 'استبيانات قصيرة + تقرير تشخيصي.', path: '/damij/adhd/screening' },
      { name: 'مركز التقييم المعرفي', desc: 'CPT, N-Back, Stroop, Go/No-Go كأدوات معيارية.', path: '/damij/adhd/assessment' },
      { name: 'مهمة CPT', desc: 'اختبار الأداء المستمر لقياس الانتباه.', path: '/damij/adhd/assessment/cpt' },
      { name: 'مهمة N-Back', desc: 'قياس الذاكرة العاملة.', path: '/damij/adhd/assessment/nback' },
      { name: 'مهمة Stroop', desc: 'قياس التحكم المعرفي.', path: '/damij/adhd/assessment/stroop' },
      { name: 'مهمة Go/No-Go', desc: 'قياس التثبيط الاستجابي.', path: '/damij/adhd/assessment/gonogo' },
      { name: 'مركز التدريب', desc: 'تمارين تركيز تكيفية.', path: '/damij/adhd/training' },
      { name: 'بناء التركيز', desc: 'جلسات تركيز متدرجة.', path: '/damij/adhd/training/focus' },
      { name: 'التدخلات', desc: 'استراتيجيات سلوكية مدعومة بالأدلة.', path: '/damij/adhd/interventions' },
      { name: 'لوحة المتابعة', desc: 'تقدم المستخدم بالأرقام والرسوم.', path: '/damij/adhd/dashboard' },
      { name: 'مكتبة الألعاب', desc: 'ألعاب تشخيصية وعلاجية.', path: '/damij/adhd/games' },
      { name: 'المتابع الشهري', desc: 'سجل شهري للأعراض والتقدم.', path: '/damij/adhd/monthly' },
      { name: 'المصادر', desc: 'أوراق علمية ومراجع موثوقة.', path: '/damij/adhd/resources' },
    ],
    tech: ['Web Workers (لتحليل الاستجابات)', 'Recharts', 'localStorage'],
    apis: ['Gemini 2.5 (توليد تقارير)', 'AAP & NICE guidelines'],
  },
  {
    id: 'sensory',
    title: 'الجسر الحسي العكسي — Sensory Bridge',
    icon: Layers,
    accent: 'from-cyan-500 to-blue-600',
    rootPath: '/damij/sensory',
    shortDesc: 'تحويل المدخلات بين الحواس: نص ↔ صوت ↔ صورة ↔ لمس، لخدمة فاقدي حاسة أو الجمع بين عدة إعاقات.',
    longDesc:
      'يهدف إلى أن لا يكون فقدان حاسة عائقاً عن الوصول للمعلومة. يدعم تحويل النص إلى نمط اهتزاز، الصورة إلى وصف صوتي ولمسي، الصوت إلى أنماط مرئية، ويوفر واجهة تكيفية تتغير حسب القدرات.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'مدخل الأدوات الحسية.', path: '/damij/sensory' },
      { name: 'إعداد الملف الحسي', desc: 'تخصيص حسب القدرات (نظر/سمع/لمس).', path: '/damij/sensory/profile' },
      { name: 'الرفع والتحويل', desc: 'رفع صورة/صوت/نص للتحويل بين الحواس.', path: '/damij/sensory/upload' },
      { name: 'النتيجة', desc: 'عرض المخرج بصيغ متعددة.', path: '/damij/sensory/output' },
      { name: 'الصورة إلى لمس', desc: 'تحويل أي صورة إلى نمط اهتزاز/لمس قابل للتفسير.', path: '/damij/sensory/image-tactile' },
      { name: 'سجل التفاعل', desc: 'متابعة جلسات الاستخدام.', path: '/damij/sensory/log' },
      { name: 'إعدادات الاهتزاز', desc: 'تخصيص أنماط الاهتزاز الذكية.', path: '/damij/sensory/haptic-settings' },
      { name: 'التواصل الموحد', desc: 'واجهة تجمع كل القنوات (لمس/صوت/بصر).', path: '/damij/sensory/unified-comm' },
      { name: 'الإدراك الثلاثي', desc: 'عرض المعلومة عبر 3 حواس معاً.', path: '/damij/sensory/tri-sense' },
      { name: 'الواجهة التكيفية', desc: 'واجهة تتشكل تلقائياً حسب الملف الحسي.', path: '/damij/sensory/adaptive-ui' },
    ],
    tech: ['Web Vibration API', 'Web Audio API', 'Canvas/WebGL', 'Gamepad API'],
    apis: ['Gemini Vision', 'ElevenLabs (TTS عالي الجودة)'],
  },
  {
    id: 'clinical',
    title: 'المختبر السريري الافتراضي',
    icon: FlaskConical,
    accent: 'from-violet-500 to-fuchsia-600',
    rootPath: '/damij/clinical',
    shortDesc: 'محاكاة حالات سريرية لطلاب وأخصائيي العلاج النفسي والسلوكي مع تقارير تقييم آلية.',
    longDesc:
      'بيئة تدريب آمنة يقابل فيها المتعلم حالات افتراضية متنوعة، يجري معها مقابلة، يضع فرضيات، ويقدّم خطة. يحلّل النظام أداءه ويولّد تقريراً مفصلاً مع نقاط القوة والضعف ومراجع علمية.',
    features: [
      { name: 'الصفحة الرئيسية', desc: 'مدخل المختبر.', path: '/damij/clinical' },
      { name: 'الحالات', desc: 'مكتبة حالات سريرية مصنفة.', path: '/damij/clinical/cases' },
      { name: 'المختبر', desc: 'بيئة جلسة محاكاة حية.', path: '/damij/clinical/lab' },
      { name: 'التجربة الحرة', desc: 'حالة مخصصة ينشئها المستخدم.', path: '/damij/clinical/free' },
      { name: 'التقارير', desc: 'كل التقارير السابقة مع درجاتها.', path: '/damij/clinical/reports' },
      { name: 'لوحة المتابعة', desc: 'إحصاءات الأداء عبر الزمن.', path: '/damij/clinical/dashboard' },
      { name: 'المقارنة', desc: 'مقارنة أدائك مع زملائك.', path: '/damij/clinical/compare' },
      { name: 'محفظة الإنجازات', desc: 'سجل قابل للمشاركة لإنجازاتك.', path: '/damij/clinical/portfolio' },
    ],
    tech: ['React Router (جلسات ديناميكية)', 'Supabase Realtime', 'PDF Generation'],
    apis: ['Gemini 2.5 (محاكاة المريض والتقييم)', 'DSM-5-TR', 'ICD-11'],
  },
  {
    id: 'dashboard',
    title: 'لوحة المتابعة العامة',
    icon: BarChart3,
    accent: 'from-slate-500 to-zinc-700',
    rootPath: '/damij/dashboard',
    shortDesc: 'نظرة عامة على نشاط المستخدم عبر كل أنظمة منصة دامج.',
    longDesc:
      'تجمع إحصاءات الاستخدام، الإنجازات، التقدم في البرامج الممتدة (التوحد/ADHD)، وآخر الجلسات السريرية، في صفحة واحدة قابلة للتصدير.',
    features: [
      { name: 'لوحة المتابعة', desc: 'مؤشرات الأداء الموحدة.', path: '/damij/dashboard' },
    ],
    tech: ['Recharts', 'Date-fns', 'React Query'],
    apis: ['Supabase Aggregation'],
  },
];

// ----------------------------------------------------------------------------
// Tech stack catalog
// ----------------------------------------------------------------------------
const TECH_STACK = [
  {
    cat: 'الواجهة الأمامية', icon: Code2, items: [
      { name: 'React 18 + TypeScript 5', why: 'بنية مكونات سريعة وآمنة الأنواع.' },
      { name: 'Vite 5', why: 'بناء فوري وتحديث ساخن.' },
      { name: 'Tailwind CSS 3', why: 'نظام تصميم متّسق مع قيم HSL.' },
      { name: 'shadcn/ui + Radix UI', why: 'مكونات وصول AAA جاهزة (WCAG).' },
      { name: 'Framer Motion', why: 'انتقالات وحركات سلسة.' },
      { name: 'React Router 6', why: 'توجيه متشعب مع حماية الجلسات.' },
      { name: 'React Query (TanStack)', why: 'إدارة حالة الخادم والتخزين المؤقت.' },
      { name: 'Zustand + Context', why: 'حالة محلية خفيفة.' },
      { name: 'lucide-react', why: 'مكتبة أيقونات موحّدة.' },
    ],
  },
  {
    cat: 'الذكاء الاصطناعي والرؤية', icon: Sparkles, items: [
      { name: 'Google Gemini 2.5 Flash/Pro', why: 'فهم لغوي ورؤية متعدد الوسائط (Lovable AI Gateway للـ Blind Eye فقط).' },
      { name: 'OpenAI GPT (احتياطي)', why: 'استدعاءات نصية مساعدة.' },
      { name: 'ElevenLabs TTS', why: 'صوت طبيعي عالي الجودة.' },
      { name: 'TensorFlow.js + COCO-SSD', why: 'كشف كائنات محلي بدون إنترنت.' },
      { name: 'MediaPipe Hands/Pose/Face', why: 'استخراج نقاط جسم للإشارة.' },
      { name: 'OCR.space', why: 'تعرف ضوئي للنصوص (الماسح الذكي).' },
    ],
  },
  {
    cat: 'الواجهة الخلفية', icon: Database, items: [
      { name: 'Supabase (PostgreSQL)', why: 'قاعدة بيانات + مصادقة + تخزين + Realtime.' },
      { name: 'Row Level Security', why: 'حماية البيانات على مستوى الصف.' },
      { name: 'Supabase Edge Functions (Deno)', why: 'وظائف خادم للذكاء الاصطناعي والاتصال بمزودين خارجيين.' },
      { name: 'Supabase Storage', why: 'تخزين الصور والصوت والفيديو.' },
      { name: 'Resend', why: 'إرسال البريد الإلكتروني المعاملاتي.' },
    ],
  },
  {
    cat: 'الواجهات البرمجية للمتصفح', icon: Cpu, items: [
      { name: 'Web Speech API', why: 'تعرف على الكلام + نطق (TTS).' },
      { name: 'MediaDevices/getUserMedia', why: 'وصول للكاميرا والميكروفون.' },
      { name: 'Geolocation API', why: 'تحديد الموقع للملاحة.' },
      { name: 'DeviceOrientation/Motion', why: 'كشف الحركة والاتجاه للجايروسكوب.' },
      { name: 'Web Vibration API', why: 'الاهتزاز الاتجاهي.' },
      { name: 'Web Audio API', why: 'مؤثرات صوتية اتجاهية (panning).' },
      { name: 'Service Worker', why: 'دعم وضع عدم الاتصال (PWA).' },
    ],
  },
  {
    cat: 'الملاحة والخرائط', icon: MapPin, items: [
      { name: 'OSRM (Open Source Routing Machine)', why: 'حساب مسارات المشي خطوة بخطوة.' },
      { name: 'Nominatim (OpenStreetMap)', why: 'بحث جغرافي عن الأماكن.' },
    ],
  },
  {
    cat: 'النشر والتطبيق المحمول', icon: Cloud, items: [
      { name: 'Lovable Hosting', why: 'استضافة الويب الإنتاجية.' },
      { name: 'Capacitor', why: 'تحويل المنصة إلى تطبيق Android أصلي.' },
      { name: 'Vercel Edge (احتياطي)', why: 'CDN عالمي.' },
    ],
  },
];

// ----------------------------------------------------------------------------
// Scientific sources catalog
// ----------------------------------------------------------------------------
const SOURCES = [
  { name: 'DSM-5-TR (APA, 2022)', use: 'معايير تشخيص التوحد و ADHD.' },
  { name: 'AAP Clinical Practice Guideline for ADHD (2019)', use: 'بروتوكولات الفحص والتدخل.' },
  { name: 'NICE Guideline NG87 (ADHD)', use: 'توصيات سريرية بريطانية.' },
  { name: 'M-CHAT-R/F', use: 'فحص التوحد للأطفال.' },
  { name: 'WHO Disability Inclusion Framework', use: 'إطار شامل لدمج ذوي الإعاقة.' },
  { name: 'WCAG 2.2 AAA', use: 'معايير الوصول الرقمي.' },
  { name: 'Unicode Braille Patterns (U+2800–U+28FF)', use: 'الترميز القياسي لبريل.' },
  { name: 'Liblouis Braille Translation', use: 'قواعد التحويل بين بريل والنص.' },
  { name: 'BIPSO + Saudi Sign Language Standards', use: 'مرجعية إشارات لغة الإشارة العربية.' },
  { name: 'Conners CPT-3 / N-Back / Stroop', use: 'بروتوكولات مهام الانتباه المعيارية.' },
];

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------
const ModuleCard: React.FC<{ m: Module; defaultOpen?: boolean }> = ({ m, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = m.icon;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="rounded-2xl bg-white border border-[hsl(var(--damij-border))] shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-right p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.accent} text-white flex items-center justify-center shrink-0 shadow-md`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-extrabold text-[hsl(var(--damij-primary))] mb-1">{m.title}</h3>
          <p className="text-sm text-[hsl(var(--damij-muted))] leading-relaxed">{m.shortDesc}</p>
        </div>
        <Link
          to={m.rootPath}
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold hover:opacity-90 shrink-0"
        >
          زيارة <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <ChevronDown className={`w-5 h-5 text-[hsl(var(--damij-muted))] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[hsl(var(--damij-border))] p-5 space-y-5 bg-slate-50/50">
          <p className="text-[15px] text-[hsl(var(--damij-text))] leading-relaxed">{m.longDesc}</p>

          <div>
            <h4 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> الخيارات والصفحات
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {m.features.map((f) => (
                <div key={f.name} className="p-3 rounded-lg bg-white border border-[hsl(var(--damij-border))] flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[hsl(var(--damij-text))]">{f.name}</div>
                    <div className="text-xs text-[hsl(var(--damij-muted))] mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                  {f.path && (
                    <Link
                      to={f.path}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] text-xs font-bold hover:bg-[hsl(var(--damij-primary))]/15 shrink-0"
                    >
                      افتح <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> التقنيات المستخدمة
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {m.tech.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-mono">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> الخدمات الخارجية
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {m.apis.map((a) => (
                  <span key={a} className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono">{a}</span>
                ))}
              </div>
            </div>
          </div>

          <Link
            to={m.rootPath}
            className="sm:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white font-bold text-sm w-full justify-center"
          >
            زيارة {m.title} <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </motion.section>
  );
};

// ----------------------------------------------------------------------------
// Future vision content (Arabic) — surfaced in PlatformInfoSection
// ----------------------------------------------------------------------------
const FUTURE_VISION: { title: string; items: string[] }[] = [
  {
    title: 'الرؤية المستقبلية القريبة (1 — 2 سنة)',
    items: [
      'إطلاق تطبيق Android أصلي عبر Capacitor مع دعم كامل لوضع عدم الاتصال.',
      'توسعة "عين الأعمى" لتدعم 30 لغة + وصف ثلاثي الأبعاد للمشهد.',
      'إضافة لغة الإشارة الأردنية والمصرية والسعودية كقواميس منفصلة.',
      'دمج مستشعرات الذراع (EMG) لتدريب اليد على الإشارة.',
      'بناء "ملف رقمي مستمر" للطفل يصاحبه من سنتين حتى البلوغ.',
      'شراكات مع وزارات الصحة العربية لاعتماد المنصة كأداة وطنية.',
    ],
  },
  {
    title: 'الرؤية المتوسطة (3 — 5 سنوات)',
    items: [
      'بناء قاعدة بحثية عربية مفتوحة من تفاعلات المنصة (مجهولة الهوية).',
      'إدخال الواقع المعزز (AR) لمحاكاة "الجسر الحسّي العكسي" للأطباء.',
      'إطلاق منصة "دامج للمعلمين" مع لوحات صف وأهداف فردية لكل طالب.',
      'دمج أجهزة التعقب الذكية (smart glasses, smart canes) مع المنصة.',
      'فتح المنصة كـ Open Source ليتاح للجمعيات تخصيصها.',
      'برنامج اعتماد للأطباء العرب على استخدام "الجسر الحسّي" في التدريب.',
    ],
  },
  {
    title: 'الرؤية البعيدة (5 — 10 سنوات)',
    items: [
      'تحويل دامج إلى "مرجع عربي عالمي" في الرعاية الرقمية لذوي الإعاقة.',
      'بناء مجتمع عربي يضم الأهل والأطباء والمعلمين كشبكة دعم متكاملة.',
      'إدخال نماذج ذكاء اصطناعي عربية مفتوحة مدرّبة على بيانات دامج.',
      'إنشاء "متحف الإعاقة الرقمي" لتوثيق رحلات وقصص نجاح حقيقية.',
      'الوصول إلى مليون مستخدم عربي نشط شهرياً.',
    ],
  },
];

// ----------------------------------------------------------------------------
// $150K Expansion Plan — detailed budget, tools, and sustainability
// ----------------------------------------------------------------------------
interface BudgetPhase {
  phase: string;
  duration: string;
  budget: string;
  items: { tool: string; cost: string; purpose: string; sustainability: string }[];
}

const EXPANSION_PLAN_150K: BudgetPhase[] = [
  {
    phase: 'المرحلة الأولى: البنية التحتية والاستقرار (شهر 1–3)',
    duration: '3 أشهر',
    budget: '~$35,000',
    items: [
      {
        tool: 'Supabase Pro + Edge Network',
        cost: '$500/شهر × 12 = $6,000',
        purpose: 'قاعدة بيانات إنتاجية مع RLS، Realtime، وتوزيع جغرافي للحد من التأخير في الأردن والخليج.',
        sustainability: 'يضمن استقراراً 99.9% ويقلل وقت التحميل بنسبة 70% للمستخدمين العرب.',
      },
      {
        tool: 'AWS S3 / CloudFront (احتياطي)',
        cost: '~$3,000/سنة',
        purpose: 'تخزين الصوت والفيديو والصور عالي الدقة بشكل موزع جغرافياً.',
        sustainability: 'تخزين قابل للتوسع لمليون ملف دون انقطاع.',
      },
      {
        tool: 'Sentry Pro + LogRocket',
        cost: '$2,400/سنة',
        purpose: 'مراقبة الأخطاء في الوقت الفعلي، تسجيل جلسات المستخدمين، وتحليل الانهيارات.',
        sustainability: 'يقلل وقت إصلاح الأخطاء بنسبة 80% ويحسّن تجربة المستخدم المكفوف وذوي ADHD.',
      },
      {
        tool: 'Vercel Pro + Analytics',
        cost: '$2,400/سنة',
        purpose: 'استضافة CDN عالمي مع تقارير Core Web Vitals وتحسين الأداء التلقائي.',
        sustainability: 'سرعة تحميل أقل من 2 ثانية في كل الدول العربية.',
      },
      {
        tool: 'Upstash Redis (Caching)',
        cost: '$1,200/سنة',
        purpose: 'تخزين مؤقت للاستجابات المتكررة (ترجمات، نتائج اختبارات).',
        sustainability: 'يقلل التكلفة السحابية بنسبة 40% ويُسرّع الاستجابة 10 مرات.',
      },
      {
        tool: 'GitHub Actions + CI/CD Advanced',
        cost: '$2,400/سنة',
        purpose: 'بناء واختبار ونشر آلي لكل تعديل، مع اختبارات Accessibility (axe-core).',
        sustainability: 'يمنع الأخطاء من الوصول للمستخدمين ويُسرّع دورة التطوير.',
      },
      {
        tool: 'Domain + SSL + Security (Cloudflare Pro)',
        cost: '$2,400/سنة',
        purpose: 'حماية DDoS، WAF، وتحسين DNS عالمي.',
        sustainability: 'يحمي بيانات الأطفال والأطباء ويضمن استمرارية الخدمة.',
      },
      {
        tool: 'Capacitor Enterprise + Google Play',
        cost: '$5,000 (مرة واحدة) + $500/سنة',
        purpose: 'تطبيق Android أصلي مع دفع إشعارات، تحديثات OTA، ودعم الأجهزة اللوحية.',
        sustainability: 'يصل لمناطق لا يتوفر فيها إنترنت سريع عبر تطبيق يعمل Offline.',
      },
      {
        tool: 'TestFlight + App Store (مستقبلي)',
        cost: '$1,700/سنة',
        purpose: 'إعداد قناة iOS لإطلاق تطبيق iPhone/iPad مستقبلاً.',
        sustainability: 'يفتح سوقاً جديدة (40% من مستخدمي الهواتف في الخليج يستخدمون iOS).',
      },
      {
        tool: 'Legal + GDPR/PDPA Compliance',
        cost: '$5,000 (مرة واحدة)',
        purpose: 'سياسات خصوصية معتمدة قانونياً للأطفال (COPPA) وذوي الإعاقة.',
        sustainability: 'يُمكّن الشراكات مع وزارات الصحة والتعليم دون مخاطر قانونية.',
      },
    ],
  },
  {
    phase: 'المرحلة الثانية: الذكاء الاصطناعي والرؤية (شهر 4–8)',
    duration: '5 أشهر',
    budget: '~$55,000',
    items: [
      {
        tool: 'OpenAI GPT-4o / Claude 3.5 Enterprise API',
        cost: '$15,000/سنة',
        purpose: 'نماذج لغوية متقدمة للمرشد الذكي، تقارير التوحد/ADHD، والمحاكاة السريرية.',
        sustainability: 'دقة أعلى في التشخيص ودعم 50+ لغة إضافية.',
      },
      {
        tool: 'Google Cloud Vision + AutoML',
        cost: '$8,000/سنة',
        purpose: 'تدريب نماذج مخصصة للإشارة العربية، OCR لبريل، وكشف العوائق للمكفوفين.',
        sustainability: 'نماذج عربية مملوكة لدامج لا تعتمد على مزود أجنبي.',
      },
      {
        tool: 'ElevenLabs Enterprise (TTS)',
        cost: '$6,000/سنة',
        purpose: 'أصوات طبيعية بـ 15 لهجة عربية (مصرية، خليجية، مغربية...) للمكفوفين وقراءة التقارير.',
        sustainability: 'يُحسّن فهم المكفوف بنسبة 300% مقارنة بـ Web Speech API المجاني.',
      },
      {
        tool: 'DeepL + Custom Translation API',
        cost: '$4,000/سنة',
        purpose: 'ترجمة آلية لمحتوى التوثيق الطبي والتعليمي مع مصطلحات دقيقة.',
        sustainability: 'توسيع المحتوى لـ 30 لغة دون الحاجة لمترجمين لكل لغة.',
      },
      {
        tool: 'Pinecone / Weaviate (Vector DB)',
        cost: '$3,600/سنة',
        purpose: 'قاعدة بيانات متجهة لتخزين حالات سريرية، إشارات، وملفات حسية.',
        sustainability: 'بحث فوري ذكي بين آلاف الحالات الطبية باستخدام Semantic Search.',
      },
      {
        tool: 'Replicate / RunPod (GPU Inference)',
        cost: '$6,000/سنة',
        purpose: 'تشغيل نماذج توليد صور وتحليل فيديو بجودة عالية على GPU سحابي.',
        sustainability: 'تشخيص بصري متقدم للتوحد وADHD عبر تحليل تعابير الوجه والحركة.',
      },
      {
        tool: 'Hugging Face Enterprise',
        cost: '$4,800/سنة',
        purpose: 'استضافة نماذج عربية مفتوحة (AraBERT، CAMeL...) مع Fine-tuning مستمر.',
        sustainability: 'استقلالية تقنية: نماذج عربية لا تتوقف إذا توقف مزود خارجي.',
      },
      {
        tool: 'Weights & Biases',
        cost: '$2,400/سنة',
        purpose: 'تتبع تجارب تدريب النماذج وقياس الأداء عبر الزمن.',
        sustainability: 'يضمن تحسيناً مستمراً للنماذج بناءً على بيانات حقيقية.',
      },
      {
        tool: 'Data Annotation Team (Toloka / Scale)',
        cost: '$5,000 (مرة واحدة)',
        purpose: 'تسمية آلاف مقاطع فيديو إشارة وصور بريل لتدريب النماذج.',
        sustainability: 'بيانات عربية حقيقية تُحسّن دقة النماذج بنسبة 50%.',
      },
    ],
  },
  {
    phase: 'المرحلة الثالثة: الأجهزة والتكامل المادي (شهر 9–12)',
    duration: '4 أشهر',
    budget: '~$35,000',
    items: [
      {
        tool: 'ESP32 + Haptic Motors (100 وحدة)',
        cost: '$8,000',
        purpose: 'أذرع لمسية (wearable) للجسر الحسي العكسي: تحويل صوت/صورة إلى اهتزازات.',
        sustainability: 'توزيع على مراكز إعادة التأهيل في الأردن كتجربة أولية قابلة للتكرار.',
      },
      {
        tool: 'Raspberry Pi 5 + Camera (50 وحدة)',
        cost: '$7,500',
        purpose: 'أجهزة كشف إشارة مستقلة للمدارس (لا تحتاج إنترنت).',
        sustainability: 'تقليل الاعتماد على الهواتف الذكية في المناطق الريفية.',
      },
      {
        tool: 'Smart Glasses (Envision / OrCam) × 20',
        cost: '$10,000',
        purpose: 'دمج مع "عين الأعمى" لتجربة ميدانية مع المكفوفين.',
        sustainability: 'دراسة ميدانية تنشر في مؤتمرات علمية وتجذب مزيداً من التمويل.',
      },
      {
        tool: 'EMG Sensors + Arduino Kits',
        cost: '$4,500',
        purpose: 'مستشعرات عضلية لتدريب يد الأطفال على الإشارة.',
        sustainability: 'أداة علاجية فريدة تجذب مراكز العلاج الطبيعي كعملاء.',
      },
      {
        tool: '3D Printer + Filament',
        cost: '$3,000',
        purpose: 'طباعة رسومات لمسية (Tactile Graphics) ونماذج بريل للمدارس.',
        sustainability: 'توفير آلاف الرسومات اللمسية بتكلفة 90% أقل من الطباعة التجارية.',
      },
      {
        tool: 'IoT Cloud (ThingsBoard / AWS IoT)',
        cost: '$2,000/سنة',
        purpose: 'ربط الأجهزة بالمنصة وتتبع استخدامها في الوقت الحقيقي.',
        sustainability: 'بيانات استخدام حقيقية تُحسّن الأجهزة وتُبرهن الأثر للجهات المانحة.',
      },
    ],
  },
  {
    phase: 'المرحلة الرابعة: الفريق والنمو (مستمر)',
    duration: '12 شهر',
    budget: '~$25,000',
    items: [
      {
        tool: 'مطوّر Full-Stack متفرغ × 1',
        cost: '$12,000/سنة',
        purpose: 'صيانة المنصة، إضافة ميزات جديدة، وتحسين الأداء.',
        sustainability: 'يضمن استمرارية التطوير ولا يترك المنصة معتمدة على متطوعين فقط.',
      },
      {
        tool: 'أخصائي بيانات / AI Engineer × 0.5',
        cost: '$8,000/سنة',
        purpose: 'تحسين النماذج، قياس الأثر، وتوليد تقارير للجهات المانحة.',
        sustainability: 'بيانات دقيقة تُقنّع النجاح وتجلب تمويلاً إضافياً.',
      },
      {
        tool: 'منسّق مجتمع (Community Manager)',
        cost: '$5,000/سنة',
        purpose: 'تواصل مع الأهل والأطباء والمدارس، جمع feedback، وتنظيم ورش.',
        sustainability: 'بناء مجتمع ولاء يُبقي المستخدمين ويُحوّلهم لسفراء للمنصة.',
      },
    ],
  },
];

const ExpansionPlanSection: React.FC = () => {
  const [openPhase, setOpenPhase] = useState<number | null>(0);
  const totalBudget = '$150,000';

  return (
    <section id="expansion" className="px-6 py-12 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 scroll-mt-20 border-t border-[hsl(var(--damij-border))]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-4 mb-8 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg">
            <Rocket className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-1">
              خطة التوسع التقني — بميزانية 150,000 دولار
            </h2>
            <p className="text-sm md:text-base text-[hsl(var(--damij-muted))] leading-relaxed">
              خارطة طريق عملية مقسمة على 4 مراحل: من استقرار البنية التحتية إلى الذكاء الاصطناعي المتقدم،
              ثم التكامل مع أجهزة لمسية وإنترنت الأشياء، وأخيراً بناء فريق مستدام.
            </p>
          </div>
          <div className="shrink-0 px-5 py-3 rounded-xl bg-emerald-600 text-white font-black text-lg shadow-lg">
            {totalBudget}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { v: '4', l: 'مراحل تنفيذية', i: Layers },
            { v: '32+', l: 'أداة/نظام', i: Code2 },
            { v: '12', l: 'شهر زمني', i: Clock },
            { v: '∞', l: 'استدامة طويلة', i: Globe2 },
          ].map((s) => (
            <div key={s.l} className="p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <s.i className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-700 leading-none">{s.v}</div>
                <div className="text-xs text-[hsl(var(--damij-muted))] mt-1">{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Phases */}
        <div className="space-y-3">
          {EXPANSION_PLAN_150K.map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              className="rounded-2xl bg-white border border-[hsl(var(--damij-border))] overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenPhase(openPhase === idx ? null : idx)}
                className="w-full text-right p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                aria-expanded={openPhase === idx}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md font-black text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-[hsl(var(--damij-primary))] mb-0.5">{phase.phase}</h3>
                  <p className="text-xs text-[hsl(var(--damij-muted))]">المدة: {phase.duration} · الميزانية: {phase.budget}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-[hsl(var(--damij-muted))] transition-transform shrink-0 ${openPhase === idx ? 'rotate-180' : ''}`} />
              </button>

              {openPhase === idx && (
                <div className="border-t border-[hsl(var(--damij-border))] p-5 bg-slate-50/50">
                  <div className="grid grid-cols-1 gap-3">
                    {phase.items.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))]">
                        <div className="flex flex-col md:flex-row md:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[hsl(var(--damij-text))]">{item.tool}</span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono">{item.cost}</span>
                            </div>
                            <p className="text-sm text-[hsl(var(--damij-text))] mt-1.5 leading-relaxed">{item.purpose}</p>
                            <div className="mt-2 flex items-start gap-2 text-xs">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-emerald-700 font-medium">الاستدامة:</span>
                              <span className="text-[hsl(var(--damij-muted))]">{item.sustainability}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Impact summary */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-primary-2))] text-white">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> كيف تُحقّق هذه الخطة الاستدامة والتوسع؟
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm leading-relaxed">
            <div>
              <div className="font-bold mb-1">🔄 استدامة تقنية</div>
              <div className="opacity-90">
                كل أداة تُبنى على معايير مفتوحة (Open Source) أو واجهات برمجية قابلة للاستبدال.
                لا يوجد قفل تقني (Vendor Lock-in) — يمكن استبدال أي مزود دون إعادة بناء المنصة.
              </div>
            </div>
            <div>
              <div className="font-bold mb-1">📈 توسع تلقائي</div>
              <div className="opacity-90">
                البنية السحابية على Supabase + AWS تتوسع تلقائياً مع عدد المستخدمين.
                من 100 مستخدم إلى مليون مستخدم دون تغيير في البنية — تدفع فقط حسب الاستخدام.
              </div>
            </div>
            <div>
              <div className="font-bold mb-1">🤝 شراكات مؤسسية</div>
              <div className="opacity-90">
                الجهازيات اللمسية والدراسات الميدانية تُنتج أدلة علمية تُجذب وزارات الصحة والتعليم
                كشركاء دائمين، تحوّل المنصة من مشروع إلى منظومة وطنية.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------------
// Build a long, human-readable Arabic platform description for copying
// ----------------------------------------------------------------------------
const buildFullPlatformText = (): string => {
  const lines: string[] = [];
  lines.push('منصة دامج — المعلومات الكاملة');
  lines.push('====================================');
  lines.push('');
  lines.push('نبذة عامة:');
  lines.push('دامج منصة عربية متكاملة لذوي الإعاقة تجمع تحت سقف واحد أدوات للمكفوفين، الصم، التوحد، فرط الحركة وتشتت الانتباه (ADHD)، بريل، لغة الإشارة، الجسر الحسّي، والتدريب السريري. الرؤية الجوهرية: "الإعاقة ليست نقصاً بل اختلاف في الوصول"، وأن تكون دامج مرافقاً رقمياً يصاحب الإنسان من الطفولة إلى البلوغ.');
  lines.push('');
  lines.push('تم إنشاء المنصة بواسطة: مدرسة عنبه الثانية الشاملة للبنين.');
  lines.push('الرابط الرئيسي: https://damij-jo.life');
  lines.push('');
  lines.push('====================================');
  lines.push('الأنظمة الثمانية بالتفصيل:');
  lines.push('====================================');
  MODULES.forEach((m, i) => {
    lines.push('');
    lines.push(`${i + 1}. ${m.title}`);
    lines.push(`الرابط: ${m.rootPath}`);
    lines.push(`الوصف المختصر: ${m.shortDesc}`);
    lines.push(`الوصف الكامل: ${m.longDesc}`);
    lines.push('الخيارات والوظائف:');
    m.features.forEach((f) => {
      lines.push(`  • ${f.name}: ${f.desc}${f.path ? ` — ${f.path}` : ''}`);
    });
    lines.push(`التقنيات: ${m.tech.join('، ')}`);
    lines.push(`الخدمات الخارجية: ${m.apis.join('، ')}`);
  });
  lines.push('');
  lines.push('====================================');
  lines.push('التقنيات واللغات البرمجية:');
  lines.push('====================================');
  TECH_STACK.forEach((g) => {
    lines.push('');
    lines.push(`▸ ${g.cat}`);
    g.items.forEach((it) => lines.push(`  • ${it.name} — ${it.why}`));
  });
  lines.push('');
  lines.push('====================================');
  lines.push('المعمارية العامة:');
  lines.push('====================================');
  lines.push('Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion.');
  lines.push('Backend: Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions Deno).');
  lines.push('على الجهاز: TensorFlow.js (COCO-SSD) + MediaPipe (Hands/Pose/Face) — لدعم وضع عدم الاتصال.');
  lines.push('خدمات خارجية: Gemini 2.5 Flash/Pro، ElevenLabs (TTS)، OSRM (الملاحة)، Nominatim (الجغرافيا)، OCR.space، Resend (البريد).');
  lines.push('');
  lines.push('====================================');
  lines.push('كيف تشتغل المنصة (دليل سريع):');
  lines.push('====================================');
  lines.push('1. الدخول: عبر /damij/auth — إنشاء حساب أو تسجيل دخول. حسابات ذروة العلم لا تعمل في دامج لذلك يحتاج المستخدم لإنشاء حساب دامج خاص.');
  lines.push('2. الصفحة الرئيسية /damij: عرض الأنظمة الثمانية كبطاقات. كل بطاقة تأخذك للقسم.');
  lines.push('3. مفاتيح الواجهة: مبدّل لغة (15 لغة)، ترجمة فورية لكل DOM، وضع Eco لتقليل الحركة والاستهلاك.');
  lines.push('4. الأدوات السريرية (ADHD/توحد/سريري) تنتج تقارير قابلة للمشاركة عبر رابط واحد بين الأهل والطبيب والمدرسة.');
  lines.push('5. الإعدادات الحسية تتحكم بالاهتزاز، النطق، التباين، وحجم الخط — قابلة للحفظ في الملف الشخصي.');
  lines.push('6. كل البيانات تُحفظ في Supabase مع RLS، ولا تُشارك مع أطراف ثالثة.');
  lines.push('');
  lines.push('====================================');
  lines.push('الرؤية المستقبلية الكاملة:');
  lines.push('====================================');
  FUTURE_VISION.forEach((v) => {
    lines.push('');
    lines.push(`▸ ${v.title}`);
    v.items.forEach((it) => lines.push(`  • ${it}`));
  });
  lines.push('');
  lines.push('====================================');
  lines.push('المصادر العلمية المعتمدة:');
  lines.push('====================================');
  SOURCES.forEach((s) => lines.push(`• ${s.name} — ${s.use}`));
  lines.push('');
  lines.push('====================================');
  lines.push('انتهت معلومات المنصة. آخر تحديث: 2026.');
  return lines.join('\n');
};

const PlatformInfoSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const fullText = React.useMemo(() => buildFullPlatformText(), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('تم نسخ معلومات المنصة بالكامل');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = fullText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast.success('تم النسخ'); setCopied(true); setTimeout(() => setCopied(false), 2500); }
      catch { toast.error('تعذّر النسخ — انسخ النص يدوياً'); }
      finally { document.body.removeChild(ta); }
    }
  };

  return (
    <section id="platform-info" className="px-6 py-12 bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-[hsl(var(--damij-primary-2))]/5 scroll-mt-20 border-t border-[hsl(var(--damij-border))]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-4 mb-6 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--damij-primary))] text-white flex items-center justify-center shrink-0 shadow-lg">
            <Info className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-1">
              معلومات المنصة بشكل كامل
            </h2>
            <p className="text-sm md:text-base text-[hsl(var(--damij-muted))] leading-relaxed">
              ملخّص شامل وقابل للنسخ يحتوي على: كل الأنظمة، كل الخيارات وكيف تشتغل، التقنيات المستخدمة، والرؤية المستقبلية لمنصة دامج — بالتفصيل الممل.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition text-white ${
              copied ? 'bg-emerald-600' : 'bg-[hsl(var(--damij-primary))] hover:opacity-90'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'تم النسخ' : 'نسخ كل المعلومات'}
          </button>
        </div>

        {/* Future vision quick view */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {FUTURE_VISION.map((v) => (
            <div key={v.title} className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-border))]">
              <div className="flex items-center gap-2 mb-3">
                <Rocket className="w-5 h-5 text-[hsl(var(--damij-primary))]" />
                <h3 className="font-bold text-sm text-[hsl(var(--damij-primary))] leading-snug">{v.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {v.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-xs leading-relaxed text-[hsl(var(--damij-text))]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--damij-accent))] shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Full text preview */}
        <details className="rounded-2xl bg-white border border-[hsl(var(--damij-border))] overflow-hidden">
          <summary className="cursor-pointer select-none px-5 py-4 font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 hover:bg-slate-50 transition">
            <FileText className="w-5 h-5" /> عرض النص الكامل القابل للنسخ
          </summary>
          <pre
            dir="rtl"
            className="px-5 py-4 text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-[hsl(var(--damij-text))] bg-slate-50 border-t border-[hsl(var(--damij-border))] max-h-[480px] overflow-auto"
            style={{ fontFamily: '"Tajawal","Cairo","Inter",sans-serif' }}
          >
            {fullText}
          </pre>
        </details>
      </div>
    </section>
  );
};



const DamijDocs: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <DamijSEO
        title="توثيق منصة دامج — كل الأنظمة والتقنيات والمصادر"
        description="توثيق شامل لمنصة دامج: كل وحدة ووظيفة وصفحة، التقنيات واللغات البرمجية المستخدمة، والمصادر العلمية التي بُنيت عليها."
        path="/damij/docs"
      />

      {/* Hero */}
      <section className="px-6 py-12 md:py-16 border-b border-[hsl(var(--damij-border))] bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-[hsl(var(--damij-primary-2))]/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))] text-white mb-4 shadow-lg">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[hsl(var(--damij-primary))] mb-3 tracking-tight">
            توثيق منصة دامج
          </h1>
          <p className="text-base md:text-lg text-[hsl(var(--damij-muted))] max-w-3xl mx-auto leading-relaxed">
            دليل تفصيلي لكل ما تحتويه منصة دامج: الأنظمة، الوظائف، الصفحات، التقنيات واللغات البرمجية، والمصادر العلمية.
            اضغط على أي وحدة لرؤية تفاصيلها الكاملة، أو اذهب مباشرة لأي صفحة عبر روابط "افتح".
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-sm">
            <a href="#modules" className="px-4 py-2 rounded-full bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition">الأنظمة الثمانية</a>
            <a href="#tech" className="px-4 py-2 rounded-full bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition">التقنيات</a>
            <a href="#sources" className="px-4 py-2 rounded-full bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition">المصادر العلمية</a>
            <a href="#architecture" className="px-4 py-2 rounded-full bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition">المعمارية</a>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="px-6 py-8 -mt-2">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '8', l: 'أنظمة متكاملة', i: Layers },
            { v: '60+', l: 'صفحة ووظيفة', i: FileText },
            { v: '15', l: 'لغة مدعومة', i: Globe2 },
            { v: '100%', l: 'مرجعية علمية', i: ShieldCheck },
          ].map((s) => (
            <div key={s.l} className="p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center">
                <s.i className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[hsl(var(--damij-primary))] leading-none">{s.v}</div>
                <div className="text-xs text-[hsl(var(--damij-muted))] mt-1">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-2">الأنظمة الثمانية بالتفصيل</h2>
          <p className="text-[hsl(var(--damij-muted))] mb-6">كل وحدة مع وصفها الكامل، صفحاتها، تقنياتها، وروابط الزيارة المباشرة.</p>
          <div className="space-y-3">
            {MODULES.map((m, i) => (
              <ModuleCard key={m.id} m={m} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section id="tech" className="px-6 py-12 bg-slate-100/60 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-2">التقنيات واللغات البرمجية</h2>
          <p className="text-[hsl(var(--damij-muted))] mb-6">كل ما تعتمد عليه المنصة، من اللغة البرمجية إلى مزودي الذكاء الاصطناعي والخدمات السحابية.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TECH_STACK.map((g) => (
              <div key={g.cat} className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-border))]">
                <h3 className="font-bold text-lg text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2">
                  <g.icon className="w-5 h-5" /> {g.cat}
                </h3>
                <ul className="space-y-2">
                  {g.items.map((it) => (
                    <li key={it.name} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--damij-primary))] shrink-0" />
                      <div>
                        <span className="font-bold text-[hsl(var(--damij-text))]">{it.name}</span>
                        <span className="text-[hsl(var(--damij-muted))]"> — {it.why}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="px-6 py-12 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-2">المعمارية العامة</h2>
          <p className="text-[hsl(var(--damij-muted))] mb-6">كيف تتصل القطع ببعضها داخل دامج.</p>
          <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto" dir="ltr">
            <pre>{`┌─────────────────────────────────────────────────────────────┐
│              React 18 + TypeScript + Vite (SPA)             │
│       Tailwind · shadcn/ui · Framer Motion · React Router   │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┬──────────────┐
        ▼                 ▼              ▼              ▼
  Browser APIs       Supabase Cloud   Edge Functions   3rd-party
  ─────────────      ──────────────   (Deno)           ─────────
  · Camera           · PostgreSQL     · blind-eye-*    · Gemini
  · Mic / TTS        · Auth (RLS)     · sign-*         · ElevenLabs
  · Geolocation      · Storage        · braille-*      · OSRM
  · Vibrate          · Realtime       · autism/adhd-*  · Nominatim
  · DeviceMotion     · Buckets        · sensory-*      · OCR.space
                                                       
        ┌──────────────────────────────────────────────┐
        │   On-device ML (offline-capable)             │
        │   · TensorFlow.js + COCO-SSD                 │
        │   · MediaPipe Hands / Pose / Face            │
        └──────────────────────────────────────────────┘`}</pre>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="px-6 py-12 bg-slate-100/60 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-2">المصادر العلمية والمعايير</h2>
          <p className="text-[hsl(var(--damij-muted))] mb-6">المراجع المعتمدة في كل أداة سريرية أو تعليمية داخل المنصة.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))] flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[hsl(var(--damij-primary))] mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-[hsl(var(--damij-text))]">{s.name}</div>
                  <div className="text-xs text-[hsl(var(--damij-muted))] mt-0.5">{s.use}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/damij/sources"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold hover:opacity-90"
            >
              صفحة المصادر الكاملة <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Complete platform information (copyable) */}
      <PlatformInfoSection />

      {/* Footer note */}
      <footer className="px-6 py-10 text-center border-t border-[hsl(var(--damij-border))]">
        <p className="text-sm text-[hsl(var(--damij-muted))] max-w-2xl mx-auto leading-relaxed">
          تم إنشاء منصة دامج بواسطة <strong className="text-[hsl(var(--damij-primary))]">مدرسة عنبه الثانية الشاملة للبنين</strong>
          {' '}كمنظومة دعم تعليمي شاملة لذوي الإعاقة، تستند إلى أحدث الأبحاث السريرية ومعايير الوصول العالمية.
        </p>
      </footer>
    </div>
  );
};

export default DamijDocs;
