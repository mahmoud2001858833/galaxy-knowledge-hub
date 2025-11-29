import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface Example {
  name: string;
  expression: string;
  dimension: '1D' | '2D' | '3D';
  description: string;
  parametric?: { x: string; y: string; z: string; tRange: [number, number] };
}

interface Function3DExamplesProps {
  onExampleSelect: (example: Example) => void;
}

export const Function3DExamples = ({ onExampleSelect }: Function3DExamplesProps) => {
  const examples: Example[] = [
    // 1D Examples
    { name: 'نقطة الأصل', expression: '0,0,0', dimension: '1D', description: 'النقطة (0, 0, 0)' },
    { name: 'نقطة على X', expression: '5,0,0', dimension: '1D', description: 'نقطة على المحور X' },
    { name: 'نقطة في الفضاء', expression: '3,4,5', dimension: '1D', description: 'نقطة عشوائية' },
    
    // 2D Examples
    { name: 'خط مستقيم', expression: '2*x + 1', dimension: '2D', description: 'معادلة خطية بسيطة' },
    { name: 'قطع مكافئ', expression: 'x^2', dimension: '2D', description: 'منحنى تربيعي' },
    { name: 'موجة جيبية', expression: 'sin(x)', dimension: '2D', description: 'دالة جيبية' },
    { name: 'دالة أسية', expression: 'exp(x/5)', dimension: '2D', description: 'نمو أسي' },
    { name: 'دالة لوغاريتمية', expression: 'ln(abs(x)+1)', dimension: '2D', description: 'نمو لوغاريتمي' },
    
    // 3D Examples
    { name: 'قطع مكافئ دائري', expression: 'x^2 + y^2', dimension: '3D', description: 'سطح مكافئ' },
    { name: 'سرج', expression: 'x^2 - y^2', dimension: '3D', description: 'سطح السرج الشهير' },
    { name: 'موجة جيبية', expression: 'sin(x) * cos(y)', dimension: '3D', description: 'تموجات متقاطعة' },
    { name: 'مخروط', expression: 'sqrt(x^2 + y^2)', dimension: '3D', description: 'مخروط دائري' },
    { name: 'قبة كروية', expression: 'sqrt(max(0, 25 - x^2 - y^2))', dimension: '3D', description: 'نصف كرة' },
    { name: 'تموجات ماء', expression: 'sin(sqrt(x^2 + y^2))', dimension: '3D', description: 'تموجات دائرية' },
    { name: 'جبال غاوسية', expression: '10*exp(-(x^2 + y^2)/10)', dimension: '3D', description: 'توزيع غاوسي' },
    { name: 'سطح مائج', expression: 'sin(x) + sin(y)', dimension: '3D', description: 'أمواج متعامدة' },
    { name: 'سطح حلزوني', expression: 'atan2(y, x)', dimension: '3D', description: 'دوامة' },
    { name: 'دالة معقدة', expression: 'sin(x*y) * cos(x+y)', dimension: '3D', description: 'نمط معقد' },
    { name: 'قمع', expression: '-sqrt(x^2 + y^2)', dimension: '3D', description: 'مخروط مقلوب' },
    { name: 'تضاريس جبلية', expression: 'sin(x)*cos(y) + sin(2*x)*cos(2*y)/2', dimension: '3D', description: 'تضاريس طبيعية' },
    { name: 'سطح متعرج', expression: 'abs(sin(x)) * abs(cos(y))', dimension: '3D', description: 'نمط متعرج' },
    { name: 'دالة بولينوم', expression: 'x^3 - 3*x*y^2', dimension: '3D', description: 'مونكي سادل' },
    { name: 'موجات متداخلة', expression: 'sin(sqrt(x^2 + y^2))*cos(sqrt(x^2 + y^2))', dimension: '3D', description: 'تداخل موجي' },
  ];

  return (
    <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
      <h3 className="text-lg font-bold text-foreground mb-4">أمثلة جاهزة</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Button
                variant="outline"
                onClick={() => onExampleSelect(example)}
                className="w-full justify-start text-right hover:bg-primary/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{example.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{example.description}</div>
                  <div className="text-xs text-primary/70 mt-1 font-mono">{example.expression}</div>
                </div>
                <span className="text-xs bg-primary/20 px-2 py-1 rounded mr-2">{example.dimension}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
