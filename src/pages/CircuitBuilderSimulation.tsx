import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Play, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCircuitSimulation, ComponentType } from '@/hooks/useCircuitSimulation';
import StarField from '@/components/StarField';

const COMPONENTS = [
  { type: 'battery' as ComponentType, name: 'بطارية', icon: '🔋', color: '#FFD700' },
  { type: 'resistor' as ComponentType, name: 'مقاومة', icon: 'Ω', color: '#8B4513' },
  { type: 'bulb' as ComponentType, name: 'مصباح', icon: '💡', color: '#FFA500' },
  { type: 'led' as ComponentType, name: 'LED', icon: '🔴', color: '#FF0000' },
  { type: 'switch' as ComponentType, name: 'مفتاح', icon: '⏻', color: '#4CAF50' },
  { type: 'ammeter' as ComponentType, name: 'أميتر', icon: 'A', color: '#2196F3' },
  { type: 'voltmeter' as ComponentType, name: 'فولتميتر', icon: 'V', color: '#9C27B0' },
  { type: 'capacitor' as ComponentType, name: 'مكثف', icon: '⊢⊣', color: '#00BCD4' },
  { type: 'motor' as ComponentType, name: 'محرك', icon: '⚙️', color: '#607D8B' },
];

const CircuitBuilderSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    toggleSwitch,
    runSimulation,
    stopSimulation,
    clearCircuit,
    loadPreset,
    getComponentInfo
  } = useCircuitSimulation();

  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw components
    state.components.forEach(comp => {
      const info = getComponentInfo(comp.type);
      const isSelected = comp.id === state.selectedComponent;
      const measurement = state.measurements.find(m => m.componentId === comp.id);

      ctx.save();
      ctx.translate(comp.x, comp.y);

      // Selection glow
      if (isSelected) {
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
      }

      // Component body
      ctx.fillStyle = isSelected ? '#2a4a2a' : '#2a2a3e';
      ctx.strokeStyle = isSelected ? '#00ff00' : '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-30, -20, 60, 40, 8);
      ctx.fill();
      ctx.stroke();

      // Component icon/symbol
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(info.symbol, 0, 0);

      // Value label
      ctx.font = '10px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${comp.value}${info.unit}`, 0, 25);

      // Switch state indicator
      if (comp.type === 'switch') {
        ctx.fillStyle = comp.isOn ? '#4CAF50' : '#f44336';
        ctx.beginPath();
        ctx.arc(20, -10, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Measurement display
      if (state.isSimulating && measurement) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '9px Arial';
        if (comp.type === 'ammeter') {
          ctx.fillText(`${measurement.current.toFixed(3)}A`, 0, -30);
        } else if (comp.type === 'voltmeter') {
          ctx.fillText(`${measurement.voltage.toFixed(2)}V`, 0, -30);
        }
      }

      // Bulb glow when on
      if (comp.type === 'bulb' && state.isSimulating && !state.shortCircuit && state.totalCurrent > 0) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20 + state.totalCurrent * 5;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Short circuit warning
    if (state.shortCircuit) {
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ دائرة قصر! ⚠️', canvas.width / 2, 30);
    }
  }, [state, getComponentInfo]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedType) {
      addComponent(draggedType, x, y);
      setDraggedType(null);
      return;
    }

    const clicked = state.components.find(c => 
      Math.abs(c.x - x) < 35 && Math.abs(c.y - y) < 25
    );

    if (clicked) {
      if (clicked.type === 'switch') {
        toggleSwitch(clicked.id);
      } else {
        selectComponent(clicked.id);
      }
    } else {
      selectComponent(null);
    }
  };

  const selectedComp = state.components.find(c => c.id === state.selectedComponent);

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
              <Zap className="text-yellow-400" size={28} />
              <h1 className="text-xl font-bold">معمل بناء الدوائر الكهربائية</h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-card/80 backdrop-blur-md">
                <CardContent className="p-4">
                  <canvas
                    ref={canvasRef}
                    width={750}
                    height={400}
                    className="w-full rounded-lg border border-border cursor-pointer"
                    onClick={handleCanvasClick}
                  />

                  {/* Components palette */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {COMPONENTS.map(c => (
                      <Button
                        key={c.type}
                        variant={draggedType === c.type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDraggedType(draggedType === c.type ? null : c.type)}
                        className="gap-1"
                      >
                        <span>{c.icon}</span>
                        {c.name}
                      </Button>
                    ))}
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" onClick={() => loadPreset('series')}>
                      دائرة توالي
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => loadPreset('parallel')}>
                      دائرة توازي
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => loadPreset('complex')}>
                      دائرة مركبة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Measurements Panel */}
              <Card className="bg-card/80 backdrop-blur-md mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">القياسات الحية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{state.totalVoltage.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">الجهد الكلي (V)</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{state.totalCurrent.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">التيار (A)</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{state.totalResistance.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">المقاومة (Ω)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Card className="bg-card/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">التحكم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    {!state.isSimulating ? (
                      <Button onClick={runSimulation} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Play size={16} className="mr-1" />
                        تشغيل
                      </Button>
                    ) : (
                      <Button onClick={stopSimulation} className="flex-1 bg-red-600 hover:bg-red-700">
                        <Square size={16} className="mr-1" />
                        إيقاف
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearCircuit} className="flex-1">
                      <RotateCcw size={16} className="mr-1" />
                      مسح الكل
                    </Button>
                    {selectedComp && (
                      <Button variant="destructive" onClick={() => removeComponent(selectedComp.id)} className="flex-1">
                        حذف
                      </Button>
                    )}
                  </div>

                  {state.shortCircuit && (
                    <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="text-red-500" />
                      <span className="text-red-400 text-sm">تحذير: دائرة قصر!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedComp && (
                <Card className="bg-card/80 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">خصائص العنصر</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge>{getComponentInfo(selectedComp.type).name}</Badge>
                    <div>
                      <label className="text-sm">القيمة ({getComponentInfo(selectedComp.type).unit})</label>
                      <Slider
                        value={[selectedComp.value]}
                        onValueChange={([v]) => updateComponent(selectedComp.id, { value: v })}
                        min={selectedComp.type === 'battery' ? 1 : 10}
                        max={selectedComp.type === 'battery' ? 24 : 1000}
                        className="mt-2"
                      />
                      <div className="text-center text-lg font-bold mt-1">
                        {selectedComp.value} {getComponentInfo(selectedComp.type).unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">القوانين</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>قانون أوم:</strong> V = I × R</p>
                  <p><strong>القدرة:</strong> P = I × V</p>
                  <p><strong>التوالي:</strong> R = R₁ + R₂ + ...</p>
                  <p><strong>التوازي:</strong> 1/R = 1/R₁ + 1/R₂</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderSimulation;
