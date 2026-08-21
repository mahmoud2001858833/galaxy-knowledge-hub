import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { FlaskConical, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  Area,
  ComposedChart,
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
  KineticsMode,
  KineticsParams,
  REACTIONS,
  arrheniusPlot,
  computeKinetics,
  energyDistribution,
  energyProfile,
  findReaction,
  progressCurve,
} from '@/lib/sim-physics/kinetics';

const KineticsScene3D = lazy(() =>
  import('@/components/simulations3d/kinetics/KineticsScene3D').then((m) => ({ default: m.KineticsScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'دور العامل الحفّاز في التفاعل هو:',
    options: ['خفض طاقة التنشيط بتوفير مسار بديل', 'زيادة ΔH', 'رفع درجة الحرارة', 'زيادة كتلة النواتج'],
    correctIndex: 0,
    explanation: 'المحفّز يوفّر مساراً بطاقة تنشيط أقل فيزيد ثابت السرعة دون أن يغيّر ΔH أو موضع الاتزان.',
  },
  {
    question: 'وفق معادلة أرهينيوس k = A·e^(−Ea/RT)، رفع درجة الحرارة:',
    options: ['يقلّل k', 'يزيد k أُسّياً', 'لا يؤثر', 'يزيد Ea'],
    correctIndex: 1,
    explanation: 'زيادة T تزيد نسبة الجزيئات التي تتجاوز Ea، فيرتفع k بشكل أُسّي.',
  },
  {
    question: 'زمن نصف العمر لتفاعل من الرتبة الأولى:',
    options: ['يعتمد على التركيز الابتدائي', 'ثابت ولا يعتمد على التركيز', 'يتناسب مع T²', 'يساوي 1/k·C₀'],
    correctIndex: 1,
    explanation: 't½ = ln2/k لتفاعل الرتبة الأولى، وهو مستقل تماماً عن التركيز الابتدائي.',
  },
  {
    question: 'تجزئة المادة الصلبة إلى حبيبات أصغر تزيد سرعة التفاعل لأنها:',
    options: ['تخفض Ea', 'تزيد المساحة السطحية المتاحة للتصادم', 'تزيد ΔH', 'تبرّد الخليط'],
    correctIndex: 1,
    explanation: 'مساحة سطح أكبر تعني عدد تصادمات أكبر في وحدة الزمن ومن ثمّ سرعة أعلى.',
  },
  {
    question: 'التصادم الفعّال هو التصادم الذي:',
    options: [
      'يحدث بأي طاقة',
      'يمتلك طاقة ≥ Ea وباتجاه فراغي مناسب',
      'يحدث بين جزيئات متطابقة فقط',
      'ينتج حرارة',
    ],
    correctIndex: 1,
    explanation: 'نظرية التصادم تشترط طاقة كافية واتجاهية مناسبة معاً لتكوين المعقّد المنشّط.',
  },
  {
    question: 'في تفاعل طارد للحرارة تكون طاقة النواتج:',
    options: ['أعلى من المتفاعلات', 'أقل من المتفاعلات', 'مساوية لها', 'صفراً'],
    correctIndex: 1,
    explanation: 'ΔH سالبة، أي أن النواتج أدنى في الطاقة والفرق يتحرر إلى المحيط.',
  },
  {
    question: 'ميل الخط في مخطط أرهينيوس (ln k مقابل 1/T) يساوي:',
    options: ['−Ea/R', 'A', '+Ea/R', 'ln A'],
    correctIndex: 0,
    explanation: 'ln k = ln A − (Ea/R)(1/T)، فالميل = −Ea/R ويُستخدم لحساب طاقة التنشيط عملياً.',
  },
];

const MODE_LABEL: Record<KineticsMode, string> = {
  collisions: 'التصادمات',
  progress: 'تقدّم التفاعل',
  energy: 'منحنى الطاقة',
};

const ChemicalKinetics3D = () => {
  const [mode, setMode] = useState<KineticsMode>('collisions');
  const [reactionId, setReactionId] = useState('h2o2');
  const [concentration, setConcentration] = useState(1);
  const [temperature, setTemperature] = useState(320);
  const [catalyst, setCatalyst] = useState(false);
  const [surface, setSurface] = useState(1);
  const [time, setTime] = useState(0);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [target, setTarget] = useState<number | null>(null);

  const params: KineticsParams = useMemo(
    () => ({ reactionId, concentration, temperature, catalyst, surface, time }),
    [reactionId, concentration, temperature, catalyst, surface, time]
  );

  const stats = useMemo(() => computeKinetics(params), [params]);
  const curve = useMemo(() => progressCurve(params), [params]);
  const arrhenius = useMemo(() => arrheniusPlot(params), [params]);
  const profile = useMemo(() => energyProfile(reactionId, catalyst), [reactionId, catalyst]);
  const distribution = useMemo(() => energyDistribution(temperature, stats.ea), [temperature, stats.ea]);
  const reaction = findReaction(reactionId);
  const tEnd = curve[curve.length - 1]?.t ?? 10;

  const { entries, record, clear } = useSimNotebook('chemical-kinetics-3d');

  // Advance the reaction clock.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => (t >= tEnd ? 0 : Math.min(tEnd, t + (tEnd / 220) * timeScale * 2)));
    }, 60);
    return () => window.clearInterval(id);
  }, [playing, timeScale, tEnd]);

  const reset = () => {
    setResetKey((k) => k + 1);
    setTime(0);
    setPlaying(true);
  };

  const newChallenge = () => setTarget(50 + Math.floor(Math.random() * 40));

  const challengeMet = target !== null && stats.halfLife <= target && stats.conversion > 0.4;

  const hudReadings = [
    { label: 'التفاعل', value: reaction.equation, unit: '', tone: 'primary' as const },
    { label: 'k', value: stats.k.toExponential(2), unit: reaction.order === 1 ? '1/s' : 'L/mol·s' },
    { label: 'السرعة', value: stats.rate.toExponential(2), unit: 'mol/L·s', tone: 'success' as const },
    { label: 'المتبقّي', value: stats.remaining.toFixed(3), unit: 'mol/L' },
    { label: 'الناتج', value: stats.product.toFixed(3), unit: 'mol/L' },
    { label: 'التحوّل', value: (stats.conversion * 100).toFixed(1), unit: '%' },
    { label: 't½', value: stats.halfLife < 1e4 ? stats.halfLife.toFixed(1) : stats.halfLife.toExponential(2), unit: 's' },
    { label: 'Ea الفعّالة', value: stats.ea, unit: 'kJ/mol', tone: 'warning' as const },
  ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 12, 24]} environment="city">
        <Suspense fallback={null}>
          <KineticsScene3D
            mode={mode}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showParticles={showParticles}
            showLabels={showLabels}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات حركية حيّة" readings={hudReadings} />
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as KineticsMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            {(Object.keys(MODE_LABEL) as KineticsMode[]).map((m) => (
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
          <Label className="text-sm">التفاعل</Label>
          <Select
            value={reactionId}
            onValueChange={(v) => {
              setReactionId(v);
              setTime(0);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REACTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p dir="ltr" className="rounded-md bg-muted/40 p-2 text-center font-mono text-xs text-muted-foreground">
            {reaction.equation}
          </p>
        </div>

        {slider('درجة الحرارة', temperature, setTemperature, 250, 750, 1, `${temperature} K (${Math.round(temperature - 273.15)}°م)`)}
        {slider('التركيز الابتدائي', concentration, setConcentration, 0.05, 3, 0.05, `${concentration.toFixed(2)} mol/L`)}
        {slider('المساحة السطحية', surface, setSurface, 1, 5, 0.5, `${surface.toFixed(1)}×`)}
        {slider('زمن التفاعل', time, setTime, 0, tEnd, tEnd / 200, `${time.toFixed(2)} s`)}
        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-sm">إضافة عامل حفّاز</Label>
              <p className="text-xs text-muted-foreground">
                Ea: {reaction.ea} ← {reaction.eaCat} kJ/mol
              </p>
            </div>
            <Switch checked={catalyst} onCheckedChange={setCatalyst} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار الجسيمات</Label>
            <Switch checked={showParticles} onCheckedChange={setShowParticles} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار التسميات</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            record({
              التفاعل: reaction.name,
              'T (K)': temperature,
              'C₀ (mol/L)': concentration.toFixed(2),
              محفّز: catalyst ? 'نعم' : 'لا',
              k: stats.k.toExponential(2),
              't½ (s)': stats.halfLife.toExponential(2),
              'التحوّل %': (stats.conversion * 100).toFixed(1),
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
        تدرس حركية التفاعلات سرعة تحوّل المتفاعلات إلى نواتج والعوامل المؤثرة فيها. وفق نظرية التصادم
        لا ينتج عن كل تصادم تفاعل؛ بل يشترط أن تكون طاقة التصادم أكبر من طاقة التنشيط Ea وأن يكون
        الاتجاه الفراغي مناسباً لتكوين المعقّد المنشّط.
      </p>
      <p>
        رفع درجة الحرارة يزيد نسبة الجزيئات التي تتجاوز Ea أُسّياً، وزيادة التركيز أو المساحة السطحية
        ترفع عدد التصادمات في وحدة الزمن، أما العامل الحفّاز فيفتح مساراً بديلاً بطاقة تنشيط أقل دون
        أن يُستهلك أو يغيّر ΔH. ولذلك يرتفع ثابت السرعة k بينما يبقى موقع الاتزان كما هو.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        rate = k[A]^n{'\n'}
        k = A·e^(−Ea/RT) → ln k = ln A − (Ea/R)(1/T){'\n'}
        1st order: [A]t = [A]₀·e^(−kt) , t½ = ln2/k{'\n'}
        2nd order: 1/[A]t = 1/[A]₀ + kt , t½ = 1/(k[A]₀)
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">التركيز مقابل الزمن</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} label={{ value: 's', position: 'insideBottomRight', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Number(time.toFixed(2))} stroke="#f59e0b" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="reactant" name="المتفاعل (mol/L)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="product" name="الناتج (mol/L)" stroke="#22c55e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">منحنى الطاقة لإحداثي التفاعل</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profile} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'kJ/mol', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <RLine
                type="monotone"
                dataKey="e"
                name={catalyst ? 'الطاقة (بمحفّز)' : 'الطاقة (بدون محفّز)'}
                stroke={catalyst ? '#22c55e' : '#f97316'}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">مخطط أرهينيوس (ln k مقابل 1000/T)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={arrhenius} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="invT" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Number((1000 / temperature).toFixed(3))} stroke="#f59e0b" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="lnk" name="بدون محفّز" stroke="#f97316" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="lnkCat" name="بمحفّز" stroke="#22c55e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">توزيع الطاقة والجزيئات الفعّالة</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={distribution} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="e" tick={{ fontSize: 10 }} label={{ value: 'kJ/mol', position: 'insideBottomRight', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={stats.ea} stroke="#f43f5e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="f" name="توزيع الطاقة" stroke="#a855f7" dot={false} strokeWidth={2} />
              <Area type="monotone" dataKey="active" name="جزيئات فعّالة" fill="#22c55e" stroke="#22c55e" fillOpacity={0.35} />
            </ComposedChart>
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
          تحدّي: سرّع التفاعل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          اضبط الحرارة والتركيز والمساحة السطحية والمحفّز لتقليل زمن نصف العمر تحت الهدف مع تجاوز 40% من التحوّل.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {target !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>الهدف: زمن نصف العمر أقل من</span>
              <span className="font-mono font-bold">{target} s</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">
                {stats.halfLife < 1e5 ? stats.halfLife.toFixed(1) : stats.halfLife.toExponential(2)} s ·{' '}
                {(stats.conversion * 100).toFixed(0)}%
              </span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeMet ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeMet ? 'ممتاز! حقّقت السرعة المطلوبة.' : 'جرّب رفع الحرارة أو تفعيل المحفّز.'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="حركية التفاعلات ثلاثية الأبعاد"
      subtitle="Chemical Kinetics 3D — التصادمات، تقدّم التفاعل، ومنحنى الطاقة"
      icon={<FlaskConical className="h-8 w-8 text-primary" />}
      objectives={[
        'تفسير سرعة التفاعل بنظرية التصادم والتصادمات الفعّالة',
        'تطبيق معادلة أرهينيوس لحساب أثر الحرارة على ثابت السرعة',
        'التمييز بين تفاعلات الرتبة الأولى والثانية عبر زمن نصف العمر',
        'تحليل أثر المحفّز على طاقة التنشيط دون تغيّر ΔH',
        'ربط التركيز والمساحة السطحية بعدد التصادمات في وحدة الزمن',
      ]}
      concepts={[
        'نظرية التصادم',
        'طاقة التنشيط',
        'معادلة أرهينيوس',
        'رتبة التفاعل',
        'زمن نصف العمر',
        'العامل الحفّاز',
        'المعقّد المنشّط',
        'ΔH والتفاعل الطارد',
      ]}
      steps={[
        'في نمط «التصادمات» اختر تفكك فوق أكسيد الهيدروجين عند 320 K وراقب حركة الجسيمات.',
        'ارفع الحرارة إلى 450 K ولاحظ زيادة السرعة ونسبة التصادمات الفعّالة.',
        'فعّل العامل الحفّاز وقارن قيمة Ea وثابت السرعة قبل وبعد.',
        'انتقل إلى «تقدّم التفاعل» وتابع تفريغ كأس المتفاعل وامتلاء كأس الناتج.',
        'غيّر التركيز الابتدائي ولاحظ أثره على زمن نصف العمر في الرتبة الثانية مقابل الأولى.',
        'في «منحنى الطاقة» شاهد الكرة تتسلّق حاجز التنشيط وقارن المسارين بمحفّز وبدونه.',
        'ارفع المساحة السطحية إلى 5× وسجّل السرعة الجديدة.',
        'سجّل ثلاث قراءات لتفاعلات مختلفة وقارن طاقات تنشيطها في الدفتر.',
      ]}
      scene={<Suspense fallback={<SimCanvasFallback />}>{scene}</Suspense>}
      controls={controls}
      explanation={explanation}
      charts={charts}
      challenge={challengeCard}
      quiz={<SimQuiz questions={QUIZ} />}
      notebook={<SimNotebook entries={entries} onClear={clear} fileName="chemical-kinetics" />}
    />
  );
};

export default ChemicalKinetics3D;
