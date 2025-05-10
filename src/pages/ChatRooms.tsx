
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';
import { Bell, UserPlus, Users } from 'lucide-react';
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
  const { toast } = useToast();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        // التحقق من تسجيل دخول المستخدم
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "يجب تسجيل الدخول",
            description: "يرجى تسجيل الدخول للوصول إلى غرف المحادثة",
            variant: "destructive",
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
          variant: "destructive",
        });
      }
    };

    checkUser();
    
    // تعيين عنوان الصفحة
    document.title = "المحادثات - منصة تعليمية";
    
    return () => {
      // إعادة تعيين العنوان عند إلغاء التحميل
      document.title = "منصة تعليمية";
    };
  }, [navigate, toast]);
  
  // الاستماع إلى الرسائل الجديدة عندما تكون الصفحة غير نشطة
  useEffect(() => {
    if (!userId) return;
    
    // Channel for direct messages
    const messagesChannel = supabase.channel('messages-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        } as any, 
        (payload) => {
          // تعيين مؤشر وجود رسائل جديدة
          if (document.hidden) {
            setHasNewMessages(true);
            playNotificationSound();
          }
          
          // Refresh page data in realtime
          refreshMessages();
        }
      )
      .subscribe();
      
    // Channel for group messages  
    const groupMessagesChannel = supabase.channel('group-messages-notifications')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages'
        } as any,
        (payload) => {
          // Use the correct property accessor with type checking
          const newPayload = payload.new as Record<string, any> | null;
          const chatId = newPayload && typeof newPayload === 'object' ? newPayload.chat_id : null;
          
          if (chatId) {
            // Check if user is part of this group chat
            checkIfUserInGroup(chatId).then(isInGroup => {
              if (isInGroup) {
                if (document.hidden) {
                  setHasNewMessages(true);
                  playNotificationSound();
                }
                
                // Refresh page data in realtime
                refreshMessages();
              }
            });
          }
        }
      )
      .subscribe();
      
    // تغيير حالة الإشعارات عند تنشيط الصفحة
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setHasNewMessages(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(groupMessagesChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);
  
  const checkIfUserInGroup = async (chatId: string) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('private_chat_participants')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if user is in group:', error);
      return false;
    }
  };
  
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
    // Custom event to notify chat components to refresh data
    const refreshEvent = new CustomEvent('refresh-messages');
    document.dispatchEvent(refreshEvent);
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
  
  // إضافة جهة اتصال جديدة
  const handleAddContact = async () => {
    if (!contactEmail.trim() || !userId) return;
    
    setIsAddingContact(true);
    setErrorMessage('');
    
    try {
      // البحث عن المستخدم بواسطة البريد الإلكتروني
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username');
        
      if (userError) throw userError;
      
      // Filter the data to find the user with matching username
      const foundUser = userData ? userData.find(user => user.username === contactEmail) : null;
      
      if (!foundUser) {
        setErrorMessage('لم يتم العثور على مستخدم بهذا الاسم');
        return;
      }
      
      const contactUser = foundUser;
      
      if (!contactUser || !contactUser.id) {
        setErrorMessage('بيانات المستخدم غير صالحة');
        return;
      }
      
      // التأكد من أن المستخدم لا يضيف نفسه
      if (contactUser.id === userId) {
        setErrorMessage('لا يمكنك إضافة نفسك كجهة اتصال');
        return;
      }
      
      // التحقق من أن جهة الاتصال غير موجودة مسبقًا
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('contact_id', contactUser.id);
        
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
          contact_id: contactUser.id
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة ${contactUser.username} إلى جهات اتصالك`,
      });
      
      setContactEmail('');
      setIsAddContactOpen(false);
      
    } catch (error: any) {
      console.error('خطأ في إضافة جهة اتصال:', error);
      setErrorMessage('حدث خطأ أثناء إضافة جهة الاتصال');
    } finally {
      setIsAddingContact(false);
    }
  };
  
  return (
    <>
      <div className="relative">
        <ChatLayout />
        
        {/* زر إضافة جهة اتصال */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            onClick={() => setIsAddContactOpen(true)} 
            className="rounded-full h-14 w-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
            variant="default"
            size="icon"
          >
            <UserPlus className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* نافذة إضافة جهة اتصال */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="bg-blue-950 border-blue-800">
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
                className="bg-blue-900/50 border-blue-700"
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
              className="bg-blue-600 hover:bg-blue-700"
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
