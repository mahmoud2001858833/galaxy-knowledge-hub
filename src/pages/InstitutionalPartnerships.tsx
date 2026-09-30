import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Users, 
  FileText, 
  Phone, 
  Mail, 
  Globe, 
  HelpCircle, 
  Award, 
  Atom, 
  HeartHandshake, 
  Laptop, 
  Check, 
  Copy,
  Download,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface PartnershipApplication {
  id: string;
  refNumber: string;
  institutionName: string;
  institutionType: 'school' | 'university' | 'ministry' | 'private' | 'ngo';
  country: string;
  city: string;
  representativeName: string;
  roleTitle: string;
  email: string;
  phone: string;
  studentCount: string;
  partnershipType: string;
  notes: string;
  status: 'new' | 'reviewing' | 'mou_signed' | 'archived';
  submittedAt: string;
}

export const InstitutionalPartnerships: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState<'school' | 'university' | 'ministry' | 'private' | 'ngo'>('school');
  const [country, setCountry] = useState('المملكة الأردنية الهاشمية');
  const [city, setCity] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCount, setStudentCount] = useState('500 - 1,500 طالب');
  const [partnershipType, setPartnershipType] = useState('ترخيص مختبرات 3D المدرسية');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!institutionName.trim() || !representativeName.trim() || !email.trim() || !phone.trim()) {
      toast.error('يرجى تعبئة كافة الحقول الأساسية المطلوبة');
      return;
    }

    setIsSubmitting(true);

    const refNum = `PARTNER-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newApplication: PartnershipApplication = {
      id: Date.now().toString(),
      refNumber: refNum,
      institutionName,
      institutionType,
      country,
      city,
      representativeName,
      roleTitle,
      email,
      phone,
      studentCount,
      partnershipType,
      notes,
      status: 'new',
      submittedAt: new Date().toISOString()
    };

    try {
      const existingStr = localStorage.getItem('galaxy_partnerships_requests');
      const existing: PartnershipApplication[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(newApplication);
      localStorage.setItem('galaxy_partnerships_requests', JSON.stringify(existing));

      supabase.from('institutional_partnerships').insert({
        id: newApplication.id,
        organization_name: newApplication.institutionName,
        organization_type: newApplication.institutionType,
        representative_name: newApplication.representativeName,
        representative_title: newApplication.roleTitle,
        email: newApplication.email,
        phone: newApplication.phone,
        country: newApplication.country,
        city: newApplication.city,
        partnership_goals: `${newApplication.partnershipType} - ${newApplication.notes}`,
        status: 'pending',
        raw_data: newApplication,
        created_at: newApplication.submittedAt
      }).then(({ error }) => {
        if (error) console.warn('Supabase partnership insert warning:', error);
      });
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(refNum);
      toast.success(`تم استلام طلب الشراكة برقم مرجعي: ${refNum}`);
    }, 700);
  };

  const copyRefNumber = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    toast.success('تم نسخ الرقم المرجعي للحافظة');
    setTimeout(() => setCopied(false), 2000);
  };

  const institutionalBenefits = [
    {
      icon: Atom,
      title: "بنية تحتية متكاملة لـ 49 مختبراً 3D",
      desc: "تزويد مدرستكم أو جامعتكم بأحدث بيئات المحاكاة ثلاثية الأبعاد في الفيزياء، الكيمياء، الأحياء، والرياضيات مع تطابق 100% مع المناهج الوطنية والدولية.",
      highlight: "توفير فوري بدون تجهيزات باهظة",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: TrendingUp,
      title: "خفض تكاليف المعامل التقليدية بنسبة 85%",
      desc: "استبدال استهلاك المواد الكيميائية الخطرة وصيانة الأجهزة المعملية باهظة الثمن بتجارب افتراضية آمنة كلياً وغير محدودة التكرار لكل طالب.",
      highlight: "عائد استثمار استثنائي (ROI)",
      color: "from-emerald-600 to-teal-600"
    },
    {
      icon: Layers,
      title: "لوحة تحكم وتقارير قياس الأداء (Telemetry)",
      desc: "تزويد الإدارة المدرسية والجامعية بتقارير قياس دقيقة وفورية حول تقدم كل طالب، معدل إنجاز التجارب، ومكامن الصعوبة الأكاديمية.",
      highlight: "قرارات مبنية على بيانات حية",
      color: "from-purple-600 to-indigo-600"
    },
    {
      icon: HeartHandshake,
      title: "الريادة في الشمولية والدمج (مشروع دامج)",
      desc: "تطبيق فوري لأحدث تقنيات دمج ذوي الإعاقة: كاشف لغة الإشارة بالكاميرا، مترجم برايل التفاعلي، وأدوات دعم طيف التوحد وفرط الحركة (ADHD).",
      highlight: "امتثال كامل لمعايير WCAG والتعليم الدامج",
      color: "from-teal-600 to-emerald-600"
    },
    {
      icon: Laptop,
      title: "تخصيص البوابة المؤسسية (White-label Portal)",
      desc: "إمكانية إطلاق بوابة خاصة تحمل شعار واسم مؤسستكم، وربطها بأنظمة إدارة التعلم المعتمدة لديكم (LMS / SIS) بسلاسة وأمان تام.",
      highlight: "هوية مؤسسية مستقلة متكاملة",
      color: "from-amber-600 to-orange-600"
    },
    {
      icon: Award,
      title: "تدريب واعتماد الكوادر الأكاديمية",
      desc: "برامج تدريبية معتمدة للمعلمين وأعضاء الهيئة التدريسية على توظيف الذكاء الاصطناعي والمحاكاة التفاعلية، مع منح شهادات مدرب رقمي معتمد.",
      highlight: "تطوير مهني مستمر للكوادر",
      color: "from-rose-600 to-red-600"
    }
  ];

  const partnershipTiers = [
    {
      title: "المدارس والمجمعات التعليمية",
      subtitle: "K-12 Educational Complexes",
      badge: "الخيار الأوسع انتشاراً",
      points: [
        "تراخيص غير محدودة لجميع طلبة المدرسة",
        "تغطية كاملة لمناهج الوزارة ومسارات BTEC",
        "حسابات خاصة للمشرفين والمعلمين",
        "دعم فني وتدريب ميداني للكوادر"
      ]
    },
    {
      title: "الجامعات والكليات التقنية",
      subtitle: "Universities & Technical Colleges",
      badge: "أكاديمي وتطبيقي متقدم",
      points: [
        "مختبرات متقدمة للفيزياء الحديثة وميكانيكا الكم",
        "أنظمة الروبوتات والـ ROS2 وهندسة البرمجيات",
        "أرشفة وتوثيق الأبحاث بالمجلة العلمية",
        "ربط برمجي API مباشر مع أنظمة الجامعة"
      ]
    },
    {
      title: "الوزارات والمديريات الحكومية",
      subtitle: "Ministries & Strategic Authorities",
      badge: "مبادرات وطنية واسعة",
      points: [
        "نشر المنظومة على مستوى شبكة المدارس الوطنية",
        "لوحة قياس مركزية لمديريات التربية والتعليم",
        "استضافة سيادية وحماية بيانات متقدمة",
        "مبادرات الدمج الوطني للتربية الخاصة (دامج)"
      ]
    }
  ];

  const partnershipFaqs = [
    {
      q: "ما هي المتطلبات التقنية اللازمة لتشغيل منصة ذروة العلم في مدرستنا؟",
      a: "لا تتطلب المنصة أي خوادم محلية أو تجهيزات باهظة. تعمل بسلاسة على كافة متصفحات الويب الحديثة، الأجهزة اللوحية، الهواتف الذكية، وألواح الشاشات التفاعلية (Smart Boards) في الفصول."
    },
    {
      q: "كم يستغرق تدريب وتأهيل المعلمين لبدء استخدام المنظومة؟",
      a: "نوفر ورشة عمل تمهيدية مكثفة لمدة ساعتين تُمكّن المعلم من إطلاق التجارب، إدارة مجموعات الطلبة، وتوليد الأسئلة فورياً، مع توفير حقيبة تدريبية ودعم فني مخصص."
    },
    {
      q: "هل تتوافق المختبرات مع المناهج الوطنية ومناهج BTEC المعتمدة؟",
      a: "نعم بالكامل. صُممت المحاكيات وفق مخرجات التعلم المعتمدة لوزارة التربية والتعليم الأردنية، بالإضافة إلى معايير مؤسسة Pearson الدولية لمسارات BTEC التقنية والمهنية."
    },
    {
      q: "كيف تتم حماية بيانات ومعلومات الطلبة والمؤسسة؟",
      a: "نلتزم بأعلى معايير الأمن السيبراني والخصوصية. تتم المعالجة وفق تشفير شامل (End-to-End Encryption)، ولا يتم تسجيل أي مقاطع فيديو للطلبة، مع التزام تام باللوائح الوطنية لحماية البيانات."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir="rtl">
      <SEO
        title="الشراكة المؤسسية والتعاون الاستراتيجي | منصة ذروة العلم"
        description="بوابة الشراكات المؤسسية للمدارس، الجامعات، والوزارات: مختبرات 3D تفاعلية، خفض تكاليف المعامل 85%، حلول الدمج والتربية الخاصة مع مبادرة دامج، وتدريب معتمد."
        keywords="شراكة مؤسسية, تراخيص مدارس, مختبرات افتراضية, ذروة العلم, دامج, وزارة التربية, BTEC Pearson, تعليم تفاعلي"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            الشراكة المؤسسية والتعاون الاستراتيجي
          </span>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-12 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden text-center sm:text-right">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>برنامج الشراكات والتحول الرقمي التعليمي (Enterprise Partnership)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              الشراكة المؤسسية مع{' '}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-cyan-300 dark:to-white bg-clip-text text-transparent">
                منصة ذروة العلم
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              نضع بين أيدي المؤسسات التعليمية، المدارس، الجامعات، والوزارات بنية تحتية رقمية رائدة تضم 49 مختبراً ثلاثي الأبعاد، مسارات BTEC المهنية، وحلول الشمولية والتربية الخاصة مع مبادرة دامج الوطنية، لتمكين طلبتكم ورفع جودة التعليم بأعلى كفاءة وأقل تكلفة.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">85%</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">خفض تكاليف المعامل</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">49 مختبراً</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">محاكاة 3D معتمدة</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">100% شمولية</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مشروع دامج الوطني</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">تدريب معتمد</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">لكوادر المعلمين والمشرفين</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: ما الذي تستفيده مؤسستكم من الشراكة؟ */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>القيمة المضافة والعوائد المؤسسية (ROI)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              ما الذي تستفيده مؤسستكم من الشراكة الاستراتيجية؟
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              صُممت الشراكة لتمنح المؤسسات التعليمية قفزة نوعية في جودة التدريس العملي والتحول الرقمي الموثوق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutionalBenefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {b.highlight}
                      </Badge>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {b.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>مضمن في باقة الشراكة المعتمدة</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: مستويات ونماذج الشراكة */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              نماذج وحزم الشراكة المتاحة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              حزم مخصصة لتلبية أهداف كل جهة وفق حجمها وطبيعة طلبتها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnershipTiers.map((tier, tIdx) => (
              <div
                key={tIdx}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {tier.badge}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {tier.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">
                      {tier.subtitle}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {tier.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const formElement = document.getElementById('partnership-application-form');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outline"
                  className="w-full rounded-2xl font-bold text-xs"
                >
                  طلب اعتماد هذه الحزمة
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: نموذج تقديم طلب الشراكة المؤسسية */}
        <div id="partnership-application-form" className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/90 border border-blue-200/80 dark:border-slate-800 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>بوابة تقديم طلبات التعاون الرسمي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              تقديم طلب الشراكة المؤسسية الرسمي
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              يرجى تزويدنا ببيانات المؤسسة وسيتواصل معكم فريق الشراكات الاستراتيجية خلال 24 ساعة عمل
            </p>
          </div>

          {/* Submission Success Alert */}
          <AnimatePresence>
            {submittedRef && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-4 max-w-xl mx-auto"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                    تم استلام طلب الشراكة بنجاح!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    تم تسجيل طلب مؤسستكم وإحالته إلى لوحة إدارة الشراكات للمراجعة والتدقيق الفني.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">رقم الملف المرجعي:</span>
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">{submittedRef}</span>
                  </div>
                  <Button
                    onClick={copyRefNumber}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم النسخ' : 'نسخ الرقم'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اسم المؤسسة / المدرسة / الجامعة / الوزارة *
                </label>
                <Input
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="مثال: مدارس الملك عبدالله الثاني للتميز"
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              {/* Institution Type */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نوع الجهة المؤسسية *
                </label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="school">مدرسة / مجمع تعليمي (K-12)</option>
                  <option value="university">جامعة / كلية جامعية</option>
                  <option value="ministry">وزارة / مديرية تعليمية حكومية</option>
                  <option value="private">مؤسسة تدريبية خاصة / قطاع خاص</option>
                  <option value="ngo">منظمة غير ربحية / رعاية مجتمعية</option>
                </select>
              </div>

              {/* Country & City */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  الدولة *
                </label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="المملكة الأردنية الهاشمية"
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  المدينة / المحافظة *
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="عمان، إربد، الزرقاء..."
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              {/* Representative Name & Title */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اسم ممثل المؤسسة أو المفوض *
                </label>
                <Input
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  placeholder="الاسم الكامل"
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  المسمى الوظيفي *
                </label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="مدير عام، عميد كلية، منسق تعليمي..."
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              {/* Email & Phone */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني الرسمي *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@school.edu.jo"
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  رقم الهاتف للتواصل الرسمي *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+962 7X XXX XXXX"
                  required
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>

              {/* Student Reach & Partnership Category */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  عدد الطلبة المتوقع استفادتهم
                </label>
                <select
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="100 - 500 طالب">100 - 500 طالب</option>
                  <option value="500 - 1,500 طالب">500 - 1,500 طالب</option>
                  <option value="1,500 - 5,000 طالب">1,500 - 5,000 طالب</option>
                  <option value="أكثر من 5,000 طالب">أكثر من 5,000 طالب (على مستوى شبكة أو مديرية)</option>
                </select>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نطاق الشراكة المقترح
                </label>
                <select
                  value={partnershipType}
                  onChange={(e) => setPartnershipType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="ترخيص مختبرات 3D المدرسية">ترخيص مختبرات 3D المدرسية (العلوم والرياضيات)</option>
                  <option value="اعتماد مسارات BTEC المهنية">اعتماد مسارات BTEC المهنية والبرمجية</option>
                  <option value="تطبيق شمولية مشروع دامج">تطبيق شمولية مشروع دامج للتربية الخاصة</option>
                  <option value="ربط جامعي وتدريب كوادر">ربط جامعي وتدريب الكوادر التدريسية</option>
                  <option value="بوابة مخصصة White-Label">بوابة إلكترونية مخصصة بهوية المؤسسة</option>
                  <option value="أخرى / مذكرة تفاهم شاملة">أخرى / توقيع مذكرة تفاهم استراتيجية شاملة</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ملاحظات أو متطلبات خاصة ترغبون بذكرها
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="اذكر أي تفاصيل إضافية حول التجهيزات، موعد التدشين المستهدف، أو المتطلبات الأكاديمية الخاصة..."
                className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:opacity-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'جاري إرسال الطلب واعتماده...' : 'تقديم طلب الشراكة المؤسسية'}
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Section 4: معلومات التواصل والأسئلة الشائعة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Direct Contact Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">
                مكتب الشراكات الاستراتيجية والتعاون المؤسسي
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                مستشارو الشراكات لدينا متواجدون لترتيب اجتماعات تعريفية وعروض توضيحية حية لقيادات المدارس والجامعات.
              </p>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>partnerships@galaxy-knowledge.edu.jo</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>+962 6 500 0000 / تحويلة الشراكات</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>أوقات العمل: الأحد - الخميس (8:30 ص - 4:30 م)</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[11px] text-emerald-400 font-bold block">
                استجابة فورية خلال 24 ساعة لجميع الطلبات المؤسسية
              </span>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                الأسئلة الشائعة حول الشراكة المؤسسية
              </h3>
              <p className="text-xs text-slate-500">
                إجابات تفصيلية على أكثر الاستفسارات التي تهم إدارات المدارس والجامعات
              </p>
            </div>

            <div className="space-y-3">
              {partnershipFaqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-right shadow-sm"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstitutionalPartnerships;
