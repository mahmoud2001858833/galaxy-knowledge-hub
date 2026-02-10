import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface RobotState {
  x: number; y: number; angle: number; trail: { x: number; y: number }[];
  sensors: { left: number; front: number; right: number };
}

const GRID = 20;
const CELL = 25;

const RoboticsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'manual' | 'auto' | 'code'>('manual');
  const robotRef = useRef<RobotState>({ x: 2, y: 2, angle: 0, trail: [{ x: 2, y: 2 }], sensors: { left: 0, front: 0, right: 0 } });
  const obstaclesRef = useRef<Set<string>>(new Set());
  const [goalReached, setGoalReached] = useState(false);
  const goalPos = { x: 17, y: 17 };
  const [commands, setCommands] = useState('forward\nforward\nturn-right\nforward');
  const [steps, setSteps] = useState(0);

  // Generate obstacles
  useEffect(() => {
    const obs = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      if ((x === 2 && y === 2) || (x === goalPos.x && y === goalPos.y)) continue;
      obs.add(`${x},${y}`);
    }
    obstaclesRef.current = obs;
  }, []);

  const isBlocked = useCallback((x: number, y: number) => {
    return x < 0 || y < 0 || x >= GRID || y >= GRID || obstaclesRef.current.has(`${x},${y}`);
  }, []);

  const updateSensors = useCallback(() => {
    const r = robotRef.current;
    const dirs = [
      [[-1, 0], [0, -1], [1, 0]], // angle 0 (up): left=west, front=north, right=east
      [[0, -1], [1, 0], [0, 1]],  // angle 90
      [[1, 0], [0, 1], [-1, 0]],  // angle 180
      [[0, 1], [-1, 0], [0, -1]], // angle 270
    ];
    const idx = ((Math.round(r.angle / 90) % 4) + 4) % 4;
    const [ld, fd, rd] = dirs[idx];
    const sense = (dx: number, dy: number) => {
      let dist = 0;
      let cx = r.x, cy = r.y;
      while (dist < 5) { cx += dx; cy += dy; dist++; if (isBlocked(cx, cy)) return dist; }
      return 5;
    };
    r.sensors = { left: sense(ld[0], ld[1]), front: sense(fd[0], fd[1]), right: sense(rd[0], rd[1]) };
  }, [isBlocked]);

  const moveRobot = useCallback((action: 'forward' | 'turn-left' | 'turn-right') => {
    const r = robotRef.current;
    if (action === 'turn-left') { r.angle = (r.angle - 90 + 360) % 360; }
    else if (action === 'turn-right') { r.angle = (r.angle + 90) % 360; }
    else {
      const dx = Math.round(Math.sin(r.angle * Math.PI / 180));
      const dy = -Math.round(Math.cos(r.angle * Math.PI / 180));
      const nx = r.x + dx, ny = r.y + dy;
      if (!isBlocked(nx, ny)) {
        r.x = nx; r.y = ny;
        r.trail.push({ x: nx, y: ny });
      }
    }
    updateSensors();
    setSteps(s => s + 1);
    if (r.x === goalPos.x && r.y === goalPos.y) setGoalReached(true);
  }, [isBlocked, updateSensors]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width / 2, H = canvas.height / 2;
    ctx.clearRect(0, 0, W * 2, H * 2);
    ctx.save();

    const offsetX = (W - GRID * CELL) / 2;
    const offsetY = (H - GRID * CELL) / 2;
    ctx.translate(offsetX, offsetY);

    // Grid
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        ctx.fillStyle = obstaclesRef.current.has(`${x},${y}`) ? 'rgba(255,80,80,0.4)' : 'rgba(100,150,255,0.05)';
        ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
      }
    }

    // Goal
    ctx.fillStyle = 'rgba(74,222,128,0.6)';
    ctx.fillRect(goalPos.x * CELL, goalPos.y * CELL, CELL - 1, CELL - 1);
    ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎯', goalPos.x * CELL + CELL/2, goalPos.y * CELL + CELL/2 + 4);

    // Trail
    const r = robotRef.current;
    ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath();
    r.trail.forEach((p, i) => {
      const px = p.x * CELL + CELL / 2, py = p.y * CELL + CELL / 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Robot
    const rx = r.x * CELL + CELL / 2, ry = r.y * CELL + CELL / 2;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(r.angle * Math.PI / 180);
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(7, 7); ctx.lineTo(-7, 7);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Sensor lines
    const drawSensor = (dist: number, dx: number, dy: number) => {
      ctx.strokeStyle = dist < 2 ? 'rgba(255,100,100,0.5)' : 'rgba(100,255,100,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + dx * dist * CELL, ry + dy * dist * CELL);
      ctx.stroke();
    };
    const angleRad = r.angle * Math.PI / 180;
    drawSensor(r.sensors.front, Math.sin(angleRad), -Math.cos(angleRad));

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(2, 2);
  }, []);

  useEffect(() => {
    const animate = () => { draw(); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw, steps]);

  // Auto mode - wall follower
  useEffect(() => {
    if (!isPlaying || mode !== 'auto') return;
    const interval = setInterval(() => {
      const r = robotRef.current;
      updateSensors();
      if (r.sensors.right > 1) { moveRobot('turn-right'); moveRobot('forward'); }
      else if (r.sensors.front > 1) { moveRobot('forward'); }
      else { moveRobot('turn-left'); }
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, mode, moveRobot, updateSensors]);

  // Code execution
  const runCode = useCallback(() => {
    const lines = commands.split('\n').map(l => l.trim()).filter(l => l);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= lines.length) { clearInterval(interval); return; }
      const cmd = lines[i];
      if (cmd === 'forward') moveRobot('forward');
      else if (cmd === 'turn-left') moveRobot('turn-left');
      else if (cmd === 'turn-right') moveRobot('turn-right');
      i++;
    }, 400);
  }, [commands, moveRobot]);

  const reset = () => {
    robotRef.current = { x: 2, y: 2, angle: 0, trail: [{ x: 2, y: 2 }], sensors: { left: 0, front: 0, right: 0 } };
    setSteps(0); setGoalReached(false); setIsPlaying(false);
  };

  return (
    <SimulationLayout title="الروبوتات والتحكم" titleGradient="from-cyan-400 to-blue-400" backgroundGradient="from-slate-900 via-cyan-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-cyan-500/30 bg-slate-900/80" style={{ height: '520px' }} />
          {goalReached && <div className="text-center text-green-400 font-bold mt-2 text-lg">🎉 وصل الروبوت إلى الهدف! ({steps} خطوة)</div>}
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            {mode === 'manual' && (
              <>
                <Button size="sm" onClick={() => moveRobot('forward')} className="bg-cyan-600"><ArrowUp className="w-4 h-4" /></Button>
                <Button size="sm" onClick={() => moveRobot('turn-left')} className="bg-cyan-600"><ArrowLeft className="w-4 h-4" /></Button>
                <Button size="sm" onClick={() => moveRobot('turn-right')} className="bg-cyan-600"><ArrowRight className="w-4 h-4" /></Button>
              </>
            )}
            {mode === 'auto' && (
              <Button onClick={() => setIsPlaying(!isPlaying)} size="sm" className="bg-cyan-600">
                {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlaying ? 'إيقاف' : 'تشغيل تلقائي'}
              </Button>
            )}
            {mode === 'code' && (
              <Button onClick={runCode} size="sm" className="bg-cyan-600"><Play className="w-4 h-4 mr-1" /> تنفيذ الأوامر</Button>
            )}
            <Button onClick={reset} size="sm" variant="outline" className="border-cyan-500 text-cyan-400"><RotateCcw className="w-4 h-4 mr-1" /> إعادة</Button>
            {(['manual','auto','code'] as const).map(m => (
              <Button key={m} size="sm" onClick={() => setMode(m)} className={mode === m ? 'bg-blue-600' : 'bg-slate-700'}>
                {m === 'manual' ? 'يدوي' : m === 'auto' ? 'تلقائي' : 'برمجة'}
              </Button>
            ))}
          </div>
          {mode === 'code' && (
            <textarea value={commands} onChange={e => setCommands(e.target.value)}
              className="w-full mt-3 p-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-green-300 font-mono text-sm h-32"
              placeholder="forward / turn-left / turn-right" dir="ltr" />
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'الخطوات', value: steps, color: 'text-cyan-300' },
              { label: 'الموقع', value: `(${robotRef.current.x}, ${robotRef.current.y})`, color: 'text-blue-300' },
              { label: 'الاتجاه', value: `${robotRef.current.angle}°`, color: 'text-green-300' },
            ]}
            explanation="حرّك الروبوت يدوياً أو اكتب أوامر برمجية لتوجيهه نحو الهدف. في الوضع التلقائي يستخدم خوارزمية متابعة الجدار."
            facts={['أول روبوت صناعي استُخدم عام 1961 في مصنع جنرال موتورز', 'كلمة روبوت مشتقة من الكلمة التشيكية robota بمعنى العمل القسري']}
          />
          <QuizSection questions={[
            { question: 'ما أول خطوة في خوارزمية متابعة الجدار؟', options: ['التقدم', 'الدوران يميناً', 'فحص المستشعرات', 'التراجع'], correctIndex: 2, explanation: 'يجب فحص المستشعرات أولاً لمعرفة العوائق' },
            { question: 'ما نوع المستشعر الذي يقيس المسافة؟', options: ['حراري', 'فوق صوتي', 'ضوئي', 'مغناطيسي'], correctIndex: 1, explanation: 'المستشعر فوق الصوتي يرسل موجات ويقيس زمن الارتداد' },
          ]} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default RoboticsSimulation;
