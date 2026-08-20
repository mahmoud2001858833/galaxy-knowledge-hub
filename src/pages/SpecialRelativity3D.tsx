import { Suspense, lazy, useMemo, useState } from 'react';
import { Clock, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  RelativityMode,
  RelativityParams,
  computeRelativity,
  energyCurve,
  gammaCurve,
} from '@/lib/sim-physics/relativity';

const RelativityScene3D = lazy(() =>
  import('@/components/simulations3d/relativity/RelativityScene3D').then((m) => ({
    default: m.RelativityScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'معامل لورنتز γ يُعطى بالعلاقة:',
    options: ['√(1−β²)', '1/√(1−β²)', '1+β²', 'β/√(1−β²)'],
    correctIndex: 1,
    explanation: 'γ = 1/√(1−v²/c²)، ويقترب من ∞ عندما v → c.',
  },
  {
    question: 'الزمن على ساعة متحركة بالنسبة لمراقب ساكن:',
    options: ['يمرّ أسرع', 'يمرّ أبطأ', 'لا يتغيّر', 'يتوقف دائماً'],
    correctIndex: 1,
    explanation: 'تمدد الزمن: Δt = γΔt₀، فالساعة المتحركة تتأخر.',
  },
  {
    question: 'تقلّص الطول يحدث:',
    options: ['في كل الاتجاهات', 'باتجاه الحركة فقط', 'عمودياً على الحركة', 'لا يحدث'],
    correctIndex: 1,
    explanation: 'L = L₀/γ باتجاه الحركة فقط، أمّا الأبعاد العمودية فلا تتأثر.',
  },
  {
    question: 'إذا كانت β = 0.6 فإن γ تساوي تقريباً:',
    options: ['1.11', '1.25', '1.67', '2.29'],
    correctIndex: 1,
    explanation: 'γ = 1/√(1−0.36) = 1/0.8 = 1.25.',
  },
  {
    question: 'الطاقة الكلية لجسيم نسبي:',
    options: ['E = m₀c²', 'E = γm₀c²', 'E = ½m₀v²', 'E = pc دائماً'],
    correctIndex: 1,
    explanation: 'E = γm₀c²، والطاقة الحركية = (γ−1)m₀c².',
  },
  {
    question: 'جمع السرعات النسبي يمنع تجاوز c لأن:',
    options: ['السرعات تُجمع مباشرة', 'المقام (1+β₁β₂) يكبح النتيجة', 'الكتلة تنعدم', 'الزمن يتوقف'],
    correctIndex: 1,
    explanation: 'β = (β₁+β₂)/(1+β₁β₂) تبقى دائماً أقل من 1.',
  },
  {
    question: 'في مفارقة التوأم فإن المسافر:',
    options: ['يعود أكبر سنّاً', 'يعود أصغر سنّاً', 'بالعمر نفسه', 'لا يعود أبداً'],
    correctIndex: 1,
    explanation: 'زمنه الذاتي أقل بمقدار γ، فيعود أصغر من توأمه على الأرض.',
  },
];

const MODE_LABEL: Record<RelativityMode, string> = {
  dilation: 'تمدد الزمن',
  contraction: 'تقلّص الطول',
  energy: 'الكتلة والطاقة',
};

const SpecialRelativity3D = () => {
  const [mode, setMode] = useState<RelativityMode>('dilation');
  const [beta, setBeta] = useState(0.6);
  const [properTime, setProperTime] = useState(1);
  const [properLength, setProperLength] = useState(10);
  const [restMassMeV, setRestMassMeV] = useState(0.511); // electron rest energy
  const [betaSecond, setBetaSecond] = useState(0.5);
  const [journeyLy, setJourneyLy] = useState(4.37);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const restMass = useMemo(() => (restMassMeV * 1.602176634e-13) / (299792458 * 299792458), [restMassMeV]);

  const params: RelativityParams = useMemo(
    () => ({ mode, beta, properTime, properLength, restMass, betaSecond, journeyLy }),
    [mode, beta, properTime, properLength, restMass, betaSecond, journeyLy]
  );

  const stats = useMemo(() => computeRelativity(params), [params]);
  const gCurve = useMemo(() => gammaCurve(140), []);
  const eCurve = useMemo(() => energyCurve(140), []);

  const { entries, record, clear } = useSimNotebook('relativity-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((1.2 + Math.random() * 6) * 100) / 100);
  const challengeError = challenge === null ? null : Math.abs(stats.gamma - challenge);

  const hudReadings =
    mode === 'dilation'
      ? [
          { label: 'معامل لورنتز γ', value: stats.gamma.toFixed(4), unit: '', tone: 'primary' as const },
          { label: 'السرعة v', value: (stats.speed / 1e6).toFixed(2), unit: '×10⁶ م/ث' },
          { label: 'الزمن الذاتي Δt₀', value: properTime.toFixed(2), unit: 'ث' },
          { label: 'الزمن المُقاس Δt', value: stats.dilatedTime.toFixed(4), unit: 'ث', tone: 'success' as const },
          { label: 'سنوات الأرض (التوأم)', value: stats.earthYears.toFixed(2), unit: 'سنة' },
          { label: 'سنوات المسافر', value: stats.travellerYears.toFixed(2), unit: 'سنة', tone: 'warning' as const },
        ]
      : mode === 'contraction'
      ? [
          { label: 'معامل لورنتز γ', value: stats.gamma.toFixed(4), unit: '', tone: 'primary' as const },
          { label: 'الطول الذاتي L₀', value: properLength.toFixed(2), unit: 'م' },
          { label: 'الطول المُقاس L', value: stats.contractedLength.toFixed(4), unit: 'م', tone: 'success' as const },
          { label: 'نسبة التقلّص', value: ((1 / stats.gamma) * 100).toFixed(2), unit: '%' },
          { label: 'جمع السرعات النسبي', value: stats.addedBeta.toFixed(4), unit: 'c', tone: 'warning' as const },
          { label: 'الجمع الكلاسيكي', value: stats.classicalBeta.toFixed(4), unit: 'c' },
        ]
      : [
          { label: 'طاقة السكون E₀', value: stats.restEnergy.toFixed(3), unit: 'MeV' },
          { label: 'الطاقة الكلية E', value: stats.totalEnergy.toFixed(3), unit: 'MeV', tone: 'primary' as const },
          { label: 'الطاقة الحركية KE', value: stats.kineticEnergy.toFixed(3), unit: 'MeV', tone: 'success' as const },
          { label: 'الزخم p', value: stats.momentum.toFixed(3), unit: 'MeV/c' },
          { label: 'الكتلة النسبية', value: stats.relativisticMass.toExponential(3), unit: 'كغم' },
          { label: 'انزياح دوبلر (اقتراب)', value: stats.dopplerApproach.toFixed(3), unit: '×', tone: 'warning' as const },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[6, 10, 24]} environment="night">
        <Suspense fallback={null}>
          <RelativityScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as RelativityMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dilation" className="text-xs">تمدد الزمن</TabsTrigger>
            <TabsTrigger value="contraction" className="text-xs">تقلّص الطول</TabsTrigger>
            <TabsTrigger value="energy" className="text-xs">E = mc²</TabsTrigger>
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

        {slider('السرعة β = v/c', beta, setBeta, 0, 0.999, 0.001, 'c')}

        {mode === 'dilation' && (
          <>
            {slider('الزمن الذاتي Δt₀', properTime, setProperTime, 0.1, 10, 0.1, 'ث')}
            {slider('مسافة الرحلة (مفارقة التوأم)', journeyLy, setJourneyLy, 1, 25, 0.1, 'سنة ضوئية')}
          </>
        )}

        {mode === 'contraction' && (
          <>
            {slider('الطول الذاتي L₀', properLength, setProperLength, 1, 40, 0.5, 'م')}
            {slider('سرعة ثانية للجمع النسبي', betaSecond, setBetaSecond, 0, 0.999, 0.001, 'c')}
          </>
        )}

        {mode === 'energy' && slider('طاقة سكون الجسيم E₀', restMassMeV, setRestMassMeV, 0.05, 1000, 0.05, 'MeV')}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار المتجهات والقراءات داخل المشهد</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        تقوم النسبية الخاصة على مبدأين: قوانين الفيزياء واحدة في كل الأطر العطالية، وسرعة الضوء ثابتة
        لكل المراقبين. النتيجة أن <strong>الزمن يتمدد</strong> و<strong>الطول يتقلّص</strong> باتجاه
        الحركة، وأن <strong>الكتلة والطاقة وجهان لشيء واحد</strong>.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        γ = 1/√(1 − v²/c²){'\n'}
        Δt = γ·Δt₀ ، L = L₀/γ{'\n'}
        E = γm₀c² ، KE = (γ−1)m₀c² ، E² = (pc)² + (m₀c²)²{'\n'}
        β = (β₁ + β₂)/(1 + β₁β₂){'\n'}
        f/f₀ = √((1+β)/(1−β)) (اقتراب)
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>الساعة الضوئية المتحركة تقطع مساراً أطول للضوء، فتتباطأ نبضاتها بمقدار γ.</li>
        <li>عند β = 0.87 تقريباً يتضاعف γ، فيصبح الطول نصف طوله الذاتي.</li>
        <li>الطاقة الحركية النسبية تنفجر قرب c بينما المعادلة الكلاسيكية ½mv² تفشل تماماً.</li>
        <li>الميونات القادمة من الغلاف الجوي تصل سطح الأرض بفضل تمدد الزمن — دليل تجريبي مباشر.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">معامل لورنتز ونسبة الطول مقابل β</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="beta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="معامل لورنتز γ" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="نسبة الطول L/L₀" stroke="#22c55e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الطاقة الحركية: النسبية مقابل الكلاسيكية</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="beta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="النسبية KE/E₀" stroke="#f97316" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الكلاسيكية KE/E₀" stroke="#a855f7" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط معامل لورنتز المطلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          غيّر السرعة β حتى يصل معامل لورنتز γ إلى القيمة المطلوبة بفارق أقل من 0.02.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> قيمة γ جديدة
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{stats.gamma.toFixed(3)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 0.02
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 0.02
                ? `ممتاز! الفارق ${challengeError?.toFixed(3)} فقط.`
                : `الفارق ${challengeError?.toFixed(3)} — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="النسبية الخاصة ثلاثية الأبعاد"
      subtitle="Special Relativity 3D — تمدد الزمن، تقلّص الطول، وتكافؤ الكتلة والطاقة"
      icon={<Clock className="h-8 w-8 text-primary" />}
      objectives={[
        'حساب معامل لورنتز γ وربطه بالسرعة النسبية',
        'تفسير تمدد الزمن باستخدام الساعة الضوئية ومفارقة التوأم',
        'استنتاج تقلّص الطول باتجاه الحركة فقط',
        'تحليل العلاقة بين الكتلة والطاقة والزخم النسبي',
      ]}
      concepts={[
        'ثبات سرعة الضوء',
        'معامل لورنتز',
        'تمدد الزمن',
        'تقلّص الطول',
        'جمع السرعات النسبي',
        'E = mc²',
        'انزياح دوبلر النسبي',
      ]}
      steps={[
        'في «تمدد الزمن»: ارفع β تدريجياً وقارن نبضات الساعتين الضوئيتين.',
        'سجّل Δt عند β = 0.6 وتحقّق أن γ = 1.25.',
        'غيّر مسافة الرحلة وقارن سنوات الأرض بسنوات المسافر (مفارقة التوأم).',
        'انتقل إلى «تقلّص الطول» ولاحظ انكماش القضيب المتحرك دون تغيّر ارتفاعه.',
        'جرّب جمع سرعتين قريبتين من c وتحقّق أن الناتج يبقى أقل من c.',
        'في «E = mc²»: راقب انفجار الطاقة الحركية قرب c مقارنة بالمنحنى الكلاسيكي.',
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
          fileName="relativity-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'β': beta.toFixed(3),
              'γ': stats.gamma.toFixed(4),
              'Δt₀ (ث)': properTime.toFixed(2),
              'Δt (ث)': stats.dilatedTime.toFixed(4),
              'L₀ (م)': properLength.toFixed(2),
              'L (م)': stats.contractedLength.toFixed(4),
              'E₀ (MeV)': stats.restEnergy.toFixed(3),
              'E (MeV)': stats.totalEnergy.toFixed(3),
              'KE (MeV)': stats.kineticEnergy.toFixed(3),
              'سنوات الأرض': stats.earthYears.toFixed(2),
              'سنوات المسافر': stats.travellerYears.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default SpecialRelativity3D;
