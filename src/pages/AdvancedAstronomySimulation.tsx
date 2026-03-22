import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Moon, Sun, Globe, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdvancedAstronomySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'eclipse' | 'phases' | 'orbits'>('eclipse');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [eclipseType, setEclipseType] = useState<'solar' | 'lunar'>('solar');

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear canvas with space background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 100; i++) {
        const starX = (i * 73) % width;
        const starY = (i * 97) % height;
        const size = ((i * 13) % 3) + 1;
        const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + i);
        ctx.globalAlpha = twinkle * 0.8;
        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (simulationType === 'eclipse') {
        if (eclipseType === 'solar') {
          // Solar eclipse
          const sunX = centerX;
          const sunY = centerY;
          const sunRadius = 80;

          // Moon position (moving across the sun)
          const moonProgress = (Math.sin(time * 0.5) + 1) / 2;
          const moonX = centerX - 200 + moonProgress * 400;
          const moonY = centerY;
          const moonRadius = 75;

          // Draw sun with corona
          const coronaGradient = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, sunRadius * 2);
          coronaGradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
          coronaGradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.4)');
          coronaGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = coronaGradient;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius * 2, 0, 2 * Math.PI);
          ctx.fill();

          // Sun body
          const sunGradient = ctx.createRadialGradient(sunX - 20, sunY - 20, 0, sunX, sunY, sunRadius);
          sunGradient.addColorStop(0, '#fff5cc');
          sunGradient.addColorStop(0.5, '#ffd700');
          sunGradient.addColorStop(1, '#ff8c00');
          ctx.fillStyle = sunGradient;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Moon
          ctx.fillStyle = '#2a2a3a';
          ctx.beginPath();
          ctx.arc(moonX, moonY, moonRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Moon texture
          ctx.fillStyle = 'rgba(60, 60, 80, 0.5)';
          for (let i = 0; i < 8; i++) {
            const craterX = moonX + (Math.cos(i * 0.8) * moonRadius * 0.6);
            const craterY = moonY + (Math.sin(i * 1.2) * moonRadius * 0.5);
            ctx.beginPath();
            ctx.arc(craterX, craterY, 5 + (i % 3) * 3, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Diamond ring effect when moon is nearly covering sun
          const distance = Math.abs(moonX - sunX);
          if (distance < sunRadius + moonRadius && distance > Math.abs(sunRadius - moonRadius)) {
            const angle = Math.atan2(moonY - sunY, moonX - sunX) + Math.PI;
            const diamondX = sunX + sunRadius * Math.cos(angle);
            const diamondY = sunY + sunRadius * Math.sin(angle);
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(diamondX, diamondY, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Rays
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
              const rayAngle = (i / 8) * 2 * Math.PI;
              ctx.beginPath();
              ctx.moveTo(diamondX, diamondY);
              ctx.lineTo(diamondX + Math.cos(rayAngle) * 30, diamondY + Math.sin(rayAngle) * 30);
              ctx.stroke();
            }
          }

          // Labels
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('كسوف الشمس', centerX, 40);

          ctx.font = '14px Arial';
          ctx.fillText('الشمس', sunX, sunY + sunRadius + 30);
          ctx.fillText('القمر', moonX, moonY - moonRadius - 15);

        } else {
          // Lunar eclipse
          const earthX = centerX - 150;
          const earthY = centerY;
          const earthRadius = 60;

          const moonX = centerX + 150;
          const moonY = centerY;
          const moonRadius = 40;

          // Sun (off screen, just showing light direction)
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('← أشعة الشمس', 30, centerY);

          // Sun rays
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.lineWidth = 2;
          for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, centerY + i * 40);
            ctx.lineTo(earthX - earthRadius, centerY + i * 30);
            ctx.stroke();
          }

          // Earth's shadow (umbra and penumbra)
          const shadowLength = 400;
          const umbraWidth = 30;
          const penumbraWidth = 80;

          // Penumbra
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.moveTo(earthX + earthRadius, earthY - earthRadius);
          ctx.lineTo(earthX + shadowLength, earthY - penumbraWidth);
          ctx.lineTo(earthX + shadowLength, earthY + penumbraWidth);
          ctx.lineTo(earthX + earthRadius, earthY + earthRadius);
          ctx.fill();

          // Umbra
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.beginPath();
          ctx.moveTo(earthX + earthRadius, earthY - earthRadius * 0.5);
          ctx.lineTo(earthX + shadowLength * 0.8, earthY);
          ctx.lineTo(earthX + earthRadius, earthY + earthRadius * 0.5);
          ctx.fill();

          // Earth
          const earthGradient = ctx.createRadialGradient(earthX - 15, earthY - 15, 0, earthX, earthY, earthRadius);
          earthGradient.addColorStop(0, '#4ade80');
          earthGradient.addColorStop(0.5, '#22c55e');
          earthGradient.addColorStop(1, '#166534');
          ctx.fillStyle = earthGradient;
          ctx.beginPath();
          ctx.arc(earthX, earthY, earthRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Moon
          const moonPhase = (Math.sin(time * 0.3) + 1) / 2;
          const moonInShadow = moonX > earthX + earthRadius && moonX < earthX + shadowLength * 0.8;
          
          // Moon lit by red light during eclipse
          if (moonInShadow) {
            ctx.fillStyle = '#8b2500';
          } else {
            ctx.fillStyle = '#d4d4d8';
          }
          ctx.beginPath();
          ctx.arc(moonX, moonY, moonRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Labels
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('خسوف القمر', centerX, 40);

          ctx.font = '14px Arial';
          ctx.fillText('الأرض', earthX, earthY + earthRadius + 25);
          ctx.fillText('القمر', moonX, moonY - moonRadius - 15);
          ctx.fillText('ظل الأرض (الأمبرا)', earthX + 200, earthY + 100);
        }

      } else if (simulationType === 'phases') {
        // Moon phases
        const sunX = width - 100;
        const sunY = centerY;

        // Sun
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 50, 0, 2 * Math.PI);
        ctx.fill();

        // Earth
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fill();

        // Moon orbit
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current moon position
        const moonAngle = time * 0.3;
        const moonX = centerX + 150 * Math.cos(moonAngle);
        const moonY = centerY + 150 * Math.sin(moonAngle);

        // Draw moon with proper illumination
        const moonRadius = 25;
        
        // Dark side
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Lit side
        const sunAngle = Math.atan2(sunY - moonY, sunX - moonX);
        ctx.fillStyle = '#e5e5e5';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
        ctx.fill();

        // Draw all 8 moon phases at bottom
        const phases = [
          { name: 'محاق', angle: Math.PI },
          { name: 'هلال متزايد', angle: 3 * Math.PI / 4 },
          { name: 'تربيع أول', angle: Math.PI / 2 },
          { name: 'أحدب متزايد', angle: Math.PI / 4 },
          { name: 'بدر', angle: 0 },
          { name: 'أحدب متناقص', angle: -Math.PI / 4 },
          { name: 'تربيع ثاني', angle: -Math.PI / 2 },
          { name: 'هلال متناقص', angle: -3 * Math.PI / 4 },
        ];

        phases.forEach((phase, i) => {
          const phaseX = 80 + i * 95;
          const phaseY = height - 60;
          const phaseRadius = 20;

          // Dark circle
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(phaseX, phaseY, phaseRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Lit portion
          ctx.fillStyle = '#e5e5e5';
          ctx.beginPath();
          ctx.arc(phaseX, phaseY, phaseRadius, phase.angle - Math.PI / 2, phase.angle + Math.PI / 2);
          ctx.fill();

          // Label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(phase.name, phaseX, phaseY + 35);
        });

        // Title
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('أطوار القمر', centerX, 40);

      } else if (simulationType === 'orbits') {
        // Satellite orbits and Kepler's laws
        
        // Earth
        const earthGradient = ctx.createRadialGradient(centerX - 15, centerY - 15, 0, centerX, centerY, 50);
        earthGradient.addColorStop(0, '#60a5fa');
        earthGradient.addColorStop(0.5, '#2563eb');
        earthGradient.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = earthGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.fill();

        // Different orbits
        const orbits = [
          { a: 100, b: 100, color: '#22c55e', name: 'LEO', speed: 3 },
          { a: 150, b: 130, color: '#eab308', name: 'MEO', speed: 2 },
          { a: 220, b: 180, color: '#ef4444', name: 'GEO', speed: 1 },
        ];

        orbits.forEach(orbit => {
          // Draw orbit path
          ctx.strokeStyle = orbit.color + '40';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, orbit.a, orbit.b, 0, 0, 2 * Math.PI);
          ctx.stroke();

          // Satellite position (Kepler's 2nd law - equal areas in equal times)
          const satAngle = time * orbit.speed * 0.5;
          const satX = centerX + orbit.a * Math.cos(satAngle);
          const satY = centerY + orbit.b * Math.sin(satAngle);

          // Satellite
          ctx.fillStyle = orbit.color;
          ctx.beginPath();
          ctx.arc(satX, satY, 8, 0, 2 * Math.PI);
          ctx.fill();

          // Solar panels
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(satX - 20, satY - 3, 12, 6);
          ctx.fillRect(satX + 8, satY - 3, 12, 6);

          // Velocity vector
          const vAngle = satAngle + Math.PI / 2;
          const vMag = 30 / (1 + 0.3 * Math.cos(satAngle)); // Faster at periapsis
          ctx.strokeStyle = orbit.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(satX, satY);
          ctx.lineTo(satX + vMag * Math.cos(vAngle), satY + vMag * Math.sin(vAngle));
          ctx.stroke();

          // Arrow head
          const arrowX = satX + vMag * Math.cos(vAngle);
          const arrowY = satY + vMag * Math.sin(vAngle);
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - 8 * Math.cos(vAngle - 0.4), arrowY - 8 * Math.sin(vAngle - 0.4));
          ctx.lineTo(arrowX - 8 * Math.cos(vAngle + 0.4), arrowY - 8 * Math.sin(vAngle + 0.4));
          ctx.fill();
        });

        // Legend
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        orbits.forEach((orbit, i) => {
          ctx.fillStyle = orbit.color;
          ctx.fillRect(30, 50 + i * 25, 15, 15);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(orbit.name, 55, 62 + i * 25);
        });

        // Title
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('المدارات وقوانين كبلر', centerX, 30);

        // Kepler's laws
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('قانون كبلر الثاني: مساحات متساوية في أزمان متساوية', width - 30, height - 60);
        ctx.fillText('قانون كبلر الثالث: T² ∝ a³', width - 30, height - 40);
      }

      setTime(prev => prev + 0.016 * timeSpeed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, simulationType, timeSpeed, eclipseType, time]);

  const resetSimulation = () => {
    setTime(0);
    setTimeSpeed(1);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          مختبر الفلك المتقدم
        </h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-indigo-500/30 p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-lg"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-indigo-500 text-indigo-400"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-indigo-500/30 p-4">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              لوحة التحكم
            </h3>

            {/* Simulation Type */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="eclipse" className="text-xs">الكسوف</TabsTrigger>
                  <TabsTrigger value="phases" className="text-xs">أطوار القمر</TabsTrigger>
                  <TabsTrigger value="orbits" className="text-xs">المدارات</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'eclipse' && (
              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-2">نوع الكسوف/الخسوف</label>
                <Tabs value={eclipseType} onValueChange={(v) => setEclipseType(v as any)}>
                  <TabsList className="grid grid-cols-2 bg-slate-700">
                    <TabsTrigger value="solar" className="text-xs">كسوف شمسي</TabsTrigger>
                    <TabsTrigger value="lunar" className="text-xs">خسوف قمري</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Time Speed */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                سرعة الزمن: {timeSpeed.toFixed(1)}x
              </label>
              <Slider
                value={[timeSpeed]}
                onValueChange={(v) => setTimeSpeed(v[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-800/50 border-purple-500/30 p-4">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              المعلومات
            </h3>
            
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed">
                {simulationType === 'eclipse' && eclipseType === 'solar' && 
                  'كسوف الشمس يحدث عندما يمر القمر بين الأرض والشمس. يمكن أن يكون كلياً أو جزئياً أو حلقياً.'}
                {simulationType === 'eclipse' && eclipseType === 'lunar' && 
                  'خسوف القمر يحدث عندما تقع الأرض بين الشمس والقمر. يظهر القمر بلون أحمر بسبب انكسار الضوء.'}
                {simulationType === 'phases' && 
                  'أطوار القمر تنتج عن تغير موقعه بالنسبة للشمس والأرض. تستغرق الدورة الكاملة 29.5 يوماً.'}
                {simulationType === 'orbits' && 
                  'قوانين كبلر تصف حركة الأجرام السماوية. المدارات إهليلجية والسرعة تتغير حسب البعد عن المركز.'}
              </p>
            </div>
          </Card>

          {/* Quick Facts */}
          <Card className="bg-slate-800/50 border-yellow-500/30 p-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5" />
              حقائق سريعة
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">القمر يبعد 384,400 كم</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">الشمس تبعد 150 مليون كم</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">محيط الأرض 40,075 كم</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAstronomySimulation;
