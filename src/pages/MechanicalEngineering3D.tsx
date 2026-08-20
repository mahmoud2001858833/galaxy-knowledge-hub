import { Suspense, lazy, useMemo, useState } from 'react';
import { Wrench, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  MachineMode,
  MachineParams,
  computeMachine,
  leverCurve,
  pulleyCurve,
  gearCurve,
} from '@/lib/sim-physics/machines';

const MachineScene3D = lazy(() =>
  import('@/components/simulations3d/machines/MachineScene3D').then((m) => ({ default: m.MachineScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'الفائدة الآلية المثالية للرافعة تساوي:',
    options: ['ذراع الحمل ÷ ذراع الجهد', 'ذراع الجهد ÷ ذراع الحمل', 'الحمل × الجهد', 'الشغل الداخل ÷ الزمن'],
    correctIndex: 1,
    explanation: 'IMA = ذراع الجهد / ذراع الحمل — كلما طال ذراع الجهد قلّت القوة اللازمة.',
  },
  {
    question: 'في نظام بكرات فيه بكرتان متحركتان، عدد الحبال الحاملة يساوي:',
    options: ['2', '3', '4', '6'],
    correctIndex: 2,
    explanation: 'كل بكرة متحركة تضيف حبلين حاملين، فالفائدة الآلية = 4.',
  },
  {
    question: 'الآلة البسيطة تقلّل القوة لكنها لا تقلّل:',
    options: ['المسافة', 'الشغل', 'الزمن', 'الاحتكاك'],
    correctIndex: 1,
    explanation: 'الشغل محفوظ: ما نكسبه في القوة نخسره في المسافة (بل يزيد الشغل بسبب الاحتكاك).',
  },
  {
    question: 'ترس قائد 20 سن يدير ترساً مقاداً 60 سن، فإن سرعة المقاد:',
    options: ['ثلاثة أمثال القائد', 'ثلث سرعة القائد', 'مساوية', 'ضعف القائد'],
    correctIndex: 1,
    explanation: 'n₂ = n₁ × (N₁/N₂) = n₁/3، بينما العزم يتضاعف ثلاث مرات.',
  },
  {
    question: 'وظيفة الترس الوسيط (Idler) هي:',
    options: [
      'تغيير نسبة التروس',
      'عكس اتجاه الدوران دون تغيير النسبة',
      'مضاعفة العزم',
      'تقليل الاحتكاك',
    ],
    correctIndex: 1,
    explanation: 'الترس الوسيط لا يؤثر على النسبة الكلية، لكنه يعكس اتجاه دوران الترس المقاد.',
  },
  {
    question: 'الرافعة من النوع الثالث (مثل الملقط) تتميز بأن:',
    options: ['فائدتها الآلية أكبر من 1', 'فائدتها الآلية أقل من 1 لكنها تكسب سرعة ومدى', 'لا ذراع لها', 'الارتكاز في الوسط'],
    correctIndex: 1,
    explanation: 'ذراع الجهد أقصر من ذراع الحمل، فنخسر في القوة ونربح في المسافة والسرعة.',
  },
];

const MODE_LABEL: Record<MachineMode, string> = {
  lever: 'الروافع',
  pulley: 'البكرات',
  gears: 'التروس',
};

const MechanicalEngineering3D = () => {
  const [mode, setMode] = useState<MachineMode>('lever');
  const [loadMass, setLoadMass] = useState(60);
  const [loadArm, setLoadArm] = useState(0.6);
  const [effortArm, setEffortArm] = useState(1.8);
  const [leverClass, setLeverClass] = useState<1 | 2 | 3>(1);
  const [movablePulleys, setMovablePulleys] = useState(2);
  const [liftHeight, setLiftHeight] = useState(3);
  const [efficiency, setEfficiency] = useState(0.9);
  const [driverTeeth, setDriverTeeth] = useState(20);
  const [drivenTeeth, setDrivenTeeth] = useState(60);
  const [idlerTeeth, setIdlerTeeth] = useState(0);
  const [inputRpm, setInputRpm] = useState(1200);
  const [inputTorque, setInputTorque] = useState(15);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: MachineParams = useMemo(
    () => ({
      mode,
      loadMass,
      loadArm,
      effortArm,
      leverClass,
      movablePulleys,
      liftHeight,
      efficiency,
      driverTeeth,
      drivenTeeth,
      idlerTeeth,
      inputRpm,
      inputTorque,
    }),
    [
      mode,
      loadMass,
      loadArm,
      effortArm,
      leverClass,
      movablePulleys,
      liftHeight,
      efficiency,
      driverTeeth,
      drivenTeeth,
      idlerTeeth,
      inputRpm,
      inputTorque,
    ]
  );

  const stats = useMemo(() => computeMachine(params), [params]);
  const lever = useMemo(() => leverCurve(params), [params]);
  const pulley = useMemo(() => pulleyCurve(params), [params]);
  const gears = useMemo(() => gearCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('machines-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((2 + Math.random() * 4) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.actualMA - challenge);

  const hudReadings =
    mode === 'lever'
      ? [
          { label: 'قوة الحمل', value: stats.loadForce.toFixed(0), unit: 'N', tone: 'warning' as const },
          { label: 'قوة الجهد', value: stats.effortForce.toFixed(0), unit: 'N', tone: 'primary' as const },
          { label: 'الفائدة الآلية', value: stats.actualMA.toFixed(2), unit: '', tone: stats.actualMA >= 1 ? ('success' as const) : ('warning' as const) },
          { label: 'عزم الحمل', value: stats.torqueLoad.toFixed(1), unit: 'N·m' },
          { label: 'عزم الجهد', value: stats.torqueEffort.toFixed(1), unit: 'N·m' },
          { label: 'الكفاءة', value: (efficiency * 100).toFixed(0), unit: '%' },
        ]
      : mode === 'pulley'
      ? [
          { label: 'الحبال الحاملة', value: String(stats.supportingRopes), unit: '', tone: 'primary' as const },
          { label: 'قوة الشد', value: stats.effortForce.toFixed(0), unit: 'N', tone: 'success' as const },
          { label: 'قوة الحمل', value: stats.loadForce.toFixed(0), unit: 'N', tone: 'warning' as const },
          { label: 'طول الحبل المسحوب', value: stats.ropePull.toFixed(1), unit: 'م' },
          { label: 'الشغل الداخل', value: stats.workIn.toFixed(0), unit: 'J' },
          { label: 'الطاقة المفقودة', value: stats.lostEnergy.toFixed(0), unit: 'J' },
        ]
      : [
          { label: 'نسبة التروس', value: stats.gearRatio.toFixed(2), unit: ': 1', tone: 'primary' as const },
          { label: 'سرعة الخرج', value: stats.outputRpm.toFixed(0), unit: 'rpm', tone: 'success' as const },
          { label: 'عزم الخرج', value: stats.outputTorque.toFixed(1), unit: 'N·m', tone: 'warning' as const },
          { label: 'عزم الدخل', value: inputTorque.toFixed(1), unit: 'N·m' },
          { label: 'القدرة', value: (stats.power / 1000).toFixed(2), unit: 'kW' },
          { label: 'اتجاه الدوران', value: stats.sameDirection ? 'نفس القائد' : 'معاكس', unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 7, 14]} environment="warehouse">
        <Suspense fallback={null}>
          <MachineScene3D
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
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">لوحة التحكّم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as MachineMode)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lever" className="text-xs">الروافع</TabsTrigger>
              <TabsTrigger value="pulley" className="text-xs">البكرات</TabsTrigger>
              <TabsTrigger value="gears" className="text-xs">التروس</TabsTrigger>
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

          {mode === 'lever' && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">نوع الرافعة</Label>
                <Tabs value={String(leverClass)} onValueChange={(v) => setLeverClass(Number(v) as 1 | 2 | 3)} dir="rtl">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="1" className="text-xs">الأول</TabsTrigger>
                    <TabsTrigger value="2" className="text-xs">الثاني</TabsTrigger>
                    <TabsTrigger value="3" className="text-xs">الثالث</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {slider('كتلة الحمل', loadMass, setLoadMass, 5, 300, 5, 'كغ')}
              {slider('ذراع الحمل', loadArm, setLoadArm, 0.2, 2, 0.05, 'م')}
              {slider('ذراع الجهد', effortArm, setEffortArm, 0.2, 3, 0.05, 'م')}
            </>
          )}

          {mode === 'pulley' && (
            <>
              {slider('كتلة الحمل', loadMass, setLoadMass, 5, 300, 5, 'كغ')}
              {slider('عدد البكرات المتحركة', movablePulleys, setMovablePulleys, 1, 5, 1, 'بكرة')}
              {slider('ارتفاع الرفع', liftHeight, setLiftHeight, 0.5, 10, 0.5, 'م')}
            </>
          )}

          {mode === 'gears' && (
            <>
              {slider('أسنان الترس القائد', driverTeeth, setDriverTeeth, 8, 60, 1, 'سن')}
              {slider('أسنان الترس المقاد', drivenTeeth, setDrivenTeeth, 8, 80, 1, 'سن')}
              {slider('أسنان الترس الوسيط (0 = بدون)', idlerTeeth, setIdlerTeeth, 0, 40, 1, 'سن')}
              {slider('سرعة الدخل', inputRpm, setInputRpm, 100, 4000, 50, 'rpm')}
              {slider('عزم الدخل', inputTorque, setInputTorque, 1, 100, 1, 'N·m')}
            </>
          )}

          {slider('الكفاءة (فقد الاحتكاك)', efficiency, setEfficiency, 0.4, 1, 0.01)}
          {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار متجهات القوى</Label>
            <Switch checked={showVectors} onCheckedChange={setShowVectors} />
          </div>
        </CardContent>
      </Card>
    </>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الآلات البسيطة لا تُنشئ طاقة، بل تُعيد توزيعها: <strong>الشغل الداخل = الشغل الخارج + الفقد</strong>.
        الفائدة الآلية المثالية هي نسبة تكبير القوة، والفائدة الفعلية تنقص بمقدار الكفاءة.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        IMA(lever) = d_effort / d_load{'\n'}
        F_effort = F_load / (IMA × η){'\n'}
        IMA(pulley) = عدد الحبال الحاملة = 2n{'\n'}
        n₂ = n₁ × N₁/N₂ ، τ₂ = τ₁ × N₂/N₁ × η{'\n'}
        P = τ · ω = τ · 2πn/60
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>الرافعة الأولى: الارتكاز بين الجهد والحمل (المقص، الميزان).</li>
        <li>الرافعة الثانية: الحمل بين الارتكاز والجهد (عربة اليد) — فائدة آلية دائماً &gt; 1.</li>
        <li>الرافعة الثالثة: الجهد بين الارتكاز والحمل (الملقط، ساعد الإنسان) — كسب في السرعة لا في القوة.</li>
        <li>كل بكرة متحركة تضيف حبلين حاملين وتضاعف طول الحبل الواجب سحبه.</li>
        <li>الترس الوسيط يعكس الاتجاه فقط ولا يغيّر النسبة الكلية.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">قوة الجهد والفائدة الآلية مقابل طول ذراع الجهد</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lever} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="arm" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="قوة الجهد (N)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الفائدة الآلية" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">أثر عدد البكرات المتحركة</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pulley} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="n" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="قوة الشد (N)" stroke="#f59e0b" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="طول الحبل (م)" stroke="#a78bfa" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">مقايضة السرعة والعزم في التروس</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gears} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="teeth" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="السرعة (rpm)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="العزم (N·m)" stroke="#f97316" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط الآلة لتحقيق فائدة آلية مطلوبة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          عدّل الأذرع أو عدد البكرات أو الأسنان حتى تصل الفائدة الآلية الفعلية إلى القيمة المطلوبة بفارق أقل من 0.15.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تحدٍّ جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span>الفائدة المطلوبة</span>
              <Badge variant="secondary" className="font-mono">{challenge}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>الفائدة الحالية</span>
              <span className="font-mono font-bold">{stats.actualMA.toFixed(2)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9) <= 0.15
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9) <= 0.15
                ? `ممتاز! الفارق ${challengeError?.toFixed(2)} فقط.`
                : `الفارق ${challengeError?.toFixed(2)} — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الهندسة الميكانيكية ثلاثية الأبعاد"
      subtitle="Simple Machines 3D — الروافع، البكرات، وقطار التروس"
      icon={<Wrench className="h-8 w-8 text-primary" />}
      objectives={[
        'حساب الفائدة الآلية المثالية والفعلية وتمييز أثر الكفاءة',
        'تصنيف الروافع إلى الأنواع الثلاثة وتفسير عزوم الاتزان',
        'تحليل نظام بكرات مركّب وربط القوة بطول الحبل المسحوب',
        'اشتقاق نسبة التروس وربطها بمقايضة السرعة والعزم',
      ]}
      concepts={['الفائدة الآلية', 'العزم', 'حفظ الشغل', 'الكفاءة', 'نسبة التروس', 'قطار الحركة']}
      steps={[
        'في «الروافع»: ثبّت الحمل وطوّل ذراع الجهد، وراقب انخفاض القوة اللازمة.',
        'بدّل نوع الرافعة إلى الثالث ولاحظ أن الفائدة الآلية تصبح أقل من 1.',
        'انتقل إلى «البكرات»: زد عدد البكرات المتحركة وقارن قوة الشد بطول الحبل.',
        'قلّل الكفاءة إلى 60% وسجّل الطاقة المفقودة بالاحتكاك.',
        'في «التروس»: اجعل المقاد ثلاثة أضعاف القائد وتحقّق من قسمة السرعة وضرب العزم.',
        'أضف ترساً وسيطاً وراقب انعكاس اتجاه الدوران دون تغيّر النسبة.',
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
          fileName="mechanical-engineering-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'قوة الحمل (N)': stats.loadForce.toFixed(0),
              'قوة الجهد (N)': stats.effortForce.toFixed(0),
              'الفائدة الآلية': stats.actualMA.toFixed(2),
              'الحبال الحاملة': String(stats.supportingRopes),
              'نسبة التروس': stats.gearRatio.toFixed(2),
              'سرعة الخرج (rpm)': stats.outputRpm.toFixed(0),
              'عزم الخرج (N·m)': stats.outputTorque.toFixed(1),
              'الكفاءة (%)': (efficiency * 100).toFixed(0),
            })
          }
        />
      }
    />
  );
};

export default MechanicalEngineering3D;
