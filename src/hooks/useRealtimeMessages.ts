
import { useEffect, useState } from 'react';
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

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (roomId) {
          // Group chat messages
          query = query.eq('room_id', roomId);
        } else if (receiverId) {
          // Private chat messages (where the user is either sender or receiver)
          query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`);
        } else {
          setLoading(false);
          return; // Neither roomId nor receiverId provided
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Fetch usernames for each message
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
    };
    
    if (userId && (roomId || receiverId)) {
      fetchMessages();
    }
  }, [userId, roomId, receiverId, toast]);
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;
    
    let channelName = '';
    let filter = {};
    
    if (roomId) {
      // Group chat subscription
      channelName = `room-${roomId}-${Date.now()}`;
      filter = { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` };
    } else if (receiverId) {
      // Private chat subscription
      channelName = `private-${userId}-${receiverId}-${Date.now()}`;
      filter = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))` 
      };
    } else {
      return; // No subscription needed
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filter, async (payload) => {
        console.log('تم استلام رسالة جديدة:', payload);
        
        try {
          const newMessage = payload.new as Message;
          
          // Get sender username
          const { data: userData } = await supabase
            .from('users_profiles')
            .select('username')
            .eq('id', newMessage.sender_id)
            .single();
          
          const messageWithUsername = {
            ...newMessage,
            username: userData?.username || 'مستخدم'
          };
          
          // Add message to state
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, messageWithUsername];
          });
          
          // Trigger callback if provided
          if (onNewMessage) {
            onNewMessage(messageWithUsername);
          }
          
          // Play notification sound
          const audio = new Audio('/message-notification.mp3');
          audio.play().catch(e => console.log('Audio play error:', e));
        } catch (err) {
          console.error('Error processing new message:', err);
        }
      })
      .subscribe(status => {
        console.log(`حالة الاشتراك في القناة: ${status} (${channelName})`);
        if (status === 'SUBSCRIBED') {
          toast({
            title: "متصل",
            description: "أنت الآن متصل بنظام المراسلة المباشر",
          });
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, roomId, receiverId, onNewMessage, toast]);
  
  // Function to send a message
  const sendMessage = async (text: string) => {
    try {
      if (!text.trim()) return false;
      
      const messageData: Partial<Message> = {
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
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
        
      if (error) throw error;
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
