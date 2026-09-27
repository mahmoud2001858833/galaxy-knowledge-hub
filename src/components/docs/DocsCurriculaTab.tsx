import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  FileCheck,
  Building,
  HeartHandshake,
  Users,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DocsCurriculaTab: React.FC = () => {
  const tracks = [
    {
      title: 'مناهج الثانوية العامة الأردنية (التوجيهي العلمي والصناعي)',
      badge: 'المنهاج الوطني المطور',
      authority: 'وزارة التربية والتعليم والمركز الوطني للمناهج (NCCD)',
      desc: 'تغطية معيارية شاملة لمقررات الفيزياء، الكيمياء، العلوم الحياتية، والرياضيات وفق الكتب المدرسية المطورة، مع بنوك أسئلة وزارية وامتحانات تحاكي نظام التوجيهي الإلكتروني.',
      modules: ['الفيزياء: الزخم والتصادمات، الحث الكهرومغناطيسي، وفيزياء الكم', 'الكيمياء: الحموض والقواعد، سرعة التفاعلات، والكيمياء العضوية', 'العلوم الحياتية: الوراثة الجزيئية، التكنولوجيا الحيوية، وتعديل الجينات', 'الرياضيات: التفاضل والتكامل وتطبيقات القيم القصوى والمساحات']
    },
    {
      title: 'برامج Pearson BTEC International Level 3 في الهندسة وتكنولوجيا المعلومات',
      badge: 'اعتماد دولي مهني',
      authority: 'Pearson Edexcel / UK Qualifications Framework',
      desc: 'مسارات تعليمية مهنية تركز على التعليم التطبيقي القائم على المشاريع، محاكاة الدوائر الإلكترونية، وبرمجة الأنظمة المدمجة والروبوتات لتأهيل الطالب لسوق العمل الحديث.',
      modules: ['Applied Electrical and Electronic Circuit Engineering', 'Microcontroller Systems & Embedded Robotics Programming', 'Computer-Aided Design (CAD) & 3D Additive Manufacturing', 'Autonomous Navigation and Industrial IoT Automation Systems']
    },
    {
      title: 'منظومة دمج للتربية الخاصة واضطرابات طيف التوحد (Damij Platform)',
      badge: 'الدمج والتعليم المساند',
      authority: 'المجلس الأعلى لحقوق الأشخاص ذوي الإعاقة / DSM-5-TR',
      desc: 'استبيانات تشخيصية للأطباء والأهالي، أدوات تحويل لغة الإشارة، مترجم خلايا برايل السداسية الموحدة، وتهيئة بيئة التعلم الرقمية لتقليل المشتتات البصرية لطلبة فرط الحركة ADHD.',
      modules: ['استبيان تشخيص التوحد المعتمد طبياً وفق معايير DSM-5', 'مختبر تعلم برايل التفاعلي والمترجم اللمسي للصم والبكم', 'مترجم الحروف والكلمات إلى لغة الإشارة العربية المصورة', 'استراتيجيات الدعم الحسي والتهيئة الصفية للمدارس الدامجة']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-r from-teal-900/10 via-emerald-900/10 to-blue-900/10 dark:from-teal-950/40 dark:via-slate-900/80 dark:to-emerald-950/30 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 text-xs">
            <GraduationCap className="w-3.5 h-3.5 ml-1 text-teal-500" />
            المواءمة الأكاديمية والمهنية
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Curricula Matrix & Standards Alignment</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          مصفوفة التوافق الكامل مع المناهج الأردنية ومواصفات BTEC والدمج التعليمي
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          تم تصميم جميع الأنشطة والمختبرات بالمنصة لتكون جسراً مباشراً بين المنهاج المدرسي النظري والتطبيق الهندسي المتقدم، مما يحقق للطالب تفوقاً مضاعفاً في امتحاناته المدرسية ومسيرته الجامعية.
        </p>
      </div>

      {/* Tracks */}
      <div className="space-y-5">
        {tracks.map((track, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-teal-400/50 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {track.title}
                </h4>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold block mt-0.5">
                  جهة الاعتماد والمعايير: {track.authority}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0 self-start sm:self-auto">
                {track.badge}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {track.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {track.modules.map((mod, mIdx) => (
                <div key={mIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{mod}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
