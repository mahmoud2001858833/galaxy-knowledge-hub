import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface GibbsIndicatorProps {
  gibbsPoints: Array<{x: number, overshoot: number}>;
  hasDiscontinuities: boolean;
}

const GibbsIndicator: React.FC<GibbsIndicatorProps> = ({ gibbsPoints, hasDiscontinuities }) => {
  if (!hasDiscontinuities || gibbsPoints.length === 0) {
    return null;
  }

  const averageOvershoot = gibbsPoints.reduce((sum, p) => sum + p.overshoot, 0) / gibbsPoints.length;
  const maxOvershoot = Math.max(...gibbsPoints.map(p => p.overshoot));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-sm border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            ظاهرة غيبس مكتشفة!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* الشرح */}
          <div className="bg-card/50 rounded-lg p-4 border border-red-500/20">
            <h4 className="font-bold text-lg mb-2">ما هي ظاهرة غيبس؟</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              عند تقريب دالة لها نقاط عدم استمرار باستخدام سلسلة فورييه، يحدث تجاوز (overshoot) 
              بنسبة تقريباً 9% من حجم القفزة عند نقطة عدم الاستمرار. هذا التجاوز لا يختفي حتى 
              مع زيادة عدد الحدود N إلى ما لا نهاية!
            </p>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">عدد النقاط</p>
              <p className="text-2xl font-bold text-center text-red-400">
                {gibbsPoints.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg p-3 border border-orange-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">متوسط التجاوز</p>
              <p className="text-2xl font-bold text-center text-orange-400">
                {averageOvershoot.toFixed(3)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-3 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground text-center mb-1">أقصى تجاوز</p>
              <p className="text-2xl font-bold text-center text-yellow-400">
                {maxOvershoot.toFixed(3)}
              </p>
            </div>
          </div>

          {/* قائمة النقاط */}
          <div className="bg-card/50 rounded-lg p-3 border border-red-500/20">
            <h4 className="font-bold text-sm mb-2">نقاط التجاوز:</h4>
            <div className="space-y-1">
              {gibbsPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm bg-red-500/5 rounded px-2 py-1"
                >
                  <span>x = {point.x.toFixed(3)}</span>
                  <span className="font-bold text-red-400">
                    تجاوز: {point.overshoot.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ملاحظة */}
          <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
            <p className="text-xs text-yellow-200">
              💡 <strong>ملاحظة:</strong> النقاط الحمراء على الرسم البياني تشير إلى مواقع ظاهرة غيبس. 
              حاول زيادة N لترى أن التجاوز لا يختفي!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GibbsIndicator;
