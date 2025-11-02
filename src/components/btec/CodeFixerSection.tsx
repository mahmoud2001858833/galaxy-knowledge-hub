import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const CodeFixerSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFixCode = async () => {
    if (!code.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال الكود", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('btec-code-fixer', {
        body: { code }
      });

      if (error) throw error;
      setFixedCode(data.fixed_code);
      setExplanation(data.explanation);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="تصليح الكودات - بتك BTEC"
        description="اكتشف وصحح أخطاء الكود بمساعدة الذكاء الاصطناعي مع شرح تفصيلي للأخطاء"
        keywords="تصليح كود, أخطاء برمجية, debugging, AI code fix"
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

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            تصليح الكودات
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Wrench className="w-6 h-6" />
                  الكود الأصلي
                </CardTitle>
                <CardDescription className="text-white/70">
                  الصق الكود الذي تريد تصليحه هنا
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="مثال:&#10;def add(a, b)&#10;  return a + b&#10;print(add(5, '3'))"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] bg-slate-900 text-green-300 font-mono text-sm"
                  dir="ltr"
                />
                <Button onClick={handleFixCode} disabled={loading} className="w-full">
                  {loading ? 'جاري التصليح...' : 'صلح الكود'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {fixedCode && (
                <Card className="bg-white/5 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">الكود المصلح</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-green-300 text-sm font-mono" dir="ltr">{fixedCode}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {explanation && (
                <Card className="bg-white/5 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">شرح الأخطاء والتصليحات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white/90 whitespace-pre-wrap">{explanation}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodeFixerSection;
