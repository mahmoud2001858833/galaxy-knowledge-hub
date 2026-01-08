import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Search, Phone, AlertTriangle, Heart, Stethoscope, 
  Thermometer, Brain, Eye, Ear, Bone, Pill, Activity, Loader2,
  Camera, Upload, MessageSquare, ChevronDown, ChevronUp, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

const categories = [...new Set(medicalConditions.map(c => c.category))];

const MedicalAssistant = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<MedicalCondition | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConditions = medicalConditions.filter(condition => {
    const matchesSearch = condition.name.includes(searchQuery) || 
                         condition.symptoms.some(s => s.includes(searchQuery));
    const matchesCategory = !selectedCategory || condition.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setDiagnosis('');
    
    try {
      const { data, error } = await supabase.functions.invoke('medical-ai-assistant', {
        body: { 
          symptoms,
          type: 'symptoms'
        }
      });

      if (error) throw error;
      setDiagnosis(data.diagnosis || 'لم أتمكن من التحليل');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء التحليل');
      setDiagnosis('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setDiagnosis('');
    
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const { data, error } = await supabase.functions.invoke('medical-ai-assistant', {
        body: { 
          image: base64,
          type: 'image'
        }
      });

      if (error) throw error;
      setDiagnosis(data.diagnosis || 'لم أتمكن من التحليل');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء تحليل الصورة');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-emerald-400 hover:text-emerald-300 mb-4"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 mb-4">
              <Stethoscope className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mb-4">
              المساعدة الطبية للمدارس
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              دليل شامل للتعامل مع الحالات الطبية الشائعة في المدارس - 50 حالة طبية
            </p>
          </div>

          {/* Emergency Call Button */}
          <div className="flex justify-center mt-6">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
              onClick={() => window.location.href = 'tel:911'}
            >
              <Phone className="ml-2 h-5 w-5" />
              اتصل بالطوارئ - 911
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8 bg-white/10">
            <TabsTrigger value="conditions" className="text-white data-[state=active]:bg-emerald-600">
              <Heart className="ml-2 h-4 w-4" />
              الحالات
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="text-white data-[state=active]:bg-emerald-600">
              <MessageSquare className="ml-2 h-4 w-4" />
              تحليل الأعراض
            </TabsTrigger>
            <TabsTrigger value="image" className="text-white data-[state=active]:bg-emerald-600">
              <Camera className="ml-2 h-4 w-4" />
              تشخيص بالصورة
            </TabsTrigger>
          </TabsList>

          {/* Conditions Tab */}
          <TabsContent value="conditions">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن حالة أو عرض..."
                  className="pr-10 bg-white/10 border-emerald-500/30 text-white"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer bg-emerald-600"
                  onClick={() => setSelectedCategory(null)}
                >
                  الكل ({medicalConditions.length})
                </Badge>
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer ${selectedCategory === cat ? 'bg-emerald-600' : 'border-white/30 text-white/70'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Conditions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConditions.map((condition) => (
                <motion.div
                  key={condition.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="bg-white/5 border-emerald-500/30 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setSelectedCondition(selectedCondition?.id === condition.id ? null : condition)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <span className="text-2xl">{condition.icon}</span>
                          {condition.name}
                        </CardTitle>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          {condition.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {selectedCondition?.id === condition.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <CardContent className="space-y-4">
                            {/* Symptoms */}
                            <div>
                              <h4 className="text-emerald-400 font-semibold mb-2">الأعراض:</h4>
                              <div className="flex flex-wrap gap-1">
                                {condition.symptoms.map((symptom, i) => (
                                  <Badge key={i} variant="outline" className="text-white/70 border-white/20">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* First Aid */}
                            <div>
                              <h4 className="text-emerald-400 font-semibold mb-2">الإسعافات الأولية:</h4>
                              <ol className="space-y-1 text-white/80 text-sm">
                                {condition.firstAid.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                                      {i + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Warning */}
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-semibold">تحذير:</span>
                              </div>
                              <p className="text-red-300 text-sm mt-1">{condition.warning}</p>
                            </div>

                            {/* Speak Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakText(`${condition.name}. الأعراض: ${condition.symptoms.join('، ')}. الإسعافات: ${condition.firstAid.join('، ')}`);
                              }}
                            >
                              <Volume2 className="ml-2 h-4 w-4" />
                              استمع للتعليمات
                            </Button>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Symptoms Analysis Tab */}
          <TabsContent value="symptoms">
            <Card className="bg-white/5 border-emerald-500/30 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-400" />
                  تحليل الأعراض بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 block mb-2">صف الأعراض:</label>
                  <Textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="مثال: الطالب يشكو من صداع شديد وغثيان وارتفاع في الحرارة..."
                    className="min-h-[120px] bg-white/10 border-emerald-500/30 text-white"
                  />
                </div>

                <Button
                  onClick={analyzeSymptoms}
                  disabled={isAnalyzing || !symptoms.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Activity className="ml-2 h-4 w-4" />
                      تحليل الأعراض
                    </>
                  )}
                </Button>

                {diagnosis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4"
                  >
                    <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      نتيجة التحليل:
                    </h4>
                    <p className="text-white/90 whitespace-pre-wrap">{diagnosis}</p>
                    
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ هذا التحليل للإرشاد فقط وليس بديلاً عن الفحص الطبي. يرجى استشارة الطبيب للحالات الخطيرة.
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Diagnosis Tab */}
          <TabsContent value="image">
            <Card className="bg-white/5 border-emerald-500/30 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-emerald-400" />
                  التشخيص بالصورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 rounded-xl border border-emerald-500/30"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-dashed border-2 border-emerald-500/30 h-32 w-full"
                    >
                      <Upload className="ml-2 h-6 w-6" />
                      ارفع صورة للإصابة
                    </Button>
                  )}
                </div>

                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing || !selectedImage}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Eye className="ml-2 h-4 w-4" />
                      تحليل الصورة
                    </>
                  )}
                </Button>

                {diagnosis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4"
                  >
                    <h4 className="text-emerald-400 font-semibold mb-2">نتيجة التحليل:</h4>
                    <p className="text-white/90 whitespace-pre-wrap">{diagnosis}</p>
                    
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ هذا التحليل للإرشاد فقط. الحالات الخطيرة تتطلب فحصاً طبياً فورياً.
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MedicalAssistant;
