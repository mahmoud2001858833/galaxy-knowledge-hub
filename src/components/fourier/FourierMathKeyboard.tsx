import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface FourierMathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

const FourierMathKeyboard: React.FC<FourierMathKeyboardProps> = ({ onSymbolClick }) => {
  const basicSymbols = [
    { symbol: 'π', display: 'π' },
    { symbol: 'e', display: 'e' },
    { symbol: 'x', display: 'x' },
    { symbol: 'n', display: 'n' },
    { symbol: '+', display: '+' },
    { symbol: '-', display: '-' },
    { symbol: '*', display: '×' },
    { symbol: '/', display: '÷' },
    { symbol: '(', display: '(' },
    { symbol: ')', display: ')' },
    { symbol: '[', display: '[' },
    { symbol: ']', display: ']' },
  ];

  const trigSymbols = [
    { symbol: 'sin(', display: 'sin' },
    { symbol: 'cos(', display: 'cos' },
    { symbol: 'tan(', display: 'tan' },
    { symbol: 'arcsin(', display: 'arcsin' },
    { symbol: 'arccos(', display: 'arccos' },
    { symbol: 'arctan(', display: 'arctan' },
  ];

  const powerSymbols = [
    { symbol: '^2', display: 'x²' },
    { symbol: '^3', display: 'x³' },
    { symbol: '^', display: 'xⁿ' },
    { symbol: 'sqrt(', display: '√' },
    { symbol: 'abs(', display: '|x|' },
    { symbol: 'exp(', display: 'eˣ' },
  ];

  const fourierSymbols = [
    { symbol: 'Σ', display: 'Σ' },
    { symbol: '∫', display: '∫' },
    { symbol: '≤', display: '≤' },
    { symbol: '≥', display: '≥' },
    { symbol: '<', display: '<' },
    { symbol: '>', display: '>' },
    { symbol: '∞', display: '∞' },
    { symbol: '∂', display: '∂' },
  ];

  const fractionSymbols = [
    { symbol: '/2', display: '½' },
    { symbol: '/3', display: '⅓' },
    { symbol: '/4', display: '¼' },
    { symbol: 'pi/2', display: 'π/2' },
    { symbol: 'pi/4', display: 'π/4' },
    { symbol: '2*pi', display: '2π' },
  ];

  const piecewiseSymbols = [
    { symbol: '{ ', display: '{' },
    { symbol: ' }', display: '}' },
    { symbol: ', ', display: ',' },
    { symbol: ' if ', display: 'if' },
    { symbol: ' else ', display: 'else' },
  ];

  const renderSymbolGrid = (symbols: Array<{symbol: string, display: string}>) => (
    <div className="grid grid-cols-6 gap-2">
      {symbols.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            className="w-full h-10 text-base font-medium hover:bg-primary/10"
            onClick={() => onSymbolClick(item.symbol)}
          >
            {item.display}
          </Button>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4"
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4">
          <TabsTrigger value="basic">أساسي</TabsTrigger>
          <TabsTrigger value="trig">مثلثية</TabsTrigger>
          <TabsTrigger value="power">أسس</TabsTrigger>
          <TabsTrigger value="fourier">فورييه</TabsTrigger>
          <TabsTrigger value="fraction">كسور</TabsTrigger>
          <TabsTrigger value="piecewise">قطعي</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-0">
          {renderSymbolGrid(basicSymbols)}
        </TabsContent>

        <TabsContent value="trig" className="mt-0">
          {renderSymbolGrid(trigSymbols)}
        </TabsContent>

        <TabsContent value="power" className="mt-0">
          {renderSymbolGrid(powerSymbols)}
        </TabsContent>

        <TabsContent value="fourier" className="mt-0">
          {renderSymbolGrid(fourierSymbols)}
        </TabsContent>

        <TabsContent value="fraction" className="mt-0">
          {renderSymbolGrid(fractionSymbols)}
        </TabsContent>

        <TabsContent value="piecewise" className="mt-0">
          {renderSymbolGrid(piecewiseSymbols)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default FourierMathKeyboard;
