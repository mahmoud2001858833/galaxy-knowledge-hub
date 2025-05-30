
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, MessageSquare, Volume2 } from 'lucide-react';
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

interface EnhancedEnglishAIAssistantProps {
  language: 'ar' | 'en';
}

const EnhancedEnglishAIAssistant: React.FC<EnhancedEnglishAIAssistantProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المساعد الذكي للغة الإنجليزية",
      subtitle: "مساعدك الشخصي لتعلم اللغة الإنجليزية وإتقان قواعدها",
      placeholder: "اسأل عن أي شيء يخص اللغة الإنجليزية...",
      send: "إرسال",
      sending: "جاري الإرسال...",
      playAudio: "استمع للإجابة",
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
      playAudio: "Listen to Answer",
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

  const playAudio = async (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'Sarah',
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: language === 'ar' ? "خطأ في تشغيل الصوت" : "Audio playback error",
        description: language === 'ar' ? "حدث خطأ أثناء تشغيل الصوت" : "An error occurred while playing audio",
        variant: "destructive"
      });
    }
  };

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
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20 shadow-xl">
          {/* Messages Area */}
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] p-6">
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
                <div className="space-y-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${message.role === 'user' ? (language === 'ar' ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-indigo-600 shadow-lg' 
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : textAlign}`}>
                        <div className={`p-4 rounded-2xl border shadow-md max-w-[85%] ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white border-indigo-500/50 ml-auto'
                            : 'bg-white/10 backdrop-blur-sm text-white/90 border-white/20 mr-auto'
                        }`}>
                          <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base mb-0">
                              {message.content}
                            </p>
                          </div>
                          
                          {message.role === 'assistant' && (
                            <div className="flex justify-end mt-3">
                              <Button
                                onClick={() => playAudio(message.content)}
                                disabled={isPlaying}
                                variant="ghost"
                                size="sm"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <Volume2 className="w-4 h-4 mr-2" />
                                {currentLang.playAudio}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-white/50 mt-2 px-4">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-[85%] shadow-md">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
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
          <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex gap-3">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentLang.placeholder}
                className="flex-1 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-indigo-500 rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 rounded-xl shadow-lg"
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

export default EnhancedEnglishAIAssistant;
