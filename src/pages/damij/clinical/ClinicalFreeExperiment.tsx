import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, ArrowRight, ArrowLeft, Beaker, Pill, Brain, Headphones, Eye, Ear, Stethoscope, MessageCircle, Wand2, ClipboardList, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  ClinicalCase, CATEGORY_EMOJI, CATEGORY_LABEL, SEVERITY_LABEL,
  CATEGORY_THEME, caseAvatarFromName,
} from '@/features/clinical/types';

const TYPES = [
  { key: 'device',      ar: 'جهاز طبي',          icon: Stethoscope, desc: 'سماعة، ECG، AED، ضغط…' },
  { key: 'medication',  ar: 'دواء',              icon: Pill,        desc: 'إعطاء دواء بجرعة وزمن' },
  { key: 'behavioral',  ar: 'علاج سلوكي',         icon: Brain,       desc: 'تعزيز، نمذجة، تشكيل…' },
  { key: 'sensory',     ar: 'تدخّل حسّي',          icon: Headphones,  desc: 'سماعات، استراحة حسّية…' },
  { key: 'aac',         ar: 'تواصل بديل',         icon: MessageCircle, desc: 'PECS، صور، أيقونات…' },
  { key: 'visual_aid',  ar: 'وسيلة بصرية',        icon: Eye,         desc: 'جدول مرئي، قصة اجتماعية…' },
  { key: 'hearing_aid', ar: 'وسيلة سمعية',        icon: Ear,         desc: 'سماعة طبية، FM…' },
  { key: 'educational', ar: 'إجراء تربوي',        icon: ClipboardList, desc: 'تكييف منهج، تعليمات مرئية…' },
  { key: 'custom',      ar: 'تجربة مخصّصة',       icon: Wand2,       desc: 'صف فكرتك بحرية' },
] as const;

type TypeKey = typeof TYPES[number]['key'];

// مكتبة أمثلة جاهزة قابلة للتعديل
type Example = { title: string; details: string; dose?: string; duration?: string };
const EXAMPLES: Record<TypeKey, Example[]> = {
  medication: [
    { title: 'Salbutamol بخّاخ', details: 'بخّاخ موسّع للقصبات لعلاج نوبة الربو الحادة عبر spacer', dose: '100mcg، بختان', duration: 'كل 20 دقيقة × 3' },
    { title: 'Methylphenidate', details: 'منبّه للجهاز العصبي المركزي لعلاج فرط الحركة وتشتت الانتباه', dose: '10mg', duration: 'صباحاً يومياً' },
    { title: 'Insulin Lispro', details: 'إنسولين سريع المفعول قبل الوجبات لمريض السكري النوع 1', dose: '4 وحدات', duration: 'قبل الأكل' },
    { title: 'Paracetamol', details: 'خافض حرارة ومسكن ألم خفيف', dose: '15mg/kg', duration: 'كل 6 ساعات' },
    { title: 'Risperidone', details: 'مضاد ذهان لتقليل سلوكيات العدوانية في التوحد', dose: '0.25mg', duration: 'مساءً' },
    { title: 'Adrenaline IM', details: 'حقنة عضلية للحساسية المفرطة (Anaphylaxis)', dose: '0.3mg', duration: 'جرعة واحدة' },
  ],
  behavioral: [
    { title: 'تعزيز إيجابي مجدول', details: 'تقديم مكافأة بعد كل سلوك مرغوب خلال جلسة التعلّم', duration: '15 دقيقة' },
    { title: 'نمذجة سلوك التحيّة', details: 'يقوم المعالج بنمذجة "السلام عليكم" ويطلب تكرارها', duration: '10 دقائق' },
    { title: 'تشكيل (Shaping)', details: 'تعزيز الخطوات المتتالية نحو السلوك النهائي تدريجياً', duration: '20 دقيقة' },
    { title: 'إطفاء سلوك (Extinction)', details: 'تجاهل السلوك غير المرغوب بشكل ثابت ومنتظم', duration: 'مستمر أسبوع' },
    { title: 'تحليل سلوكي تطبيقي ABA', details: 'جلسة DTT: محاولة قصيرة، استجابة، تعزيز فوري', duration: '30 دقيقة' },
    { title: 'العقد السلوكي', details: 'عقد مكتوب مع الطالب يحدّد السلوك المتوقّع والمكافأة', duration: 'أسبوع' },
  ],
  sensory: [
    { title: 'سماعات عازلة للضجيج', details: 'لتقليل الحمل الحسّي السمعي في البيئات المزدحمة', duration: 'حسب الحاجة' },
    { title: 'استراحة حسّية', details: 'الانتقال إلى ركن هادئ منخفض الإضاءة لمدة قصيرة', duration: '5 دقائق' },
    { title: 'كرة ضغط', details: 'أداة fidget لتفريغ الطاقة وتحسين التركيز', duration: 'أثناء الدرس' },
    { title: 'بطّانية ثقيلة', details: 'ضغط عميق لتنظيم الجهاز الحسّي وتقليل القلق', duration: '10 دقائق' },
    { title: 'فرش حسّي (brushing)', details: 'بروتوكول Wilbarger للفرش وضغط المفاصل', duration: 'كل ساعتين' },
  ],
  aac: [
    { title: 'بطاقات PECS', details: 'تبادل صور لطلب الاحتياجات في 6 مراحل', duration: 'مستمر' },
    { title: 'تطبيق Proloquo2Go', details: 'برنامج تواصل رقمي بالرموز على جهاز لوحي', duration: 'مستمر' },
    { title: 'لوحة رموز ورقية', details: 'لوحة تواصل أساسية بـ 12 رمزاً للحاجات اليومية', duration: 'مستمر' },
    { title: 'لغة الإشارة المبسّطة', details: 'تعليم 10 إشارات أساسية: أكل، شرب، حمّام، نعم، لا…', duration: 'أسبوع' },
  ],
  visual_aid: [
    { title: 'جدول مرئي يومي', details: 'صور مرتّبة لتسلسل أنشطة اليوم على لوحة', duration: 'يومي' },
    { title: 'قصة اجتماعية', details: 'قصة مصوّرة قصيرة تشرح موقفاً اجتماعياً متوقّعاً', duration: '5 دقائق قبل الموقف' },
    { title: 'مؤقّت بصري', details: 'Time Timer لإظهار الوقت المتبقّي للنشاط بشكل مرئي', duration: 'حسب النشاط' },
    { title: 'خرائط مفاهيم', details: 'تنظيم المعلومات بصرياً لتسهيل الفهم والتذكّر', duration: '15 دقيقة' },
  ],
  hearing_aid: [
    { title: 'سماعة طبية BTE', details: 'سماعة خلف الأذن بتضخيم متوسط للفقدان السمعي الحسّي', duration: 'مستمر' },
    { title: 'نظام FM', details: 'مرسل لاسلكي للمعلم ومستقبل للطالب لتقليل ضوضاء الصف', duration: 'أثناء الحصص' },
    { title: 'زرع قوقعة Cochlear', details: 'تأهيل سمعي بعد الزرع: تدريب على تمييز الأصوات', duration: 'جلسات أسبوعية' },
  ],
  educational: [
    { title: 'تكييف المنهج', details: 'تبسيط النص، تقليل الكمية، استخدام صور مساندة', duration: 'مستمر' },
    { title: 'مهام مجزّأة (Chunking)', details: 'تقسيم المهمة الكبيرة إلى خطوات صغيرة محدّدة', duration: 'حسب المهمة' },
    { title: 'تعليمات مرئية متسلسلة', details: 'بطاقات مرتّبة تظهر خطوات تنفيذ المهارة', duration: 'أثناء التدريب' },
    { title: 'تعليم الأقران', details: 'إقران الطالب مع زميل لمساعدته على الفهم والتفاعل', duration: 'حصة كاملة' },
    { title: 'وقت إضافي للاختبار', details: 'منح 50% وقت إضافي للاختبارات الكتابية', duration: 'الاختبار' },
  ],
  device: [
    { title: 'ECG 12-lead', details: 'تخطيط قلب كامل 12 وصلة لتقييم الإيقاع والاحتشاء' },
    { title: 'مقياس أكسجين نبضي', details: 'متابعة SpO₂ والنبض' },
    { title: 'جهاز ضغط آلي', details: 'قياس ضغط الدم والنبض' },
    { title: 'Nebulizer', details: 'جلسة استنشاق سالبوتامول لمدة 10 دقائق' },
    { title: 'AED', details: 'مزيل رجفان آلي خارجي عند توقف القلب' },
  ],
  custom: [],
};

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

  const filtered = useMemo(() => cases.filter(c =>
    !q || `${c.name_ar} ${c.summary_ar}`.toLowerCase().includes(q.toLowerCase())
  ), [cases, q]);

  const useExample = (ex: Example) => {
    setTitle(ex.title); setDetails(ex.details);
    setDose(ex.dose || ''); setDuration(ex.duration || '');
    toast.success('تم تعبئة المثال — عدّله بحرية');
  };

  const startBlank = () => { setTitle(''); setDetails(''); setDose(''); setDuration(''); };

  const launch = async () => {
    if (!picked || !type) {
      toast.error('اختر نوع التدخّل والمريض أولاً');
      return;
    }
    setLaunching(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) console.error('auth error', authErr);
      if (!user) {
        toast.error('سجّل دخولك أولاً للمتابعة');
        navigate('/auth?redirect=/damij/clinical/free');
        return;
      }

      const intent = {
        type, title: title || TYPES.find(t => t.key === type)?.ar,
        details, dose, duration,
      };

      const { data: s, error } = await supabase.from('clinical_sessions').insert({
        user_id: user.id, case_id: picked.id, protocol_id: null,
        status: 'in_progress', current_step: 0,
        attention: 50, anxiety: 50, progress: 0,
        mode: 'free', free_intent: intent,
        vitals_state: (picked as any).vitals_initial || {},
      } as any).select('*').single();
      if (error) {
        console.error('insert clinical_sessions error', error);
        throw error;
      }

      await supabase.from('clinical_session_events').insert({
        session_id: (s as any).id, t_ms: 0, actor: 'system', event_type: 'clinical_note',
        payload: { note: `🧪 تجربة حرّة: ${intent.title}${details ? ' — ' + details : ''}${dose ? ' • جرعة: ' + dose : ''}${duration ? ' • مدّة: ' + duration : ''}` },
      } as any);

      toast.success('بدأت التجربة');
      navigate(`/damij/clinical/lab/${(s as any).id}`);
    } catch (e: any) {
      console.error('launch failed', e);
      toast.error(e?.message ?? 'تعذّر بدء التجربة');
    } finally { setLaunching(false); }
  };

  const stepLabels = ['اختر النوع', 'أدخل التفاصيل', 'اختر المريض', 'مراجعة وبدء'];

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      {/* Stepper أنيق بأسماء */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        {[1, 2, 3, 4].map(n => (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= (n as any)
                  ? 'bg-[hsl(var(--damij-accent-2))] text-white shadow-lg scale-110'
                  : 'bg-slate-200 text-slate-500'
              }`}>{n}</div>
              <span className={`text-[10px] font-bold ${step >= (n as any) ? 'text-[hsl(var(--damij-accent-2))]' : 'text-slate-400'}`}>{stepLabels[n - 1]}</span>
            </div>
            {n < 4 && <div className={`flex-1 h-1 mx-1 rounded mt-[-14px] ${step > (n as any) ? 'bg-[hsl(var(--damij-accent-2))]' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center mb-6">
        <Beaker className="w-10 h-10 mx-auto text-[hsl(var(--damij-accent-2))] mb-2" />
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">تجربة سريرية حرّة</h1>
        <p className="text-sm text-slate-500">{stepLabels[step - 1]}</p>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => { setType(t.key); startBlank(); setStep(2); }}
                className={`text-right p-4 rounded-2xl border-2 bg-white hover:shadow-lg transition-all hover:-translate-y-0.5 ${
                  type === t.key ? 'border-[hsl(var(--damij-accent-2))]' : 'border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'
                }`}>
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-[hsl(var(--damij-primary))]">{t.ar}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2 — examples + form */}
      {step === 2 && type && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Examples library */}
          {EXAMPLES[type].length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--damij-accent-2))]/10 to-white border border-[hsl(var(--damij-accent-2))]/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[hsl(var(--damij-primary))] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--damij-accent-2))]" /> أمثلة جاهزة (انقر لتعبئة الحقول، ثم عدّلها بحرية)
                </h3>
                <button onClick={startBlank} className="text-[11px] px-2 py-1 rounded-full bg-white border hover:bg-slate-50">ابدأ من الصفر</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {EXAMPLES[type].map((ex, i) => (
                  <button key={i} onClick={() => useExample(ex)}
                    className={`text-right p-3 rounded-xl bg-white border hover:border-[hsl(var(--damij-accent-2))]/50 hover:shadow transition ${title === ex.title ? 'ring-2 ring-[hsl(var(--damij-accent-2))]/40' : ''}`}>
                    <div className="text-xs font-bold text-[hsl(var(--damij-primary))] line-clamp-1">{ex.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{ex.details}</div>
                    {(ex.dose || ex.duration) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ex.dose && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">{ex.dose}</span>}
                        {ex.duration && <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">{ex.duration}</span>}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-accent-2))] text-xs font-bold">
                {TYPES.find(t => t.key === type)?.ar}
              </span>
            </div>
            <label className="block">
              <div className="text-xs text-slate-600 mb-1">عنوان التجربة *</div>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={type === 'medication' ? 'مثال: Salbutamol بخّاخ' : type === 'device' ? 'مثال: ECG 12-lead' : 'اكتب عنواناً واضحاً'}
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
                  <div className="text-xs text-slate-600 mb-1">{type === 'medication' ? 'الجرعة/التركيز' : type === 'device' ? 'الإعدادات' : 'الشدّة'}</div>
                  <input value={dose} onChange={e => setDose(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" />
                </label>
              )}
              <label className="block">
                <div className="text-xs text-slate-600 mb-1">المدّة</div>
                <input value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="مثال: 10 دقائق"
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
        </div>
      )}

      {/* Step 3 — pick patient */}
      {step === 3 && (
        <div>
          <div className="relative mb-4 max-w-md mx-auto">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن مريض…"
              className="w-full pr-10 pl-3 py-2 rounded-xl border bg-white text-sm" />
          </div>

          {loadingCases ? (
            <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin inline" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-12 border-2 border-dashed rounded-xl">لا حالات مطابقة</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {filtered.map(c => {
                const theme = CATEGORY_THEME[c.category] || CATEGORY_THEME.internal;
                const avatar = caseAvatarFromName(c.name_ar + (c as any).code, (c as any).gender);
                return (
                  <button key={c.id} onClick={() => setPicked(c)}
                    className={`text-right p-3 rounded-2xl bg-white border-2 transition-all ${
                      picked?.id === c.id ? `border-[hsl(var(--damij-accent-2))] shadow-lg ring-2 ${theme.ring}` : 'border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'
                    }`}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`w-11 h-11 rounded-xl bg-white shadow-sm ring-2 ${theme.ring} flex items-center justify-center text-xl shrink-0`}>{avatar}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-[hsl(var(--damij-primary))] line-clamp-1">{c.name_ar}</div>
                        <div className="text-[11px] text-slate-500">{c.age_years} سنة • {SEVERITY_LABEL[c.severity]}</div>
                      </div>
                      <span className="text-lg opacity-70">{CATEGORY_EMOJI[c.category]}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.summary_ar}</p>
                  </button>
                );
              })}
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

      {/* Step 4 */}
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
