import { ChemicalReaction } from '@/data/chemical-reactions-data';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, Snowflake } from 'lucide-react';

interface ReactionsListProps {
  reactions: ChemicalReaction[];
  selectedReaction: ChemicalReaction;
  onSelectReaction: (reaction: ChemicalReaction) => void;
}

export const ReactionsList = ({ 
  reactions, 
  selectedReaction, 
  onSelectReaction 
}: ReactionsListProps) => {
  const categories = Array.from(new Set(reactions.map(r => r.category)));

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <h3 className="text-lg font-bold text-foreground sticky top-0 bg-background/95 backdrop-blur py-2">
              {category}
            </h3>
            <div className="space-y-2">
              {reactions
                .filter((r) => r.category === category)
                .map((reaction) => (
                  <Card
                    key={reaction.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedReaction.id === reaction.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => onSelectReaction(reaction)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {reaction.nameAr}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {reaction.nameEn}
                          </p>
                        </div>
                        {reaction.energyChange === 'exothermic' ? (
                          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        ) : (
                          <Snowflake className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs font-mono bg-muted/50 p-2 rounded text-foreground">
                        {reaction.equation}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          reaction.complexity === 'simple' 
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                            : reaction.complexity === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}>
                          {reaction.complexity === 'simple' && 'بسيط'}
                          {reaction.complexity === 'medium' && 'متوسط'}
                          {reaction.complexity === 'complex' && 'معقد'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
