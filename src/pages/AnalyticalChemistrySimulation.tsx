import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Beaker, Droplets, Activity, Settings, Lightbulb, HelpCircle } from 'lucide-react';
import StarField from '@/components/StarField';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const AnalyticalChemistrySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'titration' | 'ph' | 'chromatography' | 'spectroscopy'>('titration');
  const [titrantVolume, setTitrantVolume] = useState(0);
  const [time, setTime] = useState(0);

  const quizQuestions = [
    {
      question: 'ما هي نقطة التكافؤ في المعايرة؟',
      options: ['نقطة بداية التفاعل', 'نقطة اكتمال التفاعل', 'نقطة تغير اللون', 'نقطة الغليان'],
      correctAnswer: 1,
      explanation: 'نقطة التكافؤ هي النقطة التي يتم فيها اكتمال التفاعل بين الحمض والقاعدة بنسب متساوية'
    },
    {
      question: 'ما هو Rf في الكروماتوغرافيا؟',
      options: ['تردد الرنين', 'معامل الانكسار', 'نسبة المسافة المقطوعة', 'مقاومة التدفق'],
      correctAnswer: 2,
      explanation: 'Rf هو نسبة المسافة التي قطعتها المادة إلى المسافة التي قطعها المذيب'
    },
    {
      question: 'ما هو قانون بير-لامبرت؟',
      options: ['A = ε × c × l', 'PV = nRT', 'E = mc²', 'F = ma'],
      correctAnswer: 0,
      explanation: 'قانون بير-لامبرت يربط الامتصاص بالتركيز وطول المسار ومعامل الامتصاص المولي'
    }
  ];

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

      if (simulationType === 'titration') {
        drawTitration(ctx, canvas);
      } else if (simulationType === 'ph') {
        drawPHMeter(ctx, canvas);
      } else if (simulationType === 'chromatography') {
        drawChromatography(ctx, canvas);
      } else if (simulationType === 'spectroscopy') {
        drawSpectroscopy(ctx, canvas);
      }

      if (isPlaying) setTime(prev => prev + 0.02);
      animationId = requestAnimationFrame(animate);
    };

    const drawTitration = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Enhanced burette with glow
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
      ctx.fillRect(canvas.width / 2 - 18, 30, 36, 200);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#88aaff';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 18, 30, 36, 200);

      // Titrant level with gradient
      const titrantLevel = 200 - titrantVolume * 4;
      const titrantGradient = ctx.createLinearGradient(0, 33, 0, 33 + titrantLevel);
      titrantGradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
      titrantGradient.addColorStop(1, 'rgba(255, 50, 50, 0.7)');
      ctx.fillStyle = titrantGradient;
      ctx.fillRect(canvas.width / 2 - 15, 33 + (200 - titrantLevel), 30, titrantLevel - 6);

      // Enhanced burette tip
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 8, 230);
      ctx.lineTo(canvas.width / 2 + 8, 230);
      ctx.lineTo(canvas.width / 2, 255);
      ctx.closePath();
      ctx.fill();

      // Animated drops with glow
      if (isPlaying && titrantVolume < 50) {
        const dropY = 255 + ((time * 100) % 75);
        if (dropY < 330) {
          ctx.shadowColor = '#ff6666';
          ctx.shadowBlur = 8;
          ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
          ctx.beginPath();
          ctx.ellipse(canvas.width / 2, dropY, 5, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Enhanced flask with 3D effect
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 85, 330);
      ctx.lineTo(canvas.width / 2 - 55, 450);
      ctx.lineTo(canvas.width / 2 + 55, 450);
      ctx.lineTo(canvas.width / 2 + 85, 330);
      ctx.stroke();

      // Solution with animated bubbles
      const pH = calculatePH(titrantVolume);
      const color = getPHColor(pH);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 70, 360);
      ctx.lineTo(canvas.width / 2 - 53, 445);
      ctx.lineTo(canvas.width / 2 + 53, 445);
      ctx.lineTo(canvas.width / 2 + 70, 360);
      ctx.closePath();
      ctx.fill();

      // Bubbles animation
      if (isPlaying) {
        for (let i = 0; i < 5; i++) {
          const bubbleX = canvas.width / 2 - 40 + Math.sin(time * 2 + i) * 30;
          const bubbleY = 440 - ((time * 30 + i * 20) % 80);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, 3 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Enhanced pH display
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width / 2 - 80, canvas.height - 90, 160, 50);
      ctx.strokeStyle = pH < 7 ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 80, canvas.height - 90, 160, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`pH = ${pH.toFixed(2)}`, canvas.width / 2, canvas.height - 55);

      // Titration curve
      drawTitrationCurve(ctx, canvas, titrantVolume, pH);
    };

    const drawTitrationCurve = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, currentVol: number, currentPH: number) => {
      const graphX = 60;
      const graphY = canvas.height - 180;
      const graphW = 180;
      const graphH = 120;

      // Graph background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(graphX - 10, graphY - graphH - 10, graphW + 30, graphH + 30);

      // Axes
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Curve
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let v = 0; v <= Math.min(currentVol, 50); v += 0.5) {
        const x = graphX + (v / 50) * graphW;
        const ph = calculatePH(v);
        const y = graphY - (ph / 14) * graphH;
        if (v === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current point
      const pointX = graphX + (currentVol / 50) * graphW;
      const pointY = graphY - (currentPH / 14) * graphH;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('حجم المعاير (mL)', graphX + graphW / 2, graphY + 15);
    };

    const drawPHMeter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Enhanced beaker with gradient
      const beakerGradient = ctx.createLinearGradient(centerX - 100, 0, centerX + 100, 0);
      beakerGradient.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
      beakerGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.4)');
      beakerGradient.addColorStop(1, 'rgba(200, 220, 255, 0.2)');
      
      ctx.strokeStyle = beakerGradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(centerX - 100, centerY - 50, 200, 180);
      ctx.stroke();

      // Dynamic solution color
      const currentPH = 7 + Math.sin(time) * 3;
      const hue = 120 - (7 - Math.sin(time) * 3) * 17;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`;
      ctx.fillRect(centerX - 97, centerY, 194, 127);

      // Enhanced pH electrode
      ctx.fillStyle = '#444';
      ctx.fillRect(centerX - 12, centerY - 120, 24, 180);
      
      const electrodeGradient = ctx.createLinearGradient(centerX - 15, 0, centerX + 15, 0);
      electrodeGradient.addColorStop(0, '#555');
      electrodeGradient.addColorStop(0.5, '#888');
      electrodeGradient.addColorStop(1, '#555');
      ctx.fillStyle = electrodeGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 60, 14, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Digital display with glow
      ctx.shadowColor = '#0f0';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#000';
      ctx.fillRect(centerX + 120, centerY - 80, 160, 90);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX + 120, centerY - 80, 160, 90);

      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentPH.toFixed(2), centerX + 200, centerY - 25);

      ctx.font = '16px Arial';
      ctx.fillText('pH', centerX + 200, centerY - 60);

      // Enhanced pH scale
      const scaleY = centerY + 160;
      for (let i = 0; i <= 14; i++) {
        const x = 100 + i * 40;
        const hue = 120 - i * 8.5;
        
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.beginPath();
        ctx.roundRect(x, scaleY, 36, 35, 4);
        ctx.fill();

        ctx.fillStyle = i < 7 ? '#fff' : '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x + 18, scaleY + 23);
      }

      // Current pH indicator
      const indicatorX = 100 + currentPH * 40 + 18;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(indicatorX, scaleY - 5);
      ctx.lineTo(indicatorX - 8, scaleY - 15);
      ctx.lineTo(indicatorX + 8, scaleY - 15);
      ctx.closePath();
      ctx.fill();
    };

    const drawChromatography = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Enhanced paper strip
      const stripGradient = ctx.createLinearGradient(canvas.width / 2 - 65, 0, canvas.width / 2 + 65, 0);
      stripGradient.addColorStop(0, '#e8e8d0');
      stripGradient.addColorStop(0.5, '#f5f5dc');
      stripGradient.addColorStop(1, '#e8e8d0');
      ctx.fillStyle = stripGradient;
      ctx.fillRect(canvas.width / 2 - 65, 50, 130, 380);

      // Solvent front with gradient
      const solventY = 50 + Math.min(time * 20, 330);
      const solventGradient = ctx.createLinearGradient(0, 50, 0, solventY);
      solventGradient.addColorStop(0, 'rgba(200, 200, 255, 0.5)');
      solventGradient.addColorStop(1, 'rgba(200, 200, 255, 0.2)');
      ctx.fillStyle = solventGradient;
      ctx.fillRect(canvas.width / 2 - 63, 50, 126, solventY - 50);

      // Solvent front line
      ctx.strokeStyle = '#88aaff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 63, solventY);
      ctx.lineTo(canvas.width / 2 + 63, solventY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Enhanced sample spots
      const samples = [
        { color: '#e74c3c', rf: 0.8, name: 'صبغة حمراء' },
        { color: '#3498db', rf: 0.5, name: 'صبغة زرقاء' },
        { color: '#f1c40f', rf: 0.3, name: 'صبغة صفراء' }
      ];

      samples.forEach((sample, i) => {
        const startX = canvas.width / 2 - 35 + i * 35;
        const startY = 400;
        const moveDistance = Math.min(time * 20 * sample.rf, 280 * sample.rf);

        // Original spot
        ctx.fillStyle = sample.color;
        ctx.beginPath();
        ctx.arc(startX, startY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Moving spot with trail
        if (moveDistance > 0) {
          // Trail
          const trailGradient = ctx.createLinearGradient(0, startY, 0, startY - moveDistance);
          trailGradient.addColorStop(0, `${sample.color}20`);
          trailGradient.addColorStop(1, `${sample.color}60`);
          ctx.fillStyle = trailGradient;
          ctx.fillRect(startX - 8, startY - moveDistance, 16, moveDistance);

          // Moving spot with glow
          ctx.shadowColor = sample.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = sample.color;
          ctx.beginPath();
          ctx.arc(startX, startY - moveDistance, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Enhanced Rf values display
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width - 200, 60, 180, 120);
      ctx.strokeStyle = '#666';
      ctx.strokeRect(canvas.width - 200, 60, 180, 120);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('قيم Rf:', canvas.width - 190, 85);

      samples.forEach((sample, i) => {
        ctx.fillStyle = sample.color;
        ctx.beginPath();
        ctx.arc(canvas.width - 180, 105 + i * 25, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`Rf = ${sample.rf}`, canvas.width - 165, 110 + i * 25);
      });

      // Formula
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Rf = d(مادة) / d(مذيب)', canvas.width / 2, canvas.height - 30);
    };

    const drawSpectroscopy = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const graphX = 80;
      const graphY = canvas.height - 80;
      const graphW = canvas.width - 160;
      const graphH = 320;

      // Graph background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(graphX - 20, graphY - graphH - 20, graphW + 50, graphH + 50);

      // Enhanced axes
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Spectrum with rainbow gradient
      for (let x = 0; x < graphW; x++) {
        const wavelength = 380 + (x / graphW) * 400;
        const absorbance = Math.sin(wavelength * 0.05 + time) * 0.3 +
          Math.exp(-Math.pow((wavelength - 450) / 30, 2)) * 0.8 +
          Math.exp(-Math.pow((wavelength - 550) / 40, 2)) * 0.5;

        const hue = ((wavelength - 380) / 400) * 270;
        
        // Spectrum bar
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(graphX + x, graphY - 20, 1, 15);

        // Absorption curve
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
        ctx.lineWidth = 2;
        const y = graphY - 25 - absorbance * (graphH - 30);
        ctx.beginPath();
        ctx.moveTo(graphX + x, graphY - 25);
        ctx.lineTo(graphX + x, y);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الطول الموجي (nm)', graphX + graphW / 2, graphY + 25);
      ctx.fillText('380', graphX, graphY + 15);
      ctx.fillText('780', graphX + graphW, graphY + 15);

      ctx.save();
      ctx.translate(graphX - 50, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('الامتصاص (A)', 0, 0);
      ctx.restore();

      // Beer-Lambert law
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width / 2 - 120, 40, 240, 60);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(canvas.width / 2 - 120, 40, 240, 60);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('A = ε × c × l', canvas.width / 2, 70);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText('قانون بير-لامبرت', canvas.width / 2, 90);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white p-4">
      <StarField />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button variant="ghost" onClick={() => navigate('/scientific-simulations')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          العودة
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          🧪 مختبر الكيمياء التحليلية
        </h1>
        <div className="w-24" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SimulationCard color="green" delay={0.1}>
            <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
            <SimulationControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={resetSimulation}
              primaryColor="green"
            />
          </SimulationCard>

          <InfoSection
            title="المبادئ العلمية"
            icon={Lightbulb}
            color="cyan"
            delay={0.2}
            items={[
              { label: 'معادلة المعايرة', value: 'C₁V₁ = C₂V₂' },
              { label: 'قانون بير-لامبرت', value: 'A = ε × c × l' },
              { label: 'معامل التوزيع', value: 'Rf = d(مادة) / d(مذيب)' }
            ]}
            facts={[
              'المؤشرات الحمضية-القاعدية تغير لونها عند قيم pH محددة',
              'الكروماتوغرافيا تفصل المواد حسب قابليتها للذوبان',
              'التحليل الطيفي يستخدم امتصاص الضوء لتحديد التراكيز'
            ]}
          />
        </div>

        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم" icon={Settings} color="green" delay={0.15}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">نوع التحليل</label>
                <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); resetSimulation(); }}>
                  <TabsList className="grid grid-cols-2 bg-slate-700">
                    <TabsTrigger value="titration" className="text-xs">
                      <Droplets className="w-3 h-3 mr-1" />
                      معايرة
                    </TabsTrigger>
                    <TabsTrigger value="ph" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      pH
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 bg-slate-700 mt-1">
                    <TabsTrigger value="chromatography" className="text-xs">كروماتو</TabsTrigger>
                    <TabsTrigger value="spectroscopy" className="text-xs">طيفية</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {simulationType === 'titration' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">حجم المعاير: {titrantVolume} mL</label>
                  <Slider
                    value={[titrantVolume]}
                    onValueChange={([v]) => setTitrantVolume(v)}
                    min={0}
                    max={50}
                    step={0.5}
                  />
                </div>
              )}
            </div>
          </SimulationCard>

          <SimulationCard title="القياسات" icon={Beaker} color="cyan" delay={0.2}>
            <div className="space-y-3 text-sm">
              {simulationType === 'titration' && (
                <>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">الحجم المضاف:</span>
                    <span className="text-green-300 font-bold">{titrantVolume} mL</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">قيمة pH:</span>
                    <span className="text-cyan-300 font-bold">{calculatePH(titrantVolume).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">نقطة التكافؤ:</span>
                    <span className="text-yellow-300 font-bold">~25 mL</span>
                  </div>
                </>
              )}
            </div>
          </SimulationCard>

          <QuizSection
            title="اختبر معلوماتك"
            icon={HelpCircle}
            color="yellow"
            questions={quizQuestions}
            delay={0.25}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticalChemistrySimulation;
