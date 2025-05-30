
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRightLeft, Volume2, Copy, BookOpen, Lightbulb, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageTextExtractor from './ImageTextExtractor';
import EnglishTextGenerator from './EnglishTextGenerator';

interface SmartTranslatorProps {
  language: 'ar' | 'en';
}

interface TranslationResult {
  translation: string;
  explanation: string;
  keyWords: Array<{
    word: string;
    meaning: string;
    pronunciation: string;
  }>;
  suggestions: string[];
}

const SmartTranslator: React.FC<SmartTranslatorProps> = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [direction, setDirection] = useState<'ar-en' | 'en-ar'>('ar-en');
  const [context, setContext] = useState('formal');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'translator' | 'image-translate' | 'text-generator'>('translator');

  const { toast } = useToast();

  const t = {
    ar: {
      title: "المترجم الذكي المتطور",
      subtitle: "ترجمة ذكية وتعليمية بين العربية والإنجليزية مع شرح مفصل",
      inputLabel: "النص المراد ترجمته",
      inputPlaceholder: "أدخل النص هنا...",
      translateButton: "ترجمة ذكية",
      translating: "جاري الترجمة...",
      translationResult: "نتيجة الترجمة",
      explanation: "شرح الترجمة",
      keyWords: "الكلمات المفتاحية",
      suggestions: "اقتراحات للتحسين",
      contextLabel: "السياق",
      voiceLabel: "اختر صوت للقراءة",
      listenTranslation: "استمع للترجمة",
      copyTranslation: "نسخ الترجمة",
      switchDirection: "تبديل الاتجاه",
      contexts: {
        formal: "رسمي",
        academic: "أكاديمي", 
        conversational: "محادثة",
        literary: "أدبي"
      },
      tabs: {
        translator: "المترجم الذكي",
        imageTranslate: "ترجمة الصور",
        textGenerator: "مولد النصوص"
      },
      translationSuccess: "تم إنجاز الترجمة بنجاح",
      translationError: "حدث خطأ أثناء الترجمة",
      enterTextFirst: "يرجى إدخال نص للترجمة"
    },
    en: {
      title: "Advanced Smart Translator",
      subtitle: "Intelligent educational translation between Arabic and English with detailed explanations",
      inputLabel: "Text to translate",
      inputPlaceholder: "Enter text here...",
      translateButton: "Smart Translate",
      translating: "Translating...",
      translationResult: "Translation Result",
      explanation: "Translation Explanation",
      keyWords: "Key Words",
      suggestions: "Improvement Suggestions",
      contextLabel: "Context",
      voiceLabel: "Choose voice for reading",
      listenTranslation: "Listen to Translation",
      copyTranslation: "Copy Translation",
      switchDirection: "Switch Direction",
      contexts: {
        formal: "Formal",
        academic: "Academic",
        conversational: "Conversational", 
        literary: "Literary"
      },
      tabs: {
        translator: "Smart Translator",
        imageTranslate: "Image Translation",
        textGenerator: "Text Generator"
      },
      translationSuccess: "Translation completed successfully",
      translationError: "Error during translation",
      enterTextFirst: "Please enter text to translate"
    }
  };

  const currentLang = t[language];

  // Initialize voices
  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const targetLang = direction === 'ar-en' ? 'en-' : 'ar-';
      const filteredVoices = availableVoices.filter(voice => 
        voice.lang.startsWith(targetLang) || 
        (direction === 'en-ar' && voice.lang.includes('ar'))
      );
      setVoices(filteredVoices);
      if (filteredVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(filteredVoices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [direction, selectedVoice]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: currentLang.enterTextFirst,
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-translator', {
        body: {
          text: inputText,
          direction,
          context,
          language
        }
      });

      if (error) throw error;

      setTranslationResult(data);
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

  const switchDirection = () => {
    const newDirection = direction === 'ar-en' ? 'en-ar' : 'ar-en';
    setDirection(newDirection);
    setInputText(translationResult?.translation || '');
    setTranslationResult(null);
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

  const handleImageTextExtracted = (text: string) => {
    setActiveTab('translator');
    setInputText(text);
    setDirection('en-ar');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image-translate':
        return <ImageTextExtractor onTextExtracted={handleImageTextExtracted} language={language} />;
      case 'text-generator':
        return <EnglishTextGenerator language={language} />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-indigo-300 flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  {direction === 'ar-en' ? 'عربي → إنجليزي' : 'English → عربي'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Direction and Context Controls */}
                <div className="flex gap-3">
                  <Button
                    onClick={switchDirection}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-1" />
                    {currentLang.switchDirection}
                  </Button>
                  
                  <Select value={context} onValueChange={setContext}>
                    <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-indigo-950 border-indigo-500/30">
                      {Object.entries(currentLang.contexts).map(([key, value]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Input Text */}
                <div>
                  <label className="block text-sm text-white/70 mb-2">{currentLang.inputLabel}</label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={currentLang.inputPlaceholder}
                    className="min-h-32 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
                    dir={direction === 'ar-en' ? 'rtl' : 'ltr'}
                  />
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

                {/* Translate Button */}
                <Button
                  onClick={handleTranslate}
                  disabled={!inputText.trim() || isTranslating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isTranslating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Languages className="w-4 h-4" />
                      </motion.div>
                      {currentLang.translating}
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" />
                      {currentLang.translateButton}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Translation Result Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {currentLang.translationResult}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {translationResult ? (
                  <div className="space-y-6">
                    {/* Translation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{currentLang.translationResult}</h4>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => playAudio(translationResult.translation)}
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-purple-500/30 text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(translationResult.translation)}
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-purple-500/30 text-white hover:bg-white/20"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                        <p className="text-white/90 leading-relaxed" dir={direction === 'ar-en' ? 'ltr' : 'rtl'}>
                          {translationResult.translation}
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {currentLang.explanation}
                      </h4>
                      <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                        <p className="text-white/80 text-sm">{translationResult.explanation}</p>
                      </div>
                    </div>

                    {/* Key Words */}
                    {translationResult.keyWords && translationResult.keyWords.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-300 mb-2">{currentLang.keyWords}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {translationResult.keyWords.map((word, index) => (
                            <div key={index} className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
                              <div className="flex items-center justify-between">
                                <Badge className="bg-green-600/20 text-green-300">{word.word}</Badge>
                                <Button
                                  onClick={() => playAudio(word.word)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-300 hover:bg-green-600/20"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-white/80 text-sm mt-1">{word.meaning}</p>
                              {word.pronunciation && (
                                <p className="text-green-300 text-xs mt-1">/{word.pronunciation}/</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {translationResult.suggestions && translationResult.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-300 mb-2">{currentLang.suggestions}</h4>
                        <div className="space-y-2">
                          {translationResult.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-2 bg-yellow-600/10 border border-yellow-500/20 rounded">
                              <p className="text-white/80 text-sm">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Languages className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">
                      {language === 'ar' ? 'أدخل نصاً للحصول على ترجمة ذكية' : 'Enter text to get intelligent translation'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
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
          <Languages className="w-7 h-7" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-1 flex gap-1">
          {Object.entries(currentLang.tabs).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default SmartTranslator;
