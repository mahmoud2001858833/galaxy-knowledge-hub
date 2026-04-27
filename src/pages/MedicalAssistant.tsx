import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Search, Phone, AlertTriangle, Loader2, Sparkles,
  Activity, ShieldAlert, ShieldCheck, Stethoscope, X, Mic, MicOff,
  HeartPulse, Zap, ChevronRight, Cpu, ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useArabicSpeech } from "@/hooks/useArabicSpeech";

interface MedicalCondition {
  id: number;
  name: string;
  category: string;
  symptoms: string[];
  firstAid: string[];
  warning: string;
  icon: string;
}

const medicalConditions: MedicalCondition[] = [
  { id: 1, name: 'ضربة الشمس', category: 'طوارئ', symptoms: ['ارتفاع حرارة الجسم', 'صداع شديد', 'غثيان', 'جفاف الجلد'], firstAid: ['نقل المصاب لمكان بارد', 'إزالة الملابس الزائدة', 'تبريد الجسم بالماء', 'شرب السوائل'], warning: 'اتصل بالإسعاف فوراً إذا فقد الوعي', icon: '☀️' },
  { id: 2, name: 'الإغماء', category: 'طوارئ', symptoms: ['شحوب الوجه', 'دوخة', 'ضعف عام', 'تعرق'], firstAid: ['مد المصاب على ظهره', 'رفع القدمين', 'فك الملابس الضيقة', 'التأكد من التنفس'], warning: 'إذا لم يستعد وعيه خلال دقيقة اتصل بالإسعاف', icon: '😵' },
  { id: 3, name: 'كسر العظام', category: 'إصابات', symptoms: ['ألم شديد', 'تورم', 'تشوه في العضو', 'عدم القدرة على الحركة'], firstAid: ['عدم تحريك المصاب', 'تثبيت العضو المكسور', 'وضع كمادات باردة', 'طلب المساعدة الطبية'], warning: 'لا تحاول تعديل العظم المكسور', icon: '🦴' },
  { id: 4, name: 'الجروح والخدوش', category: 'إصابات', symptoms: ['نزيف', 'ألم', 'احمرار'], firstAid: ['تنظيف الجرح بالماء', 'الضغط لإيقاف النزيف', 'وضع مطهر', 'تغطية بضماد نظيف'], warning: 'راجع الطبيب إذا كان الجرح عميقاً', icon: '🩹' },
  { id: 5, name: 'نزيف الأنف', category: 'نزيف', symptoms: ['نزول دم من الأنف', 'صداع أحياناً'], firstAid: ['الجلوس وإمالة الرأس للأمام', 'الضغط على جانبي الأنف', 'وضع كمادة باردة', 'عدم إمالة الرأس للخلف'], warning: 'راجع الطبيب إذا استمر أكثر من 20 دقيقة', icon: '👃' },
  { id: 6, name: 'الحروق', category: 'إصابات', symptoms: ['احمرار الجلد', 'ألم', 'فقاعات'], firstAid: ['وضع الماء البارد لـ10 دقائق', 'تغطية بضماد نظيف', 'عدم فقع الفقاعات', 'تناول مسكن للألم'], warning: 'الحروق الكبيرة تتطلب رعاية طبية فورية', icon: '🔥' },
  { id: 7, name: 'لدغات الحشرات', category: 'لدغات', symptoms: ['تورم', 'حكة', 'احمرار', 'ألم'], firstAid: ['غسل المنطقة بالماء والصابون', 'وضع كمادة باردة', 'استخدام كريم مضاد للحكة', 'مراقبة علامات الحساسية'], warning: 'اطلب المساعدة فوراً عند ظهور صعوبة بالتنفس', icon: '🐝' },
  { id: 8, name: 'الحساسية', category: 'حساسية', symptoms: ['طفح جلدي', 'حكة', 'تورم', 'صعوبة التنفس'], firstAid: ['إبعاد مسبب الحساسية', 'تناول مضاد الهيستامين', 'وضع كمادات باردة', 'مراقبة التنفس'], warning: 'الحساسية الشديدة تتطلب حقنة الأدرينالين', icon: '🤧' },
  { id: 9, name: 'الربو', category: 'تنفسي', symptoms: ['صعوبة التنفس', 'صفير', 'سعال', 'ضيق الصدر'], firstAid: ['الجلوس باستقامة', 'استخدام البخاخ', 'التنفس ببطء', 'الابتعاد عن المهيجات'], warning: 'اتصل بالإسعاف إذا لم يتحسن', icon: '😮‍💨' },
  { id: 10, name: 'آلام البطن', category: 'هضمي', symptoms: ['ألم في البطن', 'غثيان', 'انتفاخ'], firstAid: ['الراحة', 'شرب سوائل دافئة', 'تجنب الأكل الثقيل', 'استخدام قربة دافئة'], warning: 'الألم الشديد المفاجئ يتطلب فحصاً طبياً', icon: '🤢' },
  { id: 11, name: 'الصداع', category: 'أعصاب', symptoms: ['ألم في الرأس', 'حساسية للضوء', 'غثيان أحياناً'], firstAid: ['الراحة في مكان هادئ', 'شرب الماء', 'تناول مسكن', 'كمادات باردة'], warning: 'الصداع المفاجئ الشديد يتطلب فحصاً فورياً', icon: '🤕' },
  { id: 12, name: 'ارتفاع الحرارة', category: 'عام', symptoms: ['حرارة عالية', 'تعرق', 'قشعريرة', 'ضعف'], firstAid: ['كمادات فاترة', 'شرب السوائل', 'خافض للحرارة', 'ملابس خفيفة'], warning: 'حرارة فوق 40 درجة تتطلب طوارئ', icon: '🌡️' },
  { id: 13, name: 'الغثيان والقيء', category: 'هضمي', symptoms: ['شعور بالغثيان', 'قيء', 'دوخة'], firstAid: ['الراحة', 'رشفات ماء صغيرة', 'تجنب الطعام', 'تنفس عميق'], warning: 'القيء المستمر يسبب الجفاف', icon: '🤮' },
  { id: 14, name: 'الإسهال', category: 'هضمي', symptoms: ['براز مائي', 'ألم بطن', 'تقلصات'], firstAid: ['شرب السوائل', 'محلول الجفاف', 'تجنب الحليب', 'أكل خفيف'], warning: 'الإسهال الدموي يتطلب فحصاً فورياً', icon: '🚽' },
  { id: 15, name: 'التسمم الغذائي', category: 'طوارئ', symptoms: ['قيء', 'إسهال', 'ألم بطن', 'حرارة'], firstAid: ['شرب السوائل', 'الراحة', 'محلول الجفاف', 'عدم تناول طعام صلب'], warning: 'الأعراض الشديدة تتطلب طوارئ', icon: '🍽️' },
  { id: 16, name: 'الاختناق', category: 'طوارئ', symptoms: ['عدم القدرة على التنفس', 'ازرقاق', 'إشارات يد للعنق'], firstAid: ['ضربات على الظهر', 'ضغطات بطنية', 'طلب الإسعاف', 'إنعاش إذا لزم'], warning: 'حالة طوارئ - تصرف فوراً', icon: '😱' },
  { id: 17, name: 'نوبات الصرع', category: 'أعصاب', symptoms: ['تشنجات', 'فقدان الوعي', 'زبد من الفم'], firstAid: ['حماية الرأس', 'إبعاد الأشياء الخطرة', 'عدم تقييد الحركة', 'وضع جانبي بعد التشنج'], warning: 'لا تضع شيئاً في الفم', icon: '⚡' },
  { id: 18, name: 'هبوط السكر', category: 'أيض', symptoms: ['تعرق', 'رجفة', 'ضعف', 'دوخة', 'جوع'], firstAid: ['تناول سكر سريع', 'عصير فواكه', 'حلوى', 'مراقبة الحالة'], warning: 'إذا فقد الوعي لا تعطه شيئاً بالفم', icon: '🍬' },
  { id: 19, name: 'التواء المفاصل', category: 'إصابات', symptoms: ['ألم', 'تورم', 'صعوبة الحركة'], firstAid: ['الراحة', 'ثلج', 'ضغط', 'رفع العضو'], warning: 'راجع الطبيب للتأكد من عدم الكسر', icon: '🦶' },
  { id: 20, name: 'الكدمات', category: 'إصابات', symptoms: ['تغير لون الجلد', 'ألم', 'تورم'], firstAid: ['كمادات باردة', 'الراحة', 'رفع المنطقة', 'مسكن للألم'], warning: 'الكدمات الكبيرة تحتاج فحصاً', icon: '🟣' },
  { id: 21, name: 'ألم الأسنان', category: 'فم', symptoms: ['ألم حاد', 'حساسية', 'تورم اللثة'], firstAid: ['مسكن للألم', 'غرغرة ماء ملح', 'كمادة باردة', 'تجنب البارد والساخن'], warning: 'راجع طبيب الأسنان', icon: '🦷' },
  { id: 22, name: 'التهاب العين', category: 'عيون', symptoms: ['احمرار', 'حكة', 'دموع', 'حساسية للضوء'], firstAid: ['غسل العين بماء نظيف', 'عدم الفرك', 'كمادات باردة', 'تجنب العدسات'], warning: 'راجع الطبيب إذا استمر', icon: '👁️' },
  { id: 23, name: 'ألم الأذن', category: 'أذن', symptoms: ['ألم', 'صعوبة السمع', 'إفرازات'], firstAid: ['مسكن للألم', 'كمادة دافئة', 'عدم إدخال أشياء', 'مراجعة الطبيب'], warning: 'الإفرازات تحتاج فحصاً', icon: '👂' },
  { id: 24, name: 'الرشح والزكام', category: 'تنفسي', symptoms: ['سيلان الأنف', 'عطس', 'احتقان', 'حرارة خفيفة'], firstAid: ['الراحة', 'شرب السوائل', 'بخار ماء', 'مسكن وخافض حرارة'], warning: 'راجع الطبيب إذا استمر أكثر من أسبوع', icon: '🤧' },
  { id: 25, name: 'التهاب الحلق', category: 'تنفسي', symptoms: ['ألم عند البلع', 'احمرار الحلق', 'حرارة'], firstAid: ['غرغرة ماء ملح', 'شرب سوائل دافئة', 'مسكن', 'راحة الصوت'], warning: 'اللوزتين المتورمتين تحتاج فحصاً', icon: '🗣️' },
  { id: 26, name: 'السعال المستمر', category: 'تنفسي', symptoms: ['سعال جاف أو رطب', 'ضيق تنفس', 'ألم صدر'], firstAid: ['شرب سوائل دافئة', 'عسل', 'بخار', 'دواء سعال'], warning: 'السعال الدموي يتطلب فحصاً فورياً', icon: '😷' },
  { id: 27, name: 'ضيق التنفس', category: 'تنفسي', symptoms: ['صعوبة التنفس', 'تسارع التنفس', 'قلق'], firstAid: ['الجلوس باستقامة', 'تهوية جيدة', 'تهدئة المصاب', 'بخاخ إذا متوفر'], warning: 'حالة طوارئ - اتصل بالإسعاف', icon: '💨' },
  { id: 28, name: 'الدوخة', category: 'أعصاب', symptoms: ['شعور بالدوران', 'عدم التوازن', 'غثيان'], firstAid: ['الجلوس أو الاستلقاء', 'شرب ماء', 'تنفس عميق', 'تجنب الحركة المفاجئة'], warning: 'الدوخة المتكررة تحتاج فحصاً', icon: '😵‍💫' },
  { id: 29, name: 'خفقان القلب', category: 'قلب', symptoms: ['تسارع ضربات القلب', 'ضيق تنفس', 'قلق'], firstAid: ['الراحة', 'تنفس عميق', 'تهدئة', 'شرب ماء'], warning: 'الخفقان المستمر يتطلب فحصاً', icon: '💓' },
  { id: 30, name: 'انخفاض الضغط', category: 'قلب', symptoms: ['دوخة', 'ضعف', 'شحوب', 'تعرق'], firstAid: ['الاستلقاء ورفع القدمين', 'شرب السوائل', 'ملح خفيف', 'تجنب الوقوف المفاجئ'], warning: 'الإغماء المتكرر يتطلب فحصاً', icon: '📉' },
  { id: 31, name: 'القلق والتوتر', category: 'نفسي', symptoms: ['توتر', 'تسارع القلب', 'تعرق', 'صعوبة تركيز'], firstAid: ['تنفس عميق', 'مكان هادئ', 'التحدث بهدوء', 'تمارين استرخاء'], warning: 'نوبات الهلع قد تحتاج مساعدة متخصصة', icon: '😰' },
  { id: 32, name: 'إصابات الملاعب', category: 'رياضة', symptoms: ['ألم', 'تورم', 'صعوبة الحركة'], firstAid: ['إيقاف النشاط', 'ثلج', 'ضغط', 'رفع'], warning: 'الإصابات الشديدة تحتاج فحصاً', icon: '⚽' },
  { id: 33, name: 'الشد العضلي', category: 'عضلات', symptoms: ['تقلص مفاجئ', 'ألم حاد', 'تصلب'], firstAid: ['تمدد خفيف', 'تدليك', 'كمادة دافئة', 'شرب ماء'], warning: 'التكرار يحتاج فحصاً', icon: '💪' },
  { id: 34, name: 'آلام الظهر', category: 'عضلات', symptoms: ['ألم في أسفل الظهر', 'تصلب', 'صعوبة الحركة'], firstAid: ['راحة', 'كمادة دافئة أو باردة', 'تمارين خفيفة', 'مسكن'], warning: 'الألم مع تنميل يحتاج فحصاً', icon: '🔙' },
  { id: 35, name: 'جسم غريب في العين', category: 'عيون', symptoms: ['ألم', 'دموع', 'احمرار', 'حساسية للضوء'], firstAid: ['غسل العين بماء', 'عدم الفرك', 'رمش طبيعي', 'تغطية العين'], warning: 'الأجسام الحادة تتطلب طوارئ', icon: '👁️' },
  { id: 36, name: 'الحكة الجلدية', category: 'جلد', symptoms: ['حكة', 'احمرار', 'طفح'], firstAid: ['كمادات باردة', 'كريم مرطب', 'مضاد حكة', 'تجنب الخدش'], warning: 'الطفح المنتشر يحتاج فحصاً', icon: '🤚' },
  { id: 37, name: 'لسعة قنديل البحر', category: 'لدغات', symptoms: ['ألم حارق', 'علامات حمراء', 'تورم'], firstAid: ['شطف بماء البحر', 'إزالة الخيوط بحذر', 'خل أو كحول', 'كمادات حارة'], warning: 'صعوبة التنفس تتطلب طوارئ', icon: '🎐' },
  { id: 38, name: 'لدغة العقرب', category: 'لدغات', symptoms: ['ألم شديد', 'تورم', 'تنميل', 'تعرق'], firstAid: ['تهدئة المصاب', 'عدم الحركة', 'كمادة باردة', 'طلب الإسعاف فوراً'], warning: 'حالة طوارئ - اتصل بالإسعاف', icon: '🦂' },
  { id: 39, name: 'الصدمة الكهربائية', category: 'طوارئ', symptoms: ['حروق', 'فقدان الوعي', 'صعوبة التنفس'], firstAid: ['فصل الكهرباء أولاً', 'لا تلمس المصاب مباشرة', 'إنعاش إذا لزم', 'طلب الإسعاف'], warning: 'لا تلمس المصاب قبل فصل الكهرباء!', icon: '⚡' },
  { id: 40, name: 'الغرق', category: 'طوارئ', symptoms: ['صعوبة تنفس', 'سعال', 'ازرقاق', 'فقدان وعي'], firstAid: ['إخراج من الماء', 'فحص التنفس', 'إنعاش قلبي رئوي', 'طلب الإسعاف'], warning: 'ابدأ الإنعاش فوراً', icon: '🏊' },
  { id: 41, name: 'الجفاف', category: 'أيض', symptoms: ['عطش شديد', 'جفاف الفم', 'بول داكن', 'تعب'], firstAid: ['شرب السوائل ببطء', 'محلول الجفاف', 'راحة في الظل', 'تجنب الحرارة'], warning: 'الجفاف الشديد يتطلب سوائل وريدية', icon: '💧' },
  { id: 42, name: 'سوء التغذية', category: 'عام', symptoms: ['ضعف عام', 'شحوب', 'تعب', 'صعوبة تركيز'], firstAid: ['وجبات متوازنة', 'فيتامينات', 'راحة', 'متابعة طبية'], warning: 'فقدان الوزن السريع يحتاج فحصاً', icon: '🍎' },
  { id: 43, name: 'الأرق والإرهاق', category: 'نفسي', symptoms: ['صعوبة النوم', 'تعب', 'قلة تركيز', 'تهيج'], firstAid: ['روتين نوم منتظم', 'بيئة هادئة', 'تجنب الشاشات', 'مشروب دافئ'], warning: 'الأرق المزمن يحتاج استشارة', icon: '😴' },
  { id: 44, name: 'آلام الدورة الشهرية', category: 'نسائي', symptoms: ['تقلصات بطنية', 'ألم ظهر', 'صداع', 'تعب'], firstAid: ['قربة دافئة', 'مسكن', 'راحة', 'مشروبات دافئة'], warning: 'الألم الشديد جداً يحتاج فحصاً', icon: '🩸' },
  { id: 45, name: 'نزيف اللثة', category: 'فم', symptoms: ['نزيف عند التنظيف', 'احمرار اللثة', 'رائحة فم'], firstAid: ['غرغرة ماء ملح', 'فرشاة ناعمة', 'تجنب الطعام الصلب', 'مراجعة طبيب أسنان'], warning: 'النزيف المستمر يحتاج فحصاً', icon: '🦷' },
  { id: 46, name: 'تورم الوجه', category: 'حساسية', symptoms: ['تورم', 'احمرار', 'حكة', 'صعوبة تنفس'], firstAid: ['كمادات باردة', 'مضاد هيستامين', 'مراقبة التنفس', 'طلب المساعدة'], warning: 'تورم الحلق حالة طوارئ', icon: '😶' },
  { id: 47, name: 'صعوبة البلع', category: 'حلق', symptoms: ['ألم عند البلع', 'شعور بانسداد', 'سيلان لعاب'], firstAid: ['رشفات ماء صغيرة', 'طعام طري', 'عدم الإجبار على البلع', 'مراجعة الطبيب'], warning: 'صعوبة البلع المفاجئة تتطلب فحصاً', icon: '🍽️' },
  { id: 48, name: 'آلام الصدر', category: 'قلب', symptoms: ['ألم في الصدر', 'ضيق تنفس', 'تعرق', 'غثيان'], firstAid: ['الراحة التامة', 'الجلوس باستقامة', 'فك الملابس الضيقة', 'طلب الإسعاف فوراً'], warning: 'قد تكون نوبة قلبية - طوارئ!', icon: '💔' },
  { id: 49, name: 'فقدان التوازن', category: 'أعصاب', symptoms: ['عدم الثبات', 'دوار', 'غثيان', 'طنين الأذن'], firstAid: ['الجلوس أو الاستلقاء', 'تثبيت النظر', 'تجنب الحركة السريعة', 'شرب ماء'], warning: 'قد يكون مشكلة في الأذن الداخلية', icon: '🎢' },
  { id: 50, name: 'جفاف الجلد والتشققات', category: 'جلد', symptoms: ['جفاف', 'تشققات', 'حكة', 'احمرار'], firstAid: ['مرطب مناسب', 'شرب الماء', 'تجنب الصابون القوي', 'حماية من الشمس'], warning: 'التشققات العميقة تحتاج علاجاً', icon: '🧴' },
];

const categories = ["all", ...Array.from(new Set(medicalConditions.map((c) => c.category)))];

interface CheckResult {
  probability: number;
  verdict: "likely" | "possible" | "unlikely";
  severity: "low" | "medium" | "high" | "emergency";
  matched_symptoms: string[];
  missing_symptoms: string[];
  red_flags?: string[];
  recommendation: string;
  alternative_conditions?: string[];
}

const MedicalAssistant = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeCondition, setActiveCondition] = useState<MedicalCondition | null>(null);
  const [checkerCondition, setCheckerCondition] = useState<MedicalCondition | null>(null);

  const filteredConditions = useMemo(
    () =>
      medicalConditions.filter((c) => {
        const q = searchQuery.trim();
        const okSearch =
          !q || c.name.includes(q) || c.symptoms.some((s) => s.includes(q));
        const okCat = selectedCategory === "all" || c.category === selectedCategory;
        return okSearch && okCat;
      }),
    [searchQuery, selectedCategory]
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#05060f] text-white relative overflow-hidden">
      <Helmet>
        <title>المساعد الطبي الذكي · مستقبل التكنولوجيا</title>
        <meta name="description" content="فحص أولي للحالات الطبية الشائعة وتأكيد ذكي عبر الذكاء الاصطناعي" />
      </Helmet>

      {/* Background grid + glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-violet-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(sessionStorage.getItem('gju_mode') === 'true' ? "/gju-competition#ai" : "/")} className="text-white/70 hover:text-white hover:bg-white/5 gap-2">
            <ArrowLeft className="w-4 h-4" /> الرئيسية
          </Button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 opacity-50 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-l from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                المساعد الطبي الذكي
              </h1>
              <p className="text-xs text-white/50 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> فحص أولي بالذكاء الاصطناعي
              </p>
            </div>
          </div>

          <a
            href="tel:911"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all text-sm font-medium"
          >
            <Phone className="w-4 h-4" /> طوارئ
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs text-white/70 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            مدعوم بالذكاء الاصطناعي · أداة تعليمية فقط
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-l from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent leading-tight">
            افهم حالتك في ثوانٍ
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            اختر الحالة المشابهة لما تشعر به، اقرأ الإسعافات الأولية، ثم اضغط
            <span className="text-cyan-300 font-semibold"> «تأكد من حالتك» </span>
            لتحليل أعراضك الفعلية بالذكاء الاصطناعي.
          </p>
        </motion.div>

        {/* Search + Category filter */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن حالة أو عرض... (مثلاً: صداع، حرارة)"
              className="bg-white/5 border-white/10 text-white pr-12 h-14 text-base backdrop-blur-xl rounded-2xl focus-visible:ring-cyan-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all border ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white border-transparent shadow-lg shadow-cyan-500/30"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat === "all" ? "الكل" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredConditions.map((cond, i) => (
              <ConditionCard
                key={cond.id}
                cond={cond}
                index={i}
                onView={() => setActiveCondition(cond)}
                onCheck={() => setCheckerCondition(cond)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredConditions.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            لا توجد حالات مطابقة
          </div>
        )}

        {/* Disclaimer */}
        <div className="max-w-3xl mx-auto mt-16 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-xl flex gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-100/80 leading-relaxed">
            هذه الأداة للأغراض التعليمية والإرشادية فقط، وليست بديلاً عن الفحص أو التشخيص الطبي. في حالات الطوارئ اتصل فوراً بالإسعاف.
          </p>
        </div>
      </main>

      {/* Detail dialog */}
      <ConditionDetailDialog
        cond={activeCondition}
        onClose={() => setActiveCondition(null)}
        onCheck={() => {
          setCheckerCondition(activeCondition);
          setActiveCondition(null);
        }}
      />

      {/* AI Checker dialog */}
      <ConditionCheckerDialog
        cond={checkerCondition}
        onClose={() => setCheckerCondition(null)}
      />
    </div>
  );
};

/* ================================ CARD ================================ */
const ConditionCard: React.FC<{
  cond: MedicalCondition;
  index: number;
  onView: () => void;
  onCheck: () => void;
}> = ({ cond, index, onView, onCheck }) => {
  const isEmergency = cond.category === "طوارئ";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${
          isEmergency
            ? "from-rose-500/40 via-orange-500/30 to-amber-500/20"
            : "from-cyan-500/30 via-violet-500/20 to-fuchsia-500/20"
        } opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10`}
      />
      <div className="relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl p-4 overflow-hidden">
        {isEmergency && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">
            <Zap className="w-2.5 h-2.5" /> طوارئ
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl drop-shadow-lg">{cond.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm mb-0.5 truncate">{cond.name}</h3>
            <p className="text-[11px] text-white/40">{cond.category}</p>
          </div>
        </div>

        <div className="space-y-1.5 mb-4 min-h-[60px]">
          {cond.symptoms.slice(0, 3).map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-white/60">
              <div className="w-1 h-1 rounded-full bg-cyan-400" />
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-all flex items-center justify-center gap-1"
          >
            التفاصيل <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={onCheck}
            className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500/90 to-violet-500/90 hover:from-cyan-500 hover:to-violet-500 text-xs text-white font-medium transition-all flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/20"
          >
            <ScanLine className="w-3 h-3" /> تأكد
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ============================ DETAIL DIALOG ============================ */
const ConditionDetailDialog: React.FC<{
  cond: MedicalCondition | null;
  onClose: () => void;
  onCheck: () => void;
}> = ({ cond, onClose, onCheck }) => (
  <Dialog open={!!cond} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-2xl bg-[#0a0b18] border-white/10 text-white max-h-[90vh] overflow-y-auto" dir="rtl">
      {cond && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <span className="text-3xl">{cond.icon}</span>
              <span className="bg-gradient-to-l from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {cond.name}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <Section title="الأعراض" icon={<HeartPulse className="w-4 h-4 text-cyan-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cond.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {s}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="الإسعافات الأولية" icon={<Activity className="w-4 h-4 text-emerald-400" />}>
              <ol className="space-y-2">
                {cond.firstAid.map((s, i) => (
                  <li key={i} className="flex gap-3 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-sm text-white/80">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Section>

            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-100">{cond.warning}</div>
            </div>

            <Button
              onClick={onCheck}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 shadow-lg shadow-cyan-500/30 gap-2"
            >
              <ScanLine className="w-4 h-4" />
              تأكد إن كنت مصاباً بهذه الحالة
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white/90">{icon}{title}</div>
    {children}
  </div>
);

/* ============================ CHECKER DIALOG ============================ */
const CHRONIC_OPTIONS = [
  "ضغط الدم", "السكري", "الربو", "أمراض القلب", "حساسية", "صداع نصفي", "اكتئاب/قلق",
];

const ConditionCheckerDialog: React.FC<{
  cond: MedicalCondition | null;
  onClose: () => void;
}> = ({ cond, onClose }) => {
  const [userSymptoms, setUserSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  // Advanced contextual fields
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<"male" | "female" | "other" | "">("");
  const [durationHours, setDurationHours] = useState<string>("");
  const [painLevel, setPainLevel] = useState<number>(5);
  const [temperature, setTemperature] = useState<string>("");
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const baseRef = React.useRef("");

  const speech = useArabicSpeech((text, isFinal) => {
    if (isFinal) {
      baseRef.current = (baseRef.current + text).trimStart();
      setUserSymptoms(baseRef.current);
    } else {
      setUserSymptoms((baseRef.current + " " + text).trimStart());
    }
  });

  const handleClose = () => {
    if (speech.listening) speech.stop();
    setUserSymptoms("");
    setResult(null);
    setAge(""); setSex(""); setDurationHours(""); setPainLevel(5);
    setTemperature(""); setChronicConditions([]); setMedications("");
    setShowAdvanced(false);
    baseRef.current = "";
    onClose();
  };

  const handleMicToggle = () => {
    if (speech.listening) {
      speech.stop();
    } else {
      baseRef.current = userSymptoms ? userSymptoms + " " : "";
      speech.start();
    }
  };

  const toggleChronic = (c: string) => {
    setChronicConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const runCheck = async () => {
    if (!cond || !userSymptoms.trim() || userSymptoms.trim().length < 5) {
      toast.error("اكتب أعراضك بشكل أوضح (5 أحرف على الأقل)");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("medical-condition-checker", {
        body: {
          conditionName: cond.name,
          knownSymptoms: cond.symptoms,
          userSymptoms: userSymptoms.trim(),
          age: age || undefined,
          sex: sex || undefined,
          durationHours: durationHours || undefined,
          painLevel,
          temperature: temperature || undefined,
          chronicConditions,
          medications: medications || undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as CheckResult);
    } catch (e: any) {
      toast.error(e.message || "فشل التحليل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!cond} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl bg-[#0a0b18] border-white/10 text-white max-h-[90vh] overflow-y-auto" dir="rtl">
        {cond && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="bg-gradient-to-l from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                    تأكد من حالتك
                  </div>
                  <div className="text-sm text-white/50 font-normal mt-0.5">
                    هل تعاني من <span className="text-white">{cond.icon} {cond.name}</span>؟
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {!result && (
                <>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
                    💡 اكتب أو سجّل صوتياً جميع الأعراض التي تشعر بها الآن، حتى التي تظنها بسيطة. الذكاء الاصطناعي سيقارنها مع الأعراض النموذجية لـ <span className="text-white/90">{cond.name}</span>.
                  </div>

                  <div className="relative">
                    <Textarea
                      value={userSymptoms}
                      onChange={(e) => {
                        setUserSymptoms(e.target.value);
                        baseRef.current = e.target.value;
                      }}
                      placeholder={`مثلاً: أشعر بـ${cond.symptoms[0]} منذ ساعة، وأيضاً ${cond.symptoms[1] || "...."} بعد...`}
                      className="bg-black/40 border-white/10 text-white min-h-[140px] resize-none pl-12"
                      maxLength={1000}
                    />
                    {speech.supported && (
                      <button
                        type="button"
                        onClick={handleMicToggle}
                        title={speech.listening ? "إيقاف" : "تحدث"}
                        className={`absolute top-3 left-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          speech.listening
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/50"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {speech.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {speech.listening && (
                          <motion.span
                            className="absolute inset-0 rounded-lg border-2 border-rose-400"
                            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Advanced contextual fields */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(s => !s)}
                      className="w-full px-4 py-3 flex items-center justify-between text-sm text-white/80 hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        معلومات إضافية لتحليل أدق (اختياري)
                      </span>
                      <span className="text-xs text-white/40">{showAdvanced ? "إخفاء" : "إظهار"}</span>
                    </button>
                    {showAdvanced && (
                      <div className="p-4 space-y-3 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="العمر" className="bg-black/40 border-white/10 text-white text-sm" />
                          <select value={sex} onChange={e => setSex(e.target.value as any)} className="bg-black/40 border border-white/10 text-white text-sm rounded-md px-3 h-10">
                            <option value="">الجنس</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                            <option value="other">آخر</option>
                          </select>
                          <Input type="number" value={durationHours} onChange={e => setDurationHours(e.target.value)} placeholder="مدة الأعراض (ساعات)" className="bg-black/40 border-white/10 text-white text-sm" />
                          <Input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="الحرارة °C" className="bg-black/40 border-white/10 text-white text-sm" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-white/70 mb-2">
                            <span>مستوى الألم</span>
                            <span className="font-bold text-cyan-300">{painLevel}/10</span>
                          </div>
                          <Slider value={[painLevel]} max={10} step={1} onValueChange={(v) => setPainLevel(v[0])} />
                        </div>
                        <div>
                          <div className="text-xs text-white/70 mb-2">حالات مزمنة (اختر ما ينطبق)</div>
                          <div className="flex flex-wrap gap-1.5">
                            {CHRONIC_OPTIONS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => toggleChronic(c)}
                                className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                                  chronicConditions.includes(c)
                                    ? "bg-cyan-500/30 border-cyan-500/50 text-cyan-200"
                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Input
                          value={medications}
                          onChange={e => setMedications(e.target.value)}
                          placeholder="أدوية حالية (اختياري)"
                          className="bg-black/40 border-white/10 text-white text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={runCheck}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 shadow-lg shadow-cyan-500/30 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>يقوم الذكاء الاصطناعي بالتحليل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        تحليل وتأكيد
                      </>
                    )}
                  </Button>
                </>
              )}

              {result && (
                <CheckerResultView
                  result={result}
                  conditionName={cond.name}
                  onReset={() => setResult(null)}
                  onClose={handleClose}
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ============================ RESULT VIEW ============================ */
const CheckerResultView: React.FC<{
  result: CheckResult;
  conditionName: string;
  onReset: () => void;
  onClose: () => void;
}> = ({ result, conditionName, onReset, onClose }) => {
  const verdictMap = {
    likely: { label: "مرجّح إصابتك بها", color: "from-rose-500 to-orange-500", icon: ShieldAlert, ring: "ring-rose-500/40" },
    possible: { label: "احتمال متوسط", color: "from-amber-500 to-yellow-500", icon: AlertTriangle, ring: "ring-amber-500/40" },
    unlikely: { label: "غير مرجّح", color: "from-emerald-500 to-cyan-500", icon: ShieldCheck, ring: "ring-emerald-500/40" },
  };
  const v = verdictMap[result.verdict];
  const VIcon = v.icon;

  const severityLabel = {
    low: "خطورة منخفضة",
    medium: "خطورة متوسطة",
    high: "خطورة عالية",
    emergency: "🚨 طوارئ",
  }[result.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Probability gauge */}
      <div className={`relative p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 ring-1 ${v.ring}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center shadow-xl`}>
            <VIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white/60 mb-0.5">{conditionName}</div>
            <div className="text-2xl font-bold">{v.label}</div>
            <div className="text-xs text-white/50 mt-1">{severityLabel}</div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold bg-gradient-to-br ${v.color} bg-clip-text text-transparent`}>
              {result.probability}%
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">احتمال</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.probability}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${v.color}`}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
        <div className="text-xs text-cyan-300 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> التوصية
        </div>
        <div className="text-sm text-white/90 leading-relaxed">{result.recommendation}</div>
      </div>

      {/* Red flags */}
      {result.red_flags && result.red_flags.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div className="text-xs text-rose-300 mb-2 flex items-center gap-1.5 font-semibold">
            🚨 علامات خطر — اطلب المساعدة فوراً
          </div>
          <ul className="space-y-1.5">
            {result.red_flags.map((rf, i) => (
              <li key={i} className="text-sm text-rose-100 flex gap-2">
                <span className="text-rose-400">•</span> {rf}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched / Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.matched_symptoms.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 mb-2 flex items-center gap-1.5 font-semibold">
              ✓ أعراض متطابقة ({result.matched_symptoms.length})
            </div>
            <ul className="space-y-1">
              {result.matched_symptoms.map((s, i) => (
                <li key={i} className="text-xs text-white/80 flex gap-1.5">
                  <span className="text-emerald-400">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.missing_symptoms.length > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-white/60 mb-2 flex items-center gap-1.5 font-semibold">
              − أعراض نموذجية لم تذكرها
            </div>
            <ul className="space-y-1">
              {result.missing_symptoms.map((s, i) => (
                <li key={i} className="text-xs text-white/60 flex gap-1.5">
                  <span className="text-white/30">−</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Alternatives */}
      {result.alternative_conditions && result.alternative_conditions.length > 0 && (
        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <div className="text-xs text-violet-300 mb-2 flex items-center gap-1.5 font-semibold">
            💡 حالات أخرى محتملة قد تفسّر أعراضك
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.alternative_conditions.map((a, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-100">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-white/40 text-center pt-2 border-t border-white/5">
        ⚠️ هذا تحليل أولي تعليمي وليس تشخيصاً طبياً. للتأكد، استشر طبيباً.
      </div>

      <div className="flex gap-2">
        <Button onClick={onReset} variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white">
          فحص مرة أخرى
        </Button>
        <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600">
          إغلاق
        </Button>
      </div>
    </motion.div>
  );
};

export default MedicalAssistant;
