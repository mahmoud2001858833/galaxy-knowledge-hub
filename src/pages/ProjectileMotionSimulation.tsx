import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Play, Square, RotateCcw, TrendingUp, Zap, Activity, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProjectilePhysics } from '@/hooks/useProjectilePhysics';
import StarField from '@/components/StarField';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Bar } from 'recharts';

const ProjectileMotionSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const {
    state,
    launchProjectile,
    resetProjectile,
    updateProjectile,
    projectileStats,
    setAngle,
    setInitialVelocity,
    setHeight,
    setAirResistance,
    startPendulum,
    stopPendulum,
    resetPendulum,
    updatePendulum,
    pendulumStats,
    setPendulumLength,
    setPendulumAngle,
    setPendulumDamping,
    startFreeFall,
    stopFreeFall,
    resetFreeFall,
    updateFreeFall,
    freeFallStats,
    setFreeFallHeight,
    setEnvironment,
    GRAVITY_VALUES
  } = useProjectilePhysics();

  const [activeTab, setActiveTab] = useState('projectile');
  const [chartType, setChartType] = useState<'position' | 'velocity' | 'energy'>('position');
  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (activeTab === 'projectile' && state.isLaunched) {
        updateProjectile(deltaTime / 50);
      } else if (activeTab === 'pendulum' && state.pendulumIsRunning) {
        updatePendulum(deltaTime / 1000);
      } else if (activeTab === 'freefall' && state.freeFallIsRunning) {
        updateFreeFall(deltaTime / 100);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab, state.isLaunched, state.pendulumIsRunning, state.freeFallIsRunning, updateProjectile, updatePendulum, updateFreeFall]);

  // Draw projectile
  useEffect(() => {
    if (activeTab !== 'projectile') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 3;
    const groundY = canvas.height - 30;
    
    // Clear with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Ground with grass effect
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    groundGradient.addColorStop(0, '#166534');
    groundGradient.addColorStop(1, '#14532d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, canvas.width, 30);

    // Trajectory trail
    if (showTrail && state.trajectory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      state.trajectory.forEach((point, i) => {
        const x = 60 + point.x * scale;
        const y = groundY - point.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Launch platform
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, groundY - state.height * scale, 40, state.height * scale + 5);

    // Cannon with rotation
    ctx.save();
    ctx.translate(60, groundY - state.height * scale);
    ctx.rotate(-state.angle * Math.PI / 180);
    
    // Cannon body gradient
    const cannonGradient = ctx.createLinearGradient(0, -10, 0, 10);
    cannonGradient.addColorStop(0, '#6b7280');
    cannonGradient.addColorStop(0.5, '#374151');
    cannonGradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = cannonGradient;
    ctx.fillRect(0, -10, 50, 20);
    
    // Cannon tip
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(45, -6, 10, 12);
    ctx.restore();

    // Angle arc indicator
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(60, groundY - state.height * scale, 35, 0, -state.angle * Math.PI / 180, true);
    ctx.stroke();
    
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${state.angle}°`, 100, groundY - state.height * scale - 15);

    // Projectile
    if (state.isLaunched || state.trajectory.length > 0) {
      const pos = state.projectilePosition;
      const x = 60 + pos.x * scale;
      const y = groundY - pos.y * scale;
      
      // Glow effect
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
      glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      glowGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
      glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Main projectile
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Velocity vectors
      if (showVectors && state.isLaunched) {
        const vx = state.projectileVelocity.vx;
        const vy = state.projectileVelocity.vy;
        const vScale = 1.5;

        // Vx vector (horizontal - blue)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx * vScale, y);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(x + vx * vScale, y);
        ctx.lineTo(x + vx * vScale - 8, y - 5);
        ctx.lineTo(x + vx * vScale - 8, y + 5);
        ctx.fill();

        // Vy vector (vertical - green)
        ctx.strokeStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - vy * vScale);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        const vyEnd = y - vy * vScale;
        ctx.moveTo(x, vyEnd);
        ctx.lineTo(x - 5, vyEnd + (vy > 0 ? -8 : 8));
        ctx.lineTo(x + 5, vyEnd + (vy > 0 ? -8 : 8));
        ctx.fill();

        // Labels
        ctx.font = '12px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(`Vx: ${vx.toFixed(1)}`, x + vx * vScale + 10, y);
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`Vy: ${vy.toFixed(1)}`, x + 10, y - vy * vScale);
      }
    }

    // Live stats panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(canvas.width - 180, 10, 170, 90);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(canvas.width - 180, 10, 170, 90);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📊 البيانات الحية', canvas.width - 170, 30);
    ctx.font = '11px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`المدى: ${projectileStats.range.toFixed(1)} m`, canvas.width - 170, 50);
    ctx.fillText(`أقصى ارتفاع: ${projectileStats.maxHeight.toFixed(1)} m`, canvas.width - 170, 65);
    ctx.fillText(`زمن الطيران: ${projectileStats.timeOfFlight.toFixed(2)} s`, canvas.width - 170, 80);
    ctx.fillText(`السرعة: ${Math.sqrt(state.projectileVelocity.vx ** 2 + state.projectileVelocity.vy ** 2).toFixed(1)} m/s`, canvas.width - 170, 95);

  }, [activeTab, state, projectileStats, showVectors, showTrail]);

  // Draw pendulum
  useEffect(() => {
    if (activeTab !== 'pendulum') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const pivotY = 60;
    const lengthScale = 120;

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Support beam
    ctx.fillStyle = '#374151';
    ctx.fillRect(centerX - 100, 30, 200, 15);

    // Pivot point
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.arc(centerX, pivotY, 12, 0, Math.PI * 2);
    ctx.fill();

    const angleRad = state.pendulumAngle * Math.PI / 180;
    const bobX = centerX + Math.sin(angleRad) * state.pendulumLength * lengthScale;
    const bobY = pivotY + Math.cos(angleRad) * state.pendulumLength * lengthScale;

    // String with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Bob glow
    const glowGradient = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 40);
    glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Bob
    const bobGradient = ctx.createRadialGradient(bobX - 5, bobY - 5, 0, bobX, bobY, 25);
    bobGradient.addColorStop(0, '#60a5fa');
    bobGradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = bobGradient;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 25, 0, Math.PI * 2);
    ctx.fill();

    // Angle indicator
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, pivotY);
    ctx.lineTo(centerX, pivotY + 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Info panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(10, 10, 180, 100);
    ctx.strokeStyle = '#22c55e';
    ctx.strokeRect(10, 10, 180, 100);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('⏱️ بيانات البندول', 20, 32);
    ctx.font = '11px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`الدور: ${pendulumStats.period.toFixed(3)} s`, 20, 52);
    ctx.fillText(`الطاقة الكلية: ${pendulumStats.total.toFixed(4)} J`, 20, 68);
    ctx.fillText(`طاقة الوضع: ${pendulumStats.potential.toFixed(4)} J`, 20, 84);
    ctx.fillText(`طاقة الحركة: ${pendulumStats.kinetic.toFixed(4)} J`, 20, 100);

  }, [activeTab, state.pendulumAngle, state.pendulumLength, pendulumStats]);

  // Draw free fall
  useEffect(() => {
    if (activeTab !== 'freefall') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 0.6;
    const groundY = canvas.height - 30;

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Height markers
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 1;
    for (let h = 0; h <= state.freeFallHeight; h += 50) {
      const y = groundY - h * scale;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.fillText(`${h}m`, 10, y - 3);
    }

    // Ground
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, groundY, canvas.width, 30);

    // Falling object
    const objX = canvas.width / 2;
    const objY = groundY - state.freeFallPosition * scale;

    // Trail
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    for (let i = 0; i < 10; i++) {
      const trailY = objY + i * 8;
      if (trailY < groundY) {
        ctx.beginPath();
        ctx.arc(objX, trailY, 15 - i, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Object glow
    const glowGradient = ctx.createRadialGradient(objX, objY, 0, objX, objY, 35);
    glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
    glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(objX, objY, 35, 0, Math.PI * 2);
    ctx.fill();

    // Object
    const objGradient = ctx.createRadialGradient(objX - 5, objY - 5, 0, objX, objY, 20);
    objGradient.addColorStop(0, '#f87171');
    objGradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = objGradient;
    ctx.beginPath();
    ctx.arc(objX, objY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Info panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(canvas.width - 200, 10, 190, 110);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(canvas.width - 200, 10, 190, 110);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('🌍 بيانات السقوط الحر', canvas.width - 190, 32);
    ctx.font = '11px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`الارتفاع: ${state.freeFallPosition.toFixed(1)} m`, canvas.width - 190, 52);
    ctx.fillText(`السرعة: ${freeFallStats.currentVelocity.toFixed(2)} m/s`, canvas.width - 190, 68);
    ctx.fillText(`الجاذبية: ${state.gravity.toFixed(2)} m/s²`, canvas.width - 190, 84);
    ctx.fillText(`السرعة النهائية: ${freeFallStats.terminalVelocity === Infinity ? '∞' : freeFallStats.terminalVelocity.toFixed(1)} m/s`, canvas.width - 190, 100);
    ctx.fillText(`البيئة: ${state.environment === 'earth' ? 'الأرض' : state.environment === 'moon' ? 'القمر' : state.environment === 'mars' ? 'المريخ' : state.environment === 'jupiter' ? 'المشتري' : 'فراغ'}`, canvas.width - 190, 116);

  }, [activeTab, state.freeFallPosition, state.freeFallHeight, freeFallStats, state.gravity, state.environment]);

  // Prepare chart data
  const trajectoryData = state.trajectory.slice(-150).map((p, i) => ({
    time: (i * 0.02).toFixed(2),
    x: p.x.toFixed(1),
    y: p.y.toFixed(1),
    vx: state.projectileVelocity.vx.toFixed(1),
    vy: state.projectileVelocity.vy.toFixed(1),
    v: Math.sqrt(state.projectileVelocity.vx ** 2 + state.projectileVelocity.vy ** 2).toFixed(1)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <StarField starCount={150} speed={0.2} />

      <div className="relative z-10">
        <motion.header 
          className="p-4 border-b border-border/50 backdrop-blur-md bg-background/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }} className="gap-2">
              <ArrowLeft size={20} />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
            </Button>
            <div className="flex items-center gap-3">
              <Target className="text-red-400" size={28} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                فيزياء المقذوفات والحركة
              </h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="projectile" className="gap-2">
                <Target size={16} />
                المقذوفات
              </TabsTrigger>
              <TabsTrigger value="pendulum" className="gap-2">
                <Activity size={16} />
                البندول
              </TabsTrigger>
              <TabsTrigger value="freefall" className="gap-2">
                <ChevronDown size={16} />
                السقوط الحر
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                  <CardContent className="p-4">
                    <canvas ref={canvasRef} width={800} height={400} className="w-full rounded-lg border border-border" />
                  </CardContent>
                </Card>

                {/* Enhanced Charts */}
                <Card className="bg-card/80 backdrop-blur-md">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="text-blue-400" size={20} />
                      الرسوم البيانية التفاعلية
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge 
                        variant={chartType === 'position' ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => setChartType('position')}
                      >
                        الموضع
                      </Badge>
                      <Badge 
                        variant={chartType === 'velocity' ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => setChartType('velocity')}
                      >
                        السرعة
                      </Badge>
                      <Badge 
                        variant={chartType === 'energy' ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => setChartType('energy')}
                      >
                        الطاقة
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      {chartType === 'position' ? (
                        <AreaChart data={trajectoryData}>
                          <defs>
                            <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" label={{ value: 'الزمن (s)', position: 'bottom', fill: '#888' }} />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                          <Legend />
                          <Area type="monotone" dataKey="x" stroke="#3b82f6" fillOpacity={1} fill="url(#colorX)" name="X (m)" />
                          <Area type="monotone" dataKey="y" stroke="#22c55e" fillOpacity={1} fill="url(#colorY)" name="Y (m)" />
                        </AreaChart>
                      ) : chartType === 'velocity' ? (
                        <LineChart data={trajectoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="vx" stroke="#3b82f6" name="Vx (m/s)" dot={false} strokeWidth={2} />
                          <Line type="monotone" dataKey="vy" stroke="#22c55e" name="Vy (m/s)" dot={false} strokeWidth={2} />
                          <Line type="monotone" dataKey="v" stroke="#f59e0b" name="V (m/s)" dot={false} strokeWidth={2} />
                        </LineChart>
                      ) : (
                        <ComposedChart data={trajectoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                          <Legend />
                          <Bar dataKey="y" fill="#8b5cf6" name="طاقة الوضع" opacity={0.7} />
                          <Line type="monotone" dataKey="v" stroke="#f59e0b" name="طاقة الحركة" strokeWidth={2} />
                        </ComposedChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <TabsContent value="projectile" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md border-red-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="text-yellow-400" size={18} />
                        التحكم
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>زاوية الإطلاق</span>
                          <Badge variant="secondary">{state.angle}°</Badge>
                        </label>
                        <Slider value={[state.angle]} onValueChange={([v]) => setAngle(v)} min={5} max={85} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>السرعة الابتدائية</span>
                          <Badge variant="secondary">{state.initialVelocity} m/s</Badge>
                        </label>
                        <Slider value={[state.initialVelocity]} onValueChange={([v]) => setInitialVelocity(v)} min={10} max={100} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>الارتفاع الابتدائي</span>
                          <Badge variant="secondary">{state.height} m</Badge>
                        </label>
                        <Slider value={[state.height]} onValueChange={([v]) => setHeight(v)} min={0} max={50} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>مقاومة الهواء</span>
                          <Badge variant="secondary">{(state.airResistance * 100).toFixed(0)}%</Badge>
                        </label>
                        <Slider value={[state.airResistance * 100]} onValueChange={([v]) => setAirResistance(v / 100)} min={0} max={50} className="mt-2" />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant={showVectors ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setShowVectors(!showVectors)}
                          className="flex-1"
                        >
                          المتجهات
                        </Button>
                        <Button 
                          variant={showTrail ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setShowTrail(!showTrail)}
                          className="flex-1"
                        >
                          المسار
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={launchProjectile} disabled={state.isLaunched} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Play size={16} className="mr-1" />
                          إطلاق
                        </Button>
                        <Button variant="outline" onClick={resetProjectile} className="flex-1">
                          <RotateCcw size={16} className="mr-1" />
                          إعادة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Results Card */}
                  <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">📊 النتائج</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-blue-500/20">
                        <div className="text-xs text-muted-foreground">المدى</div>
                        <div className="font-bold">{projectileStats.range.toFixed(1)} m</div>
                      </div>
                      <div className="p-2 rounded bg-green-500/20">
                        <div className="text-xs text-muted-foreground">أقصى ارتفاع</div>
                        <div className="font-bold">{projectileStats.maxHeight.toFixed(1)} m</div>
                      </div>
                      <div className="p-2 rounded bg-orange-500/20">
                        <div className="text-xs text-muted-foreground">زمن الطيران</div>
                        <div className="font-bold">{projectileStats.timeOfFlight.toFixed(2)} s</div>
                      </div>
                      <div className="p-2 rounded bg-purple-500/20">
                        <div className="text-xs text-muted-foreground">السرعة</div>
                        <div className="font-bold">{Math.sqrt(state.projectileVelocity.vx ** 2 + state.projectileVelocity.vy ** 2).toFixed(1)} m/s</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pendulum" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md border-blue-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">التحكم</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>طول الخيط</span>
                          <Badge variant="secondary">{state.pendulumLength.toFixed(2)} m</Badge>
                        </label>
                        <Slider value={[state.pendulumLength * 100]} onValueChange={([v]) => setPendulumLength(v / 100)} min={50} max={300} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>الزاوية الابتدائية</span>
                          <Badge variant="secondary">{state.pendulumAngle.toFixed(1)}°</Badge>
                        </label>
                        <Slider value={[state.pendulumAngle]} onValueChange={([v]) => setPendulumAngle(v)} min={5} max={60} disabled={state.pendulumIsRunning} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>التخميد</span>
                          <Badge variant="secondary">{(state.pendulumDamping * 100).toFixed(1)}%</Badge>
                        </label>
                        <Slider value={[state.pendulumDamping * 1000]} onValueChange={([v]) => setPendulumDamping(v / 1000)} min={0} max={100} className="mt-2" />
                      </div>
                      <div className="flex gap-2">
                        {!state.pendulumIsRunning ? (
                          <Button onClick={startPendulum} className="flex-1 bg-blue-600 hover:bg-blue-700"><Play size={16} className="mr-1" />تشغيل</Button>
                        ) : (
                          <Button onClick={stopPendulum} variant="destructive" className="flex-1"><Square size={16} className="mr-1" />إيقاف</Button>
                        )}
                        <Button variant="outline" onClick={resetPendulum} className="flex-1"><RotateCcw size={16} className="mr-1" />إعادة</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="freefall" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md border-red-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">التحكم</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm flex justify-between">
                          <span>الارتفاع</span>
                          <Badge variant="secondary">{state.freeFallHeight} m</Badge>
                        </label>
                        <Slider value={[state.freeFallHeight]} onValueChange={([v]) => setFreeFallHeight(v)} min={10} max={500} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">البيئة</label>
                        <Select value={state.environment} onValueChange={(v: any) => setEnvironment(v)}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="earth">🌍 الأرض</SelectItem>
                            <SelectItem value="moon">🌙 القمر</SelectItem>
                            <SelectItem value="mars">🔴 المريخ</SelectItem>
                            <SelectItem value="jupiter">🟤 المشتري</SelectItem>
                            <SelectItem value="vacuum">⚫ فراغ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        {!state.freeFallIsRunning ? (
                          <Button onClick={startFreeFall} className="flex-1 bg-red-600 hover:bg-red-700"><Play size={16} className="mr-1" />سقوط</Button>
                        ) : (
                          <Button onClick={stopFreeFall} variant="destructive" className="flex-1"><Square size={16} className="mr-1" />إيقاف</Button>
                        )}
                        <Button variant="outline" onClick={resetFreeFall} className="flex-1"><RotateCcw size={16} className="mr-1" />إعادة</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">📐 المعادلات</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2 font-mono">
                    <p className="text-cyan-400">المقذوفات: y = v₀t·sin(θ) - ½gt²</p>
                    <p className="text-green-400">البندول: T = 2π√(L/g)</p>
                    <p className="text-red-400">السقوط: v = gt, h = ½gt²</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectileMotionSimulation;
