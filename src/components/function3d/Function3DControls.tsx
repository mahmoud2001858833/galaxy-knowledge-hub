import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

interface Function3DControlsProps {
  dimension: '1D' | '2D' | '3D';
  onDimensionChange: (dim: '1D' | '2D' | '3D') => void;
  expression: string;
  onExpressionChange: (expr: string) => void;
  rangeX: [number, number];
  rangeY: [number, number];
  onRangeXChange: (range: [number, number]) => void;
  onRangeYChange: (range: [number, number]) => void;
  points: number;
  onPointsChange: (points: number) => void;
  onAddFunction: () => void;
  showGrid: boolean;
  showAxes: boolean;
  showContours: boolean;
  wireframe: boolean;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
  onToggleContours: () => void;
  onToggleWireframe: () => void;
}

export const Function3DControls = ({
  dimension,
  onDimensionChange,
  expression,
  onExpressionChange,
  rangeX,
  rangeY,
  onRangeXChange,
  onRangeYChange,
  points,
  onPointsChange,
  onAddFunction,
  showGrid,
  showAxes,
  showContours,
  wireframe,
  onToggleGrid,
  onToggleAxes,
  onToggleContours,
  onToggleWireframe,
}: Function3DControlsProps) => {
  return (
    <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
      <div className="space-y-6">
        {/* Dimension Selection */}
        <div>
          <Label className="text-foreground mb-3 block">اختر البُعد</Label>
          <div className="flex gap-3">
            {(['1D', '2D', '3D'] as const).map((dim) => (
              <Button
                key={dim}
                variant={dimension === dim ? 'default' : 'outline'}
                onClick={() => onDimensionChange(dim)}
                className="flex-1"
              >
                {dim === '1D' ? 'نقطة' : dim === '2D' ? 'منحنى' : 'سطح'} ({dim})
              </Button>
            ))}
          </div>
        </div>

        {/* Expression Input */}
        <div>
          <Label htmlFor="expression" className="text-foreground mb-2 block">
            {dimension === '1D' && 'أدخل الإحداثيات (x, y, z)'}
            {dimension === '2D' && 'أدخل الدالة: y = f(x)'}
            {dimension === '3D' && 'أدخل الدالة: z = f(x, y)'}
          </Label>
          <Input
            id="expression"
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder={dimension === '3D' ? 'x^2 + y^2' : dimension === '2D' ? 'x^2' : '1, 2, 3'}
            className="font-mono bg-background/50"
          />
        </div>

        {/* Range Controls */}
        {dimension !== '1D' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground mb-2 block">نطاق X</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={rangeX[0]}
                  onChange={(e) => onRangeXChange([+e.target.value, rangeX[1]])}
                  className="w-20 bg-background/50"
                />
                <span className="text-muted-foreground">إلى</span>
                <Input
                  type="number"
                  value={rangeX[1]}
                  onChange={(e) => onRangeXChange([rangeX[0], +e.target.value])}
                  className="w-20 bg-background/50"
                />
              </div>
            </div>
            {dimension === '3D' && (
              <div>
                <Label className="text-foreground mb-2 block">نطاق Y</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={rangeY[0]}
                    onChange={(e) => onRangeYChange([+e.target.value, rangeY[1]])}
                    className="w-20 bg-background/50"
                  />
                  <span className="text-muted-foreground">إلى</span>
                  <Input
                    type="number"
                    value={rangeY[1]}
                    onChange={(e) => onRangeYChange([rangeY[0], +e.target.value])}
                    className="w-20 bg-background/50"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Precision */}
        {dimension !== '1D' && (
          <div>
            <Label className="text-foreground mb-2 block">
              دقة الرسم: {points} نقطة
            </Label>
            <Slider
              value={[points]}
              onValueChange={(v) => onPointsChange(v[0])}
              min={20}
              max={dimension === '3D' ? 100 : 200}
              step={10}
              className="w-full"
            />
          </div>
        )}

        {/* Display Options */}
        <div className="space-y-3 border-t border-border/20 pt-4">
          <Label className="text-foreground block">خيارات العرض</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إظهار الشبكة</span>
              <Switch checked={showGrid} onCheckedChange={onToggleGrid} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إظهار المحاور</span>
              <Switch checked={showAxes} onCheckedChange={onToggleAxes} />
            </div>
            {dimension === '3D' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">خطوط الكنتور</span>
                  <Switch checked={showContours} onCheckedChange={onToggleContours} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">وضع سلكي</span>
                  <Switch checked={wireframe} onCheckedChange={onToggleWireframe} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Function Button */}
        <Button onClick={onAddFunction} className="w-full" size="lg">
          <Plus className="ml-2" />
          إضافة الدالة
        </Button>
      </div>
    </Card>
  );
};
