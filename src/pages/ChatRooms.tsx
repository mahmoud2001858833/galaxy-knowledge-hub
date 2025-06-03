
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatTabs from '@/components/chat/ChatTabs';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
        
        // جلب بيانات المستخدم من جدول profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser(profile);
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

    // Set page title
    document.title = "المحادثات - منصة تعليمية";
    return () => {
      document.title = "منصة تعليمية";
    };
  }, [navigate]);

  // Improve real-time message notification system
  useEffect(() => {
    if (!userId) return;

    const messagesChannel = supabase.channel('messages-notifications').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    } as any, payload => {
      if (document.hidden) {
        setHasNewMessages(true);
        playNotificationSound();
      }

      const globalEvent = new CustomEvent('global-chat-update');
      document.dispatchEvent(globalEvent);
    }).subscribe();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setHasNewMessages(false);
        const globalEvent = new CustomEvent('global-chat-update');
        document.dispatchEvent(globalEvent);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

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

  // Effect for new message title
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

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.error('Error playing sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const refreshMessages = () => {
    const refreshEvent = new CustomEvent('refresh-messages');
    document.dispatchEvent(refreshEvent);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-950 to-purple-950 z-50 flex items-center justify-center">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-950 to-purple-950 z-50 overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <ChatTabs user={user} />
      </div>
    </div>
  );
};

export default ChatRooms;
