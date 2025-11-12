import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Loader2, Languages } from 'lucide-react';

interface EnglishEssayWriterProps {
  language: 'ar' | 'en';
}

const EnglishEssayWriter: React.FC<EnglishEssayWriterProps> = ({ language }) => {
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [translatedCorrection, setTranslatedCorrection] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();

  const t = {
    ar: {
      essayText: 'نص التعبير',
      essayPlaceholder: 'اكتب أو الصق نص التعبير هنا...',
      generalCorrection: 'تصحيح عام (إملائي وقواعدي ونوع المقالة)',
      correcting: 'جاري التصحيح...',
      correction: 'نتائج التصحيح',
      export: 'تصدير التصحيح',
      translate: 'ترجم للعربية',
      error: 'خطأ',
      enterText: 'الرجاء كتابة نص للتصحيح',
      correctionComplete: 'تم التصحيح',
      correctionCompleteDesc: 'تم تصحيح التعبير بنجاح',
      errorCorrecting: 'حدث خطأ أثناء تصحيح التعبير',
      exported: 'تم التصدير',
      exportedDesc: 'تم تصدير التصحيح بنجاح',
      translationTitle: 'الترجمة للعربية:'
    },
    en: {
      essayText: 'Essay Text',
      essayPlaceholder: 'Write or paste your essay here...',
      generalCorrection: 'General Correction (Spelling, Grammar & Type)',
      correcting: 'Correcting...',
      correction: 'Correction Results',
      export: 'Export Correction',
      translate: 'Translate to Arabic',
      error: 'Error',
      enterText: 'Please write text to correct',
      correctionComplete: 'Correction Complete',
      correctionCompleteDesc: 'Essay corrected successfully',
      errorCorrecting: 'Error correcting essay',
      exported: 'Exported',
      exportedDesc: 'Correction exported successfully',
      translationTitle: 'Arabic Translation:'
    }
  };

  const content = t[language];

  const translateCorrection = async () => {
    if (!correction) return;

    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-translator', {
        body: {
          text: correction,
          sourceLang: 'en',
          targetLang: 'ar'
        }
      });

      if (error) throw error;

      setTranslatedCorrection(data.translatedText);
      toast({
        title: 'تمت الترجمة',
        description: 'تم ترجمة التصحيح بنجاح',
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'خطأ في الترجمة',
        description: 'حدث خطأ أثناء الترجمة',
        variant: 'destructive'
      });
    } finally {
      setTranslating(false);
    }
  };

  const correctEssay = async () => {
    if (!essayText.trim()) {
      toast({
        title: content.error,
        description: content.enterText,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTranslatedCorrection(null);

    try {
      const { data, error } = await supabase.functions.invoke('english-essay-corrector', {
        body: {
          text: essayText
        }
      });

      if (error) throw error;

      setCorrection(data.correction);
      toast({
        title: content.correctionComplete,
        description: content.correctionCompleteDesc,
      });
    } catch (error) {
      console.error('Error correcting essay:', error);
      toast({
        title: content.error,
        description: content.errorCorrecting,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCorrection = () => {
    if (!correction) return;

    let contentText = `=== English Essay Correction ===\n\n${correction}`;
    
    if (translatedCorrection) {
      contentText += `\n\n=== Arabic Translation ===\n\n${translatedCorrection}`;
    }

    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correction-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: content.exported,
      description: content.exportedDesc,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {language === 'ar' ? 'أداة تصحيح التعبير الإنجليزي' : 'English Essay Correction Tool'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {content.essayText}
            </label>
            <Textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder={content.essayPlaceholder}
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
                {content.correcting}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                {content.generalCorrection}
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
              {content.correction}
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={translateCorrection}
                disabled={translating}
                variant="outline"
                className="gap-2"
              >
                {translating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                {content.translate}
              </Button>
              <Button
                onClick={exportCorrection}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {content.export}
              </Button>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-white whitespace-pre-wrap">{correction}</div>
                {translatedCorrection && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-bold text-blue-300 mb-3">{content.translationTitle}</h4>
                    <div className="text-white/80 whitespace-pre-wrap">{translatedCorrection}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default EnglishEssayWriter;