import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, Calendar, UserCircle, Baby, Sparkles, Heart, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAutismAdaptive } from '@/features/autism/ui/AutismAgeAdaptive';


interface CardDef {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  emoji: string;
  tone: 'primary' | 'accent' | 'warm' | 'success';
}

const CARDS: CardDef[] = [
  { to: '/damij/autism/diagnosis', icon: ClipboardList, title: 'التشخيص الذكي', desc: 'فحص دقيق وفق DSM-5 و M-CHAT-R/F مع تحليل سلوكي بالذكاء الاصطناعي.', emoji: '🧩', tone: 'primary' },
  { to: '/damij/autism/program/setup', icon: Calendar, title: 'برنامج علاجي 90 يوماً', desc: 'جدول يومي تفاعلي مولّد مرة واحدة، 10 ألعاب يومياً متدرّجة.', emoji: '📅', tone: 'accent' },
  { to: '/damij/autism/therapy', icon: Brain, title: 'مكتبة الألعاب', desc: 'ألعاب تفاعلية لتجريب المهارات بشكل مستقل.', emoji: '🎮', tone: 'warm' },
  { to: '/damij/autism/profile', icon: UserCircle, title: 'ملف الطفل', desc: 'سجل التقدم، التقارير اليومية والمكافآت.', emoji: '👶', tone: 'success' },
];

const TONE_BG: Record<CardDef['tone'], string> = {
  primary: 'from-[hsl(var(--autism-primary-soft))] to-white border-[hsl(var(--autism-primary)/0.25)]',
  accent: 'from-[hsl(var(--autism-accent-soft))] to-white border-[hsl(var(--autism-accent)/0.3)]',
  warm: 'from-[hsl(var(--autism-warm-soft))] to-white border-[hsl(var(--autism-warm)/0.3)]',
  success: 'from-emerald-50 to-white border-emerald-200',
};
const TONE_TEXT: Record<CardDef['tone'], string> = {
  primary: 'text-[hsl(var(--autism-primary))]',
  accent: 'text-[hsl(var(--autism-accent))]',
  warm: 'text-[hsl(var(--autism-warm))]',
  success: 'text-emerald-700',
};

const AutismHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile, ageBucket, isYoung, baseTextClass, reduceMotion } = useAutismAdaptive();
  const [activeProgram, setActiveProgram] = useState<{ id: string; share_token: string } | null>(null);

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) return;
    const prof = JSON.parse(raw);
    if (!prof.profile_id) return;
    const { data } = await supabase.from('autism_programs')
      .select('id, share_token').eq('child_profile_id', prof.profile_id).eq('status', 'active').maybeSingle();
    if (data) setActiveProgram(data as any);
  })(); }, []);

  return (
    <div className="px-4 sm:px-6 pt-12 pb-16 max-w-6xl mx-auto" dir="rtl">
      <DamijSEO
        title="دعم التوحّد — منصة دامج"
        description="نظام دعم التوحّد من منصة دامج: تشخيص ذكي وفق DSM-5 و M-CHAT-R/F، برنامج علاجي 90 يوماً، مكتبة ألعاب تفاعلية، وملف تقدّم الطفل."
        path="/damij/autism"
        keywords="التوحد, تشخيص التوحد, علاج التوحد, DSM-5, M-CHAT, منصة دامج التوحد"
      />
      {/* Hero */}
      <header className="text-center mb-10 sm:mb-12">
        <div
          className={`mx-auto mb-5 w-24 h-24 rounded-[2rem] flex items-center justify-center ${reduceMotion ? '' : 'autism-float'}`}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--autism-primary)) 0%, hsl(var(--autism-accent)) 100%)',
            boxShadow: 'var(--autism-shadow-soft)',
          }}
        >
          <Brain className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[hsl(var(--autism-text))] mb-3">
          نظام التوحد الذكي
        </h1>
        <p className={`${isYoung ? 'text-xl' : 'text-base sm:text-lg'} text-[hsl(var(--autism-muted))] max-w-2xl mx-auto leading-relaxed`}>
          {isYoung
            ? '🎈 العب وتعلّم مع رفاقك الجدد!'
            : 'تشخيص دقيق، برنامج يومي مولّد بالذكاء الاصطناعي، وتقارير سلوكية تفصيلية لكل طفل.'}
        </p>

        {/* Profile chip + streak */}
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

        {activeProgram && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(`/damij/autism/program/${activeProgram.id}`)}
              className="px-5 py-2.5 rounded-2xl bg-[hsl(var(--autism-primary))] text-white font-bold inline-flex items-center gap-2 shadow-md hover:opacity-90 transition">
              <Calendar className="w-5 h-5" /> فتح جدول البرنامج
            </button>
            <button
              onClick={() => navigate(`/damij/autism/program/${activeProgram.id}/dashboard`)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[hsl(var(--autism-primary)/0.3)] text-[hsl(var(--autism-primary))] font-bold inline-flex items-center gap-2 hover:border-[hsl(var(--autism-accent))]">
              <Sparkles className="w-5 h-5" /> لوحة التقدّم
            </button>
          </div>
        )}
      </header>

      {/* Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isYoung ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4 sm:gap-6`}>
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={c.to}
              onClick={() => navigate(c.to)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`group text-right p-5 sm:p-6 rounded-3xl border-2 bg-gradient-to-br ${TONE_BG[c.tone]} ${reduceMotion ? '' : 'autism-pop'} hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center ${TONE_TEXT[c.tone]} shadow-sm`}>
                  <Icon className="w-7 h-7" />
                </span>
                <span className={`${isYoung ? 'text-5xl' : 'text-4xl'}`} aria-hidden>{c.emoji}</span>
              </div>
              <div className={`font-bold ${isYoung ? 'text-xl' : 'text-lg'} ${TONE_TEXT[c.tone]} mb-1`}>{c.title}</div>
              {!isYoung && (
                <p className={`${baseTextClass} text-[hsl(var(--autism-muted))] leading-relaxed`}>{c.desc}</p>
              )}
            </button>
          );
        })}
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
