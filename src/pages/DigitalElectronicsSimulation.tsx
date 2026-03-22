import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Pause, RotateCcw, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DigitalElectronicsSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'gates' | 'adder' | 'counter' | 'memory'>('gates');
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (simulationType === 'gates') drawLogicGates(ctx, canvas);
      else if (simulationType === 'adder') drawHalfAdder(ctx, canvas);
      else if (simulationType === 'counter') drawCounter(ctx, canvas);
      else if (simulationType === 'memory') drawMemory(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.05);
      animationId = requestAnimationFrame(animate);
    };

    const drawGate = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, a: boolean, b: boolean) => {
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#2d4a3e';

      // Gate body
      ctx.beginPath();
      if (type === 'NOT') {
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x + 40, y);
        ctx.lineTo(x, y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 45, y, 5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === 'AND' || type === 'NAND') {
        ctx.rect(x, y - 25, 30, 50);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 30, y, 25, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        if (type === 'NAND') {
          ctx.beginPath();
          ctx.arc(x + 60, y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (type === 'OR' || type === 'NOR' || type === 'XOR') {
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.quadraticCurveTo(x + 20, y - 25, x + 50, y);
        ctx.quadraticCurveTo(x + 20, y + 25, x, y + 25);
        ctx.quadraticCurveTo(x + 15, y, x, y - 25);
        ctx.fill();
        ctx.stroke();
        if (type === 'NOR') {
          ctx.beginPath();
          ctx.arc(x + 55, y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (type === 'XOR') {
          ctx.beginPath();
          ctx.moveTo(x - 8, y - 25);
          ctx.quadraticCurveTo(x + 7, y, x - 8, y + 25);
          ctx.stroke();
        }
      }

      // Calculate output
      let output = false;
      if (type === 'AND') output = a && b;
      else if (type === 'OR') output = a || b;
      else if (type === 'NOT') output = !a;
      else if (type === 'NAND') output = !(a && b);
      else if (type === 'NOR') output = !(a || b);
      else if (type === 'XOR') output = a !== b;

      // Input lines
      ctx.strokeStyle = a ? '#4CAF50' : '#666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 30, y - 10);
      ctx.lineTo(x, y - 10);
      ctx.stroke();

      if (type !== 'NOT') {
        ctx.strokeStyle = b ? '#4CAF50' : '#666';
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
      }

      // Output line
      const outX = type === 'NOT' ? x + 50 : (type === 'NAND' || type === 'NOR' ? x + 65 : x + 55);
      ctx.strokeStyle = output ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.moveTo(outX, y);
      ctx.lineTo(outX + 30, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(type, x + 25, y + 45);
      ctx.fillText(output ? '1' : '0', outX + 40, y + 5);

      return output;
    };

    const drawLogicGates = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gates = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
      const startY = 80;

      // Input indicators
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`A = ${inputA ? '1' : '0'}`, 30, 40);
      ctx.fillText(`B = ${inputB ? '1' : '0'}`, 100, 40);

      // Input toggle buttons
      ctx.fillStyle = inputA ? '#4CAF50' : '#666';
      ctx.fillRect(70, 25, 20, 20);
      ctx.fillStyle = inputB ? '#4CAF50' : '#666';
      ctx.fillRect(140, 25, 20, 20);

      gates.forEach((gate, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 120 + col * 220;
        const y = startY + row * 180;
        drawGate(ctx, x, y, gate, inputA, inputB);
      });

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('البوابات المنطقية الأساسية', canvas.width / 2, canvas.height - 30);
    };

    const drawHalfAdder = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Inputs
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`A = ${inputA ? '1' : '0'}`, 100, centerY - 30);
      ctx.fillText(`B = ${inputB ? '1' : '0'}`, 100, centerY + 30);

      // XOR gate for Sum
      ctx.fillStyle = '#2d4a3e';
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX - 50, centerY - 50, 40, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('XOR', centerX - 50, centerY - 45);

      // AND gate for Carry
      ctx.fillStyle = '#2d4a3e';
      ctx.beginPath();
      ctx.ellipse(centerX - 50, centerY + 50, 40, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillText('AND', centerX - 50, centerY + 55);

      // Calculate outputs
      const sum = inputA !== inputB;
      const carry = inputA && inputB;

      // Wires
      ctx.lineWidth = 3;
      ctx.strokeStyle = inputA ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.moveTo(110, centerY - 30);
      ctx.lineTo(centerX - 90, centerY - 30);
      ctx.lineTo(centerX - 90, centerY - 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(110, centerY - 30);
      ctx.lineTo(centerX - 90, centerY - 30);
      ctx.lineTo(centerX - 90, centerY + 50);
      ctx.stroke();

      ctx.strokeStyle = inputB ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.moveTo(110, centerY + 30);
      ctx.lineTo(centerX - 100, centerY + 30);
      ctx.lineTo(centerX - 100, centerY - 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(110, centerY + 30);
      ctx.lineTo(centerX - 100, centerY + 30);
      ctx.lineTo(centerX - 100, centerY + 50);
      ctx.stroke();

      // Outputs
      ctx.strokeStyle = sum ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY - 50);
      ctx.lineTo(centerX + 100, centerY - 50);
      ctx.stroke();

      ctx.strokeStyle = carry ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY + 50);
      ctx.lineTo(centerX + 100, centerY + 50);
      ctx.stroke();

      // Output labels
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Sum = ${sum ? '1' : '0'}`, centerX + 110, centerY - 45);
      ctx.fillText(`Carry = ${carry ? '1' : '0'}`, centerX + 110, centerY + 55);

      // Title
      ctx.textAlign = 'center';
      ctx.fillText('نصف الجامع (Half Adder)', canvas.width / 2, 40);
      ctx.font = '14px monospace';
      ctx.fillText(`${inputA ? '1' : '0'} + ${inputB ? '1' : '0'} = ${carry ? '1' : '0'}${sum ? '1' : '0'}`, canvas.width / 2, canvas.height - 30);
    };

    const drawCounter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const count = Math.floor(time * 2) % 256;
      const binary = count.toString(2).padStart(8, '0');

      // Counter display
      ctx.fillStyle = '#222';
      ctx.fillRect(canvas.width / 2 - 200, 100, 400, 100);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 200, 100, 400, 100);

      // Binary display
      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = '#4CAF50';
      ctx.textAlign = 'center';
      ctx.fillText(binary, canvas.width / 2, 165);

      // Decimal display
      ctx.font = '24px monospace';
      ctx.fillText(`= ${count}`, canvas.width / 2, 195);

      // Bit indicators
      for (let i = 0; i < 8; i++) {
        const x = canvas.width / 2 - 175 + i * 50;
        const bit = binary[i] === '1';
        
        ctx.fillStyle = bit ? '#4CAF50' : '#333';
        ctx.beginPath();
        ctx.arc(x, 280, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4CAF50';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(`2^${7 - i}`, x, 320);
        ctx.fillText(`${Math.pow(2, 7 - i)}`, x, 340);
      }

      // Clock signal
      const clockX = 100;
      const clockY = 420;
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 600; i += 40) {
        const high = Math.floor((time * 50 + i) / 20) % 2 === 0;
        ctx.lineTo(clockX + i, clockY - (high ? 30 : 0));
        ctx.lineTo(clockX + i + 20, clockY - (high ? 30 : 0));
        ctx.lineTo(clockX + i + 20, clockY - (high ? 0 : 30));
        ctx.lineTo(clockX + i + 40, clockY - (high ? 0 : 30));
      }
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('إشارة الساعة (Clock)', clockX, clockY + 30);

      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('عداد 8-بت', canvas.width / 2, 40);
    };

    const drawMemory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const memoryData: number[] = [];
      for (let i = 0; i < 8; i++) {
        memoryData.push(Math.floor(Math.sin(time + i) * 127 + 128));
      }

      // Memory grid
      const startX = 150;
      const startY = 100;
      const cellW = 80;
      const cellH = 40;

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('العنوان', startX - 50, startY - 20);
      ctx.fillText('البيانات (ثنائي)', startX + cellW * 2, startY - 20);
      ctx.fillText('عشري', startX + cellW * 4, startY - 20);

      for (let i = 0; i < 8; i++) {
        const y = startY + i * cellH;
        const data = memoryData[i];
        const binary = data.toString(2).padStart(8, '0');

        // Address
        ctx.fillStyle = '#333';
        ctx.fillRect(startX - 40, y, 60, cellH - 2);
        ctx.fillStyle = '#4CAF50';
        ctx.font = '12px monospace';
        ctx.fillText(`0x${i.toString(16).toUpperCase()}`, startX - 10, y + 25);

        // Binary data cells
        for (let j = 0; j < 8; j++) {
          const bit = binary[j] === '1';
          ctx.fillStyle = bit ? '#4CAF50' : '#222';
          ctx.fillRect(startX + 30 + j * 30, y, 28, cellH - 2);
          ctx.strokeStyle = '#4CAF50';
          ctx.strokeRect(startX + 30 + j * 30, y, 28, cellH - 2);
          ctx.fillStyle = bit ? '#000' : '#4CAF50';
          ctx.fillText(binary[j], startX + 44 + j * 30, y + 25);
        }

        // Decimal value
        ctx.fillStyle = '#333';
        ctx.fillRect(startX + 280, y, 60, cellH - 2);
        ctx.fillStyle = '#f39c12';
        ctx.fillText(data.toString(), startX + 310, y + 25);
      }

      // Read/Write indicator
      const rwY = startY + Math.floor(time * 2) % 8 * cellH;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX + 28, rwY - 2, 246, cellH + 2);
      ctx.fillStyle = '#e74c3c';
      ctx.font = '12px Arial';
      ctx.fillText('← قراءة', startX + 360, rwY + 25);

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('خلية ذاكرة 8-بت', canvas.width / 2, 40);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, inputA, inputB, time]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check input toggle areas
    if (y >= 25 && y <= 45) {
      if (x >= 70 && x <= 90) setInputA(!inputA);
      if (x >= 140 && x <= 160) setInputB(!inputB);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}>
            <ArrowLeft className="h-5 w-5 ml-2" />
            {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'رجوع'}
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-500" />
            الإلكترونيات الرقمية
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-4 border">
              <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg cursor-pointer" onClick={handleCanvasClick} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold mb-3">المحاكاة</h3>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="gates" className="text-xs">بوابات</TabsTrigger>
                  <TabsTrigger value="adder" className="text-xs">جامع</TabsTrigger>
                  <TabsTrigger value="counter" className="text-xs">عداد</TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs">ذاكرة</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {(simulationType === 'gates' || simulationType === 'adder') && (
              <div className="bg-card rounded-xl p-4 border space-y-2">
                <h3 className="font-semibold">المدخلات</h3>
                <div className="flex gap-4">
                  <Button variant={inputA ? 'default' : 'outline'} onClick={() => setInputA(!inputA)}>
                    A = {inputA ? '1' : '0'}
                  </Button>
                  <Button variant={inputB ? 'default' : 'outline'} onClick={() => setInputB(!inputB)}>
                    B = {inputB ? '1' : '0'}
                  </Button>
                </div>
              </div>
            )}

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
                {simulationType === 'gates' && <p>• البوابات المنطقية أساس الحوسبة</p>}
                {simulationType === 'adder' && <p>• نصف الجامع يجمع بتين</p>}
                {simulationType === 'counter' && <p>• العداد يعد بالنظام الثنائي</p>}
                {simulationType === 'memory' && <p>• الذاكرة تخزن البيانات</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalElectronicsSimulation;
