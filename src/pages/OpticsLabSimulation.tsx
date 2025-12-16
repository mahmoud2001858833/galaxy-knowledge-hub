import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Trash2, Grid, Sparkles, Rainbow, Eye, Maximize2, Settings, Download, Undo, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAdvancedOptics, OpticalElement } from '@/hooks/useAdvancedOptics';
import StarField from '@/components/StarField';

const ELEMENT_TYPES = [
  { type: 'light-source' as const, name: 'مصدر ضوء', icon: '💡', color: '#FFD700' },
  { type: 'convex-lens' as const, name: 'عدسة محدبة', icon: '🔍', color: '#00BFFF' },
  { type: 'concave-lens' as const, name: 'عدسة مقعرة', icon: '👓', color: '#1E90FF' },
  { type: 'plane-mirror' as const, name: 'مرآة مستوية', icon: '🪞', color: '#C0C0C0' },
  { type: 'convex-mirror' as const, name: 'مرآة محدبة', icon: '🔵', color: '#87CEEB' },
  { type: 'concave-mirror' as const, name: 'مرآة مقعرة', icon: '🔴', color: '#FF6B6B' },
  { type: 'prism' as const, name: 'منشور', icon: '🔺', color: '#9B59B6' },
];

const PRESETS = [
  { id: 'refraction', name: 'انكسار الضوء', icon: '🔍' },
  { id: 'prism-rainbow', name: 'قوس قزح', icon: '🌈' },
  { id: 'lens-focus', name: 'تركيز العدسات', icon: '🎯' },
  { id: 'mirror-reflection', name: 'انعكاس المرآة', icon: '🪞' },
];

const OpticsLabSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    state,
    addElement,
    removeElement,
    updateElement,
    selectElement,
    moveElement,
    toggleGrid,
    toggleDispersion,
    setRayCount,
    clearAll,
    loadPreset,
    generateRays,
    SPECTRUM_COLORS
  } = useAdvancedOptics();

  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop for ray glow effect
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setAnimationPhase(prev => (prev + 0.02) % (Math.PI * 2));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating]);

  // Draw the optics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#0d1025');
    bgGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.08)';
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw rays with glow effect
    state.rays.forEach(ray => {
      ray.segments.forEach(segment => {
        // Outer glow
        ctx.strokeStyle = segment.color;
        ctx.lineWidth = 6 + Math.sin(animationPhase) * 2;
        ctx.globalAlpha = 0.2;
        ctx.shadowColor = segment.color;
        ctx.shadowBlur = 15 + Math.sin(animationPhase) * 5;
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.lineTo(segment.x2, segment.y2);
        ctx.stroke();

        // Inner ray
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.lineTo(segment.x2, segment.y2);
        ctx.stroke();

        // Core white line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.lineTo(segment.x2, segment.y2);
        ctx.stroke();
      });
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw elements
    state.elements.forEach(element => {
      const isSelected = element.id === state.selectedElement;
      
      ctx.save();
      ctx.translate(element.x, element.y);
      ctx.rotate((element.rotation * Math.PI) / 180);

      if (element.type === 'light-source') {
        // Animated light source
        const glowSize = 35 + Math.sin(animationPhase * 2) * 5;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 180, 0, 0.6)');
        gradient.addColorStop(0.6, 'rgba(255, 140, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.5, '#FFD700');
        coreGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Arrow indicating direction (pointing left)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-15, 8);
        ctx.closePath();
        ctx.fill();

      } else if (element.type.includes('lens')) {
        const isConvex = element.type === 'convex-lens';
        
        // Lens body with glass effect
        const lensGradient = ctx.createLinearGradient(-15, 0, 15, 0);
        lensGradient.addColorStop(0, 'rgba(100, 200, 255, 0.1)');
        lensGradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.3)');
        lensGradient.addColorStop(1, 'rgba(100, 200, 255, 0.1)');
        
        ctx.fillStyle = lensGradient;
        ctx.strokeStyle = isSelected ? '#00ff00' : '#00BFFF';
        ctx.lineWidth = isSelected ? 4 : 3;
        
        ctx.beginPath();
        if (isConvex) {
          // Convex lens shape
          ctx.ellipse(0, 0, 12, element.height / 2, 0, 0, Math.PI * 2);
        } else {
          // Concave lens shape
          ctx.moveTo(-8, -element.height / 2);
          ctx.quadraticCurveTo(8, -element.height / 4, 8, 0);
          ctx.quadraticCurveTo(8, element.height / 4, -8, element.height / 2);
          ctx.quadraticCurveTo(-20, element.height / 4, -20, 0);
          ctx.quadraticCurveTo(-20, -element.height / 4, -8, -element.height / 2);
        }
        ctx.fill();
        ctx.stroke();

        // Focal point markers
        const f = Math.abs(element.focalLength);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(-f, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#00BFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isConvex ? 'محدبة' : 'مقعرة', 0, element.height / 2 + 20);

      } else if (element.type.includes('mirror')) {
        ctx.strokeStyle = isSelected ? '#00ff00' : '#C0C0C0';
        ctx.lineWidth = isSelected ? 5 : 4;
        
        // Mirror surface with metallic gradient
        const mirrorGradient = ctx.createLinearGradient(-5, -element.height / 2, 5, element.height / 2);
        mirrorGradient.addColorStop(0, 'rgba(200, 200, 220, 0.8)');
        mirrorGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        mirrorGradient.addColorStop(1, 'rgba(200, 200, 220, 0.8)');
        
        ctx.fillStyle = mirrorGradient;
        
        ctx.beginPath();
        if (element.type === 'plane-mirror') {
          ctx.moveTo(0, -element.height / 2);
          ctx.lineTo(0, element.height / 2);
          ctx.stroke();
          
          // Back hatching
          for (let i = -element.height / 2; i < element.height / 2; i += 10) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(8, i + 8);
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else if (element.type === 'concave-mirror') {
          ctx.arc(50, 0, 60, Math.PI * 0.65, Math.PI * 1.35);
          ctx.stroke();
        } else {
          ctx.arc(-50, 0, 60, -Math.PI * 0.35, Math.PI * 0.35);
          ctx.stroke();
        }

      } else if (element.type === 'prism') {
        // Prism with rainbow glass effect
        const prismGradient = ctx.createLinearGradient(-40, -40, 40, 40);
        prismGradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
        prismGradient.addColorStop(0.17, 'rgba(255, 127, 0, 0.2)');
        prismGradient.addColorStop(0.33, 'rgba(255, 255, 0, 0.2)');
        prismGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.2)');
        prismGradient.addColorStop(0.67, 'rgba(0, 0, 255, 0.2)');
        prismGradient.addColorStop(0.83, 'rgba(75, 0, 130, 0.2)');
        prismGradient.addColorStop(1, 'rgba(139, 0, 255, 0.2)');
        
        ctx.fillStyle = prismGradient;
        ctx.strokeStyle = isSelected ? '#00ff00' : '#9B59B6';
        ctx.lineWidth = isSelected ? 4 : 3;
        
        ctx.beginPath();
        ctx.moveTo(0, -45);
        ctx.lineTo(40, 35);
        ctx.lineTo(-40, 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glass reflection effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, -20);
        ctx.lineTo(-5, 10);
        ctx.stroke();
      }

      // Selection indicator
      if (isSelected) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-50, -70, 100, 140);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });

    // Draw spectrum legend if dispersion is on
    if (state.showDispersion && state.rays.length > 0) {
      const legendX = 20;
      const legendY = height - 100;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(legendX - 10, legendY - 10, 120, 90);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(legendX - 10, legendY - 10, 120, 90);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('الطيف المرئي', legendX, legendY + 5);
      
      SPECTRUM_COLORS.forEach((spectrum, i) => {
        ctx.fillStyle = spectrum.color;
        ctx.fillRect(legendX, legendY + 15 + i * 10, 15, 8);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(spectrum.name, legendX + 20, legendY + 22 + i * 10);
      });
    }

  }, [state, animationPhase, SPECTRUM_COLORS]);

  // Handle mouse events for drag and drop
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on an element
    const clickedElement = state.elements.find(el => 
      Math.hypot(el.x - x, el.y - y) < 50
    );

    if (clickedElement) {
      setDraggedElement(clickedElement.id);
      setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y });
      selectElement(clickedElement.id);
    } else {
      selectElement(null);
    }
  }, [state.elements, selectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    moveElement(draggedElement, 
      Math.max(50, Math.min(x, canvasSize.width - 50)),
      Math.max(50, Math.min(y, canvasSize.height - 50))
    );
  }, [draggedElement, dragOffset, moveElement, canvasSize]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
  }, []);

  const handleAddElement = (type: OpticalElement['type']) => {
    // Add light source on the right, others in the center
    const x = type === 'light-source' ? canvasSize.width - 100 : canvasSize.width / 2;
    const y = canvasSize.height / 2;
    addElement(type, x, y);
  };

  const selectedEl = state.elements.find(e => e.id === state.selectedElement);

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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Lightbulb className="text-yellow-400" size={28} />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                مختبر البصريات التفاعلي
              </h1>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Canvas Area */}
            <div className="xl:col-span-3 space-y-4">
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-4">
                  <div ref={containerRef} className="relative">
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      className="w-full rounded-lg border border-border/50 cursor-crosshair shadow-2xl"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                    
                    {/* Floating info */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>←</span>
                        <span>اتجاه الضوء</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Element buttons */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {ELEMENT_TYPES.map(el => (
                      <motion.div key={el.type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddElement(el.type)}
                          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                          style={{ borderColor: `${el.color}40` }}
                        >
                          <span className="text-lg">{el.icon}</span>
                          {el.name}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-sm text-muted-foreground self-center">أمثلة جاهزة:</span>
                    {PRESETS.map(preset => (
                      <Button
                        key={preset.id}
                        variant="secondary"
                        size="sm"
                        onClick={() => loadPreset(preset.id as any)}
                        className="gap-1"
                      >
                        <span>{preset.icon}</span>
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Main Controls */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings size={18} className="text-primary" />
                    التحكم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center gap-2">
                      <Rainbow size={16} className="text-purple-400" />
                      تشتت الألوان
                    </label>
                    <Switch
                      checked={state.showDispersion}
                      onCheckedChange={toggleDispersion}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center gap-2">
                      <Grid size={16} className="text-blue-400" />
                      الشبكة
                    </label>
                    <Switch
                      checked={state.showGrid}
                      onCheckedChange={toggleGrid}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center gap-2">
                      <Play size={16} className="text-green-400" />
                      الحركة
                    </label>
                    <Switch
                      checked={isAnimating}
                      onCheckedChange={setIsAnimating}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">عدد الأشعة</label>
                    <Slider
                      value={[state.rayCount]}
                      onValueChange={([v]) => setRayCount(v)}
                      min={1}
                      max={15}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center text-sm mt-1">{state.rayCount} شعاع</div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={clearAll} className="flex-1">
                      <Trash2 size={16} className="mr-1" />
                      مسح الكل
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Element Properties */}
              {selectedEl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card/80 backdrop-blur-md border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye size={18} className="text-green-400" />
                        خصائص العنصر
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Badge className="w-full justify-center">
                        {ELEMENT_TYPES.find(t => t.type === selectedEl.type)?.name}
                      </Badge>

                      {(selectedEl.type.includes('lens') || selectedEl.type.includes('mirror')) && (
                        <div>
                          <label className="text-sm text-muted-foreground">البعد البؤري</label>
                          <Slider
                            value={[Math.abs(selectedEl.focalLength)]}
                            onValueChange={([v]) => updateElement(selectedEl.id, { 
                              focalLength: selectedEl.type.includes('concave') || selectedEl.type === 'convex-mirror' ? -v : v 
                            })}
                            min={50}
                            max={300}
                            className="mt-2"
                          />
                          <div className="text-center text-sm mt-1">{Math.abs(selectedEl.focalLength)} px</div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm text-muted-foreground">الارتفاع</label>
                        <Slider
                          value={[selectedEl.height]}
                          onValueChange={([v]) => updateElement(selectedEl.id, { height: v })}
                          min={50}
                          max={200}
                          className="mt-2"
                        />
                      </div>

                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeElement(selectedEl.id)}
                        className="w-full"
                      >
                        <Trash2 size={16} className="mr-1" />
                        حذف العنصر
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Info Panel */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    المعلومات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="laws">
                    <TabsList className="w-full">
                      <TabsTrigger value="laws" className="flex-1">القوانين</TabsTrigger>
                      <TabsTrigger value="tips" className="flex-1">النصائح</TabsTrigger>
                    </TabsList>
                    <TabsContent value="laws" className="text-sm space-y-3 mt-3">
                      <div className="p-2 bg-muted/30 rounded">
                        <p className="font-semibold text-blue-400">قانون سنل للانكسار</p>
                        <p className="text-xs font-mono mt-1">n₁ × sin(θ₁) = n₂ × sin(θ₂)</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded">
                        <p className="font-semibold text-green-400">معادلة العدسات</p>
                        <p className="text-xs font-mono mt-1">1/f = 1/do + 1/di</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded">
                        <p className="font-semibold text-purple-400">معادلة كوشي للتشتت</p>
                        <p className="text-xs font-mono mt-1">n(λ) = A + B/λ²</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="tips" className="text-sm space-y-2 mt-3">
                      <p>• اسحب العناصر لتحريكها على الكانفاس</p>
                      <p>• مصدر الضوء يرسل أشعة نحو اليسار</p>
                      <p>• فعّل "تشتت الألوان" لرؤية قوس قزح</p>
                      <p>• المنشور يفرق الضوء الأبيض لألوان الطيف</p>
                      <p>• العدسة المحدبة تجمع الأشعة</p>
                      <p>• العدسة المقعرة تفرق الأشعة</p>
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
