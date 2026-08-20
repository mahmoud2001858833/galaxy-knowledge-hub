import { Suspense, lazy, useMemo, useState } from 'react';
import { Flame, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  MATERIALS,
  ThermoMode,
  GasProcess,
  computeThermo,
  processCurve,
  speedDistribution,
  efficiencySweep,
  thicknessSweep,
} from '@/lib/sim-physics/thermo';

const ThermoScene3D = lazy(() =>
  import('@/components/simulations3d/thermo/ThermoScene3D').then((m) => ({ default: m.ThermoScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'عند ثبات الحجم وزيادة درجة الحرارة المطلقة للضعف، فإن ضغط الغاز المثالي:',
    options: ['ينصف', 'يتضاعف', 'لا يتغيّر', 'يصبح 4 أضعاف'],
    correctIndex: 1,
    explanation: 'من PV = nRT وبثبات V و n فإن P ∝ T.',
  },
  {
    question: 'الطاقة الحركية المتوسطة لجزيء غاز مثالي تتناسب مع:',
    options: ['الضغط', 'الحجم', 'درجة الحرارة المطلقة', 'الكتلة المولية'],
    correctIndex: 2,
    explanation: 'E_k = (3/2) k_B T — الحرارة مقياس مباشر للطاقة الحركية المتوسطة.',
  },
  {
    question: 'كفاءة محرك كارنو تُعطى بالعلاقة:',
    options: ['η = T_c / T_h', 'η = 1 − T_c / T_h', 'η = W / T_h', 'η = Q_c / Q_h'],
    correctIndex: 1,
    explanation: 'وهي الحد الأعلى النظري لأي محرك حراري يعمل بين الخزانين.',
  },
  {
    question: 'لماذا لا يمكن أن تصل كفاءة أي محرك حراري إلى 100%؟',
    options: [
      'بسبب الاحتكاك فقط',
      'لأن القانون الثاني يمنع تحويل كل الحرارة إلى شغل دون طرح حرارة',
      'لأن الوقود محدود',
      'لأن المحرك يسخن',
    ],
    correctIndex: 1,
    explanation: 'يتطلب ذلك T_c = 0 K وهو مستحيل عملياً (القانون الثالث والثاني معاً).',
  },
  {
    question: 'انتقال الحرارة بالتوصيل خلال جدار يتناسب عكسياً مع:',
    options: ['فرق الحرارة', 'المساحة', 'سماكة الجدار', 'الموصلية k'],
    correctIndex: 2,
    explanation: 'Q̇ = k·A·ΔT / d — مضاعفة السماكة تنصف معدّل التوصيل.',
  },
  {
    question: 'الإشعاع الحراري يتناسب مع:',
    options: ['T', 'T²', 'T³', 'T⁴'],
    correctIndex: 3,
    explanation: 'قانون ستيفان–بولتزمان: Q̇ = εσA(T_h⁴ − T_c⁴).',
  },
];

const MODE_LABEL: Record<ThermoMode, string> = {
  'ideal-gas': 'الغاز المثالي',
  carnot: 'محرك كارنو',
  'heat-transfer': 'انتقال الحرارة',
};

const PROCESS_LABEL: Record<GasProcess, string> = {
  isothermal: 'أيزوثيرمي (T ثابتة)',
  isobaric: 'أيزوباري (P ثابت)',
  isochoric: 'أيزوكوري (V ثابت)',
  adiabatic: 'أديباتي (لا تبادل حراري)',
};

const Thermodynamics3D = () => {
  const [mode, setMode] = useState<ThermoMode>('ideal-gas');
  const [process, setProcess] = useState<GasProcess>('isothermal');
  const [moles, setMoles] = useState(1);
  const [temperature, setTemperature] = useState(300);
  const [volume, setVolume] = useState(30);
  const [gamma, setGamma] = useState(1.4);
  const [tHot, setTHot] = useState(800);
  const [tCold, setTCold] = useState(300);
  const [qHot, setQHot] = useState(1000);
  const [materialKey, setMaterialKey] = useState('brick');
  const [area, setArea] = useState(2);
  const [thickness, setThickness] = useState(0.2);
  const [surfaceHot, setSurfaceHot] = useState(350);
  const [surfaceCold, setSurfaceCold] = useState(290);
  const [hConv, setHConv] = useState(10);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);

  const params = useMemo(
    () => ({
      mode,
      process,
      moles,
      temperature,
      volume,
      gamma,
      tHot,
      tCold,
      qHot,
      materialKey,
      area,
      thickness,
      surfaceHot,
      surfaceCold,
      hConv,
    }),
    [
      mode,
      process,
      moles,
      temperature,
      volume,
      gamma,
      tHot,
      tCold,
      qHot,
      materialKey,
      area,
      thickness,
      surfaceHot,
      surfaceCold,
      hConv,
    ]
  );

  const stats = useMemo(() => computeThermo(params), [params]);
  const pv = useMemo(() => processCurve(params), [params]);
  const maxwell = useMemo(() => speedDistribution(temperature), [temperature]);
  const effSweep = useMemo(() => efficiencySweep(params), [params]);
  const thickSweep = useMemo(() => thicknessSweep(params), [params]);

  const { entries, record, clear } = useSimNotebook('thermo-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round(35 + Math.random() * 45));
  const challengeError = challenge === null ? null : Math.abs(stats.efficiency * 100 - challenge);

  const hudReadings =
    mode === 'ideal-gas'
      ? [
          { label: 'الضغط P', value: stats.pressureAtm.toFixed(2), unit: 'atm', tone: 'primary' as const },
          { label: 'الحرارة T', value: temperature.toFixed(0), unit: 'K', tone: 'warning' as const },
          { label: 'الحجم V', value: volume.toFixed(1), unit: 'لتر' },
          { label: 'v_rms', value: stats.vRms.toFixed(0), unit: 'م/ث', tone: 'success' as const },
          { label: 'الطاقة الداخلية', value: (stats.internalEnergy / 1000).toFixed(2), unit: 'kJ' },
          { label: 'عدد المولات', value: moles.toFixed(2), unit: 'mol' },
        ]
      : mode === 'carnot'
      ? [
          { label: 'الكفاءة η', value: (stats.efficiency * 100).toFixed(1), unit: '%', tone: 'success' as const },
          { label: 'الشغل W', value: stats.work.toFixed(0), unit: 'J', tone: 'primary' as const },
          { label: 'Q_ساخن', value: qHot.toFixed(0), unit: 'J', tone: 'warning' as const },
          { label: 'Q_بارد', value: stats.qCold.toFixed(0), unit: 'J' },
          { label: 'معامل الأداء', value: stats.cop.toFixed(2), unit: 'COP' },
          { label: 'ΔS الخزان', value: stats.entropyHot.toFixed(2), unit: 'J/K' },
        ]
      : [
          { label: 'التوصيل', value: stats.conduction.toFixed(0), unit: 'W', tone: 'warning' as const },
          { label: 'الحمل', value: stats.convection.toFixed(0), unit: 'W', tone: 'primary' as const },
          { label: 'الإشعاع', value: stats.radiation.toFixed(0), unit: 'W' },
          { label: 'الإجمالي', value: stats.totalFlux.toFixed(0), unit: 'W', tone: 'success' as const },
          { label: 'المقاومة R', value: stats.rValue.toFixed(3), unit: 'm²K/W' },
          { label: 'ΔT', value: (surfaceHot - surfaceCold).toFixed(0), unit: 'K' },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 7, 14]} environment="warehouse">
        <Suspense fallback={null}>
          <ThermoScene3D
            mode={mode}
            stats={stats}
            temperature={temperature}
            volume={volume}
            tHot={tHot}
            tCold={tCold}
            materialKey={materialKey}
            thickness={thickness}
            surfaceHot={surfaceHot}
            surfaceCold={surfaceCold}
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

  const controls = (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">لوحة التحكّم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as ThermoMode)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ideal-gas" className="text-xs">غاز مثالي</TabsTrigger>
              <TabsTrigger value="carnot" className="text-xs">كارنو</TabsTrigger>
              <TabsTrigger value="heat-transfer" className="text-xs">انتقال الحرارة</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button variant="outline" onClick={reset} title="إعادة">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {mode === 'ideal-gas' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">العملية الديناميكية</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PROCESS_LABEL) as GasProcess[]).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={process === p ? 'default' : 'outline'}
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => setProcess(p)}
                    >
                      {PROCESS_LABEL[p].split(' ')[0]}
                    </Button>
                  ))}
                </div>
                <p className="text-[0.7rem] text-muted-foreground">{PROCESS_LABEL[process]}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>درجة الحرارة T</span>
                  <span className="font-mono text-primary">{temperature} K</span>
                </Label>
                <Slider value={[temperature]} min={50} max={1000} step={5} onValueChange={([v]) => setTemperature(v)} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الحجم V</span>
                  <span className="font-mono text-primary">{volume.toFixed(1)} لتر</span>
                </Label>
                <Slider value={[volume]} min={5} max={60} step={0.5} onValueChange={([v]) => setVolume(v)} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>عدد المولات n</span>
                  <span className="font-mono text-primary">{moles.toFixed(2)} mol</span>
                </Label>
                <Slider value={[moles]} min={0.1} max={5} step={0.05} onValueChange={([v]) => setMoles(v)} />
              </div>

              {process === 'adiabatic' && (
                <div className="space-y-2">
                  <Label className="flex justify-between text-xs">
                    <span>معامل γ</span>
                    <span className="font-mono text-primary">{gamma.toFixed(2)}</span>
                  </Label>
                  <Slider value={[gamma]} min={1.1} max={1.7} step={0.01} onValueChange={([v]) => setGamma(v)} />
                </div>
              )}
            </>
          )}

          {mode === 'carnot' && (
            <>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الخزان الساخن T_h</span>
                  <span className="font-mono text-primary">{tHot} K</span>
                </Label>
                <Slider
                  value={[tHot]}
                  min={310}
                  max={1500}
                  step={10}
                  onValueChange={([v]) => setTHot(Math.max(v, tCold + 10))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الخزان البارد T_c</span>
                  <span className="font-mono text-primary">{tCold} K</span>
                </Label>
                <Slider
                  value={[tCold]}
                  min={100}
                  max={700}
                  step={5}
                  onValueChange={([v]) => setTCold(Math.min(v, tHot - 10))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الحرارة الممتصّة Q_h</span>
                  <span className="font-mono text-primary">{qHot} J</span>
                </Label>
                <Slider value={[qHot]} min={100} max={5000} step={50} onValueChange={([v]) => setQHot(v)} />
              </div>
            </>
          )}

          {mode === 'heat-transfer' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">مادة الجدار</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MATERIALS.map((m) => (
                    <Button
                      key={m.key}
                      size="sm"
                      variant={materialKey === m.key ? 'default' : 'outline'}
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => setMaterialKey(m.key)}
                    >
                      {m.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>السماكة d</span>
                  <span className="font-mono text-primary">{thickness.toFixed(2)} م</span>
                </Label>
                <Slider value={[thickness]} min={0.01} max={0.5} step={0.01} onValueChange={([v]) => setThickness(v)} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>المساحة A</span>
                  <span className="font-mono text-primary">{area.toFixed(1)} م²</span>
                </Label>
                <Slider value={[area]} min={0.2} max={20} step={0.2} onValueChange={([v]) => setArea(v)} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الوجه الساخن</span>
                  <span className="font-mono text-primary">{surfaceHot} K</span>
                </Label>
                <Slider
                  value={[surfaceHot]}
                  min={300}
                  max={900}
                  step={5}
                  onValueChange={([v]) => setSurfaceHot(Math.max(v, surfaceCold + 5))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>الوجه البارد</span>
                  <span className="font-mono text-primary">{surfaceCold} K</span>
                </Label>
                <Slider
                  value={[surfaceCold]}
                  min={200}
                  max={500}
                  step={5}
                  onValueChange={([v]) => setSurfaceCold(Math.min(v, surfaceHot - 5))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>معامل الحمل h</span>
                  <span className="font-mono text-primary">{hConv} W/m²K</span>
                </Label>
                <Slider value={[hConv]} min={1} max={100} step={1} onValueChange={([v]) => setHConv(v)} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>سرعة العرض</span>
              <span className="font-mono text-primary">{timeScale}×</span>
            </Label>
            <Slider value={[timeScale]} min={0.1} max={3} step={0.1} onValueChange={([v]) => setTimeScale(v)} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">إظهار المؤشرات</Label>
            <Switch checked={showVectors} onCheckedChange={setShowVectors} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">النتائج المحسوبة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-center">
          {(mode === 'ideal-gas'
            ? [
                { l: 'الضغط', v: `${(stats.pressure / 1000).toFixed(1)} kPa` },
                { l: 'الضغط بالجو', v: `${stats.pressureAtm.toFixed(2)} atm` },
                { l: 'سرعة v_rms', v: `${stats.vRms.toFixed(0)} م/ث` },
                { l: 'طاقة الجزيء', v: `${(stats.kineticPerMolecule * 1e21).toFixed(2)} zJ` },
                { l: 'الطاقة الداخلية', v: `${(stats.internalEnergy / 1000).toFixed(2)} kJ` },
                { l: 'التركيز', v: `${stats.density.toFixed(3)} mol/L` },
              ]
            : mode === 'carnot'
            ? [
                { l: 'الكفاءة', v: `${(stats.efficiency * 100).toFixed(1)} %` },
                { l: 'الشغل الناتج', v: `${stats.work.toFixed(0)} J` },
                { l: 'الحرارة المطروحة', v: `${stats.qCold.toFixed(0)} J` },
                { l: 'معامل الأداء', v: stats.cop.toFixed(2) },
                { l: 'ΔS الساخن', v: `${stats.entropyHot.toFixed(2)} J/K` },
                { l: 'فرق الحرارة', v: `${(tHot - tCold).toFixed(0)} K` },
              ]
            : [
                { l: 'التوصيل', v: `${stats.conduction.toFixed(1)} W` },
                { l: 'الحمل', v: `${stats.convection.toFixed(1)} W` },
                { l: 'الإشعاع', v: `${stats.radiation.toFixed(1)} W` },
                { l: 'الإجمالي', v: `${stats.totalFlux.toFixed(1)} W` },
                { l: 'المقاومة R', v: `${stats.rValue.toFixed(3)} m²K/W` },
                { l: 'الفيض/م²', v: `${(stats.totalFlux / Math.max(area, 0.01)).toFixed(1)} W/m²` },
              ]
          ).map((r) => (
            <div key={r.l} className="rounded-lg bg-muted/40 p-2">
              <div className="text-[0.7rem] text-muted-foreground">{r.l}</div>
              <div className="font-mono text-sm font-bold">{r.v}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  const explanation = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الأساس العلمي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          الديناميكا الحرارية تربط بين الحرارة والشغل والطاقة الداخلية. على المستوى المجهري، درجة الحرارة
          ليست سوى مقياس لمتوسط الطاقة الحركية للجزيئات، والضغط ينشأ من تصادماتها المستمرة بجدران الإناء.
          أمّا على المستوى العملي فيحدّ القانون الثاني من كفاءة أي محرك حراري بحدّ كارنو.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { t: 'قانون الغاز المثالي', f: 'P V = n R T' },
            { t: 'الطاقة الحركية', f: 'E_k = (3/2) k_B T' },
            { t: 'السرعة الجذرية', f: 'v_rms = √(3RT/M)' },
            { t: 'كفاءة كارنو', f: 'η = 1 − T_c / T_h' },
            { t: 'التوصيل', f: 'Q̇ = k A ΔT / d' },
            { t: 'الإشعاع', f: 'Q̇ = ε σ A (T_h⁴ − T_c⁴)' },
          ].map((e) => (
            <div key={e.t} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="mb-1 text-xs font-bold text-foreground">{e.t}</div>
              <div className="font-mono text-xs" dir="ltr">
                {e.f}
              </div>
            </div>
          ))}
        </div>
        <p>
          لاحظ في المشهد: رفع الحرارة يسرّع الجزيئات ويغيّر لونها نحو الأحمر، وخفض الحجم بالمكبس يزيد
          معدّل التصادم فيرتفع الضغط. وفي نمط انتقال الحرارة، استبدال الطوب بعازل الفوم يخفض التوصيل عشرات
          المرّات — وهو جوهر العزل الحراري في المباني.
        </p>
      </CardContent>
    </Card>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'carnot'
              ? 'الكفاءة مقابل حرارة الخزان الساخن'
              : mode === 'heat-transfer'
              ? 'التوصيل مقابل السماكة'
              : 'منحنى P–V للعملية'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'carnot' ? (
              <LineChart data={effSweep} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="tHot" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="الكفاءة %" stroke="#22c55e" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="الشغل (J)" stroke="#f97316" dot={false} strokeWidth={2} />
              </LineChart>
            ) : mode === 'heat-transfer' ? (
              <LineChart data={thickSweep} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="thickness" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="التوصيل (W)" stroke="#f97316" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="المقاومة R" stroke="#38bdf8" dot={false} strokeWidth={2} />
              </LineChart>
            ) : (
              <LineChart data={pv} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="volume" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="الضغط (kPa)" stroke="#38bdf8" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="الحرارة (K)" stroke="#ef4444" dot={false} strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">توزيع ماكسويل–بولتزمان للسرعات عند {temperature} K</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={maxwell} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="speed" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="التوزيع" stroke="#a855f7" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط كفاءة المحرك
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          انتقل إلى نمط «كارنو» واضبط حرارتَي الخزانين للوصول إلى الكفاءة المطلوبة بفارق أقل من 1.5%.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تحدٍّ جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span>الكفاءة المطلوبة</span>
              <Badge variant="secondary" className="font-mono">{challenge}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>كفاءتك الحالية</span>
              <span className="font-mono font-bold">{(stats.efficiency * 100).toFixed(1)}%</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 1.5
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 1.5
                ? `ممتاز! الفارق ${challengeError?.toFixed(2)}% فقط.`
                : `الفارق ${challengeError?.toFixed(2)}% — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الديناميكا الحرارية ثلاثية الأبعاد"
      subtitle="Thermodynamics 3D — الغاز المثالي، محرك كارنو، وانتقال الحرارة"
      icon={<Flame className="h-8 w-8 text-primary" />}
      objectives={[
        'ربط المشاهدة المجهرية لحركة الجزيئات بالمتغيّرات العيانية P و V و T',
        'تطبيق PV = nRT وتمييز العمليات الأيزوثيرمية والأديباتية',
        'حساب كفاءة كارنو وتفسير حدود القانون الثاني',
        'مقارنة التوصيل والحمل والإشعاع كمياً واختيار العازل الأنسب',
      ]}
      concepts={['الغاز المثالي', 'الطاقة الداخلية', 'الإنتروبيا', 'كفاءة كارنو', 'التوصيل الحراري', 'ستيفان–بولتزمان']}
      steps={[
        'في نمط «غاز مثالي»: ارفع الحرارة وراقب تسارع الجزيئات وتغيّر لونها وارتفاع الضغط.',
        'ثبّت الحرارة وحرّك الحجم — تحقّق من قانون بويل P·V = ثابت.',
        'اختر العملية الأديباتية وقارن منحنى P–V بالأيزوثيرمي.',
        'انتقل إلى «كارنو»: ارفع T_h وراقب تسارع الدولاب وزيادة الشغل.',
        'اخفض T_c وسجّل الكفاءة، ثم استنتج لماذا يستحيل بلوغ 100%.',
        'في «انتقال الحرارة» بدّل بين النحاس والفوم بنفس السماكة وقارن الفيض الحراري.',
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
          fileName="thermodynamics-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'العملية': PROCESS_LABEL[process],
              'T (K)': temperature.toFixed(0),
              'V (لتر)': volume.toFixed(1),
              'P (kPa)': (stats.pressure / 1000).toFixed(2),
              'v_rms': stats.vRms.toFixed(0),
              'η %': (stats.efficiency * 100).toFixed(1),
              'W (J)': stats.work.toFixed(0),
              'التوصيل (W)': stats.conduction.toFixed(1),
              'الإجمالي (W)': stats.totalFlux.toFixed(1),
            })
          }
        />
      }
    />
  );
};

export default Thermodynamics3D;
