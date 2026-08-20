import { Suspense, lazy, useMemo, useState } from 'react';
import { Sun, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  OpticsMode,
  OpticsParams,
  computeOptics,
  imagingCurve,
  snellCurve,
} from '@/lib/sim-physics/optics';

const OpticsScene3D = lazy(() =>
  import('@/components/simulations3d/optics/OpticsScene3D').then((m) => ({
    default: m.OpticsScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'معادلة العدسة الرقيقة هي:',
    options: ['1/f = 1/dₒ + 1/dᵢ', 'f = dₒ + dᵢ', '1/f = dₒ·dᵢ', 'f = dᵢ/dₒ'],
    correctIndex: 0,
    explanation: 'العلاقة بين البعد البؤري وبُعدَي الجسم والصورة هي 1/f = 1/dₒ + 1/dᵢ.',
  },
  {
    question: 'جسم يقع بين العدسة المحدبة وبؤرتها، فإن الصورة:',
    options: ['حقيقية مقلوبة', 'وهمية معتدلة مكبّرة', 'حقيقية مصغّرة', 'لا تتكوّن صورة'],
    correctIndex: 1,
    explanation: 'داخل البعد البؤري تعمل العدسة المحدبة كعدسة مكبّرة فتعطي صورة وهمية معتدلة.',
  },
  {
    question: 'العدسة المفرّقة (المقعرة) تعطي دائماً صورة:',
    options: ['حقيقية مكبّرة', 'وهمية معتدلة مصغّرة', 'حقيقية مقلوبة', 'بحجم الجسم'],
    correctIndex: 1,
    explanation: 'بعدها البؤري سالب فتكون الصورة دوماً وهمية معتدلة أصغر من الجسم.',
  },
  {
    question: 'الانعكاس الكلي الداخلي يحدث عندما:',
    options: [
      'ينتقل الضوء من وسط أقل كثافة ضوئية إلى أكثر',
      'ينتقل من وسط أكثر كثافة ضوئية إلى أقل وزاوية السقوط تتجاوز الحرجة',
      'تكون زاوية السقوط صفراً',
      'يكون n₁ = n₂',
    ],
    correctIndex: 1,
    explanation: 'الشرطان: n₁ > n₂ وزاوية سقوط أكبر من الزاوية الحرجة θc = sin⁻¹(n₂/n₁).',
  },
  {
    question: 'سبب تشتت الضوء الأبيض في المنشور هو:',
    options: [
      'اختلاف سرعة الألوان داخل الزجاج (اختلاف معامل الانكسار)',
      'انعكاس الضوء عن الوجه الخلفي',
      'امتصاص بعض الألوان',
      'تداخل الأشعة',
    ],
    correctIndex: 0,
    explanation: 'معامل انكسار الزجاج للبنفسجي أكبر منه للأحمر فينحرف البنفسجي أكثر.',
  },
  {
    question: 'قدرة العدسة تُقاس بالديوبتر وتساوي:',
    options: ['P = f', 'P = 1/f (بالمتر)', 'P = dᵢ/dₒ', 'P = f²'],
    correctIndex: 1,
    explanation: 'القدرة هي مقلوب البعد البؤري بالمتر، ووحدتها الديوبتر (D).',
  },
];

const MODE_LABEL: Record<OpticsMode, string> = {
  lens: 'العدسات',
  mirror: 'المرايا',
  refraction: 'الانكسار والمنشور',
};

const OpticsLab3D = () => {
  const [mode, setMode] = useState<OpticsMode>('lens');
  const [focalLength, setFocalLength] = useState(15);
  const [objectDistance, setObjectDistance] = useState(35);
  const [objectHeight, setObjectHeight] = useState(12);
  const [incidenceAngle, setIncidenceAngle] = useState(40);
  const [n1, setN1] = useState(1);
  const [n2, setN2] = useState(1.5);
  const [prismAngle, setPrismAngle] = useState(60);
  const [rayCount, setRayCount] = useState(3);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: OpticsParams = useMemo(
    () => ({
      mode,
      focalLength,
      objectDistance,
      objectHeight,
      incidenceAngle,
      n1,
      n2,
      prismAngle,
      rayCount,
    }),
    [mode, focalLength, objectDistance, objectHeight, incidenceAngle, n1, n2, prismAngle, rayCount]
  );

  const stats = useMemo(() => computeOptics(params), [params]);
  const imaging = useMemo(() => imagingCurve(params), [params]);
  const snell = useMemo(() => snellCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('optics-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((1.5 + Math.random() * 2.5) * 10) / 10);
  const challengeError =
    challenge === null ? null : Math.abs(Math.abs(stats.magnification) - challenge);

  const hudReadings =
    mode === 'refraction'
      ? [
          {
            label: 'زاوية الانكسار',
            value: stats.totalInternalReflection ? '—' : stats.refractionAngle.toFixed(2),
            unit: '°',
            tone: 'primary' as const,
          },
          { label: 'زاوية السقوط', value: incidenceAngle.toFixed(0), unit: '°' },
          {
            label: 'الزاوية الحرجة',
            value: Number.isNaN(stats.criticalAngle) ? 'لا توجد' : stats.criticalAngle.toFixed(1),
            unit: '°',
            tone: 'warning' as const,
          },
          { label: 'الانعكاسية', value: (stats.reflectance * 100).toFixed(1), unit: '%' },
          { label: 'انحراف المنشور', value: stats.deviation.toFixed(1), unit: '°' },
          { label: 'التشتت', value: stats.dispersion.toFixed(2), unit: '°', tone: 'success' as const },
        ]
      : [
          {
            label: 'بُعد الصورة',
            value: Number.isFinite(stats.imageDistance) ? stats.imageDistance.toFixed(1) : '∞',
            unit: 'سم',
            tone: 'primary' as const,
          },
          { label: 'التكبير', value: stats.magnification.toFixed(2), unit: '×', tone: 'success' as const },
          { label: 'طول الصورة', value: stats.imageHeight.toFixed(1), unit: 'سم' },
          { label: 'نوع الصورة', value: stats.real ? 'حقيقية' : 'وهمية', unit: '' },
          { label: 'الاتجاه', value: stats.inverted ? 'مقلوبة' : 'معتدلة', unit: '' },
          { label: 'القدرة', value: (stats.power / 100 * 100).toFixed(2), unit: 'D', tone: 'warning' as const },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[8, 6, 22]} environment="night">
        <Suspense fallback={null}>
          <OpticsScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as OpticsMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lens" className="text-xs">عدسات</TabsTrigger>
            <TabsTrigger value="mirror" className="text-xs">مرايا</TabsTrigger>
            <TabsTrigger value="refraction" className="text-xs">انكسار ومنشور</TabsTrigger>
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

        {mode !== 'refraction' && (
          <>
            {slider(
              mode === 'lens' ? 'البعد البؤري f (− = مفرّقة)' : 'البعد البؤري f (− = محدّبة)',
              focalLength,
              setFocalLength,
              -40,
              40,
              1,
              'سم'
            )}
            {slider('بُعد الجسم dₒ', objectDistance, setObjectDistance, 2, 90, 1, 'سم')}
            {slider('طول الجسم', objectHeight, setObjectHeight, 2, 25, 1, 'سم')}
          </>
        )}

        {mode === 'refraction' && (
          <>
            {slider('زاوية السقوط', incidenceAngle, setIncidenceAngle, 0, 89, 1, '°')}
            {slider('معامل انكسار الوسط الأول n₁', n1, setN1, 1, 2.5, 0.01)}
            {slider('معامل انكسار الوسط الثاني n₂', n2, setN2, 1, 2.5, 0.01)}
            {slider('زاوية رأس المنشور', prismAngle, setPrismAngle, 20, 80, 1, '°')}
          </>
        )}

        {slider('عدد الأشعة المتتبَّعة', rayCount, setRayCount, 1, 5, 1, 'شعاع')}
        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار الأشعة الرئيسية</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        البصريات الهندسية تفسّر تكوّن الصور عبر تتبّع الأشعة: العدسات والمرايا تجمع الأشعة أو تفرّقها
        وفق بعدها البؤري، بينما يغيّر <strong>الانكسار</strong> اتجاه الشعاع عند انتقاله بين وسطين
        مختلفَي الكثافة الضوئية — وهو أساس الألياف البصرية والنظارات والكاميرات.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        1/f = 1/dₒ + 1/dᵢ ، m = −dᵢ/dₒ = hᵢ/hₒ{'\n'}
        P = 1/f (m) → dioptre{'\n'}
        n₁ sin θ₁ = n₂ sin θ₂ (Snell){'\n'}
        θc = sin⁻¹(n₂/n₁) عند n₁ &gt; n₂{'\n'}
        D_min = 2·sin⁻¹(n·sin(A/2)) − A
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>الصورة الحقيقية تتكوّن بتقاطع الأشعة فعلياً ويمكن استقبالها على حاجز.</li>
        <li>الصورة الوهمية تتكوّن بامتداد الأشعة إلى الخلف (خط متقطّع في المشهد).</li>
        <li>عند dₒ = f لا تتكوّن صورة لأن الأشعة تخرج متوازية.</li>
        <li>الانعكاس الكلي الداخلي هو مبدأ عمل الألياف البصرية والمنظار الطبي.</li>
        <li>التشتت ينتج عن اعتماد معامل الانكسار على الطول الموجي.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">بُعد الصورة والتكبير مقابل بُعد الجسم</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={imaging} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="d" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="بُعد الصورة (سم)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="التكبير" stroke="#f43f5e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">قانون سنيل: الانكسار والانعكاسية</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={snell} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="i" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="زاوية الانكسار (°)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الانعكاسية (%)" stroke="#f97316" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط تكبيراً مطلوباً
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط العدسات أو المرايا، غيّر البعد البؤري وبُعد الجسم حتى تصل قيمة التكبير المطلق إلى
          المطلوب بفارق أقل من 0.1.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تكبير مطلوب جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">×{challenge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">×{Math.abs(stats.magnification).toFixed(2)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9) <= 0.1
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9) <= 0.1
                ? `ممتاز! الفارق ${challengeError?.toFixed(3)} فقط.`
                : `الفارق ${challengeError?.toFixed(2)} — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="مختبر البصريات ثلاثي الأبعاد"
      subtitle="Optics Lab 3D — العدسات، المرايا، الانكسار وتشتت المنشور"
      icon={<Sun className="h-8 w-8 text-primary" />}
      objectives={[
        'تطبيق معادلة العدسة الرقيقة لحساب بُعد الصورة والتكبير',
        'التمييز بين الصور الحقيقية والوهمية والمعتدلة والمقلوبة',
        'تطبيق قانون سنيل وحساب الزاوية الحرجة والانعكاس الكلي الداخلي',
        'تفسير تشتت الضوء الأبيض في المنشور وحساب زاوية الانحراف',
      ]}
      concepts={['معادلة العدسة', 'التكبير', 'الصورة الحقيقية والوهمية', 'قانون سنيل', 'الزاوية الحرجة', 'التشتت']}
      steps={[
        'في نمط «عدسات»: ابدأ بجسم خارج مركز التكوّر وراقب صورة حقيقية مقلوبة مصغّرة.',
        'قرّب الجسم تدريجياً حتى dₒ = f ولاحظ اختفاء الصورة (أشعة متوازية).',
        'أدخل الجسم داخل البعد البؤري وتابع تحوّل الصورة إلى وهمية معتدلة مكبّرة (خط متقطّع).',
        'اجعل f سالباً للحصول على عدسة مفرّقة وقارن النتائج.',
        'في نمط «مرايا»: كرّر التجربة ولاحظ تكوّن الصورة على جهة الجسم نفسها.',
        'في «انكسار ومنشور»: ارفع زاوية السقوط مع n₁ > n₂ حتى يحدث انعكاس كلي داخلي.',
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
          fileName="optics-lab-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'البعد البؤري (سم)': focalLength.toFixed(1),
              'بُعد الجسم (سم)': objectDistance.toFixed(1),
              'بُعد الصورة (سم)': Number.isFinite(stats.imageDistance)
                ? stats.imageDistance.toFixed(2)
                : '∞',
              'التكبير': stats.magnification.toFixed(2),
              'نوع الصورة': stats.real ? 'حقيقية' : 'وهمية',
              'زاوية السقوط (°)': incidenceAngle.toFixed(0),
              'زاوية الانكسار (°)': stats.totalInternalReflection
                ? 'انعكاس كلي'
                : stats.refractionAngle.toFixed(2),
              'الزاوية الحرجة (°)': Number.isNaN(stats.criticalAngle)
                ? '—'
                : stats.criticalAngle.toFixed(2),
              'انحراف المنشور (°)': stats.deviation.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default OpticsLab3D;
