import { Suspense, lazy, useMemo, useState } from 'react';
import { Microscope, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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
  CELL_PROFILES,
  CellMode,
  CellType,
  TransportParams,
  computeTransport,
  findOrganelle,
  organellesFor,
  tonicityCurve,
  transportRateCurve,
} from '@/lib/sim-physics/cell';

const CellScene3D = lazy(() =>
  import('@/components/simulations3d/cell/CellScene3D').then((m) => ({ default: m.CellScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'العضيّ المسؤول عن إنتاج معظم ATP في الخلية هو:',
    options: ['جهاز جولجي', 'الميتوكندريا', 'الليسوسوم', 'النواة'],
    correctIndex: 1,
    explanation: 'التنفّس الخلوي الهوائي يحدث في الميتوكندريا وينتج ATP.',
  },
  {
    question: 'أي التراكيب توجد في الخلية النباتية ولا توجد في الحيوانية؟',
    options: ['الميتوكندريا', 'الرايبوسوم', 'البلاستيدة الخضراء', 'الغشاء البلازمي'],
    correctIndex: 2,
    explanation: 'البلاستيدة الخضراء والجدار الخلوي والفجوة المركزية مميزات نباتية.',
  },
  {
    question: 'الخلية البكتيرية تُصنّف ضمن:',
    options: ['حقيقيات النوى', 'بدائيات النوى', 'الفطريات', 'الطلائعيات'],
    correctIndex: 1,
    explanation: 'لا تملك نواة محاطة بغشاء بل منطقة نووية تحوي DNA حلقياً.',
  },
  {
    question: 'إذا وُضعت خلية حيوانية في وسط ناقص التوتّر فإنها:',
    options: ['تنكمش', 'تنتفخ وقد تنفجر', 'لا تتأثر', 'تفقد نواتها'],
    correctIndex: 1,
    explanation: 'يدخل الماء بالخاصية الأسموزية نحو التركيز الأعلى للأملاح داخل الخلية.',
  },
  {
    question: 'البلزمة (انفصال الغشاء عن الجدار) تحدث للخلية النباتية في وسط:',
    options: ['متساوي التوتّر', 'ناقص التوتّر', 'زائد التوتّر', 'خالٍ من الأملاح'],
    correctIndex: 2,
    explanation: 'يخرج الماء من الفجوة فينكمش البروتوبلاست بعيداً عن الجدار.',
  },
  {
    question: 'النقل النشط يختلف عن الانتشار البسيط في أنه:',
    options: ['لا يحتاج بروتينات', 'يحتاج طاقة ATP وينقل عكس التدرّج', 'أسرع دائماً', 'يحدث في الماء فقط'],
    correctIndex: 1,
    explanation: 'مثل مضخة الصوديوم-البوتاسيوم التي تعمل عكس تدرّج التركيز.',
  },
  {
    question: 'وظيفة جهاز جولجي هي:',
    options: ['هضم الفضلات', 'تعديل البروتينات وتعبئتها وشحنها', 'إنتاج الطاقة', 'حفظ DNA'],
    correctIndex: 1,
    explanation: 'يستقبل حويصلات من الشبكة الإندوبلازمية ثم يعدّلها ويصدّرها.',
  },
];

const MODE_LABEL: Record<CellMode, string> = {
  explore: 'استكشاف الخلية',
  compare: 'مقارنة الخلايا',
  transport: 'النقل عبر الغشاء',
};

const LivingCell3D = () => {
  const [mode, setMode] = useState<CellMode>('explore');
  const [cellType, setCellType] = useState<CellType>('animal');
  const [selected, setSelected] = useState<string | null>('nucleus');

  const [outside, setOutside] = useState(150);
  const [inside, setInside] = useState(150);
  const [temperature, setTemperature] = useState(37);
  const [permeability, setPermeability] = useState(0.6);
  const [atp, setAtp] = useState(0.5);

  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<string | null>(null);

  const transport: TransportParams = useMemo(
    () => ({ outside, inside, temperature, permeability, atp, cellType }),
    [outside, inside, temperature, permeability, atp, cellType]
  );
  const transportStats = useMemo(() => computeTransport(transport), [transport]);
  const tonicity = useMemo(() => tonicityCurve(transport), [transport]);
  const rates = useMemo(() => transportRateCurve(transport), [transport]);

  const list = useMemo(() => organellesFor(cellType), [cellType]);
  const selectedOrganelle = selected ? findOrganelle(selected) : null;

  const { entries, record, clear } = useSimNotebook('living-cell-3d');

  const reset = () => {
    setResetKey((k) => k + 1);
    setOutside(150);
    setInside(150);
    setSelected(null);
    setPlaying(true);
  };

  const newChallenge = () => {
    const pool = list.filter((o) => o.id !== 'membrane');
    setChallenge(pool[Math.floor(Math.random() * pool.length)].id);
  };
  const challengeSolved = challenge !== null && selected === challenge;

  const hudReadings =
    mode === 'transport'
      ? [
          { label: 'التوتّر', value: transportStats.tonicityLabel, unit: '', tone: 'primary' as const },
          { label: 'حجم الخلية', value: (transportStats.volumeFactor * 100).toFixed(0), unit: '%' },
          { label: 'فرق التركيز', value: transportStats.gradient.toFixed(0), unit: 'mM' },
          { label: 'الضغط الأسموزي', value: transportStats.osmoticPressure.toFixed(3), unit: 'atm' },
          { label: 'النقل النشط', value: transportStats.activeRate.toFixed(3), unit: '' },
          {
            label: 'حالة الخلية',
            value: transportStats.danger ? 'خطر' : 'مستقرّة',
            unit: '',
            tone: transportStats.danger ? ('warning' as const) : ('success' as const),
          },
        ]
      : [
          { label: 'نوع الخلية', value: CELL_PROFILES[cellType].name, unit: '', tone: 'primary' as const },
          { label: 'المجموعة', value: CELL_PROFILES[cellType].domain, unit: '' },
          { label: 'القطر', value: CELL_PROFILES[cellType].size, unit: '' },
          { label: 'عدد التراكيب', value: String(list.length), unit: '' },
          { label: 'المادة الوراثية', value: CELL_PROFILES[cellType].dna, unit: '' },
          {
            label: 'المحدّد',
            value: selectedOrganelle ? selectedOrganelle.name : 'لا شيء',
            unit: '',
            tone: 'success' as const,
          },
        ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[14, 10, 20]} environment="city">
        <Suspense fallback={null}>
          <CellScene3D
            mode={mode}
            cellType={cellType}
            selected={selected}
            onSelect={setSelected}
            transport={transport}
            transportStats={transportStats}
            playing={playing}
            timeScale={timeScale}
            showLabels={showLabels}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="قراءات خلوية حيّة" readings={hudReadings} />
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as CellMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="explore">استكشاف</TabsTrigger>
            <TabsTrigger value="compare">مقارنة</TabsTrigger>
            <TabsTrigger value="transport">النقل</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode !== 'compare' && (
          <Tabs value={cellType} onValueChange={(v) => setCellType(v as CellType)} dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="animal">حيوانية</TabsTrigger>
              <TabsTrigger value="plant">نباتية</TabsTrigger>
              <TabsTrigger value="bacteria">بكتيرية</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {mode !== 'transport' ? (
          <div className="space-y-3">
            <Label className="text-sm">العضيّات — انقر للتحديد</Label>
            <div className="flex flex-wrap gap-2">
              {list.map((o) => (
                <Badge
                  key={o.id}
                  variant={selected === o.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelected(selected === o.id ? null : o.id)}
                >
                  <span className="ml-1 inline-block h-2 w-2 rounded-full" style={{ background: o.color }} />
                  {o.name}
                </Badge>
              ))}
            </div>
            {selectedOrganelle && (
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-bold">
                  {selectedOrganelle.name} — {selectedOrganelle.nameEn}
                </p>
                <p className="text-muted-foreground">{selectedOrganelle.fn}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {slider('تركيز الوسط الخارجي (mM)', outside, setOutside, 0, 600, 5, `${outside} mM`)}
            {slider('تركيز داخل الخلية (mM)', inside, setInside, 0, 600, 5, `${inside} mM`)}
            {slider('درجة الحرارة (°م)', temperature, setTemperature, 0, 45, 1, `${temperature} °م`)}
            {slider('نفاذية الغشاء', permeability, setPermeability, 0, 1, 0.05, permeability.toFixed(2))}
            {slider('طاقة ATP المتاحة', atp, setAtp, 0, 1, 0.05, atp.toFixed(2))}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setOutside(inside)}>
                متساوي
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOutside(Math.max(0, inside - 120))}>
                ناقص
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOutside(Math.min(600, inside + 200))}>
                زائد
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
            <Label className="text-sm">إظهار البطاقات التوضيحية</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div className="space-y-4 text-sm leading-7">
      <p>
        الخلية هي الوحدة البنائية والوظيفية للكائن الحي. تنقسم الخلايا إلى{' '}
        <strong>بدائيات النوى</strong> (بكتيريا: DNA حلقي حرّ) و<strong>حقيقيات النوى</strong> (حيوانية
        ونباتية: نواة محاطة بغشاء وعضيّات متخصّصة).
      </p>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">تقسيم العمل داخل الخلية</p>
        <p>
          النواة تخزّن التعليمات، الرايبوسومات تبني البروتين، الشبكة الإندوبلازمية تنقله، جولجي يعدّله
          ويشحنه، الميتوكندريا تولّد الطاقة، والليسوسومات تتخلّص من الفضلات. في النبات تُضاف البلاستيدات
          الخضراء للبناء الضوئي والفجوة المركزية لحفظ الماء والدعم.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="font-bold">النقل عبر الغشاء</p>
        <p>
          الغشاء البلازمي شبه منفذ. الانتشار والأسموزية نقل سلبي مع تدرّج التركيز ولا يحتاج طاقة، أما
          النقل النشط فيحتاج ATP لضخّ المواد عكس التدرّج. الضغط الأسموزي يُحسب بالعلاقة π = MRT، وتحدّد
          توتّرية الوسط مصير الخلية: انتفاخ في الناقص، اتزان في المتساوي، انكماش أو بلزمة في الزائد.
        </p>
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">حجم الخلية مقابل تركيز الوسط الخارجي</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tonicity}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="outside" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={outside} stroke="#22c55e" strokeDasharray="4 4" />
              <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="2 4" />
              <RLine type="monotone" dataKey="volume" stroke="#8b5cf6" dot={false} strokeWidth={2} name="نسبة الحجم" />
              <RLine type="monotone" dataKey="flux" stroke="#0ea5e9" dot={false} strokeWidth={2} name="تدفّق الماء" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">النقل السلبي مقابل النشط عند تغيّر ATP</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rates}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="atp" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <RLine type="monotone" dataKey="passive" stroke="#38bdf8" dot={false} strokeWidth={2} name="سلبي" />
              <RLine type="monotone" dataKey="active" stroke="#f59e0b" dot={false} strokeWidth={2} name="نشط" />
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
          تحدّي: حدّد العضيّ من وظيفته
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> سؤال جديد
        </Button>
        {challenge && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-muted-foreground">{findOrganelle(challenge).fn}</p>
            <p>اختر العضيّ المطابق من القائمة أو من المشهد ثلاثي الأبعاد.</p>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeSolved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeSolved
                ? `أحسنت! إنه ${findOrganelle(challenge).name}.`
                : selected
                ? `اخترت ${findOrganelle(selected).name} — حاول مجدداً.`
                : 'بانتظار اختيارك...'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الخلية الحية ثلاثية الأبعاد"
      subtitle="Living Cell 3D — استكشاف العضيّات، مقارنة الخلايا، والنقل عبر الغشاء"
      icon={<Microscope className="h-8 w-8 text-primary" />}
      objectives={[
        'التعرّف على العضيّات الخلوية ووظيفة كل منها',
        'المقارنة بين الخلية الحيوانية والنباتية والبكتيرية',
        'تفسير النقل السلبي والنشط عبر الغشاء البلازمي',
        'حساب الضغط الأسموزي π = MRT وربطه بتوتّرية الوسط',
        'توقّع مصير الخلية في الأوساط الناقصة والمتساوية والزائدة التوتّر',
      ]}
      concepts={[
        'حقيقيات وبدائيات النوى',
        'الميتوكندريا و ATP',
        'البلاستيدة الخضراء',
        'جهاز جولجي',
        'الغشاء شبه المنفذ',
        'الأسموزية',
        'النقل النشط',
        'البلزمة وضغط الامتلاء',
      ]}
      steps={[
        'في «استكشاف»: دوّر الخلية الحيوانية وانقر النواة ثم الميتوكندريا واقرأ وظيفتيهما.',
        'بدّل إلى الخلية النباتية وابحث عن البلاستيدات والفجوة المركزية.',
        'اختر الخلية البكتيرية ولاحظ غياب النواة ووجود البلازميد والسوط.',
        'في «مقارنة»: قارن الأحجام النسبية للخلايا الثلاث.',
        'في «النقل»: اجعل الوسط ناقص التوتّر وراقب انتفاخ الخلية الحيوانية.',
        'كرّر التجربة على الخلية النباتية ولاحظ دور الجدار في منع الانفجار.',
        'ارفع ATP وراقب زيادة معدّل النقل النشط في المخطّط.',
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
          fileName="living-cell-3d"
          onRecord={() =>
            record({
              'النمط': MODE_LABEL[mode],
              'نوع الخلية': CELL_PROFILES[cellType].name,
              'العضيّ المحدّد': selectedOrganelle ? selectedOrganelle.name : '—',
              'تركيز خارجي (mM)': String(outside),
              'تركيز داخلي (mM)': String(inside),
              'التوتّر': transportStats.tonicityLabel,
              'نسبة الحجم %': (transportStats.volumeFactor * 100).toFixed(1),
              'الضغط الأسموزي (atm)': transportStats.osmoticPressure.toFixed(4),
              'معدل النقل النشط': transportStats.activeRate.toFixed(3),
            })
          }
        />
      }
    />
  );
};

export default LivingCell3D;
