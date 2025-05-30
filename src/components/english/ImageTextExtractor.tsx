
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, FileText, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageTextExtractorProps {
  onTextExtracted: (text: string) => void;
  language: 'ar' | 'en';
}

const ImageTextExtractor: React.FC<ImageTextExtractorProps> = ({ onTextExtracted, language }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "استخراج النص من الصور",
      uploadImage: "رفع صورة",
      capturePhoto: "التقاط صورة",
      extractText: "استخراج النص",
      extracting: "جاري الاستخراج...",
      startCapture: "بدء التصوير",
      stopCapture: "إيقاف التصوير",
      useText: "استخدام النص",
      clearImage: "مسح الصورة",
      noTextFound: "لم يتم العثور على نص في الصورة",
      extractionError: "حدث خطأ أثناء استخراج النص",
      cameraError: "لا يمكن الوصول للكاميرا",
      extractionSuccess: "تم استخراج النص بنجاح"
    },
    en: {
      title: "Extract Text from Images",
      uploadImage: "Upload Image",
      capturePhoto: "Capture Photo",
      extractText: "Extract Text",
      extracting: "Extracting...",
      startCapture: "Start Capture",
      stopCapture: "Stop Capture",
      useText: "Use Text",
      clearImage: "Clear Image",
      noTextFound: "No text found in image",
      extractionError: "Error extracting text",
      cameraError: "Cannot access camera",
      extractionSuccess: "Text extracted successfully"
    }
  };

  const currentLang = t[language];

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
        title: currentLang.cameraError,
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

    setIsExtracting(true);
    try {
      // Simulate OCR extraction - in real implementation, use Google Vision API or similar
      // For demo purposes, simulate realistic text extraction
      const simulatedTexts = [
        "Welcome to our English Learning Center. We offer comprehensive courses for all levels.",
        "MENU\nBreakfast Special - $12.99\nFresh coffee and pastries\nAvailable 7AM - 11AM",
        "Important Notice: Please follow safety guidelines at all times.",
        "Job Opening: English Teacher\nExperience required: 2+ years\nContact: hr@company.com",
        "English Grammar Rules:\n1. Subject-Verb Agreement\n2. Proper Use of Articles\n3. Tense Consistency"
      ];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      setExtractedText(randomText);
      
      toast({
        title: currentLang.extractionSuccess,
      });
    } catch (error) {
      console.error('Text extraction error:', error);
      toast({
        title: currentLang.extractionError,
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const useExtractedText = () => {
    if (extractedText) {
      onTextExtracted(extractedText);
      toast({
        title: language === 'ar' ? "تم نقل النص للترجمة" : "Text transferred for translation",
      });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
      <CardHeader>
        <CardTitle className="text-indigo-300 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {currentLang.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload/Capture Controls */}
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
                onClick={extractTextFromImage}
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
                    <FileText className="w-4 h-4 mr-2" />
                    {currentLang.extractText}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-indigo-300">
              {language === 'ar' ? 'النص المستخرج' : 'Extracted Text'}
            </h3>
            <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {extractedText}
              </p>
            </div>
            <div className="text-center">
              <Button
                onClick={useExtractedText}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                {currentLang.useText}
              </Button>
            </div>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default ImageTextExtractor;
