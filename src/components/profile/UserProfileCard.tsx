
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Award, Trophy, CircleCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    score: number;
    solved_puzzles: number;
    usage_time?: number;
  } | null;
  isAdmin?: boolean;
}

const UserProfileCard = ({ user, isAdmin = false }: UserProfileCardProps) => {
  const [usageTime, setUsageTime] = useState(0);
  const [level, setLevel] = useState({ level: 0, progress: 0, nextLevel: 30, title: 'مبتدئ' });
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  
  // Calculate level based on usage time (minutes)
  const calculateLevel = (time: number) => {
    if (time < 30) return { level: 0, progress: time, nextLevel: 30, title: 'مبتدئ' };
    if (time < 60) return { level: 1, progress: time - 30, nextLevel: 30, title: 'متعلم' };
    if (time < 120) return { level: 2, progress: time - 60, nextLevel: 60, title: 'نشط' };
    if (time < 240) return { level: 3, progress: time - 120, nextLevel: 120, title: 'متقدم' };
    if (time < 480) return { level: 4, progress: time - 240, nextLevel: 240, title: 'خبير' };
    return { level: 5, progress: 100, nextLevel: 100, title: 'أسطورة' };
  };
  
  useEffect(() => {
    if (user) {
      // Initialize with user's stored usage time or 0
      const initialTime = user.usage_time || 0;
      setUsageTime(initialTime);
      setLevel(calculateLevel(initialTime));
      
      // Start tracking usage time
      const timer = setInterval(() => {
        setUsageTime(prevTime => {
          const newTime = prevTime + 1/60; // Add 1 second converted to minutes
          
          // Update level calculation
          setLevel(calculateLevel(newTime));
          
          // Update database every 5 minutes
          if (Math.floor(newTime) % 5 === 0 && Math.floor(newTime) !== Math.floor(prevTime)) {
            updateUsageTimeInDB(newTime);
          }
          
          return newTime;
        });
      }, 1000); // Update every second
      
      return () => clearInterval(timer);
    }
  }, [user]);

  const updateUsageTimeInDB = async (time: number) => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ usage_time: Math.floor(time) })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating usage time:', error);
    }
  };

  if (!user) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <div className="mb-4 mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-white mb-3">{t.profile.guest}</CardTitle>
          <CardDescription className="text-white/70 mb-6">
            {t.profile.guestDescription}
          </CardDescription>
          <Link to="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700">{t.nav.login}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage for the progress bar
  const progressPercentage = level.level > 0 ? (level.progress / level.nextLevel) * 100 : 0;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-right">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">{t.profile.title}</CardTitle>
          {isAdmin && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
              {t.profile.admin}
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
                  <span>{user.score || 0} {t.profile.score}</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-3 w-3 text-green-400 ml-1" />
                  <span>{user.solved_puzzles || 0} {t.profile.puzzles}</span>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-none">
                {t.profile.level} {level.level} - {level.title}
              </Badge>
              
              {level.level > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">{t.profile.progress}</span>
                    <span className="text-blue-300">{Math.round(level.progress)}/{level.nextLevel} {t.profile.minutes}</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-1 bg-blue-950 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500" 
                  />
                </div>
              )}
              
              <div className="flex items-center text-xs text-white/50">
                <Clock className="h-3 w-3 ml-1" />
                <span>{t.profile.usageTime}: {Math.floor(usageTime / 60)} {t.profile.hours} {Math.round(usageTime % 60)} {t.profile.minutes}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-3 pb-3 bg-white/5">
        <Link to="/profile" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            {t.profile.title}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default UserProfileCard;
