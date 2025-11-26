import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Flame, Thermometer, Gauge, RotateCcw, Microwave } from 'lucide-react';

interface EnvironmentControlsProps {
  temperature: number;
  pressure: number;
  burnerOn: boolean;
  ovenOn?: boolean;
  flameIntensity: number;
  onTemperatureChange: (value: number) => void;
  onPressureChange: (value: number) => void;
  onBurnerToggle: () => void;
  onOvenToggle?: () => void;
  onFlameIntensityChange: (value: number) => void;
  onReset: () => void;
}

export const EnvironmentControls = ({
  temperature,
  pressure,
  burnerOn,
  ovenOn = false,
  flameIntensity,
  onTemperatureChange,
  onPressureChange,
  onBurnerToggle,
  onOvenToggle,
  onFlameIntensityChange,
  onReset
}: EnvironmentControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            التحكم بالبيئة
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            إعادة تعيين
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperature Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              درجة الحرارة
            </Label>
            <span className="text-2xl font-bold text-primary">
              {temperature}°C
            </span>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={(value) => onTemperatureChange(value[0])}
            min={-20}
            max={500}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-20°C</span>
            <span>500°C</span>
          </div>
        </div>

        {/* Pressure Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              الضغط
            </Label>
            <span className="text-2xl font-bold text-primary">
              {pressure.toFixed(1)} atm
            </span>
          </div>
          <Slider
            value={[pressure]}
            onValueChange={(value) => onPressureChange(value[0])}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1 atm</span>
            <span>10 atm</span>
          </div>
        </div>

        {/* Bunsen Burner Control */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              موقد بنسن
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {burnerOn ? 'مشتعل' : 'مطفأ'}
              </span>
              <Switch
                checked={burnerOn}
                onCheckedChange={onBurnerToggle}
              />
            </div>
          </div>

          {burnerOn && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-sm">شدة اللهب</Label>
                <span className="text-sm font-semibold">
                  {Math.round(flameIntensity * 100)}%
                </span>
              </div>
              <Slider
                value={[flameIntensity]}
                onValueChange={(value) => onFlameIntensityChange(value[0])}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Oven Control */}
        {onOvenToggle && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Microwave className="w-4 h-4" />
                الفرن الكهربائي
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {ovenOn ? 'يعمل' : 'متوقف'}
                </span>
                <Switch
                  checked={ovenOn}
                  onCheckedChange={onOvenToggle}
                />
              </div>
            </div>
            {ovenOn && (
              <div className="text-xs text-muted-foreground animate-fade-in">
                الفرن يعمل حالياً - درجة الحرارة: {temperature}°C
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onTemperatureChange(0);
              onPressureChange(1);
            }}
          >
            ❄️ تجميد
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onTemperatureChange(25);
              onPressureChange(1);
            }}
          >
            🌡️ حرارة الغرفة
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onTemperatureChange(100);
              onBurnerToggle();
            }}
          >
            💧 غليان
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onTemperatureChange(200);
              onBurnerToggle();
            }}
          >
            🔥 تسخين عالي
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
