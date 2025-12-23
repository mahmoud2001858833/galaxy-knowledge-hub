import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Wind, Brain, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HumanBodySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'circulatory' | 'respiratory' | 'nervous' | 'digestive'>('circulatory');
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

      if (simulationType === 'circulatory') drawCirculatory(ctx, canvas);
      else if (simulationType === 'respiratory') drawRespiratory(ctx, canvas);
      else if (simulationType === 'nervous') drawNervous(ctx, canvas);
      else if (simulationType === 'digestive') drawDigestive(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.03);
      animationId = requestAnimationFrame(animate);
    };

    const drawCirculatory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Heart
      const heartBeat = 1 + Math.sin(time * 5) * 0.1;
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 40 * heartBeat);
      ctx.bezierCurveTo(centerX - 50 * heartBeat, centerY - 20 * heartBeat, centerX - 50 * heartBeat, centerY - 60 * heartBeat, centerX, centerY - 30 * heartBeat);
      ctx.bezierCurveTo(centerX + 50 * heartBeat, centerY - 60 * heartBeat, centerX + 50 * heartBeat, centerY - 20 * heartBeat, centerX, centerY + 40 * heartBeat);
      ctx.fill();

      // Arteries (red) - to body
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 30);
      ctx.quadraticCurveTo(centerX, centerY - 100, centerX - 100, centerY - 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 30);
      ctx.quadraticCurveTo(centerX, centerY - 100, centerX + 100, centerY - 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 40);
      ctx.quadraticCurveTo(centerX - 80, centerY + 100, centerX - 120, centerY + 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 40);
      ctx.quadraticCurveTo(centerX + 80, centerY + 100, centerX + 120, centerY + 150);
      ctx.stroke();

      // Veins (blue) - from body
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(centerX - 150, centerY - 120);
      ctx.quadraticCurveTo(centerX - 80, centerY - 80, centerX - 30, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 150, centerY - 120);
      ctx.quadraticCurveTo(centerX + 80, centerY - 80, centerX + 30, centerY);
      ctx.stroke();

      // Blood cells animation
      const drawBloodCell = (pathFn: (t: number) => {x: number, y: number}, offset: number, isOxygenated: boolean) => {
        const t = ((time * 0.5 + offset) % 1);
        const pos = pathFn(t);
        ctx.fillStyle = isOxygenated ? '#e74c3c' : '#8e44ad';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      // Blood cells in arteries
      for (let i = 0; i < 5; i++) {
        drawBloodCell((t) => ({
          x: centerX + (t - 0.5) * 200,
          y: centerY - 30 - t * 120
        }), i * 0.2, true);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('القلب', centerX, centerY + 70);
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('شريان (دم مؤكسج)', centerX - 100, centerY - 160);
      ctx.fillStyle = '#3498db';
      ctx.fillText('وريد (دم غير مؤكسج)', centerX + 100, centerY - 130);

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('الجهاز الدوري', canvas.width / 2, 40);
    };

    const drawRespiratory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const breathPhase = Math.sin(time * 2);
      const lungExpansion = 1 + breathPhase * 0.15;

      // Trachea
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(centerX - 15, 80, 30, 100);

      // Bronchi
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(centerX, 180);
      ctx.quadraticCurveTo(centerX - 50, 200, centerX - 100, 250);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, 180);
      ctx.quadraticCurveTo(centerX + 50, 200, centerX + 100, 250);
      ctx.stroke();

      // Left lung
      ctx.fillStyle = '#e8b4b8';
      ctx.beginPath();
      ctx.ellipse(centerX - 120, 320, 90 * lungExpansion, 130 * lungExpansion, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right lung
      ctx.beginPath();
      ctx.ellipse(centerX + 120, 320, 90 * lungExpansion, 130 * lungExpansion, 0, 0, Math.PI * 2);
      ctx.fill();

      // Alveoli detail
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lx = centerX - 120 + Math.cos(angle) * 50 * lungExpansion;
        const ly = 320 + Math.sin(angle) * 70 * lungExpansion;
        ctx.fillStyle = '#d4a5a5';
        ctx.beginPath();
        ctx.arc(lx, ly, 15, 0, Math.PI * 2);
        ctx.fill();

        const rx = centerX + 120 + Math.cos(angle) * 50 * lungExpansion;
        const ry = 320 + Math.sin(angle) * 70 * lungExpansion;
        ctx.beginPath();
        ctx.arc(rx, ry, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // O2 molecules (inhale)
      if (breathPhase > 0) {
        for (let i = 0; i < 5; i++) {
          const y = 60 + breathPhase * 100 + i * 20;
          ctx.fillStyle = '#3498db';
          ctx.beginPath();
          ctx.arc(centerX - 5 + Math.sin(time + i) * 5, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '8px Arial';
          ctx.fillText('O₂', centerX - 5, y + 3);
        }
      }

      // CO2 molecules (exhale)
      if (breathPhase < 0) {
        for (let i = 0; i < 5; i++) {
          const y = 180 - breathPhase * 100 - i * 20;
          ctx.fillStyle = '#95a5a6';
          ctx.beginPath();
          ctx.arc(centerX + 5 + Math.sin(time + i) * 5, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '8px Arial';
          ctx.fillText('CO₂', centerX + 5, y + 3);
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('القصبة الهوائية', centerX, 70);
      ctx.fillText('الرئة اليسرى', centerX - 120, 470);
      ctx.fillText('الرئة اليمنى', centerX + 120, 470);
      ctx.font = '16px Arial';
      ctx.fillText('الجهاز التنفسي', canvas.width / 2, 30);
      ctx.font = '12px Arial';
      ctx.fillText(breathPhase > 0 ? 'شهيق' : 'زفير', canvas.width / 2, 50);
    };

    const drawNervous = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;

      // Brain
      ctx.fillStyle = '#e8c4c4';
      ctx.beginPath();
      ctx.ellipse(centerX, 120, 100, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brain details
      ctx.strokeStyle = '#d4a5a5';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(centerX - 40 + i * 20, 100 + Math.sin(i) * 20, 25, 0, Math.PI);
        ctx.stroke();
      }

      // Spinal cord
      ctx.fillStyle = '#f0e6d3';
      ctx.fillRect(centerX - 10, 180, 20, 250);

      // Nerves branching out
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      const nervePoints = [
        { y: 220, length: 80 },
        { y: 280, length: 100 },
        { y: 340, length: 120 },
        { y: 400, length: 100 }
      ];

      nervePoints.forEach((nerve, i) => {
        ctx.beginPath();
        ctx.moveTo(centerX - 10, nerve.y);
        ctx.lineTo(centerX - 10 - nerve.length, nerve.y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 10, nerve.y);
        ctx.lineTo(centerX + 10 + nerve.length, nerve.y + 30);
        ctx.stroke();
      });

      // Neural signals
      if (isPlaying) {
        const signalY = 180 + ((time * 100) % 250);
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(centerX, signalY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Signals in nerves
        nervePoints.forEach((nerve, i) => {
          const progress = ((time * 2 + i * 0.5) % 1);
          const sx = centerX - 10 - nerve.length * progress;
          const sy = nerve.y + 30 * progress;
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الدماغ', centerX, 50);
      ctx.fillText('الحبل الشوكي', centerX, 450);
      ctx.fillText('الأعصاب الطرفية', centerX - 100, 350);
      ctx.font = '16px Arial';
      ctx.fillText('الجهاز العصبي', canvas.width / 2, 25);
    };

    const drawDigestive = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;

      // Mouth
      ctx.fillStyle = '#e8b4b8';
      ctx.beginPath();
      ctx.ellipse(centerX, 60, 40, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Esophagus
      ctx.fillStyle = '#d4a5a5';
      ctx.fillRect(centerX - 12, 80, 24, 80);

      // Stomach
      ctx.fillStyle = '#e8c4c4';
      ctx.beginPath();
      ctx.ellipse(centerX - 30, 200, 70, 50, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Small intestine
      ctx.strokeStyle = '#d4a5a5';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(centerX - 30, 250);
      for (let i = 0; i < 6; i++) {
        const x = centerX - 80 + (i % 2) * 100;
        const y = 290 + i * 25;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Large intestine
      ctx.strokeStyle = '#c0a5a5';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(centerX + 80, 420);
      ctx.lineTo(centerX + 100, 320);
      ctx.lineTo(centerX + 100, 280);
      ctx.quadraticCurveTo(centerX + 100, 260, centerX, 260);
      ctx.quadraticCurveTo(centerX - 100, 260, centerX - 100, 280);
      ctx.lineTo(centerX - 100, 420);
      ctx.stroke();

      // Food particles moving
      if (isPlaying) {
        const foodPositions = [
          { x: centerX, y: 60 + (time * 20) % 100 },
          { x: centerX - 20 + Math.sin(time) * 10, y: 200 + Math.sin(time * 2) * 20 }
        ];

        foodPositions.forEach(pos => {
          ctx.fillStyle = '#8b4513';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('الفم', centerX + 50, 65);
      ctx.fillText('المريء', centerX + 20, 120);
      ctx.fillText('المعدة', centerX + 50, 200);
      ctx.fillText('الأمعاء الدقيقة', centerX + 30, 330);
      ctx.fillText('الأمعاء الغليظة', centerX - 160, 340);
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الجهاز الهضمي', canvas.width / 2, 25);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, time]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            أجهزة جسم الإنسان
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
              <h3 className="font-semibold mb-3">الجهاز</h3>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="circulatory" className="text-xs">
                    <Heart className="h-3 w-3 ml-1" />
                    الدوري
                  </TabsTrigger>
                  <TabsTrigger value="respiratory" className="text-xs">
                    <Wind className="h-3 w-3 ml-1" />
                    التنفسي
                  </TabsTrigger>
                  <TabsTrigger value="nervous" className="text-xs">
                    <Brain className="h-3 w-3 ml-1" />
                    العصبي
                  </TabsTrigger>
                  <TabsTrigger value="digestive" className="text-xs">
                    <Utensils className="h-3 w-3 ml-1" />
                    الهضمي
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

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
                {simulationType === 'circulatory' && <p>• ينقل الدم الأكسجين والمغذيات للخلايا</p>}
                {simulationType === 'respiratory' && <p>• تبادل الغازات في الحويصلات الهوائية</p>}
                {simulationType === 'nervous' && <p>• ينقل الإشارات العصبية بسرعة فائقة</p>}
                {simulationType === 'digestive' && <p>• يحلل الطعام ويمتص المغذيات</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanBodySimulation;
