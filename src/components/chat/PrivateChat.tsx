
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Search, UserPlus, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface PrivateChatProps {
  user: any;
}

interface PrivateChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

interface ChatContact {
  id: string;
  chat_id: string;
  username: string;
  user_id: string;
  last_message?: string;
  last_message_time?: string;
}

interface UserProfile {
  id: string;
  username: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ user }) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // فتح القناة للتحديثات المباشرة
  useEffect(() => {
    if (!currentChat) return;
    
    const channel = supabase
      .channel('public:private_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `chat_id=eq.${currentChat}`
        },
        async (payload) => {
          if (payload.new && currentChat === payload.new.chat_id) {
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
              } as PrivateChatMessage;
              
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
  }, [currentChat]);

  // تحميل جهات الاتصال
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // الحصول على جهات الاتصال
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('contact_id')
          .eq('user_id', user.id);

        if (contactsError) throw contactsError;
        
        if (!contactsData || contactsData.length === 0) {
          setLoading(false);
          return;
        }

        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // الحصول على معلومات المستخدمين
        const { data: usersData, error: usersError } = await supabase
          .from('users_profiles')
          .select('id, username')
          .in('id', contactIds);

        if (usersError) throw usersError;
        
        // الحصول على المحادثات الخاصة
        const chatsPromises = contactIds.map(async (contactId) => {
          // البحث عن محادثة خاصة موجودة بين المستخدمين
          const { data: participantsData } = await supabase
            .from('private_chat_participants')
            .select('chat_id')
            .eq('user_id', user.id);

          if (!participantsData || participantsData.length === 0) {
            return null;
          }

          const chatIds = participantsData.map(p => p.chat_id);
          
          const { data: contactParticipations } = await supabase
            .from('private_chat_participants')
            .select('chat_id')
            .eq('user_id', contactId)
            .in('chat_id', chatIds);

          let chatId = null;
          
          if (contactParticipations && contactParticipations.length > 0) {
            chatId = contactParticipations[0].chat_id;
            
            // الحصول على آخر رسالة
            const { data: lastMessageData } = await supabase
              .from('private_messages')
              .select('content, created_at')
              .eq('chat_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1);

            const userData = usersData?.find(u => u.id === contactId);
            
            return {
              id: contactId,
              chat_id: chatId,
              username: userData?.username || 'مستخدم',
              user_id: contactId,
              last_message: lastMessageData?.[0]?.content,
              last_message_time: lastMessageData?.[0]?.created_at,
            };
          }
          
          return null;
        });

        const chatsResults = await Promise.all(chatsPromises);
        const validChats = chatsResults.filter(chat => chat !== null) as ChatContact[];
        
        setContacts(validChats);
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
  }, [user, toast]);

  // تحميل الرسائل عند تغيير المحادثة
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      
      try {
        setLoading(true);
        
        const { data: messagesData, error } = await supabase
          .from('private_messages')
          .select('id, content, created_at, user_id')
          .eq('chat_id', currentChat)
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
  }, [currentChat, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChat) return;
    
    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('private_messages')
        .insert({
          chat_id: currentChat,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من إرسال الرسالة",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      
      // البحث عن المستخدمين
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('خطأ في البحث عن المستخدمين:', error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من البحث عن المستخدمين",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddContact = async (contactId: string) => {
    try {
      // التحقق من وجود جهة الاتصال مسبقاً
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', contactId);

      if (checkError) throw checkError;
      
      if (existingContact && existingContact.length > 0) {
        toast({
          title: "جهة الاتصال موجودة بالفعل",
          description: "لقد قمت بإضافة هذا المستخدم مسبقاً",
          variant: "default",
        });
        return;
      }

      // إضافة جهة الاتصال
      const { error: addError } = await supabase
        .from('contacts')
        .insert([
          { user_id: user.id, contact_id: contactId }
        ]);

      if (addError) throw addError;
      
      // إنشاء محادثة خاصة
      const { data: chatData, error: chatError } = await supabase
        .from('private_chats')
        .insert({})
        .select();

      if (chatError) throw chatError;
      
      const chatId = chatData[0].id;
      
      // إضافة المستخدمين كمشاركين في المحادثة
      await supabase
        .from('private_chat_participants')
        .insert([
          { chat_id: chatId, user_id: user.id },
          { chat_id: chatId, user_id: contactId }
        ]);

      // الحصول على معلومات المستخدم المضاف
      const { data: userData, error: userError } = await supabase
        .from('users_profiles')
        .select('username')
        .eq('id', contactId)
        .single();

      if (userError) throw userError;
      
      // إضافة جهة الاتصال للقائمة
      const newContact: ChatContact = {
        id: contactId,
        chat_id: chatId,
        username: userData?.username || 'مستخدم',
        user_id: contactId
      };
      
      setContacts(prev => [...prev, newContact]);
      setIsAddContactDialogOpen(false);
      
      toast({
        title: "تمت إضافة جهة الاتصال",
        description: `تمت إضافة ${userData?.username} إلى جهات الاتصال الخاصة بك`,
        variant: "default",
      });
      
      // تحديد المحادثة الجديدة كمحادثة حالية
      setCurrentChat(chatId);
      setCurrentContactId(contactId);
    } catch (error) {
      console.error('خطأ في إضافة جهة الاتصال:', error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من إضافة جهة الاتصال",
        variant: "destructive",
      });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { 
      locale: arSA, 
      addSuffix: true 
    });
  };

  const getChatHeaderName = () => {
    if (!currentContactId) return '';
    const contact = contacts.find(c => c.id === currentContactId);
    return contact?.username || '';
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* زر إضافة جهة اتصال */}
      <div className="flex justify-end">
        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <UserPlus className="h-4 w-4 mr-2" /> إضافة جهة اتصال
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">البحث عن مستخدمين</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSearch} className="flex gap-2 my-4">
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مستخدم..."
                className="flex-1 text-right"
              />
            </form>
            
            <div className="max-h-[300px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground">لا توجد نتائج</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddContact(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" /> إضافة
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <span>{user.username}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.username[0] || "م"}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <UserPlus className="h-16 w-16 text-cyan-400/60 mx-auto" />
            <p className="text-white/70 mt-4 mb-6">لا توجد محادثات خاصة بعد</p>
            <Button 
              onClick={() => setIsAddContactDialogOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" /> إضافة جهة اتصال
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[450px]">
          {/* قائمة جهات الاتصال */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <h3 className="font-semibold text-white">جهات الاتصال</h3>
            </div>
            
            <div className="overflow-y-auto h-[402px]">
              {contacts.map(contact => (
                <motion.button
                  key={contact.id}
                  className={`w-full text-right p-3 border-b border-white/10 hover:bg-white/10 transition-colors flex flex-col ${currentContactId === contact.id ? 'bg-white/10' : ''}`}
                  onClick={() => {
                    setCurrentChat(contact.chat_id);
                    setCurrentContactId(contact.id);
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">
                      {contact.last_message_time && formatMessageTime(contact.last_message_time)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.username}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{contact.username[0] || "م"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {contact.last_message && (
                    <p className="text-white/70 text-sm truncate mt-1">
                      {contact.last_message}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* منطقة المحادثة */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden flex flex-col">
            {currentChat ? (
              <>
                <div className="p-3 border-b border-white/10 flex justify-between items-center">
                  <div></div> {/* عنصر فارغ للحفاظ على التوازن */}
                  <h3 className="font-semibold text-white">{getChatHeaderName()}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/70">
                      <MessageSquare className="h-12 w-12 mb-2 text-cyan-400/60" />
                      <p>لا توجد رسائل بعد. ابدأ المحادثة!</p>
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
                
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/70">
                <MessageSquare className="h-16 w-16 mb-2 text-cyan-400/30" />
                <p>اختر محادثة للبدء</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;
