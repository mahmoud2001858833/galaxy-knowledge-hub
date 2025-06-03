
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, MessageSquare, Phone, Video, Smile, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModernPrivateChatProps {
  user: any;
}

const ModernPrivateChat = ({ user }: ModernPrivateChatProps) => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحبا! كيف حالك؟', sender: 'other', time: '14:30' },
    { id: 2, text: 'أهلاً بك! بخير والحمد لله', sender: 'me', time: '14:32' },
    { id: 3, text: 'ما رأيك في التصميم الجديد للمحادثات؟', sender: 'other', time: '14:35' },
    { id: 4, text: 'رائع جداً! أحب الألوان والتأثيرات البصرية', sender: 'me', time: '14:37' },
  ]);

  const contacts = [
    { id: 1, name: 'أحمد محمد', avatar: '', isOnline: true, lastMessage: 'رائع جداً! أحب الألوان...', time: '14:37' },
    { id: 2, name: 'فاطمة علي', avatar: '', isOnline: false, lastMessage: 'شكراً لك', time: 'أمس' },
    { id: 3, name: 'محمد أحمد', avatar: '', isOnline: true, lastMessage: 'سأراك غداً', time: '12:15' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="h-full flex rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
      {/* قائمة جهات الاتصال */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-r border-purple-500/20"
      >
        {/* رأس قائمة جهات الاتصال */}
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            المحادثات الخاصة
          </h3>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث عن المحادثات..."
              className="bg-gray-800/50 border-gray-600/30 text-white pr-10 rounded-xl focus:border-cyan-500"
            />
          </div>
          
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl">
            <UserPlus className="w-4 h-4 mr-2" />
            إضافة جهة اتصال جديدة
          </Button>
        </div>

        {/* قائمة جهات الاتصال */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedContact?.id === contact.id
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50'
                    : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-gray-600/40">
                      {contact.avatar ? (
                        <AvatarImage src={contact.avatar} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold">
                          {contact.name[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{contact.name}</h4>
                    <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
                  </div>
                  
                  <div className="text-xs text-gray-500">{contact.time}</div>
                </div>
              </motion.div>
            ))}
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
              className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-gray-900/80 to-purple-900/50 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/40">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold">
                      {selectedContact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedContact.name}</h3>
                    <p className="text-sm text-cyan-300">
                      {selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {[Phone, Video].map((Icon, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full border border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <Icon className="w-5 h-5 text-cyan-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* منطقة الرسائل */}
            <ScrollArea className="flex-1 p-6 bg-gradient-to-br from-gray-900/30 to-purple-900/20">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-4 rounded-2xl shadow-lg ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-xs mt-2 opacity-70">{msg.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* شريط إرسال الرسائل */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-6 border-t border-purple-500/20 bg-gradient-to-r from-gray-900/80 to-purple-900/50 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="bg-purple-600/20 hover:bg-purple-600/40 rounded-full">
                  <Smile className="w-5 h-5 text-purple-300" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="bg-gray-800/50 border-gray-600/30 text-white rounded-2xl pr-4 pl-12 focus:border-cyan-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl shadow-lg"
                >
                  <Send className="w-5 h-5 text-white" />
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
