
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

const Calculator = () => {
  const [num1, setNum1] = useState<string>('0');
  const [num2, setNum2] = useState<string>('0');
  const [operation, setOperation] = useState<string>('+');
  const [result, setResult] = useState<number | string>(0);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [angle, setAngle] = useState<string>('0');
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [trigResult, setTrigResult] = useState<number | string>(0);
  const [trigFunction, setTrigFunction] = useState<string>('sin');
  
  // Clear result when changing tabs
  useEffect(() => {
    if (activeTab === 'basic') {
      setResult(0);
    } else {
      setTrigResult(0);
    }
  }, [activeTab]);
  
  const calculateBasicResult = () => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    
    if (isNaN(n1) || isNaN(n2)) {
      setResult('خطأ: يرجى إدخال أرقام صحيحة');
      return;
    }
    
    switch (operation) {
      case '+':
        setResult(n1 + n2);
        break;
      case '-':
        setResult(n1 - n2);
        break;
      case '*':
        setResult(n1 * n2);
        break;
      case '/':
        if (n2 === 0) {
          setResult('خطأ: لا يمكن القسمة على صفر');
        } else {
          setResult(n1 / n2);
        }
        break;
      case '%':
        setResult(n1 % n2);
        break;
      case 'pow':
        setResult(Math.pow(n1, n2));
        break;
      case 'log':
        if (n1 <= 0) {
          setResult('خطأ: القيمة يجب أن تكون موجبة');
        } else {
          setResult(Math.log(n1) / Math.log(n2));
        }
        break;
      case 'root':
        if (n1 < 0 && n2 % 2 === 0) {
          setResult('خطأ: لا يوجد جذر حقيقي');
        } else {
          setResult(Math.sign(n1) * Math.pow(Math.abs(n1), 1 / n2));
        }
        break;
      default:
        setResult(0);
    }
  };
  
  const calculateTrigResult = () => {
    const angleValue = parseFloat(angle);
    
    if (isNaN(angleValue)) {
      setTrigResult('خطأ: يرجى إدخال قيمة صحيحة');
      return;
    }
    
    // Convert to radians if needed
    const angleInRadians = angleUnit === 'deg' ? (angleValue * Math.PI / 180) : angleValue;
    
    switch (trigFunction) {
      case 'sin':
        setTrigResult(Math.sin(angleInRadians));
        break;
      case 'cos':
        setTrigResult(Math.cos(angleInRadians));
        break;
      case 'tan':
        const tanResult = Math.tan(angleInRadians);
        setTrigResult(isFinite(tanResult) ? tanResult : 'غير معرف');
        break;
      case 'asin':
        if (angleValue >= -1 && angleValue <= 1) {
          const asinResult = Math.asin(angleValue);
          setTrigResult(angleUnit === 'deg' ? asinResult * 180 / Math.PI : asinResult);
        } else {
          setTrigResult('خطأ: القيمة يجب أن تكون بين -1 و 1');
        }
        break;
      case 'acos':
        if (angleValue >= -1 && angleValue <= 1) {
          const acosResult = Math.acos(angleValue);
          setTrigResult(angleUnit === 'deg' ? acosResult * 180 / Math.PI : acosResult);
        } else {
          setTrigResult('خطأ: القيمة يجب أن تكون بين -1 و 1');
        }
        break;
      case 'atan':
        const atanResult = Math.atan(angleValue);
        setTrigResult(angleUnit === 'deg' ? atanResult * 180 / Math.PI : atanResult);
        break;
      case 'sinh':
        setTrigResult(Math.sinh(angleValue));
        break;
      case 'cosh':
        setTrigResult(Math.cosh(angleValue));
        break;
      case 'tanh':
        setTrigResult(Math.tanh(angleValue));
        break;
      default:
        setTrigResult(0);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-right">الآلة الحاسبة</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-6 bg-white/5 p-1 rounded-lg">
          <TabsTrigger 
            value="basic"
            className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
          >
            العمليات الأساسية
          </TabsTrigger>
          <TabsTrigger 
            value="trigonometry"
            className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
          >
            حساب المثلثات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-right">الرقم الأول:</label>
              <Input 
                type="number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-white mb-2 text-right">الرقم الثاني:</label>
              <Input 
                type="number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2 text-right">العملية:</label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر العملية" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="+">جمع (+)</SelectItem>
                <SelectItem value="-">طرح (-)</SelectItem>
                <SelectItem value="*">ضرب (×)</SelectItem>
                <SelectItem value="/">قسمة (÷)</SelectItem>
                <SelectItem value="%">باقي القسمة (%)</SelectItem>
                <SelectItem value="pow">قوة (^)</SelectItem>
                <SelectItem value="root">جذر</SelectItem>
                <SelectItem value="log">لوغاريتم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateBasicResult}
          >
            حساب
          </Button>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <label className="block text-white mb-2 text-right">الناتج:</label>
            <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right overflow-x-auto">
              {typeof result === 'number' ? result.toLocaleString('ar-EG') : result}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trigonometry" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">الدالة المثلثية:</label>
            <Select value={trigFunction} onValueChange={setTrigFunction}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر الدالة" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="sin">جيب (sin)</SelectItem>
                <SelectItem value="cos">جيب تمام (cos)</SelectItem>
                <SelectItem value="tan">ظل (tan)</SelectItem>
                <SelectItem value="asin">جيب عكسي (arcsin)</SelectItem>
                <SelectItem value="acos">جيب تمام عكسي (arccos)</SelectItem>
                <SelectItem value="atan">ظل عكسي (arctan)</SelectItem>
                <SelectItem value="sinh">جيب زائد (sinh)</SelectItem>
                <SelectItem value="cosh">جيب تمام زائد (cosh)</SelectItem>
                <SelectItem value="tanh">ظل زائد (tanh)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-right">القيمة:</label>
              <Input 
                type="number"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 text-right">الوحدة:</label>
              <Select 
                value={angleUnit} 
                onValueChange={(value: 'deg' | 'rad') => setAngleUnit(value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent className="bg-space-cosmic-black border-white/20">
                  <SelectItem value="deg">درجة (°)</SelectItem>
                  <SelectItem value="rad">راديان (rad)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateTrigResult}
          >
            حساب
          </Button>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <label className="block text-white mb-2 text-right">الناتج:</label>
            <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right overflow-x-auto">
              {typeof trigResult === 'number' ? 
                trigResult.toLocaleString('ar-EG', {maximumFractionDigits: 10}) : 
                trigResult}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
