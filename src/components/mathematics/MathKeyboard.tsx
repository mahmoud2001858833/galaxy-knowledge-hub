
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  className?: string;
}

const MathKeyboard = ({ onSymbolClick, className = '' }: MathKeyboardProps) => {
  const basicSymbols = [
    { symbol: '+', display: '+' },
    { symbol: '-', display: '-' },
    { symbol: '*', display: '×' },
    { symbol: '/', display: '÷' },
    { symbol: '^', display: 'x^y' },
    { symbol: 'sqrt(', display: '√' },
    { symbol: '(', display: '(' },
    { symbol: ')', display: ')' },
    { symbol: 'pi', display: 'π' },
    { symbol: 'e', display: 'e' },
    { symbol: 'abs(', display: '|x|' },
    { symbol: 'x', display: 'x' }
  ];

  const trigSymbols = [
    { symbol: 'sin(', display: 'sin' },
    { symbol: 'cos(', display: 'cos' },
    { symbol: 'tan(', display: 'tan' },
    { symbol: 'asin(', display: 'sin⁻¹' },
    { symbol: 'acos(', display: 'cos⁻¹' },
    { symbol: 'atan(', display: 'tan⁻¹' },
    { symbol: 'sinh(', display: 'sinh' },
    { symbol: 'cosh(', display: 'cosh' },
    { symbol: 'tanh(', display: 'tanh' }
  ];

  const advancedSymbols = [
    { symbol: 'log(', display: 'log' },
    { symbol: 'ln(', display: 'ln' },
    { symbol: 'exp(', display: 'eˣ' },
    { symbol: 'factorial(', display: 'n!' },
    { symbol: 'floor(', display: '⌊x⌋' },
    { symbol: 'ceil(', display: '⌈x⌉' },
    { symbol: 'round(', display: 'round' },
    { symbol: 'max(', display: 'max' },
    { symbol: 'min(', display: 'min' }
  ];

  const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '='];

  return (
    <div className={`bg-blue-900/30 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 ${className}`}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-blue-900/50">
          <TabsTrigger value="basic" className="text-white">أساسي</TabsTrigger>
          <TabsTrigger value="trig" className="text-white">مثلثية</TabsTrigger>
          <TabsTrigger value="advanced" className="text-white">متقدم</TabsTrigger>
          <TabsTrigger value="numbers" className="text-white">أرقام</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {basicSymbols.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-10 bg-purple-600/20 border-purple-500/30 text-white hover:bg-purple-600/40"
                onClick={() => onSymbolClick(item.symbol)}
              >
                {item.display}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trig" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {trigSymbols.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-10 bg-purple-600/20 border-purple-500/30 text-white hover:bg-purple-600/40"
                onClick={() => onSymbolClick(item.symbol)}
              >
                {item.display}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {advancedSymbols.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-10 bg-purple-600/20 border-purple-500/30 text-white hover:bg-purple-600/40"
                onClick={() => onSymbolClick(item.symbol)}
              >
                {item.display}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {numbers.map((num, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-10 bg-purple-600/20 border-purple-500/30 text-white hover:bg-purple-600/40"
                onClick={() => onSymbolClick(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MathKeyboard;
