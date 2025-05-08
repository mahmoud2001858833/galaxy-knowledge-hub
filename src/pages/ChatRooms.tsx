
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
    
    const channel = supabase.channel('global-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        } as any, 
        () => {
          // تعيين مؤشر وجود رسائل جديدة
          if (document.hidden) {
            setHasNewMessages(true);
            
            // تشغيل صوت الإشعار
            try {
              const audio = new Audio('/message-notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(err => console.error('خطأ في تشغيل الصوت:', err));
            } catch (error) {
              console.error('خطأ في تشغيل صوت الإشعار:', error);
            }
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
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);
  
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
  
  return <ChatLayout />;
};

export default ChatRooms;
