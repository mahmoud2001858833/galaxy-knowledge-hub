
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, Search, Settings, UserPlus, Send, Smile, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModernGroupChatProps {
  user: any;
}

const ModernGroupChat = ({ user }: ModernGroupChatProps) => {
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً بالجميع في المجموعة الجديدة!', sender: { name: 'أحمد', avatar: '' }, time: '14:30' },
    { id: 2, text: 'أهلاً وسهلاً! التصميم رائع', sender: { name: 'فاطمة', avatar: '' }, time: '14:32' },
    { id: 3, text: 'أتفق معك تماماً، الألوان جميلة جداً', sender: { name: user?.username || 'أنت', avatar: '' }, time: '14:35', isMe: true },
    { id: 4, text: 'هل يمكننا مناقشة المشروع الجديد؟', sender: { name: 'محمد', avatar: '' }, time: '14:37' },
  ]);

  const rooms = [
    { id: 1, name: 'المطورين العرب', description: 'مناقشات حول التطوير والبرمجة', members: 45, isActive: true, category: 'تقنية' },
    { id: 2, name: 'التصميم الإبداعي', description: 'مشاركة الأفكار الإبداعية', members: 32, isActive: false, category: 'تصميم' },
    { id: 3, name: 'الذكاء الاصطناعي', description: 'آخر التطورات في الذكاء الاصطناعي', members: 28, isActive: true, category: 'تقنية' },
    { id: 4, name: 'ريادة الأعمال', description: 'نصائح وخبرات في ريادة الأعمال', members: 67, isActive: false, category: 'أعمال' },
  ];

  const onlineMembers = [
    { name: 'أحمد محمد', avatar: '', status: 'مطور' },
    { name: 'فاطمة علي', avatar: '', status: 'مصممة' },
    { name: 'محمد أحمد', avatar: '', status: 'مدير منتج' },
    { name: 'سارة أحمد', avatar: '', status: 'مطورة واجهات' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: { name: user?.username || 'أنت', avatar: '' },
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'تقنية': 'from-cyan-500 to-blue-600',
      'تصميم': 'from-purple-500 to-pink-600',
      'أعمال': 'from-emerald-500 to-teal-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="h-full flex rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
      {/* قائمة الغرف */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-r border-purple-500/20"
      >
        {/* رأس قائمة الغرف */}
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            المحادثات الجماعية
          </h3>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث عن الغرف..."
              className="bg-gray-800/50 border-gray-600/30 text-white pr-10 rounded-xl focus:border-purple-500"
            />
          </div>
          
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl">
            <UserPlus className="w-4 h-4 mr-2" />
            إنشاء غرفة جديدة
          </Button>
        </div>

        {/* قائمة الغرف */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedRoom?.id === room.id
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                    : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(room.category)}`}>
                    <Hash className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">{room.name}</h4>
                      {room.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{room.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{room.members} عضو</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
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
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryColor(selectedRoom.category)}`}>
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedRoom.name}</h3>
                    <p className="text-sm text-purple-300">{selectedRoom.members} عضو متصل</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {[Pin, Settings].map((Icon, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300"
                    >
                      <Icon className="w-5 h-5 text-purple-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="flex-1 flex">
              {/* منطقة الرسائل */}
              <div className="flex-1 flex flex-col">
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
                          className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-10 w-10 border-2 border-purple-500/40">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                              {msg.sender.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 ${msg.isMe ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">{msg.sender.name}</span>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <div
                              className={`inline-block p-3 rounded-2xl shadow-lg max-w-md ${
                                msg.isMe
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
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
                        className="bg-gray-800/50 border-gray-600/30 text-white rounded-2xl pr-4 pl-12 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl shadow-lg"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* قائمة الأعضاء المتصلين */}
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-64 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-l border-purple-500/20"
              >
                <div className="p-4 border-b border-purple-500/20">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    الأعضاء المتصلون ({onlineMembers.length})
                  </h4>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {onlineMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 border border-purple-500/40">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-gray-800 rounded-full" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{member.name}</p>
                          <p className="text-gray-400 text-xs truncate">{member.status}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 backdrop-blur-xl shadow-2xl max-w-md">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">اختر غرفة للانضمام</h3>
                <p className="text-gray-400">اختر غرفة محادثة من القائمة للانضمام للمناقشة</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernGroupChat;
