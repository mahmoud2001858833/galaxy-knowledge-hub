import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Flame, Gauge, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface ReactionModel {
  id: string;
  nameAr: string;
  equationAr: string;
  deltaH: number; // in kJ/mol (negative = exothermic, positive = endothermic)
  colorA: string;
  colorB: string;
  colorC: string;
  nameA: string;
  nameB: string;
  nameC: string;
  coeffA: number;
  coeffB: number;
  coeffC: number;
  gasReaction: boolean;
}

const REACTIONS: ReactionModel[] = [
  {
    id: 'no2-n2o4',
    nameAr: 'توازن غازات ثاني أكسيد النيتروجين (بني) ورابع أكسيد النيتروجين (شفاف)',
    equationAr: '2 NO₂(g) [بني] ⇌ N₂O₄(g) [عديم اللون] + 57.2 kJ',
    deltaH: -57.2,
    colorA: '#b45309', // Brown NO2
    colorB: '#38bdf8', // Dummy
    colorC: '#e2e8f0', // Clear/Light N2O4
    nameA: 'NO₂ (بني)',
    nameB: '-',
    nameC: 'N₂O₄ (شفاف)',
    coeffA: 2,
    coeffB: 0,
    coeffC: 1,
    gasReaction: true,
  },
  {
    id: 'haber-ammonia',
    nameAr: 'تخليق الأمونيا بطريقة هابر-بوش (Haber-Bosch)',
    equationAr: 'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g) + 92.4 kJ',
    deltaH: -92.4,
    colorA: '#38bdf8', // Blue N2
    colorB: '#a855f7', // Purple H2
    colorC: '#10b981', // Green NH3
    nameA: 'N₂',
    nameB: 'H₂',
    nameC: 'NH₃',
    coeffA: 1,
    coeffB: 3,
    coeffC: 2,
    gasReaction: true,
  },
  {
    id: 'cobalt-complex',
    nameAr: 'معقد كلوريد الكوبالت الملون (Cobalt Complex)',
    equationAr: '[Co(H₂O)₆]²⁺ (وردي) + 4 Cl⁻ + Heat ⇌ [CoCl₄]²⁻ (أزرق) + 6 H₂O',
    deltaH: +50.0, // Endothermic
    colorA: '#f43f5e', // Pink
    colorB: '#eab308', // Yellow/Chloride
    colorC: '#3b82f6', // Blue complex
    nameA: 'المعقد الوردي',
    nameB: 'Cl⁻',
    nameC: 'المعقد الأزرق',
    coeffA: 1,
    coeffB: 4,
    coeffC: 1,
    gasReaction: false,
  },
];

export default function ChemicalEquilibriumSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment State
  const [selectedReaction, setSelectedReaction] = useState<ReactionModel>(REACTIONS[0]);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(25); // 0 to 100 C
  const [volumeLiters, setVolumeLiters] = useState<number>(5.0); // 2 to 10 L (Pressure inverse)
  const [concA, setConcA] = useState<number>(0.8); // mol/L
  const [concB, setConcB] = useState<number>(1.2); // mol/L
  const [concC, setConcC] = useState<number>(0.5); // mol/L
  const [timeHistory, setTimeHistory] = useState<Array<{ time: number; A: number; B: number; C: number }>>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Equilibrium constant calculation adjusted for temperature (van 't Hoff)
  const Kc = useMemo(() => {
    const T = temperatureCelsius + 273.15;
    const T0 = 298.15;
    const R = 8.314;
    const deltaH_J = selectedReaction.deltaH * 1000;
    const standardKc = 4.0;
    // ln(Kc / Kc0) = -(deltaH / R) * (1/T - 1/T0)
    const exponent = -(deltaH_J / R) * ((1 / T) - (1 / T0));
    return +(standardKc * Math.exp(exponent)).toFixed(2);
  }, [temperatureCelsius, selectedReaction]);

  // Reaction Quotient Q = [C]^c / ([A]^a * [B]^b)
  const Q = useMemo(() => {
    let denom = 1;
    if (selectedReaction.coeffA > 0) denom *= Math.pow(Math.max(0.01, concA), selectedReaction.coeffA);
    if (selectedReaction.coeffB > 0) denom *= Math.pow(Math.max(0.01, concB), selectedReaction.coeffB);
    const num = Math.pow(Math.max(0.01, concC), selectedReaction.coeffC);
    return +(num / denom).toFixed(2);
  }, [concA, concB, concC, selectedReaction]);

  // Shift Direction
  const shiftDirection = useMemo(() => {
    if (Math.abs(Q - Kc) < 0.1) return 'at_equilibrium';
    return Q < Kc ? 'forward' : 'reverse';
  }, [Q, Kc]);

  // Kinetic Step & Equilibrium convergence loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      // Dynamic shift toward equilibrium
      setConcA((a) => {
        let newA = a;
        setConcC((c) => {
          let newC = c;
          setConcB((b) => {
            let newB = b;
            const rate = 0.03;
            if (shiftDirection === 'forward') {
              // Reactants -> Products
              newA = Math.max(0.05, a - rate * selectedReaction.coeffA);
              if (selectedReaction.coeffB > 0) newB = Math.max(0.05, b - rate * selectedReaction.coeffB);
              newC = c + rate * selectedReaction.coeffC;
            } else if (shiftDirection === 'reverse') {
              // Products -> Reactants
              newA = a + rate * selectedReaction.coeffA;
              if (selectedReaction.coeffB > 0) newB = b + rate * selectedReaction.coeffB;
              newC = Math.max(0.05, c - rate * selectedReaction.coeffC);
            }
            return +newB.toFixed(2);
          });
          return +newC.toFixed(2);
        });
        return +newA.toFixed(2);
      });

      // Update concentration history
      setTimeHistory((prev) => {
        const nextTime = prev.length > 0 ? prev[prev.length - 1].time + 1 : 1;
        const entry = {
          time: nextTime,
          A: +concA.toFixed(2),
          B: +concB.toFixed(2),
          C: +concC.toFixed(2),
        };
        return [...prev.slice(-30), entry];
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, shiftDirection, selectedReaction, concA, concB, concC]);

  // Canvas visualizer (Molecules in chamber)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let molecules: Array<{ x: number; y: number; vx: number; vy: number; type: 'A' | 'B' | 'C' }> = [];

    // Populate molecules
    for (let i = 0; i < Math.min(30, Math.round(concA * 15)); i++) {
      molecules.push({ x: 50 + Math.random() * 380, y: 50 + Math.random() * 240, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: 'A' });
    }
    for (let i = 0; i < Math.min(30, Math.round(concC * 15)); i++) {
      molecules.push({ x: 50 + Math.random() * 380, y: 50 + Math.random() * 240, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: 'C' });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gas chamber background color based on NO2 concentration
      if (selectedReaction.id === 'no2-n2o4') {
        const brownIntensity = Math.min(0.8, concA * 0.4);
        ctx.fillStyle = `rgba(180, 83, 9, ${brownIntensity})`;
      } else if (selectedReaction.id === 'cobalt-complex') {
        // Cobalt color pink vs blue
        const pinkRatio = concA / (concA + concC || 1);
        ctx.fillStyle = pinkRatio > 0.5 ? `rgba(244, 63, 94, 0.35)` : `rgba(59, 130, 246, 0.35)`;
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Piston & Chamber Outline
      ctx.save();
      const chamberWidth = 350 + (volumeLiters / 10) * 150;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, chamberWidth, 280);

      // Draw Piston Wall on the right
      ctx.fillStyle = '#475569';
      ctx.fillRect(30 + chamberWidth, 20, 16, 300);
      ctx.restore();

      // Update & Draw Molecules
      ctx.save();
      for (const m of molecules) {
        if (isPlaying) {
          const speedFactor = 0.8 + (temperatureCelsius / 100) * 1.5;
          m.x += m.vx * speedFactor;
          m.y += m.vy * speedFactor;

          // Bounce off chamber walls
          if (m.x < 40 || m.x > 20 + chamberWidth) m.vx *= -1;
          if (m.y < 40 || m.y > 300) m.vy *= -1;
        }

        ctx.fillStyle = m.type === 'A' ? selectedReaction.colorA : selectedReaction.colorC;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.type === 'A' ? 6 : 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedReaction, concA, concC, temperatureCelsius, volumeLiters, isPlaying]);

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 0) {
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
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Beaker className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                  الاتزان الكيميائي ومبدأ لوشاتيليه الديناميكي
                </h1>
                <p className="text-sm text-slate-400">
                  دراسة استجابة الأنظمة الكيميائية المتزنة لتغيرات درجة الحرارة والضغط والتركيز
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
              onClick={() => {
                setConcA(0.8);
                setConcB(1.2);
                setConcC(0.5);
                setTimeHistory([]);
              }}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة ضبط التراكيز
            </Button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ثابت الاتزان (\(K_c\))</span>
              <p className="text-lg font-bold text-emerald-400">{Kc}</p>
              <span className="text-[10px] text-slate-500">عند حرارة {temperatureCelsius}°C</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حاصل التفاعل (\(Q\))</span>
              <p className="text-lg font-bold text-sky-400">{Q}</p>
              <span className="text-[10px] text-slate-500 font-mono">
                {Q < Kc ? 'Q < Kc' : Q > Kc ? 'Q > Kc' : 'Q = Kc'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">اتجاه الإزاحة (Shift)</span>
              <p className="text-sm font-bold text-amber-400 mt-1">
                {shiftDirection === 'forward'
                  ? 'طردي نحو النواتج →'
                  : shiftDirection === 'reverse'
                  ? 'عكسي نحو المتفاعلات ←'
                  : '✓ في حالة اتزان ديناميكي'}
              </p>
              <span className="text-[10px] text-slate-500">لوشاتيليه</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">تركيز المتفاعلات [{selectedReaction.nameA}]</span>
              <p className="text-lg font-bold text-orange-400">{concA} M</p>
              <span className="text-[10px] text-slate-500">mol / L</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">تركيز النواتج [{selectedReaction.nameC}]</span>
              <p className="text-lg font-bold text-cyan-400">{concC} M</p>
              <span className="text-[10px] text-slate-500">mol / L</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حرارة التفاعل (\(\Delta H\))</span>
              <p className="text-lg font-bold text-purple-400">{selectedReaction.deltaH} kJ</p>
              <span className="text-[10px] text-slate-500">
                {selectedReaction.deltaH < 0 ? 'تفاعل طارد للحرارة' : 'تفاعل ماص للحرارة'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Activity className="w-4 h-4" />
              حجرة التفاعل التفاعلية
            </TabsTrigger>
            <TabsTrigger value="curves" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Sparkles className="w-4 h-4" />
              منحنيات التراكيز مع الزمن
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              الأساس النظري وقوانين الاتزان
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Main Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas Chamber */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Beaker className="w-4 h-4 text-emerald-400" />
                      وعاء التفاعل المحكم (Closed Reaction Chamber)
                    </CardTitle>
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-mono">
                      {selectedReaction.equationAr}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-slate-950/70">
                    <canvas
                      ref={canvasRef}
                      width={560}
                      height={340}
                      className="w-full max-w-[560px] h-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-inner"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      التحكم بمتغيرات النظام (لوشاتيليه)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Reaction Selection */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر التفاعل الكيميائي</label>
                      <div className="space-y-1.5">
                        {REACTIONS.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedReaction(r)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedReaction.id === r.id
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{r.nameAr}</div>
                            <div className="text-[10px] font-mono opacity-80 mt-1">{r.equationAr}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">درجة الحرارة (\(T\))</span>
                        <span className="font-mono font-bold text-amber-400">{temperatureCelsius} °C</span>
                      </div>
                      <Slider
                        value={[temperatureCelsius]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => setTemperatureCelsius(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>تبريد (0°C)</span>
                        <span>25°C</span>
                        <span>تسخين (100°C)</span>
                      </div>
                    </div>

                    {/* Volume/Pressure Slider */}
                    {selectedReaction.gasReaction && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">حجم الوعاء (\(V\)) / الضغط العكسي</span>
                          <span className="font-mono font-bold text-sky-400">{volumeLiters.toFixed(1)} L</span>
                        </div>
                        <Slider
                          value={[volumeLiters]}
                          min={2}
                          max={10}
                          step={0.5}
                          onValueChange={(val) => setVolumeLiters(val[0])}
                          className="py-1"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>ضغط عالي (2L)</span>
                          <span>5L</span>
                          <span>ضغط منخفض (10L)</span>
                        </div>
                      </div>
                    )}

                    {/* Add/Remove Reactants Pump Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block">إضافة أو سحب المواد (Perturbation)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConcA((a) => +(a + 0.5).toFixed(2))}
                          className="border-slate-700 text-xs bg-slate-900"
                        >
                          <Plus className="w-3 h-3 ml-1 text-orange-400" />
                          حقن {selectedReaction.nameA}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConcC((c) => +(c + 0.5).toFixed(2))}
                          className="border-slate-700 text-xs bg-slate-900"
                        >
                          <Plus className="w-3 h-3 ml-1 text-cyan-400" />
                          حقن {selectedReaction.nameC}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Dynamic Curves */}
          <TabsContent value="curves" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-300">مخطط التراكيز مع الزمن (Concentration vs. Time)</h3>
              <p className="text-xs text-slate-400">
                شاهد كيف يغير النظام الكيميائي تراكيز المواد تدريجياً ليعود إلى وضع الاتزان (\(Q = K_c\)).
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'الزمن (s)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'التركيز (M)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="A" stroke="#f97316" strokeWidth={2} name={`[${selectedReaction.nameA}]`} dot={false} />
                    <Line type="monotone" dataKey="C" stroke="#06b6d4" strokeWidth={2} name={`[${selectedReaction.nameC}]`} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-emerald-300">مبدأ لوشاتيليه والاتزان الكيميائي الديناميكي</h3>
              <p>
                ينص مبدأ لوشاتيليه (Le Chatelier's Principle): <em>"إذا أُخضع نظام في حالة اتزان لتغير في التركيز أو الضغط أو درجة الحرارة، فإن النظام يستجيب في الاتجاه الذي يقلل من تأثير هذا التغير."</em>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. تأثير درجة الحرارة على Kc</h4>
                  <p className="text-xs text-slate-400">
                    في التفاعلات <strong>الطاردة للحرارة (ΔH &lt; 0)</strong>: رفع الحرارة يزيح الاتزان عكسياً ويقلل قيمة Kc.<br/>
                    في التفاعلات <strong>الماصة للحرارة (ΔH &gt; 0)</strong>: رفع الحرارة يزيح الاتزان طردياً ويزيد قيمة Kc.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. تأثير الضغط والحجم</h4>
                  <p className="text-xs text-slate-400">
                    زيادة الضغط (تقليل الحجم) يزيح الاتزان نحو الطرف الذي يحتوي على <strong>عدد مولات غازية أقل</strong> لتقليل الضغط الكلي.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار مفاهيم مبدأ لوشاتيليه
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: في تفاعل تكوين الأمونيا الطارد للحرارة (N₂ + 3H₂ ⇌ 2NH₃ + حرارة)، ما هي الظروف التي تزيد من إنتاج غاز الأمونيا (NH₃)؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'زيادة الضغط وخفض درجة الحرارة.' },
                    { id: 1, text: 'خفض الضغط ورفع درجة الحرارة.' },
                    { id: 2, text: 'سحب غاز النيتروجين من الوعاء.' },
                    { id: 3, text: 'زيادة حجم الوعاء مع التسخين.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 0
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
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 0 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة وممتازة! زيادة الضغط تزاح نحو عدد المولات الأقل (2 مول نواتج مقابل 4 مول متفاعلات)، وخفض الحرارة يرجح الاتجاه الطارد (تكوين الأمونيا).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. لزيادة إنتاج الأمونيا نحتاج لزيادة الضغط (لأن النواتج 2 مول بينما المتفاعلات 4 مول) وخفض الحرارة لأن التفاعل طارد للحرارة.</span>
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
