import { motion } from 'framer-motion';
import { Activity, Zap, Thermometer, Magnet, Target, Atom } from 'lucide-react';
import type { RealTimeData } from '@/hooks/useLHCSimulation';

interface InfoDashboardProps {
  data: RealTimeData;
}

export const InfoDashboard = ({ data }: InfoDashboardProps) => {
  const metrics = [
    { label: 'الطاقة اللحظية', value: data.instantEnergy, icon: Zap, color: 'text-yellow-400' },
    { label: 'نسبة السرعة', value: data.speedRatio, icon: Activity, color: 'text-cyan-400' },
    { label: 'عدد الجسيمات', value: data.particleCount, icon: Atom, color: 'text-purple-400' },
    { label: 'معدل التصادم', value: data.collisionRate, icon: Target, color: 'text-orange-400' },
    { label: 'احتمال هيغز', value: data.higgsEventProbability, icon: Target, color: 'text-yellow-500' },
    { label: 'التبريد', value: data.cryogenicsTemp, icon: Thermometer, color: 'text-blue-400' },
    { label: 'قوة المغناطيس', value: data.magnetStrength, icon: Magnet, color: 'text-pink-400' },
    { label: 'اللمعان', value: data.luminosity, icon: Activity, color: 'text-green-400' }
  ];

  return (
    <motion.div 
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-6">لوحة المعلومات اللحظية</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="bg-background/50 p-4 rounded-lg border border-border/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <metric.icon className={`${metric.color}`} size={20} />
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
            <div className={`text-xl font-mono font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-foreground/80 text-center">
          ⚡ النظام يعمل بكفاءة عالية - جميع الأنظمة جاهزة
        </p>
      </motion.div>
    </motion.div>
  );
};
