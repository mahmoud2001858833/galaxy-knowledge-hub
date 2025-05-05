
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Puzzle } from './types/puzzleTypes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PuzzleDetailsProps {
  selectedPuzzle: Puzzle | null;
}

const PuzzleDetails: React.FC<PuzzleDetailsProps> = ({ selectedPuzzle }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkAnswer = () => {
    if (!selectedPuzzle) return;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = selectedPuzzle.answer.trim().toLowerCase();
    
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      toast({
        title: "إجابة صحيحة! 🎉",
        description: "أحسنت! لقد أجبت بشكل صحيح على اللغز.",
        variant: "default"
      });
    } else {
      toast({
        title: "إجابة خاطئة",
        description: "حاول مرة أخرى أو استخدم التلميح للمساعدة.",
        variant: "destructive"
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

  return (
    <Card className="bg-white/5 border-subject-biology-primary/30">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-subject-biology-primary">
          {selectedPuzzle.title}
        </h3>
        
        <p className="text-white/90 mb-6">{selectedPuzzle.description}</p>
        
        <div className="space-y-4">
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
