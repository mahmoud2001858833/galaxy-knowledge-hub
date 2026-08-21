import { Suspense, lazy, useMemo, useState } from 'react';
import { HeartPulse, Play, Pause, RotateCcw, Trophy, AlertTriangle } from 'lucide-react';
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
  AreaChart,
  Area,
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
  BODY_PRESETS,
  BodyParams,
  BodySystem,
  DEFAULT_BODY,
  NORMAL_RANGES,
  SYSTEM_INFO,
  activityCurve,
  computeBody,
  dissociationCurve,
  ecgTrace,
  heartRateCurve,
  spirometryTrace,
} from '@/lib/sim-physics/humanbody';

const BodyScene3D = lazy(() =>
  import('@/components/simulations3d/body/BodyScene3D').then((m) => ({ default: m.BodyScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'النتاج القلبي يساوي:',
    options: ['معدل النبض × حجم الضربة', 'الضغط × المقاومة', 'حجم الضربة ÷ النبض', 'الضغط الانبساطي × 3'],
    correctIndex: 0,
    explanation: 'CO = HR × SV، ويقاس باللتر في الدقيقة (طبيعي 4–8 ل/د).',
  },
  {
    question: 'أسمك حجرة في القلب هي البطين الأيسر لأنه:',
    options: ['يستقبل أكبر كمية دم', 'يضخ إلى الرئتين', 'يولّد ضغط الدورة الجهازية', 'يحتوي صمامين'],
    correctIndex: 2,
    explanation: 'مقاومة الدورة الجهازية أعلى بكثير من الرئوية فيحتاج جداراً عضلياً سميكاً.',
  },
  {
    question: 'التهوية السنخية = ',
    options: [
      'معدل التنفس × الحجم الجاري',
      'معدل التنفس × (الحجم الجاري − الحيّز الميت)',
      'الحجم الجاري ÷ معدل التنفس',
      'السعة الحيوية × التنفس',
    ],
    correctIndex: 1,
    explanation: 'نحو 150 مل من كل نفس تبقى في الممرات ولا تشارك في التبادل (الحيّز الميت).',
  },
  {
    question: 'ينزاح منحنى تفكّك الهيموغلوبين إلى اليمين عند:',
    options: ['انخفاض الحرارة', 'ارتفاع الحرارة وCO₂', 'ارتفاع pH', 'نقص النشاط'],
    correctIndex: 1,
    explanation: 'أثر بور: الحرارة والحموضة وCO₂ تقلّل ألفة الهيموغلوبين فيسلّم O₂ للأنسجة العاملة.',
  },
  {
    question: 'التوصيل القفزي في الأعصاب سببه:',
    options: ['غمد الميالين وعقد رانفييه', 'كثرة المشابك', 'ضخامة جسم الخلية', 'النواقل العصبية'],
    correctIndex: 0,
    explanation: 'جهد الفعل يقفز من عقدة إلى أخرى فترتفع السرعة إلى نحو 120 م/ث.',
  },
  {
    question: 'العضو الذي يبدأ فيه هضم البروتين هو:',
    options: ['الفم', 'المعدة', 'الأمعاء الغليظة', 'الكبد'],
    correctIndex: 1,
    explanation: 'حمض HCl ينشّط البيبسينوجين إلى بيبسين الذي يفكّك البروتين.',
  },
  {
    question: 'الترشيح في الكلية يحدث في:',
    options: ['الأنبوب الملتوي البعيد', 'الكبيبة ومحفظة بومان', 'القناة الجامعة', 'الحالب'],
    correctIndex: 1,
    explanation: 'ضغط الدم المرتفع في الكبيبة يدفع الماء والذائبات الصغيرة إلى محفظة بومان.',
  },
  {
    question: 'هرمون ADH يؤدي إلى:',
    options: ['زيادة إدرار البول', 'زيادة إعادة امتصاص الماء', 'خفض ضغط الدم', 'زيادة الترشيح'],
    correctIndex: 1,
    explanation: 'يزيد نفاذية القناة الجامعة للماء فيقلّ حجم البول ويزداد تركيزه.',
  },
  {
    question: 'انقباض العضلة يُفسَّر بنظرية:',
    options: ['الضغط الأسموزي', 'الخيوط المنزلقة', 'النقل النشط', 'التوتر السطحي'],
    correctIndex: 1,
    explanation: 'رؤوس الميوسين ترتبط بالأكتين وتسحبه بضربات مجدافية مستهلكة ATP.',
  },
  {
    question: 'تراكم اللاكتات فوق 4 ممول/لتر يدل على:',
    options: ['كفاية الأكسجين', 'اعتماد متزايد على التحلل اللاهوائي', 'توقف التنفس', 'ارتفاع pH'],
    correctIndex: 1,
    explanation: 'عندما يقصر توصيل الأكسجين عن الطلب تتحوّل الخلية إلى الطريق اللاهوائي.',
  },
];

const SYSTEM_ORDER: BodySystem[] = ['circulatory', 'respiratory', 'nervous', 'digestive', 'urinary', 'muscular'];

const HumanBody3D = () => {
  const [system, setSystem] = useState<BodySystem>('circulatory');
  const [heartRate, setHeartRate] = useState(DEFAULT_BODY.heartRate);
  const [strokeVolume, setStrokeVolume] = useState(DEFAULT_BODY.strokeVolume);
  const [breathRate, setBreathRate] = useState(DEFAULT_BODY.breathRate);
  const [tidalVolume, setTidalVolume] = useState(DEFAULT_BODY.tidalVolume);
  const [fio2, setFio2] = useState(DEFAULT_BODY.fio2);
  const [activity, setActivity] = useState(DEFAULT_BODY.activity);
  const [hydration, setHydration] = useState(DEFAULT_BODY.hydration);
  const [hemoglobin, setHemoglobin] = useState(DEFAULT_BODY.hemoglobin);
  const [temperature, setTemperature] = useState(DEFAULT_BODY.temperature);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [organ, setOrgan] = useState<string>('lv');
  const [challengeOn, setChallengeOn] = useState(false);

  const params: BodyParams = useMemo(
    () => ({ heartRate, strokeVolume, breathRate, tidalVolume, fio2, activity, hydration, hemoglobin, temperature }),
    [heartRate, strokeVolume, breathRate, tidalVolume, fio2, activity, hydration, hemoglobin, temperature]
  );
  const stats = useMemo(() => computeBody(params), [params]);
  const info = SYSTEM_INFO[system];
  const activeOrgan = info.organs.find((o) => o.id === organ) ?? info.organs[0];

  const ecg = useMemo(() => ecgTrace(heartRate), [heartRate]);
  const spiro = useMemo(() => spirometryTrace(params), [params]);
  const odc = useMemo(() => dissociationCurve(params), [params]);
  const hrc = useMemo(() => heartRateCurve(params), [params]);
  const act = useMemo(() => activityCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('human-body-3d');

  const applyPreset = (key: string) => {
    const p = BODY_PRESETS[key].params;
    if (p.heartRate !== undefined) setHeartRate(p.heartRate);
    if (p.strokeVolume !== undefined) setStrokeVolume(p.strokeVolume);
    if (p.breathRate !== undefined) setBreathRate(p.breathRate);
    if (p.tidalVolume !== undefined) setTidalVolume(p.tidalVolume);
    if (p.fio2 !== undefined) setFio2(p.fio2);
    if (p.activity !== undefined) setActivity(p.activity);
    if (p.hydration !== undefined) setHydration(p.hydration);
    if (p.hemoglobin !== undefined) setHemoglobin(p.hemoglobin);
    if (p.temperature !== undefined) setTemperature(p.temperature);
  };

  const reset = () => {
    setResetKey((k) => k + 1);
    setHeartRate(DEFAULT_BODY.heartRate);
    setStrokeVolume(DEFAULT_BODY.strokeVolume);
    setBreathRate(DEFAULT_BODY.breathRate);
    setTidalVolume(DEFAULT_BODY.tidalVolume);
    setFio2(DEFAULT_BODY.fio2);
    setActivity(DEFAULT_BODY.activity);
    setHydration(DEFAULT_BODY.hydration);
    setHemoglobin(DEFAULT_BODY.hemoglobin);
    setTemperature(DEFAULT_BODY.temperature);
    setPlaying(true);
  };

  const challengeSolved =
    challengeOn && activity >= 0.75 && stats.spo2 >= 94 && stats.lactate < 4 && stats.map > 65 && stats.map < 120;

  const hudReadings = [
    { label: 'النتاج القلبي', value: stats.cardiacOutput.toFixed(1), unit: 'ل/د', tone: 'primary' as const },
    { label: 'ضغط الدم', value: `${stats.systolic.toFixed(0)}/${stats.diastolic.toFixed(0)}`, unit: 'mmHg' },
    {
      label: 'SpO₂',
      value: stats.spo2.toFixed(0),
      unit: '%',
      tone: stats.spo2 >= 94 ? ('success' as const) : ('warning' as const),
    },
    { label: 'التهوية', value: stats.minuteVentilation.toFixed(1), unit: 'ل/د' },
    { label: 'PaCO₂', value: stats.paco2.toFixed(0), unit: 'mmHg' },
    { label: 'pH', value: stats.ph.toFixed(2), unit: '' },
    { label: 'GFR', value: stats.gfr.toFixed(0), unit: 'مل/د' },
    {
      label: 'اللاكتات',
      value: stats.lactate.toFixed(1),
      unit: 'ممول/ل',
      tone: stats.lactate < 4 ? ('success' as const) : ('warning' as const),
    },
  ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[18, 12, 26]} environment="city">
        <Suspense fallback={null}>
          <BodyScene3D
            system={system}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showLabels={showLabels}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
            onSelectOrgan={setOrgan}
            selectedOrgan={organ}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="لوحة العلامات الحيوية" readings={hudReadings} />
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
    stepSize: number,
    display?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{display ?? value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={stepSize} onValueChange={([v]) => set(v)} />
    </div>
  );

  const controls = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">لوحة التحكّم الفسيولوجية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs
          value={system}
          onValueChange={(v) => {
            const s = v as BodySystem;
            setSystem(s);
            setOrgan(SYSTEM_INFO[s].organs[0].id);
          }}
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="circulatory">دوري</TabsTrigger>
            <TabsTrigger value="respiratory">تنفسي</TabsTrigger>
            <TabsTrigger value="nervous">عصبي</TabsTrigger>
          </TabsList>
          <TabsList className="mt-2 grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="digestive">هضمي</TabsTrigger>
            <TabsTrigger value="urinary">بولي</TabsTrigger>
            <TabsTrigger value="muscular">عضلي</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <Label className="text-sm">الأعضاء — انقر على العضو في المجسّم أو هنا</Label>
          <div className="flex flex-wrap gap-2">
            {info.organs.map((o) => (
              <Badge
                key={o.id}
                variant={activeOrgan.id === o.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setOrgan(o.id)}
              >
                <span className="ml-1 inline-block h-2 w-2 rounded-full" style={{ background: o.color }} />
                {o.name}
              </Badge>
            ))}
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-bold">
              {activeOrgan.name} — {activeOrgan.nameEn}
            </p>
            <p className="text-muted-foreground">الوظيفة: {activeOrgan.role}</p>
            <p className="mt-1">{activeOrgan.detail}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm">حالات جاهزة</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(BODY_PRESETS).map(([key, p]) => (
              <Button key={key} size="sm" variant="outline" onClick={() => applyPreset(key)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {slider('معدل النبض', heartRate, setHeartRate, 35, 200, 1, `${heartRate} نبضة/د`)}
          {slider('حجم الضربة', strokeVolume, setStrokeVolume, 30, 140, 1, `${strokeVolume} مل`)}
          {slider('معدل التنفس', breathRate, setBreathRate, 4, 45, 1, `${breathRate} نفس/د`)}
          {slider('الحجم الجاري', tidalVolume, setTidalVolume, 200, 2500, 20, `${tidalVolume} مل`)}
          {slider('نسبة الأكسجين المستنشق', fio2, setFio2, 10, 100, 1, `${fio2}%`)}
          {slider('مستوى النشاط', activity, setActivity, 0, 1, 0.05, `${(activity * 100).toFixed(0)}%`)}
          {slider('الترطيب', hydration, setHydration, 0.1, 1, 0.05, hydration.toFixed(2))}
          {slider('الهيموغلوبين', hemoglobin, setHemoglobin, 5, 18, 0.5, `${hemoglobin} g/dL`)}
          {slider('حرارة الجسم', temperature, setTemperature, 34, 41, 0.1, `${temperature.toFixed(1)} °م`)}
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setPlaying((p) => !p)} className="gap-2">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button size="sm" variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> تصفير
            </Button>
          </div>
          {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}
          <div className="flex items-center justify-between">
            <Label className="text-sm">إظهار البطاقات التوضيحية</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
        </div>

        {stats.alerts.length > 0 && (
          <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <p className="flex items-center gap-2 font-bold text-amber-500">
              <AlertTriangle className="h-4 w-4" /> تنبيهات فسيولوجية
            </p>
            <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
              {stats.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">
          {info.name} — {info.nameEn}
        </p>
        <p>{info.summary}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">العلاقات الكمّية المستخدمة</p>
        <p className="font-mono text-xs">النتاج القلبي CO = HR × SV</p>
        <p className="font-mono text-xs">الضغط الشرياني MAP ≈ CO × SVR</p>
        <p className="font-mono text-xs">التهوية السنخية V̇A = f × (VT − 150 mL)</p>
        <p className="font-mono text-xs">محتوى الأكسجين CaO₂ = 1.34 × Hb × SpO₂ + 0.003 × PaO₂</p>
        <p className="font-mono text-xs">توصيل الأكسجين DO₂ = CaO₂ × CO × 10</p>
        <p className="font-mono text-xs">تشبّع الهيموغلوبين: معادلة هِل مع P₅₀ ≈ 26.6 mmHg</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">الاتزان الداخلي (Homeostasis)</p>
        <p>
          الأجهزة لا تعمل منفصلة: ارتفاع النشاط يرفع استهلاك الأكسجين، فيستجيب القلب برفع النتاج والرئتان
          برفع التهوية، ويزيح منحنى الهيموغلوبين يميناً (أثر بور) لتسليم أكسجين أكثر. إن عجز التوصيل عن
          الطلب تتحوّل العضلة إلى الطريق اللاهوائي فترتفع اللاكتات. الكلية بدورها تضبط الماء والأملاح وpH.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">القيم المرجعية الطبيعية</p>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {NORMAL_RANGES.map((r) => (
            <div key={r.name} className="flex justify-between gap-2 rounded-md bg-muted/40 px-2 py-1 text-xs">
              <span>{r.name}</span>
              <span className="font-mono text-muted-foreground">{r.normal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">تخطيط القلب الكهربائي (ECG) عند {heartRate} نبضة/د</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ecg}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} unit="s" />
              <YAxis tick={{ fontSize: 11 }} unit="mV" domain={[-0.4, 1.2]} />
              <Tooltip />
              <RLine type="monotone" dataKey="mv" stroke="#ef4444" dot={false} strokeWidth={2} name="mV" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">منحنى تفكّك الهيموغلوبين وأثر بور</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={odc}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="po2" tick={{ fontSize: 10 }} unit="mmHg" />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Math.round(stats.pao2)} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="normal" stroke="#94a3b8" dot={false} strokeWidth={2} name="مرجعي 37° / 40 mmHg" />
              <RLine type="monotone" dataKey="current" stroke="#0ea5e9" dot={false} strokeWidth={2} name="الحالة الحالية" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">تخطيط التنفس (Spirometry)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spiro}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} unit="s" />
              <YAxis tick={{ fontSize: 11 }} unit="mL" />
              <Tooltip />
              <Area type="monotone" dataKey="volume" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} name="حجم الرئة" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">النتاج القلبي والضغط مقابل معدل النبض</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hrc}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="hr" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={heartRate} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="co" stroke="#ef4444" dot={false} strokeWidth={2} name="النتاج (ل/د)" />
              <RLine type="monotone" dataKey="map" stroke="#8b5cf6" dot={false} strokeWidth={2} name="MAP (mmHg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">استجابة الجسم لزيادة الجهد: التهوية واستهلاك الأكسجين واللاكتات</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={act}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="activity" tick={{ fontSize: 10 }} unit="%" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Math.round(activity * 100)} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="ve" stroke="#38bdf8" dot={false} strokeWidth={2} name="التهوية (ل/د)" />
              <RLine type="monotone" dataKey="vo2" stroke="#22c55e" dot={false} strokeWidth={2} name="VO₂ (ل/د)" />
              <RLine type="monotone" dataKey="lactate" stroke="#f97316" dot={false} strokeWidth={2} name="اللاكتات (ممول/ل)" />
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
          تحدّي: حافظ على الاتزان الداخلي أثناء الجهد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Button onClick={() => setChallengeOn(true)} className="gap-2">
          <Trophy className="h-4 w-4" /> ابدأ التحدّي
        </Button>
        {challengeOn && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-muted-foreground">
              ارفع النشاط إلى 75% فأكثر، ثم اضبط النبض والتنفس والحجم الجاري حتى يبقى: SpO₂ ≥ 94% واللاكتات
              &lt; 4 ممول/لتر وضغط شرياني وسطي بين 65 و120 mmHg.
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              <span>النشاط: {(activity * 100).toFixed(0)}%</span>
              <span>SpO₂: {stats.spo2.toFixed(0)}%</span>
              <span>اللاكتات: {stats.lactate.toFixed(1)}</span>
              <span>MAP: {stats.map.toFixed(0)} mmHg</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeSolved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeSolved ? 'ممتاز! الجسم يحافظ على اتزانه تحت الجهد.' : stats.status}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="محاكاة جسم الإنسان ثلاثية الأبعاد"
      subtitle="Human Body 3D — ستة أجهزة حيّة بنماذج فسيولوجية كمّية وعلامات حيوية لحظية"
      icon={<HeartPulse className="h-8 w-8 text-primary" />}
      objectives={[
        'تتبّع مسار الدم في الدورتين الرئوية والجهازية وحساب النتاج القلبي',
        'ربط التهوية بتبادل الغازات وتشبّع الهيموغلوبين وأثر بور',
        'تفسير التوصيل القفزي للنبضة العصبية والنقل المشبكي',
        'تتبّع الطعام في القناة الهضمية ومواقع الهضم والامتصاص',
        'شرح الترشيح الكبيبي وإعادة الامتصاص وتنظيم الماء',
        'تفسير الانقباض العضلي بنظرية الخيوط المنزلقة وعتبة اللاكتات',
        'تحليل الاتزان الداخلي في حالات: راحة، جهد، فقر دم، ارتفاع، جفاف',
      ]}
      concepts={[
        'النتاج القلبي',
        'الضغط الشرياني الوسطي',
        'الحيّز الميت',
        'التهوية السنخية',
        'منحنى تفكّك الهيموغلوبين',
        'أثر بور',
        'التوصيل القفزي',
        'الخملات المعوية',
        'الترشيح الكبيبي',
        'هرمون ADH',
        'الخيوط المنزلقة',
        'عتبة اللاكتات',
      ]}
      steps={[
        'ابدأ بالجهاز الدوري وراقب انقباض البطينين وحركة كريات الدم في الدورتين.',
        'ارفع معدل النبض تدريجياً وتابع منحنى النتاج القلبي — لاحظ الهضبة عند النبض العالي.',
        'انتقل إلى الجهاز التنفسي وقلّل الحجم الجاري إلى 250 مل ولاحظ أثر الحيّز الميت على PaCO₂.',
        'أنزل نسبة الأكسجين إلى 13% (حالة الارتفاع العالي) وراقب هبوط SpO₂ وانزياح المنحنى.',
        'اضبط الحرارة على 39 °م وقارن منحنى تفكّك الهيموغلوبين بالمرجعي (أثر بور).',
        'في الجهاز العصبي غيّر الترطيب والحرارة وراقب سرعة التوصيل وزمن الانعكاس.',
        'في الجهاز الهضمي تابع مسار اللقمة وزمن العبور مع تغيّر الترطيب والنشاط.',
        'في الجهاز البولي طبّق حالة «جفاف» وراقب انخفاض GFR وإدرار البول.',
        'في الجهاز العضلي ارفع النشاط إلى 90% وشاهد تسارع ضربات الميوسين وارتفاع اللاكتات.',
        'سجّل قراءاتك في دفتر المختبر وقارن بين الحالات الجاهزة الست.',
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
          fileName="human-body-3d"
          onRecord={() =>
            record({
              'الجهاز': SYSTEM_INFO[system].name,
              'النبض': String(heartRate),
              'حجم الضربة (مل)': String(strokeVolume),
              'النتاج القلبي (ل/د)': stats.cardiacOutput.toFixed(2),
              'الضغط': `${stats.systolic.toFixed(0)}/${stats.diastolic.toFixed(0)}`,
              'التنفس': String(breathRate),
              'الحجم الجاري (مل)': String(tidalVolume),
              'التهوية (ل/د)': stats.minuteVentilation.toFixed(1),
              'SpO₂ %': stats.spo2.toFixed(1),
              'PaO₂': stats.pao2.toFixed(0),
              'PaCO₂': stats.paco2.toFixed(0),
              'pH': stats.ph.toFixed(2),
              'GFR': stats.gfr.toFixed(0),
              'اللاكتات': stats.lactate.toFixed(2),
              'الحالة': stats.status,
            })
          }
        />
      }
    />
  );
};

export default HumanBody3D;

export { SYSTEM_ORDER };
