
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Award, User, CircleDot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './SubjectPuzzlesComponent';

interface LeaderboardSidebarProps {
  subject: string;
}

const LeaderboardSidebar = ({ subject }: LeaderboardSidebarProps) => {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [subject]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      // Fetch user profiles ordered by score
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setLeaderboard(data as UserProfile[]);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error("خطأ في تحميل قائمة المتصدرين");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectColor = () => {
    switch (subject) {
      case 'physics':
        return {
          primary: 'bg-subject-physics-primary',
          text: 'text-subject-physics-primary',
          glow: 'shadow-glow-purple'
        };
      case 'chemistry':
        return {
          primary: 'bg-subject-chemistry-primary',
          text: 'text-subject-chemistry-primary',
          glow: 'shadow-glow-blue'
        };
      case 'biology':
        return {
          primary: 'bg-subject-biology-primary',
          text: 'text-subject-biology-primary',
          glow: 'shadow-glow-green'
        };
      case 'mathematics':
        return {
          primary: 'bg-subject-mathematics-primary',
          text: 'text-subject-mathematics-primary',
          glow: 'shadow-glow-orange'
        };
      default:
        return {
          primary: 'bg-blue-600',
          text: 'text-blue-500',
          glow: 'shadow-glow-blue'
        };
    }
  };

  const colors = getSubjectColor();

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-400';
      case 1:
        return 'text-gray-400';
      case 2:
        return 'text-amber-600';
      default:
        return 'text-white/60';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:w-1/4"
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">المتصدرون</h3>
            <Award className={`h-6 w-6 ${colors.text}`} />
          </div>

          {isLoading ? (
            <div className="flex flex-col space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/10 h-16 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <ul className="space-y-2">
              {leaderboard.map((user, index) => (
                <motion.li
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center p-2 rounded-lg ${
                    index < 3 ? `${colors.primary}/20 border border-${colors.primary}/30` : 'bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getMedalColor(index)}`}>
                    {index + 1}
                  </div>
                  
                  <div className="relative mx-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-white/60" />
                      </div>
                    )}
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${colors.primary} flex items-center justify-center`}>
                        <CircleDot className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 mr-2">
                    <p className="font-medium text-white">{user.username}</p>
                    <div className="flex items-center text-xs text-white/70">
                      <span>{user.score} نقطة</span>
                      <span className="mx-1">•</span>
                      <span>{user.solved_puzzles || 0} لغز</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-white/70">
              لا يوجد متصدرون حاليًا
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeaderboardSidebar;
