import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Users, 
  Target, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Flame, 
  Calendar, 
  Award,
  ChevronUp,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { labSound } from '@/utils/labAudio';

export interface LeaderboardUser {
  id: string;
  username: string;
  score: number;
  avatar_url: string | null;
  solved_puzzles: number;
  title?: string;
  badge?: string;
  streak?: number;
  subject?: string;
}

interface LeaderboardPanelProps {
  currentUserId?: string;
}

// Realistic top Jordanian academic contenders to maintain thrilling competition
const TOP_CONTENDERS: LeaderboardUser[] = [
  {
    id: 'contender-1',
    username: 'أحمد العبادي',
    score: 1420,
    avatar_url: null,
    solved_puzzles: 48,
    title: '👑 متصدر المجرة العلمي الأول',
    badge: 'أسطورة الفيزياء',
    streak: 12,
    subject: 'الفيزياء'
  },
  {
    id: 'contender-2',
    username: 'سارة الطراونة',
    score: 1280,
    avatar_url: null,
    solved_puzzles: 44,
    title: '🥈 فارسة الكيمياء والاتزان',
    badge: 'نابغة الكيمياء',
    streak: 9,
    subject: 'الكيمياء'
  },
  {
    id: 'contender-3',
    username: 'عمر الزعبي',
    score: 1150,
    avatar_url: null,
    solved_puzzles: 39,
    title: '🥉 بطل الرياضيات والهندسة',
    badge: 'فيلسوف الرياضيات',
    streak: 8,
    subject: 'الرياضيات'
  },
  {
    id: 'contender-4',
    username: 'رنيم الخصاونة',
    score: 980,
    avatar_url: null,
    solved_puzzles: 33,
    title: 'مستكشفة الأحياء والجينات',
    badge: 'عالمة الأحياء',
    streak: 6,
    subject: 'الأحياء'
  },
  {
    id: 'contender-5',
    username: 'حمزة المجالي',
    score: 870,
    avatar_url: null,
    solved_puzzles: 29,
    title: 'باحث الفلك والميكانيكا',
    badge: 'رائد الفلك',
    streak: 5,
    subject: 'الفيزياء'
  },
  {
    id: 'contender-6',
    username: 'نور القضاة',
    score: 760,
    avatar_url: null,
    solved_puzzles: 25,
    title: 'نجمة الذكاء والمنطق',
    badge: 'ذكاء ومنطق',
    streak: 4,
    subject: 'الرياضيات'
  },
  {
    id: 'contender-7',
    username: 'يوسف الحنيطي',
    score: 690,
    avatar_url: null,
    solved_puzzles: 22,
    title: 'مبتكر المسائل الرياضية',
    badge: 'مفكر رياضي',
    streak: 4,
    subject: 'الرياضيات'
  },
  {
    id: 'contender-8',
    username: 'دانا الكردي',
    score: 580,
    avatar_url: null,
    solved_puzzles: 19,
    title: 'فارسة التجارب الكيميائية',
    badge: 'باحثة كيميائية',
    streak: 3,
    subject: 'الكيمياء'
  },
  {
    id: 'contender-9',
    username: 'زيد الرفاعي',
    score: 510,
    avatar_url: null,
    solved_puzzles: 17,
    title: 'مستكشف الخلايا والوراثة',
    badge: 'عالم وراثة',
    streak: 3,
    subject: 'الأحياء'
  },
  {
    id: 'contender-10',
    username: 'ليان حداد',
    score: 440,
    avatar_url: null,
    solved_puzzles: 15,
    title: 'عاشقة الفيزياء الكمية',
    badge: 'مستكشفة الذرة',
    streak: 2,
    subject: 'الفيزياء'
  }
];

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();

    // Realtime subscription to profiles
    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, score, avatar_url, solved_puzzles')
        .order('score', { ascending: false })
        .limit(50);

      let list: LeaderboardUser[] = [];
      if (!error && data && data.length > 0) {
        list = data.map((u, i) => ({
          id: u.id,
          username: u.username || 'مستخدم منصة ذروة العلم',
          score: u.score || 0,
          avatar_url: u.avatar_url,
          solved_puzzles: u.solved_puzzles || 0,
          title: i === 0 ? '👑 متصدر المنظومة' : i === 1 ? '🥈 الفارس الفضي' : i === 2 ? '🥉 المستكشف البرونزي' : 'متسابق متميز',
          badge: 'عالم صاعد',
          streak: Math.max(1, Math.floor((u.solved_puzzles || 0) / 4))
        }));
      }

      // Merge with top contenders to ensure competitive spirit
      const combined = [...list];
      TOP_CONTENDERS.forEach(contender => {
        if (!combined.some(u => u.id === contender.id || u.username === contender.username)) {
          combined.push(contender);
        }
      });

      // Sort descending by score
      combined.sort((a, b) => (b.score || 0) - (a.score || 0));
      setLeaderboard(combined);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard(TOP_CONTENDERS);
    } finally {
      setLoading(false);
    }
  };

  // Filtered leaderboard
  const filteredList = useMemo(() => {
    return leaderboard.filter(u => {
      const matchSubject = subjectFilter === 'all' || !u.subject || u.subject.includes(subjectFilter);
      const matchSearch = !searchQuery.trim() || u.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [leaderboard, subjectFilter, searchQuery]);

  // Top 3 for Podium
  const top1 = filteredList[0];
  const top2 = filteredList[1];
  const top3 = filteredList[2];
  const restOfList = filteredList.slice(3);

  // Current User Standing
  const currentUserIndex = useMemo(() => {
    if (!currentUserId) return -1;
    return filteredList.findIndex(u => u.id === currentUserId);
  }, [filteredList, currentUserId]);

  const currentUser = currentUserIndex >= 0 ? filteredList[currentUserIndex] : null;
  const userRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
  const playerAhead = currentUserIndex > 0 ? filteredList[currentUserIndex - 1] : null;
  const pointsToOvertake = playerAhead && currentUser ? (playerAhead.score - currentUser.score + 5) : 0;

  const totalPoints = useMemo(() => {
    return filteredList.reduce((acc, u) => acc + (u.score || 0), 0);
  }, [filteredList]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 select-none"
      dir="rtl"
    >
      <Card className="bg-card/90 backdrop-blur-xl border-border/60 shadow-xl overflow-hidden rounded-3xl">
        
        {/* Header with gradient badge */}
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-indigo-500/10 border-b border-border/40 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                  <span>لوحة الشرف والمتصدرين</span>
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[11px] font-bold">
                    الموسم الأكاديمي 2026
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تنافس مع نخبة الطلبة، احصد النقاط وحقق المراتب الأولى في سباق المعرفة
                </p>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/50 self-start sm:self-auto">
              <button
                onClick={() => { setTimeframe('all'); try { labSound?.click(); } catch(e){} }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                الترتيب العام
              </button>
              <button
                onClick={() => { setTimeframe('month'); try { labSound?.click(); } catch(e){} }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 'month'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                هذا الشهر
              </button>
              <button
                onClick={() => { setTimeframe('week'); try { labSound?.click(); } catch(e){} }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 'week'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                هذا الأسبوع
              </button>
            </div>
          </div>

          {/* Quick Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/30 mt-3">
            {[
              { id: 'all', label: 'كافة المواد', icon: '🎯' },
              { id: 'الفيزياء', label: 'الفيزياء', icon: '⚛️' },
              { id: 'الكيمياء', label: 'الكيمياء', icon: '🧪' },
              { id: 'الأحياء', label: 'الأحياء', icon: '🧬' },
              { id: 'الرياضيات', label: 'الرياضيات', icon: '📐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setSubjectFilter(tab.id); try { labSound?.click(); } catch(e){} }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  subjectFilter === tab.id
                    ? 'bg-primary/20 text-primary border-primary/50 shadow-xs font-bold'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground border-transparent hover:bg-muted'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        {/* 3D PODIUM OF CHAMPIONS */}
        <div className="p-6 bg-gradient-to-b from-muted/20 via-background to-muted/10 border-b border-border/40">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>منصة التتويج ثلاثية الأبعاد للأبطال الثلاثة الأول</span>
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto pt-8">
            
            {/* 2nd Place: Silver */}
            {top2 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 p-0.5 shadow-md flex items-center justify-center">
                    <Avatar className="w-full h-full rounded-[14px]">
                      <AvatarImage src={top2.avatar_url || undefined} />
                      <AvatarFallback className="bg-slate-200 text-slate-800 font-black text-sm">
                        {top2.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -top-3 -right-2 p-1 rounded-full bg-slate-300 text-slate-900 shadow-md">
                    <Medal className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center w-full px-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{top2.username}</h4>
                  <div className="text-[11px] font-black text-slate-400 mt-0.5">{top2.score} نقطة</div>
                </div>

                {/* Pedestal */}
                <div className="w-full h-24 sm:h-28 mt-2 rounded-t-2xl bg-gradient-to-t from-slate-800 via-slate-700 to-slate-600/90 border-t-2 border-slate-300 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-slate-200">2</span>
                  <span className="text-[10px] text-slate-300 font-semibold">المركز الثاني</span>
                </div>
              </motion.div>
            ) : <div />}

            {/* 1st Place: Gold Champion */}
            {top1 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col items-center relative z-10"
              >
                {/* Crown Glow */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-1"
                >
                  <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                </motion.div>

                <div className="relative mb-2">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center ring-4 ring-amber-400/20">
                    <Avatar className="w-full h-full rounded-[14px]">
                      <AvatarImage src={top1.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-100 text-amber-950 font-black text-lg">
                        {top1.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-md">
                    #1
                  </div>
                </div>

                <div className="text-center w-full px-1">
                  <h4 className="font-black text-xs sm:text-base text-foreground truncate">{top1.username}</h4>
                  <div className="text-xs sm:text-sm font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{top1.score} نقطة</span>
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                    {top1.title || 'بطل المنظومة'}
                  </div>
                </div>

                {/* Pedestal */}
                <div className="w-full h-32 sm:h-36 mt-2 rounded-t-2xl bg-gradient-to-t from-amber-900 via-amber-800 to-amber-600 border-t-2 border-amber-300 flex flex-col items-center justify-center shadow-xl shadow-amber-900/30">
                  <span className="text-3xl font-black text-amber-200">1</span>
                  <span className="text-[10px] text-amber-100 font-bold">بطل التحديات 👑</span>
                </div>
              </motion.div>
            ) : <div />}

            {/* 3rd Place: Bronze */}
            {top3 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-600 to-amber-900 p-0.5 shadow-md flex items-center justify-center">
                    <Avatar className="w-full h-full rounded-[14px]">
                      <AvatarImage src={top3.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-950 text-amber-200 font-black text-sm">
                        {top3.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -top-3 -right-2 p-1 rounded-full bg-amber-700 text-amber-100 shadow-md">
                    <Medal className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center w-full px-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{top3.username}</h4>
                  <div className="text-[11px] font-black text-amber-700 dark:text-amber-500 mt-0.5">{top3.score} نقطة</div>
                </div>

                {/* Pedestal */}
                <div className="w-full h-20 sm:h-22 mt-2 rounded-t-2xl bg-gradient-to-t from-stone-900 via-stone-800 to-amber-900/80 border-t-2 border-amber-600 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-amber-400">3</span>
                  <span className="text-[10px] text-amber-200 font-semibold">المركز الثالث</span>
                </div>
              </motion.div>
            ) : <div />}

          </div>
        </div>

        {/* Search in ranking */}
        <div className="p-4 bg-muted/20 border-b border-border/40">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن متسابق بالاسم..."
              className="w-full h-9 pr-9 pl-4 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>
        </div>

        {/* REST OF THE LIST */}
        <CardContent className="p-0">
          <ScrollArea className="h-[360px]">
            <div className="p-4 space-y-2.5">
              <AnimatePresence>
                {restOfList.map((user, index) => {
                  const rank = index + 4;
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition-all duration-200 ${
                        isCurrentUser
                          ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary/40'
                          : 'bg-card/60 hover:bg-muted/40 border-border/50 hover:border-border'
                      }`}
                    >
                      {/* Rank number */}
                      <div className="w-8 text-center font-black text-xs sm:text-sm text-muted-foreground">
                        #{rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-border">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-xl">
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {user.username}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-primary text-primary-foreground font-black">
                              أنت
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{user.solved_puzzles} لغز مكتمل</span>
                          <span>•</span>
                          <span className="text-amber-500 font-semibold">{user.badge || 'متحدي نشط'}</span>
                          {user.streak && user.streak > 1 && (
                            <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                              <Flame className="w-3 h-3 fill-orange-500" />
                              {user.streak}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="text-base sm:text-lg font-black text-primary flex items-center gap-1">
                          <span>{user.score}</span>
                          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">نقطة</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredList.length === 0 && (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-xs font-bold">لا يوجد متسابقين يطابقون خيارات البحث</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* CURRENT USER STICKY FOOTER BAR */}
        {currentUser && (
          <div className="p-4 bg-primary/10 border-t border-primary/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center text-xs shrink-0">
                #{userRank}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">
                  موقعك في الترتيب: المركز #{userRank}
                </div>
                {playerAhead && (
                  <div className="text-[10.5px] text-primary font-semibold flex items-center gap-1">
                    <ChevronUp className="w-3 h-3 text-emerald-500" />
                    <span>يفصلك {pointsToOvertake} نقطة فقط لتجاوز {playerAhead.username}!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left shrink-0">
              <div className="text-sm font-black text-primary">{currentUser.score} نقطة</div>
              <span className="text-[10px] text-muted-foreground">استمر في حل الألغاز للتقدم</span>
            </div>
          </div>
        )}

      </Card>
    </motion.div>
  );
};

export default LeaderboardPanel;
