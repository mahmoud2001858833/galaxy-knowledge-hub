import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Atom, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedNuclearSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'alpha' | 'beta' | 'gamma' | 'halflife'>('alpha');
  const [halfLife, setHalfLife] = useState(5);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (simulationType === 'alpha') drawAlphaDecay(ctx, canvas);
      else if (simulationType === 'beta') drawBetaDecay(ctx, canvas);
      else if (simulationType === 'gamma') drawGammaDecay(ctx, canvas);
      else if (simulationType === 'halflife') drawHalfLife(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.02);
      animationId = requestAnimationFrame(animate);
    };

    const drawNucleus = (ctx: CanvasRenderingContext2D, x: number, y: number, protons: number, neutrons: number, radius: number) => {
      const total = protons + neutrons;
      for (let i = 0; i < Math.min(total, 50); i++) {
        const angle = (i / total) * Math.PI * 2 + Math.sin(time + i) * 0.1;
        const r = (i / total) * radius * 0.8;
        const px = x + Math.cos(angle * 3 + i) * r;
        const py = y + Math.sin(angle * 2 + i) * r;
        
        ctx.fillStyle = i < protons ? '#e74c3c' : '#3498db';
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawAlphaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      // Parent nucleus (Uranium-238)
      drawNucleus(ctx, centerX, centerY, 92, 146, 60);

      // Alpha particle emission
      const emissionProgress = (time * 0.5) % 3;
      if (emissionProgress > 0) {
        const alphaX = centerX + emissionProgress * 100;
        const alphaY = centerY - emissionProgress * 30;

        // Alpha particle (2 protons + 2 neutrons)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(alphaX - 8, alphaY - 5, 10, 0, Math.PI * 2);
        ctx.arc(alphaX + 8, alphaY - 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(alphaX - 8, alphaY + 8, 10, 0, Math.PI * 2);
        ctx.arc(alphaX + 8, alphaY + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('α (He²⁺)', alphaX, alphaY - 30);
      }

      // Daughter nucleus (Thorium-234)
      if (emissionProgress > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Th-234', centerX, centerY + 90);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('U-238', centerX, centerY - 80);
      ctx.fillText('انحلال ألفا', canvas.width / 2, 40);

      // Equation
      ctx.font = '14px monospace';
      ctx.fillText('²³⁸U → ²³⁴Th + ⁴He', canvas.width / 2, canvas.height - 50);
      ctx.fillText('(A-4, Z-2)', canvas.width / 2, canvas.height - 30);
    };

    const drawBetaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      // Parent nucleus (Carbon-14)
      drawNucleus(ctx, centerX, centerY, 6, 8, 40);

      const emissionProgress = (time * 0.8) % 2;

      // Beta particle (electron)
      if (emissionProgress > 0) {
        const betaX = centerX + emissionProgress * 150;
        const betaY = centerY + Math.sin(emissionProgress * 10) * 30;

        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(betaX, betaY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Electron trail
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX + 40, centerY);
        ctx.lineTo(betaX, betaY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('β⁻ (e⁻)', betaX, betaY - 15);

        // Antineutrino
        const nuX = centerX + emissionProgress * 120;
        const nuY = centerY - emissionProgress * 50;
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(nuX, nuY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('ν̄', nuX + 10, nuY);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('C-14', centerX, centerY - 60);
      ctx.fillText('انحلال بيتا (β⁻)', canvas.width / 2, 40);

      // Equation
      ctx.font = '14px monospace';
      ctx.fillText('¹⁴C → ¹⁴N + e⁻ + ν̄', canvas.width / 2, canvas.height - 50);
      ctx.fillText('(نيوترون → بروتون + إلكترون)', canvas.width / 2, canvas.height - 30);
    };

    const drawGammaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      // Excited nucleus
      drawNucleus(ctx, centerX, centerY, 27, 33, 45);

      // Excited state glow
      ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(time * 5) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 55 + Math.sin(time * 5) * 5, 0, Math.PI * 2);
      ctx.stroke();

      // Gamma ray emission
      const emissionProgress = (time * 0.6) % 2;
      if (emissionProgress > 0) {
        const rayLength = emissionProgress * 200;

        // Gamma ray wave
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < rayLength; i += 2) {
          const x = centerX + 50 + i;
          const y = centerY + Math.sin(i * 0.3 + time * 10) * 15;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('γ (فوتون)', centerX + 50 + rayLength / 2, centerY - 30);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Co-60*', centerX, centerY - 70);
      ctx.fillText('(حالة مثارة)', centerX, centerY - 50);
      ctx.fillText('انحلال غاما', canvas.width / 2, 40);

      // Equation
      ctx.font = '14px monospace';
      ctx.fillText('⁶⁰Co* → ⁶⁰Co + γ', canvas.width / 2, canvas.height - 50);
      ctx.fillText('(لا تغير في A أو Z)', canvas.width / 2, canvas.height - 30);
    };

    const drawHalfLife = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const graphX = 100;
      const graphY = canvas.height - 100;
      const graphW = canvas.width - 200;
      const graphH = 300;

      // Axes
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Decay curve
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const N0 = graphH - 20;
      for (let t = 0; t <= graphW; t++) {
        const timeVal = (t / graphW) * 30;
        const N = N0 * Math.pow(0.5, timeVal / halfLife);
        const x = graphX + t;
        const y = graphY - N;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Half-life markers
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 1;
      
      for (let i = 1; i <= 4; i++) {
        const tHalf = (halfLife * i / 30) * graphW;
        const yHalf = graphY - N0 * Math.pow(0.5, i);
        
        ctx.beginPath();
        ctx.moveTo(graphX + tHalf, graphY);
        ctx.lineTo(graphX + tHalf, yHalf);
        ctx.lineTo(graphX, yHalf);
        ctx.stroke();

        ctx.fillStyle = '#f39c12';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`t${i}`, graphX + tHalf, graphY + 20);
        ctx.textAlign = 'right';
        ctx.fillText(`N₀/${Math.pow(2, i)}`, graphX - 5, yHalf + 4);
      }
      ctx.setLineDash([]);

      // Animated sample
      const sampleX = 650;
      const sampleY = 150;
      const currentN = Math.pow(0.5, time / halfLife);
      const numAtoms = Math.floor(currentN * 50);

      ctx.fillStyle = '#333';
      ctx.fillRect(sampleX - 60, sampleY - 60, 120, 120);

      for (let i = 0; i < numAtoms; i++) {
        const ax = sampleX - 50 + (i % 10) * 10;
        const ay = sampleY - 50 + Math.floor(i / 10) * 10;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الزمن (t)', graphX + graphW / 2, graphY + 40);
      ctx.save();
      ctx.translate(graphX - 50, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('عدد الذرات (N)', 0, 0);
      ctx.restore();

      ctx.font = '16px Arial';
      ctx.fillText('عمر النصف', canvas.width / 2, 40);
      ctx.font = '14px monospace';
      ctx.fillText(`N = N₀ × (½)^(t/t½)`, canvas.width / 2, 70);
      ctx.fillText(`t½ = ${halfLife} ثانية`, sampleX, sampleY + 80);
      ctx.fillText(`المتبقي: ${(currentN * 100).toFixed(1)}%`, sampleX, sampleY + 100);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, halfLife, time]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Atom className="h-6 w-6 text-green-500" />
            الفيزياء النووية المتقدمة
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
              <h3 className="font-semibold mb-3">نوع الانحلال</h3>
              <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); setTime(0); }}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="alpha" className="text-xs">
                    <Zap className="h-3 w-3 ml-1" />
                    ألفا α
                  </TabsTrigger>
                  <TabsTrigger value="beta" className="text-xs">بيتا β</TabsTrigger>
                  <TabsTrigger value="gamma" className="text-xs">غاما γ</TabsTrigger>
                  <TabsTrigger value="halflife" className="text-xs">عمر النصف</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'halflife' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">عمر النصف: {halfLife} ثانية</label>
                <Slider value={[halfLife]} onValueChange={([v]) => setHalfLife(v)} min={1} max={15} step={1} className="mt-2" />
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
                {simulationType === 'alpha' && <p>• جسيم ألفا = نواة هيليوم (2p + 2n)</p>}
                {simulationType === 'beta' && <p>• جسيم بيتا = إلكترون من تحول نيوترون</p>}
                {simulationType === 'gamma' && <p>• أشعة غاما = فوتونات عالية الطاقة</p>}
                {simulationType === 'halflife' && <p>• عمر النصف = زمن انحلال نصف العينة</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedNuclearSimulation;
