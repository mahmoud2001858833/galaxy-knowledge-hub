import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { SquareFunction } from 'lucide-react';

interface FourierFormulaProps {
  formulaString: string;
  a0: number;
  coefficients: Array<{n: number, an: number, bn: number}>;
}

const FourierFormula: React.FC<FourierFormulaProps> = ({ formulaString, a0, coefficients }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SquareFunction className="w-6 h-6 text-primary" />
            صيغة سلسلة فورييه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* الصيغة العامة */}
          <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2 text-center">الصيغة العامة:</p>
            <p className="text-lg font-mono text-center" dir="ltr">
              f(x) ≈ a₀/2 + Σ[aₙcos(nπx/L) + bₙsin(nπx/L)]
            </p>
          </div>

          {/* الصيغة المحسوبة */}
          <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2 text-center">التقريب الحالي:</p>
            <div className="overflow-x-auto">
              <p className="text-base font-mono whitespace-nowrap text-center" dir="ltr">
                {formulaString}
              </p>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-3 border border-blue-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">المعامل الثابت</p>
              <p className="text-xl font-bold text-center text-blue-400">
                a₀/2 = {(a0/2).toFixed(3)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-3 border border-green-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">حدود الجيب تمام</p>
              <p className="text-xl font-bold text-center text-green-400">
                {coefficients.filter(c => Math.abs(c.an) > 0.001).length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-3 border border-purple-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">حدود الجيب</p>
              <p className="text-xl font-bold text-center text-purple-400">
                {coefficients.filter(c => Math.abs(c.bn) > 0.001).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FourierFormula;
