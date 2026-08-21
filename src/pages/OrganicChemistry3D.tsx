import { Suspense, lazy, useMemo, useState } from 'react';
import { Atom as AtomIcon, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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
  ISOMER_SETS,
  MOLECULES,
  ORGANIC_REACTIONS,
  OrganicMode,
  boilingComparison,
  computeMolecule,
  findMolecule,
  findReactionO,
} from '@/lib/sim-physics/organic';

const OrganicScene3D = lazy(() =>
  import('@/components/simulations3d/organic/OrganicScene3D').then((m) => ({ default: m.OrganicScene3D }))
);

const QUIZ: SimQuizQuestion[] = [
  {
    question: 'زاوية الرابطة في جزيء الميثان تساوي تقريباً:',
    options: ['90°', '109.5°', '120°', '180°'],
    correctIndex: 1,
    explanation: 'الكربون في الميثان هجين sp³ رباعي السطوح فتكون الزاوية 109.5°.',
  },
  {
    question: 'المتصاوغات (الأيزومرات) هي مركّبات:',
    options: [
      'لها نفس الصيغة الجزيئية وتركيب مختلف',
      'لها نفس الكتلة فقط',
      'متطابقة تماماً',
      'تختلف في عدد الذرات',
    ],
    correctIndex: 0,
    explanation: 'تشترك في الصيغة الجزيئية وتختلف في ترتيب الذرات أو موضع المجموعة الوظيفية.',
  },
  {
    question: 'درجة غليان الإيثانول أعلى بكثير من الإيثان لأن:',
    options: ['كتلته أكبر بكثير', 'يكوّن روابط هيدروجينية', 'غير قطبي', 'يحوي رابطة مزدوجة'],
    correctIndex: 1,
    explanation: 'مجموعة ‎–OH تكوّن روابط هيدروجينية قوية بين الجزيئات تتطلب طاقة أكبر لكسرها.',
  },
  {
    question: 'تفاعل الألكين مع الهيدروجين بوجود نيكل هو تفاعل:',
    options: ['إحلال', 'إضافة', 'تكاثف', 'حذف'],
    correctIndex: 1,
    explanation: 'تنكسر رابطة π ويُضاف الهيدروجين على ذرتي الكربون لينتج ألكان مشبع.',
  },
  {
    question: 'ناتج أكسدة الكحول الأوّلي أكسدة جزئية هو:',
    options: ['كيتون', 'ألدهيد', 'إستر', 'أمين'],
    correctIndex: 1,
    explanation: 'الكحول الأوّلي يعطي ألدهيداً ثم حمضاً كربوكسيلياً عند الأكسدة الكاملة.',
  },
  {
    question: 'ينتج تفاعل الأسترة من حمض كربوكسيلي وكحول:',
    options: ['إستر وماء', 'ألدهيد وهيدروجين', 'أمين وملح', 'ألكين وماء'],
    correctIndex: 0,
    explanation: 'تفاعل تكاثف انعكاسي يُنتج الإستر وجزيئة ماء بوجود حمض كبريتيك مركّز.',
  },
  {
    question: 'البنزين مستقر بشكل غير معتاد لأن:',
    options: ['روابطه أحادية فقط', 'إلكترونات π غير موضعية في الحلقة', 'يحتوي أكسجين', 'حلقته غير مستوية'],
    correctIndex: 1,
    explanation: 'الترافق العطري يوزّع إلكترونات π على الحلقة كلها فيمنحها استقراراً إضافياً.',
  },
];

const MODE_LABEL: Record<OrganicMode, string> = {
  model: 'نموذج الجزيء',
  isomers: 'المتصاوغات',
  reaction: 'التفاعل',
};

const OrganicChemistry3D = () => {
  const [mode, setMode] = useState<OrganicMode>('model');
  const [moleculeId, setMoleculeId] = useState('ethanol');
  const [isomerSet, setIsomerSet] = useState(0);
  const [reactionId, setReactionId] = useState('esterification');

  const [spaceFilling, setSpaceFilling] = useState(false);
  const [showHydrogens, setShowHydrogens] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [view, setView] = useState<SimView>('default');
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [target, setTarget] = useState<string | null>(null);

  const stats = useMemo(() => computeMolecule(moleculeId), [moleculeId]);
  const molecule = findMolecule(moleculeId);
  const reaction = findReactionO(reactionId);
  const bpData = useMemo(() => boilingComparison(), []);
  const massBp = useMemo(() => bpData.map((d) => ({ ...d })), [bpData]);

  const { entries, record, clear } = useSimNotebook('organic-chemistry-3d');

  const reset = () => setResetKey((k) => k + 1);

  const newChallenge = () => {
    const pool = MOLECULES.filter((m) => m.group !== 'لا يوجد (هيدروكربون مشبع)');
    setTarget(pool[Math.floor(Math.random() * pool.length)].group);
  };

  const challengeMet = target !== null && molecule.group === target;

  const hudReadings = [
    { label: 'الجزيء', value: molecule.formula, unit: '', tone: 'primary' as const },
    { label: 'الكتلة المولية', value: stats.molarMass.toFixed(2), unit: 'g/mol' },
    { label: 'عدد الذرات', value: molecule.atoms.length, unit: '' },
    { label: 'عدد الروابط', value: stats.bondCount, unit: '' },
    { label: 'روابط مزدوجة/ثلاثية', value: `${stats.doubleBonds}/${stats.tripleBonds}`, unit: '' },
    { label: 'درجة عدم التشبّع', value: stats.unsaturation, unit: '', tone: 'warning' as const },
    { label: 'درجة الغليان', value: molecule.bp, unit: '°م', tone: 'success' as const },
    { label: 'روابط هيدروجينية', value: stats.hBonding ? 'نعم' : 'لا', unit: '' },
  ];

  const scene = (
    <SimQualityGate>
      <SimCanvas cameraPosition={[10, 9, 16]} environment="city">
        <Suspense fallback={null}>
          <OrganicScene3D
            mode={mode}
            moleculeId={moleculeId}
            isomerSet={isomerSet}
            reactionId={reactionId}
            spaceFilling={spaceFilling}
            showHydrogens={showHydrogens}
            showLabels={showLabels}
            playing={playing}
            timeScale={timeScale}
            view={view}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </Suspense>
      </SimCanvas>
      <SimHUD title="بيانات الجزيء" readings={hudReadings} />
      <SimViewButtons
        view={view}
        onViewChange={setView}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((v) => !v)}
      />
    </SimQualityGate>
  );

  const controls = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">لوحة التحكّم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as OrganicMode)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            {(Object.keys(MODE_LABEL) as OrganicMode[]).map((m) => (
              <TabsTrigger key={m} value={m} className="text-xs">
                {MODE_LABEL[m]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'إيقاف الدوران' : 'تشغيل'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> إعادة
          </Button>
        </div>

        {mode === 'model' && (
          <div className="space-y-2">
            <Label className="text-sm">الجزيء</Label>
            <Select value={moleculeId} onValueChange={setMoleculeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOLECULES.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} — {m.formula}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
              <div className="mb-1 flex flex-wrap gap-1">
                <Badge variant="secondary">{molecule.family}</Badge>
                <Badge variant="outline">{molecule.group}</Badge>
              </div>
              {molecule.note}
            </div>
          </div>
        )}

        {mode === 'isomers' && (
          <div className="space-y-2">
            <Label className="text-sm">مجموعة المتصاوغات</Label>
            <Select value={String(isomerSet)} onValueChange={(v) => setIsomerSet(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISOMER_SETS.map((s, i) => (
                  <SelectItem key={s.formula + i} value={String(i)}>
                    {s.formula} — {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
              {ISOMER_SETS[isomerSet]?.note}
            </p>
          </div>
        )}

        {mode === 'reaction' && (
          <div className="space-y-2">
            <Label className="text-sm">التفاعل العضوي</Label>
            <Select value={reactionId} onValueChange={setReactionId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORGANIC_REACTIONS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p dir="ltr" className="rounded-md bg-muted/40 p-2 text-center font-mono text-xs text-muted-foreground">
              {reaction.equation}
            </p>
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
              الظروف: {reaction.conditions}
              <br />
              {reaction.explanation}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label>سرعة الدوران</Label>
            <span className="font-mono text-xs text-muted-foreground">{timeScale.toFixed(1)}×</span>
          </div>
          <Slider value={[timeScale]} min={0.2} max={3} step={0.1} onValueChange={([v]) => setTimeScale(v)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">نموذج ملء الفراغ</Label>
            <Switch checked={spaceFilling} onCheckedChange={setSpaceFilling} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار الهيدروجين</Label>
            <Switch checked={showHydrogens} onCheckedChange={setShowHydrogens} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">إظهار التسميات</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            record({
              الجزيء: molecule.name,
              الصيغة: molecule.formula,
              العائلة: molecule.family,
              'الكتلة (g/mol)': stats.molarMass.toFixed(2),
              'الغليان (°م)': molecule.bp,
              'عدم التشبّع': stats.unsaturation,
            })
          }
        >
          تسجيل القراءة في الدفتر
        </Button>
      </CardContent>
    </Card>
  );

  const explanation = (
    <div dir="rtl" className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm leading-7 text-muted-foreground">
      <p>
        تقوم الكيمياء العضوية على قدرة الكربون الفريدة على تكوين أربع روابط تساهمية وسلاسل وحلقات
        طويلة. يحدد نوع الهجين الشكل الفراغي: sp³ رباعي السطوح 109.5° في الألكانات، sp² مستوٍ 120° في
        الألكينات، وsp خطّي 180° في الألكاينات.
      </p>
      <p>
        تتحكم المجموعة الوظيفية في السلوك الكيميائي أكثر من طول السلسلة؛ فمجموعة ‎–OH تمنح روابط
        هيدروجينية ترفع درجة الغليان والذوبان في الماء، ومجموعة الكربونيل ‎C=O تجعل الكربون مركزاً
        إلكتروفيلياً عرضة للهجوم النيوكليوفيلي. أما المتصاوغات فتشترك في الصيغة الجزيئية وتختلف في
        الترتيب، وقد يقلب هذا الاختلاف الخصائص الفيزيائية والكيميائية رأساً على عقب.
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6" dir="ltr">
        Alkanes CnH2n+2 · Alkenes CnH2n · Alkynes CnH2n−2{'\n'}
        DoU = (2C + 2 + N − H − X) / 2{'\n'}
        R–OH + R'COOH ⇌ R'COOR + H₂O (esterification){'\n'}
        R–X + OH⁻ → R–OH + X⁻ (nucleophilic substitution)
      </div>
    </div>
  );

  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">مقارنة درجات الغليان بين المركّبات</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bpData} margin={{ top: 8, right: 8, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-40} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: '°م', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bp" name="درجة الغليان (°م)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الكتلة المولية مقابل درجة الغليان</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="mass" name="g/mol" tick={{ fontSize: 11 }} />
              <YAxis dataKey="bp" name="°م" tick={{ fontSize: 11 }} />
              <ZAxis range={[80, 80]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="المركّبات العضوية" data={massBp} fill="#a855f7" />
            </ScatterChart>
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
          تحدّي: تعرّف على المجموعة الوظيفية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          ستظهر لك مجموعة وظيفية مطلوبة؛ اختر من قائمة الجزيئات المركّب الذي يحتويها ثم تحقّق في المشهد.
        </p>
        <Button onClick={newChallenge} className="gap-2">
          <Trophy className="h-4 w-4" /> مجموعة جديدة
        </Button>
        {target && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span>المطلوب</span>
              <span className="font-mono font-bold">{target}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>اختيارك الحالي</span>
              <span className="font-mono font-bold">
                {molecule.name} — {molecule.group}
              </span>
            </div>
            <div
              className={`rounded-md p-2 text-center font-bold ${
                challengeMet ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {challengeMet ? 'إجابة صحيحة! هذه هي المجموعة المطلوبة.' : 'جرّب جزيئاً آخر من القائمة.'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SimLessonShell
      title="الكيمياء العضوية ثلاثية الأبعاد"
      subtitle="Organic Chemistry 3D — النماذج الجزيئية، المتصاوغات، والتفاعلات"
      icon={<AtomIcon className="h-8 w-8 text-primary" />}
      objectives={[
        'تصوّر الشكل الفراغي للجزيئات العضوية وزوايا روابطها',
        'التمييز بين الألكانات والألكينات والألكاينات والمركّبات العطرية',
        'التعرّف على المجموعات الوظيفية وربطها بالخصائص الفيزيائية',
        'تفسير المتصاوغات السلسلية والوظيفية وأثرها على درجة الغليان',
        'متابعة مسارات تفاعلات الإضافة والإحلال والأسترة والأكسدة',
      ]}
      concepts={[
        'التهجين sp³/sp²/sp',
        'المجموعات الوظيفية',
        'المتصاوغات',
        'درجة عدم التشبّع',
        'الروابط الهيدروجينية',
        'الأسترة',
        'الإحلال النيوكليوفيلي',
        'العطرية',
      ]}
      steps={[
        'في «نموذج الجزيء» اختر الميثان وشاهد الشكل رباعي السطوح بتدوير المشهد.',
        'بدّل إلى الإيثين والإيثاين ولاحظ الرابطة المزدوجة والثلاثية وتغيّر الزوايا.',
        'فعّل «نموذج ملء الفراغ» لمقارنة الحجم الحقيقي للجزيء بنموذج الكرة والعصا.',
        'اختر الإيثانول وأخفِ الهيدروجين لتمييز الهيكل الكربوني ومجموعة ‎–OH.',
        'انتقل إلى «المتصاوغات» وقارن البيوتان بالأيزوبيوتان وفرق درجة الغليان.',
        'في «التفاعل» شغّل الأسترة وراقب اقتراب الجزيئين وتكوّن الإستر.',
        'جرّب الإحلال النيوكليوفيلي وتتبّع تحوّل كلورو الإيثان إلى إيثانول.',
        'سجّل ثلاثة جزيئات في الدفتر وقارن كتلها ودرجات غليانها.',
      ]}
      scene={<Suspense fallback={<SimCanvasFallback />}>{scene}</Suspense>}
      controls={controls}
      explanation={explanation}
      charts={charts}
      challenge={challengeCard}
      quiz={<SimQuiz questions={QUIZ} />}
      notebook={<SimNotebook entries={entries} onClear={clear} fileName="organic-chemistry" />}
    />
  );
};

export default OrganicChemistry3D;
