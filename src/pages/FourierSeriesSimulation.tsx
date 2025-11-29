import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FourierEngine } from '@/components/mathematics/FourierEngine';
import FourierGraphs from '@/components/fourier/FourierGraphs';
import FourierControls from '@/components/fourier/FourierControls';
import FourierFormula from '@/components/fourier/FourierFormula';
import FourierCoefficients from '@/components/fourier/FourierCoefficients';
import FourierExamples from '@/components/fourier/FourierExamples';
import FourierMathKeyboard from '@/components/fourier/FourierMathKeyboard';
import GibbsIndicator from '@/components/fourier/GibbsIndicator';
import FourierEducation from '@/components/fourier/FourierEducation';
import { useToast } from '@/hooks/use-toast';

const FourierSeriesSimulation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // الحالات الأساسية
  const [expression, setExpression] = useState('x^2');
  const [N, setN] = useState(10);
  const [L, setL] = useState(Math.PI);
  const [isPiecewise, setIsPiecewise] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);

  // البيانات المحسوبة
  const [originalData, setOriginalData] = useState<Array<{x: number, y: number}>>([]);
  const [approximationData, setApproximationData] = useState<Array<{x: number, y: number}>>([]);
  const [discontinuities, setDiscontinuities] = useState<number[]>([]);
  const [gibbsPoints, setGibbsPoints] = useState<Array<{x: number, overshoot: number}>>([]);
  const [coefficients, setCoefficients] = useState<{a0: number, coefficients: Array<{n: number, an: number, bn: number}>}>({
    a0: 0,
    coefficients: []
  });

  // دالة لتحليل الدالة القطعية
  const parsePiecewiseExpression = (expr: string): Array<{condition: string, expression: string}> => {
    const lines = expr.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        return {
          expression: parts[0].trim(),
          condition: parts[1].trim()
        };
      }
      return { expression: '0', condition: 'true' };
    });
  };

  // دالة لحساب قيمة الدالة
  const evaluateUserFunction = useCallback((x: number): number => {
    if (isPiecewise) {
      const pieces = parsePiecewiseExpression(expression);
      return FourierEngine.evaluatePiecewiseFunction(pieces, x);
    } else {
      return FourierEngine.evaluateFunction(expression, x);
    }
  }, [expression, isPiecewise]);

  // حساب البيانات (محسّن للأداء)
  const calculateData = useCallback(() => {
    try {
      // استخدام setTimeout لمنع تجميد الواجهة
      const timeoutId = setTimeout(() => {
        // البيانات الأصلية
        const origData = FourierEngine.generateDataPoints(evaluateUserFunction, L);
        setOriginalData(origData);

        // حساب المعاملات
        const coeffs = FourierEngine.calculateCoefficients(evaluateUserFunction, Math.min(N, 50), L);
        setCoefficients(coeffs);

        // بيانات التقريب
        const approxData = FourierEngine.generateDataPoints(
          (x) => FourierEngine.generateFourierApproximation(evaluateUserFunction, Math.min(N, 50), L, x),
          L
        );
        setApproximationData(approxData);

        // اكتشاف نقاط عدم الاستمرار
        const discs = FourierEngine.detectDiscontinuities(evaluateUserFunction, L);
        setDiscontinuities(discs);

        // كشف ظاهرة غيبس
        const gibbs = FourierEngine.detectGibbsPhenomenon(
          evaluateUserFunction,
          (x) => FourierEngine.generateFourierApproximation(evaluateUserFunction, Math.min(N, 50), L, x),
          discs,
          L
        );
        setGibbsPoints(gibbs);
      }, 100);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      toast({
        title: 'خطأ في الحساب',
        description: 'تأكد من صحة صيغة الدالة المدخلة',
        variant: 'destructive'
      });
    }
  }, [expression, N, L, isPiecewise, evaluateUserFunction, toast]);

  // تحديث البيانات عند تغيير المدخلات (مع debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateData();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [calculateData]);

  // الأنيميشن التلقائي
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setN(prev => {
          if (prev >= 100) {
            setIsAnimating(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // معالجة اختيار مثال
  const handleExampleSelect = (example: any) => {
    if (example.type === 'piecewise' && example.piecewise) {
      setIsPiecewise(true);
      const piecewiseStr = example.piecewise
        .map((p: any) => `${p.expression}, ${p.condition}`)
        .join('\n');
      setExpression(piecewiseStr);
    } else {
      setIsPiecewise(false);
      setExpression(example.expression);
    }
    toast({
      title: 'تم تحميل المثال',
      description: example.name
    });
  };

  // إضافة رمز من لوحة المفاتيح
  const handleSymbolClick = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  // استخدام useMemo لتحسين الأداء
  const formulaString = useMemo(() => 
    FourierEngine.generateFormulaString(
      coefficients.a0,
      coefficients.coefficients,
      5
    ),
    [coefficients]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* الترويسة */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6"
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/scientific-simulations')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للتجارب العلمية
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            سلسلة فورييه التفاعلية
          </motion.h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            أداة متقدمة لحساب وتمثيل سلسلة فورييه مع كشف نقاط عدم الاستمرار وظاهرة غيبس
          </p>
        </div>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 pb-12 space-y-8">
        {/* الأمثلة */}
        <FourierExamples onExampleSelect={handleExampleSelect} />

        {/* الرسوم البيانية */}
        <FourierGraphs
          originalData={originalData}
          approximationData={approximationData}
          discontinuities={discontinuities}
          gibbsPoints={gibbsPoints}
        />

        {/* عناصر التحكم */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FourierControls
              expression={expression}
              onExpressionChange={setExpression}
              N={N}
              onNChange={setN}
              L={L}
              onLChange={setL}
              isAnimating={isAnimating}
              onToggleAnimation={() => setIsAnimating(!isAnimating)}
              onReset={() => {
                setExpression('x^2');
                setN(10);
                setL(Math.PI);
                setIsPiecewise(false);
              }}
              isPiecewise={isPiecewise}
              onTogglePiecewise={() => {
                setIsPiecewise(!isPiecewise);
                setExpression(isPiecewise ? 'x^2' : '-1, x < 0\n1, x >= 0');
              }}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* الصيغة */}
            <FourierFormula
              formulaString={formulaString}
              a0={coefficients.a0}
              coefficients={coefficients.coefficients}
            />

            {/* ظاهرة غيبس */}
            <GibbsIndicator
              gibbsPoints={gibbsPoints}
              hasDiscontinuities={discontinuities.length > 0}
            />
          </div>
        </div>

        {/* لوحة المفاتيح الرياضية */}
        {showKeyboard && (
          <FourierMathKeyboard onSymbolClick={handleSymbolClick} />
        )}

        {/* المعاملات */}
        <FourierCoefficients
          a0={coefficients.a0}
          coefficients={coefficients.coefficients}
        />

        {/* الدليل التعليمي */}
        <FourierEducation />
      </div>
    </div>
  );
};

export default FourierSeriesSimulation;
