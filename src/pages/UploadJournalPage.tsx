
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Loader2, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون العنوان 3 أحرف على الأقل" }),
  description: z.string().optional(),
  author: z.string().min(3, { message: "يجب أن يكون اسم المؤلف 3 أحرف على الأقل" }),
  subject: z.enum(['physics', 'chemistry', 'biology', 'mathematics']),
  coverImage: z.instanceof(File).refine(
    (file) => file.size < 10 * 1024 * 1024, // 10MB للصور
    { message: "حجم صورة الغلاف يجب أن يكون أقل من 10 ميجابايت" }
  ),
  pdfFile: z.instanceof(File).refine(
    (file) => file.size < 2 * 1024 * 1024 * 1024, // 2GB للملفات PDF
    { message: "حجم ملف PDF يجب أن يكون أقل من 2 جيجابايت" }
  ).refine(
    (file) => file.type === 'application/pdf',
    { message: "يجب أن يكون الملف بصيغة PDF" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const UploadJournalPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'scientific_journals');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('scientific_journals', {
            public: true,
            fileSizeLimit: 2147483648, // 2GB في بايت
          });
        }
      } catch (error) {
        console.error("خطأ في التحقق من مجلد التخزين:", error);
      }
    };
    
    checkBucket();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      subject: "physics",
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجابايت`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
    } else {
      return `${(bytes / 1024).toFixed(2)} كيلوبايت`;
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "حجم الصورة كبير جداً",
        description: "يجب أن يكون حجم صورة الغلاف أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    form.setValue("coverImage", file);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
      toast({
        title: "حجم الملف كبير جداً",
        description: "يجب أن يكون حجم ملف PDF أقل من 2 جيجابايت",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف PDF فقط",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPdfName(file.name);
    form.setValue("pdfFile", file);
    
    toast({
      title: "تم اختيار الملف بنجاح",
      description: `تم اختيار ملف بحجم ${formatFileSize(file.size)}`,
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    
    try {
      // الحصول على بيانات المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ في تحميل المجلة",
          description: "يجب تسجيل الدخول أولاً لرفع المجلات",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // رفع صورة الغلاف إلى التخزين
      const coverExt = data.coverImage.name.split('.').pop();
      const coverFileName = `cover_${uuidv4()}.${coverExt}`;
      const coverFilePath = `${data.subject}/${coverFileName}`;

      const { error: coverUploadError } = await supabase.storage
        .from('scientific_journals')
        .upload(coverFilePath, data.coverImage);

      if (coverUploadError) {
        throw coverUploadError;
      }

      // رفع ملف PDF إلى التخزين
      const pdfFileName = `pdf_${uuidv4()}.pdf`;
      const pdfFilePath = `${data.subject}/${pdfFileName}`;

      const { error: pdfUploadError } = await supabase.storage
        .from('scientific_journals')
        .upload(pdfFilePath, data.pdfFile);

      if (pdfUploadError) {
        throw pdfUploadError;
      }

      // الحصول على الروابط العامة
      const { data: coverPublicUrlData } = supabase.storage
        .from('scientific_journals')
        .getPublicUrl(coverFilePath);

      const { data: pdfPublicUrlData } = supabase.storage
        .from('scientific_journals')
        .getPublicUrl(pdfFilePath);

      // تخزين البيانات الوصفية في قاعدة البيانات
      const { error: dbError } = await supabase
        .from('scientific_journals')
        .insert({
          title: data.title,
          description: data.description || null,
          subject: data.subject,
          author: data.author,
          cover_image_url: coverPublicUrlData.publicUrl,
          pdf_url: pdfPublicUrlData.publicUrl,
          created_by: user.id,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "تم رفع المجلة بنجاح",
        description: `تمت إضافة المجلة (${formatFileSize(data.pdfFile.size)}) إلى المكتبة العلمية`,
      });

      // إعادة تعيين النموذج وإغلاق الدرج
      form.reset();
      setCoverPreviewUrl(null);
      setSelectedPdfName(null);
      navigate('/scientific-journal');
    } catch (error: any) {
      console.error('Error uploading journal:', error);
      toast({
        title: "خطأ في تحميل المجلة",
        description: error.message || "حدث خطأ أثناء رفع المجلة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center"
              onClick={() => navigate('/scientific-journal')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المجلة العلمية
            </Button>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500">
              رفع مجلة علمية جديدة
            </h1>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <div className="mb-4 text-center">
              <p className="text-white/80 text-sm">
                الحد الأقصى لحجم ملف PDF: <span className="text-green-400 font-bold">2 جيجابايت</span>
              </p>
              <p className="text-white/60 text-xs mt-1">
                الحد الأقصى لحجم صورة الغلاف: 10 ميجابايت
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المجلة</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنواناً للمجلة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف المجلة (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل وصفاً للمجلة"
                          className="min-h-[80px]" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مؤلف المجلة</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم مؤلف المجلة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القسم</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="physics">الفيزياء</SelectItem>
                          <SelectItem value="chemistry">الكيمياء</SelectItem>
                          <SelectItem value="biology">الأحياء</SelectItem>
                          <SelectItem value="mathematics">الرياضيات</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>صورة الغلاف</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            {...fieldProps}
                          />
                          {coverPreviewUrl && (
                            <div className="mt-2 border rounded-md p-2">
                              <img
                                src={coverPreviewUrl}
                                alt="Preview"
                                className="max-h-[200px] mx-auto object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>ملف المجلة (PDF - حتى 2 جيجابايت)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfFileChange}
                            {...fieldProps}
                          />
                          {selectedPdfName && (
                            <div className="mt-2 border rounded-md p-3 flex items-center justify-between bg-green-500/10 border-green-500/30">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-300 truncate">{selectedPdfName}</span>
                                <span className="text-xs text-green-400">
                                  ✓ مقبول - حجم الملف ضمن الحد المسموح (2 جيجابايت)
                                </span>
                              </div>
                              <FileText className="h-5 w-5 text-purple-400" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  className="w-full bg-purple-500 hover:bg-purple-600 mt-6"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جارٍ الرفع... (قد يستغرق وقتاً للملفات الكبيرة)
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      رفع المجلة (حتى 2 جيجابايت)
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadJournalPage;
