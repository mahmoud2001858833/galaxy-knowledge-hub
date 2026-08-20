import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Sun, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers } from 'lucide-react';
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

interface Metal {
  id: string;
  nameAr: string;
  nameEn: string;
  workFunction: number; // in eV
  symbol: string;
  color: string;
}

const METALS: Metal[] = [
  { id: 'cesium', nameAr: 'سيزيوم (Cs)', nameEn: 'Cesium', workFunction: 2.14, symbol: 'Cs', color: '#f59e0b' },
  { id: 'potassium', nameAr: 'بوتاسيوم (K)', nameEn: 'Potassium', workFunction: 2.30, symbol: 'K', color: '#eab308' },
  { id: 'sodium', nameAr: 'صوديوم (Na)', nameEn: 'Sodium', workFunction: 2.36, symbol: 'Na', color: '#84cc16' },
  { id: 'zinc', nameAr: 'خارصين / زنك (Zn)', nameEn: 'Zinc', workFunction: 4.30, symbol: 'Zn', color: '#06b6d4' },
  { id: 'copper', nameAr: 'نحاس (Cu)', nameEn: 'Copper', workFunction: 4.70, symbol: 'Cu', color: '#f97316' },
  { id: 'platinum', nameAr: 'بلاتين (Pt)', nameEn: 'Platinum', workFunction: 5.65, symbol: 'Pt', color: '#a855f7' },
];

const PLANCK_CONSTANT_EV_S = 4.135667696e-15; // eV·s
const SPEED_OF_LIGHT = 299792458; // m/s
const ELEMENTARY_CHARGE = 1.602176634e-19; // Coulombs

export default function PhotoelectricEffectSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [wavelength, setWavelength] = useState<number>(350); // in nm (100 to 800)
  const [intensity, setIntensity] = useState<number>(75); // 0 to 100%
  const [voltage, setVoltage] = useState<number>(0.0); // in Volts (-5.0 to +5.0)
  const [selectedMetal, setSelectedMetal] = useState<Metal>(METALS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physics Calculations
  const frequencyHz = useMemo(() => {
    return (SPEED_OF_LIGHT / (wavelength * 1e-9));
  }, [wavelength]);

  const photonEnergyEv = useMemo(() => {
    return PLANCK_CONSTANT_EV_S * frequencyHz;
  }, [frequencyHz]);

  const thresholdFrequencyHz = useMemo(() => {
    return selectedMetal.workFunction / PLANCK_CONSTANT_EV_S;
  }, [selectedMetal]);

  const thresholdWavelengthNm = useMemo(() => {
    return (SPEED_OF_LIGHT / thresholdFrequencyHz) * 1e9;
  }, [thresholdFrequencyHz]);

  // Max Kinetic Energy: Ek = hf - Phi
  const maxKineticEnergyEv = useMemo(() => {
    const ek = photonEnergyEv - selectedMetal.workFunction;
    return ek > 0 ? ek : 0;
  }, [photonEnergyEv, selectedMetal]);

  // Stopping voltage: V0 = Ek,max / e
  const stoppingVoltage = useMemo(() => {
    return maxKineticEnergyEv; // since Ek is in eV, stopping voltage in V is numerically equal to Ek
  }, [maxKineticEnergyEv]);

  // Can electrons be emitted?
  const isEmitting = maxKineticEnergyEv > 0 && intensity > 0;

  // Photocurrent calculation (in microamperes)
  const photocurrentMicroAmps = useMemo(() => {
    if (!isEmitting) return 0;
    // Current drops to 0 when opposing voltage is >= stopping potential
    if (voltage <= -stoppingVoltage) return 0;
    
    // Saturation current depends on intensity
    const iSat = (intensity / 100) * 12.5; // uA
    
    if (voltage >= 0) {
      // Forward bias: asymptotically reaches saturation
      return +(iSat * (1 - 0.15 * Math.exp(-voltage / 1.5))).toFixed(2);
    } else {
      // Reverse bias: drops smoothly to 0 at -stoppingVoltage
      const diff = stoppingVoltage + voltage; // voltage is negative
      const ratio = Math.max(0, diff / stoppingVoltage);
      return +(iSat * Math.pow(ratio, 1.5)).toFixed(2);
    }
  }, [isEmitting, voltage, stoppingVoltage, intensity]);

  // Helper: Wavelength to RGB color
  const wavelengthToColor = (wl: number) => {
    if (wl < 380) return 'rgb(147, 51, 234)'; // UV purple
    if (wl < 440) return 'rgb(99, 102, 241)'; // Violet
    if (wl < 490) return 'rgb(59, 130, 246)'; // Blue
    if (wl < 530) return 'rgb(16, 185, 129)'; // Cyan/Green
    if (wl < 580) return 'rgb(234, 179, 8)'; // Yellow
    if (wl < 640) return 'rgb(249, 115, 22)'; // Orange
    if (wl <= 750) return 'rgb(239, 68, 68)'; // Red
    return 'rgb(185, 28, 28)'; // Near IR
  };

  // Particles animation in Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let photons: Array<{ x: number; y: number; vx: number; vy: number; wl: number }> = [];
    let electrons: Array<{ x: number; y: number; vx: number; vy: number; alpha: number }> = [];

    const lightColor = wavelengthToColor(wavelength);
    const emitterX = 140;
    const collectorX = 460;
    const plateTop = 80;
    const plateBottom = 280;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Vacuum Tube Chamber
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(80, 50, 440, 260, 30);
      ctx.fill();
      ctx.stroke();

      // Draw Grid lines inside chamber
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 100; x < 500; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, 310);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Light Source (Lamp)
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(40, 180, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lamp Glow
      if (intensity > 0) {
        const glowGrad = ctx.createRadialGradient(40, 180, 5, 40, 180, 45);
        glowGrad.addColorStop(0, lightColor);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(40, 180, 45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw Emitter Plate (Cathode)
      ctx.save();
      ctx.fillStyle = selectedMetal.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fillRect(emitterX - 10, plateTop, 16, plateBottom - plateTop);
      ctx.strokeRect(emitterX - 10, plateTop, 16, plateBottom - plateTop);
      
      // Emitter Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`لوح ${selectedMetal.symbol}`, emitterX - 2, plateTop - 10);
      ctx.fillText(`(مهبط -)`, emitterX - 2, plateBottom + 20);
      ctx.restore();

      // Draw Collector Plate (Anode)
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.fillRect(collectorX, plateTop, 16, plateBottom - plateTop);
      ctx.strokeRect(collectorX, plateTop, 16, plateBottom - plateTop);
      
      // Collector Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('لوح المجمع', collectorX + 8, plateTop - 10);
      ctx.fillText(`(مصعد +)`, collectorX + 8, plateBottom + 20);
      ctx.restore();

      // Spawn Photons
      if (isPlaying && intensity > 0 && Math.random() < (intensity / 100) * 0.45) {
        photons.push({
          x: 40,
          y: 150 + Math.random() * 60,
          vx: 4.5 + Math.random() * 1.5,
          vy: (Math.random() - 0.5) * 2,
          wl: wavelength,
        });
      }

      // Update & Draw Photons
      ctx.save();
      ctx.fillStyle = lightColor;
      ctx.shadowColor = lightColor;
      ctx.shadowBlur = 8;
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        if (isPlaying) {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw photon as oscillating wave packet
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Hit emitter plate
        if (p.x >= emitterX - 10) {
          if (isEmitting && Math.random() < 0.8) {
            // Eject electron!
            const speed = Math.min(6, 1.2 + Math.sqrt(maxKineticEnergyEv) * 1.8);
            electrons.push({
              x: emitterX + 8,
              y: Math.max(plateTop + 10, Math.min(plateBottom - 10, p.y + (Math.random() - 0.5) * 20)),
              vx: speed * (0.8 + Math.random() * 0.4),
              vy: (Math.random() - 0.5) * 1.8,
              alpha: 1,
            });
          }
          photons.splice(i, 1);
        } else if (p.x > 500 || p.y < 40 || p.y > 320) {
          photons.splice(i, 1);
        }
      }
      ctx.restore();

      // Electric Field Acceleration: a = q * V / (d * m)
      const eAcc = (voltage * 0.08);

      // Update & Draw Electrons
      ctx.save();
      for (let i = electrons.length - 1; i >= 0; i--) {
        const e = electrons[i];
        if (isPlaying) {
          e.vx += eAcc;
          e.x += e.vx;
          e.y += e.vy;
        }

        // Color based on velocity
        ctx.fillStyle = `rgba(56, 189, 248, ${e.alpha})`;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Electron hits collector plate
        if (e.x >= collectorX) {
          electrons.splice(i, 1);
        } else if (e.vx <= 0 && voltage < 0 && e.x < emitterX + 5) {
          // Turned back to emitter due to stopping potential
          electrons.splice(i, 1);
        } else if (e.y < plateTop - 20 || e.y > plateBottom + 20 || e.x < 70) {
          electrons.splice(i, 1);
        }
      }
      ctx.restore();

      // Draw Circuit Wires & Ammeter / Voltmeter at bottom
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      // Cathode wire down
      ctx.beginPath();
      ctx.moveTo(emitterX, plateBottom);
      ctx.lineTo(emitterX, 350);
      ctx.lineTo(240, 350);
      ctx.stroke();

      // Anode wire down
      ctx.beginPath();
      ctx.moveTo(collectorX + 8, plateBottom);
      ctx.lineTo(collectorX + 8, 350);
      ctx.lineTo(360, 350);
      ctx.stroke();

      // Ammeter Gauge
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(300, 350, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', 300, 345);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Cairo, sans-serif';
      ctx.fillText(`${photocurrentMicroAmps} µA`, 300, 362);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [wavelength, intensity, voltage, selectedMetal, isPlaying, isEmitting, maxKineticEnergyEv, photocurrentMicroAmps]);

  // Generate Data for IV Characteristic Curve
  const ivData = useMemo(() => {
    const data = [];
    const minV = -Math.max(5, Math.ceil(stoppingVoltage + 1));
    const maxV = 5;
    const steps = 60;
    const iSat = isEmitting ? (intensity / 100) * 12.5 : 0;

    for (let i = 0; i <= steps; i++) {
      const v = minV + (i / steps) * (maxV - minV);
      let current = 0;
      if (isEmitting) {
        if (v <= -stoppingVoltage) {
          current = 0;
        } else if (v >= 0) {
          current = iSat * (1 - 0.15 * Math.exp(-v / 1.5));
        } else {
          const ratio = (stoppingVoltage + v) / stoppingVoltage;
          current = iSat * Math.pow(Math.max(0, ratio), 1.5);
        }
      }
      data.push({
        voltage: +v.toFixed(2),
        current: +current.toFixed(2),
      });
    }
    return data;
  }, [stoppingVoltage, intensity, isEmitting]);

  // Generate Data for Ek vs Frequency Graph
  const ekFreqData = useMemo(() => {
    const data = [];
    const minF = 0.5e15; // 0.5 PHz
    const maxF = 2.5e15; // 2.5 PHz
    const steps = 40;

    for (let i = 0; i <= steps; i++) {
      const f = minF + (i / steps) * (maxF - minF);
      const ek = Math.max(0, PLANCK_CONSTANT_EV_S * f - selectedMetal.workFunction);
      data.push({
        frequencyPHz: +(f * 1e-15).toFixed(2),
        kineticEnergy: +ek.toFixed(2),
      });
    }
    return data;
  }, [selectedMetal]);

  const handleReset = () => {
    setWavelength(350);
    setIntensity(75);
    setVoltage(0);
    setSelectedMetal(METALS[0]);
    setIsPlaying(true);
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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-indigo-600 rounded-2xl shadow-lg shadow-amber-500/20">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  الظاهرة الكهروضوئية وثابت بلانك
                </h1>
                <p className="text-sm text-slate-400">
                  تجربة أينشتاين لتحرير الإلكترونات بالضوء، قياس جهد الإيقاف واستنتاج ثابت بلانك \(h\) بدقة
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
              إعادة ضبط
            </Button>
          </div>
        </div>

        {/* Live Gauges / Readouts Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة الفوتون (\(E\))</span>
              <p className="text-lg font-bold text-amber-400">{photonEnergyEv.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">{(photonEnergyEv * ELEMENTARY_CHARGE * 1e19).toFixed(2)} × 10⁻¹⁹ J</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دالة الشغل (\(\Phi\))</span>
              <p className="text-lg font-bold text-orange-400">{selectedMetal.workFunction.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">{selectedMetal.nameAr}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">أقصى طاقة حركية (\(E_k\))</span>
              <p className="text-lg font-bold text-sky-400">{maxKineticEnergyEv.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">{isEmitting ? 'انبعاث نشط' : 'لا يوجد انبعاث'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">جهد الإيقاف (\(V_0\))</span>
              <p className="text-lg font-bold text-purple-400">{stoppingVoltage.toFixed(2)} V</p>
              <span className="text-[10px] text-slate-500">جهد التثبيط</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">التردد الحرج (\(f_0\))</span>
              <p className="text-lg font-bold text-emerald-400">{(thresholdFrequencyHz * 1e-14).toFixed(2)} × 10¹⁴ Hz</p>
              <span className="text-[10px] text-slate-500">\(\lambda_0 = {thresholdWavelengthNm.toFixed(0)}\) nm</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">التيار الكهروضوئي (\(I\))</span>
              <p className="text-lg font-bold text-cyan-400">{photocurrentMicroAmps} µA</p>
              <span className="text-[10px] text-slate-500">{voltage >= 0 ? 'انحياز أمامي' : 'انحياز عكسي'}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              المختبر الافتراضي
            </TabsTrigger>
            <TabsTrigger value="graphs" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Sparkles className="w-4 h-4" />
              المنحنيات البيانية وثابت بلانك
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              الأساس النظري والمعادلات
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار المفاهيم والتحدي
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Main Interactive Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simulation Canvas & Vacuum Tube */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Layers className="w-4 h-4 text-amber-400" />
                      أنبوبة التفريغ الكهروضوئية (Photocell Chamber)
                    </CardTitle>
                    <Badge variant="outline" className={`${isEmitting ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                      {isEmitting ? 'انبعاث كهروضوئي نشط' : 'لا تنبعث إلكترونات (hf < Φ)'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-slate-950/70">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="w-full max-w-[600px] h-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-inner"
                    />
                    <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-3 px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wavelengthToColor(wavelength) }} />
                        فوتونات ساقطة ({wavelength} nm)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-sky-400" />
                        إلكترونات منبعثة (Photoelectrons)
                      </span>
                      <span className="text-slate-400">
                        الجهد المطبق: <strong className={voltage > 0 ? 'text-emerald-400' : voltage < 0 ? 'text-red-400' : 'text-slate-200'}>{voltage > 0 ? `+${voltage}` : voltage} V</strong>
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
                      <Zap className="w-4 h-4 text-sky-400" />
                      لوحة التحكم بالتجربة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Metal Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">معدن المهبط (Target Metal)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {METALS.map((metal) => (
                          <button
                            key={metal.id}
                            onClick={() => setSelectedMetal(metal)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-right flex flex-col justify-between ${
                              selectedMetal.id === metal.id
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <span>{metal.nameAr}</span>
                            <span className="text-[10px] opacity-75 font-mono">Φ = {metal.workFunction} eV</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wavelength Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">طول موجة الضوء (\(\lambda\))</span>
                        <span className="font-mono font-bold" style={{ color: wavelengthToColor(wavelength) }}>
                          {wavelength} nm
                        </span>
                      </div>
                      <Slider
                        value={[wavelength]}
                        min={150}
                        max={750}
                        step={5}
                        onValueChange={(val) => setWavelength(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>أشعة فوق بنفسجية (150nm)</span>
                        <span>طيف مرئي</span>
                        <span>أشعة تحت حمراء (750nm)</span>
                      </div>
                    </div>

                    {/* Light Intensity Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">شدة الإضاءة (Intensity)</span>
                        <span className="font-mono font-bold text-amber-400">{intensity}%</span>
                      </div>
                      <Slider
                        value={[intensity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => setIntensity(val[0])}
                        className="py-1"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        الشدة تزيد عدد الفوتونات المنطلقة ولا تؤثر على طاقة الفوتون الواحد!
                      </span>
                    </div>

                    {/* Voltage Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">فرق الجهد المطبق (\(V\))</span>
                        <span className={`font-mono font-bold ${voltage >= 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                          {voltage > 0 ? `+${voltage.toFixed(1)}` : voltage.toFixed(1)} V
                        </span>
                      </div>
                      <Slider
                        value={[voltage]}
                        min={-6}
                        max={6}
                        step={0.1}
                        onValueChange={(val) => setVoltage(+val[0].toFixed(1))}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>جهد عكسي (-6V)</span>
                        <span>0V</span>
                        <span>جهد طرد (+6V)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Live Graphs & Planck Calculation */}
          <TabsContent value="graphs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* I vs V Curve */}
              <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200">
                    منحنى التيار مع الجهد (I-V Characteristic)
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    لاحظ كيف ينعدم التيار تماماً عند جهد الإيقاف V = -V₀ = -{stoppingVoltage.toFixed(2)} V
                  </p>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ivData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="voltage" stroke="#94a3b8" label={{ value: 'الجهد (V)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" label={{ value: 'التيار (µA)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                      <ReferenceLine x={-stoppingVoltage} stroke="#a855f7" strokeDasharray="4 4" label={{ value: `V₀ = -${stoppingVoltage.toFixed(2)}V`, fill: '#a855f7', fontSize: 10 }} />
                      <ReferenceLine y={0} stroke="#64748b" />
                      <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="التيار (µA)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ek vs Frequency */}
              <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200">
                    طاقة الحركة العظمى مع التردد (Ek vs f)
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    ميل الخط المستقيم يمثل ثابت بلانك h = 4.14 × 10⁻¹⁵ eV·s
                  </p>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ekFreqData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="frequencyPHz" stroke="#94a3b8" label={{ value: 'التردد (PHz = 10¹⁵ Hz)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" label={{ value: 'طاقة الحركة (eV)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                      <ReferenceLine x={+(thresholdFrequencyHz * 1e-15).toFixed(2)} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'التردد الحرج f₀', fill: '#eab308', fontSize: 10 }} />
                      <Line type="monotone" dataKey="kineticEnergy" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="طاقة الحركة (eV)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: Theoretical Background */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-amber-300">الأسس الفيزيائية للظاهرة الكهروضوئية (Photoelectric Effect)</h3>
              <p>
                في عام 1905، قدّم ألبرت أينشتاين تفسيره الثوري للظاهرة الكهروضوئية مستنداً إلى فرضية ماكس بلانك لتكميم الطاقة، والتي نال عنها جائزة نوبل في الفيزياء عام 1921.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. معادلة أينشتاين الكهروضوئية</h4>
                  <p className="text-sm font-mono text-amber-300">Ek = hν - Φ = e·V₀</p>
                  <p className="text-xs text-slate-400">
                    طاقة الفوتون الساقط (hν) تتوزع بين تحرير الإلكترون بالتغلب على دالة الشغل (Φ) وإكسابه طاقة حركة عظمى (Ek).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. التردد الحرج والطول الموجي الحرج</h4>
                  <p className="text-sm font-mono text-amber-300">f₀ = Φ / h,   λ₀ = hc / Φ</p>
                  <p className="text-xs text-slate-400">
                    أقل تردد ضوئي قادر على انتزاع إلكترون من سطح المعدن دون إكسابه طاقة حركة.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <h4 className="font-bold text-amber-300 mb-1">النتائج التجريبية التي عجزت الفيزياء الكلاسيكية عن تفسيرها:</h4>
                <ul className="list-disc list-inside text-xs space-y-1.5 text-slate-300">
                  <li>الانبعاث فوري وبدون أي تأخير زمني بمجرد سقوط الضوء المناسب.</li>
                  <li>طاقة حركة الإلكترونات تعتمد حصرياً على <strong>تردد الضوء</strong> وليس على شدته.</li>
                  <li>زيادة شدة الإضاءة تزيد من <strong>عدد الإلكترونات المنبعثة (التيار)</strong> فقط دون تغيير طاقتها الحركية.</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Interactive Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار فهم الظاهرة الكهروضوئية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا قمنا بمضاعفة شدة الضوء الساقط (مع ثبات تردده)، فماذا يحدث لكل من طاقة الحركة العظمى للإلكترونات (Ek,max) وتيار الإشباع (Isat)؟
                </p>
                
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تتضاعف طاقة الحركة العظمى ويبقى التيار ثابتاً.' },
                    { id: 1, text: 'تتضاعف طاقة الحركة ويتضاعف التيار معاً.' },
                    { id: 2, text: 'تبقى طاقة الحركة العظمى ثابتة ويتضاعف تيار الإشباع.' },
                    { id: 3, text: 'يقل جهد الإيقاف للنصف ويزداد التيار.' },
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
                        <span>إجابة صحيحة وممتازة! شدة الضوء تحدد عدد الفوتونات (التيار)، بينما تردد الفوتون يحدد طاقة حركته.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. زيادة الشدة تزيد عدد الفوتونات المتدفقة فقط، وبالتالي يتضاعف عدد الإلكترونات المنبعثة (التيار) مع بقاء طاقة كل إلكترون ثابتة لأن تردد الفوتون لم يتغير.</span>
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
