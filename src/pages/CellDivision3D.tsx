import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Scissors, Play, Pause, RotateCcw, Trophy, SkipBack, SkipForward } from 'lucide-react';
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
  ReferenceLine,
  BarChart,
  Bar,
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
  COMPARISON,
  CYCLE_CHECKPOINTS,
  CYCLE_STAGES,
  DivisionMode,
  computeDivision,
  dnaCurve,
  phasesFor,
} from '@/lib/sim-physics/celldivision';

const DivisionScene3D = lazy(() =>
  import('@/components/simulations3d/division/DivisionScene3D').then((m) => ({ default: m.DivisionScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'ينتج عن الانقسام المتساوي:',
    options: ['أربع خلايا أحادية', 'خليتان متطابقتان 2n', 'خليتان مختلفتان n', 'خلية واحدة كبيرة'],
    correctIndex: 1,
    explanation: 'الميتوزيس ينتج خليتين ثنائيتي المجموعة الكروموسومية ومطابقتين وراثياً للخلية الأم.',
  },
  {
    question: 'تحدث مضاعفة DNA في:',
    options: ['الطور التمهيدي', 'مرحلة S من الطور البيني', 'الطور الانفصالي', 'انقسام السيتوبلازم'],
    correctIndex: 1,
    explanation: 'مرحلة التخليق S ضمن الطور البيني هي التي تُضاعف فيها المادة الوراثية.',
  },
  {
    question: 'العبور الجيني (Crossing over) يحدث في:',
    options: ['الاستوائي الأول', 'التمهيدي الأول', 'الانفصالي الثاني', 'الطور البيني'],
    correctIndex: 1,
    explanation: 'أثناء التمهيدي الأول تقترن المتماثلات وتتبادل قطعاً من الكروماتيدات.',
  },
  {
    question: 'ينخفض عدد الكروموسومات إلى النصف في:',
    options: ['الانفصالي الأول للمنصف', 'الانفصالي المتساوي', 'الانفصالي الثاني', 'الطور النهائي المتساوي'],
    correctIndex: 0,
    explanation: 'انفصال المتماثلات في Anaphase I هو ما يقلّل العدد من 2n إلى n.',
  },
  {
    question: 'في الطور الاستوائي للانقسام المتساوي تصطف الكروموسومات:',
    options: ['في صفّين', 'في صف واحد على خط الاستواء', 'عند القطبين', 'عشوائياً'],
    correctIndex: 1,
    explanation: 'صف واحد، بخلاف Metaphase I في المنصف حيث تصطف في صفّين كأزواج متماثلة.',
  },
  {
    question: 'أي مما يلي وظيفة للانقسام المنصف؟',
    options: ['تعويض الخلايا التالفة', 'نمو الجسم', 'إنتاج الأمشاج والتنوّع الوراثي', 'شفاء الجروح'],
    correctIndex: 2,
    explanation: 'الميوزيس مختصّ بالخلايا التناسلية لإنتاج الأمشاج وضمان ثبات العدد بعد الإخصاب.',
  },
  {
    question: 'نقطة تفتيش المغزل تتحقّق من:',
    options: ['حجم الخلية', 'ارتباط كل الكروموسومات بألياف المغزل', 'كمية ATP', 'وجود الجدار الخلوي'],
    correctIndex: 1,
    explanation: 'تمنع بدء الطور الانفصالي قبل ارتباط كل الكينيتوكورات، وخللها يسبب اختلال العدد الكروموسومي.',
  },
  {
    question: 'الخلل في تنظيم دورة الخلية قد يؤدي إلى:',
    options: ['البلزمة', 'السرطان', 'الأسموزية', 'البناء الضوئي'],
    correctIndex: 1,
    explanation: 'انقسام غير منضبط بسبب فشل نقاط التفتيش هو الأساس الخلوي للأورام.',
  },
];

const MODE_LABEL: Record<DivisionMode, string> = {
  mitosis: 'الانقسام المتساوي',
  meiosis: 'الانقسام المنصف',
  cycle: 'دورة الخلية',
};

const CellDivision3D = () => {
  const [mode, setMode] = useState<DivisionMode>('mitosis');
  const [t, setT] = useState(0);
  const [cycleT, setCycleT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showSpindle, setShowSpindle] = useState(true);
  const [crossingOver, setCrossingOver] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<string | null>(null);

  const raf = useRef<number>();
  const last = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      if (playing) {
        if (mode === 'cycle') setCycleT((v) => (v + dt * 0.06 * timeScale) % 1);
        else setT((v) => (v + dt * 0.055 * timeScale) % 1);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, timeScale, mode]);

  const phases = useMemo(() => phasesFor(mode), [mode]);
  const stats = useMemo(() => computeDivision(mode === 'cycle' ? 'mitosis' : mode, t), [mode, t]);
  const curve = useMemo(() => dnaCurve(mode === 'cycle' ? 'mitosis' : mode), [mode]);

  const cycleStage = useMemo(() => {
    const total = CYCLE_STAGES.reduce((s, x) => s + x.hours, 0);
    let acc = 0;
    for (const s of CYCLE_STAGES) {
      acc += s.hours / total;
      if (cycleT < acc) return s;
    }
    return CYCLE_STAGES[CYCLE_STAGES.length - 1];
  }, [cycleT]);

  const cycleBars = CYCLE_STAGES.map((s) => ({ name: s.name.split(' ')[0], hours: s.hours }));

  const { entries, record, clear } = useSimNotebook('cell-division-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setT(0);
    setCycleT(0);
    setPlaying(true);
  };

  const gotoPhase = (i: number) => {
    const total = phases.reduce((s, p) => s + p.duration, 0);
    let acc = 0;
    for (let k = 0; k < i; k++) acc += phases[k].duration / total;
    setT(acc + 0.001);
    setPlaying(false);
  };

  const step = (dir: 1 | -1) => {
    const next = Math.min(phases.length - 1, Math.max(0, stats.index + dir));
    gotoPhase(next);
  };

  const newChallenge = () => {
    const pool = phases.filter((p) => p.id !== 'interphase');
    setChallenge(pool[Math.floor(Math.random() * pool.length)].id);
  };
  const challengeSolved = challenge !== null && stats.phase.id === challenge;
  const challengePhase = challenge ? phases.find((p) => p.id === challenge)! : null;

  const hudReadings =
    mode === 'cycle'
      ? [
          { label: 'المرحلة', value: cycleStage.name.split(' ')[0], unit: '', tone: 'primary' as const },
          { label: 'مدّتها', value: String(cycleStage.hours), unit: 'ساعة' },
          { label: 'زمن الدورة', value: (cycleT * 24).toFixed(1), unit: 'ساعة' },
          { label: 'طول الدورة', value: '24', unit: 'ساعة' },
          { label: 'نقاط التفتيش', value: String(CYCLE_CHECKPOINTS.length), unit: '' },
          { label: 'الحالة', value: cycleStage.id === 'm' ? 'انقسام' : 'بينيّ', unit: '', tone: 'success' as const },
        ]
      : [
          { label: 'الطور', value: stats.phase.name, unit: '', tone: 'primary' as const },
          { label: 'الخلايا', value: String(stats.phase.cells), unit: '' },
          { label: 'كروموسومات/خلية', value: String(stats.phase.chromosomes), unit: '' },
          { label: 'كروماتيدات', value: String(stats.phase.chromatids), unit: '' },
          { label: 'محتوى DNA', value: stats.dnaContent.toFixed(2), unit: '×' },
          { label: 'المجموعة', value: stats.phase.ploidy, unit: '', tone: 'success' as const },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[16, 11, 22]} environment="city">
        <Suspense fallback={null}>
          <DivisionScene3D
            mode={mode}
            stats={stats}
            cycleT={cycleT}
            showLabels={showLabels}
            showSpindle={showSpindle}
            crossingOver={crossingOver}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات الانقسام" readings={hudReadings} />
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
    stepSize: number,
    display?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{display ?? value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={stepSize} onValueChange={([v]) => set(v)} />
    </div>
  );

  const controls = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">لوحة التحكّم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as DivisionMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mitosis">متساوي</TabsTrigger>
            <TabsTrigger value="meiosis">منصف</TabsTrigger>
            <TabsTrigger value="cycle">دورة الخلية</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode !== 'cycle' ? (
          <>
            <div className="space-y-3">
              <Label className="text-sm">الأطوار — انقر للانتقال</Label>
              <div className="flex flex-wrap gap-2">
                {phases.map((p, i) => (
                  <Badge
                    key={p.id}
                    variant={stats.phase.id === p.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => gotoPhase(i)}
                  >
                    <span className="ml-1 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-bold">
                  {stats.phase.name} — {stats.phase.nameEn}
                </p>
                <p className="text-muted-foreground">{stats.phase.description}</p>
              </div>
            </div>

            {slider('التقدّم في العملية', t, setT, 0, 0.999, 0.001, `${(t * 100).toFixed(0)}%`)}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => step(-1)} className="gap-2">
                <SkipBack className="h-4 w-4" /> الطور السابق
              </Button>
              <Button variant="outline" size="sm" onClick={() => step(1)} className="gap-2">
                <SkipForward className="h-4 w-4" /> الطور التالي
              </Button>
            </div>
          </>
        ) : (
          <>
            {slider('موضع الدورة', cycleT, setCycleT, 0, 0.999, 0.001, `${(cycleT * 24).toFixed(1)} ساعة`)}
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="font-bold">{cycleStage.name}</p>
              <p className="text-muted-foreground">{cycleStage.note}</p>
            </div>
            <div className="space-y-2">
              {CYCLE_CHECKPOINTS.map((c) => (
                <div key={c.id} className="rounded-lg border border-border p-2 text-xs">
                  <p className="font-bold">
                    {c.name} <span className="text-muted-foreground">({c.at})</span>
                  </p>
                  <p className="text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>
          </>
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
            <Label className="text-sm">إظهار البطاقات التوضيحية</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
          {mode !== 'cycle' && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">إظهار ألياف المغزل</Label>
              <Switch checked={showSpindle} onCheckedChange={setShowSpindle} />
            </div>
          )}
          {mode === 'meiosis' && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">تفعيل العبور الجيني</Label>
              <Switch checked={crossingOver} onCheckedChange={setCrossingOver} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        تنقسم الخلايا لتنمو وتعوّض التالف ولتنتج الأمشاج. النموذج المستخدم هنا كائن بسيط عدده{' '}
        <strong>2n = 4</strong> كروموسومات ليسهل تتبّع كل كروموسوم في كل طور.
      </p>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">الانقسام المتساوي (Mitosis)</p>
        <p>
          يسبقه طور بينيّ تُضاعف فيه المادة الوراثية، ثم تمهيدي فاستوائي فانفصالي فنهائي، وينتهي بانقسام
          السيتوبلازم لتنتج خليتان 2n متطابقتان وراثياً مع الخلية الأم.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">الانقسام المنصف (Meiosis)</p>
        <p>
          انقسامان متتاليان بمضاعفة واحدة. في التمهيدي الأول يحدث الاقتران والعبور الجيني، وفي الانفصالي
          الأول تنفصل المتماثلات فيقلّ العدد للنصف، بينما تنفصل الكروماتيدات في الانفصالي الثاني لتنتج
          أربع خلايا أحادية n مختلفة وراثياً.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">دورة الخلية ونقاط التفتيش</p>
        <p>
          تستغرق الخلية الجسمية البشرية نحو 24 ساعة: G1 نمو، S مضاعفة DNA، G2 تجهيز، M انقسام. تراقب
          نقاط التفتيش G1/S وG2/M ونقطة المغزل سلامة العملية، وفشلها يؤدي إلى انقسام غير منضبط.
        </p>
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">محتوى DNA وعدد الكروموسومات عبر الأطوار</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} unit="%" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={Number((t * 100).toFixed(1))} stroke="#22c55e" strokeDasharray="4 4" />
              <RLine type="stepAfter" dataKey="dna" stroke="#8b5cf6" dot={false} strokeWidth={2} name="محتوى DNA" />
              <RLine type="stepAfter" dataKey="chromosomes" stroke="#f59e0b" dot={false} strokeWidth={2} name="كروموسومات/خلية" />
              <RLine type="stepAfter" dataKey="cells" stroke="#38bdf8" dot={false} strokeWidth={2} name="عدد الخلايا" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">توزيع ساعات دورة الخلية</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleBars}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="س" />
              <Tooltip />
              <Bar dataKey="hours" fill="#22d3ee" name="ساعات" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">مقارنة بين الانقسام المتساوي والمنصف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="p-2">وجه المقارنة</th>
                  <th className="p-2">المتساوي</th>
                  <th className="p-2">المنصف</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.key} className="border-b border-border/50">
                    <td className="p-2 font-bold">{row.key}</td>
                    <td className="p-2">{row.mitosis}</td>
                    <td className="p-2">{row.meiosis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const challengeCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          تحدّي: تعرّف على الطور من وصفه
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> سؤال جديد
        </Button>
        {challengePhase && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-muted-foreground">{challengePhase.description}</p>
            <p>انتقل بالمشهد ثلاثي الأبعاد إلى الطور المطابق.</p>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeSolved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeSolved
                ? `أحسنت! إنه ${challengePhase.name}.`
                : `أنت الآن في ${stats.phase.name} — حاول مجدداً.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الانقسام الخلوي ثلاثي الأبعاد"
      subtitle="Cell Division 3D — الانقسام المتساوي والمنصف ودورة الخلية بالمراحل"
      icon={<Scissors className="h-8 w-8 text-primary" />}
      objectives={[
        'تتبّع أطوار الانقسام المتساوي PMAT وانقسام السيتوبلازم',
        'تمييز مراحل الانقسام المنصف الأول والثاني',
        'تفسير العبور الجيني ودوره في التنوّع الوراثي',
        'ربط محتوى DNA وعدد الكروموسومات بكل طور',
        'وصف دورة الخلية G1-S-G2-M ونقاط التفتيش',
      ]}
      concepts={[
        'الكروماتيدات الشقيقة',
        'السنترومير',
        'ألياف المغزل',
        'الكروموسومات المتماثلة',
        'العبور الجيني',
        'الأحادي والثنائي n / 2n',
        'نقاط التفتيش',
        'الأمشاج',
      ]}
      steps={[
        'ابدأ بنمط «متساوي» وشغّل المحاكاة لمشاهدة الأطوار بالتسلسل.',
        'أوقف عند الطور الاستوائي ولاحظ اصطفاف الكروموسومات في صف واحد.',
        'انتقل للطور الانفصالي وراقب انفصال الكروماتيدات نحو القطبين.',
        'بدّل إلى «منصف» وقارن Metaphase I (صفّان) مع Metaphase الطور المتساوي.',
        'فعّل «العبور الجيني» ولاحظ تلوّن الأطراف المتبادلة في التمهيدي الأول.',
        'تابع حتى النهائي الثاني وعُدّ الخلايا الأربع الناتجة.',
        'افتح نمط «دورة الخلية» وحدّد أين تقع نقاط التفتيش الثلاث.',
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
          fileName="cell-division-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'الطور': stats.phase.name,
              'التقدّم %': (stats.overall * 100).toFixed(1),
              'عدد الخلايا': String(stats.phase.cells),
              'كروموسومات/خلية': String(stats.phase.chromosomes),
              'كروماتيدات': String(stats.phase.chromatids),
              'محتوى DNA': stats.dnaContent.toFixed(2),
              'المجموعة': stats.phase.ploidy,
              'العبور الجيني': mode === 'meiosis' && crossingOver ? 'مفعّل' : 'غير مفعّل',
            })
          }
        />
      }
    />
  );
};

export default CellDivision3D;
