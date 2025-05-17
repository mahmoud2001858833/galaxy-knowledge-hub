
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';
import { Bell, UserPlus, Users, RefreshCw } from 'lucide-react';
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

const ChatRooms = () => {
  const navigate = useNavigate();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forceRefresh, setForceRefresh] = useState(0);

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
      
    // تحسين قناة الاستماع لرسائل المجموعات
    const groupMessagesChannel = supabase.channel('group-messages-notifications')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'room_id.is.not.null'
        } as any,
        (payload) => {
          const newPayload = payload.new as Record<string, any> | null;
          const roomId = newPayload && typeof newPayload === 'object' ? newPayload.room_id : null;
          
          if (roomId) {
            if (document.hidden) {
              setHasNewMessages(true);
              playNotificationSound();
            } else {
              // تحديث تلقائي
              setForceRefresh(prev => prev + 1);
              
              // بث حدث تحديث عام
              const globalEvent = new CustomEvent('global-chat-update');
              document.dispatchEvent(globalEvent);
            }
          }
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
      supabase.removeChannel(groupMessagesChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('global-chat-update', handleGlobalUpdate);
    };
  }, [userId]);

  // تأثير للتحديث القسري
  useEffect(() => {
    if (forceRefresh > 0) {
      refreshMessages();
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
    console.log("إرسال حدث تحديث الرسائل");
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
      
      // تحديث المحادثات
      refreshMessages();
      setForceRefresh(prev => prev + 1);
      
    } catch (error: any) {
      console.error('خطأ في إضافة جهة اتصال:', error);
      setErrorMessage('حدث خطأ أثناء إضافة جهة الاتصال');
    } finally {
      setIsAddingContact(false);
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
        
        <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 backdrop-blur-sm rounded-lg border border-blue-500/20 p-0 shadow-lg h-[calc(100vh-130px)] overflow-hidden">
          <ChatLayout />
        </div>
        
        {/* زر إضافة جهة اتصال */}
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
