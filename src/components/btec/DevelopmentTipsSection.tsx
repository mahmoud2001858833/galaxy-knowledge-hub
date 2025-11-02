import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Lightbulb, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const DevelopmentTipsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [tips, setTips] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetTips = async () => {
    if (!projectDescription.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال وصف المشروع", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const fullDescription = projectUrl 
        ? `${projectDescription}\n\nرابط المشروع: ${projectUrl}`
        : projectDescription;

      const { data, error } = await supabase.functions.invoke('btec-dev-tips', {
        body: { project_description: fullDescription }
      });

      if (error) throw error;
      setTips(data.tips);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="نصائح للتطوير - بتك BTEC"
        description="احصل على تقييم خبير ونصائح تفصيلية لتطوير مشروعك البرمجي"
        keywords="تطوير, نصائح برمجة, تقييم مشاريع, AI tips"
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

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-400">
            نصائح للتطوير
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  معلومات المشروع
                </CardTitle>
                <CardDescription className="text-white/70">
                  أدخل وصف مشروعك أو رابطه للحصول على نصائح خبيرة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">وصف المشروع</Label>
                  <Textarea
                    placeholder="مثال: مشروع لإنشاء موقع لبيع المنتجات باستخدام React و Node.js. المشروع يحتوي على صفحة المنتجات، سلة التسوق، ونظام الدفع."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="min-h-[200px] bg-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">رابط المشروع (اختياري)</Label>
                  <Input
                    placeholder="مثال: https://github.com/username/project"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="bg-white/10 text-white"
                  />
                </div>
                <Button onClick={handleGetTips} disabled={loading} className="w-full">
                  {loading ? 'جاري التحليل...' : 'احصل على النصائح'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  التقييم والنصائح
                </CardTitle>
                <CardDescription className="text-white/70">
                  نصائح مفصلة من خبراء التطوير
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tips ? (
                  <div className="bg-white/10 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                    <div className="text-white whitespace-pre-wrap leading-relaxed">
                      {tips}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-20">
                    أدخل معلومات مشروعك للحصول على التقييم والنصائح
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DevelopmentTipsSection;
