
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { Send, X, Brain, User, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  navigationPath?: string;
}

const PlatformGuideAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (profile?.username) setUserName(profile.username);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: `مرحباً ${userName ? `يا ${userName}` : ''}! 👋\n\nأنا مرشدك الذكي في المنصة التعليمية.\n\n**يمكنني مساعدتك في:**\n• التنقل بين أقسام المنصة\n• شرح الأدوات والميزات\n• الإرشاد للصفحات المطلوبة\n\nاكتب طلبك وسأساعدك فوراً! 🚀`,
        isUser: false,
        timestamp: new Date()
      }]);
      setShouldAutoScroll(true);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShouldAutoScroll(true);

    try {
      const { data, error } = await supabase.functions.invoke('platform-guide-assistant', {
        body: {
          question: inputMessage,
          userName: userName || 'صديقي',
          allMessages: messages.map(m => ({ 
            role: m.isUser ? 'user' : 'assistant', 
            content: m.text 
          }))
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        isUser: false,
        timestamp: new Date(),
        navigationPath: data.navigationPath
      }]);
      setShouldAutoScroll(true);

      if (data.navigationPath) {
        setTimeout(() => {
          navigate(data.navigationPath);
          toast.success('تم التوجيه بنجاح');
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '⚠️ عذراً، حدث خطأ. تأكد من اتصالك بالإنترنت وأعد المحاولة.',
        isUser: false,
        timestamp: new Date()
      }]);
      setShouldAutoScroll(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickSuggestions = [
    { icon: "🧮", text: "آلة حاسبة", action: () => setInputMessage("افتح آلة الحاسبة") },
    { icon: "🧩", text: "ألغاز", action: () => setInputMessage("انتقل للألغاز التعليمية") },
    { icon: "🏆", text: "المتصدرين", action: () => setInputMessage("قائمة المتصدرين") },
    { icon: "📷", text: "ماسح الامتحانات", action: () => setInputMessage("افتح ماسح الامتحانات الذكي") },
    { icon: "🤟", text: "لغة الإشارة", action: () => setInputMessage("افتح مترجم لغة الإشارة") },
    { icon: "🧠", text: "المرشد النفسي", action: () => setInputMessage("افتح المرشد النفسي") },
    { icon: "🎨", text: "الفن والتصميم", action: () => setInputMessage("انتقل لقسم الفن والتصميم") },
    { icon: "🔬", text: "المحاكاة", action: () => setInputMessage("افتح المحاكاة العلمية") },
  ];

  const renderMessageText = (text: string) => {
    return text
      .replace(/\n/g, '<br>')
      .replace(/### (.*?)(?=<br>|$)/g, '<h3 style="font-size:0.9em;font-weight:bold;color:#20d7d7;margin:4px 0 2px;">$1</h3>')
      .replace(/## (.*?)(?=<br>|$)/g, '<h2 style="font-size:1em;font-weight:bold;color:#14b8a6;margin:6px 0 3px;">$1</h2>')
      .replace(/# (.*?)(?=<br>|$)/g, '<h1 style="font-size:1.05em;font-weight:bold;color:#0d9488;margin:6px 0 4px;">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#5eead4;">$1</strong>')
      .replace(/• (.*?)(?=<br>|$)/g, '<div style="margin:2px 0;padding-right:10px;">• $1</div>')
      .replace(/---/g, '<hr style="border:none;border-top:1px solid #374151;margin:8px 0;">');
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(20,184,166,0.3)",
                  "0 0 25px rgba(99,102,241,0.5)",
                  "0 0 15px rgba(20,184,166,0.3)"
                ]
              }}
              transition={{ boxShadow: { duration: 2, repeat: Infinity }, scale: { duration: 0.2 } }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-900 shadow-xl border-2 border-teal-500/50 relative overflow-hidden group"
                size="icon"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Brain className="w-7 h-7 text-teal-400 relative z-10" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute top-2 right-2 animate-pulse" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel sliding from right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 border-l border-teal-500/30 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="h-14 bg-gray-900/90 border-b border-teal-500/20 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500/30 to-indigo-500/30 rounded-full flex items-center justify-center border border-teal-400/30">
                    <Brain className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-teal-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      مرشدك الذكي
                    </h3>
                    <p className="text-[10px] text-gray-400">محمود جوارنة</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <EnhancedScrollArea className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${message.isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 mt-1 ${
                          message.isUser
                            ? 'bg-teal-700 border-teal-500/50'
                            : 'bg-indigo-700 border-indigo-400/50'
                        }`}>
                          {message.isUser ? <User className="w-3 h-3 text-white" /> : <Brain className="w-3 h-3 text-white" />}
                        </div>
                        <div className={`px-3 py-2 rounded-xl text-xs border ${
                          message.isUser
                            ? 'bg-teal-800/80 text-white border-teal-600/30 rounded-br-sm'
                            : 'bg-gray-800/80 text-gray-100 border-gray-600/30 rounded-bl-sm'
                        }`}>
                          <div
                            className="prose prose-xs max-w-none prose-invert leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMessageText(message.text) }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-700 border border-indigo-400/50 flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-gray-800/80 px-3 py-2 rounded-xl rounded-bl-sm border border-gray-600/30">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </EnhancedScrollArea>

              {/* Quick suggestions */}
              {messages.length <= 1 && !isLoading && (
                <div className="px-3 py-2 border-t border-gray-700/50 flex-shrink-0">
                  <p className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    اقتراحات سريعة
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={s.action}
                        className="px-2 py-1 bg-gray-800/60 hover:bg-teal-600/20 border border-gray-600/40 hover:border-teal-500/40 rounded-full text-[10px] text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-1"
                      >
                        <span>{s.icon}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-700/50 p-3 bg-gray-900/80 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب سؤالك... 🚀"
                    className="flex-1 text-xs h-9 bg-gray-800/80 border-gray-600/50 focus:border-teal-500 rounded-lg text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 rounded-lg h-9 w-9 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlatformGuideAssistant;
