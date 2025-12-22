import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Circle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Charge {
  id: number;
  x: number;
  y: number;
  charge: number; // positive or negative
  vx: number;
  vy: number;
}

const StaticElectricitySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, x: 300, y: 250, charge: 1, vx: 0, vy: 0 },
    { id: 2, x: 500, y: 250, charge: -1, vx: 0, vy: 0 },
  ]);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showForceVectors, setShowForceVectors] = useState(true);
  const [simulationType, setSimulationType] = useState<'coulomb' | 'electroscope' | 'vandegraaff'>('coulomb');
  const [chargeStrength, setChargeStrength] = useState(5);
  const [time, setTime] = useState(0);

  // Coulomb's constant
  const k = 8.99e9;

  // Calculate electric field at a point
  const calculateField = useCallback((x: number, y: number): { ex: number; ey: number } => {
    let ex = 0;
    let ey = 0;

    charges.forEach(charge => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r < 20) return;
      
      const E = (k * Math.abs(charge.charge) * chargeStrength) / (r * r) * 0.00001;
      const sign = charge.charge > 0 ? 1 : -1;
      
      ex += sign * E * (dx / r);
      ey += sign * E * (dy / r);
    });

    return { ex, ey };
  }, [charges, chargeStrength]);

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

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      if (simulationType === 'coulomb') {
        // Draw electric field
        if (showFieldLines) {
          const resolution = 30;
          for (let x = 0; x < width; x += resolution) {
            for (let y = 0; y < height; y += resolution) {
              const field = calculateField(x, y);
              const magnitude = Math.sqrt(field.ex * field.ex + field.ey * field.ey);
              
              if (magnitude > 0.001) {
                const normalizedEx = field.ex / magnitude;
                const normalizedEy = field.ey / magnitude;
                const length = Math.min(magnitude * 500, 20);
                
                ctx.strokeStyle = `rgba(147, 197, 253, ${Math.min(magnitude * 200, 0.6)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + normalizedEx * length, y + normalizedEy * length);
                ctx.stroke();
                
                // Arrow head
                const arrowSize = 4;
                const angle = Math.atan2(normalizedEy, normalizedEx);
                ctx.beginPath();
                ctx.moveTo(x + normalizedEx * length, y + normalizedEy * length);
                ctx.lineTo(
                  x + normalizedEx * length - arrowSize * Math.cos(angle - 0.5),
                  y + normalizedEy * length - arrowSize * Math.sin(angle - 0.5)
                );
                ctx.moveTo(x + normalizedEx * length, y + normalizedEy * length);
                ctx.lineTo(
                  x + normalizedEx * length - arrowSize * Math.cos(angle + 0.5),
                  y + normalizedEy * length - arrowSize * Math.sin(angle + 0.5)
                );
                ctx.stroke();
              }
            }
          }
        }

        // Draw field lines from charges
        charges.forEach(charge => {
          const numLines = 12;
          for (let i = 0; i < numLines; i++) {
            const startAngle = (i / numLines) * 2 * Math.PI;
            let x = charge.x + 25 * Math.cos(startAngle);
            let y = charge.y + 25 * Math.sin(startAngle);
            
            ctx.strokeStyle = charge.charge > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            for (let step = 0; step < 100; step++) {
              const field = calculateField(x, y);
              const magnitude = Math.sqrt(field.ex * field.ex + field.ey * field.ey);
              
              if (magnitude < 0.0001 || x < 0 || x > width || y < 0 || y > height) break;
              
              const direction = charge.charge > 0 ? 1 : -1;
              x += direction * (field.ex / magnitude) * 5;
              y += direction * (field.ey / magnitude) * 5;
              
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        });

        // Draw charges
        charges.forEach(charge => {
          // Glow effect
          const gradient = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, 40);
          gradient.addColorStop(0, charge.charge > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, 40, 0, 2 * Math.PI);
          ctx.fill();

          // Charge circle
          ctx.fillStyle = charge.charge > 0 ? '#ef4444' : '#3b82f6';
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, 25, 0, 2 * Math.PI);
          ctx.fill();

          // Sign
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(charge.charge > 0 ? '+' : '−', charge.x, charge.y);
        });

        // Draw force vectors
        if (showForceVectors && charges.length >= 2) {
          for (let i = 0; i < charges.length; i++) {
            for (let j = i + 1; j < charges.length; j++) {
              const c1 = charges[i];
              const c2 = charges[j];
              const dx = c2.x - c1.x;
              const dy = c2.y - c1.y;
              const r = Math.sqrt(dx * dx + dy * dy);
              
              const F = (k * Math.abs(c1.charge * c2.charge) * chargeStrength * chargeStrength) / (r * r) * 0.0001;
              const isRepulsive = c1.charge * c2.charge > 0;
              
              // Draw force on charge 1
              const forceLength = Math.min(F * 100, 80);
              const angle = Math.atan2(dy, dx);
              const direction = isRepulsive ? -1 : 1;
              
              ctx.strokeStyle = isRepulsive ? '#ef4444' : '#22c55e';
              ctx.lineWidth = 3;
              
              // Force on c1
              ctx.beginPath();
              ctx.moveTo(c1.x, c1.y);
              ctx.lineTo(
                c1.x + direction * forceLength * Math.cos(angle),
                c1.y + direction * forceLength * Math.sin(angle)
              );
              ctx.stroke();
              
              // Force on c2
              ctx.beginPath();
              ctx.moveTo(c2.x, c2.y);
              ctx.lineTo(
                c2.x - direction * forceLength * Math.cos(angle),
                c2.y - direction * forceLength * Math.sin(angle)
              );
              ctx.stroke();
            }
          }
        }

        // Coulomb's law formula
        if (charges.length >= 2) {
          const dx = charges[1].x - charges[0].x;
          const dy = charges[1].y - charges[0].y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const F = (k * chargeStrength * chargeStrength) / (r * r);
          
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`F = k × q₁ × q₂ / r² = ${F.toExponential(2)} N`, width / 2, height - 20);
        }

      } else if (simulationType === 'electroscope') {
        // Electroscope simulation
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw metal sphere on top
        ctx.fillStyle = '#a1a1aa';
        ctx.beginPath();
        ctx.arc(centerX, 100, 40, 0, 2 * Math.PI);
        ctx.fill();

        // Draw stem
        ctx.fillStyle = '#71717a';
        ctx.fillRect(centerX - 5, 140, 10, 150);

        // Draw leaves (gold foil)
        const chargeEffect = chargeStrength * 3;
        const leafAngle = Math.min(chargeEffect, 45) * (Math.PI / 180);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        
        // Left leaf
        ctx.beginPath();
        ctx.moveTo(centerX, 290);
        ctx.lineTo(
          centerX - Math.sin(leafAngle) * 100,
          290 + Math.cos(leafAngle) * 100
        );
        ctx.stroke();
        
        // Right leaf
        ctx.beginPath();
        ctx.moveTo(centerX, 290);
        ctx.lineTo(
          centerX + Math.sin(leafAngle) * 100,
          290 + Math.cos(leafAngle) * 100
        );
        ctx.stroke();

        // Glass jar
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 100, 200);
        ctx.lineTo(centerX - 100, 450);
        ctx.lineTo(centerX + 100, 450);
        ctx.lineTo(centerX + 100, 200);
        ctx.stroke();

        // Charged rod approaching
        const rodX = centerX + 200 + Math.sin(time) * 50;
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(rodX - 60, 80, 120, 30);
        
        // Show + charges on rod
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        for (let i = 0; i < 4; i++) {
          ctx.fillText('+', rodX - 45 + i * 30, 100);
        }

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('الكاشف الكهربائي', centerX, 30);

      } else if (simulationType === 'vandegraaff') {
        // Van de Graaff generator
        const centerX = width / 2;
        const baseY = height - 100;

        // Draw column
        ctx.fillStyle = '#52525b';
        ctx.fillRect(centerX - 30, 150, 60, baseY - 150);

        // Draw dome
        const gradient = ctx.createRadialGradient(centerX, 100, 0, centerX, 100, 100);
        gradient.addColorStop(0, '#a1a1aa');
        gradient.addColorStop(1, '#52525b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, 100, 100, 0, 2 * Math.PI);
        ctx.fill();

        // Draw belt
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, 100);
        ctx.lineTo(centerX - 10, baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 10, 100);
        ctx.lineTo(centerX + 10, baseY);
        ctx.stroke();

        // Moving charges on belt
        for (let i = 0; i < 8; i++) {
          const y = (100 + ((time * 100 + i * 60) % (baseY - 100)));
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('+', centerX - 10, y);
        }

        // Sparks from dome
        if (chargeStrength > 5) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          
          for (let i = 0; i < 5; i++) {
            const sparkAngle = (i / 5) * Math.PI - Math.PI / 2 + Math.sin(time * 10 + i) * 0.2;
            const sparkLength = 30 + Math.random() * 50 * (chargeStrength / 10);
            
            ctx.beginPath();
            ctx.moveTo(centerX + 100 * Math.cos(sparkAngle), 100 + 100 * Math.sin(sparkAngle));
            
            let x = centerX + 100 * Math.cos(sparkAngle);
            let y = 100 + 100 * Math.sin(sparkAngle);
            
            for (let j = 0; j < 5; j++) {
              x += (Math.cos(sparkAngle) + (Math.random() - 0.5)) * sparkLength / 5;
              y += (Math.sin(sparkAngle) + (Math.random() - 0.5)) * sparkLength / 5;
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }

        // Accumulated charges on dome
        for (let i = 0; i < chargeStrength; i++) {
          const angle = (i / chargeStrength) * 2 * Math.PI + time;
          const chargeX = centerX + 85 * Math.cos(angle);
          const chargeY = 100 + 85 * Math.sin(angle);
          
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('+', chargeX, chargeY + 5);
        }

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('مولد فان دي غراف', centerX, 30);
        ctx.font = '12px Arial';
        ctx.fillText(`الشحنة المتراكمة: ${(chargeStrength * 10).toFixed(0)} μC`, centerX, baseY + 50);
      }

      setTime(prev => prev + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, charges, showFieldLines, showForceVectors, simulationType, chargeStrength, calculateField, time]);

  const addCharge = (positive: boolean) => {
    const newCharge: Charge = {
      id: Date.now(),
      x: 400 + Math.random() * 200 - 100,
      y: 250 + Math.random() * 100 - 50,
      charge: positive ? 1 : -1,
      vx: 0,
      vy: 0,
    };
    setCharges([...charges, newCharge]);
  };

  const resetSimulation = () => {
    setTime(0);
    setCharges([
      { id: 1, x: 300, y: 250, charge: 1, vx: 0, vy: 0 },
      { id: 2, x: 500, y: 250, charge: -1, vx: 0, vy: 0 },
    ]);
    setChargeStrength(5);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/scientific-simulations')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          العودة
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
          محاكاة الكهرباء الساكنة
        </h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-yellow-500/30 p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-lg bg-slate-900"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              {simulationType === 'coulomb' && (
                <>
                  <Button
                    onClick={() => addCharge(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    + شحنة موجبة
                  </Button>
                  <Button
                    onClick={() => addCharge(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    − شحنة سالبة
                  </Button>
                </>
              )}
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-yellow-500 text-yellow-400"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-yellow-500/30 p-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              لوحة التحكم
            </h3>

            {/* Simulation Type */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="coulomb" className="text-xs">كولوم</TabsTrigger>
                  <TabsTrigger value="electroscope" className="text-xs">كاشف</TabsTrigger>
                  <TabsTrigger value="vandegraaff" className="text-xs">مولد</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Charge Strength */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                شدة الشحنة: {chargeStrength.toFixed(1)} μC
              </label>
              <Slider
                value={[chargeStrength]}
                onValueChange={(v) => setChargeStrength(v[0])}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {simulationType === 'coulomb' && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFieldLines}
                    onChange={(e) => setShowFieldLines(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-300">خطوط المجال الكهربائي</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showForceVectors}
                    onChange={(e) => setShowForceVectors(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-300">متجهات القوة</span>
                </label>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-800/50 border-red-500/30 p-4">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              المعلومات
            </h3>
            
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed">
                {simulationType === 'coulomb' && 
                  'قانون كولوم: القوة بين شحنتين تتناسب طردياً مع حاصل ضرب الشحنتين وعكسياً مع مربع المسافة بينهما.'}
                {simulationType === 'electroscope' && 
                  'الكاشف الكهربائي: جهاز للكشف عن الشحنة الكهربائية. ينفصل ورقاه عند شحنه بسبب التنافر.'}
                {simulationType === 'vandegraaff' && 
                  'مولد فان دي غراف: يولد شحنات كهربائية عالية عن طريق نقل الشحنات عبر حزام متحرك إلى قبة معدنية.'}
              </p>
            </div>
          </Card>

          {/* Formulas */}
          <Card className="bg-slate-800/50 border-blue-500/30 p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Circle className="w-5 h-5" />
              القوانين
            </h3>
            
            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-slate-700/50 rounded text-center">
                F = k × q₁ × q₂ / r²
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                k = 8.99 × 10⁹ N·m²/C²
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                E = F / q = k × Q / r²
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaticElectricitySimulation;
