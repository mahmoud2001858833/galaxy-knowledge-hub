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
  
  // Calculus variables
  const [expression, setExpression] = useState<string>('');
  const [calculusResult, setCalculusResult] = useState<string>('');
  const [calculusOperation, setCalculusOperation] = useState<string>('derivative');
  
  // Statistics variables
  const [dataSet, setDataSet] = useState<string>('');
  const [statsResult, setStatsResult] = useState<any>(null);
  
  // Geometry variables
  const [shape, setShape] = useState<string>('circle');
  const [geometryInputs, setGeometryInputs] = useState<{[key: string]: string}>({});
  const [geometryResult, setGeometryResult] = useState<any>(null);
  
  // Advanced math variables
  const [algebraOperation, setAlgebraOperation] = useState<string>('quadratic');
  const [algebraInputs, setAlgebraInputs] = useState<{[key: string]: string}>({});
  const [algebraResult, setAlgebraResult] = useState<any>(null);
  
  // Matrix variables
  const [matrixSize, setMatrixSize] = useState<string>('2x2');
  const [matrixA, setMatrixA] = useState<string>('');
  const [matrixB, setMatrixB] = useState<string>('');
  const [matrixOperation, setMatrixOperation] = useState<string>('add');
  const [matrixResult, setMatrixResult] = useState<any>(null);
  
  // Financial variables
  const [financialType, setFinancialType] = useState<string>('compound');
  const [financialInputs, setFinancialInputs] = useState<{[key: string]: string}>({});
  const [financialResult, setFinancialResult] = useState<any>(null);
  
  // Clear result when changing tabs
  useEffect(() => {
    if (activeTab === 'basic') {
      setResult(0);
    } else if (activeTab === 'trigonometry') {
      setTrigResult(0);
    } else if (activeTab === 'calculus') {
      setCalculusResult('');
    } else if (activeTab === 'statistics') {
      setStatsResult(null);
    } else if (activeTab === 'geometry') {
      setGeometryResult(null);
    } else if (activeTab === 'algebra') {
      setAlgebraResult(null);
    } else if (activeTab === 'matrix') {
      setMatrixResult(null);
    } else if (activeTab === 'financial') {
      setFinancialResult(null);
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
      case 'gcd':
        setResult(gcd(Math.abs(n1), Math.abs(n2)));
        break;
      case 'lcm':
        setResult(lcm(Math.abs(n1), Math.abs(n2)));
        break;
      case 'combination':
        setResult(combination(n1, n2));
        break;
      case 'permutation':
        setResult(permutation(n1, n2));
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
      case 'sec':
        const secResult = 1 / Math.cos(angleInRadians);
        setTrigResult(isFinite(secResult) ? secResult : 'غير معرف');
        break;
      case 'csc':
        const cscResult = 1 / Math.sin(angleInRadians);
        setTrigResult(isFinite(cscResult) ? cscResult : 'غير معرف');
        break;
      case 'cot':
        const cotResult = 1 / Math.tan(angleInRadians);
        setTrigResult(isFinite(cotResult) ? cotResult : 'غير معرف');
        break;
      default:
        setTrigResult(0);
    }
  };
  
  const calculateCalculus = () => {
    // Simplified calculus operations for demo
    const expr = expression.toLowerCase().trim();
    
    if (!expr) {
      setCalculusResult('يرجى إدخال تعبير رياضي');
      return;
    }
    
    try {
      if (calculusOperation === 'derivative') {
        // Simple derivative rules
        if (expr === 'x') {
          setCalculusResult('d/dx(x) = 1');
        } else if (expr === 'x^2' || expr === 'x²') {
          setCalculusResult('d/dx(x²) = 2x');
        } else if (expr === 'x^3' || expr === 'x³') {
          setCalculusResult('d/dx(x³) = 3x²');
        } else if (expr === 'sin(x)') {
          setCalculusResult('d/dx(sin(x)) = cos(x)');
        } else if (expr === 'cos(x)') {
          setCalculusResult('d/dx(cos(x)) = -sin(x)');
        } else if (expr === 'ln(x)') {
          setCalculusResult('d/dx(ln(x)) = 1/x');
        } else if (expr === 'e^x') {
          setCalculusResult('d/dx(e^x) = e^x');
        } else {
          setCalculusResult('التعبير غير مدعوم حالياً');
        }
      } else if (calculusOperation === 'integral') {
        // Simple integral rules
        if (expr === '1') {
          setCalculusResult('∫1 dx = x + C');
        } else if (expr === 'x') {
          setCalculusResult('∫x dx = x²/2 + C');
        } else if (expr === 'x^2' || expr === 'x²') {
          setCalculusResult('∫x² dx = x³/3 + C');
        } else if (expr === 'sin(x)') {
          setCalculusResult('∫sin(x) dx = -cos(x) + C');
        } else if (expr === 'cos(x)') {
          setCalculusResult('∫cos(x) dx = sin(x) + C');
        } else if (expr === '1/x') {
          setCalculusResult('∫(1/x) dx = ln|x| + C');
        } else if (expr === 'e^x') {
          setCalculusResult('∫e^x dx = e^x + C');
        } else {
          setCalculusResult('التعبير غير مدعوم حالياً');
        }
      }
    } catch (error) {
      setCalculusResult('خطأ في المعادلة');
    }
  };
  
  const calculateStatistics = () => {
    try {
      const numbers = dataSet.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
      
      if (numbers.length === 0) {
        setStatsResult({ error: 'يرجى إدخال أرقام صحيحة مفصولة بفواصل' });
        return;
      }
      
      const sum = numbers.reduce((a, b) => a + b, 0);
      const mean = sum / numbers.length;
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      const median = numbers.length % 2 === 0 
        ? (sortedNumbers[numbers.length / 2 - 1] + sortedNumbers[numbers.length / 2]) / 2
        : sortedNumbers[Math.floor(numbers.length / 2)];
      
      const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Mode calculation
      const frequency: {[key: number]: number} = {};
      numbers.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const mode = Object.keys(frequency).filter(key => frequency[Number(key)] === maxFreq).map(Number);
      
      setStatsResult({
        count: numbers.length,
        sum: sum.toFixed(2),
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        mode: mode.length === numbers.length ? 'لا يوجد منوال' : mode.join(', '),
        variance: variance.toFixed(2),
        standardDeviation: standardDeviation.toFixed(2),
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        range: (Math.max(...numbers) - Math.min(...numbers)).toFixed(2)
      });
    } catch (error) {
      setStatsResult({ error: 'خطأ في معالجة البيانات' });
    }
  };
  
  const calculateGeometry = () => {
    const inputs = geometryInputs;
    let result = {};
    
    try {
      switch (shape) {
        case 'circle':
          const radius = parseFloat(inputs.radius || '0');
          if (radius > 0) {
            result = {
              circumference: (2 * Math.PI * radius).toFixed(2),
              area: (Math.PI * radius * radius).toFixed(2),
              diameter: (2 * radius).toFixed(2)
            };
          }
          break;
        case 'rectangle':
          const length = parseFloat(inputs.length || '0');
          const width = parseFloat(inputs.width || '0');
          if (length > 0 && width > 0) {
            result = {
              area: (length * width).toFixed(2),
              perimeter: (2 * (length + width)).toFixed(2),
              diagonal: Math.sqrt(length * length + width * width).toFixed(2)
            };
          }
          break;
        case 'triangle':
          const a = parseFloat(inputs.a || '0');
          const b = parseFloat(inputs.b || '0');
          const c = parseFloat(inputs.c || '0');
          if (a > 0 && b > 0 && c > 0) {
            const s = (a + b + c) / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            result = {
              area: area.toFixed(2),
              perimeter: (a + b + c).toFixed(2),
              type: a === b && b === c ? 'متساوي الأضلاع' : 
                    a === b || b === c || a === c ? 'متساوي الساقين' : 'مختلف الأضلاع'
            };
          }
          break;
        case 'sphere':
          const sphereRadius = parseFloat(inputs.radius || '0');
          if (sphereRadius > 0) {
            result = {
              volume: (4/3 * Math.PI * Math.pow(sphereRadius, 3)).toFixed(2),
              surfaceArea: (4 * Math.PI * sphereRadius * sphereRadius).toFixed(2)
            };
          }
          break;
      }
      setGeometryResult(result);
    } catch (error) {
      setGeometryResult({ error: 'خطأ في الحساب' });
    }
  };
  
  const calculateAlgebra = () => {
    const inputs = algebraInputs;
    let result: any = {};
    
    try {
      switch (algebraOperation) {
        case 'quadratic':
          const a = parseFloat(inputs.a || '0');
          const b = parseFloat(inputs.b || '0');
          const c = parseFloat(inputs.c || '0');
          
          if (a === 0) {
            result = { error: 'معامل x² لا يمكن أن يكون صفر' };
          } else {
            const discriminant = b * b - 4 * a * c;
            if (discriminant > 0) {
              const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
              const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
              result = { 
                x1: x1.toFixed(4), 
                x2: x2.toFixed(4), 
                discriminant: discriminant.toFixed(4),
                type: 'جذران حقيقيان مختلفان'
              };
            } else if (discriminant === 0) {
              const x = -b / (2 * a);
              result = { 
                x: x.toFixed(4), 
                discriminant: '0',
                type: 'جذر حقيقي مضاعف'
              };
            } else {
              const realPart = (-b / (2 * a)).toFixed(4);
              const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
              result = { 
                real: realPart, 
                imaginary: imagPart,
                discriminant: discriminant.toFixed(4),
                type: 'جذران مركبان'
              };
            }
          }
          break;
        case 'cubic':
          result = { message: 'حل المعادلات التكعيبية معقد جداً - سيتم إضافته لاحقاً' };
          break;
        case 'sequence':
          const first = parseFloat(inputs.first || '0');
          const diff = parseFloat(inputs.diff || '0');
          const n = parseInt(inputs.n || '0');
          
          if (n > 0) {
            const term = first + (n - 1) * diff;
            const sum = (n * (2 * first + (n - 1) * diff)) / 2;
            result = {
              term: term.toFixed(2),
              sum: sum.toFixed(2),
              type: 'متتالية حسابية'
            };
          }
          break;
      }
      setAlgebraResult(result);
    } catch (error) {
      setAlgebraResult({ error: 'خطأ في الحساب' });
    }
  };
  
  const calculateMatrix = () => {
    try {
      const parseMatrix = (matrixStr: string) => {
        const rows = matrixStr.split(';').map(row => 
          row.split(',').map(val => parseFloat(val.trim()))
        );
        return rows;
      };
      
      const matA = parseMatrix(matrixA);
      const matB = parseMatrix(matrixB);
      
      let result: any = {};
      
      switch (matrixOperation) {
        case 'add':
          if (matA.length === matB.length && matA[0].length === matB[0].length) {
            const sum = matA.map((row, i) => 
              row.map((val, j) => val + matB[i][j])
            );
            result = { matrix: sum, operation: 'الجمع' };
          } else {
            result = { error: 'أبعاد المصفوفتين يجب أن تتطابق للجمع' };
          }
          break;
        case 'subtract':
          if (matA.length === matB.length && matA[0].length === matB[0].length) {
            const diff = matA.map((row, i) => 
              row.map((val, j) => val - matB[i][j])
            );
            result = { matrix: diff, operation: 'الطرح' };
          } else {
            result = { error: 'أبعاد المصفوفتين يجب أن تتطابق للطرح' };
          }
          break;
        case 'multiply':
          if (matA[0].length === matB.length) {
            const product = matA.map(row => 
              matB[0].map((_, j) => 
                row.reduce((sum, val, k) => sum + val * matB[k][j], 0)
              )
            );
            result = { matrix: product, operation: 'الضرب' };
          } else {
            result = { error: 'عدد أعمدة المصفوفة الأولى يجب أن يساوي عدد صفوف المصفوفة الثانية' };
          }
          break;
        case 'determinant':
          if (matA.length === matA[0].length) {
            const det = calculateDeterminant(matA);
            result = { determinant: det.toFixed(4), operation: 'المحدد' };
          } else {
            result = { error: 'المصفوفة يجب أن تكون مربعة لحساب المحدد' };
          }
          break;
      }
      
      setMatrixResult(result);
    } catch (error) {
      setMatrixResult({ error: 'خطأ في تحليل المصفوفات' });
    }
  };
  
  const calculateFinancial = () => {
    const inputs = financialInputs;
    let result: any = {};
    
    try {
      switch (financialType) {
        case 'compound':
          const principal = parseFloat(inputs.principal || '0');
          const rate = parseFloat(inputs.rate || '0') / 100;
          const time = parseFloat(inputs.time || '0');
          const frequency = parseFloat(inputs.frequency || '1');
          
          const amount = principal * Math.pow(1 + rate / frequency, frequency * time);
          const interest = amount - principal;
          
          result = {
            amount: amount.toFixed(2),
            interest: interest.toFixed(2),
            type: 'الفائدة المركبة'
          };
          break;
        case 'simple':
          const p = parseFloat(inputs.principal || '0');
          const r = parseFloat(inputs.rate || '0') / 100;
          const t = parseFloat(inputs.time || '0');
          
          const simpleInterest = p * r * t;
          const totalAmount = p + simpleInterest;
          
          result = {
            amount: totalAmount.toFixed(2),
            interest: simpleInterest.toFixed(2),
            type: 'الفائدة البسيطة'
          };
          break;
        case 'loan':
          const loanAmount = parseFloat(inputs.amount || '0');
          const monthlyRate = parseFloat(inputs.rate || '0') / 100 / 12;
          const months = parseFloat(inputs.months || '0');
          
          if (monthlyRate > 0) {
            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                                  (Math.pow(1 + monthlyRate, months) - 1);
            const totalPayment = monthlyPayment * months;
            const totalInterest = totalPayment - loanAmount;
            
            result = {
              monthlyPayment: monthlyPayment.toFixed(2),
              totalPayment: totalPayment.toFixed(2),
              totalInterest: totalInterest.toFixed(2),
              type: 'قسط شهري'
            };
          } else {
            result = { error: 'معدل الفائدة يجب أن يكون أكبر من صفر' };
          }
          break;
      }
      
      setFinancialResult(result);
    } catch (error) {
      setFinancialResult({ error: 'خطأ في الحساب المالي' });
    }
  };
  
  // Helper functions
  const gcd = (a: number, b: number): number => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };
  
  const lcm = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  };
  
  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };
  
  const combination = (n: number, r: number): number => {
    if (r > n || r < 0) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };
  
  const permutation = (n: number, r: number): number => {
    if (r > n || r < 0) return 0;
    return factorial(n) / factorial(n - r);
  };
  
  const calculateDeterminant = (matrix: number[][]): number => {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = matrix.slice(1).map(row => row.filter((_, index) => index !== j));
      det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(minor);
    }
    return det;
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-right">الآلة الحاسبة المتقدمة</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-8 mb-6 bg-white/5 p-1 rounded-lg">
          <TabsTrigger value="basic">العمليات الأساسية</TabsTrigger>
          <TabsTrigger value="trigonometry">حساب المثلثات</TabsTrigger>
          <TabsTrigger value="calculus">التفاضل والتكامل</TabsTrigger>
          <TabsTrigger value="statistics">الإحصاءات</TabsTrigger>
          <TabsTrigger value="geometry">الهندسة</TabsTrigger>
          <TabsTrigger value="algebra">الجبر المتقدم</TabsTrigger>
          <TabsTrigger value="matrix">المصفوفات</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
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
                <SelectItem value="gcd">القاسم المشترك الأكبر</SelectItem>
                <SelectItem value="lcm">المضاعف المشترك الأصغر</SelectItem>
                <SelectItem value="combination">التوافيق C(n,r)</SelectItem>
                <SelectItem value="permutation">التباديل P(n,r)</SelectItem>
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
                <SelectItem value="sec">قاطع (sec)</SelectItem>
                <SelectItem value="csc">قاطع تمام (csc)</SelectItem>
                <SelectItem value="cot">ظل تمام (cot)</SelectItem>
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
        
        <TabsContent value="calculus" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">نوع العملية:</label>
            <Select value={calculusOperation} onValueChange={setCalculusOperation}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر العملية" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="derivative">المشتقة (d/dx)</SelectItem>
                <SelectItem value="integral">التكامل (∫)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-white mb-2 text-right">التعبير الرياضي:</label>
            <Input 
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="مثل: x^2, sin(x), ln(x)"
              className="bg-white/10 border-white/20 text-white text-right"
              dir="ltr"
            />
          </div>
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateCalculus}
          >
            حساب
          </Button>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <label className="block text-white mb-2 text-right">الناتج:</label>
            <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right overflow-x-auto">
              {calculusResult || 'أدخل تعبيراً رياضياً'}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">البيانات (أرقام مفصولة بفواصل):</label>
            <Input 
              type="text"
              value={dataSet}
              onChange={(e) => setDataSet(e.target.value)}
              placeholder="1, 2, 3, 4, 5"
              className="bg-white/10 border-white/20 text-white text-right"
              dir="ltr"
            />
          </div>
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateStatistics}
          >
            حساب الإحصاءات
          </Button>
          
          {statsResult && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-white mb-2 text-right">النتائج الإحصائية:</label>
              <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                {statsResult.error ? (
                  <div className="text-red-400">{statsResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    <div>عدد القيم: {statsResult.count}</div>
                    <div>المجموع: {statsResult.sum}</div>
                    <div>المتوسط: {statsResult.mean}</div>
                    <div>الوسيط: {statsResult.median}</div>
                    <div>المنوال: {statsResult.mode}</div>
                    <div>التباين: {statsResult.variance}</div>
                    <div>الانحراف المعياري: {statsResult.standardDeviation}</div>
                    <div>أصغر قيمة: {statsResult.min}</div>
                    <div>أكبر قيمة: {statsResult.max}</div>
                    <div>المدى: {statsResult.range}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="geometry" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">الشكل الهندسي:</label>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر الشكل" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="circle">دائرة</SelectItem>
                <SelectItem value="rectangle">مستطيل</SelectItem>
                <SelectItem value="triangle">مثلث</SelectItem>
                <SelectItem value="sphere">كرة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {shape === 'circle' && (
            <div>
              <label className="block text-white mb-2 text-right">نصف القطر:</label>
              <Input 
                type="number"
                value={geometryInputs.radius || ''}
                onChange={(e) => setGeometryInputs({...geometryInputs, radius: e.target.value})}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
          )}
          
          {shape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 text-right">الطول:</label>
                <Input 
                  type="number"
                  value={geometryInputs.length || ''}
                  onChange={(e) => setGeometryInputs({...geometryInputs, length: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">العرض:</label>
                <Input 
                  type="number"
                  value={geometryInputs.width || ''}
                  onChange={(e) => setGeometryInputs({...geometryInputs, width: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          {shape === 'triangle' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2 text-right">الضلع الأول:</label>
                <Input 
                  type="number"
                  value={geometryInputs.a || ''}
                  onChange={(e) => setGeometryInputs({...geometryInputs, a: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">الضلع الثاني:</label>
                <Input 
                  type="number"
                  value={geometryInputs.b || ''}
                  onChange={(e) => setGeometryInputs({...geometryInputs, b: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">الضلع الثالث:</label>
                <Input 
                  type="number"
                  value={geometryInputs.c || ''}
                  onChange={(e) => setGeometryInputs({...geometryInputs, c: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          {shape === 'sphere' && (
            <div>
              <label className="block text-white mb-2 text-right">نصف القطر:</label>
              <Input 
                type="number"
                value={geometryInputs.radius || ''}
                onChange={(e) => setGeometryInputs({...geometryInputs, radius: e.target.value})}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
          )}
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateGeometry}
          >
            حساب
          </Button>
          
          {geometryResult && Object.keys(geometryResult).length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-white mb-2 text-right">النتائج الهندسية:</label>
              <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                {geometryResult.error ? (
                  <div className="text-red-400">{geometryResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(geometryResult).map(([key, value]) => (
                      <div key={key}>
                        {key === 'area' && 'المساحة: '}
                        {key === 'perimeter' && 'المحيط: '}
                        {key === 'circumference' && 'المحيط: '}
                        {key === 'diameter' && 'القطر: '}
                        {key === 'diagonal' && 'القطر: '}
                        {key === 'volume' && 'الحجم: '}
                        {key === 'surfaceArea' && 'مساحة السطح: '}
                        {key === 'type' && 'نوع المثلث: '}
                        {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="algebra" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">نوع العملية الجبرية:</label>
            <Select value={algebraOperation} onValueChange={setAlgebraOperation}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر العملية" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="quadratic">المعادلة التربيعية</SelectItem>
                <SelectItem value="cubic">المعادلة التكعيبية</SelectItem>
                <SelectItem value="sequence">المتتالية الحسابية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {algebraOperation === 'quadratic' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2 text-right">معامل x²:</label>
                <Input 
                  type="number"
                  value={algebraInputs.a || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, a: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">معامل x:</label>
                <Input 
                  type="number"
                  value={algebraInputs.b || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, b: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">الحد الثابت:</label>
                <Input 
                  type="number"
                  value={algebraInputs.c || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, c: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          {algebraOperation === 'sequence' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2 text-right">الحد الأول:</label>
                <Input 
                  type="number"
                  value={algebraInputs.first || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, first: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">الفرق المشترك:</label>
                <Input 
                  type="number"
                  value={algebraInputs.diff || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, diff: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-right">رقم الحد:</label>
                <Input 
                  type="number"
                  value={algebraInputs.n || ''}
                  onChange={(e) => setAlgebraInputs({...algebraInputs, n: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateAlgebra}
          >
            حساب
          </Button>
          
          {algebraResult && Object.keys(algebraResult).length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-white mb-2 text-right">نتائج الجبر:</label>
              <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                {algebraResult.error ? (
                  <div className="text-red-400">{algebraResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(algebraResult).map(([key, value]) => (
                      <div key={key}>
                        {key === 'x1' && `الجذر الأول: ${value}`}
                        {key === 'x2' && `الجذر الثاني: ${value}`}
                        {key === 'x' && `الجذر: ${value}`}
                        {key === 'discriminant' && `المميز: ${value}`}
                        {key === 'type' && `النوع: ${value}`}
                        {key === 'real' && `الجزء الحقيقي: ${value}`}
                        {key === 'imaginary' && `الجزء التخيلي: ±${value}i`}
                        {key === 'term' && `الحد رقم ${algebraInputs.n}: ${value}`}
                        {key === 'sum' && `مجموع ${algebraInputs.n} حدود: ${value}`}
                        {key === 'message' && value as React.ReactNode}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="matrix" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">حجم المصفوفة:</label>
            <Select value={matrixSize} onValueChange={setMatrixSize}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر الحجم" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="2x2">2x2</SelectItem>
                <SelectItem value="3x3">3x3</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-right">المصفوفة A:</label>
              <Input 
                type="text"
                value={matrixA}
                onChange={(e) => setMatrixA(e.target.value)}
                placeholder="أدخل المصفوفة A"
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-white mb-2 text-right">المصفوفة B:</label>
              <Input 
                type="text"
                value={matrixB}
                onChange={(e) => setMatrixB(e.target.value)}
                placeholder="أدخل المصفوفة B"
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2 text-right">نوع العملية:</label>
            <Select value={matrixOperation} onValueChange={setMatrixOperation}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر العملية" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="add">الجمع</SelectItem>
                <SelectItem value="subtract">الطرح</SelectItem>
                <SelectItem value="multiply">الضرب</SelectItem>
                <SelectItem value="determinant">المحدد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateMatrix}
          >
            حساب
          </Button>
          
          {matrixResult && Object.keys(matrixResult).length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-white mb-2 text-right">النتائج المصفوفية:</label>
              <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                {matrixResult.error ? (
                  <div className="text-red-400">{matrixResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    {matrixResult.matrix && (
                      <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                        {matrixResult.matrix.map((row, i) => (
                          <div key={i} className="flex items-center justify-between">
                            {row.map((val, j) => (
                              <div key={j} className="px-2 py-1 text-white text-right">
                                {val}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {matrixResult.operation && (
                      <div className="text-white text-right">
                        العملية: {matrixResult.operation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-right">نوع العملية المالية:</label>
            <Select value={financialType} onValueChange={setFinancialType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر العملية" />
              </SelectTrigger>
              <SelectContent className="bg-space-cosmic-black border-white/20">
                <SelectItem value="compound">الفائدة المركبة</SelectItem>
                <SelectItem value="simple">الفائدة البسيطة</SelectItem>
                <SelectItem value="loan">قسط شهري</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white mb-2 text-right">المبلغ:</label>
              <Input 
                type="number"
                value={financialInputs.amount || ''}
                onChange={(e) => setFinancialInputs({...financialInputs, amount: e.target.value})}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-white mb-2 text-right">معدل الفائدة:</label>
              <Input 
                type="number"
                value={financialInputs.rate || ''}
                onChange={(e) => setFinancialInputs({...financialInputs, rate: e.target.value})}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-white mb-2 text-right">المدة:</label>
              <Input 
                type="number"
                value={financialInputs.time || ''}
                onChange={(e) => setFinancialInputs({...financialInputs, time: e.target.value})}
                className="bg-white/10 border-white/20 text-white text-right"
                dir="ltr"
              />
            </div>
          </div>
          
          {financialType === 'compound' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2 text-right">تردد الفائدة:</label>
                <Input 
                  type="number"
                  value={financialInputs.frequency || ''}
                  onChange={(e) => setFinancialInputs({...financialInputs, frequency: e.target.value})}
                  className="bg-white/10 border-white/20 text-white text-right"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-space-neon-blue hover:bg-space-bright-blue text-white"
            onClick={calculateFinancial}
          >
            حساب
          </Button>
          
          {financialResult && Object.keys(financialResult).length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-white mb-2 text-right">النتائج المالية:</label>
              <div className="bg-white/10 border border-white/20 rounded-md py-3 px-4 text-white text-right">
                {financialResult.error ? (
                  <div className="text-red-400">{financialResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    {financialResult.amount && (
                      <div className="text-white text-right">
                        المبلغ النهائي: {financialResult.amount}
                      </div>
                    )}
                    {financialResult.interest && (
                      <div className="text-white text-right">
                        الفائدة: {financialResult.interest}
                      </div>
                    )}
                    {financialResult.monthlyPayment && (
                      <div className="text-white text-right">
                        القسط الشهري: {financialResult.monthlyPayment}
                      </div>
                    )}
                    {financialResult.totalPayment && (
                      <div className="text-white text-right">
                        المبلغ الإجمالي: {financialResult.totalPayment}
                      </div>
                    )}
                    {financialResult.totalInterest && (
                      <div className="text-white text-right">
                        الفائدة الإجمالية: {financialResult.totalInterest}
                      </div>
                    )}
                    {financialResult.type && (
                      <div className="text-white text-right">
                        نوع العملية: {financialResult.type}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
