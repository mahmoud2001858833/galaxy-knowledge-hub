import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Battery, Settings, Lightbulb, HelpCircle } from 'lucide-react';
import StarField from '@/components/StarField';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const ElectrochemistrySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'galvanic' | 'electrolysis' | 'corrosion' | 'fuel'>('galvanic');
  const [voltage, setVoltage] = useState(1.1);
  const [time, setTime] = useState(0);

  const quizQuestions = [
    {
      question: 'في الخلية الجلفانية، أين يحدث الأكسدة؟',
      options: ['الكاثود', 'الأنود', 'الجسر الملحي', 'المحلول'],
      correctIndex: 1,
      explanation: 'الأكسدة تحدث عند الأنود (القطب السالب) حيث تفقد الذرات إلكترونات'
    },
    {
      question: 'ما هو ناتج التحليل الكهربائي للماء؟',
      options: ['أكسجين فقط', 'هيدروجين فقط', 'أكسجين وهيدروجين', 'بخار ماء'],
      correctIndex: 2,
      explanation: 'التحليل الكهربائي للماء ينتج غاز الهيدروجين عند الكاثود والأكسجين عند الأنود'
    },
    {
      question: 'ما هي المادة الناتجة من صدأ الحديد؟',
      options: ['Fe₂O₃', 'FeO', 'Fe₃O₄', 'Fe(OH)₂'],
      correctIndex: 0,
      explanation: 'الصدأ هو أكسيد الحديد الثلاثي Fe₂O₃ المائي (الصدأ الأحمر)'
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      // Enhanced background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a1628');
      bgGradient.addColorStop(1, '#1a2a4a');
      ctx.fillStyle = bgGradient;
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
      const cellY = 130;
      const cellH = 220;

      // Enhanced beakers with gradient
      const leftBeakerGradient = ctx.createLinearGradient(leftX - 85, 0, leftX + 85, 0);
      leftBeakerGradient.addColorStop(0, 'rgba(100, 150, 255, 0.2)');
      leftBeakerGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.4)');
      leftBeakerGradient.addColorStop(1, 'rgba(100, 150, 255, 0.2)');

      ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(leftX - 85, cellY, 170, cellH);
      ctx.fillStyle = leftBeakerGradient;
      ctx.fillRect(leftX - 82, cellY + 3, 164, cellH - 6);

      const rightBeakerGradient = ctx.createLinearGradient(rightX - 85, 0, rightX + 85, 0);
      rightBeakerGradient.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
      rightBeakerGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)');
      rightBeakerGradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');

      ctx.strokeRect(rightX - 85, cellY, 170, cellH);
      ctx.fillStyle = rightBeakerGradient;
      ctx.fillRect(rightX - 82, cellY + 3, 164, cellH - 6);

      // Enhanced electrodes with 3D effect
      const zincGradient = ctx.createLinearGradient(leftX - 18, 0, leftX + 18, 0);
      zincGradient.addColorStop(0, '#666');
      zincGradient.addColorStop(0.5, '#999');
      zincGradient.addColorStop(1, '#666');
      ctx.fillStyle = zincGradient;
      ctx.fillRect(leftX - 18, cellY - 35, 36, cellH + 25);

      const copperGradient = ctx.createLinearGradient(rightX - 18, 0, rightX + 18, 0);
      copperGradient.addColorStop(0, '#a05a2c');
      copperGradient.addColorStop(0.5, '#cd7f32');
      copperGradient.addColorStop(1, '#a05a2c');
      ctx.fillStyle = copperGradient;
      ctx.fillRect(rightX - 18, cellY - 35, 36, cellH + 25);

      // Enhanced salt bridge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftX + 65, cellY + 50);
      ctx.quadraticCurveTo(canvas.width / 2, cellY - 60, rightX - 65, cellY + 50);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(150, 180, 255, 0.4)';
      ctx.lineWidth = 12;
      ctx.stroke();

      // Moving ions with glow
      if (isPlaying) {
        for (let i = 0; i < 12; i++) {
          const progress = ((time * 0.5 + i * 0.08) % 1);
          const ionX = leftX + 65 + progress * (rightX - leftX - 130);
          const ionY = cellY + 50 - Math.sin(progress * Math.PI) * 90;

          ctx.shadowColor = i % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
          ctx.shadowBlur = 8;
          ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
          ctx.beginPath();
          ctx.arc(ionX, ionY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(i % 2 === 0 ? '+' : '-', ionX, ionY + 3);
        }
      }

      // Enhanced wire
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(leftX, cellY - 35);
      ctx.lineTo(leftX, cellY - 90);
      ctx.lineTo(rightX, cellY - 90);
      ctx.lineTo(rightX, cellY - 35);
      ctx.stroke();

      // Enhanced moving electrons
      if (isPlaying) {
        for (let i = 0; i < 8; i++) {
          const progress = ((time + i * 0.12) % 1);
          const electronX = leftX + progress * (rightX - leftX);

          ctx.shadowColor = '#ffeb3b';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffeb3b';
          ctx.beginPath();
          ctx.arc(electronX, cellY - 90, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('e⁻', electronX, cellY - 87);
        }
      }

      // Enhanced voltmeter
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cellY - 90, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${voltage.toFixed(2)}V`, canvas.width / 2, cellY - 85);

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Zn (أنود)', leftX, cellY + cellH + 30);
      ctx.fillText('Cu (كاثود)', rightX, cellY + cellH + 30);

      // Reactions
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Zn → Zn²⁺ + 2e⁻', leftX, cellY + cellH + 55);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Cu²⁺ + 2e⁻ → Cu', rightX, cellY + cellH + 55);
    };

    const drawElectrolysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const cellY = 120;
      const cellH = 260;

      // Container with gradient
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.strokeRect(centerX - 160, cellY, 320, cellH);

      const solutionGradient = ctx.createLinearGradient(0, cellY, 0, cellY + cellH);
      solutionGradient.addColorStop(0, 'rgba(150, 200, 255, 0.3)');
      solutionGradient.addColorStop(1, 'rgba(150, 200, 255, 0.5)');
      ctx.fillStyle = solutionGradient;
      ctx.fillRect(centerX - 157, cellY + 3, 314, cellH - 6);

      // Electrodes
      ctx.fillStyle = '#444';
      ctx.fillRect(centerX - 110, cellY - 50, 25, cellH + 40);
      ctx.fillRect(centerX + 85, cellY - 50, 25, cellH + 40);

      // Power source
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(centerX - 50, 25, 100, 60, 8);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(centerX - 42, 32, 35, 46);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX + 7, 32, 35, 46);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('+', centerX - 25, 62);
      ctx.fillText('-', centerX + 25, 62);

      // Wires
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 97, cellY - 50);
      ctx.lineTo(centerX - 97, 55);
      ctx.lineTo(centerX - 42, 55);
      ctx.moveTo(centerX + 97, cellY - 50);
      ctx.lineTo(centerX + 97, 55);
      ctx.lineTo(centerX + 42, 55);
      ctx.stroke();

      // Enhanced bubbles
      if (isPlaying) {
        // H2 bubbles (cathode - left)
        for (let i = 0; i < 15; i++) {
          const x = centerX - 97 + Math.sin(time * 2 + i) * 12;
          const y = cellY + cellH - 25 - ((time * 60 + i * 25) % (cellH - 50));
          const size = 4 + Math.random() * 5;

          ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // O2 bubbles (anode - right)
        for (let i = 0; i < 10; i++) {
          const x = centerX + 97 + Math.sin(time * 2 + i) * 12;
          const y = cellY + cellH - 25 - ((time * 40 + i * 30) % (cellH - 50));
          const size = 5 + Math.random() * 6;

          ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('كاثود (−)', centerX - 97, cellY + cellH + 30);
      ctx.fillText('أنود (+)', centerX + 97, cellY + cellH + 30);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('H₂ ↑', centerX - 97, cellY + cellH + 55);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('O₂ ↑', centerX + 97, cellY + cellH + 55);

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText('2H₂O → 2H₂ + O₂', centerX, cellY + cellH + 80);
    };

    const drawCorrosion = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Iron bar with gradient
      const ironGradient = ctx.createLinearGradient(centerX - 130, centerY - 45, centerX + 130, centerY + 45);
      ironGradient.addColorStop(0, '#555');
      ironGradient.addColorStop(0.5, '#777');
      ironGradient.addColorStop(1, '#555');
      ctx.fillStyle = ironGradient;
      ctx.beginPath();
      ctx.roundRect(centerX - 130, centerY - 45, 260, 90, 8);
      ctx.fill();

      // Rust spots with animation
      const rustSpots = Math.floor(time * 2) % 25;
      for (let i = 0; i < rustSpots; i++) {
        const x = centerX - 110 + (i * 47) % 220;
        const y = centerY - 35 + (i * 23) % 70;
        const size = 6 + (i * 7) % 18;

        const rustGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        rustGradient.addColorStop(0, '#8b4513');
        rustGradient.addColorStop(1, '#5d2906');
        ctx.fillStyle = rustGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water droplet
      ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 70, 90, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(100, 180, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Oxygen molecules animation
      if (isPlaying) {
        for (let i = 0; i < 6; i++) {
          const angle = time + i * 1.0;
          const x = centerX + Math.cos(angle) * 70;
          const y = centerY - 90 + Math.sin(angle * 0.5) * 25;

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.arc(x + 14, y, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('O₂', x + 7, y + 4);
        }
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('تآكل الحديد (الصدأ)', centerX, 60);

      ctx.font = '15px monospace';
      ctx.fillText('4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃', centerX, canvas.height - 70);
      ctx.fillStyle = '#8b4513';
      ctx.fillText('2Fe(OH)₃ → Fe₂O₃·3H₂O (صدأ)', centerX, canvas.height - 45);
    };

    const drawFuelCell = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const cellY = 90;
      const cellH = 300;

      // Membrane
      ctx.fillStyle = '#333';
      ctx.fillRect(centerX - 6, cellY, 12, cellH);

      // Anode side
      const anodeGradient = ctx.createLinearGradient(centerX - 160, 0, centerX, 0);
      anodeGradient.addColorStop(0, 'rgba(100, 200, 100, 0.2)');
      anodeGradient.addColorStop(1, 'rgba(100, 200, 100, 0.4)');
      ctx.fillStyle = anodeGradient;
      ctx.fillRect(centerX - 160, cellY, 154, cellH);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 160, cellY, 154, cellH);

      // Cathode side
      const cathodeGradient = ctx.createLinearGradient(centerX, 0, centerX + 160, 0);
      cathodeGradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
      cathodeGradient.addColorStop(1, 'rgba(100, 150, 255, 0.2)');
      ctx.fillStyle = cathodeGradient;
      ctx.fillRect(centerX + 6, cellY, 154, cellH);
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(centerX + 6, cellY, 154, cellH);

      // H2 molecules
      if (isPlaying) {
        for (let i = 0; i < 10; i++) {
          const x = centerX - 140 + Math.sin(time + i) * 35;
          const y = cellY + 35 + i * 28;

          ctx.fillStyle = '#4CAF50';
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.arc(x + 15, y, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('H₂', x + 7, y + 3);
        }

        // Protons through membrane
        for (let i = 0; i < 6; i++) {
          const progress = ((time * 0.3 + i * 0.15) % 1);
          const x = centerX - 6 + progress * 12;
          const y = cellY + 50 + i * 45;

          ctx.shadowColor = '#ff9800';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#ff9800';
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px Arial';
          ctx.fillText('H⁺', x, y + 3);
        }

        // O2 molecules
        for (let i = 0; i < 5; i++) {
          const x = centerX + 110 + Math.sin(time * 0.8 + i) * 25;
          const y = cellY + 50 + i * 55;

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x, y, 11, 0, Math.PI * 2);
          ctx.arc(x + 18, y, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Arial';
          ctx.fillText('O₂', x + 9, y + 4);
        }

        // Water output
        for (let i = 0; i < 4; i++) {
          const x = centerX + 85 + i * 25;
          const y = cellY + cellH - 45 + Math.sin(time + i) * 12;

          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px Arial';
          ctx.fillText('H₂O', x, y + 3);
        }
      }

      // Labels
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('H₂', centerX - 85, cellY - 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('O₂', centerX + 85, cellY - 20);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('H₂O', centerX + 85, cellY + cellH + 25);

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('أنود', centerX - 85, cellY + cellH + 50);
      ctx.fillText('كاثود', centerX + 85, cellY + cellH + 50);

      // Reactions
      ctx.font = '12px monospace';
      ctx.fillText('2H₂ → 4H⁺ + 4e⁻', centerX - 85, cellY + cellH + 70);
      ctx.fillText('O₂ + 4H⁺ + 4e⁻ → 2H₂O', centerX + 85, cellY + cellH + 70);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, voltage, time]);

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/30 to-slate-900 text-white p-4">
      <StarField />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          ⚡ مختبر الكيمياء الكهربائية
        </h1>
        <div className="w-24" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SimulationCard color="yellow" delay={0.1}>
            <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
            <SimulationControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={resetSimulation}
              primaryColor="yellow"
            />
          </SimulationCard>

          <SimulationCard title="المبادئ الكهروكيميائية" icon={Lightbulb} color="yellow" delay={0.2}>
            <InfoSection
              formulas={[
                { name: 'جهد الخلية', formula: 'E°cell = E°cathode - E°anode' },
                { name: 'طاقة جبس الحرة', formula: 'ΔG = -nFE' },
                { name: 'قانون فاراداي', formula: 'm = (Q × M) / (n × F)' }
              ]}
              facts={[
                'الخلية الجلفانية تحول الطاقة الكيميائية إلى كهربائية',
                'التحليل الكهربائي يتطلب طاقة كهربائية لإجراء تفاعل غير تلقائي',
                'خلايا الوقود تُعتبر مصدر طاقة نظيف للمستقبل'
              ]}
            />
          </SimulationCard>
        </div>

        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم" icon={Settings} color="yellow" delay={0.15}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">نوع الخلية</label>
                <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                  <TabsList className="grid grid-cols-2 bg-slate-700">
                    <TabsTrigger value="galvanic" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      جلفانية
                    </TabsTrigger>
                    <TabsTrigger value="electrolysis" className="text-xs">تحليل</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 bg-slate-700 mt-1">
                    <TabsTrigger value="corrosion" className="text-xs">تآكل</TabsTrigger>
                    <TabsTrigger value="fuel" className="text-xs">وقود</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {simulationType === 'galvanic' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">فرق الجهد: {voltage.toFixed(2)} V</label>
                  <Slider value={[voltage]} onValueChange={([v]) => setVoltage(v)} min={0.5} max={2} step={0.1} />
                </div>
              )}
            </div>
          </SimulationCard>

          <SimulationCard title="معلومات الخلية" icon={Battery} color="yellow" delay={0.2}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-400">نوع الخلية:</span>
                <span className="text-yellow-300 font-bold">
                  {simulationType === 'galvanic' ? 'جلفانية' : 
                   simulationType === 'electrolysis' ? 'تحليل كهربائي' :
                   simulationType === 'corrosion' ? 'تآكل' : 'خلية وقود'}
                </span>
              </div>
              {simulationType === 'galvanic' && (
                <>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">الأنود:</span>
                    <span className="text-red-300 font-bold">Zn (زنك)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">الكاثود:</span>
                    <span className="text-green-300 font-bold">Cu (نحاس)</span>
                  </div>
                </>
              )}
            </div>
          </SimulationCard>

          <SimulationCard title="اختبر معلوماتك" icon={HelpCircle} color="yellow" delay={0.25}>
            <QuizSection questions={quizQuestions} />
          </SimulationCard>
        </div>
      </div>
    </div>
  );
};

export default ElectrochemistrySimulation;
