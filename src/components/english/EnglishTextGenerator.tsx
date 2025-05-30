
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, FileText, Download, Copy, Volume2, Pause, Loader2, Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Slider } from '@/components/ui/slider';

interface EnglishTextGeneratorProps {
  language: 'ar' | 'en';
}

const EnglishTextGenerator: React.FC<EnglishTextGeneratorProps> = ({ language }) => {
  const [textPrompt, setTextPrompt] = useState('');
  const [textType, setTextType] = useState('formal');
  const [textStyle, setTextStyle] = useState('standard');
  const [textLevel, setTextLevel] = useState('intermediate');
  const [wordCount, setWordCount] = useState(200);
  const [poeticLevel, setPoeticLevel] = useState([3]);
  const [vocabularyLevel, setVocabularyLevel] = useState([3]);
  const [generatedText, setGeneratedText] = useState('');
  const [arabicTranslation, setArabicTranslation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const { toast } = useToast();

  const t = {
    ar: {
      title: "مولد النصوص الإنجليزية المحترفة",
      subtitle: "إنشاء نصوص إنجليزية احترافية بمساعدة الذكاء الاصطناعي",
      topicPrompt: "موضوع النص",
      enterTopic: "أدخل موضوع النص المطلوب...",
      textTypeLabel: "نوع النص",
      textStyleLabel: "أسلوب النص",
      textLevelLabel: "مستوى النص",
      wordCountLabel: "عدد الكلمات",
      poeticLevelLabel: "المبالغة الشعرية",
      vocabularyLevelLabel: "مستوى المفردات",
      voiceLabel: "الصوت للقراءة",
      generateText: "إنشاء النص",
      translateText: "ترجمة النص",
      generating: "جاري الإنشاء...",
      translating: "جاري الترجمة...",
      generatedResult: "النص المُنشأ",
      arabicTranslation: "الترجمة العربية",
      downloadText: "تحميل النص",
      copyText: "نسخ النص",
      listenText: "استمع للنص",
      textTypes: {
        formal: "رسمي",
        academic: "أكاديمي",
        business: "تجاري",
        creative: "إبداعي",
        technical: "تقني",
        persuasive: "إقناعي",
        informative: "إعلامي",
        narrative: "سردي"
      },
      textStyles: {
        standard: "عادي",
        poetic: "شعري",
        modern: "حديث",
        classical: "كلاسيكي",
        conversational: "محادثة",
        sophisticated: "متطور"
      },
      textLevels: {
        beginner: "مبتدئ",
        intermediate: "متوسط",
        advanced: "متقدم",
        expert: "خبير"
      },
      generationSuccess: "تم إنشاء النص بنجاح",
      generationError: "حدث خطأ أثناء إنشاء النص",
      translationSuccess: "تم ترجمة النص بنجاح",
      translationError: "حدث خطأ أثناء الترجمة",
      textCopied: "تم نسخ النص",
      enterTopicFirst: "يرجى إدخال موضوع النص أولاً"
    },
    en: {
      title: "Professional English Text Generator",
      subtitle: "Create professional English texts with AI assistance",
      topicPrompt: "Text Topic",
      enterTopic: "Enter the topic for the text...",
      textTypeLabel: "Text Type",
      textStyleLabel: "Text Style",
      textLevelLabel: "Text Level",
      wordCountLabel: "Word Count",
      poeticLevelLabel: "Poetic Enhancement",
      vocabularyLevelLabel: "Vocabulary Level",
      voiceLabel: "Voice for Reading",
      generateText: "Generate Text",
      translateText: "Translate Text",
      generating: "Generating...",
      translating: "Translating...",
      generatedResult: "Generated Text",
      arabicTranslation: "Arabic Translation",
      downloadText: "Download Text",
      copyText: "Copy Text",
      listenText: "Listen to Text",
      textTypes: {
        formal: "Formal",
        academic: "Academic",
        business: "Business",
        creative: "Creative",
        technical: "Technical",
        persuasive: "Persuasive",
        informative: "Informative",
        narrative: "Narrative"
      },
      textStyles: {
        standard: "Standard",
        poetic: "Poetic",
        modern: "Modern",
        classical: "Classical",
        conversational: "Conversational",
        sophisticated: "Sophisticated"
      },
      textLevels: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert"
      },
      generationSuccess: "Text generated successfully",
      generationError: "Error generating text",
      translationSuccess: "Text translated successfully",
      translationError: "Error translating text",
      textCopied: "Text copied to clipboard",
      enterTopicFirst: "Please enter a topic first"
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
    if (!textPrompt.trim()) {
      toast({
        title: currentLang.enterTopicFirst,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const poeticLevelText = poeticLevel[0] === 1 ? 'minimal' : 
                            poeticLevel[0] === 2 ? 'light' :
                            poeticLevel[0] === 3 ? 'moderate' :
                            poeticLevel[0] === 4 ? 'high' : 'very high';
      
      const vocabLevelText = vocabularyLevel[0] === 1 ? 'basic' :
                            vocabularyLevel[0] === 2 ? 'simple' :
                            vocabularyLevel[0] === 3 ? 'intermediate' :
                            vocabularyLevel[0] === 4 ? 'advanced' : 'sophisticated';

      const prompt = `Write a ${textType} English text about "${textPrompt}" with the following specifications:
      
      - Length: approximately ${wordCount} words
      - Style: ${textStyle}
      - Level: ${textLevel}
      - Poetic enhancement: ${poeticLevelText}
      - Vocabulary level: ${vocabLevelText}
      
      Make it professional, well-structured, and engaging. 
      ${textType === 'academic' ? 'Include proper structure with introduction, body, and conclusion.' : ''}
      ${textType === 'business' ? 'Focus on practical benefits and actionable insights.' : ''}
      ${textType === 'creative' ? 'Use vivid descriptions and engaging storytelling.' : ''}
      ${textType === 'technical' ? 'Explain concepts clearly with step-by-step details.' : ''}
      ${textType === 'persuasive' ? 'Use compelling arguments and evidence.' : ''}
      ${textType === 'informative' ? 'Provide clear, factual information.' : ''}
      ${textType === 'narrative' ? 'Tell an engaging story with character development.' : ''}
      
      ${textStyle === 'poetic' ? 'Use poetic language, metaphors, and figurative speech.' : ''}
      ${textStyle === 'sophisticated' ? 'Use advanced vocabulary and complex sentence structures.' : ''}
      ${poeticLevel[0] >= 4 ? 'Include literary devices like alliteration, imagery, and symbolism.' : ''}
      ${vocabularyLevel[0] >= 4 ? 'Use advanced and sophisticated vocabulary appropriate for educated readers.' : ''}`;

      const { data, error } = await supabase.functions.invoke('english-ai-assistant', {
        body: {
          message: prompt,
          language: 'en'
        }
      });

      if (error) throw error;
      setGeneratedText(data.reply);
      setShowTranslation(false);
      setArabicTranslation('');
      
      toast({
        title: currentLang.generationSuccess,
      });
    } catch (error) {
      console.error('Text generation error:', error);
      toast({
        title: currentLang.generationError,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const translateText = async () => {
    if (!generatedText) return;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-translator', {
        body: {
          text: generatedText,
          direction: 'en-ar',
          context: 'formal',
          language: 'ar'
        }
      });

      if (error) throw error;
      setArabicTranslation(data.translation);
      setShowTranslation(true);
      
      toast({
        title: currentLang.translationSuccess,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: currentLang.translationError,
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const playAudio = () => {
    if (!generatedText) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(generatedText);
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

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
      toast({
        title: currentLang.textCopied,
      });
    }
  };

  const downloadText = () => {
    if (generatedText) {
      const content = showTranslation ? 
        `English Text:\n${generatedText}\n\nArabic Translation:\n${arabicTranslation}` : 
        generatedText;
      
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${textPrompt.slice(0, 30)}-${textType}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-indigo-300 mb-2 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Wand2 className="w-7 h-7" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70">
          {currentLang.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {language === 'ar' ? 'إعدادات النص المتقدمة' : 'Advanced Text Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topic Input */}
            <div>
              <label className="block text-sm text-white/70 mb-2">{currentLang.topicPrompt}</label>
              <Input
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder={currentLang.enterTopic}
                className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
              />
            </div>

            {/* Text Type and Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.textTypeLabel}</label>
                <Select value={textType} onValueChange={setTextType}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {Object.entries(currentLang.textTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.textStyleLabel}</label>
                <Select value={textStyle} onValueChange={setTextStyle}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {Object.entries(currentLang.textStyles).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Level and Word Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.textLevelLabel}</label>
                <Select value={textLevel} onValueChange={setTextLevel}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {Object.entries(currentLang.textLevels).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.wordCountLabel}</label>
                <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    <SelectItem value="100" className="text-white hover:bg-indigo-800">100 words</SelectItem>
                    <SelectItem value="200" className="text-white hover:bg-indigo-800">200 words</SelectItem>
                    <SelectItem value="300" className="text-white hover:bg-indigo-800">300 words</SelectItem>
                    <SelectItem value="500" className="text-white hover:bg-indigo-800">500 words</SelectItem>
                    <SelectItem value="1000" className="text-white hover:bg-indigo-800">1000 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Sliders */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {currentLang.poeticLevelLabel}: {poeticLevel[0]}/5
                </label>
                <Slider
                  value={poeticLevel}
                  onValueChange={setPoeticLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {currentLang.vocabularyLevelLabel}: {vocabularyLevel[0]}/5
                </label>
                <Slider
                  value={vocabularyLevel}
                  onValueChange={setVocabularyLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Voice Selection */}
            <div>
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

            {/* Generate Button */}
            <Button
              onClick={generateText}
              disabled={!textPrompt.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {currentLang.generating}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {currentLang.generateText}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Text Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {currentLang.generatedResult}
              </div>
              {generatedText && (
                <div className="flex gap-1">
                  <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 text-xs">
                    {generatedText.split(' ').length} words
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedText ? (
              <div className="space-y-4">
                {/* Generated Text Display */}
                <div className="max-h-96 overflow-y-auto">
                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="min-h-60 bg-white/10 border-white/20 text-white resize-none"
                    placeholder="Generated text will appear here..."
                  />
                </div>

                {/* Translation Section */}
                {showTranslation && arabicTranslation && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-green-300 mb-2 flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      {currentLang.arabicTranslation}
                    </h4>
                    <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-right" dir="rtl">
                        {arabicTranslation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={playAudio}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                    {currentLang.listenText}
                  </Button>
                  
                  <Button
                    onClick={translateText}
                    disabled={isTranslating}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-green-500/30 text-white hover:bg-white/20"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4 mr-1" />
                    )}
                    {currentLang.translateText}
                  </Button>
                  
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {currentLang.copyText}
                  </Button>
                  
                  <Button
                    onClick={downloadText}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {currentLang.downloadText}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wand2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">
                  {language === 'ar' ? 'أدخل موضوعاً لإنشاء النص' : 'Enter a topic to generate text'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnglishTextGenerator;
