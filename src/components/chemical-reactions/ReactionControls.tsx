import { Play, Pause, RotateCcw, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ReactionControlsProps {
  isPlaying: boolean;
  speed: number;
  showGeometry: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleGeometry: () => void;
}

export const ReactionControls = ({
  isPlaying,
  speed,
  showGeometry,
  onPlayPause,
  onReset,
  onSpeedChange,
  onToggleGeometry,
}: ReactionControlsProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Button
          onClick={onPlayPause}
          size="lg"
          className="flex-1"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              إيقاف
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              ابدأ التفاعل
            </>
          )}
        </Button>
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">سرعة التفاعل</span>
          <span className="text-foreground font-medium">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={(values) => onSpeedChange(values[0])}
          min={0.5}
          max={3}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <Label htmlFor="geometry-mode" className="flex items-center gap-2 cursor-pointer">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">إظهار الشكل الهندسي</span>
        </Label>
        <Switch
          id="geometry-mode"
          checked={showGeometry}
          onCheckedChange={onToggleGeometry}
        />
      </div>
    </div>
  );
};
