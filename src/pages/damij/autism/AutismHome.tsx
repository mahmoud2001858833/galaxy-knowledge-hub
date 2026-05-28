import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, ClipboardList, Calendar, BarChart3, ArrowLeft,
  CheckCircle2, Lock, PlayCircle, Sparkles, Heart, Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAutismAdaptive } from '@/features/autism/ui/AutismAgeAdaptive';
import DamijSEO from '@/components/damij/DamijSEO';
import AutismOnboardingModal from '@/components/damij/AutismOnboardingModal';
import Mascot from '@/features/autism/ui/Mascot';
import { greetChild } from '@/features/autism/ui/gameFX';

type StageId = 'diagnosis' | 'program' | 'progress';

interface Stage {
  id: StageId;
  step: number;
  icon: typeof Brain;
  title: string;
  description: string;
  cta: string;
  to: string;
}

const AutismHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile, ageBucket, isYoung, reduceMotion } = useAutismAdaptive();
  const [activeProgram, setActiveProgram] = useState<{ id: string; share_token: string } | null>(null);
  const [needsOnboard, setNeedsOnboard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [diagnosed, setDiagnosed] = useState(false);

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { setNeedsOnboard(true); return; }
    const prof = JSON.parse(raw);
    if (!prof?.child_name) { setNeedsOnboard(true); return; }
    setDiagnosed(!!prof?.notes_summary || !!prof?.profile_id);
    if (prof?.child_name) setTimeout(() => greetChild(prof.child_name), 350);
    if (!prof.profile_id) return;
    const { data } = await supabase.from('autism_programs')
      .select('id, share_token').eq('child_profile_id', prof.profile_id).eq('status', 'active').maybeSingle();
    if (data) setActiveProgram(data as any);
  })(); }, [refreshKey]);

  const hasProgram = !!activeProgram;

  const stages: Stage[] = [
    {
      id: 'diagnosis',
      step: 1,
      icon: ClipboardList,
      title: 'التشخيص الذكي',
      description: 'فحص دقيق وفق DSM-5 و M-CHAT-R/F مع تحليل سلوكي بالذكاء الاصطناعي وألعاب تشخيصية تفاعلية.',
      cta: diagnosed ? 'إعادة التشخيص' : 'ابدأ التشخيص الآن',
      to: '/damij/autism/diagnosis',
    },
    {
      id: 'program',
      step: 2,
      icon: Calendar,
      title: 'البرنامج العلاجي 90 يوماً',
      description: 'جدول يومي مولّد بالذكاء الاصطناعي، 5 ألعاب يومياً متدرّجة، وتقارير سلوكية تلقائية.',
      cta: hasProgram
        ? 'متابعة برنامج طفلك'
        : diagnosed ? 'إنشاء البرنامج العلاجي' : 'يتطلّب إكمال التشخيص',
      to: hasProgram ? `/damij/autism/program/${activeProgram!.id}` : '/damij/autism/program/setup',
    },
    {
      id: 'progress',
      step: 3,
      icon: BarChart3,
      title: 'لوحة التقدّم',
      description: 'مؤشّرات تفصيلية للأداء عبر الأيام، نقاط القوة، التحديات والتوصيات السلوكية.',
      cta: hasProgram ? 'فتح لوحة التقدّم' : 'يتطلّب وجود برنامج فعّال',
      to: hasProgram ? `/damij/autism/program/${activeProgram!.id}/dashboard` : '#',
    },
  ];

  const isUnlocked = (s: Stage) => {
    if (s.id === 'diagnosis') return true;
    if (s.id === 'program') return diagnosed;
    return hasProgram;
  };
  const isDone = (s: Stage) => {
    if (s.id === 'diagnosis') return diagnosed;
    if (s.id === 'program') return hasProgram;
    return false;
  };

  const nextStage = !diagnosed ? stages[0] : !hasProgram ? stages[1] : stages[2];

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-5xl mx-auto" dir="rtl">
      <AutismOnboardingModal open={needsOnboard} onSaved={() => { setNeedsOnboard(false); setRefreshKey(k => k + 1); }} />
      <DamijSEO
        title="دعم التوحّد — منصة دامج"
        description="نظام دعم التوحّد من منصة دامج: تشخيص ذكي وفق DSM-5 و M-CHAT-R/F، برنامج علاجي 90 يوماً، ولوحة تقدّم تفصيلية."
        path="/damij/autism"
        keywords="التوحد, تشخيص التوحد, علاج التوحد, DSM-5, M-CHAT, منصة دامج التوحد"
      />

      {profile?.child_name && (
        <div className="mb-5 flex justify-center">
          <Mascot childName={profile.child_name} message="جاهز لبدء يوم جديد من المرح والتعلّم؟" />
        </div>
      )}

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-10"
      >
        <div
          className={`mx-auto mb-5 w-20 h-20 rounded-[1.75rem] flex items-center justify-center ${reduceMotion ? '' : 'autism-float'}`}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--autism-primary)) 0%, hsl(var(--autism-accent)) 100%)',
            boxShadow: 'var(--autism-shadow-soft)',
          }}
        >
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--autism-text))] mb-2 tracking-tight">
          نظام التوحّد الذكي
        </h1>
        <p className={`${isYoung ? 'text-xl' : 'text-base sm:text-lg'} text-[hsl(var(--autism-muted))] max-w-2xl mx-auto leading-relaxed`}>
          رحلة متكاملة: تشخيص دقيق ← برنامج علاجي 90 يوماً ← لوحة تقدّم،
          مبنيّة على معايير DSM-5 و M-CHAT-R/F.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px] font-medium">
          {['DSM-5', 'M-CHAT-R/F', 'CDC Milestones', 'تحليل سلوكي AI'].map((s) => (
            <span key={s} className="px-2.5 py-0.5 rounded-full bg-white border border-[hsl(var(--autism-primary)/0.2)] text-[hsl(var(--autism-primary))]">
              {s}
            </span>
          ))}
        </div>

        {profile?.child_name && (
          <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-[hsl(var(--autism-primary)/0.2)] shadow-sm">
            <span className="w-9 h-9 rounded-full bg-[hsl(var(--autism-primary-soft))] flex items-center justify-center text-lg">
              {ageBucket === 'young' ? '🧸' : ageBucket === 'kid' ? '🦊' : '🧑‍🎓'}
            </span>
            <div className="text-right">
              <div className="text-sm font-bold text-[hsl(var(--autism-text))]">{profile.child_name}</div>
              <div className="text-[11px] text-[hsl(var(--autism-muted))]">
                {profile.age_years ? `${profile.age_years} سنوات` : ''}
                {profile.support_level ? ` • مستوى دعم ${profile.support_level}` : ''}
              </div>
            </div>
          </div>
        )}
      </motion.header>

      {/* Big next-step CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onClick={() => isUnlocked(nextStage) && navigate(nextStage.to)}
        disabled={!isUnlocked(nextStage)}
        className="group w-full mb-8 p-6 sm:p-7 rounded-3xl text-white text-right shadow-xl hover:shadow-2xl transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--autism-primary)) 0%, hsl(var(--autism-accent)) 100%)',
          boxShadow: 'var(--autism-shadow-soft)',
        }}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <nextStage.icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold opacity-90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الخطوة التالية لطفلك</span>
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
        <div className="absolute right-[27px] sm:right-[31px] top-4 bottom-4 w-px bg-[hsl(var(--autism-primary)/0.15)]" aria-hidden />
        <div className="space-y-4">
          {stages.map((stage, i) => {
            const unlocked = isUnlocked(stage);
            const done = isDone(stage);
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="relative pr-16 sm:pr-20"
              >
                <div
                  className={`absolute right-2 sm:right-3 top-3 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 border-2 ${
                    done
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : unlocked
                      ? 'bg-white text-[hsl(var(--autism-primary))] border-[hsl(var(--autism-primary))]'
                      : 'bg-white text-[hsl(var(--autism-muted))] border-[hsl(var(--autism-primary)/0.2)]'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-6 h-6" /> : !unlocked ? <Lock className="w-5 h-5" /> : stage.step}
                </div>
                <div
                  className={`p-5 sm:p-6 rounded-2xl bg-white border-2 transition-all ${
                    unlocked
                      ? 'border-[hsl(var(--autism-primary)/0.15)] hover:border-[hsl(var(--autism-accent)/0.5)] hover:shadow-lg cursor-pointer'
                      : 'border-[hsl(var(--autism-primary)/0.1)] opacity-60'
                  }`}
                  onClick={() => unlocked && navigate(stage.to)}
                  role={unlocked ? 'button' : undefined}
                  tabIndex={unlocked ? 0 : -1}
                  onKeyDown={(e) => { if (unlocked && (e.key === 'Enter' || e.key === ' ')) navigate(stage.to); }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--autism-primary)), hsl(var(--autism-accent)))' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-[hsl(var(--autism-text))]">{stage.title}</h3>
                        {done && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            مكتملة
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[hsl(var(--autism-muted))] leading-relaxed mt-1">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--autism-primary))] group">
                        {stage.cta}
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--autism-muted))]">
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

      {/* Trust strip */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-4 rounded-2xl bg-white/70 border border-[hsl(var(--autism-primary)/0.15)]">
          <Heart className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--autism-warm))]" />
          <div className="text-xs text-[hsl(var(--autism-muted))]">واجهة هادئة وملائمة حسّياً</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 border border-[hsl(var(--autism-primary)/0.15)]">
          <Users className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--autism-primary))]" />
          <div className="text-xs text-[hsl(var(--autism-muted))]">منهجية DSM-5 + M-CHAT-R/F</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 border border-[hsl(var(--autism-primary)/0.15)]">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--autism-accent))]" />
          <div className="text-xs text-[hsl(var(--autism-muted))]">تقارير سلوكية بالذكاء الاصطناعي</div>
        </div>
      </div>
    </div>
  );
};

export default AutismHome;
