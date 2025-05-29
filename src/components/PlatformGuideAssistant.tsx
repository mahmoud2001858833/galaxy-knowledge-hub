
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

  // رسالة ترحيب محسنة مع تصميم مستقبلي
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `# 🚀 **مرحباً ${userName ? `يا ${userName}` : ''}!**

## 🎯 **مرشدك السياحي الذكي المتطور**

أنا مساعدك الشخصي المدعوم بالذكاء الاصطناعي في **المنصة التعليمية المستقبلية** التي طورها **محمود جوارنة** بأحدث التقنيات!

---

### ⚡ **قدراتي المتطورة:**

#### 🧭 **التنقل الذكي الفوري**
• انتقال لحظي لأي صفحة أو قسم فرعي
• دعم المسارات المعقدة (مثل: فيديوهات كيمياء الصف العاشر)
• اكتشاف ذكي لطلبات التنقل

#### 🎓 **الإرشاد العلمي المتخصص**
• شرح جميع الأدوات والميزات المتقدمة
• نصائح مخصصة لتحسين تجربة التعلم
• إرشادات متقدمة لاستخدام النظام

#### 🔮 **الذكاء التكيفي**
• اقتراحات ذكية حسب موقعك الحالي
• حلول فورية للمشاكل التقنية
• تخصيص التجربة حسب احتياجاتك

---

### 🎮 **جرب هذه الأوامر الذكية:**

• **"خذني إلى فيديوهات الكيمياء للصف العاشر"**
• **"افتح ألغاز الفيزياء المتقدمة"**  
• **"أريد استخدام آلة الحاسبة"**
• **"انتقل للمكتبة المرئية"**
• **"اشرح لي الجدول الدوري التفاعلي"**

---

## 🌟 **ما الذي تود استكشافه اليوم؟**

اكتب أي سؤال أو اطلب الانتقال لأي مكان في المنصة! 🎯`,
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

      // التنقل التلقائي الفوري بدون تأخير
      if (data.autoNavigate && data.navigationPath) {
        setTimeout(() => {
          navigate(data.navigationPath);
        }, 800);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `# ⚠️ **خطأ في الاتصال**

## 🔧 **مشكلة تقنية مؤقتة**

عذراً، حدث خطأ في الاتصال بالخدمة.

---

### 🔄 **الحلول المقترحة:**
• تأكد من اتصالك بالإنترنت
• جرب إعادة إرسال السؤال
• أعد تحديث الصفحة إذا استمرت المشكلة

---
💡 **نصيحة:** سأكون جاهزاً للمساعدة فور حل المشكلة التقنية!`,
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

  // اقتراحات سريعة محسنة
  const quickSuggestions = [
    { icon: "🧮", text: "آلة حاسبة", action: () => setInputMessage("افتح آلة الحاسبة") },
    { icon: "📺", text: "فيديوهات تعليمية", action: () => setInputMessage("انتقل للفيديوهات التعليمية") },
    { icon: "🎮", text: "ألغاز علمية", action: () => setInputMessage("أريد حل الألغاز العلمية") },
    { icon: "🔬", text: "جولة شاملة", action: () => setInputMessage("اعطني جولة شاملة في المنصة") }
  ];

  return (
    <>
      {/* الأيقونة العائمة المستقبلية */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={!isOpen ? { 
          boxShadow: [
            "0 0 30px rgba(20, 184, 166, 0.4)",
            "0 0 50px rgba(99, 102, 241, 0.6)",
            "0 0 30px rgba(20, 184, 166, 0.4)"
          ]
        } : {}}
        transition={{ 
          boxShadow: { duration: 3, repeat: Infinity },
          scale: { duration: 0.2 }
        }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-900 shadow-2xl border-2 border-teal-500/50 relative overflow-hidden group transition-all duration-500"
          size="icon"
        >
          {/* تأثيرات مضيئة داخلية */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 animate-pulse"></div>
          
          {/* الأيقونة الرئيسية */}
          <div className="relative z-10 flex items-center justify-center">
            <Brain className="w-10 h-10 text-teal-400" />
            <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            <Rocket className="w-4 h-4 text-indigo-400 absolute -bottom-1 -left-1 animate-bounce" />
          </div>
        </Button>
        
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="absolute -left-48 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl text-white px-5 py-4 rounded-2xl text-sm whitespace-nowrap border border-teal-500/30 shadow-2xl"
          >
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-teal-400" />
              <div>
                <div className="font-bold text-teal-400">مرشدك الذكي المتطور</div>
                <div className="text-xs text-gray-300">مدعوم بالذكاء الاصطناعي</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* نافذة المحادثة المستقبلية */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-28 right-6 z-50 w-[520px] max-w-[calc(100vw-2rem)] h-[680px]"
          >
            <Card className="h-full bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-2xl border-2 border-teal-500/40 shadow-2xl overflow-hidden">
              {/* رأس النافذة المستقبلي */}
              <div className="relative h-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden border-b border-teal-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent animate-[shimmer_4s_infinite]"></div>
                <div className="relative flex items-center justify-between p-5 h-full">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500/30 to-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-teal-400/30 relative">
                      <Brain className="w-7 h-7 text-teal-400" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-400/20 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl flex items-center space-x-2 text-teal-400">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span>مرشدك الذكي</span>
                      </h3>
                      <p className="text-xs text-gray-300">مطور بواسطة محمود جوارنة • مدعوم بـ AI</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-full border border-gray-600/50 hover:border-red-500/50 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-0 h-[calc(100%-5rem)] flex flex-col bg-gradient-to-b from-gray-900/50 to-black/70">
                {/* منطقة الرسائل */}
                <EnhancedScrollArea 
                  className="flex-1 p-5" 
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
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                              message.isUser
                                ? 'bg-gradient-to-br from-teal-600 to-teal-700 border-teal-400/50 text-white'
                                : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400/50 text-white'
                            }`}
                          >
                            {message.isUser ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Brain className="w-5 h-5" />
                            )}
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={`px-5 py-4 rounded-2xl text-sm shadow-xl border ${
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
                                  .replace(/### (.*?)(?=\n|$)/g, '<h3 style="font-size: 1.1em; font-weight: bold; color: #20d7d7; margin: 8px 0 4px 0;">$1</h3>')
                                  .replace(/## (.*?)(?=\n|$)/g, '<h2 style="font-size: 1.2em; font-weight: bold; color: #14b8a6; margin: 12px 0 6px 0;">$1</h2>')
                                  .replace(/# (.*?)(?=\n|$)/g, '<h1 style="font-size: 1.3em; font-weight: bold; color: #0d9488; margin: 16px 0 8px 0;">$1</h1>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5eead4;">$1</strong>')
                                  .replace(/• (.*?)(?=\n|$)/g, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #14b8a6;">•</span>$1</div>')
                                  .replace(/---/g, '<hr style="border: none; border-top: 1px solid #374151; margin: 16px 0;">')
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 border-2 border-indigo-400/50 text-white flex items-center justify-center">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-5 py-4 rounded-2xl rounded-bl-md shadow-xl border border-gray-600/30">
                            <div className="flex space-x-2">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-3 h-3 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
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

                {/* اقتراحات سريعة محسنة */}
                {messages.length <= 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-3 border-t border-gray-700/50"
                  >
                    <p className="text-xs text-gray-400 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-teal-400" />
                      اقتراحات ذكية سريعة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={suggestion.action}
                          className="px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-teal-600/30 hover:to-indigo-600/30 border border-gray-600/50 hover:border-teal-500/50 rounded-full text-xs text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* منطقة الإدخال المستقبلية */}
                <div className="border-t border-gray-700/50 p-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl">
                  <div className="flex space-x-3">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب سؤالك أو اطلب الانتقال لأي مكان... 🚀"
                      className="flex-1 text-sm bg-gray-800/80 backdrop-blur-sm border-gray-600/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="icon"
                        className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 rounded-xl shadow-lg disabled:opacity-50 border border-teal-500/30 w-12 h-12"
                      >
                        <Send className="w-5 h-5" />
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
