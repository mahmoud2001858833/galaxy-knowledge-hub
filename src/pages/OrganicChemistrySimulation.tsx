import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const OrganicChemistrySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState('molecules');
  const [selectedMolecule, setSelectedMolecule] = useState(0);

  const molecules = [
    { name: 'الميثان CH₄', atoms: [{el:'C',x:300,y:200,c:'#333'},{el:'H',x:300,y:130,c:'#fff'},{el:'H',x:370,y:230,c:'#fff'},{el:'H',x:230,y:230,c:'#fff'},{el:'H',x:300,y:270,c:'#fff'}], bonds: [[0,1],[0,2],[0,3],[0,4]] },
    { name: 'الإيثانول C₂H₅OH', atoms: [{el:'C',x:220,y:200,c:'#333'},{el:'C',x:320,y:200,c:'#333'},{el:'O',x:420,y:200,c:'#e53e3e'},{el:'H',x:420,y:140,c:'#fff'},{el:'H',x:220,y:130,c:'#fff'},{el:'H',x:155,y:230,c:'#fff'},{el:'H',x:220,y:270,c:'#fff'},{el:'H',x:320,y:130,c:'#fff'},{el:'H',x:385,y:230,c:'#fff'}], bonds: [[0,1],[1,2],[2,3],[0,4],[0,5],[0,6],[1,7],[1,8]] },
    { name: 'حمض الأسيتيك CH₃COOH', atoms: [{el:'C',x:200,y:200,c:'#333'},{el:'C',x:320,y:200,c:'#333'},{el:'O',x:320,y:120,c:'#e53e3e'},{el:'O',x:420,y:200,c:'#e53e3e'},{el:'H',x:480,y:200,c:'#fff'},{el:'H',x:200,y:130,c:'#fff'},{el:'H',x:135,y:230,c:'#fff'},{el:'H',x:200,y:270,c:'#fff'}], bonds: [[0,1],[1,2,'double'],[1,3],[3,4],[0,5],[0,6],[0,7]] },
    { name: 'البنزين C₆H₆', atoms: Array.from({length:6},(_, i) => ({el:'C',x:300+80*Math.cos(i*Math.PI/3-Math.PI/6),y:200+80*Math.sin(i*Math.PI/3-Math.PI/6),c:'#333'})).concat(Array.from({length:6},(_, i) => ({el:'H',x:300+130*Math.cos(i*Math.PI/3-Math.PI/6),y:200+130*Math.sin(i*Math.PI/3-Math.PI/6),c:'#fff'}))), bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]] },
  ];

  const functionalGroups = [
    { name: 'هيدروكسيل -OH', formula: 'R-OH', type: 'كحول', color: '#ef4444' },
    { name: 'كربوكسيل -COOH', formula: 'R-COOH', type: 'حمض كربوكسيلي', color: '#f97316' },
    { name: 'أمين -NH₂', formula: 'R-NH₂', type: 'أمين', color: '#3b82f6' },
    { name: 'ألدهيد -CHO', formula: 'R-CHO', type: 'ألدهيد', color: '#8b5cf6' },
    { name: 'كيتون -CO-', formula: 'R-CO-R', type: 'كيتون', color: '#ec4899' },
    { name: 'إستر -COO-', formula: 'R-COO-R', type: 'إستر', color: '#14b8a6' },
  ];

  const drawMolecules = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const mol = molecules[selectedMolecule];
    const time = Date.now() / 1000;

    // Draw bonds
    mol.bonds.forEach(([a, b, type]) => {
      const from = mol.atoms[a as number], to = mol.atoms[b as number];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = type === 'double' ? 4 : 2;
      ctx.stroke();
      if (type === 'double') {
        ctx.beginPath();
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * 5, ny = dx / len * 5;
        ctx.moveTo(from.x + nx, from.y + ny);
        ctx.lineTo(to.x + nx, to.y + ny);
        ctx.strokeStyle = '#64748b80';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw atoms
    mol.atoms.forEach((atom, i) => {
      const pulse = Math.sin(time * 2 + i * 0.5) * 2;
      const r = atom.el === 'C' ? 20 : atom.el === 'O' ? 18 : 14;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, r + pulse, 0, Math.PI * 2);
      ctx.fillStyle = atom.c === '#333' ? '#374151' : atom.c === '#e53e3e' ? '#ef4444' : '#e2e8f0';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = atom.el === 'H' ? '#1e293b' : '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.el, atom.x, atom.y);
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(mol.name, w / 2, 35);
  }, [selectedMolecule]);

  const drawFunctionalGroups = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('المجموعات الوظيفية في الكيمياء العضوية', w / 2, 30);

    const time = Date.now() / 1000;
    const cols = 3;
    functionalGroups.forEach((fg, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 80 + col * (w - 120) / cols;
      const y = 70 + row * 150;
      const bw = (w - 160) / cols;
      const pulse = Math.sin(time * 2 + i) * 3;

      ctx.fillStyle = fg.color + '20';
      ctx.strokeStyle = fg.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - 10, y, bw - 20, 120 + pulse, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = fg.color;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(fg.name, x + bw / 2 - 10, y + 25);

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText(fg.formula, x + bw / 2 - 10, y + 55);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Arial';
      ctx.fillText(fg.type, x + bw / 2 - 10, y + 80);
    });
  }, []);

  const drawReactions = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const time = Date.now() / 1000;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('أنواع التفاعلات العضوية', w / 2, 30);

    const reactions = [
      { name: 'تفاعل الاستبدال', eq: 'CH₄ + Cl₂ → CH₃Cl + HCl', desc: 'استبدال ذرة بأخرى', color: '#f59e0b' },
      { name: 'تفاعل الإضافة', eq: 'C₂H₄ + H₂ → C₂H₆', desc: 'إضافة ذرات على الرابطة المزدوجة', color: '#22c55e' },
      { name: 'تفاعل الحذف', eq: 'C₂H₅OH → C₂H₄ + H₂O', desc: 'إزالة ذرات لتكوين رابطة مزدوجة', color: '#ef4444' },
      { name: 'تفاعل الأكسدة', eq: 'CH₃OH → HCHO → HCOOH', desc: 'أكسدة متدرجة للكحول', color: '#8b5cf6' },
    ];

    reactions.forEach((r, i) => {
      const y = 60 + i * 85;
      const pulse = Math.sin(time * 1.5 + i) * 3;

      ctx.fillStyle = r.color + '15';
      ctx.strokeStyle = r.color + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(40, y, w - 80, 70 + pulse, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = r.color;
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(r.name, w - 55, y + 22);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(r.eq, w / 2, y + 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Arial';
      ctx.fillText(r.desc, w / 2, y + 63);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (activeTab === 'molecules') drawMolecules(ctx, w, h);
      else if (activeTab === 'functional-groups') drawFunctionalGroups(ctx, w, h);
      else drawReactions(ctx, w, h);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawMolecules, drawFunctionalGroups, drawReactions]);

  const quizQuestions = [
    { question: 'ما المجموعة الوظيفية في الكحولات؟', options: ['-COOH', '-OH', '-NH₂', '-CHO'], correctIndex: 1, explanation: 'مجموعة الهيدروكسيل -OH هي المجموعة المميزة للكحولات.' },
    { question: 'ما نوع الرابطة بين ذرات الكربون في البنزين؟', options: ['أحادية فقط', 'مزدوجة فقط', 'متناوبة أحادية ومزدوجة', 'ثلاثية'], correctIndex: 2, explanation: 'البنزين يحتوي على روابط متناوبة أحادية ومزدوجة في حلقة سداسية.' },
    { question: 'ما ناتج أكسدة الكحول الأولي؟', options: ['كيتون', 'ألدهيد', 'إستر', 'أمين'], correctIndex: 1, explanation: 'أكسدة الكحول الأولي تنتج ألدهيد، ثم أكسدة إضافية تنتج حمض كربوكسيلي.' },
    { question: 'ما الصيغة العامة للألكانات؟', options: ['CₙH₂ₙ', 'CₙH₂ₙ₊₂', 'CₙH₂ₙ₋₂', 'CₙHₙ'], correctIndex: 1, explanation: 'الألكانات هيدروكربونات مشبعة صيغتها العامة CₙH₂ₙ₊₂ حيث جميع الروابط أحادية.' },
    { question: 'ما التفاعل المميز للألكينات؟', options: ['الاستبدال', 'الإضافة', 'الحذف', 'التكاثف'], correctIndex: 1, explanation: 'الألكينات تحتوي رابطة مزدوجة مما يجعلها تخضع لتفاعلات الإضافة حيث تنكسر الرابطة π وتضاف ذرات جديدة.' },
  ];

  return (
    <SimulationLayout title="الكيمياء العضوية" titleGradient="from-green-400 to-emerald-400" backgroundGradient="from-slate-900 via-green-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="molecules" className="flex-1 text-xs">بناء الجزيئات</TabsTrigger>
              <TabsTrigger value="functional-groups" className="flex-1 text-xs">المجموعات الوظيفية</TabsTrigger>
              <TabsTrigger value="reactions" className="flex-1 text-xs">التفاعلات العضوية</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-green-500/30 bg-slate-900" />
          {activeTab === 'molecules' && (
            <div className="flex gap-2 flex-wrap">
              {molecules.map((m, i) => (
                <Button key={i} size="sm" variant={selectedMolecule === i ? "default" : "outline"} onClick={() => setSelectedMolecule(i)} className={selectedMolecule === i ? "bg-green-600" : "border-green-500/50 text-green-300"}>
                  {m.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'الجزيء المحدد', value: molecules[selectedMolecule].name.split(' ')[0], color: 'text-green-300' },
              { label: 'عدد الذرات', value: molecules[selectedMolecule].atoms.length, color: 'text-emerald-300' },
              { label: 'عدد الروابط', value: molecules[selectedMolecule].bonds.length, color: 'text-teal-300' },
            ]}
            formulas={[
              { name: 'الألكانات', formula: 'CₙH₂ₙ₊₂', description: 'الصيغة العامة للألكانات المشبعة' },
              { name: 'الألكينات', formula: 'CₙH₂ₙ', description: 'هيدروكربونات غير مشبعة برابطة مزدوجة' },
            ]}
            explanation="الكيمياء العضوية تدرس مركبات الكربون المتنوعة التي تشكل أساس الحياة. الكربون فريد بقدرته على تكوين 4 روابط وسلاسل طويلة ومتفرعة."
            facts={[
              'الكربون يكون 4 روابط تساهمية ويشكل ملايين المركبات',
              'البنزين اكتشفه فاراداي عام 1825 وبنيته الحلقية اقترحها كيكولي',
              'الكيمياء العضوية أساس صناعة الأدوية والبوليمرات والوقود',
              'جسم الإنسان يحتوي على أكثر من 100,000 مركب عضوي مختلف',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default OrganicChemistrySimulation;
