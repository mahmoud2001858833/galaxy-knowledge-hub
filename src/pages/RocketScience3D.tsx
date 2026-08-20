import { Suspense, lazy, useMemo, useState } from 'react';
import { Rocket, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  RocketMode,
  RocketParams,
  computeRocket,
  simulateAscent,
  trajectoryCurve,
  loadsCurve,
  orbitSweep,
  landingProfile,
  R_EARTH,
} from '@/lib/sim-physics/rocket';

const RocketScene3D = lazy(() =>
  import('@/components/simulations3d/rocket/RocketScene3D').then((m) => ({ default: m.RocketScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'معادلة تسيولكوفسكي تربط Δv بـ:',
    options: ['الدفع فقط', 'زمن الحرق', 'الاندفاع النوعي ونسبة الكتلة', 'مساحة المقطع'],
    correctIndex: 2,
    explanation: 'Δv = I_sp · g₀ · ln(m₀/m_f) — نسبة الكتلة تدخل لوغاريتمياً.',
  },
  {
    question: 'لكي يقلع الصاروخ من المنصّة يجب أن تكون نسبة الدفع إلى الوزن TWR:',
    options: ['أقل من 1', 'تساوي 0', 'أكبر من 1', 'لا علاقة لها'],
    correctIndex: 2,
    explanation: 'إذا كان الدفع أقل من الوزن يبقى الصاروخ على المنصة.',
  },
  {
    question: 'السرعة المدارية الدائرية تُعطى بـ:',
    options: ['v = √(GM/r)', 'v = √(2GM/r)', 'v = GM/r²', 'v = 2πr'],
    correctIndex: 0,
    explanation: 'سرعة الإفلات هي √2 من هذه القيمة: v_esc = √(2GM/r).',
  },
  {
    question: 'ماذا يمثّل Max-Q في الإطلاق؟',
    options: [
      'أقصى ارتفاع',
      'أقصى ضغط ديناميكي على الهيكل',
      'أقصى استهلاك وقود',
      'أقصى تسارع',
    ],
    correctIndex: 1,
    explanation: 'q = ½ρv² — يبلغ ذروته حين يوازن ازدياد السرعة تناقص كثافة الهواء.',
  },
  {
    question: 'كلما ارتفع المدار عن سطح الأرض فإن:',
    options: [
      'السرعة المدارية تزيد والزمن الدوري يقل',
      'السرعة تقل والزمن الدوري يزيد',
      'كلاهما يقل',
      'كلاهما يزيد',
    ],
    correctIndex: 1,
    explanation: 'v ∝ 1/√r بينما T ∝ r^{3/2} حسب قانون كبلر الثالث.',
  },
  {
    question: 'في «حرق التوقف» (Suicide Burn) يبدأ التشغيل عند ارتفاع:',
    options: ['ثابت دائماً', 'h = v²/(2a)', 'h = v·t', 'h = ½gt² فقط'],
    correctIndex: 1,
    explanation: 'اشتقاق مباشر من v² = v₀² − 2a·h بجعل السرعة النهائية صفراً.',
  },
];

const MODE_LABEL: Record<RocketMode, string> = {
  launch: 'الإطلاق',
  orbit: 'المدارات',
  landing: 'الهبوط',
};

const RocketScience3D = () => {
  const [mode, setMode] = useState<RocketMode>('launch');
  const [wetMass, setWetMass] = useState(50000);
  const [dryMass, setDryMass] = useState(6000);
  const [isp, setIsp] = useState(300);
  const [burnTime, setBurnTime] = useState(160);
  const [thrust, setThrust] = useState(900);
  const [dragCoeff, setDragCoeff] = useState(0.3);
  const [area, setArea] = useState(10);
  const [pitch, setPitch] = useState(35);
  const [altitude, setAltitude] = useState(400);
  const [eccentricity, setEccentricity] = useState(0.1);
  const [landAltitude, setLandAltitude] = useState(600);
  const [landSpeed, setLandSpeed] = useState(80);
  const [throttle, setThrottle] = useState(0.6);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: RocketParams = useMemo(
    () => ({
      mode,
      wetMass,
      dryMass: Math.min(dryMass, wetMass - 500),
      isp,
      burnTime,
      thrust,
      dragCoeff,
      area,
      pitch,
      altitude,
      eccentricity,
      landAltitude,
      landSpeed,
      throttle,
    }),
    [
      mode,
      wetMass,
      dryMass,
      isp,
      burnTime,
      thrust,
      dragCoeff,
      area,
      pitch,
      altitude,
      eccentricity,
      landAltitude,
      landSpeed,
      throttle,
    ]
  );

  const flight = useMemo(() => simulateAscent(params), [params]);
  const stats = useMemo(() => computeRocket(params, flight), [params, flight]);
  const traj = useMemo(() => trajectoryCurve(flight), [flight]);
  const loads = useMemo(() => loadsCurve(flight), [flight]);
  const orbits = useMemo(() => orbitSweep(), []);
  const landing = useMemo(() => landingProfile(params, stats), [params, stats]);

  const { entries, record, clear } = useSimNotebook('rocket-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round(7000 + Math.random() * 4000));
  const challengeError = challenge === null ? null : Math.abs(stats.deltaV - challenge);

  const hudReadings =
    mode === 'launch'
      ? [
          { label: 'Δv', value: (stats.deltaV / 1000).toFixed(2), unit: 'كم/ث', tone: 'primary' as const },
          { label: 'TWR', value: stats.twr.toFixed(2), unit: '', tone: stats.twr > 1 ? ('success' as const) : ('warning' as const) },
          { label: 'الأوج', value: (stats.apogee / 1000).toFixed(1), unit: 'كم' },
          { label: 'أقصى سرعة', value: stats.maxSpeed.toFixed(0), unit: 'م/ث' },
          { label: 'Max-Q', value: (stats.maxQ / 1000).toFixed(1), unit: 'kPa', tone: 'warning' as const },
          { label: 'الوقود', value: (stats.propellant / 1000).toFixed(1), unit: 'طن' },
        ]
      : mode === 'orbit'
      ? [
          { label: 'السرعة المدارية', value: (stats.orbitSpeed / 1000).toFixed(3), unit: 'كم/ث', tone: 'primary' as const },
          { label: 'الزمن الدوري', value: (stats.period / 60).toFixed(1), unit: 'دقيقة', tone: 'success' as const },
          { label: 'سرعة الإفلات', value: (stats.escapeSpeed / 1000).toFixed(2), unit: 'كم/ث', tone: 'warning' as const },
          { label: 'الأوج', value: ((stats.apoapsis - R_EARTH) / 1000).toFixed(0), unit: 'كم' },
          { label: 'الحضيض', value: ((stats.periapsis - R_EARTH) / 1000).toFixed(0), unit: 'كم' },
          { label: 'الطاقة النوعية', value: (stats.specificEnergy / 1e6).toFixed(2), unit: 'MJ/kg' },
        ]
      : [
          { label: 'ارتفاع بدء الحرق', value: stats.suicideBurnAlt.toFixed(0), unit: 'م', tone: 'primary' as const },
          { label: 'التباطؤ', value: stats.landingDecel.toFixed(1), unit: 'م/ث²', tone: 'warning' as const },
          { label: 'سرعة الملامسة', value: stats.touchdownSpeed.toFixed(1), unit: 'م/ث', tone: stats.safeLanding ? ('success' as const) : ('warning' as const) },
          { label: 'الخانق', value: (throttle * 100).toFixed(0), unit: '%' },
          { label: 'وقود الهبوط', value: stats.landingFuel.toFixed(0), unit: 'كغ' },
          { label: 'الحالة', value: stats.safeLanding ? 'آمن' : 'ارتطام', unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[18, 14, 26]} environment="night">
        <Suspense fallback={null}>
          <RocketScene3D
            mode={mode}
            params={params}
            stats={stats}
            flight={flight}
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
          <Tabs value={mode} onValueChange={(v) => setMode(v as RocketMode)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="launch" className="text-xs">الإطلاق</TabsTrigger>
              <TabsTrigger value="orbit" className="text-xs">المدارات</TabsTrigger>
              <TabsTrigger value="landing" className="text-xs">الهبوط</TabsTrigger>
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

          {mode === 'launch' && (
            <>
              {slider('الكتلة الكلية', wetMass, setWetMass, 10000, 200000, 1000, 'كغ')}
              {slider('الكتلة الجافة', dryMass, setDryMass, 2000, 60000, 500, 'كغ')}
              {slider('الاندفاع النوعي I_sp', isp, setIsp, 180, 460, 5, 'ث')}
              {slider('الدفع', thrust, setThrust, 200, 4000, 50, 'kN')}
              {slider('زمن الحرق', burnTime, setBurnTime, 40, 400, 5, 'ث')}
              {slider('زاوية الميل', pitch, setPitch, 0, 80, 1, '°')}
              {slider('معامل السحب C_d', dragCoeff, setDragCoeff, 0.1, 1.2, 0.05)}
              {slider('مساحة المقطع', area, setArea, 2, 40, 1, 'م²')}
            </>
          )}

          {mode === 'orbit' && (
            <>
              {slider('ارتفاع المدار', altitude, setAltitude, 150, 36000, 50, 'كم')}
              {slider('الاختلاف المركزي e', eccentricity, setEccentricity, 0, 0.8, 0.01)}
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6">
                مدار منخفض LEO ≈ 400 كم، ومدار ثابت بالنسبة للأرض GEO ≈ 35786 كم بزمن دوري 24 ساعة.
              </div>
            </>
          )}

          {mode === 'landing' && (
            <>
              {slider('ارتفاع بدء المناورة', landAltitude, setLandAltitude, 100, 3000, 50, 'م')}
              {slider('سرعة الهبوط الابتدائية', landSpeed, setLandSpeed, 20, 300, 5, 'م/ث')}
              {slider('نسبة الخانق', throttle, setThrottle, 0.1, 1, 0.05)}
              {slider('الكتلة الجافة', dryMass, setDryMass, 2000, 60000, 500, 'كغ')}
              {slider('الدفع', thrust, setThrust, 200, 4000, 50, 'kN')}
            </>
          )}

          {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

          <div className="flex items-center justify-between">
            <Label htmlFor="vec">إظهار متجهات القوى</Label>
            <Switch id="vec" checked={showVectors} onCheckedChange={setShowVectors} />
          </div>
        </CardContent>
      </Card>
    </>
  );

  const explanation = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الفيزياء خلف المشهد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'معادلة الصاروخ', f: 'Δv = I_sp g₀ ln(m₀/m_f)' },
            { t: 'نسبة الدفع للوزن', f: 'TWR = F / (m g₀)' },
            { t: 'الضغط الديناميكي', f: 'q = ½ ρ v²' },
            { t: 'السرعة المدارية', f: 'v = √(GM / r)' },
            { t: 'الزمن الدوري', f: 'T = 2π √(r³ / GM)' },
            { t: 'حرق التوقف', f: 'h = v² / (2a)' },
          ].map((e) => (
            <div key={e.t} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="mb-1 text-xs font-bold text-foreground">{e.t}</div>
              <div className="font-mono text-xs" dir="ltr">
                {e.f}
              </div>
            </div>
          ))}
        </div>
        <p>
          لاحظ في المشهد: يبدأ الصاروخ رأسياً ثم ينفّذ «دوران الجاذبية» تدريجياً نحو الأفق لتحويل الطاقة إلى
          سرعة أفقية — فالمدار ليس ارتفاعاً بل سرعة أفقية كافية. عند Max-Q يكون الإجهاد على الهيكل أعظمياً
          لذلك تخفّض الصواريخ الحقيقية الدفع لحظياً. وفي نمط الهبوط، كل تأخير في بدء الحرق يعني ارتطاماً،
          وكل تبكير يعني استهلاك وقود إضافي وتوقّفاً في الهواء.
        </p>
      </CardContent>
    </Card>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'orbit'
              ? 'السرعة والزمن الدوري مقابل الارتفاع'
              : mode === 'landing'
              ? 'السرعة مقابل الارتفاع أثناء الهبوط'
              : 'مسار الطيران (الارتفاع مقابل المدى)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'orbit' ? (
              <LineChart data={orbits} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="altitude" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="السرعة (km/s)" stroke="#38bdf8" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="الزمن الدوري (دقيقة)" stroke="#f97316" dot={false} strokeWidth={2} />
              </LineChart>
            ) : mode === 'landing' ? (
              <LineChart data={landing} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="altitude" tick={{ fontSize: 11 }} reversed />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="السرعة (m/s)" stroke="#f43f5e" dot={false} strokeWidth={2} />
              </LineChart>
            ) : (
              <LineChart data={traj} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="downrange" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="الارتفاع (km)" stroke="#22c55e" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="السرعة (m/s)" stroke="#a855f7" dot={false} strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الأحمال أثناء الصعود (Max-Q والتسارع)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loads} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الضغط الديناميكي (kPa)" stroke="#f59e0b" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="التسارع (g)" stroke="#38bdf8" dot={false} strokeWidth={2} />
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
          تحدّي: صمّم صاروخاً بميزانية Δv محددة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          اضبط الكتل والاندفاع النوعي للوصول إلى Δv المطلوبة بفارق أقل من 150 م/ث، مع بقاء TWR أكبر من 1.2.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تحدٍّ جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span>Δv المطلوبة</span>
              <Badge variant="secondary" className="font-mono">{challenge} م/ث</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Δv الحالية</span>
              <span className="font-mono font-bold">{stats.deltaV.toFixed(0)} م/ث</span>
            </div>
            <div className="flex items-center justify-between">
              <span>TWR</span>
              <span className="font-mono font-bold">{stats.twr.toFixed(2)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9999) <= 150 && stats.twr > 1.2
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9999) <= 150 && stats.twr > 1.2
                ? `ممتاز! الفارق ${challengeError?.toFixed(0)} م/ث فقط.`
                : `الفارق ${challengeError?.toFixed(0)} م/ث — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="علوم الصواريخ والفضاء ثلاثية الأبعاد"
      subtitle="Rocket Science 3D — الإطلاق، المدارات، والهبوط المُوجَّه"
      icon={<Rocket className="h-8 w-8 text-primary" />}
      objectives={[
        'تطبيق معادلة تسيولكوفسكي لحساب ميزانية Δv',
        'تفسير دوران الجاذبية وأثر السحب الجوي وMax-Q',
        'حساب السرعة المدارية والزمن الدوري وسرعة الإفلات',
        'تصميم مناورة هبوط مُوجَّه وحساب ارتفاع بدء حرق التوقف',
      ]}
      concepts={['معادلة الصاروخ', 'نسبة الدفع للوزن', 'Max-Q', 'قوانين كبلر', 'سرعة الإفلات', 'الهبوط المُوجَّه']}
      steps={[
        'في نمط «الإطلاق»: ارفع الدفع وراقب TWR — إن قلّ عن 1 لن يقلع الصاروخ.',
        'غيّر زاوية الميل وقارن بين الارتفاع والمدى الأفقي.',
        'راقب منحنى الأحمال وحدّد لحظة Max-Q.',
        'انتقل إلى «المدارات»: قارن مدار 400 كم بمدار 35786 كم في السرعة والزمن.',
        'ارفع الاختلاف المركزي e ولاحظ تحوّل المدار من دائري إلى إهليلجي.',
        'في «الهبوط»: اضبط الخانق حتى تصبح سرعة الملامسة أقل من 6 م/ث.',
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
          fileName="rocket-science-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'Δv (م/ث)': stats.deltaV.toFixed(0),
              'TWR': stats.twr.toFixed(2),
              'الأوج (كم)': (stats.apogee / 1000).toFixed(1),
              'Max-Q (kPa)': (stats.maxQ / 1000).toFixed(1),
              'سرعة المدار (كم/ث)': (stats.orbitSpeed / 1000).toFixed(3),
              'الزمن الدوري (د)': (stats.period / 60).toFixed(1),
              'حرق التوقف (م)': stats.suicideBurnAlt.toFixed(0),
              'سرعة الملامسة (م/ث)': stats.touchdownSpeed.toFixed(1),
            })
          }
        />
      }
    />
  );
};

export default RocketScience3D;
