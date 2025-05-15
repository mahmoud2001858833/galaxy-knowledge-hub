
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Trophy, Clock, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

interface SubjectPuzzlesListProps {
  subject: string;
  difficulty: string;
}

const SubjectPuzzlesList: React.FC<SubjectPuzzlesListProps> = ({ subject, difficulty }) => {
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [answeredPuzzles, setAnsweredPuzzles] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    fetchPuzzles();
    fetchUserData();
    
    // Check local storage for answered puzzles
    const storedAnsweredPuzzles = localStorage.getItem('answeredPuzzles');
    if (storedAnsweredPuzzles) {
      setAnsweredPuzzles(JSON.parse(storedAnsweredPuzzles));
    }
  }, [subject, difficulty]);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      
      // Fetch user score
      const { data: profileData } = await supabase
        .from('profiles')
        .select('score')
        .eq('id', session.user.id)
        .single();
        
      if (profileData) {
        setScore(profileData.score || 0);
      }
    }
  };

  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('subject_puzzles')
        .select('*')
        .eq('subject', subject);
      
      if (difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPuzzles(data as PuzzleType[]);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      toast.error('حدث خطأ أثناء تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePuzzleClick = (puzzle: PuzzleType) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption('');
    setShowDialog(true);
  };

  const handleCheckAnswer = async () => {
    if (!selectedPuzzle || !selectedOption) return;
    
    const isCorrect = selectedOption === selectedPuzzle.correct_answer;
    const puzzleId = selectedPuzzle.id;
    
    // Check if puzzle has already been answered
    if (answeredPuzzles.includes(puzzleId)) {
      toast.info('لقد أجبت على هذا اللغز من قبل', {
        icon: <Clock className="h-5 w-5 text-blue-400" />
      });
      return;
    }
    
    if (isCorrect) {
      // Add to answered puzzles
      const updatedAnsweredPuzzles = [...answeredPuzzles, puzzleId];
      setAnsweredPuzzles(updatedAnsweredPuzzles);
      localStorage.setItem('answeredPuzzles', JSON.stringify(updatedAnsweredPuzzles));
      
      // Update score if user is logged in
      if (user) {
        try {
          // Update using RPC function
          const { error } = await supabase.rpc('adjust_user_score', {
            user_id: user.id,
            points_adjustment: selectedPuzzle.points
          });
          
          if (!error) {
            setScore(prevScore => prevScore + selectedPuzzle.points);
          }
          
          // Update solved puzzles count
          await supabase
            .from('profiles')
            .update({
              solved_puzzles: (answeredPuzzles.length + 1)
            })
            .eq('id', user.id);
            
        } catch (error) {
          console.error('Error updating score:', error);
        }
      }
      
      toast.success(`إجابة صحيحة! ${user ? `+${selectedPuzzle.points} نقطة` : ''}`, {
        icon: <CheckCircle2 className="h-5 w-5 text-green-400" />
      });
      
      // Close dialog after a short delay
      setTimeout(() => {
        setShowDialog(false);
      }, 1500);
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
        return 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
      case 'chemistry':
        return 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/30';
      case 'biology':
        return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30';
      case 'mathematics':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30';
      default:
        return 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30';
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

  const subjectIcons = {
    physics: "⚛️",
    chemistry: "🧪",
    biology: "🧬",
    mathematics: "🧮"
  };

  return (
    <>
      {user && (
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 shadow-md">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-bold">{score}</span>
            <span className="text-white/80">نقطة</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden h-64">
              <div className="h-24">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : puzzles.length === 0 ? (
        <div className="text-center py-16">
          <Puzzle className="mx-auto h-12 w-12 text-white/30 mb-4" />
          <h3 className="text-xl font-medium text-white">لا توجد ألغاز بهذا المستوى</h3>
          <p className="text-white/60 mt-2">جرب مستوى آخر أو عد لاحقاً!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzles.map((puzzle) => {
            const difficultyProps = getDifficultyProps(puzzle.difficulty);
            const isAnswered = answeredPuzzles.includes(puzzle.id);
            
            return (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handlePuzzleClick(puzzle)}
              >
                <Card 
                  className={`cursor-pointer h-full overflow-hidden backdrop-blur-md border-2 ${getSubjectColor(subject)} hover:shadow-lg hover:border-white/30 transition-all duration-300 group`}
                >
                  {puzzle.image && (
                    <div className="h-40 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                      <img 
                        src={puzzle.image} 
                        alt={puzzle.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
                        <Badge className={`bg-gradient-to-r ${difficultyProps.gradient} text-white shadow`}>
                          {difficultyProps.label}
                        </Badge>
                      </div>
                      {isAnswered && (
                        <div className="absolute top-2 left-2 z-20">
                          <Badge className="bg-green-600 text-white shadow-md flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>تم الحل</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className={`p-5 ${!puzzle.image ? 'pt-2' : ''}`}>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <Badge variant="outline" className={`${getSubjectTextColor(subject)} border-none bg-white/5 flex items-center gap-1 px-3`}>
                        <span>{puzzle.points}</span>
                        <Trophy className="h-3 w-3" />
                      </Badge>
                      
                      {!puzzle.image && (
                        <div className="flex items-center gap-1">
                          <Badge className={`bg-gradient-to-r ${difficultyProps.gradient} text-white shadow`}>
                            {difficultyProps.label}
                          </Badge>
                          {isAnswered && (
                            <Badge className="bg-green-600 text-white shadow-md flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>تم الحل</span>
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white text-right mb-2 line-clamp-1">
                      {puzzle.title}
                    </h3>
                    
                    <p className="text-white/70 text-right line-clamp-2 mb-4 text-sm">
                      {puzzle.question}
                    </p>
                    
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        className={`text-white rounded-full px-4 bg-gradient-to-r from-subject-${subject}-primary to-subject-${subject}-secondary hover:opacity-90 group-hover:scale-105 transition-all`}
                      >
                        <span>حل اللغز</span>
                        <ArrowLeft className="h-4 w-4 ms-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-950/95 backdrop-blur-xl border-white/10 sm:max-w-xl text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-right flex justify-between items-center">
              <div className={`p-2 rounded-full ${getDifficultyProps(selectedPuzzle?.difficulty || 'easy').bgColor}`}>
                <span className="text-lg">
                  {selectedPuzzle?.subject && subjectIcons[selectedPuzzle.subject as keyof typeof subjectIcons]}
                </span>
              </div>
              <div>{selectedPuzzle?.title}</div>
            </DialogTitle>
            
            <div className="flex items-center justify-between mt-2">
              <Badge 
                variant="outline" 
                className={`${getSubjectTextColor(selectedPuzzle?.subject || '')} border-0 bg-white/5 flex items-center gap-1 px-3`}
              >
                <span>{selectedPuzzle?.points || 0}</span>
                <Trophy className="h-3 w-3" />
              </Badge>
              
              <Badge className={`${getDifficultyProps(selectedPuzzle?.difficulty || 'easy').bgColor} ${getDifficultyProps(selectedPuzzle?.difficulty || 'easy').color}`}>
                {getDifficultyProps(selectedPuzzle?.difficulty || 'easy').label}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="py-2">
            <p className="text-white text-lg mb-4">
              {selectedPuzzle?.question}
            </p>
            
            {selectedPuzzle?.image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={selectedPuzzle.image} 
                  alt={selectedPuzzle.title}
                  className="rounded-lg max-h-60 object-contain border border-white/10"
                />
              </div>
            )}
            
            <RadioGroup 
              value={selectedOption} 
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {selectedPuzzle?.options.map((option, index) => (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedOption === option
                      ? `bg-subject-${selectedPuzzle.subject}-primary/20 border-subject-${selectedPuzzle.subject}-primary/50 shadow`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <RadioGroupItem 
                    id={`option-${index}`} 
                    value={option} 
                    className={`text-subject-${selectedPuzzle.subject}-primary`} 
                  />
                  <span className="ms-3 text-white">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button"
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className={`w-full text-white bg-gradient-to-r from-subject-${selectedPuzzle?.subject || 'physics'}-primary to-subject-${selectedPuzzle?.subject || 'physics'}-secondary disabled:opacity-50`}
            >
              تحقق من الإجابة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubjectPuzzlesList;
