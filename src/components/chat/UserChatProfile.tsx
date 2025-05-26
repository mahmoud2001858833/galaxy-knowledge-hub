
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, MessageSquare, Clock, Loader2, Video, AlertCircle, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [error, setError] = useState<string | null>(null);
  const [messagesCount, setMessagesCount] = useState(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<SolvedPuzzle[]>([]);
  const [watchedVideosCount, setWatchedVideosCount] = useState(0);
  const [joinDate, setJoinDate] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);
  
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب عدد الرسائل
      const { count: messageCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('sender_id', user.id);
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessagesCount(messageCount || 0);
      }
      
      // جلب الألغاز المحلولة
      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('user_solved_puzzles')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);
        
      if (puzzlesError) {
        console.error('Error fetching puzzles:', puzzlesError);
      } else {
        setSolvedPuzzles(puzzlesData || []);
      }

      // جلب عدد الفيديوهات المشاهدة
      const { count: videosCount, error: videosError } = await supabase
        .from('watched_videos')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (videosError) {
        console.error('Error fetching videos:', videosError);
      } else {
        setWatchedVideosCount(videosCount || 0);
      }
      
      // حساب تاريخ الانضمام
      if (user?.created_at) {
        const createdAt = new Date(user.created_at);
        setJoinDate(createdAt.toLocaleDateString('ar-SA'));
      } else if (profile?.created_at) {
        const createdAt = new Date(profile.created_at);
        setJoinDate(createdAt.toLocaleDateString('ar-SA'));
      }
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات المستخدم:', error);
      setError('فشل في تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };
  
  const retryFetch = () => {
    fetchUserStats();
  };
  
  const calculateLevel = (usageTime: number) => {
    if (usageTime < 30) return { level: 0, progress: usageTime, nextLevel: 30, title: 'مبتدئ' };
    if (usageTime < 60) return { level: 1, progress: usageTime - 30, nextLevel: 30, title: 'متعلم' };
    if (usageTime < 120) return { level: 2, progress: usageTime - 60, nextLevel: 60, title: 'نشط' };
    if (usageTime < 240) return { level: 3, progress: usageTime - 120, nextLevel: 120, title: 'متقدم' };
    if (usageTime < 480) return { level: 4, progress: usageTime - 240, nextLevel: 240, title: 'خبير' };
    return { level: 5, progress: 100, nextLevel: 100, title: 'أسطورة' };
  };
  
  const userScore = profile?.score || 0;
  const usageTime = profile?.usage_time || 0;
  const levelInfo = calculateLevel(usageTime);
  const progressPercentage = levelInfo.level > 0 ? (levelInfo.progress / levelInfo.nextLevel) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="bg-gradient-to-br from-blue-950/50 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 shadow-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg">الملف الشخصي</CardTitle>
            <Badge variant="outline" className="bg-blue-900/50 border-blue-500/30 text-blue-300">
              المستوى {levelInfo.level} - {levelInfo.title}
            </Badge>
          </div>
          <CardDescription className="text-white/70">
            بيانات ومعلومات المستخدم
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100%-2rem)] pr-4">
            <div className="flex flex-col items-center text-center pb-4">
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
            
            {levelInfo.level > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">التقدم للمستوى التالي</span>
                  <span className="text-blue-300">{Math.round(levelInfo.progress)}/{levelInfo.nextLevel} دقيقة</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-blue-950 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500" />
              </div>
            )}
            
            {error ? (
              <div className="mb-4">
                <Alert className="bg-red-900/30 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    {error}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={retryFetch}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
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

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-800/30 text-center">
                    <Video className="h-5 w-5 mx-auto mb-1 text-green-400" />
                    <h4 className="text-white font-medium text-sm">الفيديوهات المشاهدة</h4>
                    <p className="text-2xl font-bold text-green-300">
                      {loading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : watchedVideosCount}
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
              </>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserChatProfile;
