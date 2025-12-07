
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { MessageCircle, Send, X, Bot, User, Sparkles, Zap, Brain, Rocket } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        text: `# 🚀 **مرحباً ${userName ? `يا ${userName}` : ''}!**

## 🎯 **مرشدك الذكي المتطور**

أنا مساعدك الشخصي في **المنصة التعليمية** التي طورها **محمود جوارنة**!

---

### ⚡ **قدراتي المتطورة:**

#### 🧭 **التنقل الذكي الدقيق**
• انتقال مباشر للفيديوهات التعليمية حسب المادة والصف
• دعم التنقل للأقسام الفرعية المتخصصة
• اكتشاف ذكي لطلبات التنقل المعقدة

#### 🎓 **الإرشاد المتخصص**
• شرح جميع الأدوات والميزات
• نصائح مخصصة لتحسين التعلم
• إرشادات متقدمة للاستخدام

---

### 🎮 **جرب هذه الأوامر:**

• **"انتقل للفيديوهات التعليمية - كيمياء الصف العاشر"**
• **"افتح آلة الحاسبة"**  
• **"أريد فيديوهات الفيزياء للصف التاسع"**
• **"انتقل للمكتبة المرئية"**

---

## 🌟 **ما الذي تود استكشافه اليوم؟** 🎯`,
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

  // التمرير التلقائي الفوري عند بداية الإجابة
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        isUser: false,
        timestamp: new Date(),
        navigationPath: data.navigationPath
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShouldAutoScroll(true);

      // التنقل التلقائي الفوري
      if (data.navigationPath) {
        setTimeout(() => {
          navigate(data.navigationPath);
          toast.success('تم التوجيه بنجاح', {
            description: 'تم الانتقال إلى الصفحة المطلوبة'
          });
        }, 1500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `# ⚠️ **خطأ في الاتصال**

عذراً، حدث خطأ في الاتصال بالخدمة.

### 🔄 **الحلول المقترحة:**
• تأكد من اتصالك بالإنترنت
• جرب إعادة إرسال السؤال
• أعد تحديث الصفحة إذا استمرت المشكلة`,
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
    { icon: "🧮", text: "آلة حاسبة", action: () => setInputMessage("افتح آلة الحاسبة") },
    { icon: "🧩", text: "الألغاز التعليمية", action: () => setInputMessage("انتقل للألغاز التعليمية") },
    { icon: "🏆", text: "قائمة المتصدرين", action: () => setInputMessage("أريد رؤية قائمة المتصدرين") },
    { icon: "🔬", text: "جولة شاملة", action: () => setInputMessage("اعطني جولة شاملة في المنصة") }
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
            "0 0 20px rgba(20, 184, 166, 0.4)",
            "0 0 30px rgba(99, 102, 241, 0.6)",
            "0 0 20px rgba(20, 184, 166, 0.4)"
          ]
        } : {}}
        transition={{ 
          boxShadow: { duration: 2, repeat: Infinity },
          scale: { duration: 0.2 }
        }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-900 shadow-xl border-2 border-teal-500/50 relative overflow-hidden group transition-all duration-300"
          size="icon"
        >
          {/* تأثيرات مضيئة */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 animate-pulse"></div>
          
          {/* الأيقونة */}
          <div className="relative z-10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-teal-400" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </Button>
      </motion.div>

      {/* نافذة المحادثة المحسنة - حجم متوسط مع حواف واضحة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <Card className="w-full max-w-2xl h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-teal-500/40 shadow-2xl overflow-hidden">
              {/* رأس النافذة مع زر الإغلاق */}
              <div className="relative h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-b border-teal-500/30 flex items-center justify-between px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500/30 to-indigo-500/30 rounded-full flex items-center justify-center border border-teal-400/30">
                    <Brain className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-teal-400 flex items-center">
                      <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                      مرشدك الذكي
                    </h3>
                    <p className="text-xs text-gray-300">مطور بواسطة محمود جوارنة</p>
                  </div>
                </div>
                
                {/* زر الإغلاق المحسن */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-full border border-gray-600/50 hover:border-red-500/50 transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <CardContent className="p-0 h-[calc(100%-4rem)] flex flex-col">
                {/* منطقة الرسائل */}
                <EnhancedScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex items-start space-x-3 max-w-[80%] ${
                            message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                              message.isUser
                                ? 'bg-gradient-to-br from-teal-600 to-teal-700 border-teal-400/50 text-white'
                                : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400/50 text-white'
                            }`}
                          >
                            {message.isUser ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Brain className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm border ${
                              message.isUser
                                ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white border-teal-500/30 rounded-br-md'
                                : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 border-gray-600/30 rounded-bl-md'
                            }`}
                          >
                            <div 
                              className="prose prose-sm max-w-none prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: message.text
                                  .replace(/\n/g, '<br>')
                                  .replace(/### (.*?)(?=\n|$)/g, '<h3 style="font-size: 1em; font-weight: bold; color: #20d7d7; margin: 6px 0 3px 0;">$1</h3>')
                                  .replace(/## (.*?)(?=\n|$)/g, '<h2 style="font-size: 1.1em; font-weight: bold; color: #14b8a6; margin: 8px 0 4px 0;">$1</h2>')
                                  .replace(/# (.*?)(?=\n|$)/g, '<h1 style="font-size: 1.2em; font-weight: bold; color: #0d9488; margin: 10px 0 6px 0;">$1</h1>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5eead4;">$1</strong>')
                                  .replace(/• (.*?)(?=\n|$)/g, '<div style="margin: 3px 0; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0; color: #14b8a6;">•</span>$1</div>')
                                  .replace(/---/g, '<hr style="border: none; border-top: 1px solid #374151; margin: 12px 0;">')
                              }}
                            />
                          </div>
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 border border-indigo-400/50 text-white flex items-center justify-center">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-600/30">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
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

                {/* اقتراحات سريعة */}
                {messages.length <= 1 && !isLoading && (
                  <div className="px-4 py-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-2 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-teal-400" />
                      اقتراحات سريعة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={suggestion.action}
                          className="px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-teal-600/30 hover:to-indigo-600/30 border border-gray-600/50 hover:border-teal-500/50 rounded-full text-xs text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* منطقة الإدخال */}
                <div className="border-t border-gray-700/50 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex space-x-3">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب سؤالك أو اطلب الانتقال... 🚀"
                      className="flex-1 text-sm bg-gray-800/80 border-gray-600/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                      className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 rounded-lg shadow-lg disabled:opacity-50 border border-teal-500/30 w-10 h-10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
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
