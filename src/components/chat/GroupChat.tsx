
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Send, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GroupChat = ({ user }) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: any }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isMessageSending, setIsMessageSending] = useState(false);

  // Use realtime subscription for messages
  useRealtimeMessages({
    userId: user?.id,
    onNewMessage: () => {
      if (activeRoom) {
        fetchMessages(activeRoom);
      }
    },
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        description: "حدث خطأ أثناء تحميل غرف المحادثة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (roomId: string) => {
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
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل، يرجى المحاولة مرة أخرى",
        variant: "destructive",
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
      
      // Fetch updated messages instead of refreshing the whole page
      fetchMessages(activeRoom);
      
      // Add the new message to the UI immediately for a more responsive feel
      const newMessage = {
        id: Date.now().toString(), // Temporary ID
        sender_id: user.id,
        room_id: activeRoom,
        message_text: message.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsMessageSending(false);
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
    <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 flex flex-col overflow-hidden">
      <CardHeader className="p-4 flex-row justify-between items-center border-b border-white/10 bg-white/5">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          {roomName || "المحادثة الجماعية"}
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        {activeRoom ? (
          <>
            {/* Messages area */}
            <ScrollArea className="h-[calc(100%-64px)]">
              <div className="p-4 space-y-1">
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
                  <Send className="h-5 w-5" />
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
