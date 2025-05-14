
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, BookOpen, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const responseRef = useRef<HTMLDivElement>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  
  // التمرير التلقائي إلى منطقة الإجابة عند ظهور الرد
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [response]);
  
  // وظيفة للتنقل إلى أعلى منطقة الأسئلة
  const scrollToQuestion = () => {
    if (questionInputRef.current) {
      questionInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // وظيفة للتنقل إلى منطقة الإجابة
  const scrollToAnswer = () => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
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
      toast({
        title: "تم استلام الإجابة",
        description: "تم استلام الرد من المساعد الذكي بنجاح",
      });
      
      // التمرير التلقائي إلى الإجابة
      setTimeout(scrollToAnswer, 300);
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
    <div className="flex flex-col h-[600px] relative">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center text-glow-cyan"
      >
        المساعد الكيميائي الذكي
      </motion.h2>
      
      {/* أزرار التنقل الثابتة */}
      <div className="fixed bottom-24 right-6 z-20 flex flex-col space-y-2">
        <Button 
          onClick={scrollToQuestion} 
          size="icon" 
          className="rounded-full bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/20"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <Button 
          onClick={scrollToAnswer}
          size="icon"
          className="rounded-full bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/20"
          disabled={!response}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 self-center bg-blue-900/30">
          <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            المحادثة
          </TabsTrigger>
          <TabsTrigger value="references" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            المراجع
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 mt-2 data-[state=inactive]:hidden overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
            {/* قسم السؤال - Question Section */}
            <Card className="bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20 flex flex-col lg:w-1/2" id="question-section">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">إكتب سؤالك</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  ref={questionInputRef}
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
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري معالجة السؤال...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      إرسال السؤال <Send className="h-4 w-4 mr-2" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {/* قسم الإجابة - Answer Section */}
            <Card 
              className="bg-blue-950/50 border border-cyan-500/30 shadow-glow-sm shadow-cyan-500/20 flex flex-col lg:w-1/2"
              ref={responseRef}
              id="answer-section"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex justify-between items-center">
                  <span>الإجابة</span>
                  {response && (
                    <Button
                      onClick={scrollToAnswer}
                      size="sm"
                      variant="ghost"
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
                      title="التمرير إلى أسفل"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 relative">
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
                  <div className="h-full relative">
                    <ScrollArea className="h-[350px] overflow-y-auto pr-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
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
                      </motion.div>
                    </ScrollArea>
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
