
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, CircleCheck, FileImage, FileText, Award, Clock, Trophy, Book, MessageSquare, Video, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminPanel from '@/components/profile/AdminPanel';

type UserProfile = {
  id: string;
  username: string;
  avatar_url?: string | null;
  score: number;
  solved_puzzles: number;
  usage_time: number;
};

type UploadedImage = {
  id: string;
  title: string;
  image_url: string;
  subject: string;
  created_at: string;
};

type UploadedJournal = {
  id: string;
  title: string;
  cover_image_url: string;
  pdf_url: string;
  subject: string;
  created_at: string;
};

type SolvedPuzzle = {
  id: string;
  user_id: string;
  puzzle_id: string;
  subject: string;
  solved_at: string;
  title?: string;
  difficulty?: string;
  points?: number;
};

type WatchedVideo = {
  id: string;
  video_title: string;
  video_url: string;
  subject: string;
  watched_at: string;
  duration_watched: number;
};

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [journals, setJournals] = useState<UploadedJournal[]>([]);
  const [puzzles, setPuzzles] = useState<SolvedPuzzle[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUserData();
    document.title = "الملف الشخصي - منصة في فلك المعرفة";
    
    return () => {
      document.title = "منصة في فلك المعرفة";
    };
  }, []);
  
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "غير مسجل الدخول",
          description: "يرجى تسجيل الدخول لعرض الملف الشخصي",
          variant: "destructive"
        });
        return;
      }
      
      // Check if admin
      if (user.email === 'jowmahmoud6@gmail.com') {
        setIsAdmin(true);
      }
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Create profile if doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id, 
                username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
                score: 0,
                solved_puzzles: 0,
                usage_time: 0
              }
            ])
            .select()
            .single();
          
          if (createError) throw createError;
          setProfile(newProfile as UserProfile);
        } else {
          throw profileError;
        }
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      }
      
      // Fetch uploaded images
      const { data: imagesData } = await supabase
        .from('educational_images')
        .select('*')
        .eq('created_by', user.id);
      
      if (imagesData) {
        setImages(imagesData as UploadedImage[]);
      }
      
      // Fetch uploaded journals
      const { data: journalsData } = await supabase
        .from('scientific_journals')
        .select('*')
        .eq('created_by', user.id);
      
      if (journalsData) {
        setJournals(journalsData as UploadedJournal[]);
      }
      
      // Fetch solved puzzles
      const { data: puzzlesData } = await supabase
        .from('user_solved_puzzles')
        .select('*')
        .eq('user_id', user.id)
        .order('solved_at', { ascending: false });
      
      if (puzzlesData && puzzlesData.length > 0) {
        const enhancedPuzzles = await Promise.all(puzzlesData.map(async (puzzle) => {
          let puzzleDetails: any = null;
          
          try {
            const { data: details } = await supabase
              .from('subject_puzzles')
              .select('title, difficulty, points')
              .eq('id', puzzle.puzzle_id)
              .single();
              
            if (details) {
              puzzleDetails = details;
            }
          } catch (e) {
            console.log('Could not fetch puzzle details for', puzzle.puzzle_id);
          }
          
          return {
            ...puzzle,
            title: puzzleDetails?.title || 'لغز',
            difficulty: puzzleDetails?.difficulty === 'easy' ? 'سهل' : 
                       puzzleDetails?.difficulty === 'medium' ? 'متوسط' : 'صعب',
            points: puzzleDetails?.points || 0
          };
        }));
        
        setPuzzles(enhancedPuzzles);
      }

      // Fetch watched videos
      const { data: videosData } = await supabase
        .from('watched_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });
      
      if (videosData) {
        setWatchedVideos(videosData as WatchedVideo[]);
      }

      // Fetch messages count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('sender_id', user.id);
        
      setMessagesCount(messageCount || 0);
      
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSubjectName = (subject: string) => {
    switch (subject) {
      case 'physics':
        return 'الفيزياء';
      case 'chemistry':
        return 'الكيمياء';
      case 'biology':
        return 'الأحياء';
      case 'mathematics':
        return 'الرياضيات';
      default:
        return subject;
    }
  };
  
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'physics':
        return 'text-blue-400';
      case 'chemistry':
        return 'text-green-400';
      case 'biology':
        return 'text-purple-400';
      case 'mathematics':
        return 'text-orange-400';
      default:
        return 'text-blue-500';
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل':
        return 'bg-green-500/20 text-green-400';
      case 'متوسط':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'صعب':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const calculateLevel = (usageTime: number) => {
    if (usageTime < 30) return { level: 0, progress: usageTime, nextLevel: 30, title: 'مبتدئ' };
    if (usageTime < 60) return { level: 1, progress: usageTime - 30, nextLevel: 30, title: 'متعلم' };
    if (usageTime < 120) return { level: 2, progress: usageTime - 60, nextLevel: 60, title: 'نشط' };
    if (usageTime < 240) return { level: 3, progress: usageTime - 120, nextLevel: 120, title: 'متقدم' };
    if (usageTime < 480) return { level: 4, progress: usageTime - 240, nextLevel: 240, title: 'خبير' };
    return { level: 5, progress: 100, nextLevel: 100, title: 'أسطورة' };
  };

  const level = profile ? calculateLevel(profile.usage_time || 0) : { level: 0, progress: 0, nextLevel: 30, title: 'مبتدئ' };
  const progressPercentage = (level.progress / level.nextLevel) * 100;
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <StarField starCount={100} speed={0.1} />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse mb-4"></div>
            <div className="h-8 w-40 bg-white/10 animate-pulse rounded mb-2"></div>
            <div className="h-4 w-60 bg-white/10 animate-pulse rounded"></div>
          </div>
        ) : profile ? (
          <>
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 border-4 border-blue-500/30">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-700/50">
                    <User className="w-16 h-16 text-white/70" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mt-4">{profile.username}</h1>
              
              <div className="flex flex-col items-center justify-center mt-2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-none text-lg mb-2">
                  المستوى {level.level} - {level.title}
                </Badge>
                
                {level.level > 0 && (
                  <div className="w-80 max-w-full space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">التقدم للمستوى التالي</span>
                      <span className="text-blue-300">{Math.round(level.progress)}/{level.nextLevel} دقيقة</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 bg-blue-950 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500" 
                    />
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 rounded-full text-white text-sm font-medium">
                  مشرف
                </div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <p className="text-2xl font-bold text-white">{profile.score || 0}</p>
                  <p className="text-sm text-white/70">النقاط</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold text-white">{puzzles.length}</p>
                  <p className="text-sm text-white/70">ألغاز محلولة</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4 text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold text-white">{watchedVideos.length}</p>
                  <p className="text-sm text-white/70">فيديوهات مشاهدة</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">{messagesCount}</p>
                  <p className="text-sm text-white/70">رسائل مرسلة</p>
                </CardContent>
              </Card>
            </motion.div>
            
            {isAdmin && (
              <div className="mb-8">
                <AdminPanel />
              </div>
            )}
            
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <Tabs defaultValue="puzzles">
                  <TabsList className="grid grid-cols-5 mb-6">
                    <TabsTrigger value="puzzles" className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>الألغاز</span>
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>الفيديوهات</span>
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex items-center gap-1">
                      <FileImage className="h-4 w-4" />
                      <span>الصور</span>
                    </TabsTrigger>
                    <TabsTrigger value="journals" className="flex items-center gap-1">
                      <Book className="h-4 w-4" />
                      <span>المجلات</span>
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>الإحصائيات</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="puzzles" className="mt-0">
                    {puzzles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {puzzles.map((puzzle) => (
                          <Card key={puzzle.id} className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded text-xs ${getSubjectColor(puzzle.subject)}`}>
                                  {getSubjectName(puzzle.subject)}
                                </span>
                                {puzzle.difficulty && (
                                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(puzzle.difficulty)}`}>
                                    {puzzle.difficulty}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-medium text-white mb-1">{puzzle.title || "لغز"}</h3>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-white/50">
                                  حل في {new Date(puzzle.solved_at).toLocaleDateString('ar-SA')}
                                </p>
                                <Badge variant="outline" className="bg-blue-900/30 text-blue-300">
                                  {puzzle.points} نقطة
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/70">
                        لم تقم بحل أي لغز بعد
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="videos" className="mt-0">
                    {watchedVideos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {watchedVideos.map((video) => (
                          <Card key={video.id} className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-center mb-2">
                                <Video className="w-4 h-4 ml-2 text-purple-400" />
                                <span className={`px-2 py-1 rounded text-xs ${getSubjectColor(video.subject)}`}>
                                  {getSubjectName(video.subject)}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-1">{video.video_title}</h3>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-white/50">
                                  شوهد في {new Date(video.watched_at).toLocaleDateString('ar-SA')}
                                </p>
                                <span className="text-xs text-purple-300">
                                  {Math.floor(video.duration_watched / 60)} دقيقة
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/70">
                        لم تشاهد أي فيديوهات بعد
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="images" className="mt-0">
                    {images.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image) => (
                          <Card key={image.id} className="overflow-hidden bg-white/5 border-white/10 hover:border-white/30 transition-all">
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={image.image_url} 
                                alt={image.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center mb-2">
                                <span className={`px-2 py-1 rounded text-xs ${getSubjectColor(image.subject)}`}>
                                  {getSubjectName(image.subject)}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-1">{image.title}</h3>
                              <p className="text-xs text-white/50">
                                تم الرفع في {new Date(image.created_at).toLocaleDateString('ar-SA')}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/70">
                        لم تقم برفع أي صور بعد
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="journals" className="mt-0">
                    {journals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {journals.map((journal) => (
                          <Card key={journal.id} className="overflow-hidden bg-white/5 border-white/10 hover:border-white/30 transition-all">
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={journal.cover_image_url} 
                                alt={journal.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center mb-2">
                                <span className={`px-2 py-1 rounded text-xs ${getSubjectColor(journal.subject)}`}>
                                  {getSubjectName(journal.subject)}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-1">{journal.title}</h3>
                              <a 
                                href={journal.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                              >
                                <FileText className="w-3 h-3 ml-1" />
                                عرض PDF
                              </a>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/70">
                        لم تقم برفع أي مجلات علمية بعد
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="stats" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-center">وقت الاستخدام</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                            <p className="text-3xl font-bold text-white mb-2">
                              {Math.floor((profile.usage_time || 0) / 60)} ساعة {Math.round((profile.usage_time || 0) % 60)} دقيقة
                            </p>
                            <p className="text-white/70">إجمالي وقت الاستخدام</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-center">توزيع النشاطات</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">الألغاز المحلولة</span>
                              <Badge className="bg-green-500/20 text-green-300">{puzzles.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">الفيديوهات المشاهدة</span>
                              <Badge className="bg-purple-500/20 text-purple-300">{watchedVideos.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">الصور المرفوعة</span>
                              <Badge className="bg-blue-500/20 text-blue-300">{images.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">المجلات المرفوعة</span>
                              <Badge className="bg-orange-500/20 text-orange-300">{journals.length}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-20 text-white/70">
            <h2 className="text-2xl mb-4">لم يتم العثور على الملف الشخصي</h2>
            <p>يرجى تسجيل الدخول لعرض الملف الشخصي الخاص بك.</p>
            <div className="mt-6">
              <a href="/auth" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors">
                تسجيل الدخول
              </a>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
