import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Scissors, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Compass, Eye, Dna, ShieldAlert 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface TargetGene {
  id: string;
  nameAr: string;
  diseaseAr: string;
  targetSequence: string; // 20 nt
  pamSequence: string; // 3 nt NGG
  mutantBaseIndex: number;
  correctSequence: string;
}

const TARGET_GENES: TargetGene[] = [
  {
    id: 'hbb',
    nameAr: 'جين بيتا غلوبين (HBB)',
    diseaseAr: 'أنيميا الخلايا المنجلية (Sickle Cell Anemia)',
    targetSequence: 'CACCTGACTCCTGAGGAGAA',
    pamSequence: 'TGG',
    mutantBaseIndex: 11, // T instead of A (Glu -> Val)
    correctSequence: 'CACCTGACTCCTGTGGAGAA',
  },
  {
    id: 'cftr',
    nameAr: 'جين قناة الكلوريد (CFTR)',
    diseaseAr: 'التليف الكيسي (Cystic Fibrosis - ΔF508)',
    targetSequence: 'ATCATCTTTGGTGTTTCCTA',
    pamSequence: 'CGG',
    mutantBaseIndex: 7,
    correctSequence: 'ATCATCTTTGGTGTTTCCTA',
  },
];

type EditingStep = 'inspect' | 'hybridize' | 'cleave' | 'repair_hdr' | 'repaired';

// 3D CRISPR Scene
interface Crispr3DProps {
  step: EditingStep;
  selectedGene: TargetGene;
  isPlaying: boolean;
}

function CrisprComplex3D({ step, selectedGene, isPlaying }: Crispr3DProps) {
  const dnaGroupRef = useRef<THREE.Group>(null);
  const cas9Ref = useRef<THREE.Group>(null);
  const rnaRef = useRef<THREE.Group>(null);

  // Generate 3D Double Helix Base Pairs
  const basePairCount = 28;
  const basePairs = useMemo(() => {
    return Array.from({ length: basePairCount }, (_, i) => {
      const angle = (i * 0.45);
      const x = (i - basePairCount / 2) * 0.38;
      const y1 = Math.sin(angle) * 0.9;
      const z1 = Math.cos(angle) * 0.9;
      const y2 = -y1;
      const z2 = -z1;
      const isTarget = i >= 10 && i <= 16;
      return { id: i, x, y1, z1, y2, z2, angle, isTarget };
    });
  }, [basePairCount]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    if (dnaGroupRef.current && step !== 'cleave') {
      dnaGroupRef.current.rotation.x += 0.003;
    }

    // Cas9 enzyme positioning and breathing motion
    if (cas9Ref.current) {
      if (step === 'hybridize' || step === 'cleave') {
        cas9Ref.current.position.y = THREE.MathUtils.lerp(cas9Ref.current.position.y, 0, 0.05);
        cas9Ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.02);
      } else {
        cas9Ref.current.position.y = THREE.MathUtils.lerp(cas9Ref.current.position.y, 3.2, 0.05);
      }
    }
  });

  return (
    <group>
      {/* 3D DOUBLE-HELIX DNA STRAND */}
      <group ref={dnaGroupRef}>
        {basePairs.map((bp) => {
          const isBroken = step === 'cleave' && bp.id === 13;
          const isRepaired = step === 'repaired' && bp.isTarget;

          return (
            <group key={`bp-${bp.id}`} position={[bp.x, 0, 0]}>
              {/* Strand 1 Backbone Sphere */}
              <mesh position={[0, bp.y1, bp.z1]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color={isRepaired ? '#10b981' : '#38bdf8'} metalness={0.5} roughness={0.2} />
              </mesh>

              {/* Strand 2 Backbone Sphere */}
              <mesh position={[0, bp.y2, bp.z2]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color={isRepaired ? '#10b981' : '#ec4899'} metalness={0.5} roughness={0.2} />
              </mesh>

              {/* Rung / Hydrogen Bond Bar */}
              {!isBroken && (
                <mesh position={[0, 0, 0]} rotation={[0, 0, bp.angle]}>
                  <cylinderGeometry args={[0.035, 0.035, 1.8, 8]} />
                  <meshStandardMaterial
                    color={bp.isTarget ? (isRepaired ? '#34d399' : '#f59e0b') : '#cbd5e1'}
                    emissive={bp.isTarget ? '#d97706' : '#000000'}
                    emissiveIntensity={bp.isTarget ? 0.4 : 0}
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* 3D CAS9 ENDONUCLEASE PROTEIN COMPLEX */}
      <group ref={cas9Ref} position={[0, 3.2, 0]}>
        {/* REC Lobe (Recognition Lobe) */}
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[1.35, 24, 24]} />
          <meshPhysicalMaterial
            color="#8b5cf6"
            roughness={0.3}
            metalness={0.2}
            transmission={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* NUC Lobe (Nuclease Catalytic Lobe - RuvC & HNH) */}
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshPhysicalMaterial
            color="#a855f7"
            roughness={0.3}
            metalness={0.2}
            transmission={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Catalytic Cleavage Blades (Active Sites) */}
        {step === 'cleave' && (
          <group position={[0, -0.4, 0]}>
            <mesh position={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <pointLight color="#ef4444" intensity={4} distance={4} />
          </group>
        )}
        <Html position={[0, 1.6, 0]} center>
          <div className="bg-purple-900/90 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-400/40 pointer-events-none whitespace-nowrap shadow-lg">
            إنزيم Cas9 النووي (RuvC + HNH)
          </div>
        </Html>
      </group>

      {/* 3D GUIDE RNA (gRNA Single Strand) */}
      {(step === 'hybridize' || step === 'cleave' || step === 'repair_hdr') && (
        <group ref={rnaRef} position={[0, 0.45, 0]}>
          {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((x, idx) => (
            <mesh key={`rna-${idx}`} position={[x, Math.sin(idx * 0.7) * 0.2, 0.6]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.6} />
            </mesh>
          ))}
          <Html position={[0, 0.9, 0.6]} center>
            <div className="bg-orange-900/90 text-orange-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-orange-400/40 pointer-events-none whitespace-nowrap shadow-lg">
              مرشد gRNA (مكمل للهدف)
            </div>
          </Html>
        </group>
      )}

      {/* HDR REPAIR TEMPLATE DNA STRAND */}
      {step === 'repair_hdr' && (
        <group position={[0, -1.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 3.2, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
          </mesh>
          <Html position={[0, -0.5, 0]} center>
            <div className="bg-emerald-900/90 text-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-400/40 pointer-events-none whitespace-nowrap shadow-lg">
              قالب الإصلاح السليم (HDR Template)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export default function CrisprGeneEditingSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);

  // States
  const [selectedGene, setSelectedGene] = useState<TargetGene>(TARGET_GENES[0]);
  const [step, setStep] = useState<EditingStep>('inspect');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const handleNextStep = () => {
    if (step === 'inspect') setStep('hybridize');
    else if (step === 'hybridize') setStep('cleave');
    else if (step === 'cleave') setStep('repair_hdr');
    else if (step === 'repair_hdr') {
      setStep('repaired');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleReset = () => {
    setStep('inspect');
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 2) {
      setQuizScore((prev) => prev + 1);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/experiments')}
              className="text-slate-400 hover:text-white mb-2 p-0 h-auto font-normal flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              العودة إلى مختبر التجارب العلمية
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-pink-500/20">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                  مختبر كريسبر والمقص الجيني Cas9 ثلاثي الأبعاد (3D)
                </h1>
                <p className="text-sm text-slate-400">
                  تصميم المرشد gRNA، التعرف على تسلسل PAM، والقطع المزدوج والإصلاح الجيني فائق الدقة
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              {isPlaying ? <Pause className="w-4 h-4 ml-1 text-amber-400" /> : <Play className="w-4 h-4 ml-1 text-emerald-400" />}
              {isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة التجربة للبداية
            </Button>
          </div>
        </div>

        {/* Live Status Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الجين المستهدف</span>
              <p className="text-sm font-bold text-pink-400 mt-1">{selectedGene.nameAr}</p>
              <span className="text-[10px] text-slate-500">{selectedGene.diseaseAr.split('(')[0]}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">تسلسل PAM الأساسي</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{selectedGene.pamSequence}</p>
              <span className="text-[10px] text-slate-500">محدد موقع القطع NGG</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طول مرشد RNA</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">20 nt</p>
              <span className="text-[10px] text-slate-500">نيوكليوتيدات مكملة</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مرحلة المعالجة الحالية</span>
              <p className="text-xs font-bold text-purple-400 mt-1">
                {step === 'inspect' && '1. فحص الطفرة'}
                {step === 'hybridize' && '2. توجيه gRNA و Cas9'}
                {step === 'cleave' && '3. قطع مزدوج DSB'}
                {step === 'repair_hdr' && '4. إدخال قالب HDR'}
                {step === 'repaired' && '✓ تم العلاج بنجاح'}
              </p>
              <span className="text-[10px] text-slate-500">بروتوكول Cas9</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مسار الإصلاح المعتمد</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">HDR (استبدال دقيق)</p>
              <span className="text-[10px] text-slate-500">علاج تصحيحي</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دقة التعديل المستهدفة</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">99.8%</p>
              <span className="text-[10px] text-slate-500">خالٍ من الأخطاء العشوائية</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
              <Activity className="w-4 h-4" />
              مجمع Cas9 الجزيئي ثلاثي الأبعاد (3D Lab)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              البيولوجيا الجزيئية وآلية كريسبر
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: 3D Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D WebGL Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Dna className="w-4 h-4 text-pink-400" />
                      محاكاة المجمع الجزيئي ثلاثي الأبعاد (3D CRISPR-Cas9 Complex)
                    </CardTitle>
                    <Badge variant="outline" className="border-pink-500/50 text-pink-300 bg-pink-500/10">
                      {selectedGene.nameAr}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 h-[440px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 2.0, 7.5], fov: 45 }}>
                      <ambientLight intensity={0.7} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#ec4899" />
                      <CrisprComplex3D
                        step={step}
                        selectedGene={selectedGene}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={14}
                      />
                    </Canvas>

                    {/* 3D Controls Helper */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>اسحب للتدوير 360° حول شريط الـ DNA وإنزيم Cas9</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-pink-400" />
                      لوحة قيادة التعديل الجيني
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Gene Target Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر الجين والطفرة المستهدفة</label>
                      <div className="space-y-1.5">
                        {TARGET_GENES.map((gene) => (
                          <button
                            key={gene.id}
                            onClick={() => {
                              setSelectedGene(gene);
                              handleReset();
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedGene.id === gene.id
                                ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{gene.nameAr}</div>
                            <div className="text-[10px] opacity-75">{gene.diseaseAr}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sequence Preview Box */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                      <span className="text-[10px] text-slate-400 block font-sans">تسلسل الهدف والـ PAM:</span>
                      <div className="text-slate-200 tracking-wider break-all">
                        {selectedGene.targetSequence}
                        <span className="text-amber-400 font-bold bg-amber-500/20 px-1 rounded ml-1">
                          [{selectedGene.pamSequence}]
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Action Button */}
                    <div className="pt-2">
                      <Button
                        onClick={handleNextStep}
                        disabled={step === 'repaired'}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs"
                      >
                        {step === 'inspect' && '1. إرسال وتوجيه مرشد gRNA و Cas9 🚀'}
                        {step === 'hybridize' && '2. تنفيذ القطع المزدوج DSB ✂️'}
                        {step === 'cleave' && '3. إدخال قالب الإصلاح HDR 🧬'}
                        {step === 'repair_hdr' && '4. إتمام العلاج الجيني والتصحيح ✓'}
                        {step === 'repaired' && 'تم استبدال الطفرة بنجاح 🎉'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-pink-300">نظام كريسبر-كاس9 والتعديل الجيني الثوري (جائزة نوبل 2020)</h3>
              <p>
                نالت العالمتان إيمانويل شاربنتييه وجينيفر داودنا جائزة نوبل في الكيمياء لعام 2020 لاكتشافهما إعادة برمجة نظام المناعة البكتيري CRISPR-Cas9 واستخدامه كأدق مقص جزيئي في تاريخ البشرية لتعديل الشيفرة الوراثية بدقة النيوكليوتيد الواحد.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. تسلسل PAM (Protospacer Adjacent Motif)</h4>
                  <p className="text-xs text-slate-400">
                    تسلسل قصير يتكون من 3 نيوكليوتيدات (عادة NGG) بجوار موقع الهدف مباشرة، بدونه لا يستطيع إنزيم Cas9 فتح شريطي الـ DNA أو إحداث القطع.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. مسارات الإصلاح الخلوي</h4>
                  <p className="text-xs text-slate-400">
                    <strong>NHEJ (ضم النهايات غير المتماثلة):</strong> يؤدي لتعطيل الجين (Knockout).<br/>
                    <strong>HDR (الإصلاح الموجه بالتماثل):</strong> يتيح إدخال تسلسل سليم وتصحيح الطفرة بدقة (Knock-in).
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
                  اختبار مفاهيم كريسبر-كاس9
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما هو الدور الحيوي لتسلسل PAM (NGG) في آلية عمل نظام CRISPR-Cas9؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'يعمل كجسر لنقل البروتينات إلى خارج النواة.' },
                    { id: 1, text: 'يمنع التصاق جزيء RNA بالهدف.' },
                    { id: 2, text: 'إشارة تعرف ضرورية لإنزيم Cas9 للارتباط بشريط DNA وفتح الحلزون المزدوج قبل بدء التثبيت والقطع.' },
                    { id: 3, text: 'يقوم بتدمير جزيء Cas9 بعد انتهاء المهمة.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 2
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
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 2 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 2 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة ورائعة! تسلسل PAM هو المفتاح الحاسم لربط Cas9 بالموقع المستهدف وفك التفاف شريطي الـ DNA لمطابقتهما مع مرشد RNA.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تسلسل PAM ضروري جداً لتعرف إنزيم Cas9 المبدئي على موقع القطع.</span>
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
