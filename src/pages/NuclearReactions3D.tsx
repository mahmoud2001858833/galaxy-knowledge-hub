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
  NuclearMode,
  NuclearParams,
  bindingEnergyCurve,
  chainCurve,
  computeNuclear,
  decayCurve,
} from '@/lib/sim-physics/nuclear';

const NuclearScene3D = lazy(() =>
  import('@/components/simulations3d/nuclear/NuclearScene3D').then((m) => ({ default: m.NuclearScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'مصدر الطاقة في التفاعلات النووية هو:',
    options: ['حرق الوقود', 'النقص الكتلي وفق E = mc²', 'الاحتكاك', 'التأين'],
    correctIndex: 1,
    explanation: 'الفرق بين كتلة المتفاعلات والنواتج يتحول إلى طاقة وفق E = Δm·c².',
  },
  {
    question: 'انشطار نواة يورانيوم-235 واحدة يحرّر تقريباً:',
    options: ['2 MeV', '20 MeV', '200 MeV', '2000 MeV'],
    correctIndex: 2,
    explanation: '≈ 200 MeV لكل انشطار، أي نحو 3.2×10⁻¹¹ جول.',
  },
  {
    question: 'عندما يكون معامل التضاعف k = 1 فإن المفاعل:',
    options: ['خامد', 'حرج مستقر', 'فوق الحرج', 'ينفجر'],
    correctIndex: 1,
    explanation: 'k = 1 يعني عدد نيوترونات ثابت بين الأجيال — تشغيل مستقر.',
  },
  {
    question: 'اندماج الديوتيريوم والتريتيوم ينتج:',
    options: ['هيليوم-4 ونيوترون', 'يورانيوم', 'بروتونين', 'أشعة سينية فقط'],
    correctIndex: 0,
    explanation: 'D + T → ⁴He + n + 17.6 MeV.',
  },
  {
    question: 'أعلى طاقة ربط لكل نوية تقع قرب العنصر:',
    options: ['الهيدروجين', 'الحديد-56', 'اليورانيوم', 'الهيليوم'],
    correctIndex: 1,
    explanation: 'قمة منحنى طاقة الربط عند A ≈ 56 (الحديد/النيكل).',
  },
  {
    question: 'بعد مرور 3 أعمار نصفية تبقى من العينة:',
    options: ['50%', '25%', '12.5%', '6.25%'],
    correctIndex: 2,
    explanation: '(1/2)³ = 1/8 = 12.5%.',
  },
  {
    question: 'ثابت الاضمحلال λ يرتبط بالعمر النصفي بالعلاقة:',
    options: ['λ = T½', 'λ = ln2 / T½', 'λ = T½ / ln2', 'λ = 1 / T½²'],
    correctIndex: 1,
    explanation: 'λ = 0.693/T½، والنشاط A = λN.',
  },
];

const MODE_LABEL: Record<NuclearMode, string> = {
  fission: 'الانشطار النووي',
  fusion: 'الاندماج النووي',
  decay: 'الاضمحلال الإشعاعي',
};

const NuclearReactions3D = () => {
  const [mode, setMode] = useState<NuclearMode>('fission');
  const [multiplication, setMultiplication] = useState(1);
  const [initialNeutrons, setInitialNeutrons] = useState(1);
  const [generations, setGenerations] = useState(10);
  const [plasmaMK, setPlasmaMK] = useState(120);
  const [confinement, setConfinement] = useState(1);
  const [sampleGrams, setSampleGrams] = useState(100);
  const [halfLifeYears, setHalfLifeYears] = useState(30);
  const [elapsedYears, setElapsedYears] = useState(30);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: NuclearParams = useMemo(
    () => ({
      mode,
      multiplication,
      initialNeutrons,
      generations,
      plasmaMK,
      confinement,
      sampleGrams,
      halfLifeYears,
      elapsedYears,
    }),
    [mode, multiplication, initialNeutrons, generations, plasmaMK, confinement, sampleGrams, halfLifeYears, elapsedYears]
  );

  const stats = useMemo(() => computeNuclear(params), [params]);
  const beCurve = useMemo(() => bindingEnergyCurve(), []);
  const chain = useMemo(() => chainCurve(multiplication, initialNeutrons, generations), [multiplication, initialNeutrons, generations]);
  const decay = useMemo(() => decayCurve(halfLifeYears, halfLifeYears * 5), [halfLifeYears]);

  const { entries, record, clear } = useSimNotebook('nuclear-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const fmt = (v: number, d = 3) =>
    Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(d) : v.toFixed(d);

  const newChallenge = () => setChallenge(Math.round((5 + Math.random() * 85) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.remainingFraction * 100 - challenge);

  const hudReadings =
    mode === 'fission'
      ? [
          { label: 'معامل التضاعف k', value: multiplication.toFixed(2), unit: '', tone: 'primary' as const },
          { label: 'الحالة', value: stats.criticalityLabel, unit: '', tone: stats.critical ? ('warning' as const) : ('success' as const) },
          { label: 'نيوترونات الجيل الأخير', value: fmt(stats.chainNeutrons), unit: '' },
          { label: 'الطاقة لكل انشطار', value: stats.energyPerReaction.toFixed(1), unit: 'MeV' },
          { label: 'الطاقة الكلية', value: fmt(stats.totalEnergyJ), unit: 'جول' },
          { label: 'مكافئ TNT', value: fmt(stats.tntKg), unit: 'كغم' },
        ]
      : mode === 'fusion'
      ? [
          { label: 'حرارة البلازما', value: plasmaMK.toFixed(0), unit: 'مليون كلفن', tone: 'primary' as const },
          { label: 'مؤشر الاشتعال', value: stats.ignitionScore.toFixed(2), unit: '', tone: stats.ignited ? ('success' as const) : ('warning' as const) },
          { label: 'الطاقة لكل اندماج', value: stats.energyPerReaction.toFixed(2), unit: 'MeV' },
          { label: 'الطاقة لكل نوية', value: stats.energyPerNucleon.toFixed(2), unit: 'MeV' },
          { label: 'النقص الكتلي', value: stats.massDefect.toFixed(5), unit: 'u' },
          { label: 'الطاقة الكلية', value: fmt(stats.totalEnergyJ), unit: 'جول' },
        ]
      : [
          { label: 'الأعمار النصفية المنقضية', value: stats.halfLivesPassed.toFixed(2), unit: '', tone: 'primary' as const },
          { label: 'النسبة المتبقية', value: (stats.remainingFraction * 100).toFixed(3), unit: '%', tone: 'success' as const },
          { label: 'الكتلة المتبقية', value: stats.remainingGrams.toFixed(3), unit: 'غم' },
          { label: 'ثابت الاضمحلال λ', value: fmt(stats.decayConstant), unit: '1/سنة' },
          { label: 'النشاط الإشعاعي', value: fmt(stats.activityBq), unit: 'بيكريل', tone: 'warning' as const },
          { label: 'العمر النصفي', value: halfLifeYears.toFixed(1), unit: 'سنة' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 14, 26]} environment="night">
        <Suspense fallback={null}>
          <NuclearScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as NuclearMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fission" className="text-xs">الانشطار</TabsTrigger>
            <TabsTrigger value="fusion" className="text-xs">الاندماج</TabsTrigger>
            <TabsTrigger value="decay" className="text-xs">الاضمحلال</TabsTrigger>
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

        {mode === 'fission' && (
          <>
            {slider('معامل التضاعف k', multiplication, setMultiplication, 0.5, 2, 0.01, multiplication.toFixed(2))}
            {slider('النيوترونات الابتدائية', initialNeutrons, setInitialNeutrons, 1, 20, 1, `${initialNeutrons}`)}
            {slider('عدد الأجيال', generations, setGenerations, 1, 40, 1, `${generations}`)}
          </>
        )}

        {mode === 'fusion' && (
          <>
            {slider('حرارة البلازما', plasmaMK, setPlasmaMK, 10, 400, 5, `${plasmaMK} مليون كلفن`)}
            {slider('الحصر والكثافة', confinement, setConfinement, 0.2, 3, 0.05, confinement.toFixed(2))}
          </>
        )}

        {mode === 'decay' && (
          <>
            {slider('كتلة العينة', sampleGrams, setSampleGrams, 1, 1000, 1, `${sampleGrams} غم`)}
            {slider('العمر النصفي', halfLifeYears, setHalfLifeYears, 0.5, 200, 0.5, `${halfLifeYears} سنة`)}
            {slider('الزمن المنقضي', elapsedYears, setElapsedYears, 0, 400, 1, `${elapsedYears} سنة`)}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار البيانات داخل المشهد</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        تستمد التفاعلات النووية طاقتها من النقص الكتلي: كتلة النواتج أقل من كتلة المتفاعلات، والفرق
        يتحوّل طاقة وفق E = Δm·c². الأنوية الثقيلة تُطلق طاقة عند الانشطار، والأنوية الخفيفة تُطلقها
        عند الاندماج، والفاصل بينهما قمة منحنى طاقة الربط عند الحديد-56.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        E = Δm·c² ، 1 u = 931.5 MeV{'\n'}
        n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3n + 200 MeV{'\n'}
        ²H + ³H → ⁴He + n + 17.6 MeV{'\n'}
        N(t) = N₀·(1/2)^(t/T½) ، λ = ln2/T½ ، A = λN
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>k &lt; 1 مفاعل خامد، k = 1 تشغيل مستقر، k &gt; 1 تفاعل متسلسل متسارع.</li>
        <li>قضبان التحكّم تمتص النيوترونات لخفض k، والمهدّئ يبطئها لزيادة احتمال الانشطار.</li>
        <li>الاندماج يحتاج حرارة هائلة للتغلّب على تنافر كولوم بين الأنوية الموجبة.</li>
        <li>النشاط الإشعاعي يتناقص أسّياً؛ بعد 10 أعمار نصفية يتبقى أقل من 0.1%.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">منحنى طاقة الربط لكل نوية</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={beCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="العدد الكتلي A" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="طاقة الربط لكل نوية (MeV)" stroke="#22c55e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'decay' ? 'منحنى الاضمحلال الأسّي' : 'نمو التفاعل المتسلسل عبر الأجيال'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mode === 'decay' ? decay : chain} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={mode === 'decay' ? 'الزمن (سنة)' : 'الجيل'} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <RLine
                type="monotone"
                dataKey={mode === 'decay' ? 'النسبة المتبقية %' : 'عدد النيوترونات'}
                stroke="#f97316"
                dot={false}
                strokeWidth={2}
              />
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
          تحدّي: اضبط النسبة المتبقية من العينة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط «الاضمحلال»، غيّر العمر النصفي أو الزمن المنقضي حتى تصل النسبة المتبقية إلى الهدف
          بفارق أقل من 1%.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> نسبة جديدة
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{(stats.remainingFraction * 100).toFixed(2)}%</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 1 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 1 ? 'ممتاز! أصبت الهدف.' : `الفارق ${challengeError?.toFixed(2)}% — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="التفاعلات النووية ثلاثية الأبعاد"
      subtitle="Nuclear Reactions 3D — الانشطار المتسلسل، الاندماج، والاضمحلال الإشعاعي"
      icon={<Atom className="h-8 w-8 text-primary" />}
      objectives={[
        'ربط النقص الكتلي بالطاقة المتحرّرة عبر E = mc²',
        'تحليل التفاعل المتسلسل ومعامل التضاعف k',
        'تحديد شروط اشتعال الاندماج النووي',
        'حساب المتبقي والنشاط الإشعاعي من العمر النصفي',
      ]}
      concepts={[
        'النقص الكتلي',
        'طاقة الربط النووية',
        'التفاعل المتسلسل',
        'الحرجية k',
        'الاندماج الحراري',
        'العمر النصفي',
        'النشاط الإشعاعي',
      ]}
      steps={[
        'في «الانشطار»: ابدأ عند k = 0.9 ولاحظ خمود التفاعل.',
        'ارفع k إلى 1 ثم 1.2 وقارن نمو النيوترونات عبر الأجيال.',
        'سجّل الطاقة الكلية ومكافئ TNT في دفتر المختبر.',
        'في «الاندماج»: ارفع الحرارة تدريجياً حتى يتجاوز مؤشر الاشتعال 1.',
        'في «الاضمحلال»: اضبط الزمن المنقضي = عمر نصفي واحد وتحقق من 50%.',
        'كرّر عند 3 و10 أعمار نصفية وقارن النتائج بالمنحنى الأسّي.',
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
          fileName="nuclear-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'التفاعل': stats.reactionLabel,
              'k': multiplication.toFixed(2),
              'الأجيال': `${generations}`,
              'نيوترونات نهائية': fmt(stats.chainNeutrons),
              'الطاقة/تفاعل (MeV)': stats.energyPerReaction.toFixed(2),
              'الطاقة الكلية (جول)': fmt(stats.totalEnergyJ),
              'حرارة البلازما (MK)': `${plasmaMK}`,
              'مؤشر الاشتعال': stats.ignitionScore.toFixed(2),
              'العمر النصفي (سنة)': halfLifeYears.toFixed(1),
              'المتبقي %': (stats.remainingFraction * 100).toFixed(3),
              'النشاط (بيكريل)': fmt(stats.activityBq),
            })
          }
        />
      }
    />
  );
};

export default NuclearReactions3D;
