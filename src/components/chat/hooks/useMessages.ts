
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useMessages = (userId: string | null, selectedContact: any | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);

  // Fetch messages
  const fetchMessages = async () => {
    if (!userId || !selectedContact?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  // Send message function
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !userId || !selectedContact || isMessageSending) return;

    setIsMessageSending(true);
    try {
      // Capture the contact here to ensure we don't lose reference
      const currentContact = selectedContact;

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            receiver_id: currentContact.id,
            message_text: messageText.trim()
          }
        ]);

      if (error) throw error;
      
      // Clear input but maintain the same chat
      setMessage('');
      
      // Add the new message to UI immediately for better UX
      const newMessage = {
        id: Date.now().toString(),
        sender_id: userId,
        receiver_id: currentContact.id,
        message_text: messageText.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsMessageSending(false);
    }
  };

  // Effect to fetch messages when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact, userId]);

  return {
    messages,
    message,
    setMessage,
    sendMessage,
    fetchMessages,
    isMessageSending
  };
};
