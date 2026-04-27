import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EvalResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

const PlatformEvalTab = () => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);

  const handleEvaluate = async () => {
    if (!description.trim() || description.trim().length < 20) {
      toast.error('اكتب وصفاً للمنصة (20 حرف على الأقل)');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `قيّم منصة الويب التالية بشكل احترافي وحيادي.\n\nالرابط: ${url || 'غير محدد'}\nالوصف: ${description}\n\nأعد JSON صارم بهذا الشكل بدون أي شرح:\n{\n  "score": رقم من 0 إلى 100,\n  "strengths": ["نقطة قوة 1", ...],\n  "weaknesses": ["نقطة ضعف 1", ...],\n  "suggestions": ["اقتراح تحسين 1", ...],\n  "summary": "ملخص نهائي بالعربية في 2-3 جمل"\n}\n\nركّز على: تجربة المستخدم، التصميم، الأداء، إمكانية الوصول، القيمة الفعلية، الاحترافية.`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } },
      });
      if (error) throw error;
      const raw = data?.message || data?.content || data?.text || '';
      const cleaned = String(raw).replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);
      toast.success('تم تقييم المنصة بنجاح');
    } catch (e: any) {
      console.error(e);
      toast.error('تعذّر التقييم: ' + (e?.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">تقييم المنصات بالذكاء الاصطناعي</h3>
        </div>
        <p className="text-gray-300 mb-6">أدخل رابط منصتك ووصفها لتحصل على تقييم احترافي شامل مع نقاط القوة والضعف واقتراحات التحسين.</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">رابط المنصة (اختياري)</label>
            <Input
              dir="ltr"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">وصف المنصة وأهدافها</label>
            <Textarea
              placeholder="مثال: منصة تعليمية للأطفال تركز على تعلّم الرياضيات بأسلوب تفاعلي..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-white/5 border-white/20 text-white resize-none"
            />
          </div>
          <Button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6"
          >
            {loading ? (<><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري التقييم...</>) : (<><Sparkles className="w-5 h-5 ml-2" /> قيّم منصتي الآن</>)}
          </Button>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <div className="text-center mb-4">
              <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {result.score}/100
              </div>
              <p className="text-gray-300 mt-2">{result.summary}</p>
            </div>
          </Card>

          <Card className="p-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-bold text-white">نقاط القوة</h4>
            </div>
            <ul className="space-y-2 text-gray-200">
              {result.strengths?.map((s, i) => <li key={i} className="flex gap-2">✓ <span>{s}</span></li>)}
            </ul>
          </Card>

          <Card className="p-6 bg-orange-500/5 border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold text-white">نقاط تحتاج تحسين</h4>
            </div>
            <ul className="space-y-2 text-gray-200">
              {result.weaknesses?.map((s, i) => <li key={i} className="flex gap-2">⚠ <span>{s}</span></li>)}
            </ul>
          </Card>

          <Card className="p-6 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-white">اقتراحات التحسين</h4>
            </div>
            <ul className="space-y-2 text-gray-200">
              {result.suggestions?.map((s, i) => <li key={i} className="flex gap-2">💡 <span>{s}</span></li>)}
            </ul>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlatformEvalTab;
