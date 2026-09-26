import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Building2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const StrategicRoadmapSection: React.FC = () => {
  const navigate = useNavigate();

  const roadmapMilestones = [
    {
      quarter: 'المرحلة الأولى • Q1 2026',
      status: 'مكتمل ومعتمد',
      statusColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
      title: 'إطلاق مترجم لغة الإشارة بالرؤية الحاسوبية على الحافة (Edge Vision)',
      description: 'معالجة إشارات اليد بالذكاء الاصطناعي مباشرة داخل المتصفح بمعدل 60 إطار في الثانية وبخصوصية تامة دون إرسال الفيديو للسيرفر.'
    },
    {
      quarter: 'المرحلة الثانية • Q2 2026',
      status: 'فعال تجريبياً',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400',
      title: 'بروتوكول برايل اللمسي والصوتي الموحد (Universal Braille Protocol)',
      description: 'نظام ترجمة فورية ثنائي الاتجاه بين اللغة العربية ورموز برايل ذات الـ 6 نقاط مع مخرجات صوتية واهتزازية Haptic Feedback.'
    },
    {
      quarter: 'المرحلة الثالثة • Q3 2026',
      status: 'قيد التطوير',
      statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400',
      title: 'المحرك الحسي التكيفي لطيف التوحد وفرط الحركة (Adaptive Neuro-Engine)',
      description: 'ضبط ألوان وتباين وسرعة واجهات المنصة آلياً بناءً على استجابة الطالب الحركية والبصرية لتقليل التشتت والإجهاد الحسي.'
    },
    {
      quarter: 'المرحلة الرابعة • Q4 2026',
      status: 'مبادرة استراتيجية',
      statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400',
      title: 'الربط السحابي الموحد مع المدارس والجامعات الأردنية والعربية',
      description: 'واجهات برمجة تطبيقات (Enterprise APIs) تتيح للمؤسسات التعليمية دمج مختبرات ذروة العلم ونظام دامج ضمن بواباتهم الرسمية.'
    }
  ];

  return (
    <section 
      id="roadmap-section"
      className="py-20 sm:py-28 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
    >
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-10">
        
        {/* Flagship Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 text-right">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-900">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المبادرات الاستراتيجية القادمة | Strategic Initiative</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              مشروع "دامج" الوطني للتربية الخاصة والشمولية الرقمية
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              خارطة طريق تقنية طموحة تهدف إلى إرساء أول معيار تقني عربي مفتوح المصدر لتمكين ذوي الإعاقة السمعية، البصرية، والحركية، وصعوبات التعلم في التعليم التفاعلي المتقدم.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/damij')}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl px-5 py-2.5 shadow-sm"
            >
              <span>استكشف بوابة دامج</span>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/damij/docs')}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-4 py-2.5"
            >
              <FileText className="w-3.5 h-3.5 ml-1.5" />
              <span>الوثائق الفنية</span>
            </Button>
          </div>
        </div>

        {/* 4-Milestone Strategic Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapMilestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between text-right space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {item.quarter}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>المعيار: W3C / WCAG 2.1 AAA</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Institutional Commitment Footer Banner */}
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>مشروع معتمد ومطور بإشراف وزارة التربية والتعليم والجامعة الألمانية الأردنية (GJU).</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contact')}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 p-0"
          >
            <span>طلب شراكة مؤسسية</span>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          </Button>
        </div>

      </div>
    </section>
  );
};

export default StrategicRoadmapSection;
