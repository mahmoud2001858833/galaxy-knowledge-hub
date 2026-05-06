import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Code2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MathToCodeTab = () => {
  const { toast } = useToast();
  const [operation, setOperation] = useState('');
  const [language, setLanguage] = useState('python');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!operation.trim()) {
      toast({ 
        title: "تنبيه", 
        description: "الرجاء إدخال العملية الرياضية",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setGeneratedCode('');
    
    try {
      console.log('Converting operation:', operation, 'to', language);
      const { data, error } = await supabase.functions.invoke('dev-assistant-service', {
        body: { action: 'math-to-code', operation, language }
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      if (data && data.code) {
        setGeneratedCode(data.code);
        toast({ 
          title: "✅ تم التحويل بنجاح", 
          description: `تم تحويل العملية إلى كود ${language}`
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('لم يتم استلام الكود من الخادم');
      }
    } catch (error: any) {
      console.error('Math to Code Error:', error);
      setGeneratedCode('// حدث خطأ: ' + (error.message || 'خطأ غير معروف'));
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء التحويل",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left Side - Math Operation Input */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="w-6 h-6 text-pink-400" />
            العملية الرياضية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            placeholder="اكتب العملية الرياضية هنا... مثلاً: حساب مساحة الدائرة بنصف قطر r"
            className="min-h-[250px] bg-white/5 border-white/10 text-lg"
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">اختر لغة البرمجة:</label>
            <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
              <SelectTrigger className="bg-white/5 border-white/10">
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
          </div>
          
          <Button 
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-lg py-6"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Zap className="w-5 h-5" />
                </motion.div>
                جاري التحويل...
              </>
            ) : (
              <>
                <Code2 className="w-5 h-5 mr-2" />
                تحويل إلى كود
              </>
            )}
          </Button>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold mb-2">أمثلة على العمليات:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• حساب مساحة المستطيل</li>
              <li>• إيجاد العدد الأكبر من بين 3 أعداد</li>
              <li>• حساب الفائدة البسيطة</li>
              <li>• تحويل درجة الحرارة من سيليسيوس لفهرنهايت</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Right Side - Generated Code Display */}
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Code2 className="w-6 h-6 text-red-400" />
            الكود المُولَّد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedCode ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-900 rounded-lg p-6 border border-red-500/20 relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast({ title: "✅ تم النسخ", description: "تم نسخ الكود للحافظة" });
                  }}
                >
                  نسخ
                </Button>
                <pre className="text-green-400 text-sm overflow-x-auto mt-8">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Code2 className="w-20 h-20 mb-4 opacity-50" />
              <p className="text-center text-lg">
                {isLoading 
                  ? "جاري تحويل العملية إلى كود..." 
                  : "أدخل العملية الرياضية وسيظهر الكود هنا"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MathToCodeTab;
