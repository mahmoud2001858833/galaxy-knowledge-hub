import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Flame, Droplets, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface Droplet {
  id: number;
  x: number; // in canvas pixels
  y: number; // in canvas pixels
  radius: number; // in meters (e.g. 1.2e-6 m)
  chargeMultiplier: number; // integer multiple of e (e.g. -1, -2, -3, -4, -5)
  color: string;
  selected: boolean;
}

const ELEMENTARY_CHARGE = 1.602176634e-19; // Coulombs
const OIL_DENSITY = 886; // kg/m^3
const AIR_DENSITY = 1.204; // kg/m^3
const AIR_VISCOSITY = 1.81e-5; // Pa·s
const GRAVITY = 9.80665; // m/s^2
const PLATE_DISTANCE = 0.005; // 5 mm = 0.005 m

export default function MillikanOilDropSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [voltage, setVoltage] = useState<number>(240); // in Volts (-500 to +500)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [selectedDropletId, setSelectedDropletId] = useState<number | null>(null);
  const [logBook, setLogBook] = useState<Array<{ id: number; radiusUm: number; massKg: number; voltageV: number; chargeC: number; nElectrons: number }>>([]);
  const [xrayFlash, setXrayFlash] = useState<boolean>(false);

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Initialize initial droplets
  const spawnDroplets = () => {
    const newDrops: Droplet[] = [];
    for (let i = 0; i < 8; i++) {
      const radius = (0.8 + Math.random() * 0.8) * 1e-6; // 0.8 to 1.6 micrometers
      const n = -(1 + Math.floor(Math.random() * 5)); // -1 to -5 elementary charges
      newDrops.push({
        id: Date.now() + i,
        x: 100 + Math.random() * 300,
        y: 60 + Math.random() * 100,
        radius,
        chargeMultiplier: n,
        color: '#f59e0b',
        selected: i === 0,
      });
    }
    setDroplets(newDrops);
    setSelectedDropletId(newDrops[0].id);
  };

  useEffect(() => {
    spawnDroplets();
  }, []);

  // X-Ray Ionization Pulse
  const triggerXRay = () => {
    setXrayFlash(true);
    setTimeout(() => setXrayFlash(false), 300);

    setDroplets((prev) =>
      prev.map((drop) => {
        // randomly alter charge by adding/removing 1 or 2 electrons
        const delta = Math.random() > 0.5 ? -1 : 1;
        const newN = Math.min(-1, Math.max(-8, drop.chargeMultiplier + delta));
        return { ...drop, chargeMultiplier: newN };
      })
    );
  };

  const selectedDroplet = useMemo(() => {
    return droplets.find((d) => d.id === selectedDropletId) || droplets[0] || null;
  }, [droplets, selectedDropletId]);

  // Selected Droplet Physics
  const dropletStats = useMemo(() => {
    if (!selectedDroplet) return null;
    const r = selectedDroplet.radius;
    const effectiveDensity = OIL_DENSITY - AIR_DENSITY;
    const mass = (4 / 3) * Math.PI * Math.pow(r, 3) * OIL_DENSITY;
    const weight = (4 / 3) * Math.PI * Math.pow(r, 3) * effectiveDensity * GRAVITY;
    const charge = selectedDroplet.chargeMultiplier * ELEMENTARY_CHARGE;
    const electricField = voltage / PLATE_DISTANCE;
    const electricForce = charge * electricField; // negative if upward against negative charge
    const netForce = weight + electricForce; // positive = downwards, negative = upwards
    const balanceVoltage = (weight * PLATE_DISTANCE) / (Math.abs(charge));

    return {
      radiusUm: +(r * 1e6).toFixed(3),
      massKg: mass,
      weightN: weight,
      chargeC: charge,
      nElectrons: Math.abs(selectedDroplet.chargeMultiplier),
      balanceVoltageV: +balanceVoltage.toFixed(1),
      electricForceN: electricForce,
      netForceN: netForce,
    };
  }, [selectedDroplet, voltage]);

  // Record measurement to logbook
  const handleRecordMeasurement = () => {
    if (!dropletStats || !selectedDroplet) return;
    const entry = {
      id: selectedDroplet.id,
      radiusUm: dropletStats.radiusUm,
      massKg: dropletStats.massKg,
      voltageV: voltage,
      chargeC: Math.abs(dropletStats.chargeC),
      nElectrons: dropletStats.nElectrons,
    };
    setLogBook((prev) => [entry, ...prev.slice(0, 7)]);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const topPlateY = 40;
    const bottomPlateY = 320;
    const scaleFactor = 1.2e5; // pixel movement scaling

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // X-Ray Flash Effect
      if (xrayFlash) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Microscope Reticle / Circular Viewport
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = (topPlateY + bottomPlateY) / 2;
      const viewRadius = 135;

      // Dark surrounding mask
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Microscope Light Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, viewRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.clip(); // clip contents inside circular microscope view

      // Reticle / Micrometer Grid Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let y = topPlateY; y <= bottomPlateY; y += 20) {
        ctx.beginPath();
        ctx.moveTo(centerX - viewRadius, y);
        ctx.lineTo(centerX + viewRadius, y);
        ctx.stroke();

        // Tick marks
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '9px monospace';
        ctx.fillText(`${(y - topPlateY) / 20} mm`, centerX + viewRadius - 38, y - 2);
      }

      // Vertical Center Line
      ctx.beginPath();
      ctx.moveTo(centerX, topPlateY);
      ctx.lineTo(centerX, bottomPlateY);
      ctx.stroke();

      // Draw Plates
      // Top Plate (+)
      ctx.fillStyle = voltage >= 0 ? '#ef4444' : '#3b82f6';
      ctx.fillRect(centerX - viewRadius, topPlateY - 8, viewRadius * 2, 8);
      // Bottom Plate (-)
      ctx.fillStyle = voltage >= 0 ? '#3b82f6' : '#ef4444';
      ctx.fillRect(centerX - viewRadius, bottomPlateY, viewRadius * 2, 8);

      // Plate charge labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(voltage >= 0 ? 'اللوح الموجب (+)' : 'اللوح السالب (-)', centerX, topPlateY + 14);
      ctx.fillText(voltage >= 0 ? 'اللوح السالب (-)' : 'اللوح الموجب (+)', centerX, bottomPlateY - 6);

      // Update and Draw Droplets
      setDroplets((prevDrops) => {
        return prevDrops.map((drop) => {
          let { y, radius, chargeMultiplier, selected } = drop;
          const effectiveDensity = OIL_DENSITY - AIR_DENSITY;
          const weight = (4 / 3) * Math.PI * Math.pow(radius, 3) * effectiveDensity * GRAVITY;
          const charge = chargeMultiplier * ELEMENTARY_CHARGE;
          const electricField = voltage / PLATE_DISTANCE;
          const fe = charge * electricField;
          const netForce = weight + fe;

          // Drag terminal velocity v = F_net / (6 * pi * eta * r)
          const terminalVel = netForce / (6 * Math.PI * AIR_VISCOSITY * radius);

          if (isPlaying) {
            y += terminalVel * scaleFactor;
            // Bound inside plates
            if (y > bottomPlateY - 4) y = topPlateY + 6;
            if (y < topPlateY + 4) y = bottomPlateY - 6;
          }

          // Draw Droplet
          const isSel = drop.id === selectedDropletId;
          ctx.save();
          ctx.beginPath();
          ctx.arc(drop.x, y, isSel ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? '#fbbf24' : '#f59e0b';
          ctx.shadowColor = isSel ? '#f59e0b' : '#d97706';
          ctx.shadowBlur = isSel ? 10 : 4;
          ctx.fill();

          if (isSel) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw selection ring
            ctx.beginPath();
            ctx.arc(drop.x, y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
            ctx.setLineDash([3, 3]);
            ctx.stroke();
          }
          ctx.restore();

          return { ...drop, y };
        });
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [voltage, isPlaying, selectedDropletId, xrayFlash]);

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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
                  تجربة قطرة الزيت لميليكان وتكميم الشحنة
                </h1>
                <p className="text-sm text-slate-400">
                  قياس الشحنة الكهربائية للقطرة واستنتاج شحنة الإلكترون الأساسية e = 1.602 × 10⁻¹⁹ C
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
              onClick={spawnDroplets}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              رش قطرات جديدة
            </Button>
          </div>
        </div>

        {/* Live Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الجهد المطبق (\(V\))</span>
              <p className="text-lg font-bold text-amber-400">{voltage} V</p>
              <span className="text-[10px] text-slate-500">جهد التوازن: {dropletStats?.balanceVoltageV} V</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نصف قطر القطرة (\(r\))</span>
              <p className="text-lg font-bold text-sky-400">{dropletStats?.radiusUm} µm</p>
              <span className="text-[10px] text-slate-500">حجم ميكروسكوبي</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">كتلة القطرة (\(m\))</span>
              <p className="text-lg font-bold text-emerald-400">
                {dropletStats ? (dropletStats.massKg * 1e14).toFixed(2) : 0} × 10⁻¹⁴ kg
              </p>
              <span className="text-[10px] text-slate-500">كثافة الزيت 886 kg/m³</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">شحنة القطرة (\(q\))</span>
              <p className="text-lg font-bold text-purple-400">
                {dropletStats ? (Math.abs(dropletStats.chargeC) * 1e19).toFixed(2) : 0} × 10⁻¹⁹ C
              </p>
              <span className="text-[10px] text-slate-500 font-mono">{dropletStats?.nElectrons} إلكترونات</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المجال الكهربائي (\(E\))</span>
              <p className="text-lg font-bold text-cyan-400">{(voltage / PLATE_DISTANCE / 1000).toFixed(1)} kV/m</p>
              <span className="text-[10px] text-slate-500">المسافة بين اللوحين 5mm</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة القطرة</span>
              <p className="text-sm font-bold text-orange-400 mt-1">
                {dropletStats && Math.abs(voltage - dropletStats.balanceVoltageV) < 5
                  ? '⚡ معلقة متزنة (v = 0)'
                  : dropletStats && voltage > dropletStats.balanceVoltageV
                  ? 'صاعدة للأعلى ↑'
                  : 'هابطة للأسفل ↓'}
              </p>
              <span className="text-[10px] text-slate-500">موازنة القوى</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              المجهر وحجرة الموازنة
            </TabsTrigger>
            <TabsTrigger value="logbook" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Layers className="w-4 h-4" />
              جدول القياسات والتكميم
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              اشتقاق القوانين الرياضية
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار المفاهيم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Simulation View */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas Chamber */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Droplets className="w-4 h-4 text-amber-400" />
                      منظار رصد قطرات الزيت (Microscope Viewfinder)
                    </CardTitle>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
                      تكبير مجهري ×1000
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
                      <span>اضغط على قطرة لتحديدها ودراسة اتزانها</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        القطرة المحددة (نصف القطر: {dropletStats?.radiusUm} µm)
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
                      <Target className="w-4 h-4 text-amber-400" />
                      أدوات التحكم بالتجربة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Voltage Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">فرق الجهد الكهربائي بين اللوحين (\(V\))</span>
                        <span className="font-mono font-bold text-amber-400">{voltage} V</span>
                      </div>
                      <Slider
                        value={[voltage]}
                        min={0}
                        max={500}
                        step={1}
                        onValueChange={(val) => setVoltage(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0V (سقوط حر)</span>
                        <span>250V</span>
                        <span>500V (رفع قوي)</span>
                      </div>
                    </div>

                    {/* Balance Button */}
                    {dropletStats && (
                      <Button
                        variant="secondary"
                        onClick={() => setVoltage(dropletStats.balanceVoltageV)}
                        className="w-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs"
                      >
                        ⚡ موازنة القطرة المحددة تلقائياً ({dropletStats.balanceVoltageV} V)
                      </Button>
                    )}

                    {/* Ionization Source (X-Ray) */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">مصدر التأيين (أشعة سينية X-Ray)</label>
                      <Button
                        onClick={triggerXRay}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center justify-center gap-2"
                      >
                        <Radio className="w-4 h-4 text-sky-200 animate-pulse" />
                        إطلاق ومضة أشعة سينية لتغيير الشحنة
                      </Button>
                      <span className="text-[10px] text-slate-500 block">
                        تؤين الهواء وتكسب القطرة إلكترونات إضافية أو تنزع منها إلكترونات.
                      </span>
                    </div>

                    {/* Record Button */}
                    <Button
                      onClick={handleRecordMeasurement}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
                    >
                      📝 تسجيل بيانات هذه القطرة في الجدول
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Logbook */}
          <TabsContent value="logbook" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-300">سجل القياسات التجريبية لاكتشاف تكميم الشحنة</h3>
                <span className="text-xs text-slate-400">إجمالي القياسات المسجلة: {logBook.length}</span>
              </div>

              {logBook.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  لم تقم بتسجيل أي قطرة بعد. اضغط على زر "تسجيل بيانات هذه القطرة" في صفحة المجهر.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border border-slate-800 rounded-xl">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">نصف القطر (µm)</th>
                        <th className="p-3">الكتلة (×10⁻¹⁴ kg)</th>
                        <th className="p-3">جهد الاتزان (V)</th>
                        <th className="p-3">الشحنة المحسوبة \(q\) (Coulomb)</th>
                        <th className="p-3">مضاعف الشحنة \(n\)</th>
                        <th className="p-3">قيمة \(e = q/n\) (C)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {logBook.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 text-amber-300">{row.radiusUm}</td>
                          <td className="p-3 text-slate-300">{(row.massKg * 1e14).toFixed(2)}</td>
                          <td className="p-3 text-slate-300">{row.voltageV} V</td>
                          <td className="p-3 text-purple-300 font-bold">{row.chargeC.toExponential(3)} C</td>
                          <td className="p-3 text-emerald-400 font-bold">{row.nElectrons} e</td>
                          <td className="p-3 text-cyan-300">{(row.chargeC / row.nElectrons).toExponential(3)} C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-amber-300">الأسس العلمية لتجربة قطرة الزيت لروبرت ميليكان (1909)</h3>
              <p>
                استطاع الفيزيائي الأمريكي روبرت ميليكان قياس شحنة الإلكترون المفرد بدقة متناهية وإثبات أن الشحنة الكهربائية مكممة (Quantized)، أي أنها توجد دائماً على شكل مضاعفات صحيحة للشحنة الأساسية \(e\).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. معادلة اتزان القطرة في المجال الكهربائي</h4>
                  <p className="text-sm font-mono text-amber-300">Fe = Fg  ⟹  q · (V / d) = m · g</p>
                  <p className="text-xs text-slate-400">
                    عندما تتزن القطرة وتتوقف تماماً في الهواء، تتساوى القوة الكهربائية الصاعدة للأعلى مع قوة الجاذبية الهابطة للأسفل.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. مبدأ تكميم الشحنة الكهربائية</h4>
                  <p className="text-sm font-mono text-amber-300">q = n · e    (n = ±1, ±2, ±3, ...)</p>
                  <p className="text-xs text-slate-400">
                    حيث e = 1.602 × 10⁻¹⁹ C هي أصغر وحدة شحنة حرة في الطبيعة.
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
                  اختبار فهم تجربة ميليكان
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا تم قياس شحنات 3 قطرات زيت مختلفة وكانت: 3.2 × 10⁻¹⁹ C، 4.8 × 10⁻¹⁹ C، و 8.0 × 10⁻¹⁹ C، فما هي قيمة الشحنة الأساسية الأولية e؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: '3.2 × 10⁻¹⁹ C' },
                    { id: 1, text: '1.6 × 10⁻¹⁹ C (القاسم المشترك الأكبر)' },
                    { id: 2, text: '4.8 × 10⁻¹⁹ C' },
                    { id: 3, text: '0.8 × 10⁻¹⁹ C' },
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
                        <span>إجابة صحيحة تماماً! القاسم المشترك الأكبر لجميع هذه الشحنات هو 1.6 × 10⁻¹⁹ C، وهي شحنة الإلكترون الواحد (2e, 3e, 5e).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. من خلال إيجاد العامل المشترك الأصغر للقيم المعطاة نجد أن جميعها مضاعفات للعدد 1.6 × 10⁻¹⁹ C.</span>
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
