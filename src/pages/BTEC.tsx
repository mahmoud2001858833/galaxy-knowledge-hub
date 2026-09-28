import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Code, 
  Palette, 
  Briefcase, 
  Cog, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  FolderOpen, 
  Wrench, 
  Lightbulb, 
  Rocket, 
  Cpu, 
  Award, 
  Play,
  GraduationCap
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import SafeBoundary from '@/components/common/SafeBoundary';

const BTECContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'it' | 'engineering' | 'art' | 'business'>('all');

  const fields = [
    {
      id: 'it',
      title: "تكنولوجيا المعلومات",
      subtitle: "Information Technology (IT)",
      icon: Code,
      badge: "المسار التقني الأكثر طلباً",
      description: "منظومة برمجية متكاملة تشمل المساعد البرمجي الذكي، تحويل العمليات الرياضية إلى كود، مصحح الأخطاء، وحاضنة مشاريع الطلبة.",
      color: "from-blue-600 via-indigo-600 to-cyan-600",
      bgSoft: "bg-blue-500/10 dark:bg-blue-950/30",
      borderColor: "border-blue-500/30 hover:border-blue-400",
      mainLink: "/btec/information-technology",
      subLinks: [
        { label: "المساعد البرمجي الذكي", url: "/btec/it/programming", icon: Code },
        { label: "معرض مشاريع الطلبة", url: "/btec/it/student-projects", icon: FolderOpen },
        { label: "مصحح الأكواد بالذكاء الاصطناعي", url: "/btec/it/code-fixer", icon: Wrench },
        { label: "طور هذه المنصة بيدك", url: "/btec/it/build-platform", icon: Rocket },
      ]
    },
    {
      id: 'engineering',
      title: "الهندسة التطبيقية والروبوتات",
      subtitle: "Engineering & Applied Robotics",
      icon: Cog,
      badge: "محاكاة معملية 3D",
      description: "مسار هندسي تطبيقي يركز على الميكاترونكس، حركيات الأذرع الروبوتية، أنظمة التحكم بالـ ROS2، وتجارب الديناميكا ومقاومة المواد.",
      color: "from-amber-600 via-orange-600 to-red-600",
      bgSoft: "bg-orange-500/10 dark:bg-orange-950/30",
      borderColor: "border-orange-500/30 hover:border-orange-400",
      mainLink: "/robotics-section",
      subLinks: [
        { label: "مختبر الروبوتات والـ ROS2", url: "/robotics-section", icon: Cpu },
        { label: "محاكاة الهندسة الميكانيكية", url: "/simulation/mechanical-engineering", icon: Cog },
        { label: "نفق الرياح والديناميكا الهوائية", url: "/simulation/aerodynamics-wind-tunnel", icon: Play },
      ]
    },
    {
      id: 'art',
      title: "الفن والتصميم الرقمي",
      subtitle: "Art & Digital Media Design",
      icon: Palette,
      badge: "إبداع وسائط متعددة",
      description: "صقل المهارات البصرية في التصميم الجرافيكي، النمذجة ثلاثية الأبعاد، تجربة المستخدم (UI/UX)، وتوليد الرسوم بالذكاء الاصطناعي.",
      color: "from-purple-600 via-pink-600 to-rose-600",
      bgSoft: "bg-purple-500/10 dark:bg-purple-950/30",
      borderColor: "border-purple-500/30 hover:border-purple-400",
      mainLink: "/art-design",
      subLinks: [
        { label: "استوديو الفن والتصميم", url: "/art-design", icon: Palette },
        { label: "المكتبة البصرية 3D", url: "/visual-library", icon: Layers },
        { label: "توليد الصور بالذكاء الاصطناعي", url: "/ai-image-generator", icon: Sparkles },
      ]
    },
    {
      id: 'business',
      title: "إدارة الأعمال والريادة",
      subtitle: "Business Management & Entrepreneurship",
      icon: Briefcase,
      badge: "ريادة وإدارة مشاريع",
      description: "تطوير خطط الأعمال (Business Models)، دراسات الجدوى الاقتصادية، مشاريع الاستدامة الخضراء، وإدارة المشاريع المدرسية التنافسية.",
      color: "from-emerald-600 via-teal-600 to-green-700",
      bgSoft: "bg-emerald-500/10 dark:bg-emerald-950/30",
      borderColor: "border-emerald-500/30 hover:border-emerald-400",
      mainLink: "/school-projects",
      subLinks: [
        { label: "حاضنة المشاريع المدرسية", url: "/school-projects", icon: Briefcase },
        { label: "مستشار مشاريع التدوير والاستدامة", url: "/recycling-project-advisor", icon: Lightbulb },
        { label: "منظم ومخطط المهام المتقدم", url: "/study-organization", icon: Layers },
      ]
    }
  ];

  const filteredFields = activeTab === 'all' 
    ? fields 
    : fields.filter(f => f.id === activeTab);

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <SEO 
        title="مسارات بتك BTEC التعليم المهني المتقدم | ذروة العلم"
        description="استكشف مسارات بتك BTEC الأردنية والدولية: تكنولوجيا المعلومات، الهندسة التطبيقية والروبوتات، الفن والتصميم، وإدارة الأعمال."
        keywords="بتك, BTEC, التعليم المهني, Pearson BTEC, تكنولوجيا المعلومات, برمجة, هندسة, روبوتات, فن وتصميم, إدارة أعمال, ذروة العلم"
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <StarField starCount={150} />
      </div>
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 relative z-10 max-w-7xl space-y-8">
        {/* Navigation Breadcrumb & Quick Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <Link to="/education-section" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              قسم التعليم والمسارات
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              مسارات بتك BTEC
            </span>
          </div>

          <Button
            onClick={() => navigate('/education-section')}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 w-fit"
          >
            <GraduationCap className="w-4 h-4 ml-1 rtl:ml-1 rtl:mr-0" />
            <span>عرض منصات التعليم الشامل الـ 14</span>
            <ArrowLeft className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
          </Button>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 end-0 w-96 h-96 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>التعليم التقني والمهني الدولي المعزز (BTEC Pearson Standards)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              مسارات بتك BTEC الأردنية المتقدمة
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              بوابة شاملة ومصممة بأعلى المقاييس لتدريب وتأهيل الطلبة في التخصصات المهنية والتقنية التطبيقية، مدعومة بمختبرات رقمية 3D ومساعدين أذكياء لتصحيح الأكواد وتقييم المشاريع.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">4 مسارات</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تخصصات معتمدة</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100% تطبيقي</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مشاريع وحالات عملية</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">AI CoPilot</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مساعد تصحيح الكود</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">Pearson</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">معايير الاعتماد الدولي</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'default' : 'outline'}
            className="rounded-xl text-xs sm:text-sm font-bold"
          >
            جميع المسارات (4)
          </Button>
          <Button
            onClick={() => setActiveTab('it')}
            variant={activeTab === 'it' ? 'default' : 'outline'}
            className="rounded-xl text-xs sm:text-sm font-bold"
          >
            💻 تكنولوجيا المعلومات
          </Button>
          <Button
            onClick={() => setActiveTab('engineering')}
            variant={activeTab === 'engineering' ? 'default' : 'outline'}
            className="rounded-xl text-xs sm:text-sm font-bold"
          >
            ⚙️ الهندسة والروبوتات
          </Button>
          <Button
            onClick={() => setActiveTab('art')}
            variant={activeTab === 'art' ? 'default' : 'outline'}
            className="rounded-xl text-xs sm:text-sm font-bold"
          >
            🎨 الفن والتصميم
          </Button>
          <Button
            onClick={() => setActiveTab('business')}
            variant={activeTab === 'business' ? 'default' : 'outline'}
            className="rounded-xl text-xs sm:text-sm font-bold"
          >
            💼 إدارة الأعمال والريادة
          </Button>
        </div>

        {/* Main Fields Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredFields.map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.id}
                className={`relative rounded-3xl bg-white dark:bg-slate-900 border ${field.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-6 sm:p-8 hover:-translate-y-1`}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {field.badge}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-1">
                        {field.title}
                      </h2>
                      <div className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {field.subtitle}
                      </div>
                    </div>

                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${field.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {field.description}
                  </p>

                  {/* Sub-tools & Modules Direct Buttons */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      الأدوات والمعامل المدمجة:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {field.subLinks.map((sub, sIdx) => {
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => navigate(sub.url)}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-right group transition-all text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              <SubIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                              <span>{sub.label}</span>
                            </div>
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Action Launcher */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    جاهز للاستخدام الفوري
                  </span>
                  <Button
                    onClick={() => navigate(field.mainLink)}
                    className={`rounded-xl px-5 font-bold shadow-md bg-gradient-to-r ${field.color} hover:opacity-95 text-white`}
                  >
                    دخول المسار الكامل
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global BTEC Quick Launcher Hub */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-purple-900/10 border border-blue-500/20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>حاضنة الإبداع الطلابي المهني</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            هل لديك مشروع برمجي أو هندسي ترغب في رفعه وتقييمه؟
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            ارفع مشروعك في مسار BTEC ليتم مراجعته، الحصول على توصيات الذكاء الاصطناعي، ومشاركته مع مجتمع الطلبة والمعلمين.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate('/btec/it/student-projects')}
              className="rounded-xl px-6 py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <FolderOpen className="w-4 h-4 ml-2" />
              تصفح ورفع مشاريع الطلبة
            </Button>
            <Button
              onClick={() => navigate('/btec/it/code-fixer')}
              variant="outline"
              className="rounded-xl px-6 py-2.5 font-bold border-blue-500/30 text-blue-600 dark:text-blue-400"
            >
              <Wrench className="w-4 h-4 ml-2" />
              فحص الأكواد بالذكاء الاصطناعي
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const BTEC = () => {
  return (
    <SafeBoundary name="BTEC">
      <BTECContent />
    </SafeBoundary>
  );
};

export default BTEC;
