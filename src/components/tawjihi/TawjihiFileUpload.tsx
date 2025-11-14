import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2 } from 'lucide-react';

interface TawjihiFileUploadProps {
  subject: string;
  category: string;
  grade: string;
}

const TawjihiFileUpload: React.FC<TawjihiFileUploadProps> = ({ subject, category, grade }) => {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!fileName.trim() || !description.trim() || !file) {
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
          user_id: user.id
        });

      if (dbError) throw dbError;

      toast({
        title: 'تم الرفع بنجاح',
        description: 'تم رفع الملف بنجاح'
      });

      setFileName('');
      setDescription('');
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
            اختر الملف
          </label>
          <Input
            type="file"
            onChange={handleFileChange}
            className="bg-white/5 border-white/20 text-white"
            disabled={uploading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
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
