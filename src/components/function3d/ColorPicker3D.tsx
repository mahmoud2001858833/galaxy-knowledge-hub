import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ColorPicker3DProps {
  colorscale: string;
  opacity: number;
  onColorscaleChange: (scale: string) => void;
  onOpacityChange: (opacity: number) => void;
}

export const ColorPicker3D = ({
  colorscale,
  opacity,
  onColorscaleChange,
  onOpacityChange,
}: ColorPicker3DProps) => {
  const colorscales = [
    { name: 'Viridis', value: 'Viridis', gradient: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde724)' },
    { name: 'Plasma', value: 'Plasma', gradient: 'linear-gradient(to right, #0d0887, #7e03a8, #cc4778, #f89540, #f0f921)' },
    { name: 'Jet', value: 'Jet', gradient: 'linear-gradient(to right, #00007f, #0000ff, #00ffff, #ffff00, #ff0000, #7f0000)' },
    { name: 'Rainbow', value: 'Rainbow', gradient: 'linear-gradient(to right, #9400d3, #4b0082, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000)' },
    { name: 'Hot', value: 'Hot', gradient: 'linear-gradient(to right, #000000, #ff0000, #ffff00, #ffffff)' },
    { name: 'Cool', value: 'Cool', gradient: 'linear-gradient(to right, #00ffff, #ff00ff)' },
    { name: 'Earth', value: 'Earth', gradient: 'linear-gradient(to right, #000082, #00b4a0, #92d050, #ffff00)' },
    { name: 'Electric', value: 'Electric', gradient: 'linear-gradient(to right, #000000, #1e0064, #780096, #0064ff, #00d2ff)' },
  ];

  return (
    <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
      <h3 className="text-lg font-bold text-foreground mb-4">الألوان والتدرجات</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-foreground mb-3 block">تدرج الألوان</Label>
          <div className="grid grid-cols-2 gap-2">
            {colorscales.map((scale) => (
              <Button
                key={scale.value}
                variant={colorscale === scale.value ? 'default' : 'outline'}
                onClick={() => onColorscaleChange(scale.value)}
                className="h-auto py-2 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full h-6 rounded"
                  style={{ background: scale.gradient }}
                />
                <span className="text-xs">{scale.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-foreground mb-2 block">
            الشفافية: {Math.round(opacity * 100)}%
          </Label>
          <Slider
            value={[opacity * 100]}
            onValueChange={(v) => onOpacityChange(v[0] / 100)}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};
