
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, FileText, Loader2, Image as ImageIcon, X, Languages, Volume2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageTextExtractorAdvancedProps {
  language: 'ar' | 'en';
}

const ImageTextExtractorAdvanced: React.FC<ImageTextExtractorAdvancedProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [arabicTranslation, setArabicTranslation] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "ترجمة النص من الصور",
      subtitle: "ارفع صورة أو التقطها لاستخراج النص وترجمته",
      uploadImage: "رفع صورة",
      capturePhoto: "التقاط صورة",
      extractTranslate: "استخراج وترجمة النص",
      extracting: "جاري الاستخراج والترجمة...",
      startCapture: "بدء التصوير",
      stopCapture: "إيقاف التصوير",
      clearImage: "مسح الصورة",
      extractionSuccess: "تم استخراج وترجمة النص بنجاح",
      englishText: "النص الإنجليزي المستخرج",
      arabicTranslation: "الترجمة العربية",
      voiceLabel: "اختر صوت للقراءة",
      listenText: "استمع للنص",
      copyText: "نسخ النص"
    },
    en: {
      title: "Extract and Translate Text from Images",
      subtitle: "Upload or capture an image to extract and translate text",
      uploadImage: "Upload Image",
      capturePhoto: "Capture Photo", 
      extractTranslate: "Extract & Translate Text",
      extracting: "Extracting and translating...",
      startCapture: "Start Capture",
      stopCapture: "Stop Capture",
      clearImage: "Clear Image",
      extractionSuccess: "Text extracted and translated successfully",
      englishText: "Extracted English Text",
      arabicTranslation: "Arabic Translation",
      voiceLabel: "Choose voice for reading",
      listenText: "Listen to Text",
      copyText: "Copy Text"
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedText('');
      setArabicTranslation('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: language === 'ar' ? "لا يمكن الوصول للكاميرا" : "Cannot access camera",
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
          setExtractedText('');
          setArabicTranslation('');
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

  const extractAndTranslateText = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke('real-ocr-translator', {
          body: { imageData }
        });

        if (error) throw error;

        setExtractedText(data.extractedText);
        setArabicTranslation(data.arabicTranslation);
        
        toast({
          title: currentLang.extractionSuccess,
        });
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Text extraction error:', error);
      toast({
        title: language === 'ar' ? "حدث خطأ أثناء استخراج النص" : "Error extracting text",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
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

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText('');
    setArabicTranslation('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 mb-2 flex items-center justify-center gap-3">
          <ImageIcon className="w-7 h-7" />
          {currentLang.title}
        </h2>
        <p className="text-white/70">
          {currentLang.subtitle}
        </p>
      </div>

      <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
        <CardContent className="space-y-6 p-6">
          {/* Upload/Capture Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
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

            {(imagePreview || isCapturing) && (
              <Button
                onClick={clearImage}
                variant="outline"
                className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 mr-2" />
                {currentLang.clearImage}
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Camera View */}
          {isCapturing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="max-w-full h-64 rounded-lg border border-white/20 mx-auto"
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
            </motion.div>
          )}

          {/* Image Preview */}
          {imagePreview && !isCapturing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-64 object-cover rounded-lg border border-white/20 mx-auto"
              />
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={extractAndTranslateText}
                  disabled={isExtracting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {currentLang.extracting}
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" />
                      {currentLang.extractTranslate}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {extractedText && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* English Text */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {currentLang.englishText}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => playAudio(extractedText)}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-purple-500/30 text-white hover:bg-white/20"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(extractedText)}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-purple-500/30 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {extractedText}
                  </p>
                </div>
                
                {/* Voice Selection */}
                {voices.length > 0 && (
                  <div className="flex gap-4 items-center">
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
              </div>

              {/* Arabic Translation */}
              {arabicTranslation && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      {currentLang.arabicTranslation}
                    </h3>
                    <Button
                      onClick={() => copyToClipboard(arabicTranslation)}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-green-500/30 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-right" dir="rtl">
                      {arabicTranslation}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageTextExtractorAdvanced;
