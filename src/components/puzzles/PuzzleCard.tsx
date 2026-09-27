import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  Lock, 
  Star, 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export const PuzzleCard: React.FC<PuzzleCardProps> = ({ 
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
          color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
          gradient: 'from-emerald-500/10 via-background to-emerald-500/5',
          border: 'hover:border-emerald-500/60',
          label: 'سهل'
        };
      case 'متوسط':
        return { 
          color: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
          gradient: 'from-amber-500/10 via-background to-amber-500/5',
          border: 'hover:border-amber-500/60',
          label: 'متوسط'
        };
      case 'صعب':
        return { 
          color: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
          gradient: 'from-rose-500/10 via-background to-rose-500/5',
          border: 'hover:border-rose-500/60',
          label: 'صعب'
        };
      default:
        return { 
          color: 'bg-primary/15 text-primary border-primary/30',
          gradient: 'from-primary/10 via-background to-primary/5',
          border: 'hover:border-primary/60',
          label: difficulty || 'تحدي'
        };
    }
  };

  const getSubjectConfig = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('فيزياء')) return { icon: '⚛️', color: 'bg-blue-500/15 text-blue-500 border-blue-500/30' };
    if (s.includes('كيمياء')) return { icon: '🧪', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' };
    if (s.includes('أحياء') || s.includes('احياء')) return { icon: '🧬', color: 'bg-pink-500/15 text-pink-500 border-pink-500/30' };
    if (s.includes('رياضيات')) return { icon: '📐', color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' };
    if (s.includes('فلك')) return { icon: '🌌', color: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30' };
    if (s.includes('ذكاء') || s.includes('منطق')) return { icon: '💡', color: 'bg-purple-500/15 text-purple-500 border-purple-500/30' };
    return { icon: '🎯', color: 'bg-primary/15 text-primary border-primary/30' };
  };

  const diffCfg = getDifficultyConfig(puzzle.difficulty);
  const subjCfg = getSubjectConfig(puzzle.subject);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card 
        onClick={onClick}
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full bg-gradient-to-b ${diffCfg.gradient} shadow-sm hover:shadow-xl ${
          isAttempted 
            ? isCorrect 
              ? 'border-emerald-500/50 bg-emerald-950/10' 
              : 'border-rose-500/50 bg-rose-950/10 opacity-80'
            : `border-border/60 ${diffCfg.border}`
        }`}
      >
        {/* Top Points & Subject Tag */}
        <div className="p-4 pb-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={`text-[11px] font-bold py-0.5 px-2.5 rounded-full border ${subjCfg.color}`}>
              <span className="ml-1">{subjCfg.icon}</span>
              <span>{puzzle.subject}</span>
            </Badge>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${diffCfg.color}`}>
                {diffCfg.label}
              </Badge>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-xs font-black border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>+{puzzle.points}</span>
              </div>
            </div>
          </div>

          {/* Optional Image */}
          {puzzle.image && (
            <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-slate-900/60 border border-border/40">
              <img 
                src={puzzle.image} 
                alt={puzzle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          {/* Title & Question Teaser */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {puzzle.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {puzzle.question}
            </p>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 pt-2 border-t border-border/40 mt-auto">
          {isAttempted ? (
            <div className="flex items-center justify-between text-xs py-1">
              {isCorrect ? (
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم الحل بنجاح ✓</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>استنفدت المحاولة ✗</span>
                </div>
              )}
              <span className="text-[10px] text-muted-foreground hover:underline">
                عرض النتيجة والتفسير
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full h-9 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              <span>ابدأ التحدي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PuzzleCard;
