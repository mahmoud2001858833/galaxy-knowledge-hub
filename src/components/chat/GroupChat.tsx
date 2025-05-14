
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Send, User, Users, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GroupChat = ({ user }) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: any }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number>(Date.now());

  // تحسين استخدام اشتراك الوقت الفعلي
  const { refreshMessages } = useRealtimeMessages({
    userId: user?.id,
    roomId: activeRoom,
    onNewMessage: (newMsg) => {
      console.log('تم استلام رسالة جديدة:', newMsg);
      fetchMessages(activeRoom);
      if (isAutoScroll) {
        setTimeout(scrollToBottom, 100);
      }
      playNotificationSound();
    },
  });
  
  // تحسين الاستماع لحدث تحديث المحادثة الجماعية بشكل عام
  useEffect(() => {
    const handleGlobalChatUpdate = () => {
      if (activeRoom) {
        console.log('تحديث المحادثة الجماعية من الحدث العام');
        fetchMessages(activeRoom);
      }
    };
    
    document.addEventListener('global-chat-update', handleGlobalChatUpdate);
    document.addEventListener('refresh-messages', handleGlobalChatUpdate);
    
    return () => {
      document.removeEventListener('global-chat-update', handleGlobalChatUpdate);
      document.removeEventListener('refresh-messages', handleGlobalChatUpdate);
    };
  }, [activeRoom]);
  
  // إضافة اشتراك فوري للقناة لتلقي التحديثات في الوقت الحقيقي
  useEffect(() => {
    if (!activeRoom) return;
    
    const channel = supabase
      .channel(`realtime-room-${activeRoom}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoom}`
        } as any,
        (payload) => {
          console.log('تم استلام رسالة جديدة في الوقت الحقيقي:', payload);
          
          // تحديث فوري للمحادثة
          fetchMessages(activeRoom);
          
          // التمرير للأسفل تلقائياً
          if (isAutoScroll) {
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
          
          // إشعار صوتي
          playNotificationSound();
          
          // نشر حدث عام للتحديث
          const event = new CustomEvent('global-chat-update');
          document.dispatchEvent(event);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom, isAutoScroll]);

  // صوت الإشعارات
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (err) {
      console.error('Error playing notification sound:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    }
  }, [messages, isAutoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setRooms(data || []);

      // Set the first room as active by default
      if (data && data.length > 0 && !activeRoom) {
        setActiveRoom(data[0].id);
        setRoomName(data[0].name);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "خطأ في تحميل الغرف",
        description: "حدث خطأ أثناء تحميل غرف المحادثة، يرجى المحاولة مرة أخرى"
      });
    }
  };

  const fetchMessages = async (roomId: string) => {
    if (!roomId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Collect all unique user IDs
      const userIds = [...new Set((data || []).map(msg => msg.sender_id))];
      await fetchUserProfiles(userIds);
      
      // تحديث وقت آخر تحديث للرسائل
      setLastMessageTimestamp(Date.now());
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل، يرجى المحاولة مرة أخرى"
      });
    }
  };

  const fetchUserProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (error) throw error;

      if (data) {
        const profilesMap = data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        setProfiles(prev => ({ ...prev, ...profilesMap }));
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !user || !activeRoom || isMessageSending) return;

    setIsMessageSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            room_id: activeRoom,
            message_text: message.trim(),
          },
        ]);

      if (error) throw error;

      // Clear the input
      setMessage('');
      
      // تأكيد من التمرير لأسفل بعد إرسال الرسالة
      setIsAutoScroll(true);
      
      // تحديث الرسائل فوراً
      fetchMessages(activeRoom);
      
      // نشر حدث للتحديث الفوري - يسرع عملية التحديث لجميع المستخدمين
      const refreshEvent = new CustomEvent('global-chat-update');
      document.dispatchEvent(refreshEvent);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setIsMessageSending(false);
    }
  };

  // تحديث المحادثة يدوياً
  const handleRefreshChat = () => {
    if (activeRoom) {
      fetchMessages(activeRoom);
      toast({
        title: "تم التحديث",
        description: "تم تحديث المحادثة بنجاح",
      });
    }
  };

  // Render message with improved styling
  const renderMessage = (msg) => {
    const isCurrentUser = msg.sender_id === user?.id;
    const senderProfile = profiles[msg.sender_id];
    
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 ml-2 mt-1">
            {senderProfile?.avatar_url ? (
              <AvatarImage src={senderProfile.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800">
                {senderProfile?.username?.[0] || ''}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        
        <div 
          className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
        >
          {!isCurrentUser && (
            <span className="text-xs text-white/70 mb-1 mr-1">
              {senderProfile?.username || 'مستخدم'}
            </span>
          )}
          <div
            className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-bl-none'
            }`}
          >
            {msg.message_text}
          </div>
          <span className="text-xs text-white/40 mt-1 mx-1">
            {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 flex flex-col overflow-hidden relative">
      <CardHeader className="p-4 flex-row justify-between items-center border-b border-white/10 bg-white/5">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          {roomName || "المحادثة الجماعية"}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshChat}
          className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
          title="تحديث المحادثة"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>تحديث</span>
        </Button>
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        {activeRoom ? (
          <>
            {/* أزرار التنقل للرسائل */}
            <div className="fixed left-4 bottom-24 z-50 flex flex-col gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50"
                onClick={scrollToTop}
                title="التنقل لأول الرسائل"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50"
                onClick={scrollToBottom}
                title="التنقل لآخر الرسائل"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages area */}
            <ScrollArea className="h-[calc(100%-64px)]">
              <div className="p-4 space-y-1">
                <div ref={messagesStartRef} />
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-10">
                    <p className="text-white/50">لا توجد رسائل بعد</p>
                  </div>
                ) : (
                  messages.map(renderMessage)
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="اكتب رسالة..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || isMessageSending}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isMessageSending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Users className="h-16 w-16 text-blue-500/70 mx-auto" />
              <h3 className="text-xl font-medium text-white">اختر غرفة محادثة</h3>
              <p className="text-white/50">اختر غرفة محادثة جماعية للمشاركة</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupChat;
