import { Suspense, lazy, useMemo, useState } from 'react';
import { Waves, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  WaveMode,
  WaveParams,
  computeWaves,
  waveProfile,
  beatProfile,
  dopplerCurve,
} from '@/lib/sim-physics/waves';

const WaveScene3D = lazy(() =>
  import('@/components/simulations3d/waves/WaveScene3D').then((m) => ({ default: m.WaveScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'العلاقة الصحيحة بين سرعة الموجة وطولها وترددها هي:',
    options: ['v = λ / f', 'v = f λ', 'v = f / λ', 'v = λ² f'],
    correctIndex: 1,
    explanation: 'v = f·λ — فعند ثبات السرعة يقلّ الطول الموجي كلما زاد التردد.',
  },
  {
    question: 'عند اقتراب مصدر صوت من مُراقب ساكن فإن التردد المسموع:',
    options: ['يقل', 'يزيد', 'لا يتغير', 'يتضاعف دائماً'],
    correctIndex: 1,
    explanation: "f' = f·c/(c − v_s) — تتضاغط الجبهات الموجية أمام المصدر فيرتفع التردد.",
  },
  {
    question: 'تردد النبضات (Beats) الناتج عن موجتين تردداهما 256 و260 هرتز يساوي:',
    options: ['2 هرتز', '4 هرتز', '8 هرتز', '516 هرتز'],
    correctIndex: 1,
    explanation: 'f_beat = |f₁ − f₂| = 4 هرتز.',
  },
  {
    question: 'يحدث التداخل البنّاء عندما يكون فرق المسار مساوياً لـ:',
    options: ['مضاعف فردي لنصف الطول الموجي', 'مضاعف صحيح للطول الموجي', 'ربع الطول الموجي', 'صفر فقط'],
    correctIndex: 1,
    explanation: 'Δr = nλ يعطي فرق طور 2πn فتتجمع القمم مع القمم.',
  },
  {
    question: 'عندما تتجاوز سرعة المصدر سرعة الصوت (ماخ > 1) ينشأ:',
    options: ['انزياح أحمر', 'مخروط ماخ وانفجار صوتي', 'حيود كامل', 'رنين'],
    correctIndex: 1,
    explanation: 'تتراكم الجبهات على سطح مخروطي فينتج الانفجار الصوتي (Sonic Boom).',
  },
  {
    question: 'التوهين (Damping) في الوسط يؤثر بشكل مباشر على:',
    options: ['التردد', 'السعة', 'السرعة', 'الطول الموجي'],
    correctIndex: 1,
    explanation: 'التوهين يقلّل السعة أُسّياً مع المسافة بينما يبقى التردد ثابتاً.',
  },
];

const MODE_LABEL: Record<WaveMode, string> = {
  wave: 'الموجة المنتقلة',
  doppler: 'تأثير دوبلر',
  interference: 'التداخل والنبضات',
};

const WavesSound3D = () => {
  const [mode, setMode] = useState<WaveMode>('wave');
  const [amplitude, setAmplitude] = useState(0.8);
  const [frequency, setFrequency] = useState(1.2);
  const [waveSpeed, setWaveSpeed] = useState(6);
  const [damping, setDamping] = useState(0.02);
  const [sourceSpeed, setSourceSpeed] = useState(120);
  const [observerSpeed, setObserverSpeed] = useState(0);
  const [sourceFrequency, setSourceFrequency] = useState(440);
  const [mediumSpeed, setMediumSpeed] = useState(343);
  const [freqA, setFreqA] = useState(2);
  const [freqB, setFreqB] = useState(2.2);
  const [phaseDeg, setPhaseDeg] = useState(0);
  const [sourceGap, setSourceGap] = useState(6);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: WaveParams = useMemo(
    () => ({
      mode,
      amplitude,
      frequency,
      waveSpeed,
      damping,
      sourceSpeed,
      observerSpeed,
      sourceFrequency,
      mediumSpeed,
      freqA,
      freqB,
      phaseDeg,
      sourceGap,
    }),
    [
      mode,
      amplitude,
      frequency,
      waveSpeed,
      damping,
      sourceSpeed,
      observerSpeed,
      sourceFrequency,
      mediumSpeed,
      freqA,
      freqB,
      phaseDeg,
      sourceGap,
    ]
  );

  const stats = useMemo(() => computeWaves(params), [params]);
  const profile = useMemo(() => waveProfile(params), [params]);
  const beats = useMemo(() => beatProfile(params), [params]);
  const doppler = useMemo(() => dopplerCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('waves-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((1.5 + Math.random() * 6) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.wavelength - challenge);

  const hudReadings =
    mode === 'wave'
      ? [
          { label: 'الطول الموجي', value: stats.wavelength.toFixed(2), unit: 'م', tone: 'primary' as const },
          { label: 'الزمن الدوري', value: stats.period.toFixed(3), unit: 'ث' },
          { label: 'التردد الزاوي', value: stats.angularFreq.toFixed(2), unit: 'rad/s' },
          { label: 'عدد الموجة k', value: stats.waveNumber.toFixed(2), unit: 'rad/m' },
          { label: 'أقصى سرعة جسيم', value: stats.maxSpeed.toFixed(2), unit: 'م/ث', tone: 'success' as const },
          { label: 'الشدة النسبية', value: stats.intensityDb.toFixed(0), unit: 'dB' },
        ]
      : mode === 'doppler'
      ? [
          { label: 'التردد الأصلي', value: sourceFrequency.toFixed(0), unit: 'Hz' },
          { label: 'عند الاقتراب', value: stats.approachFreq.toFixed(1), unit: 'Hz', tone: 'success' as const },
          { label: 'عند الابتعاد', value: stats.recedeFreq.toFixed(1), unit: 'Hz', tone: 'warning' as const },
          { label: 'الانزياح', value: stats.shiftPercent.toFixed(1), unit: '%', tone: 'primary' as const },
          { label: 'رقم ماخ', value: stats.machNumber.toFixed(2), unit: '' },
          { label: 'حاجز الصوت', value: stats.sonicBoom ? 'مُخترَق' : 'دون الصوتي', unit: '' },
        ]
      : [
          { label: 'تردد النبضات', value: stats.beatFrequency.toFixed(2), unit: 'Hz', tone: 'primary' as const },
          { label: 'السعة المحصلة', value: stats.combinedAmplitude.toFixed(2), unit: 'م', tone: 'success' as const },
          { label: 'فرق الطور', value: phaseDeg.toFixed(0), unit: '°' },
          { label: 'فرق المسار', value: stats.pathDifference.toFixed(2), unit: 'م' },
          { label: 'المسافة بين المصدرين', value: sourceGap.toFixed(1), unit: 'م' },
          { label: 'نوع التداخل', value: stats.constructive ? 'بنّاء' : 'هدّام', unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[12, 9, 18]} environment="night">
        <Suspense fallback={null}>
          <WaveScene3D
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as WaveMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wave" className="text-xs">الموجة</TabsTrigger>
            <TabsTrigger value="doppler" className="text-xs">دوبلر</TabsTrigger>
            <TabsTrigger value="interference" className="text-xs">التداخل</TabsTrigger>
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

        {slider('السعة A', amplitude, setAmplitude, 0.1, 2, 0.05, 'م')}

        {mode === 'wave' && (
          <>
            {slider('التردد f', frequency, setFrequency, 0.2, 5, 0.1, 'هرتز')}
            {slider('سرعة الموجة v', waveSpeed, setWaveSpeed, 1, 20, 0.5, 'م/ث')}
            {slider('معامل التوهين', damping, setDamping, 0, 0.2, 0.005, '1/م')}
          </>
        )}

        {mode === 'doppler' && (
          <>
            {slider('تردد المصدر', sourceFrequency, setSourceFrequency, 100, 2000, 10, 'هرتز')}
            {slider('سرعة المصدر', sourceSpeed, setSourceSpeed, 0, 420, 5, 'م/ث')}
            {slider('سرعة المُراقب', observerSpeed, setObserverSpeed, -100, 100, 5, 'م/ث')}
            {slider('سرعة الصوت في الوسط', mediumSpeed, setMediumSpeed, 250, 1500, 10, 'م/ث')}
          </>
        )}

        {mode === 'interference' && (
          <>
            {slider('تردد المصدر أ', freqA, setFreqA, 0.5, 5, 0.05, 'هرتز')}
            {slider('تردد المصدر ب', freqB, setFreqB, 0.5, 5, 0.05, 'هرتز')}
            {slider('فرق الطور', phaseDeg, setPhaseDeg, 0, 360, 5, '°')}
            {slider('المسافة بين المصدرين', sourceGap, setSourceGap, 1, 14, 0.5, 'م')}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, '×')}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار المتجهات والقياسات</Label>
          <Switch checked={showVectors} onCheckedChange={setShowVectors} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الموجة تنقل <strong>الطاقة لا المادة</strong>: تهتز جسيمات الوسط حول موضع اتزانها بينما ينتقل الطور
        بسرعة v = f·λ. وعند حركة المصدر أو المُراقب يتغيّر التردد المستقبَل وفق معادلة دوبلر، وعند التقاء
        موجتين تتجمع إزاحتاهما جبريّاً (مبدأ التراكب).
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        y(x,t) = A e^(−bx) · sin(kx − ωt){'\n'}
        v = f λ ، k = 2π/λ ، ω = 2πf{'\n'}
        f' = f · (c ± v_o) / (c ∓ v_s){'\n'}
        f_beat = |f₁ − f₂| ، A_total = 2A·cos(Δφ/2){'\n'}
        Mach = v_s / c
      </div>
      <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
        <li>التوهين يُنقص السعة أُسّياً مع المسافة ولا يغيّر التردد.</li>
        <li>الانزياح الدوبلري يستخدم في الرادار والموجات فوق الصوتية الطبية (Doppler Ultrasound).</li>
        <li>التداخل البنّاء عند Δr = nλ، والهدّام عند Δr = (n + ½)λ.</li>
        <li>النبضات تُستخدم لضبط الآلات الموسيقية عبر تصفير تردد النبضة.</li>
      </ul>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">شكل الموجة والغلاف المتوهّن y(x)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profile} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="x" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الإزاحة (م)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الغلاف" stroke="#f97316" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">التردد المسموع مقابل سرعة المصدر</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={doppler} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="v" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="مقترب (Hz)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="مبتعد (Hz)" stroke="#ef4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">التراكب والنبضات مع الزمن</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={beats} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="المحصلة" stroke="#a855f7" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الغلاف" stroke="#facc15" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط طولاً موجيّاً مطلوباً
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          غيّر التردد وسرعة الموجة حتى يصل الطول الموجي λ إلى القيمة المطلوبة بفارق أقل من 0.15 متر.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> طول موجي جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{challenge.toFixed(2)} م</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">{stats.wavelength.toFixed(2)} م</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 9) <= 0.15
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 9) <= 0.15
                ? `ممتاز! الفارق ${challengeError?.toFixed(2)} م فقط.`
                : `الفارق ${challengeError?.toFixed(2)} م — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الموجات والصوت ثلاثية الأبعاد"
      subtitle="Waves & Sound 3D — الموجة المنتقلة، تأثير دوبلر، والتداخل"
      icon={<Waves className="h-8 w-8 text-primary" />}
      objectives={[
        'ربط السرعة بالتردد والطول الموجي واستنتاج v = fλ',
        'تفسير التوهين وأثره على السعة دون التردد',
        'تطبيق معادلة دوبلر لحالتَي الاقتراب والابتعاد وحساب رقم ماخ',
        'تحليل تراكب موجتين واستنتاج التداخل البنّاء والهدّام وتردد النبضات',
      ]}
      concepts={['الطول الموجي', 'التردد', 'مبدأ التراكب', 'تأثير دوبلر', 'النبضات', 'رقم ماخ']}
      steps={[
        'في «الموجة»: ثبّت السرعة وزد التردد، ولاحظ انكماش الطول الموجي على المسطرة الصفراء.',
        'ارفع معامل التوهين وراقب انحسار الغلاف البرتقالي مع بقاء التردد ثابتاً.',
        'انتقل إلى «دوبلر»: زد سرعة المصدر وتابع تضاغط الجبهات الموجية أمامه.',
        'ارفع السرعة فوق سرعة الصوت وسجّل رقم ماخ ولحظة اختراق الحاجز.',
        'في «التداخل»: اجعل الترددين متساويين وغيّر فرق الطور بين 0° و180°.',
        'اجعل بين الترددين فرقاً صغيراً وراقب ظهور النبضات في الرسم الزمني.',
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
          fileName="waves-sound-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'السعة (م)': amplitude.toFixed(2),
              'الطول الموجي (م)': stats.wavelength.toFixed(2),
              'الزمن الدوري (ث)': stats.period.toFixed(3),
              'تردد الاقتراب (Hz)': stats.approachFreq.toFixed(1),
              'تردد الابتعاد (Hz)': stats.recedeFreq.toFixed(1),
              'رقم ماخ': stats.machNumber.toFixed(2),
              'تردد النبضات (Hz)': stats.beatFrequency.toFixed(2),
              'السعة المحصلة (م)': stats.combinedAmplitude.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default WavesSound3D;
