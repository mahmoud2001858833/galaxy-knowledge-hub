import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Square, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ControlPanelProps {
  beamEnergy: number;
  beamSpeed: number;
  particleType: 'proton' | 'lead-ion';
  particleCount: number;
  beamsLaunched: boolean;
  collisionActive: boolean;
  onBeamEnergyChange: (value: number) => void;
  onBeamSpeedChange: (value: number) => void;
  onParticleTypeChange: (type: 'proton' | 'lead-ion') => void;
  onParticleCountChange: (value: number) => void;
  onLaunchBeams: () => void;
  onStopBeams: () => void;
  onActivateCollision: () => void;
}

export const ControlPanel = ({
  beamEnergy,
  beamSpeed,
  particleType,
  particleCount,
  beamsLaunched,
  collisionActive,
  onBeamEnergyChange,
  onBeamSpeedChange,
  onParticleTypeChange,
  onParticleCountChange,
  onLaunchBeams,
  onStopBeams,
  onActivateCollision
}: ControlPanelProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Zap className="text-primary" />
        لوحة التحكم
      </h3>

      <div className="space-y-6">
        {/* Beam Energy */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">طاقة الحزمة</label>
            <span className="text-primary font-mono text-sm">{(beamEnergy / 1000).toFixed(2)} TeV</span>
          </div>
          <Slider
            value={[beamEnergy]}
            onValueChange={([value]) => onBeamEnergyChange(value)}
            min={450}
            max={13000}
            step={50}
            disabled={beamsLaunched}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.45 TeV</span>
            <span>13 TeV</span>
          </div>
        </div>

        {/* Beam Speed */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">السرعة</label>
            <span className="text-primary font-mono text-sm">{(beamSpeed * 100).toFixed(4)}% c</span>
          </div>
          <Slider
            value={[beamSpeed * 100]}
            onValueChange={([value]) => onBeamSpeedChange(value / 100)}
            min={50}
            max={99.9999991}
            step={0.1}
            disabled={beamsLaunched}
            className="w-full"
          />
        </div>

        {/* Particle Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">نوع الجسيم</label>
          <div className="flex gap-2">
            <Button
              variant={particleType === 'proton' ? 'default' : 'outline'}
              onClick={() => onParticleTypeChange('proton')}
              disabled={beamsLaunched}
              className="flex-1"
            >
              بروتون
            </Button>
            <Button
              variant={particleType === 'lead-ion' ? 'default' : 'outline'}
              onClick={() => onParticleTypeChange('lead-ion')}
              disabled={beamsLaunched}
              className="flex-1"
            >
              أيون رصاص
            </Button>
          </div>
        </div>

        {/* Particle Count */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">عدد الجسيمات</label>
            <span className="text-primary font-mono text-sm">{particleCount}B</span>
          </div>
          <Slider
            value={[particleCount]}
            onValueChange={([value]) => onParticleCountChange(value)}
            min={100}
            max={1000}
            step={50}
            disabled={beamsLaunched}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {!beamsLaunched ? (
            <Button 
              onClick={onLaunchBeams}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Play className="mr-2" size={18} />
              إطلاق الحزم
            </Button>
          ) : (
            <>
              <Button 
                onClick={onStopBeams}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2" size={18} />
                إيقاف
              </Button>
              <Button 
                onClick={onActivateCollision}
                disabled={collisionActive}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Zap className="mr-2" size={18} />
                تصادم!
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
