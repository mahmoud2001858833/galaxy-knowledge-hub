import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ChevronDown, ExternalLink, Code2, Database, Cpu, Globe2, Sparkles,
  Eye, Hand, Brain, Activity, Layers, FlaskConical, Type, ShieldCheck, Cloud,
  Mic, Camera, MapPin, Vibrate, Languages, FileText, BarChart3, Users,
  Copy, Check, Info, Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import DamijSEO from '@/components/damij/DamijSEO';

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
