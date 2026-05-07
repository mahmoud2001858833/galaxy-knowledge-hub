import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FOCUS = [
  { k: 'sustained_attention', l: 'الانتباه المستمر' },
  { k: 'impulse_control', l: 'التحكم بالاندفاع' },
  { k: 'working_memory', l: 'الذاكرة العاملة' },
  { k: 'cognitive_flexibility', l: 'المرونة المعرفية' },
  { k: 'self_regulation', l: 'تنظيم الذات' },
  { k: 'inhibition', l: 'الكفّ المعرفي' },
];

const ADHDProgramSetup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [weeks, setWeeks] = useState(12);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [focus, setFocus] = useState<string[]>([]);
  const [severity, setSeverity] = useState('moderate');
  const [goals, setGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  const toggle = (k: string) => setFocus(f => f.includes(k) ? f.filter(x=>x!==k) : [...f, k]);

  // Auto-redirect to existing active program
  React.useEffect(() => { (async () => {
    const cached = localStorage.getItem('adhd_active_program');
    if (cached) { navigate(`/damij/adhd/program/${cached}`, { replace: true }); return; }
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) { setChecking(false); return; }
    const { data } = await supabase
      .from('adhd_programs')
      .select('id')
      .eq('user_id', userRes.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem('adhd_active_program', data.id);
      navigate(`/damij/adhd/program/${data.id}`, { replace: true });
    } else {
      setChecking(false);
    }
  })(); }, [navigate]);

  const submit = async () => {
    if (!name || age === '') { toast.error('أكمل البيانات الأساسية'); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('adhd-program-generate', {
        body: { childName: name, childAge: age, weeks, focusAreas: focus, dailyMinutes, severity, goals },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      localStorage.setItem('adhd_active_program', data.program.id);
      toast.success(data.existing ? 'تم فتح برنامجك المحفوظ' : 'تم إنشاء البرنامج (12 أسبوعاً × 10 ألعاب يومياً)');
      navigate(`/damij/adhd/program/${data.program.id}`);
    } catch (e: any) {
      toast.error(e.message || 'تعذّر الإنشاء');
    } finally { setSubmitting(false); }
  };

  if (checking) {
    return <div className="min-h-[60vh] flex items-center justify-center" dir="rtl"><Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--damij-warm))]" /></div>;
  }

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-2xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع</button>
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">إنشاء برنامج علاجي</h1>
      <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-6">سيتم توليد جدول يومي من الألعاب العلاجية بالذكاء الاصطناعي.</p>

      <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">اسم الطفل</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">العمر</label>
            <input type="number" min={3} max={99} value={age} onChange={e=>setAge(e.target.value===''?'':Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">عدد الأسابيع</label>
            <select value={weeks} onChange={e=>setWeeks(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15">
              {[2,4,8,12].map(w=><option key={w} value={w}>{w} أسابيع</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">دقائق يومياً: {dailyMinutes}</label>
          <input type="range" min={10} max={45} step={5} value={dailyMinutes} onChange={e=>setDailyMinutes(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">شدّة الأعراض</label>
          <div className="grid grid-cols-3 gap-2">
            {[['mild','بسيطة'],['moderate','متوسطة'],['severe','شديدة']].map(([k,l])=>(
              <button key={k} onClick={()=>setSeverity(k)} className={`py-2 rounded-xl text-sm font-semibold ${severity===k?'bg-[hsl(var(--damij-warm))] text-white':'bg-[hsl(var(--damij-surface))]'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">مجالات التركيز</label>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS.map(f=>(
              <button key={f.k} onClick={()=>toggle(f.k)} className={`py-2 px-3 rounded-xl text-xs font-semibold text-right ${focus.includes(f.k)?'bg-[hsl(var(--damij-primary))] text-white':'bg-[hsl(var(--damij-surface))]'}`}>{f.l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">أهداف خاصة (اختياري)</label>
          <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15" />
        </div>
        <button onClick={submit} disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--damij-warm))] to-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} إنشاء البرنامج
        </button>
      </div>
    </div>
  );
};
export default ADHDProgramSetup;
