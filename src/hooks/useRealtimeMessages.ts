
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

  // تحميل الرسائل
  const fetchMessages = useCallback(async () => {
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
      } else {
        setLoading(false);
        return; // لم يتم توفير معرف الغرفة أو معرف المستقبل
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
          .select('id, username')
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
      toast({
        title: "خطأ",
        description: "لم نتمكن من تحميل الرسائل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, roomId, receiverId, toast]);

  // تحميل الرسائل الأولية
  useEffect(() => {
    if (userId && (roomId || receiverId)) {
      fetchMessages();
    }
  }, [userId, roomId, receiverId, fetchMessages]);
  
  // الاستماع لحدث تحديث الرسائل
  useEffect(() => {
    const handleRefreshMessages = () => {
      console.log("تم استلام حدث تحديث الرسائل في useRealtimeMessages");
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
      audio.volume = 0.5; // خفض مستوى الصوت ليكون أقل إزعاجاً
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (err) {
      console.error('Error playing notification sound:', err);
    }
  }, []);
  
  // الاشتراك في تحديثات الوقت الفعلي
  useEffect(() => {
    if (!userId) return;
    
    // إصلاح مشكلة الاشتراك في الوقت الفعلي باستخدام اسم قناة ثابت
    // بدون استخدام Date.now() الذي يتسبب في إنشاء اشتراكات جديدة في كل مرة
    let channelName = '';
    let filterObject = {};
    
    if (roomId) {
      // اشتراك المحادثة الجماعية - باستخدام اسم ثابت
      channelName = `room-${roomId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_id=eq.${roomId}` 
      };
    } else if (receiverId) {
      // اشتراك المحادثة الخاصة - باستخدام تسمية متسقة
      // ترتيب معرفات المستخدمين لضمان نفس اسم القناة بغض النظر عمن يبدأ
      const [firstId, secondId] = [userId, receiverId].sort();
      channelName = `private-${firstId}-${secondId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))` 
      };
    } else {
      return; // لا حاجة للاشتراك
    }
    
    console.log(`الاشتراك في القناة: ${channelName} مع الفلتر:`, filterObject);
    
    // استخدام صيغة Supabase Realtime API الصحيحة
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterObject as any, async (payload) => {
        console.log('تم استلام رسالة جديدة:', payload);
        
        try {
          const newMessage = payload.new as Message;
          
          // تجاهل الرسائل التي لدينا بالفعل
          if (messages.some(msg => msg.id === newMessage.id)) {
            console.log('الرسالة موجودة بالفعل، تم تجاهلها:', newMessage.id);
            return;
          }
          
          // الحصول على اسم المستخدم المرسل
          const { data: userData } = await supabase
            .from('users_profiles')
            .select('username')
            .eq('id', newMessage.sender_id)
            .single();
          
          const messageWithUsername = {
            ...newMessage,
            username: userData?.username || 'مستخدم'
          };
          
          // إضافة الرسالة إلى الحالة
          setMessages(prev => [...prev, messageWithUsername]);
          
          // عدم تشغيل صوت الإشعار للرسائل الخاصة بالمستخدم نفسه
          if (newMessage.sender_id !== userId) {
            playNotificationSound();
            
            // إظهار إشعار toast للرسائل الجديدة التي ليست من المستخدم الحالي
            toast({
              title: `رسالة جديدة من ${messageWithUsername.username}`,
              description: messageWithUsername.message_text.length > 30 ? 
                `${messageWithUsername.message_text.substring(0, 30)}...` :
                messageWithUsername.message_text,
              variant: "default",
            });
          }
          
          // تشغيل حدث تحديث الرسائل ليتم تحديث الواجهة على جميع الأجهزة
          const refreshEvent = new CustomEvent('refresh-messages');
          document.dispatchEvent(refreshEvent);
          
          // تنفيذ callback إذا تم توفيره
          if (onNewMessage) {
            onNewMessage(messageWithUsername);
          }
        } catch (err) {
          console.error('Error processing new message:', err);
        }
      })
      .subscribe((status) => {
        console.log(`حالة الاشتراك في ${channelName}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('تم الاشتراك بنجاح في القناة:', channelName);
          toast({
            title: "متصل",
            description: "أنت الآن متصل بنظام المراسلة المباشر",
          });
        }
      });
      
    return () => {
      console.log(`إلغاء الاشتراك من القناة: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [userId, roomId, receiverId, onNewMessage, toast, messages, playNotificationSound]);
  
  // وظيفة إرسال رسالة
  const sendMessage = async (text: string) => {
    try {
      if (!text.trim()) return false;
      
      // إنشاء كائن رسالة بأنواع صحيحة
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
        // للمحادثة الجماعية
        messageData.room_id = roomId;
      } else if (receiverId) {
        // للمحادثة الخاصة
        messageData.receiver_id = receiverId;
      } else {
        throw new Error('يجب تحديد المستلم أو غرفة المحادثة');
      }
      
      console.log('جاري إرسال الرسالة:', messageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();
        
      if (error) throw error;
      
      console.log('تم إرسال الرسالة بنجاح:', data);
      
      // تشغيل حدث تحديث الرسائل بعد إرسال الرسالة
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
    sendMessage
  };
};
