import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Cpu, 
  HeartHandshake, 
  Atom, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Compass, 
  Microscope,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PersonaType = 'school' | 'university' | 'special_ed' | 'educator';

interface PersonaData {
  id: PersonaType;
  title: string;
  role: string;
  badge: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  keyBenefits: string[];
  recommendedDemos: { name: string; route: string; tag: string }[];
  accentColor: string;
  statNumber: string;
  statLabel: string;
}

export const InteractivePersonaTour: React.FC = () => {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<PersonaType>('school');

  const personas: Record<PersonaType, PersonaData> = {
    school: {
      id: 'school',
      title: 'طلبة المدارس والتوجيهي',
      role: 'المرحلة المدرسية والثانوية العامة',
      badge: 'المنهاج الوطني المعتمد',
      icon: GraduationCap,
      headline: 'تحويل المفاهيم الفيزيائية والكيميائية الجافة إلى تجارب حسية حية',
      description: 'وداعاً لحفظ القوانين دون استيعاب! تتيح لك المنصة تجربة المقذوفات، بناء الذرة، تفاعلات الأحماض والقواعد، وحسابات الدوائر الكهربائية مباشرة بيدك مع ربط وثيق بأسئلة المنهاج.',
      keyBenefits: [
        'معايرة القوى ومقاومة الهواء في حركة المقذوفات لحظياً',
        'بناء الذرات وتوليد التوزيع الإلكتروني وقواعد الاستقرار',
        'مساعد ذكي مدرب على منهاج الفيزياء والكيمياء الوطني 24/7'
      ],
      recommendedDemos: [
        { name: 'محاكي المقذوفات 3D', route: '/simulation/projectile-motion', tag: 'فيزياء' },
        { name: 'بناء الذرة والعناصر', route: '/simulation/build-atom', tag: 'كيمياء' },
        { name: 'الموجات والصوتيات', route: '/simulation/waves-sound', tag: 'موجات' }
      ],
      accentColor: 'from-blue-600 to-indigo-600',
      statNumber: '100%',
      statLabel: 'مطابقة للمنهاج الأردني والعربي'
    },
    university: {
      id: 'university',
      title: 'طلبة الجامعات والهندسة',
      role: 'الهندسة، العلوم التطبيقية والـ STEM',
      badge: 'مستوى جامعي متقدم',
      icon: Cpu,
      headline: 'حوسبة متقدمة، ميكانيكا كم، ونمذجة روبوتات حقيقية',
      description: 'معامل حاسوبية فائقة الدقة تحاكي ظواهر الفيزياء الحديثة والنسبية، حل معادلات الحركيات المباشرة والعكسية للأذرع الروبوتية، وتحليل مصفوفات التحويل D-H بلغة Python و ROS 2.',
      keyBenefits: [
        'محاكاة حركيات الأذرع الروبوتية وحساب إحداثيات TCP الدقيقة',
        'استكشاف ميكانيكا الكم، تجربة الشق المزدوج، وحسابات الطيف الذري',
        'بيئة اختبار برمجية متوافقة مع أنظمة ROS 2 و Python'
      ],
      recommendedDemos: [
        { name: 'مختبر الروبوتات والـ AI', route: '/robotics-section', tag: 'هندسة & AI' },
        { name: 'ميكانيكا الكم والنسبية', route: '/simulation/quantum-mechanics', tag: 'فيزياء حديثة' },
        { name: 'بناء الدوائر المتقدم', route: '/simulation/circuit-builder-advanced', tag: 'إلكترونيات' }
      ],
      accentColor: 'from-cyan-600 to-blue-600',
      statNumber: '49+',
      statLabel: 'مختبراً متخصصاً للمرحلة الجامعية'
    },
    special_ed: {
      id: 'special_ed',
      title: 'ذوو الاحتياجات الخاصة (مشروع دامج)',
      role: 'التربية الخاصة والشمولية الرقمية',
      badge: 'معايير W3C / WCAG 2.1 AAA',
      icon: HeartHandshake,
      headline: 'بيئة تعليمية ميسرة بالكامل تلائم كافة القدرات والحواس',
      description: 'أول منظومة تعليمية عربية تدمج تقنيات الرؤية الحاسوبية لترجمة لغة الإشارة فورياً، محاكي بريل اللمسي والصوتي، ومحرك التكيف الحسي للحد من التشتت لطيف التوحد وفرط الحركة ADHD.',
      keyBenefits: [
        'مترجم لغة الإشارة بالكاميرا مع استدلال فوري على جهاز الطالب',
        'نظام تحويل نصوص بريل ثنائي الاتجاه مع ردود فعل اهتزازية Haptic',
        'واجهات تكيفية تخفف التشتت البصري والحسي وفق أحدث المعايير الطبية'
      ],
      recommendedDemos: [
        { name: 'مترجم لغة الإشارة الذكي', route: '/damij/sign', tag: 'رؤية حاسوبية' },
        { name: 'نظام بريل اللمسي والصوتي', route: '/damij/braille', tag: 'وصول بصري' },
        { name: 'التشخيص والتكيف الحسي', route: '/damij/sensory', tag: 'توحد & ADHD' }
      ],
      accentColor: 'from-emerald-600 to-teal-600',
      statNumber: '100%',
      statLabel: 'شمولية رقمية لذوي الإعاقة'
    },
    educator: {
      id: 'educator',
      title: 'المعلمون والباحثون الأكاديميون',
      role: 'إدارة التعليم، التقييم والبحث العلمي',
      badge: 'أدوات القياس المؤسسي',
      icon: Microscope,
      headline: 'أدوات تمكين احترافية لتوليد الاختبارات ومتابعة أداء الطلاب',
      description: 'أدوات ذكية تُتيح للمعلم إنشاء أسئلة قياس وفق مستويات تصنيف بلوم (Bloom)، تصدير سجلات الأداء المخبري، ومستودع بحثي يضم أكثر من 200 مرجع علمي وأكاديمي معتمد.',
      keyBenefits: [
        'توليد فوري لأسئلة المفاهيم والتطبيق والتحليل الرياضي',
        'سجلات أداء رقمية وتصدير نتائج التجارب المخبرية بدقة',
        'المكتبة البحثية الشاملة والمصادر الموثقة للاعتماد الأكاديمي'
      ],
      recommendedDemos: [
        { name: 'المكتبة العلمية والمصادر', route: '/damij/sources', tag: '200+ مرجع' },
        { name: 'منظم المذاكرة والخطط', route: '/study-organization', tag: 'تخطيط' },
        { name: 'مركز التحكم والتقييم', route: '/control-center', tag: 'لوحة قياس' }
      ],
      accentColor: 'from-purple-600 to-pink-600',
      statNumber: '200+',
      statLabel: 'مرجعاً ووثيقة علمية محكمة'
    }
  };

  const current = personas[activePersona];

  return (
    <section className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-900">
          <UserCheck className="w-3.5 h-3.5" />
          <span>مسارات التجربة المخصصة | Tailored User Journeys</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          اختر مسارك التعليمي واستكشف ما تقدمه المنصة لك
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          صُممت منظومة ذروة العلم لتلبي متطلبات كل فئة معرفية بأدوات مصممة خصيصاً لتحقيق أعلى درجات الأثر التعليمي والتطبيقي.
        </p>
      </div>

      {/* Persona Selector Tabs (Fluid Mobile Scroll & Desktop Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
        {(Object.keys(personas) as PersonaType[]).map((key) => {
          const p = personas[key];
          const Icon = p.icon;
          const isActive = activePersona === key;
          return (
            <button
              key={key}
              onClick={() => setActivePersona(key)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-right transition-all duration-200 flex flex-col justify-between gap-3 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-102'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {p.badge}
                </span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black leading-snug">{p.title}</div>
                <div className={`text-[11px] mt-0.5 font-normal truncate ${isActive ? 'text-slate-200 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                  {p.role}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Persona Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePersona}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.04)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (Information & Benefits) */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="space-y-2">
                <Badge variant="outline" className="border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 font-bold">
                  {current.role}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {current.headline}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed pt-1">
                  {current.description}
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5 pt-1">
                {current.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button
                  onClick={() => navigate('/experiments-section')}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs px-5 py-2.5 shadow-sm"
                >
                  <span>استكشف تجارب هذا المسار</span>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/damij')}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2.5"
                >
                  <span>حلول الشمولية والتربية الخاصة</span>
                </Button>
              </div>
            </div>

            {/* Right Column (Tailored Demos Showcase) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-5">
                
                {/* Metric Header */}
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {current.statNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {current.statLabel}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                {/* Recommended Simulations List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block text-right uppercase tracking-wider">
                    أهم المعامل الموصى بها لهذا المسار:
                  </span>
                  {current.recommendedDemos.map((demo, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(demo.route)}
                      className="group cursor-pointer p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center justify-between shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {demo.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-slate-500 font-medium border-slate-200 dark:border-slate-700">
                        {demo.tag}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    جميع التجارب تعمل مباشرة عبر المتصفح دون تثبيت برامج خارجية
                  </span>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default InteractivePersonaTour;
