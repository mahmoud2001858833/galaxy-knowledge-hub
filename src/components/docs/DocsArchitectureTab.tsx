import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  Database,
  Server,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Activity,
  Code2,
  Boxes,
  CheckCircle2,
  Workflow,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DocsArchitectureTab: React.FC = () => {
  const stackLayers = [
    {
      title: '1. طبقة الواجهات والتجربة التفاعلية (Presentation & 3D Layer)',
      tech: ['React 18', 'TypeScript', 'Tailwind CSS', 'Three.js (WebGL 2.0)', 'Framer Motion'],
      desc: 'واجهات فائقة السرعة، متجاوبة 100%، تدعم الوضع الليلي والنهاري، وتصيير رسومي ثلاثي الأبعاد بمعدل 60 إطاراً في الثانية.',
      color: 'blue'
    },
    {
      title: '2. طبقة الحوسبة الذكية والاستدلال (Edge AI & Multimodal Reasoning)',
      tech: ['Google Gemini 2.5 Flash / Pro', 'Ultralytics YOLOv8 WebAssembly', 'Web Speech API', 'Edge Functions'],
      desc: 'أكثر من 25 أداة ذكاء اصطناعي مدمجة في مسار التعلم، توليد الأسئلة، تقييم التجارب، والتعرف البصري الفوري.',
      color: 'purple'
    },
    {
      title: '3. طبقة إدارة المحتوى والمناهج والتعليم الموزع (LCM & Pedagogy Engine)',
      tech: ['Spaced Repetition Algorithm', 'Bloom Taxonomy Matrix', 'Pearson BTEC Mapping', 'Tawjihi Curriculum Model'],
      desc: 'محركات التكرار المتباعد، استوديو الاختبارات الإلكترونية التشخيصية، ومصفوفات الكفايات الأكاديمية والمهنية.',
      color: 'emerald'
    },
    {
      title: '4. طبقة البيانات السحابية والأمان المشدد (Cloud Infrastructure & Security)',
      tech: ['PostgreSQL 16 via Supabase', 'Row-Level Security (RLS)', 'JWT Authentication', 'Zod Schema Validation'],
      desc: 'قواعد بيانات علائقية مشفرة، اشتراكات حيّة متزامنة (Realtime)، وأمان صارم يمنع وصول أي مستخدم لبيانات غير مصرح بها.',
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Architecture Hero Overview */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs">
            <Cpu className="w-3.5 h-3.5 ml-1 text-blue-500" />
            الهيكلية المعمارية الشاملة
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Platform Core Architecture v3.5</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          البنية الهندسية لمنظومة "ذروة العلم": منظومة تعليمية رقمية فائقة الذكاء
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          صُممت المنصة وفق معمارية برمجية متعددة الطبقات (Multi-Tiered Architecture) تدمج المعالجة الحسابية في متصفح العميل (Client-side WASM/WebGL) مع خدمات الاستدلال الذكي في السحاب، مما يتيح تشغيل المحاكيات الفيزيائية المعقدة والروبوتات والذكاء الاصطناعي دون أي تأخير، وبأعلى معايير الأمان المؤسسي.
        </p>

        {/* Dynamic Architectural Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">أسطر الكود المكتوبة</span>
            <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 font-mono">5.2M+ سطر</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">مختبر ومحاكاة علمية</span>
            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">45 مختبراً حياً</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">أدوات الذكاء الاصطناعي</span>
            <span className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 font-mono">25 أداة نشطة</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">زمن الاستجابة الحسابية</span>
            <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">&lt; 16 ms (60FPS)</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Structural Layers */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          طبقات المنظومة البرمجية والمعمارية (Full-Stack Stack):
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {stackLayers.map((layer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-400/50 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h5 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  {layer.title}
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {layer.tech.map((t, tIdx) => (
                    <Badge key={tIdx} variant="secondary" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {layer.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
