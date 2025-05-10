
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star, StarHalf, CircleCheck } from 'lucide-react';
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
  
  useEffect(() => {
    fetchPuzzles();
  }, [subject, difficultyFilter]);

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

              {/* Display puzzles based on subject and difficulty */}
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
                      className="bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:bg-white/15 transition-colors"
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
                          <span className={`text-subject-${subject}-primary bg-subject-${subject}-primary/20 text-xs px-2 py-1 rounded-full`}>
                            {puzzle.points} نقطة
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/70 hover:text-white"
                          >
                            حل اللغز
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/70">
                  {difficultyFilter ? 
                    `لا توجد ألغاز من مستوى ${difficultyFilter} لمادة ${subject} حالياً` : 
                    `لا توجد ألغاز متاحة لمادة ${subject} حالياً`}
                </div>
              )}
            </div>

            {/* Admin Panel - only shown if admin is logged in */}
            {isAdmin && (
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

            {/* Admin Login Button - only shown if not admin */}
            {!isAdmin && (
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
