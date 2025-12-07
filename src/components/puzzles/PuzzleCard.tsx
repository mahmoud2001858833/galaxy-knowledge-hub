import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Lock, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PuzzleCardProps {
  puzzle: {
    id: string;
    title: string;
    question: string;
    difficulty: string;
    points: number;
    subject: string;
    image?: string | null;
  };
  isAttempted: boolean;
  isCorrect?: boolean;
  onClick: () => void;
  index: number;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({ 
  puzzle, 
  isAttempted, 
  isCorrect,
  onClick, 
  index 
}) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل':
        return { 
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
          gradient: 'from-emerald-500/10 to-green-500/10'
        };
      case 'متوسط':
        return { 
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
          gradient: 'from-amber-500/10 to-yellow-500/10'
        };
      case 'صعب':
        return { 
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
          gradient: 'from-rose-500/10 to-red-500/10'
        };
      default:
        return { 
          color: 'bg-primary/20 text-primary border-primary/50',
          gradient: 'from-primary/10 to-accent/10'
        };
    }
  };

  const getSubjectConfig = (subject: string) => {
    const subjects: Record<string, { icon: string; color: string }> = {
      'physics': { icon: '⚛️', color: 'bg-blue-500/20 text-blue-400' },
      'chemistry': { icon: '🧪', color: 'bg-purple-500/20 text-purple-400' },
      'biology': { icon: '🧬', color: 'bg-green-500/20 text-green-400' },
      'math': { icon: '📐', color: 'bg-orange-500/20 text-orange-400' },
      'الفيزياء': { icon: '⚛️', color: 'bg-blue-500/20 text-blue-400' },
      'الكيمياء': { icon: '🧪', color: 'bg-purple-500/20 text-purple-400' },
      'الأحياء': { icon: '🧬', color: 'bg-green-500/20 text-green-400' },
      'الرياضيات': { icon: '📐', color: 'bg-orange-500/20 text-orange-400' },
    };
    return subjects[subject] || { icon: '🎯', color: 'bg-primary/20 text-primary' };
  };

  const difficultyConfig = getDifficultyConfig(puzzle.difficulty);
  const subjectConfig = getSubjectConfig(puzzle.subject);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: isAttempted ? 1 : 1.03, y: isAttempted ? 0 : -5 }}
      whileTap={{ scale: isAttempted ? 1 : 0.98 }}
      onClick={isAttempted ? undefined : onClick}
      className={`cursor-${isAttempted ? 'default' : 'pointer'}`}
    >
      <Card className={`
        relative overflow-hidden border transition-all duration-300
        ${isAttempted 
          ? isCorrect 
            ? 'bg-emerald-500/10 border-emerald-500/50' 
            : 'bg-rose-500/10 border-rose-500/50 opacity-75'
          : `bg-gradient-to-br ${difficultyConfig.gradient} border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10`
        }
      `}>
        {/* Attempted Overlay */}
        {isAttempted && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}
            `}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">تم الحل ✓</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span className="font-semibold">تمت المحاولة</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Image */}
        {puzzle.image && (
          <div className="relative h-32 overflow-hidden">
            <img 
              src={puzzle.image} 
              alt={puzzle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          {/* Header with subject and difficulty */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={`${subjectConfig.color} border-0`}>
              <span className="mr-1">{subjectConfig.icon}</span>
              {puzzle.subject}
            </Badge>
            <Badge variant="outline" className={`${difficultyConfig.color}`}>
              {puzzle.difficulty}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-2 text-foreground">
            {puzzle.title}
          </h3>

          {/* Question preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {puzzle.question}
          </p>

          {/* Points */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-primary">
              <Star className="h-4 w-4 fill-primary" />
              <span className="font-bold">{puzzle.points}</span>
              <span className="text-xs text-muted-foreground">نقطة</span>
            </div>
            
            {!isAttempted && (
              <motion.div 
                className="flex items-center gap-1 text-xs text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3" />
                <span>فرصة واحدة</span>
              </motion.div>
            )}
          </div>
        </CardContent>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
      </Card>
    </motion.div>
  );
};

export default PuzzleCard;
