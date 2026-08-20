import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Gauge, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface AeroModel {
  id: string;
  nameAr: string;
  nameEn: string;
  baseCl: number;
  baseCd: number;
  stallAngleDeg: number;
}

const MODELS: AeroModel[] = [
  { id: 'naca-airfoil', nameAr: 'جناح طائرة انسيابي (NACA 2412 Airfoil)', nameEn: 'NACA 2412 Airfoil', baseCl: 0.25, baseCd: 0.02, stallAngleDeg: 15 },
  { id: 'sports-car', nameAr: 'سيارة رياضية انسيابية (Sports Car)', nameEn: 'Sports Car', baseCl: -0.15, baseCd: 0.28, stallAngleDeg: 25 },
  { id: 'cylinder', nameAr: 'أسطوانة دائرية (Cylinder)', nameEn: 'Cylinder', baseCl: 0.0, baseCd: 0.45, stallAngleDeg: 90 },
  { id: 'flat-plate', nameAr: 'لوح مسطح (Flat Plate)', nameEn: 'Flat Plate', baseCl: 0.0, baseCd: 1.10, stallAngleDeg: 10 },
];

export default function AerodynamicsWindTunnelSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [selectedModel, setSelectedModel] = useState<AeroModel>(MODELS[0]);
  const [airspeedMs, setAirspeedMs] = useState<number>(60); // 0 to 120 m/s (216 km/h)
  const [angleOfAttackDeg, setAngleOfAttackDeg] = useState<number>(6); // -10 to +25 degrees
  const [altitudeMeters, setAltitudeMeters] = useState<number>(0); // 0 to 10000 m
  const [smokeStreams, setSmokeStreams] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Air density rho at altitude h: rho = rho0 * exp(-h / 8500)
  const airDensityKgM3 = useMemo(() => {
    return +(1.225 * Math.exp(-altitudeMeters / 8500)).toFixed(3);
  }, [altitudeMeters]);

  // Is Aerodynamic Stall active?
  const isStalled = useMemo(() => {
    return Math.abs(angleOfAttackDeg) >= selectedModel.stallAngleDeg;
  }, [angleOfAttackDeg, selectedModel]);

  // Dynamic Lift Coefficient Cl & Drag Coefficient Cd
  const { Cl, Cd } = useMemo(() => {
    const alphaRad = (angleOfAttackDeg * Math.PI) / 180;
    let cl = 0;
    let cd = selectedModel.baseCd;

    if (selectedModel.id === 'naca-airfoil') {
      if (!isStalled) {
        cl = selectedModel.baseCl + 2 * Math.PI * alphaRad * 0.9;
        cd = selectedModel.baseCd + 0.04 * Math.pow(alphaRad, 2);
      } else {
        // Post-stall drop in lift, massive drag
        cl = Math.max(0.2, (selectedModel.baseCl + 2 * Math.PI * (selectedModel.stallAngleDeg * Math.PI / 180)) * 0.5);
        cd = 0.35 + 0.6 * Math.sin(Math.abs(alphaRad));
      }
    } else if (selectedModel.id === 'sports-car') {
      cl = selectedModel.baseCl - 0.2 * Math.sin(alphaRad); // downforce
      cd = selectedModel.baseCd + 0.1 * Math.abs(alphaRad);
    } else if (selectedModel.id === 'flat-plate') {
      cl = Math.sin(2 * alphaRad);
      cd = 0.1 + 1.2 * Math.pow(Math.sin(alphaRad), 2);
    } else {
      cl = 0;
      cd = selectedModel.baseCd;
    }

    return { Cl: +cl.toFixed(2), Cd: +cd.toFixed(3) };
  }, [selectedModel, angleOfAttackDeg, isStalled]);

  // Lift & Drag Forces in Newtons: F = 0.5 * rho * v^2 * A * C
  const wingAreaM2 = 2.5; // m^2 reference area
  const liftForceN = useMemo(() => {
    return +(0.5 * airDensityKgM3 * Math.pow(airspeedMs, 2) * wingAreaM2 * Cl).toFixed(1);
  }, [airDensityKgM3, airspeedMs, Cl]);

  const dragForceN = useMemo(() => {
    return +(0.5 * airDensityKgM3 * Math.pow(airspeedMs, 2) * wingAreaM2 * Cd).toFixed(1);
  }, [airDensityKgM3, airspeedMs, Cd]);

  // Lift to Drag Ratio
  const liftToDragRatio = useMemo(() => {
    if (Cd === 0) return 0;
    return +(Cl / Cd).toFixed(1);
  }, [Cl, Cd]);

  // Polar Curve Data for NACA Airfoil (Cl vs Alpha)
  const polarData = useMemo(() => {
    const data = [];
    for (let a = -8; a <= 22; a += 1) {
      const aRad = (a * Math.PI) / 180;
      let clVal = 0;
      if (Math.abs(a) < 15) {
        clVal = 0.25 + 2 * Math.PI * aRad * 0.9;
      } else {
        clVal = Math.max(0.2, (0.25 + 2 * Math.PI * (15 * Math.PI / 180)) * 0.55);
      }
      data.push({
        alpha: a,
        Cl: +clVal.toFixed(2),
      });
    }
    return data;
  }, []);

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number; y: number; streamId: number }> = [];

    // Initialize streamline particles
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: 40 + (i % 12) * 22,
        streamId: i % 12,
      });
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Tunnel Background & Walls
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top and Bottom Tunnel Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 25);
      ctx.lineTo(canvas.width, 25);
      ctx.moveTo(0, canvas.height - 25);
      ctx.lineTo(canvas.width, canvas.height - 25);
      ctx.stroke();

      // Draw Airfoil / Test Model
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((-angleOfAttackDeg * Math.PI) / 180);

      if (selectedModel.id === 'naca-airfoil') {
        // Draw Airfoil shape
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-60, 0);
        ctx.bezierCurveTo(-40, -25, 20, -20, 70, 0);
        ctx.bezierCurveTo(20, 8, -40, 10, -60, 0);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (selectedModel.id === 'sports-car') {
        // Draw Car profile
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(-50, -10, 100, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(-20, -24, 45, 15, 4);
        ctx.fill();
      } else if (selectedModel.id === 'flat-plate') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, -45, 12, 90);
      } else {
        // Cylinder
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Update & Draw Smoke Streamlines
      ctx.save();
      const speedPx = Math.max(1, (airspeedMs / 60) * 5.5);

      for (const p of particles) {
        if (isPlaying) {
          p.x += speedPx;
          if (p.x > canvas.width) {
            p.x = 10;
            p.y = 40 + p.streamId * 22;
          }

          // Flow deflection around body
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.hypot(dx, dy);

          if (dist < 60) {
            // Deflect over or under
            if (dy < 0) {
              p.y -= 1.8; // accelerated over upper camber
            } else {
              p.y += 1.2;
            }

            // Stall turbulence if applicable
            if (isStalled && dx > 0) {
              p.y += (Math.random() - 0.5) * 6;
            }
          }
        }

        // Draw smoke particle
        ctx.fillStyle = isStalled && p.x > centerX ? 'rgba(239, 68, 68, 0.7)' : 'rgba(224, 242, 254, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, smokeStreams ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw Force Vectors on Airfoil
      ctx.save();
      // Lift Vector (Upwards)
      if (Math.abs(liftForceN) > 10) {
        const liftLen = Math.min(60, (liftForceN / 1500) * 45);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - liftLen);
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px Cairo, sans-serif';
        ctx.fillText(`الرفع: ${liftForceN} N`, centerX + 10, centerY - liftLen - 4);
      }

      // Drag Vector (Backwards)
      if (dragForceN > 10) {
        const dragLen = Math.min(60, (dragForceN / 1000) * 40);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + dragLen, centerY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Cairo, sans-serif';
        ctx.fillText(`السحب: ${dragForceN} N`, centerX + dragLen + 6, centerY + 4);
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [airspeedMs, angleOfAttackDeg, selectedModel, isStalled, smokeStreams, isPlaying, liftForceN, dragForceN]);

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
              <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-700 rounded-2xl shadow-lg shadow-sky-500/20">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                  نفق الرياح والديناميكا الهوائية (Aerodynamics Wind Tunnel)
                </h1>
                <p className="text-sm text-slate-400">
                  محاكاة قوى الرفع والسحب، مبدأ برنولي، وزاوية الهجوم وظاهرة الانهيار الهوائي (Stall)
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
                setAngleOfAttackDeg(6);
                setAirspeedMs(60);
              }}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة ضبط زاوية الطيران
            </Button>
          </div>
        </div>

        {/* Live Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">قوة الرفع (\(L\))</span>
              <p className="text-lg font-bold text-emerald-400">{liftForceN} N</p>
              <span className="text-[10px] text-slate-500 font-mono">\(C_L = {Cl}\)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">قوة السحب / الإعاقة (\(D\))</span>
              <p className="text-lg font-bold text-rose-400">{dragForceN} N</p>
              <span className="text-[10px] text-slate-500 font-mono">\(C_D = {Cd}\)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">كفاءة الرفع للسحب (\(L/D\))</span>
              <p className="text-lg font-bold text-sky-400">{liftToDragRatio}</p>
              <span className="text-[10px] text-slate-500">الأداء الانسيابي</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">سرعة تدفق الهواء (\(v\))</span>
              <p className="text-lg font-bold text-cyan-400">{airspeedMs} m/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(airspeedMs * 3.6).toFixed(0)} km/h</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زاوية الهجوم (\(\alpha\))</span>
              <p className="text-lg font-bold text-amber-400">{angleOfAttackDeg}°</p>
              <span className="text-[10px] text-slate-500">زاوية الميل</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة الجريان الهوائي</span>
              <p className={`text-xs font-bold mt-1 ${isStalled ? 'text-red-400' : 'text-emerald-400'}`}>
                {isStalled ? '⚠️ انهيار هوائي (Stall)' : '✓ جريان انسيابي صفائحي'}
              </p>
              <span className="text-[10px] text-slate-500">حالة الجناح</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Activity className="w-4 h-4" />
              نفق الرياح الافتراضي
            </TabsTrigger>
            <TabsTrigger value="curves" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Sparkles className="w-4 h-4" />
              منحنى الرفع مع زاوية الهجوم
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              مبدأ برنولي وديناميكا الطيران
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
                      <Wind className="w-4 h-4 text-sky-400" />
                      غرفة الاختبار ونفق الدخان (Smoke Streamlines Flow)
                    </CardTitle>
                    {isStalled && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        تحذير: انفصال الطبقة الجدارية وانهيار الرفع
                      </Badge>
                    )}
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
                      <Gauge className="w-4 h-4 text-sky-400" />
                      التحكم بالنفق الهوائي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Model Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">شكل الجسم المختبر (Test Body)</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {MODELS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedModel(m)}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right flex justify-between items-center ${
                              selectedModel.id === m.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="font-bold">{m.nameAr}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Airspeed Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">سرعة الرياح (\(v\))</span>
                        <span className="font-mono font-bold text-sky-400">{airspeedMs} m/s</span>
                      </div>
                      <Slider
                        value={[airspeedMs]}
                        min={0}
                        max={120}
                        step={5}
                        onValueChange={(val) => setAirspeedMs(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Angle of Attack Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">زاوية الهجوم (\(\alpha\))</span>
                        <span className="font-mono font-bold text-amber-400">{angleOfAttackDeg}°</span>
                      </div>
                      <Slider
                        value={[angleOfAttackDeg]}
                        min={-10}
                        max={25}
                        step={1}
                        onValueChange={(val) => setAngleOfAttackDeg(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>هبوط (-10°)</span>
                        <span>0°</span>
                        <span>انهيار (+25°)</span>
                      </div>
                    </div>

                    {/* Altitude Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">الارتفاع عن سطح البحر (كثافة الهواء)</span>
                        <span className="font-mono font-bold text-indigo-300">{altitudeMeters} m</span>
                      </div>
                      <Slider
                        value={[altitudeMeters]}
                        min={0}
                        max={10000}
                        step={500}
                        onValueChange={(val) => setAltitudeMeters(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>سطح البحر (1.22 kg/m³)</span>
                        <span>10,000m (0.37 kg/m³)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Polar Curves */}
          <TabsContent value="curves" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-300">منحنى معامل الرفع مع زاوية الهجوم (Cl vs α)</h3>
              <p className="text-xs text-slate-400">
                لاحظ التزايد الخطي لمعامل الرفع حتى زاوية الانهيار (α ≈ 15°)، حيث ينفصل تيار الهواء العلوي ويهبط الرفع بشكل حاد.
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={polarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="alpha" stroke="#94a3b8" label={{ value: 'زاوية الهجوم (°)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'معامل الرفع Cl', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <ReferenceLine x={15} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'زاوية الانهيار Stall', fill: '#ef4444', fontSize: 10 }} />
                    <Line type="monotone" dataKey="Cl" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="معامل الرفع Cl" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-sky-300">الديناميكا الهوائية وتوليد قوى الرفع للطائرات</h3>
              <p>
                تنشأ قوة الرفع بشكل أساسي نتيجة انحناء تيار الهواء حول الجناح، مما يُحدث فرقاً في الضغط بين السطح العلوي والسفلي للجناح وفقاً لمبدأ برنولي وقوانين نيوتن للحركة.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة قوة الرفع (Lift Equation)</h4>
                  <p className="text-sm font-mono text-sky-300">L = ½ · CL · ρ · v² · A</p>
                  <p className="text-xs text-slate-400">
                    تعتمد قوة الرفع على مربع سرعة الطائرة (\(v^2\)) وكثافة الهواء (\(\rho\)) ومساحة الجناح (\(A\)).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. ظاهرة الانهيار الهوائي (Aerodynamic Stall)</h4>
                  <p className="text-xs text-slate-400">
                    عند زيادة زاوية الهجوم أكثر من اللازم، يعجز تدفق الهواء عن تتبع انحناء السطح العلوي، فتتكون دوامات هوائية مضطربة تؤدي إلى فقدان فوري ومفاجئ لقوة الرفع.
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
                  اختبار مفاهيم الديناميكا الهوائية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا تضاعفت سرعة الطائرة في الجو إلى الضعف (\(2v\)) مع بقاء باقي العوامل ثابتة، فكم مرة تتضاعف قوة الرفع (\(L\)) المتولدة على الأجنحة؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تتضاعف مرتين فقط (2L).' },
                    { id: 1, text: 'تتضاعف 4 مرات (4L) لأن قوة الرفع تتناسب مع مربع السرعة.' },
                    { id: 2, text: 'تبقى ثابتة دون تغيير.' },
                    { id: 3, text: 'تتضاعف 8 مرات.' },
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
                        <span>إجابة صحيحة وممتازة! معادلة الرفع توضح أن \(L \propto v^2\)، وبالتالي مضاعفة السرعة تضاعف قوة الرفع 4 مرات (\((2)^2 = 4\)).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. قوة الرفع تتناسب طردياً مع مربع السرعة (\(v^2\))، فعند مضاعفة السرعة تصبح قوة الرفع أربعة أضعاف.</span>
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
