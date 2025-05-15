import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { User, Medal, Trophy, CircleDot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardSidebarProps {
  subject: string;
}

// Update UserProfile interface to match both profiles and users_profiles tables
export interface UserProfile {
  id: string;
  username: string;
  score: number | null;
  solved_puzzles: number | null;
  created_at: string;
  avatar_url?: string | null;
}

// Update SubjectLeaderboardItem to extend from UserProfile
interface SubjectLeaderboardItem extends UserProfile {
  subject_solved_count: number;
}

const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({ subject }) => {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [subjectLeaderboard, setSubjectLeaderboard] = useState<SubjectLeaderboardItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overall');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Get color scheme based on subject
  const colors = {
    primary: subject === 'physics' ? 'bg-subject-physics-primary' : 
             subject === 'chemistry' ? 'bg-subject-chemistry-primary' : 
             subject === 'biology' ? 'bg-subject-biology-primary' : 
             'bg-subject-mathematics-primary',
    secondary: subject === 'physics' ? 'text-subject-physics-primary' : 
               subject === 'chemistry' ? 'text-subject-chemistry-primary' : 
               subject === 'biology' ? 'text-subject-biology-primary' : 
               'text-subject-mathematics-primary'
  };

  // Fetch overall leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      // Get top users by score
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      if (data) {
        // Fetch user avatar URLs from users_profiles if available
        const enhancedProfiles = await Promise.all(data.map(async (profile) => {
          try {
            const { data: userProfile } = await supabase
              .from('users_profiles')
              .select('avatar_url')
              .eq('id', profile.id)
              .single();
            
            return {
              ...profile,
              avatar_url: userProfile?.avatar_url || null
            };
          } catch (err) {
            return {
              ...profile,
              avatar_url: null
            };
          }
        }));
        
        // Make sure to sort by score again after fetching avatar URLs
        const sortedLeaderboard = enhancedProfiles.sort((a, b) => 
          (b.score || 0) - (a.score || 0)
        );
        
        setLeaderboard(sortedLeaderboard as UserProfile[]);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subject-specific leaderboard data
  const fetchSubjectLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      // First get users who solved puzzles in this subject
      const { data: solvedData, error: solvedError } = await supabase
        .from('user_solved_puzzles')
        .select('user_id, count')
        .eq('subject', subject)
        .order('count', { ascending: false })
        .limit(10);
      
      if (solvedError) throw solvedError;
      
      if (solvedData && solvedData.length > 0) {
        // Get user IDs who solved puzzles in this subject
        const userIds = solvedData.map(item => item.user_id);
        
        // Then get profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        if (profilesData) {
          // Combine profiles with subject-specific count
          const top10 = solvedData;
          
          // Fetch user avatar URLs and combine data
          const enhancedProfiles = await Promise.all(profilesData.map(async (profile) => {
            try {
              const { data: userProfile } = await supabase
                .from('users_profiles')
                .select('avatar_url')
                .eq('id', profile.id)
                .single();
              
              const countItem = top10.find(item => item.user_id === profile.id);
              return {
                ...profile,
                avatar_url: userProfile?.avatar_url || null,
                subject_solved_count: countItem ? parseInt(String(countItem.count)) : 0
              } as SubjectLeaderboardItem;
            } catch (err) {
              const countItem = top10.find(item => item.user_id === profile.id);
              return {
                ...profile,
                avatar_url: null,
                subject_solved_count: countItem ? parseInt(String(countItem.count)) : 0
              } as SubjectLeaderboardItem;
            }
          }));
          
          // Sort by subject-specific count
          const sortedLeaderboard = enhancedProfiles.sort((a, b) => 
            b.subject_solved_count - a.subject_solved_count
          );
          
          setSubjectLeaderboard(sortedLeaderboard);
        }
      } else {
        setSubjectLeaderboard([]);
      }
    } catch (error: any) {
      console.error('Error fetching subject leaderboard:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchSubjectLeaderboard();
    
    // Set up real-time subscription for leaderboard updates
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles' 
        }, 
        () => {
          fetchLeaderboard();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_solved_puzzles' 
        }, 
        () => {
          fetchSubjectLeaderboard();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [subject]);

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-1/3 mx-auto"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-white/10"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-4 text-center">قائمة المتصدرين</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger 
              value="overall" 
              className={`text-white data-[state=active]:${colors.primary}`}
            >
              الترتيب العام
            </TabsTrigger>
            <TabsTrigger 
              value="subject" 
              className={`text-white data-[state=active]:${colors.primary}`}
            >
              في {subject === 'physics' ? 'الفيزياء' : 
                  subject === 'chemistry' ? 'الكيمياء' : 
                  subject === 'biology' ? 'ال��حياء' : 
                  'الرياضيات'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="mt-0 space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <motion.div 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center space-x-2 space-x-reverse py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="text-white/80 text-lg font-medium ml-2 min-w-[20px] text-center">
                    {index + 1}
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
                  
                  <div className="flex-1">
                    <div className="font-medium text-white">{user.username}</div>
                    <div className="text-sm text-white/70">{user.solved_puzzles || 0} لغز محلول</div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className={`${colors.secondary} font-bold`}>{user.score || 0}</span>
                  </div>
                  
                  {index < 3 && (
                    <div className={`mr-2 ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      'text-amber-600'
                    }`}>
                      <Medal className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد بيانات متاحة حاليًا
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="subject" className="mt-0 space-y-2">
            {subjectLeaderboard.length > 0 ? (
              subjectLeaderboard.map((user, index) => (
                <motion.div 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center space-x-2 space-x-reverse py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="text-white/80 text-lg font-medium ml-2 min-w-[20px] text-center">
                    {index + 1}
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
                  
                  <div className="flex-1">
                    <div className="font-medium text-white">{user.username}</div>
                    <div className="flex items-center">
                      <span className="text-sm text-white/70">{user.subject_solved_count} لغز محلول</span>
                      <span className="mx-1 text-white/40">•</span>
                      <span className="text-sm text-white/50">{user.solved_puzzles || 0} إجمالي</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className={`${colors.secondary} font-bold`}>{user.score || 0}</span>
                  </div>
                  
                  {index < 3 && (
                    <div className={`mr-2 ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      'text-amber-600'
                    }`}>
                      <Medal className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد بيانات متاحة لهذا الموضوع
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSidebar;
