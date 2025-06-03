
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, MessageSquare, Phone, Video, Smile, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModernPrivateChatProps {
  user: any;
}

const ModernPrivateChat = ({ user }: ModernPrivateChatProps) => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // تحميل جهات الاتصال من قاعدة البيانات
  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user]);

  // تحميل الرسائل عند اختيار جهة اتصال
  useEffect(() => {
    if (selectedContact && user?.id) {
      fetchMessages();
    }
  }, [selectedContact, user]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      
      // جلب جهات الاتصال من جدول contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (contactsData && contactsData.length > 0) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // جلب معلومات المستخدمين من جدول users_profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);

        if (profilesError) throw profilesError;
        
        setContacts(profilesData || []);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('خطأ في جلب جهات الاتصال:', error);
      toast({
        title: "خطأ في تحميل جهات الاتصال",
        description: "حدث خطأ أثناء تحميل جهات الاتصال",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedContact.id,
            message_text: message.trim()
          }
        ]);

      if (error) throw error;
      
      setMessage('');
      fetchMessages(); // إعادة تحميل الرسائل
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
      {/* قائمة جهات الاتصال */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-r border-purple-500/20 flex flex-col"
      >
        {/* رأس قائمة جهات الاتصال */}
        <div className="p-4 border-b border-purple-500/20 flex-shrink-0">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            المحادثات الخاصة
          </h3>
          
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث عن المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white pr-10 rounded-xl focus:border-cyan-500"
            />
          </div>
          
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            إضافة جهة اتصال جديدة
          </Button>
        </div>

        {/* قائمة جهات الاتصال */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">
                جاري تحميل جهات الاتصال...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد جهات اتصال</p>
                <p className="text-sm">ابدأ بإضافة أصدقائك</p>
              </div>
            ) : (
              filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedContact?.id === contact.id
                      ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50'
                      : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-600/40">
                      {contact.avatar_url ? (
                        <AvatarImage src={contact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold text-sm">
                          {contact.username?.[0]?.toUpperCase() || '؟'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate text-sm">{contact.username}</h4>
                      <p className="text-xs text-gray-400">اضغط للمحادثة</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* رأس المحادثة */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-gray-900/80 to-purple-900/50 backdrop-blur-xl flex-shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-cyan-500/40">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold">
                      {selectedContact.username?.[0]?.toUpperCase() || '؟'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-bold text-white">{selectedContact.username}</h3>
                    <p className="text-sm text-cyan-300">متصل</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {[Phone, Video].map((Icon, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full border border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4 text-cyan-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* منطقة الرسائل */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-br from-gray-900/30 to-purple-900/20">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد رسائل بعد</p>
                    <p className="text-sm">ابدأ المحادثة بإرسال رسالة</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-2xl shadow-lg text-sm ${
                            msg.sender_id === user.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.message_text}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* شريط إرسال الرسائل */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-gray-900/80 to-purple-900/50 backdrop-blur-xl flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="bg-purple-600/20 hover:bg-purple-600/40 rounded-full">
                  <Smile className="w-4 h-4 text-purple-300" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="bg-gray-800/50 border-gray-600/30 text-white rounded-2xl pr-4 pl-4 focus:border-cyan-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl shadow-lg"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-purple-500/30 backdrop-blur-xl shadow-2xl max-w-md">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">اختر محادثة للبدء</h3>
                <p className="text-gray-400">اختر جهة اتصال من القائمة لبدء المحادثة</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernPrivateChat;
