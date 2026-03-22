import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Rocket, Flame, Target, Orbit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RocketScienceSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationType, setSimulationType] = useState<'launch' | 'staging' | 'orbit' | 'landing'>('launch');
  const [thrust, setThrust] = useState(50);
  const [fuelMass, setFuelMass] = useState(80);
  const [time, setTime] = useState(0);
  const [rocketState, setRocketState] = useState({
    altitude: 0,
    velocity: 0,
    fuel: 100,
    stage: 1,
    landed: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (let i = 0; i < 100; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 47) % canvas.height;
        const brightness = 0.3 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (simulationType === 'launch') {
        drawLaunchSimulation(ctx, canvas);
      } else if (simulationType === 'staging') {
        drawStagingSimulation(ctx, canvas);
      } else if (simulationType === 'orbit') {
        drawOrbitSimulation(ctx, canvas);
      } else if (simulationType === 'landing') {
        drawLandingSimulation(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.016);
        updateRocketState();
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawLaunchSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const groundY = canvas.height - 50;
      
      // Draw ground
      const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      gradient.addColorStop(0, '#2d5016');
      gradient.addColorStop(1, '#1a3009');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, groundY, canvas.width, 50);

      // Draw launch pad
      ctx.fillStyle = '#555';
      ctx.fillRect(canvas.width / 2 - 40, groundY - 10, 80, 15);
      ctx.fillStyle = '#777';
      ctx.fillRect(canvas.width / 2 - 30, groundY - 5, 60, 10);

      // Calculate rocket position
      const rocketX = canvas.width / 2;
      const rocketY = groundY - 60 - rocketState.altitude * 2;

      // Draw rocket
      drawRocket(ctx, rocketX, Math.max(rocketY, 80), rocketState.fuel > 0 && isPlaying);

      // Draw altitude indicator
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ارتفاع: ${rocketState.altitude.toFixed(0)} م`, 20, 30);
      ctx.fillText(`سرعة: ${rocketState.velocity.toFixed(1)} م/ث`, 20, 50);
      ctx.fillText(`وقود: ${rocketState.fuel.toFixed(0)}%`, 20, 70);

      // Draw thrust equation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px monospace';
      ctx.fillText('F = ṁ × ve', 20, canvas.height - 80);
      ctx.fillText('قوة الدفع = معدل استهلاك الوقود × سرعة العادم', 20, canvas.height - 60);
    };

    const drawStagingSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const rocketY = canvas.height / 2 - Math.sin(time) * 20;

      // Draw multi-stage rocket
      const stage = Math.floor(time / 3) % 3 + 1;
      
      // Stage 3 (payload)
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(centerX, rocketY - 80);
      ctx.lineTo(centerX - 15, rocketY - 50);
      ctx.lineTo(centerX + 15, rocketY - 50);
      ctx.closePath();
      ctx.fill();

      // Stage 2
      if (stage <= 2) {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(centerX - 20, rocketY - 50, 40, 50);
      }

      // Stage 1
      if (stage <= 1) {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(centerX - 25, rocketY, 50, 70);
        
        // Fins
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.moveTo(centerX - 25, rocketY + 70);
        ctx.lineTo(centerX - 40, rocketY + 90);
        ctx.lineTo(centerX - 25, rocketY + 50);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 25, rocketY + 70);
        ctx.lineTo(centerX + 40, rocketY + 90);
        ctx.lineTo(centerX + 25, rocketY + 50);
        ctx.closePath();
        ctx.fill();
      }

      // Draw flame
      if (isPlaying) {
        const flameY = stage === 1 ? rocketY + 70 : (stage === 2 ? rocketY : rocketY - 50);
        drawFlame(ctx, centerX, flameY, 20 + Math.random() * 10);
      }

      // Draw separated stages
      if (stage >= 2 && isPlaying) {
        const sepY = rocketY + 100 + (time % 3) * 50;
        ctx.fillStyle = 'rgba(46, 204, 113, 0.5)';
        ctx.fillRect(centerX - 25, sepY, 50, 70);
      }

      // Info
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`المرحلة الحالية: ${stage}`, centerX, 40);
      ctx.font = '12px monospace';
      ctx.fillText('فصل المراحل يقلل الكتلة ويزيد الكفاءة', centerX, 60);
    };

    const drawOrbitSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw Earth
      const earthGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
      earthGradient.addColorStop(0, '#4a90d9');
      earthGradient.addColorStop(0.5, '#2d6ab8');
      earthGradient.addColorStop(1, '#1a4a7a');
      ctx.fillStyle = earthGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Draw atmosphere
      ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Draw orbit paths
      const orbits = [130, 170, 220];
      orbits.forEach((radius, i) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw satellites
      orbits.forEach((radius, i) => {
        const angle = time * (0.5 - i * 0.1) + i * 2;
        const satX = centerX + Math.cos(angle) * radius;
        const satY = centerY + Math.sin(angle) * radius;

        // Satellite body
        ctx.fillStyle = '#ddd';
        ctx.fillRect(satX - 5, satY - 3, 10, 6);
        
        // Solar panels
        ctx.fillStyle = '#3498db';
        ctx.fillRect(satX - 15, satY - 2, 8, 4);
        ctx.fillRect(satX + 7, satY - 2, 8, 4);
      });

      // Orbital velocity formula
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('v = √(GM/r)', centerX, canvas.height - 60);
      ctx.font = '12px monospace';
      ctx.fillText('السرعة المدارية تتناسب عكسياً مع نصف قطر المدار', centerX, canvas.height - 40);
    };

    const drawLandingSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const groundY = canvas.height - 60;
      
      // Draw Mars surface
      const marsGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      marsGradient.addColorStop(0, '#c1440e');
      marsGradient.addColorStop(1, '#8b3008');
      ctx.fillStyle = marsGradient;
      ctx.fillRect(0, groundY, canvas.width, 60);

      // Draw craters
      for (let i = 0; i < 5; i++) {
        const craterX = 100 + i * 150;
        ctx.fillStyle = '#a03808';
        ctx.beginPath();
        ctx.ellipse(craterX, groundY + 10, 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Landing pad
      ctx.fillStyle = '#555';
      ctx.fillRect(canvas.width / 2 - 50, groundY - 5, 100, 10);
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 50, groundY - 5, 100, 10);

      // Calculate lander position
      const landingProgress = Math.min(time / 10, 1);
      const landerY = 100 + (groundY - 160) * landingProgress;
      const landerX = canvas.width / 2;

      // Draw lander
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(landerX, landerY - 30);
      ctx.lineTo(landerX - 20, landerY);
      ctx.lineTo(landerX + 20, landerY);
      ctx.closePath();
      ctx.fill();

      // Lander body
      ctx.fillStyle = '#bbb';
      ctx.fillRect(landerX - 15, landerY, 30, 20);

      // Landing legs
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(landerX - 15, landerY + 20);
      ctx.lineTo(landerX - 25, landerY + 40);
      ctx.moveTo(landerX + 15, landerY + 20);
      ctx.lineTo(landerX + 25, landerY + 40);
      ctx.stroke();

      // Retro rockets (if not landed)
      if (isPlaying && landingProgress < 1) {
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(landerX - 10, landerY + 20);
        ctx.lineTo(landerX, landerY + 50 + Math.random() * 20);
        ctx.lineTo(landerX + 10, landerY + 20);
        ctx.closePath();
        ctx.fill();
      }

      // Info
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ارتفاع: ${((1 - landingProgress) * 1000).toFixed(0)} م`, 20, 30);
      ctx.fillText(`سرعة هبوط: ${((1 - landingProgress) * 50).toFixed(1)} م/ث`, 20, 50);
      
      if (landingProgress >= 1) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 هبوط ناجح!', canvas.width / 2, 80);
      }
    };

    const drawRocket = (ctx: CanvasRenderingContext2D, x: number, y: number, showFlame: boolean) => {
      // Rocket body
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.lineTo(x - 15, y);
      ctx.lineTo(x - 15, y + 40);
      ctx.lineTo(x + 15, y + 40);
      ctx.lineTo(x + 15, y);
      ctx.closePath();
      ctx.fill();

      // Nose cone
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.lineTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.closePath();
      ctx.fill();

      // Window
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Fins
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(x - 15, y + 40);
      ctx.lineTo(x - 25, y + 55);
      ctx.lineTo(x - 15, y + 30);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + 15, y + 40);
      ctx.lineTo(x + 25, y + 55);
      ctx.lineTo(x + 15, y + 30);
      ctx.closePath();
      ctx.fill();

      // Flame
      if (showFlame) {
        drawFlame(ctx, x, y + 40, 15 + Math.random() * 10);
      }
    };

    const drawFlame = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const gradient = ctx.createLinearGradient(x, y, x, y + size * 2);
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.2, '#ffff00');
      gradient.addColorStop(0.5, '#ff8800');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y);
      ctx.quadraticCurveTo(x - size / 3, y + size, x, y + size * 2);
      ctx.quadraticCurveTo(x + size / 3, y + size, x + size / 2, y);
      ctx.closePath();
      ctx.fill();
    };

    const updateRocketState = () => {
      if (simulationType === 'launch' && rocketState.fuel > 0) {
        const thrustForce = thrust * 0.5;
        const gravity = 9.8;
        const acceleration = thrustForce - gravity;
        
        setRocketState(prev => ({
          ...prev,
          velocity: Math.max(0, prev.velocity + acceleration * 0.016),
          altitude: prev.altitude + prev.velocity * 0.016,
          fuel: Math.max(0, prev.fuel - thrust * 0.01)
        }));
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, thrust, time, rocketState]);

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(false);
    setRocketState({
      altitude: 0,
      velocity: 0,
      fuel: 100,
      stage: 1,
      landed: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'رجوع'}
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-orange-500" />
            علوم الصواريخ والفضاء
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-4 border">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-3">نوع المحاكاة</h3>
              <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); resetSimulation(); }}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="launch" className="text-xs">
                    <Flame className="h-3 w-3 ml-1" />
                    إطلاق
                  </TabsTrigger>
                  <TabsTrigger value="staging" className="text-xs">
                    <Rocket className="h-3 w-3 ml-1" />
                    مراحل
                  </TabsTrigger>
                  <TabsTrigger value="orbit" className="text-xs">
                    <Orbit className="h-3 w-3 ml-1" />
                    مدار
                  </TabsTrigger>
                  <TabsTrigger value="landing" className="text-xs">
                    <Target className="h-3 w-3 ml-1" />
                    هبوط
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'launch' && (
              <div className="bg-card rounded-xl p-4 border space-y-4">
                <div>
                  <label className="text-sm font-medium">قوة الدفع: {thrust}%</label>
                  <Slider
                    value={[thrust]}
                    onValueChange={([v]) => setThrust(v)}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">كتلة الوقود: {fuelMass}%</label>
                  <Slider
                    value={[fuelMass]}
                    onValueChange={([v]) => setFuelMass(v)}
                    min={20}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} className="flex-1">
                {isPlaying ? <Pause className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
                {isPlaying ? 'إيقاف' : 'تشغيل'}
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-2">المفاهيم الفيزيائية</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                {simulationType === 'launch' && (
                  <>
                    <p>• <strong>معادلة تسيولكوفسكي:</strong> Δv = ve × ln(m0/mf)</p>
                    <p>• <strong>قوة الدفع:</strong> F = ṁ × ve</p>
                    <p>• كلما زادت سرعة العادم زادت كفاءة الصاروخ</p>
                  </>
                )}
                {simulationType === 'staging' && (
                  <>
                    <p>• فصل المراحل يقلل الكتلة الإجمالية</p>
                    <p>• كل مرحلة لها محرك ووقود خاص</p>
                    <p>• يزيد نسبة الكتلة ويحسن الأداء</p>
                  </>
                )}
                {simulationType === 'orbit' && (
                  <>
                    <p>• <strong>السرعة المدارية:</strong> v = √(GM/r)</p>
                    <p>• المدارات الأعلى أبطأ</p>
                    <p>• التوازن بين الجاذبية والقوة الطردية</p>
                  </>
                )}
                {simulationType === 'landing' && (
                  <>
                    <p>• الكبح الجوي يقلل السرعة</p>
                    <p>• صواريخ الهبوط للتباطؤ النهائي</p>
                    <p>• دقة الهبوط تتطلب تحكم دقيق</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RocketScienceSimulation;
