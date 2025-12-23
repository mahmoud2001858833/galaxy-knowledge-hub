import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Dna } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MolecularBiologySimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'replication' | 'transcription' | 'translation' | 'pcr'>('replication');
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      // Original strands
      const bases = ['A', 'T', 'G', 'C', 'A', 'T', 'C', 'G', 'T', 'A', 'G', 'C', 'A', 'T', 'G', 'C'];
      const complements: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
      const colors: Record<string, string> = { 'A': '#e74c3c', 'T': '#3498db', 'G': '#2ecc71', 'C': '#f1c40f' };

      for (let i = 0; i < bases.length; i++) {
        const x = 100 + i * 40;
        const base = bases[i];
        const comp = complements[base];

        if (x < forkX) {
          // Separated strands
          const separation = Math.min((forkX - x) / 2, 40);
          
          // Template strand
          ctx.fillStyle = colors[base];
          ctx.beginPath();
          ctx.arc(x, centerY - separation, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(base, x, centerY - separation + 4);

          // Complementary strand
          ctx.fillStyle = colors[comp];
          ctx.beginPath();
          ctx.arc(x, centerY + separation, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText(comp, x, centerY + separation + 4);

          // New strands being synthesized
          if (separation > 15) {
            ctx.fillStyle = `${colors[comp]}80`;
            ctx.beginPath();
            ctx.arc(x, centerY - separation + 30, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `${colors[base]}80`;
            ctx.beginPath();
            ctx.arc(x, centerY + separation - 30, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Still paired
          ctx.fillStyle = colors[base];
          ctx.beginPath();
          ctx.arc(x, centerY - 15, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Arial';
          ctx.fillText(base, x, centerY - 11);

          ctx.fillStyle = colors[comp];
          ctx.beginPath();
          ctx.arc(x, centerY + 15, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText(comp, x, centerY + 19);

          // Hydrogen bonds
          ctx.strokeStyle = '#666';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(x, centerY - 3);
          ctx.lineTo(x, centerY + 3);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Helicase enzyme
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(forkX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('هيليكاز', forkX, centerY + 4);

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText("تضاعف DNA - شوكة التضاعف", canvas.width / 2, 40);
    };

    const drawTranscription = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;
      const polymeraseX = 150 + (time * 25) % 450;

      // DNA template strand
      const dnaSequence = ['T', 'A', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T', 'G', 'C', 'T', 'A', 'G'];
      const rnaComplement: Record<string, string> = { 'T': 'A', 'A': 'U', 'G': 'C', 'C': 'G' };
      const colors: Record<string, string> = { 'A': '#e74c3c', 'T': '#3498db', 'U': '#e67e22', 'G': '#2ecc71', 'C': '#f1c40f' };

      for (let i = 0; i < dnaSequence.length; i++) {
        const x = 100 + i * 40;
        const base = dnaSequence[i];

        ctx.fillStyle = colors[base];
        ctx.beginPath();
        ctx.arc(x, centerY - 30, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(base, x, centerY - 26);

        // mRNA being synthesized
        if (x < polymeraseX - 30) {
          const rnaBase = rnaComplement[base];
          ctx.fillStyle = colors[rnaBase];
          ctx.beginPath();
          ctx.arc(x, centerY + 60, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText(rnaBase, x, centerY + 64);
        }
      }

      // RNA Polymerase
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.ellipse(polymeraseX, centerY + 15, 40, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText('RNA بوليميراز', polymeraseX, centerY + 18);

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('النسخ - تحويل DNA إلى mRNA', canvas.width / 2, 40);
      ctx.font = '12px Arial';
      ctx.fillText('DNA (قالب)', 60, centerY - 25);
      ctx.fillText('mRNA', 60, centerY + 65);
    };

    const drawTranslation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;

      // Ribosome
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, centerY, 120, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, centerY - 30, 100, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // mRNA strand
      const codons = ['AUG', 'GCU', 'UAC', 'GAA', 'UGA'];
      const aminoAcids: Record<string, string> = { 'AUG': 'Met', 'GCU': 'Ala', 'UAC': 'Tyr', 'GAA': 'Glu', 'UGA': 'Stop' };

      for (let i = 0; i < codons.length; i++) {
        const x = 200 + i * 100;
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x - 40, centerY + 50, 80, 25);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(codons[i], x, centerY + 67);
      }

      // tRNA with amino acids
      const currentCodon = Math.floor((time * 0.5) % 4);
      for (let i = 0; i <= currentCodon && i < 4; i++) {
        const x = 200 + i * 100;
        
        // tRNA
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, centerY + 50);
        ctx.lineTo(x, centerY);
        ctx.stroke();

        // Amino acid
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(x, centerY - 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(aminoAcids[codons[i]], x, centerY - 17);
      }

      // Polypeptide chain
      if (currentCodon > 0) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(200, centerY - 20);
        for (let i = 1; i <= currentCodon && i < 4; i++) {
          ctx.lineTo(200 + i * 100, centerY - 20);
        }
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الترجمة - تحويل mRNA إلى بروتين', canvas.width / 2, 40);
    };

    const drawPCR = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const cycle = Math.floor(time / 3) % 3;
      const phaseProgress = (time % 3) / 3;

      const phases = ['التمسخ (95°C)', 'الارتباط (55°C)', 'الامتداد (72°C)'];
      const temps = [95, 55, 72];

      // Temperature indicator
      ctx.fillStyle = '#333';
      ctx.fillRect(50, 80, 40, 300);
      const tempY = 80 + (100 - temps[cycle]) * 3;
      ctx.fillStyle = cycle === 0 ? '#e74c3c' : (cycle === 1 ? '#3498db' : '#2ecc71');
      ctx.fillRect(52, tempY, 36, 380 - tempY);

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${temps[cycle]}°C`, 70, tempY - 10);

      // DNA visualization
      const centerX = canvas.width / 2 + 50;
      const centerY = canvas.height / 2;

      if (cycle === 0) {
        // Denaturation - strands separating
        const separation = phaseProgress * 80;
        drawDNAStrand(ctx, centerX, centerY - separation, 200, '#e74c3c');
        drawDNAStrand(ctx, centerX, centerY + separation, 200, '#3498db');
      } else if (cycle === 1) {
        // Annealing - primers binding
        drawDNAStrand(ctx, centerX, centerY - 80, 200, '#e74c3c');
        drawDNAStrand(ctx, centerX, centerY + 80, 200, '#3498db');
        
        // Primers
        if (phaseProgress > 0.5) {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(centerX - 90, centerY - 70, 40, 15);
          ctx.fillRect(centerX + 50, centerY + 55, 40, 15);
          ctx.fillStyle = '#000';
          ctx.font = '10px Arial';
          ctx.fillText('بادئ', centerX - 70, centerY - 60);
          ctx.fillText('بادئ', centerX + 70, centerY + 66);
        }
      } else {
        // Extension - new strands being made
        const extensionLength = phaseProgress * 200;
        drawDNAStrand(ctx, centerX, centerY - 80, 200, '#e74c3c');
        drawDNAStrand(ctx, centerX, centerY + 80, 200, '#3498db');
        
        // New complementary strands
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(centerX - 90, centerY - 65, extensionLength, 10);
        ctx.fillRect(centerX + 90 - extensionLength, centerY + 55, extensionLength, 10);
      }

      // Phase label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(phases[cycle], canvas.width / 2, 50);
      ctx.font = '14px Arial';
      ctx.fillText(`الدورة: ${Math.floor(time / 9) + 1}`, canvas.width / 2, 75);
    };

    const drawDNAStrand = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - length / 2, y);
      ctx.lineTo(x + length / 2, y);
      ctx.stroke();
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, time]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/scientific-simulations')}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dna className="h-6 w-6 text-pink-500" />
            البيولوجيا الجزيئية
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
              <h3 className="font-semibold mb-3">العملية</h3>
              <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); setTime(0); }}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="replication" className="text-xs">تضاعف</TabsTrigger>
                  <TabsTrigger value="transcription" className="text-xs">نسخ</TabsTrigger>
                  <TabsTrigger value="translation" className="text-xs">ترجمة</TabsTrigger>
                  <TabsTrigger value="pcr" className="text-xs">PCR</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} className="flex-1">
                {isPlaying ? <Pause className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
                {isPlaying ? 'إيقاف' : 'تشغيل'}
              </Button>
              <Button variant="outline" onClick={() => setTime(0)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-2">المفاهيم</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {simulationType === 'replication' && <p>• تضاعف DNA: نسخ المادة الوراثية</p>}
                {simulationType === 'transcription' && <p>• النسخ: تحويل DNA إلى mRNA</p>}
                {simulationType === 'translation' && <p>• الترجمة: تحويل mRNA إلى بروتين</p>}
                {simulationType === 'pcr' && <p>• PCR: تضخيم DNA في المختبر</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MolecularBiologySimulation;
