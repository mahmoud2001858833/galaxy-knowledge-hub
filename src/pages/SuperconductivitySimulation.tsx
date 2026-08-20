import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Flame, ThermometerSnowflake, Magnet } from 'lucide-react';
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

interface SuperconductorMaterial {
  id: string;
  nameAr: string;
  nameEn: string;
  tcKelvin: number; // Critical temperature in Kelvin
  type: string;
  color: string;
}

const MATERIALS: SuperconductorMaterial[] = [
  { id: 'ybco', nameAr: 'مركب YBCO (إتريوم-باريوم-نحاس)', nameEn: 'YBCO', tcKelvin: 93, type: 'فائق عالي الحرارة (نوع II)', color: '#06b6d4' },
  { id: 'bscco', nameAr: 'مركب BSCCO (بزموت-سترونشيوم-نحاس)', nameEn: 'BSCCO', tcKelvin: 108, type: 'فائق عالي الحرارة (نوع II)', color: '#3b82f6' },
  { id: 'mercury', nameAr: 'الزئبق (اكتشاف أونز 1911)', nameEn: 'Mercury', tcKelvin: 4.2, type: 'فائق كلاسيكي (نوع I)', color: '#94a3b8' },
  { id: 'lead', nameAr: 'الرصاص (Lead - Pb)', nameEn: 'Lead', tcKelvin: 7.2, type: 'فائق كلاسيكي (نوع I)', color: '#64748b' },
];

export default function SuperconductivitySimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [selectedMaterial, setSelectedMaterial] = useState<SuperconductorMaterial>(MATERIALS[0]);
  const [temperatureKelvin, setTemperatureKelvin] = useState<number>(300); // 0 to 300 K
  const [magnetHeightMm, setMagnetHeightMm] = useState<number>(15); // height above puck
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Is Superconducting State Active?
  const isSuperconducting = temperatureKelvin <= selectedMaterial.tcKelvin;

  // Electrical Resistance (Ohms)
  const resistanceOhms = useMemo(() => {
    if (isSuperconducting) return 0.0;
    // Linear normal metallic resistance above Tc
    const diff = temperatureKelvin - selectedMaterial.tcKelvin;
    return +(0.2 + diff * 0.015).toFixed(4);
  }, [temperatureKelvin, selectedMaterial, isSuperconducting]);

  // Magnetic Levitation Height
  const levitationAltitude = useMemo(() => {
    if (!isSuperconducting) return 0;
    // Stable levitation altitude due to flux pinning & Meissner repulsion
    return 18; // mm in air
  }, [isSuperconducting]);

  // Generate R vs T Curve Data
  const rtData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 300; t += 5) {
      let r = 0;
      if (t > selectedMaterial.tcKelvin) {
        r = 0.2 + (t - selectedMaterial.tcKelvin) * 0.015;
      }
      data.push({
        temp: t,
        resistance: +r.toFixed(3),
      });
    }
    return data;
  }, [selectedMaterial]);

  // Pour Liquid Nitrogen (77K)
  const pourLiquidNitrogen = () => {
    setTemperatureKelvin(77);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Pour Liquid Helium (4.2K)
  const pourLiquidHelium = () => {
    setTemperatureKelvin(4.2);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  // Canvas visualizer (Levitation & Field lines)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let floatOffset = 0;

    const centerX = canvas.width / 2;
    const puckY = 240;
    const puckWidth = 140;
    const puckHeight = 24;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      floatOffset = (floatOffset + 0.04);

      // Dark Cryo Chamber background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cryogenic vapor effect when cold
      if (temperatureKelvin < 150) {
        ctx.save();
        const vaporGrad = ctx.createLinearGradient(0, puckY - 60, 0, puckY + 50);
        vaporGrad.addColorStop(0, 'rgba(186, 230, 253, 0.0)');
        vaporGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.15)');
        vaporGrad.addColorStop(1, 'rgba(186, 230, 253, 0.0)');
        ctx.fillStyle = vaporGrad;
        ctx.fillRect(0, puckY - 60, canvas.width, 110);
        ctx.restore();
      }

      // Draw Superconducting Pellet / Puck
      ctx.save();
      ctx.fillStyle = isSuperconducting ? selectedMaterial.color : '#334155';
      ctx.shadowColor = isSuperconducting ? selectedMaterial.color : '#000000';
      ctx.shadowBlur = isSuperconducting ? 18 : 0;
      ctx.beginPath();
      ctx.roundRect(centerX - puckWidth / 2, puckY, puckWidth, puckHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pellet label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${selectedMaterial.nameAr} (${isSuperconducting ? 'حالة فائقة التوصيل' : 'حالة عادية'})`,
        centerX,
        puckY + 16
      );
      ctx.restore();

      // Magnet Position (Floating or resting)
      const currentMagnetY = isSuperconducting
        ? puckY - 50 + Math.sin(floatOffset) * 3 // levitating in air!
        : puckY - 14; // resting on disc

      // Draw Magnetic Field Lines (Meissner effect expulsion or penetration)
      ctx.save();
      ctx.strokeStyle = isSuperconducting ? 'rgba(56, 189, 248, 0.6)' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.5;

      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const lineOffset = i * 20;
        ctx.beginPath();
        if (isSuperconducting) {
          // Field lines bend completely around the puck (Meissner effect)
          ctx.moveTo(centerX + lineOffset, currentMagnetY);
          ctx.bezierCurveTo(
            centerX + lineOffset * 1.8,
            puckY - 10,
            centerX + lineOffset * 2.2,
            puckY + puckHeight + 20,
            centerX + lineOffset * 0.5,
            puckY + puckHeight + 40
          );
        } else {
          // Normal state: field lines penetrate straight through
          ctx.moveTo(centerX + lineOffset, currentMagnetY);
          ctx.lineTo(centerX + lineOffset, puckY + puckHeight + 30);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Draw Permanent Magnet (NdFeB with Red/Blue poles)
      ctx.save();
      const magnetWidth = 50;
      const magnetHeight = 16;

      // North Pole (Red)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(centerX - magnetWidth / 2, currentMagnetY, magnetWidth / 2, magnetHeight, [4, 0, 0, 4]);
      ctx.fill();

      // South Pole (Blue)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(centerX, currentMagnetY, magnetWidth / 2, magnetHeight, [0, 4, 4, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX - magnetWidth / 4, currentMagnetY + 11);
      ctx.fillText('S', centerX + magnetWidth / 4, currentMagnetY + 11);

      // Levitation Halo
      if (isSuperconducting) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.strokeRect(centerX - magnetWidth / 2 - 2, currentMagnetY - 2, magnetWidth + 4, magnetHeight + 4);
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [temperatureKelvin, isSuperconducting, selectedMaterial]);

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
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Magnet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  الموصلية الفائقة والطفو المغناطيسي (تأثير مايسنر)
                </h1>
                <p className="text-sm text-slate-400">
                  انعدام المقاومة الكهربائية تماماً (\(R = 0\)) وطرد خطوط المجال المغناطيسي وحبس التدفق الكمي
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemperatureKelvin(300)}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة التسخين لحرارة الغرفة (300K)
            </Button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">درجة الحرارة الحالية (\(T\))</span>
              <p className="text-lg font-bold text-sky-400">{temperatureKelvin} K</p>
              <span className="text-[10px] text-slate-500">{(temperatureKelvin - 273.15).toFixed(1)} °C</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الحرارة الحرجة (\(T_c\))</span>
              <p className="text-lg font-bold text-cyan-400">{selectedMaterial.tcKelvin} K</p>
              <span className="text-[10px] text-slate-500">نقطة التحول الفائق</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المقاومة الكهربائية (\(R\))</span>
              <p className={`text-lg font-bold ${isSuperconducting ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}`}>
                {resistanceOhms} Ω
              </p>
              <span className="text-[10px] text-slate-500">
                {isSuperconducting ? '⚡ صفر مطلق (توصيل فائق)' : 'مقاومة عادية'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة الطفو المغناطيسي</span>
              <p className="text-sm font-bold text-purple-400 mt-1">
                {isSuperconducting ? '✨ طفو كمي ثابت في الهواء' : 'مستقر على السطح'}
              </p>
              <span className="text-[10px] text-slate-500">تأثير مايسنر</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المجال المغناطيسي الداخلي (\(B\))</span>
              <p className="text-lg font-bold text-rose-400 font-mono">
                {isSuperconducting ? '0.00 Tesla' : 'مخترق للمادة'}
              </p>
              <span className="text-[10px] text-slate-500">طرد تام للمجال</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نوع المادة الفائقة</span>
              <p className="text-xs font-bold text-slate-300 mt-1">{selectedMaterial.type}</p>
              <span className="text-[10px] text-slate-500">{selectedMaterial.nameEn}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Activity className="w-4 h-4" />
              حجرة الطفو والتبريد الفائق
            </TabsTrigger>
            <TabsTrigger value="curves" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Sparkles className="w-4 h-4" />
              منحنى المقاومة مع درجة الحرارة
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              فيزياء الموصلات الفائقة وتأثير مايسنر
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
                      <Magnet className="w-4 h-4 text-cyan-400" />
                      حجرة الطفو المغناطيسي وتثبيت التدفق الكمي (Quantum Levitation)
                    </CardTitle>
                    <Badge variant="outline" className={`${isSuperconducting ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400'}`}>
                      {isSuperconducting ? '✓ حالة فائقة التوصيل نشطة' : 'حالة موصل عادي'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-slate-950/70">
                    <canvas
                      ref={canvasRef}
                      width={560}
                      height={340}
                      className="w-full max-w-[560px] h-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-inner"
                    />
                    <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-3 px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-cyan-400" />
                        قرص الموصل الفائق
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        مغناطيس دائم يطفو في الفراغ
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
                      <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                      التحكم بالتبريد والمادة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Material Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مادة الموصل الفائق</label>
                      <div className="space-y-1.5">
                        {MATERIALS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMaterial(m)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMaterial.id === m.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{m.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">درجة الحرارة الحرجة: Tc = {m.tcKelvin} K ({m.type})</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">درجة الحرارة (\(T\))</span>
                        <span className="font-mono font-bold text-cyan-400">{temperatureKelvin} K</span>
                      </div>
                      <Slider
                        value={[temperatureKelvin]}
                        min={0}
                        max={300}
                        step={1}
                        onValueChange={(val) => setTemperatureKelvin(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0 K (الصفر المطلق)</span>
                        <span>Tc = {selectedMaterial.tcKelvin} K</span>
                        <span>300 K (حرارة الغرفة)</span>
                      </div>
                    </div>

                    {/* Fast Cryo Coolant Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block">سوائل التبريد الفائق السريع</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={pourLiquidNitrogen}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                        >
                          🧪 نيتروجين سائل (77 K)
                        </Button>
                        <Button
                          onClick={pourLiquidHelium}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                        >
                          ❄️ هيليوم سائل (4.2 K)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: R-T Curve */}
          <TabsContent value="curves" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-300">منحنى المقاومة الكهربائية مع درجة الحرارة (R vs T)</h3>
              <p className="text-xs text-slate-400">
                لاحظ الهبوط الحاد والمفاجئ للمقاومة لتصل إلى الصفر المطلق (R = 0 Ω) لحظة الوصول إلى درجة الحرارة الحرجة Tc = {selectedMaterial.tcKelvin} K.
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rtData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="temp" stroke="#94a3b8" label={{ value: 'درجة الحرارة (K)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'المقاومة (Ω)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <ReferenceLine x={selectedMaterial.tcKelvin} stroke="#22c55e" strokeDasharray="4 4" label={{ value: `Tc = ${selectedMaterial.tcKelvin}K`, fill: '#22c55e', fontSize: 10 }} />
                    <Line type="stepAfter" dataKey="resistance" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="المقاومة (Ω)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-cyan-300">الموصلية الفائقة وتأثير مايسنر (Superconductivity & Meissner Effect)</h3>
              <p>
                تم اكتشاف الموصلية الفائقة عام 1911 على يد العالم الهولندي هايك كامرلنغ أونز عند تبريد الزئبق بالهيليوم السائل. وتتميز بظاهرتين أساسيتين: انعدام المقاومة تماماً، وطرد المجالات المغناطيسية الخارجية.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. تأثير مايسنر (Meissner Effect)</h4>
                  <p className="text-sm font-mono text-cyan-300">B = 0 (داخل الموصل الفائق)</p>
                  <p className="text-xs text-slate-400">
                    عند الانتقال للحالة الفائقة، تتولد تيارات سطحية مستمرة تولد مجالاً معاكساً يطرد خطوط المجال المغناطيسي تماماً من داخل المادة.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. حبس التدفق الكمي (Quantum Flux Pinning)</h4>
                  <p className="text-xs text-slate-400">
                    في موصلات النوع الثاني (Type-II)، تخترق خطوط مغناطيسية على شكل أنابيب كمية دقيقة (Vortices) وتُحبس في عيوب الشبكة، مما يثبت المغناطيس في الهواء بقوة فائقة تمنعه من الانزلاق أو السقوط.
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
                  اختبار مفاهيم الموصلية الفائقة
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما الذي يميز الموصل الفائق الحقيقي عن مجرد موصل ذي مقاومة صفرية مثالية؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'أنه يوصل الكهرباء بالحرارة فقط.' },
                    { id: 1, text: 'أنه يجذب جميع المعادن كالمغناطيس العادي.' },
                    { id: 2, text: 'تأثير مايسنر (الطرد التام لخطوط المجال المغناطيسي من داخله B = 0).' },
                    { id: 3, text: 'أنه يذوب عند درجات الحرارة المنخفضة.' },
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
                        <span>إجابة صحيحة ورائعة! تأثير مايسنر هو الخاصية الديناميكية الحرارية الأساسية التي تميز الموصل الفائق وتثبت أنه طور جديد تماماً للمادة.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. الميزة الجوهرية للموصل الفائق هي تأثير مايسنر (طرد خطوط المجال المغناطيسي بالكامل)، وهو ما لا يمكن تفسيره بمجرد انعدام المقاومة الكهربائية.</span>
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
