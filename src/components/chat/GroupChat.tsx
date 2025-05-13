
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
import { Badge } from '@/components/ui/badge';

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
  const [forceRefresh, setForceRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // استخدام hook الرسائل المباشرة المحسّنة
  const { messages, loading: messagesLoading, sendMessage, refreshMessages } = useRealtimeMessages({
    userId: user?.id,
    roomId: currentGroup,
    onNewMessage: () => {
      // التمرير للأسفل عند وصول رسائل جديدة بشكل أسرع
      setTimeout(() => scrollToBottom(), 50);
    }
  });

  // تحميل المجموعات - مع تحسينات الأداء
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.id) return;
      
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

    if (user?.id) {
      fetchGroups();
    }
  }, [toast, currentGroup, user?.id]);

  // تحسين الاستماع لحدث تحديث الرسائل
  useEffect(() => {
    const handleRefreshMessages = () => {
      if (user?.id && currentGroup) {
        refreshMessages();
      }
      scrollToBottom();
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, [user?.id, currentGroup, refreshMessages]);

  // تأثير للتحديث القسري - تحسين الاستجابة
  useEffect(() => {
    if (forceRefresh > 0 && user?.id && currentGroup) {
      refreshMessages();
      scrollToBottom();
    }
  }, [forceRefresh, user?.id, currentGroup, refreshMessages]);

  // تمرير للأسفل عند تحميل الرسائل أو تغيير المجموعة
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentGroup]);

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
        
        // تحسين تحديث الرسائل بعد الإرسال
        refreshMessages();
        setTimeout(() => scrollToBottom(), 50);
        
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
    refreshMessages();
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
  
  // الحصول على اسم المجموعة الحالية
  const getCurrentGroupName = () => {
    const group = groups.find(g => g.id === currentGroup);
    return group?.name || 'مجموعة';
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
          {/* تحسين تصميم واجهة المستخدم */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center gap-2 p-1 px-2 bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-500/20">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={currentGroup === group.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentGroup(group.id)}
                  className={`flex items-center gap-2 ${currentGroup === group.id ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-800/50'}`}
                >
                  <Users className="h-4 w-4" />
                  <span>{group.name}</span>
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline"
              onClick={handleRefreshManually}
              className="flex items-center gap-1 bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>تحديث</span>
            </Button>
          </div>

          <div className="h-[450px] bg-gradient-to-br from-purple-950/50 to-blue-900/20 backdrop-blur-sm rounded-lg border border-purple-500/20 overflow-y-auto flex flex-col p-4 w-full shadow-lg">
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-medium">{getCurrentGroupName()}</h3>
              </div>
              <Badge variant="outline" className="bg-purple-900/50 border-purple-500/30 text-purple-300 text-xs">
                محادثة جماعية
              </Badge>
            </div>
          
            <div className="flex-1 space-y-4 overflow-y-auto px-2">
              {messages.length === 0 && !messagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/70">
                  <MessageSquare className="h-12 w-12 mb-2 text-purple-400/60" />
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
                    transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
                    className={`flex ${message.sender_id === user.id ? 'justify-start flex-row-reverse' : 'justify-start'} gap-2`}
                  >
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarFallback className={message.sender_id === user.id ? 'bg-purple-700' : 'bg-blue-700'}>
                          {message.username?.[0] || "م"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={`max-w-[70%] ${
                      message.sender_id === user.id 
                        ? 'bg-gradient-to-r from-purple-600/40 to-purple-500/30 border-purple-500/30' 
                        : 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 border-blue-500/30'
                      } border rounded-lg p-3 shadow-md`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs text-white/70 ${message.sender_id === user.id ? 'order-2' : 'order-1'}`}>
                          {formatMessageTime(message.created_at)}
                        </span>
                        <span className={`font-semibold text-sm ${
                          message.sender_id === user.id ? 'text-purple-300 order-1' : 'text-blue-300 order-2'
                        }`}>
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border border-purple-500/30 shadow-md">
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
                className="flex-1 bg-purple-900/30 border-purple-500/30 text-white placeholder:text-white/50 text-right focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
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
