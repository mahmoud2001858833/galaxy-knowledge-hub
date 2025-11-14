import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import pako from 'pako';

interface TawjihiFileUploadProps {
  subject: string;
  category: string;
  grade: string;
}

const TawjihiFileUpload: React.FC<TawjihiFileUploadProps> = ({ subject, category, grade }) => {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const compressFile = async (file: File): Promise<File> => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size <= maxSize) {
      return file;
    }

    // For images
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 45,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        fileType: file.type
      };
      
      try {
        const compressedFile = await imageCompression(file, options);
        toast({
          title: 'تم ضغط الملف',
          description: `تم تقليل حجم الملف من ${(file.size / 1024 / 1024).toFixed(2)} MB إلى ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
        });
        return compressedFile;
      } catch (error) {
        console.error('Image compression error:', error);
        return file;
      }
    }

    // For PDF and other documents - try basic compression
    if (file.type === 'application/pdf' || file.type.includes('document')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const compressed = pako.deflate(uint8Array, { level: 9 });
        
        const compressedBlob = new Blob([compressed], { type: file.type });
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        
        if (compressedFile.size < file.size) {
          toast({
            title: 'تم ضغط الملف',
            description: `تم تقليل حجم الملف من ${(file.size / 1024 / 1024).toFixed(2)} MB إلى ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
          });
          return compressedFile;
        }
      } catch (error) {
        console.error('File compression error:', error);
      }
    }

    return file;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-compress if over 50MB
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'جاري ضغط الملف',
          description: 'الملف أكبر من 50 MB، جاري ضغطه...'
        });
        const compressed = await compressFile(selectedFile);
        setFile(compressed);
      }
    }
  };

  const handleUpload = async () => {
    if (!fileName.trim() || !description.trim() || !teacherName.trim() || !file) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول واختيار ملف',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${subject}/${grade}/${category}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tawjihi-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tawjihi-files')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('tawjihi_files')
        .insert({
          file_name: fileName,
          description,
          file_url: publicUrl,
          subject,
          category,
          grade,
          teacher_name: teacherName,
          user_id: user.id
        });

      if (dbError) throw dbError;

      toast({
        title: 'تم الرفع بنجاح',
        description: 'تم رفع الملف بنجاح'
      });

      setFileName('');
      setDescription('');
      setTeacherName('');
      setFile(null);
      
      // Refresh the parent component if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tawjihi-file-uploaded'));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'خطأ في الرفع',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          رفع ملف جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            اسم الملف
          </label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="أدخل اسم الملف"
            className="bg-white/5 border-white/20 text-white"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            وصف الملف
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أدخل وصفاً للملف"
            className="bg-white/5 border-white/20 text-white"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            اسم الأستاذ/ة
          </label>
          <Input
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="أدخل اسم الأستاذ أو الأستاذة"
            className="bg-white/5 border-white/20 text-white"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            اختر الملف {file && file.size > 50 * 1024 * 1024 && '(سيتم ضغطه تلقائياً)'}
          </label>
          <Input
            type="file"
            onChange={handleFileChange}
            className="bg-white/5 border-white/20 text-white"
            disabled={uploading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
          {file && (
            <p className="text-white/60 text-sm mt-2">
              حجم الملف: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {uploading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="ml-2 h-4 w-4" />
              رفع الملف
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TawjihiFileUpload;
