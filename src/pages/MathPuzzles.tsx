
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MathPuzzleAdmin from '@/components/mathematics/MathPuzzleAdmin';
import { motion } from 'framer-motion';

// Puzzle data structure
interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  correct_answer: string;
  points: number;
  image?: string;
}

const MathPuzzles: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    
    fetchPuzzles();
  }, []);
  
  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPuzzles(data || []);
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast.error('حدث خطأ أثناء تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdminAccess = () => {
    if (adminPassword === 'mahmoud') {
      setIsAdmin(true);
      setIsPasswordDialogOpen(false);
      toast.success('تم تسجيل الدخول بنجاح كمشرف');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };
  
  const filteredPuzzles = selectedDifficulty === 'all'
    ? puzzles
    : puzzles.filter(puzzle => puzzle.difficulty === selectedDifficulty);
  
  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption(null);
  };
  
  const handleSubmitAnswer = async () => {
    if (!selectedPuzzle || !selectedOption || !user) return;
    
    const isCorrect = selectedOption === selectedPuzzle.correct_answer;
    
    if (isCorrect) {
      toast.success(`إجابة صحيحة! تم إضافة ${selectedPuzzle.points} نقاط إلى حسابك.`);
      
      try {
        // Update user score in database
        if (user) {
          const { error } = await supabase.rpc('adjust_user_score', {
            user_id: user.id,
            points_adjustment: selectedPuzzle.points
          });
          
          if (error) throw error;
        }
      } catch (error: any) {
        console.error('Error updating score:', error);
      }
    } else {
      toast.error('إجابة خاطئة. حاول مرة أخرى.');
    }
    
    // Reset selection
    setTimeout(() => {
      setSelectedPuzzle(null);
      setSelectedOption(null);
    }, 2000);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="space-y-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-space-neon-blue"></div>
          <p className="text-white/70">جاري تحميل الألغاز...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white text-right">ألغاز رياضية</h2>
        
        <div className="flex items-center gap-4">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="الصعوبة" />
            </SelectTrigger>
            <SelectContent className="bg-space-cosmic-black border-white/20">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="easy">سهل</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">صعب</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin ? (
            <MathPuzzleAdmin />
          ) : (
            <Button 
              className="bg-space-neon-blue/10 hover:bg-space-neon-blue/20 text-space-neon-blue border border-space-neon-blue/30"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              المشرف
            </Button>
          )}
        </div>
      </div>
      
      {/* Admin Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-space-cosmic-black border-white/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-white">أدخل كلمة مرور المشرف</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="bg-white/10 border-white/20 text-white text-center"
            />
          </div>
          <Button 
            className="w-full bg-space-deep-purple hover:bg-space-deep-purple/80"
            onClick={handleAdminAccess}
          >
            تأكيد
          </Button>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedPuzzle ? (
          // Puzzle solving screen
          <div className="col-span-full bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="mb-6">
              <button 
                onClick={() => setSelectedPuzzle(null)}
                className="text-space-neon-blue hover:text-space-bright-blue mb-4 text-right"
              >
                &larr; العودة إلى الألغاز
              </button>
              <h3 className="text-xl font-bold text-white mb-1 text-right">
                {selectedPuzzle.title}
              </h3>
              
              <div className={`text-white/80 mb-6 text-right ${selectedPuzzle.difficulty === 'easy' 
                ? 'text-green-300' 
                : selectedPuzzle.difficulty === 'medium' 
                  ? 'text-yellow-300' 
                  : 'text-red-300'}`}
              >
                {selectedPuzzle.difficulty === 'easy' && 'سهل'}
                {selectedPuzzle.difficulty === 'medium' && 'متوسط'}
                {selectedPuzzle.difficulty === 'hard' && 'صعب'}
              </div>
            </div>
            
            {selectedPuzzle.image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={selectedPuzzle.image} 
                  alt={selectedPuzzle.title}
                  className="rounded-lg max-h-60 object-contain"
                />
              </div>
            )}
            
            <div className="mb-8 text-white text-right">
              {selectedPuzzle.question}
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedPuzzle.options.map((option) => (
                <div 
                  key={option} 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors text-right ${
                    selectedOption === option
                      ? 'bg-space-deep-purple/40 border-space-deep-purple'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            
            <Button 
              className="bg-space-neon-blue hover:bg-space-bright-blue text-white w-full"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
            >
              تأكيد الإجابة
            </Button>
          </div>
        ) : (
          // Puzzles list
          filteredPuzzles.map(puzzle => (
            <motion.div 
              key={puzzle.id}
              className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer border border-white/10 hover:border-white/30"
              onClick={() => handlePuzzleSelect(puzzle)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      puzzle.difficulty === 'easy' 
                        ? 'bg-green-900/50 text-green-300' 
                        : puzzle.difficulty === 'medium' 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    {puzzle.difficulty === 'easy' && 'سهل'}
                    {puzzle.difficulty === 'medium' && 'متوسط'}
                    {puzzle.difficulty === 'hard' && 'صعب'}
                  </span>
                  <h3 className="text-lg font-semibold text-white text-right">
                    {puzzle.title}
                  </h3>
                </div>
                
                <p className="text-white/70 text-sm line-clamp-2 text-right">
                  {puzzle.question}
                </p>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-space-neon-blue text-xs px-2 py-1 rounded-full bg-space-neon-blue/10">
                      {puzzle.points} نقطة
                    </span>
                  </div>
                  <span className="text-space-neon-blue text-sm">اضغط للحل &larr;</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {filteredPuzzles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">لا توجد ألغاز متاحة بهذا المستوى حالياً</p>
        </div>
      )}
    </div>
  );
};

export default MathPuzzles;
