import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Function3DMathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

export const Function3DMathKeyboard = ({ onSymbolClick }: Function3DMathKeyboardProps) => {
  const symbols = [
    { category: 'المتغيرات', items: ['x', 'y', 'z', 't', 'u', 'v'] },
    { category: 'الثوابت', items: ['pi', 'e'] },
    { category: 'العمليات', items: ['+', '-', '*', '/', '^', '√', '(', ')'] },
    { 
      category: 'دوال مثلثية', 
      items: ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'sinh(', 'cosh(', 'tanh('] 
    },
    { 
      category: 'دوال أخرى', 
      items: ['sqrt(', 'exp(', 'log(', 'ln(', 'abs(', 'floor(', 'ceil(', 'round(', 'max(', 'min('] 
    },
  ];

  return (
    <Card className="p-4 bg-background/40 backdrop-blur-sm border-border/30">
      <h3 className="text-md font-bold text-foreground mb-3 text-center">لوحة الرموز الرياضية</h3>
      <div className="space-y-3">
        {symbols.map((group, groupIndex) => (
          <div key={groupIndex}>
            <p className="text-xs text-muted-foreground mb-2 text-center">{group.category}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {group.items.map((symbol, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSymbolClick(symbol)}
                    className="min-w-[45px] h-9 font-mono hover:bg-primary/20 transition-colors"
                  >
                    {symbol}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
