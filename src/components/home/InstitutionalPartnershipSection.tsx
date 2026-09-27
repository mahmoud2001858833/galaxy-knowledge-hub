import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  TrendingDown, 
  Award,
  ExternalLink,
  Atom,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const InstitutionalPartnershipSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section 
      id="tour-stage-partnerships" 
      className="py-14 sm:py-20 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      dir="rtl"
    >
      <div className="relative rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900/90 border border-blue-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6 text-right">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <Building2 className="w-4 h-4" />
            <span>بوابة الشراكات المؤسسية والاعتماد الأكاديمي</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            شراكة استراتيجية تمكّن مدرستكم أو جامعتكم بأحدث مختبرات الـ 3D والذكاء الاصطناعي
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            نوفر للمدارس والجامعات والوزارات حلولاً رقمية متكاملة تدمج 49 مختبراً افتراضياً، مسارات BTEC المهنية، وتقنيات الشمولية مع مشروع دامج، مع خفض تكاليف تجهيز المعامل بنسبة 85% وتوفير تقارير أداء فورية لكل طالب.
          </p>

          {/* Value Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold text-xs">
                <TrendingDown className="w-4 h-4" />
                <span>خفض النفقات التشغيلية</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                85% توفير
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                في تكاليف الأجهزة والمواد الكيميائية سنوياً
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <HeartHandshake className="w-4 h-4" />
                <span>الشمولية والتربية الخاصة</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                مشروع دامج
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                لغة الإشارة، برايل، ودعم التوحد وADHD
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>التدريب والتأهيل</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                اعتماد معلمين
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                برامج تدريبية معتمدة على أدوات AI 2.0
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/institutional-partnerships')}
              className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <span>استكشف عوائد الشراكة وقدم طلبك</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/institutional-partnerships')}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-sm"
            >
              <span>معلومات التواصل الرسمية</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionalPartnershipSection;
