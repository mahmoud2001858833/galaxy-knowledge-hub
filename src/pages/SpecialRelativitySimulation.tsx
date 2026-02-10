import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, Ruler, Zap } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';

const c = 299792458; // Speed of light

const SpecialRelativitySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('time-dilation');
  const [velocityPercent, setVelocityPercent] = useState(50);
  const timeRef = useRef(0);

  const gamma = 1 / Math.sqrt(1 - (velocityPercent / 100) ** 2);
  const v = velocityPercent / 100;

  const drawTimeDilation = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const cx = w / 2;

    // Two clocks side by side
    const drawClock = (x: number, y: number, r: number, speed: number, label: string, color: string) => {
      // Clock face
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(15,23,42,0.8)';
      ctx.fill();

      // Hour marks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10));
        ctx.lineTo(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3));
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Second hand
      const sa = (t * speed) % (Math.PI * 2) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(sa) * (r - 15), y + Math.sin(sa) * (r - 15));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + r + 30);
    };

    drawClock(cx - 150, h / 2 - 20, 80, 2, 'ساعة ثابتة (المراقب)', '#22c55e');
    drawClock(cx + 150, h / 2 - 20, 80, 2 / gamma, 'ساعة متحركة (المسافر)', '#ef4444');

    // Moving spaceship representation
    const shipX = cx + 150;
    const shipY = h / 2 - 130;
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(shipX - 30, shipY);
    ctx.lineTo(shipX + 30, shipY);
    ctx.lineTo(shipX + 40, shipY + 10);
    ctx.lineTo(shipX - 40, shipY + 10);
    ctx.closePath();
    ctx.fill();

    // Speed lines
    for (let i = 0; i < 5; i++) {
      const lx = shipX - 50 - Math.random() * 30;
      const ly = shipY + Math.random() * 10;
      ctx.strokeStyle = `rgba(59,130,246,${0.3 + Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 20 * v, ly);
      ctx.stroke();
    }

    // Info panel
    ctx.fillStyle = 'rgba(30,41,59,0.8)';
    ctx.fillRect(20, h - 100, w - 40, 80);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(20, h - 100, w - 40, 80);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`v = ${velocityPercent}% c = ${(v * c / 1e6).toFixed(0)} km/s`, cx, h - 75);
    ctx.fillText(`γ = ${gamma.toFixed(4)}`, cx, h - 55);
    ctx.fillStyle = '#f97316';
    ctx.fillText(`Δt' = γ × Δt = ${gamma.toFixed(2)} × Δt`, cx, h - 35);

    // Arrow between clocks
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - 60, h / 2 - 20);
    ctx.lineTo(cx + 60, h / 2 - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f97316';
    ctx.font = '12px sans-serif';
    ctx.fillText(`الزمن يمر أبطأ بـ ${((1 - 1/gamma) * 100).toFixed(1)}%`, cx, h / 2 - 30);
  }, [velocityPercent, gamma, v]);

  const drawLengthContraction = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const restLen = 200;
    const contractedLen = restLen / gamma;

    // Rest frame
    const y1 = h / 2 - 70;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(cx - restLen / 2, y1 - 20, restLen, 40);
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - restLen / 2, y1 - 20, restLen, 40);

    // Length markers
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - restLen / 2, y1 + 30);
    ctx.lineTo(cx - restLen / 2, y1 + 45);
    ctx.moveTo(cx + restLen / 2, y1 + 30);
    ctx.lineTo(cx + restLen / 2, y1 + 45);
    ctx.moveTo(cx - restLen / 2, y1 + 38);
    ctx.lineTo(cx + restLen / 2, y1 + 38);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`L₀ = ${restLen} (الطول الأصلي)`, cx, y1 + 58);
    ctx.fillText('إطار السكون', cx, y1 - 30);

    // Moving frame
    const y2 = h / 2 + 70;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - contractedLen / 2, y2 - 20, contractedLen, 40);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - contractedLen / 2, y2 - 20, contractedLen, 40);

    // Speed lines on moving object
    for (let i = 0; i < 8; i++) {
      const lx = cx + contractedLen / 2 + 10 + i * 8;
      ctx.strokeStyle = `rgba(239,68,68,${0.5 - i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, y2 - 15);
      ctx.lineTo(lx + 15, y2 - 15);
      ctx.moveTo(lx, y2 + 15);
      ctx.lineTo(lx + 15, y2 + 15);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - contractedLen / 2, y2 + 30);
    ctx.lineTo(cx - contractedLen / 2, y2 + 45);
    ctx.moveTo(cx + contractedLen / 2, y2 + 30);
    ctx.lineTo(cx + contractedLen / 2, y2 + 45);
    ctx.moveTo(cx - contractedLen / 2, y2 + 38);
    ctx.lineTo(cx + contractedLen / 2, y2 + 38);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`L = L₀/γ = ${contractedLen.toFixed(1)} (الطول المُقلَّص)`, cx, y2 + 58);
    ctx.fillText(`إطار متحرك بسرعة ${velocityPercent}% c`, cx, y2 - 30);

    // Formula
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`L = L₀ × √(1 - v²/c²) = L₀ / γ`, cx, h - 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`نسبة التقلص: ${((1 - 1/gamma) * 100).toFixed(1)}%`, cx, h - 10);
  }, [velocityPercent, gamma]);

  const drawMassEnergy = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const t = timeRef.current;

    // E = mc² visualization
    const m0 = 1; // kg
    const E0 = m0 * c * c;
    const relM = m0 * gamma;
    const KE = (gamma - 1) * m0 * c * c;

    // Central equation
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('E = mc²', cx, 60);

    // Mass at rest (left)
    const leftX = cx - 180;
    const baseY = h / 2 + 20;
    ctx.beginPath();
    ctx.arc(leftX, baseY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('m₀', leftX, baseY + 5);
    ctx.fillText('كتلة السكون', leftX, baseY + 50);
    ctx.font = '11px monospace';
    ctx.fillText(`${m0} kg`, leftX, baseY + 68);

    // Arrow
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX + 50, baseY);
    ctx.lineTo(cx - 50, baseY);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`v = ${velocityPercent}%c`, cx - 90, baseY - 15);

    // Relativistic mass (right)
    const rightX = cx + 180;
    const relR = 30 * gamma;
    ctx.beginPath();
    ctx.arc(rightX, baseY, Math.min(relR, 80), 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('m', rightX, baseY + 5);
    ctx.fillText('الكتلة النسبية', rightX, baseY + 50);
    ctx.font = '11px monospace';
    ctx.fillText(`${relM.toFixed(3)} kg`, rightX, baseY + 68);

    // Energy bar
    const barY = h - 100;
    const barW = w - 100;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, barY, barW, 30);

    // Rest energy portion
    const restPortion = barW / gamma;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(50, barY, restPortion, 30);

    // KE portion
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(50 + restPortion, barY, barW - restPortion, 30);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('طاقة السكون E₀', 55, barY + 18);
    if (barW - restPortion > 60) {
      ctx.textAlign = 'right';
      ctx.fillText('طاقة حركية KE', 50 + barW - 5, barY + 18);
    }

    // Values
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`E₀ = m₀c² = ${(E0 / 1e16).toFixed(2)} × 10¹⁶ J`, cx, barY + 55);
    ctx.fillText(`KE = (γ-1)m₀c² = ${(KE / 1e16).toFixed(4)} × 10¹⁶ J`, cx, barY + 75);
  }, [velocityPercent, gamma]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      if (isPlaying) timeRef.current += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'time-dilation') drawTimeDilation(ctx, w, h);
      else if (activeTab === 'length-contraction') drawLengthContraction(ctx, w, h);
      else drawMassEnergy(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isPlaying, drawTimeDilation, drawLengthContraction, drawMassEnergy]);

  const formulas = [
    { name: 'معامل لورنتز', formula: 'γ = 1/√(1-v²/c²)', description: 'العامل الذي يحدد مقدار التأثيرات النسبية' },
    { name: 'تمدد الزمن', formula: "Δt' = γΔt", description: 'الزمن يمر أبطأ للمراقب المتحرك' },
    { name: 'تقلص الطول', formula: 'L = L₀/γ', description: 'الأجسام المتحركة تبدو أقصر في اتجاه الحركة' },
    { name: 'تكافؤ الكتلة والطاقة', formula: 'E = mc²', description: 'الكتلة والطاقة وجهان لعملة واحدة' },
  ];

  const quizQuestions = [
    { question: 'ماذا يحدث للزمن عند الاقتراب من سرعة الضوء؟', options: ['يتباطأ', 'يتسارع', 'يتوقف تماماً', 'لا يتأثر'], correctIndex: 0, explanation: 'حسب النسبية الخاصة، الزمن يتباطأ (يتمدد) كلما اقتربت السرعة من سرعة الضوء.' },
    { question: 'ما قيمة γ عند v = 0؟', options: ['1', '0', '∞', 'غير محددة'], correctIndex: 0, explanation: 'عند v=0 يصبح γ = 1/√(1-0) = 1 مما يعني عدم وجود تأثيرات نسبية.' },
    { question: 'كم تساوي طاقة 1 كغ من المادة بالكامل؟', options: ['9×10¹⁶ جول', '3×10⁸ جول', '1 جول', '6.02×10²³ جول'], correctIndex: 0, explanation: 'E = mc² = 1 × (3×10⁸)² = 9×10¹⁶ جول، وهي طاقة هائلة تعادل انفجار 21 ميغاطن من TNT.' },
    { question: 'ما الفرضية الأساسية للنسبية الخاصة؟', options: ['سرعة الضوء ثابتة لجميع المراقبين', 'الزمن مطلق', 'الكتلة لا تتغير', 'لا يوجد حد أقصى للسرعة'], correctIndex: 0, explanation: 'فرضية أينشتاين الأساسية أن سرعة الضوء في الفراغ ثابتة لجميع المراقبين بغض النظر عن حركتهم.' },
    { question: 'ماذا يحدث للكتلة عند زيادة السرعة؟', options: ['تزداد الكتلة النسبية', 'تنقص', 'تبقى ثابتة', 'تصبح صفراً'], correctIndex: 0, explanation: 'الكتلة النسبية تزداد مع السرعة حسب العلاقة m = γm₀، ولهذا يستحيل تسريع جسم ذي كتلة لسرعة الضوء.' },
  ];

  return (
    <SimulationLayout title="النسبية الخاصة" titleGradient="from-yellow-400 to-orange-400" backgroundGradient="from-slate-900 via-yellow-900/20 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
          <TabsTrigger value="time-dilation" className="text-xs"><Clock className="w-3 h-3 ml-1" />تمدد الزمن</TabsTrigger>
          <TabsTrigger value="length-contraction" className="text-xs"><Ruler className="w-3 h-3 ml-1" />تقلص الطول</TabsTrigger>
          <TabsTrigger value="mass-energy" className="text-xs"><Zap className="w-3 h-3 ml-1" />E = mc²</TabsTrigger>
        </TabsList>

        <div className="bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">السرعة: {velocityPercent}% من سرعة الضوء</label>
            <Slider min={0} max={99} step={1} value={[velocityPercent]} onValueChange={([v]) => setVelocityPercent(v)} />
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-center">
            <div className="text-white/70 text-sm">معامل لورنتز γ = <span className="text-orange-400 font-bold text-lg">{gamma.toFixed(4)}</span></div>
          </div>
        </div>
      </Tabs>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          formulas={formulas}
          explanation="النسبية الخاصة لأينشتاين (1905) غيرت فهمنا للزمان والمكان. تنص على أن سرعة الضوء ثابتة لجميع المراقبين، مما يؤدي لتمدد الزمن وتقلص الطول وتكافؤ الكتلة والطاقة."
          facts={[
            'سرعة الضوء 299,792,458 م/ث وهي الحد الأقصى للسرعة في الكون',
            'GPS يحتاج لتصحيحات نسبية وإلا ستنحرف الإحداثيات 10 كم يومياً',
            'ميونات الأشعة الكونية تصل الأرض بفضل تمدد الزمن النسبي',
            'غرام واحد من المادة يحتوي طاقة تكفي لإضاءة مدينة لأيام',
          ]}
        />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default SpecialRelativitySimulation;
