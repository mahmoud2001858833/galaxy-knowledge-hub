
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

const ChemistryAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الكيميائي، كيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في المعادلات الكيميائية، الجدول الدوري، التفاعلات الكيميائية والمزيد!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Call Supabase Edge Function for AI response
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: input,
          subject: 'chemistry'
        }
      });

      if (error) throw error;

      const aiResponse = data?.result || "عذراً، لم أتمكن من الحصول على إجابة الآن. حاول مرة أخرى لاحقاً.";
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling AI assistant:", error);
      toast.error("حدث خطأ أثناء الاتصال بالمساعد الذكي");
      
      // Fallback response
      const fallbackMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: "عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى."
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="h-[600px] flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center text-glow-cyan"
      >
        المساعد الكيميائي الذكي
      </motion.h2>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 self-center bg-blue-900/30">
          <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            المحادثة
          </TabsTrigger>
          <TabsTrigger value="references" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            المراجع
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 mt-2 data-[state=inactive]:hidden">
          <div className="flex-1 overflow-auto p-4 rounded-md bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-left' : 'text-right'
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-blue-900/80 text-cyan-50 border border-cyan-500/30'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-right"
              >
                <div className="inline-block rounded-lg px-4 py-2 bg-blue-900/80 text-cyan-50 border border-cyan-500/30">
                  <span className="inline-block">
                    <span className="typing-dot animate-pulse">.</span>
                    <span className="typing-dot animate-pulse delay-150">.</span>
                    <span className="typing-dot animate-pulse delay-300">.</span>
                  </span>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا..."
              className="resize-none bg-blue-950/30 border-cyan-900/30 focus:border-cyan-500"
              rows={1}
            />
            <Button
              onClick={handleSend}
              type="submit"
              size="icon"
              className="bg-cyan-600 hover:bg-cyan-700 shadow-glow-sm shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="references" className="flex-1 overflow-auto space-y-4 data-[state=inactive]:hidden">
          <div className="p-6 rounded-md bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-glow-cyan">المصادر والمراجع الكيميائية</h3>
            <ul className="space-y-3 text-white">
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الكيمياء العامة - المفاهيم الأساسية
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الجدول الدوري للعناصر الكيميائية المحدث
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الكيمياء العضوية - المركبات والتفاعلات
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الكيمياء غير العضوية - العناصر والمعادن
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الكيمياء التحليلية - طرق القياس والتحليل
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors flex items-center">
                <BookOpen className="h-4 w-4 ml-2 text-cyan-400" />
                الكيمياء الحيوية - التفاعلات في الكائنات الحية
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChemistryAssistant;
