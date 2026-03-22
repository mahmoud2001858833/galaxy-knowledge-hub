import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Play, Square, RotateCcw, AlertTriangle, Settings, Trash2, RotateCw, Plug, Download, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedCircuit, ComponentType, COMPONENT_DEFINITIONS, CIRCUIT_PRESETS } from '@/hooks/useAdvancedCircuit';
import StarField from '@/components/StarField';

const COMPONENT_CATEGORIES = [
  { id: 'basic', name: 'أساسية', icon: '⚡' },
  { id: 'measurement', name: 'قياس', icon: '📏' },
  { id: 'storage', name: 'تخزين', icon: '🔋' },
  { id: 'advanced', name: 'متقدمة', icon: '🔬' },
  { id: 'input', name: 'إدخال', icon: '🎛️' },
  { id: 'output', name: 'إخراج', icon: '💡' },
];

const CircuitBuilderSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    state,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    rotateComponent,
    selectComponent,
    toggleSwitch,
    startWire,
    addWirePoint,
    finishWire,
    cancelWire,
    removeWire,
    selectWire,
    runSimulation,
    stopSimulation,
    loadPreset,
    clearCircuit,
    COMPONENT_DEFINITIONS: compDefs,
    CIRCUIT_PRESETS: presets,
  } = useAdvancedCircuit();

  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize] = useState({ width: 800, height: 450 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setAnimationPhase(prev => (prev + 0.05) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Draw circuit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(0.5, '#0d1f3c');
    bgGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Grid
    ctx.strokeStyle = 'rgba(50, 100, 150, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasSize.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvasSize.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    // Draw wires
    state.wires.forEach(wire => {
      const isSelected = wire.id === state.selectedWire;
      
      ctx.strokeStyle = isSelected ? '#00ff00' : wire.color;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (wire.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(wire.points[0].x, wire.points[0].y);
        for (let i = 1; i < wire.points.length; i++) {
          ctx.lineTo(wire.points[i].x, wire.points[i].y);
        }
        ctx.stroke();
      }

      // Draw electrons on wires
      if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0) {
        const electrons = state.electrons.filter(e => e.wireId === wire.id);
        electrons.forEach(electron => {
          const totalLength = wire.points.reduce((sum, p, i) => {
            if (i === 0) return 0;
            return sum + Math.hypot(p.x - wire.points[i - 1].x, p.y - wire.points[i - 1].y);
          }, 0);
          
          const targetDist = electron.position * totalLength;
          let accDist = 0;
          
          for (let i = 1; i < wire.points.length; i++) {
            const segmentLength = Math.hypot(
              wire.points[i].x - wire.points[i - 1].x,
              wire.points[i].y - wire.points[i - 1].y
            );
            
            if (accDist + segmentLength >= targetDist) {
              const t = (targetDist - accDist) / segmentLength;
              const x = wire.points[i - 1].x + t * (wire.points[i].x - wire.points[i - 1].x);
              const y = wire.points[i - 1].y + t * (wire.points[i].y - wire.points[i - 1].y);
              
              // Draw electron
              ctx.fillStyle = '#00BFFF';
              ctx.shadowColor = '#00BFFF';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              break;
            }
            accDist += segmentLength;
          }
        });
      }
    });

    // Draw current wire being drawn
    if (state.isDrawingWire && state.currentWirePoints.length > 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(state.currentWirePoints[0].x, state.currentWirePoints[0].y);
      for (let i = 1; i < state.currentWirePoints.length; i++) {
        ctx.lineTo(state.currentWirePoints[i].x, state.currentWirePoints[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw components
    state.components.forEach(comp => {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const isSelected = comp.id === state.selectedComponent;
      const measurement = state.measurements.find(m => m.componentId === comp.id);

      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Selection glow
      if (isSelected) {
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
      }

      // Component body
      const bodyGradient = ctx.createLinearGradient(-35, -25, 35, 25);
      bodyGradient.addColorStop(0, isSelected ? '#1a3a1a' : '#1a2a3a');
      bodyGradient.addColorStop(0.5, isSelected ? '#2a4a2a' : '#2a3a4a');
      bodyGradient.addColorStop(1, isSelected ? '#1a3a1a' : '#1a2a3a');
      
      ctx.fillStyle = bodyGradient;
      ctx.strokeStyle = isSelected ? '#00ff00' : def.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      
      // Rounded rectangle body
      ctx.beginPath();
      ctx.roundRect(-35, -25, 70, 50, 10);
      ctx.fill();
      ctx.stroke();

      // Connection points
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(-35, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(35, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Component-specific visuals
      ctx.fillStyle = def.color;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      switch (comp.type) {
        case 'battery':
          // Battery poles
          ctx.fillRect(-15, -15, 6, 30);
          ctx.fillRect(9, -10, 6, 20);
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.fillText('+', 12, 0);
          ctx.fillText('-', -12, 0);
          break;

        case 'resistor':
          // Zigzag pattern
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(-15 + i * 8, i % 2 === 0 ? -10 : 10);
          }
          ctx.lineTo(20, 0);
          ctx.stroke();
          break;

        case 'bulb':
          // Bulb with glow when on
          if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0.01) {
            const glowIntensity = Math.min(state.totalCurrent * 50, 30);
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = glowIntensity + Math.sin(animationPhase) * 5;
            ctx.fillStyle = '#FFD700';
          } else {
            ctx.fillStyle = '#666';
          }
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;

        case 'led':
          // LED with color
          const ledColor = comp.color || '#FF0000';
          if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0.001) {
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = 15 + Math.sin(animationPhase) * 5;
            ctx.fillStyle = ledColor;
          } else {
            ctx.fillStyle = '#333';
          }
          ctx.beginPath();
          ctx.moveTo(-10, -12);
          ctx.lineTo(10, 0);
          ctx.lineTo(-10, 12);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          break;

        case 'switch':
          ctx.strokeStyle = comp.isOn ? '#4CAF50' : '#f44336';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-15, 0);
          if (comp.isOn) {
            ctx.lineTo(15, 0);
          } else {
            ctx.lineTo(10, -15);
          }
          ctx.stroke();
          // Status indicator
          ctx.fillStyle = comp.isOn ? '#4CAF50' : '#f44336';
          ctx.beginPath();
          ctx.arc(20, -15, 5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'capacitor':
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-5, -15);
          ctx.lineTo(-5, 15);
          ctx.moveTo(5, -15);
          ctx.lineTo(5, 15);
          ctx.stroke();
          break;

        case 'motor':
          // Motor with rotation animation
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.stroke();
          
          if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0) {
            const rotAngle = animationPhase * 3;
            ctx.strokeStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(rotAngle) * 12, Math.sin(rotAngle) * 12);
            ctx.stroke();
          }
          break;

        case 'ammeter':
          ctx.fillStyle = '#2196F3';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Arial';
          ctx.fillText('A', 0, 0);
          break;

        case 'voltmeter':
          ctx.fillStyle = '#9C27B0';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Arial';
          ctx.fillText('V', 0, 0);
          break;

        default:
          ctx.fillText(def.icon, 0, 0);
      }

      // Value label
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.fillText(`${comp.value}${def.unit}`, 0, 35);

      // Measurement display when simulating
      if (state.isSimulating && measurement) {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 11px Arial';
        if (comp.type === 'ammeter') {
          ctx.fillText(`${measurement.current.toFixed(3)}A`, 0, -35);
        } else if (comp.type === 'voltmeter') {
          ctx.fillText(`${measurement.voltage.toFixed(2)}V`, 0, -35);
        } else if (measurement.power > 0.001) {
          ctx.fillText(`${measurement.power.toFixed(2)}W`, 0, -35);
        }
      }

      ctx.restore();
    });

    // Short circuit warning overlay
    if (state.shortCircuit) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ دائرة قصر - خطر! ⚠️', canvasSize.width / 2, 40);
    }

    // Open circuit indicator
    if (state.openCircuit && state.components.length > 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = '#FFA500';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الدائرة مفتوحة - أغلق المفتاح أو أضف مصدر طاقة', canvasSize.width / 2, canvasSize.height - 20);
    }

  }, [state, canvasSize, animationPhase]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If we have a component type to add
    if (draggedType) {
      addComponent(draggedType, x, y);
      setDraggedType(null);
      return;
    }

    // Check if clicked on a component
    const clickedComp = state.components.find(c => 
      Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 30
    );

    if (clickedComp) {
      if (e.shiftKey) {
        // Start drawing wire from component
        startWire(clickedComp.x + 35, clickedComp.y, clickedComp.id);
      } else if (clickedComp.type === 'switch' && e.detail === 2) {
        // Double click on switch toggles it
        toggleSwitch(clickedComp.id);
      } else {
        // Start dragging component
        setDraggedComponent(clickedComp.id);
        setDragOffset({ x: x - clickedComp.x, y: y - clickedComp.y });
        selectComponent(clickedComp.id);
      }
    } else if (state.isDrawingWire) {
      // Add point to wire or finish
      const nearComp = state.components.find(c => 
        Math.abs(c.x - x) < 50 && Math.abs(c.y - y) < 40
      );
      
      if (nearComp && nearComp.id !== state.wireStartPoint?.componentId) {
        finishWire(nearComp.x - 35, nearComp.y, nearComp.id);
      } else {
        addWirePoint(x, y);
      }
    } else {
      // Check if clicked on a wire
      const clickedWire = state.wires.find(w => {
        for (let i = 1; i < w.points.length; i++) {
          const p1 = w.points[i - 1];
          const p2 = w.points[i];
          const dist = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
          if (dist < 10) return true;
        }
        return false;
      });
      
      if (clickedWire) {
        selectWire(clickedWire.id);
      } else {
        selectComponent(null);
        selectWire(null);
      }
    }
  }, [draggedType, state, addComponent, startWire, addWirePoint, finishWire, toggleSwitch, selectComponent, selectWire]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedComponent) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    moveComponent(draggedComponent, 
      Math.max(40, Math.min(x, canvasSize.width - 40)),
      Math.max(30, Math.min(y, canvasSize.height - 30))
    );
  }, [draggedComponent, dragOffset, moveComponent, canvasSize]);

  const handleMouseUp = useCallback(() => {
    setDraggedComponent(null);
  }, []);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (state.isDrawingWire) {
      cancelWire();
    }
  }, [state.isDrawingWire, cancelWire]);

  // Helper function for wire click detection
  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    
    return Math.hypot(px - xx, py - yy);
  };

  const filteredComponents = Object.entries(COMPONENT_DEFINITIONS).filter(
    ([_, def]) => def.category === selectedCategory
  );

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
            <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }} className="gap-2">
              <ArrowLeft size={20} />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
            </Button>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="text-yellow-400" size={28} />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-blue-500 bg-clip-text text-transparent">
                معمل بناء الدوائر الكهربائية
              </h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Canvas Area */}
            <div className="xl:col-span-3 space-y-4">
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-4">
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="w-full rounded-lg border border-border/50 cursor-pointer shadow-2xl"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onContextMenu={handleRightClick}
                  />
                  
                  {/* Component palette */}
                  <div className="mt-4">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {COMPONENT_CATEGORIES.map(cat => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="gap-1"
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {filteredComponents.map(([type, def]) => (
                        <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={draggedType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDraggedType(draggedType === type ? null : type as ComponentType)}
                            className="gap-1"
                            style={{ borderColor: `${def.color}50` }}
                          >
                            <span>{def.icon}</span>
                            {def.nameAr}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    <p>• اختر عنصر ثم انقر على اللوحة لإضافته</p>
                    <p>• اسحب العناصر لتحريكها</p>
                    <p>• Shift + نقر لبدء رسم سلك</p>
                    <p>• نقر مزدوج على المفتاح لتبديله</p>
                  </div>
                </CardContent>
              </Card>

              {/* Measurements Panel */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    القياسات الحية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <div className="text-2xl font-bold text-yellow-400">{state.totalVoltage.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">الجهد (V)</div>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="text-2xl font-bold text-green-400">{state.totalCurrent.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">التيار (A)</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-blue-400">{state.totalResistance.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">المقاومة (Ω)</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400">{state.totalPower.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">القدرة (W)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Simulation Controls */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings size={18} className="text-primary" />
                    التحكم
                  </CardTitle>
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
                      مسح
                    </Button>
                    {state.selectedWire && (
                      <Button variant="destructive" onClick={() => removeWire(state.selectedWire!)} className="flex-1">
                        <Trash2 size={16} className="mr-1" />
                        حذف سلك
                      </Button>
                    )}
                  </div>

                  {state.shortCircuit && (
                    <motion.div 
                      className="p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <AlertTriangle className="text-red-500" />
                      <span className="text-red-400 text-sm">تحذير: دائرة قصر!</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Presets */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">أمثلة جاهزة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {CIRCUIT_PRESETS.map(preset => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset(preset.id)}
                          className="w-full justify-between"
                        >
                          <span>{preset.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {preset.difficulty === 'beginner' && 'مبتدئ'}
                            {preset.difficulty === 'intermediate' && 'متوسط'}
                            {preset.difficulty === 'advanced' && 'متقدم'}
                            {preset.difficulty === 'expert' && 'خبير'}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Selected Component Properties */}
              {selectedComp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card/80 backdrop-blur-md border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">خصائص العنصر</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge className="w-full justify-center" style={{ backgroundColor: COMPONENT_DEFINITIONS[selectedComp.type].color }}>
                        {COMPONENT_DEFINITIONS[selectedComp.type].nameAr}
                      </Badge>

                      <div>
                        <label className="text-sm text-muted-foreground">
                          القيمة ({COMPONENT_DEFINITIONS[selectedComp.type].unit})
                        </label>
                        <Slider
                          value={[selectedComp.value]}
                          onValueChange={([v]) => updateComponent(selectedComp.id, { value: v })}
                          min={selectedComp.type === 'battery' ? 1 : 1}
                          max={selectedComp.type === 'battery' ? 24 : 10000}
                          className="mt-2"
                        />
                        <div className="text-center text-lg font-bold mt-1">
                          {selectedComp.value} {COMPONENT_DEFINITIONS[selectedComp.type].unit}
                        </div>
                      </div>

                      {selectedComp.type === 'led' && (
                        <div>
                          <label className="text-sm text-muted-foreground">لون LED</label>
                          <div className="flex gap-2 mt-2">
                            {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 ${selectedComp.color === color ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateComponent(selectedComp.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => rotateComponent(selectedComp.id)}
                          className="flex-1"
                        >
                          <RotateCw size={16} className="mr-1" />
                          تدوير
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeComponent(selectedComp.id)}
                          className="flex-1"
                        >
                          <Trash2 size={16} className="mr-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Laws Panel */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info size={18} className="text-blue-400" />
                    القوانين
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-semibold text-yellow-400">قانون أوم</p>
                    <p className="text-xs font-mono">V = I × R</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-semibold text-green-400">القدرة الكهربائية</p>
                    <p className="text-xs font-mono">P = I × V = I²R = V²/R</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-semibold text-blue-400">التوالي</p>
                    <p className="text-xs font-mono">R = R₁ + R₂ + R₃ + ...</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-semibold text-purple-400">التوازي</p>
                    <p className="text-xs font-mono">1/R = 1/R₁ + 1/R₂ + ...</p>
                  </div>
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
