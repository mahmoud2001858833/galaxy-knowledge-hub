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
import ChatMessage from './ChatMessage';

const GroupChat = ({
  user
}) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{
    [key: string]: any;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // تحسين استخدام اشتراك الوقت الفعلي
  const { refreshMessages } = useRealtimeMessages({
    userId: user?.id,
    roomId: activeRoom,
    onNewMessage: newMsg => {
      console.log('تم استلام رسالة جديدة:', newMsg);
      fetchMessages(activeRoom);
      if (isAutoScroll) {
        setTimeout(scrollToBottom, 100);
      }
      playNotificationSound();
    }
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
    const channel = supabase.channel(`realtime-room-${activeRoom}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${activeRoom}`
    } as any, payload => {
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
    }).subscribe();
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const scrollToTop = () => {
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const fetchRooms = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('group_chats').select('*').order('created_at', {
        ascending: true
      });
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
      const {
        data,
        error
      } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      setMessages(data || []);

      // Collect all unique user IDs
      const userIds = [...new Set((data || []).map(msg => msg.sender_id))];
      await fetchUserProfiles(userIds);
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
      const {
        data,
        error
      } = await supabase.from('users_profiles').select('id, username, avatar_url').in('id', userIds);
      if (error) throw error;
      if (data) {
        const profilesMap = data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        setProfiles(prev => ({
          ...prev,
          ...profilesMap
        }));
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
        .insert([{
          sender_id: user.id,
          room_id: activeRoom,
          message_text: message.trim()
        }]);
        
      if (error) throw error;

      setMessage('');
      setIsAutoScroll(true);
      
      // Immediate refresh and scroll
      await fetchMessages(activeRoom);
      setTimeout(scrollToBottom, 100);
      
      // Global update event
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
        description: "تم تحديث المحادثة بنجاح"
      });
    }
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${isMobile ? 'bg-gradient-to-br from-emerald-950 to-emerald-900' : 'bg-gradient-to-br from-emerald-900/20 to-emerald-900/10'}`}>
      {/* Enhanced Header for Mobile */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} flex justify-between items-center border-b border-white/10 bg-emerald-900/30 backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <h3 className={`text-white font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {roomName || "المحادثة الجماعية"}
          </h3>
        </div>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={handleRefreshChat}
          className="bg-emerald-900/30 border-emerald-500/30 hover:bg-emerald-800/50 text-white" 
          title="تحديث المحادثة"
        >
          <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ml-1`} />
          {!isMobile && <span>تحديث</span>}
        </Button>
      </div>

      {activeRoom ? (
        <>
          {/* Enhanced Navigation buttons for Mobile */}
          <div className={`fixed ${isMobile ? 'left-2 bottom-20' : 'left-4 bottom-24'} z-50 flex flex-col gap-2`}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollToTop}
              className={`rounded-full bg-emerald-900/70 border-emerald-500/30 hover:bg-emerald-800/80 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}
            >
              <ArrowUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollToBottom}
              className={`rounded-full bg-emerald-900/70 border-emerald-500/30 hover:bg-emerald-800/80 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}
            >
              <ArrowDown className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
            </Button>
          </div>

          {/* Enhanced Messages area for Mobile */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-2`}>
                <div ref={messagesStartRef} />
                {messages.length === 0 ? (
                  <div className={`flex items-center justify-center ${isMobile ? 'p-8' : 'p-10'}`}>
                    <p className="text-white/50 text-center">
                      لا توجد رسائل بعد. كن أول من يبدأ المحادثة!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const contact = isCurrentUser ? user : profiles[message.sender_id];
                    return (
                      <ChatMessage 
                        key={message.id} 
                        message={message} 
                        isCurrentUser={isCurrentUser}
                        contact={contact}
                        user={user}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Enhanced Message input for Mobile */}
          <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-white/10 bg-emerald-900/30 backdrop-blur-sm`}>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input 
                placeholder="اكتب رسالة..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isMobile ? 'text-base' : ''}`}
                style={{ fontSize: isMobile ? '16px' : undefined }} // Prevent zoom on iOS
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || isMessageSending}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shrink-0"
                size={isMobile ? "default" : "default"}
              >
                {isMessageSending ? (
                  <div className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} animate-spin rounded-full border-2 border-t-transparent border-white`} />
                ) : (
                  <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                )}
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-emerald-500/70 mx-auto" />
            <h3 className="text-xl font-medium text-white">اختر غرفة محادثة</h3>
            <p className="text-white/50">اختر غرفة محادثة جماعية للمشاركة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
