import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CodeFixerTab = () => {
  const { toast } = useToast();
  const [originalCode, setOriginalCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFixCode = async () => {
    if (!originalCode.trim()) {
      toast({ 
        title: "تنبيه", 
        description: "الرجاء إدخال الكود الذي تريد تصحيحه",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setFixedCode('');
    setExplanation('');
    
    try {
      const { data, error } = await supabase.functions.invoke('btec-code-fixer', {
        body: { code: originalCode }
      });

      if (error) throw error;
      
      if (data && data.fixed_code) {
        setFixedCode(data.fixed_code);
        setExplanation(data.explanation || 'تم تصحيح الكود بنجاح');
        toast({ 
          title: "✅ تم التصحيح", 
          description: "تم تحليل وتصحيح الكود بنجاح"
        });
      } else {
        throw new Error('لم يتم استلام الكود المصحح من الخادم');
      }
    } catch (error: any) {
      console.error('Code Fixer Error:', error);
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء تصحيح الكود",
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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Original Code */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bug className="w-6 h-6 text-orange-400" />
              الكود الأصلي (به أخطاء)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              placeholder="الصق الكود الذي تريد تصحيحه هنا..."
              className="min-h-[400px] bg-gray-900 border-white/10 text-green-400 font-mono text-sm"
              disabled={isLoading}
            />
            
            <Button 
              onClick={handleFixCode}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-lg py-6"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Bug className="w-5 h-5" />
                  </motion.div>
                  جاري تحليل الأخطاء...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  تصحيح الكود
                </>
              )}
            </Button>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                أخطاء شائعة يتم اكتشافها:
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• أخطاء نحوية (Syntax Errors)</li>
                <li>• أخطاء منطقية (Logic Errors)</li>
                <li>• مشاكل المتغيرات غير المُعرّفة</li>
                <li>• أخطاء الأقواس والفواصل</li>
                <li>• مشاكل المسافات البادئة (Indentation)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Fixed Code */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-green-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
              الكود المُصحَّح
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixedCode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-gray-900 rounded-lg p-4 border border-green-500/20 relative">
                  <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-400">
                    مُصحَّح ✓
                  </Badge>
                  <div className="mt-8">
                    <pre className="text-green-400 text-sm overflow-x-auto font-mono">
                      <code>{fixedCode}</code>
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(fixedCode);
                      toast({ title: "✅ تم النسخ", description: "تم نسخ الكود المصحح" });
                    }}
                  >
                    نسخ الكود المُصحَّح
                  </Button>
                </div>

                {explanation && (
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-blue-400">شرح الأخطاء والإصلاحات:</h3>
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {explanation}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <CheckCircle className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-center text-lg">
                  {isLoading 
                    ? "جاري تحليل الكود وإصلاح الأخطاء..." 
                    : "الصق الكود في الجانب الأيسر واضغط على تصحيح"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default CodeFixerTab;
