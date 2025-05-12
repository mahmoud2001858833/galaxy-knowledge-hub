import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash, Settings, Edit, Users, MessageSquare, FileImage, Trophy, RefreshCw, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const ADMIN_EMAIL = 'jowmahmoud6@gmail.com';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, type: string} | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    checkAdminStatus();
  }, []);
  
  useEffect(() => {
    if (isAdmin) {
      switch (activeTab) {
        case 'messages':
          fetchMessages();
          break;
        case 'images':
          fetchImages();
          break;
        case 'puzzles':
          fetchPuzzles();
          break;
        case 'journals':
          fetchJournals();
          break;
        case 'users':
          fetchUsers();
          break;
        default:
          break;
      }
    }
  }, [isAdmin, activeTab]);
  
  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data: user } = await supabase.auth.getUser();
      
      if (user?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        
        // تحميل البيانات الأولية
        await fetchMessages();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('خطأ في التحقق من حالة المشرف:', error);
      setIsLoading(false);
    }
  };
  
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(username)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل الرسائل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('educational_images')
        .select('*, creator:created_by(username)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('خطأ في تحميل الصور:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل الصور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPuzzles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subject_puzzles')
        .select('*, creator:created_by(username)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setPuzzles(data || []);
    } catch (error) {
      console.error('خطأ في تحميل الألغاز:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل الألغاز",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchJournals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scientific_journals')
        .select('*, creator:created_by(username)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error('خطأ في تحميل المجلات:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل المجلات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = (id: string, type: string) => {
    setDeleteTarget({ id, type });
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      let tableName = '';
      let refreshFunction;
      
      switch (deleteTarget.type) {
        case 'message':
          tableName = 'messages';
          refreshFunction = fetchMessages;
          break;
        case 'image':
          tableName = 'educational_images';
          refreshFunction = fetchImages;
          break;
        case 'puzzle':
          tableName = 'subject_puzzles';
          refreshFunction = fetchPuzzles;
          break;
        case 'journal':
          tableName = 'scientific_journals';
          refreshFunction = fetchJournals;
          break;
        default:
          throw new Error('نوع غير صالح للحذف');
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', deleteTarget.id);
        
      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر بنجاح",
      });
      
      if (refreshFunction) {
        await refreshFunction();
      }
    } catch (error) {
      console.error('خطأ في حذف العنصر:', error);
      toast({
        title: "خطأ",
        description: "تعذر حذف العنصر",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-600"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <div className="mb-4 mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Settings className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-white mb-3">لوحة المشرف</CardTitle>
          <CardDescription className="text-white/70">
            هذه المنطقة للمشرفين فقط. يرجى تسجيل الدخول بحساب مشرف للوصول.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Settings className="h-5 w-5 text-blue-500" />
            </div>
            <CardTitle className="text-white">لوحة المشرف</CardTitle>
          </div>
          <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">مشرف</div>
        </div>
        <CardDescription className="text-white/70">
          إدارة محتوى المنصة والمستخدمين
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>الرسائل</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-1">
              <FileImage className="h-4 w-4" />
              <span>الصور</span>
            </TabsTrigger>
            <TabsTrigger value="puzzles" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>الألغاز</span>
            </TabsTrigger>
            <TabsTrigger value="journals" className="flex items-center gap-1">
              <FileImage className="h-4 w-4" />
              <span>المجلات</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>المستخدمين</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map(message => (
                  <Card key={message.id} className="bg-white/10 border-white/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-blue-400 font-medium">
                                {message.sender?.username || "مستخدم"}
                              </p>
                              <p className="text-xs text-white/50">
                                {new Date(message.created_at).toLocaleString('ar-SA')}
                              </p>
                            </div>
                            {message.room_id ? (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                محادثة جماعية
                              </span>
                            ) : (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                محادثة خاصة
                              </span>
                            )}
                          </div>
                          <p className="text-white/80 text-right mt-2">{message.message_text}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(message.id, 'message')} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد رسائل حالياً
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="images">
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map(image => (
                  <Card key={image.id} className="bg-white/10 border-white/5 overflow-hidden">
                    <div className="h-48">
                      <img 
                        src={image.image_url} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{image.title}</p>
                          <p className="text-xs text-white/50">
                            {image.creator?.username || "مستخدم"}，
                            {new Date(image.created_at).toLocaleDateString('ar-SA')}
                          </p>
                          <p className="text-xs mt-1 bg-blue-500/20 text-blue-400 inline-block px-2 py-0.5 rounded">
                            {image.subject === 'physics' ? 'الفيزياء' : 
                             image.subject === 'chemistry' ? 'الكيمياء' : 
                             image.subject === 'biology' ? 'الأحياء' : 
                             image.subject === 'mathematics' ? 'الرياضيات' : 'موضوع آخر'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(image.id, 'image')} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد صور حالياً
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="puzzles">
            {puzzles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {puzzles.map(puzzle => (
                  <Card key={puzzle.id} className="bg-white/10 border-white/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{puzzle.title}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              puzzle.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                              puzzle.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {puzzle.difficulty === 'easy' ? 'سهل' :
                               puzzle.difficulty === 'medium' ? 'متوسط' :
                               'صعب'}
                            </span>
                          </div>
                          <p className="text-white/70 line-clamp-2">{puzzle.question}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                              {puzzle.subject === 'physics' ? 'الفيزياء' : 
                               puzzle.subject === 'chemistry' ? 'الكيمياء' : 
                               puzzle.subject === 'biology' ? 'الأحياء' : 
                               puzzle.subject === 'mathematics' ? 'الرياضيات' : 'موضوع آخر'}
                            </p>
                            <p className="text-xs text-white/50">
                              {puzzle.points} نقطة
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(puzzle.id, 'puzzle')} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد ألغاز حالياً
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="journals">
            {journals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journals.map(journal => (
                  <Card key={journal.id} className="bg-white/10 border-white/5 overflow-hidden">
                    <div className="h-40">
                      <img 
                        src={journal.cover_image_url} 
                        alt={journal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{journal.title}</p>
                          <p className="text-xs text-white/50 mb-1">
                            {journal.creator?.username || "مستخدم"}，
                            {new Date(journal.created_at).toLocaleDateString('ar-SA')}
                          </p>
                          <p className="text-xs bg-blue-500/20 text-blue-400 inline-block px-2 py-0.5 rounded">
                            {journal.subject === 'physics' ? 'الفيزياء' : 
                             journal.subject === 'chemistry' ? 'الكيمياء' : 
                             journal.subject === 'biology' ? 'الأحياء' : 
                             journal.subject === 'mathematics' ? 'الرياضيات' : 'موضوع آخر'}
                          </p>
                          <div className="mt-2">
                            <a 
                              href={journal.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 text-sm hover:underline"
                            >
                              عرض PDF
                            </a>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(journal.id, 'journal')} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد مجلات علمية حالياً
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            {users.length > 0 ? (
              <div className="space-y-4">
                {users.map(user => (
                  <Card key={user.id} className="bg-white/10 border-white/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="h-10 w-10 rounded-full bg-blue-600/30 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-xs text-white/50">ID: {user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <p className="text-xs text-white/70">النقاط:</p>
                              <p className="text-sm text-blue-400 font-medium">{user.score || 0}</p>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <p className="text-xs text-white/70">الألغاز المحلولة:</p>
                              <p className="text-sm text-green-400 font-medium">{user.solved_puzzles || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا يوجد مستخدمين حالياً
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t border-white/10 p-4">
        <Button
          onClick={() => {
            toast({
              title: "تم تحديث البيانات",
              description: "تم تحديث البيانات بنجاح",
            });
            
            switch (activeTab) {
              case 'messages':
                fetchMessages();
                break;
              case 'images':
                fetchImages();
                break;
              case 'puzzles':
                fetchPuzzles();
                break;
              case 'journals':
                fetchJournals();
                break;
              case 'users':
                fetchUsers();
                break;
              default:
                break;
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 ml-auto flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث البيانات</span>
        </Button>
      </CardFooter>
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-white/70">
              هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              نعم، احذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminPanel;
