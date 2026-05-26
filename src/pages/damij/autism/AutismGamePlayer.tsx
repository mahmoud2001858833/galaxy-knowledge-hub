import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, RotateCcw, ChevronLeft, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATE_REGISTRY, TEMPLATE_META } from '@/features/autism/games/templates/registry';
import BackgroundMusicPlayer from '@/components/damij/BackgroundMusicPlayer';
import Mascot from '@/features/autism/ui/Mascot';
import { celebrate, cheerChild, greetChild, sfxSuccess, vibrateSuccess, getActiveChildName, getActiveParentEmail } from '@/features/autism/ui/gameFX';

const AutismGamePlayer: React.FC = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [done, setDone] = useState<{ accuracy: number; durationMs: number; raw?: any } | null>(null);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const childName = getActiveChildName();
  const parentEmail = getActiveParentEmail();

  useEffect(() => {
    const raw = sessionStorage.getItem('autism_active_game');
    if (!raw) { navigate('/damij/autism/therapy'); return; }
    setGame(JSON.parse(raw));
  }, [navigate]);

  useEffect(() => {
    if (game && !done && childName) greetChild(childName);
  }, [game]); // eslint-disable-line

  const Component = useMemo(() => game ? TEMPLATE_REGISTRY[game.template_id] : null, [game]);

  const sendSessionEmail = async (acc: number, durMs: number, autoCalled = false) => {
    if (!parentEmail) {
      if (!autoCalled) toast.warning('بريد ولي الأمر غير مسجّل');
      return;
    }
    setEmailing(true);
    try {
      const meta = game ? TEMPLATE_META[game.template_id] : null;
      const { error } = await supabase.functions.invoke('autism-email-report', {
        body: {
          kind: 'session',
          child_name: childName || 'طفلك',
          parent_email: parentEmail,
          summary_ar: `أنهى ${childName || 'طفلكم'} لعبة "${game?.title_ar || meta?.title || ''}" بنسبة دقة ${Math.round(acc * 100)}%.`,
          strengths_ar: acc >= 0.7 ? ['تركيز جيد وإتمام اللعبة بثقة'] : [],
          weaknesses_ar: acc < 0.5 ? ['يحتاج تكراراً وتشجيعاً لرفع الدقّة'] : [],
          recommendations_ar: ['كرّر اللعبة لاحقاً بصعوبة أعلى', 'احتفل مع طفلك بالإنجاز'],
          games: [{
            title: game?.title_ar || meta?.title || 'لعبة',
            accuracy: acc,
            duration_sec: Math.round(durMs / 1000),
          }],
        },
      });
      if (error) throw error;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('autism_email_log').insert({
            user_id: user.id,
            recipient_email: parentEmail,
            kind: 'session',
            subject: `تقرير جلسة — ${childName || ''}`,
            status: 'sent',
          });
        }
      } catch { /* log only */ }
      setEmailSent(true);
      toast.success('تم إرسال التقرير لولي الأمر 📧');
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر إرسال البريد');
    } finally {
      setEmailing(false);
    }
  };

  if (!game) return null;
  const meta = TEMPLATE_META[game.template_id];
  const dayBack = game.day_back || '/damij/autism/therapy';

  const handleComplete = async (metrics: { accuracy: number; raw?: any }, durationMs: number) => {
    setDone({ accuracy: metrics.accuracy, durationMs, raw: metrics.raw });
    // Celebration
    celebrate(metrics.accuracy >= 0.7);
    sfxSuccess();
    vibrateSuccess();
    cheerChild(childName, metrics.accuracy);
    // Persist
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profRaw = localStorage.getItem('autism_active_profile');
        const prof = profRaw ? JSON.parse(profRaw) : {};
        await supabase.from('autism_game_sessions').insert({
          user_id: user.id,
          child_profile_id: prof.profile_id ?? null,
          plan_id: game.planId ?? null,
          program_id: game.program_id ?? null,
          day_id: game.day_id ?? null,
          program_game_id: game.program_game_id ?? null,
          template_id: game.template_id,
          stage: game.stage ?? null,
          difficulty: game.difficulty,
          accuracy: metrics.accuracy,
          duration_sec: Math.round(durationMs / 1000),
          raw_metrics: metrics.raw ?? {},
        });
      }
    } catch (e) { console.warn('save session failed', e); }
    // Auto-email parent if configured
    if (parentEmail) sendSessionEmail(metrics.accuracy, durationMs, true);
  };

  const handleSkip = () => {
    toast.info('تم تخطّي اللعبة');
    navigate(dayBack);
  };

  const goToNext = async () => {
    if (game.next_game_index == null || !game.day_id) { navigate(dayBack); return; }
    const { data: gs } = await supabase
      .from('autism_program_games').select('*').eq('day_id', game.day_id).order('order_index');
    const next = (gs || [])[game.next_game_index];
    if (!next) { navigate(dayBack); return; }
    const all = gs || [];
    const idx = game.next_game_index;
    const further = all[idx + 1];
    sessionStorage.setItem('autism_active_game', JSON.stringify({
      template_id: next.template_id,
      title_ar: next.title_ar,
      instructions_ar: next.instructions_ar,
      target_skill_ar: next.target_skill_ar,
      difficulty: next.difficulty,
      duration_sec: next.duration_sec,
      adaptations_ar: next.adaptations_ar,
      program_game_id: next.id,
      day_id: game.day_id,
      program_id: game.program_id,
      next_game_index: further ? idx + 1 : null,
      day_back: dayBack,
    }));
    setDone(null); setEmailSent(false);
    setGame(null);
    setTimeout(() => {
      const raw = sessionStorage.getItem('autism_active_game');
      if (raw) setGame(JSON.parse(raw));
    }, 50);
  };

  if (done) {
    const pct = Math.round(done.accuracy * 100);
    const hasNext = game.next_game_index != null;
    return (
      <div className="max-w-xl mx-auto pt-12 px-6 text-center" dir="rtl">
        <BackgroundMusicPlayer />
        <div className="flex justify-center mb-4">
          <Mascot childName={childName} message={`نسبة الأداء: ${pct}%`} mood="cheer" size="lg" />
        </div>
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-2" />
        <h2 className="text-2xl font-bold mb-2">أحسنت يا {childName || 'بطل'}! 🌟</h2>
        <p className="text-slate-600 mb-6">دقة الأداء: <strong>{pct}%</strong> • المدة: {Math.round(done.durationMs / 1000)} ثانية</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => setDone(null)} className="px-5 py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> إعادة
          </button>
          <button onClick={() => navigate(dayBack)} className="px-5 py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold">
            قائمة اليوم
          </button>
          {hasNext && (
            <button onClick={goToNext} className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center gap-2">
              اللعبة التالية <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {parentEmail && !emailSent && (
            <button onClick={() => sendSessionEmail(done.accuracy, done.durationMs)} disabled={emailing}
              className="px-5 py-3 rounded-xl bg-violet-600 text-white font-bold flex items-center gap-2 disabled:opacity-60">
              {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              إرسال لولي الأمر
            </button>
          )}
          {emailSent && (
            <span className="px-5 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> تم الإرسال
            </span>
          )}
        </div>
        {game.adaptations_ar?.length > 0 && (
          <div className="mt-6 text-right bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 mb-2 text-sm">💡 إذا واجه الطفل صعوبة:</h4>
            <ul className="text-sm text-amber-900 space-y-1 list-disc pr-5">
              {game.adaptations_ar.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-6 pb-12 max-w-3xl mx-auto" dir="rtl">
      <BackgroundMusicPlayer />
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(dayBack)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> الرجوع
        </button>
        <div className="text-center">
          <h1 className="font-bold text-[hsl(var(--damij-primary))]">{meta?.emoji} {game.title_ar}</h1>
          <p className="text-xs text-slate-500">{game.target_skill_ar}{childName ? ` • ${childName}` : ''}</p>
        </div>
        <div className="w-20" />
      </div>
      <div className="bg-white rounded-3xl border border-[hsl(var(--damij-primary))]/10 overflow-hidden">
        {Component ? (
          <Component
            key={game.template_id + (game.program_game_id || '')}
            difficulty={game.difficulty}
            durationSec={game.duration_sec}
            instructions={game.instructions_ar}
            childName={childName}
            adaptations={game.adaptations_ar}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">قالب اللعبة غير متوفر.</div>
        )}
      </div>
    </div>
  );
};

export default AutismGamePlayer;
