import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, ListChecks, Brain, Calendar, BarChart3, BookMarked, ShieldCheck,
  ArrowLeft, CheckCircle2, Lock, PlayCircle, Sparkles,
} from 'lucide-react';
import DamijSEO from '@/components/damij/DamijSEO';

type StageId = 'diagnosis' | 'program' | 'monthly' | 'longitudinal';

interface Stage {
  id: StageId;
  step: number;
  icon: typeof Activity;
  title: string;
  description: string;
  cta: string;
  to: string;
  accent: string;
}

const ADHDHome: React.FC = () => {
  const navigate = useNavigate();
  const [diagnosed, setDiagnosed] = useState(false);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  useEffect(() => {
    const programId = localStorage.getItem('adhd_active_program');
    const diag = localStorage.getItem('adhd_diagnosis_done') === '1';
    setActiveProgramId(programId);
    setDiagnosed(diag || !!programId);
  }, []);

  const hasProgram = !!activeProgramId;

  const stages: Stage[] = [
    {
      id: 'diagnosis',
      step: 1,
      icon: ListChecks,
      title: 'التشخيص',
      description:
        'استبيانات معتمدة (NICHQ Vanderbilt, WHO ASRS) واختبارات أداء (CPT, N-Back, Stroop, Go/No-Go) ينتج عنها تقرير AI مفصّل بالنمط والشدّة.',
      cta: diagnosed ? 'إعادة التشخيص' : 'ابدأ التشخيص الآن',
      to: '/damij/adhd/screening',
      accent: 'from-amber-400 to-orange-500',
    },
    {
      id: 'program',
      step: 2,
      icon: Brain,
      title: 'البرنامج العلاجي',
      description:
        'خطة يومية مخصّصة بالذكاء الاصطناعي بناءً على نتائج تشخيصك، تتضمّن ألعاباً علاجية وتمارين تركيز وتقارير يومية للتقدّم.',
      cta: hasProgram ? 'متابعة برنامجك العلاجي' : diagnosed ? 'إنشاء برنامجك العلاجي' : 'يتطلّب إكمال التشخيص',
      to: hasProgram ? `/damij/adhd/program/${activeProgramId}` : '/damij/adhd/program/setup',
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'monthly',
      step: 3,
      icon: Calendar,
      title: 'المتابعة الشهرية',
      description:
        'لوحة شهرية تعرض التزامك اليومي، نسب إكمال الجلسات، وتحسّن أدائك في الاختبارات شهراً بشهر.',
      cta: 'فتح المتابعة الشهرية',
      to: '/damij/adhd/monthly',
      accent: 'from-rose-500 to-pink-600',
    },
    {
      id: 'longitudinal',
      step: 4,
      icon: BarChart3,
      title: 'المتابعة الطولية',
      description:
        'مخطّطات تطوّر الأعراض والأداء عبر الزمن، مع مقارنة بين فترات التقييم لرصد التحسّن طويل المدى.',
      cta: 'فتح المتابعة الطولية',
      to: '/damij/adhd/dashboard',
      accent: 'from-fuchsia-500 to-purple-600',
    },
  ];

  const isStageUnlocked = (stage: Stage) => {
    if (stage.id === 'diagnosis') return true;
    if (stage.id === 'program') return diagnosed;
    return hasProgram; // monthly + longitudinal need an active program
  };

  const isStageDone = (stage: Stage) => {
    if (stage.id === 'diagnosis') return diagnosed;
    if (stage.id === 'program') return hasProgram;
    return false;
  };

  const nextStage =
    !diagnosed ? stages[0] :
    !hasProgram ? stages[1] :
    stages[2];

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-16 max-w-5xl mx-auto" dir="rtl">
      <DamijSEO
        title="دعم ADHD وفرط الحركة — منصة دامج"
        description="نظام دعم ADHD من منصة دامج: تشخيص، تدريب، ألعاب تركيز، تدخلات سلوكية، ومتابعة شهرية لطلاب فرط الحركة وتشتت الانتباه."
        path="/damij/adhd"
        keywords="ADHD, فرط الحركة, تشتت الانتباه, تدريب التركيز, منصة دامج ADHD"
      />
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-warm))] to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
          <Activity className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2 tracking-tight">
          نظام فرط الحركة وتشتّت الانتباه
        </h1>
        <p className="text-base text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto leading-relaxed">
          رحلة متكاملة: تشخيص دقيق ← برنامج علاجي مخصّص ← متابعة شهرية ← متابعة طولية،
          جميعها مبنيّة على معايير DSM-5-TR و AAP و NICE.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px] font-medium">
          {['DSM-5-TR', 'NICHQ Vanderbilt', 'WHO ASRS', 'AAP 2019', 'NICE NG87'].map((s) => (
            <span key={s} className="px-2.5 py-0.5 rounded-full bg-white border border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))]">
              {s}
            </span>
          ))}
        </div>
      </motion.header>

      {/* Big "next step" CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate(nextStage.to)}
        className={`group w-full mb-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-l ${nextStage.accent} text-white text-right shadow-xl hover:shadow-2xl transition-all`}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <nextStage.icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold opacity-90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الخطوة التالية لك</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-1 truncate">{nextStage.title}</h2>
            <p className="text-sm sm:text-base opacity-95 line-clamp-2">{nextStage.description}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur font-bold shrink-0">
            <PlayCircle className="w-5 h-5" />
            <span>ابدأ</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          </div>
        </div>
      </motion.button>

      {/* Journey timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute right-[27px] sm:right-[31px] top-4 bottom-4 w-px bg-[hsl(var(--damij-primary))]/15" aria-hidden />

        <div className="space-y-4">
          {stages.map((stage, i) => {
            const unlocked = isStageUnlocked(stage);
            const done = isStageDone(stage);
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="relative pr-16 sm:pr-20"
              >
                {/* Step badge on the timeline */}
                <div
                  className={`absolute right-2 sm:right-3 top-3 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 border-2 ${
                    done
                      ? 'bg-[hsl(var(--damij-success))] text-white border-[hsl(var(--damij-success))]'
                      : unlocked
                      ? 'bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-primary))]'
                      : 'bg-white text-[hsl(var(--damij-muted))] border-[hsl(var(--damij-border))]'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-6 h-6" /> : !unlocked ? <Lock className="w-5 h-5" /> : stage.step}
                </div>

                <div
                  className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all ${
                    unlocked
                      ? 'border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-warm))]/50 hover:shadow-lg cursor-pointer'
                      : 'border-[hsl(var(--damij-border))] opacity-60'
                  }`}
                  onClick={() => unlocked && navigate(stage.to)}
                  role={unlocked ? 'button' : undefined}
                  tabIndex={unlocked ? 0 : -1}
                  onKeyDown={(e) => { if (unlocked && (e.key === 'Enter' || e.key === ' ')) navigate(stage.to); }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.accent} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-[hsl(var(--damij-primary))]">{stage.title}</h3>
                        {done && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--damij-success))]/10 text-[hsl(var(--damij-success))] font-bold">
                            مكتملة
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed mt-1">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3">
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--damij-primary))] group">
                        {stage.cta}
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--damij-muted))]">
                        <Lock className="w-3.5 h-3.5" />
                        {stage.cta}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Secondary tools */}
      <div className="mt-10">
        <h3 className="text-sm font-bold text-[hsl(var(--damij-muted))] mb-3 uppercase tracking-wider">
          أدوات إضافيّة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/damij/adhd/interventions"
            className="p-4 rounded-2xl bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-sky-600 mb-2" />
            <div className="font-bold text-[hsl(var(--damij-primary))]">التدخلات السلوكية</div>
            <div className="text-xs text-[hsl(var(--damij-muted))] mt-1">Token Economy وتكييفات صفّية.</div>
          </Link>
          <Link
            to="/damij/adhd/training"
            className="p-4 rounded-2xl bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition-colors"
          >
            <Brain className="w-5 h-5 text-violet-600 mb-2" />
            <div className="font-bold text-[hsl(var(--damij-primary))]">تدريب التركيز</div>
            <div className="text-xs text-[hsl(var(--damij-muted))] mt-1">جلسات تدريب معرفي قصيرة.</div>
          </Link>
          <Link
            to="/damij/adhd/resources"
            className="p-4 rounded-2xl bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/40 transition-colors"
          >
            <BookMarked className="w-5 h-5 text-zinc-600 mb-2" />
            <div className="font-bold text-[hsl(var(--damij-primary))]">مكتبة المصادر</div>
            <div className="text-xs text-[hsl(var(--damij-muted))] mt-1">مراجع موثّقة من APA و NICHQ.</div>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
        <strong className="block mb-1">إخلاء مسؤولية:</strong>
        جميع الأدوات في هذا النظام للتثقيف ودعم القرار، ولا تُغني عن التقييم السريري من قِبل طبيب أو أخصائي نفسي مرخّص.
      </div>
    </div>
  );
};

export default ADHDHome;
