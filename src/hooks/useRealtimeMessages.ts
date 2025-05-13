
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
  
  // الاستماع لحدث تحديث الرسائل - تحسين السرعة
  useEffect(() => {
    const handleRefreshMessages = () => {
      if (userId && (roomId || receiverId)) {
        fetchMessages();
      }
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, [userId, roomId, receiverId, fetchMessages]);
  
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
  
  // تحسين نظام الاشتراك في تحديثات الوقت الفعلي
  useEffect(() => {
    if (!userId) return;
    
    let channelName = '';
    let filterObject = {};
    
    if (roomId) {
      channelName = `room-${roomId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_id=eq.${roomId}` 
      };
    } else if (receiverId) {
      const [firstId, secondId] = [userId, receiverId].sort();
      channelName = `private-${firstId}-${secondId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))` 
      };
    } else {
      return;
    }
    
    // استخدام ملاحظ أكثر استجابة
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterObject as any, async (payload) => {
        try {
          const newMessage = payload.new as Message;
          
          if (messages.some(msg => msg.id === newMessage.id)) {
            return;
          }
          
          // الحصول على اسم المستخدم المرسل بشكل أسرع
          const { data: userData } = await supabase
            .from('users_profiles')
            .select('username')
            .eq('id', newMessage.sender_id)
            .single();
          
          const messageWithUsername = {
            ...newMessage,
            username: userData?.username || 'مستخدم'
          };
          
          // إضافة الرسالة للحالة بشكل أسرع
          setMessages(prev => [...prev, messageWithUsername]);
          
          // إشعار صوتي للرسائل الجديدة من الآخرين
          if (newMessage.sender_id !== userId) {
            playNotificationSound();
            
            // إظهار إشعار toast للرسائل الجديدة
            toast({
              title: `رسالة جديدة من ${messageWithUsername.username}`,
              description: messageWithUsername.message_text.length > 30 ? 
                `${messageWithUsername.message_text.substring(0, 30)}...` :
                messageWithUsername.message_text,
              variant: "default",
            });
          }
          
          // تشغيل حدث تحديث الرسائل بشكل أسرع
          const refreshEvent = new CustomEvent('refresh-messages');
          document.dispatchEvent(refreshEvent);
          
          if (onNewMessage) {
            onNewMessage(messageWithUsername);
          }
        } catch (err) {
          console.error('Error processing new message:', err);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, roomId, receiverId, onNewMessage, toast, messages, playNotificationSound]);
  
  // وظيفة إرسال رسالة - تحسين الأداء
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
      const refreshEvent = new CustomEvent('refresh-messages');
      document.dispatchEvent(refreshEvent);
      
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
