
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Trophy, Clock, CheckCircle2, X } from 'lucide-react';
import { useUserSolvedPuzzles } from '@/hooks/useUserSolvedPuzzles';

type PuzzleType = {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  image?: string;
  subject: string;
};

const PuzzleDetails = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { solvedPuzzles, markAsSolved, checkIfSolved } = useUserSolvedPuzzles();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchPuzzle = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        const { data, error } = await supabase
          .from('subject_puzzles')
          .select('*')
          .eq('id', puzzleId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPuzzle(data as PuzzleType);
        }
      } catch (error) {
        console.error('Error fetching puzzle:', error);
        toast.error('حدث خطأ أثناء تحميل اللغز');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPuzzle();
  }, [puzzleId]);

  const handleCheckAnswer = async () => {
    if (!puzzle || !selectedOption) return;
    
    const isCorrect = selectedOption === puzzle.correct_answer;
    
    // Check if puzzle has already been solved
    if (checkIfSolved(puzzle.id)) {
      toast.info('لقد أجبت على هذا اللغز من قبل', {
        icon: <Clock className="h-5 w-5 text-blue-400" />
      });
      return;
    }
    
    if (isCorrect) {
      // Mark puzzle as solved
      await markAsSolved(puzzle.id, puzzle.subject);
      
      toast.success(`إجابة صحيحة! ${user ? `+${puzzle.points} نقطة` : ''}`, {
        icon: <CheckCircle2 className="h-5 w-5 text-green-400" />
      });
    } else {
      toast.error('إجابة خاطئة، حاول مرة أخرى', {
        icon: <X className="h-5 w-5 text-red-400" />
      });
    }
  };

  const getDifficultyProps = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { 
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          gradient: 'from-green-600 to-emerald-500',
          label: 'سهل'
        };
      case 'medium':
        return { 
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          gradient: 'from-yellow-600 to-amber-500',
          label: 'متوسط'
        };
      case 'hard':
        return { 
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          gradient: 'from-red-600 to-rose-500',
          label: 'صعب'
        };
      default:
        return { 
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          gradient: 'from-blue-600 to-indigo-500',
          label: 'غير محدد'
        };
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'physics':
        return 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-500/50';
      case 'chemistry':
        return 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 border-teal-500/50';
      case 'biology':
        return 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-emerald-500/50';
      case 'mathematics':
        return 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50';
      default:
        return 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-blue-500/50';
    }
  };
  
  const getSubjectTextColor = (subject: string) => {
    switch (subject) {
      case 'physics':
        return 'text-indigo-400';
      case 'chemistry':
        return 'text-teal-400';
      case 'biology':
        return 'text-emerald-400';
      case 'mathematics':
        return 'text-amber-400';
      default:
        return 'text-blue-400';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a20] via-[#1c1248] to-[#0c0a20] py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded-md w-32"></div>
            <div className="h-12 bg-white/10 rounded-md w-full"></div>
            <div className="space-y-4">
              <div className="h-40 bg-white/10 rounded-lg w-full"></div>
              <div className="h-8 bg-white/10 rounded-md w-3/4"></div>
              <div className="h-32 bg-white/10 rounded-md w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No puzzle found
  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a20] via-[#1c1248] to-[#0c0a20] py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Link to="/subject-puzzles">
            <Button 
              variant="outline" 
              className="mb-6 text-white bg-blue-950/50 border-cyan-500/30 hover:bg-blue-900/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة إلى الألغاز
            </Button>
          </Link>
          <div className="p-10 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-xl text-white mb-4">لم يتم العثور على هذا اللغز</h2>
            <p className="text-white/70">ربما تم حذفه أو تغيير معرّفه</p>
          </div>
        </div>
      </div>
    );
  }

  const difficultyProps = getDifficultyProps(puzzle.difficulty);

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gradient-to-br from-[#0c0a20] via-[#1c1248] to-[#0c0a20]">
      {/* Animated background from SubjectPuzzles.tsx */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a20] via-transparent to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="container px-4 py-10 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Link to="/subject-puzzles">
              <Button 
                variant="outline" 
                className="text-white bg-blue-950/50 border-cyan-500/30 hover:bg-blue-900/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                العودة إلى الألغاز
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full ${difficultyProps.bgColor} ${difficultyProps.color}`}>
                {difficultyProps.label}
              </div>
              
              <div className="px-3 py-1 rounded-full bg-white/10 flex items-center gap-1">
                <span className={getSubjectTextColor(puzzle.subject)}>{puzzle.points}</span>
                <Trophy className={`h-3.5 w-3.5 ${getSubjectTextColor(puzzle.subject)}`} />
              </div>
              
              {checkIfSolved(puzzle.id) && (
                <div className="px-3 py-1 rounded-full bg-green-900/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">تم الحل</span>
                </div>
              )}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl overflow-hidden border-2 ${getSubjectColor(puzzle.subject)} p-6 backdrop-blur-md`}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 text-right">
              {puzzle.title}
            </h1>
            
            {puzzle.image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={puzzle.image} 
                  alt={puzzle.title}
                  className="rounded-lg max-h-80 object-contain border border-white/10"
                />
              </div>
            )}
            
            <div className="mb-8">
              <p className="text-white text-lg text-right leading-relaxed">
                {puzzle.question}
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <h3 className="text-white text-lg font-medium text-right mb-2">الإجابات المحتملة:</h3>
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="space-y-3"
              >
                {puzzle.options.map((option, index) => (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all text-right ${
                      selectedOption === option
                        ? `bg-subject-${puzzle.subject}-primary/20 border-subject-${puzzle.subject}-primary/50 shadow`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <RadioGroupItem 
                      id={`option-${index}`} 
                      value={option} 
                      className={`text-subject-${puzzle.subject}-primary`} 
                    />
                    <span className="mr-3 text-white">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className={`w-full md:w-auto px-8 py-2 text-white bg-gradient-to-r from-subject-${puzzle.subject}-primary to-subject-${puzzle.subject}-secondary disabled:opacity-50`}
              >
                تحقق من الإجابة
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleDetails;
