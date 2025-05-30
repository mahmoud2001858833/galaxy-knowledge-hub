
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Languages, Volume2, BookOpen, Lightbulb, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  grammarExplanation: string;
  suggestions: string[];
}

const SmartTranslator: React.FC<SmartTranslatorProps> = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [translationDirection, setTranslationDirection] = useState<'ar-en' | 'en-ar'>('ar-en');
  const [context, setContext] = useState('conversational');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المترجم الذكي",
      subtitle: "ترجمة تعليمية ذكية بين العربية والإنجليزية",
      fromArabic: "من العربية",
      toEnglish: "إلى الإنجليزية",
      fromEnglish: "من الإنجليزية",
      toArabic: "إلى العربية",
      enterText: "أدخل النص للترجمة...",
      translate: "ترجم",
      translating: "جاري الترجمة...",
      translation: "الترجمة",
      explanation: "الشرح والتحليل",
      pronunciation: "النطق",
      keyWords: "الكلمات المفتاحية",
      context: "السياق",
      contextTypes: {
        formal: "رسمي",
        academic: "أكاديمي",
        conversational: "محادثة",
        literary: "أدبي"
      },
      playAudio: "استمع للنطق",
      whyThisTranslation: "لماذا هذه الترجمة؟",
      grammarExplanation: "الشرح النحوي",
      suggestions: "اقتراحات للتحسين",
      saveWord: "احفظ الكلمة",
      switchDirection: "عكس الاتجاه"
    },
    en: {
      title: "Smart Translator",
      subtitle: "Intelligent educational translation between Arabic and English",
      fromArabic: "From Arabic",
      toEnglish: "To English",
      fromEnglish: "From English",
      toArabic: "To Arabic",
      enterText: "Enter text to translate...",
      translate: "Translate",
      translating: "Translating...",
      translation: "Translation",
      explanation: "Explanation & Analysis",
      pronunciation: "Pronunciation",
      keyWords: "Key Words",
      context: "Context",
      contextTypes: {
        formal: "Formal",
        academic: "Academic",
        conversational: "Conversational",
        literary: "Literary"
      },
      playAudio: "Play Pronunciation",
      whyThisTranslation: "Why This Translation?",
      grammarExplanation: "Grammar Explanation",
      suggestions: "Improvement Suggestions",
      saveWord: "Save Word",
      switchDirection: "Switch Direction"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  const switchDirection = () => {
    setTranslationDirection(prev => prev === 'ar-en' ? 'en-ar' : 'ar-en');
    setInputText('');
    setResult(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-translator', {
        body: {
          text: inputText,
          direction: translationDirection,
          context: context,
          language: language
        }
      });

      if (error) throw error;
      setResult(data);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ أثناء الترجمة" : "An error occurred during translation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contextColors = {
    formal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    academic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    conversational: 'bg-green-500/20 text-green-300 border-green-500/30',
    literary: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <div className={`space-y-6 ${textAlign}`} dir={dir}>
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-indigo-300 mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Languages className="w-8 h-8" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70 text-lg">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Translation Interface */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Direction and Context Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <Badge className={`${contextColors[context]} px-3 py-1`}>
              {translationDirection === 'ar-en' ? currentLang.fromArabic : currentLang.fromEnglish}
            </Badge>
            <Button
              onClick={switchDirection}
              variant="outline"
              size="sm"
              className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {currentLang.switchDirection}
            </Button>
            <Badge className={`${contextColors[context]} px-3 py-1`}>
              {translationDirection === 'ar-en' ? currentLang.toEnglish : currentLang.toArabic}
            </Badge>
          </div>

          <Select value={context} onValueChange={setContext}>
            <SelectTrigger className="w-48 bg-white/10 border-indigo-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-indigo-950 border-indigo-500/30">
              <SelectItem value="formal" className="text-white hover:bg-indigo-800">
                {currentLang.contextTypes.formal}
              </SelectItem>
              <SelectItem value="academic" className="text-white hover:bg-indigo-800">
                {currentLang.contextTypes.academic}
              </SelectItem>
              <SelectItem value="conversational" className="text-white hover:bg-indigo-800">
                {currentLang.contextTypes.conversational}
              </SelectItem>
              <SelectItem value="literary" className="text-white hover:bg-indigo-800">
                {currentLang.contextTypes.literary}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentLang.enterText}
              className="min-h-[120px] bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50 resize-none text-lg"
              dir={translationDirection === 'ar-en' ? 'rtl' : 'ltr'}
            />
            
            <div className="flex justify-center">
              <Button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {currentLang.translating}
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    {currentLang.translate}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Translation Result */}
              <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-indigo-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {currentLang.translation}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-white/10 rounded-lg">
                    <p className="text-white text-lg leading-relaxed" dir={translationDirection === 'ar-en' ? 'ltr' : 'rtl'}>
                      {result.translation}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {currentLang.playAudio}
                  </Button>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Explanation */}
                <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="text-indigo-300 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      {currentLang.whyThisTranslation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed">
                      {result.explanation}
                    </p>
                  </CardContent>
                </Card>

                {/* Grammar Explanation */}
                <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="text-indigo-300 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {currentLang.grammarExplanation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed">
                      {result.grammarExplanation}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Words */}
              {result.keyWords && result.keyWords.length > 0 && (
                <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="text-indigo-300 flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      {currentLang.keyWords}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.keyWords.map((word, index) => (
                        <div key={index} className="p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-indigo-300">{word.word}</span>
                            <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-white/80 text-sm mb-1">{word.meaning}</p>
                          <p className="text-white/60 text-xs">[{word.pronunciation}]</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="text-indigo-300 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      {currentLang.suggestions}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-300 mt-1">•</span>
                          <span className="text-white/80">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartTranslator;
