import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Ear, Hand, Brain, BookOpen, Focus, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export type VisionState = 'normal' | 'total_blind' | 'partial_blind' | 'low_vision' | 'color_blind' | 'photosensitive';
export type HearingState = 'normal' | 'deaf' | 'hard_of_hearing' | 'cochlear';
export type MotorState = 'mouse' | 'eye_tracking' | 'voice' | 'switch';
export type LearningStyle = 'visual' | 'text' | 'audio' | 'mixed';
export type LanguageLevel = 'simplified' | 'academic' | 'illustrated' | 'sign_simplified';
export type FocusLevel = 'normal' | 'easily_distracted' | 'low_attention';

export interface SensoryProfile {
  vision: VisionState;
  hearing: HearingState;
  motor: MotorState;
  learningStyle?: LearningStyle;
  languageLevel?: LanguageLevel;
  focus?: FocusLevel;
  preferTouch?: boolean;
  cognitive?: 'normal' | 'autism' | 'adhd';
  savedAt: string;
}

export const PROFILE_KEY = 'damij_sensory_profile_v1';

const VISION_OPTS: { v: VisionState; t: string; d: string }[] = [
  { v: 'normal', t: 'بصر طبيعي', d: 'لا توجد إعاقة بصرية' },
  { v: 'total_blind', t: 'كفيف كلي', d: 'يعتمد كلياً على الصوت والبريل' },
  { v: 'partial_blind', t: 'كفيف جزئي', d: 'إدراك للضوء/الأشكال الكبيرة' },
  { v: 'low_vision', t: 'ضعف نظر', d: 'يحتاج تكبير وتباين عالٍ' },
  { v: 'color_blind', t: 'عمى ألوان', d: 'تجنّب التمييز بالألوان فقط' },
  { v: 'photosensitive', t: 'حساسية للضوء', d: 'وضع داكن وألوان هادئة' },
];

const HEARING_OPTS: { v: HearingState; t: string; d: string }[] = [
  { v: 'normal', t: 'سمع طبيعي', d: 'لا توجد إعاقة سمعية' },
  { v: 'deaf', t: 'أصم', d: 'يعتمد على النص والإشارة' },
  { v: 'hard_of_hearing', t: 'ضعف سمع', d: 'يحتاج صوتاً واضحاً ونصاً مرافقاً' },
  { v: 'cochlear', t: 'زراعة قوقعة', d: 'تجنّب الترددات المزعجة' },
];

const MOTOR_OPTS: { v: MotorState; t: string; d: string }[] = [
  { v: 'mouse', t: 'فأرة/لمس', d: 'تحكّم تقليدي' },
  { v: 'eye_tracking', t: 'تتبّع العين', d: 'أزرار كبيرة وفترات تحديق' },
  { v: 'voice', t: 'أوامر صوتية', d: 'تنفيذ بالكلام فقط' },
  { v: 'switch', t: 'مفتاح واحد', d: 'تنقّل تسلسلي بضغطة واحدة' },
];

const LEARNING_OPTS: { v: LearningStyle; t: string; d: string }[] = [
  { v: 'visual', t: 'صور ورسوم', d: 'يستوعب الصور والأيقونات أفضل' },
  { v: 'text', t: 'نصوص مكتوبة', d: 'يفضّل القراءة الصامتة' },
  { v: 'audio', t: 'صوت ونطق', d: 'يفضّل الاستماع' },
  { v: 'mixed', t: 'مزيج متوازن', d: 'بين الصور والنص والصوت' },
];

const LANGUAGE_OPTS: { v: LanguageLevel; t: string; d: string }[] = [
  { v: 'simplified', t: 'لغة مبسّطة', d: 'كلمات قصيرة ومألوفة' },
  { v: 'academic', t: 'لغة أكاديمية', d: 'مصطلحات علمية دقيقة' },
  { v: 'illustrated', t: 'تحويل لرسوم', d: 'تمثيل النص برسوم توضيحية' },
  { v: 'sign_simplified', t: 'إشارة مبسّطة', d: 'كلمات إشارة مفتاحية فقط' },
];

const FOCUS_OPTS: { v: FocusLevel; t: string; d: string }[] = [
  { v: 'normal', t: 'تركيز طبيعي', d: 'لا حاجة لتعديل الواجهة' },
  { v: 'easily_distracted', t: 'تشتت انتباه', d: 'إزالة الحركات والمشتتات' },
  { v: 'low_attention', t: 'انتباه منخفض', d: 'محتوى مقسم لخطوات قصيرة' },
];

const SensoryProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [vision, setVision] = useState<VisionState | ''>('');
  const [hearing, setHearing] = useState<HearingState | ''>('');
  const [motor, setMotor] = useState<MotorState | ''>('');
  const [preferTouch, setPreferTouch] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p: SensoryProfile = JSON.parse(raw);
        setVision(p.vision); setHearing(p.hearing); setMotor(p.motor);
        setPreferTouch(!!p.preferTouch);
      }
    } catch {}
  }, []);

  const save = () => {
    if (!vision || !hearing || !motor) {
      toast.error('يرجى تعبئة الحقول الثلاثة لإنشاء ملفك الحسّي');
      return;
    }
    const profile: SensoryProfile = {
      vision, hearing, motor, preferTouch,
      cognitive: 'normal',
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    toast.success('تم حفظ ملفك الحسّي');
    navigate('/damij/sensory/upload');
  };

  const Section = <T extends string>({ icon: Icon, title, value, onChange, opts }: {
    icon: any; title: string; value: T | ''; onChange: (v: T) => void;
    opts: { v: T; t: string; d: string }[];
  }) => (
    <section className="bg-white rounded-3xl p-5 shadow-lg border border-[hsl(var(--damij-primary))]/10">
      <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5" /> {title}
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {opts.map(o => {
          const selected = value === o.v;
          return (
            <button key={o.v} type="button" onClick={() => onChange(o.v)}
              className={`text-right p-4 rounded-2xl border-2 transition-all ${selected
                ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))] shadow-md'
                : 'bg-[hsl(var(--damij-surface))] border-transparent hover:border-[hsl(var(--damij-primary))]/30'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{o.t}</span>
                {selected && <CheckCircle2 className="w-5 h-5" />}
              </div>
              <p className={`text-xs ${selected ? 'text-white/85' : 'text-[hsl(var(--damij-text))]/65'}`}>{o.d}</p>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="px-6 pt-12 pb-20 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-3">
          <Sparkles className="w-4 h-4" /><span className="text-sm font-bold">قبل أن نبدأ — أنشئ ملفك الحسّي</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">الملف الحسّي للمستخدم</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          نحتاج معرفة قدراتك الوظيفية لتخصيص توزيع المعلومة على الحواس البديلة بأفضل شكل ممكن.
        </p>
      </div>

      <div className="space-y-5">
        <Section icon={Eye} title="١. الحالة البصرية" value={vision} onChange={(v) => setVision(v as VisionState)} opts={VISION_OPTS} />
        <Section icon={Ear} title="٢. الحالة السمعية" value={hearing} onChange={(v) => setHearing(v as HearingState)} opts={HEARING_OPTS} />
        <Section icon={Hand} title="٣. الحالة الحركية (طريقة التحكّم)" value={motor} onChange={(v) => setMotor(v as MotorState)} opts={MOTOR_OPTS} />

        <label className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 cursor-pointer">
          <input type="checkbox" checked={preferTouch} onChange={e => setPreferTouch(e.target.checked)}
            className="w-5 h-5 accent-[hsl(var(--damij-primary))]" />
          <span className="font-semibold text-[hsl(var(--damij-primary))]">أفضّل البريل والاهتزاز كقناة أساسية</span>
        </label>
      </div>

      <div className="mt-8 text-center">
        <button onClick={save}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
          حفظ والمتابعة إلى الجسر الحسّي <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-xs text-[hsl(var(--damij-text))]/50 mt-3">يُحفظ الملف محلياً على جهازك ويمكنك تعديله في أي وقت.</p>
      </div>
    </div>
  );
};

export default SensoryProfileSetup;
