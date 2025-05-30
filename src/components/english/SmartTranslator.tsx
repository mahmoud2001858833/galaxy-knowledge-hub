
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, Loader2, Copy, Volume2, Play, Pause, Upload, 
  Camera, FileText, Sparkles, Download, Image as ImageIcon,
  Mic, MicOff, Languages, BookOpen, Target, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  suggestions: string[];
}

const SmartTranslator: React.FC<SmartTranslatorProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState('translate');
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<'ar-en' | 'en-ar'>('ar-en');
  const [context, setContext] = useState('conversational');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  
  // Image translation states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  
  // Text generation states
  const [textPrompt, setTextPrompt] = useState('');
  const [textType, setTextType] = useState('formal');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(200);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المترجم الذكي المطور",
      subtitle: "ترجمة ذكية وتعليمية مع تحليل متقدم وتقنيات الذكاء الاصطناعي",
      translateTab: "الترجمة التقليدية",
      imageTab: "ترجمة الصور",
      textGenTab: "مولد النصوص",
      direction: "اتجاه الترجمة",
      arabicToEnglish: "عربي إلى إنجليزي",
      englishToArabic: "إنجليزي إلى عربي",
      contextType: "نوع السياق",
      formal: "رسمي",
      academic: "أكاديمي",
      conversational: "محادثة",
      literary: "أدبي",
      voiceSelect: "الصوت",
      enterText: "أدخل النص للترجمة...",
      translate: "ترجم",
      translating: "جاري الترجمة...",
      translation: "الترجمة",
      explanation: "التفسير",
      keyWords: "الكلمات المفتاحية",
      suggestions: "اقتراحات",
      copy: "نسخ",
      listen: "استمع",
      uploadImage: "رفع صورة",
      capturePhoto: "التقاط صورة",
      extractText: "استخراج النص",
      extracting: "جاري الاستخراج...",
      imageTranslation: "ترجمة الصور",
      uploadOrCapture: "ارفع صورة أو التقط صورة جديدة",
      textGeneration: "مولد النصوص الإنجليزية",
      topicPrompt: "موضوع النص",
      enterTopic: "أدخل موضوع النص المطلوب...",
      textTypeLabel: "نوع النص",
      formalText: "رسمي",
      academicText: "أكاديمي",
      businessText: "تجاري",
      creativeText: "إبداعي",
      wordCountLabel: "عدد الكلمات",
      generateText: "إنشاء النص",
      generating: "جاري الإنشاء...",
      generatedResult: "النص المُنشأ",
      downloadText: "تحميل النص",
      stopCapture: "إيقاف التصوير",
      startCapture: "بدء التصوير"
    },
    en: {
      title: "Advanced Smart Translator",
      subtitle: "Intelligent educational translation with advanced analysis and AI features",
      translateTab: "Text Translation",
      imageTab: "Image Translation",
      textGenTab: "Text Generator",
      direction: "Translation Direction",
      arabicToEnglish: "Arabic to English",
      englishToArabic: "English to Arabic",
      contextType: "Context Type",
      formal: "Formal",
      academic: "Academic",
      conversational: "Conversational",
      literary: "Literary",
      voiceSelect: "Voice",
      enterText: "Enter text to translate...",
      translate: "Translate",
      translating: "Translating...",
      translation: "Translation",
      explanation: "Explanation",
      keyWords: "Key Words",
      suggestions: "Suggestions",
      copy: "Copy",
      listen: "Listen",
      uploadImage: "Upload Image",
      capturePhoto: "Capture Photo",
      extractText: "Extract Text",
      extracting: "Extracting...",
      imageTranslation: "Image Translation",
      uploadOrCapture: "Upload an image or capture a new photo",
      textGeneration: "English Text Generator",
      topicPrompt: "Text Topic",
      enterTopic: "Enter the topic for the text...",
      textTypeLabel: "Text Type",
      formalText: "Formal",
      academicText: "Academic",
      businessText: "Business",
      creativeText: "Creative",
      wordCountLabel: "Word Count",
      generateText: "Generate Text",
      generating: "Generating...",
      generatedResult: "Generated Text",
      downloadText: "Download Text",
      stopCapture: "Stop Capture",
      startCapture: "Start Capture"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  // Initialize voices
  useEffect(() => {
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
    if (!inputText.trim()) return;

    setIsLoading(true);
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
      setResult(data);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: language === 'ar' ? "خطأ في الترجمة" : "Translation Error",
        description: language === 'ar' ? "حدث خطأ أثناء الترجمة" : "An error occurred during translation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      title: language === 'ar' ? "تم النسخ" : "Copied",
      description: language === 'ar' ? "تم نسخ النص إلى الحافظة" : "Text copied to clipboard",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ في الكاميرا" : "Camera Error",
        description: language === 'ar' ? "لا يمكن الوصول للكاميرا" : "Cannot access camera",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL());
          stopCamera();
        }
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const extractTextFromImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      // Simulate OCR - in real implementation, you'd use a service like Google Vision API
      // For demo purposes, we'll simulate extracted text
      const simulatedText = "Sample extracted text from image. This would be the actual text extracted from the uploaded image using OCR technology.";
      setExtractedText(simulatedText);
      setInputText(simulatedText);
      setActiveTab('translate');
      
      toast({
        title: language === 'ar' ? "تم استخراج النص" : "Text Extracted",
        description: language === 'ar' ? "تم استخراج النص من الصورة بنجاح" : "Text extracted from image successfully",
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ في الاستخراج" : "Extraction Error",
        description: language === 'ar' ? "حدث خطأ أثناء استخراج النص" : "An error occurred during text extraction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateText = async () => {
    if (!textPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('english-ai-assistant', {
        body: {
          message: `Generate a ${textType} English text about "${textPrompt}" with approximately ${wordCount} words. Make it professional and well-structured.`,
          language: 'en'
        }
      });

      if (error) throw error;
      setGeneratedText(data.reply);
    } catch (error) {
      console.error('Text generation error:', error);
      toast({
        title: language === 'ar' ? "خطأ في الإنشاء" : "Generation Error",
        description: language === 'ar' ? "حدث خطأ أثناء إنشاء النص" : "An error occurred during text generation",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `generated-text-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <p className="text-white/70 text-lg max-w-3xl mx-auto">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="translate" className="text-white data-[state=active]:bg-indigo-600">
              <Languages className="w-4 h-4 mr-2" />
              {currentLang.translateTab}
            </TabsTrigger>
            <TabsTrigger value="image" className="text-white data-[state=active]:bg-indigo-600">
              <ImageIcon className="w-4 h-4 mr-2" />
              {currentLang.imageTab}
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-white data-[state=active]:bg-indigo-600">
              <FileText className="w-4 h-4 mr-2" />
              {currentLang.textGenTab}
            </TabsTrigger>
          </TabsList>

          {/* Text Translation Tab */}
          <TabsContent value="translate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-indigo-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {language === 'ar' ? 'النص الأصلي' : 'Original Text'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">{currentLang.direction}</label>
                      <Select value={direction} onValueChange={(value: any) => setDirection(value)}>
                        <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-indigo-950 border-indigo-500/30">
                          <SelectItem value="ar-en" className="text-white hover:bg-indigo-800">
                            {currentLang.arabicToEnglish}
                          </SelectItem>
                          <SelectItem value="en-ar" className="text-white hover:bg-indigo-800">
                            {currentLang.englishToArabic}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">{currentLang.contextType}</label>
                      <Select value={context} onValueChange={setContext}>
                        <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-indigo-950 border-indigo-500/30">
                          <SelectItem value="formal" className="text-white hover:bg-indigo-800">
                            {currentLang.formal}
                          </SelectItem>
                          <SelectItem value="academic" className="text-white hover:bg-indigo-800">
                            {currentLang.academic}
                          </SelectItem>
                          <SelectItem value="conversational" className="text-white hover:bg-indigo-800">
                            {currentLang.conversational}
                          </SelectItem>
                          <SelectItem value="literary" className="text-white hover:bg-indigo-800">
                            {currentLang.literary}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">{currentLang.voiceSelect}</label>
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

                  {/* Text Input */}
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={currentLang.enterText}
                    className="min-h-32 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
                  />

                  <Button
                    onClick={translateText}
                    disabled={!inputText.trim() || isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentLang.translating}
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        {currentLang.translate}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-indigo-300 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {currentLang.translation}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Translation */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-indigo-300">{currentLang.translation}</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => playAudio(result.translation)}
                              size="sm"
                              variant="outline"
                              className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              onClick={() => copyToClipboard(result.translation)}
                              size="sm"
                              variant="outline"
                              className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                          <p className="text-white/90 leading-relaxed">{result.translation}</p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.explanation}</h3>
                        <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                          <p className="text-white/80 leading-relaxed">{result.explanation}</p>
                        </div>
                      </div>

                      {/* Key Words */}
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.keyWords}</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {result.keyWords.map((word, index) => (
                            <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-indigo-300">{word.word}</span>
                                <span className="text-xs text-white/60">{word.pronunciation}</span>
                              </div>
                              <p className="text-white/80 text-sm">{word.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggestions */}
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.suggestions}</h3>
                        <div className="space-y-2">
                          {result.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-green-200 text-sm">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Languages className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">
                        {language === 'ar' ? 'أدخل نصاً للترجمة' : 'Enter text to translate'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Image Translation Tab */}
          <TabsContent value="image" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-indigo-300 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {currentLang.imageTranslation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-white/70 mb-4">{currentLang.uploadOrCapture}</p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {currentLang.uploadImage}
                    </Button>
                    
                    <Button
                      onClick={isCapturing ? stopCamera : startCamera}
                      className={`${isCapturing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCapturing ? currentLang.stopCapture : currentLang.startCapture}
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Camera View */}
                {isCapturing && (
                  <div className="text-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="max-w-full h-64 rounded-lg border border-white/20"
                    />
                    <div className="mt-4">
                      <Button
                        onClick={capturePhoto}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {currentLang.capturePhoto}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-64 object-cover rounded-lg border border-white/20 mx-auto"
                    />
                    <div className="mt-4">
                      <Button
                        onClick={extractTextFromImage}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {currentLang.extracting}
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            {currentLang.extractText}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Generation Tab */}
          <TabsContent value="generate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-indigo-300 flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    {currentLang.textGeneration}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">{currentLang.topicPrompt}</label>
                    <Input
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder={currentLang.enterTopic}
                      className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">{currentLang.textTypeLabel}</label>
                      <Select value={textType} onValueChange={setTextType}>
                        <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-indigo-950 border-indigo-500/30">
                          <SelectItem value="formal" className="text-white hover:bg-indigo-800">
                            {currentLang.formalText}
                          </SelectItem>
                          <SelectItem value="academic" className="text-white hover:bg-indigo-800">
                            {currentLang.academicText}
                          </SelectItem>
                          <SelectItem value="business" className="text-white hover:bg-indigo-800">
                            {currentLang.businessText}
                          </SelectItem>
                          <SelectItem value="creative" className="text-white hover:bg-indigo-800">
                            {currentLang.creativeText}
                          </SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateText}
                    disabled={!textPrompt.trim() || isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentLang.generating}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
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
                      <div className="flex gap-2">
                        <Button
                          onClick={() => playAudio(generatedText)}
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={downloadText}
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedText ? (
                    <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{generatedText}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Sparkles className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">
                        {language === 'ar' ? 'أدخل موضوعاً لإنشاء النص' : 'Enter a topic to generate text'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartTranslator;
