
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    
    // Simulate AI response - in a real app this would be an API call
    setTimeout(() => {
      const aiResponses = [
        "تفاعل الأكسجين مع الهيدروجين يؤدي إلى تكوين الماء (H₂O).",
        "الجدول الدوري يضم ١١٨ عنصرًا مرتبة حسب العدد الذري.",
        "في تفاعلات الأكسدة والاختزال، يحدث نقل للإلكترونات بين المتفاعلات.",
        "الرقم الهيدروجيني (pH) يقيس حموضة أو قلوية محلول ما.",
        "الرابطة التساهمية تحدث عندما تشارك الذرات الإلكترونات لتكوين جزيء.",
        "عند حساب المول، يمكنك استخدام عدد أفوجادرو وهو ٦٫٠٢٢ × ١٠^٢٣."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: randomResponse
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
        className="text-3xl font-bold text-cyan-400 mb-6 text-center"
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
          <div className="flex-1 overflow-auto p-4 rounded-md bg-blue-950/50 border border-cyan-900/30">
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
                      ? 'bg-cyan-600 text-white'
                      : 'bg-blue-900/70 text-cyan-50'
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
                <div className="inline-block rounded-lg px-4 py-2 bg-blue-900/70 text-cyan-50">
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
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="references" className="flex-1 overflow-auto space-y-4 data-[state=inactive]:hidden">
          <div className="p-6 rounded-md bg-blue-950/50 border border-cyan-900/30">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">المصادر والمراجع الكيميائية</h3>
            <ul className="space-y-3 text-white">
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
                الكيمياء العامة - المفاهيم الأساسية
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
                الجدول الدوري للعناصر الكيميائية المحدث
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
                الكيمياء العضوية - المركبات والتفاعلات
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
                الكيمياء غير العضوية - العناصر والمعادن
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
                الكيمياء التحليلية - طرق القياس والتحليل
              </li>
              <li className="p-2 hover:bg-blue-900/30 rounded transition-colors">
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
