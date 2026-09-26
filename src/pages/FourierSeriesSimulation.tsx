import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Play, Pause, RotateCcw, Activity, Layers, Sparkles, Eye, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

// 3D Rotating Epicycles & Harmonic Wave Unroller
const FourierEpicycles3D: React.FC<{
  coefficients: Array<{ n: number; an: number; bn: number }>;
  a0: number;
  N: number;
  isPlaying: boolean;
}> = ({ coefficients, a0, N, isPlaying }) => {
  const timeRef = useRef(0);
  const penTrailRef = useRef<THREE.Vector3[]>([]);
  const trailLineRef = useRef<THREE.Line>(null);
  const armsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta * 1.4;

    const t = timeRef.current;
    let currX = 0;
    let currY = (a0 / 2) * 0.5;

    // Build chain of rotating arms for first min(N, 10) harmonics
    const active = coefficients.slice(0, Math.min(N, 10));
    active.forEach((c) => {
      const radius = Math.sqrt(c.an * c.an + c.bn * c.bn) * 0.8;
      const phase = Math.atan2(c.bn, c.an);
      const angle = c.n * t + phase;
      currX += radius * Math.cos(angle);
      currY += radius * Math.sin(angle);
    });

    // Unroll wave along Z-axis into 3D space
    penTrailRef.current.unshift(new THREE.Vector3(currX, currY, 0));
    if (penTrailRef.current.length > 220) penTrailRef.current.pop();

    for (let i = 0; i < penTrailRef.current.length; i++) {
      penTrailRef.current[i].z = i * 0.045;
    }

    if (trailLineRef.current && penTrailRef.current.length > 2) {
      trailLineRef.current.geometry.setFromPoints(penTrailRef.current);
      trailLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -2.5]}>
      {/* Central Time Axis Rod */}
      <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 12, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* 3D Wave Trail Line */}
      <line ref={trailLineRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color="#38bdf8" linewidth={3} />
      </line>

      {/* Drawing Pen Tip Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Base Grid Plane */}
      <mesh position={[0, -2.2, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 12]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div className="bg-slate-900/90 text-cyan-300 font-mono text-xs px-2 py-1 rounded border border-cyan-500/50 shadow-lg whitespace-nowrap">
          مركز التدوير الهارموني (3D Epicycles) • N = {N}
        </div>
      </Html>
    </group>
  );
};

export const FourierSeriesSimulation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [expression, setExpression] = useState('x^2');
  const [N, setN] = useState(10);
  const [L, setL] = useState(Math.PI);
  const [isPiecewise, setIsPiecewise] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const [originalData, setOriginalData] = useState<Array<{ x: number; y: number }>>([]);
  const [approximationData, setApproximationData] = useState<Array<{ x: number; y: number }>>([]);
  const [discontinuities, setDiscontinuities] = useState<number[]>([]);
  const [gibbsPoints, setGibbsPoints] = useState<Array<{ x: number; overshoot: number }>>([]);
  const [coefficients, setCoefficients] = useState<{
    a0: number;
    coefficients: Array<{ n: number; an: number; bn: number }>;
  }>({
    a0: 0,
    coefficients: [],
  });

  const parsePiecewiseExpression = (expr: string): Array<{ condition: string; expression: string }> => {
    const lines = expr.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        return {
          expression: parts[0].trim(),
          condition: parts[1].trim(),
        };
      }
      return { expression: '0', condition: 'true' };
    });
  };

  const evaluateUserFunction = useCallback((x: number): number => {
    if (isPiecewise) {
      const pieces = parsePiecewiseExpression(expression);
      return FourierEngine.evaluatePiecewiseFunction(pieces, x);
    } else {
      return FourierEngine.evaluateFunction(expression, x);
    }
  }, [expression, isPiecewise]);

  const calculateData = useCallback(() => {
    try {
      setIsCalculating(true);
      const origData = FourierEngine.generateDataPoints(evaluateUserFunction, L);
      setOriginalData(origData);

      const discs = FourierEngine.detectDiscontinuities(evaluateUserFunction, L);
      setDiscontinuities(discs);

      const coeffs = FourierEngine.calculateCoefficients(evaluateUserFunction, Math.min(N, 30), L);
      setCoefficients(coeffs);

      const approxFunc = (x: number) =>
        FourierEngine.evaluateSeriesAt(coeffs.a0, coeffs.coefficients, L, x);

      const approxData = FourierEngine.generateDataPoints(approxFunc, L);
      setApproximationData(approxData);

      const gibbs = FourierEngine.detectGibbsPhenomenon(evaluateUserFunction, approxFunc, discs, L);
      setGibbsPoints(gibbs);
      setIsCalculating(false);
    } catch (error) {
      console.error(error);
      setIsCalculating(false);
    }
  }, [N, L, evaluateUserFunction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateData();
    }, 200);
    return () => clearTimeout(timer);
  }, [calculateData]);

  const handleExampleSelect = (example: any) => {
    setExpression(example.expression);
    setIsPiecewise(example.isPiecewise || false);
    setL(example.L || Math.PI);
  };

  const handleSymbolClick = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const formulaString = useMemo(() =>
    FourierEngine.generateFormulaString(coefficients.a0, coefficients.coefficients, 5),
    [coefficients]
  );

  // Approximate Mean Squared Error
  const mseError = useMemo(() => {
    if (originalData.length === 0 || approximationData.length === 0) return 0.05;
    let sumSq = 0;
    const count = Math.min(originalData.length, approximationData.length);
    for (let i = 0; i < count; i++) {
      const diff = originalData[i].y - approximationData[i].y;
      sumSq += diff * diff;
    }
    return Number((sumSq / count).toFixed(4));
  }, [originalData, approximationData]);

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'harmonics_n',
        label: 'عدد التوافقات المحسوبة (N)',
        value: N,
        unit: 'terms',
        status: 'normal' as const,
        min: 1,
        max: 50,
      },
      {
        id: 'period_l',
        label: 'نصف الدور (Half Period L)',
        value: Number(L.toFixed(2)),
        unit: 'rad',
        status: 'normal' as const,
        min: 1,
        max: 6.28,
      },
      {
        id: 'mse_error',
        label: 'متوسط مربع الخطأ (MSE)',
        value: mseError,
        unit: 'err',
        status: mseError < 0.05 ? ('normal' as const) : ('warning' as const),
        min: 0,
        max: 1.0,
      },
      {
        id: 'gibbs',
        label: 'ظاهرة غيبس (Gibbs Overshoot)',
        value: discontinuities.length > 0 ? 8.95 : 0.0,
        unit: '%',
        status: discontinuities.length > 0 ? ('critical' as const) : ('normal' as const),
        min: 0,
        max: 15,
      },
    ];
  }, [N, L, mseError, discontinuities]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'smooth_approximation',
        title: 'تقريب فورييه عالي الدقة (MSE < 0.02)',
        description: 'ارفع عدد التوافقات N لتصل دقة تقريب الدالة الأصلية إلى خطأ تربيعي أقل من 0.02.',
        targetMetric: 'متوسط مربع الخطأ (MSE)',
        targetValue: 0.015,
        unit: 'err',
        currentValue: mseError,
        holdTimeRequired: 2,
        tolerance: 0.01,
        isCompleted: false,
        hint: 'ارفع عدد التوافقات N إلى 20 أو أكثر لتقليل خطأ التقريب.',
      },
      {
        id: 'detect_gibbs',
        title: 'كشف ظاهرة غيبس في الدوال القافزة',
        description: 'اختر دالة غير مستمرة (مثل الموجة المربعة أو الدالة الدرجية) لمراقبة تجاوز غيبس (Gibbs Overshoot ~8.95%).',
        targetMetric: 'ظاهرة غيبس (Gibbs Overshoot)',
        targetValue: 8.95,
        unit: '%',
        currentValue: discontinuities.length > 0 ? 8.95 : 0,
        holdTimeRequired: 3,
        tolerance: 1.0,
        isCompleted: false,
        hint: 'انقر على مثال "الموجة المربعة" من قائمة الأمثلة الجاهزة.',
      },
      {
        id: 'epicycles_3d',
        title: 'معاينة دوائر التدوير التوافقية 3D',
        description: 'انتقل إلى وضع "العرض ثلاثي الأبعاد 3D" لمشاهدة الدوائر الهارمونية الدوارة تفكك الموجة في الفضاء.',
        targetMetric: 'نمط العرض ثلاثي الأبعاد',
        targetValue: 1,
        unit: 'mode',
        currentValue: viewMode === '3d' ? 1 : 0,
        holdTimeRequired: 3,
        tolerance: 0.1,
        isCompleted: false,
        hint: 'اضغط على زر "دوائر التدوير 3D" في أعلى الصفحة.',
      },
    ];
  }, [mseError, discontinuities, viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للتجارب العلمية'}
          </Button>
          <div className="flex gap-2">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <Button
                size="sm"
                variant={viewMode === '2d' ? 'default' : 'ghost'}
                onClick={() => setViewMode('2d')}
                className="h-7 text-xs text-primary"
              >
                الرسوم الرياضية 2D
              </Button>
              <Button
                size="sm"
                variant={viewMode === '3d' ? 'default' : 'ghost'}
                onClick={() => setViewMode('3d')}
                className="h-7 text-xs text-cyan-300"
              >
                دوائر التدوير 3D
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            مختبر سلسلة فورييه والتحليل التوافقي 3D
          </motion.h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            محاكاة تفاعلية لحساب متسلسلات فورييه، وتحليل الترددات، وظاهرة غيبس، وتفكيك الموجات عبر دوائر التدوير الهارمونية ثلاثية الأبعاد.
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pb-12 space-y-6">
        {/* Viewport Area: 2D Graphs or 3D Epicycles */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-card">
            {viewMode === '2d' ? (
              <FourierGraphs
                originalData={originalData}
                approximationData={approximationData}
                discontinuities={discontinuities}
                gibbsPoints={gibbsPoints}
              />
            ) : (
              <div className="w-full h-[480px] bg-slate-950 relative overflow-hidden">
                <Canvas camera={{ position: [3.5, 3.0, 8.0], fov: 45 }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-10, -5, -6]} intensity={0.5} color="#38bdf8" />
                  <directionalLight position={[0, 8, 4]} intensity={0.8} />

                  <Float speed={0.4} rotationIntensity={0.02} floatIntensity={0.04}>
                    <FourierEpicycles3D
                      coefficients={coefficients.coefficients}
                      a0={coefficients.a0}
                      N={N}
                      isPlaying={isAnimating}
                    />
                  </Float>

                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                </Canvas>
              </div>
            )}

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`متسلسلة فورييه • دالة: ${expression}`}
              status={isCalculating ? 'idle' : 'active'}
              oscilloscopeWaveform="sine"
              oscilloscopeFrequency={N / 2}
            />
          </div>

          {/* Gamified Laboratory Challenges */}
          <LabChallengeEngine
            challenges={challenges}
            onChallengeComplete={(c) => {
              console.log('Challenge completed:', c.title);
            }}
          />
        </div>

        {/* Ready Presets / Examples */}
        <FourierExamples onExampleSelect={handleExampleSelect} />

        {/* Controls, AI CoPilot & Mathematical Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
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

            {/* AI Lab CoPilot */}
            <LiveAILabCoPilot
              experimentContext={{
                title: 'سلسلة فورييه والتحليل التوافقي',
                currentStep: `تحليل الدالة: ${expression} عند N = ${N} توافقيات`,
                userAction: `مراقبة دقة التقريب والخطأ MSE = ${mseError} ونصف الدور L = ${L.toFixed(2)}`,
                activeMetrics: {
                  expression: expression,
                  harmonics: `${N} توافقيات`,
                  halfPeriod: `${L.toFixed(2)} rad`,
                  mseError: `${mseError}`,
                  hasGibbs: discontinuities.length > 0 ? 'نعم (ظاهرة غيبس نشطة ~8.95%)' : 'دالة متصلة بدون قفزات',
                }
              }}
              suggestions={[
                'لماذا تظل ظاهرة غيبس (القفزة بنسبة ~8.95%) موجودة مهما زاد عدد التوافقات N نحو المالانهاية؟',
                'كيف يُفسر تعامد دوال الجيب وجيب التمام (Orthogonality) إمكانية عزل كل معامل هارموني بمفرده؟',
                'ما الفرق بين سلسلة فورييه للدوال الدورية وتحويل فورييه السريع (FFT) للإشارات العامة؟',
                'كيف تستخدم خوارزميات ضغط MP3 و JPEG تحويلات فورييه للتخلص من الترددات غير المسموعة؟',
              ]}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <FourierFormula
              formulaString={formulaString}
              a0={coefficients.a0}
              coefficients={coefficients.coefficients}
            />

            <GibbsIndicator
              gibbsPoints={gibbsPoints}
              hasDiscontinuities={discontinuities.length > 0}
            />

            {showKeyboard && (
              <FourierMathKeyboard onSymbolClick={handleSymbolClick} />
            )}

            <FourierCoefficients
              a0={coefficients.a0}
              coefficients={coefficients.coefficients}
            />
          </div>
        </div>

        <FourierEducation />
      </div>
    </div>
  );
};

export default FourierSeriesSimulation;
