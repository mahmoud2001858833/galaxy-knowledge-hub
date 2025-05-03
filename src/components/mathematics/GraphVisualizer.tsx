
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { toast } from 'sonner';

// Function to evaluate a mathematical equation
const evaluateEquation = (equation: string, x: number): number => {
  try {
    // Replace x^2 with x**2 for JavaScript's power operator
    const jsEquation = equation
      .replace(/x\^(\d+)/g, 'Math.pow(x,$1)')
      .replace(/x/g, x.toString());
    
    // eslint-disable-next-line no-new-func
    return new Function('x', 'Math', `return ${jsEquation}`)(x, Math);
  } catch (error) {
    console.error('Error evaluating equation:', error);
    return NaN;
  }
};

// Function to find intersection point between two equations
const findIntersection = (eq1: string, eq2: string): [number, number] | null => {
  // Simple approximation method for finding intersection
  // This is a basic approach and might not work for all equations
  const step = 0.1;
  let x = -10;
  
  while (x <= 10) {
    const y1 = evaluateEquation(eq1, x);
    const y2 = evaluateEquation(eq2, x);
    
    if (Math.abs(y1 - y2) < 0.1) {
      // Found an approximate intersection
      return [parseFloat(x.toFixed(2)), parseFloat(y1.toFixed(2))];
    }
    
    x += step;
  }
  
  return null;
};

const GraphVisualizer: React.FC = () => {
  const [equation1, setEquation1] = useState('x^2');
  const [equation2, setEquation2] = useState('2*x + 3');
  const [data, setData] = useState<Array<{ x: number; y1: number; y2: number }>>([]);
  const [intersectionPoint, setIntersectionPoint] = useState<[number, number] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate data points for the graph
  useEffect(() => {
    const newData: Array<{ x: number; y1: number; y2: number }> = [];
    
    // Generate 100 data points from -10 to 10
    for (let i = -10; i <= 10; i += 0.2) {
      const x = parseFloat(i.toFixed(1));
      const y1 = evaluateEquation(equation1, x);
      const y2 = evaluateEquation(equation2, x);
      
      if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1) < 100 && Math.abs(y2) < 100) {
        newData.push({ x, y1, y2 });
      }
    }
    
    setData(newData);
    
    // Find intersection point
    const intersection = findIntersection(equation1, equation2);
    setIntersectionPoint(intersection);
    
    // Draw curves on canvas (for a more detailed visualization)
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 20; // 20 pixels per unit
        
        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Draw equation 1
        ctx.beginPath();
        ctx.strokeStyle = '#33C3F0';
        ctx.lineWidth = 2;
        
        let isFirstPoint = true;
        for (let i = -canvas.width / (2 * scale); i <= canvas.width / (2 * scale); i += 0.05) {
          const x = i;
          const y = evaluateEquation(equation1, x);
          
          if (isNaN(y) || Math.abs(y) > canvas.height / (2 * scale)) {
            isFirstPoint = true;
            continue;
          }
          
          const canvasX = centerX + x * scale;
          const canvasY = centerY - y * scale;
          
          if (isFirstPoint) {
            ctx.moveTo(canvasX, canvasY);
            isFirstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.stroke();
        
        // Draw equation 2
        ctx.beginPath();
        ctx.strokeStyle = '#9b87f5';
        ctx.lineWidth = 2;
        
        isFirstPoint = true;
        for (let i = -canvas.width / (2 * scale); i <= canvas.width / (2 * scale); i += 0.05) {
          const x = i;
          const y = evaluateEquation(equation2, x);
          
          if (isNaN(y) || Math.abs(y) > canvas.height / (2 * scale)) {
            isFirstPoint = true;
            continue;
          }
          
          const canvasX = centerX + x * scale;
          const canvasY = centerY - y * scale;
          
          if (isFirstPoint) {
            ctx.moveTo(canvasX, canvasY);
            isFirstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.stroke();
        
        // Draw intersection point
        if (intersectionPoint) {
          const [ix, iy] = intersectionPoint;
          ctx.beginPath();
          ctx.fillStyle = '#FFFFFF';
          ctx.arc(
            centerX + ix * scale,
            centerY - iy * scale,
            5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }, [equation1, equation2]);
  
  const handleGraph = () => {
    try {
      // Test if equations are valid
      if (isNaN(evaluateEquation(equation1, 0)) || isNaN(evaluateEquation(equation2, 0))) {
        toast.error('المعادلات غير صالحة. يرجى التحقق من الصيغة.');
        return;
      }
      
      // Update will happen automatically through useEffect
      toast.success('تم رسم المعادلات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة رسم المعادلات');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-right">التمثيل البياني للمعادلات</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="x"
                  type="number"
                  domain={[-10, 10]}
                  tickCount={11}
                  stroke="rgba(255,255,255,0.5)"
                />
                <YAxis 
                  domain={[-10, 10]} 
                  tickCount={11}
                  stroke="rgba(255,255,255,0.5)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2C', 
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                  formatter={(value: number) => [value.toFixed(2), '']}
                  labelFormatter={(label) => `x = ${label}`}
                />
                <Legend />
                <Line
                  name={`y = ${equation1}`}
                  type="monotone"
                  dataKey="y1"
                  stroke="#33C3F0"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  name={`y = ${equation2}`}
                  type="monotone"
                  dataKey="y2"
                  stroke="#9b87f5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {intersectionPoint && (
                  <ReferenceDot
                    x={intersectionPoint[0]}
                    y={intersectionPoint[1]}
                    r={6}
                    fill="#FFFFFF"
                    stroke="none"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <canvas 
            ref={canvasRef} 
            width={500}
            height={300}
            className="w-full mt-6 rounded-lg bg-white/5 border border-white/10"
          />
        </div>
        
        <div className="order-1 lg:order-2">
          <div className="bg-space-cosmic-black/50 backdrop-blur-sm p-6 rounded-2xl border border-space-neon-blue/30 shadow-lg shadow-space-neon-blue/10">
            <h3 className="text-xl font-semibold text-white mb-6 text-right">إدخال المعادلات</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white block text-right" htmlFor="equation1">المعادلة الأولى</Label>
                <Input
                  id="equation1"
                  value={equation1}
                  onChange={(e) => setEquation1(e.target.value)}
                  className="bg-white/10 border-white/20 text-white text-right"
                  placeholder="مثال: x^2"
                />
                <p className="text-white/50 text-sm text-right">
                  يمكنك استخدام x للمتغير، + للجمع، - للطرح، * للضرب، / للقسمة، ^ للأس
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white block text-right" htmlFor="equation2">المعادلة الثانية</Label>
                <Input
                  id="equation2"
                  value={equation2}
                  onChange={(e) => setEquation2(e.target.value)}
                  className="bg-white/10 border-white/20 text-white text-right"
                  placeholder="مثال: 2*x + 3"
                />
              </div>
              
              <Button 
                onClick={handleGraph}
                className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
              >
                رسم المعادلات
              </Button>
            </div>
            
            {intersectionPoint && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white mb-2 text-right">نقطة التقاطع</h4>
                <p className="text-space-neon-blue text-right">
                  ({intersectionPoint[0]}, {intersectionPoint[1]})
                </p>
                <p className="text-white/70 text-sm mt-2 text-right">
                  تتقاطع المعادلتان عند النقطة التي تكون فيها قيمة y متساوية لكلا المعادلتين
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
