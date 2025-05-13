
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface UserChatProfileProps {
  user: any;
  profile: any;
}

interface SolvedPuzzle {
  id: string;
  puzzle_id: string;
  user_id: string;
  solved_at: string;
  subject: string;
  puzzle_title?: string;
  points?: number;
}

const UserChatProfile: React.FC<UserChatProfileProps> = ({ user, profile }) => {
  const [loading, setLoading] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<SolvedPuzzle[]>([]);
  const [joinDate, setJoinDate] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);
  
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // جلب عدد الرسائل
      const { count: messageCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('sender_id', user.id);
        
      if (!messagesError) {
        setMessagesCount(messageCount || 0);
      }
      
      // جلب الألغاز المحلولة
      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('user_solved_puzzles')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);
        
      if (!puzzlesError) {
        setSolvedPuzzles(puzzlesData || []);
      }
      
      // حساب تاريخ الانضمام
      if (user?.created_at) {
        const createdAt = new Date(user.created_at);
        setJoinDate(createdAt.toLocaleDateString('ar-SA'));
      } else if (profile?.created_at) {
        const createdAt = new Date(profile.created_at);
        setJoinDate(createdAt.toLocaleDateString('ar-SA'));
      }
    } catch (error) {
      console.error('خطأ في جلب إحصائيات المستخدم:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getLevel = (score: number) => {
    if (score < 100) return { level: 1, progress: score, nextLevel: 100 };
    if (score < 300) return { level: 2, progress: score - 100, nextLevel: 200 };
    if (score < 600) return { level: 3, progress: score - 300, nextLevel: 300 };
    if (score < 1000) return { level: 4, progress: score - 600, nextLevel: 400 };
    if (score < 1500) return { level: 5, progress: score - 1000, nextLevel: 500 };
    return { level: 6, progress: 100, nextLevel: 100 };
  };
  
  const userScore = profile?.score || 0;
  const levelInfo = getLevel(userScore);
  const progressPercentage = (levelInfo.progress / levelInfo.nextLevel) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-blue-950/50 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg">الملف الشخصي</CardTitle>
            <Badge variant="outline" className="bg-blue-900/50 border-blue-500/30 text-blue-300">
              المستوى {levelInfo.level}
            </Badge>
          </div>
          <CardDescription className="text-white/70">
            بيانات ومعلومات المستخدم
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-3 border-2 border-blue-500/30">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-xl">
                  {profile?.username?.[0] || user?.email?.[0] || 'م'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h3 className="text-white text-xl font-bold mb-1">
              {profile?.username || 'المستخدم'}
            </h3>
            
            <p className="text-white/50 text-sm">
              {user?.email || ''}
            </p>
            
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 border-none">
                النقاط: {userScore}
              </Badge>
              
              {joinDate && (
                <Badge variant="outline" className="bg-purple-900/20 border-purple-500/30 text-purple-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>الانضمام: {joinDate}</span>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">التقدم للمستوى التالي</span>
              <span className="text-blue-300">{levelInfo.progress}/{levelInfo.nextLevel}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-blue-950 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-800/30 text-center">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <h4 className="text-white font-medium text-sm">الرسائل</h4>
              <p className="text-2xl font-bold text-blue-300">
                {loading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : messagesCount}
              </p>
            </div>
            
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-800/30 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-purple-400" />
              <h4 className="text-white font-medium text-sm">الألغاز المحلولة</h4>
              <p className="text-2xl font-bold text-purple-300">
                {loading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : solvedPuzzles.length}
              </p>
            </div>
          </div>
          
          {solvedPuzzles.length > 0 && (
            <div>
              <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>آخر الإنجازات</span>
              </h3>
              <div className="space-y-2">
                {solvedPuzzles.slice(0, 3).map((puzzle: SolvedPuzzle, index) => (
                  <motion.div
                    key={puzzle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-blue-900/20 p-2 rounded-md border border-blue-800/30 text-sm flex justify-between"
                  >
                    <span className="text-white/90 truncate max-w-[70%]">{puzzle.puzzle_title || `لغز ${index + 1}`}</span>
                    <span className="text-blue-300">{puzzle.points || 0} نقطة</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserChatProfile;
