import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Atom, 
  Sparkles, 
  Rocket, 
  Cpu, 
  Layers, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  X, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ADMIN_EMAILS = [
  'jowmahmoud6@gmail.com',
  'jali53207@gmail.com',
  'jo789wmahmoud6@gmail.com'
];

interface FuturePlatform {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  icon: React.ReactNode;
  gradient: string;
  route: string;
  timeline: string;
  phase: string;
  isFlagship?: boolean;
  strategicObjective: string;
  plannedFeatures: { title: string; description: string; tag: string }[];
  targetAudience: string;
  institutionPartners: string[];
  techStack: string[];
}

export const FuturePlatformsShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<FuturePlatform | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setCheckingAuth(false);
          return;
        }

        if (ADMIN_EMAILS.includes(user.email || '')) {
          setIsAdmin(true);
          setCheckingAuth(false);
          return;
        }

        const { data } = await supabase
          .from('admin_teacher_access')
          .select('access_level')
          .eq('user_id', user.id)
          .limit(1);

        if (data && data.length > 0) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAdmin();
  }, []);

  const futurePlatforms: FuturePlatform[] = [
    {
      id: 'damij-ecosystem',
      title: 'مشروع "دامج" الوطني للتربية الخاصة والشمولية الرقمية',
      subtitle: 'المنظومة الوطنية الأولى المفتوحة لتمكين أصحاب الهمم',
      tagline: 'منصة استراتيجية شاملة تجمع الذكاء الاصطناعي مع تقنيات الوصول الميسر',
      icon: <HeartHandshake className="w-8 h-8" />,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      route: '/damij',
      timeline: 'المرحلة التشغيلية الأولى • Q2 2026',
      phase: 'قيد التطوير المعتمد • مبادرة رائدة',
      isFlagship: true,
      strategicObjective: 'إرساء أول معيار تقني عربي مفتوح المصدر لدمج ذوي الإعاقة السمعية، البصرية، والحركية، وصعوبات التعلم في التعليم التفاعلي والمختبرات العلمية المتقدمة وفق معايير W3C / WCAG 2.1 AAA.',
      plannedFeatures: [
        {
          title: 'مترجم لغة الإشارة بالرؤية الحاسوبية على الحافة (Edge Vision)',
          description: 'معالجة إشارات اليد بالذكاء الاصطناعي مباشرة داخل المتصفح بمعدل 60 إطار بالثانية وبخصوصية تامة دون إرسال الفيديو للسيرفر.',
          tag: 'ذكاء اصطناعي للرؤية'
        },
        {
          title: 'بروتوكول برايل اللمسي والصوتي الموحد (Universal Braille)',
          description: 'نظام ترجمة فورية ثنائي الاتجاه بين اللغة العربية ورموز برايل ذات الـ 6 نقاط مع مخرجات صوتية واهتزازية Haptic Feedback.',
          tag: 'برايل لمسي'
        },
        {
          title: 'المحرك الحسي التكيفي لطيف التوحد وفرط الحركة (Neuro-Sensory)',
          description: 'ضبط تباين الألوان، تقليل المشتتات، وتهدئة واجهات التفاعل تلقائياً بناءً على استجابة الطالب الحركية والبصرية.',
          tag: 'طيف التوحد'
        },
        {
          title: 'منظومة العيادة والمسح الطبي الميداني للتشخيص (Damij Clinical)',
          description: 'استبيانات مقننة واختبارات قياس حسية مبكرة تساعد المعلمين والأطباء في رصد صعوبات التعلم وعجز الانتباه.',
          tag: 'تشخيص ميداني'
        },
        {
          title: 'الربط السحابي مع بوابات المدارس والمراكز المتخصصة',
          description: 'واجهات برمجة تطبيقات (APIs) لربط ملفات الطلاب ومتابعة تقدمهم التراكمي وتوصيات المشرفين.',
          tag: 'ربط مؤسسي'
        }
      ],
      targetAudience: 'الطلبة من ذوي الإعاقة السمعية والبصرية والحركية، متلازمة داون، طيف التوحد، والمعلمون والمشرفون الصحيون.',
      institutionPartners: ['وزارة التربية والتعليم', 'الجامعة الألمانية الأردنية (GJU)', 'المجلس الأعلى لحقوق الأشخاص ذوي الإعاقة'],
      techStack: ['MediaPipe Hands & Face Landmarker', 'TensorFlow.js WebGL', 'Web Audio API & Speech Synthesis', 'React Three Fiber']
    },
    {
      id: 'quantum-metalab',
      title: 'المختبر الكمي والميتافيرس العلمي ثلاثي الأبعاد (Quantum VR MetaLab)',
      subtitle: 'بيئة الواقع الافتراضي والمعزز لفيزياء الجسيمات وعالم الذرة',
      tagline: 'تجسيد المفاهيم غير المرئية في فضاء تفاعلي غامر',
      icon: <Atom className="w-8 h-8" />,
      gradient: 'from-purple-600 via-fuchsia-600 to-pink-500',
      route: '/simulation/quantum-mechanics',
      timeline: 'المرحلة التجريبية • Q3 2026',
      phase: 'بحث وتطوير R&D',
      strategicObjective: 'تمكين الطلاب من ارتداء نظارات الواقع الافتراضي (WebXR) والتحكم بالجسيمات دون الذرية والتراكب الكمي والنفق الكمي كأنهم داخل الذرة، مما يقضي على تجريد وصعوبة الفيزياء الحديثة.',
      plannedFeatures: [
        {
          title: 'غرفة النفق الكمي الغامرة (Quantum Tunneling Chamber)',
          description: 'محاكاة ثلاثية الأبعاد لاختراق الجسيمات لحواجز الجهد وملاحظة انهيار الدالة الموجية بالرصد التفاعلي.',
          tag: 'ميكانيكا الكم'
        },
        {
          title: 'تتبع حركة اليد داخل المختبر الافتراضي (Hand Tracking VR)',
          description: 'إجراء التجارب دون يد تحكم خارجية باستخدام كاميرات النظارة لتجميع الذرات وموازنة الشحنات.',
          tag: 'تفاعل حركي'
        },
        {
          title: 'القاعة الصفية الافتراضية متعددة الحضور (Multiplayer Classroom)',
          description: 'دخول المعلم مع طلابه في نفس الفضاء الافتراضي لإجراء تجارب تصادمات الجسيمات معاً.',
          tag: 'فصول غامرة'
        }
      ],
      targetAudience: 'طلبة المرحلة الثانوية (التوجيهي)، طلبة كليات العلوم والهندسة، والباحثون الأكاديميون.',
      institutionPartners: ['مراكز أبحاث الفيزياء المتقدمة', 'كليات العلوم والفيزياء بالجامعات الأردنية'],
      techStack: ['WebXR Device API', 'Three.js / React Three Fiber', 'GLSL Physics Shaders', 'WebSockets Sync']
    },
    {
      id: 'genai-faculty-hub',
      title: 'استوديو الذكاء الاصطناعي التوليدي للمعلمين (GenAI Faculty Studio)',
      subtitle: 'المساعد الذكي لتصميم الحصص التفاعلية والاختبارات الوزارية',
      tagline: 'أتمتة التخطيط التربوي وتوليد أوراق العمل والأنشطة الإثرائية',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-amber-500 via-orange-600 to-red-500',
      route: '/super-admin-control-hub',
      timeline: 'مرحلة الاعتماد • Q4 2026',
      phase: 'قيد الاعتماد التربوي',
      strategicObjective: 'توفير محرك ذكاء اصطناعي سيادي مبني وفق المعايير الوزارية والمنهاج الوطني لتوليد أسئلة امتحانية ذكية، خطط دروس علاجية للطلاب المتعثرين، وتجارب صفية ملهمة بنقرة زر واحدة.',
      plannedFeatures: [
        {
          title: 'منشئ الخطط العلاجية المتكيفة (Adaptive Remedial Plans)',
          description: 'تحليل نقاط ضعف الطالب في الامتحانات وتوليد أنشطة وتمارين علاجية موجهة ومخصصة له فوراً.',
          tag: 'خطط علاجية'
        },
        {
          title: 'مصمم أوراق العمل وفق تصنيف بلوم للمهارات المعرفية',
          description: 'توليد أسئلة متدرجة من الحفظ والفهم إلى التحليل والتركيب والتقويم مع نماذج إجابة معتمدة.',
          tag: 'تصنيف بلوم'
        },
        {
          title: 'مساعد المعلم الصفي الذكي (Smart Teaching Co-Pilot)',
          description: 'اقتراح أمثلة توضيحية من البيئة المحلية وتجارب منزلية بسيطة لشرح أصعب النظريات العلمية.',
          tag: 'مساعد تربوي'
        }
      ],
      targetAudience: 'المعلمون والمعلمات، المشرفون التربويون، وإدارات المدارس الحكومية والخاصة.',
      institutionPartners: ['إدارات الإشراف والتدريب التربوي', 'كليات العلوم التربوية'],
      techStack: ['Deepseek & Gemini Pedagogical Fine-tuned Models', 'Supabase Vector Embeddings', 'PDF Engine Exporter']
    },
    {
      id: 'cosmic-missions-academy',
      title: 'أكاديمية الفضاء والمهمات المدارية (Cosmic Missions Space Lab)',
      subtitle: 'محاكاة رحلات الفضاء والبيانات الحية للأجرام السماوية',
      tagline: 'الربط المباشر مع التلسكوبات الفلكية ومسارات الأقمار الصناعية',
      icon: <Rocket className="w-8 h-8" />,
      gradient: 'from-sky-500 via-blue-600 to-indigo-700',
      route: '/simulation/solar-system-3d',
      timeline: 'خطة استراتيجية • 2027',
      phase: 'شراكات دولية',
      strategicObjective: 'بناء منصة فلكية تفاعلية تتصل بالبيانات المفتوحة لوكالات الفضاء، تتيح للطلاب التخطيط الرياضي والفيزيائي لمسارات إطلاق الأقمار والمسبارات وحساب سرعات الإفلات ومناورات هوهمان المدارية.',
      plannedFeatures: [
        {
          title: 'تتبع المحطة الفضائية الدولية والأقمار الصناعية بالوقت الحقيقي',
          description: 'رصد مسارات الأقمار الصناعية فوق سماء الأردن والعالم العربي مع حسابات زوايا الرؤية.',
          tag: 'بيانات حية'
        },
        {
          title: 'مختبر إطلاق الصواريخ وحسابات الدفع (Orbital Dynamics Lab)',
          description: 'محاكاة ديناميكية لاحتراق الوقود وتغير الكتلة والوصول إلى المدارات الجغرافية المستقرة.',
          tag: 'ديناميكا مدارية'
        },
        {
          title: 'التلسكوب الافتراضي عالي الدقة (Virtual Deep Sky Observatory)',
          description: 'استكشاف السدم والمجرات البعيدة بأطوال موجية متعددة (أشعة تحت حمراء وسينية وراديوية).',
          tag: 'تلسكوب كوني'
        }
      ],
      targetAudience: 'هواة وطلبة الفلك والفيزياء، الأندية العلمية، والمهتمون بهندسة الطيران والفضاء.',
      institutionPartners: ['الجمعية الفلكية الأردنية', 'المراكز الإقليمية لتدريس علوم الفضاء'],
      techStack: ['NASA Open APIs & TLE Data', 'Ephemeris Orbital Calculators', 'WebGL Particle Accelerators']
    },
    {
      id: 'iot-smart-campus',
      title: 'حرم المدارس الذكية وإنترنت الأشياء (IoT Smart Campus & Labs)',
      subtitle: 'ربط المختبرات المدرسية الميدانية بالسحابة الرقمية',
      tagline: 'أجهزة استشعار بيئية وحساسات أمان ذكية للمختبرات والمرافق',
      icon: <Cpu className="w-8 h-8" />,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      route: '/robotics-section',
      timeline: 'خطة استراتيجية • 2027',
      phase: 'بنية تحتية مستقبلية',
      strategicObjective: 'تحويل المختبرات المدرسية التقليدية إلى غرف تفاعلية ذكية مزودة بمتحكمات وحساسات تقيس نقاوة الهواء، تسرب الغازات، استهلاك الطاقة، وتتحكم بأجهزة التجارب عن بعد لدعم تجارب الروبوتات.',
      plannedFeatures: [
        {
          title: 'نظام الاستشعار البيئي للمختبرات العلمية (Safety Lab IoT)',
          description: 'مراقبة حية لتراكيز الغازات ودرجة الحرارة في غرف التجارب وإطلاق إنذارات وقائية آلية.',
          tag: 'أمان المختبرات'
        },
        {
          title: 'التحكم والمحاكاة للروبوتات المدرسية عن بُعد (Remote Robotics)',
          description: 'برمجة واختبار روبوتات المدارس وتتبعها في مسارات تدريبية افتراضية وميدانية متزامنة.',
          tag: 'ميكاترونكس'
        },
        {
          title: 'لوحة التحكم والتحليلات المؤسسية الموحدة (Campus Analytics)',
          description: 'مؤشرات بيانية لمديري المدارس والمشرفين حول استخدام المختبرات ونسب إنجاز التجارب.',
          tag: 'بيانات وإدارة'
        }
      ],
      targetAudience: 'إدارات المدارس، مسؤولو المختبرات، ومشرفو أندية الروبوتات والذكاء الاصطناعي.',
      institutionPartners: ['وزارة الاقتصاد الرقمي والريادة', 'شركات حلول إنترنت الأشياء والمدارس الذكية'],
      techStack: ['MQTT Protocol & WebSockets', 'ESP32 / Arduino Microcontrollers', 'Supabase Realtime Tables']
    }
  ];

  const handlePlatformClick = (platform: FuturePlatform) => {
    setSelectedPlatform(platform);
  };

  const handleEnterPlatform = (platform: FuturePlatform) => {
    if (isAdmin) {
      toast.success(`مرحباً بك! جاري نقلك إلى مساحة الإدارة والمعاينة لمنصة ${platform.title}`);
      setSelectedPlatform(null);
      navigate(platform.route);
    } else {
      toast.info(
        `منصة "${platform.title}" ضمن خططنا الاستراتيجية المستقبلية وهي قيد التطوير والاختبار الداخلي. يمكنك استعراض كافة تفاصيلها ومخططاتها هنا، بينما الدخول المبكر مخصص لحسابات الإدارة.`,
        { duration: 5000 }
      );
    }
  };

  return (
    <section 
      id="future-platforms-section"
      className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir="rtl"
    >
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 backdrop-blur-xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 text-right">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
              <Rocket className="w-3.5 h-3.5" />
              <span>الخطط الاستراتيجية والمنصات المستقبلية | Strategic Suites & Roadmaps</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              منصات الجيل القادم: رؤية ذروة العلم المستقبلية
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              استكشف المنظومات والبيئات الأكاديمية قيد التطوير والتجهيز. يمكن لجميع الزوار والمعلمين والطلاب استعراض ميزاتها وخياراتها ومخططاتها الاستراتيجية، في حين يقتصر الدخول المبكر حالياً على حسابات إدارة المنصة.
            </p>
          </div>

          {/* Admin / User Role Indicator Status */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {checkingAuth ? (
              <span className="text-xs text-slate-400">جاري التحقق من الصلاحيات...</span>
            ) : isAdmin ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>صلاحية إدارة (أدمن) مفعلة • دخول المعاينة متاح</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>وضع استعراض الخيارات والمخططات (مفتوح للجميع)</span>
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-medium">
              اضغط على أي منصة لاستعراض خياراتها التفصيلية
            </span>
          </div>
        </div>

        {/* Platforms Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futurePlatforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => handlePlatformClick(platform)}
              className={`group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                platform.isFlagship
                  ? 'bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-blue-950/20 dark:via-slate-900/90 dark:to-slate-900 border-blue-500/40 hover:border-blue-500 md:col-span-2 lg:col-span-2 shadow-blue-500/5'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${platform.gradient}`} />

              <div className="space-y-4">
                {/* Header Row: Badge & Timeline */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {platform.timeline}
                  </span>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    platform.isFlagship 
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-black' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {platform.phase}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${platform.gradient} text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {platform.subtitle}
                    </p>
                  </div>
                </div>

                {/* Tagline / Strategic Objective Preview */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {platform.strategicObjective}
                </p>

                {/* Key Features Quick Peek */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">من أبرز الخيارات والميزات المخططة:</span>
                  {platform.plannedFeatures.slice(0, platform.isFlagship ? 3 : 2).map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1 group-hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>استعراض كافة الخيارات والمواصفات</span>
                </span>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  {isAdmin ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Unlock className="w-3 h-3" /> متاح للأدمن
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-3 h-3 text-amber-500" /> دخول مقيد
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Institutional Accreditation Footnote */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>تخضع جميع المنصات المستقبلية للمعايير الوطنية للتربية والتعليم والتوافق مع رؤية التحديث الاقتصادي.</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Version Roadmap 2026-2027 • Gov & Edu Certified
          </span>
        </div>

      </div>

      {/* ===================== IN-DEPTH PLATFORM OPTIONS MODAL ===================== */}
      <AnimatePresence>
        {selectedPlatform && (
          <Dialog open={!!selectedPlatform} onOpenChange={(open) => !open && setSelectedPlatform(null)}>
            <DialogContent className="max-w-3xl bg-[#080915] border border-white/15 text-white max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedPlatform.gradient} text-white shadow-lg shrink-0`}>
                      {selectedPlatform.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {selectedPlatform.timeline}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10">
                          {selectedPlatform.phase}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        {selectedPlatform.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        {selectedPlatform.subtitle}
                      </p>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4 font-sans">
                
                {/* Strategic Objective */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs text-cyan-300 font-bold block">🎯 الهدف الاستراتيجي والرؤية الأكاديمية:</span>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                    {selectedPlatform.strategicObjective}
                  </p>
                </div>

                {/* Planned Options & Features Breakdown (الخيارات والميزات التي يشاهدها المستخدم بالداخل) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>الميزات والخيارات المخططة في هذه المنصة:</span>
                    </h4>
                    <span className="text-[11px] text-white/50 font-mono">
                      {selectedPlatform.plannedFeatures.length} خيارات تخصصية
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedPlatform.plannedFeatures.map((feat, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            {feat.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-cyan-300">
                            {feat.tag}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed pr-4">
                          {feat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Audience & Partners */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/50 font-bold block">👥 الفئة المستهدفة:</span>
                    <p className="text-white/90 font-medium">{selectedPlatform.targetAudience}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/50 font-bold block">🏛️ الشركاء والجهات الداعمة:</span>
                    <p className="text-white/90 font-medium">{selectedPlatform.institutionPartners.join(' • ')}</p>
                  </div>
                </div>

                {/* Technology Stack */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-white/50 font-bold block">⚙️ المعايير والتقنيات البرمجية المعتمدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlatform.techStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 text-white/80 text-[11px] border border-white/10 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Access Restriction Notice & Bottom CTA */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  {!isAdmin ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-amber-200">
                          معاينة مقيدة — مخصصة حالياً لحسابات الإدارة والمشرفين
                        </p>
                        <p className="text-[11px] text-amber-100/80 leading-relaxed">
                          هذه المنصة لا تزال في مرحلة التطوير والاختبار التجريبي المغلق. بصفتك مستخدماً، يمكنك الاطلاع الكامل على كافة الخيارات والمخططات أعلاه، وسيتم فتح الدخول للجميع فور الإطلاق الرسمي المعتمد.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <p className="text-xs font-bold text-emerald-200">
                        تم التحقق من صلاحيات الأدمن. متاح لك الدخول المباشر لمعاينة المنصة واختبارها.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <Button
                      onClick={() => handleEnterPlatform(selectedPlatform)}
                      className={`w-full sm:flex-1 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isAdmin
                          ? `bg-gradient-to-r ${selectedPlatform.gradient} text-white hover:brightness-110 shadow-blue-500/30`
                          : 'bg-white/10 text-white/50 border border-white/15 hover:bg-white/15 cursor-not-allowed'
                      }`}
                    >
                      {isAdmin ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>دخول المنصة الآن (صلاحية أدمن نشطة)</span>
                          <ArrowLeft className="w-4 h-4 mr-1" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>دخول المنصة (محصور بحسابات الإدارة)</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedPlatform(null)}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl border-white/20 text-white hover:bg-white/10 text-xs"
                    >
                      إغلاق نافذة الخيارات
                    </Button>
                  </div>
                </div>

              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

    </section>
  );
};

export default FuturePlatformsShowcase;
