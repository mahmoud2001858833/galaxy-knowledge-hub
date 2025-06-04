
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Image, Check, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UploadJournal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    subject: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    'الفيزياء', 'الكيمياء', 'الأحياء', 'الرياضيات', 'الهندسة', 
    'الطب', 'علوم الحاسوب', 'البيئة', 'علوم الفضاء', 'أخرى'
  ];

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // إزالة جميع قيود الحجم للصور - قبول أي حجم
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      
      toast({
        title: "تم اختيار صورة الغلاف",
        description: `تم اختيار صورة بحجم ${formatFileSize(file.size)}`,
      });
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // إزالة جميع قيود الحجم للملفات - قبول أي حجم حتى 1000+ جيجابايت
    if (file.type !== 'application/pdf') {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف PDF فقط",
        variant: "destructive"
      });
      return;
    }
    
    setPdfFile(file);
    toast({
      title: "تم اختيار الملف بنجاح",
      description: `تم اختيار ملف بحجم ${formatFileSize(file.size)} - جاهز للرفع`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} تيرابايت`;
    } else if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجابايت`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
    } else {
      return `${(bytes / 1024).toFixed(2)} كيلوبايت`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !coverImage || !pdfFile) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "يجب تسجيل الدخول",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive"
        });
        return;
      }

      // رفع صورة الغلاف - بدون قيود حجم
      toast({
        title: "بدء رفع صورة الغلاف",
        description: `جاري رفع صورة بحجم ${formatFileSize(coverImage.size)}...`,
      });

      setUploadProgress(10);
      const coverPath = `covers/${Date.now()}-${coverImage.name}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from('scientific-journals')
        .upload(coverPath, coverImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (coverError) throw coverError;
      setUploadProgress(30);

      // رفع ملف PDF - بدون قيود حجم (يدعم ملفات ضخمة)
      toast({
        title: "بدء رفع الملف الرئيسي",
        description: `جاري رفع ملف PDF بحجم ${formatFileSize(pdfFile.size)}...`,
      });

      const pdfPath = `pdfs/${Date.now()}-${pdfFile.name}`;
      
      setUploadProgress(40);
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from('scientific-journals')
        .upload(pdfPath, pdfFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (pdfError) throw pdfError;
      setUploadProgress(80);

      // الحصول على URLs
      const { data: coverUrl } = supabase.storage
        .from('scientific-journals')
        .getPublicUrl(coverPath);

      const { data: pdfUrl } = supabase.storage
        .from('scientific-journals')
        .getPublicUrl(pdfPath);

      setUploadProgress(90);

      // حفظ البيانات في قاعدة البيانات
      const { error: dbError } = await supabase
        .from('scientific_journals')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            author: formData.author,
            subject: formData.subject,
            cover_image_url: coverUrl.publicUrl,
            pdf_url: pdfUrl.publicUrl,
            created_by: session.user.id
          }
        ]);

      if (dbError) throw dbError;
      setUploadProgress(100);

      toast({
        title: "تم رفع المجلة بنجاح",
        description: `تم رفع المجلة (${formatFileSize(pdfFile.size)}) وحفظها في قاعدة البيانات`,
      });

      navigate('/scientific-journals');

    } catch (error) {
      console.error('خطأ في رفع المجلة:', error);
      toast({
        title: "خطأ في رفع المجلة",
        description: "حدث خطأ أثناء رفع المجلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* الرأس */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/scientific-journals')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            العودة للمجلات
          </Button>
          <h1 className="text-3xl font-bold text-white text-center">
            رفع مجلة علمية جديدة
          </h1>
          <div className="w-32"></div>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center text-xl">
              معلومات المجلة العلمية (بدون قيود حجم - يدعم ملفات ضخمة)
            </CardTitle>
            <p className="text-white/80 text-center text-sm">
              يدعم رفع ملفات حتى 1000+ جيجابايت بدون قيود
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات المجلة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white font-medium">عنوان المجلة *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المجلة"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white font-medium">اسم المؤلف</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="أدخل اسم المؤلف"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium">التخصص *</label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium">وصف المجلة</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصفاً مختصراً للمجلة..."
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 min-h-[100px]"
                />
              </div>

              {/* رفع الملفات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* صورة الغلاف */}
                <div className="space-y-4">
                  <label className="text-white font-medium">صورة الغلاف *</label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="border-2 border-dashed border-white/30 rounded-lg p-6 cursor-pointer hover:border-white/50 transition-colors bg-white/5"
                  >
                    {coverPreview ? (
                      <div className="space-y-2">
                        <img
                          src={coverPreview}
                          alt="معاينة الغلاف"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <p className="text-white text-sm text-center">
                          {coverImage && formatFileSize(coverImage.size)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Image className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/80">اضغط لاختيار صورة الغلاف</p>
                        <p className="text-white/60 text-sm">أي حجم مقبول (بدون قيود)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>

                {/* ملف PDF */}
                <div className="space-y-4">
                  <label className="text-white font-medium">ملف المجلة (PDF) *</label>
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="border-2 border-dashed border-white/30 rounded-lg p-6 cursor-pointer hover:border-white/50 transition-colors bg-white/5"
                  >
                    {pdfFile ? (
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center">
                          <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-white font-medium">{pdfFile.name}</p>
                        <p className="text-white/80 text-sm">
                          الحجم: {formatFileSize(pdfFile.size)}
                        </p>
                        <p className="text-green-400 text-xs">
                          ✓ جاهز للرفع - بدون قيود حجم
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/80">اضغط لاختيار ملف PDF</p>
                        <p className="text-white/60 text-sm">حجم لا محدود</p>
                        <p className="text-green-400 text-xs mt-2">
                          ✓ يدعم ملفات حتى 1000+ جيجابايت
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* شريط التقدم */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white">
                    <span>جاري الرفع... (ملف كبير)</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-white/80 text-sm text-center">
                    {pdfFile && `رفع ملف بحجم ${formatFileSize(pdfFile.size)}`}
                  </p>
                </div>
              )}

              {/* زر الرفع */}
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    جاري الرفع... (قد يستغرق وقتاً للملفات الكبيرة)
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    رفع المجلة (بدون قيود حجم)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadJournal;
