import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Trash2, Send, Loader2 } from 'lucide-react';
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

  // Button press animation
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
      default: result = inputValue;
    }

    const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  // Scientific functions
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
      case 'ln': result = Math.log(value); break;
      case 'log': result = Math.log10(value); break;
      case '√': result = Math.sqrt(value); break;
      case '∛': result = Math.cbrt(value); break;
      case 'x²': result = Math.pow(value, 2); break;
      case 'x³': result = Math.pow(value, 3); break;
      case '1/x': result = 1 / value; break;
      case 'n!': result = factorial(Math.floor(value)); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'abs': result = Math.abs(value); break;
      case 'exp': result = Math.exp(value); break;
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

  // Memory functions
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

  const memoryClear = () => {
    handleButtonPress('MC');
    setMemory(0);
    toast.success('تم مسح الذاكرة');
  };

  // AI Assistant
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
      
      // If AI returns a calculation result, update display
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

  // Keyboard support
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
      else if (e.key === 'Backspace') {
        setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, operation, previousValue, waitingForOperand]);

  const CalcButton = ({ 
    value, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    value: string; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operation' | 'function' | 'equal' | 'memory';
  }) => {
    const baseClass = "relative h-14 text-lg font-bold rounded-xl transition-all duration-150 active:scale-95 shadow-lg";
    const variants = {
      default: "bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600",
      operation: "bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white border border-orange-400",
      function: "bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-cyan-300 border border-gray-500",
      equal: "bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white border border-green-400",
      memory: "bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border border-purple-500"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.9, y: 2 }}
        className={`${baseClass} ${variants[variant]} ${className} ${pressedKey === value ? 'scale-90' : ''}`}
        onClick={onClick}
        style={{
          boxShadow: pressedKey === value 
            ? 'inset 0 2px 4px rgba(0,0,0,0.4)' 
            : '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {value}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Main Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Calculator Body */}
        <div 
          className="relative p-6 rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, #2a2a3e, #1a1a2e)',
            boxShadow: '20px 20px 60px #151520, -20px -20px 60px #252540, inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Brand Logo */}
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500 tracking-widest">PEAK SCIENCE</span>
            <h3 className="text-cyan-400 font-bold text-sm">الحاسبة العلمية المتقدمة</h3>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScientificMode(!isScientificMode)}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {isScientificMode ? 'عادية' : 'علمية'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {angleMode}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-green-400 hover:text-green-300"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>

          {/* Display */}
          <div 
            className="relative mb-4 p-4 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a1628, #0f2847)',
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.05)',
              border: '2px solid #1a3a5c'
            }}
          >
            {/* LCD Effect */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)'
            }} />
            
            {/* Operation indicator */}
            {previousValue && operation && (
              <div className="text-right text-sm text-cyan-600 mb-1 font-mono">
                {previousValue} {operation}
              </div>
            )}
            
            {/* Main Display */}
            <div 
              className="text-right text-3xl font-mono tracking-wider text-cyan-400"
              style={{
                textShadow: '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)'
              }}
            >
              {display.length > 12 ? parseFloat(display).toExponential(6) : display}
            </div>

            {/* Memory indicator */}
            {memory !== 0 && (
              <div className="absolute top-2 left-2 text-xs text-purple-400">M</div>
            )}
          </div>

          {/* Scientific Functions */}
          <AnimatePresence>
            {isScientificMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-5 gap-2 mb-4"
              >
                {['sin', 'cos', 'tan', 'ln', 'log'].map(func => (
                  <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="function" />
                ))}
                {['asin', 'acos', 'atan', '√', '∛'].map(func => (
                  <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="function" />
                ))}
                {['x²', 'x³', '^', '1/x', 'n!'].map(func => (
                  <CalcButton 
                    key={func} 
                    value={func} 
                    onClick={() => func === '^' ? performOperation('^') : performScientific(func)} 
                    variant="function" 
                  />
                ))}
                {['π', 'e', 'abs', 'exp', '( )'].map(func => (
                  <CalcButton key={func} value={func} onClick={() => performScientific(func)} variant="function" />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memory Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <CalcButton value="MC" onClick={memoryClear} variant="memory" />
            <CalcButton value="MR" onClick={memoryRecall} variant="memory" />
            <CalcButton value="M+" onClick={memoryAdd} variant="memory" />
            <CalcButton value="MS" onClick={memoryStore} variant="memory" />
          </div>

          {/* Main Keypad */}
          <div className="grid grid-cols-4 gap-2">
            <CalcButton value="C" onClick={clear} variant="function" />
            <CalcButton value="CE" onClick={clearEntry} variant="function" />
            <CalcButton value="%" onClick={inputPercent} variant="function" />
            <CalcButton value="÷" onClick={() => performOperation('÷')} variant="operation" />

            <CalcButton value="7" onClick={() => inputDigit('7')} />
            <CalcButton value="8" onClick={() => inputDigit('8')} />
            <CalcButton value="9" onClick={() => inputDigit('9')} />
            <CalcButton value="×" onClick={() => performOperation('×')} variant="operation" />

            <CalcButton value="4" onClick={() => inputDigit('4')} />
            <CalcButton value="5" onClick={() => inputDigit('5')} />
            <CalcButton value="6" onClick={() => inputDigit('6')} />
            <CalcButton value="-" onClick={() => performOperation('-')} variant="operation" />

            <CalcButton value="1" onClick={() => inputDigit('1')} />
            <CalcButton value="2" onClick={() => inputDigit('2')} />
            <CalcButton value="3" onClick={() => inputDigit('3')} />
            <CalcButton value="+" onClick={() => performOperation('+')} variant="operation" />

            <CalcButton value="±" onClick={toggleSign} variant="function" />
            <CalcButton value="0" onClick={() => inputDigit('0')} />
            <CalcButton value="." onClick={inputDecimal} />
            <CalcButton value="=" onClick={calculate} variant="equal" />
          </div>

          {/* AI Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAI(!showAI)}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            المساعد الذكي
          </motion.button>
        </div>
      </motion.div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-72 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-cyan-400 font-bold">السجل</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistory([])}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">لا يوجد سجل</p>
              ) : (
                history.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 rounded-lg bg-white/5 text-sm text-gray-300 font-mono text-left"
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
            className="w-80 p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-cyan-900/30 backdrop-blur-sm border border-purple-500/30"
          >
            <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              المساعد الذكي للرياضيات
            </h4>
            
            <p className="text-gray-400 text-sm mb-4">
              اسألني أي سؤال رياضي وسأساعدك في حله وشرحه
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                placeholder="مثال: ما هو جذر 144؟"
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <Button
                onClick={askAI}
                disabled={isAiLoading}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiResponse}</p>
              </motion.div>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500">أمثلة سريعة:</p>
              {[
                'احسب 15% من 200',
                'ما هو sin(45)؟',
                'حل x² - 5x + 6 = 0'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setAiQuestion(example)}
                  className="w-full text-right px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HandheldCalculator;
