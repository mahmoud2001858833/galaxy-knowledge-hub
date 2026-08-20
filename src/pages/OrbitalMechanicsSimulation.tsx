import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, Activity, Sparkles, BookOpen, Layers, Flame, Compass, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

interface CelestialBody {
  id: string;
  nameAr: string;
  nameEn: string;
  massKg: number;
  radiusKm: number;
  color: string;
  defaultR1Km: number; // e.g. LEO
  defaultR2Km: number; // e.g. GEO
}

const BODIES: CelestialBody[] = [
  { id: 'earth', nameAr: 'كوكب الأرض (Earth: LEO إلى GEO)', nameEn: 'Earth', massKg: 5.972e24, radiusKm: 6371, color: '#38bdf8', defaultR1Km: 6771, defaultR2Km: 42164 },
  { id: 'mars', nameAr: 'كوكب المريخ (Mars Orbit)', nameEn: 'Mars', massKg: 6.417e23, radiusKm: 3389, color: '#f97316', defaultR1Km: 3700, defaultR2Km: 20400 },
  { id: 'moon', nameAr: 'القمر (Lunar Orbit)', nameEn: 'Moon', massKg: 7.342e22, radiusKm: 1737, color: '#cbd5e1', defaultR1Km: 1850, defaultR2Km: 8000 },
];

const G = 6.67430e-11;

type FlightPhase = 'orbit1' | 'transfer' | 'orbit2';

export default function OrbitalMechanicsSimulation() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(BODIES[0]);
  const [r1AltitudeKm, setR1AltitudeKm] = useState<number>(400); // 400 km above surface (LEO)
  const [r2AltitudeKm, setR2AltitudeKm] = useState<number>(35786); // GEO altitude above surface
  const [flightPhase, setFlightPhase] = useState<FlightPhase>('orbit1');
  const [shipAngleRad, setShipAngleRad] = useState<number>(0);
  const [burn1Done, setBurn1Done] = useState<boolean>(false);
  const [burn2Done, setBurn2Done] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Radial distances in meters
  const mu = G * selectedBody.massKg;
  const r1 = (selectedBody.radiusKm + r1AltitudeKm) * 1000;
  const r2 = (selectedBody.radiusKm + r2AltitudeKm) * 1000;

  // Circular Speeds
  const v1 = Math.sqrt(mu / r1); // initial orbit speed (m/s)
  const v2 = Math.sqrt(mu / r2); // target orbit speed (m/s)

  // Transfer Ellipse
  const aTrans = (r1 + r2) / 2;
  const vTransPeriapsis = Math.sqrt(mu * (2 / r1 - 1 / aTrans));
  const vTransApoapsis = Math.sqrt(mu * (2 / r2 - 1 / aTrans));

  // Delta-V Burns
  const deltaV1 = vTransPeriapsis - v1; // departure burn (m/s)
  const deltaV2 = v2 - vTransApoapsis; // insertion burn (m/s)
  const totalDeltaV = deltaV1 + deltaV2;

  // Transfer Flight Duration
  const transferTimeSec = Math.PI * Math.sqrt(Math.pow(aTrans, 3) / mu);
  const transferTimeHours = +(transferTimeSec / 3600).toFixed(2);

  // Orbital Period of Orbit 1
  const period1Hours = +( (2 * Math.PI * Math.sqrt(Math.pow(r1, 3) / mu)) / 3600 ).toFixed(2);
  const period2Hours = +( (2 * Math.PI * Math.sqrt(Math.pow(r2, 3) / mu)) / 3600 ).toFixed(2);

  // Execute Burn 1 (Enter Hohmann Transfer)
  const handleBurn1 = () => {
    setFlightPhase('transfer');
    setBurn1Done(true);
    setShipAngleRad(0);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Execute Burn 2 (Circularize into Destination Orbit)
  const handleBurn2 = () => {
    setFlightPhase('orbit2');
    setBurn2Done(true);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
  };

  const handleResetFlight = () => {
    setFlightPhase('orbit1');
    setBurn1Done(false);
    setBurn2Done(false);
    setShipAngleRad(0);
  };

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const r1Pix = 48; // pixel radius for orbit 1
    const r2Pix = 145; // pixel radius for orbit 2
    const aTransPix = (r1Pix + r2Pix) / 2;
    const cTransPix = aTransPix - r1Pix; // ellipse center offset

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark Space background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Orbit 1 (LEO - Blue circle)
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r1Pix, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Orbit 2 (GEO - Green circle)
      ctx.save();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r2Pix, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Hohmann Ellipse Path (Yellow dashed)
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      // Ellipse centered at (centerX - cTransPix, centerY)
      ctx.ellipse(centerX - cTransPix, centerY, aTransPix, Math.sqrt(r1Pix * r2Pix), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Central Body
      ctx.save();
      ctx.fillStyle = selectedBody.color;
      ctx.shadowColor = selectedBody.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedBody.nameAr.split(' ')[0], centerX, centerY + 3);
      ctx.restore();

      // Calculate Spacecraft Position
      let shipX = centerX;
      let shipY = centerY;

      if (isPlaying) {
        if (flightPhase === 'orbit1') {
          setShipAngleRad((ang) => ang + 0.03);
        } else if (flightPhase === 'transfer') {
          setShipAngleRad((ang) => {
            const next = ang + 0.015;
            if (next >= Math.PI) {
              // Reached Apoapsis (Destination Orbit arrival point)
              return Math.PI;
            }
            return next;
          });
        } else {
          setShipAngleRad((ang) => ang + 0.008);
        }
      }

      if (flightPhase === 'orbit1') {
        shipX = centerX + Math.cos(shipAngleRad) * r1Pix;
        shipY = centerY + Math.sin(shipAngleRad) * r1Pix;
      } else if (flightPhase === 'transfer') {
        // Parametric ellipse
        const bTransPix = Math.sqrt(r1Pix * r2Pix);
        shipX = centerX - cTransPix + Math.cos(shipAngleRad) * aTransPix;
        shipY = centerY + Math.sin(shipAngleRad) * bTransPix;
      } else {
        // Orbit 2
        shipX = centerX + Math.cos(shipAngleRad) * r2Pix;
        shipY = centerY + Math.sin(shipAngleRad) * r2Pix;
      }

      // Draw Spacecraft & Thruster
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Thruster flash if near burn points
      if (
        (flightPhase === 'transfer' && shipAngleRad < 0.2) ||
        (flightPhase === 'orbit2' && Math.abs(shipAngleRad - Math.PI) < 0.2)
      ) {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(shipX - Math.cos(shipAngleRad) * 7, shipY - Math.sin(shipAngleRad) * 7, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ship Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Cairo, sans-serif';
      ctx.fillText('المركبة', shipX, shipY - 10);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [flightPhase, shipAngleRad, isPlaying, selectedBody]);

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
              <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-700 rounded-2xl shadow-lg shadow-sky-500/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-300 via-amber-200 to-indigo-300 bg-clip-text text-transparent">
                  ميكانيكا المدارات ومناورة الانتقال المداري (Hohmann Transfer)
                </h1>
                <p className="text-sm text-slate-400">
                  تخطيط مناورات الدفع الصاروخي \(\Delta v\) والانتقال الإهليلجي بأقل استهلاك للطاقة والوقود
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
              onClick={handleResetFlight}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة المركبة للمدار 1
            </Button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">سرعة المدار الأول (\(v_1\))</span>
              <p className="text-lg font-bold text-sky-400">{(v1 / 1000).toFixed(2)} km/s</p>
              <span className="text-[10px] text-slate-500">الزمن الدوري: {period1Hours} h</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفعة الانطلاق (\(\Delta v_1\))</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{(deltaV1 / 1000).toFixed(3)} km/s</p>
              <span className="text-[10px] text-slate-500">عند الحضيض Periapsis</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفعة الاستقرار (\(\Delta v_2\))</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{(deltaV2 / 1000).toFixed(3)} km/s</p>
              <span className="text-[10px] text-slate-500">عند الأوج Apoapsis</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">إجمالي الدفع (Δv_total)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{(totalDeltaV / 1000).toFixed(3)} km/s</p>
              <span className="text-[10px] text-slate-500">ميزانية الوقود</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زمن رحلة الانتقال</span>
              <p className="text-lg font-bold text-cyan-400">{transferTimeHours} h</p>
              <span className="text-[10px] text-slate-500">نصف دورة إهليلجية</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المرحلة المدارية</span>
              <p className="text-xs font-bold text-slate-200 mt-1">
                {flightPhase === 'orbit1'
                  ? 'المدار المنخفض 1'
                  : flightPhase === 'transfer'
                  ? '🚀 مسار الانتقال هوهمان'
                  : '✓ المدار الجغرافي 2'}
              </p>
              <span className="text-[10px] text-slate-500">{selectedBody.nameAr.split(' ')[0]}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Activity className="w-4 h-4" />
              خريطة المدارات والمناورات
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قوانين كبلر ومعادلة فيس-فيفا
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
                      <Compass className="w-4 h-4 text-sky-400" />
                      خريطة المدارات المدارية ومسار الانتقال هوهمان
                    </CardTitle>
                    <Badge variant="outline" className="border-sky-500/50 text-sky-400 bg-sky-500/10">
                      {selectedBody.nameAr}
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
                        <span className="w-3 h-3 rounded-full bg-sky-400" />
                        المدار الأولي (LEO)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        مسار هوهمان الإهليلجي
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        المدار النهائي (GEO)
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
                      <Flame className="w-4 h-4 text-amber-400" />
                      لوحة إطلاق وتنفيذ المناورات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Celestial Body Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر الجرم السماوي المركزي</label>
                      <div className="space-y-1.5">
                        {BODIES.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setSelectedBody(b);
                              handleResetFlight();
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedBody.id === b.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{b.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">نصف القطر: {b.radiusKm} km</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Maneuver Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block">تنفيذ نبضات الدفع الصاروخي (Δv)</span>
                      
                      <Button
                        disabled={flightPhase !== 'orbit1'}
                        onClick={handleBurn1}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-yellow-200" />
                        1. تشغيل الدفع الأول (Δv₁ = +{(deltaV1/1000).toFixed(3)} km/s)
                      </Button>

                      <Button
                        disabled={flightPhase !== 'transfer' || shipAngleRad < Math.PI * 0.9}
                        onClick={handleBurn2}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-emerald-200" />
                        2. تشغيل الدفع الثاني (Δv₂ = +{(deltaV2/1000).toFixed(3)} km/s)
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
              <h3 className="text-xl font-bold text-sky-300">ميكانيكا المدارات ومناورة الانتقال المداري لهوهمان (1925)</h3>
              <p>
                اقترح العالم الألماني فالتر هوهمان عام 1925 هذه المناورة المدارية الإهليلجية، وتعتبر حتى اليوم الطريقة الأكثر كفاءة واقتصادية في استهلاك الوقود لنقل مركبة فضائية بين مدارين دائريين متحدي المركز.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة فيس-فيفا (Vis-Viva Equation)</h4>
                  <p className="text-sm font-mono text-sky-300">v = √(GM · (2/r - 1/a))</p>
                  <p className="text-xs text-slate-400">
                    تحدد السرعة اللحظية لمركبة فضائية عند أي مسافة \(r\) في مدار إهليلجي ذي نصف محور أكبر \(a\).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. نبضات الدفع الصاروخي</h4>
                  <p className="text-xs text-slate-400">
                    <strong>الدفعة الأولى \(\Delta v_1\):</strong> تُعطى في الاتجاه الأمامي للحركة عند الحضيض لتوسيع الأوج حتى يصل لمدار الهدف.<br/>
                    <strong>الدفعة الثانية \(\Delta v_2\):</strong> تُعطى عند الأوج لجعل المدار دائرياً متزناً.
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
                  اختبار مفاهيم ميكانيكا المدارات
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: عند الانتقال من مدار أرضي منخفض (LEO) إلى مدار جغرافي مرتفع (GEO) باستخدام مناورة هوهمان، أين يجب توجيه وتشغيل الدفعة الصاروخية الأولى (\(\Delta v_1\))؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'نحو مركز الأرض مباشرة.' },
                    { id: 1, text: 'عكس اتجاه الحركة لفرملة المركبة.' },
                    { id: 2, text: 'في الاتجاه المماسي الأمامي للحركة (Prograde) لرفع أوج المدار الإهليلجي.' },
                    { id: 3, text: 'عمودياً على مستوى المدار.' },
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
                        <span>إجابة صحيحة ورائعة! الدفع في الاتجاه المماسي للحركة (Prograde) يرفع الطاقة الميكانيكية النوعية للمدار ويحول المدار الدائري إلى إهليلجي يصل أوجه لمدار الهدف.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. لرفع المدار يجب دائماً إعطاء دفعة أمامية تزيد السرعة المماسية (Prograde Burn).</span>
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
