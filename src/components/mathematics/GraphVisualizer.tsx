
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MathKeyboard from './MathKeyboard';
import AnalysisTools from './AnalysisTools';
import InteractiveCanvas from './InteractiveCanvas';
import { MathEngine } from './MathEngine';
import { Function, PlusCircle, Trash2 } from 'lucide-react';

const GraphVisualizer: React.FC = () => {
  const [equation1, setEquation1] = useState('x^2');
  const [equation2, setEquation2] = useState('2*x + 3');
  const [activeEquation, setActiveEquation] = useState<'eq1' | 'eq2'>('eq1');
  const [data, setData] = useState<Array<{ x: number; y1: number; y2: number }>>([]);
  const [intersections, setIntersections] = useState<Array<[number, number]>>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showKeyboard, setShowKeyboard] = useState(true);

  useEffect(() => {
    updateGraph();
  }, [equation1, equation2]);

  const updateGraph = () => {
    const newData: Array<{ x: number; y1: number; y2: number }> = [];
    
    for (let i = -10; i <= 10; i += 0.1) {
      const x = parseFloat(i.toFixed(1));
      const y1 = MathEngine.evaluateExpression(equation1, x);
      const y2 = MathEngine.evaluateExpression(equation2, x);
      
      if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1) < 50 && Math.abs(y2) < 50) {
        newData.push({ x, y1, y2 });
      }
    }
    
    setData(newData);
    
    // Find intersections
    const newIntersections = MathEngine.findIntersections(equation1, equation2);
    setIntersections(newIntersections);
  };

  const handleSymbolClick = (symbol: string) => {
    if (activeEquation === 'eq1') {
      setEquation1(prev => prev + symbol);
    } else {
      setEquation2(prev => prev + symbol);
    }
  };

  const handleClearEquation = (eqType: 'eq1' | 'eq2') => {
    if (eqType === 'eq1') {
      setEquation1('');
    } else {
      setEquation2('');
    }
  };

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result);
    if (result.type === 'intersections') {
      setIntersections(result.data);
    }
    toast.success(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          منصة التمثيل البياني المتقدمة
        </h2>
        <p className="text-white/70">مشابه لنظام GeoGebra مع أدوات تحليل متقدمة</p>
      </div>

      <Tabs defaultValue="graph" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-blue-900/50">
          <TabsTrigger value="graph" className="text-white">الرسم البياني</TabsTrigger>
          <TabsTrigger value="analysis" className="text-white">التحليل</TabsTrigger>
          <TabsTrigger value="keyboard" className="text-white">لوحة المفاتيح</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-blue-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-right flex items-center">
                    <Function className="ml-2" />
                    الرسم البياني التفاعلي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InteractiveCanvas 
                    data={data}
                    intersections={intersections}
                    width={600}
                    height={400}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-blue-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-right">إدخال المعادلات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white block text-right">المعادلة الأولى</Label>
                    <div className="flex gap-2">
                      <Input
                        value={equation1}
                        onChange={(e) => setEquation1(e.target.value)}
                        onFocus={() => setActiveEquation('eq1')}
                        className={`bg-white/10 border-white/20 text-white text-right ${
                          activeEquation === 'eq1' ? 'border-purple-500' : ''
                        }`}
                        placeholder="مثال: x^2"
                        dir="ltr"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClearEquation('eq1')}
                        className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white block text-right">المعادلة الثانية</Label>
                    <div className="flex gap-2">
                      <Input
                        value={equation2}
                        onChange={(e) => setEquation2(e.target.value)}
                        onFocus={() => setActiveEquation('eq2')}
                        className={`bg-white/10 border-white/20 text-white text-right ${
                          activeEquation === 'eq2' ? 'border-purple-500' : ''
                        }`}
                        placeholder="مثال: 2*x + 3"
                        dir="ltr"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClearEquation('eq2')}
                        className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={updateGraph}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <PlusCircle className="w-4 h-4 ml-2" />
                    تحديث الرسم البياني
                  </Button>

                  <div className="text-xs text-white/50 text-right">
                    <p>استخدم: x للمتغير، pi للعدد π، e للعدد e</p>
                    <p>العمليات: +، -، *، /، ^ للأس</p>
                    <p>الدوال: sin، cos، tan، log، ln، sqrt</p>
                  </div>
                </CardContent>
              </Card>

              {intersections.length > 0 && (
                <Card className="bg-green-900/30 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white text-right">نقاط التقاطع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {intersections.map((point, index) => (
                        <div key={index} className="text-green-300 text-right">
                          النقطة {index + 1}: ({point[0]}, {point[1]})
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisTools
            equation1={equation1}
            equation2={equation2}
            onAnalysisResult={handleAnalysisResult}
          />
        </TabsContent>

        <TabsContent value="keyboard">
          <MathKeyboard
            onSymbolClick={handleSymbolClick}
            className="max-w-2xl mx-auto"
          />
          <div className="text-center mt-4">
            <p className="text-white/70">
              المعادلة النشطة: {activeEquation === 'eq1' ? 'الأولى' : 'الثانية'}
            </p>
            <p className="text-white/50 text-sm">
              انقر على حقل المعادلة لتحديدها قبل استخدام لوحة المفاتيح
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GraphVisualizer;
