
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';
import { Bell, UserPlus, Users, RefreshCw, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const ChatRooms = () => {
  const navigate = useNavigate();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showContactsList, setShowContactsList] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "يجب تسجيل الدخول",
            description: "يرجى تسجيل الدخول للوصول إلى غرف المحادثة",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        setUserId(session.user.id);
        
        // فتح جهات الاتصال بعد التحقق من المستخدم
        fetchContacts(session.user.id);
      } catch (error) {
        console.error('خطأ في التحقق من المستخدم:', error);
        toast({
          title: "حدث خطأ",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    };

    checkUser();
    
    // تعيين عنوان الصفحة
    document.title = "المحادثات - منصة تعليمية";
    
    return () => {
      document.title = "منصة تعليمية";
    };
  }, [navigate]);
  
  // تحسين نظام الاستماع إلى الرسائل الجديدة
  useEffect(() => {
    if (!userId) return;
    
    // تحسين قناة الاستماع للرسائل الخاصة
    const messagesChannel = supabase.channel('messages-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        } as any, 
        (payload) => {
          if (document.hidden) {
            setHasNewMessages(true);
            playNotificationSound();
          }
          
          // بث حدث تحديث عام
          const globalEvent = new CustomEvent('global-chat-update');
          document.dispatchEvent(globalEvent);
          
          // تحديث الواجهة
          setForceRefresh(prev => prev + 1);
        }
      )
      .subscribe();
    
    // تحسين معالجة تغيير حالة الإشعارات
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setHasNewMessages(false);
        // تحديث عند العودة للصفحة
        setForceRefresh(prev => prev + 1);
        
        // بث حدث تحديث عام
        const globalEvent = new CustomEvent('global-chat-update');
        document.dispatchEvent(globalEvent);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // الاستماع لحدث التحديث العام
    const handleGlobalUpdate = () => {
      refreshMessages();
    };
    
    document.addEventListener('global-chat-update', handleGlobalUpdate);
    
    return () => {
      supabase.removeChannel(messagesChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('global-chat-update', handleGlobalUpdate);
    };
  }, [userId]);

  // تأثير للتحديث القسري
  useEffect(() => {
    if (forceRefresh > 0) {
      refreshMessages();
      fetchContacts(userId);
    }
  }, [forceRefresh]);
  
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.error('خطأ في تشغيل الصوت:', err));
    } catch (error) {
      console.error('خطأ في تشغيل صوت الإشعار:', error);
    }
  };
  
  const refreshMessages = () => {
    const refreshEvent = new CustomEvent('refresh-messages');
    document.dispatchEvent(refreshEvent);
  };
  
  const handleRefreshManually = () => {
    setForceRefresh(prev => prev + 1);
    
    // بث حدث تحديث عام
    const globalEvent = new CustomEvent('global-chat-update');
    document.dispatchEvent(globalEvent);
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث المحادثات بنجاح",
    });
  };
  
  // تغيير عنوان الصفحة عندما تكون هناك رسائل جديدة
  useEffect(() => {
    if (hasNewMessages) {
      document.title = "🔔 رسالة جديدة - منصة تعليمية";
    } else {
      document.title = "المحادثات - منصة تعليمية";
    }
    
    return () => {
      document.title = "منصة تعليمية";
    };
  }, [hasNewMessages]);
  
  // تحسين وظيفة إضافة جهة اتصال جديدة
  const handleAddContact = async () => {
    if (!contactEmail.trim() || !userId) return;
    
    setIsAddingContact(true);
    setErrorMessage('');
    
    try {
      // البحث عن المستخدم بواسطة اسم المستخدم
      const { data: userData, error: userError } = await supabase
        .from('users_profiles')
        .select('id, username')
        .ilike('username', contactEmail.trim());
        
      if (userError) throw userError;
      
      // البحث عن المستخدم المطابق
      const foundUser = userData?.length > 0 ? userData[0] : null;
      
      if (!foundUser) {
        setErrorMessage('لم يتم العثور على مستخدم بهذا الاسم');
        return;
      }
      
      // التأكد من أن المستخدم لا يضيف نفسه
      if (foundUser.id === userId) {
        setErrorMessage('لا يمكنك إضافة نفسك كجهة اتصال');
        return;
      }
      
      // التحقق من أن جهة الاتصال غير موجودة مسبقًا
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('contact_id', foundUser.id);
        
      if (checkError) throw checkError;
      
      if (existingContact && existingContact.length > 0) {
        setErrorMessage('جهة الاتصال موجودة مسبقًا');
        return;
      }
      
      // إضافة جهة الاتصال
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          contact_id: foundUser.id
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة ${foundUser.username} إلى جهات اتصالك`,
      });
      
      setContactEmail('');
      setIsAddContactOpen(false);
      
      // تحديث المحادثات وقائمة جهات الاتصال
      refreshMessages();
      fetchContacts(userId);
      setForceRefresh(prev => prev + 1);
      
    } catch (error: any) {
      console.error('خطأ في إضافة جهة اتصال:', error);
      setErrorMessage('حدث خطأ أثناء إضافة جهة الاتصال');
    } finally {
      setIsAddingContact(false);
    }
  };
  
  // جلب جهات الاتصال
  const fetchContacts = async (userId: string | null) => {
    if (!userId) return;
    
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, created_at')
        .eq('user_id', userId);

      if (contactsError) throw contactsError;

      if (contactsData && contactsData.length > 0) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // جلب معلومات الملفات الشخصية
        const { data: profilesData, error: profilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);

        if (profilesError) throw profilesError;
        
        if (profilesData) {
          const enhancedProfiles = profilesData.map(profile => ({
            ...profile,
            isOnline: Math.random() > 0.5 // محاكاة حالة الاتصال
          }));
          
          // ترتيب الاتصالات بحسب الاسم
          setContacts(enhancedProfiles.sort((a, b) => a.username.localeCompare(b.username)));
        }
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // بدء محادثة مع جهة اتصال
  const startConversation = (contact: any) => {
    // إغلاق قائمة جهات الاتصال
    setShowContactsList(false);
    
    // تحديث الشاشة لتظهر المحادثة المحددة
    const chatLayoutElement = document.getElementById('chat-layout');
    if (chatLayoutElement) {
      // هذه الوظيفة يمكنك تنفيذها في ChatLayout.tsx
      // لاختيار جهة اتصال معينة
      const customEvent = new CustomEvent('select-contact', {
        detail: { contactId: contact.id }
      });
      document.dispatchEvent(customEvent);
    }
  };

  return (
    <>
      <div className="relative h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={handleRefreshManually}
            className="flex items-center gap-1 bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تحديث المحادثات</span>
          </Button>
          
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            غرف المحادثة
          </h1>
        </div>
        
        {/* واجهة المحادثة الرئيسية مع مربع الترحيب */}
        <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 backdrop-blur-sm rounded-lg border border-blue-500/20 p-0 shadow-lg h-[calc(100vh-130px)] overflow-hidden">
          {!showContactsList ? (
            <div className="h-full flex flex-col">
              {/* مربع الترحيب الكبير */}
              <div className="p-6 mb-4">
                <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-white mb-2">غرف المحادثة الخاصة</h2>
                          <p className="text-blue-300">تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة</p>
                        </div>
                        
                        {contacts.length > 0 && (
                          <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold text-white mb-3">آخر جهة اتصال</h3>
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 ml-3">
                                {contacts[0].avatar_url ? (
                                  <AvatarImage src={contacts[0].avatar_url} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
                                    {contacts[0].username[0]}
                                  </AvatarFallback>
                                )}
                                {contacts[0].isOnline && (
                                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900" />
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">{contacts[0].username}</p>
                                <p className="text-xs text-blue-300">{contacts[0].isOnline ? "متصل الآن" : "غير متصل"}</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => startConversation(contacts[0])}
                              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                            >
                              بدء المحادثة
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <div 
                            className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                            onClick={() => setShowContactsList(true)}
                          >
                            <div className="w-16 h-16 rounded-full bg-blue-800/50 flex items-center justify-center mb-3">
                              <Users className="h-8 w-8 text-blue-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">اختر جهة اتصال</h3>
                            <p className="text-blue-300/80 text-center mt-2 text-sm">عرض قائمة جهات الاتصال لبدء محادثة</p>
                          </div>
                          
                          <div 
                            className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                            onClick={() => setIsAddContactOpen(true)}
                          >
                            <div className="w-16 h-16 rounded-full bg-blue-800/50 flex items-center justify-center mb-3">
                              <UserPlus className="h-8 w-8 text-blue-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">أضف جهة اتصال</h3>
                            <p className="text-blue-300/80 text-center mt-2 text-sm">إضافة جهة اتصال جديدة للتواصل معها</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* منطقة عرض المحادثة */}
              <div className="flex-1 overflow-hidden" id="chat-layout">
                <ChatLayout />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactsList(false)}
                  className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
                >
                  <MessageSquare className="h-4 w-4 ml-2" />
                  <span>العودة للمحادثات</span>
                </Button>
                <h2 className="text-xl font-bold text-white">جهات الاتصال</h2>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddContactOpen(true)}
                  className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
                >
                  <UserPlus className="h-4 w-4 ml-2" />
                  <span>إضافة جهة</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
                {contacts.length > 0 ? (
                  contacts.map(contact => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-500/20 hover:border-blue-500/40 rounded-lg overflow-hidden shadow cursor-pointer transition-all"
                      onClick={() => startConversation(contact)}
                    >
                      <div className="p-4 flex items-center">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ml-4 border-2 border-slate-700/40">
                            {contact.avatar_url ? (
                              <AvatarImage src={contact.avatar_url} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
                                {contact.username[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          {/* مؤشر حالة الاتصال */}
                          <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 ${
                            contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{contact.username}</h3>
                          <p className="text-xs text-blue-300">{contact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 flex justify-center">
                        <span className="text-sm text-blue-300">انقر للمحادثة</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-10">
                    <Users className="h-16 w-16 text-blue-500/40 mb-4" />
                    <p className="text-white text-lg mb-2">لا توجد جهات اتصال</p>
                    <p className="text-blue-300/80 mb-6 text-center">لم تقم بإضافة أي جهات اتصال بعد</p>
                    <Button 
                      onClick={() => setIsAddContactOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 ml-2" />
                      <span>إضافة جهة اتصال</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* زر إضافة جهة اتصال الثابت */}
        {!showContactsList && (
          <div className="fixed bottom-8 right-8 z-50">
            <Button 
              onClick={() => setIsAddContactOpen(true)} 
              className="rounded-full h-14 w-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/40 border border-blue-500/30"
              variant="default"
              size="icon"
            >
              <UserPlus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      
      {/* نافذة إضافة جهة اتصال */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-purple-950 border-blue-800/50 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">إضافة جهة اتصال</DialogTitle>
            <DialogDescription className="text-white/70">
              أدخل اسم المستخدم الذي تريد إضافته إلى جهات اتصالك
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="أدخل اسم المستخدم"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-blue-900/40 border-blue-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errorMessage && (
                <p className="text-red-400 text-sm">{errorMessage}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleAddContact}
              disabled={isAddingContact || !contactEmail.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            >
              {isAddingContact ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatRooms;
