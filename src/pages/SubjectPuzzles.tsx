import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Settings, Star, Target, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AllPuzzlesGrid from '@/components/puzzles/AllPuzzlesGrid';
import LeaderboardPanel from '@/components/puzzles/LeaderboardPanel';
import { AdminPuzzlesManagementHub } from '@/components/admin/AdminPuzzlesManagementHub';

const ADMIN_EMAILS = ['jowmahmoud6@gmail.com', 'jali53207@gmail.com', 'jo789wmahmoud6@gmail.com'];
const GUEST_SOLVED_KEY = 'galaxy_guest_solved_puzzles';
const GUEST_SCORE_KEY = 'galaxy_guest_score';

const SubjectPuzzles = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [activeTab, setActiveTab] = useState('puzzles');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkUser();
  }, [refreshKey]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setIsAdmin(ADMIN_EMAILS.includes(user.email || ''));
        
        // Fetch profile score
        const { data: profile } = await supabase
          .from('profiles')
          .select('score')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUserScore(profile.score || 0);
        }

        // Fetch solved stats
        const { data: solved } = await supabase
          .from('user_solved_puzzles')
          .select('is_correct')
          .eq('user_id', user.id);

        if (solved && solved.length > 0) {
          setSolvedCount(solved.length);
          const correct = solved.filter(s => s.is_correct).length;
          setSuccessRate(Math.round((correct / solved.length) * 100));
        }
      } else {
        // Guest mode fallback
        try {
          const guestScore = parseInt(localStorage.getItem(GUEST_SCORE_KEY) || '0', 10);
          setUserScore(guestScore);
          const guestAttempts = JSON.parse(localStorage.getItem(GUEST_SOLVED_KEY) || '{}');
          const attemptList = Object.values(guestAttempts) as Array<{ is_correct: boolean }>;
          if (attemptList.length > 0) {
            setSolvedCount(attemptList.length);
            const correct = attemptList.filter(s => s.is_correct).length;
            setSuccessRate(Math.round((correct / attemptList.length) * 100));
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.error('Error fetching user puzzle statistics:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-16" dir="rtl">
      {/* Animated Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i} 
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{ left: `${(i * 8.3 + 5)}%`, top: `${(i * 11 + 7) % 90}%` }}
            animate={{ y: [0, -25, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: (i * 0.4) }}
          />
        ))}
        <motion.div 
          className="absolute top-16 right-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-16 left-16 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Header */}
        <motion.div 
          className="text-center mb-8 max-w-3xl mx-auto" 
          initial={{ opacity: 0, y: -25 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 shadow-inner">
            <Sparkles className="h-3.5 w-3.5" />
            <span>حلبة التحديات الأكاديمية والذكاء العلمي</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            الألغاز التعليمية التنافسية
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            ارتقِ بمرتبتك الأكاديمية عبر حل الألغاز الدقيقة في الفيزياء، الكيمياء، الأحياء، والرياضيات. فرصة واحدة لكل لغز مع نقاط سرعة إضافية!
          </p>

          {/* Gamified Stat Badges */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Score */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-primary/15 border border-amber-500/30 px-4 py-2 rounded-2xl shadow-sm">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">مجموع نقاطك</span>
                <span className="font-extrabold text-amber-400 text-base">{userScore}</span>
              </div>
            </div>

            {/* Solved Count */}
            <div className="flex items-center gap-2 bg-card/60 border border-border/60 px-4 py-2 rounded-2xl shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">الألغاز المكتملة</span>
                <span className="font-extrabold text-foreground text-base">{solvedCount}</span>
              </div>
            </div>

            {/* Accuracy Rate */}
            {solvedCount > 0 && (
              <div className="flex items-center gap-2 bg-card/60 border border-border/60 px-4 py-2 rounded-2xl shadow-sm">
                <Zap className="h-5 w-5 text-blue-400 fill-blue-400" />
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">نسبة الدقة</span>
                  <span className="font-extrabold text-blue-400 text-base">{successRate}%</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className={`grid w-full max-w-md ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} bg-card/60 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 h-auto`}>
              <TabsTrigger 
                value="puzzles" 
                className="gap-2 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-sm transition-all"
              >
                <Target className="h-4 w-4" />
                تحديات الألغاز
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="gap-2 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-sm transition-all"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                لوحة المتصدرين
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger 
                  value="admin" 
                  className="gap-2 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-sm transition-all"
                >
                  <Settings className="h-4 w-4" />
                  استوديو الإدارة (AI)
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Puzzles Catalog Tab */}
          <TabsContent value="puzzles" className="mt-6 outline-none">
            <AllPuzzlesGrid key={refreshKey} userId={userId} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6 outline-none">
            <div className="max-w-4xl mx-auto">
              <LeaderboardPanel currentUserId={userId} />
            </div>
          </TabsContent>

          {/* Admin Studio Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="mt-6 outline-none">
              <div className="max-w-6xl mx-auto">
                <AdminPuzzlesManagementHub />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SubjectPuzzles;
