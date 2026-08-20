import { Suspense, lazy, useMemo, useState } from 'react';
import { FlaskRound, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  ACIDS,
  AcidBaseMode,
  AcidBaseParams,
  BASES,
  INDICATORS,
  bufferCurve,
  computeAcidBase,
  concentrationCurve,
  findAcid,
  findBase,
  titrationCurve,
} from '@/lib/sim-physics/acidsbases';

const AcidsScene3D = lazy(() =>
  import('@/components/simulations3d/acids/AcidsScene3D').then((m) => ({ default: m.AcidsScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'قيمة pH لمحلول تركيز [H⁺] فيه 1×10⁻³ M تساوي:',
    options: ['3', '11', '−3', '7'],
    correctIndex: 0,
    explanation: 'pH = −log[H⁺] = −log(10⁻³) = 3.',
  },
  {
    question: 'عند 25°م يكون دائماً:',
    options: ['pH + pOH = 7', 'pH + pOH = 14', 'pH × pOH = 14', 'pH = pOH'],
    correctIndex: 1,
    explanation: 'لأن Kw = [H⁺][OH⁻] = 1×10⁻¹⁴.',
  },
  {
    question: 'كلما صغرت قيمة Ka فإن الحمض:',
    options: ['أقوى', 'أضعف', 'متعادل', 'قاعدي'],
    correctIndex: 1,
    explanation: 'Ka أصغر تعني تأيّناً أقل أي حمضاً أضعف (pKa أكبر).',
  },
  {
    question: 'عند نقطة التكافؤ في معايرة حمض ضعيف بقاعدة قوية يكون pH:',
    options: ['أقل من 7', 'يساوي 7', 'أكبر من 7', 'يساوي pKa'],
    correctIndex: 2,
    explanation: 'الملح الناتج قاعدة مرافقة تتحلل مائياً فيصبح المحلول قاعدياً.',
  },
  {
    question: 'عند نصف نقطة التكافؤ لحمض ضعيف:',
    options: ['pH = 7', 'pH = pKa', 'pH = 14', 'pH = 0'],
    correctIndex: 1,
    explanation: 'لأن [HA] = [A⁻] فيصبح log(النسبة) = 0 في معادلة هندرسون-هاسلبالخ.',
  },
  {
    question: 'المحلول المنظّم يتكوّن من:',
    options: ['حمض قوي وقاعدة قوية', 'حمض ضعيف وملح قاعدته المرافقة', 'ماء نقي', 'ملح متعادل فقط'],
    correctIndex: 1,
    explanation: 'الزوج المرافق يمتص H⁺ وOH⁻ المضافة فيقاوم تغيّر pH.',
  },
  {
    question: 'اختيار الكاشف المناسب للمعايرة يعتمد على:',
    options: ['لونه فقط', 'سعره', 'وقوع مدى تغيّره ضمن قفزة pH عند التكافؤ', 'حجم الدورق'],
    correctIndex: 2,
    explanation: 'الفينولفثالين (8.2–10) مناسب لمعايرة حمض ضعيف بقاعدة قوية.',
  },
];

const MODE_LABEL: Record<AcidBaseMode, string> = {
  ph: 'مقياس pH',
  titration: 'المعايرة',
  buffer: 'المحاليل المنظّمة',
};

const AcidsBases3D = () => {
  const [mode, setMode] = useState<AcidBaseMode>('ph');
  const [acidId, setAcidId] = useState('ch3cooh');
  const [baseId, setBaseId] = useState('naoh');
  const [acidAnalyte, setAcidAnalyte] = useState(true);
  const [acidConc, setAcidConc] = useState(0.1);
  const [baseConc, setBaseConc] = useState(0.1);
  const [acidVolume, setAcidVolume] = useState(25);
  const [addedVolume, setAddedVolume] = useState(0);
  const [bufferAcid, setBufferAcid] = useState(0.1);
  const [bufferSalt, setBufferSalt] = useState(0.1);
  const [bufferStress, setBufferStress] = useState(0);
  const [indicatorId, setIndicatorId] = useState('phenolphthalein');

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params: AcidBaseParams = useMemo(
    () => ({
      mode,
      acidId,
      baseId,
      acidConc,
      baseConc,
      acidVolume,
      addedVolume,
      bufferAcid,
      bufferSalt,
      bufferStress,
      indicatorId,
      acidAnalyte,
    }),
    [mode, acidId, baseId, acidConc, baseConc, acidVolume, addedVolume, bufferAcid, bufferSalt, bufferStress, indicatorId, acidAnalyte]
  );

  const stats = useMemo(() => computeAcidBase(params), [params]);
  const titration = useMemo(() => titrationCurve(params), [params]);
  const buffer = useMemo(() => bufferCurve(params), [params]);
  const concCurve = useMemo(() => concentrationCurve(params), [params]);

  const { entries, record, clear } = useSimNotebook('acids-bases-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setAddedVolume(0);
    setBufferStress(0);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round((2 + Math.random() * 10) * 10) / 10);
  const challengeError = challenge === null ? null : Math.abs(stats.ph - challenge);

  const hudReadings =
    mode === 'buffer'
      ? [
          { label: 'الأس الهيدروجيني', value: stats.ph.toFixed(3), unit: '', tone: 'primary' as const },
          { label: 'pKa', value: stats.pka.toFixed(2), unit: '' },
          { label: 'السعة التنظيمية', value: stats.bufferCapacity.toFixed(4), unit: 'mol/L' },
          { label: 'انزياح pH', value: stats.bufferShift.toFixed(3), unit: '', tone: Math.abs(stats.bufferShift) < 0.5 ? ('success' as const) : ('warning' as const) },
          { label: '[HA]', value: bufferAcid.toFixed(2), unit: 'M' },
          { label: '[A⁻]', value: bufferSalt.toFixed(2), unit: 'M' },
        ]
      : mode === 'titration'
      ? [
          { label: 'الأس الهيدروجيني', value: stats.ph.toFixed(3), unit: '', tone: 'primary' as const },
          { label: 'الحجم المضاف', value: addedVolume.toFixed(2), unit: 'mL' },
          { label: 'حجم التكافؤ', value: stats.equivalenceVolume.toFixed(2), unit: 'mL', tone: 'success' as const },
          { label: 'نسبة الإنجاز', value: (stats.fraction * 100).toFixed(1), unit: '%' },
          { label: '[H⁺]', value: stats.h.toExponential(2), unit: 'M' },
          { label: 'الكاشف', value: stats.indicatorTurned ? 'تغيّر' : 'ثابت', unit: '', tone: stats.indicatorTurned ? ('success' as const) : ('warning' as const) },
        ]
      : [
          { label: 'الأس الهيدروجيني', value: stats.ph.toFixed(3), unit: '', tone: 'primary' as const },
          { label: 'pOH', value: stats.poh.toFixed(3), unit: '' },
          { label: '[H⁺]', value: stats.h.toExponential(2), unit: 'M' },
          { label: '[OH⁻]', value: stats.oh.toExponential(2), unit: 'M' },
          { label: 'نسبة التأيّن', value: stats.ionisation.toFixed(2), unit: '%', tone: 'success' as const },
          { label: 'التصنيف', value: stats.classification, unit: '' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[14, 13, 24]} environment="city">
        <Suspense fallback={null}>
          <AcidsScene3D
            mode={mode}
            params={params}
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showParticles={showParticles}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات حمضية-قاعدية حيّة" readings={hudReadings} />
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as AcidBaseMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ph" className="text-xs">مقياس pH</TabsTrigger>
            <TabsTrigger value="titration" className="text-xs">المعايرة</TabsTrigger>
            <TabsTrigger value="buffer" className="text-xs">منظّمة</TabsTrigger>
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

        {mode !== 'buffer' && (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">المادة في الدورق حمض</Label>
            <Switch checked={acidAnalyte} onCheckedChange={setAcidAnalyte} />
          </div>
        )}

        {(mode === 'ph' || mode === 'titration') && (
          <>
            {acidAnalyte || mode === 'titration' ? (
              <div className="space-y-2">
                <Label className="text-sm">الحمض</Label>
                <Select value={acidId} onValueChange={setAcidId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACIDS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} — {a.formula} (pKa {(-Math.log10(a.ka)).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label className="text-sm">القاعدة</Label>
              <Select value={baseId} onValueChange={setBaseId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.formula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {slider('تركيز المادة في الدورق', acidConc, setAcidConc, 0.001, 1, 0.001, `${acidConc.toFixed(3)} M`)}
          </>
        )}

        {mode === 'titration' && (
          <>
            {slider('تركيز السحّاحة', baseConc, setBaseConc, 0.01, 1, 0.01, `${baseConc.toFixed(2)} M`)}
            {slider('حجم الدورق', acidVolume, setAcidVolume, 5, 100, 1, `${acidVolume} mL`)}
            {slider(
              'الحجم المضاف',
              addedVolume,
              setAddedVolume,
              0,
              Math.max(stats.equivalenceVolume * 2, 10),
              0.05,
              `${addedVolume.toFixed(2)} mL`
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setAddedVolume(stats.equivalenceVolume / 2)}>
                نصف التكافؤ
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setAddedVolume(stats.equivalenceVolume)}>
                نقطة التكافؤ
              </Button>
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
          </>
        )}

        {mode === 'buffer' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">الحمض الضعيف</Label>
              <Select value={acidId} onValueChange={setAcidId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACIDS.filter((a) => !a.strong).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} — pKa {(-Math.log10(a.ka)).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {slider('تركيز الحمض [HA]', bufferAcid, setBufferAcid, 0.01, 1, 0.01, `${bufferAcid.toFixed(2)} M`)}
            {slider('تركيز الملح [A⁻]', bufferSalt, setBufferSalt, 0.01, 1, 0.01, `${bufferSalt.toFixed(2)} M`)}
            {slider('إضافة قاعدة/حمض قوي', bufferStress, setBufferStress, -80, 80, 1, `${bufferStress} mmol`)}
          </>
        )}

        {slider('سرعة المحاكاة', timeScale, setTimeScale, 0.2, 3, 0.1, `${timeScale.toFixed(1)}×`)}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label className="text-sm">إظهار الأيونات المتحركة</Label>
          <Switch checked={showParticles} onCheckedChange={setShowParticles} />
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الأس الهيدروجيني مقياس لوغاريتمي لتركيز أيونات الهيدروجين: كل وحدة pH تعني تغيّراً عشرة أضعاف
        في [H⁺]. الأحماض القوية تتأيّن كلياً فيكون تركيز H⁺ مساوياً لتركيز الحمض، أما الأحماض الضعيفة
        فتتأيّن جزئياً ويحكمها ثابت التأيّن Ka، وكلما صغر Ka ضعف الحمض وارتفع pKa.
      </p>
      <p>
        في المعايرة نضيف محلولاً معلوم التركيز من السحّاحة حتى تتساوى مولات الحمض والقاعدة عند نقطة
        التكافؤ، حيث يقفز منحنى pH قفزة حادّة. عند نصف نقطة التكافؤ يتساوى الحمض مع قاعدته المرافقة
        فيصبح pH = pKa. أما المحلول المنظّم فهو خليط الزوج المرافق الذي يمتص الإضافات الحمضية أو
        القاعدية فيبقى pH شبه ثابت، وتكون سعته التنظيمية أعلى ما يمكن عند [HA] = [A⁻].
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        pH = −log[H⁺] , pOH = −log[OH⁻] , pH + pOH = 14{'\n'}
        Ka = [H⁺][A⁻]/[HA] , [H⁺] = (−Ka + √(Ka² + 4KaC)) / 2{'\n'}
        pH = pKa + log([A⁻]/[HA]){'\n'}
        Ca·Va = Cb·Vb (at equivalence){'\n'}
        β = 2.303 · C · ([HA][A⁻]/C²)
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">منحنى المعايرة</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={titration} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="الحجم المضاف (mL)" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Number(stats.equivalenceVolume.toFixed(2))} stroke="#f43f5e" strokeDasharray="4 4" />
              <RLine type="monotone" dataKey="الأس الهيدروجيني" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'buffer' ? 'مقاومة التغيّر: منظّم مقابل ماء نقي' : 'اعتماد pH على التركيز'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'buffer' ? (
              <LineChart data={buffer} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="قاعدة مضافة (mmol)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="محلول منظّم" stroke="#22c55e" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="ماء نقي" stroke="#f97316" dot={false} strokeWidth={2} strokeDasharray="5 4" />
              </LineChart>
            ) : (
              <LineChart data={concCurve} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="التركيز (M)" scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="الأس الهيدروجيني" stroke="#a855f7" dot={false} strokeWidth={2} />
              </LineChart>
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
          تحدّي: اضبط محلولاً على pH محدّد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          اختر المادة واضبط التركيز (أو نسبة [A⁻]/[HA] في نمط المنظّم) حتى يصبح pH مطابقاً للهدف بفارق
          أقل من 0.1.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> هدف جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">pH {challenge.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الحالي</span>
              <span className="font-mono font-bold">pH {stats.ph.toFixed(2)}</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 0.1 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 0.1
                ? 'ممتاز! ضبطت الأس الهيدروجيني المطلوب.'
                : `الفارق ${challengeError?.toFixed(2)} — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الأحماض والقواعد ثلاثية الأبعاد"
      subtitle="Acids & Bases 3D — مقياس pH، المعايرة بالسحّاحة، والمحاليل المنظّمة"
      icon={<FlaskRound className="h-8 w-8 text-primary" />}
      objectives={[
        'حساب pH و pOH وتركيزي H⁺ و OH⁻ لأي محلول',
        'التمييز بين الأحماض القوية والضعيفة عبر Ka و pKa',
        'قراءة منحنى المعايرة وتحديد نقطة التكافؤ ونصفها',
        'اختيار الكاشف المناسب لمدى التغيّر',
        'تفسير عمل المحاليل المنظّمة وسعتها التنظيمية',
      ]}
      concepts={[
        'الأس الهيدروجيني',
        'ثابت تأيّن الماء Kw',
        'Ka و pKa',
        'نسبة التأيّن',
        'نقطة التكافؤ',
        'هندرسون-هاسلبالخ',
        'الكواشف',
        'السعة التنظيمية',
      ]}
      steps={[
        'في «مقياس pH»: اختر HCl بتركيز 0.1 M ولاحظ pH = 1.',
        'بدّل إلى حمض الخليك بنفس التركيز وقارن pH ونسبة التأيّن.',
        'خفّض التركيز عشرة أضعاف ولاحظ أن pH يرتفع أقل من وحدة للحمض الضعيف.',
        'في «المعايرة»: اضغط «نصف التكافؤ» وتحقق أن pH = pKa.',
        'اضغط «نقطة التكافؤ» ولاحظ قفزة pH وتغيّر لون الكاشف.',
        'جرّب الميثيل البرتقالي على نفس المعايرة واستنتج أنه غير مناسب.',
        'في «منظّمة»: أضف 40 mmol قاعدة وقارن انزياح pH بين المنظّم والماء النقي.',
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
          fileName="acids-bases-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'المادة': acidAnalyte ? findAcid(acidId).formula : findBase(baseId).formula,
              'التركيز (M)': acidConc.toFixed(3),
              'pH': stats.ph.toFixed(3),
              'pOH': stats.poh.toFixed(3),
              '[H+] (M)': stats.h.toExponential(3),
              '[OH-] (M)': stats.oh.toExponential(3),
              'pKa': stats.pka.toFixed(2),
              'التأيّن %': stats.ionisation.toFixed(2),
              'الحجم المضاف (mL)': addedVolume.toFixed(2),
              'حجم التكافؤ (mL)': stats.equivalenceVolume.toFixed(2),
              'السعة التنظيمية': stats.bufferCapacity.toFixed(4),
            })
          }
        />
      }
    />
  );
};

export default AcidsBases3D;
