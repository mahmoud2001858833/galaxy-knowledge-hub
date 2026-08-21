import { Suspense, lazy, useMemo, useState } from 'react';
import { Leaf, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  ReferenceLine,
  BarChart,
  Bar,
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
  BioMode,
  DEFAULT_PHOTO,
  EQUATIONS,
  FERMENTATION,
  PHOTO_STAGES,
  PhotoParams,
  RESP_STAGES,
  atpBreakdown,
  co2Curve,
  computePhoto,
  lightCurve,
  temperatureCurve,
} from '@/lib/sim-physics/photosynthesis';

const PhotoScene3D = lazy(() =>
  import('@/components/simulations3d/photosynthesis/PhotoScene3D').then((m) => ({ default: m.PhotoScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'تحدث التفاعلات الضوئية في:',
    options: ['الستروما', 'أغشية الثايلاكويد', 'الحشوة', 'السيتوبلازم'],
    correctIndex: 1,
    explanation: 'الأصبغة الضوئية موجودة على أغشية الثايلاكويد داخل الجرانا.',
  },
  {
    question: 'مصدر الأكسجين المتحرّر في البناء الضوئي هو:',
    options: ['ثاني أكسيد الكربون', 'الماء', 'الجلوكوز', 'الهواء الجوي'],
    correctIndex: 1,
    explanation: 'التحلل الضوئي للماء (Photolysis) يحرّر O₂ والإلكترونات والبروتونات.',
  },
  {
    question: 'الإنزيم المسؤول عن تثبيت CO₂ في دورة كالفن هو:',
    options: ['روبيسكو', 'ATP سينثيز', 'الأميليز', 'الكاتاليز'],
    correctIndex: 0,
    explanation: 'روبيسكو يربط CO₂ بجزيء RuBP خماسي الكربون.',
  },
  {
    question: 'أكبر كمية من ATP في التنفس الخلوي تُنتج في:',
    options: ['التحلل السكري', 'دورة كربس', 'سلسلة نقل الإلكترون', 'التخمّر'],
    correctIndex: 2,
    explanation: 'نحو 28 ATP من أصل 32 تنتج عبر الفسفرة التأكسدية في الأعراف.',
  },
  {
    question: 'المستقبل النهائي للإلكترونات في التنفس الهوائي هو:',
    options: ['NAD⁺', 'الأكسجين', 'CO₂', 'الماء'],
    correctIndex: 1,
    explanation: 'يتّحد الأكسجين مع الإلكترونات والبروتونات مكوّناً الماء.',
  },
  {
    question: 'عند نقص الأكسجين في الخلايا العضلية يتحوّل البيروفيك إلى:',
    options: ['إيثانول', 'حمض لاكتيك', 'أسيتيل CoA', 'جلوكوز'],
    correctIndex: 1,
    explanation: 'التخمّر اللبني ينتج 2 ATP فقط ويسبّب تعب العضلات.',
  },
  {
    question: 'نقطة التعويض الضوئية هي عندما:',
    options: ['يتوقف التنفس', 'يتساوى معدل البناء الضوئي مع التنفس', 'يتوقف البناء الضوئي', 'يزيد CO₂'],
    correctIndex: 1,
    explanation: 'صافي تبادل الغازات يساوي صفراً عندها.',
  },
  {
    question: 'ارتفاع الحرارة فوق 45 °م يقلّل معدل البناء الضوئي لأن:',
    options: ['الضوء يقلّ', 'الإنزيمات تتمسّخ', 'CO₂ يختفي', 'الماء يتجمّد'],
    correctIndex: 1,
    explanation: 'تمسّخ (denaturation) الإنزيمات يفقدها شكلها الفراغي ووظيفتها.',
  },
];

const MODE_LABEL: Record<BioMode, string> = {
  photosynthesis: 'البناء الضوئي',
  respiration: 'التنفّس الخلوي',
  exchange: 'تبادل الغازات',
};

const Photosynthesis3D = () => {
  const [mode, setMode] = useState<BioMode>('photosynthesis');
  const [light, setLight] = useState(DEFAULT_PHOTO.light);
  const [co2, setCo2] = useState(DEFAULT_PHOTO.co2);
  const [temperature, setTemperature] = useState(DEFAULT_PHOTO.temperature);
  const [chlorophyll, setChlorophyll] = useState(DEFAULT_PHOTO.chlorophyll);
  const [oxygen, setOxygen] = useState(DEFAULT_PHOTO.oxygen);
  const [glucose, setGlucose] = useState(DEFAULT_PHOTO.glucose);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [stage, setStage] = useState<string>('light');
  const [challengeOn, setChallengeOn] = useState(false);

  const params: PhotoParams = useMemo(
    () => ({ light, co2, temperature, chlorophyll, oxygen, glucose }),
    [light, co2, temperature, chlorophyll, oxygen, glucose]
  );
  const stats = useMemo(() => computePhoto(params), [params]);
  const lc = useMemo(() => lightCurve(params), [params]);
  const tc = useMemo(() => temperatureCurve(params), [params]);
  const cc = useMemo(() => co2Curve(params), [params]);
  const atpBars = useMemo(() => atpBreakdown(stats.anaerobicFraction < 0.5), [stats.anaerobicFraction]);

  const stages = mode === 'respiration' ? RESP_STAGES : PHOTO_STAGES;
  const activeStage = stages.find((s) => s.id === stage) ?? stages[0];

  const { entries, record, clear } = useSimNotebook('photosynthesis-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setLight(DEFAULT_PHOTO.light);
    setCo2(DEFAULT_PHOTO.co2);
    setTemperature(DEFAULT_PHOTO.temperature);
    setChlorophyll(DEFAULT_PHOTO.chlorophyll);
    setOxygen(DEFAULT_PHOTO.oxygen);
    setGlucose(DEFAULT_PHOTO.glucose);
    setPlaying(true);
  };

  const challengeSolved = challengeOn && stats.atCompensation;

  const hudReadings = [
    { label: 'البناء الضوئي', value: (stats.gross * 100).toFixed(0), unit: '%', tone: 'primary' as const },
    { label: 'التنفّس', value: (stats.respiration * 100).toFixed(0), unit: '%' },
    {
      label: 'الصافي',
      value: (stats.net * 100).toFixed(0),
      unit: '%',
      tone: stats.net >= 0 ? ('success' as const) : ('warning' as const),
    },
    { label: 'العامل المحدّد', value: stats.limiting, unit: '' },
    { label: 'ATP التنفّس', value: stats.atpRespiration.toFixed(1), unit: '' },
    { label: 'الحالة', value: stats.balanceLabel, unit: '' },
  ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 11, 22]} environment="forest">
        <Suspense fallback={null}>
          <PhotoScene3D
            mode={mode}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showLabels={showLabels}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات الأيض الخلوي" readings={hudReadings} />
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
        <CardTitle className="text-base">لوحة التحكّم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs
          value={mode}
          onValueChange={(v) => {
            const m = v as BioMode;
            setMode(m);
            setStage(m === 'respiration' ? 'glycolysis' : 'light');
          }}
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photosynthesis">بناء ضوئي</TabsTrigger>
            <TabsTrigger value="respiration">تنفّس خلوي</TabsTrigger>
            <TabsTrigger value="exchange">تبادل الغازات</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <Label className="text-sm">المراحل — انقر للتفاصيل</Label>
          <div className="flex flex-wrap gap-2">
            {stages.map((s) => (
              <Badge
                key={s.id}
                variant={activeStage.id === s.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStage(s.id)}
              >
                <span className="ml-1 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name}
              </Badge>
            ))}
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-bold">
              {activeStage.name} — {activeStage.nameEn}
            </p>
            <p className="text-muted-foreground">المكان: {activeStage.place}</p>
            <p className="text-muted-foreground">المدخلات: {activeStage.inputs}</p>
            <p className="text-muted-foreground">النواتج: {activeStage.outputs}</p>
            <p className="mt-1">{activeStage.note}</p>
          </div>
        </div>

        <div className="space-y-4">
          {mode !== 'respiration' && slider('شدة الضوء', light, setLight, 0, 100, 1, `${light}%`)}
          {mode !== 'respiration' && slider('تركيز CO₂', co2, setCo2, 0, 1200, 10, `${co2} ppm`)}
          {slider('درجة الحرارة', temperature, setTemperature, 0, 50, 1, `${temperature} °م`)}
          {mode !== 'respiration' && slider('نسبة الكلوروفيل', chlorophyll, setChlorophyll, 0, 1, 0.05, chlorophyll.toFixed(2))}
          {slider('نسبة الأكسجين', oxygen, setOxygen, 0, 30, 0.5, `${oxygen}%`)}
          {slider('توافر الجلوكوز', glucose, setGlucose, 0, 1, 0.05, glucose.toFixed(2))}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => { setLight(0); setMode('exchange'); }}>
              ظلام
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setLight(100); setCo2(1000); setTemperature(30); }}>
              مثالي
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOxygen(0)}>
              لا هوائي
            </Button>
          </div>
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
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">المعادلتان الأساسيتان</p>
        <p className="font-mono text-xs">{EQUATIONS.photosynthesis}</p>
        <p className="font-mono text-xs">{EQUATIONS.respiration}</p>
      </div>
      <p>
        البناء الضوئي عملية بناء (أيض بنائي) تخزّن الطاقة الضوئية في روابط الجلوكوز، بينما التنفّس الخلوي
        عملية هدم تحرّر تلك الطاقة على شكل ATP. العمليتان متكاملتان: نواتج إحداهما مدخلات للأخرى.
      </p>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">العوامل المحدّدة</p>
        <p>
          يحكم معدل البناء الضوئي «قانون العوامل المحدّدة»: العامل الأقل توافراً هو الذي يحدّ المعدل. عند
          ضوء منخفض يكون الضوء محدّداً، وعند إشباع الضوء يصبح CO₂ أو الحرارة هما المحدّدان. تتمسّخ
          الإنزيمات فوق نحو 42 °م فينهار المعدل.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">حصيلة الطاقة</p>
        <p>
          التحلل السكري 2 ATP، دورة كربس 2 ATP، وسلسلة نقل الإلكترون نحو 28 ATP، بمجموع ≈32 ATP لكل
          جلوكوز في التنفس الهوائي. {FERMENTATION.note}
        </p>
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">منحنى الاستجابة للضوء ونقطة التعويض</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lc}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="light" tick={{ fontSize: 10 }} unit="%" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <ReferenceLine x={light} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="gross" stroke="#16a34a" dot={false} strokeWidth={2} name="بناء ضوئي كلي" />
              <RLine type="monotone" dataKey="net" stroke="#0ea5e9" dot={false} strokeWidth={2} name="الصافي" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">أثر درجة الحرارة على العمليتين</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tc}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="temp" tick={{ fontSize: 10 }} unit="°" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={temperature} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="gross" stroke="#16a34a" dot={false} strokeWidth={2} name="بناء ضوئي" />
              <RLine type="monotone" dataKey="respiration" stroke="#ef4444" dot={false} strokeWidth={2} name="تنفّس" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">أثر تركيز ثاني أكسيد الكربون</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cc}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="co2" tick={{ fontSize: 10 }} unit="ppm" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={co2} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="gross" stroke="#8b5cf6" dot={false} strokeWidth={2} name="بناء ضوئي" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">حصيلة ATP حسب المرحلة</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={atpBars}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="atp" fill="#f59e0b" name="ATP" radius={[6, 6, 0, 0]} />
            </BarChart>
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
          تحدّي: اضبط الظروف للوصول إلى نقطة التعويض
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Button onClick={() => setChallengeOn(true)} className="gap-2">
          <Trophy className="h-4 w-4" /> ابدأ التحدّي
        </Button>
        {challengeOn && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-muted-foreground">
              اضبط شدة الضوء وCO₂ والحرارة حتى يتساوى معدل البناء الضوئي مع معدل التنفّس (الصافي = صفر).
            </p>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeSolved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeSolved
                ? 'ممتاز! وصلت إلى نقطة التعويض.'
                : `الصافي الحالي = ${(stats.net * 100).toFixed(1)}% — ${
                    stats.net > 0 ? 'قلّل الضوء قليلاً' : 'زد الضوء قليلاً'
                  }`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="البناء الضوئي والتنفّس الخلوي ثلاثي الأبعاد"
      subtitle="Photosynthesis & Respiration 3D — بلاستيدة وميتوكندريا مجسّمتان وتبادل غازات حيّ"
      icon={<Leaf className="h-8 w-8 text-primary" />}
      objectives={[
        'تتبّع التفاعلات الضوئية ودورة كالفن داخل البلاستيدة الخضراء',
        'تتبّع التحلل السكري ودورة كربس وسلسلة نقل الإلكترون في الميتوكندريا',
        'تفسير قانون العوامل المحدّدة ورسم منحنى الاستجابة للضوء',
        'تحديد نقطة التعويض الضوئية',
        'حساب حصيلة ATP الهوائية مقابل اللاهوائية',
      ]}
      concepts={[
        'الثايلاكويد والجرانا',
        'روبيسكو',
        'ATP سينثيز',
        'التدرّج البروتوني',
        'الفسفرة التأكسدية',
        'نقطة التعويض',
        'التخمّر',
        'قانون العوامل المحدّدة',
      ]}
      steps={[
        'في نمط «بناء ضوئي» ارفع شدة الضوء تدريجياً وراقب زيادة الفوتونات وفقاعات O₂.',
        'ثبّت الضوء عند 100% ثم غيّر CO₂ ولاحظ تغيّر العامل المحدّد في الـHUD.',
        'ارفع الحرارة فوق 45 °م ولاحظ انهيار المعدل بسبب تمسّخ الإنزيمات.',
        'أنقص الكلوروفيل إلى 0.2 وشاهد اصفرار الجرانا وانخفاض المعدل.',
        'انتقل إلى «تنفّس خلوي» وراقب دوران ATP سينثيز مع التدرّج البروتوني.',
        'أنزل الأكسجين إلى صفر ولاحظ التحوّل إلى التخمّر وانخفاض ATP إلى 2.',
        'في «تبادل الغازات» أطفئ الضوء وقارن اتجاه الغازات الصافي.',
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
          fileName="photosynthesis-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'شدة الضوء %': String(light),
              'CO₂ (ppm)': String(co2),
              'الحرارة (°م)': String(temperature),
              'الكلوروفيل': chlorophyll.toFixed(2),
              'الأكسجين %': String(oxygen),
              'بناء ضوئي كلي': stats.gross.toFixed(3),
              'التنفّس': stats.respiration.toFixed(3),
              'الصافي': stats.net.toFixed(3),
              'العامل المحدّد': stats.limiting,
              'ATP التنفّس': stats.atpRespiration.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default Photosynthesis3D;
