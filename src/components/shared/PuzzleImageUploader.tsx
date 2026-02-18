
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Wand2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

interface PuzzleImageUploaderProps {
  onImageUrl: (url: string) => void;
  currentImageUrl?: string;
}

const AI_API_KEY = 'AIzaSyC1GNPZumOjXChoHpWf4pqggMvIMobLu4g';

const PuzzleImageUploader: React.FC<PuzzleImageUploaderProps> = ({ onImageUrl, currentImageUrl }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressAndUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Compress image - light compression to maintain quality
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.85,
      };
      const compressed = await imageCompression(file, options);
      console.log(`Original: ${(file.size / 1024).toFixed(0)}KB → Compressed: ${(compressed.size / 1024).toFixed(0)}KB`);

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `puzzles/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('educational_images')
        .upload(fileName, compressed, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('educational_images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setPreview(publicUrl);
      onImageUrl(publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('فشل في رفع الصورة: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }
    compressAndUpload(file);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('يرجى كتابة وصف للصورة المطلوبة');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a clean educational image with NO text, NO Arabic letters, NO words, NO labels, NO watermarks. Only visual content. The image should be: ${aiPrompt}`
              }]
            }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"]
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      // Extract image from response
      const parts = data.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error('لم يتم العثور على صورة في الاستجابة');

      const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
      if (!imagePart) throw new Error('لم يتم توليد صورة');

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      
      // Convert base64 to blob and upload to storage
      const byteChars = atob(base64Data);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const ext = mimeType.split('/')[1] || 'png';
      const fileName = `puzzles/ai_${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('educational_images')
        .upload(fileName, blob, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('educational_images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setPreview(publicUrl);
      onImageUrl(publicUrl);
      toast.success('تم توليد الصورة بنجاح');
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast.error('فشل في توليد الصورة: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block text-white text-lg mb-2 text-right">الصورة (اختياري)</label>
      
      {preview && (
        <div className="relative border border-white/20 rounded-lg p-2 bg-black/30 backdrop-blur-sm">
          <button 
            onClick={clearImage} 
            className="absolute top-1 left-1 bg-red-500/80 hover:bg-red-500 rounded-full p-1 z-10"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <img 
            src={preview} 
            alt="معاينة" 
            className="max-h-48 object-contain mx-auto rounded-md" 
            onError={() => { setPreview(null); onImageUrl(''); }}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="upload" className="text-white data-[state=active]:bg-blue-600/50 gap-1">
            <Upload className="h-4 w-4" />
            رفع من الجهاز
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-white data-[state=active]:bg-purple-600/50 gap-1">
            <Wand2 className="h-4 w-4" />
            توليد بالذكاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white h-20 flex flex-col gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">جاري الرفع والضغط...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">اضغط لاختيار صورة من جهازك</span>
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="ai" className="mt-3 space-y-3">
          <Textarea
            placeholder="صِف الصورة التي تريد توليدها... مثال: رسم توضيحي لخلية حيوانية"
            className="bg-white/10 border-white/20 text-white min-h-20"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            dir="rtl"
          />
          <Button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
            onClick={generateWithAI}
            disabled={isGenerating || !aiPrompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري توليد الصورة...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                توليد الصورة
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PuzzleImageUploader;
