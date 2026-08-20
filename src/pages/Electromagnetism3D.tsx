import { Suspense, lazy, useMemo, useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line as RLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  EMMode,
  EMParams,
  computeEM,
  wireFieldCurve,
  solenoidCurve,
  emfCurve,
} from '@/lib/sim-physics/em';

const EMScene3D = lazy(() =>
  import('@/components/simulations3d/em/EMScene3D').then((m) => ({ default: m.EMScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'شدة المجال المغناطيسي حول سلك مستقيم طويل تتناسب:',
    options: ['طردياً مع البعد', 'عكسياً مع البعد', 'عكسياً مع مربع البعد', 'لا تعتمد على البعد'],
    correctIndex: 1,
    explanation: 'B = μ₀I / 2πr — تناسب عكسي مع البعد وليس مع مربعه.',
  },
  {
    question: 'لمضاعفة المجال داخل ملف لولبي دون تغيير التيار يمكن:',
    options: ['مضاعفة طول الملف', 'مضاعفة عدد اللفات لكل متر', 'تقليل عدد اللفات', 'إزالة القلب الحديدي'],
    correctIndex: 1,
    explanation: 'B = μ₀μ_r n I ويعتمد على كثافة اللفات n = N/L.',
  },
  {
    question: 'قانون فاراداي ينص على أن القوة الدافعة الحثية تتناسب مع:',
    options: ['التدفق المغناطيسي', 'معدل تغير التدفق مع الزمن', 'مقاومة الدارة', 'مساحة الملف فقط'],
    correctIndex: 1,
    explanation: 'ε = −N dΦ/dt — التغيّر هو مصدر الحث وليس التدفق نفسه.',
  },
  {
    question: 'الإشارة السالبة في قانون فاراداي تعبّر عن:',
    options: ['قانون أوم', 'قانون لنز', 'قانون كولوم', 'قاعدة اليد اليسرى'],
    correctIndex: 1,
    explanation: 'قانون لنز: التيار الحثي يعارض التغيّر الذي أنتجه (حفظ الطاقة).',
  },
  {
    question: 'القوة على شحنة تتحرك بسرعة v عمودياً على مجال B تُعطى بـ:',
    options: ['F = qE', 'F = qvB', 'F = BIL²', 'F = mv²/r فقط'],
    correctIndex: 1,
    explanation: 'قوة لورنتز F = qvB sinθ، وتكون أكبر ما يمكن عند θ = 90°.',
  },
  {
    question: 'إضافة قلب حديدي داخل الملف تؤدي إلى:',
    options: ['نقص المجال', 'زيادة المجال والحث الذاتي مئات المرات', 'تغيير اتجاه المجال', 'لا أثر لها'],
    correctIndex: 1,
    explanation: 'النفاذية النسبية μ_r للحديد كبيرة (~1000) فتضاعف B و L.',
  },
];

const MODE_LABEL: Record<EMMode, string> = {
  wire: 'السلك المستقيم',
  solenoid: 'الملف اللولبي',
  induction: 'الحث الكهرومغناطيسي',
};

const Electromagnetism3D = () => {
  const [mode, setMode] = useState<EMMode>('wire');
  const [current, setCurrent] = useState(5);
  const [distance, setDistance] = useState(0.1);
  const [turns, setTurns] = useState(500);
  const [coilLength, setCoilLength] = useState(0.3);
  const [coreMu, setCoreMu] = useState(1);
  const [loopArea, setLoopArea] = useState(0.05);
  const [fieldStrength, setFieldStrength] = useState(0.4);
  const [rotationSpeed, setRotationSpeed] = useState(3);
  const [resistance, setResistance] = useState(10);
  const [chargeSpeed, setChargeSpeed] = useState(1e6);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: EMParams = useMemo(
    () => ({
      mode,
      current,
      distance,
      turns,
      coilLength,
      coreMu,
      loopArea,
      fieldStrength,
      rotationSpeed,
      resistance,
      chargeSpeed,
    }),
    [
      mode,
      current,
      distance,
      turns,
      coilLength,
      coreMu,
      loopArea,
      fieldStrength,
      rotationSpeed,
      resistance,
      chargeSpeed,
    ]
  );

  const stats = useMemo(() => computeEM(params), [params]);
  const wireCurve = useMemo(() => wireFieldCurve(params), [params]);
  const coilCurve = useMemo(() => solenoidCurve(params), [params]);
  const emf = useMemo(() => emfCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('em-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((2 + Math.random() * 10) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.peakEmf - challenge);

  const hudReadings =
    mode === 'wire'
      ? [
          { label: 'المجال B', value: (stats.wireField * 1e6).toFixed(2), unit: 'µT', tone: 'primary' as const },
          { label: 'التيار', value: current.toFixed(1), unit: 'A' },
          { label: 'البعد r', value: (distance * 100).toFixed(1), unit: 'سم' },
          { label: 'قوة لورنتز', value: stats.lorentzForce.toExponential(2), unit: 'N', tone: 'warning' as const },
          { label: 'نصف قطر الدوران', value: stats.gyroRadius.toExponential(2), unit: 'م' },
          { label: 'الاتجاه', value: current >= 0 ? 'عكس عقارب الساعة' : 'مع عقارب الساعة', unit: '' },
        ]
      : mode === 'solenoid'
      ? [
          { label: 'المجال الداخلي', value: (stats.solenoidField * 1e3).toFixed(3), unit: 'mT', tone: 'primary' as const },
          { label: 'لفات/متر', value: stats.turnsPerMetre.toFixed(0), unit: '' },
          { label: 'الحث الذاتي', value: (stats.inductance * 1e3).toFixed(2), unit: 'mH', tone: 'success' as const },
          { label: 'العزم المغناطيسي', value: stats.magneticMoment.toFixed(2), unit: 'A·m²' },
          { label: 'كثافة الطاقة', value: stats.energyDensity.toFixed(2), unit: 'J/m³' },
          { label: 'القلب', value: coreMu > 50 ? 'حديدي' : 'هوائي', unit: '' },
        ]
      : [
          { label: 'ε العظمى', value: stats.peakEmf.toFixed(2), unit: 'V', tone: 'primary' as const },
          { label: 'ε الفعّالة', value: stats.rmsEmf.toFixed(2), unit: 'V' },
          { label: 'التيار الأعظم', value: stats.peakCurrent.toFixed(2), unit: 'A', tone: 'success' as const },
          { label: 'التدفق الأعظم', value: (stats.fluxMax * 1e3).toFixed(2), unit: 'mWb' },
          { label: 'القدرة', value: stats.power.toFixed(2), unit: 'W', tone: 'warning' as const },
          { label: 'التردد', value: rotationSpeed.toFixed(1), unit: 'Hz' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[14, 10, 18]} environment="night">
        <Suspense fallback={null}>
          <EMScene3D
            mode={mode}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showVectors={showVectors}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات حيّة" readings={hudReadings} />
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
    unit = ''
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">
          {value} {unit}
        </span>
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as EMMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wire" className="text-xs">سلك مستقيم</TabsTrigger>
            <TabsTrigger value="solenoid" className="text-xs">ملف لولبي</TabsTrigger>
            <TabsTrigger value="induction" className="text-xs">الحث</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'إيقاف مؤقت' : 'تشغيل'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> إعادة
          </Button>
        </div>

        {mode === 'wire' && (
          <>
            {slider('التيار I', current, setCurrent, -20, 20, 0.5, 'A')}
            {slider('البعد عن السلك r', distance, setDistance, 0.01, 0.5, 0.01, 'م')}
            {slider('سرعة الشحنة الاختبارية', chargeSpeed / 1e6, (v) => setChargeSpeed(v * 1e6), 0.1, 20, 0.1, '×10⁶ م/ث')}
          </>
        )}

        {mode === 'solenoid' && (
          <>
            {slider('التيار I', current, setCurrent, 0.5, 20, 0.5, 'A')}
            {slider('عدد اللفات N', turns, setTurns, 50, 2000, 10, 'لفة')}
            {slider('طول الملف L', coilLength, setCoilLength, 0.05, 1, 0.01, 'م')}
            {slider('مساحة المقطع', loopArea, setLoopArea, 0.001, 0.2, 0.001, 'م²')}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label className="text-sm">قلب حديدي (μᵣ ≈ 1000)</Label>
              <Switch checked={coreMu > 50} onCheckedChange={(c) => setCoreMu(c ? 1000 : 1)} />
            </div>
          </>
        )}

        {mode === 'induction' && (
          <>
            {slider('شدة المجال B', fieldStrength, setFieldStrength, 0.05, 2, 0.05, 'T')}
            {slider('مساحة الملف', loopArea, setLoopArea, 0.005, 0.3, 0.005, 'م²')}
            {slider('عدد اللفات N', turns, setTurns, 1, 500, 1, 'لفة')}
            {slider('سرعة الدوران', rotationSpeed, setRotationSpeed, 0.2, 20, 0.2, 'دورة/ث')}
            {slider('المقاومة R', resistance, setResistance, 0.5, 100, 0.5, 'Ω')}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار متجهات المجال</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        التيار الكهربائي يولّد مجالاً مغناطيسياً حوله، والمجال المتغيّر يولّد بدوره قوة دافعة كهربائية —
        هذا التبادل هو أساس <strong>المحركات والمولدات والمحوّلات</strong>. اتجاه المجال يُحدَّد بقاعدة
        اليد اليمنى، واتجاه التيار الحثي بقانون لنز.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        B_wire = μ₀ I / (2π r){'\n'}
        B_solenoid = μ₀ μᵣ n I ، n = N / L{'\n'}
        Φ = B·A·cos(ωt) ، ε = −N dΦ/dt = N B A ω sin(ωt){'\n'}
        L = μ₀ μᵣ n N A ، u = B² / 2μ{'\n'}
        F = q v B ، r = m v / (q B)
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>المجال حول السلك دائري متحد المركز ويضعف عكسياً مع البعد.</li>
        <li>داخل الملف اللولبي الطويل يكون المجال منتظماً تقريباً وخارجه شبه معدوم.</li>
        <li>القلب الحديدي يضاعف المجال والحث الذاتي مئات المرات.</li>
        <li>المولد الكهربائي يحوّل الطاقة الحركية إلى جهد جيبي ترددُه سرعةُ الدوران.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">المجال حول السلك مقابل البعد</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wireCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="r" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="B (µT)" stroke="#a855f7" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">مجال الملف مقابل عدد اللفات</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={coilCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="turns" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="B (mT)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">التدفق والجهد الحثي مع الزمن</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emf} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الجهد الحثي (V)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="التدفق (mWb)" stroke="#f97316" dot={false} strokeWidth={2} />
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
          تحدّي: صمّم مولّداً بجهد مطلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          انتقل إلى نمط «الحث» واضبط المجال والمساحة وعدد اللفات وسرعة الدوران حتى تصل ε العظمى إلى
          القيمة المطلوبة بفارق أقل من 0.3 فولت.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> جهد مطلوب جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)} V</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{stats.peakEmf.toFixed(2)} V</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9) <= 0.3
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9) <= 0.3
                ? `ممتاز! الفارق ${challengeError?.toFixed(2)} فولت فقط.`
                : `الفارق ${challengeError?.toFixed(2)} فولت — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الكهرومغناطيسية ثلاثية الأبعاد"
      subtitle="Electromagnetism 3D — السلك، الملف اللولبي، والحث الكهرومغناطيسي"
      icon={<Zap className="h-8 w-8 text-primary" />}
      objectives={[
        'استنتاج شكل المجال حول سلك مستقيم وتطبيق قاعدة اليد اليمنى',
        'حساب المجال داخل ملف لولبي وأثر كثافة اللفات والقلب الحديدي',
        'تطبيق قانون فاراداي لحساب الجهد الحثي في مولّد دوّار',
        'ربط قوة لورنتز بسرعة الشحنة ونصف قطر مسارها الدائري',
      ]}
      concepts={['قاعدة اليد اليمنى', 'قانون بيو-سافار', 'الملف اللولبي', 'قانون فاراداي', 'قانون لنز', 'قوة لورنتز']}
      steps={[
        'في «سلك مستقيم»: زد التيار وراقب ارتفاع قراءة B عند نقطة القياس الخضراء.',
        'باعد نقطة القياس ولاحظ التناقص العكسي (وليس التربيعي) للمجال.',
        'اعكس إشارة التيار وتابع انعكاس اتجاه حركة الإلكترونات.',
        'في «ملف لولبي»: ضاعف عدد اللفات مع تثبيت الطول وقارن المجال والحث الذاتي.',
        'شغّل القلب الحديدي وسجّل قفزة المجال بمقدار μᵣ.',
        'في «الحث»: زد سرعة الدوران وراقب سطوع المصباح وارتفاع الجهد الجيبي.',
      ]}
      scene={<Suspense fallback={<SimCanvasFallback />}>{scene}</Suspense>}
      controls={controls}
      explanation={explanation}
      charts={charts}
      challenge={challengeCard}
      quiz={<SimQuiz questions={QUIZ} />}
      notebook={
        <SimNotebook
          entries={entries}
          onClear={clear}
          fileName="electromagnetism-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'التيار (A)': current.toFixed(1),
              'B حول السلك (µT)': (stats.wireField * 1e6).toFixed(2),
              'B داخل الملف (mT)': (stats.solenoidField * 1e3).toFixed(3),
              'الحث الذاتي (mH)': (stats.inductance * 1e3).toFixed(2),
              'ε العظمى (V)': stats.peakEmf.toFixed(2),
              'ε الفعّالة (V)': stats.rmsEmf.toFixed(2),
              'التيار الأعظم (A)': stats.peakCurrent.toFixed(2),
              'القدرة (W)': stats.power.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default Electromagnetism3D;
