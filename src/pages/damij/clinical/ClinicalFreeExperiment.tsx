import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, ArrowRight, ArrowLeft, Beaker, Pill, Brain, Headphones, Eye, Ear, Stethoscope, MessageCircle, Wand2, ClipboardList, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES, ClinicalCase, CATEGORY_EMOJI, CATEGORY_LABEL, CATEGORY_GROUP, SEVERITY_LABEL } from '@/features/clinical/types';

const TYPES = [
  { key: 'device',      ar: 'جهاز طبي',          icon: Stethoscope, desc: 'سماعة، ECG، AED، جهاز ضغط…' },
  { key: 'medication',  ar: 'دواء',              icon: Pill,        desc: 'إعطاء دواء بجرعة وزمن محدّدين' },
  { key: 'behavioral',  ar: 'علاج سلوكي',         icon: Brain,       desc: 'تعزيز، نمذجة، تشكيل، إطفاء…' },
  { key: 'sensory',     ar: 'تدخّل حسّي',          icon: Headphones,  desc: 'سماعات عازلة، استراحة حسّية…' },
  { key: 'aac',         ar: 'تواصل بديل',         icon: MessageCircle, desc: 'بطاقات PECS، صور، أيقونات…' },
  { key: 'visual_aid',  ar: 'وسيلة بصرية',        icon: Eye,         desc: 'جدول مرئي، قصة اجتماعية…' },
  { key: 'hearing_aid', ar: 'وسيلة سمعية',        icon: Ear,         desc: 'سماعة طبية، FM، زرع…' },
  { key: 'educational', ar: 'إجراء تربوي',        icon: ClipboardList, desc: 'تكييف منهج، تعليمات مرئية…' },
  { key: 'custom',      ar: 'تجربة مخصّصة',       icon: Wand2,       desc: 'صف فكرتك بحرية' },
] as const;

type TypeKey = typeof TYPES[number]['key'];

const ClinicalFreeExperiment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [type, setType] = useState<TypeKey | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dose, setDose] = useState('');
  const [duration, setDuration] = useState('');
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [grp, setGrp] = useState<'all' | 'special' | 'medical'>('all');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<ClinicalCase | null>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (step !== 3 || cases.length) return;
    setLoadingCases(true);
    supabase.from('clinical_cases').select('*').order('category').limit(500).then(({ data }) => {
      setCases((data as any) || []);
      setLoadingCases(false);
    });
  }, [step]);

  const filtered = useMemo(() => cases.filter(c => {
    if (grp !== 'all' && CATEGORY_GROUP[c.category] !== grp) return false;
    if (q && !`${c.name_ar} ${c.summary_ar}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cases, grp, q]);

  const launch = async () => {
    if (!picked || !type) return;
    setLaunching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('سجّل دخولك أولاً'); return; }

      const intent = {
        type, title: title || TYPES.find(t => t.key === type)?.ar,
        details, dose, duration,
      };

      const { data: s, error } = await supabase.from('clinical_sessions').insert({
        user_id: user.id, case_id: picked.id, protocol_id: null,
        status: 'in_progress', current_step: 0,
        attention: 50, anxiety: 50, progress: 0,
        mode: 'free', free_intent: intent,
      } as any).select('*').single();
      if (error) throw error;

      // Log opening event
      await supabase.from('clinical_session_events').insert({
        session_id: (s as any).id, t_ms: 0, actor: 'system', event_type: 'clinical_note',
        payload: { note: `🧪 تجربة حرّة: ${intent.title}${details ? ' — ' + details : ''}${dose ? ' • جرعة: ' + dose : ''}${duration ? ' • مدّة: ' + duration : ''}` },
      } as any);

      toast.success('بدأت التجربة');
      navigate(`/damij/clinical/lab/${(s as any).id}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'تعذّر بدء التجربة');
    } finally { setLaunching(false); }
  };

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {[1, 2, 3, 4].map(n => (
          <React.Fragment key={n}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= (n as any)
                ? 'bg-[hsl(var(--damij-accent-2))] text-white shadow-lg'
                : 'bg-slate-200 text-slate-500'
            }`}>{n}</div>
            {n < 4 && <div className={`flex-1 h-1 mx-1 rounded ${step > (n as any) ? 'bg-[hsl(var(--damij-accent-2))]' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center mb-6">
        <Beaker className="w-10 h-10 mx-auto text-[hsl(var(--damij-accent-2))] mb-2" />
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">تجربة سريرية حرّة</h1>
        <p className="text-sm text-slate-500">
          {step === 1 && 'الخطوة 1: ما نوع التجربة التي تريد إجراءها؟'}
          {step === 2 && 'الخطوة 2: أدخل تفاصيل التدخّل'}
          {step === 3 && 'الخطوة 3: اختر المريض الافتراضي'}
          {step === 4 && 'الخطوة 4: مراجعة وبدء'}
        </p>
      </div>

      {/* Step 1: type */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => { setType(t.key); setTitle(''); setStep(2); }}
                className={`text-right p-4 rounded-2xl border-2 bg-white hover:shadow-lg transition-all ${
                  type === t.key ? 'border-[hsl(var(--damij-accent-2))]' : 'border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'
                }`}>
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-[hsl(var(--damij-primary))]">{t.ar}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: details chat-box */}
      {step === 2 && type && (
        <div className="max-w-2xl mx-auto space-y-3 bg-white p-5 rounded-2xl border">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-accent-2))] text-xs font-bold">
              {TYPES.find(t => t.key === type)?.ar}
            </span>
          </div>
          <label className="block">
            <div className="text-xs text-slate-600 mb-1">عنوان التجربة *</div>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder={type === 'medication' ? 'مثال: Salbutamol بخّاخ' : type === 'device' ? 'مثال: ECG 12-lead' : 'مثال: نمذجة سلوك التحيّة'}
              className="w-full px-3 py-2 rounded-lg border text-sm" />
          </label>
          <label className="block">
            <div className="text-xs text-slate-600 mb-1">صف التدخّل بالتفصيل</div>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4}
              placeholder="ماذا ستفعل بالضبط؟ كيف؟ في أي ظرف؟ ما النتيجة المتوقَّعة؟"
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(type === 'medication' || type === 'device' || type === 'sensory') && (
              <label className="block">
                <div className="text-xs text-slate-600 mb-1">{type === 'medication' ? 'الجرعة/التركيز' : type === 'device' ? 'الإعدادات/المعاملات' : 'الشدّة'}</div>
                <input value={dose} onChange={e => setDose(e.target.value)}
                  placeholder={type === 'medication' ? '100mcg، 2 بخّة' : type === 'device' ? 'HR target 80…' : 'متوسطة'}
                  className="w-full px-3 py-2 rounded-lg border text-sm" />
              </label>
            )}
            <label className="block">
              <div className="text-xs text-slate-600 mb-1">المدّة</div>
              <input value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="مثال: 10 دقائق، جرعة واحدة"
                className="w-full px-3 py-2 rounded-lg border text-sm" />
            </label>
          </div>

          <div className="flex justify-between pt-3">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border text-sm flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={() => title.trim() ? setStep(3) : toast.error('أدخل عنوان التجربة')}
              className="px-5 py-2 rounded-lg bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center gap-1">
              التالي <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: pick patient */}
      {step === 3 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {([['all','الكل'],['special','تربية خاصة'],['medical','تخصصات طبية']] as const).map(([k,l]) => (
              <button key={k} onClick={() => setGrp(k as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${grp===k ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]' : 'bg-white text-slate-700 border-slate-200'}`}>
                {l}
              </button>
            ))}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن مريض…"
                className="w-full pr-9 pl-3 py-1.5 rounded-lg border bg-white text-sm" />
            </div>
          </div>

          {loadingCases ? (
            <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin inline" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-12 border-2 border-dashed rounded-xl">لا حالات مطابقة</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {filtered.map(c => (
                <button key={c.id} onClick={() => setPicked(c)}
                  className={`text-right p-3 rounded-xl bg-white border-2 transition-all ${
                    picked?.id === c.id ? 'border-[hsl(var(--damij-accent-2))] shadow-lg' : 'border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{CATEGORY_EMOJI[c.category]}</span>
                    <div className="font-bold text-sm text-[hsl(var(--damij-primary))]">{c.name_ar}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-1">{c.age_years} سنة • {SEVERITY_LABEL[c.severity]} • {CATEGORY_LABEL[c.category]}</div>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.summary_ar}</p>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border text-sm flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={() => picked ? setStep(4) : toast.error('اختر مريضاً')}
              className="px-5 py-2 rounded-lg bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center gap-1 disabled:opacity-50">
              التالي <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: review & launch */}
      {step === 4 && picked && type && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border space-y-4">
          <h2 className="font-bold text-lg text-[hsl(var(--damij-primary))]">مراجعة التجربة</h2>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500 mb-1">نوع التدخّل</div>
              <div className="font-bold">{TYPES.find(t => t.key === type)?.ar}</div>
              <div className="text-xs text-slate-700 mt-1">{title}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500 mb-1">المريض</div>
              <div className="font-bold">{CATEGORY_EMOJI[picked.category]} {picked.name_ar}</div>
              <div className="text-xs text-slate-700 mt-1">{picked.age_years} سنة • {SEVERITY_LABEL[picked.severity]}</div>
            </div>
          </div>

          {(details || dose || duration) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              {details && <div><b>التفاصيل: </b>{details}</div>}
              {dose && <div><b>الجرعة/الإعدادات: </b>{dose}</div>}
              {duration && <div><b>المدّة: </b>{duration}</div>}
            </div>
          )}

          <div className="text-[11px] text-slate-500 p-2 rounded bg-slate-50 border text-center">
            ⚠️ محاكاة تعليمية فقط — ليست بديلاً عن قرار سريري حقيقي
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg border text-sm flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={launch} disabled={launching}
              className="px-6 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50">
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              ابدأ التجربة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalFreeExperiment;
