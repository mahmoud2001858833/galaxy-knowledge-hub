import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FunctionItem {
  id: string;
  expression: string;
  dimension: '1D' | '2D' | '3D';
  color: string;
  opacity: number;
  visible: boolean;
}

interface FunctionListProps {
  functions: FunctionItem[];
  onRemoveFunction: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
}

const colorOptions = [
  { name: 'أحمر', value: '#ef4444' },
  { name: 'أزرق', value: '#3b82f6' },
  { name: 'أخضر', value: '#10b981' },
  { name: 'أصفر', value: '#f59e0b' },
  { name: 'بنفسجي', value: '#8b5cf6' },
  { name: 'وردي', value: '#ec4899' },
  { name: 'سماوي', value: '#06b6d4' },
];

export const FunctionList = ({
  functions,
  onRemoveFunction,
  onToggleVisibility,
  onOpacityChange,
}: FunctionListProps) => {
  if (functions.length === 0) {
    return (
      <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
        <p className="text-center text-muted-foreground">لا توجد دوال مضافة بعد</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
      <h3 className="text-lg font-bold text-foreground mb-4">
        الدوال المضافة ({functions.length}/5)
      </h3>
      <div className="space-y-4">
        <AnimatePresence>
          {functions.map((func, index) => (
            <motion.div
              key={func.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 rounded-lg border border-border/30 bg-background/20 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      دالة {index + 1} ({func.dimension})
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground bg-background/30 p-2 rounded">
                    {func.expression}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleVisibility(func.id)}
                    className="h-8 w-8"
                  >
                    {func.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFunction(func.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  الشفافية: {Math.round(func.opacity * 100)}%
                </Label>
                <Slider
                  value={[func.opacity * 100]}
                  onValueChange={(v) => onOpacityChange(func.id, v[0] / 100)}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};
