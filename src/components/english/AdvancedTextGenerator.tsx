
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Languages, Copy, Volume2, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedTextGeneratorProps {
  language: 'ar' | 'en';
}

const AdvancedTextGenerator: React.FC<AdvancedTextGeneratorProps> = ({ language }) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('formal');
  const [difficulty, setDifficulty] = useState('medium');
  const [wordCount, setWordCount] = useState('100');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [arabicTranslation, setArabicTranslation] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const { toast } = useToast();

  const t = {
    ar: {
      title: "مولد النصوص الإنجليزية المتقدم",
      subtitle: "أنشئ نصوص إنجليزية احترافية مع خيارات متقدمة",
      topicLabel: "الموضوع",
      topicPlaceholder: "أدخل موضوع النص...",
      descriptionLabel: "وصف تفصيلي",
      descriptionPlaceholder: "اشرح بالتفصيل عن ماذا تريد أن يتحدث النص...",
      styleLabel: "أسلوب الكتابة",
      difficultyLabel: "مستوى الصعوبة",
      wordCountLabel: "عدد الكلمات",
      languageLabel: "لغة النص",
      generateButton: "توليد النص",
      generating: "جاري التوليد...",
      generatedText: "النص المولد",
      translation: "الترجمة العربية",
      copyText: "نسخ النص",
      listenText: "استمع للنص",
      voiceLabel: "اختر صوت للقراءة",
      styles: {
        formal: "رسمي",
        poetic: "شعري",
        exaggerated: "مبالغ فيه",
        advanced: "أكاديمي متقدم",
        simple: "بسيط",
        narrative: "سردي"
      },
      difficulties: {
        easy: "سهل",
        medium: "متوسط", 
        hard: "صعب"
      },
      languages: {
        en: "إنجليزي فقط",
        both: "إنجليزي + ترجمة عربية"
      }
    },
    en: {
      title: "Advanced English Text Generator",
      subtitle: "Create professional English texts with advanced options",
      topicLabel: "Topic",
      topicPlaceholder: "Enter the text topic...",
      descriptionLabel: "Detailed Description",
      descriptionPlaceholder: "Explain in detail what you want the text to discuss...",
      styleLabel: "Writing Style",
      difficultyLabel: "Difficulty Level",
      wordCountLabel: "Word Count",
      languageLabel: "Text Language",
      generateButton: "Generate Text",
      generating: "Generating...",
      generatedText: "Generated Text",
      translation: "Arabic Translation",
      copyText: "Copy Text",
      listenText: "Listen to Text",
      voiceLabel: "Choose voice for reading",
      styles: {
        formal: "Formal",
        poetic: "Poetic",
        exaggerated: "Exaggerated",
        advanced: "Advanced Academic",
        simple: "Simple",
        narrative: "Narrative"
      },
      difficulties: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
      },
      languages: {
        en: "English Only",
        both: "English + Arabic Translation"
      }
    }
  };

  const currentLang = t[language];

  // Initialize voices
  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en-')
      );
      setVoices(englishVoices);
      if (englishVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(englishVoices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const generateText = async () => {
    if (!topic.trim()) {
      toast({
        title: language === 'ar' ? "يرجى إدخال موضوع النص" : "Please enter a topic",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-text-generator', {
        body: {
          topic,
          description,
          style,
          difficulty,
          wordCount,
          language: outputLanguage
        }
      });

      if (error) throw error;

      setGeneratedText(data.englishText);
      setArabicTranslation(data.arabicTranslation || '');
      
      toast({
        title: language === 'ar' ? "تم توليد النص بنجاح" : "Text generated successfully",
      });
    } catch (error) {
      console.error('Text generation error:', error);
      toast({
        title: language === 'ar' ? "حدث خطأ أثناء توليد النص" : "Error generating text",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: language === 'ar' ? "تم نسخ النص" : "Text copied",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 mb-2 flex items-center justify-center gap-3">
          <Sparkles className="w-7 h-7" />
          {currentLang.title}
        </h2>
        <p className="text-white/70">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Input Form */}
      <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {currentLang.topicLabel}
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={currentLang.topicPlaceholder}
                className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {currentLang.wordCountLabel}
              </label>
              <Select value={wordCount} onValueChange={setWordCount}>
                <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-indigo-950 border-indigo-500/30">
                  {['25', '50', '100', '200', '500', '1000'].map((count) => (
                    <SelectItem key={count} value={count} className="text-white hover:bg-indigo-800">
                      {count} كلمة
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {currentLang.descriptionLabel}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={currentLang.descriptionPlaceholder}
              className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {currentLang.styleLabel}
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-indigo-950 border-indigo-500/30">
                  {Object.entries(currentLang.styles).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {currentLang.difficultyLabel}
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-indigo-950 border-indigo-500/30">
                  {Object.entries(currentLang.difficulties).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {currentLang.languageLabel}
              </label>
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-indigo-950 border-indigo-500/30">
                  {Object.entries(currentLang.languages).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={generateText}
              disabled={!topic.trim() || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {currentLang.generating}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {currentLang.generateButton}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Text Results */}
      {generatedText && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* English Text */}
          <Card className="bg-white/5 backdrop-blur-sm border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {currentLang.generatedText}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => playAudio(generatedText)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-blue-500/30 text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(generatedText)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-blue-500/30 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {generatedText}
                </p>
              </div>
              
              {/* Voice Selection */}
              {voices.length > 0 && (
                <div className="mt-4 flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm text-white/70 mb-2">{currentLang.voiceLabel}</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-indigo-950 border-indigo-500/30">
                        {voices.map((voice) => (
                          <SelectItem key={voice.name} value={voice.name} className="text-white hover:bg-indigo-800">
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arabic Translation */}
          {arabicTranslation && (
            <Card className="bg-white/5 backdrop-blur-sm border-green-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    {currentLang.translation}
                  </CardTitle>
                  <Button
                    onClick={() => copyToClipboard(arabicTranslation)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-green-500/30 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-right" dir="rtl">
                    {arabicTranslation}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedTextGenerator;
