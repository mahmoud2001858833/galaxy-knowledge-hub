import { Suspense, lazy, useMemo, useState } from 'react';
import { Sparkles, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  ElectrostaticsMode,
  ElectrostaticsParams,
  computeElectrostatics,
  forceCurve,
  potentialProfile,
} from '@/lib/sim-physics/electrostatics';

const ElectrostaticsScene3D = lazy(() =>
  import('@/components/simulations3d/electrostatics/ElectrostaticsScene3D').then((m) => ({
    default: m.ElectrostaticsScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'قانون كولوم ينص على أن القوة بين شحنتين تتناسب:',
    options: [
      'طردياً مع البعد',
      'عكسياً مع مربع البعد وطردياً مع حاصل ضرب الشحنتين',
      'عكسياً مع الشحنتين',
      'طردياً مع مربع البعد',
    ],
    correctIndex: 1,
    explanation: 'F = k q₁q₂ / r² — تناسب عكسي مع مربع البعد.',
  },
  {
    question: 'إذا ضاعفنا البعد بين شحنتين فإن القوة تصبح:',
    options: ['الضِعف', 'النصف', 'الربع', 'أربعة أضعاف'],
    correctIndex: 2,
    explanation: 'لأن F ∝ 1/r²، فمضاعفة r تقسّم القوة على 4.',
  },
  {
    question: 'خطوط المجال الكهربائي تخرج من:',
    options: ['الشحنة السالبة إلى الموجبة', 'الشحنة الموجبة إلى السالبة', 'المركز فقط', 'لا اتجاه لها'],
    correctIndex: 1,
    explanation: 'اصطلاحاً تخرج من الموجبة وتدخل في السالبة، ولا تتقاطع أبداً.',
  },
  {
    question: 'الشحنة على موصل معزول تتوزع:',
    options: ['في الحجم كله', 'على السطح الخارجي فقط', 'في المركز', 'بالتساوي داخلياً'],
    correctIndex: 1,
    explanation: 'الشحنات تتنافر فتستقر على السطح الخارجي والمجال داخل الموصل يساوي صفراً.',
  },
  {
    question: 'يحدث انهيار الهواء (شرارة) عندما يتجاوز المجال الكهربائي تقريباً:',
    options: ['3 kV/m', '3 MV/m', '3 V/m', '3 GV/m'],
    correctIndex: 1,
    explanation: 'قوة العزل للهواء ≈ 3 × 10⁶ فولت/متر.',
  },
  {
    question: 'وضع وسط عازل معامل سماحيته النسبية εᵣ بين الشحنتين يؤدي إلى:',
    options: ['زيادة القوة εᵣ مرة', 'نقصان القوة بمقدار εᵣ', 'لا تغيير', 'عكس اتجاه القوة'],
    correctIndex: 1,
    explanation: 'F = q₁q₂ / (4πε₀εᵣ r²) — الوسط العازل يُضعف القوة.',
  },
];

const MODE_LABEL: Record<ElectrostaticsMode, string> = {
  coulomb: 'قانون كولوم',
  field: 'المجال والجهد',
  vandegraaff: 'مولّد فان دي غراف',
};

const StaticElectricity3D = () => {
  const [mode, setMode] = useState<ElectrostaticsMode>('coulomb');
  const [q1, setQ1] = useState(20);
  const [q2, setQ2] = useState(-15);
  const [separation, setSeparation] = useState(30);
  const [epsilonR, setEpsilonR] = useState(1);
  const [chargeA, setChargeA] = useState(15);
  const [chargeB, setChargeB] = useState(-15);
  const [chargeGap, setChargeGap] = useState(0.8);
  const [probeX, setProbeX] = useState(0);
  const [probeY, setProbeY] = useState(0.7);
  const [domeRadius, setDomeRadius] = useState(20);
  const [domeCharge, setDomeCharge] = useState(8);
  const [beltSpeed, setBeltSpeed] = useState(1.4);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: ElectrostaticsParams = useMemo(
    () => ({
      mode,
      q1,
      q2,
      separation,
      epsilonR,
      charges: [
        { id: 'a', q: chargeA, x: -chargeGap, y: 0 },
        { id: 'b', q: chargeB, x: chargeGap, y: 0 },
      ],
      probeX,
      probeY,
      domeRadius,
      domeCharge,
      beltSpeed,
    }),
    [
      mode,
      q1,
      q2,
      separation,
      epsilonR,
      chargeA,
      chargeB,
      chargeGap,
      probeX,
      probeY,
      domeRadius,
      domeCharge,
      beltSpeed,
    ]
  );

  const stats = useMemo(() => computeElectrostatics(params), [params]);
  const fCurve = useMemo(() => forceCurve(params), [params]);
  const vProfile = useMemo(() => potentialProfile(params), [params]);

  const { entries, record, clear } = useSimNotebook('electrostatics-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((0.5 + Math.random() * 6) * 100) / 100);
  const challengeError = challenge === null ? null : Math.abs(stats.force * 1e3 - challenge);

  const hudReadings =
    mode === 'coulomb'
      ? [
          { label: 'القوة F', value: (stats.force * 1e3).toFixed(4), unit: 'mN', tone: 'primary' as const },
          { label: 'النوع', value: stats.attractive ? 'تجاذب' : 'تنافر', unit: '' },
          { label: 'البعد r', value: separation.toFixed(1), unit: 'سم' },
          { label: 'طاقة الوضع', value: (stats.potentialEnergy * 1e3).toFixed(4), unit: 'mJ', tone: 'warning' as const },
          { label: 'εᵣ الوسط', value: epsilonR.toFixed(2), unit: '' },
          { label: 'q₁·q₂', value: (q1 * q2).toFixed(0), unit: 'nC²' },
        ]
      : mode === 'field'
      ? [
          { label: 'المجال E', value: (stats.fieldAtProbe / 1e3).toFixed(3), unit: 'kV/m', tone: 'primary' as const },
          { label: 'الجهد V', value: (stats.potentialAtProbe / 1e3).toFixed(3), unit: 'kV', tone: 'success' as const },
          { label: 'اتجاه E', value: stats.fieldAngle.toFixed(1), unit: '°' },
          { label: 'Eₓ', value: (stats.fieldX / 1e3).toFixed(2), unit: 'kV/m' },
          { label: 'E_y', value: (stats.fieldY / 1e3).toFixed(2), unit: 'kV/m' },
          { label: 'موقع المجس', value: `${probeX.toFixed(2)}, ${probeY.toFixed(2)}`, unit: 'م' },
        ]
      : [
          { label: 'جهد القبة', value: (stats.domePotential / 1e3).toFixed(0), unit: 'kV', tone: 'primary' as const },
          { label: 'المجال السطحي', value: (stats.domeSurfaceField / 1e6).toFixed(2), unit: 'MV/m', tone: 'warning' as const },
          { label: 'الحالة', value: stats.breakdown ? 'شرارة!' : 'مستقر', unit: '' },
          { label: 'طول الشرارة', value: stats.sparkLength.toFixed(1), unit: 'سم' },
          { label: 'السعة', value: (stats.capacitance * 1e12).toFixed(1), unit: 'pF' },
          { label: 'إلكترونات مُنتقلة', value: stats.electronsTransferred.toExponential(2), unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 8, 20]} environment="night">
        <Suspense fallback={null}>
          <ElectrostaticsScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as ElectrostaticsMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coulomb" className="text-xs">كولوم</TabsTrigger>
            <TabsTrigger value="field" className="text-xs">المجال والجهد</TabsTrigger>
            <TabsTrigger value="vandegraaff" className="text-xs">فان دي غراف</TabsTrigger>
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

        {mode === 'coulomb' && (
          <>
            {slider('الشحنة q₁', q1, setQ1, -50, 50, 1, 'nC')}
            {slider('الشحنة q₂', q2, setQ2, -50, 50, 1, 'nC')}
            {slider('البعد بينهما r', separation, setSeparation, 2, 60, 1, 'سم')}
            {slider('سماحية الوسط εᵣ', epsilonR, setEpsilonR, 1, 81, 0.5)}
          </>
        )}

        {mode === 'field' && (
          <>
            {slider('الشحنة الأولى', chargeA, setChargeA, -40, 40, 1, 'nC')}
            {slider('الشحنة الثانية', chargeB, setChargeB, -40, 40, 1, 'nC')}
            {slider('نصف المسافة بينهما', chargeGap, setChargeGap, 0.2, 2, 0.05, 'م')}
            {slider('موقع المجس X', probeX, setProbeX, -2, 2, 0.05, 'م')}
            {slider('موقع المجس Y', probeY, setProbeY, -2, 2, 0.05, 'م')}
          </>
        )}

        {mode === 'vandegraaff' && (
          <>
            {slider('نصف قطر القبة', domeRadius, setDomeRadius, 5, 60, 1, 'سم')}
            {slider('شحنة القبة', domeCharge, setDomeCharge, 0, 60, 0.5, 'µC')}
            {slider('سرعة الحزام', beltSpeed, setBeltSpeed, 0, 3, 0.1, '×')}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار متجهات القوة والمجال</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الكهرباء الساكنة تدرس الشحنات في حالة سكون: التجاذب والتنافر وفق <strong>قانون كولوم</strong>،
        وتوزّع <strong>المجال والجهد</strong> حولها، وتراكم الشحنة على الموصلات كما في مولّد فان دي
        غراف حتى يحدث انهيار الهواء وتقفز الشرارة.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        F = k q₁q₂ / (εᵣ r²) ، k = 8.99×10⁹ N·m²/C²{'\n'}
        E = F/q = k q / r² ، V = k q / r{'\n'}
        U = k q₁q₂ / r{'\n'}
        Dome: V = kQ/R ، E = kQ/R² ، C = 4πε₀R{'\n'}
        Air breakdown ≈ 3×10⁶ V/m
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>الشحنات المتشابهة تتنافر والمختلفة تتجاذب، والقوتان متساويتان ومتضادتان (نيوتن الثالث).</li>
        <li>المجال كمية متجهة والجهد كمية قياسية؛ الجهد يجمع جبرياً والمجال يجمع اتجاهياً.</li>
        <li>عند منتصف شحنتين متساويتين ومتضادتين لا ينعدم المجال بل ينعدم الجهد.</li>
        <li>القبة الأصغر تصل إلى مجال سطحي أعلى، لذا تُفرِّغ شحنتها أسرع (تأثير الأطراف المدببة).</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">القوة وطاقة الوضع مقابل البعد</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="r" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="القوة (mN)" stroke="#f43f5e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="طاقة الوضع (mJ)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الجهد والمجال على المحور</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vProfile} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="x" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الجهد (kV)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="المجال (kV/m)" stroke="#f97316" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط قوة كولوم المطلوبة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط «كولوم» غيّر الشحنتين والبعد والوسط حتى تصل القوة إلى القيمة المطلوبة بفارق أقل من
          0.05 ميلي نيوتن.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> قوة مطلوبة جديدة
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)} mN</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{(stats.force * 1e3).toFixed(3)} mN</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9) <= 0.05
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9) <= 0.05
                ? `ممتاز! الفارق ${challengeError?.toFixed(3)} mN فقط.`
                : `الفارق ${challengeError?.toFixed(3)} mN — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الكهرباء الساكنة ثلاثية الأبعاد"
      subtitle="Electrostatics 3D — قانون كولوم، خطوط المجال والجهد، ومولّد فان دي غراف"
      icon={<Sparkles className="h-8 w-8 text-primary" />}
      objectives={[
        'تطبيق قانون كولوم وتحليل أثر مقدار الشحنة والبعد والوسط العازل',
        'رسم خطوط المجال الكهربائي وتفسير تراكب المجالات لشحنتين',
        'التمييز بين المجال (متجه) والجهد (قياسي) عند نقطة قياس',
        'تفسير تراكم الشحنة على سطح الموصل وحدوث انهيار الهواء',
      ]}
      concepts={['قانون كولوم', 'المجال الكهربائي', 'الجهد الكهربائي', 'خطوط المجال', 'قوة العزل للهواء', 'السعة']}
      steps={[
        'في «كولوم»: اجعل الشحنتين متشابهتين ولاحظ اتجاه المتجهات (تنافر) ثم اعكس إشارة إحداهما.',
        'ضاعف البعد وسجّل أن القوة صارت الربع — تحقّق من العلاقة التربيعية العكسية.',
        'ارفع εᵣ إلى 81 (الماء) وقارن انخفاض القوة.',
        'في «المجال والجهد»: حرّك المجس بين الشحنتين وراقب دوران متجه E وتغيّر V.',
        'اضبط الشحنتين متساويتين ومتضادتين ولاحظ انعدام الجهد عند المنتصف.',
        'في «فان دي غراف»: ارفع الشحنة حتى يتجاوز المجال 3 MV/m وشاهد الشرارة.',
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
          fileName="electrostatics-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'q₁ (nC)': q1.toFixed(0),
              'q₂ (nC)': q2.toFixed(0),
              'البعد (سم)': separation.toFixed(1),
              'القوة (mN)': (stats.force * 1e3).toFixed(4),
              'النوع': stats.attractive ? 'تجاذب' : 'تنافر',
              'E عند المجس (kV/m)': (stats.fieldAtProbe / 1e3).toFixed(3),
              'V عند المجس (kV)': (stats.potentialAtProbe / 1e3).toFixed(3),
              'جهد القبة (kV)': (stats.domePotential / 1e3).toFixed(1),
              'المجال السطحي (MV/m)': (stats.domeSurfaceField / 1e6).toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default StaticElectricity3D;
