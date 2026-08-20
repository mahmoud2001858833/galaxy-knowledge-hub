import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface TargetMaterial {
  id: string;
  nameAr: string;
  nameEn: string;
  z: number; // Atomic Number Z
  symbol: string;
  color: string;
}

const MATERIALS: TargetMaterial[] = [
  { id: 'gold', nameAr: 'ذهب (Gold - Au)', nameEn: 'Gold', z: 79, symbol: 'Au', color: '#eab308' },
  { id: 'silver', nameAr: 'فضة (Silver - Ag)', nameEn: 'Silver', z: 47, symbol: 'Ag', color: '#94a3b8' },
  { id: 'copper', nameAr: 'نحاس (Copper - Cu)', nameEn: 'Copper', z: 29, symbol: 'Cu', color: '#f97316' },
  { id: 'aluminum', nameAr: 'ألمنيوم (Aluminum - Al)', nameEn: 'Aluminum', z: 13, symbol: 'Al', color: '#38bdf8' },
];

export default function RutherfordScatteringSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [selectedMaterial, setSelectedMaterial] = useState<TargetMaterial>(MATERIALS[0]);
  const [energyMev, setEnergyMev] = useState<number>(5.5); // Alpha energy in MeV (2 to 10)
  const [modelType, setModelType] = useState<'rutherford' | 'thomson'>('rutherford');
  const [beamIntensity, setBeamIntensity] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Stats / Detection Counters
  const [totalFired, setTotalFired] = useState<number>(0);
  const [forwardDeflected, setForwardDeflected] = useState<number>(0); // 0 - 45 deg
  const [mediumDeflected, setMediumDeflected] = useState<number>(0); // 45 - 90 deg
  const [backScattered, setBackScattered] = useState<number>(0); // > 90 deg (Rutherford signature!)

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Closest approach distance d_min = (2 * Z * e^2) / (4 * pi * eps0 * Ek) in femtometers (fm)
  const closestApproachFm = useMemo(() => {
    // 1.44 MeV*fm for e^2 / (4*pi*eps0)
    // d_min = 2 * Z * 1.44 / E_MeV
    return +((2 * selectedMaterial.z * 1.44) / energyMev).toFixed(2);
  }, [selectedMaterial, energyMev]);

  // Histogram data for scattering angles
  const angleHistogramData = useMemo(() => {
    return [
      { bin: '0° - 15° (مباشر)', count: Math.round(forwardDeflected * 0.85), fill: '#38bdf8' },
      { bin: '15° - 45° (انحراف بسيط)', count: Math.round(forwardDeflected * 0.15), fill: '#3b82f6' },
      { bin: '45° - 90° (انحراف متوسط)', count: mediumDeflected, fill: '#f59e0b' },
      { bin: '90° - 180° (ارتداد خلفي)', count: backScattered, fill: '#ef4444' },
    ];
  }, [forwardDeflected, mediumDeflected, backScattered]);

  // Canvas render & particle trajectories
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let alphaParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      b: number; // impact parameter
      scattered: boolean;
    }> = [];

    const nucleusX = canvas.width / 2;
    const nucleusY = canvas.height / 2;
    const nucleusRadius = modelType === 'rutherford' ? 6 : 45; // tiny dense nucleus vs diffuse cloud

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark Chamber background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scintillation Screen Ring (Detector)
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(nucleusX, nucleusY, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Detector Screen Angles labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('0° (أمامي)', nucleusX + 175, nucleusY + 3);
      ctx.fillText('90°', nucleusX, nucleusY - 160);
      ctx.fillText('180° (ارتداد)', nucleusX - 175, nucleusY + 3);
      ctx.fillText('270°', nucleusX, nucleusY + 165);
      ctx.restore();

      // Draw Nucleus or Plum Pudding Atom
      ctx.save();
      if (modelType === 'rutherford') {
        // Rutherford Tiny Dense Nucleus (+Ze)
        ctx.fillStyle = selectedMaterial.color;
        ctx.shadowColor = selectedMaterial.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, nucleusRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${selectedMaterial.z}`, nucleusX, nucleusY + 3);

        // Electron cloud faint boundary
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, 100, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Thomson Plum Pudding Model (Diffuse positive pudding with embedded electrons)
        const puddingGrad = ctx.createRadialGradient(nucleusX, nucleusY, 5, nucleusX, nucleusY, nucleusRadius);
        puddingGrad.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        puddingGrad.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
        ctx.fillStyle = puddingGrad;
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, nucleusRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.stroke();

        // Small negative electrons in pudding
        for (let i = 0; i < 6; i++) {
          const eAngle = i * (Math.PI / 3);
          const ex = nucleusX + Math.cos(eAngle) * 22;
          const ey = nucleusY + Math.sin(eAngle) * 22;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Spawn Alpha Particles from Source Gun (Left side)
      if (isPlaying && Math.random() < (beamIntensity / 100) * 0.4) {
        const impactOffset = (Math.random() - 0.5) * 160; // impact parameter b from -80 to +80
        alphaParticles.push({
          x: 40,
          y: nucleusY + impactOffset,
          vx: 3.5 + (energyMev / 10) * 2.5,
          vy: 0,
          b: impactOffset,
          scattered: false,
        });
        setTotalFired((t) => t + 1);
      }

      // Update and Draw Alpha Particles
      ctx.save();
      for (let i = alphaParticles.length - 1; i >= 0; i--) {
        const p = alphaParticles[i];

        if (isPlaying) {
          if (modelType === 'rutherford') {
            // Coulomb Repulsion F = k * (2 * Z * e^2) / r^2
            const dx = p.x - nucleusX;
            const dy = p.y - nucleusY;
            const rSq = dx * dx + dy * dy;
            const r = Math.sqrt(rSq);

            if (r > 4) {
              const coulombStrength = (selectedMaterial.z * 120) / (energyMev * 0.8);
              const force = coulombStrength / (rSq + 50);
              p.vx += (dx / r) * force;
              p.vy += (dy / r) * force;
            }
          } else {
            // Thomson model: negligible deflection
            p.vy += (Math.random() - 0.5) * 0.05;
          }

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw Alpha Particle (dual red/gold dot)
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Check if hits detector ring (distance from center >= 150)
        const distFromCenter = Math.hypot(p.x - nucleusX, p.y - nucleusY);
        if (distFromCenter >= 150 && !p.scattered) {
          p.scattered = true;
          // Calculate angle relative to initial +X direction (0 to 180 degrees)
          const finalAngleRad = Math.atan2(p.vy, p.vx);
          const deg = Math.abs(finalAngleRad * (180 / Math.PI));

          if (deg < 45) {
            setForwardDeflected((prev) => prev + 1);
          } else if (deg < 90) {
            setMediumDeflected((prev) => prev + 1);
          } else {
            setBackScattered((prev) => prev + 1);
          }
        }

        // Remove out-of-bound particles
        if (p.x < 10 || p.x > canvas.width - 10 || p.y < 10 || p.y > canvas.height - 10) {
          alphaParticles.splice(i, 1);
        }
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, modelType, selectedMaterial, energyMev, beamIntensity]);

  const handleResetCounters = () => {
    setTotalFired(0);
    setForwardDeflected(0);
    setMediumDeflected(0);
    setBackScattered(0);
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
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-red-600 rounded-2xl shadow-lg shadow-yellow-500/20">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-200 to-red-400 bg-clip-text text-transparent">
                  تشتت رذرفورد واكتشاف النواة الذرية
                </h1>
                <p className="text-sm text-slate-400">
                  إطلاق جسيمات ألفا نحو رقاقة الذهب واكتشاف تركيز كتلة وشحنة الذرة في نواة مركزية متناهية الصغر
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
              onClick={handleResetCounters}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              تصفير العدادات
            </Button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">إجمالي الجسيمات المطلقة</span>
              <p className="text-lg font-bold text-slate-200">{totalFired}</p>
              <span className="text-[10px] text-slate-500">جسيمات ألفا α</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">عبور مباشر (0° - 45°)</span>
              <p className="text-lg font-bold text-sky-400">{forwardDeflected}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((forwardDeflected / totalFired) * 100).toFixed(1)}%` : '0%'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">انحراف متوسط (45° - 90°)</span>
              <p className="text-lg font-bold text-amber-400">{mediumDeflected}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((mediumDeflected / totalFired) * 100).toFixed(1)}%` : '0%'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ارتداد خلفي نادراً (&gt; 90°)</span>
              <p className="text-lg font-bold text-red-400 font-mono">{backScattered}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((backScattered / totalFired) * 100).toFixed(2)}%` : '0%'} (دليل النواة)
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة الجسيم (\(E_k\))</span>
              <p className="text-lg font-bold text-emerald-400">{energyMev} MeV</p>
              <span className="text-[10px] text-slate-500 font-mono">{(energyMev * 1.602e-13).toExponential(2)} J</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">أقرب مسافة اقتراب (d_min)</span>
              <p className="text-lg font-bold text-purple-400">{closestApproachFm} fm</p>
              <span className="text-[10px] text-slate-500 font-mono">1 fm = 10⁻¹⁵ m</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Activity className="w-4 h-4" />
              حجرة التشتت والكاشف
            </TabsTrigger>
            <TabsTrigger value="histogram" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Sparkles className="w-4 h-4" />
              توزيع زوايا التشتت
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قانون رذرفورد ونموذج الذرة
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Main Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas View */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Target className="w-4 h-4 text-yellow-400" />
                      حجرة تشتت جسيمات ألفا (Scattering Chamber)
                    </CardTitle>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
                      النموذج: {modelType === 'rutherford' ? 'نموذج رذرفورد النووي' : 'نموذج طومسون (حلوى البرقوق)'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-slate-950/70">
                    <canvas
                      ref={canvasRef}
                      width={560}
                      height={360}
                      className="w-full max-w-[560px] h-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-inner"
                    />
                    <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-3 px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        جسيمات ألفا (نوى هيليوم He²⁺)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedMaterial.color }} />
                        نواة الهدف (+{selectedMaterial.z}e)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      إعدادات التجربة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Model Switch */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">النموذج الذري المفترض</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setModelType('rutherford')}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                            modelType === 'rutherford'
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400'
                          }`}
                        >
                          نموذج رذرفورد النووي
                        </button>
                        <button
                          onClick={() => setModelType('thomson')}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                            modelType === 'thomson'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400'
                          }`}
                        >
                          نموذج طومسون
                        </button>
                      </div>
                    </div>

                    {/* Material Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">مادة الرقيقة (Target Metal Foil)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {MATERIALS.map((mat) => (
                          <button
                            key={mat.id}
                            onClick={() => setSelectedMaterial(mat)}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right flex flex-col justify-between ${
                              selectedMaterial.id === mat.id
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="font-bold">{mat.nameAr}</span>
                            <span className="text-[10px] opacity-75 font-mono">العدد الذري Z = {mat.z}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Energy Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">طاقة جسيمات ألفا (\(E_k\))</span>
                        <span className="font-mono font-bold text-amber-400">{energyMev} MeV</span>
                      </div>
                      <Slider
                        value={[energyMev]}
                        min={2}
                        max={10}
                        step={0.5}
                        onValueChange={(val) => setEnergyMev(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Beam Intensity */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">كثافة الحزمة (Particles/s)</span>
                        <span className="font-mono font-bold text-sky-400">{beamIntensity}%</span>
                      </div>
                      <Slider
                        value={[beamIntensity]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(val) => setBeamIntensity(val[0])}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Histogram */}
          <TabsContent value="histogram" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-300">المدرج التكراري لزوايا التشتت (Angular Distribution)</h3>
              <p className="text-xs text-slate-400">
                يوضح المدرج كيف أن الغالبية العظمى تعبر بدون انحراف (فراغ هائل)، بينما نسبة ضئيلة جداً ترتد بزوايا حادة ناتجة عن التصادم مع النواة الثقيلة.
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={angleHistogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="bin" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#eab308" radius={[8, 8, 0, 0]} name="الجسيمات المسجلة" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-yellow-300">الأساس العلمي لتجربة إرنست رذرفورد (1911)</h3>
              <p>
                قام العالمان جايجر ومارسدن بإشراف رذرفورد بتوجيه جسيمات ألفا نحو رقاقة رقيقة جداً من الذهب، وكانت النتيجة المدهشة التي وصفها رذرفورد قائلاً: <em>"كان الأمر مذهلاً كما لو أطلقت قذيفة مدفعية عيار 15 بوصة على ورقة حريرية فارتدت وأصابتك!"</em>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. قانون رذرفورد للتشتت التفاضلي</h4>
                  <p className="text-sm font-mono text-yellow-300">dσ/dΩ ∝ (z² Z² e⁴) / (Ek² sin⁴(θ/2))</p>
                  <p className="text-xs text-slate-400">
                    عدد الجسيمات المتشتتة يتناسب عكسياً مع القوة الرابعة لجيب نصف زاوية التشتت \(\sin^4(\theta/2)\).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. الاستنتاجات الأساسية للنموذج النووي</h4>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    <li>معظم حجم الذرة فراغ تام (عبور 99.9% من الجسيمات دون انحراف).</li>
                    <li>تتركز كتلة الذرة وشحنتها الموجبة في حيز صغير جداً يسمى النواة.</li>
                  </ul>
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
                  اختبار مفاهيم تجربة رذرفورد
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما هو التفسير الفيزيائي الصحيح لارتداد نسبة ضئيلة جداً (حوالي 1 من كل 8000) من جسيمات ألفا بزوايا أكبر من 90 درجة؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'اصطدامها بالإلكترونات خفيفة الكتلة.' },
                    { id: 1, text: 'امتصاص الرقاقة للجسيمات وإعادة إشعاعها.' },
                    { id: 2, text: 'تنافر كولومي قوي جداً بسبب اقترابها المباشر من نواة موجبة كثيفة جداً تتركز فيها كتلة الذرة.' },
                    { id: 3, text: 'وجود مجال مغناطيسي أرضي قوي داخل الرقاقة.' },
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
                        <span>إجابة صحيحة ومثالية! هذا الارتداد النادر أثبت أن الشحنة الموجبة ليست موزعة بانتظام كما كان يظن طومسون، بل محصورة في نواة ذرية فائقة الكثافة.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. الارتداد الحاد لا يمكن أن يحدث إلا بتنافر كهربائي شديد مع جسم موجب يحمل تقريباً كل كتلة الذرة (النواة).</span>
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
