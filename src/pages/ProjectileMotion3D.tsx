import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { SimAICursor, SimAIProvider, type SimAIContextValue } from '@/features/sim-ai';
import { Target, Play, Pause, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  GRAVITY_PRESETS,
  ProjectileSample,
  analyticRange,
  computeStats,
  simulateTrajectory,
} from '@/lib/sim-physics/projectile';

const ProjectileScene3D = lazy(() =>
  import('@/components/simulations3d/projectile/ProjectileScene3D').then((m) => ({
    default: m.ProjectileScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'في غياب مقاومة الهواء، أي زاوية إطلاق تُعطي أكبر مدى أفقي من مستوى الأرض؟',
    options: ['30°', '45°', '60°', '75°'],
    correctIndex: 1,
    explanation: 'المدى R = v²sin(2θ)/g يبلغ أقصاه عندما sin(2θ)=1 أي θ = 45°.',
  },
  {
    question: 'ماذا يحدث للمركبة الأفقية للسرعة أثناء الطيران في الفراغ؟',
    options: ['تزداد', 'تنقص', 'تبقى ثابتة', 'تتغير عشوائياً'],
    correctIndex: 2,
    explanation: 'لا توجد قوة أفقية في الفراغ، لذلك vₓ ثابتة والتسارع يؤثر رأسياً فقط.',
  },
  {
    question: 'عند تفعيل مقاومة الهواء، كيف يتغيّر شكل المسار مقارنة بالقطع المكافئ؟',
    options: [
      'يبقى متماثلاً تماماً',
      'يصبح غير متماثل ويقصر فرع الهبوط',
      'يصبح خطاً مستقيماً',
      'يرتفع أكثر',
    ],
    correctIndex: 1,
    explanation: 'المقاومة تستهلك الطاقة، فيصبح فرع الهبوط أقصر وأكثر انحداراً — مسار غير متماثل.',
  },
  {
    question: 'إذا أطلقنا نفس الجسم على القمر (g = 1.62) بدل الأرض، فإن زمن التحليق:',
    options: ['يقلّ', 'لا يتغير', 'يزداد كثيراً', 'يصبح صفراً'],
    correctIndex: 2,
    explanation: 'زمن التحليق يتناسب عكسياً مع g، وبما أن جاذبية القمر أضعف بنحو 6 مرات يزداد الزمن.',
  },
  {
    question: 'الطاقة الميكانيكية الكلية في الفراغ خلال الطيران:',
    options: ['تزداد', 'تنقص', 'محفوظة', 'تتحول إلى حرارة'],
    correctIndex: 2,
    explanation: 'بغياب قوى غير محافظة (مثل المقاومة) تبقى طاقة الحركة + الوضع ثابتة.',
  },
];

const ProjectileMotion3D = () => {
  const [speed, setSpeed] = useState(30);
  const [angle, setAngle] = useState(45);
  const [azimuth, setAzimuth] = useState(0);
  const [height, setHeight] = useState(0);
  const [mass, setMass] = useState(1);
  const [drag, setDrag] = useState(0);
  const [planet, setPlanet] = useState('earth');

  const [playing, setPlaying] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showIdeal, setShowIdeal] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [live, setLive] = useState<ProjectileSample | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<number | null>(null);
  const [challengeResult, setChallengeResult] = useState<string | null>(null);
  const liveRef = useRef<ProjectileSample | null>(null);

  const gravity = GRAVITY_PRESETS[planet].g;

  const samples = useMemo(
    () => simulateTrajectory({ speed, angle, azimuth, height, gravity, drag, mass }),
    [speed, angle, azimuth, height, gravity, drag, mass]
  );
  const idealSamples = useMemo(
    () => simulateTrajectory({ speed, angle, azimuth, height, gravity, drag: 0, mass }),
    [speed, angle, azimuth, height, gravity, mass]
  );
  const stats = useMemo(() => computeStats(samples), [samples]);
  const ideal = useMemo(() => analyticRange(speed, angle, height, gravity), [speed, angle, height, gravity]);

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(samples.length / 120));
    return samples
      .filter((_, i) => i % step === 0)
      .map((s) => ({
        t: Number(s.t.toFixed(2)),
        الارتفاع: Number(s.y.toFixed(2)),
        المسافة: Number(Math.hypot(s.x, s.z).toFixed(2)),
        السرعة: Number(s.speed.toFixed(2)),
        'طاقة الحركة': Number(s.ke.toFixed(1)),
        'طاقة الوضع': Number(s.pe.toFixed(1)),
      }));
  }, [samples]);

  const { entries, record, clear } = useSimNotebook('projectile-3d');

  const handleTick = (s: ProjectileSample, done: boolean) => {
    liveRef.current = s;
    setLive((prev) =>
      !prev || Math.abs(prev.t - s.t) > 0.03 || done ? s : prev
    );
    if (done && playing) {
      setPlaying(false);
      if (challengeTarget !== null) {
        const err = Math.abs(stats.range - challengeTarget);
        setChallengeResult(
          err <= 2
            ? `أحسنت! أصبت الهدف بفارق ${err.toFixed(2)} م فقط.`
            : `المدى ${stats.range.toFixed(1)} م — الفارق ${err.toFixed(1)} م. عدّل الزاوية أو السرعة وحاول مجدداً.`
        );
      }
    }
  };

  const relaunch = () => {
    setResetKey((k) => k + 1);
    setPlaying(true);
    setChallengeResult(null);
  };

  const newChallenge = () => {
    setChallengeTarget(Math.round(20 + Math.random() * 80));
    setChallengeResult(null);
  };

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 6, 16]}>
        <Suspense fallback={null}>
          <ProjectileScene3D
            samples={samples}
            idealSamples={idealSamples}
            playing={playing}
            speedFactor={timeScale}
            showVectors={showVectors}
            showTrail={showTrail}
            showIdealPath={showIdeal && drag > 0}
            angle={angle}
            azimuth={azimuth}
            height={height}
            targetDistance={challengeTarget ?? undefined}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
            onTick={handleTick}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD
        title="قراءات حيّة"
        readings={[
          { label: 'الزمن', value: (live?.t ?? 0).toFixed(2), unit: 'ث', tone: 'primary' },
          { label: 'الارتفاع', value: (live?.y ?? height).toFixed(2), unit: 'م' },
          { label: 'المسافة', value: Math.hypot(live?.x ?? 0, live?.z ?? 0).toFixed(2), unit: 'م' },
          { label: 'السرعة', value: (live?.speed ?? speed).toFixed(2), unit: 'م/ث', tone: 'success' },
          { label: 'ط. الحركة', value: (live?.ke ?? 0).toFixed(1), unit: 'J' },
          { label: 'ط. الوضع', value: (live?.pe ?? 0).toFixed(1), unit: 'J', tone: 'warning' },
        ]}
      />
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
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'إيقاف' : 'إطلاق'}
            </Button>
            <Button variant="outline" onClick={relaunch} title="إعادة الإطلاق">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>السرعة الابتدائية</span>
              <span className="font-mono text-primary">{speed} م/ث</span>
            </Label>
            <Slider value={[speed]} min={5} max={90} step={1} onValueChange={([v]) => setSpeed(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>زاوية الإطلاق</span>
              <span className="font-mono text-primary">{angle}°</span>
            </Label>
            <Slider value={[angle]} min={5} max={85} step={1} onValueChange={([v]) => setAngle(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>الاتجاه الأفقي (ثلاثي الأبعاد)</span>
              <span className="font-mono text-primary">{azimuth}°</span>
            </Label>
            <Slider value={[azimuth]} min={-60} max={60} step={1} onValueChange={([v]) => setAzimuth(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>ارتفاع نقطة الإطلاق</span>
              <span className="font-mono text-primary">{height} م</span>
            </Label>
            <Slider value={[height]} min={0} max={40} step={1} onValueChange={([v]) => setHeight(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>كتلة الجسم</span>
              <span className="font-mono text-primary">{mass} كغم</span>
            </Label>
            <Slider value={[mass]} min={0.1} max={10} step={0.1} onValueChange={([v]) => setMass(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>مقاومة الهواء (k)</span>
              <span className="font-mono text-primary">{drag.toFixed(2)}</span>
            </Label>
            <Slider value={[drag]} min={0} max={0.6} step={0.01} onValueChange={([v]) => setDrag(v)} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">الجاذبية</Label>
            <Select value={planet} onValueChange={setPlanet}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRAVITY_PRESETS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label} — {v.g} م/ث²
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>سرعة العرض</span>
              <span className="font-mono text-primary">×{timeScale}</span>
            </Label>
            <Slider value={[timeScale]} min={0.1} max={3} step={0.1} onValueChange={([v]) => setTimeScale(v)} />
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">إظهار متجهات السرعة</Label>
              <Switch checked={showVectors} onCheckedChange={setShowVectors} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">أثر الحركة</Label>
              <Switch checked={showTrail} onCheckedChange={setShowTrail} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">المسار المثالي (بدون مقاومة)</Label>
              <Switch checked={showIdeal} onCheckedChange={setShowIdeal} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">النتائج المحسوبة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-xs">
          {[
            { l: 'المدى', v: `${stats.range.toFixed(2)} م` },
            { l: 'أقصى ارتفاع', v: `${stats.maxHeight.toFixed(2)} م` },
            { l: 'زمن التحليق', v: `${stats.flightTime.toFixed(2)} ث` },
            { l: 'سرعة الارتطام', v: `${stats.impactSpeed.toFixed(2)} م/ث` },
            { l: 'زاوية الارتطام', v: `${stats.impactAngle.toFixed(1)}°` },
            { l: 'الطاقة الابتدائية', v: `${stats.initialEnergy.toFixed(1)} J` },
            { l: 'المدى النظري', v: Number.isFinite(ideal) ? `${ideal.toFixed(2)} م` : '∞' },
            {
              l: 'أثر المقاومة',
              v: Number.isFinite(ideal) ? `${(ideal - stats.range).toFixed(2)} م` : '—',
            },
          ].map((r) => (
            <div key={r.l} className="rounded-lg bg-muted/40 p-2">
              <div className="text-muted-foreground">{r.l}</div>
              <div className="font-mono font-bold text-primary">{r.v}</div>
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
          حركة المقذوف هي تركيب لحركتين مستقلتين: حركة أفقية منتظمة (سرعة ثابتة في الفراغ) وحركة رأسية
          بتسارع ثابت مقداره <span className="font-mono text-foreground">g</span>. عند إضافة مقاومة الهواء
          يصبح التسارع <span className="font-mono text-foreground">a = −g ĵ − k·v</span> فيفقد المسار
          تماثله.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: 'الموضع', f: 'x = v₀cosθ·t ,  y = h + v₀sinθ·t − ½g t²' },
            { t: 'المدى (الفراغ)', f: 'R = v₀²·sin(2θ) / g' },
            { t: 'أقصى ارتفاع', f: 'H = h + (v₀sinθ)² / (2g)' },
          ].map((e) => (
            <div key={e.t} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="mb-1 text-xs font-bold text-foreground">{e.t}</div>
              <div dir="ltr" className="font-mono text-xs">
                {e.f}
              </div>
            </div>
          ))}
        </div>
        <p>
          الطاقة الميكانيكية محفوظة في الفراغ؛ لاحظ في الرسم البياني كيف تتحوّل طاقة الحركة إلى طاقة وضع
          ثم تعود. عند رفع معامل المقاومة ستلاحظ نقصاً في الطاقة الكلية بسبب الشغل المبذول ضد الهواء.
        </p>
      </CardContent>
    </Card>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الارتفاع والمسافة مقابل الزمن</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="الارتفاع" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="المسافة" stroke="#f59e0b" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">تحوّل الطاقة</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="طاقة الحركة" stroke="#22c55e" dot={false} strokeWidth={2} />
              <RLine type="monotone" dataKey="طاقة الوضع" stroke="#a855f7" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const challenge = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          وضع التحدي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          سيظهر هدف على أرض المشهد عند مسافة عشوائية. اضبط الزاوية والسرعة لتُصيبه بفارق لا يتجاوز مترين.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={newChallenge} className="gap-2">
            <Target className="h-4 w-4" /> تحدٍّ جديد
          </Button>
          {challengeTarget !== null && (
            <>
              <Badge variant="secondary">الهدف عند {challengeTarget} م</Badge>
              <Button variant="outline" onClick={relaunch}>
                أطلق الآن
              </Button>
            </>
          )}
        </div>
        {challengeResult && (
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{challengeResult}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="حركة المقذوفات ثلاثية الأبعاد"
      subtitle="Projectile Motion 3D — مختبر تفاعلي بمتجهات وقياسات حيّة"
      icon={<Target className="h-7 w-7 text-primary" />}
      objectives={[
        'تحليل حركة المقذوف إلى مركبتين أفقية ورأسية مستقلتين',
        'استنتاج علاقة زاوية الإطلاق بالمدى وأقصى ارتفاع',
        'مقارنة المسار الحقيقي مع المسار المثالي عند وجود مقاومة الهواء',
        'تتبّع تحوّل الطاقة بين الحركية والوضع خلال الطيران',
      ]}
      concepts={['التسارع الثابت', 'استقلالية المركبات', 'حفظ الطاقة', 'مقاومة الهواء', 'الجاذبية الكوكبية']}
      steps={[
        'اضبط السرعة الابتدائية والزاوية من لوحة التحكّم.',
        'اضغط «إطلاق» وراقب المتجهات والقراءات الحيّة أثناء الحركة.',
        'غيّر الزاوية إلى 45° وقارن المدى مع زوايا أخرى بنفس السرعة.',
        'فعّل مقاومة الهواء تدريجياً ولاحظ انكسار تماثل المسار.',
        'بدّل الجاذبية إلى القمر أو المريخ وسجّل الفروق في زمن التحليق.',
        'سجّل قراءاتك في دفتر التجربة ثم صدّرها كملف CSV.',
      ]}
      scene={<Suspense fallback={<SimCanvasFallback />}>{scene}</Suspense>}
      controls={controls}
      explanation={explanation}
      charts={charts}
      challenge={challenge}
      quiz={<SimQuiz questions={QUIZ} />}
      notebook={
        <SimNotebook
          entries={entries}
          onClear={clear}
          fileName="projectile-3d"
          onRecord={() =>
            record({
              'السرعة (م/ث)': speed,
              'الزاوية (°)': angle,
              'الارتفاع (م)': height,
              'المقاومة k': drag,
              الجاذبية: GRAVITY_PRESETS[planet].label,
              'المدى (م)': stats.range.toFixed(2),
              'أقصى ارتفاع (م)': stats.maxHeight.toFixed(2),
              'الزمن (ث)': stats.flightTime.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default ProjectileMotion3D;
