
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleButtonClick = (value: string) => {
    setDisplay(prev => {
      if (prev === '0' && value !== '.') {
        return value;
      } else {
        return prev + value;
      }
    });
  };
  
  const handleCalculate = () => {
    try {
      // Using Function constructor instead of eval for better safety
      // eslint-disable-next-line no-new-func
      const calculatedResult = new Function('return ' + display)();
      setResult(String(calculatedResult));
      setHistory(prev => [...prev, `${display} = ${calculatedResult}`]);
      toast.success('تم حساب النتيجة بنجاح');
    } catch (error) {
      setResult('Error');
      toast.error('حدث خطأ في العملية الحسابية');
    }
  };
  
  const handleClear = () => {
    setDisplay('0');
    setResult(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // In a real implementation, we would process the dropped file
    // Here we're just simulating the behavior
    toast.info('تم استلام الملف، جاري معالجة البيانات...');
    
    setTimeout(() => {
      setDisplay('25 * 4 + 10');
      toast.success('تم تحليل الملف واستخراج العملية الحسابية');
    }, 1500);
  };
  
  const handleImageUpload = () => {
    // Simulating image upload and processing
    toast.info('تم استلام الصورة، جاري معالجة البيانات...');
    
    setTimeout(() => {
      setDisplay('15 + 27');
      toast.success('تم تحليل الصورة واستخراج العملية الحسابية');
    }, 1500);
  };
  
  const calculatorButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="order-2 md:order-1">
        <h2 className="text-2xl font-bold text-white mb-6 text-right">الآلة الحاسبة</h2>
        
        <div className="bg-space-cosmic-black/50 backdrop-blur-sm p-6 rounded-2xl border border-space-neon-blue/30 shadow-lg shadow-space-neon-blue/10">
          {/* Calculator Display */}
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4 overflow-x-auto">
            <div className="text-white text-right text-2xl font-mono">
              {display}
            </div>
            {result && (
              <div className="text-space-neon-blue text-right text-3xl font-mono mt-1">
                {result}
              </div>
            )}
          </div>
          
          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleClear}
              className="col-span-2 bg-space-deep-purple hover:bg-space-deep-purple/80 text-white py-3 rounded-lg transition-colors text-xl"
            >
              مسح
            </button>
            <button
              onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')}
              className="col-span-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors text-xl"
            >
              ⌫
            </button>
            
            {calculatorButtons.map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  if (btn === '=') {
                    handleCalculate();
                  } else {
                    handleButtonClick(btn);
                  }
                }}
                className={`py-3 rounded-lg transition-colors text-xl ${
                  btn === '=' 
                    ? 'bg-space-neon-blue hover:bg-space-bright-blue text-white' 
                    : ['/', '*', '-', '+'].includes(btn)
                      ? 'bg-space-deep-purple/70 hover:bg-space-deep-purple text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="order-1 md:order-2">
        <h2 className="text-2xl font-bold text-white mb-6 text-right">تحميل الملفات</h2>
        
        <div 
          className={`border-2 border-dashed rounded-2xl p-6 mb-6 transition-colors flex flex-col items-center justify-center ${
            isDragging ? 'border-space-neon-blue bg-space-neon-blue/5' : 'border-white/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ minHeight: '200px' }}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-white/50 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">قم بإسقاط الملف هنا</h3>
            <p className="text-white/70 mb-4">أو انقر لتحميل ملف يحتوي على مسائل رياضية</p>
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => toast.info('الرجاء سحب وإفلات الملف بدلاً من ذلك')}
            >
              تصفح الملفات
            </Button>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-medium text-white mb-4 text-right">رفع صورة</h3>
          <p className="text-white/70 mb-4 text-right">قم برفع صورة تحتوي على مسائل رياضية وسنقوم بتحليلها</p>
          <Button 
            className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white w-full"
            onClick={handleImageUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            رفع صورة
          </Button>
          
          {/* History */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-medium text-white mb-2 text-right">العمليات السابقة</h3>
              <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {history.map((item, index) => (
                    <li key={index} className="text-white/80 text-right border-b border-white/10 pb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
