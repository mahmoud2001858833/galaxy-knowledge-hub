import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  CheckCircle2,
  Loader2,
  Lightbulb,
  Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import heroImg from '@/assets/damij-doctor-survey-hero.jpg';

type Choice = { value: string; label: string };
type Question = {
  id: string;
  text: string;
  hint?: string;
  choices: Choice[];
  multi?: boolean;
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'منصة "دامج" تجمع أدوات لذوي الإعاقة (التوحد، ADHD، البصر، السمع، البريل، لغة الإشارة) في مكان واحد. ما تقييمك لهذه الفكرة؟',
    choices: [
      { value: 'excellent', label: 'فكرة ممتازة وضرورية في العالم العربي' },
      { value: 'good', label: 'جيدة لكن بحاجة لمزيد من التطوير' },
      { value: 'neutral', label: 'محايد — أحتاج لتجربتها أكثر' },
      { value: 'not_needed', label: 'لا أرى لها قيمة مضافة' },
    ],
  },
  {
    id: 'q2',
    text: 'ما رأيك بأدوات الفحص المبكر داخل دامج (Screening للتوحد و ADHD) كخطوة قبل التحويل للتقييم السريري؟',
    choices: [
      { value: 'very_important', label: 'مهمة جداً وتوفّر وقت الطبيب' },
      { value: 'important', label: 'مهمة كأداة مساعدة' },
      { value: 'somewhat', label: 'مفيدة لكن نتائجها تحتاج تحقّق' },
      { value: 'not_important', label: 'لا أعتمد عليها' },
    ],
  },
  {
    id: 'q3',
    text: 'دامج يستخدم الذكاء الاصطناعي (Gemini) لتوليد التقارير والتوصيات. ما موقفك من هذا التوجّه؟',
    choices: [
      { value: 'yes_safe', label: 'أؤيده مع ضوابط ومراجعة الطبيب' },
      { value: 'yes_assist', label: 'أؤيده كأداة مساعدة فقط' },
      { value: 'unsure', label: 'لست متأكداً — أحتاج لمزيد من الشفافية' },
      { value: 'no_risky', label: 'أعارضه — قد يربك الأهل' },
    ],
  },
  {
    id: 'q4',
    text: 'أي قسم من أقسام دامج تراه الأكثر فائدة لعملك السريري؟',
    multi: true,
    hint: 'يمكنك اختيار أكثر من قسم',
    choices: [
      { value: 'autism', label: 'قسم التوحد (فحص + ألعاب تفاعلية)' },
      { value: 'adhd', label: 'قسم ADHD (مقاييس + برامج تدريب)' },
      { value: 'clinical', label: 'الحالات السريرية والأجهزة التفاعلية (ECG / AED / سماعة)' },
      { value: 'sign_braille', label: 'مترجم لغة الإشارة وأدوات البريل' },
    ],
  },
  {
    id: 'q5',
    text: 'لأي فئة عمرية يجب أن تركّز دامج على تطوير محتواها أولاً؟',
    choices: [
      { value: 'children', label: 'الأطفال (0-12) — الكشف والتدخل المبكر' },
      { value: 'teens', label: 'اليافعون (13-18) — الدعم الأكاديمي والنفسي' },
      { value: 'adults', label: 'البالغون (19-60) — الاستقلالية والعمل' },
      { value: 'all', label: 'جميع الفئات بالتساوي' },
    ],
  },
  {
    id: 'q6',
    text: 'تقارير دامج قابلة للمشاركة عبر رابط آمن بين الأهل والطبيب والمدرسة. ما رأيك بهذه الميزة؟',
    choices: [
      { value: 'great', label: 'ممتازة — تسهّل التواصل والمتابعة' },
      { value: 'with_privacy', label: 'جيدة بشرط ضمان الخصوصية الكاملة' },
      { value: 'concerned', label: 'قلق من تسرّب بيانات حساسة' },
      { value: 'against', label: 'لا أحبذها' },
    ],
  },
  {
    id: 'q7',
    text: 'ما مدى ثقتك بمحتوى دامج الطبي العربي (المراجع، التوصيات، البروتوكولات)؟',
    choices: [
      { value: 'high', label: 'ثقة عالية' },
      { value: 'medium', label: 'ثقة متوسطة — أراجع المصادر' },
      { value: 'low', label: 'ثقة منخفضة — أحتاج لاعتمادات أكثر' },
      { value: 'need_more', label: 'لم أتمكّن من تقييمه بعد' },
    ],
  },
  {
    id: 'q8',
    text: 'قسم لغة الإشارة والبريل في دامج: ما الذي تحتاجه أكثر؟',
    choices: [
      { value: 'medical_vocab', label: 'قاموس طبي بلغة الإشارة' },
      { value: 'live_translate', label: 'ترجمة فورية أثناء الكشف' },
      { value: 'training', label: 'تدريب للأطباء على أساسيات الإشارة' },
      { value: 'braille_reports', label: 'تقارير طبية بصيغة بريل للمرضى المكفوفين' },
    ],
  },
  {
    id: 'q9',
    text: 'دامج يوفّر "الجسر الحسّي العكسي" — محاكاة تجربة الإعاقة افتراضياً لزيادة تعاطف الأطباء. ما رأيك بهذه الفكرة؟',
    choices: [
      { value: 'very_useful', label: 'مفيدة جداً — يجب إدراجها في تدريب الأطباء' },
      { value: 'useful', label: 'مفيدة كتجربة توعوية' },
      { value: 'limited', label: 'فائدتها محدودة عملياً' },
      { value: 'not_useful', label: 'غير مفيدة في الممارسة' },
    ],
  },
  {
    id: 'q10',
    text: 'ما الأولوية التي تتمنى أن تركّز عليها دامج في تحديثاتها القادمة؟',
    choices: [
      { value: 'more_specialties', label: 'إضافة إعاقات وتخصصات جديدة' },
      { value: 'parent_tools', label: 'أدوات أعمق لتدريب وتمكين الأهل' },
      { value: 'school_integration', label: 'التكامل مع المدارس والمعلمين' },
      { value: 'research', label: 'بناء قاعدة بيانات بحثية عربية' },
    ],
  },
];

// Step layout: 0 = intro+info, 1..10 = questions, 11 = review
const TOTAL_STEPS = QUESTIONS.length + 2;

const DamijDoctorSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const setAnswer = (id: string, v: string, multi?: boolean) => {
    setAnswers((a) => {
      if (!multi) return { ...a, [id]: v };
      const cur = (a[id] as string[]) || [];
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      return { ...a, [id]: next };
    });
  };

  const isAnswered = (q: Question) => {
    const v = answers[q.id];
    if (q.multi) return Array.isArray(v) && v.length > 0;
    return typeof v === 'string' && v.length > 0;
  };

  const goNext = () => {
    if (step === 0 && !doctorName.trim()) {
      toast.error('من فضلك أدخل اسمك للمتابعة');
      return;
    }
    if (step >= 1 && step <= QUESTIONS.length) {
      if (!isAnswered(QUESTIONS[step - 1])) {
        toast.error('يرجى اختيار إجابة للمتابعة');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('damij_doctor_surveys').insert({
        doctor_name: doctorName.trim(),
        specialty: specialty.trim() || null,
        workplace: workplace.trim() || null,
        email: email.trim() || null,
        answers,
      });
      if (error) throw error;
      setDone(true);
      toast.success('شكراً لمشاركتك أفكارك معنا');
    } catch (e: any) {
      toast.error(e.message || 'تعذّر إرسال الاستبيان');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  if (done) {
    return (
      <div className="damij-root min-h-screen flex items-center justify-center px-6" dir="rtl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl shadow-2xl p-10 max-w-md text-center"
          style={{ background: 'hsl(var(--damij-surface))' }}
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'hsl(var(--damij-success) / 0.15)' }}>
            <CheckCircle2 className="w-14 h-14" style={{ color: 'hsl(var(--damij-success))' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'hsl(var(--damij-primary))' }}>
            تم استلام أفكارك بنجاح
          </h2>
          <p className="mb-6 leading-relaxed" style={{ color: 'hsl(var(--damij-muted))' }}>
            شكراً جزيلاً دكتور/ة على وقتك وأفكارك القيّمة. آراؤك ستساعدنا في تطوير منصة دامج.
          </p>
          <button
            onClick={() => navigate('/damij')}
            className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition"
            style={{ background: 'hsl(var(--damij-primary))' }}
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="damij-root min-h-screen" dir="rtl"
      style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}>
      <Helmet>
        <title>استبيان الأطباء — منصة دامج</title>
        <meta name="description" content="استبيان مخصص للأطباء وأخصائيي الرعاية الصحية لمشاركة آرائهم وأفكارهم حول منصة دامج للدمج التعليمي وأدواتها لذوي الإعاقة." />
        <link rel="canonical" href="https://damij-jo.life/damij/doctor-survey" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://damij-jo.life/damij/doctor-survey" />
        <meta property="og:title" content="استبيان الأطباء — منصة دامج" />
        <meta property="og:description" content="شارك أفكارك ورؤيتك كطبيب أو أخصائي حول منصة دامج وأدواتها للتوحد، ADHD، البصر، السمع، البريل ولغة الإشارة." />
        <meta property="og:image" content="https://damij-jo.life/damij-doctor-survey-og.jpg" />
        <meta property="og:locale" content="ar_AR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="استبيان الأطباء — منصة دامج" />
        <meta name="twitter:description" content="شارك أفكارك كطبيب حول منصة دامج للدمج التعليمي وأدواتها لذوي الإعاقة." />
        <meta name="twitter:image" content="https://damij-jo.life/damij-doctor-survey-og.jpg" />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        <Link
          to="/damij"
          className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition"
          style={{ color: 'hsl(var(--damij-primary))' }}
        >
          <ArrowRight className="w-4 h-4" /> العودة للمنصة
        </Link>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm font-semibold"
            style={{ color: 'hsl(var(--damij-primary))' }}>
            <span>
              {step === 0
                ? 'البداية'
                : step === TOTAL_STEPS - 1
                ? 'المراجعة والإرسال'
                : `السؤال ${step} من ${QUESTIONS.length}`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden"
            style={{ background: 'hsl(var(--damij-border))' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--damij-primary)), hsl(var(--damij-accent)))' }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: Hero + info */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl shadow-xl overflow-hidden"
              style={{ background: 'hsl(var(--damij-surface))' }}
            >
              <div className="relative">
                <img
                  src={heroImg}
                  alt="استبيان الأطباء"
                  width={1536}
                  height={768}
                  className="w-full h-56 sm:h-72 object-cover"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, hsl(var(--damij-primary) / 0.85), transparent 60%)' }} />
                <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold">استبيان الأطباء</h1>
                      <p className="text-white/85 text-sm">شاركنا أفكارك ورؤيتك حول منصة دامج</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-3 p-4 rounded-2xl mb-6"
                  style={{ background: 'hsl(var(--damij-accent) / 0.1)' }}>
                  <Lightbulb className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--damij-accent))' }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--damij-text))' }}>
                    هذا الاستبيان موجّه للأطباء والممارسين الصحيين. الأسئلة تدور حول <strong>الأفكار والرؤية</strong> فقط
                    — لا علاقة لها بالأداء الوظيفي، وكل الإجابات سرّية وتُستخدم لتطوير المنصة فقط.
                  </p>
                </div>

                <h2 className="font-bold mb-4 text-lg" style={{ color: 'hsl(var(--damij-primary))' }}>
                  معلومات تعريفية
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    placeholder="الاسم *"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="التخصص (مثال: طب أطفال)"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="جهة العمل"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="البريد الإلكتروني (اختياري)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* QUESTION STEPS */}
          {step >= 1 && step <= QUESTIONS.length && (() => {
            const q = QUESTIONS[step - 1];
            const selected = answers[q.id];
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl shadow-xl p-6 sm:p-8"
                style={{ background: 'hsl(var(--damij-surface))' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow-md"
                    style={{ background: 'hsl(var(--damij-primary))' }}>
                    {step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4" style={{ color: 'hsl(var(--damij-accent))' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: 'hsl(var(--damij-accent))' }}>
                        سؤال فكري
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold leading-relaxed mb-2"
                  style={{ color: 'hsl(var(--damij-text))' }}>
                  {q.text}
                </h3>
                {q.hint && (
                  <p className="text-sm mb-5" style={{ color: 'hsl(var(--damij-muted))' }}>
                    {q.hint}
                  </p>
                )}

                <div className="grid gap-3 mt-6">
                  {q.choices.map((c) => {
                    const active = q.multi
                      ? Array.isArray(selected) && selected.includes(c.value)
                      : selected === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => setAnswer(q.id, c.value, q.multi)}
                        className="text-right p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 hover:shadow-md"
                        style={{
                          background: active
                            ? 'hsl(var(--damij-primary) / 0.08)'
                            : 'hsl(var(--damij-bg))',
                          borderColor: active
                            ? 'hsl(var(--damij-primary))'
                            : 'hsl(var(--damij-border))',
                        }}
                      >
                        <div
                          className={`w-6 h-6 rounded-${q.multi ? 'md' : 'full'} border-2 shrink-0 flex items-center justify-center transition`}
                          style={{
                            borderColor: active ? 'hsl(var(--damij-primary))' : 'hsl(var(--damij-border))',
                            background: active ? 'hsl(var(--damij-primary))' : 'transparent',
                          }}
                        >
                          {active && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                        </div>
                        <span className="flex-1 font-semibold text-base sm:text-lg"
                          style={{ color: 'hsl(var(--damij-text))' }}>
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* REVIEW STEP */}
          {step === TOTAL_STEPS - 1 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl shadow-xl p-6 sm:p-8"
              style={{ background: 'hsl(var(--damij-surface))' }}
            >
              <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--damij-primary))' }}>
                مراجعة الإجابات
              </h2>
              <p className="mb-6" style={{ color: 'hsl(var(--damij-muted))' }}>
                تأكد من إجاباتك قبل الإرسال. يمكنك العودة لتعديل أي إجابة.
              </p>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {QUESTIONS.map((q, i) => {
                  const v = answers[q.id];
                  const labels = q.multi
                    ? (Array.isArray(v) ? v : [])
                        .map((x) => q.choices.find((c) => c.value === x)?.label)
                        .filter(Boolean)
                        .join('، ')
                    : q.choices.find((c) => c.value === v)?.label || '—';
                  return (
                    <div key={q.id} className="p-4 rounded-xl"
                      style={{ background: 'hsl(var(--damij-bg))', border: '1px solid hsl(var(--damij-border))' }}>
                      <div className="text-xs font-bold mb-1" style={{ color: 'hsl(var(--damij-accent))' }}>
                        سؤال {i + 1}
                      </div>
                      <div className="font-semibold text-sm mb-2" style={{ color: 'hsl(var(--damij-text))' }}>
                        {q.text}
                      </div>
                      <div className="text-sm" style={{ color: 'hsl(var(--damij-primary))' }}>
                        ✓ {labels}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:opacity-90 transition"
                style={{ background: 'hsl(var(--damij-success))' }}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                إرسال الاستبيان
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!done && (
          <div className="flex items-center justify-between gap-3 mt-6">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 transition hover:opacity-80"
              style={{
                background: 'hsl(var(--damij-surface))',
                color: 'hsl(var(--damij-primary))',
                border: '2px solid hsl(var(--damij-border))',
              }}
            >
              <ArrowRight className="w-4 h-4" /> السابق
            </button>
            {step < TOTAL_STEPS - 1 && (
              <button
                onClick={goNext}
                className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition"
                style={{ background: 'hsl(var(--damij-primary))' }}
              >
                {step === 0 ? 'ابدأ الاستبيان' : 'التالي'} <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <p className="text-[11px] text-center mt-6" style={{ color: 'hsl(var(--damij-muted))' }}>
          كل الإجابات مجهولة الهوية وتُستخدم فقط لتحسين منصة دامج.
        </p>
      </div>
    </div>
  );
};

export default DamijDoctorSurvey;
