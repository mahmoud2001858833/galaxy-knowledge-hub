import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PuzzleCard from './PuzzleCard';

interface Puzzle {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  points: number;
  subject: string;
  image: string | null;
}

interface AttemptedPuzzle {
  puzzle_id: string;
  is_correct: boolean;
}

interface AllPuzzlesGridProps {
  userId?: string;
}

const AllPuzzlesGrid: React.FC<AllPuzzlesGridProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [attemptedPuzzles, setAttemptedPuzzles] = useState<AttemptedPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const difficulties = [
    { value: 'all', label: 'الكل', color: 'bg-primary/20 text-primary' },
    { value: 'سهل', label: 'سهل', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'متوسط', label: 'متوسط', color: 'bg-amber-500/20 text-amber-400' },
    { value: 'صعب', label: 'صعب', color: 'bg-rose-500/20 text-rose-400' },
  ];

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all puzzles
      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('subject_puzzles')
        .select('id, title, question, difficulty, points, subject, image')
        .order('created_at', { ascending: false });

      if (puzzlesError) throw puzzlesError;
      setPuzzles(puzzlesData || []);

      // Fetch attempted puzzles for current user
      if (userId) {
        const { data: attemptedData, error: attemptedError } = await supabase
          .from('user_solved_puzzles')
          .select('puzzle_id, is_correct')
          .eq('user_id', userId);

        if (!attemptedError && attemptedData) {
          setAttemptedPuzzles(attemptedData);
        }
      }
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPuzzles = puzzles.filter(puzzle => 
    selectedDifficulty === 'all' || puzzle.difficulty === selectedDifficulty
  );

  const getAttemptStatus = (puzzleId: string) => {
    const attempt = attemptedPuzzles.find(a => a.puzzle_id === puzzleId);
    return {
      isAttempted: !!attempt,
      isCorrect: attempt?.is_correct ?? false
    };
  };

  const handlePuzzleClick = (puzzleId: string) => {
    navigate(`/puzzle/${puzzleId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filter skeleton */}
        <div className="flex gap-2 justify-center">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Filter */}
      <motion.div 
        className="flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {difficulties.map((diff) => (
          <Button
            key={diff.value}
            variant={selectedDifficulty === diff.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty(diff.value)}
            className={`
              rounded-full transition-all duration-300
              ${selectedDifficulty === diff.value 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                : `${diff.color} border-0 hover:scale-105`
              }
            `}
          >
            <Filter className="h-3 w-3 mr-1" />
            {diff.label}
          </Button>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-primary font-bold">{filteredPuzzles.length}</span> لغز متاح
        {attemptedPuzzles.length > 0 && (
          <span className="mx-2">|</span>
        )}
        {attemptedPuzzles.length > 0 && (
          <span>
            <span className="text-emerald-400 font-bold">
              {attemptedPuzzles.filter(a => a.is_correct).length}
            </span> تم حلها
          </span>
        )}
      </motion.div>

      {/* Puzzles Grid */}
      {filteredPuzzles.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredPuzzles.map((puzzle, index) => {
            const { isAttempted, isCorrect } = getAttemptStatus(puzzle.id);
            return (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                isAttempted={isAttempted}
                isCorrect={isCorrect}
                onClick={() => handlePuzzleClick(puzzle.id)}
                index={index}
              />
            );
          })}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Brain className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">لا توجد ألغاز بهذا المستوى</p>
          <p className="text-sm text-muted-foreground mt-2">جرب مستوى صعوبة آخر</p>
        </motion.div>
      )}
    </div>
  );
};

export default AllPuzzlesGrid;
