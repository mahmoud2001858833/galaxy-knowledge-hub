
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, CircleCheck, FileImage, FileText, Award, Clock, Trophy, Book, MessageSquare } from 'lucide-react';
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

type Contact = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [journals, setJournals] = useState<UploadedJournal[]>([]);
  const [puzzles, setPuzzles] = useState<SolvedPuzzle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usageTime, setUsageTime] = useState(0);
  const [level, setLevel] = useState({ level: 0, progress: 0, nextLevel: 60 });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUserData();
    document.title = "الملف الشخصي - منصة في فلك المعرفة";
    
    return () => {
      document.title = "منصة في فلك المعرفة";
    };
  }, []);

  useEffect(() => {
    if (profile) {
      // Get usage time from localStorage or initialize it
      const storedTime = localStorage.getItem(`user_${profile.id}_usage_time`) || "0";
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
          localStorage.setItem(`user_${profile.id}_usage_time`, newTime.toString());
          
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
  }, [profile]);
  
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
        // If profile doesn't exist, try to create one
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id, 
                username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
                score: 0,
                solved_puzzles: 0
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
      const { data: imagesData, error: imagesError } = await supabase
        .from('educational_images')
        .select('*')
        .eq('created_by', user.id);
      
      if (imagesError) throw imagesError;
      
      if (imagesData) {
        setImages(imagesData as UploadedImage[]);
      }
      
      // Fetch uploaded journals
      const { data: journalsData, error: journalsError } = await supabase
        .from('scientific_journals')
        .select('*')
        .eq('created_by', user.id);
      
      if (journalsError) throw journalsError;
      
      if (journalsData) {
        setJournals(journalsData as UploadedJournal[]);
      }
      
      // Fetch solved puzzles with additional details
      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('user_solved_puzzles')
        .select('*')
        .eq('user_id', user.id)
        .order('solved_at', { ascending: false });
      
      if (puzzlesError) throw puzzlesError;
      
      if (puzzlesData && puzzlesData.length > 0) {
        // Enhanced puzzle data with details
        const enhancedPuzzles = await Promise.all(puzzlesData.map(async (puzzle) => {
          // Try to get puzzle details based on subject
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
      
      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', user.id);
        
      if (contactsError) throw contactsError;
      
      if (contactsData && contactsData.length > 0) {
        const contactIds = contactsData.map(c => c.contact_id);
        
        const { data: contactProfiles, error: contactProfilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);
          
        if (contactProfilesError) throw contactProfilesError;
        
        if (contactProfiles) {
          setContacts(contactProfiles as Contact[]);
        }
      }
      
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
        return 'text-subject-physics-primary';
      case 'chemistry':
        return 'text-subject-chemistry-primary';
      case 'biology':
        return 'text-subject-biology-primary';
      case 'mathematics':
        return 'text-subject-mathematics-primary';
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
  
  // Calculate progress percentage for the progress bar
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
              className="text-center mb-12"
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
                  المستوى {level.level}
                </Badge>
                
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
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-4 text-white/70">
                <div className="flex items-center">
                  <CircleCheck className="w-4 h-4 ml-1 text-green-400" />
                  <span>{profile.solved_puzzles || 0} ألغاز محلولة</span>
                </div>
                <div className="flex items-center mr-4">
                  <Award className="w-4 h-4 ml-1 text-yellow-400" />
                  <span>{profile.score || 0} نقطة</span>
                </div>
                <div className="flex items-center mr-4">
                  <Clock className="w-4 h-4 ml-1 text-blue-400" />
                  <span>{Math.floor(usageTime / 60)} ساعة و {Math.round(usageTime % 60)} دقيقة</span>
                </div>
              </div>
              
              {isAdmin && (
                <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 rounded-full text-white text-sm font-medium">
                  مشرف
                </div>
              )}
            </motion.div>
            
            {isAdmin && (
              <div className="mb-8">
                <AdminPanel />
              </div>
            )}
            
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <Tabs defaultValue="puzzles">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="puzzles" className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>الألغاز المحلولة</span>
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex items-center gap-1">
                      <FileImage className="h-4 w-4" />
                      <span>الصور المرفوعة</span>
                    </TabsTrigger>
                    <TabsTrigger value="journals" className="flex items-center gap-1">
                      <Book className="h-4 w-4" />
                      <span>المجلات المرفوعة</span>
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>جهات الاتصال</span>
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
                  
                  <TabsContent value="contacts" className="mt-0">
                    {contacts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contacts.map((contact) => (
                          <Card key={contact.id} className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                              <Avatar className="h-16 w-16 mb-3 border-2 border-blue-500/20">
                                {contact.avatar_url ? (
                                  <AvatarImage src={contact.avatar_url} alt={contact.username} />
                                ) : (
                                  <AvatarFallback className="bg-blue-700/50">
                                    {contact.username[0]}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <h3 className="text-lg font-medium text-white">{contact.username}</h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/70">
                        ليس لديك جهات اتصال بعد
                      </div>
                    )}
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
