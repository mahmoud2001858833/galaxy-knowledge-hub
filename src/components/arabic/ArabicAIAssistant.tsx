
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ArabicAIAssistant = () => {
  const { settings, speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً بك في المساعد الذكي للغة العربية! أنا هنا لمساعدتك في جميع أسئلتك حول النحو والصرف والبلاغة والأدب العربي. كيف يمكنني مساعدتك اليوم؟',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // قراءة رد المساعد تلقائياً
  useEffect(() => {
    if (settings.textToSpeech && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        speakText(lastMessage.content);
        setSpeakingMessageId(lastMessage.id);
      }
    }
  }, [messages]);

  const handleSpeak = (message: Message) => {
    if (speakingMessageId === message.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      speakText(message.content);
      setSpeakingMessageId(message.id);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('arabic-ai-assistant', {
        body: { message: input }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-amber-900/20 to-amber-950/20 rounded-xl border border-amber-500/30">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-amber-500/20">
        <div className="w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center">
          <Bot className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-300">المساعد الذكي</h3>
          <p className="text-sm text-white/60">متخصص في اللغة العربية</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600/30 text-white border border-blue-500/30'
                  : 'bg-amber-600/20 text-white border border-amber-500/30'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-white/50">
                  {message.timestamp.toLocaleTimeString('ar-SA')}
                </p>
                {!message.isUser && settings.textToSpeech && (
                  <button
                    onClick={() => handleSpeak(message)}
                    className="text-amber-300 hover:text-amber-200 transition-colors p-1"
                    title={speakingMessageId === message.id ? "إيقاف القراءة" : "قراءة النص"}
                  >
                    {speakingMessageId === message.id && isSpeaking ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-300" />
              </div>
            )}
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="bg-amber-600/20 p-3 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span className="text-white/70">يكتب...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-amber-500/20">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك عن اللغة العربية هنا..."
            className="flex-1 resize-none bg-white/10 border border-amber-500/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          
          {/* زر الميكروفون - يظهر فقط عند تفعيل الإدخال الصوتي */}
          <GlobalVoiceInput 
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
            size="md"
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-10"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArabicAIAssistant;
