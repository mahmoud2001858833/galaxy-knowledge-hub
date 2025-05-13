
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, User, RefreshCw, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
  const [forceRefresh, setForceRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // جديد: مربع حوار البحث عن جهات اتصال
  const [isSearchContactOpen, setIsSearchContactOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingContactId, setAddingContactId] = useState<string | null>(null);
  
  // استخدام hook الرسائل المباشرة المحسّنة
  const { messages, loading: messagesLoading, sendMessage, refreshMessages } = useRealtimeMessages({
    userId: user?.id,
    receiverId: currentContact,
    onNewMessage: () => {
      // التمرير للأسفل عند وصول رسائل جديدة
      setTimeout(() => scrollToBottom(), 50);
    }
  });

  // تحميل جهات الاتصال
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id);
          
        if (contactsError) {
          console.error('خطأ في تحميل جهات الاتصال:', contactsError);
          throw contactsError;
        }
        
        if (contactsData && contactsData.length > 0) {
          const contactsWithUsers: Contact[] = [];
          
          for (const contact of contactsData) {
            const { data: userData, error: userError } = await supabase
              .from('users_profiles')
              .select('id, username, avatar_url')
              .eq('id', contact.contact_id)
              .single();
              
            if (userError) {
              console.error('خطأ في تحميل معلومات المستخدم:', userError);
              contactsWithUsers.push({
                ...contact,
                contactUser: { 
                  id: contact.contact_id,
                  username: 'مستخدم غير معروف'
                }
              });
            } else {
              contactsWithUsers.push({
                ...contact,
                contactUser: userData
              });
            }
          }
          
          setContacts(contactsWithUsers);
          
          if (contactsWithUsers.length > 0 && !currentContact) {
            setCurrentContact(contactsWithUsers[0].contact_id);
          }
        } else {
          setContacts([]);
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

    if (user?.id) {
      fetchContacts();
    }
  }, [toast, user?.id, currentContact]);

  // تحسين الاستماع لحدث تحديث الرسائل
  useEffect(() => {
    const handleRefreshMessages = () => {
      if (user?.id && currentContact) {
        refreshMessages();
      }
      scrollToBottom();
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, [user?.id, currentContact, refreshMessages]);

  // تأثير للتحديث القسري - تحسين الاستجابة
  useEffect(() => {
    if (forceRefresh > 0 && user?.id && currentContact) {
      refreshMessages();
      scrollToBottom();
    }
  }, [forceRefresh, user?.id, currentContact, refreshMessages]);

  // تمرير للأسفل عند تحميل الرسائل أو تغيير جهة الاتصال
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentContact]);

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
        setNewMessage('');
        
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
  
  const getCurrentContactName = () => {
    const contact = contacts.find(c => c.contact_id === currentContact);
    return contact?.contactUser?.username || 'مستخدم';
  };

  // جديد: البحث عن المستخدمين
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      // البحث في جدول الملفات الشخصية باستخدام ilike للبحث الجزئي
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id); // استبعاد المستخدم الحالي
        
      if (error) throw error;
      
      // استبعاد جهات الاتصال الحالية
      const currentContactIds = contacts.map(contact => contact.contact_id);
      const filteredResults = data?.filter(user => !currentContactIds.includes(user.id)) || [];
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // جديد: إضافة جهة اتصال من نتائج البحث
  const handleAddContact = async (contactId: string) => {
    try {
      setAddingContactId(contactId);
      
      // التحقق من وجود جهة الاتصال مسبقاً
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', contactId);
        
      if (checkError) throw checkError;
      
      if (existingContact && existingContact.length > 0) {
        toast({
          title: "تنبيه",
          description: "جهة الاتصال موجودة مسبقاً",
          variant: "default",
        });
        return;
      }
      
      // إضافة جهة اتصال جديدة
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: contactId
        });
        
      if (insertError) throw insertError;
      
      // تحديث قائمة جهات الاتصال
      const { data: userData } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .eq('id', contactId)
        .single();
        
      if (userData) {
        const newContact = {
          id: `${user.id}-${contactId}`,
          user_id: user.id,
          contact_id: contactId,
          created_at: new Date().toISOString(),
          contactUser: userData
        };
        
        setContacts(prev => [...prev, newContact]);
        
        // تعيين جهة الاتصال الجديدة كنشطة
        setCurrentContact(contactId);
      }
      
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة جهة الاتصال بنجاح",
        variant: "default",
      });
      
      // إغلاق نافذة البحث
      setIsSearchContactOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      
    } catch (error) {
      console.error('خطأ في إضافة جهة اتصال:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة جهة الاتصال",
        variant: "destructive",
      });
    } finally {
      setAddingContactId(null);
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 w-full">
      {/* تحسين تصميم واجهة المستخدم - شريط جهات الاتصال بجانب المحادثة */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex items-center gap-2 p-2 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-500/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchContactOpen(true)}
            className="bg-green-600 hover:bg-green-700 border-none text-white mr-2"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            <span>إضافة جهة اتصال</span>
          </Button>
          
          {contacts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant={currentContact === contact.contact_id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentContact(contact.contact_id)}
                  className={`flex items-center gap-2 ${currentContact === contact.contact_id ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-800/50'}`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-700 text-xs">
                      {contact.contactUser?.username?.[0] || 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{contact.contactUser?.username || 'مستخدم'}</span>
                </Button>
              ))}
            </div>
          ) : (
            <span className="text-white/70 text-sm px-2">لا توجد جهات اتصال</span>
          )}
        </div>
        
        <Button 
          variant="outline"
          onClick={handleRefreshManually}
          className="flex items-center gap-1 bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث</span>
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center shadow-lg">
            <User className="h-12 w-12 mx-auto text-blue-400 mb-4" />
            <h3 className="text-white text-lg mb-2">لا توجد جهات اتصال</h3>
            <p className="text-white/70 mb-6">لم تقم بإضافة أي جهة اتصال بعد.</p>
            <Button
              onClick={() => setIsSearchContactOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 ml-2" />
              البحث عن جهات اتصال
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-[450px] bg-gradient-to-br from-blue-950/50 to-purple-900/20 backdrop-blur-sm rounded-lg border border-blue-500/20 overflow-y-auto flex flex-col p-4 w-full shadow-lg">
          <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-700">
                  {getCurrentContactName()[0] || 'م'}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-medium">{getCurrentContactName()}</h3>
            </div>
            <Badge variant="outline" className="bg-blue-900/50 border-blue-500/30 text-blue-300 text-xs">
              متصل
            </Badge>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto px-2">
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
                  transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
                  className={`flex ${message.sender_id === user.id ? 'justify-start flex-row-reverse' : 'justify-start'} gap-2`}
                >
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarFallback className={message.sender_id === user.id ? 'bg-blue-700' : 'bg-purple-700'}>
                        {message.username?.[0] || "م"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className={`max-w-[70%] ${
                    message.sender_id === user.id 
                      ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/30 border-blue-500/30' 
                      : 'bg-gradient-to-r from-purple-600/30 to-purple-500/20 border-purple-500/30'
                    } border rounded-lg p-3 shadow-md`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs text-white/70 ${message.sender_id === user.id ? 'order-2' : 'order-1'}`}>
                        {formatMessageTime(message.created_at)}
                      </span>
                      <span className={`font-semibold text-sm ${
                        message.sender_id === user.id ? 'text-blue-300 order-1' : 'text-purple-300 order-2'
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
              disabled={sendingMessage || !newMessage.trim() || !currentContact} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-500/30 shadow-md">
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
              className="flex-1 bg-blue-900/30 border-blue-500/30 text-white placeholder:text-white/50 text-right focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              disabled={sendingMessage || !currentContact}
            />
          </form>
        </div>
      )}
      
      {/* مربع حوار البحث عن جهات اتصال - تحسين التصميم */}
      <Dialog open={isSearchContactOpen} onOpenChange={setIsSearchContactOpen}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-blue-900/90 border-blue-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">البحث عن جهات اتصال</DialogTitle>
            <DialogDescription className="text-white/70">
              ابحث عن مستخدمين جدد عن طريق اسم المستخدم
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleSearchUsers} 
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
              <Input
                placeholder="اكتب اسم المستخدم للبحث"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-blue-900/50 border-blue-700"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.length === 0 && searchQuery && !isSearching ? (
                <p className="text-white/70 text-center py-4">لم يتم العثور على نتائج</p>
              ) : searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-900/30 border border-blue-800/50"
                >
                  <Button
                    size="sm"
                    onClick={() => handleAddContact(user.id)}
                    disabled={addingContactId === user.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {addingContactId === user.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-white">{user.username}</span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-700 text-xs">
                        {user.username[0] || 'م'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setIsSearchContactOpen(false)}
              className="border-blue-500/30 hover:bg-blue-900/50"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivateChat;
