import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Download, Home, Sparkles, Brain, BookOpen, Calculator, Atom, Users, GraduationCap, Mail, User, LogIn, BarChart, Microscope, Star, FlaskConical, Leaf, Globe, Shield, Palette, Video, MessageCircle, Calendar, Zap, Monitor, Heart, Building, Settings, FileText, Lock, Award, Clock, Target, Layers, Database, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import jsPDF from 'jspdf';

const PlatformDocumentation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // بيانات المنصة الكاملة
  const platformInfo = {
    name: "ذروة العلم - فلك المعرفة",
    description: "منصة تعليمية تفاعلية شاملة تجمع بين العلوم والتكنولوجيا والذكاء الاصطناعي. مصممة لتقديم تجربة تعليمية فريدة ومميزة للطلاب والمعلمين وأولياء الأمور في العالم العربي. تحتوي على أكثر من 30 تجربة علمية تفاعلية، 4 منصات علمية رئيسية، 7 أدوات ذكاء اصطناعي، ونظام متكامل للمعلمين وأولياء الأمور.",
    benefits: [
      "تعليم تفاعلي بأحدث التقنيات والمحاكاة ثلاثية الأبعاد",
      "مساعدات ذكية بالذكاء الاصطناعي تجيب على أي سؤال",
      "تتبع التقدم والإنجازات مع نظام المستويات والنقاط",
      "دعم ثنائي اللغة (العربية والإنجليزية)",
      "تصميم متجاوب يعمل على جميع الأجهزة",
      "نظام متكامل للمعلمين وأولياء الأمور"
    ],
    technologies: ["React", "TypeScript", "Supabase", "Three.js", "Framer Motion", "Tailwind CSS", "Gemini AI"]
  };

  // نظام تسجيل الدخول
  const authSystem = {
    title: "نظام تسجيل الدخول والحسابات",
    path: "/auth",
    features: [
      { name: "تسجيل حساب جديد بالبريد الإلكتروني", desc: "إنشاء حساب باستخدام البريد الإلكتروني وكلمة المرور مع تأكيد عبر رابط" },
      { name: "تسجيل دخول بحساب Google", desc: "تسجيل سريع وآمن باستخدام حساب Google الخاص بك" },
      { name: "تسجيل دخول بحساب Facebook", desc: "تسجيل سريع باستخدام حساب Facebook" },
      { name: "استعادة كلمة المرور", desc: "إرسال رابط لإعادة تعيين كلمة المرور عبر البريد الإلكتروني" },
      { name: "نظام المعلمين المصرح لهم", desc: "إنشاء حساب تلقائي للمعلمين المسجلين مسبقاً في قاعدة البيانات" },
      { name: "التحقق من البريد الإلكتروني", desc: "تأكيد الحساب عبر رابط مرسل للبريد لضمان الأمان" }
    ]
  };

  // الملف الشخصي
  const profileSystem = {
    title: "الملف الشخصي للمستخدم",
    path: "/profile",
    features: [
      { name: "تتبع وقت الاستخدام", desc: "عداد زمني دقيق يحسب إجمالي الوقت المستخدم في المنصة" },
      { name: "نظام المستويات (6 مستويات)", desc: "مبتدئ ← متعلم ← نشط ← متقدم ← خبير ← أسطورة - كل مستوى يتطلب نقاط معينة" },
      { name: "عرض الإحصائيات الشاملة", desc: "عدد الألغاز المحلولة، الفيديوهات المشاهدة، الرسائل المرسلة، التفاعلات" },
      { name: "نظام النقاط والإنجازات", desc: "نقاط تزيد مع كل تفاعل وإنجاز في المنصة" },
      { name: "تحديث الصورة الشخصية", desc: "رفع صورة شخصية أو اختيار صورة رمزية" },
      { name: "تعديل معلومات الحساب", desc: "تغيير اسم المستخدم والاسم الكامل" }
    ]
  };

  // صفحة تواصل معنا
  const contactSystem = {
    title: "صفحة تواصل معنا",
    path: "/contact",
    features: [
      { name: "نموذج إرسال رسالة متكامل", desc: "إرسال شكوى أو ملاحظة أو اقتراح أو استفسار للإدارة" },
      { name: "حقل الاسم الكامل", desc: "إدخال اسم المرسل للتواصل" },
      { name: "حقل البريد الإلكتروني", desc: "إدخال بريد صالح للرد على الاستفسار" },
      { name: "حقل الموضوع", desc: "تحديد موضوع الرسالة (شكوى، اقتراح، استفسار، ملاحظة)" },
      { name: "حقل الرسالة التفصيلية", desc: "كتابة نص الرسالة بالتفصيل مع إمكانية الشرح الكامل" },
      { name: "لوحة المشرف لعرض الرسائل", desc: "عرض جميع الرسائل الواردة للمشرفين مع إمكانية الرد" }
    ]
  };

  // المنصات العلمية
  const scientificPlatforms = [
    {
      name: "منصة الفيزياء",
      path: "/physics",
      icon: Atom,
      color: "from-blue-500 to-cyan-500",
      benefit: "تعلم الفيزياء بطريقة تفاعلية مع حسابات دقيقة ومساعد ذكي يشرح أي مفهوم بالتفصيل",
      features: [
        { name: "الحسابات الفيزيائية", count: "20+ معادلة", desc: "القوة، السرعة، التسارع، الطاقة الحركية والكامنة، الشغل، القدرة، الزخم، العزم، قانون أوم، الكهرباء، المغناطيسية، الموجات" },
        { name: "المساعد الذكي للفيزياء", count: "غير محدود", desc: "مساعد بالذكاء الاصطناعي Gemini يجيب على أي سؤال فيزيائي بشرح مفصل خطوة بخطوة" },
        { name: "موسوعة علماء الفيزياء", count: "50+ عالم", desc: "نيوتن، آينشتاين، هوكينج، فاراداي، ماكسويل - سيرة ذاتية وإنجازات" },
        { name: "بنك الأسئلة", count: "100+ سؤال", desc: "أسئلة متنوعة بمستويات صعوبة مختلفة مع إمكانية إضافة أسئلة جديدة من المستخدمين" },
        { name: "الآلة الحاسبة المتقدمة", count: "15+ عملية", desc: "حاسبة علمية متقدمة لجميع العمليات الفيزيائية مع عرض الخطوات" }
      ]
    },
    {
      name: "منصة الكيمياء",
      path: "/chemistry",
      icon: FlaskConical,
      color: "from-green-500 to-emerald-500",
      benefit: "استكشاف العناصر الكيميائية وفهم خصائصها وتفاعلاتها بطريقة بصرية تفاعلية",
      features: [
        { name: "الجدول الدوري التفاعلي", count: "118 عنصر", desc: "عرض تفاعلي لجميع العناصر مع: العدد الذري، الكتلة الذرية، التوزيع الإلكتروني، الحالة الفيزيائية، درجة الانصهار والغليان، الكثافة" },
        { name: "الحسابات الكيميائية", count: "15+ حساب", desc: "الكتلة المولية، التركيز المولاري، عدد المولات، pH، التخفيف، موازنة المعادلات" },
        { name: "موسوعة علماء الكيمياء", count: "40+ عالم", desc: "لافوازييه، مندلييف، دالتون، كوري - سيرهم وإنجازاتهم" },
        { name: "المساعد الذكي للكيمياء", count: "غير محدود", desc: "شرح أي مفهوم كيميائي، موازنة التفاعلات، تفسير الظواهر" },
        { name: "بنك الأسئلة", count: "80+ سؤال", desc: "أسئلة كيمياء متنوعة في جميع الفروع" },
        { name: "تصنيف العناصر", count: "10 تصنيفات", desc: "فلزات، لافلزات، أشباه فلزات، غازات نبيلة، فلزات قلوية، فلزات قلوية ترابية، هالوجينات، لانثانيدات، أكتينيدات" }
      ]
    },
    {
      name: "منصة الرياضيات",
      path: "/mathematics",
      icon: Calculator,
      color: "from-purple-500 to-pink-500",
      benefit: "فهم المفاهيم الرياضية بصرياً وحل المسائل المعقدة بسهولة مع شرح مفصل",
      features: [
        { name: "الحاسبة الرياضية المتقدمة", count: "30+ عملية", desc: "الجبر، التفاضل، التكامل، المصفوفات، المحددات، المتجهات، الاحتمالات، الإحصاء، المعادلات التربيعية" },
        { name: "معرض الرسوم البيانية", count: "15+ نوع دالة", desc: "رسم الدوال الخطية، التربيعية، التكعيبية، الأسية، اللوغاريتمية، المثلثية بشكل تفاعلي مع تغيير المعاملات" },
        { name: "أعلام الرياضيات", count: "60+ عالم", desc: "إقليدس، الخوارزمي، فيثاغورس، نيوتن، لايبنتز، أويلر، غاوس - موسوعة شاملة" },
        { name: "المساعد الذكي للرياضيات", count: "غير محدود", desc: "حل المسائل الرياضية خطوة بخطوة مع شرح مفصل لكل خطوة" },
        { name: "بنك الأسئلة", count: "120+ سؤال", desc: "مسائل رياضية بجميع المستويات من السهل إلى المتقدم" },
        { name: "تمثيل الدوال 3D", count: "20+ مثال", desc: "عرض ثلاثي الأبعاد للدوال الرياضية مع تحكم كامل بالتدوير والتكبير" }
      ]
    },
    {
      name: "منصة الأحياء",
      path: "/biology",
      icon: Leaf,
      color: "from-green-600 to-teal-500",
      benefit: "فهم جسم الإنسان والكائنات الحية والأمراض بطريقة علمية تفاعلية",
      features: [
        { name: "الحسابات الحيوية", count: "20+ حساب", desc: "مؤشر كتلة الجسم BMI، السعرات الحرارية، معدل نبضات القلب المستهدف، نسب الوراثة، حساب الجينات" },
        { name: "المساعد الذكي للأحياء", count: "غير محدود", desc: "شرح أي موضوع في علم الأحياء بالتفصيل مع صور توضيحية" },
        { name: "موسوعة علماء الأحياء", count: "45+ عالم", desc: "داروين، مندل، واتسون، كريك، لينيوس، باستور - سيرهم واكتشافاتهم" },
        { name: "موسوعة الأمراض", count: "100+ مرض", desc: "الأعراض، الأسباب، طرق التشخيص، العلاج، الوقاية لكل مرض" },
        { name: "بنك الأسئلة", count: "90+ سؤال", desc: "أسئلة في جميع فروع الأحياء: الخلية، الوراثة، التطور، البيئة" },
        { name: "صور وتوضيحات تفاعلية", count: "50+ صورة", desc: "صور تشريحية وتوضيحية للخلايا، الأعضاء، الأجهزة الحيوية" }
      ]
    }
  ];

  // التجارب العلمية
  const experiments = {
    physics: {
      title: "تجارب الفيزياء (15 تجربة)",
      color: "blue",
      items: [
        { name: "إشعاع الجسم الأسود", ops: 5, desc: "تغيير درجة الحرارة (0-10000 كلفن)، حساب الطاقة الكلية المنبعثة، رسم بياني لتوزيع الإشعاع حسب الطول الموجي، قانون فين، قانون ستيفان-بولتزمان" },
        { name: "بناء الذرة", ops: 8, desc: "إضافة بروتونات، إضافة نيوترونات، إضافة إلكترونات بالسحب والإفلات، عرض التوزيع الإلكتروني، تحديد العنصر تلقائياً، عناصر مقترحة للبناء، مساعد ذكي، مسح وإعادة البناء" },
        { name: "مصادم الهدرونات الكبير LHC", ops: 10, desc: "تحكم بطاقة الشعاع (0-13 TeV)، سرعة الجسيمات (0-99.9999% من سرعة الضوء)، اختيار نوع الجسيم (بروتون/أيون رصاص)، إطلاق الأشعة، تفعيل التصادم، كشف بوزون هيغز، سجل التجارب السابقة، سيناريوهات جاهزة، اختبار معرفة تفاعلي، قسم تعليمي شامل" },
        { name: "الموجات الكهرومغناطيسية", ops: 6, desc: "تغيير التردد بشكل مستمر، تغيير الطول الموجي، عرض 7 أنواع موجات (راديو، ميكروويف، تحت حمراء، مرئية، فوق بنفسجية، أشعة سينية، أشعة جاما)، معلومات تفصيلية واستخدامات كل نوع، رسم متحرك للموجة" },
        { name: "التفاعلات النووية", ops: 8, desc: "انشطار اليورانيوم-235، اندماج الديوتيريوم-تريتيوم، حساب الطاقة المنبعثة بدقة، عرض معادلة E=mc²، تمثيل بصري ثلاثي الأبعاد للتفاعل، اختبار معرفة، قسم تعليمي عن الطاقة النووية السلمية" },
        { name: "مختبر البصريات", ops: 10, desc: "إضافة عدسة محدبة، عدسة مقعرة، مرآة مستوية، مرآة مقعرة، مرآة محدبة، منشور زجاجي، تتبع مسار الأشعة الضوئية، عرض الانكسار والانعكاس، حساب البعد البؤري، تكوين الصور (حقيقية/وهمية)" },
        { name: "حركة المقذوفات", ops: 7, desc: "تغيير زاوية الإطلاق (0-90 درجة)، تغيير السرعة الابتدائية، تفعيل/إلغاء مقاومة الهواء، محاكاة البندول البسيط، حساب المدى الأفقي الأقصى، حساب أقصى ارتفاع، عرض مسار القذيفة المكافئ" },
        { name: "ميكانيكا الكم", ops: 6, desc: "محاكاة تجربة الشق المزدوج مع نمط التداخل، محاكاة ظاهرة النفق الكمي، عرض مبدأ التراكب الكمي، تأثير الرصد على الجسيمات الكمية، تغيير معاملات التجربة، عرض توزيع الاحتمالات" },
        { name: "الكهرومغناطيسية", ops: 7, desc: "عرض خطوط المجال المغناطيسي ثلاثي الأبعاد، محاكاة الملف اللولبي، تحريك البوصلة في المجال، تغيير شدة التيار الكهربائي، عرض اتجاه المجال، محاكاة عمل المحرك الكهربائي، محاكاة المولد الكهربائي" },
        { name: "الموجات والصوت", ops: 6, desc: "محاكاة تأثير دوبلر مع مصدر متحرك، تداخل الموجات البناء والهدام، محاكاة ظاهرة الصدى، تغيير تردد الموجة، تغيير سعة الموجة، عرض ظاهرة الرنين" },
        { name: "الكهرباء الساكنة", ops: 6, desc: "شحن الأجسام بالدلك (موجب/سالب)، عرض قوى الجذب والتنافر، محاكاة ملف تسلا مع الشرارات، تطبيق قانون كولوم مع حساب القوة، محاكاة الإلكتروسكوب، عرض التفريغ الكهربائي" },
        { name: "علوم الأرض والجيولوجيا", ops: 7, desc: "محاكاة الزلازل مع مقياس ريختر، محاكاة ثوران البراكين، عرض حركة الصفائح التكتونية، محاكاة عمليات التجوية والتعرية، عرض طبقات الأرض الداخلية، دورة الصخور، تكوين الكهوف والمغارات" },
        { name: "الفيزياء النووية المتقدمة", ops: 6, desc: "محاكاة تحلل ألفا (α) مع إطلاق جسيم الهيليوم، محاكاة تحلل بيتا (β) مع تحول النيوترون، محاكاة إشعاع أشعة جاما (γ)، حساب عمر النصف للعناصر المشعة، حساب النشاط الإشعاعي، عرض سلاسل التحلل الإشعاعي" },
        { name: "علوم المواد", ops: 8, desc: "عرض بنية البلورات (BCC/FCC/HCP)، خلط السبائك مع تغيير درجة الحرارة، رسم منحنى الإجهاد-الانفعال، مخطط أطوار المواد، عرض الخصائص الميكانيكية، قياس الموصلية الحرارية والكهربائية، خصائص المواد الذكية، مقدمة عن النانو تكنولوجي" },
        { name: "البصريات المتقدمة", ops: 8, desc: "المنشور ثلاثي الأبعاد مع تحليل الضوء الأبيض، تطبيق معادلة العدسة وتكوين الصور، تجربة تداخل الشقين (يونج)، ظاهرة الاستقطاب وقانون مالوس، محاكاة الألياف البصرية، عمل الليزر، مقدمة عن الهولوغرام، مقارنة المجهر والتلسكوب" }
      ]
    },
    chemistry: {
      title: "تجارب الكيمياء (3 تجارب)",
      color: "green",
      items: [
        { name: "التفاعلات الكيميائية 3D", ops: 30, desc: "أكثر من 30 تفاعل كيميائي متحرك: تفاعلات الأكسدة والاختزال، تفاعلات الترسيب مع تغير اللون، تفاعلات حمض-قاعدة مع الفوران، تفاعلات الاحتراق مع اللهب، تفاعلات التفكك الحراري، تفاعلات الاستبدال الأحادي والمزدوج، رسوم ثلاثية الأبعاد متحركة للجزيئات والذرات" },
        { name: "الكيمياء التحليلية", ops: 6, desc: "معايرة حمض-قاعدة مع تتبع تغير pH وتغير لون الكاشف، مقياس pH تفاعلي لأي محلول، التحليل الطيفي بالأشعة المرئية وفوق البنفسجية (UV-Vis)، فصل المواد بالكروماتوجرافيا، قياس الكتلة بالطيف الكتلي، التحليل الحراري للمركبات" },
        { name: "الكيمياء الكهربائية", ops: 5, desc: "محاكاة الخلية الجلفانية مع تدفق الإلكترونات، التحليل الكهربائي للماء والمحاليل، حساب جهد الخلية القياسي، تطبيق معادلات نيرنست، مقارنة أنواع البطاريات والخلايا الوقودية" }
      ]
    },
    biology: {
      title: "تجارب الأحياء (4 تجارب)",
      color: "teal",
      items: [
        { name: "مختبر الوراثة", ops: 8, desc: "مربع بونيت التفاعلي لحساب نسب الصفات، تضاعف DNA بالتفصيل مع إنزيم البوليميريز، عرض أنواع الطفرات الجينية (نقطية، حذف، إضافة)، دراسة 10+ صفة وراثية، حساب نسب التوارث المندلي، الوراثة المرتبطة بالجنس، الوراثة متعددة الجينات، رسم الخرائط الجينية" },
        { name: "البيولوجيا الجزيئية", ops: 6, desc: "تضاعف DNA خطوة بخطوة مع الإنزيمات، عملية النسخ (Transcription) لإنتاج mRNA، عملية الترجمة (Translation) لإنتاج البروتين في الريبوسوم، تقنية PCR لتضخيم الجينات، مقدمة عن الهندسة الوراثية، تقنية CRISPR لتعديل الجينات" },
        { name: "جسم الإنسان التفاعلي", ops: 8, desc: "الجهاز الدوري (القلب والشرايين والأوردة والشعيرات)، الجهاز التنفسي (الرئتين والحويصلات الهوائية)، الجهاز العصبي (المخ والنخاع الشوكي والأعصاب)، الجهاز الهضمي (المعدة والأمعاء والكبد)، الجهاز العضلي، الجهاز الهيكلي (العظام والمفاصل)، الجهاز البولي، الجهاز التناسلي" },
        { name: "النظام البيئي", ops: 5, desc: "السلسلة الغذائية التفاعلية (منتجات، مستهلكات، محللات)، ديناميكية التعداد السكاني مع النمو والتراجع، تأثير العوامل البيئية المحددة، دراسة التوازن البيئي وعواقب الإخلال به، عرض آثار التلوث على النظام البيئي" }
      ]
    },
    astronomy: {
      title: "تجارب الفلك والفضاء (3 تجارب)",
      color: "orange",
      items: [
        { name: "النظام الشمسي 3D", ops: 10, desc: "تحكم كامل 360° بالعرض، 8 كواكب مع معلومات مفصلة (القطر، الكتلة، البعد عن الشمس، فترة الدوران، عدد الأقمار)، حزام الكويكبات بين المريخ والمشتري، عرض أقمار الكواكب الرئيسية، الكواكب القزمة (بلوتو)، محاكاة مذنب هالي، عرض مدارات الكواكب المتحركة، تكبير وتصغير حر" },
        { name: "الفلك المتقدم", ops: 6, desc: "محاكاة كسوف الشمس الكلي والجزئي والحلقي، محاكاة خسوف القمر الكلي والجزئي، تطبيق قوانين كبلر الثلاثة لحركة الكواكب، حساب المدارات الإهليلجية، حساب سرعة الإفلات من الكواكب، محاكاة ظاهرة المد والجزر" },
        { name: "علوم الفضاء", ops: 5, desc: "محاكاة إطلاق الصواريخ مع مراحل الانفصال، حساب السرعة الكونية الأولى والثانية والثالثة، عرض أنواع المدارات (LEO, MEO, GEO)، محاكاة قوة الجاذبية بين الأجرام، مقدمة عن الثقوب السوداء وأفق الحدث" }
      ]
    },
    mathematics: {
      title: "تجارب الرياضيات (2 تجربة)",
      color: "pink",
      items: [
        { name: "سلسلة فورييه", ops: 5, desc: "تحليل الموجة المربعة إلى مجموع دوال جيبية، تحليل الموجة المثلثية، تحليل الموجة المنشارية، عرض ظاهرة غيبس عند نقاط الانقطاع، التحكم بعدد حدود السلسلة ومشاهدة التقارب" },
        { name: "الدوال ثلاثية الأبعاد", ops: 15, desc: "أكثر من 15 دالة: الدوال الخطية، التربيعية، التكعيبية، الأسية، اللوغاريتمية، المثلثية (sin, cos, tan)، الدوال الزائدية (sinh, cosh, tanh)، دوال السطوح المعقدة، عرض بأبعاد 1D/2D/3D، تكبير وتصغير، تدوير 360°، تغيير معاملات الدالة مباشرة" }
      ]
    },
    electronics: {
      title: "تجارب الإلكترونيات (2 تجربة)",
      color: "yellow",
      items: [
        { name: "بناء الدوائر الكهربائية", ops: 9, desc: "9+ مكونات: مقاومة (مع تغيير القيمة)، مكثف، ملف حث، بطارية (مصدر جهد)، LED، مفتاح تشغيل/إيقاف، أميتر لقياس التيار، فولتميتر لقياس الجهد، أوميتر لقياس المقاومة - سحب وإفلات المكونات، توصيل الأسلاك بين النقاط، قياس التيار والجهد في أي نقطة" },
        { name: "الإلكترونيات الرقمية", ops: 7, desc: "7+ بوابات منطق: AND، OR، NOT، NAND، NOR، XOR، XNOR - بناء الجامع النصفي (Half Adder)، بناء الجامع الكامل (Full Adder)، عرض جداول الحقيقة لكل بوابة، محاكاة الدوائر المتكاملة" }
      ]
    }
  };

  // نظام المعلمين
  const teacherSystem = {
    title: "نظام المعلمين الشامل",
    features: [
      { name: "تسجيل المعلم", path: "/teacher-registration", desc: "نموذج تسجيل شامل يتضمن: اسم المعلم، اسم المدرسة، الصف الدراسي، الشعبة، المادة التي يدرّسها، البريد الإلكتروني" },
      { name: "لوحة تحكم المعلم", path: "/teacher-dashboard", desc: "عرض إحصائيات الفصل، عدد الطلاب المسجلين، الواجبات المرسلة والمستلمة، الملاحظات، التفاعل مع أولياء الأمور" },
      { name: "إدارة الواجبات", path: "/teacher-dashboard", desc: "إنشاء واجبات جديدة، تحديد الصف والشعبة المستهدفة، إضافة وصف تفصيلي وصور توضيحية، تحديد موعد التسليم، متابعة نسبة التسليم" },
      { name: "كتابة الملاحظات", path: "/teacher-dashboard", desc: "إرسال ملاحظات خاصة لولي الأمر عن سلوك الطالب وأدائه، تحديد الطالب واسم ولي الأمر، أرشفة الملاحظات" },
      { name: "الإحصائيات والتقارير", path: "/teacher-dashboard", desc: "تحليل أداء الطلاب، نسب تسليم الواجبات، مستوى التفاعل، تقارير شهرية" },
      { name: "المحادثة الصفية", path: "/teacher-dashboard", desc: "غرفة محادثة خاصة بالفصل للتواصل الفوري مع أولياء الأمور، إرسال صور وملفات" },
      { name: "الدروس المسجلة", path: "/recorded-lessons", desc: "رفع فيديوهات تعليمية للطلاب، تصنيفها حسب المادة والموضوع، متابعة عدد المشاهدات" }
    ]
  };

  // نظام أولياء الأمور
  const parentSystem = {
    title: "نظام أولياء الأمور",
    features: [
      { name: "تسجيل ولي الأمر", path: "/parent-registration", desc: "تسجيل بيانات ولي الأمر: الاسم الكامل، اسم الطالب، اسم المدرسة، الصف الدراسي، الشعبة" },
      { name: "لوحة تحكم ولي الأمر", path: "/parent-dashboard", desc: "متابعة جميع أنشطة الطالب، الواجبات المطلوبة والمنجزة، ملاحظات المعلمين، الإحصائيات" },
      { name: "متابعة الواجبات", path: "/parent-dashboard", desc: "عرض قائمة الواجبات المطلوبة من الطالب مع المواعيد النهائية وحالة التسليم" },
      { name: "قراءة الملاحظات", path: "/parent-dashboard", desc: "الاطلاع على جميع ملاحظات المعلم حول سلوك الطالب وأدائه الأكاديمي" },
      { name: "المحادثة مع المعلم", path: "/parent-dashboard", desc: "التواصل المباشر مع معلم الفصل عبر غرفة المحادثة الصفية" }
    ]
  };

  // أدوات الذكاء الاصطناعي
  const aiTools = [
    { name: "مساعد فالك للمعرفة", path: "/falak-knowledge-ai", desc: "مساعد ذكي شامل يجيب على أي سؤال في أي مجال علمي أو أدبي، يستخدم نموذج Gemini AI المتقدم من Google" },
    { name: "المساعد الذكي للرياضيات", path: "/math-ai-assistant", desc: "حل المسائل الرياضية المعقدة خطوة بخطوة مع شرح مفصل لكل خطوة ورسم بياني عند الحاجة" },
    { name: "المساعد الذكي للفيزياء", path: "/physics", desc: "شرح مفاهيم الفيزياء بالتفصيل، حل المسائل الفيزيائية، توضيح القوانين والمعادلات" },
    { name: "المساعد الذكي للكيمياء", path: "/chemistry", desc: "شرح التفاعلات الكيميائية، موازنة المعادلات، توضيح خصائص العناصر والمركبات" },
    { name: "المساعد الذكي للأحياء", path: "/biology", desc: "شرح العمليات الحيوية، جسم الإنسان، الوراثة، التطور، علم البيئة" },
    { name: "مساعد المنهاج الأردني", path: "/jordanian-assistant", desc: "مساعد مخصص لطلاب التوجيهي الأردني، يجيب من الكتب المدرسية الرسمية، يدعم جميع المواد" },
    { name: "منشئ المنصات بالذكاء الاصطناعي", path: "/ai-platform-builder", desc: "بناء مواقع وتطبيقات ويب كاملة باستخدام الذكاء الاصطناعي، كتابة الكود تلقائياً، نشر المشاريع" }
  ];

  // الأدوات التعليمية الإضافية
  const additionalTools = [
    { name: "المكتبة البصرية", path: "/visual-library", desc: "رفع ومشاركة الصور التعليمية مع تصنيفها حسب المادة والموضوع" },
    { name: "المجلة العلمية", path: "/scientific-journal", desc: "مقالات علمية ومجلات PDF قابلة للتصفح والتحميل" },
    { name: "منظم الدراسة", path: "/study-organization", desc: "تنظيم المهام الدراسية والمواعيد والامتحانات مع تذكيرات" },
    { name: "غرف المحادثة", path: "/chat-rooms", desc: "غرف للتواصل بين الطلاب والمعلمين، دردشة جماعية وخاصة" },
    { name: "ألغاز المواد الدراسية", path: "/subject-puzzles", desc: "ألغاز تعليمية في جميع المواد مع نظام نقاط ومستويات" },
    { name: "ألغاز الرياضيات", path: "/math-puzzles", desc: "تحديات رياضية ممتعة بمستويات صعوبة متدرجة" },
    { name: "الفيديوهات التعليمية", path: "/educational-videos", desc: "مكتبة فيديوهات تعليمية مصنفة حسب المادة والموضوع" },
    { name: "الدروس المسجلة", path: "/recorded-lessons", desc: "دروس مسجلة من المعلمين مع إمكانية البحث والتصفية" },
    { name: "المرشد النفسي", path: "/psychological-guide", desc: "دعم نفسي ونصائح للتعامل مع ضغوط الدراسة والامتحانات" },
    { name: "المجلة المدرسية", path: "/school-magazine", desc: "أخبار ومقالات وفعاليات المدرسة" },
    { name: "منشئ جداول الدراسة", path: "/study-schedule", desc: "إنشاء جداول دراسية مخصصة مع توزيع الوقت" },
    { name: "تتبع تقدم الطالب", path: "/student-progress", desc: "رسوم بيانية لتتبع تقدم الطالب عبر الوقت" }
  ];

  // منصات أخرى
  const otherPlatforms = [
    { name: "التربية الإسلامية", path: "/islamic-education", desc: "استكشاف الأحداث الهجرية التاريخية، العصور الإسلامية المختلفة، السيرة النبوية، الخلفاء الراشدون" },
    { name: "المنهاج الأردني - التوجيهي", path: "/jordan-tawjihi", desc: "محتوى تعليمي شامل للتوجيهي: التاريخ، الدين الإسلامي، اللغة الإنجليزية، اللغة العربية، مع مساعد ذكي مخصص" },
    { name: "منصة BTEC تكنولوجيا المعلومات", path: "/btec", desc: "تعلم البرمجة، مشاريع الطلاب مع التقييم، مصحح الأكواد بالذكاء الاصطناعي، نصائح التطوير، بناء المنصات" },
    { name: "منصة الاستدامة البيئية", path: "/environmental-sustainability", desc: "حاسبة البصمة الكربونية، مشاريع بيئية مدرسية ومنزلية، مستشار إعادة التدوير، مؤشر الاستدامة الشخصي، توقعات بيئية" },
    { name: "منصة الفن والتصميم", path: "/art-design", desc: "رسم وتصميم رقمي، عرض المشاريع الفنية، تحدي الرسم التنافسي مع تقييم AI" }
  ];

  // الإدارة
  const adminFeatures = [
    { name: "مركز التحكم الرئيسي", path: "/control-center", desc: "لوحة المشرف الرئيسي لإدارة جميع جوانب المنصة، الإحصائيات العامة، المستخدمين النشطين" },
    { name: "جسر التواصل", path: "/communication-bridge", desc: "نظام التواصل المركزي بين المعلمين وأولياء الأمور والإدارة" },
    { name: "قسم الإدارة", path: "/management-section", desc: "إدارة المستخدمين والمحتوى والصلاحيات" },
    { name: "صفحة المشرفين والمعلمين", path: "/administrators-teachers", desc: "إدارة صلاحيات المستخدمين (عضو، مشرف، مشرف رئيسي)" },
    { name: "إعدادات المستأجر", path: "/tenant-settings", desc: "إعدادات مساحة العمل والتخصيص للمؤسسات التعليمية" }
  ];

  // الميزات الإضافية
  const extraFeatures = [
    { name: "دعم ثنائي اللغة", desc: "واجهة كاملة بالعربية والإنجليزية مع إمكانية التبديل الفوري" },
    { name: "تصميم متجاوب", desc: "يعمل بسلاسة على جميع الأجهزة: الكمبيوتر، التابلت، الموبايل" },
    { name: "خلفية نجوم متحركة", desc: "تأثيرات بصرية جميلة في جميع الصفحات" },
    { name: "تحسين محركات البحث SEO", desc: "جميع الصفحات محسّنة لمحركات البحث" },
    { name: "دعم Capacitor", desc: "إمكانية تحويل المنصة لتطبيق موبايل Android/iOS" },
    { name: "قاعدة بيانات Supabase", desc: "قاعدة بيانات سحابية آمنة وسريعة مع مصادقة مدمجة" },
    { name: "نظام الإشعارات الفورية", desc: "إشعارات للرسائل الجديدة والتحديثات والواجبات" }
  ];

  // إنشاء PDF
  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = 210, m = 15, cw = pw - m * 2;
    let y = 20, pn = 1;

    const newPage = () => { doc.addPage(); pn++; y = 20; };
    const check = (s: number) => { if (y + s > 270) newPage(); };
    
    const title = (t: string, s = 14) => {
      check(15);
      doc.setFontSize(s);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(t, pw - m, y, { align: 'right' });
      y += s * 0.6 + 2;
    };

    const section = (t: string) => {
      check(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(t, pw - m, y, { align: 'right' });
      y += 7;
    };

    const text = (t: string, indent = 0) => {
      check(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(t, cw - indent);
      lines.forEach((l: string) => { check(5); doc.text(l, pw - m - indent, y, { align: 'right' }); y += 4.5; });
    };

    const bullet = (t: string, n: string) => {
      check(8);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(`${n}. ${t}`, cw - 10);
      lines.forEach((l: string) => { check(5); doc.text(l, pw - m - 5, y, { align: 'right' }); y += 4.5; });
    };

    // صفحة الغلاف
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('Thorwat Al-Ilm / Falak Al-Maarifa', pw / 2, 50, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Complete Platform Documentation', pw / 2, 65, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Comprehensive Educational Platform', pw / 2, 85, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('ar-EG')}`, pw / 2, 100, { align: 'center' });
    
    y = 130;
    doc.setFontSize(11);
    const stats = ['30+ Interactive Scientific Experiments', '4 Main Scientific Platforms', '7 AI-Powered Tools', '200+ Scientific Operations', '118 Elements in Periodic Table', '195+ Scientists in Encyclopedias', '100+ Diseases in Medical Encyclopedia'];
    stats.forEach(s => { doc.text(s, pw / 2, y, { align: 'center' }); y += 8; });

    // المحتوى
    newPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pw, 297, 'F');

    // القسم 1: مقدمة
    title('Section 1: Platform Introduction', 14);
    text(platformInfo.description);
    y += 3;
    section('Benefits / Al-Fawaid:');
    platformInfo.benefits.forEach((b, i) => bullet(b, `${i + 1}`));
    y += 3;
    section('Technologies:');
    text(platformInfo.technologies.join(' | '));
    y += 8;

    // القسم 2: تسجيل الدخول
    title('Section 2: Login System / Nizam Tasjil Al-Dukhul', 14);
    text(`Path: ${authSystem.path}`);
    authSystem.features.forEach((f, i) => bullet(`${f.name}: ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 3: الملف الشخصي
    title('Section 3: User Profile / Al-Milaf Al-Shakhsi', 14);
    text(`Path: ${profileSystem.path}`);
    profileSystem.features.forEach((f, i) => bullet(`${f.name}: ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 4: تواصل معنا
    newPage();
    title('Section 4: Contact Us / Tawasul Maana', 14);
    text(`Path: ${contactSystem.path}`);
    contactSystem.features.forEach((f, i) => bullet(`${f.name}: ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 5: المنصات العلمية
    title('Section 5: Scientific Platforms (4 Platforms)', 14);
    scientificPlatforms.forEach((p, pi) => {
      check(40);
      section(`5.${pi + 1} ${p.name} (${p.path})`);
      text(`Benefit: ${p.benefit}`);
      p.features.forEach((f, fi) => bullet(`${f.name} [${f.count}]: ${f.desc}`, `${fi + 1}`));
      y += 5;
    });

    // القسم 6: التجارب العلمية
    newPage();
    title('Section 6: Scientific Experiments (30+ Experiments)', 14);
    
    Object.entries(experiments).forEach(([key, exp]) => {
      check(20);
      section(exp.title);
      exp.items.forEach((item, i) => {
        bullet(`${item.name} [${item.ops} Operations]: ${item.desc}`, `${i + 1}`);
      });
      y += 5;
    });

    // القسم 7: نظام المعلمين
    newPage();
    title('Section 7: Teacher System / Nizam Al-Muallimin', 14);
    teacherSystem.features.forEach((f, i) => bullet(`${f.name} (${f.path}): ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 8: نظام أولياء الأمور
    title('Section 8: Parent System / Nizam Awliyaa Al-Umur', 14);
    parentSystem.features.forEach((f, i) => bullet(`${f.name} (${f.path}): ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 9: أدوات AI
    newPage();
    title('Section 9: AI Tools (7 Tools) / Adawat Al-Dhakaa Al-Istinaai', 14);
    aiTools.forEach((t, i) => bullet(`${t.name} (${t.path}): ${t.desc}`, `${i + 1}`));
    y += 8;

    // القسم 10: أدوات إضافية
    title('Section 10: Additional Educational Tools (12 Tools)', 14);
    additionalTools.forEach((t, i) => bullet(`${t.name} (${t.path}): ${t.desc}`, `${i + 1}`));

    // القسم 11: منصات أخرى
    newPage();
    title('Section 11: Other Platforms', 14);
    otherPlatforms.forEach((p, i) => bullet(`${p.name} (${p.path}): ${p.desc}`, `${i + 1}`));
    y += 8;

    // القسم 12: الإدارة
    title('Section 12: Administration & Control', 14);
    adminFeatures.forEach((f, i) => bullet(`${f.name} (${f.path}): ${f.desc}`, `${i + 1}`));
    y += 8;

    // القسم 13: ميزات إضافية
    title('Section 13: Additional Features / Mazaya Idafiyya', 14);
    extraFeatures.forEach((f, i) => bullet(`${f.name}: ${f.desc}`, `${i + 1}`));

    // الإحصائيات النهائية
    newPage();
    title('Final Statistics / Al-Ihsaiyyat Al-Nihaiyya', 16);
    y += 5;
    const finalStats = [
      ['Interactive Scientific Experiments', '30+'],
      ['Main Scientific Platforms', '4'],
      ['AI Tools', '7'],
      ['Additional Educational Tools', '12'],
      ['Scientific Operations & Equations', '200+'],
      ['Elements in Periodic Table', '118'],
      ['Scientists in Encyclopedias', '195+'],
      ['Diseases in Medical Encyclopedia', '100+'],
      ['Teacher System Features', '7'],
      ['Parent System Features', '5'],
      ['Physics Experiments', '15'],
      ['Chemistry Experiments', '3'],
      ['Biology Experiments', '4'],
      ['Astronomy Experiments', '3'],
      ['Mathematics Experiments', '2'],
      ['Electronics Experiments', '2']
    ];
    finalStats.forEach((s, i) => bullet(`${s[0]}: ${s[1]}`, `${i + 1}`));

    // ترقيم الصفحات
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${total}`, pw / 2, 290, { align: 'center' });
    }

    doc.save('Thorwat_Al_Ilm_Complete_Documentation.pdf');
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      <StarField />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">📄 توثيق منصة ذروة العلم الشامل</h1>
          <p className="text-xl text-gray-300 mb-6">دليل تفصيلي كامل لجميع ميزات المنصة التعليمية</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2"><Sparkles className="w-5 h-5 ml-2" />30+ تجربة علمية</Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2"><Brain className="w-5 h-5 ml-2" />7 أدوات AI</Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2"><BookOpen className="w-5 h-5 ml-2" />4 منصات علمية</Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2"><Calculator className="w-5 h-5 ml-2" />200+ عملية</Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2"><Users className="w-5 h-5 ml-2" />نظام معلمين وأولياء أمور</Badge>
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button size="lg" onClick={generatePDF} disabled={isGenerating} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
              {isGenerating ? 'جاري الإنشاء...' : <><Download className="w-6 h-6 ml-2" />تحميل ملف PDF الشامل</>}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')} className="text-lg">
              <Home className="w-5 h-5 ml-2" />العودة للرئيسية
            </Button>
          </div>
        </motion.div>

        <ScrollArea className="h-[700px] rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          {/* مقدمة المنصة */}
          <Card className="mb-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                القسم 1: مقدمة عن المنصة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p className="text-lg mb-4">{platformInfo.description}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-white mb-2">الفوائد:</h4>
                  <ul className="space-y-1">
                    {platformInfo.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> {b}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">التقنيات المستخدمة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {platformInfo.technologies.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تسجيل الدخول */}
          <Card className="mb-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-400" />
                القسم 2: {authSystem.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-3">المسار: {authSystem.path}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {authSystem.features.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {f.name}</h5>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الملف الشخصي */}
          <Card className="mb-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <User className="w-5 h-5 text-green-400" />
                القسم 3: {profileSystem.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-3">المسار: {profileSystem.path}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {profileSystem.features.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {f.name}</h5>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* تواصل معنا */}
          <Card className="mb-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-yellow-400" />
                القسم 4: {contactSystem.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-3">المسار: {contactSystem.path}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {contactSystem.features.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {f.name}</h5>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* المنصات العلمية */}
          <Card className="mb-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Atom className="w-6 h-6 text-cyan-400" />
                القسم 5: المنصات العلمية (4 منصات)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scientificPlatforms.map((platform, pi) => (
                <div key={pi} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <platform.icon className="w-5 h-5" />
                    5.{pi + 1} {platform.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">المسار: {platform.path}</p>
                  <p className="text-green-400 mb-3">✨ الفائدة: {platform.benefit}</p>
                  <div className="space-y-2">
                    {platform.features.map((f, fi) => (
                      <div key={fi} className="p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold">{fi + 1}. {f.name}</span>
                          <Badge variant="outline" className="text-xs">{f.count}</Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* التجارب العلمية */}
          <Card className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Microscope className="w-6 h-6 text-purple-400" />
                القسم 6: التجارب العلمية التفاعلية (30+ تجربة)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(experiments).map(([key, exp]) => (
                <div key={key} className="mb-6">
                  <h3 className={`text-xl font-bold mb-3 text-${exp.color}-400`}>{exp.title}</h3>
                  <div className="space-y-2">
                    {exp.items.map((item, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <span className="text-white font-bold">{i + 1}. {item.name}</span>
                          <Badge className={`bg-${exp.color}-600`}>{item.ops} عملية</Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* نظام المعلمين */}
          <Card className="mb-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                القسم 7: {teacherSystem.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teacherSystem.features.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {f.name}</h5>
                    <p className="text-gray-500 text-xs">{f.path}</p>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* نظام أولياء الأمور */}
          <Card className="mb-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                القسم 8: {parentSystem.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {parentSystem.features.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {f.name}</h5>
                    <p className="text-gray-500 text-xs">{f.path}</p>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* أدوات AI */}
          <Card className="mb-6 bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                القسم 9: أدوات الذكاء الاصطناعي (7 أدوات)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {aiTools.map((t, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <h5 className="font-bold text-white">{i + 1}. {t.name}</h5>
                    <p className="text-gray-500 text-xs">{t.path}</p>
                    <p className="text-gray-400 text-sm">{t.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الإحصائيات */}
          <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <BarChart className="w-6 h-6 text-amber-400" />
                الإحصائيات النهائية للمنصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ['30+', 'تجربة علمية'],
                  ['4', 'منصات علمية'],
                  ['7', 'أدوات AI'],
                  ['200+', 'عملية علمية'],
                  ['118', 'عنصر كيميائي'],
                  ['12', 'أداة تعليمية'],
                  ['100+', 'مرض بالموسوعة'],
                  ['195+', 'عالم بالموسوعات']
                ].map(([n, t], i) => (
                  <div key={i} className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-3xl font-bold text-white">{n}</div>
                    <div className="text-gray-300 text-sm">{t}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
      
      <Footer />
    </div>
  );
};

export default PlatformDocumentation;
