import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star, StarHalf, CircleCheck, Trophy, FrownIcon, Clock } from 'lucide-react';
import SubjectPuzzleAdmin from './SubjectPuzzleAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PuzzleDifficultyLevel from './PuzzleDifficultyLevel';
import LeaderboardSidebar from './LeaderboardSidebar';

// Types
export type Puzzle = {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  subject: string;
  points: number;
  image?: string | null;
};

export type UserProfile = {
  id: string;
  username: string;
  avatar_url?: string;
  score: number;
  solved_puzzles: number;
};

const SubjectPuzzlesComponent = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState('physics');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [retryPenalty, setRetryPenalty] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      // Check for super admin
      if (currentUser?.email === 'jowmahmoud6@gmail.com') {
        setIsSuperAdmin(true);
      }
      
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      }
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      // Check for super admin
      if (currentUser?.email === 'jowmahmoud6@gmail.com') {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
      
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
        setSolvedPuzzles([]);
      }
    });
    
    fetchPuzzles();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [subject, difficultyFilter]);

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
        // We got a profile, use it
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          score: data.score || 0,
          solved_puzzles: data.solved_puzzles || 0
        };
        
        setUserProfile(profile);
        
        // Fetch the solved puzzles IDs for this user using custom query
        const { data: solvedData, error: solvedError } = await supabase
          .from('user_solved_puzzles')
          .select('puzzle_id')
          .eq('user_id', userId);
          
        if (solvedError) {
          console.error('Error fetching solved puzzles:', solvedError);
          return;
        }
        
        const solvedIds = solvedData?.map(item => item.puzzle_id) || [];
        setSolvedPuzzles(solvedIds);
        
      } else {
        // Create a new profile if not exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: 'User',
            score: 0,
            solved_puzzles: 0
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        if (newProfile) {
          const profile: UserProfile = {
            id: newProfile.id,
            username: newProfile.username,
            score: newProfile.score || 0,
            solved_puzzles: newProfile.solved_puzzles || 0
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
      let query = supabase
        .from('subject_puzzles')
        .select('*')
        .eq('subject', subject);
        
      if (difficultyFilter) {
        // Map Arabic difficulty levels to English database values
        const difficultyMap: {[key: string]: string} = {
          'سهل': 'easy',
          'متوسط': 'medium',
          'صعب': 'hard'
        };
        
        const dbDifficulty = difficultyMap[difficultyFilter] || difficultyFilter;
        query = query.eq('difficulty', dbDifficulty);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setPuzzles(data || []);
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast({
        title: "خطأ في تحميل الألغاز",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subject change
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    setDifficultyFilter(null); // Reset difficulty filter when changing subjects
    setSelectedPuzzle(null);
  };
  
  // Handle selecting a puzzle
  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption(null);
    setRetryPenalty(solvedPuzzles.includes(puzzle.id));
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!selectedPuzzle || !selectedOption || !user) {
      if (!user) {
        toast({
          title: "يرجى تسجيل الدخول أولاً",
          description: "لحفظ تقدمك والحصول على النقاط",
          variant: "destructive"
        });
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
        
        // Update solved puzzles list locally
        const updatedSolvedPuzzles = [...solvedPuzzles, selectedPuzzle.id];
        setSolvedPuzzles(updatedSolvedPuzzles);
        
        toast({
          title: "إجابة صحيحة!",
          description: `تم إضافة ${selectedPuzzle.points} نقاط إلى حسابك.`,
          variant: "default"
        });
        
        try {
          // Save that this user solved this puzzle using direct insert to the table
          const { error: insertError } = await supabase
            .from('user_solved_puzzles')
            .insert({
              user_id: user.id,
              puzzle_id: selectedPuzzle.id,
              subject: selectedPuzzle.subject
            });
          
          if (insertError) {
            console.error('Error saving solved puzzle:', insertError);
          }
          
          // Update user profile in database
          // Update points
          const { error } = await supabase.rpc('adjust_user_score', {
            user_id: user.id,
            points_adjustment: pointsAdjustment
          });
          
          if (error) throw error;
          
          // Update solved puzzles counter
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              solved_puzzles: (userProfile?.solved_puzzles || 0) + 1 
            })
            .eq('id', user.id);
            
          if (updateError) throw updateError;
          
          // Update local user profile
          if (userProfile) {
            setUserProfile({
              ...userProfile,
              score: (userProfile.score || 0) + pointsAdjustment,
              solved_puzzles: (userProfile.solved_puzzles || 0) + 1
            });
          }
        } catch (error: any) {
          console.error('Error updating score:', error);
        }
      } else {
        // Already solved before
        toast({
          title: "إجابة صحيحة!",
          description: "لقد قمت بحل هذا اللغز من قبل.",
          variant: "default"
        });
      }
    } else {
      // Incorrect answer
      if (retryPenalty && user) {
        // Apply penalty for retry
        pointsAdjustment = -5;
        
        toast({
          title: "إجابة خاطئة!",
          description: "تم خصم 5 نقاط لإعادة المحاولة.",
          variant: "destructive"
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
        toast({
          title: "إجابة خاطئة",
          description: "حاول مرة أخرى.",
          variant: "destructive"
        });
      }
    }
    
    // Reset selection after a short delay if correct
    if (isCorrect) {
      setTimeout(() => {
        setSelectedPuzzle(null);
        setSelectedOption(null);
      }, 2000);
    }
  };

  // Get the appropriate color scheme based on subject
  const getSubjectColor = () => {
    switch (subject) {
      case 'physics':
        return {
          primary: 'bg-subject-physics-primary',
          secondary: 'bg-subject-physics-secondary',
          border: 'border-subject-physics-primary',
          text: 'text-subject-physics-primary',
          glow: 'shadow-glow-purple'
        };
      case 'chemistry':
        return {
          primary: 'bg-subject-chemistry-primary',
          secondary: 'bg-subject-chemistry-secondary',
          border: 'border-subject-chemistry-primary',
          text: 'text-subject-chemistry-primary',
          glow: 'shadow-glow-blue'
        };
      case 'biology':
        return {
          primary: 'bg-subject-biology-primary',
          secondary: 'bg-subject-biology-secondary',
          border: 'border-subject-biology-primary',
          text: 'text-subject-biology-primary',
          glow: 'shadow-glow-green'
        };
      case 'mathematics':
        return {
          primary: 'bg-subject-mathematics-primary',
          secondary: 'bg-subject-mathematics-secondary',
          border: 'border-subject-mathematics-primary',
          text: 'text-subject-mathematics-primary',
          glow: 'shadow-glow-orange'
        };
      default:
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-700',
          border: 'border-blue-500',
          text: 'text-blue-500',
          glow: 'shadow-glow-blue'
        };
    }
  };

  // Handle admin password verification
  const verifyAdminPassword = async (password: string) => {
    try {
      // For demo, using a simple password check
      if (password === 'mahmoud') {
        setIsAdmin(true);
        toast({
          title: "تم تسجيل الدخول كمشرف بنجاح",
          description: "يمكنك الآن إضافة الألغاز وإدارتها",
        });
      } else {
        toast({
          title: "كلمة المرور غير صحيحة",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error verifying admin:', error);
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Map difficulty from English to Arabic
  const getArabicDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-4"
          >
            الألغاز العلمية
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/70 text-center max-w-2xl"
          >
            اختبر معرفتك العلمية من خلال مجموعة من الألغاز المتنوعة في مختلف المواد الدراسية
          </motion.p>
          
          {userProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full"
            >
              <div className="flex items-center gap-1 text-white">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span>النقاط: </span>
                <span className="font-bold text-yellow-400">{userProfile.score}</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <CircleCheck className="h-4 w-4 text-green-400" />
                <span>الألغاز المحلولة: </span>
                <span className="font-bold text-green-400">{userProfile.solved_puzzles}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main content with optional sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content area */}
          <div className={`flex-1 ${showLeaderboard ? 'lg:w-3/4' : 'w-full'}`}>
            {/* Subject Selector */}
            <Card className="mb-6 bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <Tabs
                  defaultValue="physics"
                  value={subject}
                  onValueChange={handleSubjectChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 mb-2">
                    <TabsTrigger value="physics" className="data-[state=active]:bg-subject-physics-primary">
                      الفيزياء
                    </TabsTrigger>
                    <TabsTrigger value="chemistry" className="data-[state=active]:bg-subject-chemistry-primary">
                      الكيمياء
                    </TabsTrigger>
                    <TabsTrigger value="mathematics" className="data-[state=active]:bg-subject-mathematics-primary">
                      الرياضيات
                    </TabsTrigger>
                    <TabsTrigger value="biology" className="data-[state=active]:bg-subject-biology-primary">
                      الأحياء
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Difficulty Level Selector */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">مستويات الصعوبة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PuzzleDifficultyLevel
                  subject={subject}
                  difficulty="سهل"
                  icon={<Star className="h-8 w-8" />}
                  isSelected={difficultyFilter === "سهل"}
                  onSelect={() => setDifficultyFilter(difficultyFilter === "سهل" ? null : "سهل")}
                />
                <PuzzleDifficultyLevel
                  subject={subject}
                  difficulty="متوسط"
                  icon={<StarHalf className="h-8 w-8" />}
                  isSelected={difficultyFilter === "متوسط"}
                  onSelect={() => setDifficultyFilter(difficultyFilter === "متوسط" ? null : "متوسط")}
                />
                <PuzzleDifficultyLevel
                  subject={subject}
                  difficulty="صعب"
                  icon={<Award className="h-8 w-8" />}
                  isSelected={difficultyFilter === "صعب"}
                  onSelect={() => setDifficultyFilter(difficultyFilter === "صعب" ? null : "صعب")}
                />
              </div>
            </div>

            {/* Puzzles Display Area */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {difficultyFilter ? `ألغاز ${subject} - مستوى ${difficultyFilter}` : `جميع ألغاز ${subject}`}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className={`${getSubjectColor().border} ${getSubjectColor().text}`}
                >
                  {showLeaderboard ? 'إخفاء المتصدرين' : 'عرض المتصدرين'}
                </Button>
              </div>

              {/* Display puzzles or selected puzzle for solving */}
              {selectedPuzzle ? (
                // Puzzle solving screen
                <div className="col-span-full bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="mb-6">
                    <button 
                      onClick={() => setSelectedPuzzle(null)}
                      className={`${getSubjectColor().text} hover:underline mb-4 text-right`}
                    >
                      &larr; العودة إلى الألغاز
                    </button>
                    <h3 className="text-xl font-bold text-white mb-1 text-right">
                      {selectedPuzzle.title}
                    </h3>
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <span className={`${getSubjectColor().text} text-xs px-2 py-1 rounded-full ${getSubjectColor().primary}/10`}>
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
                        {getArabicDifficulty(selectedPuzzle.difficulty)}
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
                            ? `bg-${getSubjectColor().primary}/40 ${getSubjectColor().border}`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedOption(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`${getSubjectColor().primary} hover:${getSubjectColor().primary}/80 text-white w-full`}
                    disabled={!selectedOption}
                    onClick={handleSubmitAnswer}
                  >
                    تأكيد الإجابة
                  </Button>
                </div>
              ) : (
                // Puzzles list
                <>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className={`h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-subject-${subject}-primary`}></div>
                    </div>
                  ) : puzzles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {puzzles.map((puzzle) => (
                        <motion.div 
                          key={puzzle.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`bg-white/10 border rounded-lg overflow-hidden hover:bg-white/15 transition-colors cursor-pointer ${
                            solvedPuzzles.includes(puzzle.id) ? 'border-green-500/30' : 'border-white/20'
                          }`}
                          onClick={() => handlePuzzleSelect(puzzle)}
                        >
                          {puzzle.image && (
                            <div className="h-40 overflow-hidden">
                              <img src={puzzle.image} alt={puzzle.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                puzzle.difficulty === 'easy' 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : puzzle.difficulty === 'medium' 
                                    ? 'bg-yellow-900/50 text-yellow-300' 
                                    : 'bg-red-900/50 text-red-300'
                              }`}>
                                {getArabicDifficulty(puzzle.difficulty)}
                              </span>
                              <h3 className="text-lg font-bold text-white text-right">{puzzle.title}</h3>
                            </div>
                            <p className="text-white/70 text-sm line-clamp-2 text-right mb-3">{puzzle.question}</p>
                            <div className="flex justify-between items-center">
                              <span className={`${getSubjectColor().text} ${getSubjectColor().primary}/20 text-xs px-2 py-1 rounded-full`}>
                                {puzzle.points} نقطة
                              </span>
                              {solvedPuzzles.includes(puzzle.id) ? (
                                <div className="flex items-center gap-1 text-green-400">
                                  <Trophy className="h-4 w-4" />
                                  <span>تم الحل</span>
                                </div>
                              ) : (
                                <span className={`${getSubjectColor().text} text-sm`}>حل اللغز &larr;</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/70">
                      {difficultyFilter ? 
                        `لا توجد ألغاز من مستوى ${difficultyFilter} لمادة ${subject} حالياً` : 
                        `لا توج�� ألغاز متاحة لمادة ${subject} حالياً`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Admin Panel - shown if admin is logged in or super admin */}
            {(isAdmin || isSuperAdmin) && (
              <SubjectPuzzleAdmin
                subject={subject}
                onSuccess={() => {
                  fetchPuzzles();
                  toast({
                    title: "تم تحديث الألغاز",
                    description: "تم تحديث قائمة الألغاز بنجاح"
                  });
                }}
              />
            )}

            {/* Admin Login Button - only shown if not admin and not super admin */}
            {!isAdmin && !isSuperAdmin && (
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    const password = prompt('أدخل كلمة مرور المشرف');
                    if (password) verifyAdminPassword(password);
                  }}
                  className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                >
                  تسجيل الدخول كمشرف
                </Button>
              </motion.div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          {showLeaderboard && (
            <LeaderboardSidebar subject={subject} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectPuzzlesComponent;
