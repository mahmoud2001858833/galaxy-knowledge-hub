import { Suspense, lazy, useMemo, useState } from 'react';
import { Atom, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  QuantumMode,
  QuantumParams,
  computeQuantum,
  interferencePattern,
  tunnellingCurve,
  wellDensity,
} from '@/lib/sim-physics/quantum';

const QuantumScene3D = lazy(() =>
  import('@/components/simulations3d/quantum/QuantumScene3D').then((m) => ({
    default: m.QuantumScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'طول موجة دي برولي للجسيم يُعطى بالعلاقة:',
    options: ['λ = h·p', 'λ = h/p', 'λ = p/h', 'λ = hc/p'],
    correctIndex: 1,
    explanation: 'λ = h/p، فكلما زاد الزخم قصُر طول الموجة.',
  },
  {
    question: 'عند وضع كاشف يحدد الشقّ الذي مرّ منه الإلكترون فإن:',
    options: ['تزداد الأهداب وضوحاً', 'يختفي نمط التداخل', 'يتضاعف عدد الأهداب', 'لا يتغيّر شيء'],
    correctIndex: 1,
    explanation: 'القياس يُلغي الترابط الطوري فينهار النمط إلى قمّتين (سلوك جسيمي).',
  },
  {
    question: 'تباعد الأهداب على الشاشة يتناسب:',
    options: ['طردياً مع d', 'عكسياً مع λ', 'طردياً مع λL وعكسياً مع d', 'مع L² فقط'],
    correctIndex: 2,
    explanation: 'Δy = λL/d.',
  },
  {
    question: 'النفق الكمي (Tunnelling) يعني:',
    options: [
      'اجتياز الجسيم لحاجز طاقته أكبر من طاقته',
      'امتصاص الجسيم للطاقة',
      'انعكاس الجسيم دائماً',
      'تفكك الحاجز',
    ],
    correctIndex: 0,
    explanation: 'دالة الموجة تتضاءل أسّياً داخل الحاجز لكنها لا تنعدم، فيوجد احتمال نفاذ.',
  },
  {
    question: 'كيف يتغيّر احتمال النفاذ عند زيادة عرض الحاجز؟',
    options: ['يزداد خطياً', 'يقل أسّياً', 'لا يتأثر', 'يصبح 1'],
    correctIndex: 1,
    explanation: 'T ≈ e^(−2κa)، فالاعتماد أسّي على العرض a.',
  },
  {
    question: 'مستويات الطاقة في بئر الجهد اللانهائي تتناسب مع:',
    options: ['n', 'n²', '1/n', '√n'],
    correctIndex: 1,
    explanation: 'Eₙ = n²h²/(8mL²).',
  },
  {
    question: 'مبدأ الارتياب لهايزنبرغ ينص على أن:',
    options: ['Δx·Δp ≥ ħ/2', 'Δx·Δp = 0', 'Δx = Δp', 'Δx·Δp ≤ ħ'],
    correctIndex: 0,
    explanation: 'تضييق الشق (Δx أصغر) يزيد تشتت الزخم فيتّسع نمط الحيود.',
  },
];

const MODE_LABEL: Record<QuantumMode, string> = {
  doubleslit: 'تجربة الشقين',
  tunnel: 'النفق الكمي',
  superposition: 'التراكب في بئر الجهد',
};

const QuantumMechanics3D = () => {
  const [mode, setMode] = useState<QuantumMode>('doubleslit');
  const [energy, setEnergy] = useState(0.5);
  const [slitSeparation, setSlitSeparation] = useState(120);
  const [slitWidth, setSlitWidth] = useState(30);
  const [screenDistance, setScreenDistance] = useState(60);
  const [barrierHeight, setBarrierHeight] = useState(2);
  const [barrierWidth, setBarrierWidth] = useState(0.6);
  const [wellWidth, setWellWidth] = useState(1);
  const [stateN, setStateN] = useState(1);
  const [stateM, setStateM] = useState(2);
  const [mixing, setMixing] = useState(0.5);
  const [observed, setObserved] = useState(false);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: QuantumParams = useMemo(
    () => ({
      mode,
      energy,
      slitSeparation,
      slitWidth,
      screenDistance,
      barrierHeight,
      barrierWidth,
      wellWidth,
      stateN,
      stateM,
      mixing,
      observed,
    }),
    [
      mode,
      energy,
      slitSeparation,
      slitWidth,
      screenDistance,
      barrierHeight,
      barrierWidth,
      wellWidth,
      stateN,
      stateM,
      mixing,
      observed,
    ]
  );

  const stats = useMemo(() => computeQuantum(params), [params]);
  const pattern = useMemo(() => interferencePattern(params, 200), [params]);
  const tCurve = useMemo(() => tunnellingCurve(params), [params]);
  const density = useMemo(() => wellDensity(params, 0, 140), [params]);

  const { entries, record, clear } = useSimNotebook('quantum-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((1 + Math.random() * 40) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.transmission * 100 - challenge);

  const hudReadings =
    mode === 'doubleslit'
      ? [
          { label: 'طول موجة دي برولي', value: stats.deBroglie.toFixed(3), unit: 'nm', tone: 'primary' as const },
          { label: 'تباعد الأهداب', value: stats.fringeSpacing.toFixed(3), unit: 'µm', tone: 'success' as const },
          { label: 'أعلى رتبة m', value: String(stats.maxOrder), unit: '' },
          { label: 'الزخم p', value: stats.momentum.toExponential(2), unit: 'kg·m/s' },
          { label: 'الحالة', value: observed ? 'مُراقَب (جسيم)' : 'غير مُراقَب (موجة)', unit: '' },
          { label: 'Δx·Δp ÷ (ħ/2)', value: stats.uncertainty.toFixed(2), unit: '' },
        ]
      : mode === 'tunnel'
      ? [
          { label: 'احتمال النفاذ T', value: (stats.transmission * 100).toFixed(3), unit: '%', tone: 'primary' as const },
          { label: 'الانعكاس R', value: (stats.reflection * 100).toFixed(3), unit: '%', tone: 'warning' as const },
          { label: 'الطاقة E', value: energy.toFixed(2), unit: 'eV' },
          { label: 'ارتفاع الحاجز V₀', value: barrierHeight.toFixed(2), unit: 'eV' },
          {
            label: 'عمق التغلغل 1/κ',
            value: isFinite(stats.decayLength) ? stats.decayLength.toFixed(3) : '∞',
            unit: 'nm',
          },
          { label: 'النظام', value: stats.classicallyAllowed ? 'فوق الحاجز' : 'نفق كمي', unit: '' },
        ]
      : [
          { label: `E(n=${stateN})`, value: stats.energyN.toFixed(4), unit: 'eV', tone: 'primary' as const },
          { label: `E(n=${stateM})`, value: stats.energyM.toFixed(4), unit: 'eV', tone: 'success' as const },
          { label: 'فرق الطاقة', value: Math.abs(stats.energyM - stats.energyN).toFixed(4), unit: 'eV' },
          {
            label: 'زمن النبض',
            value: isFinite(stats.beatPeriod) ? stats.beatPeriod.toFixed(2) : '∞',
            unit: 'fs',
            tone: 'warning' as const,
          },
          { label: 'عرض البئر L', value: wellWidth.toFixed(2), unit: 'nm' },
          { label: 'نسبة الخلط', value: (mixing * 100).toFixed(0), unit: '%' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[6, 9, 22]} environment="night">
        <Suspense fallback={null}>
          <QuantumScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as QuantumMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doubleslit" className="text-xs">الشقّان</TabsTrigger>
            <TabsTrigger value="tunnel" className="text-xs">النفق الكمي</TabsTrigger>
            <TabsTrigger value="superposition" className="text-xs">التراكب</TabsTrigger>
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

        {slider('طاقة الإلكترون E', energy, setEnergy, 0.05, 5, 0.05, 'eV')}

        {mode === 'doubleslit' && (
          <>
            {slider('المسافة بين الشقين d', slitSeparation, setSlitSeparation, 30, 400, 5, 'nm')}
            {slider('عرض الشق w', slitWidth, setSlitWidth, 5, 120, 1, 'nm')}
            {slider('بُعد الشاشة L', screenDistance, setScreenDistance, 10, 200, 5, 'µm')}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label className="text-sm">تفعيل كاشف المسار (المراقبة)</Label>
              <Switch checked={observed} onCheckedChange={setObserved} />
            </div>
          </>
        )}

        {mode === 'tunnel' && (
          <>
            {slider('ارتفاع الحاجز V₀', barrierHeight, setBarrierHeight, 0.2, 6, 0.1, 'eV')}
            {slider('عرض الحاجز a', barrierWidth, setBarrierWidth, 0.1, 3, 0.05, 'nm')}
          </>
        )}

        {mode === 'superposition' && (
          <>
            {slider('عرض البئر L', wellWidth, setWellWidth, 0.3, 4, 0.05, 'nm')}
            {slider('الحالة الأولى n', stateN, setStateN, 1, 6, 1)}
            {slider('الحالة الثانية m', stateM, setStateM, 1, 6, 1)}
            {slider('نسبة خلط الحالة m', mixing, setMixing, 0, 1, 0.05)}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار دوال الموجة والمنحنيات داخل المشهد</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        ميكانيكا الكم تصف الجسيمات بدوال موجية احتمالية: الإلكترون يمرّ عبر <strong>شقّين معاً</strong>
        فيبني نمط تداخل، ويمكنه <strong>النفاذ عبر حاجز</strong> طاقته أعلى من طاقته، وعندما يُحبس في
        <strong> بئر جهد</strong> تصبح طاقته مكمّاة في مستويات منفصلة.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        λ = h/p ، p = √(2mE){'\n'}
        Δy = λL/d ، I = I₀ cos²(πd sinθ/λ) · sinc²(πw sinθ/λ){'\n'}
        T = [1 + V₀² sinh²(κa) / (4E(V₀−E))]⁻¹ ، κ = √(2m(V₀−E))/ħ{'\n'}
        Eₙ = n²h² / (8mL²) ، ψₙ(x) = √(2/L) sin(nπx/L){'\n'}
        Δx · Δp ≥ ħ/2
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>النمط يظهر حتى عند إطلاق إلكترون واحد في كل مرّة — الاحتمال هو ما يتداخل، لا الجسيمات.</li>
        <li>تفعيل كاشف المسار يُلغي التداخل ويُبقي غلاف الحيود لشقّ واحد فقط.</li>
        <li>احتمال النفاذ يتناقص أسّياً مع العرض والارتفاع — أساس المجهر النفقي (STM) واضمحلال ألفا.</li>
        <li>تضييق الشق يزيد الارتياب في الزخم فيتّسع نمط الحيود (هايزنبرغ).</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">توزيع الشدة على الشاشة (µm)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pattern} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="y" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الشدة" stroke="#a3e635" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الغلاف" stroke="#f97316" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">احتمال النفاذ مقابل الطاقة</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="E" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="احتمال النفاذ (%)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">دالة الموجة وكثافة الاحتمال داخل البئر</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={density} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="x" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="كثافة الاحتمال" stroke="#8b5cf6" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="ψ" stroke="#22c55e" dot={false} strokeWidth={1.5} />
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
          تحدّي: اضبط احتمال النفاذ المطلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط «النفق الكمي» غيّر طاقة الإلكترون وارتفاع الحاجز وعرضه حتى يصل احتمال النفاذ إلى
          القيمة المطلوبة بفارق أقل من 1%.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> نسبة نفاذ جديدة
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(1)} %</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{(stats.transmission * 100).toFixed(2)} %</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 1
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 1
                ? `ممتاز! الفارق ${challengeError?.toFixed(2)}% فقط.`
                : `الفارق ${challengeError?.toFixed(2)}% — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="ميكانيكا الكم ثلاثية الأبعاد"
      subtitle="Quantum Mechanics 3D — تجربة الشقين، النفق الكمي، وتراكب الحالات"
      icon={<Atom className="h-8 w-8 text-primary" />}
      objectives={[
        'حساب طول موجة دي برولي وربطه بطاقة الجسيم وزخمه',
        'تفسير نمط تداخل الشقين وأثر المراقبة على انهيار النمط',
        'تحليل احتمال النفاذ عبر حاجز جهد ودور العرض والارتفاع',
        'استنتاج تكميم الطاقة في بئر الجهد وتفسير تراكب الحالات',
      ]}
      concepts={[
        'موجة دي برولي',
        'ازدواجية الموجة والجسيم',
        'تداخل الشقين',
        'أثر المراقبة',
        'النفق الكمي',
        'تكميم الطاقة',
        'مبدأ الارتياب',
      ]}
      steps={[
        'في «الشقّان»: شغّل المحاكاة ولاحظ تراكم النقاط نقطة نقطة حتى يظهر نمط الأهداب.',
        'قلّل المسافة d بين الشقين وسجّل أن تباعد الأهداب Δy يزداد.',
        'فعّل كاشف المسار ولاحظ اختفاء الأهداب وبقاء غلاف الحيود.',
        'انتقل إلى «النفق الكمي» واجعل E < V₀ ثم راقب اضمحلال الموجة داخل الحاجز.',
        'ضاعف عرض الحاجز وسجّل الانخفاض الأسّي في T.',
        'في «التراكب»: اخلط الحالتين n=1 و n=2 وشاهد تذبذب كثافة الاحتمال بزمن النبض.',
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
          fileName="quantum-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'الطاقة (eV)': energy.toFixed(2),
              'λ دي برولي (nm)': stats.deBroglie.toFixed(4),
              'تباعد الأهداب (µm)': stats.fringeSpacing.toFixed(3),
              'المراقبة': observed ? 'مفعّلة' : 'معطّلة',
              'V₀ (eV)': barrierHeight.toFixed(2),
              'a (nm)': barrierWidth.toFixed(2),
              'T (%)': (stats.transmission * 100).toFixed(3),
              'Eₙ (eV)': stats.energyN.toFixed(4),
              'زمن النبض (fs)': isFinite(stats.beatPeriod) ? stats.beatPeriod.toFixed(2) : '∞',
            })
          }
        />
      }
    />
  );
};

export default QuantumMechanics3D;
