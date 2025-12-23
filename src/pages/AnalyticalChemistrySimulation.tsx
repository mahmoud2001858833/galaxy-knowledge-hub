import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Beaker, Droplets, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticalChemistrySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'titration' | 'ph' | 'chromatography' | 'spectroscopy'>('titration');
  const [titrantVolume, setTitrantVolume] = useState(0);
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

      if (simulationType === 'titration') {
        drawTitration(ctx, canvas);
      } else if (simulationType === 'ph') {
        drawPHMeter(ctx, canvas);
      } else if (simulationType === 'chromatography') {
        drawChromatography(ctx, canvas);
      } else if (simulationType === 'spectroscopy') {
        drawSpectroscopy(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.02);
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawTitration = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Burette
      ctx.fillStyle = '#ddd';
      ctx.fillRect(canvas.width / 2 - 15, 30, 30, 200);
      ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      const titrantLevel = 200 - titrantVolume * 4;
      ctx.fillRect(canvas.width / 2 - 12, 33 + (200 - titrantLevel), 24, titrantLevel - 6);

      // Burette tip
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 5, 230);
      ctx.lineTo(canvas.width / 2 + 5, 230);
      ctx.lineTo(canvas.width / 2, 250);
      ctx.closePath();
      ctx.fill();

      // Dropping animation
      if (isPlaying && titrantVolume < 50) {
        const dropY = 250 + ((time * 100) % 80);
        if (dropY < 330) {
          ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
          ctx.beginPath();
          ctx.ellipse(canvas.width / 2, dropY, 4, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Flask
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 80, 330);
      ctx.lineTo(canvas.width / 2 - 50, 450);
      ctx.lineTo(canvas.width / 2 + 50, 450);
      ctx.lineTo(canvas.width / 2 + 80, 330);
      ctx.stroke();

      // Solution in flask
      const pH = calculatePH(titrantVolume);
      const color = getPHColor(pH);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 65, 360);
      ctx.lineTo(canvas.width / 2 - 48, 445);
      ctx.lineTo(canvas.width / 2 + 48, 445);
      ctx.lineTo(canvas.width / 2 + 65, 360);
      ctx.closePath();
      ctx.fill();

      // pH display
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`pH = ${pH.toFixed(2)}`, canvas.width / 2, canvas.height - 50);

      // Titration curve
      drawTitrationCurve(ctx, canvas, titrantVolume);
    };

    const calculatePH = (volume: number): number => {
      if (volume < 24) return 2 + volume * 0.2;
      if (volume < 26) return 7 + (volume - 25) * 3;
      return Math.min(12, 10 + (volume - 26) * 0.1);
    };

    const getPHColor = (pH: number): string => {
      if (pH < 4) return 'rgba(255, 50, 50, 0.7)';
      if (pH < 6) return 'rgba(255, 150, 50, 0.7)';
      if (pH < 8) return 'rgba(50, 255, 50, 0.7)';
      if (pH < 10) return 'rgba(50, 150, 255, 0.7)';
      return 'rgba(150, 50, 255, 0.7)';
    };

    const drawTitrationCurve = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, currentVol: number) => {
      const graphX = 50;
      const graphY = canvas.height - 180;
      const graphW = 200;
      const graphH = 120;

      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let v = 0; v <= Math.min(currentVol, 50); v += 0.5) {
        const x = graphX + (v / 50) * graphW;
        const pH = calculatePH(v);
        const y = graphY - (pH / 14) * graphH;
        if (v === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.fillText('حجم المعاير', graphX + graphW / 2, graphY + 15);
    };

    const drawPHMeter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Beaker
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(centerX - 100, centerY - 50, 200, 180);
      ctx.stroke();

      // Solution
      const hue = 120 - (7 - Math.sin(time) * 3) * 17;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`;
      ctx.fillRect(centerX - 97, centerY, 194, 127);

      // pH Electrode
      ctx.fillStyle = '#333';
      ctx.fillRect(centerX - 10, centerY - 120, 20, 180);
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 60, 12, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Digital display
      ctx.fillStyle = '#000';
      ctx.fillRect(centerX + 120, centerY - 80, 150, 80);
      ctx.strokeStyle = '#0f0';
      ctx.strokeRect(centerX + 120, centerY - 80, 150, 80);

      const displayPH = (7 + Math.sin(time) * 3).toFixed(2);
      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(displayPH, centerX + 195, centerY - 30);

      ctx.font = '14px Arial';
      ctx.fillText('pH', centerX + 195, centerY - 60);

      // pH scale
      const scaleY = centerY + 160;
      for (let i = 0; i <= 14; i++) {
        const x = 100 + i * 40;
        const hue = 120 - i * 8.5;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(x, scaleY, 38, 30);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x + 19, scaleY + 45);
      }
    };

    const drawChromatography = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Paper strip
      ctx.fillStyle = '#f5f5dc';
      ctx.fillRect(canvas.width / 2 - 60, 50, 120, 400);

      // Solvent front
      const solventY = 50 + Math.min(time * 20, 350);
      ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
      ctx.fillRect(canvas.width / 2 - 58, 50, 116, solventY - 50);

      // Sample spots
      const samples = [
        { color: '#e74c3c', rf: 0.8, name: 'صبغة 1' },
        { color: '#3498db', rf: 0.5, name: 'صبغة 2' },
        { color: '#f1c40f', rf: 0.3, name: 'صبغة 3' }
      ];

      samples.forEach((sample, i) => {
        const startX = canvas.width / 2 - 30 + i * 30;
        const startY = 420;
        const moveDistance = Math.min(time * 20 * sample.rf, 300 * sample.rf);

        // Original spot
        ctx.fillStyle = sample.color;
        ctx.beginPath();
        ctx.arc(startX, startY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Moving spot
        if (moveDistance > 0) {
          ctx.fillStyle = sample.color;
          ctx.beginPath();
          ctx.arc(startX, startY - moveDistance, 10, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          ctx.fillStyle = `${sample.color}40`;
          ctx.fillRect(startX - 5, startY - moveDistance, 10, moveDistance);
        }
      });

      // Rf values
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      samples.forEach((sample, i) => {
        ctx.fillStyle = sample.color;
        ctx.fillText(`${sample.name}: Rf = ${sample.rf}`, canvas.width - 50, 80 + i * 25);
      });

      // Formula
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Rf = المسافة المقطوعة بالصبغة / المسافة المقطوعة بالمذيب', canvas.width / 2, canvas.height - 30);
    };

    const drawSpectroscopy = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
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
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Spectrum
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < graphW; x++) {
        const wavelength = 380 + (x / graphW) * 400;
        const absorbance = Math.sin(wavelength * 0.05 + time) * 0.3 + 
                          Math.exp(-Math.pow((wavelength - 450) / 30, 2)) * 0.8 +
                          Math.exp(-Math.pow((wavelength - 550) / 40, 2)) * 0.5;
        
        const hue = ((wavelength - 380) / 400) * 270;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        
        const y = graphY - absorbance * graphH * 0.8;
        if (x === 0) ctx.moveTo(graphX + x, y);
        else ctx.lineTo(graphX + x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(graphX + x, y);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الطول الموجي (nm)', graphX + graphW / 2, graphY + 30);
      ctx.fillText('380', graphX, graphY + 20);
      ctx.fillText('780', graphX + graphW, graphY + 20);

      ctx.save();
      ctx.translate(graphX - 40, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('الامتصاص', 0, 0);
      ctx.restore();

      // Beer-Lambert law
      ctx.font = '16px monospace';
      ctx.fillText('A = ε × c × l', canvas.width / 2, 50);
      ctx.font = '12px Arial';
      ctx.fillText('قانون بير-لامبرت', canvas.width / 2, 75);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, titrantVolume, time]);

  const resetSimulation = () => {
    setTime(0);
    setTitrantVolume(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Beaker className="h-6 w-6 text-green-500" />
            الكيمياء التحليلية
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
              <h3 className="font-semibold mb-3">نوع التحليل</h3>
              <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); resetSimulation(); }}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="titration" className="text-xs">
                    <Droplets className="h-3 w-3 ml-1" />
                    معايرة
                  </TabsTrigger>
                  <TabsTrigger value="ph" className="text-xs">
                    <Activity className="h-3 w-3 ml-1" />
                    pH
                  </TabsTrigger>
                  <TabsTrigger value="chromatography" className="text-xs">كروماتوغرافيا</TabsTrigger>
                  <TabsTrigger value="spectroscopy" className="text-xs">طيفية</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'titration' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">حجم المعاير: {titrantVolume} mL</label>
                <Slider
                  value={[titrantVolume]}
                  onValueChange={([v]) => setTitrantVolume(v)}
                  min={0}
                  max={50}
                  step={0.5}
                  className="mt-2"
                />
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
              <h3 className="font-semibold mb-2">المفاهيم</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {simulationType === 'titration' && <p>• المعايرة الحمضية-القاعدية</p>}
                {simulationType === 'ph' && <p>• قياس تركيز أيونات الهيدروجين</p>}
                {simulationType === 'chromatography' && <p>• فصل المركبات حسب Rf</p>}
                {simulationType === 'spectroscopy' && <p>• قانون بير-لامبرت للامتصاص</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticalChemistrySimulation;
