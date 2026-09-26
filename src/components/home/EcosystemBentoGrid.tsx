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
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import simulationsBg from '@/assets/simulations-3d-section.jpg';
import roboticsBg from '@/assets/robotics-ai-section.jpg';
import damijBg from '@/assets/damij-section.jpg';
import educationBg from '@/assets/education-section.jpg';
import sourcesLibraryBg from '@/assets/sources-library-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';

interface EcosystemItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
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
  const [activeTab, setActiveTab] = useState<'all' | 'stem' | 'ai' | 'inclusive'>('all');

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
      title: 'الروبوتات والذكاء الاصطناعي',
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
      id: 'damij',
      title: 'منصة دامج — التعليم الخاص والدمج',
      subtitle: 'التقنيات المساعدة الشاملة وحلول الشمولية الذكية',
      category: 'inclusive',
      badge: 'مبادرة وطنية معتمدة',
      description: 'مترجم لغة الإشارة بالكاميرا، مترجم برايل اللمسي والصوتي، التشخيص التفريقي لاضطراب فرط الحركة ADHD، وأدوات دعم طيف التوحد.',
      image: damijBg,
      icon: HeartHandshake,
      highlights: ['مترجم برايل التفاعلي', 'كاشف لغة الإشارة بالكاميرا', 'فحص التوحد وADHD'],
      link: '/damij',
      metrics: '100% شمولية رقمية'
    },
    {
      id: 'education',
      title: 'التعليم الشامل ومسارات BTEC',
      subtitle: 'المناهج العلمية والتقنية المعتمدة دولياً',
      category: 'stem',
      badge: '4 مسارات تعليمية',
      description: 'مسارات متكاملة للمناهج المدرسية، مناهج BTEC الدولية لتكنولوجيا المعلومات، مسارات الاستدامة، وحسابات الطاقة البديلة.',
      image: educationBg,
      icon: GraduationCap,
      highlights: ['العلوم الطبيعية والأدب', 'مناهج BTEC الدولية', 'هندسة البرمجيات'],
      link: '/education-section',
      metrics: 'معايير Pearson'
    },
    {
      id: 'sources',
      title: 'المكتبة العلمية والمصادر الموثقة',
      subtitle: 'مراجع أكاديمية وأدلة دولية معتمدة وفق APA وWHO',
      category: 'stem',
      badge: '200+ مرجع دولي',
      description: 'أرشيف معتمد يضم أبحاث APA، أدلة منظمة الصحة العالمية WHO، ومعايير W3C/WCAG مع ميزة النسخ الفوري للاقتباسات وتنزيل التقارير.',
      image: sourcesLibraryBg,
      icon: BookOpen,
      highlights: ['أبحاث محكمة ودولية', 'اقتباس فوري بنظام APA', 'إرشادات WHO و WCAG'],
      link: '/damij/sources',
      metrics: 'توثيق أكاديمي كامل'
    },
    {
      id: 'assistant',
      title: 'المرشد الذكي والذكاء الاصطناعي',
      subtitle: 'دعم أكاديمي ونفسي موجه بنماذج Gemini المتطورة',
      category: 'ai',
      badge: 'مساعد فوري 24/7',
      description: 'مساعدون أذكياء متخصصون لشرح النظريات المعقدة خطوة بخطوة، تصحيح الأخطاء البرمجية، وتوجيه مسار تعلم الطالب بدقة.',
      image: aiAssistantBg,
      icon: Sparkles,
      highlights: ['تفسير المفاهيم التفاعلي', 'توليد أسئلة بلوم المتدرجة', 'نطق وإملاء صوتي'],
      link: '/ai-assistant-section',
      metrics: 'دعم متعدد الوسائط'
    }
  ];

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);

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
          بنية متكاملة صُممت وفق أحدث معايير تجربة المستخدم والتعليم التفاعلي، حيث تتكامل المختبرات والذكاء الاصطناعي مع حلول الشمولية التامة.
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
            جميع المسارات (6)
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
            onClick={() => setActiveTab('inclusive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inclusive'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            التربية الخاصة والدمج (دامج)
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
              transition={{ duration: 0.4, delay: index * 0.06 }}
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

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Highlights Mini Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {item.highlights.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-[10px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {item.metrics}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span>استعراض المنصة</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform" />
                  </div>
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
