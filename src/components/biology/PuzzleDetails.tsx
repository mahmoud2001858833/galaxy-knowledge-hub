import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Puzzle } from './types/puzzleTypes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PuzzleDetailsProps {
  selectedPuzzle: Puzzle | null;
}

const PuzzleDetails: React.FC<PuzzleDetailsProps> = ({ selectedPuzzle }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasSolved, setHasSolved] = useState<boolean>(false);
  const [retryPenalty, setRetryPenalty] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if user has already solved this puzzle
  React.useEffect(() => {
    if (!selectedPuzzle) return;
    
    const checkSolvedStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_solved_puzzles')
          .select('*')
          .eq('user_id', user.id)
          .eq('puzzle_id', selectedPuzzle.id)
          .maybeSingle();
          
        if (!error && data) {
          setHasSolved(true);
          setRetryPenalty(true);
        }
      } catch (error) {
        console.error('Error checking solved status:', error);
      }
    };
    
    checkSolvedStatus();
  }, [selectedPuzzle]);

  const checkAnswer = async () => {
    if (!selectedPuzzle) return;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = selectedPuzzle.correct_answer || selectedPuzzle.answer || '';
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
    
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(isAnswerCorrect);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        if (isAnswerCorrect) {
          if (!hasSolved) {
            // User solved correctly for the first time
            // Save to solved puzzles and update score
            const puzzlePoints = selectedPuzzle.points || 10;
            
            const { error: insertError } = await supabase
              .from('user_solved_puzzles')
              .insert({
                user_id: user.id,
                puzzle_id: selectedPuzzle.id,
                subject: selectedPuzzle.subject || 'biology'
              });
              
            if (insertError) throw insertError;
            
            // Update user score
            const { error: scoreError } = await supabase.rpc('adjust_user_score', {
              user_id: user.id,
              points_adjustment: puzzlePoints
            });
            
            if (scoreError) throw scoreError;
            
            // Update solved puzzles counter - Manual increment
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('solved_puzzles')
              .eq('id', user.id)
              .single();
              
            if (profileError) throw profileError;
            
            const currentSolvedCount = profileData?.solved_puzzles || 0;
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ solved_puzzles: currentSolvedCount + 1 })
              .eq('id', user.id);
              
            if (updateError) throw updateError;
            
            toast.success({
              title: "إجابة صحيحة! 🎉",
              description: `أحسنت! لقد حصلت على ${puzzlePoints} نقطة.`
            });
            
            setHasSolved(true);
          } else {
            toast.success({
              title: "إجابة صحيحة! 🎉",
              description: "لقد سبق لك حل هذا اللغز من قبل."
            });
          }
        } else {
          // Wrong answer
          if (retryPenalty) {
            // Apply penalty for retry
            const { error: penaltyError } = await supabase.rpc('adjust_user_score', {
              user_id: user.id,
              points_adjustment: -2 // خصم نقطتين للمحاولة الخاطئة
            });
            
            if (penaltyError) throw penaltyError;
            
            toast.error({
              title: "إجابة خاطئة",
              description: "تم خصم نقطتين لأنك قد حللت هذا اللغز من قبل."
            });
          } else {
            toast.error({
              title: "إجابة خاطئة",
              description: "حاول مرة أخرى أو استخدم التلميح للمساعدة."
            });
          }
        }
      } else {
        if (isAnswerCorrect) {
          toast.success({
            title: "إجابة صحيحة! 🎉",
            description: "أحسنت! قم بتسجيل الدخول للحصول على النقاط."
          });
        } else {
          toast.error({
            title: "إجابة خاطئة",
            description: "حاول مرة أخرى أو استخدم التلميح للمساعدة."
          });
        }
      }
    } catch (error) {
      console.error('Error updating puzzle status:', error);
      toast.error({
        title: "خطأ في النظام",
        description: "حدث خطأ في معالجة إجابتك. يرجى المحاولة مرة أخرى."
      });
    }
  };

  if (!selectedPuzzle) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/70">الرجاء اختيار لغز من القائمة</p>
      </div>
    );
  }

  // Get the puzzle description from either description or question field
  const puzzleDescription = selectedPuzzle.description || selectedPuzzle.question || '';

  return (
    <Card className="bg-white/5 border-subject-biology-primary/30">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-subject-biology-primary">
          {selectedPuzzle.title}
        </h3>
        
        <p className="text-white/90 mb-6">{puzzleDescription}</p>
        
        <div className="space-y-4">
          {hasSolved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 p-3 rounded-lg border border-green-500/30 flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-300">لقد سبق لك حل هذا اللغز</span>
            </motion.div>
          )}
          
          {retryPenalty && !hasSolved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300">ستفقد نقطتين إذا كانت إجابتك خاطئة</span>
            </motion.div>
          )}
          
          {selectedPuzzle.hint && (
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <h4 className="font-medium text-yellow-400 mb-1">تلميح:</h4>
              <p className="text-white/80">{selectedPuzzle.hint}</p>
            </div>
          )}
          
          <div>
            <div className="flex space-x-3 items-center">
              <Input
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setIsCorrect(null);
                }}
                placeholder="أدخل إجابتك هنا..."
                className="bg-white/5 border-subject-biology-primary/30 focus:border-subject-biology-primary"
              />
              <Button 
                onClick={checkAnswer}
                className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
              >
                تحقق
              </Button>
            </div>
            
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-2 rounded-md flex items-center ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5 text-green-400 ml-2" />
                    <span>إجابة صحيحة! أحسنت!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-400 ml-2" />
                    <span>إجابة خاطئة. حاول مرة أخرى!</span>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuzzleDetails;
