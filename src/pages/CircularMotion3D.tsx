import { Suspense, lazy, useMemo, useState } from 'react';
import { Orbit, Play, Pause, RotateCcw, Scissors, Trophy } from 'lucide-react';
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
  CircularMode,
  R_EARTH_KM,
  computeCircular,
  radiusSweep,
  sceneRadius,
} from '@/lib/sim-physics/circular';

const CircularScene3D = lazy(() =>
  import('@/components/simulations3d/circular/CircularScene3D').then((m) => ({
    default: m.CircularScene3D,
  }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'في الحركة الدائرية المنتظمة، اتجاه متجه السرعة يكون:',
    options: ['نحو المركز', 'بعيداً عن المركز', 'مماسياً للدائرة', 'رأسياً للأعلى'],
    correctIndex: 2,
    explanation: 'السرعة دائماً مماسية للمسار، بينما التسارع المركزي يتجه نحو المركز.',
  },
  {
    question: 'إذا تضاعفت السرعة الزاوية ω مع ثبات نصف القطر، فإن التسارع المركزي:',
    options: ['يتضاعف', 'يصبح 4 أضعاف', 'ينصف', 'لا يتغير'],
    correctIndex: 1,
    explanation: 'a_c = ω²r، فمضاعفة ω تضرب التسارع في 4.',
  },
  {
    question: 'عند قطع الخيط فجأة، يتحرك الجسم:',
    options: ['نحو المركز', 'بعيداً عن المركز شعاعياً', 'على خط مماسي مستقيم', 'يتوقف فوراً'],
    correctIndex: 2,
    explanation: 'بزوال القوة المركزية يستمر الجسم بالقصور الذاتي على المماس (قانون نيوتن الأول).',
  },
  {
    question: 'ما مصدر القوة المركزية للقمر الصناعي حول الأرض؟',
    options: ['الاحتكاك', 'قوة الجاذبية', 'شدّ الخيط', 'الدفع الصاروخي'],
    correctIndex: 1,
    explanation: 'الجاذبية الأرضية هي القوة المركزية: GMm/r² = mv²/r.',
  },
  {
    question: 'في البندول المخروطي، ماذا يحدث لزاوية المخروط θ عند زيادة السرعة الزاوية؟',
    options: ['تصغر', 'تكبر وتقترب من 90°', 'تبقى ثابتة', 'تصبح صفراً'],
    correctIndex: 1,
    explanation: 'tanθ = ω²r/g، فزيادة ω تزيد θ ويقترب المسار من المستوى الأفقي.',
  },
  {
    question: '"القوة الطاردة المركزية" التي نشعر بها داخل سيارة تدور هي:',
    options: [
      'قوة حقيقية تدفعنا للخارج',
      'قوة وهمية ناتجة عن القصور الذاتي في إطار دوّار',
      'قوة الجاذبية',
      'قوة الاحتكاك',
    ],
    correctIndex: 1,
    explanation: 'في الإطار القصوري لا توجد قوة للخارج؛ الجسم يميل للاستمرار مستقيماً فقط.',
  },
];

const MODE_LABEL: Record<CircularMode, string> = {
  uniform: 'حركة دائرية منتظمة',
  conical: 'البندول المخروطي',
  orbit: 'مدار قمر صناعي',
};

const CircularMotion3D = () => {
  const [mode, setMode] = useState<CircularMode>('uniform');
  const [radius, setRadius] = useState(2);
  const [orbitRadius, setOrbitRadius] = useState(7000);
  const [omega, setOmega] = useState(2);
  const [mass, setMass] = useState(1);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [released, setReleased] = useState(false);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [challenge, setChallenge] = useState<number | null>(null);

  const params = useMemo(
    () => ({ mode, radius: mode === 'orbit' ? orbitRadius : radius, omega, mass }),
    [mode, radius, orbitRadius, omega, mass]
  );
  const stats = useMemo(() => computeCircular(params), [params]);
  const worldRadius = useMemo(() => sceneRadius(params), [params]);
  const sweep = useMemo(() => radiusSweep(params), [params]);

  const { entries, record, clear } = useSimNotebook('circular-3d');

  const reset = () => {
    setReleased(false);
    setResetKey((k) => k + 1);
    setPlaying(true);
  };

  const changeMode = (m: CircularMode) => {
    setMode(m);
    setReleased(false);
    setResetKey((k) => k + 1);
  };

  const newChallenge = () => setChallenge(Math.round(20 + Math.random() * 180));

  const challengeError = challenge === null ? null : Math.abs(stats.ac - challenge);

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 7, 14]} environment={mode === 'orbit' ? 'night' : 'city'}>
        <Suspense fallback={null}>
          <CircularScene3D
            mode={mode}
            stats={stats}
            worldRadius={worldRadius}
            playing={playing}
            timeScale={timeScale}
            showVectors={showVectors}
            showTrail={showTrail}
            released={released}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD
        title="قراءات حيّة"
        readings={[
          { label: 'السرعة v', value: stats.v.toFixed(2), unit: 'م/ث', tone: 'success' },
          { label: 'التسارع a_c', value: stats.ac.toFixed(2), unit: 'م/ث²', tone: 'primary' },
          { label: 'القوة F_c', value: stats.fc.toFixed(2), unit: 'N' },
          { label: 'الزمن الدوري', value: stats.period.toFixed(2), unit: 'ث' },
          { label: 'التردد', value: stats.frequency.toFixed(3), unit: 'Hz' },
          { label: 'عدد g', value: stats.gForce.toFixed(2), unit: 'g', tone: 'warning' },
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
          <Tabs value={mode} onValueChange={(v) => changeMode(v as CircularMode)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="uniform" className="text-xs">منتظمة</TabsTrigger>
              <TabsTrigger value="conical" className="text-xs">مخروطي</TabsTrigger>
              <TabsTrigger value="orbit" className="text-xs">مدار</TabsTrigger>
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

          {mode !== 'orbit' && (
            <Button
              variant={released ? 'default' : 'secondary'}
              className="w-full gap-2"
              onClick={() => setReleased((r) => !r)}
            >
              <Scissors className="h-4 w-4" />
              {released ? 'إعادة ربط الخيط' : 'اقطع الخيط (اختبر القصور الذاتي)'}
            </Button>
          )}

          {mode === 'orbit' ? (
            <div className="space-y-2">
              <Label className="flex justify-between text-xs">
                <span>نصف قطر المدار من مركز الأرض</span>
                <span className="font-mono text-primary">{orbitRadius} كم</span>
              </Label>
              <Slider
                value={[orbitRadius]}
                min={R_EARTH_KM + 200}
                max={42500}
                step={100}
                onValueChange={([v]) => setOrbitRadius(v)}
              />
              <p className="text-[0.7rem] text-muted-foreground">
                الارتفاع عن السطح: {stats.altitudeKm.toFixed(0)} كم
                {Math.abs(stats.altitudeKm - 35786) < 700 && ' — مدار ثابت بالنسبة للأرض!'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>نصف القطر r</span>
                  <span className="font-mono text-primary">{radius.toFixed(2)} م</span>
                </Label>
                <Slider value={[radius]} min={0.3} max={5} step={0.1} onValueChange={([v]) => setRadius(v)} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>السرعة الزاوية ω</span>
                  <span className="font-mono text-primary">{omega.toFixed(2)} راد/ث</span>
                </Label>
                <Slider value={[omega]} min={0.2} max={12} step={0.1} onValueChange={([v]) => setOmega(v)} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>الكتلة m</span>
              <span className="font-mono text-primary">{mass.toFixed(1)} كغم</span>
            </Label>
            <Slider value={[mass]} min={0.1} max={20} step={0.1} onValueChange={([v]) => setMass(v)} />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between text-xs">
              <span>سرعة العرض</span>
              <span className="font-mono text-primary">{timeScale}×</span>
            </Label>
            <Slider value={[timeScale]} min={0.1} max={3} step={0.1} onValueChange={([v]) => setTimeScale(v)} />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">إظهار المتجهات</Label>
              <Switch checked={showVectors} onCheckedChange={setShowVectors} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">أثر الحركة</Label>
              <Switch checked={showTrail} onCheckedChange={setShowTrail} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">النتائج المحسوبة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-center">
          {[
            { l: 'السرعة الخطية', v: `${stats.v.toFixed(2)} م/ث` },
            { l: 'التسارع المركزي', v: `${stats.ac.toFixed(2)} م/ث²` },
            { l: 'القوة المركزية', v: `${stats.fc.toFixed(2)} N` },
            { l: 'الزمن الدوري', v: `${stats.period.toFixed(2)} ث` },
            { l: 'الدورات/دقيقة', v: `${stats.rpm.toFixed(1)} rpm` },
            { l: 'طاقة الحركة', v: `${stats.ke.toFixed(1)} J` },
            ...(mode === 'conical'
              ? [
                  { l: 'زاوية المخروط', v: `${stats.coneAngle.toFixed(1)}°` },
                  { l: 'طول الخيط', v: `${stats.stringLength.toFixed(2)} م` },
                  { l: 'شدّ الخيط', v: `${stats.tension.toFixed(2)} N` },
                ]
              : []),
            ...(mode === 'orbit'
              ? [
                  { l: 'الارتفاع', v: `${stats.altitudeKm.toFixed(0)} كم` },
                  { l: 'زمن الدورة', v: `${(stats.period / 60).toFixed(1)} دقيقة` },
                ]
              : []),
          ].map((r) => (
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
          في الحركة الدائرية المنتظمة يبقى مقدار السرعة ثابتاً بينما يتغيّر اتجاهها باستمرار، وهذا التغيّر في
          الاتجاه هو بحدّ ذاته تسارع يُسمّى التسارع المركزي ويتجه دائماً نحو المركز. القوة المسبّبة له ليست
          نوعاً جديداً من القوى، بل هي محصّلة قوى حقيقية: شدّ خيط، أو احتكاك إطارات، أو جاذبية.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { t: 'السرعة الخطية', f: 'v = ω · r = 2πr / T' },
            { t: 'التسارع المركزي', f: 'a_c = v² / r = ω² r' },
            { t: 'القوة المركزية', f: 'F_c = m ω² r' },
            { t: 'البندول المخروطي', f: 'tan θ = ω² r / g' },
            { t: 'شدّ الخيط المخروطي', f: 'T = m √((ω²r)² + g²)' },
            { t: 'سرعة المدار', f: 'v = √(GM / r)' },
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
          جرّب زر «اقطع الخيط»: ستلاحظ أنّ الجسم لا يندفع للخارج شعاعياً كما يتصوّر كثيرون، بل يستمر على
          خط مماسي مستقيم — دليل مباشر على قانون نيوتن الأول وعلى أنّ «القوة الطاردة المركزية» قوة وهمية.
        </p>
      </CardContent>
    </Card>
  );

  const charts = (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">تأثير نصف القطر عند ثبات ω</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sweep} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="radius" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <RLine type="monotone" dataKey="التسارع المركزي" stroke="#ef4444" dot={false} strokeWidth={2} />
            <RLine type="monotone" dataKey="السرعة" stroke="#22c55e" dot={false} strokeWidth={2} />
            <RLine type="monotone" dataKey="القوة المركزية" stroke="#38bdf8" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const challengeCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          تحدّي: اضبط التسارع المركزي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          سيُعطيك النظام قيمة مطلوبة للتسارع المركزي. اضبط نصف القطر والسرعة الزاوية للوصول إليها بفارق أقل من 2 م/ث².
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> تحدٍّ جديد
        </Button>
        {challenge !== null && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span>الهدف المطلوب</span>
              <Badge variant="secondary" className="font-mono">{challenge} م/ث²</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>قيمتك الحالية</span>
              <span className="font-mono font-bold">{stats.ac.toFixed(2)} م/ث²</span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                (challengeError ?? 99) <= 2
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {(challengeError ?? 99) <= 2
                ? `أحسنت! الفارق ${challengeError?.toFixed(2)} م/ث² فقط.`
                : `الفارق ${challengeError?.toFixed(2)} م/ث² — واصل الضبط.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الحركة الدائرية ثلاثية الأبعاد"
      subtitle="Circular Motion 3D — منتظمة، بندول مخروطي، ومدارات فضائية"
      icon={<Orbit className="h-8 w-8 text-primary" />}
      objectives={[
        'تمييز اتجاه السرعة المماسية عن اتجاه التسارع المركزي',
        'اشتقاق العلاقة a_c = ω²r وتطبيقها عددياً',
        'تفسير ما يحدث عند زوال القوة المركزية (قطع الخيط)',
        'ربط الحركة الدائرية بالمدارات الفضائية والبندول المخروطي',
      ]}
      concepts={['السرعة الزاوية', 'التسارع المركزي', 'القصور الذاتي', 'البندول المخروطي', 'السرعة المدارية']}
      steps={[
        'اختر النمط: حركة منتظمة أو بندول مخروطي أو مدار قمر صناعي.',
        'ثبّت ω وغيّر نصف القطر، وسجّل قيمة a_c في كل مرة.',
        'ثبّت r وضاعف ω، ولاحظ أنّ a_c تتضاعف أربع مرات.',
        'فعّل «اقطع الخيط» وراقب اتجاه انطلاق الجسم.',
        'في نمط المدار، ابحث عن الارتفاع الذي يعطي زمن دورة 24 ساعة (المدار الجغرافي الثابت).',
        'سجّل قراءاتك في الدفتر وصدّرها كملف CSV لتحليلها.',
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
          fileName="circular-motion-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'r': mode === 'orbit' ? `${orbitRadius} كم` : radius.toFixed(2),
              'ω': stats.omega.toFixed(4),
              'm': mass.toFixed(1),
              'v': stats.v.toFixed(2),
              'a_c': stats.ac.toFixed(2),
              'F_c': stats.fc.toFixed(2),
              'T': stats.period.toFixed(2),
            })
          }
        />
      }
    />
  );
};

export default CircularMotion3D;
