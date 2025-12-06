import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Trash2, Send, Loader2, Calculator, Percent, Divide, X, Minus, Plus, Equal, Delete, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HandheldCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [isScientificMode, setIsScientificMode] = useState(false);
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
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperation: string) => {
    handleButtonPress(nextOperation);
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
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
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const performScientific = (func: string) => {
    handleButtonPress(func);
    const value = parseFloat(display);
    let result = 0;
    const angleValue = angleMode === 'DEG' ? value * (Math.PI / 180) : value;

    switch (func) {
      case 'sin': result = Math.sin(angleValue); break;
      case 'cos': result = Math.cos(angleValue); break;
      case 'tan': result = Math.tan(angleValue); break;
      case 'asin': result = angleMode === 'DEG' ? Math.asin(value) * (180 / Math.PI) : Math.asin(value); break;
      case 'acos': result = angleMode === 'DEG' ? Math.acos(value) * (180 / Math.PI) : Math.acos(value); break;
      case 'atan': result = angleMode === 'DEG' ? Math.atan(value) * (180 / Math.PI) : Math.atan(value); break;
      case 'sinh': result = Math.sinh(value); break;
      case 'cosh': result = Math.cosh(value); break;
      case 'tanh': result = Math.tanh(value); break;
      case 'ln': result = Math.log(value); break;
      case 'log': result = Math.log10(value); break;
      case 'log₂': result = Math.log2(value); break;
      case '√': result = Math.sqrt(value); break;
      case '∛': result = Math.cbrt(value); break;
      case 'x²': result = Math.pow(value, 2); break;
      case 'x³': result = Math.pow(value, 3); break;
      case '10ˣ': result = Math.pow(10, value); break;
      case 'eˣ': result = Math.exp(value); break;
      case '2ˣ': result = Math.pow(2, value); break;
      case '1/x': result = 1 / value; break;
      case 'n!': result = factorial(Math.floor(value)); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'abs': result = Math.abs(value); break;
      case 'floor': result = Math.floor(value); break;
      case 'ceil': result = Math.ceil(value); break;
      case 'round': result = Math.round(value); break;
      case 'rand': result = Math.random(); break;
      default: result = value;
    }

    const historyEntry = `${func}(${value}) = ${result}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const memoryStore = () => {
    handleButtonPress('MS');
    setMemory(parseFloat(display));
    toast.success('تم حفظ القيمة في الذاكرة');
  };

  const memoryRecall = () => {
    handleButtonPress('MR');
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryAdd = () => {
    handleButtonPress('M+');
    setMemory(memory + parseFloat(display));
    toast.success('تمت الإضافة للذاكرة');
  };

  const memorySubtract = () => {
    handleButtonPress('M-');
    setMemory(memory - parseFloat(display));
    toast.success('تم الطرح من الذاكرة');
  };

  const memoryClear = () => {
    handleButtonPress('MC');
    setMemory(0);
    toast.success('تم مسح الذاكرة');
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await supabase.functions.invoke('math-ai-assistant', {
        body: { 
          question: aiQuestion,
          currentValue: display 
        }
      });

      if (response.error) throw response.error;
      setAiResponse(response.data.answer || 'لم أتمكن من الإجابة');
      
      if (response.data.result !== undefined) {
        setDisplay(String(response.data.result));
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse('حدث خطأ في الاتصال بالذكاء الاصطناعي');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      normal: "h-16 md:h-20 text-xl md:text-2xl",
      large: "h-16 md:h-20 text-2xl md:text-3xl",
      wide: "h-16 md:h-20 text-xl md:text-2xl col-span-2"
    };

    const baseClass = `relative font-bold rounded-2xl transition-all duration-150 active:scale-95 shadow-lg flex items-center justify-center ${sizeClasses[size]}`;
    
    const variants = {
      default: "bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600/50",
      operation: "bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white border border-orange-400/50",
      function: "bg-gradient-to-b from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-cyan-300 border border-slate-500/50",
      equal: "bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border border-emerald-400/50",
      memory: "bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border border-purple-500/50",
      scientific: "bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-cyan-200 border border-indigo-500/50 text-base md:text-lg",
      danger: "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border border-red-400/50"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.9, y: 2 }}
        className={`${baseClass} ${variants[variant]} ${className}`}
        onClick={onClick}
        style={{
          boxShadow: '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
        }}
      >
        {value}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full max-w-7xl mx-auto px-4">
      {/* Main Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div 
          className="relative p-6 md:p-8 rounded-[2rem]"
          style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            boxShadow: '30px 30px 80px #0a0f1a, -15px -15px 40px #1e293b, inset 0 1px 0 rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs text-slate-500 tracking-widest block">PEAK SCIENCE</span>
                <h3 className="text-cyan-400 font-bold text-lg">الحاسبة العلمية المتقدمة</h3>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`text-sm ${showHistory ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-cyan-300'}`}
              >
                <History className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mode Toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScientificMode(!isScientificMode)}
              className={`text-sm rounded-xl px-4 ${isScientificMode ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-cyan-300'}`}
            >
              {isScientificMode ? '📐 علمية' : '🔢 عادية'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
              className={`text-sm rounded-xl px-4 ${angleMode === 'RAD' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-purple-300'}`}
            >
              {angleMode === 'DEG' ? '° درجات' : '𝜋 راديان'}
            </Button>
            {memory !== 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-400 text-sm">
                <span>M</span>
                <span className="text-xs">{memory.toFixed(2)}</span>
              </span>
            )}
          </div>

          {/* Display */}
          <div 
            className="relative mb-6 p-6 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a1628, #0d1f3c)',
              boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.05)',
              border: '2px solid #1a3a5c'
            }}
          >
            {/* LCD Effect */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.05) 2px, rgba(0,255,255,0.05) 4px)'
            }} />
            
            {/* Operation indicator */}
            {previousValue && operation && (
              <div className="text-right text-lg text-cyan-600/70 mb-2 font-mono">
                {previousValue} {operation}
              </div>
            )}
            
            {/* Main Display */}
            <div 
              className="text-right text-4xl md:text-5xl font-mono tracking-wider text-cyan-400 min-h-[3rem]"
              style={{
                textShadow: '0 0 15px rgba(0,255,255,0.6), 0 0 30px rgba(0,255,255,0.3)'
              }}
            >
              {display.length > 14 ? parseFloat(display).toExponential(8) : display}
            </div>
          </div>

          {/* Scientific Functions - Extended */}
          <AnimatePresence>
            {isScientificMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                {/* Row 1: Trigonometric */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].map(func => (
                    <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="scientific" />
                  ))}
                </div>
                {/* Row 2: Hyperbolic */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {['sinh', 'cosh', 'tanh', 'ln', 'log', 'log₂'].map(func => (
                    <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="scientific" />
                  ))}
                </div>
                {/* Row 3: Powers & Roots */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {['√', '∛', 'x²', 'x³', '10ˣ', 'eˣ'].map(func => (
                    <CalcButton 
                      key={func} 
                      value={func} 
                      onClick={() => performScientific(func)} 
                      variant="scientific" 
                    />
                  ))}
                </div>
                {/* Row 4: Constants & More */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {['π', 'e', 'abs', 'n!', '1/x', 'mod'].map(func => (
                    <CalcButton 
                      key={func} 
                      value={func} 
                      onClick={() => func === 'mod' ? performOperation('mod') : performScientific(func)} 
                      variant="scientific" 
                    />
                  ))}
                </div>
                {/* Row 5: Rounding */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {['floor', 'ceil', 'round', 'rand', '2ˣ', '^'].map(func => (
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

          {/* Memory Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            <CalcButton value="MC" onClick={memoryClear} variant="memory" />
            <CalcButton value="MR" onClick={memoryRecall} variant="memory" />
            <CalcButton value="M+" onClick={memoryAdd} variant="memory" />
            <CalcButton value="M-" onClick={memorySubtract} variant="memory" />
            <CalcButton value="MS" onClick={memoryStore} variant="memory" />
          </div>

          {/* Main Keypad - Larger */}
          <div className="grid grid-cols-5 gap-3">
            {/* Row 1 */}
            <CalcButton value="C" onClick={clear} variant="danger" />
            <CalcButton value="CE" onClick={clearEntry} variant="function" />
            <CalcButton value={<Delete className="w-6 h-6" />} onClick={backspace} variant="function" />
            <CalcButton value="%" onClick={inputPercent} variant="function" />
            <CalcButton value="÷" onClick={() => performOperation('÷')} variant="operation" />

            {/* Row 2 */}
            <CalcButton value="7" onClick={() => inputDigit('7')} size="large" />
            <CalcButton value="8" onClick={() => inputDigit('8')} size="large" />
            <CalcButton value="9" onClick={() => inputDigit('9')} size="large" />
            <CalcButton value="×" onClick={() => performOperation('×')} variant="operation" />
            <CalcButton value="√" onClick={() => performScientific('√')} variant="function" />

            {/* Row 3 */}
            <CalcButton value="4" onClick={() => inputDigit('4')} size="large" />
            <CalcButton value="5" onClick={() => inputDigit('5')} size="large" />
            <CalcButton value="6" onClick={() => inputDigit('6')} size="large" />
            <CalcButton value="-" onClick={() => performOperation('-')} variant="operation" />
            <CalcButton value="x²" onClick={() => performScientific('x²')} variant="function" />

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

          {/* AI Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAI(!showAI)}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
              showAI 
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white' 
                : 'bg-gradient-to-r from-purple-600/80 via-pink-500/80 to-cyan-500/80 text-white hover:from-purple-600 hover:via-pink-500 hover:to-cyan-500'
            }`}
          >
            <Sparkles className="w-6 h-6" />
            المساعد الذكي للرياضيات
          </motion.button>
        </div>
      </motion.div>

      {/* Side Panels */}
      <div className="flex flex-col gap-6 w-full xl:w-96">
        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-cyan-400 font-bold text-lg flex items-center gap-2">
                  <History className="w-5 h-5" />
                  سجل العمليات
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistory([])}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">لا يوجد سجل</p>
                ) : (
                  history.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-slate-900/50 text-sm text-slate-300 font-mono text-left border border-slate-700/30"
                      dir="ltr"
                    >
                      {entry}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-cyan-900/40 backdrop-blur-sm border border-purple-500/30"
            >
              <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                المساعد الذكي للرياضيات
              </h4>
              
              <p className="text-slate-400 text-sm mb-4">
                اسألني أي سؤال رياضي وسأساعدك في حله وشرحه
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAI()}
                  placeholder="مثال: ما هو جذر 144؟"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Button
                  onClick={askAI}
                  disabled={isAiLoading}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 px-4"
                >
                  {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 mb-4"
                >
                  <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-slate-500">أمثلة سريعة:</p>
                {[
                  'احسب 15% من 200',
                  'ما هو sin(45)؟',
                  'حل x² - 5x + 6 = 0',
                  'ما هو لوغاريتم 100؟'
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setAiQuestion(example)}
                    className="w-full text-right px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-400 transition-colors border border-slate-700/30"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HandheldCalculator;
