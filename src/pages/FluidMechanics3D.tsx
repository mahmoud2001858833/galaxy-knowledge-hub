import { Suspense, lazy, useMemo, useState } from 'react';
import { Droplets, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  FLUIDS,
  SOLIDS,
  FluidMode,
  computeFluid,
  densitySweep,
  depthSweep,
  venturiProfile,
} from '@/lib/sim-physics/fluids';

const FluidScene3D = lazy(() =>
  import('@/components/simulations3d/fluids/FluidScene3D').then((m) => ({ default: m.FluidScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'قوة الطفو على جسم مغمور تساوي:',
    options: ['وزن الجسم', 'وزن السائل المُزاح', 'كتلة الجسم × الحجم', 'الضغط الجوي × المساحة'],
    correctIndex: 1,
    explanation: 'مبدأ أرخميدس: F_b = ρ_سائل · g · V_مغمور = وزن السائل المُزاح.',
  },
  {
    question: 'جسم كثافته 800 kg/m³ في ماء كثافته 1000 kg/m³ سيغمر منه:',
    options: ['20%', '80%', '100%', 'لا يطفو'],
    correctIndex: 1,
    explanation: 'الجزء المغمور = ρ_جسم / ρ_سائل = 0.8 أي 80%.',
  },
  {
    question: 'الضغط المقياسي داخل سائل يعتمد على:',
    options: ['شكل الإناء', 'مساحة القاعدة', 'العمق وكثافة السائل', 'حجم السائل الكلي'],
    correctIndex: 2,
    explanation: 'P = ρgh فقط — وهذه «مفارقة الهيدروستاتيك»: الشكل والحجم لا يؤثران.',
  },
  {
    question: 'في أنبوب فنتوري، عند ضيق المقطع فإن:',
    options: [
      'السرعة تقل والضغط يزيد',
      'السرعة تزيد والضغط يقل',
      'كلاهما يزيد',
      'لا يتغيّر شيء',
    ],
    correctIndex: 1,
    explanation: 'الاستمرارية A₁v₁=A₂v₂ ترفع السرعة، ومعادلة برنولي تخفض الضغط الساكن مقابلها.',
  },
  {
    question: 'معادلة الاستمرارية للسائل غير الانضغاطي هي:',
    options: ['P₁ = P₂', 'A₁v₁ = A₂v₂', 'ρ₁ = ρ₂', 'F₁ = F₂'],
    correctIndex: 1,
    explanation: 'معدّل التدفق الحجمي Q = A·v ثابت على طول الأنبوب.',
  },
  {
    question: 'رقم رينولدز أكبر من 4000 يعني أن الجريان:',
    options: ['صفائحي', 'ساكن', 'مضطرب', 'انتقالي'],
    correctIndex: 2,
    explanation: 'Re > 4000 يدل على جريان مضطرب تسوده الدوامات.',
  },
];

const MODE_LABEL: Record<FluidMode, string> = {
  archimedes: 'الطفو (أرخميدس)',
  pressure: 'الضغط والعمق',
  bernoulli: 'برنولي وفنتوري',
};

const FluidMechanics3D = () => {
  const [mode, setMode] = useState<FluidMode>('archimedes');
  const [fluidKey, setFluidKey] = useState('water');
  const [solidKey, setSolidKey] = useState('wood');
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [objectDensity, setObjectDensity] = useState(700);
  const [side, setSide] = useState(0.25);
  const [depth, setDepth] = useState(10);
  const [inletRadius, setInletRadius] = useState(6);
  const [throatRadius, setThroatRadius] = useState(2.5);
  const [flowRate, setFlowRate] = useState(8);
  const [heightDrop, setHeightDrop] = useState(0);

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
      fluidDensity,
      objectDensity,
      side,
      depth,
      inletRadius,
      throatRadius,
      flowRate,
      heightDrop,
    }),
    [mode, fluidDensity, objectDensity, side, depth, inletRadius, throatRadius, flowRate, heightDrop]
  );

  const stats = useMemo(() => computeFluid(params), [params]);
  const sweepDensity = useMemo(() => densitySweep(params), [params]);
  const sweepDepth = useMemo(() => depthSweep(params), [params]);
  const profile = useMemo(() => venturiProfile(params), [params]);

  const fluid = FLUIDS.find((f) => f.key === fluidKey) ?? FLUIDS[0];
  const solid = SOLIDS.find((s) => s.key === solidKey) ?? SOLIDS[1];

  const { entries, record, clear } = useSimNotebook('fluids-3d');

  const pickFluid = (k: string) => {
    const f = FLUIDS.find((x) => x.key === k);
    if (!f) return;
    setFluidKey(k);
    setFluidDensity(f.density);
  };
  const pickSolid = (k: string) => {
    const s = SOLIDS.find((x) => x.key === k);
    if (!s) return;
    setSolidKey(k);
    setObjectDensity(s.density);
  };

  const reset = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const newChallenge = () => setChallenge(Math.round(25 + Math.random() * 60));
  const challengeError =
    challenge === null ? null : Math.abs(stats.submergedFraction * 100 - challenge);

  const hudReadings =
    mode === 'archimedes'
      ? [
          { label: 'الوزن W', value: stats.weight.toFixed(2), unit: 'N', tone: 'warning' as const },
          { label: 'قوة الطفو F_b', value: stats.buoyancy.toFixed(2), unit: 'N', tone: 'success' as const },
          { label: 'المحصّلة', value: stats.netForce.toFixed(2), unit: 'N' },
          { label: 'الجزء المغمور', value: (stats.submergedFraction * 100).toFixed(1), unit: '%', tone: 'primary' as const },
          { label: 'الحجم V', value: stats.volume.toFixed(4), unit: 'م³' },
          { label: 'الوزن الظاهري', value: stats.apparentWeight.toFixed(2), unit: 'N' },
        ]
      : mode === 'pressure'
      ? [
          { label: 'العمق h', value: depth.toFixed(1), unit: 'م' },
          { label: 'ضغط مقياسي', value: (stats.gaugePressure / 1000).toFixed(1), unit: 'kPa', tone: 'primary' as const },
          { label: 'ضغط مطلق', value: (stats.absolutePressure / 1000).toFixed(1), unit: 'kPa' },
          { label: 'بالجو', value: stats.pressureAtm.toFixed(2), unit: 'atm', tone: 'warning' as const },
          { label: 'عمود ماء مكافئ', value: stats.waterColumn.toFixed(1), unit: 'م' },
        ]
      : [
          { label: 'v₁ (المدخل)', value: stats.vIn.toFixed(2), unit: 'م/ث', tone: 'success' as const },
          { label: 'v₂ (الحلق)', value: stats.vThroat.toFixed(2), unit: 'م/ث', tone: 'warning' as const },
          { label: 'فرق الضغط', value: (stats.pressureDrop / 1000).toFixed(2), unit: 'kPa', tone: 'primary' as const },
          { label: 'A₁', value: (stats.areaIn * 1e4).toFixed(1), unit: 'سم²' },
          { label: 'A₂', value: (stats.areaThroat * 1e4).toFixed(1), unit: 'سم²' },
          { label: 'Re', value: stats.reynolds.toFixed(0), unit: stats.regime },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 7, 14]} environment="city">
        <Suspense fallback={null}>
          <FluidScene3D
            mode={mode}
            stats={stats}
            fluidColor={fluid.color}
            objectColor={solid.color}
            side={side}
            depth={depth}
            inletRadius={inletRadius}
            throatRadius={throatRadius}
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
          <Tabs value={mode} onValueChange={(v) => setMode(v as FluidMode)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="archimedes" className="text-xs">الطفو</TabsTrigger>
              <TabsTrigger value="pressure" className="text-xs">الضغط</TabsTrigger>
              <TabsTrigger value="bernoulli" className="text-xs">برنولي</TabsTrigger>
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

          <div className="space-y-2">
            <Label className="text-xs">السائل</Label>
            <div className="flex flex-wrap gap-1.5">
              {FLUIDS.map((f) => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={fluidKey === f.key ? 'default' : 'outline'}
                  className="h-7 px-2 text-[0.7rem]"
                  onClick={() => pickFluid(f.key)}
                >
                  {f.name}
                </Button>
              ))}
            </div>
            <Label className="flex justify-between text-xs">
              <span>كثافة السائل ρ</span>
              <span className="font-mono text-primary">{fluidDensity} kg/m³</span>
            </Label>
            <Slider
              value={[fluidDensity]}
              min={500}
              max={13600}
              step={10}
              onValueChange={([v]) => setFluidDensity(v)}
            />
          </div>

          {mode === 'archimedes' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">مادة الجسم</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SOLIDS.map((s) => (
                    <Button
                      key={s.key}
                      size="sm"
                      variant={solidKey === s.key ? 'default' : 'outline'}
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => pickSolid(s.key)}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
                <Label className="flex justify-between text-xs">
                  <span>كثافة الجسم</span>
                  <span className="font-mono text-primary">{objectDensity} kg/m³</span>
                </Label>
                <Slider
                  value={[objectDensity]}
                  min={100}
                  max={9000}
                  step={10}
                  onValueChange={([v]) => setObjectDensity(v)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>طول ضلع المكعّب</span>
                  <span className="font-mono text-primary">{(side * 100).toFixed(0)} سم</span>
                </Label>
                <Slider value={[side]} min={0.05} max={0.5} step={0.01} onValueChange={([v]) => setSide(v)} />
              </div>
            </>
          )}

          {mode === 'pressure' && (
            <div className="space-y-2">
              <Label className="flex justify-between text-xs">
                <span>عمق نقطة القياس h</span>
                <span className="font-mono text-primary">{depth.toFixed(1)} م</span>
              </Label>
              <Slider value={[depth]} min={0} max={50} step={0.5} onValueChange={([v]) => setDepth(v)} />
              <p className="text-[0.7rem] text-muted-foreground">
                الضغط لا يعتمد على شكل الإناء ولا على حجم السائل — فقط على العمق والكثافة.
              </p>
            </div>
          )}

          {mode === 'bernoulli' && (
            <>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>نصف قطر المدخل</span>
                  <span className="font-mono text-primary">{inletRadius.toFixed(1)} سم</span>
                </Label>
                <Slider
                  value={[inletRadius]}
                  min={3}
                  max={12}
                  step={0.5}
                  onValueChange={([v]) => setInletRadius(Math.max(v, throatRadius + 0.5))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>نصف قطر الحلق</span>
                  <span className="font-mono text-primary">{throatRadius.toFixed(1)} سم</span>
                </Label>
                <Slider
                  value={[throatRadius]}
                  min={0.8}
                  max={10}
                  step={0.1}
                  onValueChange={([v]) => setThroatRadius(Math.min(v, inletRadius - 0.5))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>معدّل التدفق Q</span>
                  <span className="font-mono text-primary">{flowRate.toFixed(1)} لتر/ث</span>
                </Label>
                <Slider value={[flowRate]} min={0.5} max={40} step={0.5} onValueChange={([v]) => setFlowRate(v)} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>فرق الارتفاع Δh</span>
                  <span className="font-mono text-primary">{heightDrop.toFixed(1)} م</span>
                </Label>
                <Slider value={[heightDrop]} min={-5} max={5} step={0.1} onValueChange={([v]) => setHeightDrop(v)} />
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
            <Label className="text-xs">إظهار المتجهات</Label>
            <Switch checked={showVectors} onCheckedChange={setShowVectors} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">النتائج المحسوبة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-center">
          {(mode === 'archimedes'
            ? [
                { l: 'كتلة الجسم', v: `${stats.mass.toFixed(2)} كغم` },
                { l: 'الوزن', v: `${stats.weight.toFixed(2)} N` },
                { l: 'قوة الطفو', v: `${stats.buoyancy.toFixed(2)} N` },
                { l: 'حجم مُزاح', v: `${(stats.submergedVolume * 1000).toFixed(2)} لتر` },
                { l: 'الجزء المغمور', v: `${(stats.submergedFraction * 100).toFixed(1)} %` },
                { l: 'الحالة', v: stats.floats ? 'يطفو' : 'يغوص' },
              ]
            : mode === 'pressure'
            ? [
                { l: 'ضغط مقياسي', v: `${(stats.gaugePressure / 1000).toFixed(2)} kPa` },
                { l: 'ضغط مطلق', v: `${(stats.absolutePressure / 1000).toFixed(2)} kPa` },
                { l: 'بالجو', v: `${stats.pressureAtm.toFixed(2)} atm` },
                { l: 'عمود ماء', v: `${stats.waterColumn.toFixed(1)} م` },
              ]
            : [
                { l: 'سرعة المدخل', v: `${stats.vIn.toFixed(2)} م/ث` },
                { l: 'سرعة الحلق', v: `${stats.vThroat.toFixed(2)} م/ث` },
                { l: 'ضغط ديناميكي ₁', v: `${(stats.dynamicIn / 1000).toFixed(2)} kPa` },
                { l: 'ضغط ديناميكي ₂', v: `${(stats.dynamicThroat / 1000).toFixed(2)} kPa` },
                { l: 'فرق الضغط', v: `${(stats.pressureDrop / 1000).toFixed(2)} kPa` },
                { l: 'نظام الجريان', v: stats.regime },
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
          ميكانيكا الموائع تدرس السوائل والغازات في حالتَي السكون والحركة. في السكون يتحدّد الضغط بالعمق
          والكثافة فقط، وتنشأ قوة الطفو من فرق الضغط بين أعلى الجسم وأسفله. أمّا في الحركة فتحكم معادلة
          الاستمرارية توزيع السرعات، وتربط معادلة برنولي بين الضغط والسرعة والارتفاع كصيغة لحفظ الطاقة.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { t: 'مبدأ أرخميدس', f: 'F_b = ρ_f · g · V_sub' },
            { t: 'شرط الطفو', f: 'V_sub / V = ρ_obj / ρ_f' },
            { t: 'الضغط الهيدروستاتيكي', f: 'P = P₀ + ρ g h' },
            { t: 'الاستمرارية', f: 'A₁ v₁ = A₂ v₂ = Q' },
            { t: 'برنولي', f: 'P + ½ρv² + ρgh = ثابت' },
            { t: 'رينولدز', f: 'Re = ρ v D / μ' },
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
          تطبيقات مباشرة: تصميم السفن والغوّاصات (الطفو)، السدود والخزّانات (الضغط مع العمق)، مقاييس
          فنتوري وبخّاخات الوقود وأجنحة الطائرات (برنولي).
        </p>
      </CardContent>
    </Card>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الطفو مقابل كثافة الجسم</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sweepDensity} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="density" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="جزء مغمور %" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="قوة الطفو (N)" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="الوزن (N)" stroke="#ef4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {mode === 'bernoulli' ? 'السرعة والضغط على طول الأنبوب' : 'الضغط مقابل العمق'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'bernoulli' ? (
              <LineChart data={profile} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="السرعة (م/ث)" stroke="#f97316" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="الضغط النسبي (kPa)" stroke="#38bdf8" dot={false} strokeWidth={2} />
              </LineChart>
            ) : (
              <LineChart data={sweepDepth} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="depth" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <RLine type="monotone" dataKey="ضغط مقياسي (kPa)" stroke="#38bdf8" dot={false} strokeWidth={2} />
                <RLine type="monotone" dataKey="ضغط مطلق (kPa)" stroke="#a855f7" dot={false} strokeWidth={2} />
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
          تحدّي: اضبط نسبة الغمر
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          سيطلب منك النظام نسبة غمر محدّدة. اختر السائل والمادة أو اضبط الكثافات للوصول إليها بفارق أقل من 2%.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تحدٍّ جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span>النسبة المطلوبة</span>
              <Badge variant="secondary" className="font-mono">{challenge}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>نسبتك الحالية</span>
              <span className="font-mono font-bold">{(stats.submergedFraction * 100).toFixed(1)}%</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 2
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 2
                ? `أحسنت! الفارق ${challengeError?.toFixed(1)}% فقط.`
                : `الفارق ${challengeError?.toFixed(1)}% — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="ميكانيكا الموائع ثلاثية الأبعاد"
      subtitle="Fluid Mechanics 3D — الطفو، الضغط الهيدروستاتيكي، وبرنولي/فنتوري"
      icon={<Droplets className="h-8 w-8 text-primary" />}
      objectives={[
        'تطبيق مبدأ أرخميدس لتحديد الطفو ونسبة الغمر',
        'استنتاج علاقة الضغط بالعمق والكثافة P = ρgh',
        'ربط معادلة الاستمرارية بمعادلة برنولي في أنبوب فنتوري',
        'تمييز الجريان الصفائحي عن المضطرب عبر رقم رينولدز',
      ]}
      concepts={['قوة الطفو', 'الكثافة', 'الضغط الهيدروستاتيكي', 'الاستمرارية', 'برنولي', 'رقم رينولدز']}
      steps={[
        'ابدأ بنمط «الطفو»: اختر ماء وخشب، ولاحظ نسبة الغمر ومتجهَي الوزن والطفو.',
        'بدّل السائل إلى زئبق ولاحظ طفو الحديد — الكثافة النسبية هي الفيصل.',
        'غيّر ضلع المكعّب: الوزن وقوة الطفو يتغيّران معاً بينما نسبة الغمر ثابتة.',
        'انتقل إلى نمط «الضغط» وحرّك المسبار للعمق، وسجّل الضغط كل 10 أمتار.',
        'في نمط «برنولي» صغّر نصف قطر الحلق وراقب تسارع الجسيمات وهبوط الضغط.',
        'سجّل قراءاتك في الدفتر وصدّرها CSV لرسم العلاقات وتحليلها.',
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
          fileName="fluid-mechanics-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'ρ_سائل': fluidDensity.toFixed(0),
              'ρ_جسم': objectDensity.toFixed(0),
              'الضلع (م)': side.toFixed(2),
              'F_b (N)': stats.buoyancy.toFixed(2),
              'W (N)': stats.weight.toFixed(2),
              'غمر %': (stats.submergedFraction * 100).toFixed(1),
              'h (م)': depth.toFixed(1),
              'P (kPa)': (stats.gaugePressure / 1000).toFixed(2),
              'v₂ (م/ث)': stats.vThroat.toFixed(2),
              'ΔP (kPa)': (stats.pressureDrop / 1000).toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default FluidMechanics3D;
