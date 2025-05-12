
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Award, Trophy, CircleCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
              <div className="flex items-center">
                <Trophy className="h-3 w-3 text-yellow-400 ml-1" />
                <span>{user.score || 0} نقطة</span>
              </div>
              <div className="flex items-center">
                <CircleCheck className="h-3 w-3 text-green-400 ml-1" />
                <span>{user.solved_puzzles || 0} لغز</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-3 pb-3 bg-white/5">
        <Link to="/profile" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            الملف الشخصي
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default UserProfileCard;
