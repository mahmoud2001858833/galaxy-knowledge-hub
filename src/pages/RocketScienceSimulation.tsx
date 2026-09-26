import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, RotateCcw, Rocket, Flame, Target, Orbit, Eye, Layers } from 'lucide-react';
import Rocket3DScene from '@/components/rocket/Rocket3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const rocketChallenges: Challenge[] = [
  {
    id: 'launch_liftoff',
    title: 'الإقلاع واختراق الغلاف الجوي',
    description: 'اضبط قوة الدفع إلى أقصاها واصعد بالصاروخ لارتفاع ≥ 80 m وسرعة ≥ 25 m/s واثبت 3 ثوانٍ.',
    targetMetric: 'الارتفاع والسرعة',
    targetValue: 80,
    unit: 'm',
    holdDuration: 3,
    check: (m) => m.simulationType === 'launch' && (m.altitude ?? 0) >= 80 && (m.velocity ?? 0) >= 25,
  },
  {
    id: 'staging_separation',
    title: 'فصل مراحل الصاروخ بنجاح (Staging)',
    description: 'انتقل لنمط فصل المراحل ولاحظ تخلص الصاروخ من كتلة المعزز الثقيل لإشعال محرك الفراغ لمدة 3 ثوانٍ.',
    targetMetric: 'فصل المراحل',
    targetValue: 1,
    unit: 'حالة',
    holdDuration: 3,
    check: (m) => m.simulationType === 'staging',
  },
  {
    id: 'propulsive_landing',
    title: 'الهبوط الصاروخي الدقيق (Propulsive Landing)',
    description: 'انتقل لنمط الهبوط الصاروخي واكبح السرعة للهبوط على سفينة الدرونز البحرية لمدة 3 ثوانٍ.',
    targetMetric: 'الهبوط الرأسي',
    targetValue: 1,
    unit: 'حالة',
    holdDuration: 3,
    check: (m) => m.simulationType === 'landing',
  },
];

const RocketScienceSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [simulationType, setSimulationType] = useState<'launch' | 'staging' | 'orbit' | 'landing'>('launch');
  const [thrust, setThrust] = useState(75);
  const [fuelMass, setFuelMass] = useState(80);
  const [time, setTime] = useState(0);
  const [rocketState, setRocketState] = useState({
    altitude: 0,
    velocity: 0,
    fuel: 100,
    stage: 1,
    landed: false,
  });

  const updateRocketState = () => {
    setRocketState((prev) => {
      if (simulationType === 'launch') {
        if (prev.fuel <= 0) {
          const newVelocity = Math.max(0, prev.velocity - 0.2);
          const newAltitude = prev.altitude + newVelocity * 0.1;
          return { ...prev, velocity: newVelocity, altitude: newAltitude };
        }
        const fuelConsumption = thrust * 0.005;
        const newFuel = Math.max(0, prev.fuel - fuelConsumption);
        const acceleration = (thrust * 0.1) - 9.8 * 0.1;
        const newVelocity = Math.max(0, prev.velocity + acceleration * 0.1);
        const newAltitude = prev.altitude + newVelocity * 0.1;
        return {
          ...prev,
          fuel: newFuel,
          velocity: newVelocity,
          altitude: newAltitude,
        };
      }
      return prev;
    });
  };

  // 2D Canvas Fallback
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let i = 0; i < 60; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 47) % canvas.height;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      const groundY = canvas.height - 50;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, canvas.width, 50);

      // Simple 2D rocket
      const rocketX = canvas.width / 2;
      const rocketY = Math.max(80, groundY - 60 - rocketState.altitude * 2);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rocketX - 10, rocketY, 20, 50);
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY - 20);
      ctx.lineTo(rocketX - 10, rocketY);
      ctx.lineTo(rocketX + 10, rocketY);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      if (isPlaying && rocketState.fuel > 0) {
        ctx.beginPath();
        ctx.moveTo(rocketX - 8, rocketY + 50);
        ctx.lineTo(rocketX + 8, rocketY + 50);
        ctx.lineTo(rocketX, rocketY + 75 + Math.random() * 15);
        ctx.fillStyle = '#f97316';
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [viewMode, isPlaying, rocketState]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.05);
      updateRocketState();
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, thrust, simulationType]);

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(false);
    setRocketState({
      altitude: 0,
      velocity: 0,
      fuel: 100,
      stage: 1,
      landed: false,
    });
  };

  // Tsiolkovsky delta-v estimation (ve = 3000 m/s for kerolox)
  const ve = 3000;
  const deltaV = Math.round(ve * Math.log(100 / Math.max(15, 100 - (100 - rocketState.fuel) * 0.75)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/scientific-simulations');
              }}
              className="text-slate-400 hover:text-white p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5 ml-1" />
              العودة للتجارب
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-orange-600/20 border border-orange-500/40 rounded-xl">
                <Rocket className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
                  علوم وهندسة الصواريخ الفضائية ثلاثية الأبعاد (3D Rocketry)
                </h1>
                <p className="text-xs text-slate-400">
                  معادلة تسيولكوفسكي، فصل المراحل، الإدخال المداري والهبوط الذاتي التراجعي
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
              className="text-xs border-slate-700 bg-slate-900/80 text-slate-200"
            >
              {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 ml-1 text-orange-400" /> : <Layers className="w-3.5 h-3.5 ml-1 text-cyan-400" />}
              {viewMode === '3d' ? 'عرض 3D Launchpad' : 'عرض 2D Canvas'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs border-slate-700 bg-slate-900/80 text-slate-200"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 ml-1 text-amber-400" /> : <Play className="h-3.5 w-3.5 ml-1 text-emerald-400" />}
              {isPlaying ? 'إيقاف' : 'إطلاق'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetSimulation} className="border-slate-700 bg-slate-900/80 text-slate-200">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main 3D Viewport */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
              {viewMode === '3d' ? (
                <div className="h-[520px] relative">
                  <Canvas camera={{ position: [0, 1.5, 7.5], fov: 45 }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 15, 10]} intensity={1.2} />
                    <directionalLight position={[-10, 5, -5]} intensity={0.4} color="#f97316" />
                    <Rocket3DScene
                      simulationType={simulationType}
                      thrust={thrust}
                      altitude={rocketState.altitude}
                      velocity={rocketState.velocity}
                      fuel={rocketState.fuel}
                      isPlaying={isPlaying}
                    />
                    <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={16} />
                  </Canvas>

                  {/* CyberLab HUD */}
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <CyberLabHUD
                      metrics={[
                        { label: 'الارتفاع H', value: Math.round(rocketState.altitude), unit: 'm', color: '#38bdf8' },
                        { label: 'السرعة V', value: Number(rocketState.velocity.toFixed(1)), unit: 'm/s', color: '#10b981' },
                        { label: 'الوقود المتبقي', value: `${Math.round(rocketState.fuel)}%`, color: rocketState.fuel > 20 ? '#f59e0b' : '#ef4444' },
                        { label: 'Δv تسيولكوفسكي', value: deltaV, unit: 'm/s', color: '#ec4899' },
                        { label: 'قوة الدفع', value: `${thrust}%`, color: '#f97316' },
                      ]}
                      status={isPlaying ? 'ACTIVE' : 'IDLE'}
                      waveformData={[
                        (rocketState.altitude / 5) % 35,
                        (rocketState.velocity * 2) % 30,
                        rocketState.fuel % 25,
                        thrust % 30,
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
                </div>
              )}
            </div>

            {/* Gamified Challenge Engine */}
            <LabChallengeEngine
              challenges={rocketChallenges}
              currentMetrics={{
                simulationType: simulationType,
                altitude: rocketState.altitude,
                velocity: rocketState.velocity,
                fuel: rocketState.fuel,
                thrust: thrust,
              }}
            />
          </div>

          {/* Controls Column */}
          <div className="space-y-4">
            {/* Simulation Type Selector */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">مرحلة المهمة الفضائية</label>
                <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); resetSimulation(); labSound.playLaserPulse(400); }}>
                  <TabsList className="grid grid-cols-2 gap-1 bg-slate-800">
                    <TabsTrigger value="launch" className="text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
                      <Flame className="h-3 w-3 ml-1" />
                      إطلاق رأسي
                    </TabsTrigger>
                    <TabsTrigger value="staging" className="text-xs data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
                      <Rocket className="h-3 w-3 ml-1" />
                      فصل المراحل
                    </TabsTrigger>
                    <TabsTrigger value="orbit" className="text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
                      <Orbit className="h-3 w-3 ml-1" />
                      إدخال مداري
                    </TabsTrigger>
                    <TabsTrigger value="landing" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      <Target className="h-3 w-3 ml-1" />
                      هبوط تراجعي
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {simulationType === 'launch' && (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>خانق الدفع (Thrust Throttle)</span>
                      <span className="font-mono text-orange-400">{thrust}%</span>
                    </div>
                    <Slider value={[thrust]} onValueChange={([v]) => setThrust(v)} min={0} max={100} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>كتلة الوقود الابتدائية</span>
                      <span className="font-mono text-cyan-400">{fuelMass}%</span>
                    </div>
                    <Slider value={[fuelMass]} onValueChange={([v]) => setFuelMass(v)} min={20} max={100} step={1} />
                  </div>
                </div>
              )}
            </div>

            {/* AI Lab CoPilot */}
            <LiveAILabCoPilot
              experimentName="علوم الصواريخ وهندسة الفضاء"
              currentMetrics={{
                simulationType: simulationType,
                thrust: thrust,
                altitude: Math.round(rocketState.altitude),
                velocity: Number(rocketState.velocity.toFixed(1)),
                fuel: Math.round(rocketState.fuel),
                deltaV: deltaV,
              }}
              hint={
                simulationType === 'launch'
                  ? 'معادلة تسيولكوفسكي Δv = ve ln(m0/mf): نسبة كتلة الوقود إلى كتلة الهيكل هي العامل الحاسم في الوصول لسرعة الإفلات.'
                  : simulationType === 'staging'
                  ? 'التخلص من وزن خزان المرحلة الأولى الفارغ يقلل الكتلة الإجمالية ويوفر تسارعاً هائلاً للمرحلة الثانية في الفراغ.'
                  : simulationType === 'orbit'
                  ? 'السرعة المدارية v = √(GM/r): السقوط الحر المستمر حول انحناء الأرض دون الاصطدام بها.'
                  : 'الهبوط الصاروخي الذاتي يعتمد على شبكات الزعانف الشبكية (Grid Fins) ومناورات الكبح التراجعي العكسي.'
              }
            />

            {/* Theoretical Background */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 text-xs leading-relaxed text-slate-300">
              <h3 className="font-bold text-amber-300">المعادلات الفيزيائية للصواريخ</h3>
              <p>• <strong>معادلة الصاروخ المثالي (تسيولكوفسكي):</strong> Δv = ve · ln(m₀/m_f)</p>
              <p>• <strong>قوة دفع المحرك:</strong> F = ṁ · ve + (Pe - Pa) · Ae</p>
              <p>• <strong>السرعة المدارية الدنيا (LEO):</strong> v ≈ 7.8 km/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RocketScienceSimulation;
