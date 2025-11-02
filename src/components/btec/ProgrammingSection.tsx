import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Bot, Book, Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const ProgrammingSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mathOperation, setMathOperation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [mathCode, setMathCode] = useState('');
  const [mathLoading, setMathLoading] = useState(false);

  const programmingConcepts = [
    { title: "الخوارزميات", desc: "مجموعة خطوات محددة لحل مشكلة معينة", example: "مثل: ترتيب الأرقام من الأصغر للأكبر" },
    { title: "المتغيرات", desc: "صناديق تخزين للبيانات في البرنامج", example: "x = 5 أو name = 'محمد'" },
    { title: "الحلقات التكرارية", desc: "تكرار مجموعة من الأوامر عدة مرات", example: "for, while loops" },
    { title: "الدوال", desc: "مجموعة أوامر يمكن استدعاؤها متى احتجنا", example: "function add(a, b) { return a + b; }" },
    { title: "الكائنات", desc: "تجميع البيانات والدوال المرتبطة معاً", example: "Object, Class في البرمجة الكائنية" },
    { title: "الشروط", desc: "اتخاذ قرارات بناءً على شروط معينة", example: "if, else, switch" }
  ];

  const handleAIAssistant = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال سؤالك", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('btec-programming-assistant', {
        body: { prompt: aiPrompt }
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleMathToCode = async () => {
    if (!mathOperation.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال العملية الرياضية", variant: "destructive" });
      return;
    }

    setMathLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('btec-math-to-code', {
        body: { operation: mathOperation, language: selectedLanguage }
      });

      if (error) throw error;
      setMathCode(data.code);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setMathLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="البرمجة - تكنولوجيا المعلومات"
        description="مساعد ذكي للبرمجة، تعاريف المفاهيم البرمجية، وتحويل العمليات الرياضية إلى كود"
        keywords="برمجة, AI, مساعد ذكي, تعلم البرمجة, كود, algorithms"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/btec/information-technology')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowRight size={20} />
            العودة
          </button>

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            البرمجة Programming
          </h1>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="w-4 h-4" />
                مساعد ذكي
              </TabsTrigger>
              <TabsTrigger value="concepts" className="gap-2">
                <Book className="w-4 h-4" />
                تعاريف مهمة
              </TabsTrigger>
              <TabsTrigger value="math" className="gap-2">
                <Calculator className="w-4 h-4" />
                رياضيات إلى كود
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <Card className="bg-white/5 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">مساعد البرمجة الذكي</CardTitle>
                  <CardDescription className="text-white/70">
                    اسأل أي سؤال عن البرمجة واحصل على إجابات وأكواد فورية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="مثال: كيف أصنع دالة لحساب المتوسط في Python؟"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[120px] bg-white/10 text-white"
                  />
                  <Button onClick={handleAIAssistant} disabled={aiLoading} className="w-full">
                    {aiLoading ? 'جاري المعالجة...' : 'اسأل المساعد'}
                  </Button>
                  {aiResponse && (
                    <div className="mt-4 p-4 bg-white/10 rounded-lg">
                      <pre className="text-white whitespace-pre-wrap text-right">{aiResponse}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concepts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programmingConcepts.map((concept, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-blue-500/30 hover:bg-white/10 transition-all h-full">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">{concept.title}</CardTitle>
                        <CardDescription className="text-white/70">{concept.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-cyan-300 text-sm">
                          <strong>مثال:</strong> {concept.example}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="math">
              <Card className="bg-white/5 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">تحويل العمليات الرياضية إلى كود</CardTitle>
                  <CardDescription className="text-white/70">
                    أدخل العملية الرياضية واختر اللغة البرمجية للحصول على الكود
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="مثال: احسب مساحة الدائرة بمعلومية نصف القطر"
                    value={mathOperation}
                    onChange={(e) => setMathOperation(e.target.value)}
                    className="min-h-[100px] bg-white/10 text-white"
                  />
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleMathToCode} disabled={mathLoading} className="w-full">
                    {mathLoading ? 'جاري التحويل...' : 'حول إلى كود'}
                  </Button>
                  {mathCode && (
                    <div className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto">
                      <pre className="text-green-300 text-sm" dir="ltr">{mathCode}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProgrammingSection;
