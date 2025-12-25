import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Settings, Circle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface Charge {
  id: number;
  x: number;
  y: number;
  charge: number;
  vx: number;
  vy: number;
}

const StaticElectricitySimulation = () => {
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

  const k = 8.99e9;

  const quizQuestions = [
    {
      question: 'ما نوع القوة بين شحنتين متشابهتين؟',
      options: ['قوة تجاذب', 'قوة تنافر', 'لا توجد قوة', 'قوة متغيرة'],
      correctIndex: 1,
      explanation: 'الشحنات المتشابهة (موجبة-موجبة أو سالبة-سالبة) تتنافر دائماً'
    },
    {
      question: 'ماذا يحدث للقوة الكهربائية إذا تضاعفت المسافة بين شحنتين؟',
      options: ['تتضاعف', 'تقل للنصف', 'تقل للربع', 'لا تتغير'],
      correctIndex: 2,
      explanation: 'حسب قانون كولوم، القوة تتناسب عكسياً مع مربع المسافة، فإذا تضاعفت المسافة تقل القوة للربع'
    },
    {
      question: 'ما هي وحدة قياس الشحنة الكهربائية؟',
      options: ['الأمبير', 'الفولت', 'الكولوم', 'الأوم'],
      correctIndex: 2,
      explanation: 'الكولوم (C) هو وحدة قياس الشحنة الكهربائية في النظام الدولي'
    },
    {
      question: 'كيف يعمل مولد فان دي غراف؟',
      options: ['بالحث الكهرومغناطيسي', 'بنقل الشحنات عبر حزام متحرك', 'بالتفاعلات الكيميائية', 'بالطاقة الشمسية'],
      correctIndex: 1,
      explanation: 'مولد فان دي غراف ينقل الشحنات من القاعدة إلى القبة المعدنية عبر حزام عازل متحرك'
    },
    {
      question: 'ما قيمة ثابت كولوم تقريباً؟',
      options: ['9 × 10³ N·m²/C²', '9 × 10⁶ N·m²/C²', '9 × 10⁹ N·m²/C²', '9 × 10¹² N·m²/C²'],
      correctIndex: 2,
      explanation: 'ثابت كولوم k = 8.99 × 10⁹ N·m²/C² ≈ 9 × 10⁹ N·m²/C²'
    }
  ];

  const getFormulas = () => {
    switch (simulationType) {
      case 'coulomb':
        return [
          { name: 'قانون كولوم', formula: 'F = k × q₁ × q₂ / r²', description: 'القوة بين شحنتين' },
          { name: 'ثابت كولوم', formula: 'k = 8.99 × 10⁹ N·m²/C²', description: 'ثابت التناسب' },
          { name: 'المجال الكهربائي', formula: 'E = F / q = k × Q / r²', description: 'القوة لكل وحدة شحنة' }
        ];
      case 'electroscope':
        return [
          { name: 'الشحن بالتأثير', formula: 'q_induced = -q_external', description: 'الشحنة المستحثة' },
          { name: 'زاوية الانفراج', formula: 'θ ∝ Q', description: 'تتناسب مع الشحنة' }
        ];
      case 'vandegraaff':
        return [
          { name: 'الجهد على القبة', formula: 'V = k × Q / R', description: 'R نصف قطر القبة' },
          { name: 'الشرارة', formula: 'E > 3×10⁶ V/m', description: 'عند انهيار الهواء' }
        ];
    }
  };

  const facts = [
    'البرق هو تفريغ كهربائي ساكن هائل بين السحب والأرض',
    'يمكن لمولد فان دي غراف توليد جهد يصل إلى 5 ملايين فولت',
    'الشحنة الكهربائية محفوظة - لا تُخلق ولا تُفنى',
    'الإلكترون يحمل أصغر شحنة ممكنة: 1.6 × 10⁻¹⁹ كولوم',
    'فرك البالون بالشعر يشحنه بالكهرباء الساكنة'
  ];

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;

      const width = canvas.width;
      const height = canvas.height;

      // خلفية متدرجة
      const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // نجوم خلفية
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5 + time * 0.2) % width;
        const y = (i * 73.3) % height;
        const alpha = 0.2 + Math.sin(time * 2 + i) * 0.15;
        ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (simulationType === 'coulomb') {
        // رسم المجال الكهربائي
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
                
                ctx.strokeStyle = `rgba(255, 200, 100, ${Math.min(magnitude * 200, 0.6)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + normalizedEx * length, y + normalizedEy * length);
                ctx.stroke();
                
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

        // خطوط المجال من الشحنات
        charges.forEach(charge => {
          const numLines = 14;
          for (let i = 0; i < numLines; i++) {
            const startAngle = (i / numLines) * 2 * Math.PI;
            let x = charge.x + 28 * Math.cos(startAngle);
            let y = charge.y + 28 * Math.sin(startAngle);
            
            ctx.strokeStyle = charge.charge > 0 ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 150, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            for (let step = 0; step < 120; step++) {
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

        // رسم الشحنات
        charges.forEach(charge => {
          // توهج
          ctx.shadowBlur = 35;
          ctx.shadowColor = charge.charge > 0 ? '#ff6b6b' : '#4ecdc4';
          
          const gradient = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, 50);
          gradient.addColorStop(0, charge.charge > 0 ? 'rgba(255, 100, 100, 0.6)' : 'rgba(100, 200, 220, 0.6)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, 50, 0, 2 * Math.PI);
          ctx.fill();

          // دائرة الشحنة
          const chargeGradient = ctx.createRadialGradient(charge.x-5, charge.y-5, 0, charge.x, charge.y, 28);
          chargeGradient.addColorStop(0, charge.charge > 0 ? '#ff8888' : '#88ddee');
          chargeGradient.addColorStop(1, charge.charge > 0 ? '#cc4444' : '#3399aa');
          ctx.fillStyle = chargeGradient;
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, 28, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;

          // العلامة
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(charge.charge > 0 ? '+' : '−', charge.x, charge.y);
        });

        // متجهات القوة
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
              
              const forceLength = Math.min(F * 100, 90);
              const angle = Math.atan2(dy, dx);
              const direction = isRepulsive ? -1 : 1;
              
              ctx.strokeStyle = isRepulsive ? '#ff6b6b' : '#2ecc71';
              ctx.lineWidth = 4;
              ctx.shadowBlur = 10;
              ctx.shadowColor = isRepulsive ? '#ff6b6b' : '#2ecc71';
              
              ctx.beginPath();
              ctx.moveTo(c1.x, c1.y);
              ctx.lineTo(c1.x + direction * forceLength * Math.cos(angle), c1.y + direction * forceLength * Math.sin(angle));
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(c2.x, c2.y);
              ctx.lineTo(c2.x - direction * forceLength * Math.cos(angle), c2.y - direction * forceLength * Math.sin(angle));
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }

        // معادلة كولوم
        if (charges.length >= 2) {
          const dx = charges[1].x - charges[0].x;
          const dy = charges[1].y - charges[0].y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const F = (k * chargeStrength * chargeStrength) / (r * r);
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`F = k × q₁ × q₂ / r² = ${F.toExponential(2)} N`, width / 2, height - 25);
        }

      } else if (simulationType === 'electroscope') {
        const centerX = width / 2;

        // الكرة المعدنية
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#a1a1aa';
        const sphereGradient = ctx.createRadialGradient(centerX-10, 90, 0, centerX, 100, 45);
        sphereGradient.addColorStop(0, '#d4d4d8');
        sphereGradient.addColorStop(1, '#71717a');
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(centerX, 100, 45, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // الساق
        const stemGradient = ctx.createLinearGradient(centerX - 6, 145, centerX + 6, 145);
        stemGradient.addColorStop(0, '#52525b');
        stemGradient.addColorStop(0.5, '#a1a1aa');
        stemGradient.addColorStop(1, '#52525b');
        ctx.fillStyle = stemGradient;
        ctx.fillRect(centerX - 6, 145, 12, 155);

        // الورقتان الذهبيتان
        const chargeEffect = chargeStrength * 3.5;
        const leafAngle = Math.min(chargeEffect, 50) * (Math.PI / 180);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fbbf24';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(centerX, 300);
        ctx.lineTo(centerX - Math.sin(leafAngle) * 110, 300 + Math.cos(leafAngle) * 110);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, 300);
        ctx.lineTo(centerX + Math.sin(leafAngle) * 110, 300 + Math.cos(leafAngle) * 110);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // الوعاء الزجاجي
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 110, 210);
        ctx.lineTo(centerX - 110, 460);
        ctx.lineTo(centerX + 110, 460);
        ctx.lineTo(centerX + 110, 210);
        ctx.stroke();

        // القضيب المشحون
        const rodX = centerX + 210 + Math.sin(time * 1.5) * 60;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#8b5cf6';
        const rodGradient = ctx.createLinearGradient(rodX - 65, 80, rodX + 65, 80);
        rodGradient.addColorStop(0, '#7c3aed');
        rodGradient.addColorStop(0.5, '#a78bfa');
        rodGradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = rodGradient;
        ctx.beginPath();
        ctx.roundRect(rodX - 65, 75, 130, 35, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 4; i++) {
          ctx.fillText('+', rodX - 48 + i * 32, 98);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('الكاشف الكهربائي', centerX, 40);

      } else if (simulationType === 'vandegraaff') {
        const centerX = width / 2;
        const baseY = height - 100;

        // العمود
        const columnGradient = ctx.createLinearGradient(centerX - 35, 150, centerX + 35, 150);
        columnGradient.addColorStop(0, '#3f3f46');
        columnGradient.addColorStop(0.5, '#71717a');
        columnGradient.addColorStop(1, '#3f3f46');
        ctx.fillStyle = columnGradient;
        ctx.fillRect(centerX - 35, 160, 70, baseY - 160);

        // القبة
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#a1a1aa';
        const domeGradient = ctx.createRadialGradient(centerX - 20, 80, 0, centerX, 105, 110);
        domeGradient.addColorStop(0, '#d4d4d8');
        domeGradient.addColorStop(0.7, '#a1a1aa');
        domeGradient.addColorStop(1, '#52525b');
        ctx.fillStyle = domeGradient;
        ctx.beginPath();
        ctx.arc(centerX, 105, 110, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // الحزام
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - 12, 105);
        ctx.lineTo(centerX - 12, baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 12, 105);
        ctx.lineTo(centerX + 12, baseY);
        ctx.stroke();

        // الشحنات المتحركة على الحزام
        for (let i = 0; i < 10; i++) {
          const y = (105 + ((time * 120 + i * 55) % (baseY - 105)));
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('+', centerX - 12, y);
          ctx.shadowBlur = 0;
        }

        // الشرارات
        if (chargeStrength > 5) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';
          
          for (let i = 0; i < 6; i++) {
            const sparkAngle = (i / 6) * Math.PI - Math.PI / 2 + Math.sin(time * 12 + i) * 0.25;
            const sparkLength = 40 + Math.random() * 60 * (chargeStrength / 10);
            
            ctx.beginPath();
            ctx.moveTo(centerX + 110 * Math.cos(sparkAngle), 105 + 110 * Math.sin(sparkAngle));
            
            let x = centerX + 110 * Math.cos(sparkAngle);
            let y = 105 + 110 * Math.sin(sparkAngle);
            
            for (let j = 0; j < 6; j++) {
              x += (Math.cos(sparkAngle) + (Math.random() - 0.5)) * sparkLength / 6;
              y += (Math.sin(sparkAngle) + (Math.random() - 0.5)) * sparkLength / 6;
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }

        // الشحنات المتراكمة على القبة
        for (let i = 0; i < chargeStrength; i++) {
          const angle = (i / chargeStrength) * 2 * Math.PI + time * 0.5;
          const chargeX = centerX + 95 * Math.cos(angle);
          const chargeY = 105 + 95 * Math.sin(angle);
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('+', chargeX, chargeY + 5);
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('مولد فان دي غراف', centerX, 40);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`الشحنة المتراكمة: ${(chargeStrength * 10).toFixed(0)} μC`, centerX, baseY + 55);
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

  const getExplanation = () => {
    switch (simulationType) {
      case 'coulomb': return 'قانون كولوم يصف القوة بين شحنتين كهربائيتين. تتناسب القوة طردياً مع حاصل ضرب الشحنتين وعكسياً مع مربع المسافة بينهما.';
      case 'electroscope': return 'الكاشف الكهربائي يستخدم للكشف عن الشحنة الكهربائية. عند اقتراب جسم مشحون، تنفصل الورقتان بسبب تنافر الشحنات المتماثلة.';
      case 'vandegraaff': return 'مولد فان دي غراف يولد شحنات كهربائية عالية جداً عن طريق نقل الشحنات عبر حزام عازل متحرك إلى قبة معدنية.';
      default: return '';
    }
  };

  return (
    <SimulationLayout
      title="محاكاة الكهرباء الساكنة"
      titleGradient="from-yellow-400 to-red-400"
      backgroundGradient="from-slate-900 via-yellow-900/20 to-slate-900"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <SimulationCard className="lg:col-span-2" color="yellow">
          <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
          
          {simulationType === 'coulomb' && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <Button onClick={() => addCharge(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 ml-1" /> شحنة موجبة
              </Button>
              <Button onClick={() => addCharge(false)} className="bg-blue-600 hover:bg-blue-700">
                <Minus className="w-4 h-4 ml-1" /> شحنة سالبة
              </Button>
            </div>
          )}
        </SimulationCard>

        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم" icon={Settings} color="yellow">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
                <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                  <TabsList className="grid grid-cols-3 bg-slate-800/50">
                    <TabsTrigger value="coulomb" className="text-xs data-[state=active]:bg-yellow-600">كولوم</TabsTrigger>
                    <TabsTrigger value="electroscope" className="text-xs data-[state=active]:bg-yellow-600">كاشف</TabsTrigger>
                    <TabsTrigger value="vandegraaff" className="text-xs data-[state=active]:bg-yellow-600">مولد</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  شدة الشحنة: <span className="text-yellow-400 font-mono">{chargeStrength.toFixed(1)} μC</span>
                </label>
                <Slider
                  value={[chargeStrength]}
                  onValueChange={(v) => setChargeStrength(v[0])}
                  min={1}
                  max={10}
                  step={0.1}
                />
              </div>

              {simulationType === 'coulomb' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFieldLines}
                      onChange={(e) => setShowFieldLines(e.target.checked)}
                      className="w-4 h-4 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-slate-300">خطوط المجال الكهربائي</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showForceVectors}
                      onChange={(e) => setShowForceVectors(e.target.checked)}
                      className="w-4 h-4 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-slate-300">متجهات القوة</span>
                  </label>
                </div>
              )}
            </div>
          </SimulationCard>

          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={resetSimulation}
            primaryColor="yellow"
          />

          <SimulationCard title="المعلومات العلمية" icon={Zap} color="red" delay={0.2}>
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
        <QuizSection questions={quizQuestions} title="اختبر معلوماتك في الكهرباء الساكنة" />
      </motion.div>
    </SimulationLayout>
  );
};

export default StaticElectricitySimulation;
