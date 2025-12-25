import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom, Zap, Activity } from 'lucide-react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const AdvancedNuclearSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'alpha' | 'beta' | 'gamma' | 'halflife'>('alpha');
  const [halfLife, setHalfLife] = useState(5);
  const [time, setTime] = useState(0);

  const quizQuestions = [
    {
      question: 'ما هو جسيم ألفا؟',
      options: ['نواة ذرة الهيليوم', 'إلكترون', 'فوتون', 'نيوترون'],
      correctIndex: 0,
      explanation: 'جسيم ألفا هو نواة ذرة الهيليوم المكونة من بروتونين ونيوترونين'
    },
    {
      question: 'ماذا يحدث للعدد الذري عند انحلال بيتا السالب؟',
      options: ['يقل بمقدار 2', 'يزيد بمقدار 1', 'لا يتغير', 'يقل بمقدار 1'],
      correctIndex: 1,
      explanation: 'في انحلال بيتا السالب، يتحول نيوترون إلى بروتون فيزيد العدد الذري بمقدار 1'
    },
    {
      question: 'ما هي أشعة غاما؟',
      options: ['جسيمات مشحونة', 'موجات كهرومغناطيسية عالية الطاقة', 'إلكترونات سريعة', 'نيوترونات'],
      correctIndex: 1,
      explanation: 'أشعة غاما هي فوتونات عالية الطاقة (موجات كهرومغناطيسية) تنبعث من النواة المثارة'
    },
    {
      question: 'إذا كان عمر النصف لعنصر 10 سنوات، ما نسبة المتبقي بعد 20 سنة؟',
      options: ['50%', '25%', '12.5%', '75%'],
      correctIndex: 1,
      explanation: 'بعد عمر نصف أول يتبقى 50%، وبعد عمر نصف ثاني يتبقى 25% من الكمية الأصلية'
    },
    {
      question: 'أي نوع من الإشعاع له أكبر قدرة اختراق؟',
      options: ['ألفا', 'بيتا', 'غاما', 'كلها متساوية'],
      correctIndex: 2,
      explanation: 'أشعة غاما لها أكبر قدرة اختراق لأنها موجات كهرومغناطيسية بدون شحنة أو كتلة'
    }
  ];

  const getFormulas = () => {
    switch (simulationType) {
      case 'alpha':
        return [
          { name: 'انحلال ألفا', formula: '²³⁸U → ²³⁴Th + ⁴He', description: 'فقدان 2 بروتون و 2 نيوترون' },
          { name: 'تغير الأعداد', formula: 'A-4, Z-2', description: 'العدد الكتلي والذري' }
        ];
      case 'beta':
        return [
          { name: 'انحلال بيتا', formula: 'n → p + e⁻ + ν̄', description: 'تحول نيوترون لبروتون' },
          { name: 'تغير الأعداد', formula: 'A ثابت, Z+1', description: 'العدد الذري يزيد' }
        ];
      case 'gamma':
        return [
          { name: 'انحلال غاما', formula: 'X* → X + γ', description: 'إطلاق طاقة فائضة' },
          { name: 'تغير الأعداد', formula: 'A, Z ثابتان', description: 'لا تغير في التركيب' }
        ];
      case 'halflife':
        return [
          { name: 'قانون التناقص', formula: 'N = N₀ × (½)^(t/t½)', description: 'العدد المتبقي' },
          { name: 'ثابت الانحلال', formula: 'λ = ln(2) / t½', description: 'معدل الانحلال' }
        ];
    }
  };

  const facts = [
    'الكربون-14 يستخدم لتحديد عمر الآثار حتى 50,000 سنة',
    'اليورانيوم-238 عمر نصفه 4.5 مليار سنة',
    'أشعة غاما تستخدم في علاج السرطان',
    'جسيم ألفا يمكن إيقافه بورقة عادية',
    'الرادون غاز مشع طبيعي موجود في التربة'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      // خلفية متدرجة
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, '#0a1a0a');
      gradient.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // نجوم خلفية
      for (let i = 0; i < 60; i++) {
        const x = (i * 137.5 + time * 0.3) % canvas.width;
        const y = (i * 73.3) % canvas.height;
        const alpha = 0.2 + Math.sin(time * 2 + i) * 0.15;
        ctx.fillStyle = `rgba(100, 255, 150, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

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
        const angle = (i / total) * Math.PI * 2 + Math.sin(time + i) * 0.12;
        const r = (i / total) * radius * 0.85;
        const px = x + Math.cos(angle * 3 + i) * r;
        const py = y + Math.sin(angle * 2 + i) * r;
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = i < protons ? '#e74c3c' : '#3498db';
        ctx.fillStyle = i < protons ? '#ff6b6b' : '#4ecdc4';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const drawAlphaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      // النواة الأم (اليورانيوم-238)
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#2ecc71';
      drawNucleus(ctx, centerX, centerY, 92, 146, 70);
      ctx.shadowBlur = 0;

      // انبعاث جسيم ألفا
      const emissionProgress = (time * 0.5) % 3;
      if (emissionProgress > 0) {
        const alphaX = centerX + emissionProgress * 120;
        const alphaY = centerY - emissionProgress * 35;

        // جسيم ألفا مع توهج
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f39c12';
        
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(alphaX - 10, alphaY - 6, 12, 0, Math.PI * 2);
        ctx.arc(alphaX + 10, alphaY - 6, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(alphaX - 10, alphaY + 10, 12, 0, Math.PI * 2);
        ctx.arc(alphaX + 10, alphaY + 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // مسار جسيم ألفا
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(centerX + 70, centerY);
        ctx.lineTo(alphaX, alphaY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('α (He²⁺)', alphaX, alphaY - 35);
      }

      if (emissionProgress > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '16px Arial';
        ctx.fillText('Th-234', centerX, centerY + 100);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('U-238', centerX, centerY - 90);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('انحلال ألفا', canvas.width / 2, 50);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#2ecc71';
      ctx.fillText('²³⁸U → ²³⁴Th + ⁴He', canvas.width / 2, canvas.height - 55);
      ctx.fillStyle = '#aaa';
      ctx.font = '14px Arial';
      ctx.fillText('(A-4, Z-2)', canvas.width / 2, canvas.height - 30);
    };

    const drawBetaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#3498db';
      drawNucleus(ctx, centerX, centerY, 6, 8, 50);
      ctx.shadowBlur = 0;

      const emissionProgress = (time * 0.8) % 2;

      if (emissionProgress > 0) {
        const betaX = centerX + emissionProgress * 170;
        const betaY = centerY + Math.sin(emissionProgress * 12) * 35;

        // الإلكترون مع توهج
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#f1c40f';
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(betaX, betaY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // مسار الإلكترون
        ctx.strokeStyle = 'rgba(241, 196, 68, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(centerX + 50, centerY);
        for (let t = 0; t <= emissionProgress; t += 0.1) {
          const x = centerX + t * 170;
          const y = centerY + Math.sin(t * 12) * 35;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('β⁻ (e⁻)', betaX, betaY - 20);

        // النيوترينو المضاد
        const nuX = centerX + emissionProgress * 140;
        const nuY = centerY - emissionProgress * 60;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#9b59b6';
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(nuX, nuY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('ν̄', nuX + 12, nuY + 4);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('C-14', centerX, centerY - 70);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('انحلال بيتا (β⁻)', canvas.width / 2, 50);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#3498db';
      ctx.fillText('¹⁴C → ¹⁴N + e⁻ + ν̄', canvas.width / 2, canvas.height - 55);
      ctx.fillStyle = '#aaa';
      ctx.font = '14px Arial';
      ctx.fillText('(نيوترون → بروتون + إلكترون)', canvas.width / 2, canvas.height - 30);
    };

    const drawGammaDecay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 3;
      const centerY = canvas.height / 2;

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#9b59b6';
      drawNucleus(ctx, centerX, centerY, 27, 33, 55);
      ctx.shadowBlur = 0;

      // توهج الحالة المثارة
      const glowIntensity = 0.5 + Math.sin(time * 6) * 0.35;
      ctx.strokeStyle = `rgba(255, 255, 0, ${glowIntensity})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 65 + Math.sin(time * 6) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // انبعاث أشعة غاما
      const emissionProgress = (time * 0.6) % 2;
      if (emissionProgress > 0) {
        const rayLength = emissionProgress * 230;

        // موجة غاما
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9b59b6';
        ctx.beginPath();
        for (let i = 0; i < rayLength; i += 2) {
          const x = centerX + 60 + i;
          const y = centerY + Math.sin(i * 0.35 + time * 12) * 18;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('γ (فوتون)', centerX + 60 + rayLength / 2, centerY - 38);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Co-60*', centerX, centerY - 85);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f1c40f';
      ctx.fillText('(حالة مثارة)', centerX, centerY - 65);
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('انحلال غاما', canvas.width / 2, 50);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#9b59b6';
      ctx.fillText('⁶⁰Co* → ⁶⁰Co + γ', canvas.width / 2, canvas.height - 55);
      ctx.fillStyle = '#aaa';
      ctx.font = '14px Arial';
      ctx.fillText('(لا تغير في A أو Z)', canvas.width / 2, canvas.height - 30);
    };

    const drawHalfLife = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const graphX = 110;
      const graphY = canvas.height - 110;
      const graphW = canvas.width - 220;
      const graphH = 320;

      // المحاور
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // منحنى التناقص مع توهج
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#2ecc71';
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const N0 = graphH - 25;
      for (let t = 0; t <= graphW; t++) {
        const timeVal = (t / graphW) * 30;
        const N = N0 * Math.pow(0.5, timeVal / halfLife);
        const x = graphX + t;
        const y = graphY - N;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // علامات عمر النصف
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 2;
      
      for (let i = 1; i <= 4; i++) {
        const tHalf = (halfLife * i / 30) * graphW;
        const yHalf = graphY - N0 * Math.pow(0.5, i);
        
        ctx.beginPath();
        ctx.moveTo(graphX + tHalf, graphY);
        ctx.lineTo(graphX + tHalf, yHalf);
        ctx.lineTo(graphX, yHalf);
        ctx.stroke();

        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`t${i}`, graphX + tHalf, graphY + 22);
        ctx.textAlign = 'right';
        ctx.fillText(`N₀/${Math.pow(2, i)}`, graphX - 8, yHalf + 5);
      }
      ctx.setLineDash([]);

      // العينة المتحركة
      const sampleX = 670;
      const sampleY = 160;
      const currentN = Math.pow(0.5, time / halfLife);
      const numAtoms = Math.floor(currentN * 50);

      ctx.fillStyle = '#1a1a2e';
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.fillRect(sampleX - 65, sampleY - 65, 130, 130);
      ctx.strokeRect(sampleX - 65, sampleY - 65, 130, 130);

      for (let i = 0; i < numAtoms; i++) {
        const ax = sampleX - 55 + (i % 10) * 12;
        const ay = sampleY - 55 + Math.floor(i / 10) * 12;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#e74c3c';
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(ax, ay, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#fff';
      ctx.font = '15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الزمن (t)', graphX + graphW / 2, graphY + 45);
      ctx.save();
      ctx.translate(graphX - 55, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('عدد الذرات (N)', 0, 0);
      ctx.restore();

      ctx.font = 'bold 24px Arial';
      ctx.fillText('عمر النصف', canvas.width / 2, 50);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#2ecc71';
      ctx.fillText('N = N₀ × (½)^(t/t½)', canvas.width / 2, 78);
      ctx.fillStyle = '#f39c12';
      ctx.fillText(`t½ = ${halfLife} ثانية`, sampleX, sampleY + 90);
      ctx.fillStyle = '#fff';
      ctx.fillText(`المتبقي: ${(currentN * 100).toFixed(1)}%`, sampleX, sampleY + 115);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, halfLife, time]);

  const getExplanation = () => {
    switch (simulationType) {
      case 'alpha': return 'انحلال ألفا: تفقد النواة جسيم ألفا (نواة هيليوم = 2 بروتون + 2 نيوترون). العدد الكتلي ينقص 4 والعدد الذري ينقص 2.';
      case 'beta': return 'انحلال بيتا السالب: يتحول نيوترون إلى بروتون مع إطلاق إلكترون ونيوترينو مضاد. العدد الذري يزيد 1 والكتلي ثابت.';
      case 'gamma': return 'انحلال غاما: النواة المثارة تطلق فوتون عالي الطاقة للوصول لحالة طاقة أقل. لا تغير في العدد الذري أو الكتلي.';
      case 'halflife': return 'عمر النصف: الزمن اللازم لانحلال نصف الذرات المشعة. يتناقص العدد أسياً مع الزمن وفق قانون التناقص الإشعاعي.';
      default: return '';
    }
  };

  return (
    <SimulationLayout
      title="الفيزياء النووية المتقدمة"
      titleGradient="from-green-400 to-cyan-400"
      backgroundGradient="from-slate-900 via-green-900/30 to-slate-900"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <SimulationCard className="lg:col-span-2" color="green">
          <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
        </SimulationCard>

        <div className="space-y-4">
          <SimulationCard title="نوع الانحلال" icon={Atom} color="green">
            <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); setTime(0); }}>
              <TabsList className="grid grid-cols-2 gap-1 bg-slate-800/50">
                <TabsTrigger value="alpha" className="text-xs data-[state=active]:bg-green-600">
                  <Zap className="h-3 w-3 ml-1" />
                  ألفا α
                </TabsTrigger>
                <TabsTrigger value="beta" className="text-xs data-[state=active]:bg-green-600">بيتا β</TabsTrigger>
                <TabsTrigger value="gamma" className="text-xs data-[state=active]:bg-green-600">غاما γ</TabsTrigger>
                <TabsTrigger value="halflife" className="text-xs data-[state=active]:bg-green-600">عمر النصف</TabsTrigger>
              </TabsList>
            </Tabs>
          </SimulationCard>

          {simulationType === 'halflife' && (
            <SimulationCard title="عمر النصف" color="cyan">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">القيمة:</span>
                  <span className="text-cyan-400 font-mono">{halfLife} ثانية</span>
                </div>
                <Slider 
                  value={[halfLife]} 
                  onValueChange={([v]) => setHalfLife(v)} 
                  min={1} 
                  max={15} 
                  step={1}
                  className="py-2"
                />
              </div>
            </SimulationCard>
          )}

          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => setTime(0)}
            primaryColor="green"
          />

          <SimulationCard title="المعلومات العلمية" icon={Activity} color="cyan" delay={0.2}>
            <InfoSection
              explanation={getExplanation()}
              formulas={getFormulas()}
              facts={facts}
            />
          </SimulationCard>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <QuizSection questions={quizQuestions} title="اختبر معلوماتك في الفيزياء النووية" />
      </motion.div>
    </SimulationLayout>
  );
};

export default AdvancedNuclearSimulation;
