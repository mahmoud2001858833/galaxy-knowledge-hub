import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Atom, 
  Cpu, 
  HeartHandshake, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Radar, 
  Eye, 
  Code2, 
  ShieldCheck, 
  FileText,
  Stethoscope,
  Puzzle,
  Leaf,
  MessageSquare,
  Calculator,
  FlaskConical,
  Dna
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import simulationsBg from '@/assets/simulations-3d-section.jpg';
import roboticsBg from '@/assets/robotics-ai-section.jpg';
import educationBg from '@/assets/education-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';
import sourcesLibraryBg from '@/assets/sources-library-section.jpg';

interface EcosystemItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'stem' | 'ai' | 'btec' | 'skills' | 'academic' | 'educational';
  badge: string;
  description: string;
  image: string;
  icon: React.ElementType;
  highlights: string[];
  link: string;
  metrics: string;
}

export const EcosystemBentoGrid: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'educational' | 'academic' | 'stem' | 'ai' | 'btec' | 'skills'>('all');

  const items: EcosystemItem[] = [
    {
      id: 'labs',
      title: 'المختبرات والمحاكاة 3D',
      subtitle: 'مختبرات فيزيائية وكيميائية وبيولوجية تفاعلية',
      category: 'stem',
      badge: '49 مختبراً معتمداً',
      description: 'نماذج محاكاة رقمية فائقة الدقة تشمل ميكانيكا الكم، كريسبر، النسبية، والثقوب السوداء مع تحكم فيزيائي فوري وتصدير قياسات.',
      image: simulationsBg,
      icon: Atom,
      highlights: ['النسبية وميكانيكا الكم', 'تعديل الجينات كريسبر', 'الثقوب السوداء والدوائر'],
      link: '/experiments-section',
      metrics: 'دقة حسابية 99.8%'
    },
    {
      id: 'robotics',
      title: 'الروبوتات والذكاء الاصطناعي 2.0',
      subtitle: 'حركيات الأذرع الروبوتية، أنظمة ROS2 والـ LiDAR',
      category: 'ai',
      badge: 'هندسة & AI 2.0',
      description: 'بيئة هندسية تحاكي حركيات الأذرع الروبوتية المتقدمة (Kinematics)، أجهزة استشعار LiDAR، وبرمجة متحكمات ROS2 بلغة Python.',
      image: roboticsBg,
      icon: Cpu,
      highlights: ['حركيات الأذرع 6-DOF', 'برمجة ROS2 و Python', 'ملاحة 360° LiDAR'],
      link: '/robotics-section',
      metrics: '208 FPS استدلال'
    },
    {
      id: 'education',
      title: 'التعليم الشامل ومسارات BTEC المهنية',
      subtitle: 'المناهج العلمية والتقنية المعتمدة دولياً',
      category: 'btec',
      badge: 'معايير Pearson الدولية',
      description: 'مسارات متكاملة للمناهج المدرسية، مناهج BTEC الدولية لتكنولوجيا المعلومات والبرمجة، الفن والتصميم، وإدارة المشاريع.',
      image: educationBg,
      icon: GraduationCap,
      highlights: ['تكنولوجيا المعلومات والبرمجة', 'الهندسة والروبوتات الميكانيكية', 'الفن والتصميم الرقمي'],
      link: '/education-section',
      metrics: 'معايير Pearson'
    },
    {
      id: 'assistant',
      title: 'المرشد الذكي والذكاء الاصطناعي',
      subtitle: 'دعم أكاديمي ونفسي موجه بنماذج Gemini المتطورة',
      category: 'ai',
      badge: 'مساعد فوري 24/7',
      description: 'مركز ذكاء اصطناعي شامل: المرشد النفسي لتنظيم القلق والتنفس الصندوقي، فلك المعرفة للعلوم، ومساعد تصحيح الأكواد والحلول.',
      image: aiAssistantBg,
      icon: Sparkles,
      highlights: ['المرشد النفسي وتنظيم القلق', 'فلك المعرفة والفيزياء', 'مصحح الأكواد بالذكاء الاصطناعي'],
      link: '/ai-assistant-section',
      metrics: 'دعم متعدد الوسائط'
    },
    {
      id: 'medical',
      title: 'المساعد الطبي المدرسي وطوارئ المدارس',
      subtitle: 'دليل تفاعلي للتعامل مع الإسعافات والحالات المدرسية',
      category: 'skills',
      badge: 'بروتوكولات طوارئ فورية',
      description: 'نظام فحص فوري بالكاميرا وإرشادات مباشرة ليعرف الطلاب والمعلمون كيفية التصرف مع حالات الرعاف، الإغماء، الجروح، والتشنجات.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      icon: Stethoscope,
      highlights: ['فحص فوري بالكاميرا', 'إرشادات واضحة للطلاب والمعلمين', 'أرقام الطوارئ السريعة'],
      link: '/medical-assistant',
      metrics: 'استجابة إسعافية فورية'
    },
    {
      id: 'puzzles',
      title: 'بنك ودوري الألغاز والتحديات الفكرية',
      subtitle: 'تحديات تنافسية وألغاز ذكاء في الرياضيات والعلوم',
      category: 'skills',
      badge: 'أوسمة وتحديات يومية',
      description: 'مسابقات فكرية مشوقة لتنمية مهارات التفكير العليا وحل المسائل في الرياضيات، الفيزياء، والكيمياء مع نظام نقاط ولوحة شرف.',
      image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80',
      icon: Puzzle,
      highlights: ['ألغاز رياضية ومنطقية', 'لوحة صدارة الأبطال', 'نقاط خبرة وأوسمة تميز'],
      link: '/subject-puzzles',
      metrics: '120+ لغزاً تفاعلياً'
    },
    {
      id: 'sustainability',
      title: 'الاستدامة البيئية والطاقة البديلة',
      subtitle: 'حساب البصمة الكربونية ومشاريع التدوير الخضراء',
      category: 'stem',
      badge: 'مبادرة الاستدامة الخضراء',
      description: 'منظومة تفاعلية لحساب البصمة الكربونية الشخصية والمدرسية، أفكار مشاريع إعادة التدوير، ونماذج محاكاة الطاقة الشمسية والرياح.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      icon: Leaf,
      highlights: ['حاسبة البصمة الكربونية', 'مشاريع إعادة التدوير المدرسية', 'محاكاة الطاقة المتجددة'],
      link: '/environmental-sustainability',
      metrics: 'مؤشر أثر بيئي حقيقي'
    },
    {
      id: 'literary',
      title: 'المنصات الأدبية واللغوية التفاعلية',
      subtitle: 'إتقان اللغة العربية والإنجليزية بتمارين ذكية',
      category: 'skills',
      badge: 'اللغات والآداب',
      description: 'تدريبات تفاعلية في النحو، الإعراب، البلاغة، وتراكيب اللغة الإنجليزية مصممة بأسلوب عصري يعزز الفصاحة اللغوية.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
      icon: BookOpen,
      highlights: ['قواعد النحو والإعراب التفاعلي', 'تحليل النصوص الأدبية', 'تدريبات اللغة الإنجليزية'],
      link: '/literary-platforms',
      metrics: 'مناهج لغوية معتمدة'
    },
    {
      id: 'forum',
      title: 'منتدى مجتمع الطلبة والتعلم التشاركي',
      subtitle: 'بيئة حوارية أكاديمية للتفاعل وحل المعضلات الدراسية',
      category: 'skills',
      badge: 'مجتمع أكاديمي نشط',
      description: 'مساحة تفاعلية لتبادل التلخيصات الدراسية، مناقشة المسائل الصعبة مع الزملاء، والاستفادة من إرشادات وتوجيهات المعلمين.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      icon: MessageSquare,
      highlights: ['غرف نقاش علمية تخصصية', 'مشاركة الملاحظات والملخصات', 'إشراف أكاديمي مباشر'],
      link: '/student-community-forum',
      metrics: 'تفاعل طلابي مستمر'
    },
    // Educational Subject Platforms (Math, Chemistry, Biology, Physics)
    {
      id: 'math-platform',
      title: 'منصة الرياضيات',
      subtitle: 'الهندسة الفضائية 3D، حساب التفاضل والتكامل، والتحليل البياني',
      category: 'educational',
      badge: 'منهاج وزاري متقدم',
      description: 'بيئة تفاعلية متكاملة لدراسة الرياضيات، الاشتقاق والتكامل، رسم المنحنيات ثلاثية الأبعاد، وبنك المسائل الوزارية المحلولة خطوة بخطوة.',
      image: 'https://digital-brilliance.online/wp-content/uploads/2024/05/7bb1a96e-fbeb-4aac-8ce9-dde1e408f1a0.webp',
      icon: Calculator,
      highlights: ['حساب التفاضل والتكامل 3D', 'الجبر الخطي والمصفوفات', 'بنك المسائل والحل النموذجي'],
      link: '/mathematics',
      metrics: '1,500+ مسألة محلولة'
    },
    {
      id: 'chemistry-platform',
      title: 'منصة الكيمياء',
      subtitle: 'الاتزان الكيميائي، المعايرة، التفاعلات الجزيئية، والجدول الدوري',
      category: 'educational',
      badge: 'مختبر كيميائي حي',
      description: 'محاكاة تفاعلات كيميائية حية، الجدول الدوري التفاعلي ثلاثي الأبعاد، موازنة المعادلات، وحسابات سرعة التفاعل وثابت الاتزان.',
      image: 'https://www.ra2ed.com/UserFiles/cq5dam.lcover.jpeg',
      icon: FlaskConical,
      highlights: ['الجدول الدوري ثلاثي الأبعاد', 'تفاعلات التأكسد والاختزال', 'موازنة المعادلات الكيميائية'],
      link: '/chemistry',
      metrics: 'محاكاة تفاعلات حية'
    },
    {
      id: 'biology-platform',
      title: 'منصة الأحياء',
      subtitle: 'الخلية الحية، علم الوراثة، تقنية CRISPR، والمجهر الافتراضي',
      category: 'educational',
      badge: 'علوم حياتية معتمدة',
      description: 'استكشاف مجسمات ثلاثية الأبعاد للخلية الحية، تضاعف DNA وبناء البروتينات، التنوع الحيوي، وأطالس التشريح التفاعلية فائقة الدقة.',
      image: 'https://th.bing.com/th/id/OIP.GmUR4ZRzF9gWiCj7wukbuwAAAA?cb=iwc2&rs=1&pid=ImgDetMain',
      icon: Dna,
      highlights: ['تضاعف DNA وبناء البروتين', 'الهندسة الوراثية وكريسبر', 'أطلس التشريح البشري 3D'],
      link: '/biology',
      metrics: 'نماذج تشريحية 4K'
    },
    {
      id: 'physics-platform',
      title: 'منصة الفيزياء',
      subtitle: 'ميكانيكا نيوتن، البصريات، الكهرومغناطيسية، والفيزياء الذكية 3D',
      category: 'educational',
      badge: 'فيزياء تطبيقية ونظرية',
      description: 'منصة متخصصة في محاكاة قوانين نيوتن، الكهرومغناطيسية، البصريات الهندسية، والفيزياء النووية مع أدوات قياس رقمية ومسائل وزارية.',
      image: 'https://www.chemixlab.com/wp-content/uploads/2024/01/Thomsons-Model-of-an-Atom-Atomic-Model-History-Limitations-Example.jpg',
      icon: Atom,
      highlights: ['الميكانيكا والمقذوفات', 'المجالات الكهربائية والمغناطيسية', 'فيزياء الكم والنسبية'],
      link: '/physics',
      metrics: '49+ تجربة محاكاة'
    }
  ];

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab || (activeTab === 'educational' && item.category === 'academic'));

  return (
    <section 
      id="ecosystem-section"
      className="py-20 sm:py-28 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
    >
      {/* Header with Executive Filter Tabs */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>منظومة متكاملة للمعرفة والتقنية المتقدمة</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          منظومة المنصات والمسارات الأكاديمية
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          بنية متكاملة صُممت وفق أحدث معايير تجربة المستخدم والتعليم التفاعلي، حيث تتكامل المختبرات والذكاء الاصطناعي مع مسارات BTEC المهنية والشمولية التامة.
        </p>

        {/* Corporate Restrained Segmented Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            جميع المسارات ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('educational')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'educational' || activeTab === 'academic'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>المنصات التعليمية</span>
            <Badge className="px-1.5 py-0 text-[10px] bg-blue-500 text-white">4</Badge>
          </button>
          <button
            onClick={() => setActiveTab('stem')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stem'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            العلوم والمختبرات (STEM)
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            الروبوتات والذكاء الاصطناعي
          </button>
          <button
            onClick={() => setActiveTab('btec')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'btec'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            مسارات BTEC المهنية
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'skills'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            المهارات والتحديات
          </button>
        </div>
      </div>

      {/* Modern Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => navigate(item.link)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Image Banner Header with 16:9 Aspect Ratio */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                
                {/* Seamless light/dark gradient blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-slate-900 dark:via-slate-900/40" />

                {/* Top Corner Badge */}
                <div className="absolute top-3.5 start-3.5 z-10">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 backdrop-blur-md shadow-sm">
                    {item.badge}
                  </span>
                </div>

                {/* Bottom Corner Icon */}
                <div className="absolute bottom-3 end-3.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-3 flex-1 flex flex-col justify-between text-right space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {item.subtitle}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {item.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Footer with Metric and CTA */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {item.metrics}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    استكشف المسار
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default EcosystemBentoGrid;
