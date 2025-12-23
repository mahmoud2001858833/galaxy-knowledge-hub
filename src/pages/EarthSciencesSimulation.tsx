import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Globe, Mountain, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EarthSciencesSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'earthquake' | 'volcano' | 'plates' | 'rocks'>('earthquake');
  const [magnitude, setMagnitude] = useState(6);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (simulationType === 'earthquake') drawEarthquake(ctx, canvas);
      else if (simulationType === 'volcano') drawVolcano(ctx, canvas);
      else if (simulationType === 'plates') drawPlates(ctx, canvas);
      else if (simulationType === 'rocks') drawRockCycle(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.03);
      animationId = requestAnimationFrame(animate);
    };

    const drawEarthquake = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const groundY = canvas.height - 150;
      const shakeIntensity = magnitude * Math.sin(time * 10) * 0.5;

      // Underground layers
      const layers = [
        { color: '#8B4513', height: 50, name: 'تربة' },
        { color: '#A0522D', height: 40, name: 'رسوبيات' },
        { color: '#6B4423', height: 60, name: 'صخور' },
        { color: '#4a3520', height: 80, name: 'قشرة' }
      ];

      let currentY = groundY;
      layers.forEach(layer => {
        ctx.fillStyle = layer.color;
        ctx.fillRect(0, currentY + shakeIntensity, canvas.width, layer.height);
        currentY += layer.height;
      });

      // Fault line
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX + shakeIntensity * 2, groundY);
      ctx.lineTo(centerX - 30 + shakeIntensity * 2, groundY + 100);
      ctx.lineTo(centerX - 60 + shakeIntensity * 2, groundY + 230);
      ctx.stroke();

      // Epicenter
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(centerX - 40, groundY + 150, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('البؤرة', centerX - 40, groundY + 155);

      // Seismic waves
      for (let i = 0; i < 5; i++) {
        const waveRadius = ((time * 50 + i * 40) % 300);
        ctx.strokeStyle = `rgba(231, 76, 60, ${1 - waveRadius / 300})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX - 40, groundY + 150, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Surface with buildings
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(0, groundY - 20 + shakeIntensity, canvas.width, 25);

      // Buildings
      const buildings = [
        { x: 150, w: 60, h: 100 },
        { x: 300, w: 80, h: 150 },
        { x: 500, w: 50, h: 80 },
        { x: 650, w: 70, h: 120 }
      ];

      buildings.forEach(b => {
        const tilt = shakeIntensity * 0.02;
        ctx.save();
        ctx.translate(b.x + b.w / 2, groundY - 20);
        ctx.rotate(tilt);
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(-b.w / 2, -b.h + shakeIntensity, b.w, b.h);
        // Windows
        ctx.fillStyle = '#f1c40f';
        for (let row = 0; row < b.h / 25; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillRect(-b.w / 2 + 10 + col * 18, -b.h + 15 + row * 25 + shakeIntensity, 12, 15);
          }
        }
        ctx.restore();
      });

      // Seismograph
      const graphX = 50;
      const graphY = 80;
      ctx.fillStyle = '#222';
      ctx.fillRect(graphX, graphY, 200, 80);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const y = graphY + 40 + Math.sin((time * 20 + i) * 0.2) * magnitude * 3;
        if (i === 0) ctx.moveTo(graphX + i, y);
        else ctx.lineTo(graphX + i, y);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('محاكاة الزلزال', canvas.width / 2, 30);
      ctx.font = '14px Arial';
      ctx.fillText(`الشدة: ${magnitude} ريختر`, canvas.width / 2, 55);
    };

    const drawVolcano = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const baseY = canvas.height - 50;

      // Volcano mountain
      ctx.fillStyle = '#4a3520';
      ctx.beginPath();
      ctx.moveTo(centerX - 250, baseY);
      ctx.lineTo(centerX - 50, 150);
      ctx.lineTo(centerX + 50, 150);
      ctx.lineTo(centerX + 250, baseY);
      ctx.closePath();
      ctx.fill();

      // Crater
      ctx.fillStyle = '#2c1810';
      ctx.beginPath();
      ctx.ellipse(centerX, 160, 50, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Magma chamber
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.ellipse(centerX, baseY - 50, 100, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Magma conduit
      ctx.fillStyle = '#ff6347';
      ctx.fillRect(centerX - 25, 180, 50, baseY - 230);

      // Lava glow
      const glowIntensity = 0.5 + Math.sin(time * 3) * 0.3;
      ctx.fillStyle = `rgba(255, 69, 0, ${glowIntensity})`;
      ctx.beginPath();
      ctx.ellipse(centerX, 160, 40, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eruption particles
      if (isPlaying) {
        for (let i = 0; i < 30; i++) {
          const angle = (Math.random() - 0.5) * 1;
          const speed = 2 + Math.random() * 3;
          const age = (time * speed + i * 0.3) % 3;
          const x = centerX + Math.sin(angle + i) * age * 50;
          const y = 150 - age * 80 + age * age * 15;

          if (y < 150) {
            ctx.fillStyle = Math.random() > 0.5 ? '#ff4500' : '#ff6347';
            ctx.beginPath();
            ctx.arc(x, y, 5 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Lava flow
        ctx.fillStyle = '#ff4500';
        for (let side = -1; side <= 1; side += 2) {
          ctx.beginPath();
          ctx.moveTo(centerX + side * 30, 160);
          const flowLength = ((time * 20) % 200);
          for (let i = 0; i < flowLength; i += 10) {
            const x = centerX + side * (30 + i * 0.8);
            const y = 160 + i * 1.5 + Math.sin(i * 0.1 + time) * 10;
            ctx.lineTo(x, y);
          }
          ctx.lineWidth = 15;
          ctx.strokeStyle = '#ff4500';
          ctx.stroke();
        }

        // Ash cloud
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
        for (let i = 0; i < 10; i++) {
          const cloudX = centerX + Math.sin(time + i) * (50 + i * 10);
          const cloudY = 80 - i * 10;
          const cloudR = 30 + i * 5;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('سحابة رماد', centerX + 80, 60);
      ctx.fillText('فوهة', centerX + 60, 160);
      ctx.fillText('قناة الصهارة', centerX + 40, 280);
      ctx.fillText('غرفة الصهارة', centerX + 110, baseY - 40);

      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('محاكاة البركان', canvas.width / 2, 30);
    };

    const drawPlates = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;

      // Mantle
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(0, centerY + 50, canvas.width, 200);

      // Convection currents
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const offset = (time * 20 + i * 100) % 250;
        ctx.beginPath();
        ctx.moveTo(100 + i * 250, centerY + 200);
        ctx.quadraticCurveTo(100 + i * 250 + 60, centerY + 100, 100 + i * 250 + 125, centerY + 60);
        ctx.quadraticCurveTo(100 + i * 250 + 190, centerY + 100, 100 + i * 250 + 250, centerY + 200);
        ctx.stroke();

        // Arrows
        const arrowX = 100 + i * 250 + 125;
        const arrowY = centerY + 80;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10, arrowY + 20);
        ctx.lineTo(arrowX + 10, arrowY + 20);
        ctx.closePath();
        ctx.fill();
      }

      // Plates
      const plateMovement = Math.sin(time) * 5;

      // Left plate
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width / 2 - 20 + plateMovement, centerY);
      ctx.lineTo(canvas.width / 2 - 50 + plateMovement, centerY + 50);
      ctx.lineTo(0, centerY + 50);
      ctx.closePath();
      ctx.fill();

      // Right plate
      ctx.fillStyle = '#A0522D';
      ctx.beginPath();
      ctx.moveTo(canvas.width, centerY);
      ctx.lineTo(canvas.width / 2 + 20 - plateMovement, centerY);
      ctx.lineTo(canvas.width / 2 + 50 - plateMovement, centerY + 50);
      ctx.lineTo(canvas.width, centerY + 50);
      ctx.closePath();
      ctx.fill();

      // Surface features
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(0, centerY - 30, canvas.width / 2 - 30 + plateMovement, 30);
      ctx.fillRect(canvas.width / 2 + 30 - plateMovement, centerY - 30, canvas.width / 2, 30);

      // Mountains at collision zone
      ctx.fillStyle = '#4a3520';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 60, centerY - 30);
      ctx.lineTo(canvas.width / 2, centerY - 100);
      ctx.lineTo(canvas.width / 2 + 60, centerY - 30);
      ctx.closePath();
      ctx.fill();

      // Rift zone magma
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 10, centerY + 40);
      ctx.lineTo(canvas.width / 2, centerY + 10);
      ctx.lineTo(canvas.width / 2 + 10, centerY + 40);
      ctx.closePath();
      ctx.fill();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('صفيحة قارية', 150, centerY + 30);
      ctx.fillText('صفيحة قارية', canvas.width - 150, centerY + 30);
      ctx.fillText('الوشاح', canvas.width / 2, centerY + 150);
      ctx.fillText('تيارات الحمل', canvas.width / 2, centerY + 180);
      ctx.fillText('جبال', canvas.width / 2, centerY - 110);

      ctx.font = '16px Arial';
      ctx.fillText('حركة الصفائح التكتونية', canvas.width / 2, 30);
    };

    const drawRockCycle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const rocks = [
        { x: canvas.width / 2, y: 100, name: 'صخور نارية', color: '#c0392b', type: 'igneous' },
        { x: 150, y: 280, name: 'صخور رسوبية', color: '#f39c12', type: 'sedimentary' },
        { x: canvas.width - 150, y: 280, name: 'صخور متحولة', color: '#9b59b6', type: 'metamorphic' },
        { x: canvas.width / 2, y: 420, name: 'صهارة', color: '#e74c3c', type: 'magma' }
      ];

      // Draw rocks
      rocks.forEach(rock => {
        ctx.fillStyle = rock.color;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(rock.name, rock.x, rock.y + 5);
      });

      // Draw arrows with labels
      const arrows = [
        { from: rocks[0], to: rocks[1], label: 'تجوية وتعرية', curve: -50 },
        { from: rocks[1], to: rocks[2], label: 'حرارة وضغط', curve: 50 },
        { from: rocks[2], to: rocks[3], label: 'انصهار', curve: 50 },
        { from: rocks[3], to: rocks[0], label: 'تبريد', curve: -50 },
        { from: rocks[0], to: rocks[2], label: 'حرارة وضغط', curve: 0 },
        { from: rocks[1], to: rocks[3], label: 'انصهار', curve: 0 }
      ];

      arrows.forEach((arrow, i) => {
        const progress = ((time * 0.5 + i * 0.3) % 1);
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const midX = (arrow.from.x + arrow.to.x) / 2 + arrow.curve;
        const midY = (arrow.from.y + arrow.to.y) / 2;
        
        ctx.moveTo(arrow.from.x, arrow.from.y + 50);
        ctx.quadraticCurveTo(midX, midY, arrow.to.x, arrow.to.y - 50);
        ctx.stroke();

        // Animated dot
        const t = progress;
        const dotX = (1 - t) * (1 - t) * arrow.from.x + 2 * (1 - t) * t * midX + t * t * arrow.to.x;
        const dotY = (1 - t) * (1 - t) * (arrow.from.y + 50) + 2 * (1 - t) * t * midY + t * t * (arrow.to.y - 50);
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '11px Arial';
        ctx.fillText(arrow.label, midX, midY);
      });

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('دورة الصخور', canvas.width / 2, 30);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, magnitude, time]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            علوم الأرض
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-4 border">
              <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-3">الظاهرة</h3>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="earthquake" className="text-xs">
                    <Mountain className="h-3 w-3 ml-1" />
                    زلزال
                  </TabsTrigger>
                  <TabsTrigger value="volcano" className="text-xs">
                    <Flame className="h-3 w-3 ml-1" />
                    بركان
                  </TabsTrigger>
                  <TabsTrigger value="plates" className="text-xs">صفائح</TabsTrigger>
                  <TabsTrigger value="rocks" className="text-xs">صخور</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'earthquake' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">شدة الزلزال: {magnitude} ريختر</label>
                <Slider value={[magnitude]} onValueChange={([v]) => setMagnitude(v)} min={1} max={9} step={0.5} className="mt-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} className="flex-1">
                {isPlaying ? <Pause className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
                {isPlaying ? 'إيقاف' : 'تشغيل'}
              </Button>
              <Button variant="outline" onClick={() => setTime(0)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-2">المفاهيم</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {simulationType === 'earthquake' && <p>• الزلازل تنتج من حركة الصفائح</p>}
                {simulationType === 'volcano' && <p>• البراكين تنفث الصهارة من باطن الأرض</p>}
                {simulationType === 'plates' && <p>• الصفائح تتحرك بفعل تيارات الحمل</p>}
                {simulationType === 'rocks' && <p>• الصخور تتحول في دورة مستمرة</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthSciencesSimulation;
