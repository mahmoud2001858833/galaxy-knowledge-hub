import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dna, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Scissors, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface DiseaseCase {
  id: string;
  nameAr: string;
  nameEn: string;
  gene: string;
  mutationDesc: string;
  targetSequence: string; // 20 bp
  pam: string; // NGG
  healthySequence: string;
}

const CASES: DiseaseCase[] = [
  {
    id: 'sickle-cell',
    nameAr: 'أنيميا الخلايا المنجلية (Sickle Cell Anemia)',
    nameEn: 'Sickle Cell Disease',
    gene: 'HBB (بيتا جلوبين)',
    mutationDesc: 'استبدال أحادي A -> T في الكودون 6 (حمض الجلوتاميك إلى فالين)',
    targetSequence: 'ACTCCTGAGGAGAAGTCTGC',
    pam: 'TGG',
    healthySequence: 'ACTCCTGAGGAGAAGTCTGC',
  },
  {
    id: 'cystic-fibrosis',
    nameAr: 'التليف الكيسي (Cystic Fibrosis - ΔF508)',
    nameEn: 'Cystic Fibrosis',
    gene: 'CFTR',
    mutationDesc: 'حذف 3 نيوكليوتيدات (CTT) تسبب فقدان حمض الفينيل ألانين 508',
    targetSequence: 'GAAACACCAAAGATGATATT',
    pam: 'CGG',
    healthySequence: 'GAAACACCAAAGATGATATT',
  },
];

type StepType = 'select' | 'design_grna' | 'cas9_cut' | 'repair' | 'results';

export default function CrisprGeneEditingSimulation() {
  const navigate = useNavigate();

  // State
  const [selectedCase, setSelectedCase] = useState<DiseaseCase>(CASES[0]);
  const [currentStep, setCurrentStep] = useState<StepType>('select');
  const [grnaInput, setGrnaInput] = useState<string>('');
  const [isCutComplete, setIsCutComplete] = useState<boolean>(false);
  const [repairMethod, setRepairMethod] = useState<'NHEJ' | 'HDR' | null>(null);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Compute complementary RNA bases: A->U, T->A, C->G, G->C
  const complementaryRNA = (dna: string) => {
    return dna.split('').map((base) => {
      if (base === 'A') return 'U';
      if (base === 'T') return 'A';
      if (base === 'C') return 'G';
      if (base === 'G') return 'C';
      return base;
    }).join('');
  };

  const correctGRNA = useMemo(() => {
    return complementaryRNA(selectedCase.targetSequence);
  }, [selectedCase]);

  const handleAutoDesignGRNA = () => {
    setGrnaInput(correctGRNA);
  };

  const handleExecuteCut = () => {
    setIsCutComplete(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setCurrentStep('repair');
    }, 1200);
  };

  const handleSelectRepair = (method: 'NHEJ' | 'HDR') => {
    setRepairMethod(method);
    setCurrentStep('results');
    if (method === 'HDR') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handleReset = () => {
    setCurrentStep('select');
    setGrnaInput('');
    setIsCutComplete(false);
    setRepairMethod(null);
  };

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 1) {
      setQuizScore((prev) => prev + 1);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-16 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/scientific-simulations-hub')}
              className="text-slate-400 hover:text-white mb-2 p-0 h-auto font-normal flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              العودة إلى مركز التجارب العلمية
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/20">
                <Dna className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-300 via-rose-200 to-amber-300 bg-clip-text text-transparent">
                  مختبر كريسبر وتعديل الجينات (CRISPR-Cas9)
                </h1>
                <p className="text-sm text-slate-400">
                  المقص الجيني الثوري: تصميم مرشد RNA، قطع الـ DNA المستهدف، وإصلاح الطفرات الوراثية بدقة
                </p>
              </div>
            </div>
          </div>

          {/* Quick Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
          >
            <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
            بدء تجربة جديدة
          </Button>
        </div>

        {/* Steps Progress Tracker */}
        <div className="grid grid-cols-5 gap-2 mb-8 text-center text-xs">
          {[
            { id: 'select', label: '1. اختيار المرض الوراثي' },
            { id: 'design_grna', label: '2. تصميم gRNA المرشد' },
            { id: 'cas9_cut', label: '3. توجيه وقص Cas9' },
            { id: 'repair', label: '4. مسار الإصلاح الخلوي' },
            { id: 'results', label: '5. التحقق ونتائج العلاج' },
          ].map((s, idx) => (
            <div
              key={s.id}
              className={`p-2.5 rounded-xl border transition-all ${
                currentStep === s.id
                  ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
              <Activity className="w-4 h-4" />
              مختبر التعديل الجيني التفاعلي
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              آلية عمل كريسبر الحيوية
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Simulation Workflow */}
          <TabsContent value="simulation" className="space-y-6">
            {/* Step 1: Select Case */}
            {currentStep === 'select' && (
              <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
                <h3 className="text-lg font-bold text-pink-300">الخطوة الأولى: اختر الحالة المرضية الوراثية المستهدفة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CASES.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        setCurrentStep('design_grna');
                      }}
                      className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-pink-500/80 hover:bg-pink-500/5 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base text-slate-100 group-hover:text-pink-300">{c.nameAr}</h4>
                        <Badge variant="outline" className="border-pink-500/40 text-pink-400 font-mono">
                          جين {c.gene}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{c.mutationDesc}</p>
                      <div className="text-[11px] font-mono bg-slate-900 p-2 rounded-md text-amber-300 overflow-x-auto">
                        التسلسل المستهدف: {c.targetSequence} [PAM: {c.pam}]
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 2: Design gRNA */}
            {currentStep === 'design_grna' && (
              <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-5">
                <h3 className="text-lg font-bold text-pink-300">
                  الخطوة الثانية: تصميم شريط RNA المرشد (Guide RNA - gRNA)
                </h3>
                <p className="text-xs text-slate-400">
                  يحتاج إنزيم Cas9 إلى شريط RNA مكمل بطول 20 نيوكليوتيد ليتعرف بدقة على موقع الطفرة في شريط DNA المستهدف.
                </p>

                {/* Target DNA strand display */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center gap-2 text-xs text-sky-400">
                    <span className="w-24">DNA المستهدف:</span>
                    <span className="tracking-widest font-bold text-amber-300">{selectedCase.targetSequence}</span>
                    <span className="text-rose-400 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded">[{selectedCase.pam}] (PAM)</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-24">gRNA المصمم:</span>
                    <span className="tracking-widest font-bold text-emerald-300">{grnaInput || '....................'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAutoDesignGRNA}
                    className="bg-pink-600 hover:bg-pink-500 text-white text-xs"
                  >
                    ✨ تركيب وتوليد شريط الـ gRNA المكمل تلقائياً
                  </Button>
                  {grnaInput && (
                    <Button
                      onClick={() => setCurrentStep('cas9_cut')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      التالي: حقن مجمع Cas9-gRNA في الخلية ←
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Cas9 Molecular Cut */}
            {currentStep === 'cas9_cut' && (
              <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-5 text-center">
                <h3 className="text-lg font-bold text-rose-400">
                  الخطوة الثالثة: توجيه مجمع Cas9 وإجراء القطع مزدوج الشريط (Double-Strand Break)
                </h3>

                {/* Interactive Cutting Chamber */}
                <div className="relative py-12 px-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-6 overflow-hidden">
                  {/* Cas9 Protein Graphic */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: isCutComplete ? 1.05 : 1, opacity: 1 }}
                    className="p-6 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 border-2 border-pink-500 rounded-3xl backdrop-blur-md shadow-2xl relative"
                  >
                    <div className="text-xs font-bold text-pink-300 mb-2">مجمع إنزيم Cas9 مع شريط gRNA</div>
                    <div className="font-mono text-sm tracking-widest text-emerald-300 bg-slate-900/80 px-4 py-2 rounded-lg border border-emerald-500/30">
                      5'-{selectedCase.targetSequence}-3' (ارتباط متكامل 100%)
                    </div>
                  </motion.div>

                  {/* Cut DNA strands */}
                  <div className="flex items-center gap-4 font-mono font-bold text-base">
                    <span className={`text-sky-300 transition-all ${isCutComplete ? '-translate-x-3' : ''}`}>
                      5'- GACTAGCTA -3'
                    </span>
                    <Scissors className={`w-8 h-8 ${isCutComplete ? 'text-rose-500 scale-125' : 'text-slate-500'} transition-all`} />
                    <span className={`text-sky-300 transition-all ${isCutComplete ? 'translate-x-3' : ''}`}>
                      5'- TCGATCGAT -3'
                    </span>
                  </div>

                  {!isCutComplete ? (
                    <Button
                      onClick={handleExecuteCut}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 text-sm flex items-center gap-2"
                    >
                      <Scissors className="w-5 h-5" />
                      تنفيذ القطع الجزيئي للـ DNA الآن
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Check className="w-5 h-5" />
                      تم إحداث كسر مزدوج دقيق في الموقع المستهدف بنجاح!
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 4: Choose Repair Pathway */}
            {currentStep === 'repair' && (
              <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-5">
                <h3 className="text-lg font-bold text-indigo-300">
                  الخطوة الرابعة: اختيار مسار الإصلاح الخلوي للـ DNA
                </h3>
                <p className="text-xs text-slate-400">
                  الخلية تستجيب للكسر بإحدى آليتين طبيعيتين:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NHEJ Pathway */}
                  <div
                    onClick={() => handleSelectRepair('NHEJ')}
                    className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-amber-500/80 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-amber-300">1. مسار NHEJ (تعطيل الجين - Knockout)</h4>
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400">عشوائي</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      ربط النهايات غير المتماثلة. يُحدث طفرات إدخال/حذف (Indels) تؤدي إلى <strong>تعطيل الجين الضار تماماً</strong>.
                    </p>
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs">
                      اختيار مسار التعطيل (NHEJ)
                    </Button>
                  </div>

                  {/* HDR Pathway */}
                  <div
                    onClick={() => handleSelectRepair('HDR')}
                    className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-emerald-500/80 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-emerald-300">2. مسار HDR (التصحيح الدقيق - Knock-in)</h4>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">دقيق 100%</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      الإصلاح الموجه بالتنادد. يتطلب تزويد الخلية بـ <strong>قالب DNA سليم</strong> ليتم نسخ التسلسل الصحيح واستبدال الطفرة تماماً.
                    </p>
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                      اختيار مسار التصحيح الدقيق مع قالب سليم (HDR)
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 5: Results & Electrophoresis */}
            {currentStep === 'results' && (
              <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-300">النتيجة النهائية: التحقق من نجاح التعديل الجيني</h3>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                    {repairMethod === 'HDR' ? '✓ تم تصحيح الطفرة بنجاح' : '✓ تم تعطيل الجين المستهدف'}
                  </Badge>
                </div>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gel Electrophoresis graphic */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-center">
                      <span className="text-xs text-slate-400 block font-bold">الترحيل الكهربائي للهلام (Gel Electrophoresis)</span>
                      <div className="h-40 bg-slate-950 rounded-lg p-3 flex justify-around items-end border border-slate-800 font-mono text-[10px]">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-6 h-1.5 bg-sky-400 rounded-full shadow-sm" />
                          <span className="text-slate-500">قبل التعديل</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-6 h-1.5 bg-emerald-400 rounded-full shadow-sm" />
                          <div className="w-6 h-1.5 bg-emerald-400/60 rounded-full shadow-sm" />
                          <span className="text-emerald-400">بعد التعديل</span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Outcome */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 flex flex-col justify-center">
                      <h4 className="font-bold text-emerald-300 text-base">التقييم الطبي الحيوي:</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {repairMethod === 'HDR'
                          ? `تم استبدال طفرة جين ${selectedCase.gene} المسببة لـ ${selectedCase.nameAr} بالتسلسل السليم بنجاح، مما يعيد إنتاج البروتين الطبيعي والشفاء الوظيفي للخلية.`
                          : `تم تعطيل التعبير الجيني المسبب للمرض بنجاح عبر مسار NHEJ.`}
                      </p>
                      <Button onClick={handleReset} className="w-full bg-slate-800 hover:bg-slate-700 text-xs">
                        تعديل جين آخر
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-pink-300">نظام كريسبر-كاس9 (CRISPR-Cas9): ثورة الهندسة الوراثية</h3>
              <p>
                نظام كريسبر هو في الأصل آلية دفاعية مناعية طبيعية تستخدمها البكتيريا للتصدي للفيروسات. في عام 2012، طوّرت العالمتان إيمانويل شاربنتييه وجينيفر داودنا هذا النظام ليصبح أداة دقيقة لإعادة كتابة الشفرة الوراثية للكائنات الحية، ونالتا بفضله جائزة نوبل في الكيمياء عام 2020.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-pink-400">1. مرشد الـ RNA (gRNA)</h4>
                  <p className="text-xs text-slate-400">
                    شريط اصطناعي بطول 20 نيوكليوتيد يتطابق بدقة متناهية مع الموقع المستهدف على شريط الـ DNA.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-purple-400">2. إنزيم Cas9</h4>
                  <p className="text-xs text-slate-400">
                    مقص جزيئي نووي (Endonuclease) يقوم بقطع الروابط الفوسفاتية في كلا شريطي الـ DNA عند الموقع المحدد.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-amber-400">3. تتابع الـ PAM</h4>
                  <p className="text-xs text-slate-400">
                    تتابع قصير (5'-NGG-3') يقع مباشرة بعد الموقع المستهدف، بدونه لا يستطيع إنزيم Cas9 الارتباط أو القطع.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار مفاهيم تقنية كريسبر
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما هو الدور الأساسي لتتابع الـ PAM (مثل NGG) في عمل إنزيم Cas9؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'يعمل كقالب لإصلاح الحمض النووي بعد القطع.' },
                    { id: 1, text: 'يعتبر إشارة تعرف حاسمة تسمح لإنزيم Cas9 بفتح شريط الـ DNA والارتباط به لإجراء القطع.' },
                    { id: 2, text: 'يمنع الخلية من إنتاج الأجسام المضادة.' },
                    { id: 3, text: 'يحدد نوع المرض الوراثي تلقائياً.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 1
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : quizAnswer === option.id
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                          : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                {quizSubmitted && (
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 1 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 1 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة وممتازة! تتابع PAM هو نقطة الارتكاز الأولى لإنزيم Cas9، وإذا لم يكن موجوداً بجوار التسلسل الهدف فلن يتم القطع.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تتابع PAM ضروري جداً لتعرف إنزيم Cas9 الأولي على شريط الـ DNA قبل بدء مطابقة الـ gRNA.</span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
