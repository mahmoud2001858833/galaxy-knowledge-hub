import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Radio, Sun } from 'lucide-react';
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

interface Crystal {
  id: string;
  nameAr: string;
  nameEn: string;
  dSpacingNm: number; // Interplanar spacing d in nm
  latticeType: string;
  atomColor: string;
}

const CRYSTALS: Crystal[] = [
  { id: 'nacl', nameAr: 'ملح الطعام (NaCl - كلوريد الصوديوم)', nameEn: 'Sodium Chloride', dSpacingNm: 0.282, latticeType: 'مكعب مركزي الأوجه (FCC)', atomColor: '#84cc16' },
  { id: 'silicon', nameAr: 'السيليكون البلوري (Silicon)', nameEn: 'Silicon', dSpacingNm: 0.314, latticeType: 'بنية الألماس المكعبة', atomColor: '#38bdf8' },
  { id: 'gold', nameAr: 'الذهب النقي (Gold - Au)', nameEn: 'Gold', dSpacingNm: 0.235, latticeType: 'مكعب مركزي الأوجه', atomColor: '#eab308' },
  { id: 'graphene', nameAr: 'الجرافيت / الجرافين (Graphite)', nameEn: 'Graphite', dSpacingNm: 0.335, latticeType: 'طبقات سداسية', atomColor: '#94a3b8' },
];

interface XRaySource {
  id: string;
  nameAr: string;
  wavelengthNm: number; // lambda in nm
}

const SOURCES: XRaySource[] = [
  { id: 'cu-ka', nameAr: 'نحاس Cu-Kα (0.1542 nm)', wavelengthNm: 0.1542 },
  { id: 'mo-ka', nameAr: 'موليبدينوم Mo-Kα (0.0711 nm)', wavelengthNm: 0.0711 },
  { id: 'co-ka', nameAr: 'كوبالت Co-Kα (0.1789 nm)', wavelengthNm: 0.1789 },
];

export default function XRayDiffractionSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment Parameters
  const [selectedCrystal, setSelectedCrystal] = useState<Crystal>(CRYSTALS[0]);
  const [selectedSource, setSelectedSource] = useState<XRaySource>(SOURCES[0]);
  const [thetaDeg, setThetaDeg] = useState<number>(15.8); // incident angle in degrees (5 to 65)
  const [diffractionOrder, setDiffractionOrder] = useState<number>(1); // n = 1, 2
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Bragg's Law: n * lambda = 2 * d * sin(theta)
  // Optimal Bragg Angle for n=1: theta_bragg = asin(n * lambda / (2 * d))
  const braggAngleDeg = useMemo(() => {
    const ratio = (diffractionOrder * selectedSource.wavelengthNm) / (2 * selectedCrystal.dSpacingNm);
    if (ratio > 1) return null;
    return +((Math.asin(ratio) * 180) / Math.PI).toFixed(2);
  }, [diffractionOrder, selectedSource, selectedCrystal]);

  // Path Difference: Delta = 2 * d * sin(theta)
  const pathDifferenceNm = useMemo(() => {
    const thetaRad = (thetaDeg * Math.PI) / 180;
    return +(2 * selectedCrystal.dSpacingNm * Math.sin(thetaRad)).toFixed(4);
  }, [thetaDeg, selectedCrystal]);

  // Relative Interference Intensity (diffraction peak sinc/gaussian function)
  const intensity = useMemo(() => {
    if (!braggAngleDeg) return 0;
    const diff = thetaDeg - braggAngleDeg;
    // Gaussian peak with FWHM of 1.2 degrees
    const val = Math.exp(-Math.pow(diff / 1.0, 2));
    return +(val * 100).toFixed(1);
  }, [thetaDeg, braggAngleDeg]);

  const isConstructive = intensity > 80;

  // Generate Diffractogram curve (Intensity vs 2*Theta)
  const diffractogramData = useMemo(() => {
    const data = [];
    for (let t = 10; t <= 120; t += 0.5) {
      const theta = t / 2;
      let peak = 5; // background noise
      if (braggAngleDeg) {
        const peak1 = 95 * Math.exp(-Math.pow((theta - braggAngleDeg) / 1.0, 2));
        peak += peak1;
      }
      data.push({
        twoTheta: +t.toFixed(1),
        intensity: +peak.toFixed(1),
      });
    }
    return data;
  }, [braggAngleDeg]);

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveOffset = (waveOffset + 0.08) % 1;

      // Dark Chamber Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const crystalTopY = 170;
      const dPixel = 50; // pixel distance between atomic layers

      // Draw Atomic Lattice Layers (Top plane & Bottom plane)
      for (let layer = 0; layer < 3; layer++) {
        const py = crystalTopY + layer * dPixel;

        // Draw crystal plane line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(60, py);
        ctx.lineTo(canvas.width - 60, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Lattice Atoms
        for (let x = 80; x <= canvas.width - 80; x += 40) {
          ctx.save();
          ctx.fillStyle = selectedCrystal.atomColor;
          ctx.shadowColor = selectedCrystal.atomColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, py, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw Interplanar Spacing 'd' Dimension line
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, crystalTopY);
      ctx.lineTo(50, crystalTopY + dPixel);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px Cairo, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`d = ${selectedCrystal.dSpacingNm} nm`, 42, crystalTopY + dPixel / 2 + 4);
      ctx.restore();

      // Incoming & Reflected X-Rays
      const thetaRad = (thetaDeg * Math.PI) / 180;
      const rayLength = 180;
      const hitX = centerX;
      const hitY1 = crystalTopY;
      const hitY2 = crystalTopY + dPixel;

      // Incident ray 1 (hits top plane)
      const srcX1 = hitX - Math.cos(thetaRad) * rayLength;
      const srcY1 = hitY1 - Math.sin(thetaRad) * rayLength;
      // Reflected ray 1
      const refX1 = hitX + Math.cos(thetaRad) * rayLength;
      const refY1 = hitY1 - Math.sin(thetaRad) * rayLength;

      // Incident ray 2 (hits bottom plane)
      const srcX2 = hitX - Math.cos(thetaRad) * (rayLength + dPixel / Math.sin(thetaRad || 0.1));
      const srcY2 = hitY2 - Math.sin(thetaRad) * (rayLength + dPixel / Math.sin(thetaRad || 0.1));
      // Reflected ray 2
      const refX2 = hitX + Math.cos(thetaRad) * (rayLength + dPixel / Math.sin(thetaRad || 0.1));
      const refY2 = hitY2 - Math.sin(thetaRad) * (rayLength + dPixel / Math.sin(thetaRad || 0.1));

      // Draw X-ray beams
      ctx.save();
      const beamColor = isConstructive ? '#22c55e' : '#38bdf8';
      ctx.strokeStyle = beamColor;
      ctx.shadowColor = beamColor;
      ctx.shadowBlur = isConstructive ? 14 : 6;
      ctx.lineWidth = isConstructive ? 3.5 : 2;

      // Ray 1 path
      ctx.beginPath();
      ctx.moveTo(srcX1, srcY1);
      ctx.lineTo(hitX, hitY1);
      ctx.lineTo(refX1, refY1);
      ctx.stroke();

      // Ray 2 path
      ctx.beginPath();
      ctx.moveTo(srcX2, srcY2);
      ctx.lineTo(hitX, hitY2);
      ctx.lineTo(refX2, refY2);
      ctx.stroke();

      // Draw Angle Arc θ
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hitX - 60, hitY1, 30, Math.PI, Math.PI - thetaRad, true);
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Cairo, sans-serif';
      ctx.fillText(`θ = ${thetaDeg}°`, hitX - 100, hitY1 - 8);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [thetaDeg, selectedCrystal, isConstructive]);

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
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                  حيود الأشعة السينية وبنية البلورات (قانون براغ)
                </h1>
                <p className="text-sm text-slate-400">
                  استكشاف التداخل البناء للأشعة السينية وقياس المسافات البينية للشبكات البلورية
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
              onClick={() => setThetaDeg(braggAngleDeg || 15.8)}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              ضبط زاوية براغ الدقيقة
            </Button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زاوية السقوط (\(\theta\))</span>
              <p className="text-lg font-bold text-sky-400">{thetaDeg}°</p>
              <span className="text-[10px] text-slate-500">\(2\theta = {(thetaDeg * 2).toFixed(1)}^\circ\)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زاوية براغ النظرية (\(\theta_B\))</span>
              <p className="text-lg font-bold text-emerald-400">{braggAngleDeg ? `${braggAngleDeg}°` : 'غير ممكنة'}</p>
              <span className="text-[10px] text-slate-500">رتبة الحيود n = {diffractionOrder}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المسافة البينية (\(d\))</span>
              <p className="text-lg font-bold text-amber-400">{selectedCrystal.dSpacingNm} nm</p>
              <span className="text-[10px] text-slate-500 font-mono">{(selectedCrystal.dSpacingNm * 10).toFixed(2)} Å</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طول موجة الأشعة (\(\lambda\))</span>
              <p className="text-lg font-bold text-cyan-400">{selectedSource.wavelengthNm} nm</p>
              <span className="text-[10px] text-slate-500 font-mono">{(selectedSource.wavelengthNm * 10).toFixed(2)} Å</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">فرق المسار (\(2d\sin\theta\))</span>
              <p className="text-lg font-bold text-purple-400">{pathDifferenceNm} nm</p>
              <span className="text-[10px] text-slate-500">
                {(pathDifferenceNm / selectedSource.wavelengthNm).toFixed(2)} \(\lambda\)
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">شدة إشارة الحيود</span>
              <p className="text-lg font-bold text-emerald-400">{intensity}%</p>
              <span className="text-[10px] text-slate-500">
                {isConstructive ? '✨ تداخل بناء تام' : 'تداخل هدام'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Activity className="w-4 h-4" />
              الشبكة البلورية ومقياس الزوايا
            </TabsTrigger>
            <TabsTrigger value="diffractogram" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Sparkles className="w-4 h-4" />
              مخطط الحيود (Diffractogram)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قانون براغ وعلم البلورات
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
                      <Layers className="w-4 h-4 text-cyan-400" />
                      انعكاس وتداخل حزم الأشعة السينية على المستويات الذرية
                    </CardTitle>
                    <Badge variant="outline" className={`${isConstructive ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-400'}`}>
                      {isConstructive ? '✓ تداخل بناء (ذروة حيود براغ)' : 'تداخل هدام (إلغاء الموجات)'}
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
                      <Radio className="w-4 h-4 text-cyan-400" />
                      التحكم بالمصدر والبلورة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Angle Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">زاوية السقوط (\(\theta\))</span>
                        <span className="font-mono font-bold text-cyan-400">{thetaDeg}°</span>
                      </div>
                      <Slider
                        value={[thetaDeg]}
                        min={5}
                        max={60}
                        step={0.1}
                        onValueChange={(val) => setThetaDeg(+val[0].toFixed(1))}
                        className="py-1"
                      />
                    </div>

                    {/* Crystal Selection */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">نوع البلورة (Crystal Sample)</label>
                      <div className="space-y-1.5">
                        {CRYSTALS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCrystal(c)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedCrystal.id === c.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{c.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">d = {c.dSpacingNm} nm ({c.latticeType})</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Selection */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">أنبوب الأشعة السينية (X-Ray Anode)</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {SOURCES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSource(s)}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedSource.id === s.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="font-bold">{s.nameAr}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Diffractogram */}
          <TabsContent value="diffractogram" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-300">مخطط حيود الأشعة السينية (XRD Pattern: Intensity vs 2θ)</h3>
              <p className="text-xs text-slate-400">
                تظهر القمم الحادة (Bragg Peaks) عند الزوايا التي تحقق شرط التداخل البناء بدقة، ومنها يتم استنتاج البنية البلورية والمكونات المجهرية للمادة.
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diffractogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="twoTheta" stroke="#94a3b8" label={{ value: '2θ (degrees)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'الشدة (Counts/s)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="intensity" stroke="#38bdf8" strokeWidth={2} dot={false} name="الشدة" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-cyan-300">قانون براغ لحيود الأشعة السينية (William Lawrence Bragg - 1913)</h3>
              <p>
                نال ويليام براغ وابنه لورنس براغ جائزة نوبل في الفيزياء عام 1915 لتطويرهما هذه الطريقة الثورية التي مكّنت البشرية من "رؤية" ترتيب الذرات داخل المادة لأول مرة، ومن خلالها تم اكتشاف البنية الحلزونية المزدوجة للحمض النووي (DNA) على يد روزاليند فرانكلين وواتسون وكريك.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة براغ للحيود</h4>
                  <p className="text-sm font-mono text-cyan-300">\(n\lambda = 2d \sin\theta\)</p>
                  <p className="text-xs text-slate-400">
                    يحدث التداخل البناء عندما يكون فرق المسار بين شعاعين منعكسين من مستويين بلوريين متتاليين مساوياً لعدد صحيح من الأطوال الموجية.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. شرط تطبيق القانون</h4>
                  <p className="text-xs text-slate-400">
                    يجب أن يكون الطول الموجي للأشعة السينية مقارباً للمسافة بين الذرات (λ ≈ d ≈ 1 Å = 0.1 nm).
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
                  اختبار فهم قانون براغ
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: لماذا نستخدم الأشعة السينية (X-Rays) لدراسة التركيب البلوري للبلورات وليس الضوء المرئي؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'لأن الطول الموجي للأشعة السينية (حوالي 0.1 nm) يقارب المسافات البينية بين الذرات في البلورة.' },
                    { id: 1, text: 'لأن الأشعة السينية لا تتفاعل مع الإلكترونات.' },
                    { id: 2, text: 'لأن الضوء المرئي يحرق البلورات دائماً.' },
                    { id: 3, text: 'لأن الأشعة السينية موجات طولية وليست مستعرضة.' },
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
                        <span>إجابة صحيحة ودقيقة! لكي يحدث حيود واضح، يجب أن يكون الطول الموجي للموجة المستخدمة من نفس رتبة أبعاد الحواجز أو الشقوق (المسافات البينية الذرية).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. السبب الرئيسي هو أن طول موجة الضوء المرئي (400-700 nm) كبير جداً مقارنة بالأبعاد الذرية، بينما الأشعة السينية (0.1 nm) تماثل تماماً أبعاد الشبكة البلورية.</span>
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
