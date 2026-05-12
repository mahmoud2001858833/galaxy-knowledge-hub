import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const STEPS_BASE = [
  'تحضير الملف التشخيصي للطفل',
  'بناء جدول 3 أشهر (90 يوماً)',
  'توزيع 5 ألعاب جذابة لكل يوم',
  'حفظ البرنامج بشكل دائم في قاعدة البيانات',
  'تجهيز رابط المتابعة',
];

const AutismProgramSetup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const tickRef = useRef<number | null>(null);

  // Auto-redirect if program already exists
  useEffect(() => { (async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { setChecking(false); return; }
    const prof = JSON.parse(raw);
    if (!prof?.profile_id) { setChecking(false); return; }
    const cached = localStorage.getItem(`autism_active_program_${prof.profile_id}`);
    if (cached) { navigate(`/damij/autism/program/${cached}`, { replace: true }); return; }
    const { data } = await supabase
      .from('autism_programs')
      .select('id')
      .eq('child_profile_id', prof.profile_id)
      .eq('status', 'active')
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem(`autism_active_program_${prof.profile_id}`, data.id);
      navigate(`/damij/autism/program/${data.id}`, { replace: true });
      return;
    }
    setChecking(false);
  })(); }, [navigate]);

  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  const startProgress = () => {
    const start = Date.now();
    const estimateMs = 25000; // local generation ~10-20s
    setProgress(0); setStepIdx(0);
    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.round((elapsed / estimateMs) * 95));
      setProgress(pct);
      const sIdx = Math.min(STEPS_BASE.length - 1, Math.floor((pct / 95) * STEPS_BASE.length));
      setStepIdx(sIdx);
    }, 300);
  };
  const stopProgress = (success: boolean) => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    if (success) { setProgress(100); setStepIdx(STEPS_BASE.length - 1); }
  };

  const start = async () => {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) { toast.error('أكمل التشخيص أولاً'); navigate('/damij/autism/diagnosis'); return; }
    const profile = JSON.parse(raw);
    if (!profile.profile_id) { toast.error('ملف الطفل غير مكتمل'); return; }

    setLoading(true);
    startProgress();
    try {
      const { data, error } = await supabase.functions.invoke('autism-generate-program', {
        body: { profile, totalDays: 90, childProfileId: profile.profile_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      stopProgress(true);
      localStorage.setItem(`autism_active_program_${profile.profile_id}`, data.programId);
      toast.success(data.existing ? 'تم فتح برنامج الطفل المحفوظ' : 'تم إنشاء البرنامج بنجاح (90 يوماً × 5 ألعاب)');
      navigate(`/damij/autism/program/${data.programId}`);
    } catch (e: any) {
      console.error(e);
      stopProgress(false);
      toast.error(e?.message ?? 'تعذّر إنشاء البرنامج');
    } finally { setLoading(false); }
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-accent-2))]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-20" dir="rtl">
      <header className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">برنامجك العلاجي لـ 3 أشهر</h1>
        <p className="text-slate-600">جدول يومي مكوّن من <strong>90 يوماً × 5 ألعاب جذابة</strong> مخصّصة لعمر طفلك. يُحفظ مرّة واحدة وتعود إليه بسرعة.</p>
      </header>

      <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/10 mb-6">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" /> ما الذي ستحصل عليه؟</h3>
        <ul className="space-y-2 text-sm text-slate-700 list-disc pr-5">
          <li>450 لعبة تفاعلية موزّعة على 90 يوماً (5 ألعاب يومياً، لا أسئلة مكتوبة).</li>
          <li>6 مراحل تدرّجية: انتباه ⇐ تواصل ⇐ مشاعر ⇐ مرونة ⇐ اجتماعي ⇐ دمج.</li>
          <li>كل لعبة لُعبت تظهر عليها علامة ✓ ولا تتكرّر إلا عند الحاجة.</li>
          <li>مدد الجلسات تُكيَّف تلقائياً مع عمر طفلك.</li>
          <li>تقارير يومية تلقائية بعد إكمال جميع ألعاب اليوم + تنزيل PDF.</li>
        </ul>
      </div>

      <button onClick={start} disabled={loading}
        className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> يولّد البرنامج…</> : <><Sparkles className="w-5 h-5" /> إنشاء البرنامج الآن</>}
      </button>

      {loading && (
        <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm font-bold text-[hsl(var(--damij-primary))]">
            <span>تقدّم التوليد</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[hsl(var(--damij-accent-2))] to-[hsl(var(--damij-primary))] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <ol className="mt-4 space-y-2 text-sm">
            {STEPS_BASE.map((s, i) => {
              const done = i < stepIdx || progress === 100;
              const active = i === stepIdx && progress < 100;
              return (
                <li key={i} className={`flex items-center gap-2 ${done ? 'text-emerald-700' : active ? 'text-[hsl(var(--damij-primary))] font-bold' : 'text-slate-400'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />}
                  {s}
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-slate-500 mt-3">التوليد يحدث مرّة واحدة فقط، ثم يُحفظ بشكل دائم.</p>
        </div>
      )}
    </div>
  );
};

export default AutismProgramSetup;
