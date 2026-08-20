import { Suspense, lazy, useMemo, useState } from 'react';
import { Battery, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  BarChart,
  Bar,
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
  ELECTRODES,
  ElectroMode,
  ElectroParams,
  computeElectro,
  faradayCurve,
  findElectrode,
  galvanicSeries,
  nernstCurve,
} from '@/lib/sim-physics/electrochemistry';

const ElectroScene3D = lazy(() =>
  import('@/components/simulations3d/electrochem/ElectroScene3D').then((m) => ({ default: m.ElectroScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'في الخلية الجلفانية يحدث عند المصعد (Anode):',
    options: ['اختزال', 'تأكسد', 'لا شيء', 'ترسيب المعدن'],
    correctIndex: 1,
    explanation: 'المصعد موقع التأكسد (فقد إلكترونات) والمهبط موقع الاختزال.',
  },
  {
    question: 'جهد الخلية القياسي E°cell يساوي:',
    options: ['E°مهبط − E°مصعد', 'E°مصعد − E°مهبط', 'مجموع الجهدين', 'صفر دائماً'],
    correctIndex: 0,
    explanation: 'E°cell = E°(اختزال المهبط) − E°(اختزال المصعد).',
  },
  {
    question: 'معادلة نرنست تصف اعتماد الجهد على:',
    options: ['الكتلة فقط', 'التركيز ودرجة الحرارة', 'اللون', 'حجم القطب'],
    correctIndex: 1,
    explanation: 'E = E° − (RT/nF) ln Q، فالتركيز والحرارة يغيّران الجهد.',
  },
  {
    question: 'التفاعل يكون تلقائياً عندما:',
    options: ['ΔG > 0', 'E < 0', 'ΔG < 0 و E > 0', 'K < 1'],
    correctIndex: 2,
    explanation: 'ΔG = −nFE، فالجهد الموجب يعني طاقة جيبس سالبة أي تلقائية.',
  },
  {
    question: 'قانون فاراداي الأول للتحليل الكهربائي: الكتلة المترسبة تتناسب مع:',
    options: ['الجهد', 'الشحنة المارّة', 'مساحة الوعاء', 'الزمن فقط'],
    correctIndex: 1,
    explanation: 'm = (Q/nF)·M حيث Q = I·t.',
  },
  {
    question: 'لحماية الحديد بالمصعد التضحوي نستخدم معدناً:',
    options: ['أنبل من الحديد', 'أنشط من الحديد مثل الخارصين', 'عازلاً', 'ذهباً'],
    correctIndex: 1,
    explanation: 'الخارصين جهده أقل فيتأكسد بدلاً من الحديد ويحميه كاثودياً.',
  },
  {
    question: 'زيادة ملوحة الوسط تؤدي إلى:',
    options: ['إبطاء التآكل', 'تسريع التآكل لزيادة التوصيل', 'إيقاف التفاعل', 'لا تأثير'],
    correctIndex: 1,
    explanation: 'الأملاح ترفع توصيلية الإلكتروليت فيزداد تيار التآكل.',
  },
];

const MODE_LABEL: Record<ElectroMode, string> = {
  galvanic: 'الخلية الجلفانية',
  electrolysis: 'التحليل الكهربائي',
  corrosion: 'التآكل والحماية',
};

const Electrochemistry3D = () => {
  const [mode, setMode] = useState<ElectroMode>('galvanic');
  const [anodeId, setAnodeId] = useState('zn');
  const [cathodeId, setCathodeId] = useState('cu');
  const [anodeConc, setAnodeConc] = useState(1);
  const [cathodeConc, setCathodeConc] = useState(1);
  const [temperature, setTemperature] = useState(298.15);
  const [appliedVoltage, setAppliedVoltage] = useState(2.5);
  const [current, setCurrent] = useState(1.5);
  const [minutes, setMinutes] = useState(20);
  const [salinity, setSalinity] = useState(0.35);
  const [protection, setProtection] = useState(0);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: ElectroParams = useMemo(
    () => ({
      mode,
      anodeId,
      cathodeId,
      anodeConc,
      cathodeConc,
      temperature,
      appliedVoltage,
      current,
      minutes,
      salinity,
      protection,
    }),
    [mode, anodeId, cathodeId, anodeConc, cathodeConc, temperature, appliedVoltage, current, minutes, salinity, protection]
  );

  const stats = useMemo(() => computeElectro(params), [params]);
  const cathode = findElectrode(cathodeId);
  const nernst = useMemo(() => nernstCurve(stats.e0Cell, stats.nElectrons, temperature), [stats.e0Cell, stats.nElectrons, temperature]);
  const faraday = useMemo(
    () => faradayCurve(current, cathode.molarMass, stats.nElectrons, Math.max(minutes, 10)),
    [current, cathode.molarMass, stats.nElectrons, minutes]
  );
  const series = useMemo(() => galvanicSeries(), []);

  const { entries, record, clear } = useSimNotebook('electrochem-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((0.4 + Math.random() * 2.4) * 100) / 100);
  const challengeError = challenge === null ? null : Math.abs(stats.eCell - challenge);

  const hudReadings =
    mode === 'galvanic'
      ? [
          { label: 'جهد الخلية E', value: stats.eCell.toFixed(4), unit: 'V', tone: 'primary' as const },
          { label: 'الجهد القياسي E°', value: stats.e0Cell.toFixed(3), unit: 'V' },
          { label: 'عدد الإلكترونات n', value: String(stats.nElectrons), unit: 'e⁻' },
          { label: 'ΔG', value: (stats.deltaG / 1000).toFixed(2), unit: 'kJ/mol', tone: stats.spontaneous ? ('success' as const) : ('warning' as const) },
          { label: 'حاصل التفاعل Q', value: stats.reactionQuotient.toExponential(2), unit: '' },
          { label: 'ثابت الاتزان K', value: stats.equilibriumK.toExponential(2), unit: '' },
        ]
      : mode === 'electrolysis'
      ? [
          { label: 'الشحنة', value: stats.charge.toFixed(0), unit: 'C', tone: 'primary' as const },
          { label: 'الكتلة المترسبة', value: stats.massDeposited.toFixed(4), unit: 'g', tone: 'success' as const },
          { label: 'المولات', value: stats.molesDeposited.toExponential(2), unit: 'mol' },
          { label: 'جهد التفكك', value: stats.decompositionVoltage.toFixed(2), unit: 'V', tone: 'warning' as const },
          { label: 'القدرة', value: stats.power.toFixed(2), unit: 'W' },
          { label: 'الطاقة', value: (stats.energy / 1000).toFixed(2), unit: 'kJ' },
        ]
      : [
          { label: 'معدّل التآكل', value: stats.corrosionRateMmPerYear.toFixed(4), unit: 'مم/سنة', tone: 'warning' as const },
          { label: 'تيار التآكل', value: stats.corrosionCurrentDensity.toFixed(2), unit: 'µA/cm²' },
          { label: 'زمن ثقب 3 مم', value: Number.isFinite(stats.yearsToPerforate) ? stats.yearsToPerforate.toFixed(1) : '∞', unit: 'سنة', tone: 'primary' as const },
          { label: 'الملوحة', value: (salinity * 100).toFixed(0), unit: '%' },
          { label: 'الحماية', value: (protection * 100).toFixed(0), unit: '%', tone: 'success' as const },
          { label: 'المعدن', value: stats.anodeName, unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 14, 26]} environment="city">
        <Suspense fallback={null}>
          <ElectroScene3D
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
      <SimHUD title="قراءات كهروكيميائية حيّة" readings={hudReadings} />
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

  const electrodeSelect = (label: string, value: string, set: (v: string) => void) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={set}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ELECTRODES.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name} — {e.symbol} ({e.e0.toFixed(2)} V)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const controls = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">لوحة التحكّم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as ElectroMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="galvanic" className="text-xs">جلفانية</TabsTrigger>
            <TabsTrigger value="electrolysis" className="text-xs">تحليل كهربائي</TabsTrigger>
            <TabsTrigger value="corrosion" className="text-xs">التآكل</TabsTrigger>
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

        {mode !== 'corrosion' && (
          <>
            {electrodeSelect(mode === 'galvanic' ? 'قطب المصعد (تأكسد)' : 'المصعد', anodeId, setAnodeId)}
            {electrodeSelect(mode === 'galvanic' ? 'قطب المهبط (اختزال)' : 'المهبط', cathodeId, setCathodeId)}
          </>
        )}

        {mode === 'galvanic' && (
          <>
            {slider('تركيز أيونات المصعد', anodeConc, setAnodeConc, 0.001, 2, 0.001, `${anodeConc.toFixed(3)} M`)}
            {slider('تركيز أيونات المهبط', cathodeConc, setCathodeConc, 0.001, 2, 0.001, `${cathodeConc.toFixed(3)} M`)}
            {slider('درجة الحرارة', temperature, setTemperature, 273, 373, 0.5, `${temperature.toFixed(1)} K`)}
          </>
        )}

        {mode === 'electrolysis' && (
          <>
            {slider('الجهد المطبّق', appliedVoltage, setAppliedVoltage, 0, 12, 0.05, `${appliedVoltage.toFixed(2)} V`)}
            {slider('التيار', current, setCurrent, 0.05, 10, 0.05, `${current.toFixed(2)} A`)}
            {slider('زمن التشغيل', minutes, setMinutes, 1, 120, 1, `${minutes} دقيقة`)}
          </>
        )}

        {mode === 'corrosion' && (
          <>
            {electrodeSelect('المعدن المعرّض', anodeId, setAnodeId)}
            {slider('ملوحة الوسط', salinity, setSalinity, 0, 1, 0.01, `${(salinity * 100).toFixed(0)}%`)}
            {slider('مستوى الحماية', protection, setProtection, 0, 0.98, 0.01, `${(protection * 100).toFixed(0)}%`)}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار اتجاه سريان الإلكترونات</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        تربط الكيمياء الكهربائية بين تفاعلات التأكسد والاختزال والطاقة الكهربائية. في الخلية الجلفانية
        يتأكسد المعدن الأنشط عند المصعد فيدفع الإلكترونات عبر السلك الخارجي إلى المهبط حيث يحدث
        الاختزال، وتُغلق الدارة بالقنطرة الملحية التي تحفظ التعادل الكهربائي. الجهد الناتج يحدده فرق
        جهود الاختزال القياسية ويعدّله التركيز والحرارة عبر معادلة نرنست.
      </p>
      <p>
        أما التحليل الكهربائي فيعكس الاتجاه: مصدر خارجي يفرض تفاعلاً غير تلقائي، ولا يبدأ إلا بعد تجاوز
        جهد التفكك. وتحدد قوانين فاراداي كتلة المادة المترسبة من الشحنة المارّة. والتآكل خلية جلفانية
        مصغّرة على سطح المعدن، تُبطئها الطلاءات أو الحماية الكاثودية بمصعد تضحوي من الخارصين.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        E°cell = E°cathode − E°anode{'\n'}
        E = E° − (RT / nF) ln Q{'\n'}
        ΔG = −nFE , K = exp(nFE° / RT){'\n'}
        m = (I · t · M) / (n · F){'\n'}
        CR(mm/yr) = 3.27e−3 · i_corr · (M/n) / ρ
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">معادلة نرنست: الجهد مقابل log Q</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={nernst} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="log Q" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="جهد الخلية (V)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'electrolysis' ? 'قانون فاراداي: الكتلة مقابل الزمن' : 'السلسلة الجلفانية للمعادن'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'electrolysis' ? (
              <LineChart data={faraday} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="الزمن (دقيقة)" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="الكتلة المترسبة (g)" stroke="#f97316" dot={false} strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="القطب" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="الجهد القياسي (V)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
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
          تحدّي: اصنع خلية بجهد محدّد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          في نمط «جلفانية»، اختر زوج الأقطاب واضبط التراكيز والحرارة حتى يصبح جهد الخلية مطابقاً للهدف
          بفارق أقل من 0.02 فولت.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)} V</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{stats.eCell.toFixed(4)} V</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 0.02 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 0.02
                ? 'ممتاز! ضبطت جهد الخلية المطلوب.'
                : `الفارق ${challengeError?.toFixed(3)} V — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الكيمياء الكهربائية ثلاثية الأبعاد"
      subtitle="Electrochemistry 3D — الخلايا الجلفانية، التحليل الكهربائي، والتآكل والحماية"
      icon={<Battery className="h-8 w-8 text-primary" />}
      objectives={[
        'تمييز المصعد والمهبط واتجاه سريان الإلكترونات في الخلية',
        'حساب جهد الخلية القياسي وتعديله بمعادلة نرنست',
        'ربط الجهد بطاقة جيبس وثابت الاتزان',
        'تطبيق قانوني فاراداي لحساب كتلة الترسيب',
        'تفسير التآكل وطرق الحماية الكاثودية',
      ]}
      concepts={[
        'التأكسد والاختزال',
        'جهد الاختزال القياسي',
        'القنطرة الملحية',
        'معادلة نرنست',
        'ΔG = −nFE',
        'قوانين فاراداي',
        'جهد التفكك',
        'المصعد التضحوي',
      ]}
      steps={[
        'في «جلفانية»: اختر Zn مصعداً و Cu مهبطاً ولاحظ الجهد 1.10 V.',
        'خفّض تركيز أيونات المهبط إلى 0.01 M وسجّل انخفاض الجهد.',
        'ارفع الحرارة إلى 350 K وقارن أثرها على حد نرنست.',
        'اعكس الأقطاب (Cu مصعداً) ولاحظ توقّف التفاعل وسالبية الجهد.',
        'في «التحليل الكهربائي»: ارفع الجهد فوق جهد التفكك وراقب الفقاعات والترسّب.',
        'ضاعف التيار وتحقق أن الكتلة المترسبة تتضاعف عند نفس الزمن.',
        'في «التآكل»: ارفع الملوحة إلى 80% ثم فعّل الحماية 90% وقارن العمر المتوقع.',
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
          fileName="electrochem-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'الخلية': stats.cellNotation,
              'E° (V)': stats.e0Cell.toFixed(3),
              'E (V)': stats.eCell.toFixed(4),
              'n': String(stats.nElectrons),
              'Q': stats.reactionQuotient.toExponential(3),
              'K': stats.equilibriumK.toExponential(3),
              'ΔG (kJ/mol)': (stats.deltaG / 1000).toFixed(2),
              'الشحنة (C)': stats.charge.toFixed(0),
              'الكتلة المترسبة (g)': stats.massDeposited.toFixed(4),
              'معدل التآكل (مم/سنة)': stats.corrosionRateMmPerYear.toFixed(4),
            })
          }
        />
      }
    />
  );
};

export default Electrochemistry3D;
