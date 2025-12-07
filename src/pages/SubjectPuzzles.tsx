import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Settings, Star, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllPuzzlesGrid from '@/components/puzzles/AllPuzzlesGrid';
import LeaderboardPanel from '@/components/puzzles/LeaderboardPanel';
import AdminPuzzlePanel from '@/components/puzzles/AdminPuzzlePanel';

const ADMIN_EMAILS = ['jowmahmoud6@gmail.com', 'jali53207@gmail.com', 'jo789wmahmoud6@gmail.com'];

const SubjectPuzzles = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [activeTab, setActiveTab] = useState('puzzles');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      setIsAdmin(ADMIN_EMAILS.includes(user.email || ''));
      const { data: profile } = await supabase.from('profiles').select('score').eq('id', user.id).single();
      if (profile) setUserScore(profile.score || 0);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        {[...Array(15)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div 
            className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4" 
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Brain className="h-12 w-12 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            الألغاز التعليمية
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختبر معلوماتك وتنافس مع الآخرين! لديك فرصة واحدة فقط لكل سؤال
          </p>
          {userId && (
            <motion.div 
              className="flex items-center justify-center gap-4 mt-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="font-bold text-primary">{userScore}</span>
                <span className="text-muted-foreground text-sm">نقطة</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full max-w-md mx-auto ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} bg-card/50 backdrop-blur-sm`}>
            <TabsTrigger value="puzzles" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="h-4 w-4" />
              الألغاز
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="h-4 w-4" />
              المتصدرين
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4" />
                الإدارة
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="puzzles" className="mt-6">
            <AllPuzzlesGrid key={refreshKey} userId={userId} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <LeaderboardPanel currentUserId={userId} />
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <AdminPuzzlePanel onPuzzleChange={() => setRefreshKey(k => k + 1)} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SubjectPuzzles;
