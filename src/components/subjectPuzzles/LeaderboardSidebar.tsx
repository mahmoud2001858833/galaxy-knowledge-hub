import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Award, User, CircleDot, Trophy, Medal, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardSidebarProps {
  subject: string;
}

// Update UserProfile interface to match the actual profiles table structure
export interface UserProfile {
  id: string;
  username: string;
  score: number | null;
  solved_puzzles: number | null;
  created_at: string;
  // Add avatar_url as optional since it's from users_profiles, not profiles
  avatar_url?: string | null;
}

// Update SubjectLeaderboardItem to extend from UserProfile
interface SubjectLeaderboardItem extends UserProfile {
  subject_solved_count: number;
}

const LeaderboardSidebar = ({ subject }: LeaderboardSidebarProps) => {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'subject'>('global');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, [subject, leaderboardType]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      if (leaderboardType === 'global') {
        // Fetch global leaderboard across all subjects, sorted by score (highest first)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          // Map profiles to UserProfile and set avatar_url to null if not present
          const profilesWithAvatar = data.map(profile => ({
            ...profile,
            avatar_url: null // Default to null since profiles table doesn't have avatar_url
          })) as UserProfile[];
          
          setLeaderboard(profilesWithAvatar);
        }
      } else {
        // Fetch subject-specific leaderboard
        const { data: solvedData, error: solvedError } = await supabase
          .from('user_solved_puzzles')
          .select('user_id, puzzle_id')
          .eq('subject', subject);
            
        if (solvedError) {
          console.error('Error fetching subject leaderboard:', solvedError);
          setLeaderboard([]);
          return;
        }
        
        if (solvedData && solvedData.length > 0) {
          // Count occurrences manually since we can't use group
          const userCounts: Record<string, number> = {};
          
          solvedData.forEach(item => {
            if (!item || typeof item !== 'object') return;
            
            const userId = 'user_id' in item ? item.user_id : null;
            if (userId) {
              if (!userCounts[userId]) {
                userCounts[userId] = 0;
              }
              userCounts[userId]++;
            }
          });
          
          // Convert to array for sorting
          const countArray = Object.entries(userCounts).map(([userId, count]) => ({
            user_id: userId,
            count
          }));
          
          // Sort by count descending
          countArray.sort((a, b) => b.count - a.count);
          
          // Limit to 10
          const top10 = countArray.slice(0, 10);
          
          // Now get the profiles for these users
          if (top10.length > 0) {
            const userIds = top10.map(item => item.user_id);
            
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', userIds);
              
            if (profilesError) throw profilesError;
            
            if (profiles) {
              // Merge the profiles with the solved count and ensure avatar_url exists
              const leaderboardData = profiles.map(profile => {
                const countItem = top10.find(item => item.user_id === profile.id);
                return {
                  ...profile,
                  avatar_url: null, // Default to null since profiles table doesn't have avatar_url
                  subject_solved_count: countItem ? countItem.count : 0
                } as SubjectLeaderboardItem;
              });
              
              // Sort by subject-specific solved count
              leaderboardData.sort((a, b) => 
                (b.subject_solved_count || 0) - (a.subject_solved_count || 0)
              );
              
              setLeaderboard(leaderboardData);
            }
          } else {
            setLeaderboard([]);
          }
        } else {
          setLeaderboard([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "خطأ في تحميل قائمة المتصدرين",
        description: error.message,
        variant: "destructive"
      });
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
          glow: 'shadow-glow-purple',
          border: 'border-subject-physics-primary/30'
        };
      case 'chemistry':
        return {
          primary: 'bg-subject-chemistry-primary',
          text: 'text-subject-chemistry-primary',
          glow: 'shadow-glow-blue',
          border: 'border-subject-chemistry-primary/30'
        };
      case 'biology':
        return {
          primary: 'bg-subject-biology-primary',
          text: 'text-subject-biology-primary',
          glow: 'shadow-glow-green',
          border: 'border-subject-biology-primary/30'
        };
      case 'mathematics':
        return {
          primary: 'bg-subject-mathematics-primary',
          text: 'text-subject-mathematics-primary',
          glow: 'shadow-glow-orange',
          border: 'border-subject-mathematics-primary/30'
        };
      default:
        return {
          primary: 'bg-blue-600',
          text: 'text-blue-500',
          glow: 'shadow-glow-blue',
          border: 'border-blue-500/30'
        };
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-white/60" />;
    }
  };

  const colors = getSubjectColor();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:w-1/4"
    >
      <Card className={`bg-white/5 backdrop-blur-sm ${colors.border} sticky top-4`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">المتصدرون</h3>
            <Award className={`h-6 w-6 ${colors.text}`} />
          </div>
          
          <div className="mb-4">
            <Tabs 
              defaultValue="global" 
              value={leaderboardType} 
              onValueChange={(value) => setLeaderboardType(value as 'global' | 'subject')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="global" className={`data-[state=active]:${colors.primary}`}>
                  عام
                </TabsTrigger>
                <TabsTrigger value="subject" className={`data-[state=active]:${colors.primary}`}>
                  {subject === 'physics' ? 'الفيزياء' : 
                   subject === 'chemistry' ? 'الكيمياء' : 
                   subject === 'biology' ? 'الأحياء' : 
                   subject === 'mathematics' ? 'الرياضيات' : 'المادة'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex flex-col space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/10 h-16 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {leaderboard.map((user, index) => (
                <motion.li
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center p-3 rounded-lg ${
                    index < 3 ? `${colors.primary}/20 ${colors.border}` : 'bg-white/5'
                  }`}
                >
                  <div className="mr-2 flex items-center justify-center">
                    {getMedalIcon(index)}
                  </div>
                  
                  <div className="relative mx-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-white/10">
                        <User className="h-6 w-6 text-white/60" />
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${colors.primary} flex items-center justify-center`}>
                        <CircleDot className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 mr-2">
                    <p className="font-medium text-white">{user.username}</p>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      {leaderboardType === 'global' ? (
                        <>
                          <span>{user.score || 0} نقطة</span>
                          <span className="mx-1">•</span>
                          <span>{user.solved_puzzles || 0} لغز</span>
                        </>
                      ) : (
                        <span>
                          {(user as unknown as SubjectLeaderboardItem).subject_solved_count || 0} لغز في 
                          {subject === 'physics' ? ' الفيزياء' : 
                           subject === 'chemistry' ? ' الكيمياء' : 
                           subject === 'biology' ? ' الأحياء' : 
                           subject === 'mathematics' ? ' الرياضيات' : ' المادة'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-white/70">
              {leaderboardType === 'global' ? 
                'لا يوجد متصدرون حاليًا' : 
                `لا يوجد متصدرون في ${
                  subject === 'physics' ? 'الفيزياء' : 
                  subject === 'chemistry' ? 'الكيمياء' : 
                  subject === 'biology' ? 'الأحياء' : 
                  subject === 'mathematics' ? 'الرياضيات' : 'المادة'
                } حاليًا`
              }
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              سجل دخولك وحل الألغاز لتظهر في قائمة المتصدرين
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeaderboardSidebar;
