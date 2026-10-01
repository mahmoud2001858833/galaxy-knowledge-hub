import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Leaf, 
  Calculator, 
  School, 
  Home, 
  BarChart3, 
  Users, 
  Recycle, 
  Brain, 
  Sparkles, 
  Sun, 
  Droplets, 
  Wind, 
  Globe2, 
  TreePine, 
  CheckCircle2, 
  Flame, 
  Award, 
  ArrowLeft, 
  Compass, 
  Activity, 
  Target, 
  ChevronRight, 
  RotateCcw, 
  Lightbulb, 
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  Zap,
  Waves
} from 'lucide-react';
import heroImage from '@/assets/environmental-hero.jpg';

interface EcoChallenge {
  id: string;
  title: string;
  category: 'energy' | 'water' | 'waste' | 'food' | 'nature';
  points: number;
  description: string;
  impact: string;
}

const DAILY_CHALLENGES: EcoChallenge[] = [
  {
    id: 'c1',
    title: 'إطفاء الشواحن والإنارة غير المستخدمة',
    category: 'energy',
    points: 15,
    description: 'افصل شواحن الهواتف والحاسوب وأطفئ الأضواء عند مغادرة الغرفة أو الفصل.',
    impact: 'يوفر حوالي 0.3 كجم من انبعاثات CO₂ يومياً.'
  },
  {
    id: 'c2',
    title: 'استخدام مطرة ماء شخصية قابلة لإعادة التعبئة',
    category: 'waste',
    points: 20,
    description: 'تجنب شراء عبوات المياه البلاستيكية أحادية الاستخدام طوال اليوم الدراسي.',
    impact: 'يمنع هدر 3 عبوات بلاستيكية ويحفظ 150 لتر ماء تصنيعي.'
  },
  {
    id: 'c3',
    title: 'فرز النفايات في الحاويات المخصصة',
    category: 'waste',
    points: 25,
    description: 'افصل الورق والكرتون عن البلاستيك والمعادن في مدرستك أو منزلك.',
    impact: 'يساهم في دعم الاقتصاد الدائري وتقليل طمر النفايات.'
  },
  {
    id: 'c4',
    title: 'الاستحمام السريع بأقل من 5 دقائق',
    category: 'water',
    points: 20,
    description: 'قلل وقت الاستحمام وأغلق الصنبور أثناء فرك الصابون أو تنظيف الأسنان.',
    impact: 'يوفر ما يزيد عن 45 لتراً من المياه العذبة الصالحة للشرب.'
  },
  {
    id: 'c5',
    title: 'وجبة نباتية وتصفير هدر الطعام',
    category: 'food',
    points: 30,
    description: 'تناول وجبة غنية بالبقوليات والخضار وتناول كل ما في طبقك دون إلقاء بقايا.',
    impact: 'يخفض البصمة الكربونية للوجبة بنسبة 40% ويقلل غاز الميثان.'
  },
  {
    id: 'c6',
    title: 'رعاية وسقاية نبتة أو شجرة محلية',
    category: 'nature',
    points: 35,
    description: 'اسقِ نبتة في حديقة المدرسة أو شرفتك باستخدام مياه غير مهدورة.',
    impact: 'يمتص الكربون ويعزز الغطاء النباتي والتنوع الحيوي.'
  },
  {
    id: 'c7',
    title: 'المشي أو استخدام النقل التشاركي',
    category: 'energy',
    points: 25,
    description: 'اذهب للمدرسة سيراً على الأقدام، بالدراجة، أو بالحافلة المدرسية التشاركية.',
    impact: 'يقلل انبعاثات عوادم السيارات وازدحام الطرقات.'
  },
  {
    id: 'c8',
    title: 'نشر فكرة وسلوك بيئي بين الزملاء',
    category: 'nature',
    points: 20,
    description: 'شارك نصيحة بيئية أو مشروعاً مدرسياً مع زملائك في الفصل أو العائلة.',
    impact: 'يضاعف الأثر البيئي الإيجابي بنشر الوعي الجمعي.'
  }
];

const UN_SDGS = [
  {
    goal: 6,
    title: 'المياه النظيفة والنظافة الصحية',
    english: 'Clean Water & Sanitation',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/30',
    icon: Droplets,
    target: 'حماية وإعادة تأهيل النظم البيئية المتصلة بالمياه، وترشيد استهلاك المياه في المدارس الأردنية بنسبة 30% بحلول 2030.',
    action: 'مشاريع الحصاد المائي المدرسي وتركيب مرشدات التدفق الذكية.'
  },
  {
    goal: 7,
    title: 'طاقة نظيفة وبأسعار معقولة',
    english: 'Affordable & Clean Energy',
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-amber-500/30',
    icon: Sun,
    target: 'زيادة حصة الطاقة المتجددة (الشمسية والرياح) في المزيج الوطني وتحسين كفاءة استهلاك الطاقة الكهربائية.',
    action: 'محاكاة الألواح الكهروضوئية وحساب إنتاج الطاقة النظيفة لأسطح المدارس.'
  },
  {
    goal: 11,
    title: 'مدن ومجتمعات محلية مستدامة',
    english: 'Sustainable Cities & Communities',
    color: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-500/30',
    icon: Home,
    target: 'جعل المدن والمستوطنات البشرية شاملة وآمنة وقادرة على الصمود ومستدامة بيئياً.',
    action: 'مشاريع النقل الجماعي الصديق للبيئة والتخطيط الحضري الأخضر.'
  },
  {
    goal: 12,
    title: 'الاستهلاك والإنتاج المسؤولان',
    english: 'Responsible Consumption & Production',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30',
    icon: Recycle,
    target: 'الحد من توليد النفايات من خلال المنع والتقليل وإعادة التدوير وإعادة الاستخدام بحلول 2030.',
    action: 'تطبيق مبادئ الاقتصاد الدائري وتحويل النفايات العضوية المدرسية إلى كمبوست.'
  },
  {
    goal: 13,
    title: 'العمل المناخي',
    english: 'Climate Action',
    color: 'from-green-600 to-emerald-700',
    borderColor: 'border-green-500/30',
    icon: Globe2,
    target: 'اتخاذ إجراءات عاجلة لمكافحة تغير المناخ وتداعياته، وبناء الوعي المناخي في المناهج التعليمية.',
    action: 'حساب ورصد البصمة الكربونية وتطبيق سيناريوهات خفض الانبعاثات بالذكاء الاصطناعي.'
  },
  {
    goal: 14,
    title: 'الحياة تحت الماء',
    english: 'Life Below Water',
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/30',
    icon: Waves,
    target: 'حفظ المحيطات والبحار والموارد البحرية وحماية خليج العقبة من التلوث البلاستيكي.',
    action: 'حملات تنظيف الشواطئ المائية ومراقبة جودة المياه بالمستشعرات.'
  },
  {
    goal: 15,
    title: 'الحياة في البر والتنوع الحيوي',
    english: 'Life on Land',
    color: 'from-emerald-600 to-lime-600',
    borderColor: 'border-lime-500/30',
    icon: TreePine,
    target: 'حماية النظم الإيكولوجية البرية ومكافحة التصحر ووقف تدهور الأراضي وفقدان التنوع البيولوجي.',
    action: 'مشاريع الزراعة الحرجية المدرسية ومكافحة الجفاف بالنباتات المحلية.'
  }
];

export const EnvironmentalSustainability: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'portals' | 'calculator' | 'sdgs' | 'challenges' | 'ai-advisor'>('portals');

  // Eco Challenges State
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({
    c1: true,
    c2: true
  });

  const toggleChallenge = (id: string, title: string, pts: number) => {
    setCompletedChallenges(prev => {
      const nextState = !prev[id];
      if (nextState) {
        toast({
          title: '🎉 أحسنت صنعاً! سلوك بيئي رائع',
          description: `حصلت على +${pts} نقطة بيئية: ${title}`
        });
      }
      return { ...prev, [id]: nextState };
    });
  };

  const totalPoints = Object.keys(completedChallenges)
    .filter(id => completedChallenges[id])
    .reduce((acc, id) => {
      const ch = DAILY_CHALLENGES.find(c => c.id === id);
      return acc + (ch ? ch.points : 0);
    }, 0);

  // Quick Interactive Eco-Calculator State
  const [calcElectricity, setCalcElectricity] = useState(250); // kWh/month
  const [calcCarKm, setCalcCarKm] = useState(120); // km/week
  const [calcMeatMeals, setCalcMeatMeals] = useState(4); // meals/week
  const [calcShowerMinutes, setCalcShowerMinutes] = useState(8); // minutes/day

  // Emissions calculation (approximate standard coefficients)
  // Electricity: ~0.53 kg CO2/kWh
  // Car: ~0.17 kg CO2/km
  // Meat: ~3.5 kg CO2/meal
  // Shower water: ~0.15 kg CO2/min heating
  const annualElectricityCO2 = (calcElectricity * 12 * 0.53) / 1000; // Tons
  const annualCarCO2 = (calcCarKm * 52 * 0.17) / 1000; // Tons
  const annualMeatCO2 = (calcMeatMeals * 52 * 3.5) / 1000; // Tons
  const annualWaterCO2 = (calcShowerMinutes * 365 * 0.15) / 1000; // Tons

  const totalAnnualCO2 = Number((annualElectricityCO2 + annualCarCO2 + annualMeatCO2 + annualWaterCO2).toFixed(2));
  // Average mature tree absorbs ~22 kg CO2 per year = 0.022 tons
  const treesNeeded = Math.ceil(totalAnnualCO2 / 0.022);

  // AI Advisor Questions & Answers
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const AI_ECO_PROMPTS = [
    {
      q: 'كيف نؤسس نظام فرز ذكي للنفايات في مدرستنا بالذكاء الاصطناعي؟',
      a: 'يمكن للطلبة دمج كاميرا صغيرة مع نموذج YOLO للرؤية الحاسوبية على لوحة Raspberry Pi لرصد نوع المادة (بلاستيك، ورق، ألمنيوم) وفتح الغطاء الميكانيكي المناسب تلقائياً بواسطة محرك سيرفو، مع لوحة بيانات شاشة تعرض وزن المواد المفروزة والنقاط المحصلة.'
    },
    {
      q: 'ما هي أنسب النباتات المحلية للزراعة في حديقة المدرسة بالأردن لترشيد المياه؟',
      a: 'تعتبر أشجار الزيتون، البلوط، الخروب، والبطم، بالإضافة إلى الشجيرات العطرية مثل الميرمية، الزعتر، والروزماري (إكليل الجبل) من أفضل الخيارات؛ لأنها متكيفة طبيعياً مع المناخ الجاف وتحتاج كميات ري ضئيلة جداً بعد تثبيت جذورها.'
    },
    {
      q: 'كيف نقيس البصمة المائية لكافتيريا المدرسة ونقلل الهدر؟',
      a: 'تبدأ العملية بحصر الأطعمة المقدمة: فالبرغر الحيواني يتطلب نحو 2400 لتر ماء غير مباشر، بينما ساندويش الفلافل أو الحمص يستهلك أقل من 200 لتر. إدخال خيارات نباتية محلية وتثبيت مرشدات صنبور يوفر آلاف اللترات أسبوعياً.'
    },
    {
      q: 'كيف نحول بقايا الطعام المدرسية إلى سماد عضوي عالي الجودة (Composting)؟',
      a: 'يتم تطبيق نسبة (2 إلى 1) بين المواد البنية الغنية بالكربون (أوراق شجر جافة، كرتون ممزق) والمواد الخضراء الغنية بالنيتروجين (بقايا خضار وفواكه الكافتيريا)، مع التقليب الدوري لضمان التهوية والحرارة التي تقضي على مسببات الأمراض خلال 6-8 أسابيع.'
    }
  ];

  const portals = [
    {
      title: 'حاسبة البصمة الكربونية المتقدمة',
      subtitle: 'Carbon Footprint Calculator',
      description: 'حساب دقيق وشامل للانبعاثات الكربونية الناتجة عن استهلاك الكهرباء، الماء، والمواصلات الجوية والبرية وفق بروتوكول GHG العالمي.',
      icon: Calculator,
      color: 'from-blue-600 to-cyan-600',
      badge: 'بروتوكول GHG',
      link: '/environmental/carbon-calculator'
    },
    {
      title: 'مؤشر الاستدامة الشخصي التفاعلي',
      subtitle: 'Personal Sustainability Index',
      description: 'اختبار شامل من 30 معياراً يولد مخطط راداري ومقارنات عالمية وتوصيات ذكية مع إمكانية تصدير تقرير رسمي PDF.',
      icon: BarChart3,
      color: 'from-emerald-600 to-teal-600',
      badge: 'مخطط راداري',
      link: '/environmental/personal-sustainability-index'
    },
    {
      title: 'المشاريع البيئية المدرسية الخضراء',
      subtitle: 'Green School Initiatives',
      description: 'دليل عملي لعشرة مشاريع مدرسية تطبيقية: الحصاد المائي، زراعة الأسطح، الطاقة الشمسية، ومعارض الفن البيئي وإعادة التدوير.',
      icon: School,
      color: 'from-green-600 to-emerald-600',
      badge: '10 مشاريع معتمدة',
      link: '/environmental/school-projects'
    },
    {
      title: 'مشاريع الاستدامة المنزلية والترشيد',
      subtitle: 'Eco Home & Resource Optimization',
      description: 'أفكار هندسية وخطوات عملية لتقليل فواتير الطاقة والماء المنزلية، فرز النفايات من المصدر، وصناعة منتجات صديقة للبيئة.',
      icon: Home,
      color: 'from-purple-600 to-pink-600',
      badge: 'توفير فواتير',
      link: '/environmental/home-projects'
    },
    {
      title: 'خبير إعادة التدوير الذكي (AI Recycling)',
      subtitle: 'Smart Circular Economy Advisor',
      description: 'مستشار ذكي يحول النفايات الصلبة ومخلفات التصنيع إلى أدوات تعليمية ومشاريع ريادية بأقل التكاليف عبر الذكاء الاصطناعي.',
      icon: Recycle,
      color: 'from-cyan-600 to-teal-600',
      badge: 'ذكاء اصطناعي',
      link: '/environmental/recycling-advisor'
    },
    {
      title: 'أداة التنبؤ البيئي واستشراف المناخ',
      subtitle: 'Eco-Predict Climate AI',
      description: 'نمذجة بيانية بالذكاء الاصطناعي لاستشراف الأثر المناخي المستقبلي، توقع درجات الحرارة وتوفير الانبعاثات وفق سياسات الاستدامة.',
      icon: Brain,
      color: 'from-indigo-600 to-blue-600',
      badge: 'استشراف 2030',
      link: '/environmental/eco-predict'
    },
    {
      title: 'معرض أبحاث ومشاريع الطلاب البيئية',
      subtitle: 'Student Environmental Showcase',
      description: 'منصة لتوثيق ونشر ابتكارات الطلبة في مجالات البيئة والطاقة النظيفة، ومشاركتها مع المدارس والمعارض الوطنية.',
      icon: Users,
      color: 'from-amber-600 to-orange-600',
      badge: 'مجتمع الطلبة',
      link: '/environmental/student-projects'
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white relative selection:bg-emerald-600 selection:text-white dark:selection:bg-emerald-500 dark:selection:text-slate-950 transition-colors duration-300 font-sans" 
      dir={dir}
    >
      <SEO
        title="بوابة الاستدامة البيئية والعمل المناخي | ذروة العلم 2.0"
        description="المنظومة الوطنية الأردنية للتربية البيئية والاستدامة 2.0: حاسبة البصمة الكربونية، مشاريع المدارس الخضراء، مؤشر الاستدامة الشخصي، وأهداف التنمية المستدامة (SDGs)."
        keywords="الاستدامة البيئية, البصمة الكربونية, أهداف التنمية المستدامة, SDGs, مشاريع بيئية مدرسية, إعادة التدوير, ذروة العلم, الأردن"
      />

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            بوابة الاستدامة البيئية والعمل المناخي 2.0
          </span>
        </div>

        {/* Hero Banner matching Homepage Visual Identity */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-emerald-950/50 shadow-md dark:shadow-emerald-950/20">
          {/* Subtle architectural dot matrix */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-15"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.25) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/25">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>المنظومة الوطنية للتربية البيئية والاستدامة 2.0</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                بوابة الاستدامة البيئية والعمل المناخي
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                منصة تعليمية وتطبيقية متكاملة لتمكين الطلبة والمدارس من رصد الانبعاثات، تطبيق مشاريع الاقتصاد الدائري، وإتقان أهداف التنمية المستدامة (UN SDGs) عبر المحاكاة الذكية وأدوات الذكاء الاصطناعي.
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 px-2.5 py-1 text-xs shadow-xs">
                  <Globe2 className="w-3.5 h-3.5 ml-1.5 text-emerald-500" /> 17 هدفاً أممياً SDGs
                </Badge>
                <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/40 px-2.5 py-1 text-xs shadow-xs">
                  <Calculator className="w-3.5 h-3.5 ml-1.5 text-blue-500" /> حاسبة كربون دقيقة GHG
                </Badge>
                <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/40 px-2.5 py-1 text-xs shadow-xs">
                  <TreePine className="w-3.5 h-3.5 ml-1.5 text-teal-500" /> مكافئ تعويض الأشجار
                </Badge>
                <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 px-2.5 py-1 text-xs shadow-xs">
                  <Recycle className="w-3.5 h-3.5 ml-1.5 text-purple-500" /> خبير التدوير الذكي
                </Badge>
                <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 px-2.5 py-1 text-xs shadow-xs">
                  <School className="w-3.5 h-3.5 ml-1.5 text-amber-500" /> +20 مشروعاً معتمداً
                </Badge>
              </div>
            </div>

            <div className="lg:col-span-5 h-52 sm:h-64 lg:h-full relative overflow-hidden flex items-center justify-center p-4">
              <img
                src={heroImage}
                alt="Environmental Sustainability"
                className="w-full h-full object-cover object-center rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Navigation Deck Bar (Matching Homepage Tabs) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-emerald-500/30 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  منصة استكشاف مسارات الاستدامة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اختر من الأقسام التفاعلية أدناه: المحاكيات، الحاسبة الفورية، أهداف SDGs، أو تحديات الطلبة اليومية
                </p>
              </div>
            </div>

            {/* Quick Points Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">نقاطك البيئية:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {totalPoints} نقطة
              </span>
            </div>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab('portals')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeTab === 'portals'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-transparent'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>دليل البوابات والمحاكيات (7)</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-transparent'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>الحاسبة الفورية السريعة (Live Eco-Meter)</span>
            </button>

            <button
              onClick={() => setActiveTab('sdgs')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeTab === 'sdgs'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-transparent'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>أهداف التنمية المستدامة (UN SDGs)</span>
            </button>

            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeTab === 'challenges'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-transparent'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تحديات الاستدامة اليومية للطلبة</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeTab === 'ai-advisor'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>المستشار البيئي الذكي (AI Advisor)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PORTALS BENTO GRID */}
        {activeTab === 'portals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portals.map((portal, index) => {
                const Icon = portal.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => navigate(portal.link)}
                      className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all rounded-3xl overflow-hidden h-full flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 sm:p-6 pb-2">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${portal.color} text-white flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge variant="outline" className="text-[11px] font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {portal.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {portal.title}
                        </CardTitle>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block">
                          {portal.subtitle}
                        </span>
                      </CardHeader>

                      <CardContent className="p-5 sm:p-6 pt-2 space-y-4">
                        <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {portal.description}
                        </CardDescription>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform">
                            <span>دخول المنصة</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-slate-400 text-[11px]">مختبر تفاعلي</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE QUICK ECO-METER CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    <span>حاسبة الانبعاثات البيئية الفورية (Live Eco-Meter)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    حرك المؤشرات لتعديل نمط استهلاكك المنزلي والمدرسي وشاهد الأثر الفوري على الانبعاثات وعدد الأشجار اللازمة للتعويض
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCalcElectricity(250);
                    setCalcCarKm(120);
                    setCalcMeatMeals(4);
                    setCalcShowerMinutes(8);
                  }}
                  className="rounded-xl text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة ضبط
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sliders Area (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Slider 1: Electricity */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        استهلاك الكهرباء الشهري:
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {calcElectricity} ك.و.س / شهر
                      </span>
                    </div>
                    <Slider
                      value={[calcElectricity]}
                      min={50}
                      max={800}
                      step={10}
                      onValueChange={vals => setCalcElectricity(vals[0])}
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>ترشيد عالٍ (50 kWh)</span>
                      <span>متوسط منزلي</span>
                      <span>استهلاك مرتفع (800 kWh)</span>
                    </div>
                  </div>

                  {/* Slider 2: Car travel */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-blue-500" />
                        المسافة المقطوعة بالسيارة أسبوعياً:
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {calcCarKm} كم / أسبوع
                      </span>
                    </div>
                    <Slider
                      value={[calcCarKm]}
                      min={0}
                      max={500}
                      step={10}
                      onValueChange={vals => setCalcCarKm(vals[0])}
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>0 كم (مشي / دراجة)</span>
                      <span>استخدام معتدل</span>
                      <span>500 كم</span>
                    </div>
                  </div>

                  {/* Slider 3: Meat consumption */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-500" />
                        عدد الوجبات المحتوية على لحم أحمر:
                      </span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {calcMeatMeals} وجبات / أسبوع
                      </span>
                    </div>
                    <Slider
                      value={[calcMeatMeals]}
                      min={0}
                      max={14}
                      step={1}
                      onValueChange={vals => setCalcMeatMeals(vals[0])}
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>نباتي بالكامل (0)</span>
                      <span>نظام متوسط</span>
                      <span>14 وجبة</span>
                    </div>
                  </div>

                  {/* Slider 4: Shower duration */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        مدة الاستحمام اليومي بالماء الساخن:
                      </span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                        {calcShowerMinutes} دقائق / يوم
                      </span>
                    </div>
                    <Slider
                      value={[calcShowerMinutes]}
                      min={2}
                      max={25}
                      step={1}
                      onValueChange={vals => setCalcShowerMinutes(vals[0])}
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>دقيقتان (ترشيد فائق)</span>
                      <span>8 دقائق</span>
                      <span>25 دقيقة</span>
                    </div>
                  </div>
                </div>

                {/* Live Real-time Results Card (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 border-2 border-emerald-500/30 text-center space-y-5 shadow-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <Target className="w-3.5 h-3.5" />
                    <span>معدل الانبعاثات السنوية التقديرية</span>
                  </div>

                  <div>
                    <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight block">
                      {totalAnnualCO2}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      طن ثاني أكسيد الكربون (t CO₂e) سنوياً
                    </span>
                  </div>

                  {/* Offset Metric: Trees */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <TreePine className="w-5 h-5" />
                      <span className="font-black text-xl font-mono">{treesNeeded} شجرة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      عدد الأشجار التي يحتاجها كوكب الأرض لامتصاص انبعاثاتك السنوية بالكامل.
                    </p>
                  </div>

                  {/* Benchmark Comparison */}
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>معدل الفرد في الأردن:</span>
                      <span className="font-mono font-bold text-blue-600">3.1 طن</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>هدف اتفاقية باريس للمناخ:</span>
                      <span className="font-mono font-bold text-emerald-600">2.0 طن</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/environmental/carbon-calculator')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    فتح الحاسبة التفصيلية الكاملة ←
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UN SDGS MATRIX */}
        {activeTab === 'sdgs' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-emerald-600" />
                  <span>مصفوفة أهداف التنمية المستدامة للأمم المتحدة (UN SDGs 2030)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  استكشف الأهداف البيئية والمناخية المرتبطة بالمناهج الدراسية ومبادرات المدارس الخضراء
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {UN_SDGS.map(sdg => {
                  const Icon = sdg.icon;
                  return (
                    <div
                      key={sdg.goal}
                      className={`p-5 rounded-3xl border ${sdg.borderColor} bg-slate-50/60 dark:bg-slate-950/60 space-y-3 relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-black text-sm shadow-md`}>
                          #{sdg.goal}
                        </div>
                        <Icon className="w-5 h-5 text-slate-400" />
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {sdg.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {sdg.english}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <strong className="text-slate-900 dark:text-white block text-[11px] mb-0.5">الغاية الوطنية 2030:</strong>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{sdg.target}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                          <strong>المشروع المدرسي المقترح:</strong> {sdg.action}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DAILY ECO CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تحديات الاستدامة اليومية للطلبة (Daily Green Habits)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    حدد المهام البيئية التي أنجزتها اليوم واجمع النقاط لتثبيت سلوكيات الاستدامة العملية
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block font-semibold">مجموع النقاط المحققة</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {totalPoints} / {DAILY_CHALLENGES.reduce((a, b) => a + b.points, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DAILY_CHALLENGES.map(ch => {
                  const isDone = !!completedChallenges[ch.id];
                  return (
                    <div
                      key={ch.id}
                      onClick={() => toggleChallenge(ch.id, ch.title, ch.points)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isDone
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs sm:text-sm font-bold ${isDone ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                            {ch.title}
                          </h4>
                          <Badge variant="outline" className={`text-[10px] font-mono ${isDone ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 text-slate-500'}`}>
                            +{ch.points} نقطة
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {ch.description}
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                          🌿 الأثر: {ch.impact}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI ECO ADVISOR */}
        {activeTab === 'ai-advisor' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>المستشار البيئي الذكي التفاعلي 2.0</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  استشارات الاستدامة بالذكاء الاصطناعي للمدارس والمنازل
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  اختر أحد التساؤلات البيئية الشائعة لاستعراض الإرشادات الهندسية والخطوات المباشرة للتطبيق
                </p>
              </div>

              {/* Prompt selection buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {AI_ECO_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPrompt(item.q)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                      selectedPrompt === item.q
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${selectedPrompt === item.q ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-bold leading-relaxed">{item.q}</span>
                  </button>
                ))}
              </div>

              {/* Answer Presentation Box */}
              {selectedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-slate-950 dark:to-emerald-950/30 border border-emerald-300 dark:border-emerald-800/40 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>توصية المستشار البيئي الذكي:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {AI_ECO_PROMPTS.find(p => p.q === selectedPrompt)?.a}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EnvironmentalSustainability;