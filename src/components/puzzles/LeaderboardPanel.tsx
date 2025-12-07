import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Users, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardUser {
  id: string;
  username: string;
  score: number;
  avatar_url: string | null;
  solved_puzzles: number;
}

interface LeaderboardPanelProps {
  currentUserId?: string;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalSolved: 0, highestScore: 0 });

  useEffect(() => {
    fetchLeaderboard();
    
    // Realtime subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, score, avatar_url, solved_puzzles')
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setLeaderboard(data);
        
        // Calculate stats
        const totalSolved = data.reduce((sum, u) => sum + (u.solved_puzzles || 0), 0);
        setStats({
          totalUsers: data.length,
          totalSolved,
          highestScore: data[0]?.score || 0
        });

        // Find current user rank
        if (currentUserId) {
          const rank = data.findIndex(u => u.id === currentUserId);
          setCurrentUserRank(rank >= 0 ? rank + 1 : null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold w-6 text-center">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default:
        return 'bg-card/50 border-border/50';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border/50">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <span>قائمة المتصدرين</span>
            </div>
            {currentUserRank && (
              <motion.div 
                className="flex items-center gap-2 text-sm bg-primary/20 px-3 py-1.5 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Star className="h-4 w-4 text-primary" />
                <span>ترتيبك: #{currentUserRank}</span>
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-2 justify-center">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">المشاركين: {stats.totalUsers}</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">الألغاز المحلولة: {stats.totalSolved}</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">أعلى نقاط: {stats.highestScore}</span>
          </div>
        </div>

        {/* Leaderboard List */}
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user.id === currentUserId;
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        flex items-center gap-4 p-3 rounded-xl border transition-all duration-300
                        ${getRankStyle(rank)}
                        ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        hover:scale-[1.02] hover:shadow-lg
                      `}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-foreground">
                          {user.username}
                          {isCurrentUser && <span className="text-primary mr-2">(أنت)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.solved_puzzles || 0} ألغاز محلولة
                        </p>
                      </div>

                      {/* Score */}
                      <div className="flex flex-col items-end">
                        <motion.span 
                          className="text-xl font-bold text-primary"
                          key={user.score}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                        >
                          {user.score || 0}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">نقطة</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا يوجد متسابقين بعد</p>
                  <p className="text-sm">كن أول من يحل الألغاز!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeaderboardPanel;
