
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, Search, Settings, UserPlus, Send, Smile, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModernGroupChatProps {
  user: any;
}

const ModernGroupChat = ({ user }: ModernGroupChatProps) => {
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // تحميل الغرف من قاعدة البيانات
  useEffect(() => {
    fetchRooms();
  }, []);

  // تحميل الرسائل عند اختيار غرفة
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('خطأ في جلب الغرف:', error);
      toast({
        title: "خطأ في تحميل الغرف",
        description: "حدث خطأ أثناء تحميل غرف المحادثة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('chat_id', selectedRoom.id)
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
        description: "حدث خطأ أثناء تحميل رسائل الغرفة",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRoom || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert([
          {
            chat_id: selectedRoom.id,
            user_id: user.id,
            content: message.trim()
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

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
      {/* قائمة الغرف */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-r border-purple-500/20 flex flex-col"
      >
        {/* رأس قائمة الغرف */}
        <div className="p-4 border-b border-purple-500/20 flex-shrink-0">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            المحادثات الجماعية
          </h3>
          
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث عن الغرف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white pr-10 rounded-xl focus:border-purple-500"
            />
          </div>
          
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            إنشاء غرفة جديدة
          </Button>
        </div>

        {/* قائمة الغرف */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">
                جاري تحميل الغرف...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد غرف محادثة</p>
                <p className="text-sm">ابدأ بإنشاء غرفة جديدة</p>
              </div>
            ) : (
              filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedRoom?.id === room.id
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                      : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                      <Hash className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate text-sm">{room.name}</h4>
                      <p className="text-xs text-gray-400">غرفة محادثة جماعية</p>
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
        {selectedRoom ? (
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
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white">{selectedRoom.name}</h3>
                    <p className="text-sm text-purple-300">غرفة محادثة جماعية</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {[Pin, Settings].map((Icon, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4 text-purple-300" />
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
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد رسائل في هذه الغرفة</p>
                    <p className="text-sm">كن أول من يرسل رسالة</p>
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
                        className="flex gap-3"
                      >
                        <Avatar className="h-8 w-8 border-2 border-purple-500/40 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xs">
                            {msg.profiles?.username?.[0]?.toUpperCase() || '؟'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">
                              {msg.profiles?.username || 'مستخدم'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString('ar-SA', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="inline-block p-3 rounded-2xl shadow-lg max-w-md bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-bl-sm">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
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
                    className="bg-gray-800/50 border-gray-600/30 text-white rounded-2xl pr-4 pl-4 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl shadow-lg"
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
