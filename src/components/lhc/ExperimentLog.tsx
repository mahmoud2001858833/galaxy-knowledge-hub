import { motion } from 'framer-motion';
import { Clock, Zap, Atom, Star } from 'lucide-react';
import type { ExperimentLog as ExperimentLogType } from '@/hooks/useLHCSimulation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExperimentLogProps {
  logs: ExperimentLogType[];
}

export const ExperimentLog = ({ logs }: ExperimentLogProps) => {
  if (logs.length === 0) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-foreground mb-4">سجل التجارب</h3>
        <p className="text-muted-foreground text-center py-8">لا توجد تجارب مسجلة بعد</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-4">سجل التجارب</h3>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              className="bg-background/50 p-4 rounded-lg border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground" size={16} />
                  <span className="text-sm text-muted-foreground">
                    {log.timestamp.toLocaleTimeString('ar-SA')}
                  </span>
                </div>
                {log.rareEventDetected && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                    <Star className="text-yellow-400" size={14} />
                    <span className="text-xs text-yellow-400 font-semibold">حدث نادر</span>
                  </div>
                )}
              </div>

              {log.scenario && (
                <div className="text-sm font-semibold text-primary mb-2">
                  {log.scenario}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-400" size={16} />
                  <span className="text-foreground">
                    {(log.energy / 1000).toFixed(2)} TeV
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Atom className="text-cyan-400" size={16} />
                  <span className="text-foreground">
                    {log.particleType === 'proton' ? 'بروتون' : 'أيون رصاص'}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  جسيمات ناتجة: <span className="text-primary font-bold">{log.resultingParticles}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
