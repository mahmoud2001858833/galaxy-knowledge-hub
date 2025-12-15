import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Plus, Trash2, RotateCcw, Eye, Grid, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOpticsPhysics, OpticalElement } from '@/hooks/useOpticsPhysics';
import StarField from '@/components/StarField';

const ELEMENT_TYPES = [
  { type: 'light-source', name: 'مصدر ضوء', icon: '💡' },
  { type: 'convex-lens', name: 'عدسة محدبة', icon: '🔍' },
  { type: 'concave-lens', name: 'عدسة مقعرة', icon: '👓' },
  { type: 'plane-mirror', name: 'مرآة مستوية', icon: '🪞' },
  { type: 'convex-mirror', name: 'مرآة محدبة', icon: '🔵' },
  { type: 'concave-mirror', name: 'مرآة مقعرة', icon: '🔴' },
  { type: 'prism', name: 'منشور', icon: '🔺' },
] as const;

const OpticsLabSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state,
    calculations,
    addElement,
    removeElement,
    updateElement,
    selectElement,
    setWavelength,
    toggleGrid,
    updateRays,
    clearAll
  } = useOpticsPhysics();

  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  // Draw the optics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw optical axis
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw elements
    state.elements.forEach(element => {
      const isSelected = element.id === state.selectedElement;
      
      ctx.save();
      ctx.translate(element.x, element.y);

      if (element.type === 'light-source') {
        // Draw light source
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (element.type.includes('lens')) {
        // Draw lens
        ctx.strokeStyle = isSelected ? '#00ff00' : '#00aaff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (element.type === 'convex-lens') {
          ctx.ellipse(0, 0, 8, 50, 0, 0, Math.PI * 2);
        } else {
          ctx.moveTo(-5, -50);
          ctx.quadraticCurveTo(5, 0, -5, 50);
          ctx.moveTo(5, -50);
          ctx.quadraticCurveTo(-5, 0, 5, 50);
        }
        ctx.stroke();
      } else if (element.type.includes('mirror')) {
        // Draw mirror
        ctx.strokeStyle = isSelected ? '#00ff00' : '#silver';
        ctx.lineWidth = 4;
        ctx.beginPath();
        
        if (element.type === 'plane-mirror') {
          ctx.moveTo(0, -50);
          ctx.lineTo(0, 50);
        } else if (element.type === 'concave-mirror') {
          ctx.arc(30, 0, 50, Math.PI * 0.7, Math.PI * 1.3);
        } else {
          ctx.arc(-30, 0, 50, -Math.PI * 0.3, Math.PI * 0.3);
        }
        ctx.stroke();
      } else if (element.type === 'prism') {
        // Draw prism
        ctx.fillStyle = isSelected ? 'rgba(0,255,0,0.3)' : 'rgba(100,200,255,0.3)';
        ctx.strokeStyle = isSelected ? '#00ff00' : '#00aaff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(35, 40);
        ctx.lineTo(-35, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw rays
    state.rays.forEach(ray => {
      ctx.strokeStyle = ray.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = ray.color;
      ctx.shadowBlur = 5;

      ray.segments.forEach(segment => {
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.lineTo(segment.x2, segment.y2);
        ctx.stroke();
      });

      ctx.shadowBlur = 0;
    });
  }, [state]);

  // Update rays when elements change
  useEffect(() => {
    updateRays();
  }, [state.elements, state.wavelength, updateRays]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on an element
    const clickedElement = state.elements.find(el => 
      Math.hypot(el.x - x, el.y - y) < 30
    );

    if (clickedElement) {
      selectElement(clickedElement.id);
    } else {
      selectElement(null);
    }
  };

  const handleAddElement = (type: OpticalElement['type']) => {
    addElement({
      type,
      x: 400,
      y: 200,
      focalLength: 100,
      angle: 0,
      width: 20,
      height: 100
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <StarField starCount={150} speed={0.2} />

      <div className="relative z-10">
        <motion.header 
          className="p-4 border-b border-border/50 backdrop-blur-md bg-background/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/scientific-simulations')} className="gap-2">
              <ArrowLeft size={20} />
              العودة
            </Button>
            <div className="flex items-center gap-3">
              <Lightbulb className="text-yellow-400" size={28} />
              <h1 className="text-xl font-bold">مختبر البصريات التفاعلي</h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <Card className="bg-card/80 backdrop-blur-md">
                <CardContent className="p-4">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full rounded-lg border border-border cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                  
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {ELEMENT_TYPES.map(el => (
                      <Button
                        key={el.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddElement(el.type as OpticalElement['type'])}
                        className="gap-2"
                      >
                        <span>{el.icon}</span>
                        {el.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Card className="bg-card/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles size={18} />
                    التحكم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">الطول الموجي (nm)</label>
                    <Slider
                      value={[state.wavelength]}
                      onValueChange={([v]) => setWavelength(v)}
                      min={380}
                      max={700}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span style={{ color: '#8B00FF' }}>بنفسجي</span>
                      <span>{state.wavelength} nm</span>
                      <span style={{ color: '#FF0000' }}>أحمر</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleGrid} className="flex-1">
                      <Grid size={16} className="mr-1" />
                      الشبكة
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearAll} className="flex-1">
                      <Trash2 size={16} className="mr-1" />
                      مسح
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {calculations && (
                <Card className="bg-card/80 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">القياسات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>النوع: {calculations.type}</p>
                      <p>البعد البؤري: {calculations.focalLength} mm</p>
                      <p>القوة: {calculations.power.toFixed(2)} D</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye size={18} />
                    المعلومات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="laws">
                    <TabsList className="w-full">
                      <TabsTrigger value="laws" className="flex-1">القوانين</TabsTrigger>
                      <TabsTrigger value="tips" className="flex-1">نصائح</TabsTrigger>
                    </TabsList>
                    <TabsContent value="laws" className="text-sm space-y-2">
                      <p><strong>قانون سنل:</strong> n₁sin(θ₁) = n₂sin(θ₂)</p>
                      <p><strong>معادلة العدسات:</strong> 1/f = 1/do + 1/di</p>
                      <p><strong>التكبير:</strong> M = -di/do</p>
                    </TabsContent>
                    <TabsContent value="tips" className="text-sm space-y-2">
                      <p>• اضغط على عنصر لتحديده</p>
                      <p>• غيّر الطول الموجي لرؤية التشتت</p>
                      <p>• المنشور يفرق ألوان الضوء</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticsLabSimulation;
