import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Stethoscope, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QUESTIONS: { id: string; text: string; type: 'scale' | 'text' }[] = [
  { id: 'q1', text: 'ما رأيك في فكرة وجود منصة عربية موحّدة تجمع أدوات دعم ذوي الإعاقة (التوحد، ADHD، الإعاقة البصرية، السمعية) في مكان واحد؟', type: 'text' },
  { id: 'q2', text: 'ما مدى أهمية الفحص المبكر الرقمي (Screening) للأطفال قبل تحويلهم للتقييم السريري الكامل من وجهة نظرك؟', type: 'scale' },
  { id: 'q3', text: 'هل ترى أن دمج الذكاء الاصطناعي في أدوات التشخيص الأوّلي فكرة تستحق التطوير، أم أنها قد تربك الأهل؟ ولماذا؟', type: 'text' },
  { id: 'q4', text: 'ما الفكرة أو الميزة التي تتمنى لو كانت متوفرة في منصة دامج لمساعدتك في عملك السريري أو في توجيه أهالي المرضى؟', type: 'text' },
  { id: 'q5', text: 'برأيك، ما الفئة العمرية الأكثر حاجة لأدوات الدعم الرقمية: الأطفال، اليافعون، البالغون، أم كبار السن؟ ولماذا؟', type: 'text' },
  { id: 'q6', text: 'ما رأيك في فكرة توفير تقارير قابلة للمشاركة بين الأهل والطبيب والمدرسة عبر رابط آمن؟', type: 'text' },
  { id: 'q7', text: 'ما مدى ثقتك بمصادر المحتوى الطبي العربي الرقمي بشكل عام؟', type: 'scale' },
  { id: 'q8', text: 'ما الأفكار التي تقترحها لتقريب لغة الإشارة وبريل من المجتمع الطبي والممارسين؟', type: 'text' },
  { id: 'q9', text: 'هل ترى فكرة "الجسر الحسّي العكسي" (تجربة الإعاقة افتراضياً لزيادة التعاطف) فكرة مفيدة في التعليم الطبي؟ كيف؟', type: 'text' },
  { id: 'q10', text: 'شاركنا فكرة واحدة تتمنى أن تتبنّاها منصة دامج خلال السنة القادمة.', type: 'text' },
];

const SCALE_LABELS = ['لا أوافق إطلاقاً', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة'];

const DamijDoctorSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const setAnswer = (id: string, v: string | number) =>
    setAnswers((a) => ({ ...a, [id]: v }));

  const allAnswered = QUESTIONS.every((q) => {
    const v = answers[q.id];
    return v !== undefined && (typeof v === 'number' || (typeof v === 'string' && v.trim().length > 0));
  });

  const handleSubmit = async () => {
    if (!doctorName.trim()) {
      toast.error('من فضلك أدخل اسمك');
      return;
    }
    if (!allAnswered) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-3">
            تم استلام أفكارك
          </h2>
          <p className="text-[hsl(var(--damij-text))]/70 mb-6">
            شكراً جزيلاً دكتور/ة على وقتك. آراؤك ستساعدنا في تطوير منصة دامج.
          </p>
          <button
            onClick={() => navigate('/damij')}
            className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold"
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-16 max-w-3xl mx-auto" dir="rtl">
      <Link
        to="/damij"
        className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm hover:opacity-80"
      >
        <ArrowRight className="w-4 h-4" /> العودة
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-primary-2))] text-white rounded-3xl p-7 mb-6 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">استبيان الأطباء</h1>
            <p className="text-white/80 text-sm">شاركنا أفكارك ورؤيتك حول منصة دامج</p>
          </div>
        </div>
        <p className="text-white/90 leading-relaxed text-sm sm:text-base">
          هذا الاستبيان موجّه للأطباء والممارسين الصحيين. الأسئلة تدور حول
          <span className="font-bold"> الأفكار والرؤية</span> فقط — لا علاقة لها بالأداء الوظيفي،
          وكل الإجابات سرّية وتُستخدم لتطوير المنصة فقط.
        </p>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-4">معلومات تعريفية (اختيارية ما عدا الاسم)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            placeholder="الاسم *"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white"
          />
          <input
            placeholder="التخصص (مثال: طب أطفال)"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white"
          />
          <input
            placeholder="جهة العمل"
            value={workplace}
            onChange={(e) => setWorkplace(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white"
          />
          <input
            placeholder="البريد الإلكتروني (للتواصل)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white"
          />
        </div>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl shadow-md p-5 sm:p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-[hsl(var(--damij-warm))]/15 text-[hsl(var(--damij-warm))] flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-[hsl(var(--damij-warm))]" />
                  <span className="text-[11px] font-semibold text-[hsl(var(--damij-warm))] uppercase">
                    سؤال فكري
                  </span>
                </div>
                <p className="text-[hsl(var(--damij-primary))] font-semibold leading-relaxed">
                  {q.text}
                </p>
              </div>
            </div>

            {q.type === 'scale' ? (
              <div className="grid grid-cols-5 gap-2">
                {SCALE_LABELS.map((label, idx) => {
                  const active = answers[q.id] === idx + 1;
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswer(q.id, idx + 1)}
                      className={`px-2 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        active
                          ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]'
                          : 'bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={(answers[q.id] as string) || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="اكتب فكرتك هنا..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white focus:border-[hsl(var(--damij-primary))]/50 focus:outline-none resize-none"
              />
            )}
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full py-4 rounded-2xl bg-[hsl(var(--damij-warm))] text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        إرسال الاستبيان
      </button>

      <p className="text-[11px] text-[hsl(var(--damij-text))]/50 text-center mt-4">
        كل الإجابات مجهولة الهوية وتُستخدم فقط لتحسين منصة دامج.
      </p>
    </div>
  );
};

export default DamijDoctorSurvey;
