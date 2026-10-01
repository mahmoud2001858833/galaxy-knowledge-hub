import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, History, Trash2, Send, Loader2, Calculator, 
  Percent, Divide, X, Minus, Plus, Equal, Delete, RotateCcw, 
  ArrowRight, Copy, Check, BookOpen, Layers, Lightbulb, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MathAIEngine, MathSolution } from './MathAIEngine';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';

const HandheldCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [formulaPreview, setFormulaPreview] = useState('');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // AI State
  const [showAI, setShowAI] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiSolution, setAiSolution] = useState<MathSolution | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Calculator Modes
  const [memory, setMemory] = useState<number>(0);
  const [isScientificMode, setIsScientificMode] = useState(true);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleButtonPress = (key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 100);
  };

  const inputDigit = (digit: string) => {
    handleButtonPress(digit);
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    handleButtonPress('.');
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    handleButtonPress('C');
    setDisplay('0');
    setFormulaPreview('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    handleButtonPress('CE');
    setDisplay('0');
  };

  const backspace = () => {
    handleButtonPress('⌫');
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const toggleSign = () => {
    handleButtonPress('±');
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const inputPercent = () => {
    handleButtonPress('%');
    const value = parseFloat(display);
    const result = value / 100;
    setDisplay(String(result));
    setFormulaPreview(`${value}% =`);
  };

  const performOperation = (nextOperation: string) => {
    handleButtonPress(nextOperation);
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
      setFormulaPreview(`${display} ${nextOperation}`);
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let result = 0;

      switch (operation) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case '×': result = currentValue * inputValue; break;
        case '÷': result = inputValue !== 0 ? currentValue / inputValue : 0; break;
        case '^': result = Math.pow(currentValue, inputValue); break;
        case 'mod': result = currentValue % inputValue; break;
        default: result = inputValue;
      }

      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      setDisplay(String(result));
      setPreviousValue(String(result));
      setFormulaPreview(`${result} ${nextOperation}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    handleButtonPress('=');
    if (operation === null || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result = 0;

    switch (operation) {
      case '+': result = currentValue + inputValue; break;
      case '-': result = currentValue - inputValue; break;
      case '×': result = currentValue * inputValue; break;
      case '÷': result = inputValue !== 0 ? currentValue / inputValue : 0; break;
      case '^': result = Math.pow(currentValue, inputValue); break;
      case 'mod': result = currentValue % inputValue; break;
      default: result = inputValue;
    }

    const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    setFormulaPreview(`${currentValue} ${operation} ${inputValue} =`);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const performScientific = (func: string) => {
    handleButtonPress(func);
    const value = parseFloat(display);
    let result = 0;

    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    switch (func) {
      case 'sin':
        result = Math.sin(angleMode === 'DEG' ? toRad(value) : value);
        break;
      case 'cos':
        result = Math.cos(angleMode === 'DEG' ? toRad(value) : value);
        break;
      case 'tan':
        result = Math.tan(angleMode === 'DEG' ? toRad(value) : value);
        break;
      case 'asin':
        result = angleMode === 'DEG' ? toDeg(Math.asin(value)) : Math.asin(value);
        break;
      case 'acos':
        result = angleMode === 'DEG' ? toDeg(Math.acos(value)) : Math.acos(value);
        break;
      case 'atan':
        result = angleMode === 'DEG' ? toDeg(Math.atan(value)) : Math.atan(value);
        break;
      case 'sinh': result = Math.sinh(value); break;
      case 'cosh': result = Math.cosh(value); break;
      case 'tanh': result = Math.tanh(value); break;
      case 'ln': result = value > 0 ? Math.log(value) : NaN; break;
      case 'log': result = value > 0 ? Math.log10(value) : NaN; break;
      case 'log₂': result = value > 0 ? Math.log2(value) : NaN; break;
      case '√': result = value >= 0 ? Math.sqrt(value) : NaN; break;
      case '∛': result = Math.cbrt(value); break;
      case 'x²': result = Math.pow(value, 2); break;
      case 'x³': result = Math.pow(value, 3); break;
      case '10ˣ': result = Math.pow(10, value); break;
      case 'eˣ': result = Math.exp(value); break;
      case '2ˣ': result = Math.pow(2, value); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'abs': result = Math.abs(value); break;
      case '1/x': result = value !== 0 ? 1 / value : NaN; break;
      case 'n!': {
        let f = 1;
        for (let i = 2; i <= Math.floor(value); i++) f *= i;
        result = f;
        break;
      }
      case 'floor': result = Math.floor(value); break;
      case 'ceil': result = Math.ceil(value); break;
      case 'round': result = Math.round(value); break;
      case 'rand': result = Math.random(); break;
      default: return;
    }

    setFormulaPreview(`${func}(${value}) =`);
    setDisplay(String(isNaN(result) ? 'خطأ رياضي' : result));
    setWaitingForOperand(true);
  };

  const memoryStore = () => {
    handleButtonPress('MS');
    setMemory(parseFloat(display) || 0);
    toast.success('تم حفظ القيمة في الذاكرة M');
  };

  const memoryRecall = () => {
    handleButtonPress('MR');
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryAdd = () => {
    handleButtonPress('M+');
    setMemory(memory + (parseFloat(display) || 0));
    toast.success('تمت الإضافة للذاكرة M');
  };

  const memorySubtract = () => {
    handleButtonPress('M-');
    setMemory(memory - (parseFloat(display) || 0));
    toast.success('تم الطرح من الذاكرة M');
  };

  const memoryClear = () => {
    handleButtonPress('MC');
    setMemory(0);
    toast.success('تم مسح الذاكرة M');
  };

  // AI Math Engine Execution
  const askAI = async (customPrompt?: string) => {
    const questionToAsk = customPrompt || aiQuestion;
    if (!questionToAsk.trim()) return;

    setIsAiLoading(true);
    setAiSolution(null);
    try {
      const solution = await MathAIEngine.solve(questionToAsk, display);
      setAiSolution(solution);
      toast.success('تم حل المسألة وشرح الخطوات بنجاح!');
    } catch (error: any) {
      console.error('AI Solver Error:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة السؤال الرياضي');
    } finally {
      setIsAiLoading(false);
    }
  };

  const injectResultToCalculator = (result: number | string) => {
    const cleanStr = String(result);
    setDisplay(cleanStr);
    setFormulaPreview(`[مستورد من الذكاء الاصطناعي] =`);
    setWaitingForOperand(true);
    toast.success(`تم نقل القيمة (${cleanStr}) لشاشة الحاسبة`);
  };

  const copySolutionToClipboard = () => {
    if (!aiSolution) return;
    const fullText = `المسألة: ${aiSolution.formattedQuestion}\n\nخطوات الحل:\n${aiSolution.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.explanation} ${s.latex ? `[${s.latex}]` : ''}`).join('\n')}\n\nالنتيجة النهائية: ${aiSolution.finalAnswer}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ الحل وخطواته بنجاح');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') performOperation('+');
      else if (e.key === '-') performOperation('-');
      else if (e.key === '*') performOperation('×');
      else if (e.key === '/') performOperation('÷');
      else if (e.key === 'Enter' || e.key === '=') calculate();
      else if (e.key === 'Escape') clear();
      else if (e.key === 'Backspace') backspace();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, operation, previousValue, waitingForOperand]);

  const CalcButton = ({ 
    value, 
    onClick, 
    className = '', 
    variant = 'default',
    size = 'normal'
  }: { 
    value: string | React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operation' | 'function' | 'equal' | 'memory' | 'scientific' | 'danger';
    size?: 'normal' | 'large' | 'wide';
  }) => {
    const sizeClasses = {
      normal: "h-14 md:h-16 text-lg md:text-xl",
      large: "h-14 md:h-16 text-xl md:text-2xl font-mono",
      wide: "h-14 md:h-16 text-lg md:text-xl col-span-2"
    };

    const baseClass = `relative font-bold rounded-2xl transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center ${sizeClasses[size]}`;
    
    const variants = {
      default: "bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/60 dark:bg-slate-800/80 dark:hover:bg-slate-700",
      operation: "bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border border-amber-400/50 shadow-amber-500/20",
      function: "bg-slate-700/80 hover:bg-slate-600/80 text-cyan-300 border border-slate-600/50",
      equal: "bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-400/50 shadow-emerald-500/20",
      memory: "bg-purple-900/60 hover:bg-purple-800/70 text-purple-200 border border-purple-700/40 text-sm",
      scientific: "bg-indigo-950/70 hover:bg-indigo-900/80 text-cyan-200 border border-indigo-800/40 text-sm md:text-base",
      danger: "bg-rose-600/80 hover:bg-rose-500/80 text-white border border-rose-500/50"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92, y: 1 }}
        className={`${baseClass} ${variants[variant]} ${className}`}
        onClick={onClick}
      >
        {value}
      </motion.button>
    );
  };

  const quickPrompts = [
    { label: 'حل معادلة تربيعية', query: 'حل المعادلة 2x^2 - 8x + 6 = 0' },
    { label: 'مشتقة دالة', query: 'احسب مشتقة 3x^3 - 4x^2 + 5x - 7' },
    { label: 'تكامل غير محدود', query: 'احسب تكامل 4x^3 + 2x - 5' },
    { label: 'تحليل إحصائي', query: 'احسب المتوسط والانحراف المعياري للقيم: 15, 20, 25, 30, 40' },
    { label: 'محدد مصفوفة', query: 'احسب محدد المصفوفة [[4, 2], [1, 3]]' },
    { label: 'مبرهنة فيثاغورس', query: 'مثلث قائم طول ضلعيه 6 و 8، أوجد طول الوتر ومساحته' },
    { label: 'مساحة ومحيط دائرة', query: 'احسب مساحة ومحيط دائرة نصف قطرها 7' },
    { label: 'نسبة وخصم مالي', query: 'احسب 25% من المبلغ 840' }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full max-w-[1500px] mx-auto px-2 sm:px-4">
      
      {/* LEFT: Handheld Scientific Calculator Engine */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-[580px] shrink-0"
      >
        <div 
          className="relative p-6 md:p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(145deg, #0f172a, #090d16)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(120, 119, 198, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-md">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase">AI-ENHANCED SCIENTIFIC ENGINE</span>
                <h3 className="text-white font-bold text-lg">الحاسبة الرياضية الذكية</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`text-xs rounded-xl gap-1.5 border-slate-700 ${showHistory ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800/80 text-slate-300 hover:text-white'}`}
              >
                <History className="w-4 h-4" />
                <span>السجل</span>
              </Button>
            </div>
          </div>

          {/* Mode Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScientificMode(!isScientificMode)}
                className={`text-xs rounded-xl px-3 h-8 ${isScientificMode ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                {isScientificMode ? '📐 علمية موسعة' : '🔢 حاسبة أساسية'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
                className={`text-xs rounded-xl px-3 h-8 ${angleMode === 'RAD' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                {angleMode === 'DEG' ? '° درجات (DEG)' : '𝜋 راديان (RAD)'}
              </Button>
            </div>

            {memory !== 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono">
                <span className="font-bold">M</span>
                <span>= {memory.toFixed(2)}</span>
              </span>
            )}
          </div>

          {/* OLED Digital Display */}
          <div 
            className="relative mb-5 p-5 md:p-6 rounded-2xl overflow-hidden border-2 border-cyan-900/40"
            style={{
              background: 'radial-gradient(ellipse at top, #0b1d33, #040912)',
              boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.8), 0 0 20px rgba(6, 182, 212, 0.15)'
            }}
          >
            {/* Background CRT scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            
            {/* Formula Preview / History indicator */}
            <div className="text-right text-xs md:text-sm text-cyan-400/70 mb-1 font-mono tracking-wider min-h-[1.25rem] truncate" dir="ltr">
              {formulaPreview || (previousValue && operation ? `${previousValue} ${operation}` : '')}
            </div>
            
            {/* Main Value Display */}
            <div 
              className="text-right text-3xl md:text-5xl font-mono font-bold tracking-wider text-cyan-300 select-all overflow-x-auto whitespace-nowrap scrollbar-none py-1"
              style={{
                textShadow: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.2)'
              }}
              dir="ltr"
            >
              {display.length > 15 ? parseFloat(display).toExponential(7) : display}
            </div>
          </div>

          {/* Scientific Operations (Extended) */}
          <AnimatePresence>
            {isScientificMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 space-y-2"
              >
                {/* Row 1: Trigonometric */}
                <div className="grid grid-cols-6 gap-1.5">
                  {['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].map(func => (
                    <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="scientific" />
                  ))}
                </div>
                {/* Row 2: Hyperbolic & Log */}
                <div className="grid grid-cols-6 gap-1.5">
                  {['sinh', 'cosh', 'tanh', 'ln', 'log', 'log₂'].map(func => (
                    <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="scientific" />
                  ))}
                </div>
                {/* Row 3: Powers & Roots */}
                <div className="grid grid-cols-6 gap-1.5">
                  {['√', '∛', 'x²', 'x³', '10ˣ', 'eˣ'].map(func => (
                    <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="scientific" />
                  ))}
                </div>
                {/* Row 4: Constants, Factorial, Absolute */}
                <div className="grid grid-cols-6 gap-1.5">
                  {['π', 'e', 'abs', 'n!', '1/x', '^'].map(func => (
                    <CalcButton 
                      key={func} 
                      value={func} 
                      onClick={() => func === '^' ? performOperation('^') : performScientific(func)} 
                      variant="scientific" 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memory Register Row */}
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            <CalcButton value="MC" onClick={memoryClear} variant="memory" />
            <CalcButton value="MR" onClick={memoryRecall} variant="memory" />
            <CalcButton value="M+" onClick={memoryAdd} variant="memory" />
            <CalcButton value="M-" onClick={memorySubtract} variant="memory" />
            <CalcButton value="MS" onClick={memoryStore} variant="memory" />
          </div>

          {/* Standard Keypad Grid */}
          <div className="grid grid-cols-5 gap-2">
            {/* Row 1 */}
            <CalcButton value="C" onClick={clear} variant="danger" />
            <CalcButton value="CE" onClick={clearEntry} variant="function" />
            <CalcButton value={<Delete className="w-5 h-5" />} onClick={backspace} variant="function" />
            <CalcButton value="%" onClick={inputPercent} variant="function" />
            <CalcButton value="÷" onClick={() => performOperation('÷')} variant="operation" />

            {/* Row 2 */}
            <CalcButton value="7" onClick={() => inputDigit('7')} size="large" />
            <CalcButton value="8" onClick={() => inputDigit('8')} size="large" />
            <CalcButton value="9" onClick={() => inputDigit('9')} size="large" />
            <CalcButton value="×" onClick={() => performOperation('×')} variant="operation" />
            <CalcButton value="mod" onClick={() => performOperation('mod')} variant="function" />

            {/* Row 3 */}
            <CalcButton value="4" onClick={() => inputDigit('4')} size="large" />
            <CalcButton value="5" onClick={() => inputDigit('5')} size="large" />
            <CalcButton value="6" onClick={() => inputDigit('6')} size="large" />
            <CalcButton value="-" onClick={() => performOperation('-')} variant="operation" />
            <CalcButton value="rand" onClick={() => performScientific('rand')} variant="function" />

            {/* Row 4 */}
            <CalcButton value="1" onClick={() => inputDigit('1')} size="large" />
            <CalcButton value="2" onClick={() => inputDigit('2')} size="large" />
            <CalcButton value="3" onClick={() => inputDigit('3')} size="large" />
            <CalcButton value="+" onClick={() => performOperation('+')} variant="operation" />
            <CalcButton value="1/x" onClick={() => performScientific('1/x')} variant="function" />

            {/* Row 5 */}
            <CalcButton value="±" onClick={toggleSign} variant="function" />
            <CalcButton value="0" onClick={() => inputDigit('0')} size="large" />
            <CalcButton value="." onClick={inputDecimal} size="large" />
            <CalcButton value="=" onClick={calculate} variant="equal" className="col-span-2" />
          </div>

          {/* History Drawer Toggleable inside Calculator Card */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-800"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                    <History className="w-4 h-4" />
                    شريط العمليات السابقة
                  </h4>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistory([])}
                      className="text-xs text-rose-400 hover:text-rose-300 h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-1" />
                      مسح السجل
                    </Button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">لا توجد عمليات سابقة</p>
                  ) : (
                    history.map((entry, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          const parts = entry.split('=');
                          if (parts[1]) setDisplay(parts[1].trim());
                          toast.info('تم استعادة النتيجة');
                        }}
                        className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-xs text-cyan-300 font-mono text-left cursor-pointer border border-slate-800 flex justify-between items-center"
                        dir="ltr"
                      >
                        <span>{entry}</span>
                        <span className="text-[10px] text-slate-500">استعادة ↵</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* RIGHT: AI Mathematical Co-Pilot Workspace */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex-1 space-y-6"
      >
        {/* AI Co-Pilot Header & Input Card */}
        <div 
          className="p-6 md:p-8 rounded-[2.5rem] border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(24, 16, 47, 0.9), rgba(15, 23, 42, 0.95))',
            boxShadow: '0 20px 50px -10px rgba(147, 51, 234, 0.2)'
          }}
        >
          {/* Subtle Glow Orb in background */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 shadow-lg text-white">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  مدمج بالذكاء الاصطناعي الفائق
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  المساعد الرياضي الذكي (AI Math Co-Pilot)
                </h2>
              </div>
            </div>

            <div className="text-sm text-slate-300">
              حل خطوة بخطوة باللغة الطبيعية
            </div>
          </div>

          <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
            اكتب أي مسألة رياضية بكلماتك أو بالرموز (معادلات، تفاضل وتكامل، إحصاء، مصفوفات، هندسة) وسيقوم الذكاء الاصطناعي بحلها خطوة بخطوة مع استنتاج القوانين وتوفير خطوات الحل المفصلة.
          </p>

          {/* Prompt Bar with Voice and Submit */}
          <div className="relative flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                placeholder="اكتب مسألتك هنا... مثلاً: حل المعادلة 2x² - 8x + 6 = 0"
                className="w-full px-5 py-4 pr-12 rounded-2xl bg-slate-900/80 border border-purple-500/40 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all text-base md:text-lg shadow-inner"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900/80 border border-purple-500/30">
                <GlobalVoiceInput
                  onTranscript={(text) => setAiQuestion(prev => (prev ? prev + ' ' : '') + text)}
                  size="md"
                  disabled={isAiLoading}
                />
              </div>

              <Button
                onClick={() => askAI()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="h-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التفكير...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>حل المسألة</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick AI Action Chips */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">نماذج وأمثلة جاهزة للتحليل الفوري:</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuestion(item.query);
                    askAI(item.query);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-800/50 text-xs md:text-sm text-purple-200 border border-purple-700/40 hover:border-purple-400 transition-all flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Solution Breakdown Card */}
        <AnimatePresence>
          {aiSolution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 md:p-8 rounded-[2.5rem] border border-cyan-500/30 shadow-2xl backdrop-blur-xl bg-slate-900/90 space-y-6"
            >
              {/* Solution Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
                    {aiSolution.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                    <span>تحليل المسألة:</span>
                    <span className="text-cyan-300 font-mono" dir="ltr">{aiSolution.formattedQuestion}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {aiSolution.numericResult !== undefined && (
                    <Button
                      onClick={() => injectResultToCalculator(aiSolution.numericResult!)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 gap-2"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>نقل النتيجة إلى الحاسبة</span>
                    </Button>
                  )}

                  <Button
                    onClick={copySolutionToClipboard}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-700 text-slate-300 hover:text-white gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ الحل'}</span>
                  </Button>
                </div>
              </div>

              {/* Step-by-Step Cards */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>خطوات الحل التفصيلية (Step-by-Step):</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {aiSolution.steps.map((step) => (
                    <motion.div
                      key={step.stepNumber}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: step.stepNumber * 0.08 }}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 flex items-center justify-center font-bold text-xs">
                            {step.stepNumber}
                          </span>
                          <span className="font-bold text-white text-base">{step.title}</span>
                        </div>
                      </div>

                      {step.latex && (
                        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-cyan-300 font-mono text-sm md:text-base text-left overflow-x-auto" dir="ltr">
                          {step.latex}
                        </div>
                      )}

                      <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                        {step.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Formulas Used */}
              {aiSolution.formulasUsed && aiSolution.formulasUsed.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40">
                  <span className="text-xs text-indigo-300 font-bold block mb-2">القوانين والقواعد الرياضية المطبقة:</span>
                  <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-slate-300">
                    {aiSolution.formulasUsed.map((formula, fIdx) => (
                      <li key={fIdx}>{formula}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Final Answer Banner */}
              <div 
                className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/60 to-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">النتيجة النهائية (Final Answer)</span>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {aiSolution.finalAnswer}
                  </div>
                </div>

                {aiSolution.numericResult !== undefined && (
                  <Button
                    onClick={() => injectResultToCalculator(aiSolution.numericResult!)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold gap-2 self-start sm:self-auto"
                  >
                    <span>استخدام في الحاسبة ({aiSolution.numericResult})</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default HandheldCalculator;
