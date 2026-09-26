import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Layers, 
  Flame, 
  Atom, 
  HelpCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BenchmarkRow {
  dimension: string;
  traditional: {
    status: boolean;
    text: string;
    sub: string;
  };
  galaxy: {
    status: boolean;
    text: string;
    sub: string;
    highlight?: boolean;
  };
}

export const PlatformBenchmarkMatrix: React.FC = () => {
  const rows: BenchmarkRow[] = [
    {
      dimension: 'معايير السلامة وتكلفة المواد الكيميائية',
      traditional: {
        status: false,
        text: 'مخاطر حروق وانفجارات، وتكلفة مستهلكات باهظة',
        sub: 'محدودية في إجراء تفاعلات الزئبق أو المواد المشعة'
      },
      galaxy: {
        status: true,
        text: 'أمان تام 100% مع محاكاة أدق التفاعلات الخطرة',
        sub: 'تفاعلات ذرية، نووية، وكيميائية بلا أي تكاليف مستهلكات',
        highlight: true
      }
    },
    {
      dimension: 'إمكانية تكرار التجربة وتغيير المتغيرات',
      traditional: {
        status: false,
        text: 'مرة واحدة لكل حصة نظراً لضيق الوقت والمواد',
        sub: 'صعوبة إعادة التجربة عند حدوث خطأ إنساني'
      },
      galaxy: {
        status: true,
        text: 'إعادة وتعديل لا نهائي بضغطة زر وبمعايرة لحظية',
        sub: 'تعديل التردد، الجاذبية، الكتلة ومقاومة الهواء آنياً'
      }
    },
    {
      dimension: 'دعم ذوي الاحتياجات الخاصة (Accessibility)',
      traditional: {
        status: false,
        text: 'عزلة تامة في المختبرات وصعوبة الوصول الحركي والحسي',
        sub: 'انعدام أدوات برايل أو ترجمة الإشارة بالمختبر'
      },
      galaxy: {
        status: true,
        text: 'منظومة «دامج» المتكاملة معتمدة بمعايير WCAG AAA',
        sub: 'مترجم إشارة بالكاميرا، برايل لمسي، ودعم التوحد وADHD',
        highlight: true
      }
    },
    {
      dimension: 'التوجيه والإرشاد الذكي الفوري (AI Mentorship)',
      traditional: {
        status: false,
        text: 'معلم واحد لـ 30 طالباً مع صعوبة المتابعة الفردية',
        sub: 'تأخر التغذية الراجعة حتى موعد تصحيح التقارير'
      },
      galaxy: {
        status: true,
        text: 'مرشد ذكي صوتي وتفاعلي يرافق كل طالب خطوة بخطوة',
        sub: 'تحليل الأخطاء الرياضية وتفسير المنحنيات في الوقت الفعلي'
      }
    },
    {
      dimension: 'التوافق والعمل عبر كافة الأجهزة (Universal Devices)',
      traditional: {
        status: false,
        text: 'يتطلب الحضور الفيزيائي لمقر المدرسة أو الجامعة',
        sub: 'عدم إمكانية التطبيق في المنزل أو أثناء التنقل'
      },
      galaxy: {
        status: true,
        text: 'جاهز 24/7 عبر المتصفح: هاتف، تابلت، حاسوب، وسبورة ذكية',
        sub: 'تصميم فائق الخفة والسرعة دون الحاجة لأجهزة حاسوب باهظة',
        highlight: true
      }
    }
  ];

  return (
    <section className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-900">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>المقارنة المعيارية المؤسسية | Strategic Benchmark</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          التعليم التقليدي مقابل منظومة ذروة العلم 2.0
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          نقلة نوعية تقيس فارق الأداء، تكلفة التشغيل، ومعايير الشمولية والسلامة بين الطرق التقليدية ومنظومتنا الرقمية.
        </p>
      </div>

      {/* Comparison Table / Matrix (Responsive Container) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.04)] overflow-hidden">
        
        {/* Table Header Row */}
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 text-right font-bold text-xs sm:text-sm">
          <div className="col-span-4 sm:col-span-4 text-slate-700 dark:text-slate-300">
            معيار التقييم
          </div>
          <div className="col-span-4 sm:col-span-4 text-slate-500 dark:text-slate-400">
            المختبرات والتعليم التقليدي
          </div>
          <div className="col-span-4 sm:col-span-4 text-blue-700 dark:text-blue-400 font-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>منصة ذروة العلم 2.0</span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-right">
          {rows.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors gap-2 sm:gap-4"
            >
              {/* Col 1: Dimension */}
              <div className="col-span-4 sm:col-span-4 space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug block">
                  {row.dimension}
                </span>
              </div>

              {/* Col 2: Traditional */}
              <div className="col-span-4 sm:col-span-4 space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs leading-relaxed font-medium">
                    {row.traditional.text}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block pr-5 hidden sm:block">
                  {row.traditional.sub}
                </span>
              </div>

              {/* Col 3: Galaxy Knowledge Hub */}
              <div className="col-span-4 sm:col-span-4 space-y-1 bg-blue-50/40 dark:bg-blue-950/20 p-2 sm:p-3 rounded-2xl border border-blue-100/80 dark:border-blue-900/40">
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs leading-relaxed font-bold text-slate-900 dark:text-white">
                    {row.galaxy.text}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 block pr-5 hidden sm:block font-medium">
                  {row.galaxy.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Matrix Footer Badge */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            النتيجة: توفير يصل إلى 85% من التكاليف التشغيلية للمؤسسات التعليمية مع مضاعفة مشاركة الطلاب 3x مرات.
          </span>
        </div>

      </div>
    </section>
  );
};

export default PlatformBenchmarkMatrix;
