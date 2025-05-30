
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, BookOpen, Globe, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface EnglishAIAssistantProps {
  language: 'ar' | 'en';
}

const EnglishAIAssistant: React.FC<EnglishAIAssistantProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المساعد الذكي للغة الإنجليزية",
      subtitle: "مساعدك الشخصي لتعلم اللغة الإنجليزية وإتقان قواعدها",
      placeholder: "اسأل عن أي شيء يخص اللغة الإنجليزية...",
      send: "إرسال",
      sending: "جاري الإرسال...",
      examples: [
        "كيف أتعلم القواعد الإنجليزية بسرعة؟",
        "ما الفرق بين Present Perfect و Past Simple؟",
        "كيف أحسن النطق الإنجليزي؟",
        "أريد تعلم المفردات الأكاديمية"
      ]
    },
    en: {
      title: "English AI Assistant",
      subtitle: "Your personal assistant for learning English and mastering its grammar",
      placeholder: "Ask anything about English language...",
      send: "Send",
      sending: "Sending...",
      examples: [
        "How can I improve my English grammar quickly?",
        "What's the difference between Present Perfect and Past Simple?",
        "How can I improve my English pronunciation?",
        "I want to learn academic vocabulary"
      ]
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('english-ai-assistant', {
        body: { 
          message: currentMessage,
          language: language 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ أثناء الإرسال" : "An error occurred while sending",
        variant: "destructive"
      });
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

  return (
    <div className={`space-y-6 ${textAlign}`} dir={dir}>
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-indigo-300 mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Bot className="w-8 h-8" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70 text-lg">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20 h-[500px] flex flex-col">
          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <Bot className="w-16 h-16 text-indigo-300 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-indigo-200 mb-2">
                      {language === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك؟' : 'Hello! How can I help you?'}
                    </h3>
                    <p className="text-white/60">
                      {language === 'ar' ? 'اسأل عن أي شيء يخص اللغة الإنجليزية' : 'Ask me anything about English language'}
                    </p>
                  </div>

                  {/* Example Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {currentLang.examples.map((example, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setCurrentMessage(example)}
                        className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-200 text-sm hover:bg-indigo-600/30 transition-colors text-left"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === 'user' ? (language === 'ar' ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-indigo-600' 
                          : 'bg-indigo-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : textAlign}`}>
                        <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/10 text-white/90'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-block p-3 rounded-lg bg-white/10">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-white/70">
                              {language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentLang.placeholder}
                className="flex-1 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {currentLang.send}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnglishAIAssistant;
