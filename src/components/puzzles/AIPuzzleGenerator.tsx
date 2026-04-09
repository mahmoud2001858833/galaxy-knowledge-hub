import React, { useState } from 'react';
import { Bot, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIPuzzleGeneratorProps {
  onPuzzlesGenerated: () => void;
}

const AIPuzzleGenerator: React.FC<AIPuzzleGeneratorProps> = ({ onPuzzlesGenerated }) => {
  const [subject, setSubject] = useState('الفيزياء');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [count, setCount] = useState(5);
  const [topicDescription, setTopicDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!topicDescription.trim()) {
      toast.error('يرجى وصف المواضيع المطلوبة');
      return;
    }

    setGenerating(true);
    setProgress(10);
    setResults([]);

    try {
      // Simulate progress while waiting
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 85));
      }, 2000);

      const { data, error } = await supabase.functions.invoke('generate-ai-puzzles', {
        body: { subject, difficulty, count, topicDescription },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setProgress(100);
      setResults(data.puzzles || []);
      
      const successCount = (data.puzzles || []).filter((p: any) => p.status === 'success').length;
      toast.success(`تم توليد ${successCount} لغز بنجاح!`);
      onPuzzlesGenerated();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'حدث خطأ أثناء التوليد');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-purple-500/20">
          <Bot className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">توليد ألغاز بالذكاء الاصطناعي</h3>
          <p className="text-sm text-white/60">حدد التفاصيل والذكاء الاصطناعي سيولّد الألغاز مع صور تعليمية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">المادة</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الفيزياء">⚛️ الفيزياء</SelectItem>
              <SelectItem value="الكيمياء">🧪 الكيمياء</SelectItem>
              <SelectItem value="الأحياء">🧬 الأحياء</SelectItem>
              <SelectItem value="الرياضيات">📐 الرياضيات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">مستوى الصعوبة</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="سهل">🟢 سهل</SelectItem>
              <SelectItem value="متوسط">🟡 متوسط</SelectItem>
              <SelectItem value="صعب">🔴 صعب</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">عدد الألغاز (1-20)</Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">وصف المواضيع المطلوبة *</Label>
        <Textarea
          value={topicDescription}
          onChange={(e) => setTopicDescription(e.target.value)}
          placeholder="مثال: ألغاز عن قوانين نيوتن الثلاثة، الجاذبية، والحركة الدائرية..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin ml-2" />
            جاري التوليد...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 ml-2" />
            توليد ونشر الألغاز
          </>
        )}
      </Button>

      {generating && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-white/60 text-center">
            {progress < 30 ? 'جاري توليد الألغاز...' : 
             progress < 60 ? 'جاري إنشاء الصور التعليمية...' : 
             progress < 90 ? 'جاري رفع الألغاز...' : 'اكتمل!'}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold">النتائج:</h4>
          {results.map((result, i) => (
            <Card key={i} className={`${result.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{result.title}</p>
                  <p className="text-white/60 text-xs">{result.status === 'success' ? 'تم النشر' : result.error}</p>
                </div>
                {result.image && (
                  <img src={result.image} alt="" className="h-10 w-10 rounded object-cover" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIPuzzleGenerator;
