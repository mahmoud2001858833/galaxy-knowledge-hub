import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, FileText, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

type EssayType = 'article' | 'story' | 'descriptive' | 'argumentative' | 'narrative';
type CorrectionStage = 'spelling' | 'grammar' | 'consistency' | 'all';

const ArabicEssayWriter = () => {
  const [mode, setMode] = useState<'practice' | 'generate'>('practice');
  const [essayText, setEssayText] = useState('');
  const [essayType, setEssayType] = useState<EssayType>('article');
  const [wordCount, setWordCount] = useState(300);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [correctionStage, setCorrectionStage] = useState<CorrectionStage>('spelling');
  const [corrections, setCorrections] = useState<{
    spelling?: string;
    grammar?: string;
    consistency?: string;
  }>({});
  const [generatedEssay, setGeneratedEssay] = useState('');
  const { toast } = useToast();

  const essayTypes = {
    article: 'مقالة',
    story: 'قصة',
    descriptive: 'وصفي',
    argumentative: 'حجاجي',
    narrative: 'سردي'
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Extract text from image using OCR
      extractTextFromImage(file);
    }
  };

  const extractTextFromImage = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('arabic-essay-ocr', {
          body: { image: base64 }
        });

        if (error) throw error;
        setEssayText(data.text);
        toast({
          title: "تم استخراج النص",
          description: "تم استخراج النص من الصورة بنجاح",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error extracting text:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استخراج النص من الصورة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const correctEssay = async (stage: CorrectionStage) => {
    if (!essayText.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء كتابة أو رفع نص للتصحيح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCorrectionStage(stage);

    try {
      const { data, error } = await supabase.functions.invoke('arabic-essay-corrector', {
        body: {
          text: essayText,
          essayType,
          stage
        }
      });

      if (error) throw error;

      setCorrections(prev => ({
        ...prev,
        [stage]: data.correction
      }));

      toast({
        title: "تم التصحيح",
        description: `تم تصحيح ${stage === 'spelling' ? 'الأخطاء الإملائية' : stage === 'grammar' ? 'الأخطاء القواعدية' : 'التوافق مع نوع المقالة'}`,
      });
    } catch (error) {
      console.error('Error correcting essay:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصحيح التعبير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEssay = async () => {
    if (wordCount < 50 || wordCount > 2000) {
      toast({
        title: "خطأ",
        description: "عدد الكلمات يجب أن يكون بين 50 و 2000",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('arabic-essay-generator', {
        body: {
          essayType,
          wordCount,
          additionalInfo
        }
      });

      if (error) throw error;

      setGeneratedEssay(data.essay);
      toast({
        title: "تم إنشاء التعبير",
        description: "تم إنشاء تعبير متكامل بنجاح",
      });
    } catch (error) {
      console.error('Error generating essay:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التعبير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setMode('practice')}
          variant={mode === 'practice' ? 'default' : 'outline'}
          className="flex-1"
        >
          <FileText className="mr-2 h-5 w-5" />
          التدريب على التعبير
        </Button>
        <Button
          onClick={() => setMode('generate')}
          variant={mode === 'generate' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Lightbulb className="mr-2 h-5 w-5" />
          مولد التعابير
        </Button>
      </div>

      {mode === 'practice' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">كتابة التعبير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نوع التعبير
                </label>
                <Select value={essayType} onValueChange={(value) => setEssayType(value as EssayType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(essayTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  رفع صورة
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imageFile && (
                <p className="text-sm text-green-400">
                  تم رفع: {imageFile.name}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نص التعبير
                </label>
                <Textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="اكتب تعبيرك هنا..."
                  className="min-h-[300px] bg-white/5 border-white/20 text-white"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => correctEssay('spelling')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  تصحيح إملائي
                </Button>
                <Button
                  onClick={() => correctEssay('grammar')}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  تصحيح قواعدي
                </Button>
                <Button
                  onClick={() => correctEssay('consistency')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  التوافق مع النوع
                </Button>
              </div>
            </CardContent>
          </Card>

          {Object.keys(corrections).length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">نتائج التصحيح</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {corrections.spelling && (
                  <div>
                    <h3 className="font-bold text-blue-400 mb-2">التصحيح الإملائي:</h3>
                    <p className="text-white whitespace-pre-wrap">{corrections.spelling}</p>
                  </div>
                )}
                {corrections.grammar && (
                  <div>
                    <h3 className="font-bold text-purple-400 mb-2">التصحيح القواعدي:</h3>
                    <p className="text-white whitespace-pre-wrap">{corrections.grammar}</p>
                  </div>
                )}
                {corrections.consistency && (
                  <div>
                    <h3 className="font-bold text-green-400 mb-2">التوافق مع نوع المقالة:</h3>
                    <p className="text-white whitespace-pre-wrap">{corrections.consistency}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">إنشاء تعبير تلقائي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نوع التعبير
                </label>
                <Select value={essayType} onValueChange={(value) => setEssayType(value as EssayType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(essayTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  عدد الكلمات (50-2000)
                </label>
                <Input
                  type="number"
                  min={50}
                  max={2000}
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  معلومات إضافية (اختياري)
                </label>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="أضف معلومات إضافية حول الموضوع المطلوب..."
                  className="min-h-[100px] bg-white/5 border-white/20 text-white"
                />
              </div>

              <Button
                onClick={generateEssay}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'جاري الإنشاء...' : 'إنشاء التعبير'}
              </Button>
            </CardContent>
          </Card>

          {generatedEssay && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">التعبير المُنشأ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {generatedEssay}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ArabicEssayWriter;
