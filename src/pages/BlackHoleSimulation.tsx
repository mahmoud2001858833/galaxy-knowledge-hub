import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Orbit, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, ShieldAlert, Eye, Timer, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface BlackHolePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  solarMasses: number;
  typeAr: string;
  description: string;
}

const PRESETS: BlackHolePreset[] = [
  { id: 'cygnus-x1', nameAr: 'الدجاجة X-1 (نجمي)', nameEn: 'Cygnus X-1', solarMasses: 21.2, typeAr: 'ثقب أسود نجمي', description: 'أول ثقب أسود تم تأكيد وجوده رصدياً في مجرتنا' },
  { id: 'sagittarius-a', nameAr: 'الرامي A* (مركز المجرة)', nameEn: 'Sagittarius A*', solarMasses: 4.15e6, typeAr: 'فائق الكتلة (SMBH)', description: 'الثقب الأسود الهائل في مركز مجرة درب التبانة' },
  { id: 'm87', nameAr: 'مسييه 87* (M87*)', nameEn: 'M87*', solarMasses: 6.5e9, typeAr: 'عملاق فائق الكتلة', description: 'أول ثقب أسود التقط له تلسكوب أفق الحدث EHT صورة مباشرة' },
];

const G = 6.67430e-11;
const C = 299792458;
const SOLAR_MASS_KG = 1.989e30;

export default function BlackHoleSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [selectedPreset, setSelectedPreset] = useState<BlackHolePreset>(PRESETS[1]);
  const [probeDistanceMultiplier, setProbeDistanceMultiplier] = useState<number>(3.0);
  const [isFalling, setIsFalling] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Relative Clocks
  const [coordinateTimeSec, setCoordinateTimeSec] = useState<number>(0);
  const [probeProperTimeSec, setProbeProperTimeSec] = useState<number>(0);

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physics Calculations
  const massKg = selectedPreset.solarMasses * SOLAR_MASS_KG;
  const schwarzschildRadiusM = (2 * G * massKg) / (C * C);
  const schwarzschildRadiusKm = +(schwarzschildRadiusM / 1000).toFixed(2);
  const photonSphereKm = +(schwarzschildRadiusKm * 1.5).toFixed(2);

  // Current probe distance in meters & km
  const currentRadiusM = probeDistanceMultiplier * schwarzschildRadiusM;
  const currentRadiusKm = +(currentRadiusM / 1000).toFixed(2);

  // Gravitational Time Dilation Factor: dtau / dt = sqrt(1 - rs / r)
  const timeDilationFactor = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 0.00001;
    return Math.sqrt(1 - 1 / probeDistanceMultiplier);
  }, [probeDistanceMultiplier]);

  // Gravitational Redshift: z = 1 / sqrt(1 - rs/r) - 1
  const gravitationalRedshift = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 9999;
    return +( (1 / timeDilationFactor) - 1 ).toFixed(3);
  }, [probeDistanceMultiplier, timeDilationFactor]);

  // Simulation loop for Falling probe and clocks
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCoordinateTimeSec((t) => t + 0.1);
      setProbeProperTimeSec((tau) => tau + 0.1 * timeDilationFactor);

      if (isFalling) {
        setProbeDistanceMultiplier((r) => {
          if (r <= 1.01) {
            setIsFalling(false);
            return 1.01;
          }
          const dr = 0.03 * Math.sqrt(Math.max(0.01, 1 - 1 / r));
          return Math.max(1.01, r - dr);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isFalling, timeDilationFactor]);

  // Canvas 2D Accretion Disk & Lensing Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Dark space background
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Accretion Disk Back Lensed Arc
      ctx.save();
      const diskGradBack = ctx.createLinearGradient(centerX - 180, centerY, centerX + 180, centerY);
      diskGradBack.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      diskGradBack.addColorStop(0.5, 'rgba(251, 191, 36, 0.8)');
      diskGradBack.addColorStop(1, 'rgba(239, 68, 68, 0.3)');

      ctx.strokeStyle = diskGradBack;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 15, 130, 75, 0, Math.PI, 0);
      ctx.stroke();
      ctx.restore();

      // Photon Sphere ring
      ctx.save();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Black Hole Shadow / Event Horizon (rs)
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Accretion Disk Front Ring
      ctx.save();
      const diskGradFront = ctx.createLinearGradient(centerX - 180, centerY, centerX + 180, centerY);
      diskGradFront.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
      diskGradFront.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
      diskGradFront.addColorStop(1, 'rgba(220, 38, 38, 0.3)');

      ctx.strokeStyle = diskGradFront;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 140, 32, 0, 0, Math.PI);
      ctx.stroke();
      ctx.restore();

      // Draw Probe Position
      const pixelDistance = probeDistanceMultiplier * 38;
      angle += 0.015 * (3 / Math.max(1, probeDistanceMultiplier));
      const probeX = centerX + Math.cos(angle) * pixelDistance;
      const probeY = centerY + Math.sin(angle) * (pixelDistance * 0.35);

      // Probe Dot & Beacon
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(probeX, probeY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Probe Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Cairo, sans-serif';
      ctx.fillText('المسبار', probeX + 8, probeY - 4);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [probeDistanceMultiplier]);

  const handleReset = () => {
    setProbeDistanceMultiplier(3.0);
    setIsFalling(false);
    setCoordinateTimeSec(0);
    setProbeProperTimeSec(0);
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
        {/* Header */}
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
              <div className="p-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-black rounded-2xl shadow-lg shadow-purple-500/20 border border-purple-500/30">
                <Globe className="w-8 h-8 text-purple-200" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  الثقوب السوداء وتمدد الزمن الثقالي
                </h1>
                <p className="text-sm text-slate-400">
                  استكشاف متريّة شفارتزشيلد، أفق الحدث، وتجمد ساعات المسبار عند حافة الزمكان
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
              إعادة ضبط المسبار
            </Button>
          </div>
        </div>

        {/* Live Relativistic Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نصف قطر شفارتزشيلد (rs)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{schwarzschildRadiusKm.toLocaleString()} km</p>
              <span className="text-[10px] text-slate-500">أفق الحدث المباشر</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مسافة المسبار الحالية (r)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{probeDistanceMultiplier.toFixed(2)} rs</p>
              <span className="text-[10px] text-slate-500">{currentRadiusKm.toLocaleString()} km</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معدل سريان زمن المسبار</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{(timeDilationFactor * 100).toFixed(1)}%</p>
              <span className="text-[10px] text-slate-500">نسبة إلى راصد بعيد</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الإزاحة نحو الأحمر (Redshift)</span>
              <p className="text-lg font-bold text-rose-400 font-mono">+{gravitationalRedshift}</p>
              <span className="text-[10px] text-slate-500">خفوت الإشارات اللاسلكية</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ساعة الراصد البعيد (t)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{coordinateTimeSec.toFixed(1)} s</p>
              <span className="text-[10px] text-slate-500">زمن الإحداثيات الكوني</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ساعة المسبار الخاصة (τ)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{probeProperTimeSec.toFixed(1)} s</p>
              <span className="text-[10px] text-slate-500">الزمن الذاتي الحقيقي</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Activity className="w-4 h-4" />
              أفق الحدث والمسبار النسبي
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              النسبية العامة ومتريّة شفارتزشيلد
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Main Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas Viewport */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Eye className="w-4 h-4 text-purple-400" />
                      محاكاة قرص التراكم وعدسة الجاذبية لثقب أسود
                    </CardTitle>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10">
                      {selectedPreset.nameAr}
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
                        <span className="w-3 h-3 rounded-full bg-black border border-amber-400" />
                        أفق الحدث (rs)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        كرة الفوتونات (1.5 rs)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-sky-400" />
                        المسبار الاستكشافي
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
                      <Timer className="w-4 h-4 text-purple-400" />
                      التحكم بالمسبار والثقب الأسود
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Preset Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر الثقب الأسود</label>
                      <div className="space-y-1.5">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => setSelectedPreset(preset)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedPreset.id === preset.id
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{preset.nameAr}</div>
                            <div className="text-[10px] opacity-75">{preset.typeAr} • {preset.solarMasses.toLocaleString()} M☉</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Radial Distance Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">مسافة المسبار (مضاعفات أفق الحدث)</label>
                        <span className="text-xs font-mono text-purple-400 font-bold">{probeDistanceMultiplier.toFixed(2)} rs</span>
                      </div>
                      <Slider
                        value={[probeDistanceMultiplier]}
                        min={1.01}
                        max={6.0}
                        step={0.01}
                        onValueChange={(val) => {
                          setProbeDistanceMultiplier(val[0]);
                          setIsFalling(false);
                        }}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>أفق الحدث (1.0 rs)</span>
                        <span>كرة الفوتونات (1.5 rs)</span>
                        <span>مدار آمن (6.0 rs)</span>
                      </div>
                    </div>

                    {/* Fall towards event horizon button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => setIsFalling(!isFalling)}
                        className={`w-full font-bold text-xs ${
                          isFalling
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {isFalling ? 'إيقاف السقوط الحر' : 'بدء السقوط الحر نحو أفق الحدث 🚀'}
                      </Button>
                      <p className="text-[10px] text-slate-500 text-center mt-2">
                        لاحظ كيف تبطؤ ساعة المسبار تدريجياً كلما اقترب من أفق الحدث حتى تتوقف كلياً.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-purple-300">الفيزياء النسبية للثقوب السوداء (النسبية العامة 1915)</h3>
              <p>
                في عام 1916، استنتج الفيزيائي الألماني كارل شفارتزشيلد أول حل دقيق لمعادلات أينشتاين للمجال، واصفاً هندسة الزمكان حول كتلة كروية غير دوارة.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. نصف قطر شفارتزشيلد (Schwarzschild Radius)</h4>
                  <p className="text-sm font-mono text-purple-300">rs = 2GM / c²</p>
                  <p className="text-xs text-slate-400">
                    هو نصف القطر الذي إذا انضغطت داخله أي كتلة M تصبح سرعة الإفلات مساوية لسرعة الضوء c، ويتشكل أفق الحدث.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. معادلة تمدد الزمن الثقالي</h4>
                  <p className="text-sm font-mono text-purple-300">dτ = dt · √(1 - rs / r)</p>
                  <p className="text-xs text-slate-400">
                    كلما اقترب الموضع r من rs، يقترب المقدار تحت الجذر من الصفر، ويتوقف الزمن dτ ⟹ 0 بالنسبة للراصد البعيد.
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
                  اختبار مفاهيم النسبية العامة والثقوب السوداء
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: بالنسبة لراصد يقف بعيداً جداً عن ثقب أسود، ماذا يرى عندما يسقط رائد فضاء نحو أفق الحدث؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'يراه يعبر أفق الحدث بسرعة البرق ويختفي فوراً.' },
                    { id: 1, text: 'يراه يتباطأ تدريجياً ويتلاشى ضوؤه بسبب الإزاحة الحمراء التثاقلية، ويبدو كأنه تجمد للأبد عند أفق الحدث.' },
                    { id: 2, text: 'يرى ساعته تدق أسرع من المعتاد.' },
                    { id: 3, text: 'يرتد رائد الفضاء إلى الفضاء الخارجي.' },
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
                        <span>إجابة صحيحة ورائعة! بسبب تمدد الزمن التثاقلي اللانهائي عند أفق الحدث والإزاحة التثاقلية نحو الأحمر، يرى الراصد البعيد أن رائد الفضاء يتجمد ضوئياً ولا يعبر الأفق في زمن كوني محدود.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تمدد الزمن الثقالي يجعل الحركة تبدو متباطئة للغاية حتى تتجمد عند أفق الحدث بالنسبة للراصد البعيد.</span>
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
