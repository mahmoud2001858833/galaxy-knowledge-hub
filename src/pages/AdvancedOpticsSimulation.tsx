import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Sun, Eye, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedOpticsSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'prism' | 'lens' | 'interference' | 'polarization'>('prism');
  const [prismAngle, setPrismAngle] = useState(60);
  const [focalLength, setFocalLength] = useState(100);
  const [slitDistance, setSlitDistance] = useState(50);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (simulationType === 'prism') {
        drawPrismSimulation(ctx, canvas);
      } else if (simulationType === 'lens') {
        drawLensSimulation(ctx, canvas);
      } else if (simulationType === 'interference') {
        drawInterferenceSimulation(ctx, canvas);
      } else if (simulationType === 'polarization') {
        drawPolarizationSimulation(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.02);
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawPrismSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const prismSize = 120;

      // Draw prism
      ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const angleRad = (prismAngle * Math.PI) / 180;
      const h = prismSize * Math.sin(angleRad / 2);
      ctx.moveTo(centerX, centerY - h);
      ctx.lineTo(centerX - prismSize / 2, centerY + h / 2);
      ctx.lineTo(centerX + prismSize / 2, centerY + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Incoming white light
      const lightStartX = 50;
      const lightStartY = centerY - 30;
      const entryX = centerX - 40;
      const entryY = centerY - h / 3;

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lightStartX, lightStartY);
      ctx.lineTo(entryX, entryY);
      ctx.stroke();

      // Light source
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(lightStartX, lightStartY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(lightStartX, lightStartY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Spectrum colors
      const colors = [
        { color: '#ff0000', name: 'أحمر', angle: 15 },
        { color: '#ff8800', name: 'برتقالي', angle: 18 },
        { color: '#ffff00', name: 'أصفر', angle: 21 },
        { color: '#00ff00', name: 'أخضر', angle: 24 },
        { color: '#0088ff', name: 'أزرق', angle: 27 },
        { color: '#4400ff', name: 'نيلي', angle: 30 },
        { color: '#8800ff', name: 'بنفسجي', angle: 33 }
      ];

      const exitX = centerX + 20;
      const exitY = centerY;

      colors.forEach((c, i) => {
        const angleOffset = (c.angle * Math.PI) / 180;
        const rayLength = 200;
        const endX = exitX + Math.cos(angleOffset) * rayLength;
        const endY = exitY + Math.sin(angleOffset) * rayLength;

        ctx.strokeStyle = c.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(exitX, exitY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Labels
        ctx.fillStyle = c.color;
        ctx.font = '12px Arial';
        ctx.fillText(c.name, endX + 5, endY);
      });

      // Info
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`زاوية المنشور: ${prismAngle}°`, canvas.width - 20, 30);
      ctx.fillText('n = c / v', canvas.width - 20, 50);
      ctx.fillText('معامل الانكسار يختلف حسب الطول الموجي', canvas.width - 20, 70);
    };

    const drawLensSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw optical axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw lens
      ctx.strokeStyle = '#88ccff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.quadraticCurveTo(centerX + 20, centerY, centerX, centerY + 100);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.quadraticCurveTo(centerX - 20, centerY, centerX, centerY + 100);
      ctx.stroke();

      // Focal points
      const f = focalLength;
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(centerX - f, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + f, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('F', centerX - f - 5, centerY + 20);
      ctx.fillText("F'", centerX + f - 5, centerY + 20);

      // Object (arrow)
      const objectX = centerX - 180;
      const objectHeight = 60;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(objectX, centerY);
      ctx.lineTo(objectX, centerY - objectHeight);
      ctx.lineTo(objectX - 10, centerY - objectHeight + 15);
      ctx.moveTo(objectX, centerY - objectHeight);
      ctx.lineTo(objectX + 10, centerY - objectHeight + 15);
      ctx.stroke();

      // Calculate image position using lens equation
      const objectDistance = centerX - objectX;
      const imageDistance = (f * objectDistance) / (objectDistance - f);
      const magnification = -imageDistance / objectDistance;
      const imageHeight = objectHeight * magnification;

      // Draw rays
      const rays = [
        { color: '#ff6666', type: 'parallel' },
        { color: '#66ff66', type: 'center' },
        { color: '#6666ff', type: 'focal' }
      ];

      rays.forEach(ray => {
        ctx.strokeStyle = ray.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (ray.type === 'parallel') {
          ctx.moveTo(objectX, centerY - objectHeight);
          ctx.lineTo(centerX, centerY - objectHeight);
          ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
        } else if (ray.type === 'center') {
          ctx.moveTo(objectX, centerY - objectHeight);
          ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
        } else {
          ctx.moveTo(objectX, centerY - objectHeight);
          ctx.lineTo(centerX, centerY - (objectHeight * centerX) / (centerX - f + objectDistance));
          ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
        }
        ctx.stroke();
      });

      // Draw image (inverted arrow)
      if (imageDistance > 0) {
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX + imageDistance, centerY);
        ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
        ctx.stroke();
      }

      // Info
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`البعد البؤري: ${f} px`, 20, 30);
      ctx.fillText('1/f = 1/do + 1/di', 20, 50);
      ctx.fillText(`التكبير: ${Math.abs(magnification).toFixed(2)}×`, 20, 70);
    };

    const drawInterferenceSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const screenX = canvas.width - 100;
      
      // Draw slits
      ctx.fillStyle = '#333';
      ctx.fillRect(200, 0, 10, canvas.height);
      
      const slitY1 = canvas.height / 2 - slitDistance;
      const slitY2 = canvas.height / 2 + slitDistance;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(200, slitY1 - 5, 10, 10);
      ctx.fillRect(200, slitY2 - 5, 10, 10);

      // Light source
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(50, canvas.height / 2, 20, 0, Math.PI * 2);
      ctx.fill();

      // Incoming waves
      for (let i = 0; i < 5; i++) {
        const radius = ((time * 50 + i * 40) % 200);
        ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 - radius / 400})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(50, canvas.height / 2, radius, -0.3, 0.3);
        ctx.stroke();
      }

      // Waves from slits
      for (let i = 0; i < 8; i++) {
        const radius = ((time * 30 + i * 30) % 240);
        
        ctx.strokeStyle = `rgba(255, 100, 100, ${0.4 - radius / 600})`;
        ctx.beginPath();
        ctx.arc(210, slitY1, radius, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(100, 100, 255, ${0.4 - radius / 600})`;
        ctx.beginPath();
        ctx.arc(210, slitY2, radius, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      // Interference pattern on screen
      ctx.fillStyle = '#444';
      ctx.fillRect(screenX, 0, 30, canvas.height);

      const wavelength = 20;
      for (let y = 0; y < canvas.height; y++) {
        const d1 = Math.sqrt(Math.pow(screenX - 210, 2) + Math.pow(y - slitY1, 2));
        const d2 = Math.sqrt(Math.pow(screenX - 210, 2) + Math.pow(y - slitY2, 2));
        const pathDiff = Math.abs(d1 - d2);
        const phase = (pathDiff / wavelength) * Math.PI * 2;
        const intensity = Math.pow(Math.cos(phase / 2), 2);
        
        ctx.fillStyle = `rgba(255, 255, 100, ${intensity})`;
        ctx.fillRect(screenX, y, 30, 1);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('مصدر ضوء', 50, canvas.height - 20);
      ctx.fillText('شقين', 205, 20);
      ctx.fillText('شاشة', screenX + 15, 20);
      
      ctx.textAlign = 'left';
      ctx.fillText(`المسافة بين الشقين: ${slitDistance * 2} px`, 20, 30);
      ctx.fillText('التداخل البناء: Δ = nλ', 20, 50);
      ctx.fillText('التداخل الهدام: Δ = (n+½)λ', 20, 70);
    };

    const drawPolarizationSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;
      
      // Light source
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(50, centerY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Unpolarized light waves
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 6 + time;
        const amplitude = 30;
        
        ctx.strokeStyle = `hsl(${i * 60}, 100%, 70%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 80; x < 200; x += 5) {
          const y = centerY + Math.sin((x - 80) * 0.1 + time * 2) * amplitude * Math.sin(angle);
          if (x === 80) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // First polarizer
      ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';
      ctx.fillRect(200, centerY - 80, 15, 160);
      ctx.strokeStyle = '#88f';
      ctx.lineWidth = 2;
      for (let y = centerY - 70; y < centerY + 70; y += 10) {
        ctx.beginPath();
        ctx.moveTo(200, y);
        ctx.lineTo(215, y);
        ctx.stroke();
      }

      // Polarized light (vertical)
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 220; x < 380; x += 5) {
        const y = centerY + Math.sin((x - 220) * 0.1 + time * 2) * 40;
        if (x === 220) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second polarizer (analyzer) - rotates
      const analyzerAngle = time * 0.5;
      ctx.save();
      ctx.translate(400, centerY);
      ctx.rotate(analyzerAngle);
      ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
      ctx.fillRect(-7, -80, 15, 160);
      ctx.strokeStyle = '#f88';
      ctx.lineWidth = 2;
      for (let y = -70; y < 70; y += 10) {
        ctx.beginPath();
        ctx.moveTo(-7, y);
        ctx.lineTo(8, y);
        ctx.stroke();
      }
      ctx.restore();

      // Light after analyzer
      const transmittedIntensity = Math.pow(Math.cos(analyzerAngle), 2);
      ctx.strokeStyle = `rgba(255, 255, 0, ${transmittedIntensity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 420; x < 550; x += 5) {
        const y = centerY + Math.sin((x - 420) * 0.1 + time * 2) * 40 * transmittedIntensity;
        if (x === 420) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Detector
      const detectorIntensity = transmittedIntensity * 255;
      ctx.fillStyle = `rgb(${detectorIntensity}, ${detectorIntensity}, 0)`;
      ctx.beginPath();
      ctx.arc(580, centerY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ضوء غير مستقطب', 140, centerY + 100);
      ctx.fillText('مستقطب أول', 207, centerY - 90);
      ctx.fillText('ضوء مستقطب', 300, centerY + 70);
      ctx.fillText('محلل', 400, centerY - 90);
      ctx.fillText('كاشف', 580, centerY + 60);

      // Malus's law
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText("I = I₀ cos²θ (قانون مالوس)", 20, 30);
      ctx.fillText(`الشدة: ${(transmittedIntensity * 100).toFixed(0)}%`, 20, 50);
      ctx.fillText(`زاوية المحلل: ${((analyzerAngle * 180 / Math.PI) % 360).toFixed(0)}°`, 20, 70);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, prismAngle, focalLength, slitDistance, time]);

  const resetSimulation = () => {
    setTime(0);
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
            <Sun className="h-6 w-6 text-yellow-500" />
            البصريات المتقدمة
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
                  <TabsTrigger value="prism" className="text-xs">
                    <Sparkles className="h-3 w-3 ml-1" />
                    منشور
                  </TabsTrigger>
                  <TabsTrigger value="lens" className="text-xs">
                    <Eye className="h-3 w-3 ml-1" />
                    عدسة
                  </TabsTrigger>
                  <TabsTrigger value="interference" className="text-xs">
                    تداخل
                  </TabsTrigger>
                  <TabsTrigger value="polarization" className="text-xs">
                    استقطاب
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'prism' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">زاوية المنشور: {prismAngle}°</label>
                <Slider
                  value={[prismAngle]}
                  onValueChange={([v]) => setPrismAngle(v)}
                  min={30}
                  max={90}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            {simulationType === 'lens' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">البعد البؤري: {focalLength} px</label>
                <Slider
                  value={[focalLength]}
                  onValueChange={([v]) => setFocalLength(v)}
                  min={50}
                  max={200}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            {simulationType === 'interference' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">المسافة بين الشقين: {slitDistance * 2} px</label>
                <Slider
                  value={[slitDistance]}
                  onValueChange={([v]) => setSlitDistance(v)}
                  min={20}
                  max={100}
                  step={5}
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
              <h3 className="font-semibold mb-2">المفاهيم الفيزيائية</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                {simulationType === 'prism' && (
                  <>
                    <p>• <strong>التشتت:</strong> فصل الضوء إلى ألوانه</p>
                    <p>• معامل الانكسار يعتمد على الطول الموجي</p>
                    <p>• الضوء البنفسجي ينكسر أكثر من الأحمر</p>
                  </>
                )}
                {simulationType === 'lens' && (
                  <>
                    <p>• <strong>معادلة العدسة:</strong> 1/f = 1/do + 1/di</p>
                    <p>• التكبير = di / do</p>
                    <p>• الصورة تكون مقلوبة في العدسة المحدبة</p>
                  </>
                )}
                {simulationType === 'interference' && (
                  <>
                    <p>• <strong>تجربة الشق المزدوج</strong></p>
                    <p>• التداخل البناء عند فرق المسار = nλ</p>
                    <p>• يثبت الطبيعة الموجية للضوء</p>
                  </>
                )}
                {simulationType === 'polarization' && (
                  <>
                    <p>• <strong>قانون مالوس:</strong> I = I₀cos²θ</p>
                    <p>• الضوء المستقطب يهتز في مستوى واحد</p>
                    <p>• المحلل يتحكم في شدة الضوء المار</p>
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

export default AdvancedOpticsSimulation;
