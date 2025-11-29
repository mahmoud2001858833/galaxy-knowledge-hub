import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Example {
  name: string;
  expression: string;
  description: string;
  type: 'regular' | 'piecewise';
  piecewise?: Array<{condition: string, expression: string}>;
}

interface FourierExamplesProps {
  onExampleSelect: (example: Example) => void;
}

const FourierExamples: React.FC<FourierExamplesProps> = ({ onExampleSelect }) => {
  const examples: Example[] = [
    {
      name: 'الموجة المربعة',
      expression: 'piecewise',
      description: 'موجة مربعة كلاسيكية - مثال مثالي لظاهرة غيبس',
      type: 'piecewise',
      piecewise: [
        { condition: 'x < 0', expression: '-1' },
        { condition: 'x >= 0', expression: '1' }
      ]
    },
    {
      name: 'الموجة المثلثية',
      expression: 'abs(x)',
      description: 'دالة القيمة المطلقة - تقارب سريع',
      type: 'regular'
    },
    {
      name: 'الموجة المنشارية',
      expression: 'x',
      description: 'دالة خطية - تقارب متوسط',
      type: 'regular'
    },
    {
      name: 'دالة الخطوة',
      expression: 'piecewise',
      description: 'دالة هيفيسايد - عدم استمرار قفزي',
      type: 'piecewise',
      piecewise: [
        { condition: 'x < 0', expression: '0' },
        { condition: 'x >= 0', expression: '1' }
      ]
    },
    {
      name: 'القوس',
      expression: 'x^2',
      description: 'دالة تربيعية - تقارب سلس',
      type: 'regular'
    },
    {
      name: 'دالة نبضية',
      expression: 'piecewise',
      description: 'نبضة مستطيلة',
      type: 'piecewise',
      piecewise: [
        { condition: 'x < -1', expression: '0' },
        { condition: 'x >= -1 && x <= 1', expression: '1' },
        { condition: 'x > 1', expression: '0' }
      ]
    },
    {
      name: 'نصف موجة جيبية',
      expression: 'piecewise',
      description: 'مقوم نصف موجة',
      type: 'piecewise',
      piecewise: [
        { condition: 'x < 0', expression: '0' },
        { condition: 'x >= 0', expression: 'sin(x)' }
      ]
    },
    {
      name: 'موجة مقومة كاملة',
      expression: 'abs(sin(x))',
      description: 'القيمة المطلقة للجيب',
      type: 'regular'
    },
    {
      name: 'دالة مكعبة',
      expression: 'x^3',
      description: 'دالة فردية',
      type: 'regular'
    },
    {
      name: 'موجة كسرية',
      expression: 'x*(pi-x)',
      description: 'دالة تربيعية معدلة',
      type: 'regular'
    }
  ];

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-6 h-6 text-primary" />
          أمثلة جاهزة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/10 hover:border-primary/50"
                onClick={() => onExampleSelect(example)}
              >
                <span className="font-bold text-lg">{example.name}</span>
                <span className="text-sm text-muted-foreground text-right">
                  {example.description}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FourierExamples;
