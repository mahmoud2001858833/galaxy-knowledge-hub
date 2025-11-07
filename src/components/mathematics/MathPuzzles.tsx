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
import { Trophy, FrownIcon, Clock } from 'lucide-react';

// Puzzle data structure
interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard' | string; // Allow any string but specify common values
  correct_answer: string;
  points: number;
  image?: string;
}

interface UserProfile {
  id: string;
  username: string;
  score: number;
  // This represents how we use solved_puzzles in the code
  solved_puzzles: string[]; 
}

// Interface reflecting the actual database schema
interface DBUserProfile {
  id: string;
  username: string;
  score: number | null;
  solved_puzzles: number | null; // In DB it's a number
  created_at: string;
}

const MathPuzzles: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [retryPenalty, setRetryPenalty] = useState<boolean>(false);
  
  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setSolvedPuzzles([]);
      }
    });
    
    fetchPuzzles();
    checkAdminStatus();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data) setIsAdmin(true);
  };
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Convert the database's number representation to a useful string array
        let puzzlesArray: string[] = [];
        
        // No need for type conversion - DB has only the count, not the actual IDs
        // We'll just keep an empty array and track solved puzzles on the client
        
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          score: data.score || 0,
          solved_puzzles: puzzlesArray
        };
        
        setUserProfile(profile);
        setSolvedPuzzles(puzzlesArray);
      } else {
        // Create a new profile if not exists - note how solved_puzzles is a number in DB
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: 'User',
            score: 0,
            solved_puzzles: 0 // Initialize as 0 (count) since DB expects number
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        if (newProfile) {
          const profile: UserProfile = {
            id: newProfile.id,
            username: newProfile.username,
            score: newProfile.score || 0,
            solved_puzzles: [] // Start with empty array in app
          };
          
          setUserProfile(profile);
          setSolvedPuzzles([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fix the type issue by explicitly mapping the database response to the Puzzle type
      const typedPuzzles: Puzzle[] = data?.map(item => ({
        ...item,
        difficulty: item.difficulty as 'easy' | 'medium' | 'hard' | string // Type assertion
      })) || [];
      
      setPuzzles(typedPuzzles);
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast.error('حدث خطأ أثناء تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const filteredPuzzles = selectedDifficulty === 'all'
    ? puzzles
    : puzzles.filter(puzzle => puzzle.difficulty === selectedDifficulty);
  
  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption(null);
    setRetryPenalty(solvedPuzzles.includes(puzzle.id));
  };
  
  const handleSubmitAnswer = async () => {
    if (!selectedPuzzle || !selectedOption || !user) {
      if (!user) {
        toast.error('يرجى تسجيل الدخول أولاً لحفظ تقدمك');
      }
      return;
    }
    
    const isCorrect = selectedOption === selectedPuzzle.correct_answer;
    const puzzleAlreadySolved = solvedPuzzles.includes(selectedPuzzle.id);
    let pointsAdjustment = 0;
    
    if (isCorrect) {
      if (!puzzleAlreadySolved) {
        // First time solving this puzzle
        pointsAdjustment = selectedPuzzle.points;
        
        // Update solved puzzles list (locally only)
        const updatedSolvedPuzzles = [...solvedPuzzles, selectedPuzzle.id];
        setSolvedPuzzles(updatedSolvedPuzzles);
        
        toast.success(`إجابة صحيحة! تم إضافة ${selectedPuzzle.points} نقاط إلى حسابك.`, {
          icon: <Trophy className="text-yellow-300" />
        });
        
        try {
          // Update user profile in database
          if (user) {
            // Update points
            const { error } = await supabase.rpc('adjust_user_score', {
              user_id: user.id,
              points_adjustment: pointsAdjustment
            });
            
            if (error) throw error;
            
            // Update solved puzzles counter (just increment the number)
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                solved_puzzles: (userProfile?.solved_puzzles.length || 0) + 1 
              })
              .eq('id', user.id);
              
            if (updateError) throw updateError;
            
            // Update local user profile
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                score: (userProfile.score || 0) + pointsAdjustment,
                solved_puzzles: updatedSolvedPuzzles
              });
            }
          }
        } catch (error: any) {
          console.error('Error updating score:', error);
        }
      } else {
        // Already solved before
        toast.success('إجابة صحيحة! لقد قمت بحل هذا اللغز من قبل.', {
          icon: <Clock className="text-blue-300" />
        });
      }
    } else {
      // Incorrect answer
      if (retryPenalty && user) {
        // Apply penalty for retry
        pointsAdjustment = -5;
        
        toast.error('إجابة خاطئة! تم خصم 5 نقاط لإعادة المحاولة.', {
          icon: <FrownIcon className="text-red-300" />
        });
        
        try {
          // Update points in database
          const { error } = await supabase.rpc('adjust_user_score', {
            user_id: user.id,
            points_adjustment: pointsAdjustment
          });
          
          if (error) throw error;
          
          // Update local user profile
          if (userProfile) {
            setUserProfile({
              ...userProfile,
              score: Math.max(0, (userProfile.score || 0) + pointsAdjustment)
            });
          }
        } catch (error: any) {
          console.error('Error updating score:', error);
        }
      } else {
        toast.error('إجابة خاطئة. حاول مرة أخرى.', {
          icon: <FrownIcon className="text-red-300" />
        });
      }
    }
    
    // Reset selection after a short delay
    if (isCorrect) {
      setTimeout(() => {
        setSelectedPuzzle(null);
        setSelectedOption(null);
      }, 2000);
    }
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
        <div className="flex flex-col items-end">
          <h2 className="text-2xl font-bold text-white">ألغاز رياضية</h2>
          {userProfile && (
            <div className="flex items-center gap-2 text-space-neon-blue">
              <span className="font-bold">{userProfile.score || 0}</span>
              <span>النقاط:</span>
              <Trophy className="h-4 w-4" />
            </div>
          )}
        </div>
        
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
          
          {isAdmin && <MathPuzzleAdmin />}
        </div>
      </div>
      
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
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-space-neon-blue text-xs px-2 py-1 rounded-full bg-space-neon-blue/10">
                    {selectedPuzzle.points} نقطة
                  </span>
                  {solvedPuzzles.includes(selectedPuzzle.id) && (
                    <span className="text-green-300 text-xs px-2 py-1 rounded-full bg-green-900/30 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      تم الحل
                    </span>
                  )}
                  {retryPenalty && (
                    <span className="text-red-300 text-xs px-2 py-1 rounded-full bg-red-900/30">
                      -5 للمحاولة الخاطئة
                    </span>
                  )}
                </div>
                
                <div className={`text-right ${selectedPuzzle.difficulty === 'easy' 
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
              className={`bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer border border-white/10 hover:border-white/30 ${
                solvedPuzzles.includes(puzzle.id) ? 'border-green-500/30' : ''
              }`}
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
                  <div className="flex items-center gap-2">
                    {solvedPuzzles.includes(puzzle.id) && (
                      <span className="text-green-300 text-xs px-2 py-1 rounded-full bg-green-900/30 flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        تم الحل
                      </span>
                    )}
                    <span className="text-space-neon-blue text-sm">اضغط للحل &larr;</span>
                  </div>
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
      
      {!user && (
        <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg text-right">
          <p className="text-yellow-300">
            قم بتسجيل الدخول للاحتفاظ بتقدمك والنقاط التي تحصل عليها!
          </p>
        </div>
      )}
    </div>
  );
};

export default MathPuzzles;
