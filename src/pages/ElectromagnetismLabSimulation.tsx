import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Magnet, Compass, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FieldLine {
  points: { x: number; y: number }[];
}

const ElectromagnetismLabSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [current, setCurrent] = useState(5);
  const [wireType, setWireType] = useState<'straight' | 'loop' | 'solenoid'>('straight');
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [time, setTime] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(0);

  // Calculate magnetic field at a point
  const calculateMagneticField = useCallback((x: number, y: number, wireX: number, wireY: number): { bx: number; by: number } => {
    const mu0 = 4 * Math.PI * 1e-7;
    const dx = x - wireX;
    const dy = y - wireY;
    const r = Math.sqrt(dx * dx + dy * dy);
    
    if (r < 10) return { bx: 0, by: 0 };
    
    const B = (mu0 * current) / (2 * Math.PI * r) * 1e6;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    
    return {
      bx: B * Math.cos(angle),
      by: B * Math.sin(angle)
    };
  }, [current]);

  // Generate field lines
  const generateFieldLines = useCallback((centerX: number, centerY: number): FieldLine[] => {
    const lines: FieldLine[] = [];
    const numLines = 8;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * 2 * Math.PI;
      const radius = 30 + Math.abs(current) * 10;
      const points: { x: number; y: number }[] = [];
      
      for (let j = 0; j <= 36; j++) {
        const theta = (j / 36) * 2 * Math.PI + angle;
        points.push({
          x: centerX + radius * Math.cos(theta),
          y: centerY + radius * Math.sin(theta)
        });
      }
      lines.push({ points });
    }
    
    return lines;
  }, [current]);

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

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw based on wire type
      if (wireType === 'straight') {
        // Draw wire
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Draw current direction indicator
        ctx.fillStyle = '#fbbf24';
        const arrowY = centerY + Math.sin(time * 3) * 50;
        ctx.beginPath();
        ctx.moveTo(centerX - 15, arrowY + 20);
        ctx.lineTo(centerX, arrowY);
        ctx.lineTo(centerX + 15, arrowY + 20);
        ctx.fill();

        // Draw magnetic field lines (circles)
        if (showFieldLines) {
          for (let r = 40; r <= 200; r += 40) {
            const intensity = Math.max(0.2, 1 - r / 250);
            ctx.strokeStyle = `rgba(147, 51, 234, ${intensity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();

            // Direction arrows on circles
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2) {
              const ax = centerX + r * Math.cos(angle + time * 0.5);
              const ay = centerY + r * Math.sin(angle + time * 0.5);
              const direction = current > 0 ? 1 : -1;
              
              ctx.save();
              ctx.translate(ax, ay);
              ctx.rotate(angle + time * 0.5 + direction * Math.PI / 2);
              ctx.fillStyle = `rgba(167, 139, 250, ${intensity})`;
              ctx.beginPath();
              ctx.moveTo(0, -8);
              ctx.lineTo(8, 8);
              ctx.lineTo(-8, 8);
              ctx.fill();
              ctx.restore();
            }
          }
        }

        // Calculate field strength at specific point
        const fieldPoint = { x: centerX + 100, y: centerY };
        const field = calculateMagneticField(fieldPoint.x, fieldPoint.y, centerX, centerY);
        setMagneticFieldStrength(Math.sqrt(field.bx * field.bx + field.by * field.by));

      } else if (wireType === 'loop') {
        // Draw circular loop
        const loopRadius = 80;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, loopRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Current direction arrows on loop
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * 2 * Math.PI + time * 0.3;
          const ax = centerX + loopRadius * Math.cos(angle);
          const ay = centerY + loopRadius * Math.sin(angle);
          
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(6, 6);
          ctx.lineTo(-6, 6);
          ctx.fill();
          ctx.restore();
        }

        // Magnetic field lines through center
        if (showFieldLines) {
          const fieldStrength = current * 0.5;
          
          // Field lines going up/down through center
          for (let offset = -40; offset <= 40; offset += 20) {
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.6 - Math.abs(offset) / 100})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let t = -150; t <= 150; t += 5) {
              const spread = Math.abs(t) / 150;
              const x = centerX + offset * (1 + spread * 0.5);
              const y = centerY + t;
              
              if (t === -150) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }

      } else if (wireType === 'solenoid') {
        // Draw solenoid (multiple loops)
        const numLoops = 8;
        const loopSpacing = 30;
        const loopRadius = 50;
        const startX = centerX - (numLoops * loopSpacing) / 2;

        for (let i = 0; i < numLoops; i++) {
          const loopX = startX + i * loopSpacing;
          
          // Draw ellipse for each loop
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(loopX, centerY, 10, loopRadius, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Connecting wires
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, centerY - loopRadius);
        ctx.lineTo(startX + (numLoops - 1) * loopSpacing, centerY - loopRadius);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(startX, centerY + loopRadius);
        ctx.lineTo(startX + (numLoops - 1) * loopSpacing, centerY + loopRadius);
        ctx.stroke();

        // Magnetic field inside solenoid
        if (showFieldLines) {
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.8)';
          ctx.lineWidth = 3;
          
          for (let offset = -30; offset <= 30; offset += 15) {
            ctx.beginPath();
            ctx.moveTo(startX - 50, centerY + offset);
            ctx.lineTo(startX + numLoops * loopSpacing + 50, centerY + offset);
            ctx.stroke();

            // Arrows
            const arrowX = centerX + Math.sin(time * 2) * 50;
            ctx.save();
            ctx.translate(arrowX, centerY + offset);
            ctx.fillStyle = 'rgba(167, 139, 250, 0.9)';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, -6);
            ctx.lineTo(-5, 6);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Draw compass needles
      if (showCompass) {
        const compassPositions = [
          { x: centerX - 150, y: centerY - 100 },
          { x: centerX + 150, y: centerY - 100 },
          { x: centerX - 150, y: centerY + 100 },
          { x: centerX + 150, y: centerY + 100 },
        ];

        compassPositions.forEach(pos => {
          const field = calculateMagneticField(pos.x, pos.y, centerX, centerY);
          const angle = Math.atan2(field.by, field.bx);

          // Compass circle
          ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Compass needle
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(angle);
          
          // North (red)
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(-5, -6);
          ctx.lineTo(-5, 6);
          ctx.fill();
          
          // South (blue)
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(5, -6);
          ctx.lineTo(5, 6);
          ctx.fill();
          
          ctx.restore();
        });
      }

      // Labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      
      if (wireType === 'straight') {
        ctx.fillText('سلك يحمل تياراً كهربائياً', centerX, 30);
        ctx.fillText('B ∝ I/r', centerX, height - 20);
      } else if (wireType === 'loop') {
        ctx.fillText('ملف دائري', centerX, 30);
        ctx.fillText('B = μ₀I/2r', centerX, height - 20);
      } else {
        ctx.fillText('ملف لولبي (سولينويد)', centerX, 30);
        ctx.fillText('B = μ₀nI', centerX, height - 20);
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
  }, [isPlaying, current, wireType, showFieldLines, showCompass, calculateMagneticField, time]);

  const resetSimulation = () => {
    setTime(0);
    setCurrent(5);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
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
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          مختبر الكهرومغناطيسية
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
              className="w-full rounded-lg bg-slate-900"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
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

            {/* Wire Type Selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع الموصل</label>
              <Tabs value={wireType} onValueChange={(v) => setWireType(v as any)}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="straight" className="text-xs">سلك مستقيم</TabsTrigger>
                  <TabsTrigger value="loop" className="text-xs">ملف دائري</TabsTrigger>
                  <TabsTrigger value="solenoid" className="text-xs">سولينويد</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Current Control */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                شدة التيار: {current.toFixed(1)} A
              </label>
              <Slider
                value={[current]}
                onValueChange={(v) => setCurrent(v[0])}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFieldLines}
                  onChange={(e) => setShowFieldLines(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">إظهار خطوط المجال</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompass}
                  onChange={(e) => setShowCompass(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">إظهار البوصلات</span>
              </label>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-800/50 border-blue-500/30 p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              المعلومات
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">شدة المجال:</span>
                <span className="text-blue-300">{magneticFieldStrength.toFixed(4)} μT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التيار:</span>
                <span className="text-yellow-300">{current.toFixed(1)} A</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed">
                {wireType === 'straight' && 
                  'المجال المغناطيسي حول سلك مستقيم يشكل دوائر متحدة المركز. يتناسب المجال طردياً مع التيار وعكسياً مع المسافة.'}
                {wireType === 'loop' && 
                  'الملف الدائري يولد مجالاً مغناطيسياً منتظماً في مركزه. يُستخدم في المحركات والمولدات الكهربائية.'}
                {wireType === 'solenoid' && 
                  'السولينويد يولد مجالاً مغناطيسياً قوياً ومنتظماً داخله. يشبه مغناطيساً ذا قطبين شمالي وجنوبي.'}
              </p>
            </div>
          </Card>

          {/* Formulas */}
          <Card className="bg-slate-800/50 border-green-500/30 p-4">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Magnet className="w-5 h-5" />
              القوانين
            </h3>
            
            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-slate-700/50 rounded text-center">
                B = μ₀I / (2πr)
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                μ₀ = 4π × 10⁻⁷ T·m/A
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                F = qv × B
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ElectromagnetismLabSimulation;
