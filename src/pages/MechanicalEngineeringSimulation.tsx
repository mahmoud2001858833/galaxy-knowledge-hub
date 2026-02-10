import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

type MechMode = 'lever' | 'pulley' | 'gears';

const MechanicalEngineeringSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<MechMode>('lever');
  const [effortForce, setEffortForce] = useState(50);
  const [leverArm, setLeverArm] = useState(2);
  const [numPulleys, setNumPulleys] = useState(2);
  const [gearRatio, setGearRatio] = useState(3);
  const angleRef = useRef(0);

  const getMechanicalAdvantage = useCallback(() => {
    if (mode === 'lever') return leverArm;
    if (mode === 'pulley') return numPulleys;
    return gearRatio;
  }, [mode, leverArm, numPulleys, gearRatio]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width / 2, H = canvas.height / 2;
    ctx.clearRect(0, 0, W * 2, H * 2);
    ctx.save();

    const cx = W / 2, cy = H / 2;
    const angle = angleRef.current;

    if (mode === 'lever') {
      const beamLen = 300;
      const fulcrumX = cx, fulcrumY = cy + 50;
      const ratio = leverArm / (leverArm + 1);
      const effortX = fulcrumX - beamLen * ratio;
      const loadX = fulcrumX + beamLen * (1 - ratio);
      const tilt = Math.sin(angle) * 0.1;

      // Fulcrum triangle
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(fulcrumX, fulcrumY);
      ctx.lineTo(fulcrumX - 20, fulcrumY + 30);
      ctx.lineTo(fulcrumX + 20, fulcrumY + 30);
      ctx.closePath(); ctx.fill();

      // Beam
      ctx.save();
      ctx.translate(fulcrumX, fulcrumY);
      ctx.rotate(tilt);
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-beamLen * ratio, 0);
      ctx.lineTo(beamLen * (1 - ratio), 0);
      ctx.stroke();

      // Effort arrow
      const ey = -effortForce * 0.5;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(-beamLen * ratio, 0);
      ctx.lineTo(-beamLen * ratio, ey);
      ctx.lineTo(-beamLen * ratio - 8, ey + 15);
      ctx.moveTo(-beamLen * ratio, ey);
      ctx.lineTo(-beamLen * ratio + 8, ey + 15);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${effortForce}N`, -beamLen * ratio, ey - 10);

      // Load arrow
      const loadForce = effortForce * leverArm;
      const ly = loadForce * 0.3;
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beamLen * (1 - ratio), 0);
      ctx.lineTo(beamLen * (1 - ratio), ly);
      ctx.lineTo(beamLen * (1 - ratio) - 8, ly - 15);
      ctx.moveTo(beamLen * (1 - ratio), ly);
      ctx.lineTo(beamLen * (1 - ratio) + 8, ly - 15);
      ctx.stroke();
      ctx.fillStyle = '#f87171'; ctx.font = '12px sans-serif';
      ctx.fillText(`${loadForce.toFixed(0)}N`, beamLen * (1 - ratio), ly + 20);

      // Labels
      ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif';
      ctx.fillText('القوة', -beamLen * ratio, 20);
      ctx.fillText('الحمل', beamLen * (1 - ratio), 20);
      ctx.restore();

    } else if (mode === 'pulley') {
      const pR = 25;
      const startY = 60;
      const spacing = 70;

      for (let i = 0; i < numPulleys; i++) {
        const py = startY + i * spacing;
        const px = cx + (i % 2 === 0 ? 0 : 30);
        // Wheel
        ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, pR, 0, Math.PI * 2);
        ctx.stroke();
        // Axle
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        // Spoke rotation
        ctx.strokeStyle = 'rgba(100,150,255,0.4)'; ctx.lineWidth = 1;
        for (let s = 0; s < 4; s++) {
          const sa = angle * (i % 2 === 0 ? 1 : -1) + s * Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pR * Math.cos(sa), py + pR * Math.sin(sa));
          ctx.stroke();
        }
        // Rope
        if (i < numPulleys - 1) {
          const nx = cx + ((i+1) % 2 === 0 ? 0 : 30);
          const ny = startY + (i + 1) * spacing;
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px + pR, py); ctx.lineTo(nx + pR, ny);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px - pR, py); ctx.lineTo(nx - pR, ny);
          ctx.stroke();
        }
      }

      // Labels
      ctx.fillStyle = '#4ade80'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`القوة المطبقة: ${(effortForce / numPulleys).toFixed(1)}N`, cx, startY + numPulleys * spacing + 30);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`الحمل: ${effortForce}N`, cx, startY + numPulleys * spacing + 55);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`الميزة الميكانيكية: ${numPulleys}`, cx, startY + numPulleys * spacing + 80);

    } else {
      // Gears
      const gearR1 = 60;
      const gearR2 = gearR1 / gearRatio;
      const g1x = cx - gearR1 - 10, g1y = cy;
      const g2x = cx + gearR2 + 10, g2y = cy;
      const teeth1 = 20, teeth2 = Math.round(teeth1 / gearRatio);

      const drawGear = (gx: number, gy: number, r: number, teeth: number, ang: number, color: string) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const a = ang + (i / (teeth * 2)) * Math.PI * 2;
          const rr = i % 2 === 0 ? r : r - 8;
          const px = gx + rr * Math.cos(a);
          const py = gy + rr * Math.sin(a);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        // Center
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
      };

      drawGear(g1x, g1y, gearR1, teeth1, angle, '#60a5fa');
      drawGear(g2x, g2y, gearR2, teeth2, -angle * gearRatio, '#f87171');

      ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`ترس كبير (${teeth1} سن)`, g1x, g1y + gearR1 + 25);
      ctx.fillText(`ترس صغير (${teeth2} سن)`, g2x, g2y + gearR2 + 25);
      ctx.fillStyle = '#fbbf24'; ctx.font = '14px sans-serif';
      ctx.fillText(`نسبة التروس: 1:${gearRatio}`, cx, cy + Math.max(gearR1, gearR2) + 55);
      ctx.fillText(`السرعة الزاوية للصغير: ${gearRatio}x`, cx, cy + Math.max(gearR1, gearR2) + 80);
    }

    ctx.restore();
  }, [mode, effortForce, leverArm, numPulleys, gearRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(2, 2);
  }, []);

  useEffect(() => {
    const animate = () => {
      if (isPlaying) angleRef.current += 0.02;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, draw]);

  const ma = getMechanicalAdvantage();

  return (
    <SimulationLayout title="الهندسة الميكانيكية" titleGradient="from-amber-400 to-orange-400" backgroundGradient="from-slate-900 via-amber-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-amber-500/30 bg-slate-900/80" style={{ height: '500px' }} />
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            <Button onClick={() => setIsPlaying(!isPlaying)} size="sm" className="bg-amber-600 hover:bg-amber-700">
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button onClick={() => angleRef.current = 0} size="sm" variant="outline" className="border-amber-500 text-amber-400">
              <RotateCcw className="w-4 h-4 mr-1" /> إعادة
            </Button>
            {(['lever','pulley','gears'] as MechMode[]).map(m => (
              <Button key={m} size="sm" onClick={() => setMode(m)} className={mode === m ? 'bg-orange-600' : 'bg-slate-700'}>
                {m === 'lever' ? '⚖️ رافعة' : m === 'pulley' ? '🔄 بكرات' : '⚙️ تروس'}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-amber-500/30">
            <h3 className="text-sm font-bold text-amber-300 mb-3">أدوات التحكم</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-400">القوة: {effortForce}N</label>
                <Slider value={[effortForce]} onValueChange={v => setEffortForce(v[0])} min={10} max={200} step={5} className="mt-1" /></div>
              {mode === 'lever' && (
                <div><label className="text-xs text-slate-400">نسبة الذراع: {leverArm}:1</label>
                  <Slider value={[leverArm]} onValueChange={v => setLeverArm(v[0])} min={1} max={5} step={0.5} className="mt-1" /></div>
              )}
              {mode === 'pulley' && (
                <div><label className="text-xs text-slate-400">عدد البكرات: {numPulleys}</label>
                  <Slider value={[numPulleys]} onValueChange={v => setNumPulleys(v[0])} min={1} max={6} step={1} className="mt-1" /></div>
              )}
              {mode === 'gears' && (
                <div><label className="text-xs text-slate-400">نسبة التروس: 1:{gearRatio}</label>
                  <Slider value={[gearRatio]} onValueChange={v => setGearRatio(v[0])} min={1} max={6} step={1} className="mt-1" /></div>
              )}
            </div>
          </div>
          <InfoSection
            data={[
              { label: 'الميزة الميكانيكية', value: ma, color: 'text-amber-300' },
              { label: 'القوة المطبقة', value: effortForce, unit: 'N', color: 'text-green-300' },
              { label: 'القوة الناتجة', value: effortForce * ma, unit: 'N', color: 'text-red-300' },
            ]}
            explanation="الآلات البسيطة تُضاعف القوة أو تغير اتجاهها. الميزة الميكانيكية تعني أنك تبذل قوة أقل لكن على مسافة أطول - الشغل المبذول يبقى ثابتاً (حفظ الطاقة)."
            formulas={[
              { name: 'الميزة الميكانيكية', formula: 'MA = الحمل / القوة', description: 'نسبة تضخيم القوة' },
              { name: 'الرافعة', formula: 'F₁ × d₁ = F₂ × d₂', description: 'قانون العزم: القوة × ذراعها' },
              { name: 'البكرات', formula: 'MA = عدد الحبال الحاملة', description: 'كل حبل يتحمل جزءاً من الحمل' },
              { name: 'التروس', formula: 'ω₁/ω₂ = N₂/N₁', description: 'نسبة السرعات عكس نسبة الأسنان' },
              { name: 'حفظ الشغل', formula: 'W = F × d = ثابت', description: 'الآلة لا تخلق طاقة بل تحولها' },
            ]}
            facts={[
              'أرخميدس قال: "أعطني رافعة طويلة كفاية ونقطة ارتكاز وسأحرك الأرض"',
              'الأهرامات بُنيت باستخدام المنحدرات والرافعات قبل 4500 سنة',
              'التروس تُستخدم في الساعات الميكانيكية منذ القرن الثالث عشر',
              'ناقل الحركة في السيارة يستخدم مجموعات تروس لتغيير العزم والسرعة',
            ]}
          />
          <QuizSection questions={[
            { question: 'ما الميزة الميكانيكية لنظام 4 بكرات؟', options: ['2', '3', '4', '8'], correctIndex: 2, explanation: 'الميزة الميكانيكية = عدد الحبال الحاملة = عدد البكرات = 4' },
            { question: 'أي نوع رافعة يكون المحور في المنتصف؟', options: ['الأولى', 'الثانية', 'الثالثة', 'لا يوجد'], correctIndex: 0, explanation: 'النوع الأول: المحور (الارتكاز) بين القوة والحمل، مثل الأرجوحة والمقص' },
            { question: 'إذا كانت نسبة التروس 1:3، فكم تزيد سرعة الترس الصغير؟', options: ['مرتين', '3 مرات', '4 مرات', 'لا تتغير'], correctIndex: 1, explanation: 'الترس الصغير يدور أسرع بنسبة عكسية لعدد الأسنان: 3 مرات أسرع' },
            { question: 'رافعة ذراعها 3:1، ما القوة اللازمة لرفع 90N؟', options: ['30N', '45N', '90N', '270N'], correctIndex: 0, explanation: 'F₁ × d₁ = F₂ × d₂ → F₁ × 3 = 90 × 1 → F₁ = 30N' },
            { question: 'لماذا لا تُنشئ الآلة البسيطة طاقة إضافية؟', options: ['بسبب الاحتكاك', 'قانون حفظ الطاقة', 'بسبب الجاذبية', 'بسبب الحرارة'], correctIndex: 1, explanation: 'قانون حفظ الطاقة: الشغل الداخل = الشغل الخارج. الآلة تغير شكل القوة لا مقدار الشغل' },
          ]} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default MechanicalEngineeringSimulation;
