import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DURATIONS = [
  { days: 14, label: 'أسبوعان' },
  { days: 30, label: 'شهر' },
  { days: 60, label: 'شهران' },
  { days: 90, label: '3 أشهر' },
];

const STEPS_BASE = [
  'تحضير الملف التشخيصي للطفل',
  'صياغة بنية الأسابيع والمسارات',
  'توليد ألعاب الأيام عبر الذكاء الاصطناعي',
  'حفظ الجدول الكامل في قاعدة البيانات',
  'تجهيز رابط المتابعة العامة',
];

const AutismProgramSetup: React.FC = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..100
  const tickRef = useRef<number | null>(null);

  // Estimated total time: ~30s per chunk of 14 days
  const estimateMs = Math.max(20000, Math.ceil(days / 14) * 30000);

  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  const startProgress = () => {
    const start = Date.now();
    setProgress(0); setStepIdx(0);
    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      // asymptotic: never quite reaches 95% until done
      const pct = Math.min(95, Math.round((elapsed / estimateMs) * 95));
      setProgress(pct);
      const sIdx = Math.min(STEPS_BASE.length - 1, Math.floor((pct / 95) * STEPS_BASE.length));
      setStepIdx(sIdx);
    }, 400);
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
      const { data: existing } = await supabase
        .from('autism_programs')
        .select('id, share_token')
        .eq('child_profile_id', profile.profile_id)
        .eq('status', 'active')
        .maybeSingle();
      if (existing) {
        stopProgress(true);
        toast.success('برنامج هذا الطفل موجود مسبقاً');
        navigate(`/damij/autism/program/${existing.id}`);
        return;
      }
      const { data, error } = await supabase.functions.invoke('autism-generate-program', {
        body: { profile, totalDays: days, childProfileId: profile.profile_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      stopProgress(true);
      toast.success('تم إنشاء البرنامج بنجاح');
      navigate(`/damij/autism/program/${data.programId}`);
    } catch (e: any) {
      console.error(e);
      stopProgress(false);
      toast.error(e?.message ?? 'تعذّر إنشاء البرنامج');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-20" dir="rtl">
      <header className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">إنشاء برنامج علاجي يومي</h1>
        <p className="text-slate-600">يولّد الذكاء الاصطناعي جدولاً يومياً كاملاً لمدة محددة، ويُحفظ بشكل دائم بدون إعادة توليد.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {DURATIONS.map(d => (
          <button key={d.days} onClick={() => setDays(d.days)} disabled={loading}
            className={`p-4 rounded-2xl border-2 transition font-bold ${days === d.days ? 'border-[hsl(var(--damij-accent-2))] bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))]' : 'border-slate-200 bg-white text-slate-700'}`}>
            <div className="text-2xl">{d.days}</div>
            <div className="text-xs">{d.label}</div>
          </button>
        ))}
      </div>

      <button onClick={start} disabled={loading}
        className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> يولّد البرنامج…</> : <><Sparkles className="w-5 h-5" /> ابدأ التوليد</>}
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
          <p className="text-xs text-slate-500 mt-3">قد يستغرق التوليد دقيقة لكل أسبوعين تقريباً، الرجاء الانتظار.</p>
        </div>
      )}
    </div>
  );
};

export default AutismProgramSetup;
