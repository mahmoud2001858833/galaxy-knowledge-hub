import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Loader2 } from 'lucide-react';

interface ArabicEssayWriterProps {
  language: 'ar' | 'en';
}

const ArabicEssayWriter: React.FC<ArabicEssayWriterProps> = ({ language }) => {
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const { toast } = useToast();

  const correctEssay = async () => {
    if (!essayText.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء كتابة نص للتصحيح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('arabic-essay-corrector', {
        body: {
          text: essayText,
          stage: 'all'
        }
      });

      if (error) throw error;

      setCorrection(data.correction);

      toast({
        title: "تم التصحيح",
        description: "تم تصحيح التعبير بنجاح",
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

  const exportCorrection = () => {
    if (!correction) return;

    const content = `=== تصحيح التعبير ===\n\n${correction}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correction-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير التصحيح بنجاح",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            أداة تصحيح التعبير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              نص التعبير
            </label>
            <Textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="اكتب أو الصق نص التعبير هنا..."
              className="min-h-[300px] bg-white/5 border-white/20 text-white"
              disabled={loading}
            />
          </div>

          <Button
            onClick={correctEssay}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصحيح...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                تصحيح عام (إملائي وقواعدي ونوع المقالة)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {correction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              نتائج التصحيح
            </h3>
            <Button
              onClick={exportCorrection}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير التصحيح
            </Button>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-white whitespace-pre-wrap">{correction}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ArabicEssayWriter;
