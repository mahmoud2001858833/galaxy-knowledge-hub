
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Award, Trophy, CircleCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';

interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    score: number;
    solved_puzzles: number;
  } | null;
  isAdmin?: boolean;
}

const UserProfileCard = ({ user, isAdmin = false }: UserProfileCardProps) => {
  const [usageTime, setUsageTime] = useState(0);
  const [level, setLevel] = useState({ level: 0, progress: 0, nextLevel: 60 });
  const { toast } = useToast();
  
  // Calculate level based on usage time (minutes)
  useEffect(() => {
    if (user) {
      // Get usage time from localStorage or initialize it
      const storedTime = localStorage.getItem(`user_${user.id}_usage_time`) || "0";
      const initialTime = parseInt(storedTime, 10);
      setUsageTime(initialTime);
      
      // Calculate level - 1 level per 60 minutes (1 hour)
      const calculatedLevel = Math.floor(initialTime / 60);
      const remainingMinutes = initialTime % 60;
      
      setLevel({
        level: calculatedLevel,
        progress: remainingMinutes,
        nextLevel: 60
      });
      
      // Start tracking usage time
      const timer = setInterval(() => {
        setUsageTime(prevTime => {
          const newTime = prevTime + 1/60; // Add 1 second converted to minutes
          localStorage.setItem(`user_${user.id}_usage_time`, newTime.toString());
          
          // Update level calculation
          const newLevel = Math.floor(newTime / 60);
          const newRemaining = newTime % 60;
          
          setLevel({
            level: newLevel,
            progress: newRemaining,
            nextLevel: 60
          });
          
          return newTime;
        });
      }, 1000); // Update every second
      
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleProfileClick = () => {
    if (!user) {
      toast({
        title: "غير مسجل الدخول",
        description: "يرجى تسجيل الدخول لعرض الملف الشخصي",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <div className="mb-4 mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-white mb-3">غير مسجل الدخول</CardTitle>
          <CardDescription className="text-white/70 mb-6">
            يرجى تسجيل الدخول لعرض الملف الشخصي
          </CardDescription>
          <Link to="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700">تسجيل الدخول</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage for the progress bar
  const progressPercentage = (level.progress / level.nextLevel) * 100;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-right">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">الملف الشخصي</CardTitle>
          {isAdmin && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
              مشرف
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-blue-500/30">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback className="bg-blue-700/50">
                <User className="h-8 w-8 text-white/70" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
              <Award className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{user.username}</h3>
            
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center">
                  <Trophy className="h-3 w-3 text-yellow-400 ml-1" />
                  <span>{user.score || 0} نقطة</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-3 w-3 text-green-400 ml-1" />
                  <span>{user.solved_puzzles || 0} لغز</span>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-none">
                المستوى {level.level}
              </Badge>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">التقدم للمستوى التالي</span>
                  <span className="text-blue-300">{Math.round(level.progress)}/{level.nextLevel} دقيقة</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-1 bg-blue-950 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500" 
                />
                <div className="flex items-center text-xs text-white/50">
                  <Clock className="h-3 w-3 ml-1" />
                  <span>وقت الاستخدام: {Math.floor(usageTime / 60)} ساعة و {Math.round(usageTime % 60)} دقيقة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-3 pb-3 bg-white/5">
        <Link to="/profile" className="w-full" onClick={handleProfileClick}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            الملف الشخصي
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default UserProfileCard;
