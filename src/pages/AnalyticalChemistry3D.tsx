import { Suspense, lazy, useMemo, useState } from 'react';
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
  ANALYTES,
  AnalyticalMode,
  ChromatoParams,
  INDICATORS,
  MIXTURE,
  SAMPLES,
  SpectroParams,
  TitrationParams,
  absorptionSpectrum,
  calibrationLine,
  computeChromato,
  computeSpectro,
  computeTitration,
  findSample,
  rfSweep,
  titrationCurve,
} from '@/lib/sim-physics/analytical';

const AnalyticalScene3D = lazy(() =>
  import('@/components/simulations3d/analytical/AnalyticalScene3D').then((m) => ({
    default: m.AnalyticalScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'نقطة التكافؤ في المعايرة هي النقطة التي:',
    options: [
      'يتغيّر عندها لون الكاشف',
      'تتساوى فيها مولات المادة المعايَرة مع مولات المعايِر',
      'يصل فيها pH إلى 7 دائماً',
      'تمتلئ فيها السحّاحة',
    ],
    correctIndex: 1,
    explanation: 'نقطة النهاية (تغيّر اللون) تقريب تجريبي لنقطة التكافؤ النظرية.',
  },
  {
    question: 'صيغة قانون بير-لامبرت هي:',
    options: ['A = ε·b·c', 'A = c/ε', 'A = log(b·c)', 'A = ε + b + c'],
    correctIndex: 0,
    explanation: 'الامتصاصية تتناسب طردياً مع الامتصاصية المولية وطول المسار والتركيز.',
  },
  {
    question: 'إذا كانت النفاذية T = 10% فإن الامتصاصية A تساوي:',
    options: ['0.1', '1', '2', '10'],
    correctIndex: 1,
    explanation: 'A = −log(T) = −log(0.1) = 1.',
  },
  {
    question: 'أفضل مدى عملي للامتصاصية في القياس الطيفي هو:',
    options: ['0.001 – 0.01', '0.1 – 1.0', '2 – 3', 'أكبر من 3'],
    correctIndex: 1,
    explanation: 'خارج هذا المدى يزداد الخطأ النسبي في القراءة بشكل كبير.',
  },
  {
    question: 'قيمة Rf في الكروماتوغرافيا تساوي:',
    options: [
      'مسافة المذيب ÷ مسافة المادة',
      'مسافة المادة ÷ مسافة المذيب',
      'زمن الاحتجاز × السرعة',
      'كتلة المادة ÷ الحجم',
    ],
    correctIndex: 1,
    explanation: 'ولذلك تقع Rf دائماً بين 0 و1.',
  },
  {
    question: 'في كروماتوغرافيا الطبقة الرقيقة (سيليكا) فإن المادة الأكثر قطبية:',
    options: ['تتحرك أسرع', 'تبقى قريبة من خط البداية', 'لا تظهر', 'تذوب في الهواء'],
    correctIndex: 1,
    explanation: 'الطور الثابت قطبي فيربط المواد القطبية بقوة فتقل قيمة Rf لها.',
  },
  {
    question: 'يُختار الكاشف المناسب للمعايرة بحيث:',
    options: [
      'يكون أرخص كاشف',
      'يقع مدى تغيّر لونه ضمن قفزة pH عند التكافؤ',
      'يكون عديم اللون',
      'يتغيّر عند pH = 7 فقط',
    ],
    correctIndex: 1,
    explanation: 'مثلاً الفينولفثالين (8.2–10) مناسب لمعايرة حمض ضعيف بقاعدة قوية.',
  },
];

const MODE_LABEL: Record<AnalyticalMode, string> = {
  titration: 'المعايرة الحجمية',
  spectro: 'المطيافية',
  chromato: 'الكروماتوغرافيا',
};

const AnalyticalChemistry3D = () => {
  const [mode, setMode] = useState<AnalyticalMode>('titration');

  // titration state
  const [analyteId, setAnalyteId] = useState('ch3cooh');
  const [ca, setCa] = useState(0.1);
  const [va, setVa] = useState(25);
  const [cb, setCb] = useState(0.1);
  const [vb, setVb] = useState(0);
  const [indicatorId, setIndicatorId] = useState('phenolphthalein');

  // spectro state
  const [sampleId, setSampleId] = useState('kmno4');
  const [conc, setConc] = useState(0.0002);
  const [path, setPath] = useState(1);
  const [lambda, setLambda] = useState(525);

  // chromato state
  const [solventPolarity, setSolventPolarity] = useState(0.45);
  const [runLength, setRunLength] = useState(8);
  const [progress, setProgress] = useState(0.8);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const titration: TitrationParams = useMemo(
    () => ({ analyteId, ca, va, cb, vb, indicatorId }),
    [analyteId, ca, va, cb, vb, indicatorId]
  );
  const spectro: SpectroParams = useMemo(() => ({ sampleId, conc, path, lambda }), [sampleId, conc, path, lambda]);
  const chromato: ChromatoParams = useMemo(
    () => ({ solventPolarity, runLength, progress }),
    [solventPolarity, runLength, progress]
  );

  const titrationStats = useMemo(() => computeTitration(titration), [titration]);
  const spectroStats = useMemo(() => computeSpectro(spectro), [spectro]);
  const chromatoStats = useMemo(() => computeChromato(chromato), [chromato]);

  const curve = useMemo(() => titrationCurve(titration), [titration]);
  const spectrum = useMemo(() => absorptionSpectrum(spectro), [spectro]);
  const calibration = useMemo(() => calibrationLine(spectro), [spectro]);
  const sweep = useMemo(() => rfSweep(), []);

  const { entries, record, clear } = useSimNotebook('analytical-chemistry-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setVb(0);
    setProgress(0.05);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((0.2 + Math.random() * 0.7) * 100) / 100);
  const challengeError = challenge === null ? null : Math.abs(spectroStats.absorbance - challenge);

  const hudReadings =
    mode === 'titration'
      ? [
          { label: 'الأس الهيدروجيني', value: titrationStats.ph.toFixed(3), unit: '', tone: 'primary' as const },
          { label: 'الحجم المضاف', value: vb.toFixed(2), unit: 'mL' },
          { label: 'حجم التكافؤ', value: titrationStats.veq.toFixed(2), unit: 'mL', tone: 'success' as const },
          { label: 'نسبة الإنجاز', value: (titrationStats.fraction * 100).toFixed(1), unit: '%' },
          { label: 'مولات متبقية', value: (titrationStats.molRemaining * 1000).toFixed(3), unit: 'mmol' },
          {
            label: 'نقطة النهاية',
            value: titrationStats.atEndPoint ? 'وصلنا' : 'لم نصل',
            unit: '',
            tone: titrationStats.atEndPoint ? ('success' as const) : ('warning' as const),
          },
        ]
      : mode === 'spectro'
      ? [
          { label: 'الامتصاصية A', value: spectroStats.absorbance.toFixed(3), unit: '', tone: 'primary' as const },
          { label: 'النفاذية T', value: spectroStats.transmittance.toFixed(2), unit: '%' },
          { label: 'ε عند λ', value: spectroStats.epsilonAt.toFixed(1), unit: 'L/mol·cm' },
          { label: 'λmax', value: spectroStats.sample.lambdaMax.toFixed(0), unit: 'nm', tone: 'success' as const },
          { label: 'التركيز', value: conc.toExponential(2), unit: 'M' },
          {
            label: 'جودة القياس',
            value: spectroStats.detectionOk ? 'مثالية' : 'خارج المدى',
            unit: '',
            tone: spectroStats.detectionOk ? ('success' as const) : ('warning' as const),
          },
        ]
      : [
          { label: 'جبهة المذيب', value: chromatoStats.frontDistance.toFixed(2), unit: 'cm', tone: 'primary' as const },
          { label: 'قطبية المذيب', value: solventPolarity.toFixed(2), unit: '' },
          { label: 'أعلى Rf', value: Math.max(...chromatoStats.spots.map((s) => s.rf)).toFixed(2), unit: '' },
          { label: 'أدنى Rf', value: Math.min(...chromatoStats.spots.map((s) => s.rf)).toFixed(2), unit: '' },
          { label: 'أقل فصل', value: chromatoStats.resolution.toFixed(2), unit: 'cm' },
          {
            label: 'جودة الفصل',
            value: chromatoStats.resolution > 0.6 ? 'جيدة' : 'ضعيفة',
            unit: '',
            tone: chromatoStats.resolution > 0.6 ? ('success' as const) : ('warning' as const),
          },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 12, 26]} environment="city">
        <Suspense fallback={null}>
          <AnalyticalScene3D
            mode={mode}
            titration={titration}
            titrationStats={titrationStats}
            spectro={spectro}
            spectroStats={spectroStats}
            chromato={chromato}
            playing={playing}
            timeScale={timeScale}
            showParticles={showParticles}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات تحليلية حيّة" readings={hudReadings} />
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as AnalyticalMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="titration">معايرة</TabsTrigger>
            <TabsTrigger value="spectro">مطيافية</TabsTrigger>
            <TabsTrigger value="chromato">كروماتوغرافيا</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'titration' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">المادة المعايَرة</Label>
              <Select value={analyteId} onValueChange={setAnalyteId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANALYTES.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.formula})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">الكاشف</Label>
              <Select value={indicatorId} onValueChange={setIndicatorId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATORS.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({i.low}–{i.high})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {slider('تركيز العيّنة (M)', ca, setCa, 0.01, 0.5, 0.01, `${ca.toFixed(2)} M`)}
            {slider('حجم العيّنة (mL)', va, setVa, 5, 50, 1, `${va} mL`)}
            {slider('تركيز NaOH (M)', cb, setCb, 0.01, 0.5, 0.01, `${cb.toFixed(2)} M`)}
            {slider(
              'الحجم المضاف (mL)',
              vb,
              setVb,
              0,
              Math.max(titrationStats.veq * 2, 5),
              0.1,
              `${vb.toFixed(1)} mL`
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setVb(Number((titrationStats.veq / 2).toFixed(2)))}>
                نصف التكافؤ
              </Button>
              <Button variant="outline" size="sm" onClick={() => setVb(Number(titrationStats.veq.toFixed(2)))}>
                نقطة التكافؤ
              </Button>
            </div>
          </div>
        )}

        {mode === 'spectro' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">العيّنة</Label>
              <Select
                value={sampleId}
                onValueChange={(v) => {
                  setSampleId(v);
                  setLambda(findSample(v).lambdaMax);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — λmax {s.lambdaMax} nm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {slider('الطول الموجي (nm)', lambda, setLambda, 250, 900, 1, `${lambda} nm`)}
            {slider('التركيز (M)', conc, setConc, 0.00001, 0.001, 0.00001, conc.toExponential(2))}
            {slider('طول المسار b (cm)', path, setPath, 0.1, 5, 0.1, `${path.toFixed(1)} cm`)}
            <Button variant="outline" size="sm" onClick={() => setLambda(spectroStats.sample.lambdaMax)}>
              اضبط على λmax
            </Button>
          </div>
        )}

        {mode === 'chromato' && (
          <div className="space-y-4">
            {slider('قطبية المذيب', solventPolarity, setSolventPolarity, 0, 1, 0.01, solventPolarity.toFixed(2))}
            {slider('مسافة التطوير (cm)', runLength, setRunLength, 3, 12, 0.5, `${runLength} cm`)}
            {slider('تقدّم التطوير', progress, setProgress, 0.05, 1, 0.01, `${(progress * 100).toFixed(0)}%`)}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setProgress(1)}>
                إنهاء التطوير
              </Button>
              <Button variant="outline" size="sm" onClick={() => setProgress(0.05)}>
                إعادة الوضع
              </Button>
            </div>
          </div>
        )}

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
            <Label className="text-sm">إظهار الجسيمات</Label>
            <Switch checked={showParticles} onCheckedChange={setShowParticles} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الكيمياء التحليلية تجيب عن سؤالين: <strong>ما هي المادة؟</strong> (تحليل نوعي) و
        <strong> كم مقدارها؟</strong> (تحليل كمّي). تجمع هذه المحاكاة ثلاث تقنيات أساسية في المختبر.
      </p>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">1) المعايرة الحجمية</p>
        <p>
          نضيف محلولاً معلوم التركيز (المعايِر) تدريجياً حتى تتساوى المولات: n(حمض) = n(قاعدة)، أي
          C<sub>a</sub>V<sub>a</sub> = C<sub>b</sub>V<sub>b</sub>. قبل التكافؤ في الحمض الضعيف نكون في منطقة
          منظّمة تتبع معادلة هندرسون-هاسلبالخ، وعند نصف التكافؤ يكون pH = pKa بالضبط.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">2) المطيافية (قانون بير-لامبرت)</p>
        <p>
          A = ε·b·c، حيث ε الامتصاصية المولية و b طول مسار الضوء داخل الخلية و c التركيز. والعلاقة مع
          النفاذية: A = −log(T). نقيس عند λmax لأعلى حساسية، ونحافظ على A بين 0.1 و1.0 لتقليل الخطأ.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">3) الكروماتوغرافيا</p>
        <p>
          يعتمد الفصل على التوزّع بين طور ثابت (السيليكا القطبية) وطور متحرّك (المذيب). كلما زادت قطبية
          المادة زاد ارتباطها بالطور الثابت فقلّت Rf = مسافة المادة ÷ مسافة المذيب. تغيير قطبية المذيب
          يغيّر ترتيب البقع وجودة الفصل.
        </p>
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {mode === 'titration'
              ? 'منحنى المعايرة pH مقابل الحجم'
              : mode === 'spectro'
              ? 'طيف الامتصاص A مقابل λ'
              : 'قيم Rf مقابل قطبية المذيب'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'titration' ? (
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="v" tick={{ fontSize: 10 }} label={{ value: 'mL', position: 'insideBottom', offset: -4 }} />
                <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine x={Number(titrationStats.veq.toFixed(2))} stroke="#22c55e" strokeDasharray="4 4" />
                <ReferenceLine y={titrationStats.indicator.low} stroke="#f59e0b" strokeDasharray="2 4" />
                <ReferenceLine y={titrationStats.indicator.high} stroke="#f59e0b" strokeDasharray="2 4" />
                <RLine type="monotone" dataKey="ph" stroke="#8b5cf6" dot={false} strokeWidth={2} name="pH" />
              </LineChart>
            ) : mode === 'spectro' ? (
              <LineChart data={spectrum}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="lambda" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine x={lambda} stroke="#22c55e" strokeDasharray="4 4" />
                <RLine type="monotone" dataKey="a" stroke="#0ea5e9" dot={false} strokeWidth={2} name="A" />
              </LineChart>
            ) : (
              <LineChart data={sweep}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="solvent" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine x={Number(solventPolarity.toFixed(2))} stroke="#22c55e" strokeDasharray="4 4" />
                {MIXTURE.map((m) => (
                  <RLine key={m.id} type="monotone" dataKey={m.id} stroke={m.color} dot={false} strokeWidth={2} name={m.name} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {mode === 'spectro' ? 'خط المعايرة A مقابل التركيز' : 'بيانات التجربة الحالية'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {mode === 'spectro' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calibration}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="c" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <RLine type="monotone" dataKey="a" stroke="#f59e0b" dot={false} strokeWidth={2} name="A" />
              </LineChart>
            </ResponsiveContainer>
          ) : mode === 'chromato' ? (
            <div className="space-y-2 text-sm">
              {chromatoStats.spots.map((s) => (
                <div key={s.analyte.id} className="flex items-center justify-between rounded-md border border-border p-2">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: s.analyte.color }} />
                    {s.analyte.name}
                  </span>
                  <span className="font-mono text-xs">
                    Rf {s.rf.toFixed(3)} — {s.distance.toFixed(2)} cm
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                ['المادة', `${titrationStats.analyte.name} (${titrationStats.analyte.formula})`],
                ['pKa', titrationStats.analyte.pka === null ? 'حمض قوي' : titrationStats.analyte.pka.toFixed(2)],
                ['حجم التكافؤ', `${titrationStats.veq.toFixed(2)} mL`],
                ['pH الحالي', titrationStats.ph.toFixed(3)],
                ['مولات متبقية', `${(titrationStats.molRemaining * 1000).toFixed(3)} mmol`],
                ['الكاشف', `${titrationStats.indicator.name} (${titrationStats.indicator.low}–${titrationStats.indicator.high})`],
                [
                  'ملاءمة الكاشف',
                  titrationStats.indicator.low > 7 === titrationStats.veq > 0 &&
                  Math.abs(titrationStats.indicator.low - 7) < 4
                    ? 'مناسب'
                    : 'راجع الاختيار',
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-md border border-border p-2">
                  <span>{k}</span>
                  <span className="font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const challengeCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          تحدّي: اضبط امتصاصية محدّدة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          انتقل إلى نمط «المطيافية» واضبط التركيز وطول المسار والطول الموجي حتى تصل الامتصاصية إلى الهدف
          بفارق أقل من 0.02.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">A = {challenge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">A = {spectroStats.absorbance.toFixed(3)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 0.02 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 0.02
                ? 'ممتاز! ضبطت الامتصاصية المطلوبة.'
                : `الفارق ${challengeError?.toFixed(3)} — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الكيمياء التحليلية ثلاثية الأبعاد"
      subtitle="Analytical Chemistry 3D — معايرة بالسحّاحة، مطياف ضوئي، وكروماتوغرافيا طبقة رقيقة"
      icon={<FlaskConical className="h-8 w-8 text-primary" />}
      objectives={[
        'إجراء معايرة حمض-قاعدة وتحديد نقطة التكافؤ حسابياً وتجريبياً',
        'اختيار الكاشف المناسب اعتماداً على قفزة pH',
        'تطبيق قانون بير-لامبرت A = ε·b·c وربطه بالنفاذية',
        'بناء خط معايرة واستخدامه في التحليل الكمّي',
        'حساب Rf وتفسير أثر قطبية المذيب على جودة الفصل',
      ]}
      concepts={[
        'نقطة التكافؤ',
        'نقطة النهاية',
        'هندرسون-هاسلبالخ',
        'قانون بير-لامبرت',
        'الامتصاصية المولية ε',
        'النفاذية T',
        'λmax',
        'معامل الاحتجاز Rf',
        'الطور الثابت والمتحرّك',
      ]}
      steps={[
        'في «المعايرة»: اختر حمض الإيثانويك 0.1 M بحجم 25 mL.',
        'اضغط «نصف التكافؤ» وتحقق أن pH يساوي pKa تقريباً (4.76).',
        'اضغط «نقطة التكافؤ» ولاحظ القفزة وتغيّر لون الفينولفثالين.',
        'بدّل إلى الميثيل البرتقالي واستنتج لماذا لا يصلح هنا.',
        'في «المطيافية»: اختر برمنغنات البوتاسيوم واضبط λ على 525 nm.',
        'غيّر التركيز ولاحظ خطية العلاقة بين A والتركيز.',
        'في «الكروماتوغرافيا»: حرّك قطبية المذيب وراقب ترتيب البقع وقيم Rf.',
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
          fileName="analytical-chemistry-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'المادة': titrationStats.analyte.formula,
              'تركيز العينة (M)': ca.toFixed(3),
              'حجم العينة (mL)': va.toFixed(1),
              'الحجم المضاف (mL)': vb.toFixed(2),
              'حجم التكافؤ (mL)': titrationStats.veq.toFixed(2),
              'pH': titrationStats.ph.toFixed(3),
              'العينة الطيفية': spectroStats.sample.name,
              'λ (nm)': lambda.toFixed(0),
              'A': spectroStats.absorbance.toFixed(3),
              'T %': spectroStats.transmittance.toFixed(2),
              'قطبية المذيب': solventPolarity.toFixed(2),
              'أقل فصل (cm)': chromatoStats.resolution.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default AnalyticalChemistry3D;
