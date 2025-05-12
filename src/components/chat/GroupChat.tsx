
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

interface GroupChatProps {
  user: any;
}

interface ChatGroup {
  id: string;
  name: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ user }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // إضافة متغير للتحديث القسري
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // استخدام hook الرسائل المباشرة
  const { messages, loading: messagesLoading, sendMessage } = useRealtimeMessages({
    userId: user?.id,
    roomId: currentGroup,
    onNewMessage: () => {
      // التمرير للأسفل عند وصول رسائل جديدة
      setTimeout(() => scrollToBottom(), 100);
    }
  });

  // تحميل المجموعات
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('group_chats')
          .select('id, name')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('خطأ في تحميل المجموعات:', error);
          throw error;
        }
        
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

  // إضافة الاستماع لحدث تحديث الرسائل
  useEffect(() => {
    const handleRefreshMessages = () => {
      console.log("تم استلام حدث تحديث الرسائل في المحادثة الجماعية");
      // إعادة تحميل الصفحة بشكل كامل
      setForceRefresh(prev => prev + 1); // تحديث الحالة لإعادة تنفيذ useEffect
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, []);

  // تأثير للتحديث القسري
  useEffect(() => {
    if (forceRefresh > 0) {
      // سيتم تحديث الرسائل تلقائيًا من خلال hook
      console.log("تنفيذ التحديث القسري للرسائل", forceRefresh);
      scrollToBottom();
    }
  }, [forceRefresh]);

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
      const success = await sendMessage(newMessage);
      
      if (success) {
        setNewMessage(''); // مسح حقل الإدخال
        
        // تشغيل حدث تحديث الرسائل لجميع المستخدمين
        const refreshEvent = new CustomEvent('refresh-messages');
        document.dispatchEvent(refreshEvent);
        
        // إضافة تحديث قسري للصفحة الحالية أيضًا
        setForceRefresh(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('خطأ في إرسال الرسالة:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRefreshManually = () => {
    console.log("تحديث يدوي للرسائل");
    setForceRefresh(prev => prev + 1);
    toast({
      title: "تم التحديث",
      description: "تم تحديث المحادثة بنجاح",
    });
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
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex flex-wrap gap-2">
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
            
            <Button 
              variant="outline"
              onClick={handleRefreshManually}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>تحديث</span>
            </Button>
          </div>

          <div className="h-[450px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-y-auto flex flex-col p-4 w-full">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 && !messagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/70">
                  <MessageSquare className="h-12 w-12 mb-2 text-cyan-400/60" />
                  <p>لا توجد رسائل بعد. كن أول من يبدأ المحادثة!</p>
                </div>
              ) : messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex ${message.sender_id === user.id ? 'justify-start flex-row-reverse' : 'justify-start'} gap-2`}
                  >
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarFallback className={message.sender_id === user.id ? 'bg-cyan-700' : 'bg-gray-700'}>
                          {message.username?.[0] || "م"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={`max-w-[70%] ${message.sender_id === user.id ? 'bg-cyan-600/40 border-cyan-500/30' : 'bg-gray-600/30 border-gray-500/30'} border rounded-lg p-3`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs text-white/70 ${message.sender_id === user.id ? 'order-2' : 'order-1'}`}>
                          {formatMessageTime(message.created_at)}
                        </span>
                        <span className={`font-semibold text-sm ${message.sender_id === user.id ? 'text-cyan-300 order-1' : 'text-white order-2'}`}>
                          {message.sender_id === user.id ? 'أنت' : message.username}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap break-words text-right">{message.message_text}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Button 
                type="submit" 
                disabled={sendingMessage || !newMessage.trim() || !currentGroup} 
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
                disabled={sendingMessage || !currentGroup}
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupChat;
