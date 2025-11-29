import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Function3DEngine } from '@/components/function3d/Function3DEngine';
import { Function3DPlot } from '@/components/function3d/Function3DPlot';
import { Function3DControls } from '@/components/function3d/Function3DControls';
import { Function3DExamples } from '@/components/function3d/Function3DExamples';
import { Function3DMathKeyboard } from '@/components/function3d/Function3DMathKeyboard';
import { FunctionList, FunctionItem } from '@/components/function3d/FunctionList';
import { ColorPicker3D } from '@/components/function3d/ColorPicker3D';
import { Function3DEducation } from '@/components/function3d/Function3DEducation';

const Function3DVisualization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dimension, setDimension] = useState<'1D' | '2D' | '3D'>('3D');
  const [expression, setExpression] = useState('x^2 + y^2');
  const [rangeX, setRangeX] = useState<[number, number]>([-10, 10]);
  const [rangeY, setRangeY] = useState<[number, number]>([-10, 10]);
  const [points, setPoints] = useState(50);
  const [functions, setFunctions] = useState<FunctionItem[]>([]);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Display options
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [colorscale, setColorscale] = useState('Viridis');
  const [opacity, setOpacity] = useState(0.9);

  const colorOptions = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  useEffect(() => {
    updatePlotData();
  }, [functions]);

  const updatePlotData = () => {
    if (functions.length === 0) {
      setPlotData([]);
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      const data = functions
        .filter(func => func.visible)
        .map(func => {
          if (func.dimension === '3D') {
            const result = Function3DEngine.generate3DData(func.expression, rangeX, rangeY, points);
            return {
              type: 'surface',
              x: result.x,
              y: result.y,
              z: result.z,
              colorscale: colorscale,
              opacity: func.opacity,
              name: func.expression.substring(0, 20),
            };
          } else if (func.dimension === '2D') {
            const result = Function3DEngine.generate2DData(func.expression, rangeX, points * 2);
            return {
              type: 'scatter3d',
              mode: 'lines',
              x: result.x,
              y: result.y,
              z: result.y.map(() => 0),
              line: {
                color: func.color,
                width: 4,
              },
              opacity: func.opacity,
              name: func.expression.substring(0, 20),
            };
          } else {
            // 1D - Point
            const coords = func.expression.split(',').map(v => parseFloat(v.trim()));
            return {
              type: 'scatter3d',
              mode: 'markers',
              x: [coords[0] || 0],
              y: [coords[1] || 0],
              z: [coords[2] || 0],
              marker: {
                size: 10,
                color: func.color,
              },
              opacity: func.opacity,
              name: `نقطة: ${func.expression}`,
            };
          }
        });

      setPlotData(data);
      setIsCalculating(false);
    }, 100);
  };

  const handleAddFunction = () => {
    if (functions.length >= 5) {
      toast({
        title: 'تنبيه',
        description: 'الحد الأقصى 5 دوال',
        variant: 'destructive',
      });
      return;
    }

    if (!expression.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال دالة صحيحة',
        variant: 'destructive',
      });
      return;
    }

    const newFunction: FunctionItem = {
      id: Date.now().toString(),
      expression,
      dimension,
      color: colorOptions[functions.length % colorOptions.length],
      opacity: 0.8,
      visible: true,
    };

    setFunctions([...functions, newFunction]);
    toast({
      title: 'تم بنجاح',
      description: 'تمت إضافة الدالة',
    });
  };

  const handleExampleSelect = (example: any) => {
    setDimension(example.dimension);
    setExpression(example.expression);
    toast({
      title: 'تم التحميل',
      description: `تم تحميل مثال: ${example.name}`,
    });
  };

  const handleSymbolClick = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/scientific-simulations')}
            className="gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للتجارب العلمية
          </Button>
          <h1 className="text-4xl font-bold text-foreground">
            تمثيل الدوال ثلاثي الأبعاد
          </h1>
        </motion.div>

        {/* Main Plot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          {isCalculating && (
            <div className="text-center py-4 text-primary">
              جاري الحساب...
            </div>
          )}
          <Function3DPlot
            data={plotData}
            config={{
              showGrid,
              showAxes,
              colorscale,
              opacity,
              wireframe,
              contours: showContours,
            }}
          />
        </motion.div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Function3DControls
              dimension={dimension}
              onDimensionChange={setDimension}
              expression={expression}
              onExpressionChange={setExpression}
              rangeX={rangeX}
              rangeY={rangeY}
              onRangeXChange={setRangeX}
              onRangeYChange={setRangeY}
              points={points}
              onPointsChange={setPoints}
              onAddFunction={handleAddFunction}
              showGrid={showGrid}
              showAxes={showAxes}
              showContours={showContours}
              wireframe={wireframe}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleAxes={() => setShowAxes(!showAxes)}
              onToggleContours={() => setShowContours(!showContours)}
              onToggleWireframe={() => setWireframe(!wireframe)}
            />
          </div>

          <div className="lg:col-span-1">
            <Function3DExamples onExampleSelect={handleExampleSelect} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <ColorPicker3D
              colorscale={colorscale}
              opacity={opacity}
              onColorscaleChange={setColorscale}
              onOpacityChange={setOpacity}
            />
            <FunctionList
              functions={functions}
              onRemoveFunction={(id) => setFunctions(functions.filter(f => f.id !== id))}
              onToggleVisibility={(id) =>
                setFunctions(functions.map(f => f.id === id ? { ...f, visible: !f.visible } : f))
              }
              onOpacityChange={(id, opacity) =>
                setFunctions(functions.map(f => f.id === id ? { ...f, opacity } : f))
              }
            />
          </div>
        </div>

        {/* Math Keyboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Function3DMathKeyboard onSymbolClick={handleSymbolClick} />
        </motion.div>

        {/* Education Section */}
        <Function3DEducation />
      </div>
    </div>
  );
};

export default Function3DVisualization;
