
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SubjectPuzzleDeleteModal from './SubjectPuzzleDeleteModal';
import { motion } from 'framer-motion';
import { Puzzle } from '@/components/shared/types/puzzleTypes';
import { BookOpen, Book, BookX, Trophy, CheckCircle, PuzzleIcon } from 'lucide-react';

interface SubjectPuzzlesListProps {
  subject: string;
  difficulty?: string;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const SubjectPuzzlesList = ({ subject, difficulty = "all", onRefresh, refreshTrigger }: SubjectPuzzlesListProps) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState<Puzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchSolvedPuzzles(session.user.id);
      }
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchSolvedPuzzles(session.user.id);
      } else {
        setSolvedPuzzles([]);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSolvedPuzzles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_solved_puzzles')
        .select('puzzle_id')
        .eq('user_id', userId)
        .eq('subject', subject);

      if (error) throw error;
      
      const solvedIds = data?.map(item => item.puzzle_id) || [];
      setSolvedPuzzles(solvedIds);
    } catch (error) {
      console.error('Error fetching solved puzzles:', error);
    }
  };

  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subject_puzzles')
        .select('*')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const typedPuzzles: Puzzle[] = data.map(item => ({
          id: item.id,
          title: item.title,
          question: item.question,
          difficulty: item.difficulty,
          points: item.points,
          created_at: item.created_at,
          subject: item.subject,
          image: item.image || '',
          options: item.options || [],
          correct_answer: item.correct_answer || ""
        }));
        
        setPuzzles(typedPuzzles);
      } else {
        setPuzzles([]);
      }
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast.error('فشل في تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [subject, refreshTrigger]);

  useEffect(() => {
    if (difficulty === 'all') {
      setFilteredPuzzles(puzzles);
    } else {
      setFilteredPuzzles(puzzles.filter(puzzle => puzzle.difficulty === difficulty));
    }
  }, [puzzles, difficulty]);

  useEffect(() => {
    const channel = supabase
      .channel('subject_puzzles_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'subject_puzzles',
          filter: `subject=eq.${subject}`
        }, 
        () => {
          console.log('New puzzle detected, refreshing list');
          fetchPuzzles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subject]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption(null);
  };

  const handleDeleteSuccess = () => {
    fetchPuzzles();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedPuzzle || !selectedOption || !user) {
      if (!user) {
        toast.error('يرجى تسجيل الدخول أولاً');
      }
      return;
    }

    const isCorrect = selectedOption === selectedPuzzle.correct_answer;
    const puzzleAlreadySolved = solvedPuzzles.includes(selectedPuzzle.id);

    if (isCorrect && !puzzleAlreadySolved) {
      // First time solving this puzzle
      const updatedSolvedPuzzles = [...solvedPuzzles, selectedPuzzle.id];
      setSolvedPuzzles(updatedSolvedPuzzles);
      
      toast.success(`إجابة صحيحة! لقد حللت اللغز بنجاح.`);
      
      try {
        // Record the solved puzzle
        const { error } = await supabase
          .from('user_solved_puzzles')
          .insert({
            user_id: user.id,
            puzzle_id: selectedPuzzle.id,
            subject: subject
          });
          
        if (error) throw error;
        
        // Update user's score
        const { error: scoreError } = await supabase.rpc('adjust_user_score', {
          user_id: user.id,
          points_adjustment: selectedPuzzle.points
        });
        
        if (scoreError) throw scoreError;
      } catch (error: any) {
        console.error('Error recording solved puzzle:', error);
      }
      
      // Close puzzle view after a short delay
      setTimeout(() => {
        setSelectedPuzzle(null);
      }, 2000);
    } else if (isCorrect && puzzleAlreadySolved) {
      toast.success('إجابة صحيحة! لقد قمت بحل هذا اللغز من قبل.');
      setTimeout(() => {
        setSelectedPuzzle(null);
      }, 1500);
    } else {
      toast.error('إجابة خاطئة. حاول مرة أخرى.');
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return "bg-green-900/30 text-green-400 border-green-500/30";
      case 'medium':
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30";
      case 'hard':
        return "bg-red-900/30 text-red-400 border-red-500/30";
      default:
        return "bg-blue-900/30 text-blue-400 border-blue-500/30";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  const getPuzzleIcon = (puzzleId: string) => {
    if (solvedPuzzles.includes(puzzleId)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <PuzzleIcon className="h-5 w-5 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-t-subject-physics-primary border-white/10 rounded-full"></div>
      </div>
    );
  }

  if (selectedPuzzle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedPuzzle(null)}
            className="text-white/70 hover:text-white -ml-3"
          >
            &larr; العودة
          </Button>
          <div className="flex flex-col items-end">
            <h2 className="text-2xl font-bold text-white">{selectedPuzzle.title}</h2>
            <div className={`px-3 py-1 rounded-full text-sm ${getDifficultyStyle(selectedPuzzle.difficulty)}`}>
              {getDifficultyLabel(selectedPuzzle.difficulty)}
            </div>
          </div>
        </div>

        {selectedPuzzle.image && (
          <div className="mb-6 flex justify-center">
            <img
              src={selectedPuzzle.image}
              alt={selectedPuzzle.title}
              className="max-h-72 rounded-lg object-contain"
            />
          </div>
        )}

        <div className="mb-6 text-white text-right text-lg">
          {selectedPuzzle.question}
        </div>

        <div className="space-y-3 mb-6">
          {selectedPuzzle.options.map((option) => (
            <div
              key={option}
              className={`p-4 rounded-lg border cursor-pointer transition-colors text-right ${
                selectedOption === option
                  ? `bg-subject-${subject}-primary/40 border-subject-${subject}-primary`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              {option}
            </div>
          ))}
        </div>

        <Button
          className={`bg-subject-${subject}-primary hover:bg-subject-${subject}-primary/80 w-full`}
          disabled={!selectedOption}
          onClick={handleSubmitAnswer}
        >
          {solvedPuzzles.includes(selectedPuzzle.id) ? 'إرسال الإجابة مرة أخرى' : 'إرسال الإجابة'}
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {filteredPuzzles.length === 0 ? (
        <div className="text-center py-12 text-white/70">
          لا توجد ألغاز بهذا المستوى حالياً
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPuzzles.map((puzzle) => (
            <motion.div
              key={puzzle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white/5 backdrop-blur-sm border hover:bg-white/10 transition-colors cursor-pointer rounded-lg overflow-hidden ${
                solvedPuzzles.includes(puzzle.id) ? 'border-green-500/30' : 'border-white/10'
              }`}
              onClick={() => handlePuzzleSelect(puzzle)}
            >
              {puzzle.image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={puzzle.image}
                    alt={puzzle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyStyle(puzzle.difficulty)}`}>
                    {getDifficultyLabel(puzzle.difficulty)}
                  </div>
                  <h3 className="font-bold text-white">{puzzle.title}</h3>
                </div>
                <p className="text-white/70 text-sm line-clamp-2 text-right mb-3">
                  {puzzle.question}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {getPuzzleIcon(puzzle.id)}
                    <span className="text-xs text-white/60">
                      {solvedPuzzles.includes(puzzle.id) ? 'تم حله' : 'غير محلول'}
                    </span>
                  </div>
                  <span className="text-xs bg-subject-physics-primary/20 text-subject-physics-primary px-2 py-1 rounded-full">
                    {puzzle.points} نقاط
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SubjectPuzzleDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        puzzleId={deleteId}
        onDelete={handleDeleteSuccess}
      />
    </div>
  );
};

export default SubjectPuzzlesList;
