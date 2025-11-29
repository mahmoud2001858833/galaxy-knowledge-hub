import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FourierCoefficientsProps {
  a0: number;
  coefficients: Array<{n: number, an: number, bn: number}>;
}

const FourierCoefficients: React.FC<FourierCoefficientsProps> = ({ a0, coefficients }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            معاملات فورييه المحسوبة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* معامل a₀ */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">a₀ (المعامل الثابت)</span>
              <span className="text-2xl font-bold text-primary">{a0.toFixed(4)}</span>
            </div>
          </div>

          {/* جدول المعاملات */}
          <ScrollArea className="h-[400px] rounded-lg border border-border">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="text-center font-bold">n</TableHead>
                  <TableHead className="text-center font-bold">aₙ (cos)</TableHead>
                  <TableHead className="text-center font-bold">bₙ (sin)</TableHead>
                  <TableHead className="text-center font-bold">|aₙ| + |bₙ|</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coefficients.map(({ n, an, bn }) => {
                  const magnitude = Math.abs(an) + Math.abs(bn);
                  const isSignificant = magnitude > 0.001;
                  
                  return (
                    <TableRow
                      key={n}
                      className={isSignificant ? 'bg-primary/5 font-semibold' : ''}
                    >
                      <TableCell className="text-center">{n}</TableCell>
                      <TableCell className={`text-center ${Math.abs(an) > 0.001 ? 'text-green-400 font-bold' : 'text-muted-foreground'}`}>
                        {an.toFixed(4)}
                      </TableCell>
                      <TableCell className={`text-center ${Math.abs(bn) > 0.001 ? 'text-purple-400 font-bold' : 'text-muted-foreground'}`}>
                        {bn.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center">
                        {magnitude.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* ملاحظات */}
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>• المعاملات البارزة (غير الصفرية) تظهر بخط عريض ولون مميز</p>
            <p>• aₙ: معاملات دوال الجيب تمام (cos) - دوال زوجية</p>
            <p>• bₙ: معاملات دوال الجيب (sin) - دوال فردية</p>
            <p>• |aₙ| + |bₙ|: مجموع القيم المطلقة - يمثل مساهمة الحد n في التقريب</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FourierCoefficients;
