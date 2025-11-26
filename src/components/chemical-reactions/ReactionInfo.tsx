import { ChemicalReaction } from '@/data/chemical-reactions-data';
import { Card } from '@/components/ui/card';
import { Flame, Snowflake } from 'lucide-react';

interface ReactionInfoProps {
  reaction: ChemicalReaction;
}

export const ReactionInfo = ({ reaction }: ReactionInfoProps) => {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {reaction.nameAr}
        </h3>
        <p className="text-lg text-muted-foreground">{reaction.nameEn}</p>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="text-center font-mono text-lg text-foreground">
          {reaction.equation}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {reaction.energyChange === 'exothermic' ? (
          <>
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-foreground">تفاعل طارد للحرارة</span>
          </>
        ) : (
          <>
            <Snowflake className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-foreground">تفاعل ماص للحرارة</span>
          </>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">الوصف:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {reaction.description}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">ملاحظات تعليمية:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {reaction.educationalNotes}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
          {reaction.category}
        </span>
        <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
          {reaction.complexity === 'simple' && 'بسيط'}
          {reaction.complexity === 'medium' && 'متوسط'}
          {reaction.complexity === 'complex' && 'معقد'}
        </span>
      </div>
    </Card>
  );
};
