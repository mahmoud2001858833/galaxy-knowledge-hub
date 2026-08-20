import { Suspense, lazy, useMemo, useState } from 'react';
import { Globe, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  AstronomyMode,
  AstronomyParams,
  computeAstronomy,
  keplerCurve,
  phaseCurve,
  speedCurve,
} from '@/lib/sim-physics/astronomy';

const AstronomyScene3D = lazy(() =>
  import('@/components/simulations3d/astronomy/AstronomyScene3D').then((m) => ({ default: m.AstronomyScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'ينص قانون كبلر الأول على أن مدار الكوكب:',
    options: ['دائرة تامة', 'قطع ناقص والشمس في إحدى بؤرتيه', 'قطع مكافئ', 'خط حلزوني'],
    correctIndex: 1,
    explanation: 'المدار قطع ناقص والشمس في إحدى البؤرتين وليست في المركز.',
  },
  {
    question: 'قانون كبلر الثاني (المساحات المتساوية) يعني أن الكوكب:',
    options: ['يتحرك بسرعة ثابتة', 'أسرع عند الحضيض', 'أسرع عند الأوج', 'يتوقف عند البؤرة'],
    correctIndex: 1,
    explanation: 'لحفظ الزخم الزاوي تزداد السرعة كلما اقترب الكوكب من الشمس (الحضيض).',
  },
  {
    question: 'قانون كبلر الثالث يربط بين:',
    options: ['T و a بعلاقة T² ∝ a³', 'T و a بعلاقة T ∝ a', 'الكتلة والحجم', 'السرعة والزمن فقط'],
    correctIndex: 0,
    explanation: 'T² = 4π²a³/GM، وبالوحدات الفلكية T²(سنة) = a³(AU) لنجم بكتلة شمسية.',
  },
  {
    question: 'سبب أطوار القمر هو:',
    options: ['ظل الأرض على القمر', 'تغيّر زاوية الرؤية للجزء المضاء', 'تغيّر حجم القمر', 'الغيوم'],
    correctIndex: 1,
    explanation: 'نصف القمر مضاء دائماً، لكن ما نراه منه يتغيّر مع زاوية شمس-أرض-قمر.',
  },
  {
    question: 'لا يحدث كسوف كل شهر لأن:',
    options: ['القمر بعيد جداً', 'مدار القمر مائل ≈5° عن مستوى مسار الأرض', 'الشمس تتحرك', 'الأرض تدور'],
    correctIndex: 1,
    explanation: 'الكسوف يحتاج أن يكون القمر قرب العقدة حيث يتقاطع مداره مع مستوى دائرة البروج.',
  },
  {
    question: 'الكسوف الحلقي يحدث عندما:',
    options: ['القمر عند الحضيض', 'القطر الزاوي للقمر أصغر من قطر الشمس', 'الأرض بين الشمس والقمر', 'يكون بدراً'],
    correctIndex: 1,
    explanation: 'عند الأوج يبدو القمر أصغر فلا يغطي قرص الشمس كاملاً فتبقى حلقة مضيئة.',
  },
  {
    question: 'سرعة الإفلات من مدار نصف قطره a تساوي:',
    options: ['√(GM/a)', '√(2GM/a)', 'GM/a', '2GM/a²'],
    correctIndex: 1,
    explanation: 'v_esc = √(2GM/a) أي √2 ضعف السرعة المدارية الدائرية.',
  },
];

const MODE_LABEL: Record<AstronomyMode, string> = {
  orbits: 'المدارات وقوانين كبلر',
  phases: 'أطوار القمر',
  eclipse: 'الكسوف والخسوف',
};

const AdvancedAstronomy3D = () => {
  const [mode, setMode] = useState<AstronomyMode>('orbits');
  const [semiMajorAu, setSemiMajorAu] = useState(1);
  const [eccentricity, setEccentricity] = useState(0.2);
  const [starMasses, setStarMasses] = useState(1);
  const [phaseDeg, setPhaseDeg] = useState(90);
  const [inclinationDeg, setInclinationDeg] = useState(5.1);
  const [moonDistanceFactor, setMoonDistanceFactor] = useState(1);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: AstronomyParams = useMemo(
    () => ({ mode, semiMajorAu, eccentricity, starMasses, phaseDeg, inclinationDeg, moonDistanceFactor }),
    [mode, semiMajorAu, eccentricity, starMasses, phaseDeg, inclinationDeg, moonDistanceFactor]
  );

  const stats = useMemo(() => computeAstronomy(params), [params]);
  const kepler = useMemo(() => keplerCurve(starMasses), [starMasses]);
  const speeds = useMemo(() => speedCurve(semiMajorAu, eccentricity, starMasses), [semiMajorAu, eccentricity, starMasses]);
  const phases = useMemo(() => phaseCurve(), []);

  const { entries, record, clear } = useSimNotebook('astronomy-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const fmt = (v: number, d = 3) =>
    Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(d) : v.toFixed(d);

  const newChallenge = () => setChallenge(Math.round((0.5 + Math.random() * 25) * 100) / 100);
  const challengeError = challenge === null ? null : Math.abs(stats.periodYears - challenge);

  const hudReadings =
    mode === 'orbits'
      ? [
          { label: 'الدور المداري', value: stats.periodYears.toFixed(3), unit: 'سنة', tone: 'primary' as const },
          { label: 'الدور بالأيام', value: stats.periodDays.toFixed(1), unit: 'يوم' },
          { label: 'الحضيض', value: stats.perihelionAu.toFixed(3), unit: 'AU' },
          { label: 'الأوج', value: stats.aphelionAu.toFixed(3), unit: 'AU' },
          { label: 'سرعة الحضيض', value: (stats.perihelionSpeed / 1000).toFixed(2), unit: 'كم/ث', tone: 'success' as const },
          { label: 'سرعة الإفلات', value: (stats.escapeSpeed / 1000).toFixed(2), unit: 'كم/ث', tone: 'warning' as const },
        ]
      : mode === 'phases'
      ? [
          { label: 'الطور', value: stats.phaseName, unit: '', tone: 'primary' as const },
          { label: 'النسبة المضيئة', value: (stats.illuminatedFraction * 100).toFixed(1), unit: '%', tone: 'success' as const },
          { label: 'زاوية الطور', value: phaseDeg.toFixed(0), unit: '°' },
          { label: 'الدورة القمرية', value: '29.53', unit: 'يوم' },
          { label: 'بُعد القمر', value: (stats.moonDistance / 1000).toFixed(0), unit: 'كم' },
          { label: 'القطر الزاوي', value: stats.angularDiameterMoon.toFixed(3), unit: '°' },
        ]
      : [
          { label: 'الحدث', value: stats.eclipseType, unit: '', tone: stats.eclipsePossible ? ('success' as const) : ('warning' as const) },
          { label: 'قطر القمر الزاوي', value: stats.angularDiameterMoon.toFixed(4), unit: '°', tone: 'primary' as const },
          { label: 'قطر الشمس الزاوي', value: stats.angularDiameterSun.toFixed(4), unit: '°' },
          { label: 'الميل المداري', value: inclinationDeg.toFixed(2), unit: '°' },
          { label: 'طول مخروط الظل', value: fmt(stats.umbraLengthKm, 2), unit: 'كم' },
          { label: 'زاوية الطور', value: phaseDeg.toFixed(0), unit: '°' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[18, 16, 28]} environment="night">
        <Suspense fallback={null}>
          <AstronomyScene3D
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
      <SimHUD title="قراءات فلكية حيّة" readings={hudReadings} />
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as AstronomyMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orbits" className="text-xs">المدارات</TabsTrigger>
            <TabsTrigger value="phases" className="text-xs">أطوار القمر</TabsTrigger>
            <TabsTrigger value="eclipse" className="text-xs">الكسوف والخسوف</TabsTrigger>
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

        {mode === 'orbits' && (
          <>
            {slider('نصف المحور الأكبر a', semiMajorAu, setSemiMajorAu, 0.2, 5, 0.05, `${semiMajorAu.toFixed(2)} AU`)}
            {slider('الشذوذ المركزي e', eccentricity, setEccentricity, 0, 0.85, 0.01, eccentricity.toFixed(2))}
            {slider('كتلة النجم', starMasses, setStarMasses, 0.2, 5, 0.05, `${starMasses.toFixed(2)} كتلة شمسية`)}
          </>
        )}

        {(mode === 'phases' || mode === 'eclipse') && (
          <>{slider('زاوية الطور', phaseDeg, setPhaseDeg, 0, 360, 1, `${phaseDeg}°`)}</>
        )}

        {mode === 'eclipse' && (
          <>
            {slider('ميل مدار القمر', inclinationDeg, setInclinationDeg, 0, 8, 0.1, `${inclinationDeg.toFixed(1)}°`)}
            {slider('بُعد القمر', moonDistanceFactor, setMoonDistanceFactor, 0.9, 1.1, 0.005, moonDistanceFactor.toFixed(3))}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار متجه نصف القطر والبيانات</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        تحكم الجاذبية حركة الأجرام: يدور الكوكب في قطع ناقص والنجم في إحدى بؤرتيه، فيتسارع عند الحضيض
        ويتباطأ عند الأوج بحيث يمسح نصف القطر مساحات متساوية في أزمنة متساوية. ويربط قانون كبلر الثالث
        بين الدور ونصف المحور الأكبر، فيمكن من قياس الفترة استنتاج كتلة النجم.
      </p>
      <p>
        أطوار القمر ناتجة عن زاوية الرؤية للنصف المضاء دائماً، أما الكسوف والخسوف فيحتاجان اصطفافاً
        دقيقاً قرب عقدتَي تقاطع مدار القمر مع مستوى دائرة البروج؛ ولأن الميل ≈ 5° لا يتكرر الحدث كل شهر.
        وحين يكون القمر عند الأوج يبدو قرصه أصغر من قرص الشمس فينتج كسوف حلقي بدل الكلي.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        T² = 4π²a³ / GM{'\n'}
        v = √( GM (2/r − 1/a) )   (vis-viva){'\n'}
        r_p = a(1−e) , r_a = a(1+e){'\n'}
        v_esc = √(2GM/a){'\n'}
        f_illuminated = (1 − cos φ) / 2
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">قانون كبلر الثالث: الدور مقابل نصف المحور</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kepler} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="نصف المحور (AU)" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الدور (سنة)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="a^1.5" stroke="#a78bfa" dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'orbits' ? 'السرعة المدارية عبر المدار' : 'نسبة إضاءة القمر عبر الشهر'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mode === 'orbits' ? speeds : phases} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={mode === 'orbits' ? 'الزاوية الحقيقية°' : 'زاوية الطور°'} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <RLine
                type="monotone"
                dataKey={mode === 'orbits' ? 'السرعة (كم/ث)' : 'النسبة المضيئة %'}
                stroke="#f97316"
                dot={false}
                strokeWidth={2}
              />
              {mode === 'orbits' && (
                <RLine type="monotone" dataKey="المسافة (AU)" stroke="#22c55e" dot={false} strokeWidth={1.5} />
              )}
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
          تحدّي: اضبط الدور المداري المطلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط «المدارات»، غيّر نصف المحور الأكبر وكتلة النجم حتى يصبح الدور المداري مطابقاً للهدف
          بفارق أقل من 0.05 سنة.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)} سنة</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{stats.periodYears.toFixed(3)} سنة</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 0.05 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 0.05
                ? 'ممتاز! أصبت المدار المطلوب.'
                : `الفارق ${challengeError?.toFixed(3)} سنة — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الفلك المتقدم ثلاثي الأبعاد"
      subtitle="Advanced Astronomy 3D — المدارات وقوانين كبلر، أطوار القمر، والكسوف والخسوف"
      icon={<Globe className="h-8 w-8 text-primary" />}
      objectives={[
        'استنتاج قوانين كبلر الثلاثة من مدار تفاعلي',
        'حساب سرعة الكوكب عند الحضيض والأوج بمعادلة vis-viva',
        'تفسير أطوار القمر بزاوية شمس-أرض-قمر',
        'تحديد شروط حدوث الكسوف الكلي والحلقي والخسوف',
      ]}
      concepts={[
        'القطع الناقص والبؤرة',
        'الشذوذ المركزي e',
        'قانون المساحات',
        'T² ∝ a³',
        'سرعة الإفلات',
        'أطوار القمر',
        'عقدتا المدار',
        'مخروط الظل',
      ]}
      steps={[
        'في «المدارات»: ابدأ بـ e = 0 ولاحظ ثبات السرعة، ثم ارفعها إلى 0.6.',
        'قارن سرعة الحضيض بسرعة الأوج وسجّل النسبة في الدفتر.',
        'غيّر نصف المحور من 0.4 إلى 4 AU وتحقق أن T² / a³ يبقى ثابتاً.',
        'في «أطوار القمر»: حرّك زاوية الطور من 0° إلى 360° وسمِّ كل طور.',
        'في «الكسوف»: اجعل الميل أقل من 1.5° وزاوية الطور 0° لتحصل على كسوف.',
        'غيّر بُعد القمر بين الحضيض والأوج وقارن الكسوف الكلي بالحلقي.',
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
          fileName="astronomy-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'a (AU)': semiMajorAu.toFixed(2),
              'e': eccentricity.toFixed(2),
              'كتلة النجم': `${starMasses.toFixed(2)} M☉`,
              'الدور (سنة)': stats.periodYears.toFixed(4),
              'الحضيض (AU)': stats.perihelionAu.toFixed(3),
              'الأوج (AU)': stats.aphelionAu.toFixed(3),
              'سرعة الحضيض (كم/ث)': (stats.perihelionSpeed / 1000).toFixed(2),
              'سرعة الأوج (كم/ث)': (stats.aphelionSpeed / 1000).toFixed(2),
              'T²/a³': stats.keplerConstant.toFixed(4),
              'الطور': stats.phaseName,
              'الإضاءة %': (stats.illuminatedFraction * 100).toFixed(1),
              'الحدث الفلكي': stats.eclipseType,
            })
          }
        />
      }
    />
  );
};

export default AdvancedAstronomy3D;
