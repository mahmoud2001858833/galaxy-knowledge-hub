import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, Waves } from 'lucide-react';

interface WavePropertiesProps {
  frequency: number;
  wavelength: number;
  amplitude: number;
  waveType: string;
}

const WaveProperties = ({ frequency, wavelength, amplitude, waveType }: WavePropertiesProps) => {
  const speedOfLight = 299792458;
  const plancksConstant = 6.62607015e-34;
  
  // Calculate photon energy: E = h * f
  const energy = (plancksConstant * frequency * 1e12).toExponential(2);
  
  // Calculate period: T = 1 / f
  const period = (1 / (frequency * 1e12)).toExponential(2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Waves className="text-primary" size={20} />
            خصائص الموجة
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="text-primary" size={16} />
                <span className="text-sm text-foreground">التردد (f)</span>
              </div>
              <span className="text-sm font-mono text-primary">{frequency.toFixed(2)} THz</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Waves className="text-primary" size={16} />
                <span className="text-sm text-foreground">الطول الموجي (λ)</span>
              </div>
              <span className="text-sm font-mono text-primary">{wavelength.toFixed(2)} nm</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="text-primary" size={16} />
                <span className="text-sm text-foreground">طاقة الفوتون (E)</span>
              </div>
              <span className="text-sm font-mono text-primary">{energy} J</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="text-primary" size={16} />
                <span className="text-sm text-foreground">الدورة (T)</span>
              </div>
              <span className="text-sm font-mono text-primary">{period} s</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="text-primary" size={16} />
                <span className="text-sm text-foreground">السرعة (c)</span>
              </div>
              <span className="text-sm font-mono text-primary">3×10⁸ m/s</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              جميع الموجات الكهرومغناطيسية تنتقل بنفس السرعة في الفراغ
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaveProperties;
