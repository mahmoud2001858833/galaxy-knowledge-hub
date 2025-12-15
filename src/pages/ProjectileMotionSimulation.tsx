import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Play, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectilePhysics } from '@/hooks/useProjectilePhysics';
import StarField from '@/components/StarField';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Trajectory
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.trajectory.forEach((point, i) => {
      const x = 50 + point.x * scale;
      const y = canvas.height - 20 - point.y * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Cannon
    ctx.save();
    ctx.translate(50, canvas.height - 20 - state.height * scale);
    ctx.rotate(-state.angle * Math.PI / 180);
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, -8, 40, 16);
    ctx.restore();

    // Projectile
    if (state.isLaunched || state.trajectory.length > 0) {
      const pos = state.projectilePosition;
      const x = 50 + pos.x * scale;
      const y = canvas.height - 20 - pos.y * scale;
      
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Stats overlay
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`المدى: ${projectileStats.range.toFixed(1)} m`, 10, 20);
    ctx.fillText(`أقصى ارتفاع: ${projectileStats.maxHeight.toFixed(1)} m`, 10, 35);
    ctx.fillText(`زمن الطيران: ${projectileStats.timeOfFlight.toFixed(2)} s`, 10, 50);
  }, [activeTab, state, projectileStats]);

  // Draw pendulum
  useEffect(() => {
    if (activeTab !== 'pendulum') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const pivotY = 50;
    const lengthScale = 100;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pivot
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(centerX, pivotY, 10, 0, Math.PI * 2);
    ctx.fill();

    // String
    const angleRad = state.pendulumAngle * Math.PI / 180;
    const bobX = centerX + Math.sin(angleRad) * state.pendulumLength * lengthScale;
    const bobY = pivotY + Math.cos(angleRad) * state.pendulumLength * lengthScale;

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Info
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`الدور: ${pendulumStats.period.toFixed(3)} s`, 10, 20);
    ctx.fillText(`الطاقة الكلية: ${pendulumStats.total.toFixed(4)} J`, 10, 35);
  }, [activeTab, state.pendulumAngle, state.pendulumLength, pendulumStats]);

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
            <Button variant="ghost" onClick={() => navigate('/scientific-simulations')} className="gap-2">
              <ArrowLeft size={20} />
              العودة
            </Button>
            <div className="flex items-center gap-3">
              <Target className="text-red-400" size={28} />
              <h1 className="text-xl font-bold">فيزياء المقذوفات والحركة</h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="projectile">المقذوفات</TabsTrigger>
              <TabsTrigger value="pendulum">البندول</TabsTrigger>
              <TabsTrigger value="freefall">السقوط الحر</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="bg-card/80 backdrop-blur-md">
                  <CardContent className="p-4">
                    <canvas ref={canvasRef} width={700} height={350} className="w-full rounded-lg border border-border" />
                  </CardContent>
                </Card>

                {/* Graph */}
                <Card className="bg-card/80 backdrop-blur-md mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">الرسم البياني</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={state.trajectory.slice(-100)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="x" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="y" stroke="#3b82f6" name="الارتفاع (m)" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <TabsContent value="projectile" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">التحكم</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm">زاوية الإطلاق: {state.angle}°</label>
                        <Slider value={[state.angle]} onValueChange={([v]) => setAngle(v)} min={0} max={90} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">السرعة الابتدائية: {state.initialVelocity} m/s</label>
                        <Slider value={[state.initialVelocity]} onValueChange={([v]) => setInitialVelocity(v)} min={10} max={100} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">الارتفاع الابتدائي: {state.height} m</label>
                        <Slider value={[state.height]} onValueChange={([v]) => setHeight(v)} min={0} max={50} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">مقاومة الهواء: {state.airResistance.toFixed(2)}</label>
                        <Slider value={[state.airResistance * 100]} onValueChange={([v]) => setAirResistance(v / 100)} min={0} max={50} className="mt-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={launchProjectile} disabled={state.isLaunched} className="flex-1">
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
                </TabsContent>

                <TabsContent value="pendulum" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">التحكم</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm">طول الخيط: {state.pendulumLength.toFixed(2)} m</label>
                        <Slider value={[state.pendulumLength * 100]} onValueChange={([v]) => setPendulumLength(v / 100)} min={50} max={300} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">الزاوية الابتدائية: {state.pendulumAngle.toFixed(1)}°</label>
                        <Slider value={[state.pendulumAngle]} onValueChange={([v]) => setPendulumAngle(v)} min={5} max={60} disabled={state.pendulumIsRunning} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">التخميد: {state.pendulumDamping.toFixed(3)}</label>
                        <Slider value={[state.pendulumDamping * 1000]} onValueChange={([v]) => setPendulumDamping(v / 1000)} min={0} max={100} className="mt-2" />
                      </div>
                      <div className="flex gap-2">
                        {!state.pendulumIsRunning ? (
                          <Button onClick={startPendulum} className="flex-1"><Play size={16} className="mr-1" />تشغيل</Button>
                        ) : (
                          <Button onClick={stopPendulum} variant="destructive" className="flex-1"><Square size={16} className="mr-1" />إيقاف</Button>
                        )}
                        <Button variant="outline" onClick={resetPendulum} className="flex-1"><RotateCcw size={16} className="mr-1" />إعادة</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="freefall" className="mt-0 space-y-4">
                  <Card className="bg-card/80 backdrop-blur-md">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">التحكم</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm">الارتفاع: {state.freeFallHeight} m</label>
                        <Slider value={[state.freeFallHeight]} onValueChange={([v]) => setFreeFallHeight(v)} min={10} max={500} className="mt-2" />
                      </div>
                      <div>
                        <label className="text-sm">البيئة</label>
                        <Select value={state.environment} onValueChange={(v: any) => setEnvironment(v)}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="earth">الأرض</SelectItem>
                            <SelectItem value="moon">القمر</SelectItem>
                            <SelectItem value="mars">المريخ</SelectItem>
                            <SelectItem value="jupiter">المشتري</SelectItem>
                            <SelectItem value="vacuum">فراغ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg text-sm">
                        <p>الجاذبية: {state.gravity.toFixed(2)} m/s²</p>
                        <p>السرعة النهائية: {freeFallStats.terminalVelocity === Infinity ? '∞' : freeFallStats.terminalVelocity.toFixed(1)} m/s</p>
                        <p>السرعة الحالية: {freeFallStats.currentVelocity.toFixed(2)} m/s</p>
                      </div>
                      <div className="flex gap-2">
                        {!state.freeFallIsRunning ? (
                          <Button onClick={startFreeFall} className="flex-1"><Play size={16} className="mr-1" />سقوط</Button>
                        ) : (
                          <Button onClick={stopFreeFall} variant="destructive" className="flex-1"><Square size={16} className="mr-1" />إيقاف</Button>
                        )}
                        <Button variant="outline" onClick={resetFreeFall} className="flex-1"><RotateCcw size={16} className="mr-1" />إعادة</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <Card className="bg-card/80 backdrop-blur-md">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">المعادلات</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>المقذوفات:</strong> y = v₀t·sin(θ) - ½gt²</p>
                    <p><strong>البندول:</strong> T = 2π√(L/g)</p>
                    <p><strong>السقوط:</strong> v = gt, h = ½gt²</p>
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
