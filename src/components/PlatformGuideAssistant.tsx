
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { MessageCircle, Send, X, Bot, User, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // الحصول على معلومات المستخدم
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (profile?.username) {
          setUserName(profile.username);
        }
      }
    };
    getUser();
  }, []);

  // رسالة ترحيب محسنة
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `# 🌟 **أهلاً وسهلاً ${userName ? `يا ${userName}` : ''}!**

## 🎓 **مرحباً بك في مرشدك السياحي الذكي**

أنا مساعدك الشخصي في هذه **المنصة التعليمية المتقدمة** التي طورها **محمود جوارنة** بعناية فائقة! 

### ✨ **ما يمكنني مساعدتك فيه:**

#### 🧭 **التنقل الذكي**
• الانتقال الفوري لأي صفحة (فقط اطلب مني!)
• جولة شاملة في جميع أقسام المنصة
• اكتشاف الميزات المخفية

#### 📚 **الإرشاد التعليمي**
• شرح جميع الأدوات والمميزات
• نصائح لتحسين تجربة التعلم
• إرشادات استخدام متقدمة

#### 💡 **الاقتراحات الذكية**
• توصيات مخصصة حسب اهتماماتك
• اختصارات وطرق سريعة
• حلول للمشاكل التقنية

---

### 🚀 **جرب أن تقول:**
• "خذني إلى منصة الرياضيات"
• "أريد حل ألغاز الفيزياء"
• "افتح المكتبة المرئية"
• "اشرح لي كيف أستخدم الحاسبة"

**ما الذي تود معرفته أو إلى أين تريد أن أوجهك؟** 😊`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setShouldAutoScroll(true);
    }
  }, [isOpen, userName]);

  // التركيز على حقل الإدخال عند فتح النافذة
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

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
          message: inputMessage,
          currentPath: location.pathname,
          userName: userName
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.result,
        isUser: false,
        timestamp: new Date(),
        navigationPath: data.navigationPath
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShouldAutoScroll(true);

      // التنقل التلقائي الفوري
      if (data.autoNavigate && data.navigationPath) {
        setTimeout(() => {
          navigate(data.navigationPath);
          toast.success("🎯 تم الانتقال بنجاح!", {
            description: "تم نقلك إلى الصفحة المطلوبة"
          });
        }, 1500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '# ⚠️ **خطأ في الاتصال**\n\nعذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.\n\n💡 **نصيحة:** تأكد من اتصالك بالإنترنت',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // اقتراحات سريعة
  const quickSuggestions = [
    { icon: "🧮", text: "آلة حاسبة", action: () => setInputMessage("خذني إلى آلة الحاسبة") },
    { icon: "📺", text: "فيديوهات", action: () => setInputMessage("افتح الفيديوهات التعليمية") },
    { icon: "🎮", text: "ألغاز", action: () => setInputMessage("أريد حل الألغاز") },
    { icon: "📚", text: "جولة شاملة", action: () => setInputMessage("اعطني جولة شاملة في المنصة") }
  ];

  return (
    <>
      {/* الأيقونة العائمة المحسنة */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={!isOpen ? { 
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.5)",
            "0 0 30px rgba(147, 51, 234, 0.7)",
            "0 0 20px rgba(59, 130, 246, 0.5)"
          ]
        } : {}}
        transition={{ 
          boxShadow: { duration: 2, repeat: Infinity },
          scale: { duration: 0.2 }
        }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 shadow-2xl border-2 border-white/30 backdrop-blur-sm relative overflow-hidden group"
          size="icon"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <MessageCircle className="w-8 h-8 text-white relative z-10" />
          <Sparkles className="w-4 h-4 text-yellow-300 absolute top-2 right-2 animate-pulse" />
        </Button>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="absolute -left-40 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-black/90 to-gray-900/90 text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                مرشدك الذكي
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* نافذة المحادثة المحسنة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[480px] max-w-[calc(100vw-2rem)] h-[600px]"
          >
            <Card className="h-full bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80 backdrop-blur-xl border-2 border-blue-200/40 shadow-2xl overflow-hidden">
              {/* رأس النافذة المحسن */}
              <div className="relative h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]"></div>
                <div className="relative flex items-center justify-between p-4 h-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center space-x-1">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span>مرشدك الذكي</span>
                      </h3>
                      <p className="text-xs text-blue-100">طورته محمود جوارنة</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-0 h-[calc(100%-4rem)] flex flex-col">
                {/* منطقة الرسائل */}
                <EnhancedScrollArea 
                  className="flex-1 p-4" 
                  autoScroll={shouldAutoScroll}
                >
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex items-start space-x-3 max-w-[85%] ${
                            message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                              message.isUser
                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                            }`}
                          >
                            {message.isUser ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={`px-4 py-3 rounded-2xl text-sm shadow-lg ${
                              message.isUser
                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                                : 'bg-gradient-to-br from-gray-50 to-white text-gray-800 border border-gray-200/50 rounded-bl-md'
                            }`}
                          >
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: message.text
                                  .replace(/\n/g, '<br>')
                                  .replace(/### (.*?)(?=\n|$)/g, '<h3 style="font-size: 1.1em; font-weight: bold; color: #1f2937; margin: 8px 0 4px 0;">$1</h3>')
                                  .replace(/## (.*?)(?=\n|$)/g, '<h2 style="font-size: 1.2em; font-weight: bold; color: #1f2937; margin: 12px 0 6px 0;">$1</h2>')
                                  .replace(/# (.*?)(?=\n|$)/g, '<h1 style="font-size: 1.3em; font-weight: bold; color: #1f2937; margin: 16px 0 8px 0;">$1</h1>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937;">$1</strong>')
                                  .replace(/• (.*?)(?=\n|$)/g, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #3b82f6;">•</span>$1</div>')
                              }}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-200/50">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </EnhancedScrollArea>

                {/* اقتراحات سريعة */}
                {messages.length <= 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-2 border-t border-gray-200/50"
                  >
                    <p className="text-xs text-gray-500 mb-2">💡 اقتراحات سريعة:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={suggestion.action}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200/50 rounded-full text-xs text-gray-700 transition-all duration-200 flex items-center space-x-1"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* منطقة الإدخال المحسنة */}
                <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-white/80 to-blue-50/60 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="اسأل مرشدك الذكي... 🌟"
                      className="flex-1 text-sm bg-white/80 backdrop-blur-sm border-gray-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                      disabled={isLoading}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="icon"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlatformGuideAssistant;
