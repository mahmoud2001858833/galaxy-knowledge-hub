
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface GroupChatProps {
  user: any;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

interface ChatGroup {
  id: string;
  name: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ user }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Subscribe to realtime messages
  useEffect(() => {
    // فتح القناة للتحديثات المباشرة
    const channel = supabase
      .channel('public:group_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
        },
        async (payload) => {
          if (payload.new && payload.new.chat_id === currentGroup) {
            try {
              // الحصول على معلومات المستخدم المرسل
              const { data: userData } = await supabase
                .from('users_profiles')
                .select('username')
                .eq('id', payload.new.user_id)
                .single();
              
              const newMsg = {
                ...payload.new,
                username: userData?.username || 'مستخدم'
              } as ChatMessage;
              
              setMessages((prev) => [...prev, newMsg]);
            } catch (error) {
              console.error('خطأ في تحميل معلومات المستخدم:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGroup]);

  // تحميل المجموعات
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('group_chats')
          .select('id, name')
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        setGroups(data || []);
        
        // تحديد المجموعة الافتراضية
        if (data && data.length > 0 && !currentGroup) {
          setCurrentGroup(data[0].id);
        }
      } catch (error) {
        console.error('خطأ في تحميل المجموعات:', error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل المجموعات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [toast, currentGroup]);

  // تحميل الرسائل عند تغيير المجموعة
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentGroup) return;
      
      try {
        setLoading(true);
        const { data: messagesData, error } = await supabase
          .from('group_messages')
          .select('id, content, created_at, user_id')
          .eq('chat_id', currentGroup)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // الحصول على معلومات المستخدمين المرسلين
        if (messagesData && messagesData.length > 0) {
          const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
          const { data: usersData } = await supabase
            .from('users_profiles')
            .select('id, username')
            .in('id', userIds);

          const usersMap = (usersData || []).reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
          }, {} as Record<string, string>);

          const messagesWithUsernames = messagesData.map(msg => ({
            ...msg,
            username: usersMap[msg.user_id] || 'مستخدم'
          }));

          setMessages(messagesWithUsernames);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل الرسائل",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentGroup, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentGroup) return;
    
    try {
      setSendingMessage(true);
      
      // Optimistically add message to the UI
      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        username: 'أنت'
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      
      const { error } = await supabase
        .from('group_messages')
        .insert({
          chat_id: currentGroup,
          user_id: user.id,
          content: optimisticMsg.content
        });

      if (error) throw error;
      
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من إرسال الرسالة",
        variant: "destructive",
      });
      // Remove the optimistic message if it failed
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      setNewMessage(optimisticMsg.content);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      locale: arSA, 
      addSuffix: true 
    });
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {groups.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={currentGroup === group.id ? "default" : "outline"}
                onClick={() => setCurrentGroup(group.id)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>{group.name}</span>
              </Button>
            ))}
          </div>

          <div className="h-[450px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-y-auto flex flex-col p-4 w-full">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/70">
                  <MessageSquare className="h-12 w-12 mb-2 text-cyan-400/60" />
                  <p>لا توجد رسائل بعد. كن أول من يبدأ المحادثة!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex ${message.user_id === user.id ? 'justify-start flex-row-reverse' : 'justify-start'} gap-2`}
                  >
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarFallback className={message.user_id === user.id ? 'bg-cyan-700' : 'bg-gray-700'}>
                          {message.username?.[0] || "م"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={`max-w-[70%] ${message.user_id === user.id ? 'bg-cyan-600/40 border-cyan-500/30' : 'bg-gray-600/30 border-gray-500/30'} border rounded-lg p-3`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs text-white/70 ${message.user_id === user.id ? 'order-2' : 'order-1'}`}>
                          {formatMessageTime(message.created_at)}
                        </span>
                        <span className={`font-semibold text-sm ${message.user_id === user.id ? 'text-cyan-300 order-1' : 'text-white order-2'}`}>
                          {message.user_id === user.id ? 'أنت' : message.username}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap break-words text-right">{message.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Button 
                type="submit" 
                disabled={sendingMessage || !newMessage.trim()} 
                className="bg-cyan-600 hover:bg-cyan-700">
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right"
                disabled={sendingMessage}
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupChat;
