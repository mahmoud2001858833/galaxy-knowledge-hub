import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileQuestion, BookOpen, FileText, ClipboardList, X, LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TawjihiFilesGrid from './TawjihiFilesGrid';
import { Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import pako from 'pako';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  iconColor: string;
}

interface TawjihiSubjectLayoutProps {
  subject: string;
  grade: string;
  categories: Category[];
  additionalContent?: React.ReactNode;
}

const TawjihiSubjectLayout: React.FC<TawjihiSubjectLayoutProps> = ({
  subject,
  grade,
  categories,
  additionalContent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const compressFile = async (file: File): Promise<File> => {
    const maxSize = 50 * 1024 * 1024;
    
    if (file.size <= maxSize) {
      return file;
    }

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
    if (!fileName.trim() || !description.trim() || !teacherName.trim() || !file || !uploadCategory) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول واختيار ملف وقسم',
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
      const filePath = `${subject}/${grade}/${uploadCategory}/${Date.now()}.${fileExt}`;

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
          category: uploadCategory,
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
      setUploadCategory('');
      setIsUploadOpen(false);
      
      // Trigger refresh for the selected category
      if (selectedCategory) {
        setSelectedCategory(null);
        setTimeout(() => setSelectedCategory(uploadCategory), 100);
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
    <div className="space-y-8">
      {/* Upload Button - Fixed in corner */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all duration-300"
            >
              <Upload className="h-8 w-8" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg bg-gradient-to-br from-blue-950/95 to-purple-950/95 border-blue-500/30 text-white" dir="rtl">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="h-6 w-6 text-orange-400" />
                رفع ملف جديد
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  اختر القسم
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={uploadCategory === cat.id ? "default" : "outline"}
                      onClick={() => setUploadCategory(cat.id)}
                      className={`${
                        uploadCategory === cat.id 
                          ? 'bg-gradient-to-r from-orange-600 to-yellow-600' 
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <cat.icon className="h-4 w-4 ml-2" />
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  اسم الملف
                </label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="أدخل اسم الملف"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
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
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  disabled={uploading}
                  rows={4}
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
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
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
                  className="bg-white/5 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
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
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-5 w-5" />
                    رفع الملف
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Categories Grid */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`bg-gradient-to-br ${cat.gradient} border-2 ${cat.borderColor} cursor-pointer hover:shadow-xl transition-all duration-300 h-full`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <cat.icon className={`w-16 h-16 mx-auto mb-4 ${cat.iconColor}`} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">{cat.label}</h3>
                    <p className="text-white/70 text-sm">انقر للعرض</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {additionalContent && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categories.length * 0.1 }}
                className="md:col-span-2 lg:col-span-4"
              >
                {additionalContent}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="category-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-6">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ← العودة للأقسام
              </Button>
            </div>
            <TawjihiFilesGrid
              subject={subject}
              category={selectedCategory}
              grade={grade}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TawjihiSubjectLayout;
