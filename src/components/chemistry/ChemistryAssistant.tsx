
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

const ChemistryAssistant = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [lastQuestion, setLastQuestion] = useState('');
  const [response, setResponse] = useState('');
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setLastQuestion(input);
    
    try {
      // Call Gemini API via Supabase Edge Function for AI response
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: input,
          subject: 'chemistry',
          useGemini: true
        }
      });

      if (error) throw error;

      const aiResponse = data?.result || "عذراً، لم أتمكن من الحصول على إجابة الآن. حاول مرة أخرى لاحقاً.";
      
      setResponse(aiResponse);
    } catch (error: any) {
      console.error("Error calling AI assistant:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.",
        variant: "destructive"
      });
      
      setResponse("عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* قسم السؤال - Question Section */}
            <Card className="bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">إكتب سؤالك</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا في مجال الكيمياء..."
                  className="resize-none flex-1 bg-blue-950/30 border-cyan-900/30 focus:border-cyan-500 min-h-[200px]"
                />
                
                <Button
                  onClick={handleSend}
                  type="submit"
                  className="mt-4 bg-cyan-600 hover:bg-cyan-700 shadow-glow-sm shadow-cyan-500/20 w-full"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? 'جاري معالجة السؤال...' : 'إرسال السؤال'}
                  <Send className="h-4 w-4 mr-2" />
                </Button>
              </CardContent>
            </Card>
            
            {/* قسم الإجابة - Answer Section */}
            <Card className="bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">الإجابة</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-cyan-600/30 mb-4 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/40 animate-ping"></div>
                      </div>
                      <p className="text-cyan-400">جاري التفكير...</p>
                    </div>
                  </div>
                ) : response ? (
                  <div className="overflow-auto h-full">
                    {lastQuestion && (
                      <div className="mb-4 p-3 bg-blue-900/40 rounded-lg">
                        <p className="text-sm text-white/70 mb-1">سؤالك:</p>
                        <p className="text-white">{lastQuestion}</p>
                      </div>
                    )}
                    <div 
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br>') }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    اكتب سؤالك في الجانب الآخر للحصول على إجابة
                  </div>
                )}
              </CardContent>
            </Card>
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
