
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Languages, ArrowLeftRight, Copy, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmartTranslatorCoreProps {
  language: 'ar' | 'en';
}

const SmartTranslatorCore: React.FC<SmartTranslatorCoreProps> = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [direction, setDirection] = useState<'ar-en' | 'en-ar'>('ar-en');
  const [context, setContext] = useState('conversational');
  const [isTranslating, setIsTranslating] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const { toast } = useToast();

  const t = {
    ar: {
      title: "الترجمة الذكية",
      subtitle: "ترجمة ذكية مع تحليل السياق والنحو",
      inputPlaceholder: "أدخل النص للترجمة...",
      translateButton: "ترجمة",
      translating: "جاري الترجمة...",
      direction: "اتجاه الترجمة",
      context: "السياق",
      result: "نتيجة الترجمة",
      copyText: "نسخ النص",
      listenText: "استمع للنص",
      voiceLabel: "اختر صوت للقراءة",
      directions: {
        'ar-en': "من العربية إلى الإنجليزية",
        'en-ar': "من الإنجليزية إلى العربية"
      },
      contexts: {
        formal: "رسمي",
        academic: "أكاديمي",
        conversational: "محادثة",
        literary: "أدبي"
      }
    },
    en: {
      title: "Smart Translation",
      subtitle: "Intelligent translation with context and grammar analysis",
      inputPlaceholder: "Enter text to translate...",
      translateButton: "Translate",
      translating: "Translating...",
      direction: "Translation Direction",
      context: "Context",
      result: "Translation Result",
      copyText: "Copy Text",
      listenText: "Listen to Text",
      voiceLabel: "Choose voice for reading",
      directions: {
        'ar-en': "Arabic to English",
        'en-ar': "English to Arabic"
      },
      contexts: {
        formal: "Formal",
        academic: "Academic",
        conversational: "Conversational",
        literary: "Literary"
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

  const translateText = async () => {
    if (!inputText.trim()) {
      toast({
        title: language === 'ar' ? "يرجى إدخال نص للترجمة" : "Please enter text to translate",
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

      setTranslatedText(data.translation);
      
      toast({
        title: language === 'ar' ? "تمت الترجمة بنجاح" : "Translation completed successfully",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: language === 'ar' ? "حدث خطأ أثناء الترجمة" : "Translation error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
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

  const swapDirection = () => {
    setDirection(prev => prev === 'ar-en' ? 'en-ar' : 'ar-en');
    setInputText(translatedText);
    setTranslatedText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">
          {currentLang.title}
        </h3>
        <p className="text-white/70">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {currentLang.direction}
          </label>
          <div className="flex items-center gap-2">
            <Select value={direction} onValueChange={(value: 'ar-en' | 'en-ar') => setDirection(value)}>
              <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-indigo-950 border-indigo-500/30">
                {Object.entries(currentLang.directions).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-indigo-800">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={swapDirection}
              size="sm"
              variant="outline"
              className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {currentLang.context}
          </label>
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

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {currentLang.voiceLabel}
          </label>
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

      {/* Input Area */}
      <div className="space-y-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentLang.inputPlaceholder}
          className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50 min-h-[120px]"
        />
        
        <div className="text-center">
          <Button
            onClick={translateText}
            disabled={!inputText.trim() || isTranslating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {currentLang.translating}
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                {currentLang.translateButton}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Translation Result */}
      {translatedText && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-green-300">
                  {currentLang.result}
                </h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => playAudio(translatedText)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-green-500/30 text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(translatedText)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-green-500/30 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SmartTranslatorCore;
