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
  MessageSquareText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import heroImg from '@/assets/damij-doctor-survey-hero.jpg';
import { DamijLanguageProvider } from '@/features/damij/i18n/DamijLanguageContext';
import DamijLanguageSwitcher from '@/components/damij/DamijLanguageSwitcher';
import DamijAutoTranslator from '@/components/damij/DamijAutoTranslator';

type Choice = { value: string; label: string };
type Question = {
  id: string;
  text: string;
  hint?: string;
  choices: Choice[];
  multi?: boolean;
};

// 28 idea-focused questions — all about VISION/CONCEPT/INTEGRATION (not job performance).
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'فكرة دامج: جمع كل أدوات ذوي الإعاقة (التوحد، ADHD، البصر، السمع، البريل، لغة الإشارة، الجسر الحسّي، التجارب السريرية) في منصة عربية واحدة. ما رأيك بهذه الفكرة؟',
    choices: [
      { value: 'revolutionary', label: 'فكرة ثورية وكانت غائبة تماماً عن العالم العربي' },
      { value: 'good', label: 'فكرة جيدة لكن قد تكون مشتّتة' },
      { value: 'risky', label: 'الدمج تحت سقف واحد قد يُضعف العمق' },
      { value: 'better_specialized', label: 'الأفضل منصات منفصلة لكل إعاقة' },
    ],
  },
  {
    id: 'q2',
    text: 'هل تجميع هذه الإعاقات المختلفة في مكان واحد يخدم رسالة الدمج بحد ذاته (التعايش بين الإعاقات نفسها)؟',
    choices: [
      { value: 'yes_strong', label: 'نعم — هذا هو جوهر الدمج الحقيقي' },
      { value: 'yes_symbolic', label: 'نعم لكنه رمزي فقط' },
      { value: 'neutral', label: 'لا فرق — المهم جودة كل قسم' },
      { value: 'no', label: 'لا — كل إعاقة لها عالمها' },
    ],
  },
  {
    id: 'q3',
    text: 'الرؤية الكامنة وراء دامج: "مرافق رقمي يصاحب الإنسان من الطفولة إلى البلوغ". ما رأيك بهذه الرؤية؟',
    choices: [
      { value: 'inspiring', label: 'ملهمة وضرورية' },
      { value: 'ambitious', label: 'طموحة جداً وتحتاج لسنوات' },
      { value: 'partial', label: 'يجب التركيز أولاً على الأطفال' },
      { value: 'unrealistic', label: 'غير واقعية حالياً' },
    ],
  },
  {
    id: 'q4',
    text: 'فلسفة "الجسر الحسّي العكسي" — أن تجرّب الإعاقة افتراضياً قبل الحكم أو التشخيص. ما رأيك بهذه الفكرة كمفهوم؟',
    choices: [
      { value: 'essential', label: 'مفهوم أخلاقي يجب أن يُدرَّس في كل المؤسسات التعليمية والصحية' },
      { value: 'powerful', label: 'فكرة قوية لزيادة التعاطف' },
      { value: 'symbolic', label: 'فكرة رمزية أكثر منها عملية' },
      { value: 'unconvinced', label: 'غير مقتنع بجدواها' },
    ],
  },
  {
    id: 'q5',
    text: 'ما رأيك بفكرة أن تكون لغة دامج الأساسية هي العربية، مع كون معظم المصادر السريرية بالإنجليزية؟',
    choices: [
      { value: 'necessary', label: 'ضرورة قصوى — لا بديل عن العربية' },
      { value: 'with_english', label: 'العربية أساس + الإنجليزية مرجع علمي' },
      { value: 'english_first', label: 'الإنجليزية أولاً لضمان الدقة' },
      { value: 'depends', label: 'يعتمد على الفئة المستهدفة' },
    ],
  },
  {
    id: 'q6',
    text: 'فكرة دمج الذكاء الاصطناعي داخل أدوات التشخيص والمتابعة. كيف تراها فلسفياً؟',
    choices: [
      { value: 'partner', label: 'شريك حقيقي للطبيب في القرار' },
      { value: 'assistant', label: 'مساعد فقط — القرار للطبيب دائماً' },
      { value: 'concerned', label: 'فكرة محفوفة بمخاطر أخلاقية' },
      { value: 'against', label: 'يجب أن يبقى التشخيص بشرياً 100%' },
    ],
  },
  {
    id: 'q7',
    text: 'فكرة أن تكون التقارير قابلة للمشاركة عبر رابط واحد بين الأهل والطبيب والمدرسة. ما رأيك بها كمفهوم؟',
    choices: [
      { value: 'breakthrough', label: 'كسر حقيقي لجدار العزلة بين الأطراف' },
      { value: 'good_with_privacy', label: 'فكرة ممتازة بشرط حماية الخصوصية' },
      { value: 'risky', label: 'تطرح أسئلة خصوصية صعبة' },
      { value: 'unnecessary', label: 'لا حاجة لها — التواصل التقليدي يكفي' },
    ],
  },
  {
    id: 'q8',
    text: 'فكرة "الدمج الاجتماعي بين الإعاقات نفسها" — أن يلتقي طفل توحدي بطفل أصم بطفل كفيف في نفس البيئة الرقمية. ما رأيك؟',
    choices: [
      { value: 'beautiful', label: 'فكرة جميلة وإنسانية' },
      { value: 'with_care', label: 'مفيدة بشرط التصميم المدروس' },
      { value: 'complicated', label: 'معقّدة في التطبيق' },
      { value: 'not_suitable', label: 'كل إعاقة تحتاج بيئة منفصلة' },
    ],
  },
  {
    id: 'q9',
    text: 'فكرة استخدام الألعاب التفاعلية كأداة فحص (مثلاً ألعاب التوحد للكشف عن صعوبات الانتباه المشترك). ما رأيك بهذا المنهج؟',
    choices: [
      { value: 'innovative', label: 'منهج مبتكر يخفّف الرهبة عن الطفل' },
      { value: 'supportive', label: 'أداة داعمة للفحص التقليدي' },
      { value: 'unreliable', label: 'قد تعطي نتائج مضللة' },
      { value: 'no_substitute', label: 'لا يمكن أن تحلّ محل المقابلة السريرية' },
    ],
  },
  {
    id: 'q10',
    text: 'فكرة وجود "مرشد ذكي" يتحدّث عربياً لتوجيه الأهل داخل المنصة بدلاً من تركهم تائهين. ما رأيك بهذه الفكرة؟',
    choices: [
      { value: 'essential', label: 'ضرورة — كثير من الأهل لا يعرفون من أين يبدؤون' },
      { value: 'helpful', label: 'مفيد كخيار اختياري' },
      { value: 'depends', label: 'يعتمد على جودة المرشد' },
      { value: 'unnecessary', label: 'الأهل يفضّلون اكتشاف الأدوات بأنفسهم' },
    ],
  },
  {
    id: 'q11',
    text: 'فكرة دمج الجانب البيئي (Eco Mode) في منصة طبية تعليمية. هل تراها إضافة منطقية أم تشتيتاً؟',
    choices: [
      { value: 'meaningful', label: 'إضافة ذات معنى ورسالة' },
      { value: 'nice', label: 'لطيفة لكن ليست أولوية' },
      { value: 'distracting', label: 'تشتّت من الهدف الأساسي' },
      { value: 'irrelevant', label: 'لا علاقة لها بالموضوع' },
    ],
  },
  {
    id: 'q12',
    text: 'فكرة دمج "التجارب السريرية الافتراضية" (ECG, AED, السماعة) داخل منصة موجّهة أصلاً لذوي الإعاقة. ما رأيك بهذا الدمج؟',
    choices: [
      { value: 'great', label: 'دمج ذكي — يربط التدريب الطبي بالواقع الإنساني' },
      { value: 'good', label: 'فكرة جيدة لكن تحتاج قسماً منفصلاً' },
      { value: 'confusing', label: 'مربك — جمهوران مختلفان' },
      { value: 'separate', label: 'يجب فصلها تماماً' },
    ],
  },
  {
    id: 'q13',
    text: 'الرسالة الكامنة وراء دامج: "الإعاقة ليست نقصاً بل اختلافاً في الوصول". هل توافق على هذه الفلسفة؟',
    choices: [
      { value: 'fully', label: 'أوافق تماماً' },
      { value: 'mostly', label: 'أوافق بشكل عام' },
      { value: 'partially', label: 'أوافق جزئياً' },
      { value: 'disagree', label: 'لا أوافق — الإعاقة تحدٍّ يجب علاجه' },
    ],
  },
  {
    id: 'q14',
    text: 'فكرة الانتقال من نموذج "العيادة كمركز" إلى نموذج "البيت كمركز" عبر منصة مثل دامج. ما رأيك بهذا التحوّل؟',
    choices: [
      { value: 'future', label: 'هذا مستقبل الرعاية الصحية' },
      { value: 'complement', label: 'مكمّل وليس بديلاً' },
      { value: 'careful', label: 'يجب التعامل معه بحذر شديد' },
      { value: 'against', label: 'العيادة لا بديل لها' },
    ],
  },
  {
    id: 'q15',
    text: 'فكرة أن تكون كل أدوات دامج مجانية بالكامل بدلاً من نموذج اشتراكات. ما رأيك بهذه الفلسفة؟',
    choices: [
      { value: 'must', label: 'يجب أن تبقى مجانية — العدالة الصحية' },
      { value: 'freemium', label: 'مجانية بقاعدة + ميزات مدفوعة' },
      { value: 'sustainable', label: 'الاستدامة تتطلب نموذج دخل' },
      { value: 'paid', label: 'مدفوعة — الجودة تحتاج تمويلاً' },
    ],
  },
  {
    id: 'q16',
    text: 'فكرة بناء "قاعدة بيانات بحثية عربية" من تفاعلات الأطفال داخل دامج (بشكل مجهول الهوية). ما رأيك بهذه الفكرة؟',
    choices: [
      { value: 'gold_mine', label: 'كنز للأبحاث العربية المفقودة' },
      { value: 'with_ethics', label: 'فكرة جيدة بشروط أخلاقية صارمة' },
      { value: 'concerned', label: 'قلق من استغلال البيانات' },
      { value: 'reject', label: 'أرفض جمع بيانات الأطفال مهما كانت الذرائع' },
    ],
  },
  {
    id: 'q17',
    text: 'فكرة جعل المعلّمين شريكاً مباشراً مع الأهل والأطباء داخل دامج. ما رأيك بهذا الدمج الثلاثي؟',
    choices: [
      { value: 'essential', label: 'ضروري — المعلّم يرى الطفل أكثر من الطبيب' },
      { value: 'good', label: 'مفيد لكن يحتاج بروتوكولات واضحة' },
      { value: 'boundary', label: 'يجب الفصل المهني بين الأدوار' },
      { value: 'against', label: 'لا أرى دوراً للمعلّم في الجانب السريري' },
    ],
  },
  {
    id: 'q18',
    text: 'فكرة أن يكون لكل طفل "ملف رقمي مستمر" يصاحبه من عمر سنتين حتى البلوغ. ما رأيك بهذا المفهوم؟',
    choices: [
      { value: 'powerful', label: 'فكرة قوية — تتبّع التطور مهم جداً' },
      { value: 'with_control', label: 'جيدة بشرط تحكّم الأهل الكامل' },
      { value: 'privacy', label: 'مخاوف خصوصية كبيرة' },
      { value: 'unnecessary', label: 'الملفات الورقية كافية' },
    ],
  },
  {
    id: 'q19',
    text: 'فكرة إدخال "محاكاة الإعاقة" كمتطلب في برامج تدريب الأطباء الجدد. ما رأيك؟',
    choices: [
      { value: 'must', label: 'يجب أن يكون متطلباً إلزامياً' },
      { value: 'optional', label: 'اختياري ضمن التدريب' },
      { value: 'awareness', label: 'كوحدة توعية فقط' },
      { value: 'no', label: 'لا داعي لذلك' },
    ],
  },
  {
    id: 'q20',
    text: 'فكرة "اللاوصمة" — أن يستخدم الطفل التوحدي والطفل العادي نفس الواجهة دون تمييز. ما رأيك؟',
    choices: [
      { value: 'beautiful', label: 'فكرة جميلة جداً — تكافؤ حقيقي' },
      { value: 'good', label: 'مفيدة لكن تحتاج تكيّفاً ذكياً' },
      { value: 'unrealistic', label: 'صعب التطبيق عملياً' },
      { value: 'separate', label: 'الفصل أفضل لاحتياجات كل فئة' },
    ],
  },
  {
    id: 'q21',
    text: 'الفكرة الأقوى في دامج برأيك من بين هذه الأفكار:',
    multi: true,
    hint: 'يمكنك اختيار أكثر من فكرة',
    choices: [
      { value: 'integration', label: 'دمج كل الإعاقات في منصة واحدة' },
      { value: 'reverse_bridge', label: 'الجسر الحسّي العكسي (محاكاة الإعاقة)' },
      { value: 'arabic_first', label: 'كون المحتوى عربياً أصيلاً' },
      { value: 'ai_partner', label: 'استخدام الذكاء الاصطناعي بشكل أخلاقي' },
    ],
  },
  {
    id: 'q22',
    text: 'الفكرة الأكثر إثارة للقلق في دامج برأيك:',
    multi: true,
    hint: 'يمكنك اختيار أكثر من فكرة',
    choices: [
      { value: 'ai_diagnosis', label: 'الاعتماد على الذكاء الاصطناعي في توجيه التشخيص' },
      { value: 'data_privacy', label: 'تجميع بيانات الأطفال في منصة واحدة' },
      { value: 'parent_alone', label: 'استخدام الأهل للأدوات دون إشراف' },
      { value: 'scope_too_wide', label: 'اتساع المجال أكثر من اللازم' },
    ],
  },
  {
    id: 'q23',
    text: 'فكرة أن تكون دامج "مفتوحة المصدر" تقنياً، بحيث يمكن لأي مدرسة أو جمعية تخصيصها. ما رأيك؟',
    choices: [
      { value: 'great', label: 'فكرة عظيمة — تخدم العدالة الرقمية' },
      { value: 'partial', label: 'مفتوحة جزئياً مع حماية الجوهر' },
      { value: 'closed_better', label: 'الإغلاق يضمن جودة موحّدة' },
      { value: 'depends', label: 'يعتمد على نوع البيانات' },
    ],
  },
  {
    id: 'q24',
    text: 'فكرة أن تتعاون دامج مع وزارات الصحة العربية لجعلها أداة وطنية. ما رأيك بهذا التوجّه؟',
    choices: [
      { value: 'priority', label: 'أولوية — هذا ما يصنع الفرق الحقيقي' },
      { value: 'gradual', label: 'تدريجياً بعد إثبات الجدوى' },
      { value: 'independent', label: 'الاستقلال أفضل — البيروقراطية تقتل المشاريع' },
      { value: 'no', label: 'لا — الحكومات تبطئ الابتكار' },
    ],
  },
  {
    id: 'q25',
    text: 'فكرة أن يكون داخل دامج "مجتمع للأهل" لتبادل التجارب بدلاً من الشعور بالعزلة. ما رأيك؟',
    choices: [
      { value: 'crucial', label: 'حيوية — الأهل بحاجة لمن يفهمهم' },
      { value: 'good', label: 'فكرة جيدة بإشراف مهني' },
      { value: 'risky', label: 'قد تنتشر معلومات خاطئة' },
      { value: 'separate', label: 'مجتمعات الأهل لها منصاتها' },
    ],
  },
  {
    id: 'q26',
    text: 'فكرة أن يكون لدامج "وضع للطوارئ" — مثلاً عين الأعمى الفورية أو ترجمة إشارة عاجلة. ما رأيك؟',
    choices: [
      { value: 'essential', label: 'ضرورة إنسانية لا غنى عنها' },
      { value: 'good', label: 'إضافة قوية للمنصة' },
      { value: 'careful', label: 'يحتاج لمسؤولية قانونية كبيرة' },
      { value: 'not_role', label: 'ليس دور منصة تعليمية' },
    ],
  },
  {
    id: 'q27',
    text: 'الفكرة الأهم التي يجب أن تركّز عليها دامج في السنوات الخمس القادمة برأيك:',
    choices: [
      { value: 'deepen', label: 'تعميق الأدوات الحالية قبل التوسع' },
      { value: 'expand', label: 'التوسع لإعاقات أخرى (حركية، نفسية)' },
      { value: 'research', label: 'بناء قاعدة بحثية عربية حقيقية' },
      { value: 'partnerships', label: 'الشراكات مع المؤسسات والوزارات' },
    ],
  },
  {
    id: 'q28',
    text: 'بشكل عام، هل ترى أن فكرة دامج — كمشروع شامل للدمج — تستحق الدعم والاستثمار في العالم العربي؟',
    choices: [
      { value: 'strongly_yes', label: 'نعم بقوة — هذا ما يحتاجه العالم العربي' },
      { value: 'yes', label: 'نعم لكن مع تحفظات' },
      { value: 'maybe', label: 'ربما — أحتاج لرؤية المزيد' },
      { value: 'no', label: 'لا أراها أولوية' },
    ],
  },
];

// Step layout: 0 = intro+info, 1..N = questions, N+1 = feedback, N+2 = review
const FEEDBACK_STEP = QUESTIONS.length + 1;
const REVIEW_STEP = QUESTIONS.length + 2;
const TOTAL_STEPS = QUESTIONS.length + 3;

const DamijDoctorSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
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
      const trimmedFeedback = feedback.trim().slice(0, 2000);
      const payload = {
        doctor_name: doctorName.trim().slice(0, 100),
        specialty: specialty.trim().slice(0, 100) || null,
        workplace: workplace.trim().slice(0, 150) || null,
        email: email.trim().slice(0, 255) || null,
        answers: { ...answers, feedback: trimmedFeedback || null },
      };
      const { error } = await supabase.from('damij_doctor_surveys').insert(payload);
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
        <meta name="description" content="استبيان موجّه للأطباء حول الأفكار والرؤية الكامنة وراء منصة دامج للدمج التعليمي وذوي الإعاقة." />
        <link rel="canonical" href="https://damij-jo.life/damij/doctor-survey" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://damij-jo.life/damij/doctor-survey" />
        <meta property="og:title" content="استبيان الأطباء — منصة دامج" />
        <meta property="og:description" content="شارك أفكارك ورؤيتك كطبيب حول منصة دامج." />
        <meta property="og:image" content="https://damij-jo.life/damij-doctor-survey-og.jpg" />
        <meta property="og:locale" content="ar_AR" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        <div className="flex items-center justify-between mb-6 gap-3">
          <Link
            to="/damij"
            className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition"
            style={{ color: 'hsl(var(--damij-primary))' }}
          >
            <ArrowRight className="w-4 h-4" /> العودة للمنصة
          </Link>
          <DamijLanguageSwitcher />
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm font-semibold"
            style={{ color: 'hsl(var(--damij-primary))' }}>
            <span>
              {step === 0
                ? 'البداية'
                : step === FEEDBACK_STEP
                ? 'ملاحظاتك ونقدك البنّاء'
                : step === REVIEW_STEP
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
                      <h1 className="text-2xl sm:text-3xl font-extrabold">استبيان الأفكار</h1>
                      <p className="text-white/85 text-sm">{QUESTIONS.length} سؤال حول رؤية ومفاهيم منصة دامج</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-3 p-4 rounded-2xl mb-6"
                  style={{ background: 'hsl(var(--damij-accent) / 0.1)' }}>
                  <Lightbulb className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--damij-accent))' }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--damij-text))' }}>
                    هذا الاستبيان يدور حول <strong>الأفكار والمفاهيم والرؤية</strong> الكامنة وراء منصة دامج —
                    وليس عن الكفاءة العملية أو الأداء الوظيفي. كل سؤال يستكشف رأيك في فكرة معيّنة (الدمج،
                    الذكاء الاصطناعي، الجسر الحسّي، إلخ). كل الإجابات سرّية.
                  </p>
                </div>

                <h2 className="font-bold mb-4 text-lg" style={{ color: 'hsl(var(--damij-primary))' }}>
                  معلومات تعريفية
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    placeholder="الاسم *"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="التخصص (مثال: طب أطفال)"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="جهة العمل"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value.slice(0, 150))}
                    maxLength={150}
                    className="px-4 py-3 rounded-xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))]"
                    style={{ background: 'hsl(var(--damij-bg))', borderColor: 'hsl(var(--damij-border))', color: 'hsl(var(--damij-text))' }}
                  />
                  <input
                    placeholder="البريد الإلكتروني (اختياري)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                    maxLength={255}
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

          {/* FEEDBACK STEP */}
          {step === FEEDBACK_STEP && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl shadow-xl p-6 sm:p-8"
              style={{ background: 'hsl(var(--damij-surface))' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'hsl(var(--damij-accent) / 0.15)' }}>
                  <MessageSquareText className="w-6 h-6" style={{ color: 'hsl(var(--damij-accent))' }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: 'hsl(var(--damij-primary))' }}>
                    ملاحظاتك ونقدك البنّاء
                  </h2>
                  <p className="text-sm" style={{ color: 'hsl(var(--damij-muted))' }}>
                    اختياري — ولكنه يساعدنا أكثر من أي سؤال
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: 'hsl(var(--damij-text))' }}>
                ما الفكرة التي تتمنى أن نطوّرها؟ ما الذي لم نسأل عنه وتراه مهماً؟ أي نقد بنّاء يساعدنا
                على تحسين دامج؟ كل كلمة منك لها أثر.
              </p>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 2000))}
                placeholder="اكتب ملاحظاتك هنا… (حتى 2000 حرف)"
                rows={9}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition focus:border-[hsl(var(--damij-primary))] resize-none leading-relaxed"
                style={{
                  background: 'hsl(var(--damij-bg))',
                  borderColor: 'hsl(var(--damij-border))',
                  color: 'hsl(var(--damij-text))',
                  fontFamily: 'inherit',
                }}
              />
              <div className="text-left text-xs mt-2" style={{ color: 'hsl(var(--damij-muted))' }}>
                {feedback.length} / 2000
              </div>
            </motion.div>
          )}

          {/* REVIEW STEP */}
          {step === REVIEW_STEP && (
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
                {feedback.trim() && (
                  <div className="p-4 rounded-xl"
                    style={{ background: 'hsl(var(--damij-accent) / 0.08)', border: '1px solid hsl(var(--damij-accent) / 0.3)' }}>
                    <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'hsl(var(--damij-accent))' }}>
                      <MessageSquareText className="w-3.5 h-3.5" /> ملاحظتك
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'hsl(var(--damij-text))' }}>
                      {feedback}
                    </div>
                  </div>
                )}
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
            {step < REVIEW_STEP && (
              <button
                onClick={goNext}
                className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition"
                style={{ background: 'hsl(var(--damij-primary))' }}
              >
                {step === 0
                  ? 'ابدأ الاستبيان'
                  : step === QUESTIONS.length
                  ? 'الانتقال للملاحظات'
                  : step === FEEDBACK_STEP
                  ? 'مراجعة وإرسال'
                  : 'التالي'} <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <p className="text-[11px] text-center mt-6" style={{ color: 'hsl(var(--damij-muted))' }}>
          كل الإجابات مجهولة الهوية وتُستخدم فقط لتطوير منصة دامج.
        </p>
      </div>
    </div>
  );
};

const DamijDoctorSurveyWithProvider: React.FC = () => (
  <DamijLanguageProvider>
    <DamijDoctorSurvey />
    <DamijAutoTranslator />
  </DamijLanguageProvider>
);

export default DamijDoctorSurveyWithProvider;
