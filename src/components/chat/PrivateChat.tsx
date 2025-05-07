import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, UserPlus, Search, X, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface PrivateChatProps {
  user: any;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface ChatRoom {
  id: string;
  contact: UserProfile;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // تحميل جهات الاتصال للمستخدم
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // الحصول على جهات اتصال المستخدم
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('contact_id')
          .eq('user_id', user.id);

        if (contactsError) throw contactsError;
        
        if (contactsData && contactsData.length > 0) {
          // الحصول على بيانات المستخدمين لجهات الاتصال
          const contactIds = contactsData.map(contact => contact.contact_id);
          const { data: usersData, error: usersError } = await supabase
            .from('users_profiles')
            .select('id, username, avatar_url')
            .in('id', contactIds);

          if (usersError) throw usersError;
          
          setContacts(usersData || []);
          
          // إنشاء غرف المحادثة لكل جهة اتصال
          const contactChats = (usersData || []).map(contact => ({
            id: contact.id, // سنستخدم معرف المستخدم كمعرف للمحادثة
            contact: contact
          }));
          
          setChats(contactChats);
        } else {
          setContacts([]);
          setChats([]);
        }
      } catch (error) {
        console.error('خطأ في تحميل جهات الاتصال:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchContacts();
    }
  }, [user?.id]);

  // الاشتراك في التحديثات المباشرة للرسائل الخاصة
  useEffect(() => {
    if (!currentChat || !user?.id) return;
    
    // إلغاء الاشتراك السابق إن وجد
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
    
    // فتح القناة للتحديثات المباشرة للرسائل الخاصة مع معرف فريد لتجنب الاشتراكات المتكررة
    const channelName = `private_messages_${user.id}_${currentChat}_${Date.now()}`;
    console.log(`إعداد قناة الوقت الحقيقي: ${channelName}`);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // استماع لكل الأحداث (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'private_messages',
          filter: `or(and(user_id.eq.${user.id},chat_id.eq.${currentChat}),and(user_id.eq.${currentChat},chat_id.eq.${user.id}))`,
        },
        async (payload) => {
          console.log("استلام رسالة خاصة في الوقت الحقيقي:", payload);
          // تحديث المحادثة فورًا عند استلام رسالة جديدة
          if (payload.eventType === 'INSERT') {
            try {
              const messageData = payload.new;
              const { data: userData } = await supabase
                .from('users_profiles')
                .select('username')
                .eq('id', messageData.user_id)
                .single();
              
              const newMsg = {
                ...messageData,
                username: userData?.username || 'مستخدم'
              } as ChatMessage;
              
              // تحديث المحادثة بالرسالة الجديدة فورًا
              setMessages(prev => {
                // تجنب إضافة الرسائل المكررة
                const messageExists = prev.some(msg => msg.id === newMsg.id);
                if (messageExists) return prev;
                return [...prev, newMsg];
              });
            } catch (error) {
              console.error('خطأ في تحميل معلومات المستخدم:', error);
            }
          } else {
            // إعادة تحميل المحادثة بالكامل في حالة تحديث أو حذف رسائل
            await fetchMessages(currentChat);
          }
        }
      )
      .subscribe((status) => {
        console.log(`حالة قناة الرسائل الخاصة: ${status}`);
        if (status === 'SUBSCRIBED') {
          toast({
            title: "متصل",
            description: "أنت الآن متصل بنظام المراسلة المباشر",
          });
        }
      });

    setRealtimeChannel(channel);
    console.log(`تم الاشتراك في تحديثات المحادثة الخاصة (${currentChat})`);
    
    return () => {
      supabase.removeChannel(channel);
      console.log('تم إلغاء الاشتراك في تحديثات المحادثة الخاصة');
    };
  }, [currentChat, user?.id]);

  // تحميل الرسائل عند تغيير المحادثة
  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat);
    }
  }, [currentChat]);

  // دالة لتحميل الرسائل الخاصة
  const fetchMessages = async (chatPartnerId: string) => {
    if (!chatPartnerId || !user?.id) return;
    
    try {
      setLoading(true);
      
      // استعلام معدل عن الرسائل الخاصة بين المستخدمين
      const { data: messagesData, error } = await supabase
        .from('private_messages')
        .select('id, content, created_at, user_id, chat_id')
        .or(`and(user_id.eq.${user.id},chat_id.eq.${chatPartnerId}),and(user_id.eq.${chatPartnerId},chat_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("خطأ في تحميل الرسائل الخاصة:", error);
        throw error;
      }
      
      // الحصول على معلومات المستخدمين
      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
        const { data: usersData, error: usersError } = await supabase
          .from('users_profiles')
          .select('id, username')
          .in('id', userIds);

        if (usersError) {
          console.error("خطأ في تحميل معلومات المستخدمين:", usersError);
        }

        const usersMap = (usersData || []).reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {} as Record<string, string>);

        const messagesWithUsernames = messagesData.map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          username: usersMap[msg.user_id] || 'مستخدم'
        }));

        setMessages(messagesWithUsernames);
      } else {
        setMessages([]);
      }
      
      // الحصول على معلومات المستخدم الآخر
      const { data: otherUserData, error: otherUserError } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .eq('id', chatPartnerId)
        .single();
      
      if (otherUserError) {
        console.error("خطأ في تحميل معلومات المستخدم الآخر:", otherUserError);
        throw otherUserError;
      }
      
      setOtherUser(otherUserData);
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

  // تمرير للأسفل عند وصول رسائل جديدة
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // البحث عن مستخدمين
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      
      // البحث في أسماء المستخدمين
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;
      
      // استبعاد جهات الاتصال الموجودة بالفعل
      const contactIds = contacts.map(contact => contact.id);
      const filteredResults = data?.filter(result => !contactIds.includes(result.id)) || [];
      
      setSearchResults(filteredResults);
      setSearching(true);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن المستخدمين",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // إضافة جهة اتصال
  const handleAddContact = async (contactId: string) => {
    try {
      setAddingContact(true);
      
      // إضافة جهة الاتصال
      const { error } = await supabase
        .from('contacts')
        .insert({ user_id: user.id, contact_id: contactId });

      if (error) {
        console.error('خطأ في إضافة جهة الاتصال:', error);
        // عرض رسالة خطأ صديقة للمستخدم بدلاً من الرسالة التقنية
        throw new Error("تعذر إضافة جهة الاتصال، يرجى المحاولة لاحقًا.");
      }
      
      // إحضار بيانات جهة الاتصال
      const { data: contactData } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .eq('id', contactId)
        .single();
      
      if (contactData) {
        // إضافة جهة الاتصال إلى القائمة
        setContacts(prev => [...prev, contactData]);
        
        // إضافة المحادثة الجديدة
        const newChat: ChatRoom = {
          id: contactData.id,
          contact: contactData
        };
        
        setChats(prev => [...prev, newChat]);
        
        toast({
          title: "تمت الإضافة",
          description: `تمت إضافة ${contactData.username} إلى جهات الاتصال`,
        });
        
        // إغلاق مربع الحوار بعد الإضافة
        setIsAddContactDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة جهة الاتصال",
        description: error.message || "حدث خطأ أثناء إضافة جهة الاتصال",
        variant: "destructive",
      });
    } finally {
      setAddingContact(false);
      setSearchTerm('');
      setSearchResults([]);
      setSearching(false);
    }
  };

  // إرسال رسالة
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChat) return;
    
    try {
      setSendingMessage(true);
      
      // إضافة رسالة مؤقتة للواجهة (Optimistic UI)
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        username: 'أنت'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage(''); // مسح حقل الإدخال

      // إرسال الرسالة إلى Supabase
      const { error, data } = await supabase
        .from('private_messages')
        .insert({
          chat_id: currentChat,
          user_id: user.id,
          content: tempMessage.content
        })
        .select();

      if (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        throw error;
      }
      
      console.log('تم إرسال الرسالة الخاصة بنجاح:', data);
      
    } catch (error: any) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من إرسال الرسالة",
        variant: "destructive",
      });
      // إعادة المحتوى السابق لحقل الإدخال في حالة الفشل
      setNewMessage(newMessage.trim());
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

  // التحويل إلى محادثة معينة
  const openChat = (chatId: string) => {
    setCurrentChat(chatId);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">المحادثات الخاصة</h3>
        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right mb-4">إضافة جهة اتصال جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch} 
                  disabled={searchLoading || !searchTerm.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن مستخدمين..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>
              
              {searching && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearching(false);
                        setSearchResults([]);
                        setSearchTerm('');
                      }}
                      className="p-0 h-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <h4 className="font-medium">نتائج البحث</h4>
                  </div>
                  
                  {searchResults.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">لا توجد نتائج</p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div key={result.id} className="flex justify-between items-center p-2 rounded-md bg-white/5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddContact(result.id)}
                            disabled={addingContact}
                            className="text-cyan-400"
                          >
                            {addingContact ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                          </Button>
                          <div className="flex items-center gap-2">
                            <span>{result.username}</span>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-cyan-800">
                                {result.username?.[0] || "م"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-medium mb-2 text-right">جهات الاتصال المضافة</h4>
                {contacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد جهات اتصال بعد</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex justify-between items-center p-2 rounded-md bg-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentChat(contact.id);
                            setIsAddContactDialogOpen(false);
                          }}
                          className="text-cyan-400"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <span>{contact.username}</span>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-cyan-800">
                              {contact.username?.[0] || "م"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {chats.length > 0 && (
        <div className="grid md:grid-cols-[250px_1fr] gap-4">
          {/* قائمة المحادثات */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-white/70 mb-2 text-right">جهات الاتصال</h4>
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => openChat(chat.id)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-white/10 ${currentChat === chat.id ? 'bg-white/10' : ''}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-cyan-800">
                      {chat.contact.username?.[0] || "م"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-right">{chat.contact.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* منطقة عرض الرسائل */}
          <div className="h-[450px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col">
            {currentChat ? (
              <>
                {/* رأس المحادثة */}
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setCurrentChat(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {otherUser && (
                      <>
                        <span className="font-medium">{otherUser.username}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-cyan-800">
                            {otherUser.username?.[0] || "م"}
                          </AvatarFallback>
                        </Avatar>
                      </>
                    )}
                  </div>
                </div>

                {/* الرسائل */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
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

                {/* نموذج إرسال الرسائل */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={sendingMessage || !newMessage.trim()} 
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
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
                <MessageSquare className="h-12 w-12 mb-2 text-cyan-400/60" />
                <p>اختر محادثة لبدء الدردشة</p>
              </div>
            )}
          </div>
        </div>
      )}

      {chats.length === 0 && !loading && (
        <div className="h-[300px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col items-center justify-center">
          <UserCheck className="h-12 w-12 mb-4 text-cyan-400/60" />
          <p className="text-white/70 mb-4">لا توجد لديك جهات اتصال حتى الآن</p>
          <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-cyan-600 hover:bg-cyan-700">
                <UserPlus className="h-4 w-4 mr-2" />
                أضف جهات اتصال جديدة
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;
