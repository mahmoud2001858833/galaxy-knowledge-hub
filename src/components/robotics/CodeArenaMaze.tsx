import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Trophy, 
  Play, 
  RotateCcw, 
  Zap, 
  Flame, 
  Award, 
  Gauge, 
  Timer, 
  Compass, 
  Layers, 
  Sparkles,
  Swords,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  rank: number;
  botName: string;
  studentName: string;
  algorithm: string;
  timeMs: number;
  steps: number;
  efficiency: number;
  score: number;
}

const ARENA_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, botName: 'Falcon_A_Star_v3', studentName: 'أحمد القضاة', algorithm: 'A* Heuristic (Manhattan)', timeMs: 420, steps: 38, efficiency: 98.4, score: 2950 },
  { rank: 2, botName: 'OptiRover_BFS', studentName: 'سارة الزعبي', algorithm: 'Bi-directional BFS', timeMs: 480, steps: 41, efficiency: 96.1, score: 2840 },
  { rank: 3, botName: 'WallClimber_Right', studentName: 'عمر النجار', algorithm: 'Modified Wall-Follower', timeMs: 680, steps: 58, efficiency: 89.2, score: 2510 },
  { rank: 4, botName: 'CyberAnt_Micro', studentName: 'ليان الحنيطي', algorithm: 'Dijkstra Grid Search', timeMs: 710, steps: 62, efficiency: 87.5, score: 2420 },
  { rank: 5, botName: 'Nexus_Reactive', studentName: 'محمد البشير', algorithm: 'Dynamic Reactive Bounce', timeMs: 950, steps: 84, efficiency: 78.0, score: 2100 },
];

const MAZE_SIZE = 16;

export const CodeArenaMaze: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedAlgo, setSelectedAlgo] = useState<'astar' | 'wall' | 'bfs'>('astar');
  const [isDuelMode, setIsDuelMode] = useState<boolean>(true);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceComplete, setRaceComplete] = useState<boolean>(false);
  
  // Real-time race metrics
  const [stepsA, setStepsA] = useState<number>(0);
  const [stepsB, setStepsB] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);

  // Maze grid: 0 = empty, 1 = obstacle, 2 = start, 3 = goal
  const [maze, setMaze] = useState<number[][]>(() => generateMaze());

  function generateMaze(): number[][] {
    const grid: number[][] = Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(0));
    // Perimeter walls
    for (let i = 0; i < MAZE_SIZE; i++) {
      grid[0][i] = 1;
      grid[MAZE_SIZE - 1][i] = 1;
      grid[i][0] = 1;
      grid[i][MAZE_SIZE - 1] = 1;
    }

    // Static maze inner corridors
    const obstacles = [
      [2, 3], [2, 4], [2, 5], [2, 8], [2, 9], [2, 10], [2, 11],
      [4, 1], [4, 2], [4, 4], [4, 5], [4, 7], [4, 8], [4, 12], [4, 13],
      [6, 3], [6, 4], [6, 6], [6, 7], [6, 9], [6, 10], [6, 11], [6, 13],
      [8, 2], [8, 5], [8, 6], [8, 8], [8, 11], [8, 12], [8, 14],
      [10, 1], [10, 3], [10, 4], [10, 7], [10, 8], [10, 10], [10, 13],
      [12, 2], [12, 5], [12, 6], [12, 9], [12, 11], [12, 12], [12, 14],
      [13, 7], [13, 8], [14, 4], [14, 10]
    ];

    obstacles.forEach(([r, c]) => {
      if (r < MAZE_SIZE && c < MAZE_SIZE) grid[r][c] = 1;
    });

    // Start & Goal
    grid[1][1] = 2; // Start
    grid[MAZE_SIZE - 2][MAZE_SIZE - 2] = 3; // Goal
    return grid;
  }

  // Visual simulation runner
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / MAZE_SIZE;

    // Robot Positions
    let posA = { x: 1, y: 1 };
    let posB = { x: 1, y: 1 };
    const goal = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };

    let timer: NodeJS.Timeout | null = null;
    let stepCountA = 0;
    let stepCountB = 0;
    let startTime = Date.now();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Cells
      for (let r = 0; r < MAZE_SIZE; r++) {
        for (let c = 0; c < MAZE_SIZE; c++) {
          const x = c * cellSize;
          const y = r * cellSize;

          if (maze[r][c] === 1) {
            // Wall
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(x, y, cellSize, cellSize);
          } else if (r === goal.y && c === goal.x) {
            // Goal Flag
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
          } else if (r === 1 && c === 1) {
            // Start
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.fillRect(x, y, cellSize, cellSize);
          } else {
            // Corridor
            ctx.fillStyle = '#0a0f1d';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }

      // Draw Robot A (Cyan / A*)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(posA.x * cellSize + cellSize / 2, posA.y * cellSize + cellSize / 2, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a5f3fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Robot B (Orange / Wall Follower) in Duel Mode
      if (isDuelMode) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(posB.x * cellSize + cellSize / 2, posB.y * cellSize + cellSize / 2, cellSize * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    drawGrid();

    if (isRacing) {
      timer = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);

        // Advance Robot A towards goal (A* simulated intelligent direct vector)
        if (posA.x !== goal.x || posA.y !== goal.y) {
          const nextStep = getNextStep(posA, goal, maze, 'astar');
          posA = nextStep;
          stepCountA++;
          setStepsA(stepCountA);
        }

        // Advance Robot B (Wall-follower simulated longer path)
        if (isDuelMode && (posB.x !== goal.x || posB.y !== goal.y)) {
          const nextStep = getNextStep(posB, goal, maze, 'wall');
          posB = nextStep;
          stepCountB++;
          setStepsB(stepCountB);
        }

        drawGrid();

        // Check Winner
        if (posA.x === goal.x && posA.y === goal.y) {
          setWinner('A');
          setIsRacing(false);
          setRaceComplete(true);
          toast({
            title: "🏆 فوز ساحق للروبوت (A) بخوارزمية A*!",
            description: `وصل إلى خط النهاية في ${stepCountA} خطوة بمسار فائق الذكاء.`
          });
        } else if (isDuelMode && posB.x === goal.x && posB.y === goal.y) {
          setWinner('B');
          setIsRacing(false);
          setRaceComplete(true);
        }
      }, 90);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRacing, maze, isDuelMode]);

  // Simple heuristic step selector for simulation
  function getNextStep(
    current: { x: number; y: number },
    target: { x: number; y: number },
    grid: number[][],
    type: 'astar' | 'wall'
  ): { x: number; y: number } {
    const directions = [
      { x: 0, y: 1 },  // Down
      { x: 1, y: 0 },  // Right
      { x: 0, y: -1 }, // Up
      { x: -1, y: 0 }  // Left
    ];

    if (type === 'astar') {
      // Prioritize moves with lowest Manhattan distance to target that are not walls
      const valid = directions
        .map(d => ({ x: current.x + d.x, y: current.y + d.y }))
        .filter(p => p.x >= 0 && p.x < MAZE_SIZE && p.y >= 0 && p.y < MAZE_SIZE && grid[p.y][p.x] !== 1);

      valid.sort((a, b) => {
        const distA = Math.abs(a.x - target.x) + Math.abs(a.y - target.y);
        const distB = Math.abs(b.x - target.x) + Math.abs(b.y - target.y);
        return distA - distB;
      });

      return valid[0] || current;
    } else {
      // Wall follower tendency: explores right side or forward
      const valid = directions
        .map(d => ({ x: current.x + d.x, y: current.y + d.y }))
        .filter(p => p.x >= 0 && p.x < MAZE_SIZE && p.y >= 0 && p.y < MAZE_SIZE && grid[p.y][p.x] !== 1);

      return valid[Math.floor(Math.random() * valid.length)] || current;
    }
  }

  const handleStartRace = () => {
    setStepsA(0);
    setStepsB(0);
    setTimeElapsed(0);
    setWinner(null);
    setRaceComplete(false);
    setIsRacing(true);
  };

  const handleResetRace = () => {
    setIsRacing(false);
    setStepsA(0);
    setStepsB(0);
    setTimeElapsed(0);
    setWinner(null);
    setRaceComplete(false);
    setMaze(generateMaze());
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header and Arena Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
            <Swords className="w-3.5 h-3.5" />
            <span>حلبة الأكواد والمنافسات الافتراضية (Code Arena & Robot Duel)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            حلبة برمجة روبوتات المتاهة الذاتية (Autonomous Maze Arena)
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
            ارفع كودك البرمجي، اختر خوارزمية التوجيه، ونافس روبوتات زملائك على لقب أسرع وأكفأ مناورة بالذكاء الاصطناعي.
          </p>
        </div>

        {/* Duel Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={isDuelMode ? 'default' : 'outline'}
            onClick={() => setIsDuelMode(!isDuelMode)}
            className="text-xs rounded-xl font-bold gap-1.5"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{isDuelMode ? 'مواجهة ثنائية (Duel Active)' : 'سباق فردي'}</span>
          </Button>
        </div>
      </div>

      {/* Main Arena Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Maze Canvas */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isRacing ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                مضمار المتاهة الافتراضية (Grid Resolution: 16x16)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleStartRace}
                disabled={isRacing}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-xl font-bold gap-1 shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>إطلاق السباق</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetRace}
                className="text-xs rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة ضبط
              </Button>
            </div>
          </div>

          {/* Canvas Display */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="w-full max-w-[460px] h-auto rounded-xl"
            />
          </div>

          {/* Real-time Race Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {/* Bot A (A*) */}
            <div className="p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 space-y-1">
              <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                روبوت A (خوارزمية A*)
              </span>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>الخطوات:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{stepsA}</span>
              </div>
            </div>

            {/* Bot B (Wall Follower) */}
            <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 space-y-1">
              <span className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                روبوت B (متبع الجدران)
              </span>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>الخطوات:</span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-300">{stepsB}</span>
              </div>
            </div>

            {/* Time Elapsed */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-500" />
                زمن السباق
              </span>
              <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                {(timeElapsed / 1000).toFixed(2)} ثانية
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard & Monthly Hackathon */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monthly Hackathon Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-500 text-slate-950 font-black text-[11px]">
                هاكاثون الروبوتات الشهري ⚡
              </Badge>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                بقي 8 أيام
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              تحدي إنقاذ الضحايا في المتاهة المعتمة (Search & Rescue Maze)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              قم بكتابة خوارزمية ذكاء اصطناعي تعتمد على استشعار المسافات ورسم الخريطة لاكتشاف مكان الهدف والعودة لنقطة البداية بأقل استهلاك للطاقة.
            </p>
            <div className="pt-1">
              <Button
                size="sm"
                onClick={() => toast({ title: "تم تسجيلك في الهاكاثون بنجاح! 🚀", description: "ستتلقى تفاصيل المسار وملفات الاختبار في صندوق بريدك." })}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                تسجيل ومشاركة الكود في التحدي
              </Button>
            </div>
          </div>

          {/* Arena Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  لوحة الشرف لأفضل خوارزميات الحلبة (Leaderboard)
                </h4>
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                مباشر
              </Badge>
            </div>

            <div className="space-y-2.5">
              {ARENA_LEADERBOARD.map(entry => (
                <div
                  key={entry.rank}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      entry.rank === 1 ? 'bg-amber-400 text-slate-950' :
                      entry.rank === 2 ? 'bg-slate-300 text-slate-900' :
                      entry.rank === 3 ? 'bg-amber-700 text-white' :
                      'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {entry.rank}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-mono text-[11px]">
                        {entry.botName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {entry.studentName} • {entry.algorithm}
                      </span>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                      {entry.score} pts
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {entry.steps} steps ({entry.timeMs}ms)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
