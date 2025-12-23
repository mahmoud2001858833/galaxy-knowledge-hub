import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Battery } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ElectrochemistrySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'galvanic' | 'electrolysis' | 'corrosion' | 'fuel'>('galvanic');
  const [voltage, setVoltage] = useState(1.1);
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

      if (simulationType === 'galvanic') {
        drawGalvanicCell(ctx, canvas);
      } else if (simulationType === 'electrolysis') {
        drawElectrolysis(ctx, canvas);
      } else if (simulationType === 'corrosion') {
        drawCorrosion(ctx, canvas);
      } else if (simulationType === 'fuel') {
        drawFuelCell(ctx, canvas);
      }

      if (isPlaying) setTime(prev => prev + 0.02);
      animationId = requestAnimationFrame(animate);
    };

    const drawGalvanicCell = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const leftX = canvas.width / 4;
      const rightX = (canvas.width * 3) / 4;
      const cellY = 150;
      const cellH = 200;

      // Left beaker (Zinc anode)
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 3;
      ctx.strokeRect(leftX - 80, cellY, 160, cellH);
      ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
      ctx.fillRect(leftX - 77, cellY + 3, 154, cellH - 6);

      // Right beaker (Copper cathode)
      ctx.strokeRect(rightX - 80, cellY, 160, cellH);
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.fillRect(rightX - 77, cellY + 3, 154, cellH - 6);

      // Electrodes
      ctx.fillStyle = '#888';
      ctx.fillRect(leftX - 15, cellY - 30, 30, cellH + 20);
      ctx.fillStyle = '#cd7f32';
      ctx.fillRect(rightX - 15, cellY - 30, 30, cellH + 20);

      // Salt bridge
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(leftX + 60, cellY + 50);
      ctx.quadraticCurveTo(canvas.width / 2, cellY - 50, rightX - 60, cellY + 50);
      ctx.stroke();

      // Moving ions
      if (isPlaying) {
        for (let i = 0; i < 10; i++) {
          const progress = ((time * 0.5 + i * 0.1) % 1);
          const ionX = leftX + 60 + progress * (rightX - leftX - 120);
          const ionY = cellY + 50 - Math.sin(progress * Math.PI) * 80;
          
          ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
          ctx.beginPath();
          ctx.arc(ionX, ionY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Wire and electrons
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftX, cellY - 30);
      ctx.lineTo(leftX, cellY - 80);
      ctx.lineTo(rightX, cellY - 80);
      ctx.lineTo(rightX, cellY - 30);
      ctx.stroke();

      // Moving electrons
      if (isPlaying) {
        for (let i = 0; i < 5; i++) {
          const progress = ((time + i * 0.2) % 1);
          const electronX = leftX + progress * (rightX - leftX);
          ctx.fillStyle = '#ffeb3b';
          ctx.beginPath();
          ctx.arc(electronX, cellY - 80, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Voltmeter
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cellY - 80, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f0';
      ctx.stroke();
      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${voltage.toFixed(2)}V`, canvas.width / 2, cellY - 75);

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('Zn (أنود)', leftX, cellY + cellH + 30);
      ctx.fillText('Cu (كاثود)', rightX, cellY + cellH + 30);

      // Reactions
      ctx.font = '14px monospace';
      ctx.fillText('Zn → Zn²⁺ + 2e⁻', leftX, cellY + cellH + 55);
      ctx.fillText('Cu²⁺ + 2e⁻ → Cu', rightX, cellY + cellH + 55);
    };

    const drawElectrolysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const cellY = 120;
      const cellH = 250;

      // Container
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX - 150, cellY, 300, cellH);
      ctx.fillStyle = 'rgba(150, 200, 255, 0.4)';
      ctx.fillRect(centerX - 147, cellY + 3, 294, cellH - 6);

      // Electrodes
      ctx.fillStyle = '#555';
      ctx.fillRect(centerX - 100, cellY - 40, 20, cellH + 30);
      ctx.fillRect(centerX + 80, cellY - 40, 20, cellH + 30);

      // Power source
      ctx.fillStyle = '#333';
      ctx.fillRect(centerX - 40, 30, 80, 50);
      ctx.fillStyle = '#f00';
      ctx.fillRect(centerX - 35, 35, 30, 40);
      ctx.fillStyle = '#00f';
      ctx.fillRect(centerX + 5, 35, 30, 40);

      // Wires
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 90, cellY - 40);
      ctx.lineTo(centerX - 90, 55);
      ctx.lineTo(centerX - 35, 55);
      ctx.moveTo(centerX + 90, cellY - 40);
      ctx.lineTo(centerX + 90, 55);
      ctx.lineTo(centerX + 35, 55);
      ctx.stroke();

      // Bubbles
      if (isPlaying) {
        for (let i = 0; i < 15; i++) {
          const side = i < 8 ? -1 : 1;
          const x = centerX + side * 90 + Math.sin(time * 2 + i) * 10;
          const y = cellY + cellH - 20 - ((time * 50 + i * 30) % (cellH - 40));
          const size = 3 + Math.random() * 4;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('كاثود (−)', centerX - 90, cellY + cellH + 30);
      ctx.fillText('أنود (+)', centerX + 90, cellY + cellH + 30);
      ctx.fillText('H₂ ↑', centerX - 90, cellY + cellH + 55);
      ctx.fillText('O₂ ↑', centerX + 90, cellY + cellH + 55);

      ctx.font = '14px monospace';
      ctx.fillText('2H₂O → 2H₂ + O₂', centerX, cellY + cellH + 80);
    };

    const drawCorrosion = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Iron bar
      ctx.fillStyle = '#666';
      ctx.fillRect(centerX - 120, centerY - 40, 240, 80);

      // Rust spots
      const rustSpots = Math.floor(time * 2) % 20;
      for (let i = 0; i < rustSpots; i++) {
        const x = centerX - 100 + (i * 47) % 200;
        const y = centerY - 30 + (i * 23) % 60;
        const size = 5 + (i * 7) % 15;
        
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water droplet
      ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 60, 80, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Oxygen molecules
      if (isPlaying) {
        for (let i = 0; i < 5; i++) {
          const angle = time + i * 1.2;
          const x = centerX + Math.cos(angle) * 60;
          const y = centerY - 80 + Math.sin(angle * 0.5) * 20;
          
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.arc(x + 12, y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#fff';
          ctx.font = '10px Arial';
          ctx.fillText('O₂', x + 5, y + 4);
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('تآكل الحديد (الصدأ)', centerX, 60);

      ctx.font = '14px monospace';
      ctx.fillText('4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃', centerX, canvas.height - 80);
      ctx.fillText('2Fe(OH)₃ → Fe₂O₃·3H₂O (صدأ)', centerX, canvas.height - 55);
    };

    const drawFuelCell = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const cellY = 100;
      const cellH = 280;

      // Cell membrane
      ctx.fillStyle = '#444';
      ctx.fillRect(centerX - 5, cellY, 10, cellH);

      // Anode side
      ctx.fillStyle = 'rgba(100, 200, 100, 0.3)';
      ctx.fillRect(centerX - 150, cellY, 145, cellH);
      ctx.strokeStyle = '#666';
      ctx.strokeRect(centerX - 150, cellY, 145, cellH);

      // Cathode side
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(centerX + 5, cellY, 145, cellH);
      ctx.strokeRect(centerX + 5, cellY, 145, cellH);

      // H2 molecules
      if (isPlaying) {
        for (let i = 0; i < 8; i++) {
          const x = centerX - 130 + Math.sin(time + i) * 30;
          const y = cellY + 30 + i * 30;
          
          ctx.fillStyle = '#4CAF50';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.arc(x + 14, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Protons through membrane
        for (let i = 0; i < 5; i++) {
          const progress = ((time * 0.3 + i * 0.2) % 1);
          const x = centerX - 5 + progress * 10;
          const y = cellY + 50 + i * 45;
          
          ctx.fillStyle = '#ff9800';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // O2 molecules
        for (let i = 0; i < 4; i++) {
          const x = centerX + 100 + Math.sin(time * 0.8 + i) * 20;
          const y = cellY + 50 + i * 60;
          
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.arc(x + 16, y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Water output
        for (let i = 0; i < 3; i++) {
          const x = centerX + 80;
          const y = cellY + cellH - 40 + Math.sin(time + i) * 10;
          
          ctx.fillStyle = '#2196F3';
          ctx.beginPath();
          ctx.arc(x + i * 25, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('H₂', centerX - 80, cellY - 20);
      ctx.fillText('O₂', centerX + 80, cellY - 20);
      ctx.fillText('H₂O', centerX + 80, cellY + cellH + 25);

      ctx.font = '14px Arial';
      ctx.fillText('أنود', centerX - 80, cellY + cellH + 50);
      ctx.fillText('كاثود', centerX + 80, cellY + cellH + 50);

      // Reactions
      ctx.font = '12px monospace';
      ctx.fillText('2H₂ → 4H⁺ + 4e⁻', centerX - 80, cellY + cellH + 75);
      ctx.fillText('O₂ + 4H⁺ + 4e⁻ → 2H₂O', centerX + 80, cellY + cellH + 75);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, voltage, time]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Battery className="h-6 w-6 text-yellow-500" />
            الكيمياء الكهربائية
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
              <h3 className="font-semibold mb-3">نوع الخلية</h3>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="galvanic" className="text-xs">
                    <Zap className="h-3 w-3 ml-1" />
                    جلفانية
                  </TabsTrigger>
                  <TabsTrigger value="electrolysis" className="text-xs">تحليل</TabsTrigger>
                  <TabsTrigger value="corrosion" className="text-xs">تآكل</TabsTrigger>
                  <TabsTrigger value="fuel" className="text-xs">وقود</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'galvanic' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">فرق الجهد: {voltage.toFixed(2)} V</label>
                <Slider value={[voltage]} onValueChange={([v]) => setVoltage(v)} min={0.5} max={2} step={0.1} className="mt-2" />
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
                {simulationType === 'galvanic' && <p>• الخلية الجلفانية تحول الطاقة الكيميائية لكهربائية</p>}
                {simulationType === 'electrolysis' && <p>• التحليل الكهربائي يحول الطاقة الكهربائية لكيميائية</p>}
                {simulationType === 'corrosion' && <p>• التآكل عملية كهروكيميائية تلقائية</p>}
                {simulationType === 'fuel' && <p>• خلايا الوقود تنتج كهرباء من الهيدروجين والأكسجين</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectrochemistrySimulation;
