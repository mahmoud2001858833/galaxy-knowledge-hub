
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

interface PrivateChatProps {
  user: any;
}

interface Contact {
  id: string;
  user_id: string;
  contact_id: string;
  created_at: string;
  contactUser?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

const PrivateChat: React.FC<PrivateChatProps> = ({ user }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentContact, setCurrentContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // إضافة متغير للتحديث القسري
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // استخدام hook الرسائل المباشرة
  const { messages, loading: messagesLoading, sendMessage } = useRealtimeMessages({
    userId: user?.id,
    receiverId: currentContact,
    onNewMessage: () => {
      // التمرير للأسفل عند وصول رسائل جديدة
      setTimeout(() => scrollToBottom(), 100);
    }
  });

  // تحميل جهات الاتصال
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // جلب جهات الاتصال مع معلومات المستخدم
        const { data, error } = await supabase
          .from('contacts')
          .select('*, contactUser:contact_id(id, username, avatar_url)')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('خطأ في تحميل جهات الاتصال:', error);
          throw error;
        }
        
        setContacts(data || []);
        
        // تعيين جهة الاتصال الافتراضية
        if (data && data.length > 0 && !currentContact) {
          setCurrentContact(data[0].contact_id);
        }
      } catch (error) {
        console.error('خطأ في تحميل جهات الاتصال:', error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل جهات الاتصال",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [toast, user.id, currentContact]);

  // إضافة الاستماع لحدث تحديث الرسائل
  useEffect(() => {
    const handleRefreshMessages = () => {
      console.log("تم استلام حدث تحديث الرسائل في المحادثة الخاصة");
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
      console.log("تنفيذ التحديث القسري للرسائل الخاصة", forceRefresh);
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
    
    if (!newMessage.trim() || !currentContact) return;
    
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
  
  const getCurrentContactName = () => {
    const contact = contacts.find(c => c.contact_id === currentContact);
    return contact?.contactUser?.username || 'مستخدم';
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }
  
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-8 bg-white/5 rounded-xl text-center">
          <User className="h-12 w-12 mx-auto text-white/40 mb-4" />
          <h3 className="text-white text-lg mb-2">لا توجد جهات اتصال</h3>
          <p className="text-white/70 mb-6">لم تقم بإضافة أي جهة اتصال بعد.</p>
          <p className="text-white/70 text-sm">
            يمكنك إضافة جهات اتصال من خلال الزر الموجود في أسفل الصفحة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          {contacts.map((contact) => (
            <Button
              key={contact.id}
              variant={currentContact === contact.contact_id ? "default" : "outline"}
              onClick={() => setCurrentContact(contact.contact_id)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>{contact.contactUser?.username || 'مستخدم'}</span>
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
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
          <h3 className="text-white font-medium">{getCurrentContactName()}</h3>
        </div>
        
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
            disabled={sendingMessage || !newMessage.trim() || !currentContact} 
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
            disabled={sendingMessage || !currentContact}
          />
        </form>
      </div>
    </div>
  );
};

export default PrivateChat;
