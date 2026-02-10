import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

type ShapeType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';

const SpatialGeometrySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shape, setShape] = useState<ShapeType>('cube');
  const [size, setSize] = useState(100);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const angleRef = useRef(0);

  const getShapeInfo = useCallback(() => {
    const r = size;
    switch (shape) {
      case 'cube': return { volume: Math.pow(r, 3), surfaceArea: 6 * Math.pow(r, 2), name: 'مكعب' };
      case 'sphere': return { volume: (4/3) * Math.PI * Math.pow(r/2, 3), surfaceArea: 4 * Math.PI * Math.pow(r/2, 2), name: 'كرة' };
      case 'cylinder': return { volume: Math.PI * Math.pow(r/2, 2) * r, surfaceArea: 2 * Math.PI * (r/2) * (r/2 + r), name: 'أسطوانة' };
      case 'cone': return { volume: (1/3) * Math.PI * Math.pow(r/2, 2) * r, surfaceArea: Math.PI * (r/2) * ((r/2) + Math.sqrt(Math.pow(r/2, 2) + r*r)), name: 'مخروط' };
      case 'pyramid': return { volume: (1/3) * Math.pow(r, 2) * r, surfaceArea: Math.pow(r, 2) + 2 * r * Math.sqrt(Math.pow(r/2, 2) + r*r), name: 'هرم' };
    }
  }, [shape, size]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const angle = angleRef.current;
    const s = size * 0.8;

    // Grid
    ctx.strokeStyle = 'rgba(100,150,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      const x = cx + i * 40;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      const y = cy + i * 40;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);

    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const cosB = Math.cos(angle * 0.7), sinB = Math.sin(angle * 0.7);

    const project = (x: number, y: number, z: number): [number, number] => {
      const rx = x * cosA - z * sinA;
      const rz = x * sinA + z * cosA;
      const ry = y * cosB - rz * sinB;
      const scale = 300 / (300 + rz * sinA);
      return [rx * scale, ry * scale];
    };

    const drawEdge = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string) => {
      const [px1, py1] = project(x1, y1, z1);
      const [px2, py2] = project(x2, y2, z2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
    };

    const h = s / 2;
    if (shape === 'cube') {
      const v: [number, number, number][] = [
        [-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],
        [-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      edges.forEach(([a,b]) => drawEdge(...v[a], ...v[b], 'rgba(100,200,255,0.8)'));
      // Fill front face
      const faceVerts = [0,1,2,3].map(i => project(...v[i]));
      ctx.fillStyle = 'rgba(100,200,255,0.1)';
      ctx.beginPath();
      faceVerts.forEach(([x,y], i) => i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
      ctx.closePath(); ctx.fill();
    } else if (shape === 'sphere') {
      const r = s / 2;
      for (let lat = 0; lat < 12; lat++) {
        const theta1 = (lat / 12) * Math.PI;
        const theta2 = ((lat + 1) / 12) * Math.PI;
        for (let lon = 0; lon < 16; lon++) {
          const phi1 = (lon / 16) * 2 * Math.PI;
          const phi2 = ((lon + 1) / 16) * 2 * Math.PI;
          const x1 = r * Math.sin(theta1) * Math.cos(phi1);
          const y1 = r * Math.cos(theta1);
          const z1 = r * Math.sin(theta1) * Math.sin(phi1);
          const x2 = r * Math.sin(theta1) * Math.cos(phi2);
          const y2 = r * Math.cos(theta1);
          const z2 = r * Math.sin(theta1) * Math.sin(phi2);
          const x3 = r * Math.sin(theta2) * Math.cos(phi1);
          const y3 = r * Math.cos(theta2);
          const z3 = r * Math.sin(theta2) * Math.sin(phi1);
          drawEdge(x1, y1, z1, x2, y2, z2, 'rgba(255,150,100,0.4)');
          drawEdge(x1, y1, z1, x3, y3, z3, 'rgba(255,150,100,0.4)');
        }
      }
    } else if (shape === 'cylinder') {
      const r = s / 2;
      const segments = 20;
      for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * 2 * Math.PI;
        const a2 = ((i + 1) / segments) * 2 * Math.PI;
        const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
        const x2 = r * Math.cos(a2), z2 = r * Math.sin(a2);
        drawEdge(x1, -h, z1, x2, -h, z2, 'rgba(100,255,150,0.6)');
        drawEdge(x1, h, z1, x2, h, z2, 'rgba(100,255,150,0.6)');
        drawEdge(x1, -h, z1, x1, h, z1, 'rgba(100,255,150,0.3)');
      }
    } else if (shape === 'cone') {
      const r = s / 2;
      const segments = 20;
      for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * 2 * Math.PI;
        const a2 = ((i + 1) / segments) * 2 * Math.PI;
        const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
        const x2 = r * Math.cos(a2), z2 = r * Math.sin(a2);
        drawEdge(x1, h, z1, x2, h, z2, 'rgba(255,200,100,0.6)');
        drawEdge(x1, h, z1, 0, -h, 0, 'rgba(255,200,100,0.3)');
      }
    } else if (shape === 'pyramid') {
      const v: [number, number, number][] = [[-h,h,-h],[h,h,-h],[h,h,h],[-h,h,h],[0,-h,0]];
      const edges = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
      edges.forEach(([a,b]) => drawEdge(...v[a], ...v[b], 'rgba(200,100,255,0.7)'));
    }

    ctx.restore();

    // Info overlay
    const info = getShapeInfo();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 10, 200, 70);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`الشكل: ${info.name}`, 20, 30);
    ctx.fillText(`الحجم: ${info.volume.toFixed(1)}`, 20, 50);
    ctx.fillText(`المساحة: ${info.surfaceArea.toFixed(1)}`, 20, 70);
  }, [shape, size, getShapeInfo]);

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
      if (isPlaying) angleRef.current += 0.01 * rotationSpeed;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, draw, rotationSpeed]);

  const info = getShapeInfo();

  return (
    <SimulationLayout title="الهندسة الفراغية التفاعلية" titleGradient="from-indigo-400 to-purple-400" backgroundGradient="from-slate-900 via-indigo-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-indigo-500/30 bg-slate-900/80" style={{ height: '500px' }} />
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            <Button onClick={() => setIsPlaying(!isPlaying)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button onClick={() => { angleRef.current = 0; }} size="sm" variant="outline" className="border-indigo-500 text-indigo-400">
              <RotateCcw className="w-4 h-4 mr-1" /> إعادة
            </Button>
            {(['cube','sphere','cylinder','cone','pyramid'] as ShapeType[]).map(s => (
              <Button key={s} size="sm" onClick={() => setShape(s)} className={shape === s ? 'bg-purple-600' : 'bg-slate-700'}>
                {s === 'cube' ? 'مكعب' : s === 'sphere' ? 'كرة' : s === 'cylinder' ? 'أسطوانة' : s === 'cone' ? 'مخروط' : 'هرم'}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-indigo-500/30">
            <h3 className="text-sm font-bold text-indigo-300 mb-3">أدوات التحكم</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-400">الحجم: {size}</label>
                <Slider value={[size]} onValueChange={v => setSize(v[0])} min={40} max={180} step={5} className="mt-1" /></div>
              <div><label className="text-xs text-slate-400">سرعة الدوران: {rotationSpeed}x</label>
                <Slider value={[rotationSpeed]} onValueChange={v => setRotationSpeed(v[0])} min={0} max={5} step={0.5} className="mt-1" /></div>
            </div>
          </div>
          <InfoSection
            data={[
              { label: 'الشكل', value: info.name, color: 'text-indigo-300' },
              { label: 'الحجم', value: info.volume, unit: 'وحدة³', color: 'text-purple-300' },
              { label: 'مساحة السطح', value: info.surfaceArea, unit: 'وحدة²', color: 'text-cyan-300' },
            ]}
            explanation="الهندسة الفراغية تدرس الأشكال ثلاثية الأبعاد وخصائصها كالحجم ومساحة السطح. فهم هذه الخصائص أساسي في الهندسة المعمارية والتصنيع والتصميم."
            formulas={[
              { name: 'حجم المكعب', formula: 'V = a³', description: 'a = طول الضلع' },
              { name: 'حجم الكرة', formula: 'V = 4/3 πr³', description: 'r = نصف القطر' },
              { name: 'حجم الأسطوانة', formula: 'V = πr²h', description: 'r = نصف القطر، h = الارتفاع' },
              { name: 'حجم المخروط', formula: 'V = 1/3 πr²h', description: 'ثلث حجم الأسطوانة المقابلة' },
              { name: 'حجم الهرم', formula: 'V = 1/3 × مساحة القاعدة × h', description: 'h = الارتفاع العمودي' },
            ]}
            facts={[
              'الكرة هي الشكل الذي يحتوي أكبر حجم بالنسبة لمساحة سطحه - لذلك الفقاعات كروية',
              'الأهرامات المصرية مبنية بزاوية ميل 51.8 درجة تقريباً',
              'النحل يبني خلاياه بشكل سداسي لأنه يوفر أكبر مساحة بأقل مادة بناء',
              'قبة البانثيون في روما هي أكبر قبة خرسانية غير مسلحة حتى اليوم بقطر 43 متراً',
            ]}
          />
          <QuizSection questions={[
            { question: 'ما حجم مكعب طول ضلعه 3؟', options: ['9', '27', '18', '12'], correctIndex: 1, explanation: 'حجم المكعب = a³ = 3³ = 27 وحدة مكعبة' },
            { question: 'كم وجه للهرم رباعي القاعدة؟', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: '4 أوجه مثلثة جانبية + وجه واحد للقاعدة = 5 أوجه' },
            { question: 'ما نسبة حجم المخروط إلى الأسطوانة بنفس القاعدة والارتفاع؟', options: ['1/2', '1/3', '2/3', '1/4'], correctIndex: 1, explanation: 'حجم المخروط = 1/3 × حجم الأسطوانة عندما يكون لهما نفس نصف القطر والارتفاع' },
            { question: 'ما مساحة سطح كرة نصف قطرها 5؟', options: ['100π', '500/3 π', '25π', '50π'], correctIndex: 0, explanation: 'مساحة سطح الكرة = 4πr² = 4π(25) = 100π' },
            { question: 'أي شكل له أكبر نسبة حجم إلى مساحة سطح؟', options: ['المكعب', 'الكرة', 'الأسطوانة', 'الهرم'], correctIndex: 1, explanation: 'الكرة تحقق أكبر حجم بأقل مساحة سطح - وهذا هو سبب كروية الفقاعات' },
          ]} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SpatialGeometrySimulation;
