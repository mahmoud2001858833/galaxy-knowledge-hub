import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Bot,
  Sparkles,
  Zap,
  Cpu,
  Eye,
  MessageSquare,
  Wand2,
  Table,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  FileCheck2,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DocsAITab: React.FC = () => {
  const aiTools = [
    {
      name: 'فلك المعرفة الذكي (Falak Knowledge AI)',
      engine: 'Google Gemini 2.5 Flash / Pro',
      badge: 'المرشد العام',
      desc: 'مساعد أكاديمي شامل ومخصص لجميع المباحث العلمية، يحل المسائل المعقدة خطوة بخطوة باللغة العربية، ويوفر صياغة مبسطة للمفاهيم الرياضية والفيزيائية.',
      features: ['شرح تفصيلي للمسائل', 'دعم الصيغ الرياضية KaTeX', 'تلخيص ذكي للفصول الدراسية', 'محادثة صوتية تفاعلية']
    },
    {
      name: 'مولد الجداول والمقارنات التفاعلية (SmartTableGenerator)',
      engine: 'Gemini Analytical Engine',
      badge: 'جداول ذكية',
      desc: 'أداة ذكاء اصطناعي قادرة على إنشاء جداول علمية ومصفوفات مقارنة معقدة وتصنيف البيانات وتصديرها بصيغ CSV و Markdown بنقرة زر واحدة.',
      features: ['مقارنة معيارية فورية', 'تلوين تلقائي للخلايا', 'حسابات إحصائية آلية', 'تصدير مرن للبيانات']
    },
    {
      name: 'استوديو الاختبارات الإلكترونية التشخيصية (SmartExamStudio)',
      engine: 'Bloom Taxonomy Evaluation Engine',
      badge: 'امتحانات ذكية',
      desc: 'توليد اختبارات إلكترونية تشخيصية وتحديد مستويات الأسئلة وفق مستويات بلوم الستة، وتقديم تغذية راجعة تصحيحية فورية لكل إجابة يقدمها الطالب.',
      features: ['تصنيف مستويات بلوم', 'تحليل نقاط الضعف المعرفية', 'توليد أسئلة غير محدودة', 'تغذية راجعة فورية للطالب']
    },
    {
      name: 'المرشد الذكي المدمج في كل مختبر روبوتات (AIRoboticsCoPilot)',
      engine: 'Robotics Kinematics AI Tutor',
      badge: 'مساعد الروبوتات',
      desc: 'معلم ذكي مخصص لكل قسم في مختبر الروبوتات يقدم تشبيهاً ذهنياً مبسطاً، يشرح المعادلات الفيزيائية ومصفوفات D-H، ويقدم تحديات فهم تفاعلية.',
      features: ['شرح صوتي مدمج TTS', 'تطبيق إعدادات المحاكي بنقرة', 'تحدي الفهم السريع', 'أسئلة شائعة تفاعلية']
    },
    {
      name: 'مختبر الرؤية الحاسوبية والوكلاء (Edge Vision YOLOv8)',
      engine: 'Ultralytics YOLOv8 Embedded',
      badge: 'رؤية حاسوبية',
      desc: 'كشف الأجسام والقطع الصناعية ومطابقة مربعات الإحاطة (Bounding Boxes) في الوقت الحقيقي من خلال الكاميرا وتحويل إحداثيات البكسل إلى فضاء الروبوت.',
      features: ['معالجة فورية 60+ FPS', 'تحديد عتبة الثقة Confidence', 'معايرة إحداثيات الكاميرا', 'تصنيف العيوب الصناعية']
    },
    {
      name: 'محرك التكرار المتباعد العصبي (Neural Spaced Repetition)',
      engine: 'Adaptive Ebbinghaus Leitner Algorithm',
      badge: 'ذاكرة طويلة المدى',
      desc: 'خوارزمية ذكية تتنبأ بلحظة ضعف الذاكرة وتجدول مواعيد المراجعة والاسترجاع النشط وفق أداء الطالب في بطاقات الاستذكار اليومية.',
      features: ['منحنى نسيان مخصص', '4 مستويات مراجعة متدرجة', 'مؤشر قوة الذاكرة الفعلي', 'تنبيهات استرجاع ذكية']
    }
  ];

  return (
    <div className="space-y-8">
      {/* AI Overview Banner */}
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-950/40 dark:via-slate-900/80 dark:to-indigo-950/30 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs">
            <Brain className="w-3.5 h-3.5 ml-1 text-purple-500" />
            الذكاء الاصطناعي - القلب النابض للمنظومة
          </Badge>
          <span className="text-xs text-slate-500 font-mono">25+ Intelligent Educational Tools</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          أكثر من 25 أداة ذكاء اصطناعي وأتمتة مدمجة لخدمة الطالب والمعلم
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          لا يقتصر دور الذكاء الاصطناعي في "ذروة العلم" على كونه أداة محادثة عابرة، بل هو بنية أساسية مندمجة في تصحيح التجارب، فحص الدوائر الإلكترونية، توجيه الروبوتات، والتنبؤ بمواعيد النسيان لتعزيز الحفظ والفهم المستدام.
        </p>
      </div>

      {/* Grid of 6 Key AI Systems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {aiTools.map((tool, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-purple-400/50 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold block">
                  {tool.engine}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {tool.name}
                </h4>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-xs shrink-0">
                {tool.badge}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {tool.desc}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {tool.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
