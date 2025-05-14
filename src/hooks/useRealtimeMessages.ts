
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  room_id?: string;
  message_text: string;
  created_at: string;
  username?: string;
}

interface UseRealtimeMessagesProps {
  userId: string;
  roomId?: string | null;
  receiverId?: string | null;
  onNewMessage?: (message: Message) => void;
}

export const useRealtimeMessages = ({ 
  userId, 
  roomId = null, 
  receiverId = null,
  onNewMessage 
}: UseRealtimeMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // تحميل الرسائل - تحسين سرعة التحميل
  const fetchMessages = useCallback(async () => {
    if (!userId || (!roomId && !receiverId)) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (roomId) {
        // رسائل المحادثات الجماعية
        query = query.eq('room_id', roomId);
      } else if (receiverId) {
        // رسائل المحادثات الخاصة (حيث المستخدم إما مرسل أو مستقبل)
        query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // جلب أسماء المستخدمين لكل رسالة
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(msg => msg.sender_id))];
        const { data: usersData, error: usersError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
          
        if (usersError) {
          console.error('خطأ في تحميل معلومات المستخدمين:', usersError);
        }
        
        const usersMap = (usersData || []).reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {} as Record<string, string>);
        
        const messagesWithUsernames = data.map(msg => ({
          ...msg,
          username: usersMap[msg.sender_id] || 'مستخدم'
        }));
        
        setMessages(messagesWithUsernames);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  }, [userId, roomId, receiverId, toast]);

  // تحميل الرسائل الأولية - تنفذ بشكل أسرع
  useEffect(() => {
    if (userId && (roomId || receiverId)) {
      fetchMessages();
    }
  }, [userId, roomId, receiverId, fetchMessages]);
  
  // تحسين نظام الاستماع للتحديثات وتسريع استجابة المحادثات
  useEffect(() => {
    // تحديث الرسائل عند التغيير
    const handleRefreshMessages = () => {
      if (userId && (roomId || receiverId)) {
        console.log("تحديث الرسائل من حدث مخصص");
        fetchMessages();
      }
    };
    
    // إضافة مستمع لحدث التحديث المخصص
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    // إنشاء قناة مباشرة للاشتراك في التغييرات
    let channel;
    if (userId) {
      if (roomId) {
        // الاستماع لرسائل غرفة محددة
        channel = supabase.channel(`room-${roomId}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `room_id=eq.${roomId}`
            } as any, 
            (payload) => {
              console.log('تم استلام رسالة جديدة في الغرفة:', payload);
              fetchMessages();
              playNotificationSound();
              
              // بث حدث عام لتحديث جميع المستخدمين
              const refreshEvent = new CustomEvent('global-chat-update');
              document.dispatchEvent(refreshEvent);
              
              if (onNewMessage && payload.new) {
                onNewMessage(payload.new as Message);
              }
            }
          )
          .subscribe();
      } else if (receiverId) {
        // الاستماع للرسائل الخاصة
        const [firstId, secondId] = [userId, receiverId].sort();
        channel = supabase.channel(`private-${firstId}-${secondId}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))`
            } as any, 
            (payload) => {
              console.log('تم استلام رسالة خاصة جديدة:', payload);
              fetchMessages();
              playNotificationSound();
              
              if (onNewMessage && payload.new) {
                onNewMessage(payload.new as Message);
              }
            }
          )
          .subscribe();
      }
    }
    
    // تحسين الاستماع للتحديثات العالمية
    const handleGlobalUpdate = () => {
      console.log('تم استلام تحديث عام للمحادثة');
      fetchMessages();
    };
    
    document.addEventListener('global-chat-update', handleGlobalUpdate);
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      document.removeEventListener('refresh-messages', handleRefreshMessages);
      document.removeEventListener('global-chat-update', handleGlobalUpdate);
    };
  }, [userId, roomId, receiverId, fetchMessages, onNewMessage]);
  
  // تشغيل صوت الإشعار
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (err) {
      console.error('Error playing notification sound:', err);
    }
  }, []);
  
  // وظيفة إرسال رسالة - تحسين الأداء وإضافة تحديث مباشر
  const sendMessage = async (text: string) => {
    try {
      if (!text.trim()) return false;
      
      const messageData: {
        sender_id: string;
        message_text: string;
        room_id?: string;
        receiver_id?: string;
      } = {
        sender_id: userId,
        message_text: text.trim()
      };
      
      if (roomId) {
        messageData.room_id = roomId;
      } else if (receiverId) {
        messageData.receiver_id = receiverId;
      } else {
        throw new Error('يجب تحديد المستلم أو غرفة المحادثة');
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();
        
      if (error) throw error;
      
      // تحديث سريع للرسائل بعد الإرسال
      fetchMessages();
      
      // بث حدث تحديث الرسائل - تحسين السرعة
      const refreshEvent = new CustomEvent('refresh-messages');
      document.dispatchEvent(refreshEvent);
      
      // بث حدث عام لتحديث جميع المستخدمين
      const globalEvent = new CustomEvent('global-chat-update');
      document.dispatchEvent(globalEvent);
      
      return true;
    } catch (err: any) {
      console.error('خطأ في إرسال الرسالة:', err);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: err.message || "لم نتمكن من إرسال الرسالة",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages: fetchMessages // إضافة وظيفة تحديث مباشرة
  };
};
