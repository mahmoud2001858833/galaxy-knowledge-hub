import { Suspense, lazy, useMemo, useState } from 'react';
import { Radio, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  EMWaveMode,
  EMWaveParams,
  bandList,
  computeEMWave,
  malusCurve,
  photonEnergyCurve,
} from '@/lib/sim-physics/emwaves';

const EMWavesScene3D = lazy(() =>
  import('@/components/simulations3d/emwaves/EMWavesScene3D').then((m) => ({ default: m.EMWavesScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'في الموجة الكهرومغناطيسية، المجالان E و B:',
    options: ['متوازيان', 'متعامدان على بعضهما وعلى اتجاه الانتشار', 'في اتجاه الانتشار', 'أحدهما ثابت'],
    correctIndex: 1,
    explanation: 'E ⟂ B ⟂ k — موجة مستعرضة بالكامل.',
  },
  {
    question: 'العلاقة بين التردد والطول الموجي في الفراغ:',
    options: ['λ = c·f', 'λ = c/f', 'λ = f/c', 'λ = c + f'],
    correctIndex: 1,
    explanation: 'c = λf ⇒ λ = c/f، وسرعة الضوء ثابتة 3×10⁸ م/ث.',
  },
  {
    question: 'طاقة الفوتون تُحسب من:',
    options: ['E = hf', 'E = h/f', 'E = hc·f', 'E = f/h'],
    correctIndex: 0,
    explanation: 'E = hf = hc/λ، فالتردد الأعلى يعني فوتونات أعلى طاقة.',
  },
  {
    question: 'عند دخول الضوء وسطاً معامل انكساره n:',
    options: ['يتغير التردد', 'تقل السرعة والطول الموجي', 'تزيد السرعة', 'لا يتغير شيء'],
    correctIndex: 1,
    explanation: 'v = c/n و λ_n = λ/n، بينما يبقى التردد ثابتاً.',
  },
  {
    question: 'قانون مالوس ينص على أن الشدة النافذة تساوي:',
    options: ['I₀·cosθ', 'I₀·cos²θ', 'I₀·sinθ', 'I₀/cosθ'],
    correctIndex: 1,
    explanation: 'I = I₀cos²θ، فتنعدم عند 90°.',
  },
  {
    question: 'الإشعاع يُعدّ مؤيّناً عندما تكون طاقة الفوتون:',
    options: ['أقل من 1 eV', 'حوالي 10 eV فأكثر', 'أي طاقة', 'أقل من 0.1 eV'],
    correctIndex: 1,
    explanation: 'فوق ~10 eV (فوق البنفسجية البعيدة فأعلى) يستطيع الفوتون نزع الإلكترونات.',
  },
  {
    question: 'في الظاهرة الكهروضوئية لا تنبعث إلكترونات إذا:',
    options: ['كانت الشدة منخفضة', 'كان hf أقل من دالة الشغل', 'كان الضوء مستقطباً', 'كان المعدن بارداً'],
    correctIndex: 1,
    explanation: 'الشرط hf > φ؛ زيادة الشدة وحدها لا تُحدث انبعاثاً.',
  },
];

const MODE_LABEL: Record<EMWaveMode, string> = {
  propagation: 'انتشار الموجة',
  spectrum: 'الطيف الكهرومغناطيسي',
  interaction: 'الاستقطاب والتفاعل',
};

const ElectromagneticWaves3D = () => {
  const [mode, setMode] = useState<EMWaveMode>('propagation');
  const [logF, setLogF] = useState(14.7); // ~5×10^14 Hz visible
  const [amplitude, setAmplitude] = useState(1);
  const [refractiveIndex, setRefractiveIndex] = useState(1);
  const [polarizerDeg, setPolarizerDeg] = useState(30);
  const [workFunctionEv, setWorkFunctionEv] = useState(2.3);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('iso');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const frequency = useMemo(() => Math.pow(10, logF), [logF]);

  const params: EMWaveParams = useMemo(
    () => ({ mode, frequency, amplitude, refractiveIndex, polarizerDeg, workFunctionEv }),
    [mode, frequency, amplitude, refractiveIndex, polarizerDeg, workFunctionEv]
  );

  const stats = useMemo(() => computeEMWave(params), [params]);
  const malus = useMemo(() => malusCurve(), []);
  const energyCurve = useMemo(() => photonEnergyCurve(), []);

  const { entries, record, clear } = useSimNotebook('em-waves-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((380 + Math.random() * 380) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.wavelengthNm - challenge);

  const fmt = (v: number, digits = 3) =>
    Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(digits) : v.toFixed(digits);

  const hudReadings =
    mode === 'interaction'
      ? [
          { label: 'الشدة الساقطة I₀', value: fmt(stats.intensity), unit: 'واط/م²', tone: 'primary' as const },
          { label: 'الشدة النافذة (مالوس)', value: fmt(stats.transmittedIntensity), unit: 'واط/م²', tone: 'success' as const },
          { label: 'طاقة الفوتون', value: fmt(stats.photonEnergyEv), unit: 'eV' },
          { label: 'دالة الشغل φ', value: workFunctionEv.toFixed(2), unit: 'eV' },
          { label: 'طاقة الإلكترون المنبعث', value: fmt(stats.ejectedElectronEv), unit: 'eV', tone: 'warning' as const },
          { label: 'ضغط الإشعاع', value: fmt(stats.radiationPressure), unit: 'باسكال' },
        ]
      : [
          { label: 'التردد f', value: fmt(frequency), unit: 'هرتز', tone: 'primary' as const },
          { label: 'الطول الموجي λ', value: fmt(stats.wavelength), unit: 'م', tone: 'success' as const },
          { label: 'λ داخل الوسط', value: fmt(stats.wavelengthInMedium), unit: 'م' },
          { label: 'السرعة v = c/n', value: fmt(stats.speedInMedium / 1e8, 3), unit: '×10⁸ م/ث' },
          { label: 'طاقة الفوتون', value: fmt(stats.photonEnergyEv), unit: 'eV', tone: 'warning' as const },
          { label: 'النطاق', value: stats.bandLabel, unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 12, 26]} environment="night">
        <Suspense fallback={null}>
          <EMWavesScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as EMWaveMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="propagation" className="text-xs">الانتشار</TabsTrigger>
            <TabsTrigger value="spectrum" className="text-xs">الطيف</TabsTrigger>
            <TabsTrigger value="interaction" className="text-xs">التفاعل</TabsTrigger>
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

        {slider('التردد (لوغاريتمي)', logF, setLogF, 5, 22, 0.01, `${fmt(frequency)} هرتز`)}

        <div className="grid grid-cols-2 gap-2">
          {bandList.map((b, i) => (
            <Button
              key={b.id}
              size="sm"
              variant={stats.band === b.id ? 'default' : 'outline'}
              className="text-[11px]"
              onClick={() => {
                const lo = Math.log10(Math.max(b.min, 1e5));
                const hi = Math.log10(Number.isFinite(b.max) ? b.max : 1e22);
                setLogF(Number(((lo + hi) / 2).toFixed(2)));
              }}
            >
              {b.label}
            </Button>
          ))}
        </div>

        {slider('سعة المجال', amplitude, setAmplitude, 0.2, 2, 0.05, `${amplitude.toFixed(2)}`)}
        {slider('معامل انكسار الوسط n', refractiveIndex, setRefractiveIndex, 1, 2.5, 0.01, refractiveIndex.toFixed(2))}

        {mode === 'interaction' && (
          <>
            {slider('زاوية المستقطِب θ', polarizerDeg, setPolarizerDeg, 0, 90, 1, `${polarizerDeg}°`)}
            {slider('دالة شغل المعدن φ', workFunctionEv, setWorkFunctionEv, 0.5, 6, 0.05, `${workFunctionEv.toFixed(2)} eV`)}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار متجهات المجالين E و B</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الموجة الكهرومغناطيسية اضطراب متعامد في المجالين الكهربائي والمغناطيسي ينتشر في الفراغ بسرعة
        الضوء دون حاجة إلى وسط. عند دخولها وسطاً مادياً تقل سرعتها وطولها الموجي بينما يبقى التردد
        ثابتاً، وتحمل طاقة مُكمّاة على شكل فوتونات E = hf.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        c = λf = 1/√(ε₀μ₀) = 2.998×10⁸ m/s{'\n'}
        E/B = c ، v = c/n ، λₙ = λ/n{'\n'}
        E_photon = hf = hc/λ{'\n'}
        I = ½ε₀cE₀² ، P_rad = I/c{'\n'}
        I = I₀cos²θ (مالوس) ، KE_max = hf − φ
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>الراديو والميكروويف: اتصالات ورادار وتسخين جزيئات الماء.</li>
        <li>تحت الحمراء: تصوير حراري وتحكّم عن بُعد؛ المرئي: الرؤية والتمثيل الضوئي.</li>
        <li>فوق البنفسجية والسينية وغاما: إشعاع مؤيّن يستخدم في التعقيم والتشخيص والعلاج.</li>
        <li>الاستقطاب يثبت الطبيعة المستعرضة للضوء، والظاهرة الكهروضوئية تثبت طبيعته الجسيمية.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">قانون مالوس — الشدة مقابل زاوية المستقطِب</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={malus} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="deg" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="شدة نافذة I/I₀" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">طاقة الفوتون عبر الطيف (مقياس لوغاريتمي)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energyCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="log₁₀(f)" tick={{ fontSize: 11 }} />
              <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="طاقة الفوتون (eV)" stroke="#f97316" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط الطول الموجي المطلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          استخدم منزلق التردد للوصول إلى الطول الموجي المطلوب بفارق أقل من 5 نانومتر.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> طول موجي جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(1)} نانومتر</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{fmt(stats.wavelengthNm)} نانومتر</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 1e9) <= 5
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 1e9) <= 5
                ? 'ممتاز! أصبت الطول الموجي المطلوب.'
                : 'واصل ضبط التردد للوصول إلى الهدف.'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الموجات الكهرومغناطيسية ثلاثية الأبعاد"
      subtitle="Electromagnetic Waves 3D — الانتشار، الطيف، الاستقطاب والظاهرة الكهروضوئية"
      icon={<Radio className="h-8 w-8 text-primary" />}
      objectives={[
        'تصوّر تعامد المجالين E و B مع اتجاه الانتشار',
        'ربط التردد بالطول الموجي وطاقة الفوتون عبر الطيف',
        'حساب سرعة الموجة والطول الموجي داخل وسط بمعامل انكسار n',
        'تطبيق قانون مالوس وشرط الظاهرة الكهروضوئية',
      ]}
      concepts={[
        'c = λf',
        'E ⟂ B ⟂ k',
        'E = hf',
        'الشدة وضغط الإشعاع',
        'قانون مالوس',
        'الإشعاع المؤيّن',
        'الظاهرة الكهروضوئية',
      ]}
      steps={[
        'في «الانتشار»: راقب تعامد المجالين وغيّر السعة ومعامل الانكسار.',
        'قارن الطول الموجي في الفراغ وداخل الوسط وسجّل النتيجة.',
        'انتقل إلى «الطيف» واختر النطاقات السبعة وتابع تغيّر طاقة الفوتون.',
        'حدّد عند أي نطاق يصبح الإشعاع مؤيّناً (≈ 10 eV).',
        'في «التفاعل»: غيّر زاوية المستقطِب من 0° إلى 90° وتحقّق من cos²θ.',
        'اضبط دالة الشغل وابحث عن التردد الحدّي لبدء الانبعاث الكهروضوئي.',
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
          fileName="em-waves-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'التردد (هرتز)': fmt(frequency),
              'النطاق': stats.bandLabel,
              'λ (م)': fmt(stats.wavelength),
              'λ داخل الوسط (م)': fmt(stats.wavelengthInMedium),
              'n': refractiveIndex.toFixed(2),
              'طاقة الفوتون (eV)': fmt(stats.photonEnergyEv),
              'الشدة (واط/م²)': fmt(stats.intensity),
              'زاوية المستقطِب': `${polarizerDeg}°`,
              'الشدة النافذة': fmt(stats.transmittedIntensity),
              'كهروضوئي': stats.photoelectric ? 'نعم' : 'لا',
            })
          }
        />
      }
    />
  );
};

export default ElectromagneticWaves3D;
