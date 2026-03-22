import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Atom, Eye, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

const QuantumMechanicsSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'doubleslit' | 'tunneling' | 'superposition'>('doubleslit');
  const [slitWidth, setSlitWidth] = useState(10);
  const [slitSeparation, setSlitSeparation] = useState(60);
  const [particleWavelength, setParticleWavelength] = useState(5);
  const [barrierHeight, setBarrierHeight] = useState(50);
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [detectionPattern, setDetectionPattern] = useState<number[]>(new Array(800).fill(0));
  const [isObserving, setIsObserving] = useState(false);

  // Initialize particles
  useEffect(() => {
    if (simulationType === 'doubleslit') {
      setDetectionPattern(new Array(800).fill(0));
    }
  }, [simulationType]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localParticles = [...particles];

    const animate = () => {
      if (!isPlaying) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, width, height);

      if (simulationType === 'doubleslit') {
        // Double-slit experiment
        const slitX = 300;
        const screenX = 700;
        const slit1Y = centerY - slitSeparation / 2;
        const slit2Y = centerY + slitSeparation / 2;

        // Draw barrier
        ctx.fillStyle = '#374151';
        ctx.fillRect(slitX - 10, 0, 20, slit1Y - slitWidth / 2);
        ctx.fillRect(slitX - 10, slit1Y + slitWidth / 2, 20, slit2Y - slitWidth / 2 - slit1Y - slitWidth / 2);
        ctx.fillRect(slitX - 10, slit2Y + slitWidth / 2, 20, height - slit2Y - slitWidth / 2);

        // Draw slits
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(slitX - 10, slit1Y - slitWidth / 2, 20, slitWidth);
        ctx.fillRect(slitX - 10, slit2Y - slitWidth / 2, 20, slitWidth);

        // Draw screen
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(screenX, 0, 10, height);

        // Emit new particle
        if (Math.random() < 0.1) {
          localParticles.push({
            x: 50,
            y: centerY + (Math.random() - 0.5) * 100,
            vx: 3,
            vy: 0,
            phase: Math.random() * Math.PI * 2
          });
        }

        // Update and draw particles
        localParticles = localParticles.filter(p => {
          p.x += p.vx;
          p.y += p.vy;

          // Wave behavior through slits
          if (p.x >= slitX - 10 && p.x <= slitX + 10) {
            const dist1 = Math.abs(p.y - slit1Y);
            const dist2 = Math.abs(p.y - slit2Y);
            
            if (dist1 > slitWidth / 2 && dist2 > slitWidth / 2) {
              return false; // Particle absorbed by barrier
            }
          }

          // After passing slits, apply wave interference
          if (p.x > slitX + 10 && p.x < screenX) {
            if (!isObserving) {
              // Quantum behavior: wave interference
              const d1 = Math.sqrt((p.x - slitX) ** 2 + (p.y - slit1Y) ** 2);
              const d2 = Math.sqrt((p.x - slitX) ** 2 + (p.y - slit2Y) ** 2);
              const phaseDiff = (d1 - d2) * 2 * Math.PI / (particleWavelength * 10);
              
              p.vy += Math.sin(phaseDiff + p.phase) * 0.2;
            }
          }

          // Detect on screen
          if (p.x >= screenX) {
            const yIndex = Math.floor(p.y);
            if (yIndex >= 0 && yIndex < height) {
              const newPattern = [...detectionPattern];
              newPattern[yIndex] = (newPattern[yIndex] || 0) + 1;
              setDetectionPattern(newPattern);
            }
            return false;
          }

          // Draw particle/wave
          if (isObserving || p.x < slitX) {
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Wave representation
            const waveWidth = 40;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, waveWidth);
            gradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
            gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.3)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, waveWidth, 0, 2 * Math.PI);
            ctx.fill();
          }

          return p.x < width;
        });

        // Draw detection pattern
        const maxCount = Math.max(...detectionPattern, 1);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = 0; y < height; y++) {
          const intensity = (detectionPattern[y] || 0) / maxCount;
          const x = screenX + 20 + intensity * 70;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('تجربة الشق المزدوج', width / 2, 30);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('مصدر الجسيمات', 50, height - 20);
        ctx.fillText('الشقان', slitX, height - 20);
        ctx.fillText('شاشة الكشف', screenX + 40, height - 20);

        // Observer effect indicator
        ctx.fillStyle = isObserving ? '#ef4444' : '#22c55e';
        ctx.beginPath();
        ctx.arc(slitX, 50, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Arial';
        ctx.fillText(isObserving ? 'يُراقب' : 'لا يُراقب', slitX, 70);

      } else if (simulationType === 'tunneling') {
        // Quantum tunneling
        const barrierX = 350;
        const barrierWidth = 60;
        
        // Draw potential barrier
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(barrierX, centerY - barrierHeight * 2, barrierWidth, barrierHeight * 4);
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(barrierX, centerY);
        ctx.lineTo(barrierX, centerY - barrierHeight * 2);
        ctx.lineTo(barrierX + barrierWidth, centerY - barrierHeight * 2);
        ctx.lineTo(barrierX + barrierWidth, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Incoming wave
        const waveSpeed = 2;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < barrierX; x++) {
          const amplitude = 50;
          const k = 2 * Math.PI / 50;
          const y = centerY - amplitude * Math.sin(k * x - time * waveSpeed);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave inside barrier (decaying)
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.beginPath();
        for (let x = barrierX; x < barrierX + barrierWidth; x++) {
          const decay = Math.exp(-(x - barrierX) * barrierHeight / 1000);
          const amplitude = 50 * decay;
          const k = 2 * Math.PI / 50;
          const y = centerY - amplitude * Math.sin(k * x - time * waveSpeed);
          if (x === barrierX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Transmitted wave
        const transmissionCoeff = Math.exp(-barrierWidth * barrierHeight / 500);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = barrierX + barrierWidth; x < width; x++) {
          const amplitude = 50 * transmissionCoeff;
          const k = 2 * Math.PI / 50;
          const y = centerY - amplitude * Math.sin(k * x - time * waveSpeed);
          if (x === barrierX + barrierWidth) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Probability visualization
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`احتمال النفاذ: ${(transmissionCoeff * 100).toFixed(1)}%`, width / 2, height - 60);

        // Labels
        ctx.font = 'bold 16px Arial';
        ctx.fillText('النفق الكمي (Quantum Tunneling)', width / 2, 30);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('موجة قادمة', 150, 50);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('موجة نافذة', 550, 50);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('حاجز الجهد', barrierX + barrierWidth / 2, centerY - barrierHeight * 2 - 15);

      } else if (simulationType === 'superposition') {
        // Quantum superposition (Schrödinger's cat concept)
        const centerX = width / 2;
        
        // Draw box
        const boxX = centerX - 150;
        const boxY = centerY - 100;
        const boxWidth = 300;
        const boxHeight = 200;
        
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Superposition visualization
        const superpositionPhase = time * 2;
        
        // Left state (alive)
        const leftOpacity = 0.3 + 0.2 * Math.sin(superpositionPhase);
        ctx.fillStyle = `rgba(34, 197, 94, ${leftOpacity})`;
        ctx.fillRect(boxX + 10, boxY + 10, boxWidth / 2 - 20, boxHeight - 20);
        ctx.fillStyle = '#22c55e';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('😺', boxX + boxWidth / 4, centerY + 15);
        ctx.font = '14px Arial';
        ctx.fillText('حي', boxX + boxWidth / 4, boxY + boxHeight - 20);

        // Right state (not alive)
        const rightOpacity = 0.3 + 0.2 * Math.cos(superpositionPhase);
        ctx.fillStyle = `rgba(239, 68, 68, ${rightOpacity})`;
        ctx.fillRect(boxX + boxWidth / 2 + 10, boxY + 10, boxWidth / 2 - 20, boxHeight - 20);
        ctx.fillStyle = '#ef4444';
        ctx.font = '40px Arial';
        ctx.fillText('💀', boxX + 3 * boxWidth / 4, centerY + 15);
        ctx.font = '14px Arial';
        ctx.fillText('ميت', boxX + 3 * boxWidth / 4, boxY + boxHeight - 20);

        // Superposition symbol
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('+', centerX, centerY + 10);

        // Wave function
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = boxX - 50; x < boxX + boxWidth + 50; x++) {
          const y = boxY - 50 + 20 * Math.sin((x - boxX) / 30 + superpositionPhase);
          if (x === boxX - 50) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Mathematical representation
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('|ψ⟩ = α|حي⟩ + β|ميت⟩', centerX, boxY + boxHeight + 50);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('قبل القياس: الحالتان موجودتان معاً', centerX, boxY + boxHeight + 80);

        // Observer button effect
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px Arial';
        ctx.fillText('اضغط "راقب" لانهيار دالة الموجة', centerX, height - 30);

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('التراكب الكمي (Quantum Superposition)', centerX, 30);
      }

      setParticles(localParticles);
      setTime(prev => prev + 0.05);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, simulationType, slitWidth, slitSeparation, particleWavelength, barrierHeight, isObserving, particles, detectionPattern, time]);

  const resetSimulation = () => {
    setTime(0);
    setParticles([]);
    setDetectionPattern(new Array(800).fill(0));
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-4">
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
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          مختبر ميكانيكا الكم
        </h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-purple-500/30 p-4">
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              {simulationType === 'doubleslit' && (
                <Button
                  onClick={() => setIsObserving(!isObserving)}
                  className={isObserving ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {isObserving ? 'إيقاف المراقبة' : 'راقب'}
                </Button>
              )}
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-purple-500 text-purple-400"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-purple-500/30 p-4">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              لوحة التحكم
            </h3>

            {/* Simulation Type */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
              <Tabs value={simulationType} onValueChange={(v) => {
                setSimulationType(v as any);
                resetSimulation();
              }}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="doubleslit" className="text-xs">الشق المزدوج</TabsTrigger>
                  <TabsTrigger value="tunneling" className="text-xs">النفق الكمي</TabsTrigger>
                  <TabsTrigger value="superposition" className="text-xs">التراكب</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'doubleslit' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-2">
                    عرض الشق: {slitWidth} px
                  </label>
                  <Slider
                    value={[slitWidth]}
                    onValueChange={(v) => setSlitWidth(v[0])}
                    min={5}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-2">
                    المسافة بين الشقين: {slitSeparation} px
                  </label>
                  <Slider
                    value={[slitSeparation]}
                    onValueChange={(v) => setSlitSeparation(v[0])}
                    min={30}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-2">
                    الطول الموجي: {particleWavelength}
                  </label>
                  <Slider
                    value={[particleWavelength]}
                    onValueChange={(v) => setParticleWavelength(v[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {simulationType === 'tunneling' && (
              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-2">
                  ارتفاع الحاجز: {barrierHeight}
                </label>
                <Slider
                  value={[barrierHeight]}
                  onValueChange={(v) => setBarrierHeight(v[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-800/50 border-pink-500/30 p-4">
            <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
              <Atom className="w-5 h-5" />
              المعلومات
            </h3>
            
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed">
                {simulationType === 'doubleslit' && 
                  'تجربة الشق المزدوج تُظهر الطبيعة الموجية للجسيمات. عند عدم المراقبة، تتداخل الموجات لتشكل نمطاً. عند المراقبة، تتصرف كجسيمات!'}
                {simulationType === 'tunneling' && 
                  'النفق الكمي يسمح للجسيم بالمرور عبر حاجز طاقة يفوق طاقته. هذا مستحيل كلاسيكياً لكنه يحدث كمياً بسبب عدم اليقين.'}
                {simulationType === 'superposition' && 
                  'التراكب الكمي: الجسيم يكون في عدة حالات معاً حتى يتم قياسه. عندها تنهار دالة الموجة لحالة واحدة.'}
              </p>
            </div>
          </Card>

          {/* Quantum Facts */}
          <Card className="bg-slate-800/50 border-blue-500/30 p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              مبادئ كمية
            </h3>
            
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 bg-slate-700/50 rounded">
                <strong>مبدأ عدم اليقين:</strong>
                <br />Δx × Δp ≥ ℏ/2
              </div>
              <div className="p-2 bg-slate-700/50 rounded">
                <strong>معادلة شرودنغر:</strong>
                <br />iℏ ∂ψ/∂t = Ĥψ
              </div>
              <div className="p-2 bg-slate-700/50 rounded">
                <strong>ثنائية موجة-جسيم:</strong>
                <br />λ = h/p
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuantumMechanicsSimulation;
