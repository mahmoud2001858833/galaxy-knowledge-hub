import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface FourierControlsProps {
  expression: string;
  onExpressionChange: (expr: string) => void;
  N: number;
  onNChange: (n: number) => void;
  L: number;
  onLChange: (l: number) => void;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onReset: () => void;
  isPiecewise: boolean;
  onTogglePiecewise: () => void;
}

const FourierControls: React.FC<FourierControlsProps> = ({
  expression,
  onExpressionChange,
  N,
  onNChange,
  L,
  onLChange,
  isAnimating,
  onToggleAnimation,
  onReset,
  isPiecewise,
  onTogglePiecewise,
}) => {
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          عناصر التحكم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* نوع الدالة */}
        <div className="space-y-2">
          <Label>نوع الدالة</Label>
          <div className="flex gap-2">
            <Button
              variant={!isPiecewise ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onTogglePiecewise()}
            >
              دالة عادية
            </Button>
            <Button
              variant={isPiecewise ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onTogglePiecewise()}
            >
              دالة قطعية
            </Button>
          </div>
        </div>

        {/* إدخال الدالة */}
        <div className="space-y-2">
          <Label htmlFor="expression">
            {isPiecewise ? 'الدالة القطعية (سطر لكل قطعة)' : 'الدالة f(x)'}
          </Label>
          {isPiecewise ? (
            <Textarea
              id="expression"
              value={expression}
              onChange={(e) => onExpressionChange(e.target.value)}
              placeholder="مثال:&#10;-1, x < 0&#10;1, x >= 0"
              className="font-mono text-right min-h-[100px]"
              dir="ltr"
            />
          ) : (
            <Input
              id="expression"
              value={expression}
              onChange={(e) => onExpressionChange(e.target.value)}
              placeholder="مثال: x^2, sin(x), abs(x)"
              className="font-mono text-right"
              dir="ltr"
            />
          )}
        </div>

        {/* عدد الحدود N */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>عدد الحدود N</Label>
            <span className="text-2xl font-bold text-primary">{N}</span>
          </div>
          <Slider
            value={[N]}
            onValueChange={(value) => onNChange(value[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>30</span>
          </div>
          <p className="text-xs text-yellow-500">
            ⚠️ الحد الأقصى 30 حداً لضمان الأداء السلس
          </p>
        </div>

        {/* الفترة L */}
        <div className="space-y-2">
          <Label htmlFor="period">الفترة L</Label>
          <Input
            id="period"
            type="number"
            value={L}
            onChange={(e) => onLChange(parseFloat(e.target.value) || Math.PI)}
            step="0.1"
            className="text-right"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleAnimation}
              className="w-full"
              variant={isAnimating ? 'destructive' : 'default'}
            >
              {isAnimating ? (
                <>
                  <Pause className="w-4 h-4 ml-2" />
                  إيقاف الأنيميشن
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-2" />
                  تشغيل الأنيميشن
                </>
              )}
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FourierControls;
