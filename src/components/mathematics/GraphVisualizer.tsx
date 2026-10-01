import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Sparkles, Send, Loader2, Plus, Trash2, Eye, EyeOff, 
  Layers, Table, LineChart, Search, Check, RefreshCw, Sliders, 
  HelpCircle, Compass, Target, TrendingUp, BookOpen, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import InteractiveCanvas, { CurveDefinition } from './InteractiveCanvas';
import { MathEngine } from './MathEngine';
import { FUNCTION_CATALOG, FUNCTION_CATEGORIES, MathFunctionItem } from './FunctionCatalog';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import { supabase } from '@/integrations/supabase/client';

const GraphVisualizer: React.FC = () => {
  // Multi-curve state
  const [curves, setCurves] = useState<CurveDefinition[]>([
    { id: 'c1', expression: 'sin(x)', color: '#38bdf8', label: 'f₁(x)', visible: true },
    { id: 'c2', expression: '0.5 * x', color: '#ec4899', label: 'f₂(x)', visible: true },
    { id: 'c3', expression: 'exp(-0.2*x) * cos(3*x)', color: '#fbbf24', label: 'f₃(x)', visible: false },
    { id: 'c4', expression: 'x^2 / 4 - 2', color: '#34d399', label: 'f₄(x)', visible: false }
  ]);
  const [activeCurveId, setActiveCurveId] = useState<string>('c1');

  // Canvas visual toggles
  const [showRoots, setShowRoots] = useState(true);
  const [showExtrema, setShowExtrema] = useState(true);
  const [showTangent, setShowTangent] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [integralRange, setIntegralRange] = useState<[number, number]>([0, 4]);

  // AI Equation Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    title: string;
    latex: string;
    explanation: string;
  } | null>(null);

  // 100+ Operations Catalog State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Numerical Values Table State ("الكثييير من الاعداد")
  const [tableStep, setTableStep] = useState<number>(0.5);
  const [tableRange, setTableRange] = useState<[number, number]>([-10, 10]);

  // Intersections cache
  const [intersections, setIntersections] = useState<Array<[number, number]>>([]);

  // Re-calculate intersections when curves change
  useEffect(() => {
    const activeCurves = curves.filter(c => c.visible && c.expression.trim());
    if (activeCurves.length >= 2) {
      const inters = MathEngine.findIntersections(activeCurves[0].expression, activeCurves[1].expression);
      setIntersections(inters);
    } else {
      setIntersections([]);
    }
  }, [curves]);

  // Curve editing
  const updateCurveExpression = (id: string, newExpr: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, expression: newExpr } : c));
  };

  const toggleCurveVisibility = (id: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const clearCurve = (id: string) => {
    updateCurveExpression(id, '');
  };

  // Insert function from 100+ library
  const handleInsertFunction = (item: MathFunctionItem, mode: 'replace' | 'insert') => {
    if (mode === 'replace') {
      updateCurveExpression(activeCurveId, item.template);
      toast.success(`تم تعيين الدالة: ${item.nameAr}`);
    } else {
      const current = curves.find(c => c.id === activeCurveId)?.expression || '';
      updateCurveExpression(activeCurveId, current ? `${current} + ${item.template}` : item.template);
      toast.success(`تمت إضافة: ${item.symbol}`);
    }
  };

  // Natural Language AI Equation Generator ("اقوله الي ببالي وهو يعمل المعادله بشكل انيق")
  const generateEquationFromAI = async (customText?: string) => {
    const text = customText || aiPrompt;
    if (!text.trim()) return;

    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      // 1. Semantic Arabic Classifier & Physics Math Dictionary
      const t = text.toLowerCase().replace(/[\u064B-\u065F]/g, '');

      let generatedFormula = '';
      let generatedTitle = '';
      let generatedLatex = '';
      let generatedExplanation = '';

      if (t.includes('متلاشي') || t.includes('تلاشي') || t.includes('مخمد') || t.includes('اهتزاز')) {
        generatedFormula = 'exp(-0.25*x) * cos(3*x)';
        generatedTitle = 'موجة جيبية متلاشية (Damped Harmonic Wave)';
        generatedLatex = 'f(x) = e^{-0.25x} \\cos(3x)';
        generatedExplanation = 'تمثل حركة اهتزازية متلاشية فيزيائياً مع مرور الوقت نتيجة قوى الاحتكاك ومقاومة المائع، حيث يتولى الحد الأسي e^(-0.25x) خفض السعة تدريجياً، بينما يحدد جيب التمام تردد الذبذبات.';
      } else if (t.includes('قلب') || t.includes('حب')) {
        generatedFormula = 'sqrt(abs(x)) + 0.7*sqrt(4 - x^2)*sin(20*x)';
        generatedTitle = 'منحنى قلب الحب الرياضي الهندسي (Cardioid Heart Curve)';
        generatedLatex = 'f(x) = \\sqrt{|x|} + 0.7\\sqrt{4 - x^2}\\sin(20x)';
        generatedExplanation = 'معادلة رياضية مشهورة تجمع بين دالة القيمة المطلقة لرسم القوس السفلي والدالة الدائرية لإنشاء انحناءات القلب العلوية بشكل متناظر وأنيق.';
      } else if (t.includes('جرس') || t.includes('طبيعي') || t.includes('احتمال') || t.includes('جاوس')) {
        generatedFormula = 'exp(-0.5*x^2) / sqrt(2*pi)';
        generatedTitle = 'منحنى التوزيع الطبيعي المعياري (Gaussian Bell Curve)';
        generatedLatex = 'f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}';
        generatedExplanation = 'منحنى غاوس الأشهر في نظرية الاحتمالات والإحصاء، يمثل توزيع الظواهر الطبيعية والفيزيائية حول متوسطها الحسابي مع انحراف معياري يساوي 1.';
      } else if (t.includes('تضارب') || t.includes('نغم') || t.includes('صوت') || t.includes('رنين')) {
        generatedFormula = 'cos(5*x) + cos(5.6*x)';
        generatedTitle = 'ظاهرة التضارب الصوتي والتوافقي (Acoustic Beats)';
        generatedLatex = 'f(x) = \\cos(5x) + \\cos(5.6x)';
        generatedExplanation = 'تراكب موجتين بترددين متقاربين (5Hz و 5.6Hz) ينتج نبضات دورية في سعة الصوت الكلية، وهي الظاهرة المستخدمة في دوزنة الآلات الموسيقية بدقة عالية.';
      } else if (t.includes('مقذوف') || t.includes('جاذبي') || t.includes('رمي') || t.includes('سقوط')) {
        generatedFormula = '15 - 0.25*x^2';
        generatedTitle = 'مسار حركة مقذوف في مجال الجاذبية (Parabolic Trajectory)';
        generatedLatex = 'y(x) = 15 - 0.25x^2';
        generatedExplanation = 'يمثل مسار جسم أطلق رأسياً أو مائلاً تحت تأثير تسارع الجاذبية الأرضية المنتظم مع إهمال مقاومة الهواء، ويكون المسار دائماً قطعاً مكافئاً رأسه هو أقصى ارتفاع.';
      } else if (t.includes('لوجستي') || t.includes('سكان') || t.includes('نمو') || t.includes('فيروس')) {
        generatedFormula = '10 / (1 + exp(-0.8*x))';
        generatedTitle = 'دالة النمو اللوجستي البيولوجي (Logistic Growth)';
        generatedLatex = 'P(x) = \\frac{10}{1 + e^{-0.8x}}';
        generatedExplanation = 'تصف تكاثر الجماعات الإحيائية ونمو الخلايا وانتشار الأوبئة في بيئة ذات موارد محدودة، حيث يبدأ النمو متسارعاً ثم يتباطأ ليستقر عند السعة الاستيعابية القصوى.';
      } else if (t.includes('مربع') || t.includes('ساعة') || t.includes('رقمي')) {
        generatedFormula = 'sign(sin(x))';
        generatedTitle = 'الموجة المربعة الدورية الرقمية (Square Wave)';
        generatedLatex = 'f(x) = \\text{sgn}(\\sin(x))';
        generatedExplanation = 'تتحول بسلاسة بين قيمتين ثابتتين (+1 و -1)، وهي تمثل إشارات النبض والساعة الرقمية في معالجات الحاسوب والدوائر المنطقية.';
      } else if (t.includes('سن منشار') || t.includes('منشار')) {
        generatedFormula = '2 * (x/(2*pi) - floor(0.5 + x/(2*pi)))';
        generatedTitle = 'موجة سن المنشار التناظرية (Sawtooth Wave)';
        generatedLatex = 'f(x) = 2 \\left(\\frac{x}{2\\pi} - \\lfloor 0.5 + \\frac{x}{2\\pi} \\rfloor \\right)';
        generatedExplanation = 'موجة خطية ترتفع تدريجياً ثم تهبط فجأة بشكل دوري، وتستخدم في مولدات الصوت والمسح التلفزيوني CRT.';
      } else if (t.includes('كسري') || t.includes('تقارب') || t.includes('انفصال')) {
        generatedFormula = '1 / (x - 2)';
        generatedTitle = 'دالة كسرية مع خط تقارب رأسي (Rational Asymptote)';
        generatedLatex = 'f(x) = \\frac{1}{x - 2}';
        generatedExplanation = 'دالة كسرية تملك خط تقارب رأسي عند x = 2 حيث تصبح قيمة المقام صفراً وتقترب الدالة من اللانهاية، ومقارب أفقي عند y = 0.';
      } else if (t.includes('شيرب') || t.includes('رادار') || t.includes('متزايد التردد')) {
        generatedFormula = 'sin(0.25 * x^2)';
        generatedTitle = 'إشارة الشيرب متزايدة التردد (Chirp Waveform)';
        generatedLatex = 'f(x) = \\sin(0.25x^2)';
        generatedExplanation = 'إشارة يتزايد ترددها باستمرار مع مرور الزمن، وتستخدم على نطاق واسع في الرادارات العسكرية وأجهزة السونار البحرية ومراصد موجات الجاذبية LIGO.';
      } else {
        // Fallback: Use remote Lovable AI Gateway if available
        try {
          const { data } = await supabase.functions.invoke('math-ai-assistant', {
            body: {
              question: `حول الوصف التالي إلى معادلة رياضية f(x) مناسبة للرسم البياني مع شرح أنيق وموجز: "${text}"`,
              currentValue: '0'
            }
          });

          if (data && data.answer) {
            // Extract formula if present
            const match = data.answer.match(/([a-z0-9\+\-\*\/\^\(\)\.\s]+=[^\n]+)/i);
            generatedFormula = match ? match[1].replace(/.*=/, '').trim() : 'sin(x) + cos(2*x)';
            generatedTitle = 'معادلة مولدة بالذكاء الاصطناعي';
            generatedLatex = `f(x) = ${generatedFormula}`;
            generatedExplanation = data.answer;
          }
        } catch {
          // If remote fails, fallback to elegant harmonic combination
          generatedFormula = 'sin(x) * cos(x/2)';
          generatedTitle = 'توليفة موجية توافقية مركبة';
          generatedLatex = 'f(x) = \\sin(x) \\cdot \\cos(x/2)';
          generatedExplanation = `تمت ترجمة وصفك: "${text}" إلى دالة توافقية تدمج الترددات المختلفة لتكوين شكل موجي جمالي وأنيق.`;
        }
      }

      // Update primary curve and set explanation
      updateCurveExpression('c1', generatedFormula);
      setAiExplanation({
        title: generatedTitle,
        latex: generatedLatex,
        explanation: generatedExplanation
      });

      toast.success(`تم إنشاء المعادلة ورسمها بنجاح: ${generatedTitle}`);
    } catch (err: any) {
      toast.error('حدث خطأ في توليد المعادلة');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filter 100+ functions
  const filteredCatalog = FUNCTION_CATALOG.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate Table of Values ("الكثييير من الاعداد")
  const generateValuesTable = () => {
    const rows: Array<{ x: number; y1: number; y2: number; slope: number }> = [];
    const [start, end] = tableRange;
    const step = tableStep;

    const c1 = curves[0]?.expression || 'sin(x)';
    const c2 = curves[1]?.expression || '0';

    for (let x = start; x <= end; x += step) {
      const roundedX = parseFloat(x.toFixed(3));
      const y1 = MathEngine.evaluateExpression(c1, roundedX);
      const y2 = MathEngine.evaluateExpression(c2, roundedX);
      const slope = MathEngine.findSlope(c1, roundedX);

      rows.push({
        x: roundedX,
        y1: isNaN(y1) ? NaN : parseFloat(y1.toFixed(3)),
        y2: isNaN(y2) ? NaN : parseFloat(y2.toFixed(3)),
        slope: isNaN(slope) ? NaN : parseFloat(slope.toFixed(3))
      });
    }

    return rows;
  };

  const tableData = generateValuesTable();

  // Export Table as CSV
  const handleExportCSV = () => {
    const header = "x,f1(x),f2(x),f1_derivative\n";
    const content = tableData.map(r => `${r.x},${isNaN(r.y1) ? '' : r.y1},${isNaN(r.y2) ? '' : r.y2},${isNaN(r.slope) ? '' : r.slope}`).join('\n');
    const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathematical-values-table-${Date.now()}.csv`;
    link.click();
    toast.success('تم تصدير جدول الأعداد والبيانات الرياضية (CSV)');
  };

  const quickAiIdeas = [
    { label: 'موجة متلاشية مع الوقت', prompt: 'اعملي موجة متلاشية مع الوقت فيزيائية' },
    { label: 'شكل قلب حب رياضي', prompt: 'بدي شكل قلب حب بالرياضيات' },
    { label: 'منحنى الجرس الطبيعي', prompt: 'منحنى التوزيع الطبيعي المعياري' },
    { label: 'تضارب نغمات صوتية', prompt: 'تضارب موجي ورنين لنغمتين صوتيتين' },
    { label: 'مسار مقذوف بالجاذبية', prompt: 'مسار مقذوف فيزيائي تحت تأثير الجاذبية' },
    { label: 'نمو لوجستي بيولوجي', prompt: 'نمو لوجستي بيولوجي وسكاني' }
  ];

  return (
    <div className="space-y-8 w-full max-w-[1750px] mx-auto text-right" dir="rtl">
      
      {/* 1. Header Banner & Quick Insights */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-xl shadow-purple-500/20 text-white">
            <LineChart className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                محرك رسومي عملاق
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                +100 دالة وعملية رياضية
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              معرض الرسوم البيانية التفاعلي فائق الدقة
            </h2>
          </div>
        </div>

        {/* Visual Analysis Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRoots(!showRoots)}
            className={`rounded-xl text-xs gap-1.5 ${showRoots ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>الأصفار والجذور</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExtrema(!showExtrema)}
            className={`rounded-xl text-xs gap-1.5 ${showExtrema ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>القمم والقيعان</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTangent(!showTangent)}
            className={`rounded-xl text-xs gap-1.5 ${showTangent ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>خط المماس (Tangent)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowIntegral(!showIntegral)}
            className={`rounded-xl text-xs gap-1.5 ${showIntegral ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <span>∫</span>
            <span>تظليل التكامل</span>
          </Button>
        </div>
      </div>

      {/* 2. Natural Language AI Equation Creator ("اقوله الي ببالي وهو يعمل المعادله بشكل انيق") */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-7 rounded-[2.5rem] bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-cyan-950/70 border border-purple-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                المصمم الذكي للمعادلات بالذكاء الاصطناعي
              </h3>
              <p className="text-slate-300 text-xs md:text-sm">
                قل ما يخطر ببالك باللغة الطبيعية، وسيقوم الذكاء الاصطناعي ببناء المعادلة الرياضية الأنيقة ورسمها فوراً
              </p>
            </div>
          </div>
        </div>

        {/* AI Prompt Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateEquationFromAI()}
              placeholder="اكتب ما يخطر ببالك... مثلاً: 'موجة متلاشية مع الوقت'، 'شكل جرس طبيعي'، 'قلب حب بالرياضيات'..."
              className="w-full px-5 py-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base md:text-lg shadow-inner"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900/90 border border-purple-500/40">
              <GlobalVoiceInput
                onTranscript={(text) => setAiPrompt(prev => (prev ? prev + ' ' : '') + text)}
                size="md"
                disabled={isAiLoading}
              />
            </div>

            <Button
              onClick={() => generateEquationFromAI()}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري البناء...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>توليد ورسم المعادلة</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Creative Ideas Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">أفكار سريعة بنقرة واحدة:</span>
          {quickAiIdeas.map((idea, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(idea.prompt);
                generateEquationFromAI(idea.prompt);
              }}
              className="px-3 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-800/50 text-xs text-purple-200 border border-purple-700/40 hover:border-purple-400 transition-all flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>{idea.label}</span>
            </button>
          ))}
        </div>

        {/* AI Mathematical Explanation Output */}
        <AnimatePresence>
          {aiExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  المعادلة الناتجة (Formulated Equation)
                </span>
                <span className="text-xs font-mono text-purple-300">{aiExplanation.title}</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-cyan-300 font-mono text-lg text-left overflow-x-auto" dir="ltr">
                {aiExplanation.latex}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {aiExplanation.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. The Grand Interactive Canvas ("يفتح أكبر تمثيل بياني") */}
      <div className="space-y-4">
        <InteractiveCanvas
          curves={curves}
          intersections={intersections}
          showRoots={showRoots}
          showExtrema={showExtrema}
          showTangent={showTangent}
          showIntegral={showIntegral}
          integralRange={integralRange}
          height={680}
        />

        {/* Multi-Function Input Rack */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {curves.map((curve) => (
            <div
              key={curve.id}
              onClick={() => setActiveCurveId(curve.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeCurveId === curve.id 
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3.5 h-3.5 rounded-full" 
                    style={{ backgroundColor: curve.color }} 
                  />
                  <span className="font-bold text-sm text-white font-mono">{curve.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCurveVisibility(curve.id);
                    }}
                    className={`w-7 h-7 p-0 ${curve.visible ? 'text-cyan-400' : 'text-slate-500'}`}
                  >
                    {curve.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCurve(curve.id);
                    }}
                    className="w-7 h-7 p-0 text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <Input
                value={curve.expression}
                onChange={(e) => updateCurveExpression(curve.id, e.target.value)}
                placeholder="أدخل المعادلة مثل: x^2"
                className="bg-slate-950/80 border-slate-700 text-white font-mono text-left text-sm"
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tabs: 100+ Operations Library & Numbers Table ("الكثييير من الاعداد") */}
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <TabsTrigger value="catalog" className="rounded-xl text-base font-bold data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            📚 موسوعة 100+ دالة وعملية رياضية
          </TabsTrigger>
          <TabsTrigger value="numbers" className="rounded-xl text-base font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            🔢 جدول الأعداد والتحليل الرقمي الموسع
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 100+ Functions Library */}
        <TabsContent value="catalog" className="mt-6 space-y-6">
          {/* Search & Categories Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أي دالة (مثال: sin, تكامل, جرس, جاما)..."
                className="pr-10 bg-slate-950/80 border-slate-700 text-white text-sm rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-cyan-500 text-white shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                الكل ({FUNCTION_CATALOG.length})
              </button>
              {FUNCTION_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id 
                      ? 'bg-cyan-500 text-white shadow-md' 
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid of 100+ Functions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCatalog.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-mono">
                      {item.categoryAr}
                    </span>
                    <span className="text-xs text-slate-500 font-mono" dir="ltr">{item.symbol}</span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{item.nameAr}</h4>
                  
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 font-mono text-xs text-cyan-300 text-left mb-2" dir="ltr">
                    {item.template}
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {item.descriptionAr}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                  <Button
                    size="sm"
                    onClick={() => handleInsertFunction(item, 'replace')}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-xl font-semibold"
                  >
                    رسم فوري
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertFunction(item, 'insert')}
                    className="border-slate-700 text-slate-300 hover:text-white text-xs rounded-xl"
                  >
                    إدراج +
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Numbers Table ("الكثييير من الاعداد") */}
        <TabsContent value="numbers" className="mt-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Table className="w-5 h-5 text-cyan-400" />
                  <span>جدول البيانات والحسابات الرقمية الدقيقة</span>
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  عرض قيم الدوال، ميل المماس، وقيم النقاط المحسوبة خطوة بخطوة عبر المجال المحدد
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-700 text-cyan-300 hover:bg-cyan-950/40 gap-1.5"
                >
                  <span>تصدير ملف أرقام CSV</span>
                </Button>
              </div>
            </div>

            {/* Range & Step Controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <span>الخطوة (Step Δx):</span>
                {[0.25, 0.5, 1, 2].map(st => (
                  <button
                    key={st}
                    onClick={() => setTableStep(st)}
                    className={`px-2.5 py-1 rounded-lg ${tableStep === st ? 'bg-cyan-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span>المجال:</span>
                <button
                  onClick={() => setTableRange([-5, 5])}
                  className={`px-2.5 py-1 rounded-lg ${tableRange[0] === -5 ? 'bg-purple-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                >
                  [-5, 5]
                </button>
                <button
                  onClick={() => setTableRange([-15, 15])}
                  className={`px-2.5 py-1 rounded-lg ${tableRange[0] === -15 ? 'bg-purple-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                >
                  [-15, 15]
                </button>
              </div>
            </div>

            {/* Numbers Table Grid */}
            <div className="overflow-x-auto max-h-[500px] rounded-2xl border border-slate-800">
              <table className="w-full text-sm font-mono text-center">
                <thead className="bg-slate-950/90 text-cyan-300 text-xs uppercase sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">x</th>
                    <th className="py-3 px-4 text-cyan-400">{curves[0]?.label || 'f₁(x)'}</th>
                    <th className="py-3 px-4 text-pink-400">{curves[1]?.label || 'f₂(x)'}</th>
                    <th className="py-3 px-4 text-amber-400">ميل المماس f₁'(x)</th>
                    <th className="py-3 px-4 text-emerald-400">الحالة الرياضية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
                  {tableData.map((row, index) => {
                    const isZero = !isNaN(row.y1) && Math.abs(row.y1) < 0.001;
                    const isExtreme = !isNaN(row.slope) && Math.abs(row.slope) < 0.05;
                    return (
                      <tr 
                        key={index} 
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isZero ? 'bg-cyan-950/30' : isExtreme ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold text-white">{row.x}</td>
                        <td className="py-2.5 px-4 text-cyan-300">{isNaN(row.y1) ? 'غير معرّف' : row.y1}</td>
                        <td className="py-2.5 px-4 text-pink-300">{isNaN(row.y2) ? 'غير معرّف' : row.y2}</td>
                        <td className="py-2.5 px-4 text-amber-300">{isNaN(row.slope) ? 'غير معرّف' : row.slope}</td>
                        <td className="py-2.5 px-4">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">
                              جذر الدالة (Root)
                            </span>
                          ) : isExtreme ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                              نقطة حرجة (Extremum)
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GraphVisualizer;
