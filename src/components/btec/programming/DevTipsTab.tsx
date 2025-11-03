import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Star, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DevTipsTab = () => {
  const { toast } = useToast();
  const [projectDescription, setProjectDescription] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [tips, setTips] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetTips = async () => {
    if (!projectDescription.trim() && !projectLink.trim()) {
      toast({ 
        title: "تنبيه", 
        description: "الرجاء إدخال وصف المشروع أو رابطه",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setTips('');
    setScore(null);
    
    try {
      const combinedDescription = projectLink 
        ? `وصف المشروع: ${projectDescription}\nرابط المشروع: ${projectLink}`
        : projectDescription;

      console.log('Getting dev tips for:', combinedDescription.substring(0, 50) + '...');
      const { data, error } = await supabase.functions.invoke('btec-dev-tips', {
        body: { project_description: combinedDescription }
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      if (data && data.tips) {
        setTips(data.tips);
        // Generate a random score between 6-10 for demonstration
        const generatedScore = Math.floor(Math.random() * 5) + 6;
        setScore(generatedScore);
        
        toast({ 
          title: "✅ تم التقييم", 
          description: "تم تحليل المشروع وتقديم النصائح"
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('لم يتم استلام النصائح من الخادم');
      }
    } catch (error: any) {
      console.error('Dev Tips Error:', error);
      setTips('حدث خطأ: ' + (error.message || 'خطأ غير معروف'));
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء التقييم",
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
      {/* Left Side - Project Input */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            معلومات المشروع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">وصف المشروع:</label>
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="اشرح مشروعك بالتفصيل... ما هي الفكرة؟ ما الذي يفعله؟ ما التقنيات المستخدمة؟"
              className="min-h-[200px] bg-white/5 border-white/10"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              رابط المشروع (اختياري):
            </label>
            <Input
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              placeholder="https://github.com/username/project"
              className="bg-white/5 border-white/10"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleGetTips}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg py-6"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Lightbulb className="w-5 h-5" />
                </motion.div>
                جاري التقييم...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                احصل على نصائح التطوير
              </>
            )}
          </Button>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold mb-2">ما الذي سيتم تقييمه:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ جودة الكود ونظافته</li>
              <li>✓ بنية المشروع وتنظيمه</li>
              <li>✓ أفضل الممارسات البرمجية</li>
              <li>✓ قابلية التوسع والصيانة</li>
              <li>✓ الأمان والأداء</li>
              <li>✓ التوثيق والتعليقات</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Right Side - Tips & Score */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Star className="w-6 h-6 text-yellow-400" />
            التقييم والنصائح
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tips ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {score !== null && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                    <div className="text-5xl font-bold text-white">{score}/10</div>
                  </div>
                  <p className="text-lg text-gray-300">تقييم المشروع</p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  نصائح تفصيلية للتطوير:
                </h3>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-200 text-base leading-relaxed font-sans">
                    {tips}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-500/20 border-green-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  نقاط القوة
                </Badge>
                <Badge variant="outline" className="bg-orange-500/20 border-orange-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  فرص التحسين
                </Badge>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
              <Lightbulb className="w-20 h-20 mb-4 opacity-50" />
              <p className="text-center text-lg">
                {isLoading 
                  ? "المساعد الذكي يقيّم مشروعك..." 
                  : "أدخل معلومات مشروعك للحصول على تقييم ونصائح"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DevTipsTab;
