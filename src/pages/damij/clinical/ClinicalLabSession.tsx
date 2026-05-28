import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send, Mic, MicOff, Sparkles, ArrowRight, Volume2, MessageSquare, FlaskConical, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ClinicalCase, ClinicalProtocol, ClinicalSession } from '@/features/clinical/types';
import InterventionTryPanel from '@/features/clinical/InterventionTryPanel';
import DeviceLauncher from '@/features/clinical/devices/DeviceLauncher';
import VitalsMonitor from '@/features/clinical/ui/VitalsMonitor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const QUICK_ACTIONS = [
  { key: 'reinforce', ar: 'تعزيز إيجابي 👍', help: 'مدح أو مكافأة فورية بعد سلوك مرغوب لزيادة احتماليّة تكراره (Positive Reinforcement). يرفع الانتباه ويخفّض القلق.' },
  { key: 'prompt', ar: 'تلميح/Prompt', help: 'إعطاء تلميح لفظي/بصري/جسدي لمساعدة المريض على إنجاز المهمة. يُلاشى تدريجياً (Prompt Fading).' },
  { key: 'reduce', ar: 'تخفيف الصعوبة', help: 'تجزئة المهمة أو تقليل متطلباتها لتفادي الإحباط (Task Analysis / Errorless Learning).' },
  { key: 'sensory_break', ar: 'استراحة حسّية', help: 'وقفة قصيرة لتنظيم الحالة الحسّية (تنفس، حركة، عزل صوتي). يخفّض القلق ويُعيد ضبط الانتباه.' },
  { key: 'model', ar: 'نمذجة سلوك', help: 'أداء السلوك المطلوب أمام المريض ليُقلّده (Modeling). فعّال خاصةً مع التوحّد.' },
];

const ClinicalLabSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClinicalSession | null>(null);
  const [c, setC] = useState<ClinicalCase | null>(null);
  const [p, setP] = useState<ClinicalProtocol | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [msg, setMsg] = useState('');
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!sessionId) return;
    const { data: s } = await supabase.from('clinical_sessions').select('*').eq('id', sessionId).maybeSingle();
    if (!s) { setLoading(false); return; }
    setSession(s as any);
    const isFree = (s as any).mode === 'free';
    const [{ data: cd }, pdRes, { data: ev }] = await Promise.all([
      supabase.from('clinical_cases').select('*').eq('id', (s as any).case_id).maybeSingle(),
      (s as any).protocol_id
        ? supabase.from('clinical_protocols').select('*').eq('id', (s as any).protocol_id).maybeSingle()
        : Promise.resolve({ data: null } as any),
      supabase.from('clinical_session_events').select('*').eq('session_id', sessionId).order('t_ms', { ascending: true }),
    ]);
    setC(cd as any);
    if (pdRes?.data) setP(pdRes.data as any);
    else if (isFree) {
      const intent = (s as any).free_intent || {};
      setP({
        id: 'free', code: 'free', category: (cd as any)?.category, name_ar: 'تجربة حرّة',
        short_ar: '', goal_ar: intent.title || 'تجربة سريرية مفتوحة',
        steps: [{ title_ar: intent.title || 'التدخّل الحرّ', instruction_ar: intent.details || 'طبّق التدخّل وراقب الاستجابة', duration_sec: 600, success_ar: 'استجابة إيجابية بدون آثار سلبية' }],
        reference_ar: '',
      } as any);
    }
    setEvents((ev as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [sessionId]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [events]);

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const sendTurn = async (action?: string) => {
    if (!sessionId || sending) return;
    if (!msg && !action) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-patient-turn', {
        body: { sessionId, studentMessage: msg, studentAction: action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMsg('');
      if (data?.patient_say_ar) speak(data.patient_say_ar);
      await load();
    } catch (e: any) {
      const m = e?.message ?? 'تعذّر الإرسال';
      if (m.includes('429')) toast.error('تم تجاوز حد الطلبات، حاول بعد قليل');
      else if (m.includes('402')) toast.error('انتهى رصيد AI، أضف رصيداً من إعدادات Workspace');
      else toast.error(m);
    } finally { setSending(false); }
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('متصفحك لا يدعم الإدخال الصوتي'); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const r = new SR(); r.lang = 'ar-SA'; r.continuous = false; r.interimResults = false;
    r.onresult = (ev: any) => setMsg((m) => (m ? m + ' ' : '') + ev.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  };

  const finalize = async () => {
    if (!sessionId) return;
    setFinalizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-finalize-report', { body: { sessionId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('تم إنشاء التقرير');
      navigate(`/damij/clinical/report/${data.reportId}`);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر إنشاء التقرير'); }
    finally { setFinalizing(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!session || !c || !p) return <div className="text-center pt-20">الجلسة غير موجودة</div>;

  const step: any = (p.steps || [])[session.current_step] || {};
  const steps = (p.steps || []).length;

  return (
    <div className="px-3 sm:px-4 pt-4 pb-16 max-w-[1400px] mx-auto" dir="rtl">
      <button onClick={() => navigate(`/damij/clinical/case/${c.id}`)}
        className="px-3 py-1.5 mb-3 rounded-lg bg-white border text-sm flex items-center gap-1">
        <ArrowRight className="w-4 h-4" /> الحالة
      </button>

      <header className="mb-3">
        <h1 className="text-lg sm:text-xl font-bold text-[hsl(var(--damij-primary))]">{p.name_ar} • {c.name_ar}</h1>
        <div className="text-xs text-slate-500">الخطوة {session.current_step + 1}/{steps}: {step.title_ar}</div>
      </header>

      {/* 3-column workspace: [side metrics | conversation | tools tabs] */}
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT: vitals + protocol + finalize (sticky) */}
        <aside className="space-y-3 lg:sticky lg:top-3 self-start max-h-[calc(100vh-1.5rem)] overflow-y-auto pr-1">
          <VitalsMonitor
            vitals={{ ...((c as any).vitals_initial || {}), ...((session as any).vitals_state || {}) }}
            ageYears={(c as any).age_years}
          />
          <div className="p-3 rounded-2xl bg-white border">
            <div className="text-[11px] text-slate-500 mb-2">المؤشرات الحيّة</div>
            <Metric label="الانتباه" value={session.attention} color="emerald" />
            <Metric label="القلق" value={session.anxiety} color="rose" invert />
            <Metric label="التقدّم" value={session.progress} color="sky" />
          </div>
          <div className="p-3 rounded-2xl bg-white border text-xs">
            <div className="font-bold text-[hsl(var(--damij-primary))] mb-1">خطوات البروتوكول</div>
            <ol className="space-y-1">
              {(p.steps || []).map((s: any, i: number) => (
                <li key={i} className={`flex items-center gap-2 ${i === session.current_step ? 'font-bold text-[hsl(var(--damij-accent-2))]' : i < session.current_step ? 'text-emerald-600 line-through' : 'text-slate-500'}`}>
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">{i + 1}</span>
                  <span className="line-clamp-1">{s.title_ar}</span>
                </li>
              ))}
            </ol>
          </div>
          <button onClick={finalize} disabled={finalizing}
            className="w-full py-2.5 rounded-2xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            إنهاء وتوليد التقرير
          </button>
        </aside>

        {/* CENTER: Conversation */}
        <section className="rounded-3xl bg-white border flex flex-col min-w-0 h-[calc(100vh-9rem)]">
          <div className="p-3 border-b bg-slate-50 rounded-t-3xl">
            <SectionHeader icon={<MessageSquare className="w-4 h-4" />} title="المحادثة مع المريض" />
            <div className="text-sm font-bold text-[hsl(var(--damij-primary))]">📋 {step.instruction_ar}</div>
            <div className="text-xs text-slate-500 mt-1">معيار النجاح: {step.success_ar}</div>
          </div>
          <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {events.length === 0 && <div className="text-center text-slate-400 text-sm pt-8">ابدأ بإعطاء التعليمة للمريض الافتراضي…</div>}
            {events.map((e: any) => (
              <div key={e.id} className={`flex ${e.actor === 'student' ? 'justify-start' : e.actor === 'patient' ? 'justify-end' : 'justify-center'}`}>
                <div className={`max-w-[85%] p-2 rounded-xl text-sm ${
                  e.actor === 'student' ? 'bg-sky-50 border border-sky-200'
                  : e.actor === 'patient' ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-amber-50 border border-amber-200 text-xs italic'
                }`}>
                  <div className="text-[10px] opacity-60 mb-0.5">
                    {e.actor === 'student' ? '👨‍🎓 الطالب' : e.actor === 'patient' ? `🧒 ${c.name_ar}` : '🧠 ملاحظة سريرية'}
                  </div>
                  {e.event_type === 'clinical_note' ? e.payload?.note : (e.payload?.say || e.payload?.action)}
                  {e.actor === 'patient' && e.payload?.say && (
                    <button onClick={() => speak(e.payload.say)} className="mr-2 text-[10px] opacity-60 inline-flex items-center gap-0.5">
                      <Volume2 className="w-3 h-3" /> استمع
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t space-y-2">
            <div className="flex flex-wrap gap-1">
              {QUICK_ACTIONS.map(a => (
                <button key={a.key} disabled={sending} onClick={() => sendTurn(a.ar)}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50">{a.ar}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleVoice} className={`p-2 rounded-lg border ${listening ? 'bg-rose-100 border-rose-300' : 'bg-white'}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input value={msg} onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendTurn()}
                placeholder="اكتب ما ستقوله للمريض…"
                className="flex-1 px-3 py-2 rounded-lg border bg-white text-sm" />
              <button onClick={() => sendTurn()} disabled={sending || (!msg)}
                className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center gap-1 disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Tools tabs — interventions / devices side-by-side, no vertical stack */}
        <section className="rounded-3xl bg-white border min-w-0 h-[calc(100vh-9rem)] flex flex-col">
          <Tabs defaultValue="interventions" className="flex flex-col h-full">
            <TabsList className="m-3 grid grid-cols-2">
              <TabsTrigger value="interventions" className="gap-1.5"><FlaskConical className="w-4 h-4" /> التدخلات</TabsTrigger>
              <TabsTrigger value="devices" className="gap-1.5"><Stethoscope className="w-4 h-4" /> الأجهزة</TabsTrigger>
            </TabsList>
            <TabsContent value="interventions" className="flex-1 overflow-y-auto px-3 pb-3 mt-0">
              <InterventionTryPanel sessionId={sessionId} caseCategory={c.category} onApplied={load} />
            </TabsContent>
            <TabsContent value="devices" className="flex-1 overflow-y-auto px-3 pb-3 mt-0">
              <DeviceLauncher sessionId={sessionId} caseCategory={c.category} caseContext={{
                category: c.category, severity: (c as any).severity, age_years: (c as any).age_years,
                vitals: { ...((c as any).vitals_initial || {}), ...((session as any).vitals_state || {}) },
                presenting_signs_ar: (c as any).presenting_signs_ar, name_ar: c.name_ar,
                vitals_state: (session as any).vitals_state || {},
              } as any} onApplied={load} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; hint?: string }> = ({ icon, title, hint }) => (
  <div className="flex items-center justify-between mb-1">
    <h2 className="text-sm font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-2">{icon} {title}</h2>
    {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
  </div>
);

const Metric: React.FC<{ label: string; value: number; color: string; invert?: boolean }> = ({ label, value, color, invert }) => {
  const map: Record<string, string> = { emerald: 'bg-emerald-500', rose: 'bg-rose-500', sky: 'bg-sky-500' };
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between text-xs mb-0.5"><span>{label}</span><span className="font-bold">{Math.round(value)}</span></div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${map[color]} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

export default ClinicalLabSession;
