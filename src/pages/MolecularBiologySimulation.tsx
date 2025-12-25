import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dna, Microscope } from 'lucide-react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const MolecularBiologySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'replication' | 'transcription' | 'translation' | 'pcr'>('replication');
  const [time, setTime] = useState(0);

  const quizQuestions = [
    {
      question: 'ما هو إنزيم الهيليكاز؟',
      options: ['يفك الحلزون المزدوج لـ DNA', 'يصنع نسخة من DNA', 'يترجم mRNA إلى بروتين', 'يصلح الأخطاء في DNA'],
      correctIndex: 0,
      explanation: 'الهيليكاز يفك الروابط الهيدروجينية بين قواعد DNA لفتح الحلزون المزدوج'
    },
    {
      question: 'ما هو الفرق بين DNA و RNA؟',
      options: ['DNA يحتوي ثايمين و RNA يحتوي يوراسيل', 'لا يوجد فرق', 'DNA أصغر من RNA', 'RNA ثنائي الشريط'],
      correctIndex: 0,
      explanation: 'DNA يحتوي على قاعدة الثايمين (T) بينما RNA يحتوي على اليوراسيل (U) بدلاً منها'
    },
    {
      question: 'ما هي وظيفة الريبوسوم؟',
      options: ['نسخ DNA', 'ترجمة mRNA إلى بروتين', 'تضاعف DNA', 'نقل الأحماض الأمينية'],
      correctIndex: 1,
      explanation: 'الريبوسوم يقرأ شفرة mRNA ويربط الأحماض الأمينية لتكوين سلسلة البروتين'
    },
    {
      question: 'ما هي تقنية PCR؟',
      options: ['تضخيم DNA في المختبر', 'تحليل البروتينات', 'فصل الكروموسومات', 'قراءة تسلسل RNA'],
      correctIndex: 0,
      explanation: 'PCR (تفاعل البلمرة المتسلسل) يستخدم لتضخيم قطع صغيرة من DNA إلى ملايين النسخ'
    },
    {
      question: 'ما هو الكودون؟',
      options: ['ثلاث قواعد نيتروجينية تشفر حمض أميني', 'بروتين صغير', 'جزء من الريبوسوم', 'إنزيم النسخ'],
      correctIndex: 0,
      explanation: 'الكودون هو ثلاثية من القواعد النيتروجينية في mRNA تشفر لحمض أميني واحد'
    }
  ];

  const formulas = [
    { name: 'تضاعف DNA', formula: 'DNA → 2 DNA', description: 'كل شريط يصبح قالباً لشريط جديد' },
    { name: 'النسخ', formula: 'DNA → mRNA', description: 'نسخ المعلومات الجينية' },
    { name: 'الترجمة', formula: 'mRNA → بروتين', description: 'كل 3 قواعد = 1 حمض أميني' }
  ];

  const facts = [
    'يحتوي جسم الإنسان على حوالي 3 مليار زوج قواعد من DNA',
    'إذا تم مد DNA خلية واحدة سيصل طوله إلى 2 متر',
    'يتم نسخ حوالي 20,000 جين في الخلية البشرية',
    'PCR يمكن أن يضاعف DNA مليار مرة في ساعات قليلة',
    'الريبوسوم يمكنه ربط 20 حمض أميني في الثانية'
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
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // نجوم خلفية
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5 + time * 0.5) % canvas.width;
        const y = (i * 73.3) % canvas.height;
        const alpha = 0.3 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = `rgba(200, 150, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (simulationType === 'replication') drawReplication(ctx, canvas);
      else if (simulationType === 'transcription') drawTranscription(ctx, canvas);
      else if (simulationType === 'translation') drawTranslation(ctx, canvas);
      else if (simulationType === 'pcr') drawPCR(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.02);
      animationId = requestAnimationFrame(animate);
    };

    const drawReplication = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;
      const forkX = 200 + (time * 30) % 400;

      const bases = ['A', 'T', 'G', 'C', 'A', 'T', 'C', 'G', 'T', 'A', 'G', 'C', 'A', 'T', 'G', 'C'];
      const complements: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
      const colors: Record<string, string> = { 'A': '#ff6b6b', 'T': '#4ecdc4', 'G': '#45b7d1', 'C': '#f9ca24' };

      for (let i = 0; i < bases.length; i++) {
        const x = 100 + i * 40;
        const base = bases[i];
        const comp = complements[base];

        if (x < forkX) {
          const separation = Math.min((forkX - x) / 2, 50);
          
          // توهج حول القواعد
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors[base];
          
          // القالب العلوي
          ctx.fillStyle = colors[base];
          ctx.beginPath();
          ctx.arc(x, centerY - separation, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(base, x, centerY - separation + 4);

          // القالب السفلي
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors[comp];
          ctx.fillStyle = colors[comp];
          ctx.beginPath();
          ctx.arc(x, centerY + separation, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.fillText(comp, x, centerY + separation + 4);

          // الشرائط الجديدة
          if (separation > 20) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = colors[comp];
            ctx.beginPath();
            ctx.arc(x, centerY - separation + 35, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = colors[base];
            ctx.beginPath();
            ctx.arc(x, centerY + separation - 35, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        } else {
          // الزوج المترابط
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors[base];
          ctx.fillStyle = colors[base];
          ctx.beginPath();
          ctx.arc(x, centerY - 18, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.fillText(base, x, centerY - 14);

          ctx.shadowBlur = 10;
          ctx.shadowColor = colors[comp];
          ctx.fillStyle = colors[comp];
          ctx.beginPath();
          ctx.arc(x, centerY + 18, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.fillText(comp, x, centerY + 22);

          // روابط هيدروجينية
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, centerY - 4);
          ctx.lineTo(x, centerY + 4);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // إنزيم الهيليكاز مع توهج
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#9b59b6';
      const helicaseGradient = ctx.createRadialGradient(forkX, centerY, 0, forkX, centerY, 30);
      helicaseGradient.addColorStop(0, '#e056fd');
      helicaseGradient.addColorStop(1, '#9b59b6');
      ctx.fillStyle = helicaseGradient;
      ctx.beginPath();
      ctx.arc(forkX, centerY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('هيليكاز', forkX, centerY + 4);

      // العنوان
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('تضاعف DNA - شوكة التضاعف', canvas.width / 2, 45);
    };

    const drawTranscription = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;
      const polymeraseX = 150 + (time * 25) % 450;

      const dnaSequence = ['T', 'A', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T', 'G', 'C', 'T', 'A', 'G'];
      const rnaComplement: Record<string, string> = { 'T': 'A', 'A': 'U', 'G': 'C', 'C': 'G' };
      const colors: Record<string, string> = { 'A': '#ff6b6b', 'T': '#4ecdc4', 'U': '#ff9f43', 'G': '#45b7d1', 'C': '#f9ca24' };

      for (let i = 0; i < dnaSequence.length; i++) {
        const x = 100 + i * 40;
        const base = dnaSequence[i];

        ctx.shadowBlur = 12;
        ctx.shadowColor = colors[base];
        ctx.fillStyle = colors[base];
        ctx.beginPath();
        ctx.arc(x, centerY - 35, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(base, x, centerY - 31);

        if (x < polymeraseX - 35) {
          const rnaBase = rnaComplement[base];
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors[rnaBase];
          ctx.fillStyle = colors[rnaBase];
          ctx.beginPath();
          ctx.arc(x, centerY + 65, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.fillText(rnaBase, x, centerY + 69);
        }
      }

      // RNA Polymerase
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#8e44ad';
      const polyGradient = ctx.createRadialGradient(polymeraseX, centerY + 15, 0, polymeraseX, centerY + 15, 45);
      polyGradient.addColorStop(0, '#be2edd');
      polyGradient.addColorStop(1, '#8e44ad');
      ctx.fillStyle = polyGradient;
      ctx.beginPath();
      ctx.ellipse(polymeraseX, centerY + 15, 45, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('RNA بوليميراز', polymeraseX, centerY + 19);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('النسخ - تحويل DNA إلى mRNA', canvas.width / 2, 45);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText('DNA (قالب)', 60, centerY - 30);
      ctx.fillText('mRNA', 60, centerY + 70);
    };

    const drawTranslation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;

      // الريبوسوم مع توهج
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#636e72';
      const riboGradient = ctx.createRadialGradient(canvas.width / 2, centerY, 0, canvas.width / 2, centerY, 130);
      riboGradient.addColorStop(0, '#95a5a6');
      riboGradient.addColorStop(1, '#636e72');
      ctx.fillStyle = riboGradient;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, centerY, 130, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b2bec3';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, centerY - 35, 110, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const codons = ['AUG', 'GCU', 'UAC', 'GAA', 'UGA'];
      const aminoAcids: Record<string, string> = { 'AUG': 'Met', 'GCU': 'Ala', 'UAC': 'Tyr', 'GAA': 'Glu', 'UGA': 'Stop' };

      for (let i = 0; i < codons.length; i++) {
        const x = 200 + i * 100;
        ctx.fillStyle = '#ff9f43';
        ctx.fillRect(x - 42, centerY + 55, 84, 28);
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 42, centerY + 55, 84, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(codons[i], x, centerY + 74);
      }

      const currentCodon = Math.floor((time * 0.5) % 4);
      for (let i = 0; i <= currentCodon && i < 4; i++) {
        const x = 200 + i * 100;
        
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, centerY + 55);
        ctx.lineTo(x, centerY + 5);
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9b59b6';
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(x, centerY - 15, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(aminoAcids[codons[i]], x, centerY - 11);
      }

      if (currentCodon > 0) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(200, centerY - 15);
        for (let i = 1; i <= currentCodon && i < 4; i++) {
          ctx.lineTo(200 + i * 100, centerY - 15);
        }
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('الترجمة - تحويل mRNA إلى بروتين', canvas.width / 2, 45);
    };

    const drawPCR = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const cycle = Math.floor(time / 3) % 3;
      const phaseProgress = (time % 3) / 3;

      const phases = ['التمسخ (95°C)', 'الارتباط (55°C)', 'الامتداد (72°C)'];
      const temps = [95, 55, 72];
      const phaseColors = ['#e74c3c', '#3498db', '#2ecc71'];

      // مؤشر الحرارة
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(50, 80, 45, 320);
      ctx.strokeStyle = '#636e72';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 80, 45, 320);
      
      const tempY = 80 + (100 - temps[cycle]) * 3.2;
      const tempGradient = ctx.createLinearGradient(52, tempY, 52, 400);
      tempGradient.addColorStop(0, phaseColors[cycle]);
      tempGradient.addColorStop(1, '#2d3436');
      ctx.fillStyle = tempGradient;
      ctx.fillRect(54, tempY, 38, 400 - tempY);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${temps[cycle]}°C`, 73, tempY - 12);

      const centerX = canvas.width / 2 + 60;
      const centerY = canvas.height / 2;

      const drawDNAStrand = (x: number, y: number, length: number, color: string) => {
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - length / 2, y);
        ctx.lineTo(x + length / 2, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      if (cycle === 0) {
        const separation = phaseProgress * 90;
        drawDNAStrand(centerX, centerY - separation, 220, '#ff6b6b');
        drawDNAStrand(centerX, centerY + separation, 220, '#4ecdc4');
      } else if (cycle === 1) {
        drawDNAStrand(centerX, centerY - 90, 220, '#ff6b6b');
        drawDNAStrand(centerX, centerY + 90, 220, '#4ecdc4');
        
        if (phaseProgress > 0.5) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#f9ca24';
          ctx.fillStyle = '#f9ca24';
          ctx.fillRect(centerX - 100, centerY - 80, 50, 18);
          ctx.fillRect(centerX + 50, centerY + 62, 50, 18);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px Arial';
          ctx.fillText('بادئ', centerX - 75, centerY - 68);
          ctx.fillText('بادئ', centerX + 75, centerY + 75);
        }
      } else {
        const extensionLength = phaseProgress * 220;
        drawDNAStrand(centerX, centerY - 90, 220, '#ff6b6b');
        drawDNAStrand(centerX, centerY + 90, 220, '#4ecdc4');
        
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(centerX - 100, centerY - 75, extensionLength, 12);
        ctx.fillRect(centerX + 100 - extensionLength, centerY + 63, extensionLength, 12);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(phases[cycle], canvas.width / 2, 50);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`الدورة: ${Math.floor(time / 9) + 1}`, canvas.width / 2, 78);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, time]);

  const getExplanation = () => {
    switch (simulationType) {
      case 'replication': return 'تضاعف DNA هو عملية نسخ المادة الوراثية قبل انقسام الخلية. إنزيم الهيليكاز يفك الحلزون المزدوج وDNA بوليميراز يبني الشريط الجديد.';
      case 'transcription': return 'النسخ هو تحويل المعلومات من DNA إلى mRNA. RNA بوليميراز يقرأ شريط DNA القالب وينتج شريط mRNA مكمل.';
      case 'translation': return 'الترجمة تحدث في الريبوسوم حيث يُقرأ mRNA ويُترجم إلى سلسلة من الأحماض الأمينية تشكل البروتين.';
      case 'pcr': return 'PCR تقنية لتضخيم DNA تستخدم دورات من التسخين والتبريد لمضاعفة قطعة DNA ملايين المرات.';
      default: return '';
    }
  };

  return (
    <SimulationLayout
      title="البيولوجيا الجزيئية"
      titleGradient="from-pink-400 to-purple-400"
      backgroundGradient="from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <SimulationCard className="lg:col-span-2" color="purple">
          <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
        </SimulationCard>

        {/* Controls */}
        <div className="space-y-4">
          <SimulationCard title="العملية" icon={Dna} color="pink">
            <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); setTime(0); }}>
              <TabsList className="grid grid-cols-2 gap-1 bg-slate-800/50">
                <TabsTrigger value="replication" className="text-xs data-[state=active]:bg-pink-600">تضاعف</TabsTrigger>
                <TabsTrigger value="transcription" className="text-xs data-[state=active]:bg-pink-600">نسخ</TabsTrigger>
                <TabsTrigger value="translation" className="text-xs data-[state=active]:bg-pink-600">ترجمة</TabsTrigger>
                <TabsTrigger value="pcr" className="text-xs data-[state=active]:bg-pink-600">PCR</TabsTrigger>
              </TabsList>
            </Tabs>
          </SimulationCard>

          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => setTime(0)}
            primaryColor="pink"
          />

          <SimulationCard title="المعلومات العلمية" icon={Microscope} color="purple" delay={0.2}>
            <InfoSection
              explanation={getExplanation()}
              formulas={formulas}
              facts={facts}
            />
          </SimulationCard>
        </div>
      </div>

      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <QuizSection questions={quizQuestions} title="اختبر معلوماتك في البيولوجيا الجزيئية" />
      </motion.div>
    </SimulationLayout>
  );
};

export default MolecularBiologySimulation;
