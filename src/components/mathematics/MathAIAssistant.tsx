
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MathAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي في منصة الرياضيات. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response: string;
      
      if (inputMessage.toLowerCase().includes('حل') || inputMessage.toLowerCase().includes('solve')) {
        response = 'لحل هذه المسألة، يمكننا اتباع الخطوات التالية:\n\n1. نقوم بتبسيط المعادلة أولاً\n2. نجمع الحدود المتشابهة\n3. نقوم بعزل المتغير\n\nالحل النهائي هو x = 5';
      } else if (inputMessage.toLowerCase().includes('derivative') || inputMessage.toLowerCase().includes('مشتقة')) {
        response = 'لإيجاد المشتقة، نستخدم قواعد الاشتقاق:\n\n- مشتقة x^n هي n·x^(n-1)\n- مشتقة sin(x) هي cos(x)\n- مشتقة e^x هي e^x\n\nبتطبيق هذه القواعد، المشتقة هي 2x + cos(x)';
      } else {
        response = 'شكراً على سؤالك! هذا موضوع مثير للاهتمام في الرياضيات. هل تريد معرفة المزيد حول هذا المفهوم أو هل لديك سؤال محدد؟';
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-right">المساعد الذكي للرياضيات</h2>
      
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white/5 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-space-deep-purple/80 text-white'
                    : 'bg-space-cosmic-black text-white'
                }`}
              >
                <div className="text-sm whitespace-pre-line text-right">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-white/70 text-left' : 'text-white/70 text-left'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-space-cosmic-black text-white rounded-2xl p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-space-neon-blue rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-space-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-space-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 bg-white/10 border-white/20 text-white resize-none text-right"
            rows={2}
            disabled={isLoading}
          />
          <Button 
            type="submit"
            className="bg-space-neon-blue hover:bg-space-bright-blue self-end"
            disabled={isLoading || !inputMessage.trim()}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
        
        <div className="mt-4 text-white/50 text-xs text-center">
          هذا مساعد ذكي تجريبي. يرجى التحقق من الإجابات قبل استخدامها في السياقات الأكاديمية.
        </div>
      </div>
    </div>
  );
};

export default MathAIAssistant;
