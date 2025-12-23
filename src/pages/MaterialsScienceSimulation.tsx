import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Layers, Thermometer, Zap, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MaterialsScienceSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'crystal' | 'alloy' | 'stress' | 'phase'>('crystal');
  const [temperature, setTemperature] = useState(25);
  const [stress, setStress] = useState(0);
  const [composition, setComposition] = useState(50);
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

      if (simulationType === 'crystal') {
        drawCrystalStructure(ctx, canvas);
      } else if (simulationType === 'alloy') {
        drawAlloySimulation(ctx, canvas);
      } else if (simulationType === 'stress') {
        drawStressStrainSimulation(ctx, canvas);
      } else if (simulationType === 'phase') {
        drawPhaseDiagram(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.02);
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawCrystalStructure = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const structures = ['BCC', 'FCC', 'HCP'];
      const structureIndex = Math.floor(time / 3) % 3;
      const currentStructure = structures[structureIndex];
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 80;
      const rotationY = time * 0.5;
      const rotationX = 0.3;

      // 3D rotation helper
      const rotate3D = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        
        return { x: x1 + centerX, y: y1 + centerY, z: z2 };
      };

      // Draw unit cell edges
      const drawEdge = (p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}) => {
        ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 + (p1.z + p2.z) / 400})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      };

      // Draw atom
      const drawAtom = (x: number, y: number, z: number, color: string, atomSize: number = 15) => {
        const pos = rotate3D(x, y, z);
        const scale = 1 + pos.z / 300;
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, atomSize * scale);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, atomSize * scale, 0, Math.PI * 2);
        ctx.fill();
      };

      // Define corners
      const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ].map(([x, y, z]) => rotate3D(x * size, y * size, z * size));

      // Draw edges
      [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a, b]) => {
        drawEdge(corners[a], corners[b]);
      });

      // Draw atoms based on structure
      if (currentStructure === 'BCC') {
        // Body-Centered Cubic
        [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(([x,y,z]) => {
          drawAtom(x * size, y * size, z * size, '#4a90d9');
        });
        drawAtom(0, 0, 0, '#e74c3c', 18); // Center atom
        
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BCC - مكعب مركزي الجسم', centerX, 40);
        ctx.font = '14px Arial';
        ctx.fillText('مثال: الحديد، الكروم', centerX, 65);
      } else if (currentStructure === 'FCC') {
        // Face-Centered Cubic
        [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(([x,y,z]) => {
          drawAtom(x * size, y * size, z * size, '#4a90d9');
        });
        // Face centers
        [[0,0,-1],[0,0,1],[-1,0,0],[1,0,0],[0,-1,0],[0,1,0]].forEach(([x,y,z]) => {
          drawAtom(x * size, y * size, z * size, '#2ecc71', 16);
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FCC - مكعب مركزي الوجوه', centerX, 40);
        ctx.font = '14px Arial';
        ctx.fillText('مثال: الألمنيوم، النحاس', centerX, 65);
      } else {
        // HCP
        const hexRadius = size * 0.8;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          drawAtom(Math.cos(angle) * hexRadius, -size, Math.sin(angle) * hexRadius, '#4a90d9');
          drawAtom(Math.cos(angle) * hexRadius, size, Math.sin(angle) * hexRadius, '#4a90d9');
        }
        drawAtom(0, -size, 0, '#4a90d9');
        drawAtom(0, size, 0, '#4a90d9');
        // Middle layer
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 + Math.PI / 6;
          drawAtom(Math.cos(angle) * hexRadius * 0.6, 0, Math.sin(angle) * hexRadius * 0.6, '#f39c12', 16);
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HCP - سداسي مكتظ', centerX, 40);
        ctx.font = '14px Arial';
        ctx.fillText('مثال: التيتانيوم، الزنك', centerX, 65);
      }

      // Info
      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('البنية البلورية تحدد خصائص المعدن', 20, canvas.height - 40);
    };

    const drawAlloySimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gridSize = 20;
      const atomRadius = 8;
      const startX = 100;
      const startY = 80;
      const cols = 25;
      const rows = 15;

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`سبيكة ثنائية - نسبة العنصر B: ${composition}%`, canvas.width / 2, 30);

      // Draw atoms grid
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * gridSize + (row % 2) * (gridSize / 2);
          const y = startY + row * gridSize * 0.866;
          
          // Determine if this is element A or B based on composition
          const isElementB = Math.random() * 100 < composition;
          const vibration = Math.sin(time * 5 + x * 0.1 + y * 0.1) * (temperature / 500);
          
          const gradient = ctx.createRadialGradient(x + vibration, y + vibration, 0, x + vibration, y + vibration, atomRadius);
          if (isElementB) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');
          } else {
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#2980b9');
          }
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x + vibration, y + vibration, atomRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Legend
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(50, canvas.height - 60, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('عنصر A', 70, canvas.height - 55);

      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(50, canvas.height - 30, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('عنصر B', 70, canvas.height - 25);

      // Temperature indicator
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`درجة الحرارة: ${temperature}°C`, canvas.width - 20, canvas.height - 30);
    };

    const drawStressStrainSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const originalWidth = 200;
      const originalHeight = 100;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate deformation
      const strain = stress / 100;
      const currentWidth = originalWidth * (1 + strain);
      const currentHeight = originalHeight * (1 - strain * 0.3); // Poisson effect

      // Draw sample
      const gradient = ctx.createLinearGradient(centerX - currentWidth / 2, 0, centerX + currentWidth / 2, 0);
      gradient.addColorStop(0, '#4a4a6a');
      gradient.addColorStop(0.5, '#6a6a8a');
      gradient.addColorStop(1, '#4a4a6a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - currentWidth / 2, centerY - currentHeight / 2, currentWidth, currentHeight);

      // Draw internal structure (grains)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const grainX = centerX - currentWidth / 2 + (i + 0.5) * (currentWidth / 10);
        const grainDeform = Math.sin(time + i) * 5 * (strain + 0.1);
        ctx.beginPath();
        ctx.ellipse(grainX + grainDeform, centerY, 15 * (1 + strain * 0.5), 20 * (1 - strain * 0.3), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw force arrows
      const arrowLength = 60 + stress;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 4;
      ctx.fillStyle = '#e74c3c';

      // Left arrow
      ctx.beginPath();
      ctx.moveTo(centerX - currentWidth / 2 - arrowLength, centerY);
      ctx.lineTo(centerX - currentWidth / 2 - 10, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - currentWidth / 2 - 10, centerY);
      ctx.lineTo(centerX - currentWidth / 2 - 25, centerY - 10);
      ctx.lineTo(centerX - currentWidth / 2 - 25, centerY + 10);
      ctx.closePath();
      ctx.fill();

      // Right arrow
      ctx.beginPath();
      ctx.moveTo(centerX + currentWidth / 2 + arrowLength, centerY);
      ctx.lineTo(centerX + currentWidth / 2 + 10, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + currentWidth / 2 + 10, centerY);
      ctx.lineTo(centerX + currentWidth / 2 + 25, centerY - 10);
      ctx.lineTo(centerX + currentWidth / 2 + 25, centerY + 10);
      ctx.closePath();
      ctx.fill();

      // Draw stress-strain curve
      const graphX = 50;
      const graphY = canvas.height - 150;
      const graphW = 200;
      const graphH = 120;

      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Curve
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      for (let x = 0; x <= graphW; x++) {
        const strainVal = x / graphW;
        let stressVal;
        if (strainVal < 0.3) {
          stressVal = strainVal * 3; // Elastic region
        } else if (strainVal < 0.7) {
          stressVal = 0.9 + (strainVal - 0.3) * 0.2; // Plastic region
        } else {
          stressVal = 0.98 - (strainVal - 0.7) * 0.3; // Necking
        }
        ctx.lineTo(graphX + x, graphY - stressVal * graphH);
      }
      ctx.stroke();

      // Current point
      const currentX = graphX + (stress / 100) * graphW;
      let currentStress;
      if (strain < 0.3) currentStress = strain * 3;
      else if (strain < 0.7) currentStress = 0.9 + (strain - 0.3) * 0.2;
      else currentStress = 0.98 - (strain - 0.7) * 0.3;
      
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(currentX, graphY - currentStress * graphH, 6, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('انفعال (ε)', graphX + graphW / 2, graphY + 20);
      ctx.save();
      ctx.translate(graphX - 20, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('إجهاد (σ)', 0, 0);
      ctx.restore();

      // Info
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`الإجهاد: ${stress} MPa`, canvas.width - 20, 30);
      ctx.fillText(`الانفعال: ${(strain * 100).toFixed(1)}%`, canvas.width - 20, 50);
      ctx.fillText('σ = E × ε (قانون هوك)', canvas.width - 20, 70);
    };

    const drawPhaseDiagram = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const graphX = 100;
      const graphY = canvas.height - 80;
      const graphW = canvas.width - 200;
      const graphH = canvas.height - 150;

      // Axes
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Phase regions
      // Liquid region
      ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY - graphH * 0.6);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.4, graphX, graphY - graphH * 0.7);
      ctx.closePath();
      ctx.fill();

      // Solid + Liquid region
      ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.7);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.4, graphX + graphW, graphY - graphH * 0.6);
      ctx.lineTo(graphX + graphW, graphY - graphH * 0.3);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.15, graphX, graphY - graphH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Solid region
      ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.4);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.15, graphX + graphW, graphY - graphH * 0.3);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.lineTo(graphX, graphY);
      ctx.closePath();
      ctx.fill();

      // Liquidus line
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.7);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.4, graphX + graphW, graphY - graphH * 0.6);
      ctx.stroke();

      // Solidus line
      ctx.strokeStyle = '#3498db';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.4);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.15, graphX + graphW, graphY - graphH * 0.3);
      ctx.stroke();

      // Current point
      const pointX = graphX + (composition / 100) * graphW;
      const pointY = graphY - (temperature / 1500) * graphH;
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('التركيب (%B)', graphX + graphW / 2, graphY + 25);
      ctx.fillText('0%', graphX, graphY + 25);
      ctx.fillText('100%', graphX + graphW, graphY + 25);

      ctx.save();
      ctx.translate(graphX - 40, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('درجة الحرارة (°C)', 0, 0);
      ctx.restore();

      // Phase labels
      ctx.font = '16px Arial';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('سائل', graphX + graphW / 2, graphY - graphH * 0.85);
      ctx.fillStyle = '#f1c40f';
      ctx.fillText('سائل + صلب', graphX + graphW / 2, graphY - graphH * 0.45);
      ctx.fillStyle = '#3498db';
      ctx.fillText('صلب', graphX + graphW / 2, graphY - graphH * 0.1);

      // Info box
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`التركيب: ${composition}% B`, 20, 30);
      ctx.fillText(`الحرارة: ${temperature}°C`, 20, 50);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, temperature, stress, composition, time]);

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(true);
    setTemperature(25);
    setStress(0);
    setComposition(50);
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
            <Layers className="h-6 w-6 text-purple-500" />
            علوم المواد
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
                  <TabsTrigger value="crystal" className="text-xs">
                    <Layers className="h-3 w-3 ml-1" />
                    بلورات
                  </TabsTrigger>
                  <TabsTrigger value="alloy" className="text-xs">
                    <Zap className="h-3 w-3 ml-1" />
                    سبائك
                  </TabsTrigger>
                  <TabsTrigger value="stress" className="text-xs">
                    <Hammer className="h-3 w-3 ml-1" />
                    إجهاد
                  </TabsTrigger>
                  <TabsTrigger value="phase" className="text-xs">
                    <Thermometer className="h-3 w-3 ml-1" />
                    أطوار
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {(simulationType === 'alloy' || simulationType === 'phase') && (
              <div className="bg-card rounded-xl p-4 border space-y-4">
                <div>
                  <label className="text-sm font-medium">درجة الحرارة: {temperature}°C</label>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={1500}
                    step={10}
                    className="mt-2"
                  />
                </div>
                {simulationType === 'phase' && (
                  <div>
                    <label className="text-sm font-medium">التركيب: {composition}% B</label>
                    <Slider
                      value={[composition]}
                      onValueChange={([v]) => setComposition(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            )}

            {simulationType === 'alloy' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">نسبة العنصر B: {composition}%</label>
                <Slider
                  value={[composition]}
                  onValueChange={([v]) => setComposition(v)}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            {simulationType === 'stress' && (
              <div className="bg-card rounded-xl p-4 border">
                <label className="text-sm font-medium">الإجهاد: {stress} MPa</label>
                <Slider
                  value={[stress]}
                  onValueChange={([v]) => setStress(v)}
                  min={0}
                  max={100}
                  step={1}
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
              <h3 className="font-semibold mb-2">المفاهيم العلمية</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                {simulationType === 'crystal' && (
                  <>
                    <p>• <strong>BCC:</strong> مكعب مركزي الجسم - 2 ذرة/خلية</p>
                    <p>• <strong>FCC:</strong> مكعب مركزي الوجوه - 4 ذرات/خلية</p>
                    <p>• <strong>HCP:</strong> سداسي مكتظ - 6 ذرات/خلية</p>
                  </>
                )}
                {simulationType === 'alloy' && (
                  <>
                    <p>• السبائك تجمع خصائص عناصر مختلفة</p>
                    <p>• المحلول الصلب البديلي والخلالي</p>
                    <p>• التركيب يؤثر على الخصائص الميكانيكية</p>
                  </>
                )}
                {simulationType === 'stress' && (
                  <>
                    <p>• <strong>قانون هوك:</strong> σ = E × ε</p>
                    <p>• المنطقة المرنة: تشوه قابل للاسترجاع</p>
                    <p>• المنطقة اللدنة: تشوه دائم</p>
                  </>
                )}
                {simulationType === 'phase' && (
                  <>
                    <p>• خط السيولة: بداية التجمد</p>
                    <p>• خط الصلابة: نهاية التجمد</p>
                    <p>• قاعدة الرافعة لحساب النسب</p>
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

export default MaterialsScienceSimulation;
