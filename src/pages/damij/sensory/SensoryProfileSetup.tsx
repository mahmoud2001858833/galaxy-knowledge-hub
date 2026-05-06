import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Ear, Hand, Brain, BookOpen, Focus, Sparkles, ArrowLeft, CheckCircle2, Type, Palette, Gauge } from 'lucide-react';
import { toast } from 'sonner';

export type VisionState = 'normal' | 'total_blind' | 'partial_blind' | 'low_vision' | 'color_blind' | 'photosensitive';
export type HearingState = 'normal' | 'deaf' | 'hard_of_hearing' | 'cochlear';
export type MotorState = 'mouse' | 'eye_tracking' | 'voice' | 'switch';
export type LearningStyle = 'visual' | 'text' | 'audio' | 'mixed';
export type LanguageLevel = 'simplified' | 'academic' | 'illustrated' | 'sign_simplified';
export type FocusLevel = 'normal' | 'easily_distracted' | 'low_attention';
export type FontFamily = 'default' | 'dyslexic' | 'large_clear' | 'naskh';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ColorScheme = 'light' | 'dark' | 'high_contrast' | 'cream' | 'blue_dark';
export type SpeedLevel = 'slow' | 'normal' | 'fast';

export interface SensoryProfile {
  vision: VisionState;
  hearing: HearingState;
  motor: MotorState;
  learningStyle?: LearningStyle;
  languageLevel?: LanguageLevel;
  focus?: FocusLevel;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  colorScheme?: ColorScheme;
  speechRate?: SpeedLevel;
  avatarSpeed?: SpeedLevel;
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

const FONT_FAMILY_OPTS: { v: FontFamily; t: string; d: string }[] = [
  { v: 'default', t: 'الخط الافتراضي', d: 'خط النظام المعتاد' },
  { v: 'dyslexic', t: 'خط عسر القراءة', d: 'OpenDyslexic — يقلّل تشابه الحروف' },
  { v: 'large_clear', t: 'خط واضح كبير', d: 'مسافات عريضة وأطراف واضحة' },
  { v: 'naskh', t: 'خط النسخ التقليدي', d: 'مريح للقراءة المطوّلة بالعربية' },
];

const FONT_SIZE_OPTS: { v: FontSize; t: string; d: string }[] = [
  { v: 'sm', t: 'صغير', d: '14px' },
  { v: 'md', t: 'متوسط', d: '16px (افتراضي)' },
  { v: 'lg', t: 'كبير', d: '20px' },
  { v: 'xl', t: 'كبير جداً', d: '24px لضعف النظر' },
];

const COLOR_OPTS: { v: ColorScheme; t: string; d: string }[] = [
  { v: 'light', t: 'فاتح كلاسيكي', d: 'نص داكن على خلفية بيضاء' },
  { v: 'dark', t: 'داكن مريح', d: 'يقلّل إجهاد العين' },
  { v: 'high_contrast', t: 'تباين عالٍ', d: 'أبيض/أصفر على أسود' },
  { v: 'cream', t: 'كريمي/عسر القراءة', d: 'خلفية كريمية تقلّل الوهج' },
  { v: 'blue_dark', t: 'أبيض على أزرق داكن', d: 'مريح ومخصّص لضعف النظر' },
];

const SPEED_OPTS: { v: SpeedLevel; t: string; d: string }[] = [
  { v: 'slow', t: 'بطيء', d: 'مناسب لمن يحتاج وقتاً للاستيعاب' },
  { v: 'normal', t: 'طبيعي', d: 'السرعة المعتادة' },
  { v: 'fast', t: 'سريع', d: 'لمستخدمين متقدّمين' },
];

const SensoryProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [vision, setVision] = useState<VisionState | ''>('');
  const [hearing, setHearing] = useState<HearingState | ''>('');
  const [motor, setMotor] = useState<MotorState | ''>('');
  const [learningStyle, setLearningStyle] = useState<LearningStyle | ''>('');
  const [languageLevel, setLanguageLevel] = useState<LanguageLevel | ''>('');
  const [focus, setFocus] = useState<FocusLevel | ''>('');
  const [fontFamily, setFontFamily] = useState<FontFamily | ''>('');
  const [fontSize, setFontSize] = useState<FontSize | ''>('');
  const [colorScheme, setColorScheme] = useState<ColorScheme | ''>('');
  const [speechRate, setSpeechRate] = useState<SpeedLevel | ''>('');
  const [avatarSpeed, setAvatarSpeed] = useState<SpeedLevel | ''>('');
  const [preferTouch, setPreferTouch] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p: SensoryProfile = JSON.parse(raw);
        setVision(p.vision); setHearing(p.hearing); setMotor(p.motor);
        setLearningStyle(p.learningStyle ?? '');
        setLanguageLevel(p.languageLevel ?? '');
        setFocus(p.focus ?? '');
        setFontFamily(p.fontFamily ?? '');
        setFontSize(p.fontSize ?? '');
        setColorScheme(p.colorScheme ?? '');
        setSpeechRate(p.speechRate ?? '');
        setAvatarSpeed(p.avatarSpeed ?? '');
        setPreferTouch(!!p.preferTouch);
      }
    } catch {}
  }, []);

  const save = () => {
    if (!vision || !hearing || !motor || !learningStyle || !languageLevel || !focus
        || !fontFamily || !fontSize || !colorScheme || !speechRate || !avatarSpeed) {
      toast.error('يرجى تعبئة جميع الحقول لإنشاء ملفك الحسّي');
      return;
    }
    const profile: SensoryProfile = {
      vision, hearing, motor,
      learningStyle, languageLevel, focus,
      fontFamily, fontSize, colorScheme, speechRate, avatarSpeed,
      preferTouch,
      cognitive: focus === 'easily_distracted' || focus === 'low_attention' ? 'adhd' : 'normal',
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
        <div className="text-xs font-bold text-[hsl(var(--damij-primary))]/70 uppercase tracking-wider mt-2">القسم الأول · البيانات الوظيفية (الحواس)</div>
        <Section icon={Eye} title="١. الحالة البصرية" value={vision} onChange={(v) => setVision(v as VisionState)} opts={VISION_OPTS} />
        <Section icon={Ear} title="٢. الحالة السمعية" value={hearing} onChange={(v) => setHearing(v as HearingState)} opts={HEARING_OPTS} />
        <Section icon={Hand} title="٣. الحالة الحركية (طريقة التحكّم)" value={motor} onChange={(v) => setMotor(v as MotorState)} opts={MOTOR_OPTS} />

        <div className="text-xs font-bold text-[hsl(var(--damij-primary))]/70 uppercase tracking-wider mt-4">القسم الثاني · التفضيلات الإدراكية (كيف تفهم؟)</div>
        <Section icon={Brain} title="٤. نمط التعلّم المفضّل" value={learningStyle} onChange={(v) => setLearningStyle(v as LearningStyle)} opts={LEARNING_OPTS} />
        <Section icon={BookOpen} title="٥. مستوى اللغة" value={languageLevel} onChange={(v) => setLanguageLevel(v as LanguageLevel)} opts={LANGUAGE_OPTS} />
        <Section icon={Focus} title="٦. القدرة على التركيز" value={focus} onChange={(v) => setFocus(v as FocusLevel)} opts={FOCUS_OPTS} />

        <div className="text-xs font-bold text-[hsl(var(--damij-primary))]/70 uppercase tracking-wider mt-4">القسم الثالث · الإعدادات التقنية المخصّصة (الواجهة)</div>
        <Section icon={Type} title="٧. نوع الخط" value={fontFamily} onChange={(v) => setFontFamily(v as FontFamily)} opts={FONT_FAMILY_OPTS} />
        <Section icon={Type} title="٨. حجم الخط" value={fontSize} onChange={(v) => setFontSize(v as FontSize)} opts={FONT_SIZE_OPTS} />
        <Section icon={Palette} title="٩. نظام الألوان والتباين" value={colorScheme} onChange={(v) => setColorScheme(v as ColorScheme)} opts={COLOR_OPTS} />
        <Section icon={Gauge} title="١٠. سرعة نطق الصوت" value={speechRate} onChange={(v) => setSpeechRate(v as SpeedLevel)} opts={SPEED_OPTS} />
        <Section icon={Gauge} title="١١. سرعة الأفاتار (لغة الإشارة)" value={avatarSpeed} onChange={(v) => setAvatarSpeed(v as SpeedLevel)} opts={SPEED_OPTS} />

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
