import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Reaction } from '@/data/virtual-lab-data';
import { Beaker, AlertTriangle, Zap, Droplet, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReactionResultProps {
  reaction: Reaction | null;
  isReacting: boolean;
}

export const ReactionResult = ({ reaction, isReacting }: ReactionResultProps) => {
  if (!reaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            نتيجة التفاعل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            اختر مادتين أو أكثر لبدء التفاعل
          </p>
        </CardContent>
      </Card>
    );
  }

  const getReactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'acid-base': 'تفاعل حمض-قاعدة',
      'redox': 'تفاعل أكسدة-اختزال',
      'precipitation': 'تفاعل ترسيب',
      'decomposition': 'تفاعل تحلل',
      'synthesis': 'تفاعل تركيب',
      'combustion': 'تفاعل احتراق'
    };
    return types[type] || type;
  };

  const getEnergyIcon = (energy: string) => {
    return energy === 'exothermic' ? '🔥' : energy === 'endothermic' ? '❄️' : '⚖️';
  };

  const getEnergyLabel = (energy: string) => {
    return energy === 'exothermic' ? 'طارد للحرارة' : 
           energy === 'endothermic' ? 'ماص للحرارة' : 'متعادل';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            نتيجة التفاعل
            {isReacting && (
              <Badge variant="default" className="animate-pulse">
                جارٍ التفاعل...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reaction Equation */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-center font-mono text-lg font-semibold">
              {reaction.description}
            </p>
          </div>

          {/* Reaction Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground mb-1">نوع التفاعل</p>
              <p className="text-sm font-semibold">
                {getReactionTypeLabel(reaction.type)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground mb-1">الطاقة</p>
              <p className="text-sm font-semibold flex items-center gap-1">
                <span>{getEnergyIcon(reaction.energy)}</span>
                {getEnergyLabel(reaction.energy)}
              </p>
            </div>
          </div>

          {/* Energy Value */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                التغير في الطاقة
              </span>
              <span className="text-lg font-bold">
                {reaction.energyValue > 0 ? '+' : ''}{reaction.energyValue} kJ/mol
              </span>
            </div>
          </div>

          {/* Observable Changes */}
          {(reaction.color_change || reaction.gas_produced || reaction.precipitate) && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">المشاهدات:</p>
              <div className="space-y-2">
                {reaction.color_change && (
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span>تغير في اللون</span>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: reaction.color_change }}
                    />
                  </div>
                )}
                {reaction.gas_produced && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wind className="w-4 h-4 text-green-500" />
                    <span>انبعاث غاز: {reaction.gas_produced}</span>
                  </div>
                )}
                {reaction.precipitate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="w-4 h-4 text-gray-500" />
                    <span>تكون راسب</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety Warning */}
          {reaction.safety_warning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {reaction.safety_warning}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
