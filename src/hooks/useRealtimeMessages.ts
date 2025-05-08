
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
  
  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5; // Lower the volume to make it less intrusive
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (err) {
      console.error('Error playing notification sound:', err);
    }
  }, []);
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;
    
    // Fixing the realtime subscription issue by using a consistent channel name
    // without Date.now() which causes new subscriptions each time
    let channelName = '';
    let filterObject = {};
    
    if (roomId) {
      // Group chat subscription - using a fixed name, not including Date.now()
      channelName = `room-${roomId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_id=eq.${roomId}` 
      };
    } else if (receiverId) {
      // Private chat subscription - using consistent naming
      // Order user IDs to ensure the same channel name regardless of who initiates
      const [firstId, secondId] = [userId, receiverId].sort();
      channelName = `private-${firstId}-${secondId}`;
      filterObject = { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))` 
      };
    } else {
      return; // No subscription needed
    }
    
    console.log(`Subscribing to channel: ${channelName} with filter:`, filterObject);
    
    // Using the correct Supabase Realtime API syntax
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterObject as any, async (payload) => {
        console.log('New message received:', payload);
        
        try {
          const newMessage = payload.new as Message;
          
          // Only process messages we don't already have
          if (messages.some(msg => msg.id === newMessage.id)) {
            console.log('Message already exists, skipping:', newMessage.id);
            return;
          }
          
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
          setMessages(prev => [...prev, messageWithUsername]);
          
          // Don't play notification sound for the sender's own messages
          if (newMessage.sender_id !== userId) {
            playNotificationSound();
            
            // Show toast notification for new messages not from the current user
            toast({
              title: `رسالة جديدة من ${messageWithUsername.username}`,
              description: messageWithUsername.message_text.length > 30 ? 
                `${messageWithUsername.message_text.substring(0, 30)}...` :
                messageWithUsername.message_text,
              variant: "default",
            });
          }
          
          // Trigger callback if provided
          if (onNewMessage) {
            onNewMessage(messageWithUsername);
          }
        } catch (err) {
          console.error('Error processing new message:', err);
        }
      })
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to channel:', channelName);
          toast({
            title: "متصل",
            description: "أنت الآن متصل بنظام المراسلة المباشر",
          });
        }
      });
      
    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [userId, roomId, receiverId, onNewMessage, toast, messages, playNotificationSound]);
  
  // Function to send a message
  const sendMessage = async (text: string) => {
    try {
      if (!text.trim()) return false;
      
      // Create a properly typed message object
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
        // For group chat
        messageData.room_id = roomId;
      } else if (receiverId) {
        // For private chat
        messageData.receiver_id = receiverId;
      } else {
        throw new Error('يجب تحديد المستلم أو غرفة المحادثة');
      }
      
      console.log('Sending message:', messageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();
        
      if (error) throw error;
      
      console.log('Message sent successfully:', data);
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
