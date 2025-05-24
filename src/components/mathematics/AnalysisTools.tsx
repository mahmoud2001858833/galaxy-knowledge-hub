
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MathEngine } from './MathEngine';
import { Calculator, TrendingUp, Target, Zap } from 'lucide-react';

interface AnalysisToolsProps {
  equation1: string;
  equation2: string;
  onAnalysisResult: (result: any) => void;
}

const AnalysisTools = ({ equation1, equation2, onAnalysisResult }: AnalysisToolsProps) => {
  const [pointX, setPointX] = useState<string>('0');
  const [results, setResults] = useState<any>(null);

  const handleFindIntersections = () => {
    if (!equation1 || !equation2) return;
    
    const intersections = MathEngine.findIntersections(equation1, equation2);
    const result = {
      type: 'intersections',
      data: intersections,
      message: intersections.length > 0 
        ? `تم العثور على ${intersections.length} نقطة تقاطع`
        : 'لا توجد نقاط تقاطع في النطاق المحدد'
    };
    
    setResults(result);
    onAnalysisResult(result);
  };

  const handleFindSlope = () => {
    const x = parseFloat(pointX);
    if (isNaN(x) || !equation1) return;
    
    const slope = MathEngine.findSlope(equation1, x);
    const result = {
      type: 'slope',
      data: { x, slope: isNaN(slope) ? null : parseFloat(slope.toFixed(4)) },
      message: isNaN(slope) 
        ? 'لا يمكن حساب الميل عند هذه النقطة'
        : `الميل عند النقطة x = ${x} هو ${slope.toFixed(4)}`
    };
    
    setResults(result);
    onAnalysisResult(result);
  };

  const handleAnalyzeQuadratic = () => {
    if (!equation1) return;
    
    const analysis = MathEngine.analyzeQuadratic(equation1);
    const result = {
      type: 'quadratic',
      data: analysis,
      message: analysis.vertex ? 'تم تحليل الاقتران التربيعي' : 'المعادلة ليست تربيعية'
    };
    
    setResults(result);
    onAnalysisResult(result);
  };

  const handleSolveCubic = () => {
    if (!equation1) return;
    
    const roots = MathEngine.solveCubic(equation1);
    const result = {
      type: 'cubic',
      data: roots,
      message: roots.length > 0 
        ? `تم العثور على ${roots.length} جذر للمعادلة التكعيبية`
        : 'لم يتم العثور على جذور في النطاق المحدد'
    };
    
    setResults(result);
    onAnalysisResult(result);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-blue-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white text-right flex items-center">
            <Calculator className="ml-2" />
            أدوات التحليل الرياضي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleFindIntersections}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!equation1 || !equation2}
            >
              <Target className="w-4 h-4 ml-2" />
              إيجاد التقاطع
            </Button>
            
            <Button
              onClick={handleAnalyzeQuadratic}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!equation1}
            >
              <TrendingUp className="w-4 h-4 ml-2" />
              تحليل تربيعي
            </Button>
            
            <Button
              onClick={handleSolveCubic}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!equation1}
            >
              <Zap className="w-4 h-4 ml-2" />
              حل تكعيبي
            </Button>
            
            <div className="flex gap-2">
              <Input
                type="number"
                value={pointX}
                onChange={(e) => setPointX(e.target.value)}
                placeholder="x"
                className="bg-white/10 border-white/20 text-white w-16"
              />
              <Button
                onClick={handleFindSlope}
                className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                disabled={!equation1}
              >
                حساب الميل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-green-900/30 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-right">نتائج التحليل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-300 text-right mb-3">{results.message}</p>
            
            {results.type === 'intersections' && results.data.length > 0 && (
              <div className="text-white text-right">
                <strong>نقاط التقاطع:</strong>
                {results.data.map((point: [number, number], index: number) => (
                  <div key={index} className="text-sm">
                    ({point[0]}, {point[1]})
                  </div>
                ))}
              </div>
            )}
            
            {results.type === 'slope' && results.data.slope !== null && (
              <div className="text-white text-right">
                <strong>الميل:</strong> {results.data.slope}
              </div>
            )}
            
            {results.type === 'quadratic' && results.data.vertex && (
              <div className="text-white text-right space-y-1">
                <div><strong>الرأس:</strong> ({results.data.vertex[0]}, {results.data.vertex[1]})</div>
                <div><strong>محور التماثل:</strong> x = {results.data.axis}</div>
                <div><strong>اتجاه القطع:</strong> {results.data.direction === 'up' ? 'لأعلى' : 'لأسفل'}</div>
                {results.data.roots && (
                  <div><strong>الجذور:</strong> {results.data.roots.join(', ')}</div>
                )}
              </div>
            )}
            
            {results.type === 'cubic' && results.data.length > 0 && (
              <div className="text-white text-right">
                <strong>جذور المعادلة التكعيبية:</strong>
                {results.data.map((root: number, index: number) => (
                  <div key={index} className="text-sm">x = {root}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisTools;
