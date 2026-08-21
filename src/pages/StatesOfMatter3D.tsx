import { Suspense, lazy, useMemo, useState } from 'react';
import { Snowflake, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line as RLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  SimCanvas,
  SimCanvasFallback,
  SimHUD,
  SimLessonShell,
  SimNotebook,
  SimQualityGate,
  SimQuiz,
  SimViewButtons,
  useSimNotebook,
} from '@/components/sim3d';
import type { SimQuizQuestion, SimView } from '@/components/sim3d';
import {
  PHASE_LABEL,
  PhaseMode,
  PhaseParams,
  SUBSTANCES,
  computeStates,
  findSubstance,
  heatingCurve,
  speedDistribution,
} from '@/lib/sim-physics/statesofmatter';

const StatesScene3D = lazy(() =>
  import('@/components/simulations3d/states/StatesScene3D').then((m) => ({ default: m.StatesScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'أثناء انصهار الجليد عند 0°م تبقى درجة الحرارة ثابتة لأن الطاقة المضافة:',
    options: ['تُفقد للجو', 'تكسر قوى التجاذب بين الجزيئات', 'تزيد سرعة الجزيئات', 'تُحوّل إلى ضوء'],
    correctIndex: 1,
    explanation: 'طاقة الانصهار الكامنة تُستهلك في تفكيك الشبكة البلورية لا في رفع الطاقة الحركية.',
  },
  {
    question: 'سرعة الجزيئات الجذرية التربيعية vrms تتناسب مع:',
    options: ['√T', 'T', 'T²', '1/T'],
    correctIndex: 0,
    explanation: 'vrms = √(3RT/M)، أي تتناسب مع الجذر التربيعي لدرجة الحرارة المطلقة.',
  },
  {
    question: 'عند خفض الضغط تحت النقطة الثلاثية فإن المادة الصلبة عند التسخين:',
    options: ['تنصهر ثم تغلي', 'تتسامى مباشرة إلى غاز', 'تبقى صلبة دائماً', 'تتحول إلى بلازما'],
    correctIndex: 1,
    explanation: 'أسفل النقطة الثلاثية لا وجود للطور السائل، فينتقل الصلب مباشرة إلى الغاز (تسامي).',
  },
  {
    question: 'ارتفاع الضغط الجوي يؤدي إلى أن درجة غليان الماء:',
    options: ['تقل', 'تزداد', 'لا تتغير', 'تصبح صفراً'],
    correctIndex: 1,
    explanation: 'وفق كلاوسيوس-كلابيرون يرتفع الغليان مع الضغط، ولهذا تعمل قدور الضغط.',
  },
  {
    question: 'حرارة التبخّر للماء أكبر بكثير من حرارة الانصهار لأن:',
    options: ['الماء ثقيل', 'التبخّر يفصل الجزيئات تماماً عن بعضها', 'الجليد بارد', 'التبخّر أسرع'],
    correctIndex: 1,
    explanation: 'التبخّر يتطلب كسر كل الروابط الهيدروجينية تقريباً، بينما الانصهار يفكك النظام البلوري فقط.',
  },
  {
    question: 'النقطة الحرجة هي النقطة التي بعدها:',
    options: ['يتجمد الغاز', 'يختفي الفرق بين السائل والغاز', 'تنعدم الحرارة', 'يتوقف الانتشار'],
    correctIndex: 1,
    explanation: 'فوق درجة الحرارة والضغط الحرجين يصبح المائع فوق حرج بخصائص مشتركة.',
  },
  {
    question: 'في الحالة الصلبة تكون حركة الجسيمات:',
    options: ['انتقالية حرة', 'اهتزازية حول مواقع ثابتة', 'معدومة تماماً', 'دورانية فقط'],
    correctIndex: 1,
    explanation: 'الجسيمات مقيّدة في الشبكة وتهتز حول مواضع اتزانها بسعة تزداد مع الحرارة.',
  },
];

const MODE_LABEL: Record<PhaseMode, string> = {
  particles: 'الجسيمات',
  heating: 'منحنى التسخين',
  diagram: 'مخطط الطور',
};

const StatesOfMatter3D = () => {
  const [mode, setMode] = useState<PhaseMode>('particles');
  const [substanceId, setSubstanceId] = useState('water');
  const [temperature, setTemperature] = useState(300);
  const [pressure, setPressure] = useState(1);
  const [mass, setMass] = useState(100);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<{ phase: 'solid' | 'liquid' | 'gas'; substance: string } | null>(null);

  const params: PhaseParams = useMemo(
    () => ({ substanceId, temperature, pressure, mass }),
    [substanceId, temperature, pressure, mass]
  );

  const stats = useMemo(() => computeStates(params), [params]);
  const curve = useMemo(() => heatingCurve(params), [params]);
  const speeds = useMemo(() => speedDistribution(substanceId, temperature), [substanceId, temperature]);
  const substance = findSubstance(substanceId);

  const { entries, record, clear } = useSimNotebook('states-of-matter-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setTemperature(300);
    setPressure(1);
    setPlaying(true);
  };

  const newChallenge = () => {
    const phases: ('solid' | 'liquid' | 'gas')[] = ['solid', 'liquid', 'gas'];
    const s = SUBSTANCES[Math.floor(Math.random() * SUBSTANCES.length)];
    setChallenge({ phase: phases[Math.floor(Math.random() * 3)], substance: s.id });
  };

  const challengeMet =
    challenge !== null && challenge.substance === substanceId && challenge.phase === stats.phase;

  const hudReadings = [
    { label: 'الحالة', value: stats.phaseLabel, unit: '', tone: 'primary' as const },
    { label: 'درجة الحرارة', value: Math.round(temperature), unit: 'K' },
    { label: 'بالسيلسيوس', value: Math.round(temperature - 273.15), unit: '°م' },
    { label: 'الضغط', value: pressure.toFixed(2), unit: 'atm' },
    { label: 'الانصهار', value: Math.round(stats.meltingPoint), unit: 'K' },
    { label: 'الغليان', value: Math.round(stats.boilingPoint), unit: 'K', tone: 'success' as const },
    { label: 'vrms', value: Math.round(stats.rmsSpeed), unit: 'م/ث' },
    { label: 'الطاقة المخزّنة', value: stats.energyStored.toFixed(1), unit: 'kJ', tone: 'warning' as const },
  ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 12, 24]} environment="city">
        <Suspense fallback={null}>
          <StatesScene3D
            mode={mode}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showParticles={showParticles}
            showVectors={showVectors}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات حرارية حيّة" readings={hudReadings} />
      <SimViewButtons
        view={view}
        onViewChange={setView}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((v) => !v)}
      />
    </SimQualityGate>
  );

  const slider = (
    label: string,
    value: number,
    set: (v: number) => void,
    min: number,
    max: number,
    step: number,
    display?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{display ?? value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => set(v)} />
    </div>
  );

  const controls = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">لوحة التحكّم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as PhaseMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            {(Object.keys(MODE_LABEL) as PhaseMode[]).map((m) => (
              <TabsTrigger key={m} value={m} className="text-xs">
                {MODE_LABEL[m]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'إيقاف' : 'تشغيل'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> إعادة
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">المادة</Label>
          <Select value={substanceId} onValueChange={setSubstanceId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBSTANCES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {s.formula}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {slider(
          'درجة الحرارة',
          temperature,
          setTemperature,
          1,
          Math.round(substance.critical.t * 1.2),
          1,
          `${Math.round(temperature)} K (${Math.round(temperature - 273.15)}°م)`
        )}
        {slider('الضغط', pressure, setPressure, 0.001, Math.min(substance.critical.p, 250), 0.001, `${pressure.toFixed(3)} atm`)}
        {slider('كتلة العيّنة', mass, setMass, 10, 500, 5, `${mass} g`)}

        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="flex-1" onClick={() => setTemperature(stats.meltingPoint)}>
            نقطة الانصهار
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" onClick={() => setTemperature(stats.boilingPoint)}>
            نقطة الغليان
          </Button>
        </div>

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار الجسيمات</Label>
            <Switch checked={showParticles} onCheckedChange={setShowParticles} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار بيانات السرعة</Label>
            <Switch checked={showVectors} onCheckedChange={setShowVectors} />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            record({
              المادة: substance.name,
              'T (K)': Math.round(temperature),
              'P (atm)': pressure.toFixed(3),
              الحالة: stats.phaseLabel,
              'vrms (م/ث)': Math.round(stats.rmsSpeed),
              'الطاقة (kJ)': stats.energyStored.toFixed(1),
            })
          }
        >
          تسجيل القراءة في الدفتر
        </Button>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div dir="rtl" className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm leading-7 text-muted-foreground">
      <p>
        تحدد حالة المادة بالتوازن بين الطاقة الحركية للجسيمات (المتناسبة مع درجة الحرارة المطلقة) وقوى
        التجاذب بينها. في الصلب تهتز الجسيمات حول مواقع ثابتة في شبكة منتظمة، وفي السائل تحتفظ بالتلامس
        لكنها تنزلق فوق بعضها، وفي الغاز تتحرر تماماً وتملأ الحيّز المتاح.
      </p>
      <p>
        أثناء التحوّل الطوري تبقى درجة الحرارة ثابتة لأن الطاقة المضافة (الحرارة الكامنة) تُستهلك في كسر
        قوى الترابط لا في زيادة السرعة، ولذلك يظهر منحنى التسخين على شكل مسطّحين أفقيين عند الانصهار
        والتبخّر. ويحدد مخطط الطور P–T مناطق الاستقرار والحدود بينها: منحنى الانصهار، منحنى التبخّر،
        ومنحنى التسامي، وتلتقي جميعها في النقطة الثلاثية وينتهي منحنى التبخّر عند النقطة الحرجة.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        Q = m·c·ΔT (within a phase){'\n'}
        Q = m·Lf (melting) , Q = m·Lv (vaporisation){'\n'}
        v_rms = √(3RT/M) , ⟨KE⟩ = (3/2)·k_B·T{'\n'}
        ln(P₂/P₁) = −(ΔH_vap/R)·(1/T₂ − 1/T₁) — Clausius–Clapeyron
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">منحنى التسخين (الحرارة مقابل الطاقة)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="energy" tick={{ fontSize: 11 }} label={{ value: 'kJ', position: 'insideBottomRight', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={Number(stats.meltingPoint.toFixed(1))} stroke="#60a5fa" strokeDasharray="4 4" />
              <ReferenceLine y={Number(stats.boilingPoint.toFixed(1))} stroke="#f43f5e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="temp" name="درجة الحرارة (K)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">توزيع ماكسويل–بولتزمان للسرعات</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speeds} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="v" tick={{ fontSize: 10 }} label={{ value: 'م/ث', position: 'insideBottomRight', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Number(stats.rmsSpeed.toFixed(0))} stroke="#f59e0b" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="f" name="كثافة الاحتمال" stroke="#a855f7" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const challengeCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          تحدّي: اصنع الحالة المطلوبة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          سيُطلب منك مادة وحالة محددة؛ اضبط درجة الحرارة والضغط حتى تصل إليها فعلياً في المشهد.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {challenge && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">
                {findSubstance(challenge.substance).name} — {PHASE_LABEL[challenge.phase]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">
                {substance.name} — {stats.phaseLabel}
              </span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeMet ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeMet ? 'أحسنت! وصلت إلى الحالة المطلوبة.' : 'واصل ضبط الحرارة والضغط.'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="حالات المادة والتحولات ثلاثية الأبعاد"
      subtitle="States of Matter 3D — الجسيمات، منحنى التسخين، ومخطط الطور"
      icon={<Snowflake className="h-8 w-8 text-primary" />}
      objectives={[
        'ربط حركة الجسيمات المجهرية بحالة المادة المرئية',
        'حساب الطاقة اللازمة للتسخين والانصهار والتبخّر',
        'تفسير ثبات الحرارة أثناء التحوّل الطوري',
        'قراءة مخطط الطور وتحديد النقطة الثلاثية والحرجة',
        'استنتاج أثر الضغط على درجتي الانصهار والغليان',
      ]}
      concepts={[
        'النظرية الحركية',
        'الحرارة الكامنة',
        'السعة الحرارية',
        'التسامي',
        'كلاوسيوس-كلابيرون',
        'النقطة الثلاثية',
        'النقطة الحرجة',
        'ماكسويل-بولتزمان',
      ]}
      steps={[
        'في نمط «الجسيمات»: اختر الماء عند 250 K ولاحظ الاهتزاز حول مواقع الشبكة.',
        'ارفع الحرارة إلى 300 K وراقب انهيار النظام البلوري وتكوّن السائل.',
        'تابع الرفع فوق 373 K ولاحظ تحرّر الجسيمات وملء الحيّز كاملاً.',
        'غيّر الضغط إلى 0.1 atm وانتبه إلى انخفاض درجة الغليان في القراءات.',
        'انتقل إلى «منحنى التسخين» وتتبّع المسطّحين الأفقيين للانصهار والتبخّر.',
        'في «مخطط الطور» حرّك الحرارة والضغط وشاهد المؤشّر ينتقل بين المناطق.',
        'اختر CO₂ واهبط بالضغط تحت 5.11 atm لتشاهد التسامي المباشر.',
        'سجّل ثلاث قراءات في الدفتر لمواد مختلفة وقارن حرارة تبخّرها.',
      ]}
      scene={<Suspense fallback={<SimCanvasFallback />}>{scene}</Suspense>}
      controls={controls}
      explanation={explanation}
      charts={charts}
      challenge={challengeCard}
      quiz={<SimQuiz questions={QUIZ} storageKey="states-of-matter-3d" />}
      notebook={<SimNotebook entries={entries} onClear={clear} title="دفتر حالات المادة" />}
    />
  );
};

export default StatesOfMatter3D;
