import { motion } from 'framer-motion';
import { scenarios } from '@/data/lhc-educational-content';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Target } from 'lucide-react';

interface ScenariosPanelProps {
  onLoadScenario: (scenario: any) => void;
}

export const ScenariosPanel = ({ onLoadScenario }: ScenariosPanelProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-foreground';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'legendary': return Sparkles;
      case 'hard': return Target;
      default: return Zap;
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-6">السيناريوهات الجاهزة</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario, index) => {
          const Icon = getDifficultyIcon(scenario.difficulty);
          
          return (
            <motion.div
              key={scenario.id}
              className="bg-background/50 p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onLoadScenario(scenario.settings)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={getDifficultyColor(scenario.difficulty)} size={20} />
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {scenario.name}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {scenario.description}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  جسيمات متوقعة: <span className="text-primary font-bold">~{scenario.expectedParticles}</span>
                </span>
                <span className={`${getDifficultyColor(scenario.difficulty)} font-semibold uppercase`}>
                  {scenario.difficulty}
                </span>
              </div>

              {scenario.specialEvent === 'higgs' && (
                <motion.div
                  className="mt-3 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-md border border-yellow-500/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs text-yellow-400 font-semibold text-center">
                    🌟 يحتوي على فرصة لاكتشاف بوزون هيغز!
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => onLoadScenario({ beamEnergy: 450, beamSpeed: 0.7, particleType: 'proton', particleCount: 100 })}
      >
        إعادة تعيين إلى الإعدادات الافتراضية
      </Button>
    </motion.div>
  );
};
