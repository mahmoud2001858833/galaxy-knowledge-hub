import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, FileText, Lightbulb, CheckCircle } from 'lucide-react';

type EssayType = 'essay' | 'story' | 'descriptive' | 'argumentative' | 'narrative';

interface EnglishEssayWriterProps {
  language: 'ar' | 'en';
}

const EnglishEssayWriter: React.FC<EnglishEssayWriterProps> = ({ language }) => {
  const [mode, setMode] = useState<'practice' | 'generate'>('practice');
  const [essayText, setEssayText] = useState('');
  const [essayType, setEssayType] = useState<EssayType>('essay');
  const [wordCount, setWordCount] = useState(300);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState('');
  const [generatedEssay, setGeneratedEssay] = useState('');
  const { toast } = useToast();

  const t = {
    ar: {
      practiceMode: 'التدريب على التعبير',
      generateMode: 'مولد التعابير',
      writeEssay: 'كتابة التعبير',
      essayType: 'نوع التعبير',
      uploadImage: 'رفع صورة',
      imageUploaded: 'تم رفع',
      essayText: 'نص التعبير',
      essayPlaceholder: 'اكتب تعبيرك هنا...',
      generalCorrection: 'تصحيح عام (إملائي وقواعدي ونوع المقالة)',
      correcting: 'جاري التصحيح...',
      correctionResults: 'نتائج التصحيح',
      generateEssay: 'إنشاء تعبير تلقائي',
      wordCountLabel: 'عدد الكلمات (50-2000)',
      additionalInfo: 'معلومات إضافية (اختياري)',
      additionalInfoPlaceholder: 'أضف معلومات إضافية حول الموضوع المطلوب...',
      generating: 'جاري الإنشاء...',
      generateButton: 'إنشاء التعبير',
      generatedEssay: 'التعبير المُنشأ',
      textExtracted: 'تم استخراج النص',
      textExtractedDesc: 'تم استخراج النص من الصورة بنجاح',
      error: 'خطأ',
      extractError: 'حدث خطأ أثناء استخراج النص من الصورة',
      enterText: 'الرجاء كتابة أو رفع نص للتصحيح',
      correctionComplete: 'تم التصحيح',
      correctionCompleteDesc: 'تم تصحيح التعبير بنجاح',
      correctionError: 'حدث خطأ أثناء تصحيح التعبير',
      wordCountError: 'عدد الكلمات يجب أن يكون بين 50 و 2000',
      essayGenerated: 'تم إنشاء التعبير',
      essayGeneratedDesc: 'تم إنشاء تعبير متكامل بنجاح',
      generateError: 'حدث خطأ أثناء إنشاء التعبير'
    },
    en: {
      practiceMode: 'Essay Practice',
      generateMode: 'Essay Generator',
      writeEssay: 'Write Essay',
      essayType: 'Essay Type',
      uploadImage: 'Upload Image',
      imageUploaded: 'Uploaded',
      essayText: 'Essay Text',
      essayPlaceholder: 'Write your essay here...',
      generalCorrection: 'General Correction (Spelling, Grammar & Type)',
      correcting: 'Correcting...',
      correctionResults: 'Correction Results',
      generateEssay: 'Auto-Generate Essay',
      wordCountLabel: 'Word Count (50-2000)',
      additionalInfo: 'Additional Info (optional)',
      additionalInfoPlaceholder: 'Add additional information about the required topic...',
      generating: 'Generating...',
      generateButton: 'Generate Essay',
      generatedEssay: 'Generated Essay',
      textExtracted: 'Text Extracted',
      textExtractedDesc: 'Text extracted from image successfully',
      error: 'Error',
      extractError: 'Error extracting text from image',
      enterText: 'Please write or upload text to correct',
      correctionComplete: 'Correction Complete',
      correctionCompleteDesc: 'Essay corrected successfully',
      correctionError: 'Error correcting essay',
      wordCountError: 'Word count must be between 50 and 2000',
      essayGenerated: 'Essay Generated',
      essayGeneratedDesc: 'Complete essay generated successfully',
      generateError: 'Error generating essay'
    }
  };

  const content = t[language];

  const essayTypes = {
    essay: language === 'ar' ? 'مقالة' : 'Essay',
    story: language === 'ar' ? 'قصة' : 'Story',
    descriptive: language === 'ar' ? 'وصفي' : 'Descriptive',
    argumentative: language === 'ar' ? 'حجاجي' : 'Argumentative',
    narrative: language === 'ar' ? 'سردي' : 'Narrative'
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      extractTextFromImage(file);
    }
  };

  const extractTextFromImage = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('real-ocr-translator', {
          body: { image: base64 }
        });

        if (error) throw error;
        setEssayText(data.englishText || data.text || '');
        toast({
          title: content.textExtracted,
          description: content.textExtractedDesc,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error extracting text:', error);
      toast({
        title: content.error,
        description: content.extractError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

    try {
      const { data, error } = await supabase.functions.invoke('english-essay-corrector', {
        body: {
          text: essayText,
          essayType
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
        description: content.correctionError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEssay = async () => {
    if (wordCount < 50 || wordCount > 2000) {
      toast({
        title: content.error,
        description: content.wordCountError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('english-essay-generator', {
        body: {
          essayType,
          wordCount,
          additionalInfo
        }
      });

      if (error) throw error;

      setGeneratedEssay(data.essay);
      toast({
        title: content.essayGenerated,
        description: content.essayGeneratedDesc,
      });
    } catch (error) {
      console.error('Error generating essay:', error);
      toast({
        title: content.error,
        description: content.generateError,
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
          {content.practiceMode}
        </Button>
        <Button
          onClick={() => setMode('generate')}
          variant={mode === 'generate' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Lightbulb className="mr-2 h-5 w-5" />
          {content.generateMode}
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
              <CardTitle className="text-white">{content.writeEssay}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {content.essayType}
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
                  onClick={() => document.getElementById('image-upload-en')?.click()}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {content.uploadImage}
                </Button>
                <input
                  id="image-upload-en"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imageFile && (
                <p className="text-sm text-green-400">
                  {content.imageUploaded}: {imageFile.name}
                </p>
              )}

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
                <CheckCircle className="mr-2 h-4 w-4" />
                {loading ? content.correcting : content.generalCorrection}
              </Button>
            </CardContent>
          </Card>

          {correction && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{content.correctionResults}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{correction}</p>
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
              <CardTitle className="text-white">{content.generateEssay}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {content.essayType}
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
                  {content.wordCountLabel}
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
                  {content.additionalInfo}
                </label>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder={content.additionalInfoPlaceholder}
                  className="min-h-[100px] bg-white/5 border-white/20 text-white"
                />
              </div>

              <Button
                onClick={generateEssay}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? content.generating : content.generateButton}
              </Button>
            </CardContent>
          </Card>

          {generatedEssay && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{content.generatedEssay}</CardTitle>
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

export default EnglishEssayWriter;