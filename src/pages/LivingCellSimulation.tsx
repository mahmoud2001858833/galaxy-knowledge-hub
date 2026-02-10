import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const LivingCellSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState('animal');
  const [hoveredOrganelle, setHoveredOrganelle] = useState<string | null>(null);

  const organelles = {
    animal: [
      { name: 'النواة', x: 300, y: 200, r: 45, color: '#6366f1', desc: 'مركز التحكم - تحتوي DNA' },
      { name: 'الميتوكوندريا', x: 180, y: 150, r: 20, color: '#ef4444', desc: 'محطة الطاقة - إنتاج ATP' },
      { name: 'الشبكة الإندوبلازمية', x: 400, y: 180, r: 25, color: '#22c55e', desc: 'تصنيع البروتينات والدهون' },
      { name: 'جهاز غولجي', x: 200, y: 270, r: 22, color: '#f59e0b', desc: 'تعديل وتغليف وتصدير البروتينات' },
      { name: 'الليسوسوم', x: 380, y: 280, r: 15, color: '#ec4899', desc: 'هضم المواد والنفايات' },
      { name: 'الرايبوسومات', x: 350, y: 130, r: 8, color: '#14b8a6', desc: 'تصنيع البروتينات' },
      { name: 'السيتوبلازم', x: 300, y: 200, r: 120, color: '#3b82f640', desc: 'وسط هلامي يحتوي العضيات' },
    ],
    plant: [
      { name: 'النواة', x: 300, y: 200, r: 40, color: '#6366f1', desc: 'مركز التحكم' },
      { name: 'البلاستيدات الخضراء', x: 180, y: 140, r: 22, color: '#22c55e', desc: 'موقع البناء الضوئي' },
      { name: 'الفجوة المركزية', x: 320, y: 220, r: 60, color: '#3b82f630', desc: 'تخزين الماء والمواد' },
      { name: 'جدار الخلية', x: 300, y: 200, r: 135, color: '#78716c', desc: 'حماية ودعم هيكلي' },
      { name: 'الميتوكوندريا', x: 420, y: 160, r: 18, color: '#ef4444', desc: 'إنتاج الطاقة' },
      { name: 'الشبكة الإندوبلازمية', x: 200, y: 270, r: 20, color: '#22c55e80', desc: 'نقل المواد' },
    ],
    bacteria: [
      { name: 'المادة الوراثية', x: 300, y: 200, r: 30, color: '#6366f1', desc: 'DNA دائري بدون نواة' },
      { name: 'البلازميد', x: 220, y: 170, r: 10, color: '#f59e0b', desc: 'DNA دائري صغير إضافي' },
      { name: 'الرايبوسومات', x: 350, y: 180, r: 6, color: '#14b8a6', desc: 'أصغر من حقيقيات النوى' },
      { name: 'السوط', x: 450, y: 200, r: 5, color: '#94a3b8', desc: 'للحركة' },
      { name: 'جدار الخلية', x: 300, y: 200, r: 100, color: '#78716c', desc: 'ببتيدوجليكان' },
      { name: 'الغشاء البلازمي', x: 300, y: 200, r: 90, color: '#f472b6', desc: 'غشاء شبه منفذ' },
    ],
  };

  const drawCell = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const type = activeTab as keyof typeof organelles;
    const cellOrganelles = organelles[type];
    const titles = { animal: 'الخلية الحيوانية', plant: 'الخلية النباتية', bacteria: 'الخلية البكتيرية' };

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(titles[type], w / 2, 25);

    // Draw organelles from largest to smallest
    const sorted = [...cellOrganelles].sort((a, b) => b.r - a.r);
    sorted.forEach((org, i) => {
      const pulse = Math.sin(t * 2 + i) * 3;
      const r = org.r + pulse;

      // Special shapes
      if (org.name === 'جدار الخلية' || org.name === 'الغشاء البلازمي') {
        ctx.beginPath();
        if (type === 'plant') {
          ctx.rect(org.x - r, org.y - r, r * 2, r * 2);
        } else {
          ctx.ellipse(org.x, org.y, r * 1.3, r, 0, 0, Math.PI * 2);
        }
        ctx.strokeStyle = org.color;
        ctx.lineWidth = org.name === 'جدار الخلية' ? 3 : 2;
        ctx.stroke();
      } else if (org.name === 'السوط') {
        ctx.beginPath();
        ctx.moveTo(400, 200);
        for (let j = 0; j < 50; j++) {
          ctx.lineTo(400 + j, 200 + Math.sin(t * 5 + j * 0.3) * 10);
        }
        ctx.strokeStyle = org.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (org.name === 'الفجوة المركزية' || org.name === 'السيتوبلازم') {
        ctx.beginPath();
        ctx.arc(org.x, org.y, r, 0, Math.PI * 2);
        ctx.fillStyle = org.color;
        ctx.fill();
      } else {
        // Regular organelle
        ctx.beginPath();
        if (org.name === 'الميتوكوندريا') {
          ctx.ellipse(org.x, org.y, r * 1.5, r, Math.sin(t) * 0.2, 0, Math.PI * 2);
        } else {
          ctx.arc(org.x, org.y, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = org.color + '60';
        ctx.fill();
        ctx.strokeStyle = org.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner detail for nucleus
        if (org.name === 'النواة' || org.name === 'المادة الوراثية') {
          ctx.beginPath();
          ctx.arc(org.x + 5, org.y - 5, r * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = '#a78bfa';
          ctx.fill();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        if (r > 15) {
          ctx.fillText(org.name, org.x, org.y + r + 14);
        }
      }
    });

    // Description panel
    if (hoveredOrganelle) {
      const org = cellOrganelles.find(o => o.name === hoveredOrganelle);
      if (org) {
        ctx.fillStyle = '#1e293bdd';
        ctx.beginPath();
        ctx.roundRect(20, h - 60, w - 40, 50, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${org.name}: ${org.desc}`, w / 2, h - 30);
      }
    }
  }, [activeTab, hoveredOrganelle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const type = activeTab as keyof typeof organelles;
      const found = organelles[type].find(o => {
        const dx = mx - o.x, dy = my - o.y;
        return Math.sqrt(dx * dx + dy * dy) < o.r + 5;
      });
      setHoveredOrganelle(found?.name || null);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      drawCell(ctx, canvas.width, canvas.height);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [drawCell, activeTab]);

  const quizQuestions = [
    { question: 'أي عضية مسؤولة عن إنتاج الطاقة (ATP)؟', options: ['النواة', 'الميتوكوندريا', 'جهاز غولجي', 'الليسوسوم'], correctIndex: 1, explanation: 'الميتوكوندريا هي "محطة الطاقة" في الخلية حيث يحدث التنفس الخلوي لإنتاج ATP.' },
    { question: 'ما الذي يميز الخلية النباتية عن الحيوانية؟', options: ['وجود النواة', 'وجود جدار خلوي وبلاستيدات', 'وجود ميتوكوندريا', 'وجود رايبوسومات'], correctIndex: 1, explanation: 'الخلية النباتية تتميز بوجود جدار خلوي سليولوزي وبلاستيدات خضراء وفجوة مركزية كبيرة.' },
    { question: 'لماذا تصنف البكتيريا كبدائيات النوى؟', options: ['لأنها صغيرة', 'لأنها لا تملك نواة محاطة بغشاء', 'لأنها لا تملك DNA', 'لأنها لا تتكاثر'], correctIndex: 1, explanation: 'بدائيات النوى تفتقر لنواة محاطة بغشاء نووي، فالمادة الوراثية حرة في السيتوبلازم.' },
  ];

  return (
    <SimulationLayout title="الخلية الحية" titleGradient="from-pink-400 to-purple-400" backgroundGradient="from-slate-900 via-pink-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="animal" className="flex-1 text-xs">خلية حيوانية</TabsTrigger>
              <TabsTrigger value="plant" className="flex-1 text-xs">خلية نباتية</TabsTrigger>
              <TabsTrigger value="bacteria" className="flex-1 text-xs">خلية بكتيرية</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-pink-500/30 bg-slate-900 cursor-pointer" />
          <p className="text-xs text-slate-400 text-center">حرّك الماوس فوق العضيات لمعرفة وظيفتها</p>
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'نوع الخلية', value: activeTab === 'animal' ? 'حيوانية' : activeTab === 'plant' ? 'نباتية' : 'بكتيرية', color: 'text-pink-300' },
              { label: 'عدد العضيات', value: organelles[activeTab as keyof typeof organelles].length, color: 'text-purple-300' },
              { label: 'التصنيف', value: activeTab === 'bacteria' ? 'بدائية النوى' : 'حقيقية النوى', color: 'text-cyan-300' },
            ]}
            facts={[
              'جسم الإنسان يحتوي على حوالي 37 تريليون خلية',
              'أكبر خلية في جسم الإنسان هي البويضة',
              'الميتوكوندريا تملك DNA خاص بها',
              'البكتيريا يمكن أن تنقسم كل 20 دقيقة',
            ]}
            explanation={hoveredOrganelle ? `${hoveredOrganelle}: ${organelles[activeTab as keyof typeof organelles].find(o => o.name === hoveredOrganelle)?.desc || ''}` : 'حرّك الماوس فوق عضية لمعرفة المزيد'}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default LivingCellSimulation;
