import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  HeartHandshake, 
  Cpu, 
  CheckCircle2, 
  ArrowLeft, 
  Activity, 
  Sliders, 
  Compass, 
  Flame, 
  Binary,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PlatformMissionSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeInspector, setActiveInspector] = useState<'physics' | 'chemistry' | 'ai'>('physics');

  const inspectorData = {
    physics: {
      title: 'محاكاة ميكانيكا الكم والنسبية',
      metric1: { label: 'طاقة النظام الكلية', val: 'E = mc²', status: 'حفظ مطلق' },
      metric2: { label: 'حقل الجاذبية الأرضي', val: '9.807 m/s²', status: 'معاير دولياً' },
      metric3: { label: 'ثابت بلانك المصغر', val: '6.626×10⁻³⁴', status: 'دقة CODATA' },
      snippet: 'Δx · Δp ≥ ℏ / 2  (مبدأ عدم التأكد لهايزنبرغ)'
    },
    chemistry: {
      title: 'محاكاة التوازنات وحركية التفاعلات',
      metric1: { label: 'ثابت الاتزان الكيميائي', val: 'K_eq = 1.42×10³', status: 'توازن مستقر' },
      metric2: { label: 'طاقة التنشيط المحسوبة', val: 'E_a = 48.6 kJ/mol', status: 'مُحفز بالـ AI' },
      metric3: { label: 'الرقم الهيدروجيني pH', val: '7.38 ± 0.01', status: 'معايرة أيونية' },
      snippet: 'ln(k) = -E_a/(R·T) + ln(A)  (معادلة أرهينيوس)'
    },
    ai: {
      title: 'شبكات عصبية ورؤية حاسوبية',
      metric1: { label: 'زمن الاستدلال على الحافة', val: '4.8 ms', status: '208 FPS' },
      metric2: { label: 'دقة التعرف على الإشارة', val: '99.4%', status: 'نموذج YOLOv8' },
      metric3: { label: 'خوارزمية الملاحة الذاتية', val: 'A* + DWA', status: 'خلو من الاصطدام' },
      snippet: 'y = σ(Wᵀ·x + b)  (Multi-Layer Perceptron Forward Pass)'
    }
  };

  const current = inspectorData[activeInspector];

  return (
    <section 
      id="mission-section"
      className="py-20 sm:py-28 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Right Column (Text & Mission Mandate - RTL layout) */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6 text-right"
        >
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>رسالة المنصة والرؤية الأكاديمية</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            إعادة هندسة التعلم العلمي من التلقين النظري إلى الاكتشاف التجريبي
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            صُممت منصة ذروة العلم لتكون منظومة البنية التحتية التعليمية الموحدة في المملكة الأردنية الهاشمية والوطن العربي؛ لسد الفجوة بين المقررات المدرسية والجامعية، وبين التطبيق العملي المباشر في بيئة افتراضية آمنة بنسبة 100%.
          </p>

          {/* 3 Core Pillars List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 dark:border-blue-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  السيادة المعرفية والتعلم الذاتي المستقل
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  إتاحة معامل فيزيائية وكيميائية ونووية عالية الخطورة أو باهظة التكلفة، ليمارس كل طالب التجربة العلمية بالمعايرة الدقيقة دون مخاطر.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-900">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  الشمولية الرقمية التامة (Universal Inclusion)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  تضمين حلول التربية الخاصة المعتمدة عالمياً عبر مشروع "دامج"، شاملة مترجم لغة الإشارة بالكاميرا، شاشات برايل اللمسية، ومساعدي طيف التوحد وفرط الحركة.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  الربط بين العلوم والتطبيقات الصناعية الذكية
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  تمكين مناهج BTEC الدولية، وهندسة الروبوتات، والذكاء الاصطناعي التوليدي لإعداد كفاءات جاهزة فوراً لسوق العمل والابتكار المؤسسي.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Left Column (High-Fidelity Interactive UI Visual Asset) */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-6"
        >
          <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-6">
            
            {/* Header of the Inspector */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  لوحة المعايرة الحية ومراقبة المحاكاة الفيزيائية
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700">
                LIVE TELEMETRY
              </Badge>
            </div>

            {/* Interactive Inspector Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveInspector('physics')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  activeInspector === 'physics'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                الفيزياء المتقدمة
              </button>
              <button
                onClick={() => setActiveInspector('chemistry')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  activeInspector === 'chemistry'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                الكيمياء الحركية
              </button>
              <button
                onClick={() => setActiveInspector('ai')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  activeInspector === 'ai'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                الذكاء الاصطناعي
              </button>
            </div>

            {/* Current Active Telemetry View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>المسار المستهدف:</span>
                <span className="font-bold text-slate-900 dark:text-white">{current.title}</span>
              </div>

              {/* 3 Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{current.metric1.label}</div>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">{current.metric1.val}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">● {current.metric1.status}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{current.metric2.label}</div>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">{current.metric2.val}</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">● {current.metric2.status}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{current.metric3.label}</div>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">{current.metric3.val}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1">● {current.metric3.status}</div>
                </div>
              </div>

              {/* Mathematical / Algorithmic Verification Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs dir-ltr text-left border border-slate-800 space-y-1 shadow-inner">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">
                  // Mathematical Formula Verification
                </div>
                <div className="text-emerald-400 font-bold">
                  {current.snippet}
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                تم التحقق وفق معايير CODATA & IUPAC
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/experiments-section')}
                className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 p-0"
              >
                <span>الانتقال للمختبر الكامل</span>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PlatformMissionSection;
