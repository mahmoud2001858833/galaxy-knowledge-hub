
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, FileText, Download, Copy, Volume2, Pause, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnglishTextGeneratorProps {
  language: 'ar' | 'en';
}

const EnglishTextGenerator: React.FC<EnglishTextGeneratorProps> = ({ language }) => {
  const [textPrompt, setTextPrompt] = useState('');
  const [textType, setTextType] = useState('formal');
  const [wordCount, setWordCount] = useState(200);
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  const { toast } = useToast();

  const t = {
    ar: {
      title: "مولد النصوص الإنجليزية المحترفة",
      subtitle: "إنشاء نصوص إنجليزية احترافية بمساعدة الذكاء الاصطناعي",
      topicPrompt: "موضوع النص",
      enterTopic: "أدخل موضوع النص المطلوب...",
      textTypeLabel: "نوع النص",
      wordCountLabel: "عدد الكلمات",
      voiceLabel: "الصوت للقراءة",
      generateText: "إنشاء النص",
      generating: "جاري الإنشاء...",
      generatedResult: "النص المُنشأ",
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
      examples: {
        formal: "Climate change and environmental policies",
        academic: "The impact of artificial intelligence on education",
        business: "Digital marketing strategies for small businesses",
        creative: "A day in the life of a time traveler",
        technical: "Blockchain technology implementation",
        persuasive: "The importance of renewable energy adoption",
        informative: "Benefits of meditation and mindfulness",
        narrative: "An adventure in the Amazon rainforest"
      },
      tips: {
        formal: "النص الرسمي يستخدم لغة مهذبة ومحترمة",
        academic: "النص الأكاديمي يعتمد على المراجع والأدلة",
        business: "النص التجاري يركز على النتائج والفوائد",
        creative: "النص الإبداعي يستخدم الخيال والوصف",
        technical: "النص التقني يشرح العمليات والإجراءات",
        persuasive: "النص الإقناعي يهدف لتغيير الآراء",
        informative: "النص الإعلامي يقدم معلومات مفيدة",
        narrative: "النص السردي يحكي قصة أو تجربة"
      },
      generationSuccess: "تم إنشاء النص بنجاح",
      generationError: "حدث خطأ أثناء إنشاء النص",
      textCopied: "تم نسخ النص",
      enterTopicFirst: "يرجى إدخال موضوع النص أولاً"
    },
    en: {
      title: "Professional English Text Generator",
      subtitle: "Create professional English texts with AI assistance",
      topicPrompt: "Text Topic",
      enterTopic: "Enter the topic for the text...",
      textTypeLabel: "Text Type",
      wordCountLabel: "Word Count",
      voiceLabel: "Voice for Reading",
      generateText: "Generate Text",
      generating: "Generating...",
      generatedResult: "Generated Text",
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
      examples: {
        formal: "Climate change and environmental policies",
        academic: "The impact of artificial intelligence on education",
        business: "Digital marketing strategies for small businesses",
        creative: "A day in the life of a time traveler",
        technical: "Blockchain technology implementation",
        persuasive: "The importance of renewable energy adoption",
        informative: "Benefits of meditation and mindfulness",
        narrative: "An adventure in the Amazon rainforest"
      },
      tips: {
        formal: "Formal text uses polite and respectful language",
        academic: "Academic text relies on references and evidence",
        business: "Business text focuses on results and benefits",
        creative: "Creative text uses imagination and description",
        technical: "Technical text explains processes and procedures",
        persuasive: "Persuasive text aims to change opinions",
        informative: "Informative text provides useful information",
        narrative: "Narrative text tells a story or experience"
      },
      generationSuccess: "Text generated successfully",
      generationError: "Error generating text",
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
      const prompt = `Write a ${textType} English text about "${textPrompt}" with approximately ${wordCount} words. 
      Make it professional, well-structured, and engaging. 
      ${textType === 'academic' ? 'Include proper structure with introduction, body, and conclusion.' : ''}
      ${textType === 'business' ? 'Focus on practical benefits and actionable insights.' : ''}
      ${textType === 'creative' ? 'Use vivid descriptions and engaging storytelling.' : ''}
      ${textType === 'technical' ? 'Explain concepts clearly with step-by-step details.' : ''}
      ${textType === 'persuasive' ? 'Use compelling arguments and evidence.' : ''}
      ${textType === 'informative' ? 'Provide clear, factual information.' : ''}
      ${textType === 'narrative' ? 'Tell an engaging story with character development.' : ''}`;

      const { data, error } = await supabase.functions.invoke('english-ai-assistant', {
        body: {
          message: prompt,
          language: 'en'
        }
      });

      if (error) throw error;
      setGeneratedText(data.reply);
      
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
      const element = document.createElement('a');
      const file = new Blob([generatedText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${textPrompt.slice(0, 30)}-${textType}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const useExample = () => {
    setTextPrompt(currentLang.examples[textType as keyof typeof currentLang.examples]);
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
              {language === 'ar' ? 'إعدادات النص' : 'Text Settings'}
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

            {/* Text Type Selection */}
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
              
              {/* Type Description */}
              <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-200">
                {currentLang.tips[textType as keyof typeof currentLang.tips]}
              </div>
            </div>

            {/* Word Count and Voice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Example Button */}
            <Button
              onClick={useExample}
              variant="outline"
              className="w-full bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
            >
              {language === 'ar' ? 'استخدام مثال' : 'Use Example'}
            </Button>

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
                    className="min-h-80 bg-white/10 border-white/20 text-white resize-none"
                    placeholder="Generated text will appear here..."
                  />
                </div>

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
